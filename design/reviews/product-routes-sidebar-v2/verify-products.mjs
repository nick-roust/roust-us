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
const pages=[
 {id:'fake-shop',path:'/labs/fake-shop/',name:'FAKE SHOP',sections:['overview']},
 {id:'fake-bank',path:'/labs/fake-bank/',name:'FAKE BANK',sections:['overview','context','architecture','implementation','verification','status']},
 {id:'pg27',path:'/projects/pg27/',name:'PG27',sections:['overview','status']},
 {id:'bik-ed807',path:'/labs/bik-ed807/',name:'BIK / ED807',sections:['overview']},
];
const baseline=JSON.parse(await readFile(new URL('fakebank-baseline.json',output),'utf8'));
const results=[];
async function navigate(path,base='http://localhost:4321'){
 assert.equal((await fetch(base+path)).status,200,base+path);await cdp('Page.navigate',{url:base+path});
 for(let n=0;n<100;n++){if(await evaluate(`location.pathname===${JSON.stringify(path)}&&document.readyState==='complete'&&!!document.querySelector('[data-product-sidebar]')`))return;await new Promise(r=>setTimeout(r,100));}throw new Error('Navigation '+path);
}
async function settle(){await evaluate(`new Promise(resolve=>{let y=-1,stable=0,frames=0;const step=()=>{stable=scrollY===y?stable+1:0;y=scrollY;if(stable>6||frames++>180)resolve();else requestAnimationFrame(step);};requestAnimationFrame(step);})`);}
async function key(name,number){await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:name,code:name,windowsVirtualKeyCode:number,...(name==='Enter'?{text:'\r'}:{})});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:name,code:name,windowsVirtualKeyCode:number});}
async function capture(name){await evaluate(`document.activeElement?.blur();document.querySelector('astro-dev-toolbar')?.remove()`);const shot=await cdp('Page.captureScreenshot',{format:'jpeg',quality:94});await writeFile(new URL(name+'.jpg',output),Buffer.from(shot.data,'base64'));}
try{
 await cdp('Page.enable');await cdp('Runtime.enable');await cdp('Accessibility.enable');
 for(const width of [390,768,1024,1440,1920]){
  await cdp('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width===390});
  for(const theme of ['light','dark']){
   for(const page of pages){
    await navigate(page.path);
    await evaluate(`(async()=>{document.documentElement.dataset.theme='${theme}';document.querySelector('astro-dev-toolbar')?.remove();await document.fonts.ready;const image=document.querySelector('.product-hero img');if(image)await image.decode();scrollTo({top:0,behavior:'instant'});})()`);
    const state=await evaluate(`(()=>{const compact=innerWidth<1024,root=document.querySelector(compact?'.product-navigation--compact':'.product-navigation--desktop'),rect=e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height}};const clean=e=>e.outerHTML.replace(/ data-astro-cid-[a-z0-9-]+(?:="[^"]*")?/g,'');const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);return{canonical:document.querySelector('link[rel=canonical]')?.href,activeGlobal:[...document.querySelectorAll('.primary-nav a[aria-current]')].map(e=>e.textContent),name:root.querySelector('.product-navigation__name span').textContent,sections:[...root.querySelectorAll('[data-product-section-link]')].map(e=>e.hash.slice(1)),projects:[...root.querySelectorAll('.product-navigation__products a')].map(e=>({href:e.getAttribute('href'),name:e.querySelector('span').textContent,oss:!!e.querySelector('abbr'),expanded:e.querySelector('abbr')?.getAttribute('aria-label')})),activeOss:!!root.querySelector('.product-navigation__name abbr'),current:root.querySelector('[data-product-section-link][aria-current]')?.hash,headerBottom:document.querySelector('.site-header').getBoundingClientRect().bottom,sidebar:rect(root),compactClosed:!document.querySelector('details.product-navigation').open,duplicates:ids.filter((id,i)=>ids.indexOf(id)!==i),overflow:document.documentElement.scrollWidth>innerWidth,brokenAnchors:[...root.querySelectorAll('[data-product-section-link]')].filter(a=>!document.getElementById(a.hash.slice(1))).map(a=>a.hash),hero:document.querySelector('.product-hero')?{html:clean(document.querySelector('.product-hero')),...rect(document.querySelector('.product-hero'))}:null,body:[...document.querySelectorAll('.product-section')].map(e=>({html:clean(e),...rect(e)})),overlay:document.querySelector('.product-hero')?getComputedStyle(document.querySelector('.product-hero'),'::before').backgroundImage:null};})()`);
    assert.equal(state.canonical,'https://roust.us'+page.path);assert.deepEqual(state.activeGlobal,['Projects']);assert.equal(state.name,page.name);assert.deepEqual(state.sections,page.sections);assert.deepEqual(state.duplicates,[]);assert.deepEqual(state.brokenAnchors,[]);assert.equal(state.overflow,false);assert.equal(state.compactClosed,true);assert.equal(state.current,'#overview');assert.equal(state.activeOss,['fake-shop','fake-bank'].includes(page.id));
    const others=pages.filter(p=>p.id!==page.id);assert.deepEqual(state.projects.map(p=>p.href),others.map(p=>p.path));for(let i=0;i<others.length;i++){assert.equal(state.projects[i].oss,['fake-shop','fake-bank'].includes(others[i].id));if(state.projects[i].oss)assert.equal(state.projects[i].expanded,'Open Source Software');}
    if(page.id==='fake-bank'){const old=baseline.find(x=>x.width===width&&x.theme===theme).state;assert.deepEqual(state.hero,old.hero,width+' '+theme+' Hero');assert.deepEqual(state.body,old.sections,width+' '+theme+' body');assert.equal(state.overlay,old.overlay);}
    if(width===1440&&page.id==='fake-bank'||width===390&&page.id==='fake-bank'||width===1440&&theme==='dark')await capture(`${page.id}-${width}-${theme}`);
    const rootSelector=width<1024?'.product-navigation--compact':'.product-navigation--desktop';const visited=[];
    for(const id of page.sections.slice(0,2)){
     if(width<1024){await evaluate(`document.querySelector('.product-navigation--compact summary').focus()`);await key('Enter',13);await new Promise(r=>setTimeout(r,50));assert.equal(await evaluate(`document.querySelector('details.product-navigation').open`),true);}
     await evaluate(`document.querySelector('${rootSelector} a[href="#${id}"]').focus()`);await key('Enter',13);await settle();
     const anchor=await evaluate(`(()=>{const root=document.querySelector('${rootSelector}'),target=document.getElementById('${id}'),header=document.querySelector('.site-header').getBoundingClientRect(),control=document.querySelector('.product-navigation--compact').getBoundingClientRect();return{hash:location.hash,current:root.querySelector('[data-product-section-link][aria-current]')?.hash,top:target.getBoundingClientRect().top,limit:${width<1024?'control.bottom':'header.bottom'},closed:!document.querySelector('details.product-navigation').open}})()`);
     assert.equal(anchor.hash,'#'+id);assert.equal(anchor.current,'#'+id);assert.equal(anchor.closed,true);assert.ok(anchor.top>=anchor.limit-2,JSON.stringify({width,page:page.id,anchor}));visited.push(anchor);
    }
    if(page.sections.length>1){await cdp('Page.navigateToHistoryEntry',{entryId:(await cdp('Page.getNavigationHistory')).entries[(await cdp('Page.getNavigationHistory')).currentIndex-1].id});await settle();assert.equal(await evaluate(`document.querySelector('${rootSelector} [data-product-section-link][aria-current]').hash`),'#'+page.sections[0]);const history=await cdp('Page.getNavigationHistory');await cdp('Page.navigateToHistoryEntry',{entryId:history.entries[history.currentIndex+1].id});await settle();assert.equal(await evaluate(`document.querySelector('${rootSelector} [data-product-section-link][aria-current]').hash`),'#'+page.sections[1]);}
    if(width===390&&theme==='dark'&&page.id==='fake-bank'){await evaluate(`document.querySelector('details.product-navigation').open=true;scrollTo({top:0,behavior:'instant'})`);await capture('mobile-product-navigation-expanded');await evaluate(`document.querySelector('details.product-navigation').open=false`);}
    results.push({width,theme,project:page.id,state,visited});console.log(width+' '+theme+' '+page.id+' PASS');
   }
  }
 }
 const mappings=[['/building-paymentgate/','/projects/pg27/'],['/bik/','/labs/bik-ed807/'],['/projects/paymentgate/','/projects/pg27/'],['/projects/','/#systems']];const redirects=[];
 for(const [from,to] of mappings){for(const path of [from,from.slice(0,-1)]){const response=await fetch('http://localhost:4321'+path,{redirect:'manual'});assert.equal(response.status,301,path);assert.equal(response.headers.get('location'),to);redirects.push({path,status:response.status,location:to});}}
 await cdp('Page.navigate',{url:'http://localhost:4321/'});await new Promise(r=>setTimeout(r,500));
 const home=await evaluate(`({projects:[...document.querySelectorAll('.systems-overview__link')].map(a=>a.getAttribute('href')),building:document.querySelector('.building-section__link').getAttribute('href'),active:document.querySelectorAll('.primary-nav [aria-current]').length,journal:document.querySelector('.primary-nav a[href="/journal/"]')?.textContent})`);assert.deepEqual(home.projects,pages.map(p=>p.path));assert.equal(home.building,'/journal');assert.equal(home.active,0);assert.equal(home.journal,'Journal');
 await writeFile(new URL('browser-results.json',output),JSON.stringify({results,redirects,home},null,2)+'\n');console.log('All 40 product cases PASS');
}finally{socket.close();}
