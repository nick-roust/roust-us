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
const matrix=[[1920,1080],[1440,900],[1366,768],[1200,800],[1100,800],[1024,768],[900,900],[768,1024],[680,900],[390,844],[2560,1080],[1440,1080],[1200,900],[1200,1000],[1101,900],[1099,900],[1366,600],[390,667],[1439,900],[1441,900]];
const introduction="I design and build software systems, mostly in fintech. For more than three decades I've worked across business, engineering and operations — from the first idea to systems running in production.";
try{
 await cdp('Page.enable');await cdp('Page.bringToFront');await cdp('Emulation.setFocusEmulationEnabled',{enabled:true});await cdp('Runtime.enable');await cdp('Accessibility.enable');
 for(const [width,height]of matrix)for(const theme of ['dark','light']){
  await cdp('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
  await cdp('Page.navigate',{url:'http://localhost:4321/about/'});
  for(let n=0;n<100;n++){if(await evaluate(`location.pathname==='/about/'&&document.readyState==='complete'&&!!document.querySelector('.about-hero__experience')`))break;await new Promise(r=>setTimeout(r,100));}
  await evaluate(`(async()=>{document.documentElement.dataset.theme=${JSON.stringify(theme)};document.querySelector('astro-dev-toolbar')?.remove();await document.fonts.ready;for(const i of document.images)if(i.getAttribute('src'))await i.decode();scrollTo({top:0,behavior:'instant'});await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));})()`);
  const state=await evaluate(`(()=>{const rect=e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom}};const hero=document.querySelector('.about-hero'),image=hero.querySelector('img'),title=hero.querySelector('h1'),intro=hero.querySelector('.about-hero__introduction'),principle=hero.querySelector('.about-hero__principle'),range=document.createRange();range.selectNodeContents(title);const b=image.getBoundingClientRect(),scale=Math.max(b.width/1672,b.height/941),position=parseFloat(getComputedStyle(image).objectPosition)/100,face={x:b.x+899*scale-(1672*scale-b.width)*position,y:b.y+180*scale,width:70*scale,height:110*scale};face.right=face.x+face.width;face.bottom=face.y+face.height;const torso={x:b.x+800*scale-(1672*scale-b.width)*position,y:b.y+280*scale,width:310*scale,height:290*scale};torso.right=torso.x+torso.width;torso.bottom=torso.y+torso.height;return {width:innerWidth,height:innerHeight,theme:document.documentElement.dataset.theme,hero:rect(hero),header:rect(document.querySelector('.site-header')),headerPosition:getComputedStyle(document.querySelector('.site-header')).position,copy:rect(hero.querySelector('.about-hero__text')),heading:rect(title),headingGlyphs:rect(range),introduction:{...rect(intro),text:intro.textContent,font:getComputedStyle(intro).fontSize},principle:{...rect(principle),text:principle.textContent,italic:getComputedStyle(principle).fontStyle,border:getComputedStyle(principle).borderLeftColor,borderWidth:getComputedStyle(principle).borderLeftWidth},experience:[...hero.querySelectorAll('.about-hero__experience > div')].map(e=>({...rect(e),value:e.querySelector('dt').textContent,description:e.querySelector('dd').textContent,valueSize:getComputedStyle(e.querySelector('dt')).fontSize})),arrow:{...rect(hero.querySelector('.about-hero__explore')),name:hero.querySelector('.about-hero__explore').getAttribute('aria-label'),href:hero.querySelector('.about-hero__explore').getAttribute('href')},face,torso,container:rect(hero.querySelector('.about-hero__copy')),mode:innerWidth<=680?'mobile':(innerWidth<=1100||matchMedia('(max-aspect-ratio: 6/5)').matches)?'vertical':innerWidth>=1440?'wide':'compact',image:{loaded:image.complete&&image.naturalWidth>0,source:image.currentSrc,position:getComputedStyle(image).objectPosition},overflow:document.documentElement.scrollWidth>innerWidth,h1:[...document.querySelectorAll('h1')].map(e=>e.textContent),eyebrow:hero.querySelector('.eyebrow').textContent,bodyHeight:document.documentElement.scrollHeight,editorialText:document.querySelector('.about-editorial').textContent};})()`);
  assert.equal(state.overflow,false);assert.deepEqual(state.h1,['Nick Roust']);assert.equal(state.eyebrow,'ABOUT');assert.equal(state.introduction.text,introduction);assert.equal(state.principle.text,'I enjoy complexity when I can understand and control it.');assert.equal(state.principle.italic,'italic');assert.equal(state.principle.border,'rgb(19, 209, 253)');assert.equal(state.principle.borderWidth,'4px');assert.deepEqual(state.experience.map(e=>[e.value,e.description]),[['30+ years','In business & engineering'],['5+ systems','Built and operated']]);assert.equal(state.image.loaded,true);assert.equal(state.hero.y,0);assert.equal(state.headerPosition,'absolute');assert.ok(state.hero.height>=height);assert.ok(state.heading.y>=state.header.bottom);assert.ok(state.face.y>=state.header.bottom,'Face below Header');assert.ok(state.face.x>=0&&state.face.right<=state.hero.right,'Face inside image crop');
  if(width>=1366&&height>=768)assert.ok(state.hero.height<=height+1,'Suitable Desktop should fit one viewport');
  if(state.mode==='wide')assert.ok(state.copy.width<=540,'Bounded wide column');if(state.mode==='compact')assert.ok(state.copy.width<=480,'Bounded compact column');
  assert.ok(state.introduction.y>=state.heading.bottom);assert.ok(state.principle.y>=state.introduction.bottom);assert.ok(state.experience[0].y>=state.principle.bottom);assert.ok(state.arrow.y>=Math.max(...state.experience.map(e=>e.bottom)));assert.ok(state.arrow.bottom<=state.hero.bottom);assert.equal(state.arrow.name,'Explore About');assert.equal(state.arrow.href,'#about-perspective');
  const overlaps=(a,b)=>a.x<b.right&&a.right>b.x&&a.y<b.bottom&&a.bottom>b.y;
  for(const block of [state.headingGlyphs,state.introduction,state.principle,...state.experience]){assert.equal(overlaps(block,state.face),false,'Text must not overlap face');if(state.mode!=='mobile')assert.equal(overlaps(block,state.torso),false,'Text must not overlap upper body');}
  if(state.mode==='wide'||state.mode==='compact')assert.ok(state.copy.right+24<=state.torso.x,'Column must stop before subject');
  const ax=(await cdp('Accessibility.getFullAXTree')).nodes;assert.equal(ax.filter(n=>n.role?.value==='heading'&&n.name?.value==='Nick Roust'&&n.properties?.some(p=>p.name==='level'&&p.value.value===1)).length,1);
  const filename=`${width}x${height}-${theme}`;
  if(theme==='dark'||matrix.indexOf(matrix.find(v=>v[0]===width&&v[1]===height))<10){const shot=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width,height:state.hero.height,scale:1}});await writeFile(new URL(filename+'.png',output),Buffer.from(shot.data,'base64'));}
  if(width===1440&&height===900&&theme==='dark'){const shot=await cdp('Page.captureScreenshot',{format:'jpeg',quality:94,captureBeyondViewport:true,clip:{x:0,y:0,width,height:state.bodyHeight,scale:1}});await writeFile(new URL('desktop-full-page.jpg',output),Buffer.from(shot.data,'base64'));}
  await evaluate(`document.querySelector('.about-hero__explore').focus()`);const focus=await evaluate(`({style:getComputedStyle(document.activeElement).outlineStyle,width:getComputedStyle(document.activeElement).outlineWidth})`);assert.equal(focus.style,'solid');assert.equal(focus.width,'3px');
  await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r'});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});await evaluate(`new Promise(r=>setTimeout(r,700))`);assert.equal(await evaluate(`location.hash`),'#about-perspective');assert.equal(await evaluate(`document.activeElement.id`),'about-perspective');
    await cdp('Page.navigate',{url:'http://localhost:4321/journal/307-hours-for-one-invoice/'});
  for(let n=0;n<100;n++){if(await evaluate(`location.pathname==='/journal/307-hours-for-one-invoice/'&&document.readyState==='complete'&&!!document.querySelector('.journal-entry__hero-inner')`))break;await new Promise(r=>setTimeout(r,100));}
  const journal=await evaluate(`(()=>{const r=document.querySelector('.journal-entry__hero-inner').getBoundingClientRect();return{x:r.x,width:r.width}})()`);
  assert.equal(state.container.x,journal.x,'Shared Journal container alignment');assert.equal(state.container.width,journal.width,'Shared Journal container width');
  results.push({...state,keyboardArrow:true,journalContainer:journal});console.log(width,height,theme,'PASS');
 }
 for(const path of ['/about/','/journal/','/projects/pg27/','/labs/fake-bank/'])assert.equal((await fetch('http://localhost:4321'+path)).status,200);
 await writeFile(new URL('browser-results.json',output),JSON.stringify({browser:await cdp('Browser.getVersion'),results},null,2));
}finally{socket.close();}
