import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';

const output = new URL('./', import.meta.url);
const target = await (await fetch('http://127.0.0.1:9438/json/new?about:blank', { method: 'PUT' })).json();
const otherTargets = await (await fetch('http://127.0.0.1:9438/json/list')).json();
for (const old of otherTargets) if (old.type === 'page' && old.id !== target.id) await fetch('http://127.0.0.1:9438/json/close/' + old.id);
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
    const timer = setTimeout(() => { pending.delete(requestId); reject(new Error(method)); }, method === 'Page.captureScreenshot' ? 60000 : 20000);
    pending.set(requestId, { resolve, reject, timer });
    socket.send(JSON.stringify({ id: requestId, method, params }));
  });
}
async function evaluate(expression) {
  const response = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (response.exceptionDetails) throw new Error(JSON.stringify(response.exceptionDetails));
  return response.result.value;
}
const baseline=JSON.parse(await readFile(new URL('baseline.json',output),'utf8'));
const slugs=['when-code-stopped-being-the-main-thing','registry-and-configuration-authority','we-built-all-the-pieces'];
const expected=[];
for(const slug of slugs){const source=await readFile(new URL(`../../../src/content/journal/${slug}.md`,output),'utf8');const field=name=>JSON.parse(source.match(new RegExp('^'+name+': (.+)$','m'))[1]);expected.push({slug,title:field('title'),image:field('hero').src,date:field('displayDate')+' · '+field('type'),summary:field('homeSummary')});}
const results=[];
const text=s=>s.replace(/\s+/g,' ').trim();
try{
 await cdp('Page.enable');await cdp('Runtime.enable');await cdp('Accessibility.enable');await cdp('Network.enable');await cdp('Network.setCacheDisabled',{cacheDisabled:true});
 await cdp('Page.addScriptToEvaluateOnNewDocument',{source:`window.journalCLS=0;new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput&&e.sources.some(s=>s.node?.closest?.('.journal-section')||s.node?.parentElement?.closest('.journal-section')))window.journalCLS+=e.value;}).observe({type:'layout-shift',buffered:true});`});
 for(const width of [390,768,1024,1440,1920]){
  await cdp('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width===390});
  for(const theme of ['light','dark']){
   await cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:theme}]});
   await cdp('Page.navigate',{url:'http://localhost:4321/'});
   for(let n=0;n<100;n++){if(await evaluate(`location.pathname==='/'&&document.readyState==='complete'&&!!document.querySelector('.journal-story__cover')`))break;await new Promise(r=>setTimeout(r,100));}
   await evaluate(`(async()=>{document.documentElement.dataset.theme='${theme}';document.querySelector('astro-dev-toolbar')?.remove();document.querySelector('.journal-section').scrollIntoView({behavior:'instant'});await Promise.all([...document.querySelectorAll('.journal-section img')].map(i=>i.decode()));await document.fonts.ready;await new Promise(r=>setTimeout(r,100));})()`);
   const state=await evaluate(`(()=>{
    const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,top:r.top+scrollY,bottom:r.bottom+scrollY,width:r.width,height:r.height,right:r.right}};
    const section=document.querySelector('.journal-section'),s=getComputedStyle(section);
    return {journal:{...rect(section),paddingTop:parseFloat(s.paddingTop),paddingBottom:parseFloat(s.paddingBottom)},intro:rect(document.querySelector('.journal-home__intro')),columns:getComputedStyle(document.querySelector('.journal-home__stories')).gridTemplateColumns.split(' ').length,overflow:document.documentElement.scrollWidth>innerWidth,layoutShift:window.journalCLS,stories:[...document.querySelectorAll('.journal-story')].map(article=>{const link=article.querySelector('a'),cover=article.querySelector('.journal-story__cover'),content=article.querySelector('.journal-story__cover-content'),title=article.querySelector('h3'),img=article.querySelector('img');return {width:article.getBoundingClientRect().width,href:link.getAttribute('href'),title:title.textContent,titleId:title.id,labelledBy:link.getAttribute('aria-labelledby'),headingCount:article.querySelectorAll('h3').length,nestedLinks:link.querySelectorAll('a,button').length,meta:article.querySelector('.journal-story__meta').textContent,summary:article.querySelector('.journal-story__summary').textContent,cover:rect(cover),content:rect(content),titleRect:rect(title),color:getComputedStyle(title).color,font:getComputedStyle(title).fontSize,fontWeight:getComputedStyle(title).fontWeight,lineHeight:getComputedStyle(title).lineHeight,titleScrollHeight:title.scrollHeight,titleClientHeight:title.clientHeight,gradient:getComputedStyle(content).backgroundImage,overall:getComputedStyle(cover,'::after').backgroundColor,ruleColor:getComputedStyle(article.querySelector('.journal-story__rule')).backgroundColor,image:{src:img.getAttribute('src'),alt:img.getAttribute('alt'),hidden:img.getAttribute('aria-hidden'),loaded:img.complete&&img.naturalWidth>0,fit:getComputedStyle(img).objectFit},marginToMeta:article.querySelector('.journal-story__meta').getBoundingClientRect().top-cover.getBoundingClientRect().bottom};}),other:[...document.querySelectorAll('.hero,.systems-overview,.featured-fakebank,.building-section,#contact,footer')].map(el=>({class:el.className,...rect(el),text:el.textContent.replace(/\\s+/g,' ').trim()}))};
   })()`);
   const old=baseline.find(r=>r.width===width&&r.theme===theme).state;
   assert.equal(state.journal.paddingTop,old.journal.paddingTop);assert.equal(state.journal.paddingBottom,old.journal.paddingBottom);assert.equal(state.journal.width,old.journal.width);assert.equal(state.overflow,false);assert.equal(state.columns,width===390?1:3);assert.ok(state.layoutShift<.01);
   for(let i=0;i<state.other.length;i++){for(const key of ['width','height'])assert.equal(state.other[i][key],old.other[i][key],`${width} ${state.other[i].class} ${key}`);assert.equal(text(state.other[i].text),text(old.other[i].text));}
   for(let i=0;i<3;i++){
    const card=state.stories[i],e=expected[i];assert.equal(card.title,e.title);assert.equal(card.href,`/journal/${e.slug}/`);assert.equal(card.image.src,e.image);assert.equal(text(card.meta),e.date);assert.equal(card.summary,e.summary);assert.equal(card.labelledBy,card.titleId);assert.equal(card.headingCount,1);assert.equal(card.nestedLinks,0);assert.equal(card.image.alt,'');assert.equal(card.image.hidden,'true');assert.equal(card.image.loaded,true);assert.equal(card.image.fit,'cover');assert.equal(card.color,'rgb(255, 255, 255)');assert.equal(card.width,old.stories[i].width);assert.ok(Math.abs(card.cover.width-card.width)<.1);
    assert.ok(card.titleRect.x>=card.cover.x+19);assert.ok(card.titleRect.right<=card.cover.right-19);assert.ok(card.titleRect.top>=card.cover.top);assert.ok(Math.abs(card.cover.bottom-card.titleRect.bottom-20)<.1);assert.ok(card.titleScrollHeight<=card.titleClientHeight+1);assert.ok(card.titleRect.top-card.content.top>=34);assert.ok(card.gradient.includes('0.82'));assert.equal(card.overall,'rgba(4, 11, 17, 0.14)');assert.equal(card.ruleColor,'rgb(128, 218, 250)');
   }
   assert.ok(state.stories.every(c=>Math.abs(c.cover.height-state.stories[0].cover.height)<.1));
   const ax=(await cdp('Accessibility.getFullAXTree')).nodes;
   for(const e of expected){assert.equal(ax.filter(n=>n.role?.value==='link'&&n.name?.value===e.title).length,1);assert.equal(ax.filter(n=>n.role?.value==='heading'&&n.name?.value===e.title).length,1);}
   await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
   for(let i=0;i<3;i++){await evaluate(`document.querySelectorAll('.journal-story__link')[${i}].focus()`);assert.equal(await evaluate(`document.activeElement.matches(':focus-visible')&&getComputedStyle(document.activeElement).outlineStyle==='solid'`),true);}
   await evaluate(`document.activeElement?.blur()`);
   if(width!==1024){const box=state.journal;const shot=await cdp('Page.captureScreenshot',{format:'jpeg',quality:94,captureBeyondViewport:true,clip:{x:0,y:box.top-32,width:await evaluate('document.documentElement.clientWidth'),height:box.height+64,scale:1}});await writeFile(new URL(`covers-${width}-${theme}.jpg`,output),Buffer.from(shot.data,'base64'));}
   results.push({width,theme,state,accessibility:'Exact title link names, decorative images, heading hierarchy and visible focus PASS'});console.log(width+' '+theme+' PASS');
  }
 }
 const routes=[];
 for(const e of expected){const response=await fetch('http://localhost:4321/journal/'+e.slug+'/');assert.equal(response.status,200);routes.push({slug:e.slug,status:response.status});}
 await evaluate(`document.querySelectorAll('.journal-story__link')[2].focus()`);
 await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r'});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
 for(let n=0;n<100;n++){if(await evaluate(`location.pathname==='/journal/we-built-all-the-pieces/'`))break;await new Promise(r=>setTimeout(r,100));}
 assert.equal(await evaluate('location.pathname'),'/journal/we-built-all-the-pieces/');
 await writeFile(new URL('browser-results.json',output),JSON.stringify({results,routes,keyboardEnter:'PASS'},null,2)+'\n');console.log('All cover checks PASS');
}finally{socket.close();}
