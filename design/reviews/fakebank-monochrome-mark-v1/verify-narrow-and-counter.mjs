import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';

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
const results=[];
try{
 await cdp('Page.enable');await cdp('Runtime.enable');
 for(const width of [390,681,720,760,768,1024,1440,1920]){
  await cdp('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width===390});await cdp('Page.navigate',{url:'http://localhost:4321/'});
  for(let n=0;n<100;n++){if(await evaluate(`location.pathname==='/'&&document.readyState==='complete'&&!!document.querySelector('.featured-fakebank__mark')`))break;await new Promise(r=>setTimeout(r,100));}
  const state=await evaluate(`(()=>{const heading=document.querySelector('#featured-fakebank-title'),mark=heading.querySelector('svg');const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right}};const section=document.querySelector('.featured-fakebank');const original=rect(section);const name=rect(heading.querySelector('.featured-fakebank__name'));const symbol=rect(mark);mark.style.display='none';const withoutMark=rect(section);mark.style.removeProperty('display');return {hours:document.querySelector('[data-counter-hours]').textContent,heading:rect(heading),name,symbol,original,withoutMark,overflow:document.documentElement.scrollWidth>innerWidth};})()`);
  assert.match(state.hours,/^\d+$/);assert.equal(state.overflow,false);assert.deepEqual(state.original,state.withoutMark);assert.ok(state.symbol.x>=0);assert.ok(state.symbol.right<=state.name.x-11);assert.ok(state.name.right<=state.original.width*.43+1||width===390);assert.ok(Math.abs(state.symbol.y+state.symbol.height/2-state.heading.y-state.heading.height/2)<.1);results.push({width,...state});
 }
 await writeFile(new URL('narrow-and-counter-results.json',output),JSON.stringify(results,null,2)+'\n');console.log('Responsive mark and ungrouped hours PASS');
}finally{socket.close();}
