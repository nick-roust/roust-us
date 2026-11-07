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
const results=[];
const captures=new Set(['1440-dark','1440-light','1920-dark','768-dark','390-dark','390-light','1024-dark']);
try {
 await cdp('Page.enable');await cdp('Runtime.enable');await cdp('Accessibility.enable');
 for (const width of [390,768,1024,1440,1920]) for(const theme of ['dark','light']) {
  await cdp('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
  await cdp('Page.navigate',{url:'http://localhost:4321/about/'});
  for(let n=0;n<100;n++){if(await evaluate(`location.pathname==='/about/'&&document.readyState==='complete'&&!!document.querySelector('.about-hero')`))break;await new Promise(r=>setTimeout(r,100));}
  await evaluate(`(async()=>{document.documentElement.dataset.theme=${JSON.stringify(theme)};document.querySelector('astro-dev-toolbar')?.remove();await document.fonts.ready;for(const image of document.images)if(image.getAttribute('src'))await image.decode();scrollTo({top:0,behavior:'instant'});await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));})()`);
  const state=await evaluate(`(()=>{const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom}};const hero=document.querySelector('.about-hero'),image=hero.querySelector('img');return {width:innerWidth,theme:document.documentElement.dataset.theme,overflow:document.documentElement.scrollWidth>innerWidth,h1:[...document.querySelectorAll('h1')].map(e=>e.textContent),sidebar:!!document.querySelector('[data-product-sidebar]'),hero:rect(hero),image:rect(image),copy:rect(hero.querySelector('.about-hero__copy')),heading:rect(hero.querySelector('h1')),header:rect(document.querySelector('.site-header')),headerBackground:getComputedStyle(document.querySelector('.site-header')).backgroundColor,headerPosition:getComputedStyle(document.querySelector('.site-header')).position,subtitle:rect(hero.querySelector('.about-hero__subtitle')),imageLoaded:image.complete&&image.naturalWidth>0,imageSource:image.currentSrc,fit:getComputedStyle(image).objectFit,position:getComputedStyle(image).objectPosition,face:(()=>{const b=image.getBoundingClientRect(),scale=Math.max(b.width/1672,b.height/941),crop=(1672*scale-b.width)*(innerWidth<=680?.58:1);return {x:b.x+900*scale-crop,y:b.y+180*scale,width:70*scale,height:110*scale};})(),heroColor:getComputedStyle(hero).color,bodyColor:getComputedStyle(document.body).color,headerActive:document.querySelector('.primary-nav [aria-current]')?.textContent,sections:[...document.querySelectorAll('.about-editorial h2')].map(e=>e.textContent),links:[...document.querySelectorAll('.about-editorial a')].map(e=>({text:e.textContent,href:e.getAttribute('href')})),provisional:document.querySelector('#editorial-status').textContent,contactCount:document.querySelectorAll('#contact').length,footerCount:document.querySelectorAll('.site-footer').length,ids:[...document.querySelectorAll('[id]')].map(e=>e.id),bodyHeight:document.documentElement.scrollHeight};})()`);
  assert.equal(state.overflow,false);assert.deepEqual(state.h1,['Nick Roust']);assert.equal(state.sidebar,false);assert.equal(state.imageLoaded,true);assert.equal(state.headerActive,'About');assert.ok(state.face.y>=state.header.bottom+5,'Face must remain below Header');assert.equal(state.contactCount,1);assert.equal(new Set(state.ids).size,state.ids.length);assert.equal(state.sections.length,5);assert.equal(state.links.length,5);assert.equal(state.hero.y,0);assert.equal(state.headerPosition,'absolute');assert.ok(state.heading.y>=state.header.bottom);assert.ok(state.copy.bottom<=state.hero.bottom+1);
  const ax=(await cdp('Accessibility.getFullAXTree')).nodes;assert.equal(ax.filter(n=>n.role?.value==='heading'&&n.name?.value==='Nick Roust'&&n.properties?.some(p=>p.name==='level'&&p.value.value===1)).length,1);
  if(captures.has(`${width}-${theme}`)) {
   const name=`about-${width}-${theme}`;
   const full=await cdp('Page.captureScreenshot',{format:'jpeg',quality:94,captureBeyondViewport:true,clip:{x:0,y:0,width,height:state.bodyHeight,scale:1}});await writeFile(new URL(`${name}-full.jpg`,output),Buffer.from(full.data,'base64'));
   const b=state.hero;const hero=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width,height:b.bottom,scale:1}});await writeFile(new URL(`${name}-hero.png`,output),Buffer.from(hero.data,'base64'));
  }
  const sharedStyle = `(()=>{const header=document.querySelector('.site-header'),s=getComputedStyle(header),hero=document.querySelector('.journal-index-hero'),hs=getComputedStyle(hero),title=getComputedStyle(hero.querySelector('h1'));return {header:{background:s.backgroundColor,position:s.position,color:s.color,border:s.borderBottomWidth,logoLight:getComputedStyle(document.querySelector('.brand__wordmark--light')).display,logoDark:getComputedStyle(document.querySelector('.brand__wordmark--dark')).display,nav:getComputedStyle(document.querySelector('.primary-nav a[href="/#building"]')).color},hero:{minHeight:hs.minHeight,background:hs.backgroundColor,scrim:getComputedStyle(document.querySelector('.journal-index-hero__image'),'::after').backgroundImage,titleFont:title.fontSize,titleWeight:title.fontWeight}}})()`;
  const aboutStyle=await evaluate(sharedStyle);
  await cdp('Page.navigate',{url:'http://localhost:4321/journal/'});
  for(let n=0;n<100;n++){if(await evaluate(`location.pathname==='/journal/'&&document.readyState==='complete'&&!!document.querySelector('.journal-index-hero')`))break;await new Promise(r=>setTimeout(r,100));}
  await evaluate(`document.documentElement.dataset.theme=${JSON.stringify(theme)}`);
  const articleStyle=await evaluate(sharedStyle);assert.deepEqual(aboutStyle.header,articleStyle.header,'About must use the existing Journal Header styles');const aboutHero={...aboutStyle.hero},articleHero={...articleStyle.hero};delete aboutHero.minHeight;delete articleHero.minHeight;assert.deepEqual(aboutHero,articleHero,'About typography and overlay must use Journal styles');
  results.push({...state,journalHeaderStyleParity:true,sharedStyle:aboutStyle});console.log(width,theme,'PASS — Journal Index Header/Hero parity');
 }
 await cdp('Page.navigate',{url:'http://localhost:4321/about/'});for(let n=0;n<100;n++){if(await evaluate(`location.pathname==='/about/'&&document.readyState==='complete'&&!!document.querySelector('.about-hero')`))break;await new Promise(r=>setTimeout(r,100));}
 for(const link of results[0].links)assert.equal((await fetch('http://localhost:4321'+link.href)).status,200);
 await evaluate(`document.activeElement?.blur();scrollTo({top:0,behavior:'instant'});`);
 await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
 const skip=await evaluate(`({text:document.activeElement.textContent,href:document.activeElement.getAttribute('href')})`);assert.equal(skip.href,'#main');
 await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
 assert.equal(await evaluate(`document.activeElement.id`),'main');
 await evaluate(`document.querySelector('.about-projects a').focus()`);
 const focus=await evaluate(`({visible:document.activeElement.matches(':focus-visible'),outline:getComputedStyle(document.activeElement).outlineStyle,width:getComputedStyle(document.activeElement).outlineWidth})`);assert.equal(focus.visible,true);assert.equal(focus.outline,'solid');assert.equal(focus.width,'3px');
 await writeFile(new URL('browser-results.json',output),JSON.stringify({browser:await cdp('Browser.getVersion'),cases:results,keyboard:{skipLink:skip,focus},allLinksHttp200:true},null,2));
}finally{socket.close();}
