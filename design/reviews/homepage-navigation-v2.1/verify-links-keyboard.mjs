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
try{
 await cdp('Page.enable');await cdp('Runtime.enable');
 await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
 await cdp('Page.navigate',{url:'http://localhost:4321/'});
 for(let n=0;n<100;n++){if(await evaluate(`location.pathname==='/'&&document.readyState==='complete'&&!!document.querySelector('#systems')`))break;await new Promise(r=>setTimeout(r,100));}
 const internal=await evaluate(`(async()=>{const links=[...new Set([...document.querySelectorAll('a[href]')].map(a=>a.href))].map(href=>new URL(href)).filter(u=>u.origin===location.origin);const results=[];for(const u of links){const response=await fetch(u.pathname+u.search);const doc=new DOMParser().parseFromString(await response.text(),'text/html');results.push({url:u.href,status:response.status,anchor:u.hash?!!doc.getElementById(u.hash.slice(1)):true});}return results;})()`);
 for(const result of internal){assert.equal(result.status,200,result.url);assert.equal(result.anchor,true,result.url);}
 const keyboard=[];
 for(const width of [390,1440]){
  await cdp('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width===390});
  await cdp('Page.navigate',{url:'http://localhost:4321/'});
  for(let n=0;n<100;n++){if(await evaluate(`location.pathname==='/'&&document.readyState==='complete'&&!!document.querySelector('#systems')`))break;await new Promise(r=>setTimeout(r,100));}
  await evaluate(`document.activeElement?.blur();document.querySelector('astro-dev-toolbar')?.remove()`);
  await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
  assert.equal(await evaluate(`document.activeElement.classList.contains('skip-link')`),true);
  await evaluate(`document.querySelector('.primary-nav a[href="/#systems"]').focus()`);
  assert.equal(await evaluate(`document.activeElement.matches(':focus-visible')&&getComputedStyle(document.activeElement).outlineStyle==='solid'`),true);
  await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r'});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
  await new Promise(r=>setTimeout(r,1200));assert.equal(await evaluate(`location.hash`),'#systems');
  await evaluate(`document.querySelector('.systems-overview__link').focus()`);
  assert.equal(await evaluate(`document.activeElement.matches(':focus-visible')&&getComputedStyle(document.activeElement).outlineStyle==='solid'`),true);
  await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r'});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
  for(let n=0;n<100;n++){if(await evaluate(`location.pathname==='/labs/fake-shop/'&&document.readyState==='complete'`))break;await new Promise(r=>setTimeout(r,100));}
  assert.equal(await evaluate(`document.querySelector('.primary-nav [aria-current]').textContent`),'Projects');
  keyboard.push({width,skipLink:true,headerFocus:true,projectFocus:true,enterNavigation:true});
 }
 await writeFile(new URL('links-keyboard-results.json',output),JSON.stringify({internal,keyboard},null,2)+'\n');console.log(JSON.stringify({pass:true,internalLinks:internal.length,keyboardWidths:keyboard.length}));
}finally{socket.close();}
