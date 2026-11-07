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
 if(phase==='before'){
  await cdp('Page.navigate',{url:'http://localhost:4321/'});await new Promise(r=>setTimeout(r,500));
  const original=await readFile(new URL('../../../design/references/fake-terminal-mark.svg',output),'utf8');
  const bounds=await evaluate(`(()=>{const wrapper=document.createElement('div');wrapper.style.cssText='position:absolute;left:-9999px;top:0';wrapper.innerHTML=${JSON.stringify(original)};document.body.append(wrapper);const svg=wrapper.querySelector('svg');svg.querySelectorAll('path').forEach(p=>{if(p.getAttribute('fill')!=='#00ff41')p.remove()});const b=svg.getBBox();const result={x:b.x,y:b.y,width:b.width,height:b.height};wrapper.remove();return result;})()`);
  await writeFile(new URL('terminal-bounds.json',output),JSON.stringify(bounds,null,2)+'\n');
 }
 for(const width of [390,768,1024,1440,1920]){
  await cdp('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width===390});
  for(const theme of ['light','dark']){
   await cdp('Page.navigate',{url:'http://localhost:4321/'});
   for(let n=0;n<100;n++){if(await evaluate(`location.pathname==='/'&&document.readyState==='complete'&&!!document.querySelector('.featured-fakebank')`))break;await new Promise(r=>setTimeout(r,100));}
   await evaluate(`(async()=>{document.documentElement.dataset.theme='${theme}';document.querySelector('astro-dev-toolbar')?.remove();document.querySelector('.featured-fakebank').scrollIntoView({behavior:'instant'});await document.querySelector('.featured-fakebank img').decode();await document.fonts.ready;})()`);
   const state=await evaluate(`(()=>{
    const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y+scrollY,width:r.width,height:r.height,right:r.right,bottom:r.bottom+scrollY}};
    const h=document.querySelector('#featured-fakebank-title'),s=getComputedStyle(h),range=document.createRange();range.selectNodeContents(h.querySelector('.featured-fakebank__name')||h);const text=range.getBoundingClientRect();
    const mark=h.querySelector('svg');return {section:rect(document.querySelector('.featured-fakebank')),copy:rect(document.querySelector('.featured-fakebank__copy')),heading:{...rect(h),text:h.textContent.trim(),font:s.fontSize,line:s.lineHeight,color:s.color,textWidth:text.width,textHeight:text.height,textX:text.x,available:h.parentElement.clientWidth-parseFloat(getComputedStyle(h.parentElement).paddingLeft)-parseFloat(getComputedStyle(h.parentElement).paddingRight)},description:rect(document.querySelector('.featured-fakebank__copy>p:not(.eyebrow)')),label:rect(document.querySelector('.featured-fakebank .eyebrow')),stack:rect(document.querySelector('.featured-fakebank__stack')),cta:rect(document.querySelector('.featured-fakebank__cta')),image:rect(document.querySelector('.featured-fakebank__visual')),mark:mark?{...rect(mark),color:getComputedStyle(mark).color,hidden:mark.getAttribute('aria-hidden'),paths:[...mark.querySelectorAll('path')].map(p=>({fill:getComputedStyle(p).fill,d:p.getAttribute('d')}))}:null,overflow:document.documentElement.scrollWidth>innerWidth,other:[...document.querySelectorAll('.hero,.systems-overview,.journal-section,.building-section,#contact,footer')].map(e=>({...rect(e),class:e.className,text:e.textContent}))};
   })()`);
   assert.equal(state.overflow,false);
   if(phase==='after'){
    const old=JSON.parse(await readFile(new URL('before.json',output),'utf8')).find(x=>x.width===width&&x.theme===theme).state;
    for(const name of ['section','copy','description','label','stack','cta','image'])assert.deepEqual(state[name],old[name],width+' '+theme+' '+name);
    for(const part of old.other)if(part.class==='building-section')part.text=part.text.replace(/(\d),(\d{3})(?=hrs)/g,'$1$2');assert.deepEqual(state.other,old.other);assert.equal(state.heading.height,old.heading.height);assert.equal(state.heading.textWidth,old.heading.textWidth);assert.equal(state.heading.textHeight,old.heading.textHeight);assert.equal(state.heading.font,old.heading.font);assert.equal(state.heading.text,'FAKE BANK');assert.equal(state.mark.color,state.heading.color);assert.equal(state.mark.hidden,'true');assert.equal(state.mark.paths.length,2);assert.ok(state.mark.paths.every(p=>p.fill===state.heading.color));
    assert.ok(state.mark.x>=state.copy.x);assert.ok(state.heading.right<=state.copy.right);assert.ok(Math.abs(state.mark.y+state.mark.height/2-state.heading.y-state.heading.height/2)<.1);
    const ax=(await cdp('Accessibility.getFullAXTree')).nodes;assert.equal(ax.filter(n=>n.role?.value==='heading'&&n.name?.value==='FAKE BANK'&&n.properties?.some(p=>p.name==='level'&&p.value.value===2)).length,1);
    if(width===390||width===1440){
     const section=state.section;const shot=await cdp('Page.captureScreenshot',{format:'jpeg',quality:94,captureBeyondViewport:true,clip:{x:0,y:section.y,width:section.width,height:section.height,scale:1}});await writeFile(new URL(`featured-${width}-${theme}.jpg`,output),Buffer.from(shot.data,'base64'));
     const box=state.heading;const close=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:box.x-8,y:box.y-8,width:box.width+16,height:box.height+16,scale:2}});await writeFile(new URL(`heading-${width}-${theme}.png`,output),Buffer.from(close.data,'base64'));
    }
   }
   results.push({width,theme,state});
  }
 }
 await writeFile(new URL(phase+'.json',output),JSON.stringify(results,null,2)+'\n');console.log(phase+' PASS: 10 cases');
}finally{socket.close();}
