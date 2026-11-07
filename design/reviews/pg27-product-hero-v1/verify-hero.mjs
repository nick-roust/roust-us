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
const captureNames={'1440-dark':'desktop-1440-dark','1440-light':'desktop-1440-light','1920-dark':'desktop-1920-dark','768-dark':'tablet-768-dark','390-dark':'mobile-390-dark','390-light':'mobile-390-light'};
try {
 await cdp('Page.enable');await cdp('Page.bringToFront');await cdp('Emulation.setFocusEmulationEnabled',{enabled:true});await cdp('Runtime.enable');await cdp('Accessibility.enable');
 for(const width of [390,768,1024,1440,1920])for(const theme of ['dark','light']) {
  await cdp('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
  assert.equal((await fetch('http://localhost:4321/projects/pg27/')).status,200);
  await cdp('Page.navigate',{url:'http://localhost:4321/projects/pg27/'});
  for(let n=0;n<100;n++){if(await evaluate(`location.pathname==='/projects/pg27/'&&document.readyState==='complete'&&!!document.querySelector('.pg27-hero')`))break;await new Promise(r=>setTimeout(r,100));}
  await evaluate(`(async()=>{document.documentElement.dataset.theme=${JSON.stringify(theme)};document.querySelector('astro-dev-toolbar')?.remove();await document.fonts.ready;for(const i of document.images)if(i.getAttribute('src'))await i.decode();scrollTo({top:0,behavior:'instant'});await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));})()`);
  const state=await evaluate(`(()=>{const rect=e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom}};const h=document.querySelector('.pg27-hero'),image=h.querySelector('.pg27-hero__image'),mark=h.querySelector('.pg27-hero__wordmark');return {width:innerWidth,theme:document.documentElement.dataset.theme,hero:rect(h),wordmark:rect(mark),header:rect(document.querySelector('.site-header')),sidebar:rect(document.querySelector('.product-navigation--desktop')),compact:rect(document.querySelector('.product-navigation--compact')),h1Count:document.querySelectorAll('h1').length,h1Name:h.querySelector('h1').getAttribute('aria-label'),headingChildren:h.querySelector('h1').textContent,classification:h.querySelector('.eyebrow').textContent,description:h.querySelector('.pg27-hero__description').textContent,descriptionColor:getComputedStyle(h.querySelector('.pg27-hero__description')).color,image:{loaded:image.complete&&image.naturalWidth>0,source:image.currentSrc,width:image.naturalWidth,height:image.naturalHeight,position:getComputedStyle(image).objectPosition,fit:getComputedStyle(image).objectFit,alt:image.alt},overlay:getComputedStyle(h,'::before').backgroundImage,markSource:mark.getAttribute('src'),canonical:document.querySelector('link[rel=canonical]').href,active:document.querySelector('.primary-nav [aria-current]').textContent,overflow:document.documentElement.scrollWidth>innerWidth,status:document.querySelector('#status').outerHTML,backlink:document.querySelector('.page-backlink').getAttribute('href'),pageHeight:document.documentElement.scrollHeight};})()`);
  assert.equal(state.h1Count,1);assert.equal(state.h1Name,'PG27');assert.equal(state.headingChildren,'');assert.equal(state.classification,'IN DEVELOPMENT · TRANSACTION INFRASTRUCTURE');assert.equal(state.description,'Building transaction infrastructure.');assert.equal(state.descriptionColor,'rgb(255, 255, 255)');assert.equal(state.overflow,false);assert.equal(state.image.loaded,true);assert.equal(state.markSource,'/brand/pg27.svg');assert.equal(state.image.fit,'cover');assert.equal(state.backlink,'/#systems');assert.equal(state.canonical,'https://roust.us/projects/pg27/');assert.equal(state.active,'Projects');assert.ok(state.hero.y>=state.header.bottom);assert.ok(state.wordmark.right<=state.hero.right);assert.ok(state.wordmark.bottom<=state.hero.bottom);
  if(width>=1024)assert.ok(state.hero.x>=state.sidebar.right);else assert.ok(state.hero.y>=state.compact.bottom-1,JSON.stringify({hero:state.hero,compact:state.compact}));
  if(width===1440){assert.ok(Math.abs(state.hero.width-1095)<1);assert.ok(Math.abs(state.hero.height-389.765625)<.1);assert.ok(Math.abs(state.wordmark.height-64)<.1);}
  const ax=(await cdp('Accessibility.getFullAXTree')).nodes;assert.equal(ax.filter(n=>n.role?.value==='heading'&&n.name?.value==='PG27'&&n.properties?.some(p=>p.name==='level'&&p.value.value===1)).length,1);
  const name=captureNames[`${width}-${theme}`];if(name){const shot=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile(new URL(name+'.png',output),Buffer.from(shot.data,'base64'));}
  if(width===1440&&theme==='dark'){const shot=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width,height:state.pageHeight,scale:1}});await writeFile(new URL('desktop-1440-dark-full.png',output),Buffer.from(shot.data,'base64'));}
  if(width<1024){await evaluate(`document.querySelector('.product-navigation--compact summary').focus()`);await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r'});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});await evaluate(`new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))`);assert.equal(await evaluate(`document.querySelector('.product-navigation--compact').open`),true,JSON.stringify(await evaluate(`({active:document.activeElement.outerHTML,details:document.querySelector('.product-navigation--compact').outerHTML.slice(0,500),focus:document.hasFocus()})`)));await evaluate(`document.querySelector('.product-navigation--compact a[href="#status"]').click()`);}else await evaluate(`document.querySelector('.product-navigation--desktop a[href="#status"]').click()`);
  await evaluate(`new Promise(resolve=>setTimeout(resolve,400))`);assert.equal(await evaluate(`location.hash`),'#status');assert.ok(await evaluate(`!!document.querySelector('[data-product-section-link][href="#status"][aria-current="location"]')`));
  if(width<1024)assert.equal(await evaluate(`document.querySelector('.product-navigation--compact').open`),false);
  results.push({...state,navigation:true});console.log(width,theme,'PASS');
 }
 for(const path of ['/','/about/','/journal/','/labs/fake-bank/','/labs/fake-shop/','/labs/bik-ed807/'])assert.equal((await fetch('http://localhost:4321'+path)).status,200);
 const a=results.find(x=>x.width===1440&&x.theme==='dark'),b=results.find(x=>x.width===1440&&x.theme==='light');assert.deepEqual(a.hero,b.hero);assert.deepEqual(a.wordmark,b.wordmark);assert.equal(a.overlay,b.overlay);assert.equal(a.status,b.status);
 await writeFile(new URL('browser-results.json',output),JSON.stringify({browser:await cdp('Browser.getVersion'),results,routeChecks:true},null,2));
}finally{socket.close();}
