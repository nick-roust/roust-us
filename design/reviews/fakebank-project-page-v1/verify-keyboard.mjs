import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';

const output = new URL('./', import.meta.url);
const target = await (await fetch('http://127.0.0.1:9437/json/new?about:blank', { method: 'PUT' })).json();
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
async function key(key,code=key,windowsVirtualKeyCode=key==='Enter'?13:9){await cdp('Input.dispatchKeyEvent',{type:'keyDown',key,code,windowsVirtualKeyCode,...(key==='Enter'?{text:'\r',unmodifiedText:'\r'}:{})});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key,code,windowsVirtualKeyCode});}
try{
 await cdp('Page.enable');await cdp('Runtime.enable');
 for(const width of [390,1440]){
  await cdp('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width===390});
  await cdp('Page.navigate',{url:'http://localhost:4321/labs/fake-bank/'});
  for(let n=0;n<100;n++){if(await evaluate(`document.readyState==='complete'&&!!document.querySelector('.product-navigation')`))break;await new Promise(r=>setTimeout(r,100));}
  await evaluate(`document.querySelector('astro-dev-toolbar')?.remove();document.activeElement?.blur()`);
  await key('Tab');
  assert.equal(await evaluate(`document.activeElement.classList.contains('skip-link')`),true);
  await key('Enter');
  assert.equal(await evaluate(`document.activeElement.id`),'main');
  if(width===390){
   await evaluate(`document.querySelector('summary').focus()`);await key('Enter');await new Promise(r=>setTimeout(r,100));
   assert.equal(await evaluate(`document.querySelector('details').open`),true);
   await key('Tab');assert.equal(await evaluate(`document.activeElement.hash`),'#overview');
   await key('Tab');assert.equal(await evaluate(`document.activeElement.hash`),'#context');
   await key('Enter');await new Promise(r=>setTimeout(r,1000));
   assert.equal(await evaluate(`document.querySelector('details').open`),false);
   assert.equal(await evaluate(`document.activeElement.id`),'context');
  }else{
   await evaluate(`document.querySelector('.product-navigation--desktop a[href="#architecture"]').focus()`);
   const focus=await evaluate(`getComputedStyle(document.activeElement).outlineStyle`);assert.equal(focus,'solid');
   await key('Enter');await new Promise(r=>setTimeout(r,1000));
   assert.equal(await evaluate(`location.hash`),'#architecture');
  }
  const focus=[];
  for(let i=0;i<7;i++){await key('Tab');focus.push(await evaluate(`({tag:document.activeElement.tagName,text:document.activeElement.textContent.trim().slice(0,60),visible:document.activeElement.matches(':focus-visible'),outline:getComputedStyle(document.activeElement).outlineStyle})`));}
  for(const entry of focus)assert.ok(entry.visible&&entry.outline!=='none',JSON.stringify(entry));
  results.push({width,skipLink:'PASS',navigation:'PASS',focus});
 }
 await writeFile(new URL('keyboard-results.json',output),JSON.stringify(results,null,2)+'\n');console.log('Keyboard navigation PASS');
}finally{socket.close();}
