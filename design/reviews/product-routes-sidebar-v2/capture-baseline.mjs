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
try{await cdp('Page.enable');await cdp('Runtime.enable');for(const width of [390,768,1024,1440,1920]){await cdp('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width===390});for(const theme of ['light','dark']){await cdp('Page.navigate',{url:'http://localhost:4321/labs/fake-bank/'});for(let n=0;n<100;n++){if(await evaluate(`document.readyState==='complete'&&!!document.querySelector('.product-hero')`))break;await new Promise(r=>setTimeout(r,100));}await evaluate(`(async()=>{document.documentElement.dataset.theme='${theme}';await document.querySelector('.product-hero img').decode();await document.fonts.ready;})()`);const state=await evaluate(`(()=>{const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}};const clean=e=>e.outerHTML.replace(/ data-astro-cid-[a-z0-9-]+(?:="[^"]*")?/g,'');return {hero:{html:clean(document.querySelector('.product-hero')),...rect(document.querySelector('.product-hero'))},sections:[...document.querySelectorAll('.product-section')].map(e=>({html:clean(e),...rect(e)})),overlay:getComputedStyle(document.querySelector('.product-hero'),'::before').backgroundImage};})()`);results.push({width,theme,state});}}await writeFile(new URL('fakebank-baseline.json',output),JSON.stringify(results,null,2)+'\n');console.log('FakeBank baseline saved');}finally{socket.close();}
