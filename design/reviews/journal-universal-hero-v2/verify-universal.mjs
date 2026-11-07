import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';

const output = new URL('./', import.meta.url);
const target = await (await fetch('http://127.0.0.1:9436/json/new?about:blank', { method: 'PUT' })).json();
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
let id = 0;
const pending = new Map();
socket.addEventListener('message', ({ data }) => {
  const result = JSON.parse(data);
  const request = pending.get(result.id);
  if (!request) return;
  pending.delete(result.id);
  clearTimeout(request.timer);
  result.error ? request.reject(new Error(JSON.stringify(result.error))) : request.resolve(result.result);
});
function cdp(method, params = {}) {
  return new Promise((resolve, reject) => {
    const requestId = ++id;
    const timer = setTimeout(() => { pending.delete(requestId); reject(new Error(method)); }, 20000);
    pending.set(requestId, { resolve, reject, timer });
    socket.send(JSON.stringify({ id: requestId, method, params }));
  });
}
async function evaluate(expression) {
  const response = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (response.exceptionDetails) throw new Error(JSON.stringify(response.exceptionDetails));
  return response.result.value;
}
const phase = process.argv[2];
assert.ok(['before', 'after'].includes(phase));
const slugs = JSON.parse(await readFile(new URL('visual-slugs.json', output), 'utf8'));
const fixture = 'universal-hero-editorial-dev-fixture';
const checks = [];
async function navigate(slug) {
  const path = `/journal/${slug}/`;
  await cdp('Page.navigate', { url: 'http://localhost:4321' + path });
  for (let n = 0; n < 100; n++) {
    if (await evaluate(`location.pathname === '${path}' && document.readyState === 'complete' && !!document.querySelector('.journal-entry')`)) break;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  await evaluate(`(async () => {
    await document.fonts.ready;
    const img = document.querySelector('.journal-entry__hero-image');
    if (img) await img.decode();
    document.activeElement?.blur();
    document.querySelector('astro-dev-toolbar')?.remove();
    scrollTo({top:0,behavior:'instant'});
    await new Promise(resolve => setTimeout(resolve, 100));
  })()`);
}
async function state() {
  return evaluate(`(() => {
    const rect = el => { if (!el) return null; const r=el.getBoundingClientRect(); return { x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom }; };
    const css = el => { if (!el) return null; const s=getComputedStyle(el); return { color:s.color, background:s.backgroundColor, backgroundImage:s.backgroundImage, display:s.display, minHeight:s.minHeight, paddingTop:s.paddingTop, paddingBottom:s.paddingBottom, fontSize:s.fontSize, lineHeight:s.lineHeight }; };
    const article=document.querySelector('.journal-entry'); const header=article.querySelector('header'); const h1=header.querySelector('h1'); const site=document.querySelector('.site-header'); const image=header.querySelector('img');
    return {
      headerClass:header.className, header:rect(header), headerStyle:css(header),
      site:rect(site), sitePosition:getComputedStyle(site).position,
      inner:rect(header.querySelector('.container')), innerStyle:css(header.querySelector('.container')),
      h1:{...rect(h1),...css(h1),text:h1.textContent}, h1Count:document.querySelectorAll('h1').length,
      date:{text:header.querySelector('.journal-entry__date').textContent,...css(header.querySelector('.journal-entry__date'))},
      metadata:header.querySelector('.eyebrow').textContent,
      back:{...rect(header.querySelector('.journal-entry__back')),...css(header.querySelector('.journal-entry__back')),href:header.querySelector('.journal-entry__back').getAttribute('href')},
      body:rect(document.querySelector('.journal-entry__body')), prose:rect(document.querySelector('.journal-entry__prose')),
      image:image?{src:image.getAttribute('src'),...rect(image),...css(image),naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight}:null,
      scrim:header.querySelector('.journal-entry__hero-scrim')?css(header.querySelector('.journal-entry__hero-scrim')):null,
      overflow:document.documentElement.scrollWidth>innerWidth,
      sectionSpacing:parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--section-block-spacing')),
    };
  })()`);
}
try {
  await cdp('Page.enable');
  await cdp('Runtime.enable');
  await cdp('Accessibility.enable');
  const baseline = phase === 'after' ? JSON.parse(await readFile(new URL('visual-before.json', output), 'utf8')) : null;
  for (const width of [390, 768, 1440, 1920]) {
    await cdp('Emulation.setDeviceMetricsOverride', { width,height:900,deviceScaleFactor:1,mobile:width===390 });
    for (const theme of ['light','dark']) {
      await cdp('Emulation.setEmulatedMedia', { features:[{name:'prefers-color-scheme',value:theme}] });
      for (const slug of slugs) {
        await navigate(slug);
        const current = await state();
        assert.equal(current.overflow,false);
        assert.equal(current.h1Count,1);
        if (baseline) assert.deepEqual(current,baseline.find(item=>item.slug===slug&&item.width===width&&item.theme===theme).state,`${slug}/${width}/${theme}: Visual Hero regression`);
        checks.push({slug,width,theme,state:current});
        if (slug==='307-hours-for-one-invoice'&&width===1440&&theme==='dark') {
          const screenshot=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width,height:current.header.height,scale:1}});
          await writeFile(new URL(`visual-${phase}.png`,output),Buffer.from(screenshot.data,'base64'));
        }
      }
      if (phase==='after') {
        assert.equal((await fetch(`http://localhost:4321/journal/${fixture}/`)).status,200);
        await navigate(fixture);
        const editorial=await state();
        assert.equal(editorial.headerClass,'journal-entry__editorial');
        assert.equal(editorial.image,null);
        assert.equal(editorial.scrim,null);
        assert.equal(editorial.headerStyle.background,'rgba(0, 0, 0, 0)');
        assert.equal(editorial.headerStyle.backgroundImage,'none');
        assert.equal(editorial.headerStyle.minHeight,'0px');
        assert.equal(editorial.sitePosition,'relative');
        assert.equal(editorial.h1Count,1);
        assert.equal(editorial.overflow,false);
        assert.ok(editorial.header.y>=editorial.site.bottom);
        assert.ok(Math.abs(editorial.back.y-editorial.site.bottom-editorial.sectionSpacing)<1);
        assert.ok(editorial.header.height<500);
        assert.ok(editorial.body.y>=editorial.header.bottom);
        assert.equal(editorial.h1.text,'A short engineering observation');
        assert.equal(editorial.date.text,'MAY — JUL 2026');
        const {nodes}=await cdp('Accessibility.getFullAXTree');
        assert.equal(nodes.filter(n=>!n.ignored&&n.role?.value==='heading'&&n.name?.value===editorial.h1.text).length,1);
        const full=editorial.header.height;
        const short=await evaluate(`(() => { const title=document.querySelector('h1'); const original=title.textContent; title.textContent='Observation'; const height=title.closest('header').getBoundingClientRect().height; title.textContent=original; return height; })()`);
        assert.ok(short<full);
        editorial.contentDrivenHeight={original:full,short};
        checks.push({slug:fixture,width,theme,state:editorial});
        if (width===1440||width===390) {
          const screenshot=await cdp('Page.captureScreenshot',{format:'png'});
          await writeFile(new URL(`editorial-${width===1440?'desktop':'mobile'}-${theme}.png`,output),Buffer.from(screenshot.data,'base64'));
        }
      }
      console.log(`PASS ${phase}: ${width}/${theme}, five Visual Heroes${phase==='after'?' + Editorial Hero':''}`);
    }
  }
  if (phase==='after') {
    await navigate(fixture);
    let reached=false;
    for (let n=0;n<16;n++) {
      await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
      await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
      if (await evaluate(`document.activeElement.classList.contains('journal-entry__back')`)) {reached=true;break;}
    }
    assert.equal(reached,true);
    assert.equal(await evaluate(`getComputedStyle(document.activeElement).outlineStyle`),'solid');
    await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
    await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
    for (let n=0;n<30;n++) {
      if (await evaluate(`location.pathname==='/journal'||location.pathname==='/journal/'`)) break;
      await new Promise(resolve=>setTimeout(resolve,100));
    }
    assert.equal(await evaluate(`location.pathname==='/journal'||location.pathname==='/journal/'`),true);
    await writeFile(new URL('keyboard-results.json',output),JSON.stringify({backLinkReachedWithTab:true,focusOutline:'solid',enterNavigatesToJournal:true},null,2)+'\n');
  }
  await writeFile(new URL(phase==='before'?'visual-before.json':'browser-results.json',output),JSON.stringify(checks,null,2)+'\n');
} finally {
  await cdp('Page.close').catch(()=>{});
  socket.close();
}
