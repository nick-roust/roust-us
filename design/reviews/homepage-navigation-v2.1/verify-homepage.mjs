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
const baseline=JSON.parse(await readFile(new URL('homepage-baseline.json',output),'utf8'));
const resumeWide=process.argv.includes('--resume-wide');
const results=resumeWide?JSON.parse(await readFile(new URL('browser-progress.json',output),'utf8')):[];
async function navigate(path,base='http://localhost:4321'){
 const url=base+path;assert.equal((await fetch(url)).status,200,url);await cdp('Page.navigate',{url});
 for(let n=0;n<100;n++){if(await evaluate(`location.pathname===${JSON.stringify(path)}&&document.readyState==='complete'&&!!document.querySelector('footer')`))return;await new Promise(r=>setTimeout(r,100));}
 throw new Error('Navigation timeout '+url);
}
async function settle(){await evaluate(`new Promise(resolve=>{let y=-1,stable=0,frames=0;const step=()=>{stable=scrollY===y?stable+1:0;y=scrollY;if(stable>6||frames++>180)resolve();else requestAnimationFrame(step);};requestAnimationFrame(step);})`);}
async function loadImages(){
 await evaluate(`(async()=>{await document.fonts.ready;document.querySelector('astro-dev-toolbar')?.remove();for(const section of document.querySelectorAll('.home-page>section,#contact')){section.scrollIntoView({behavior:'instant'});await new Promise(r=>setTimeout(r,120));await Promise.all([...section.querySelectorAll('img')].map(img=>img.decode()));}scrollTo({top:0,behavior:'instant'});await new Promise(r=>setTimeout(r,100));})()`);
}
async function capture(name,full=true){
 await evaluate(`document.activeElement?.blur();document.querySelector('astro-dev-toolbar')?.remove();scrollTo({top:0,behavior:'instant'})`);
 const size=(await cdp('Page.getLayoutMetrics')).cssContentSize;
 const wide=name==='homepage-wide-dark';
 const shot=await cdp('Page.captureScreenshot',{format:wide?'jpeg':'png',...(wide?{quality:94}:{}),captureBeyondViewport:full,...(full?{clip:{x:0,y:0,width:size.width,height:size.height,scale:1}}:{})});
 await writeFile(new URL(name+(wide?'.jpg':'.png'),output),Buffer.from(shot.data,'base64'));
}
const normalize=s=>s.replace(/ data-astro-cid-[a-z0-9-]+(?:="[^"]*")?/g,'');
try{
 await cdp('Page.enable');await cdp('Runtime.enable');
 if(resumeWide){
  await cdp('Emulation.setDeviceMetricsOverride',{width:1920,height:900,deviceScaleFactor:1,mobile:false});
  await navigate('/');await evaluate(`localStorage.setItem('roust-theme','dark');document.documentElement.dataset.theme='dark'`);await loadImages();await capture('homepage-wide-dark');
 }
 for(const width of (resumeWide?[]:[390,768,1024,1440,1920])){
  await cdp('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width===390});
  for(const theme of ['light','dark']){
   await cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:theme}]});
   await navigate('/');await evaluate(`localStorage.setItem('roust-theme','${theme}');document.documentElement.dataset.theme='${theme}'`);await loadImages();
   const state=await evaluate(`(()=>{
    const rect=e=>({width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height});
    const pick=s=>{const e=document.querySelector(s);return {html:e.outerHTML,...rect(e)}};
    return {hero:pick('.hero'),journal:pick('.journal-section'),building:pick('.building-section'),contact:pick('#contact'),footer:pick('footer'),stories:[...document.querySelectorAll('.journal-story a')].map(a=>a.getAttribute('href')),order:[...document.querySelectorAll('.home-page>section')].map(e=>e.className),overflow:document.documentElement.scrollWidth>innerWidth,columns:getComputedStyle(document.querySelector('.systems-overview__list')).gridTemplateColumns.split(' ').length,projects:[...document.querySelectorAll('.systems-overview__link')].map(a=>({href:a.getAttribute('href'),title:a.querySelector('h3').textContent,label:a.querySelector('.systems-overview__label').textContent,description:a.querySelector('p').textContent})),header:[...document.querySelectorAll('.primary-nav a')].map(a=>({text:a.textContent,href:a.getAttribute('href'),active:a.getAttribute('aria-current')})),feature:{cta:document.querySelector('.featured-fakebank .button-link').getAttribute('href'),image:document.querySelector('.featured-fakebank img').currentSrc,imageWidth:document.querySelector('.featured-fakebank img').naturalWidth,position:getComputedStyle(document.querySelector('.featured-fakebank img')).objectPosition,sectionWidth:document.querySelector('.featured-fakebank').getBoundingClientRect().width,copyWidth:document.querySelector('.featured-fakebank__copy').getBoundingClientRect().width,imageRight:document.querySelector('.featured-fakebank__visual').getBoundingClientRect().right,pageWidth:document.documentElement.clientWidth,shadow:getComputedStyle(document.querySelector('.featured-fakebank')).boxShadow,caption:document.querySelector('.featured-fakebank__caption').textContent},images:[...document.querySelectorAll('.home-page img')].map(img=>({src:img.getAttribute('src'),loaded:img.complete&&img.naturalWidth>0})),badLinks:[...document.querySelectorAll('a')].filter(a=>a.getAttribute('href')==='#').length};
   })()`);
   const old=baseline.find(x=>x.width===width&&x.theme===theme).state;
   for(const part of ['hero','journal','building','contact','footer']){
    assert.equal(normalize(state[part].html),normalize(old[part].html),`${width} ${theme} ${part} HTML`);
    assert.equal(state[part].height,old[part].height,`${width} ${theme} ${part} height`);assert.equal(state[part].width,old[part].width,`${part} width`);
   }
   assert.deepEqual(state.stories,old.stories);assert.equal(state.stories.length,3);
   assert.deepEqual(state.order,['hero','systems-overview section-wrap','featured-fakebank section-wrap','journal-section section-wrap','building-section']);
   assert.equal(state.overflow,false);assert.equal(state.badLinks,0);assert.ok(state.images.every(i=>i.loaded));
   assert.equal(state.columns,width>=1024?4:width>=681?2:1);assert.equal(state.feature.cta,'/labs/fake-bank/');assert.ok(state.feature.image.includes('fakebank-reflective-facade'));assert.equal(state.feature.sectionWidth,state.feature.pageWidth);assert.equal(state.feature.imageRight,state.feature.pageWidth);assert.equal(state.feature.shadow,'none');assert.equal(state.feature.caption,'Real-worldscenarios.Controlledenvironment.');if(width>680)assert.ok(Math.abs(state.feature.copyWidth/state.feature.sectionWidth-.43)<.001);
   assert.deepEqual(state.header.map(a=>a.text),['About','Building','Projects','Journal','Contact']);assert.ok(state.header.every(a=>a.active===null));
   const anchors=[];
   for(const id of ['systems','building']){
    await evaluate(`document.querySelector('.primary-nav a[href="/#${id}"]').click()`);await settle();
    const anchor=await evaluate(`({hash:location.hash,top:document.getElementById('${id}').getBoundingClientRect().top})`);assert.equal(anchor.hash,'#'+id);assert.ok(anchor.top>=0,JSON.stringify(anchor));anchors.push(anchor);
   }
   await evaluate(`history.replaceState(null,'','/');scrollTo({top:0,behavior:'instant'})`);
   const name=width===1440?`homepage-desktop-${theme}`:width===390?`homepage-mobile-${theme}`:width===768?`homepage-tablet-${theme}`:width===1920&&theme==='dark'?'homepage-wide-dark':null;
   await writeFile(new URL('browser-progress.json',output),JSON.stringify([...results,{width,theme,state,anchors}],null,2)+'\n');if(name)await capture(name);
   results.push({width,theme,state,anchors,protectedSections:'HTML and dimensions unchanged'});console.log(`${width} ${theme} PASS`);
  }
 }
 const navigation=[];
 await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
 for(const [path,active] of [['/about/','About'],['/labs/fake-bank/','Projects'],['/labs/fake-shop/','Projects'],['/building-paymentgate/','Projects'],['/projects/paymentgate/','Projects'],['/bik/','Projects'],['/journal/','Journal'],['/journal/when-code-stopped-being-the-main-thing/','Journal']]){
  await navigate(path);
  const state=await evaluate(`({active:[...document.querySelectorAll('.primary-nav [aria-current="page"]')].map(a=>a.textContent),overflow:document.documentElement.scrollWidth>innerWidth})`);
  assert.deepEqual(state.active,[active],path);assert.equal(state.overflow,false,path);navigation.push({path,...state});
  if(path==='/labs/fake-bank/')await capture('fakebank-header-active',false);
  if(path==='/journal/')await capture('journal-header-active',false);
 }
 const links=[];
 for(const path of ['/labs/fake-shop/','/labs/fake-bank/','/building-paymentgate/','/bik/','/tools/','/labs/','/open-source/']){const r=await fetch('http://localhost:4321'+path);assert.equal(r.status,200);links.push({path,status:r.status});}
 const redirect=[];
 for(const path of ['/projects','/projects/']){const r=await fetch('http://localhost:4321'+path,{redirect:'manual'});assert.equal(r.status,301);assert.equal(r.headers.get('location'),'/#systems');redirect.push({path,status:r.status,location:r.headers.get('location')});}
 await cdp('Page.navigate',{url:'http://localhost:4323/projects/'});
 for(let n=0;n<100;n++){if(await evaluate(`location.port==='4323'&&location.pathname==='/'&&location.hash==='#systems'&&document.readyState==='complete'`))break;await new Promise(r=>setTimeout(r,100));}
 const production=await evaluate(`({url:location.href,hash:location.hash,systems:!!document.querySelector('#systems'),stories:document.querySelectorAll('.journal-story').length,active:document.querySelectorAll('.primary-nav [aria-current]').length})`);
 assert.equal(production.hash,'#systems');assert.equal(production.systems,true);assert.equal(production.stories,0);assert.equal(production.active,0);
 await writeFile(new URL('browser-results.json',output),JSON.stringify({results,navigation,links,redirect,production},null,2)+'\n');console.log(JSON.stringify({pass:true,viewports:results.length,activeStates:navigation.length,redirect,production}));
}finally{socket.close();}
