import { writeFile } from 'node:fs/promises';

const output = new URL('./', import.meta.url);
const target = await (await fetch('http://127.0.0.1:9438/json/new?about:blank', { method: 'PUT' })).json();
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
const results=[];
try{
 await cdp('Page.enable');await cdp('Runtime.enable');
 for(const width of [390,768,1024,1440,1920]){
  await cdp('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width===390});
  for(const theme of ['light','dark']){
   await cdp('Page.navigate',{url:'http://localhost:4321/'});
   for(let n=0;n<100;n++){if(await evaluate(`location.pathname==='/'&&document.readyState==='complete'&&!!document.querySelector('.building-section')`))break;await new Promise(r=>setTimeout(r,100));}
   await evaluate(`(async()=>{document.documentElement.dataset.theme='${theme}';await document.fonts.ready;})()`);
   const state=await evaluate(`(()=>{const rect=e=>({width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height});const pick=s=>{const e=document.querySelector(s);return {html:e.outerHTML,...rect(e)}};return {hero:pick('.hero'),journal:pick('.journal-section'),building:pick('.building-section'),contact:pick('#contact'),footer:pick('footer'),stories:[...document.querySelectorAll('.journal-story a')].map(a=>a.getAttribute('href')),order:[...document.querySelector('.home-page').children].map(e=>e.className)};})()`);
   results.push({width,theme,state});
  }
 }
 await writeFile(new URL('homepage-baseline.json',output),JSON.stringify(results,null,2)+'\n');console.log('Homepage baseline saved');
}finally{socket.close();}
