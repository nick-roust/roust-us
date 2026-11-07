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
 await cdp('Page.enable');await cdp('Runtime.enable');await cdp('Accessibility.enable');await cdp('Page.addScriptToEvaluateOnNewDocument',{source:`window.heroCLS=0;new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput&&e.sources.some(s=>s.node?.closest?.('.product-hero')||s.node?.parentElement?.closest('.product-hero')))window.heroCLS+=e.value;}).observe({type:'layout-shift',buffered:true});`});
 for(const width of [390,768,1024,1440,1920]){
  await cdp('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width===390});
  for(const theme of ['light','dark']){
   await cdp('Page.navigate',{url:'http://localhost:4321/labs/fake-bank/'});
   for(let n=0;n<100;n++){if(await evaluate(`location.pathname==='/labs/fake-bank/'&&document.readyState==='complete'&&!!document.querySelector('.product-hero')`))break;await new Promise(r=>setTimeout(r,100));}
   await evaluate(`(async()=>{document.documentElement.dataset.theme='${theme}';document.querySelector('astro-dev-toolbar')?.remove();await document.querySelector('.product-hero img').decode();await document.fonts.ready;scrollTo({top:0,behavior:'instant'});})()`);
   const state=await evaluate(`(()=>{
    const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom}};
    const html=e=>e.outerHTML.replace(/ data-astro-cid-[a-z0-9-]+(?:="[^"]*")?/g,'');
    const h=document.querySelector('h1'),hero=document.querySelector('.product-hero'),img=hero.querySelector('img');
    return {hero:rect(hero),title:{...rect(h),text:h.textContent.trim(),font:getComputedStyle(h).fontSize,color:getComputedStyle(h).color},copy:rect(document.querySelector('.product-hero__copy')),eyebrow:{...rect(hero.querySelector('.eyebrow')),text:hero.querySelector('.eyebrow').textContent,color:getComputedStyle(hero.querySelector('.eyebrow')).color},description:{...rect(document.querySelector('.product-hero__description')),text:document.querySelector('.product-hero__description').textContent},cta:{...rect(document.querySelector('.product-github')),text:document.querySelector('.product-github').textContent,href:document.querySelector('.product-github').href},image:{...rect(img),src:img.getAttribute('src'),position:getComputedStyle(img).objectPosition,fit:getComputedStyle(img).objectFit},overlay:getComputedStyle(hero,'::before').backgroundImage,stack:{...rect(document.querySelector('.product-stack')),items:[...document.querySelectorAll('.product-stack li')].map(el=>({text:el.textContent.trim(),height:el.getBoundingClientRect().height,svg:!!el.querySelector('svg'),labelVisible:el.querySelector('.product-stack__name')?el.querySelector('.product-stack__name').getBoundingClientRect().width>1:true}))},outside:[...document.querySelectorAll('.product-section,.product-navigation,.site-header,#contact,footer')].map(el=>({html:html(el),...rect(el)})),layoutShift:window.heroCLS,overflow:document.documentElement.scrollWidth>innerWidth,h1Count:document.querySelectorAll('h1').length};
   })()`);
   assert.equal(state.overflow,false);assert.equal(state.h1Count,1);
   if(phase==='after'){
    const old=JSON.parse(await readFile(new URL('before.json',output),'utf8')).find(x=>x.width===width&&x.theme===theme).state;
    for(const key of ['hero','copy','description','cta','image','outside','overlay'])assert.deepEqual(state[key],old[key],width+' '+theme+' '+key);
    assert.equal(state.title.height,old.title.height);assert.equal(state.title.font,old.title.font);assert.equal(state.title.text,'FAKE BANK');assert.equal(state.eyebrow.text,'OPEN SOURCE · PAYMENT SIMULATOR');assert.equal(state.stack.height,old.stack.height);assert.deepEqual(state.stack.items.map(x=>x.text),['TypeScript','Fastify','React','PostgreSQL','Docker']);assert.ok(state.stack.items.every(x=>x.svg));assert.ok(state.layoutShift<.01);assert.deepEqual(state.stack.items.map(x=>x.labelVisible),width<768?[false,true,false,false,false]:[true,true,true,true,true]);
    const ax=(await cdp('Accessibility.getFullAXTree')).nodes;const technologyList=ax.find(n=>n.role?.value==='list'&&n.name?.value==='Technology stack');assert.ok(technologyList);const byId=new Map(ax.map(n=>[n.nodeId,n]));const technologyNodes=[];const visit=n=>{technologyNodes.push(n);for(const id of n.childIds||[])if(byId.has(id))visit(byId.get(id));};visit(technologyList);for(const name of ['TypeScript','Fastify','React','PostgreSQL','Docker'])assert.equal(technologyNodes.filter(n=>n.role?.value==='StaticText'&&n.name?.value===name).length,1);assert.equal(ax.filter(n=>n.role?.value==='heading'&&n.name?.value==='FAKE BANK'&&n.properties?.some(p=>p.name==='level'&&p.value.value===1)).length,1);
    const mark=await evaluate(`(()=>{const h=document.querySelector('h1'),m=h.querySelector('svg');return {hidden:m.getAttribute('aria-hidden'),color:getComputedStyle(m).color,bottom:m.getBoundingClientRect().bottom,right:h.querySelector('.product-hero__name').getBoundingClientRect().right,heroRight:document.querySelector('.product-hero').getBoundingClientRect().right}})()`);assert.equal(mark.hidden,'true');assert.equal(mark.color,state.title.color);assert.ok(mark.right<mark.heroRight);
    await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});await evaluate(`document.querySelector('.product-github').focus()`);assert.equal(await evaluate(`document.activeElement.matches(':focus-visible')&&getComputedStyle(document.activeElement).outlineStyle==='solid'`),true);await evaluate(`document.activeElement.blur();scrollTo({top:0,behavior:'instant'})`);
    const shot=await cdp('Page.captureScreenshot',{format:'jpeg',quality:94});await writeFile(new URL(`hero-${width}-${theme}.jpg`,output),Buffer.from(shot.data,'base64'));
   }
   results.push({width,theme,state});
  }
 }
 await writeFile(new URL(phase+'.json',output),JSON.stringify(results,null,2)+'\n');console.log(phase+' PASS: 10 cases');
}finally{socket.close();}
