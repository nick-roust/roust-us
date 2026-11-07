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
 await cdp('Page.enable');await cdp('Runtime.enable');
 for(const [width,height]of [[390,844],[390,667],[680,900]])for(const theme of ['dark','light']){
  await cdp('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});await cdp('Page.navigate',{url:'http://localhost:4321/about/'});
  for(let n=0;n<100;n++){if(await evaluate(`document.readyState==='complete'&&!!document.querySelector('.about-hero__experience')`))break;await new Promise(r=>setTimeout(r,100));}
  await evaluate(`(async()=>{document.documentElement.dataset.theme=${JSON.stringify(theme)};document.querySelector('astro-dev-toolbar')?.remove();await document.fonts.ready;for(const i of document.images)if(i.getAttribute('src'))await i.decode();scrollTo({top:0,behavior:'instant'});await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));})()`);
  const heroHeight=await evaluate(`document.querySelector('.about-hero').getBoundingClientRect().height`);
  const shot=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width,height:heroHeight,scale:1}});const bytes=Buffer.from(shot.data,'base64');await writeFile(new URL(`${phase}-${width}-${height}-${theme}.png`,output),bytes);
  if(phase==='after')assert.deepEqual(bytes,await readFile(new URL(`before-${width}-${height}-${theme}.png`,output)),'Approved Mobile must remain pixel-identical');
  results.push({width,height,theme,heroHeight,unchanged:phase==='after'});console.log(phase,width,height,theme,'PASS');
 }
 await writeFile(new URL(`${phase}-mobile-results.json`,output),JSON.stringify(results,null,2));
}finally{socket.close();}
