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
const phase=process.argv[2];assert.ok(['before','after'].includes(phase));
const states=[];
const reference=phase==='after'?JSON.parse(await readFile(new URL('before-results.json',output),'utf8')):null;
try {
 await cdp('Page.enable');await cdp('Runtime.enable');
 for(const width of [390,1440,1920])for(const theme of ['dark','light']){
  await cdp('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
  await cdp('Page.navigate',{url:'http://localhost:4321/about/'});
  for(let n=0;n<100;n++){if(await evaluate(`location.pathname==='/about/'&&document.readyState==='complete'&&!!document.querySelector('.about-hero')`))break;await new Promise(r=>setTimeout(r,100));}
  await evaluate(`(async()=>{document.documentElement.dataset.theme=${JSON.stringify(theme)};document.querySelector('astro-dev-toolbar')?.remove();await document.fonts.ready;for(const image of document.images)if(image.getAttribute('src'))await image.decode();scrollTo({top:0,behavior:'instant'});await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));})()`);
  const state=await evaluate(`(()=>{const rect=e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom}};const hero=document.querySelector('.about-hero'),media=hero.querySelector('.about-hero__media'),image=hero.querySelector('img'),h1=hero.querySelector('h1'),font=getComputedStyle(h1);return {width:innerWidth,theme:document.documentElement.dataset.theme,hero:rect(hero),media:rect(media),image:rect(image),heading:rect(h1),subtitle:rect(hero.querySelector('.about-hero__subtitle')),eyebrow:rect(hero.querySelector('.eyebrow')),copy:rect(hero.querySelector('.about-hero__copy')),header:{...rect(document.querySelector('.site-header')),background:getComputedStyle(document.querySelector('.site-header')).backgroundColor},font:{size:font.fontSize,weight:font.fontWeight,lineHeight:font.lineHeight,color:font.color},gradient:getComputedStyle(media,'::after').backgroundImage,objectPosition:getComputedStyle(image).objectPosition,imageSource:image.currentSrc,imageLoaded:image.complete&&image.naturalWidth>0,overflow:document.documentElement.scrollWidth>innerWidth,editorial:document.querySelector('.about-editorial').textContent,h1Count:document.querySelectorAll('h1').length,fullHeight:document.documentElement.scrollHeight};})()`);
  assert.equal(state.overflow,false);assert.equal(state.imageLoaded,true);assert.equal(state.h1Count,1);assert.equal(state.hero.y,0);
  const screenshot=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width,height:state.hero.bottom,scale:1}});
  const bytes=Buffer.from(screenshot.data,'base64');const filename=`${phase}-${width}-${theme}.png`;await writeFile(new URL(filename,output),bytes);
  if(phase==='after'){
   const previous=reference.find(x=>x.width===width&&x.theme===theme);
   for(const key of ['hero','heading','subtitle','eyebrow','copy','header','font','editorial','objectPosition'])assert.deepEqual(state[key],previous[key],`Unchanged ${key} ${width}/${theme}`);
   if(width===390){assert.deepEqual(state,previous,'Mobile state must remain unchanged');assert.deepEqual(bytes,await readFile(new URL(`before-${width}-${theme}.png`,output)),'Mobile pixels must remain unchanged');}
   else{assert.equal(state.media.x,0);assert.equal(state.media.width,state.hero.width);assert.ok(state.media.width>previous.media.width);assert.notEqual(state.gradient,previous.gradient);}
   if(width===1440&&theme==='dark'){const full=await cdp('Page.captureScreenshot',{format:'jpeg',quality:94,captureBeyondViewport:true,clip:{x:0,y:0,width,height:state.fullHeight,scale:1}});await writeFile(new URL('after-1440-dark-full.jpg',output),Buffer.from(full.data,'base64'));}
  }
  states.push(state);console.log(phase,width,theme,'PASS');
 }
 await writeFile(new URL(`${phase}-results.json`,output),JSON.stringify(states,null,2));
}finally{socket.close();}
