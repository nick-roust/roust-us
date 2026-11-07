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
const phase=process.argv[2];assert.ok(['before','after'].includes(phase));const results=[];
try{
 await cdp('Page.enable');await cdp('Runtime.enable');await cdp('Accessibility.enable');
 await cdp('Page.addScriptToEvaluateOnNewDocument',{source:`window.heroCLS=0;new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput&&e.sources.some(s=>s.node?.closest?.('.product-hero')||s.node?.parentElement?.closest('.product-hero')))window.heroCLS+=e.value;}).observe({type:'layout-shift',buffered:true});`});
 for(const width of [390,768,1440,1920]){
  await cdp('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width===390});
  for(const theme of ['light','dark']){
   await cdp('Page.navigate',{url:'http://localhost:4321/labs/fake-bank/'});
   for(let n=0;n<100;n++){if(await evaluate(`location.pathname==='/labs/fake-bank/'&&document.readyState==='complete'&&!!document.querySelector('.product-stack__icon')`))break;await new Promise(r=>setTimeout(r,100));}
   await evaluate(`(async()=>{document.documentElement.dataset.theme='${theme}';document.querySelector('astro-dev-toolbar')?.remove();await document.querySelector('.product-hero img').decode();await document.fonts.ready;scrollTo({top:0,behavior:'instant'});await new Promise(r=>setTimeout(r,100));})()`);
   const state=await evaluate(`(()=>{const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom}};const clean=e=>e.outerHTML.replace(/ data-astro-cid-[a-z0-9-]+(?:="[^"]*")?/g,'');const svg=document.querySelector('.product-stack__icon'),label=svg.parentElement.querySelector('.product-stack__name');return {hero:rect(document.querySelector('.product-hero')),row:rect(document.querySelector('.product-stack')),icon:rect(svg),source:clean(svg),letterFill:getComputedStyle(svg.querySelector('path')).fill,outline:svg.querySelector('rect')?{fill:getComputedStyle(svg.querySelector('rect')).fill,stroke:getComputedStyle(svg.querySelector('rect')).stroke,width:svg.querySelector('rect').getAttribute('stroke-width'),radius:svg.querySelector('rect').getAttribute('rx')}:null,color:getComputedStyle(svg).color,name:label.textContent,labelVisible:label.getBoundingClientRect().width>1,otherIcons:[...document.querySelectorAll('.product-stack__icon')].slice(1).map(clean),otherItems:[...document.querySelectorAll('.product-stack li')].slice(1).map(rect),title:clean(document.querySelector('h1')),description:clean(document.querySelector('.product-hero__description')),image:clean(document.querySelector('.product-hero__media')),sections:[...document.querySelectorAll('.product-section,.product-navigation,.site-header,#contact,footer')].map(clean),overflow:document.documentElement.scrollWidth>innerWidth,layoutShift:window.heroCLS};})()`);
   assert.equal(state.overflow,false);assert.ok(state.layoutShift<.01);
   if(phase==='after'){
    const old=JSON.parse(await readFile(new URL('before.json',output),'utf8')).find(x=>x.width===width&&x.theme===theme).state;
    for(const k of ['hero','row','icon','otherIcons','otherItems','title','description','image','sections','name','labelVisible'])assert.deepEqual(state[k],old[k],k+' '+width+' '+theme);
    assert.equal(state.outline.fill,'none');assert.equal(state.outline.stroke,state.color);assert.equal(state.letterFill,state.color);assert.equal(state.outline.radius,null);assert.equal(state.outline.width,'12');assert.equal(state.icon.width,22);assert.equal(state.icon.height,22);
    const ax=(await cdp('Accessibility.getFullAXTree')).nodes;const root=ax.find(n=>n.role?.value==='list'&&n.name?.value==='Technology stack');assert.ok(root);const byId=new Map(ax.map(n=>[n.nodeId,n]));const descendants=[];const visit=n=>{descendants.push(n);for(const id of n.childIds||[])if(byId.has(id))visit(byId.get(id));};visit(root);assert.equal(descendants.filter(n=>n.role?.value==='StaticText'&&n.name?.value==='TypeScript').length,1);
   }
   if(width===390||width===1440){
    const row=state.row;const shot=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:row.x-6,y:row.y-8,width:row.width+12,height:row.height+16,scale:2}});await writeFile(new URL(`${phase}-row-${width}-${theme}.png`,output),Buffer.from(shot.data,'base64'));
   }
   if(phase==='after'&&width===1440&&theme==='dark'){const hero=await cdp('Page.captureScreenshot',{format:'jpeg',quality:94});await writeFile(new URL('hero-1440-dark.jpg',output),Buffer.from(hero.data,'base64'));}
   results.push({width,theme,state});
  }
 }
 await writeFile(new URL(phase+'.json',output),JSON.stringify(results,null,2)+'\n');console.log(phase+' PASS: 8 cases');
}finally{socket.close();}
