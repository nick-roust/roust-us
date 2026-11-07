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
async function key(){assert.equal(await evaluate(`document.activeElement.matches(':focus-visible')&&getComputedStyle(document.activeElement).outlineStyle==='solid'`),true);await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r'});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});}
async function ready(path){for(let n=0;n<100;n++){if(await evaluate(`location.pathname===${JSON.stringify(path)}&&document.readyState==='complete'&&!!document.querySelector('[data-product-sidebar]')`)){await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});return;}await new Promise(r=>setTimeout(r,100));}throw new Error(path);}
try{
 await cdp('Page.enable');await cdp('Runtime.enable');await cdp('Accessibility.enable');
 for(const width of [390,1440]){
  await cdp('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width===390});await cdp('Page.navigate',{url:'http://localhost:4321/labs/fake-bank/'});await ready('/labs/fake-bank/');await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
  const accessibility=[];
  if(width===390){await evaluate(`document.querySelector('details summary').focus()`);await key();const ax=(await cdp('Accessibility.getFullAXTree')).nodes;const disclosure=ax.find(n=>n.role?.value==='DisclosureTriangle'&&n.properties?.some(p=>p.name==='expanded'&&p.value.value===true));assert.ok(disclosure);const oss=ax.filter(n=>n.name?.value==='Open Source Software');assert.ok(oss.length>=2);accessibility.push({expanded:disclosure.name?.value,ossMeanings:oss.length});await key();assert.equal(await evaluate(`document.querySelector('details').open`),false);}
  else{await evaluate(`scrollTo({top:700,behavior:'instant'})`);const sticky=await evaluate(`({nav:document.querySelector('.product-navigation--desktop').getBoundingClientRect().top,header:document.querySelector('.site-header').getBoundingClientRect().bottom})`);assert.ok(sticky.nav>=sticky.header);accessibility.push({sticky});}
  for(const path of ['/projects/pg27/','/labs/bik-ed807/','/labs/fake-shop/','/labs/fake-bank/']){
   if(width===390){await evaluate(`document.querySelector('details summary').focus()`);await key();}
   await evaluate(`document.querySelector('${width===390?'.product-navigation--compact':'.product-navigation--desktop'} .product-navigation__products a[href="${path}"]').focus()`);await key();await ready(path);assert.equal(await evaluate(`document.querySelector('.primary-nav a[aria-current]').textContent`),'Projects');
  }
  results.push({width,projectSwitching:'PASS',accessibility});
 }
 const mappings=[['/building-paymentgate/','/projects/pg27/'],['/bik/','/labs/bik-ed807/'],['/projects/paymentgate/','/projects/pg27/'],['/projects/','/#systems']];const production=[];
 for(const [from,to] of mappings){
  const response=await fetch('http://localhost:4323'+from);assert.equal(response.status,200);const html=await response.text();assert.ok(html.includes('http-equiv="refresh"'));assert.ok(html.includes('name="robots" content="noindex"'));assert.ok(html.includes('href="'+to+'"'));
  await cdp('Page.navigate',{url:'http://localhost:4323'+from});for(let n=0;n<100;n++){if(await evaluate(`location.pathname+location.hash===${JSON.stringify(to)}&&document.readyState==='complete'`))break;await new Promise(r=>setTimeout(r,100));}assert.equal(await evaluate('location.pathname+location.hash'),to);production.push({from,to,status:response.status,mechanism:'Static HTML meta refresh; browser destination verified'});
 }
 await writeFile(new URL('accessibility-production-results.json',output),JSON.stringify({results,production},null,2)+'\n');console.log('Native keyboard/project switching/OSS meaning and production redirects PASS');
}finally{socket.close();}
