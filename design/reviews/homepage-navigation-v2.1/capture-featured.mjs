import assert from 'node:assert/strict';
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
 for(const width of [1024,1440]){
  await cdp('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
  await cdp('Page.navigate',{url:'http://localhost:4321/'});
  for(let n=0;n<100;n++){if(await evaluate(`location.pathname==='/'&&document.readyState==='complete'&&!!document.querySelector('.featured-fakebank')`))break;await new Promise(r=>setTimeout(r,100));}
  await evaluate(`(async()=>{document.documentElement.dataset.theme='dark';document.querySelector('astro-dev-toolbar')?.remove();document.querySelector('.featured-fakebank').scrollIntoView({behavior:'instant'});await document.querySelector('.featured-fakebank img').decode();await document.fonts.ready;})()`);
  const rect=await evaluate(`(()=>{const el=document.querySelector('.featured-fakebank'),r=el.getBoundingClientRect(),v=document.querySelector('.featured-fakebank__visual').getBoundingClientRect(),c=document.querySelector('.featured-fakebank__copy').getBoundingClientRect();return {x:r.x+scrollX,y:r.y+scrollY,width:r.width,height:r.height,scale:1,imageWidth:v.width,imageRight:v.right,viewportWidth:document.documentElement.clientWidth,copyWidth:c.width,sectionBorder:getComputedStyle(el).borderWidth,shadow:getComputedStyle(el).boxShadow};})()`);
  assert.equal(rect.imageRight,rect.viewportWidth);assert.equal(rect.shadow,'none');assert.ok(Math.abs(rect.copyWidth/rect.width-.43)<.001);
  const shot=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:rect.x,y:rect.y,width:rect.width,height:rect.height,scale:1}});
  await writeFile(new URL(`featured-${width}-dark.png`,output),Buffer.from(shot.data,'base64'));results.push({viewport:width,...rect});
 }
 await writeFile(new URL('featured-geometry.json',output),JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify(results));
}finally{socket.close();}
