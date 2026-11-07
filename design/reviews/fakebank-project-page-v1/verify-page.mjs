import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';

const output = new URL('./', import.meta.url);
const target = await (await fetch('http://127.0.0.1:9437/json/new?about:blank', { method: 'PUT' })).json();
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
const results = [];
async function navigate(path) {
  const url = `http://localhost:4321${path}`;
  assert.equal((await fetch(url)).status, 200, path);
  await cdp('Page.navigate', { url });
  for (let attempt = 0; attempt < 100; attempt++) {
    if (await evaluate(`location.pathname === ${JSON.stringify(path)} && document.readyState === 'complete' && !!document.querySelector('footer')`)) return;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error('Navigation timeout: ' + path);
}
async function capture(name, fullPage = false) {
  await evaluate(`document.activeElement?.blur();document.querySelector('astro-dev-toolbar')?.remove();scrollTo({top:0,behavior:'instant'})`);
  const size = (await cdp('Page.getLayoutMetrics')).cssContentSize;
  const shot = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: fullPage, ...(fullPage ? { clip: { x:0, y:0, width:size.width, height:size.height, scale:1 }} : {}) });
  await writeFile(new URL(name + '.png', output), Buffer.from(shot.data, 'base64'));
}
try {
  await cdp('Page.enable'); await cdp('Runtime.enable'); await cdp('Accessibility.enable');
  for (const width of [390,768,1024,1440,1920]) {
    await cdp('Emulation.setDeviceMetricsOverride', { width, height:900, deviceScaleFactor:1, mobile:width===390 });
    for (const theme of ['light','dark']) {
      await cdp('Emulation.setEmulatedMedia', { features:[{name:'prefers-color-scheme',value:theme}] });
      await navigate('/labs/fake-bank/');
      await evaluate(`(async()=>{localStorage.setItem('roust-theme',${JSON.stringify(theme)});document.documentElement.dataset.theme=${JSON.stringify(theme)};await document.fonts.ready;await document.querySelector('.product-hero img').decode();document.querySelector('astro-dev-toolbar')?.remove();scrollTo({top:0,behavior:'instant'});await new Promise(r=>setTimeout(r,100));})()`);
      const state = await evaluate(`(()=>{
        const rect=el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom}};
        const image=document.querySelector('.product-hero img');
        return {width:innerWidth,theme:document.documentElement.dataset.theme,overflow:document.documentElement.scrollWidth>innerWidth,h1:[...document.querySelectorAll('h1')].map(el=>el.textContent),header:rect(document.querySelector('.site-header')),hero:rect(document.querySelector('.product-hero')),image:{src:image.currentSrc,naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight,fit:getComputedStyle(image).objectFit,position:getComputedStyle(image).objectPosition,...rect(image)},desktopNavigation:getComputedStyle(document.querySelector('.product-navigation--desktop')).display,mobileNavigation:getComputedStyle(document.querySelector('.product-navigation--compact')).display,mobileClosed:!document.querySelector('details').open,contact:!!document.querySelector('#contact'),footer:!!document.querySelector('footer'),sectionIds:[...document.querySelectorAll('.fakebank-content section')].map(el=>el.id),badLinks:[...document.querySelectorAll('.fakebank-product a')].filter(a=>a.getAttribute('href')==='#'||(a.getAttribute('href').startsWith('#')&&!document.getElementById(a.hash.slice(1)))).map(a=>a.href)};
      })()`);
      assert.equal(state.overflow,false); assert.deepEqual(state.h1,['FAKE BANK']);
      assert.equal(state.image.fit,'cover');assert.ok(state.image.naturalWidth>0);
      assert.equal(state.contact,true); assert.equal(state.footer,true); assert.deepEqual(state.badLinks,[]);
      assert.deepEqual(state.sectionIds,['overview','context','problem','architecture','implementation','verification','status']);
      assert.equal(state.desktopNavigation==='none',width<1024);
      assert.equal(state.mobileNavigation==='none',width>=1024);assert.equal(state.mobileClosed,true);
      const anchors=[];
      for(const section of ['context','architecture','implementation','verification','status','overview']) {
        if(width<1024) await evaluate(`document.querySelector('details').open=true`);
        await evaluate(`document.querySelector('${width<1024?'.product-navigation--compact':'.product-navigation--desktop'} a[href="#${section}"]').click()`);
        await evaluate(`new Promise(resolve=>{let previous=-1,stable=0,frames=0;const check=()=>{stable=scrollY===previous?stable+1:0;previous=scrollY;if(stable>8||frames++>180)resolve();else requestAnimationFrame(check);};requestAnimationFrame(check);})`);
        const anchor=await evaluate(`(()=>{const h=document.querySelector('.site-header').getBoundingClientRect();const nav=document.querySelector('.product-navigation--compact');const t=document.getElementById('${section}').getBoundingClientRect();return {section:'${section}',top:t.top,headerBottom:h.bottom,navBottom:${width<1024?'nav.getBoundingClientRect().bottom':'h.bottom'},mobileClosed:!nav.open,current:document.querySelector('${width<1024?'.product-navigation--compact':'.product-navigation--desktop'} a[href="#${section}"]').getAttribute('aria-current'),sidebarTop:document.querySelector('.product-navigation--desktop').getBoundingClientRect().top};})()`);
        assert.equal(anchor.current,'location');assert.equal(anchor.mobileClosed,true);
        assert.ok(anchor.top>=anchor.navBottom-2,JSON.stringify(anchor));
        if(width>=1024)assert.ok(anchor.sidebarTop>=anchor.headerBottom);
        anchors.push(anchor);
      }
      await evaluate(`history.replaceState(null,'',location.pathname);window.dispatchEvent(new HashChangeEvent('hashchange'));scrollTo({top:0,behavior:'instant'});document.activeElement?.blur()`);
      const ax=(await cdp('Accessibility.getFullAXTree')).nodes;
      assert.ok(ax.some(n=>n.role?.value==='heading'&&n.name?.value==='FAKE BANK'&&n.properties?.some(p=>p.name==='level'&&p.value.value===1)));
      await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
      await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
      const focus=await evaluate(`(()=>{const e=document.activeElement,s=getComputedStyle(e);return {tag:e.tagName,text:e.textContent.trim().slice(0,70),visible:e.matches(':focus-visible'),outline:s.outlineStyle,width:s.outlineWidth}})()`);
      assert.equal(focus.visible,true);assert.notEqual(focus.outline,'none');
      const name=width===1440?`desktop-${theme}`:width===390?`mobile-${theme}`:width===768?`tablet-${theme}`:width===1920&&theme==='dark'?'wide-desktop-dark':null;
      if(name){await capture(name+'-full',true);if(width===1440)await capture(name+'-hero-sidebar');}
      results.push({width,theme,state,anchors,focus,accessibility:'H1 verified'});
    }
  }
  const routes=[];
  for(const path of ['/','/about/','/projects/','/projects/paymentgate/','/building-paymentgate/','/journal/','/tools/','/bik/','/labs/','/labs/fake-shop/','/open-source/']){
    const response=await fetch('http://localhost:4321'+path);assert.equal(response.status,200,path);routes.push({path,status:response.status});
  }
  await writeFile(new URL('browser-results.json',output),JSON.stringify({results,routes},null,2)+'\n');
  console.log(JSON.stringify({pass:true,viewports:results.length,routes:routes.length}));
} finally {socket.close();}
