import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';

const output = new URL('../journal-spacing-refinement-v2.1/', import.meta.url);
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
const phase=process.argv[2];assert.ok(['before','after'].includes(phase));
const results=[];
try{
 await cdp('Page.enable');await cdp('Runtime.enable');
 for(const width of [390,768,1024,1440,1920]){
  await cdp('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width===390});
  for(const theme of ['light','dark']){
   await cdp('Page.navigate',{url:'http://localhost:4321/'});
   for(let i=0;i<100;i++){if(await evaluate(`location.pathname==='/'&&document.readyState==='complete'&&!!document.querySelector('.journal-story')`))break;await new Promise(r=>setTimeout(r,100));}
   await evaluate(`(async()=>{document.documentElement.dataset.theme='${theme}';document.querySelector('astro-dev-toolbar')?.remove();document.querySelector('.journal-section').scrollIntoView({behavior:'instant'});await Promise.all([...document.querySelectorAll('.journal-section img')].map(i=>i.decode()));await document.fonts.ready;const restore=document.createElement('style');restore.textContent='@media(min-width:1024px){.journal-section{padding-block:48px!important}.journal-story__rule{margin-top:16px!important}.journal-story h3{margin-bottom:8px!important}.journal-story__meta{margin-bottom:8px!important}}';document.head.append(restore);})()`);
   const state=await evaluate(`(()=>{
    const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,width:r.width,height:r.height,top:r.top+scrollY,bottom:r.bottom+scrollY}};
    const section=document.querySelector('.journal-section'),style=getComputedStyle(section);
    return {journal:{...rect(section),paddingTop:parseFloat(style.paddingTop),paddingBottom:parseFloat(style.paddingBottom),text:section.textContent.replace(/\\s+/g,' ').trim()},stories:[...document.querySelectorAll('.journal-story')].map(el=>{const image=el.querySelector('img'),title=el.querySelector('h3'),date=el.querySelector('.journal-story__meta'),summary=el.querySelector('.journal-story__summary');return {width:el.getBoundingClientRect().width,image:rect(image),title:{...rect(title),font:getComputedStyle(title).fontSize,text:title.textContent},date:rect(date),summary:rect(summary),imageTitleGap:title.getBoundingClientRect().top-image.getBoundingClientRect().bottom,titleDateGap:date.getBoundingClientRect().top-title.getBoundingClientRect().bottom,dateSummaryGap:summary.getBoundingClientRect().top-date.getBoundingClientRect().bottom}}),other:[...document.querySelectorAll('.hero,.systems-overview,.featured-fakebank,.building-section,#contact,footer')].map(el=>({class:el.className,...rect(el),text:el.textContent.replace(/\\s+/g,' ').trim()})),overflow:document.documentElement.scrollWidth>innerWidth};
   })()`);
   assert.equal(state.overflow,false);
   if(phase==='after'){
    const old=JSON.parse(await readFile(new URL('before.json',output),'utf8')).find(r=>r.width===width&&r.theme===theme).state;
    assert.equal(state.journal.text,old.journal.text);
    for(let i=0;i<state.other.length;i++){for(const key of ['width','height','text'])assert.equal(state.other[i][key],old.other[i][key],`${width} ${state.other[i].class} ${key}`);}
    for(let i=0;i<3;i++){
     const a=state.stories[i],b=old.stories[i];assert.equal(a.width,b.width);assert.equal(a.image.width,b.image.width);assert.equal(a.image.height,b.image.height);assert.equal(a.title.font,b.title.font);assert.equal(a.title.height,b.title.height);assert.equal(a.title.text,b.title.text);
     assert.equal(a.imageTitleGap-b.imageTitleGap,width>=1024?8:0);assert.equal(a.titleDateGap-b.titleDateGap,width>=1024?4:0);assert.equal(a.dateSummaryGap-b.dateSummaryGap,width>=1024?8:0);
    }
    assert.equal(state.journal.paddingTop-old.journal.paddingTop,width>=1024?28:0);assert.equal(state.journal.paddingBottom-old.journal.paddingBottom,width>=1024?36:0);
    if(width<1024)assert.equal(state.journal.height,old.journal.height);
   }
   if(width>=1440||phase==='after'&&theme==='dark'&&(width===390||width===768)){
    const box=state.journal;
    const shot=await cdp('Page.captureScreenshot',{format:'jpeg',quality:94,captureBeyondViewport:true,clip:{x:0,y:box.top-32,width:await evaluate('document.documentElement.clientWidth'),height:box.height+64,scale:1}});
    await writeFile(new URL(`${phase}-${width}-${theme}.jpg`,output),Buffer.from(shot.data,'base64'));
   }
   results.push({width,theme,state});
  }
 }
 await writeFile(new URL(phase+'.json',output),JSON.stringify(results,null,2)+'\n');console.log(phase+' PASS: 10 viewport/theme cases');
}finally{socket.close();}
