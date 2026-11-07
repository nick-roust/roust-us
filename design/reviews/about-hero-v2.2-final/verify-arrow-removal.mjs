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
try{
 await cdp('Page.enable');await cdp('Runtime.enable');
 for(const [width,height]of [[1440,900],[1200,800],[1101,800],[1100,800],[1024,768],[1024,800],[1024,700],[768,1024],[390,844],[390,667]])for(const theme of ['dark','light']){
  await cdp('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});await cdp('Page.navigate',{url:'http://localhost:4321/about/'});
  for(let n=0;n<100;n++){if(await evaluate(`document.readyState==='complete'&&!!document.querySelector('.about-hero__experience')`))break;await new Promise(r=>setTimeout(r,100));}
  await evaluate(`(async()=>{document.documentElement.dataset.theme=${JSON.stringify(theme)};document.querySelector('astro-dev-toolbar')?.remove();await document.fonts.ready;for(const i of document.images)if(i.getAttribute('src'))await i.decode();scrollTo({top:0,behavior:'instant'});await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));})()`);
  const state=await evaluate(`(()=>{const hero=document.querySelector('.about-hero'),r=hero.getBoundingClientRect();return {width:innerWidth,height:innerHeight,theme:document.documentElement.dataset.theme,heroHeight:r.height,copyTop:getComputedStyle(hero.querySelector('.about-hero__copy')).paddingTop,headerBottom:document.querySelector('.site-header').getBoundingClientRect().bottom,faceTop:(()=>{const i=hero.querySelector('img').getBoundingClientRect();return 180*Math.max(i.width/1672,i.height/941);})(),arrow:!!document.querySelector('.about-hero__explore,[aria-label="Explore About"]'),overflow:document.documentElement.scrollWidth>innerWidth,h1:[...document.querySelectorAll('h1')].map(e=>e.textContent),introduction:hero.querySelector('.about-hero__introduction').textContent,principle:hero.querySelector('.about-hero__principle').textContent,indicators:[...hero.querySelectorAll('dt,dd')].map(e=>e.textContent),indicatorsBottom:hero.querySelector('dl').getBoundingClientRect().bottom,imageLoaded:hero.querySelector('img').complete&&hero.querySelector('img').naturalWidth>0};})()`);
  assert.equal(state.arrow,false);assert.equal(state.overflow,false);assert.equal(state.imageLoaded,true);assert.deepEqual(state.h1,['Nick Roust']);assert.ok(state.heroHeight>=height);assert.ok(state.indicatorsBottom<=state.heroHeight);assert.ok(state.faceTop>=state.headerBottom);if(width===1024&&height===768){assert.ok(state.indicatorsBottom<=height-32,'Indicators need breathing room above viewport bottom');assert.equal(state.heroHeight,height);}
  const shot=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width,height:state.heroHeight,scale:1}});await writeFile(new URL(`${width}x${height}-${theme}.png`,output),Buffer.from(shot.data,'base64'));
  results.push(state);console.log(width,height,theme,'PASS');
 }
 await writeFile(new URL('browser-results.json',output),JSON.stringify(results,null,2));
}finally{socket.close();}
