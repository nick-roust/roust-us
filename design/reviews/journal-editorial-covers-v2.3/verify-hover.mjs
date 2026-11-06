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
 await cdp('Page.enable');await cdp('Runtime.enable');await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
 await cdp('Page.navigate',{url:'http://localhost:4321/'});
 for(let n=0;n<100;n++){if(await evaluate(`location.pathname==='/'&&document.readyState==='complete'&&!!document.querySelector('.journal-story__cover')`))break;await new Promise(r=>setTimeout(r,100));}
 for(const theme of ['light','dark']){
  await evaluate(`document.documentElement.dataset.theme='${theme}';document.querySelector('.journal-section').scrollIntoView({behavior:'instant'})`);
  const r=await evaluate(`(()=>{const r=document.querySelector('.journal-story__cover').getBoundingClientRect();return {x:r.x+20,y:r.top+20}})()`);
  await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',x:r.x,y:r.y});
  const state=await evaluate(`(()=>{const t=document.querySelector('.journal-story h3'),s=getComputedStyle(t);return {hover:document.querySelector('.journal-story__link').matches(':hover'),color:s.color,decoration:s.textDecorationLine,shadow:s.textShadow,transform:getComputedStyle(document.querySelector('.journal-story img')).transform}})()`);
  assert.equal(state.hover,true);assert.equal(state.color,'rgb(255, 255, 255)');assert.equal(state.decoration,'underline');assert.equal(state.shadow,'none');assert.equal(state.transform,'none');results.push({theme,...state});
  await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',x:0,y:0});
 }
 await writeFile(new URL('hover-results.json',output),JSON.stringify(results,null,2)+'\n');console.log('Hover interaction PASS');
}finally{socket.close();}
