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
const root=new URL('../../../',output);
const candidates=[['a','Футуристический центр глобальных операций-2.png'],['b','Футуристический центр глобального мониторинга-1.png']];
const results=[];
async function navigate(path){assert.equal((await fetch('http://localhost:4321'+path)).status,200);await cdp('Page.navigate',{url:'http://localhost:4321'+path});for(let n=0;n<100;n++){if(await evaluate(`location.pathname===${JSON.stringify(path)}&&document.readyState==='complete'&&!!document.querySelector('h1')`))return;await new Promise(r=>setTimeout(r,100));}throw new Error('Navigation '+path);}
async function settle(){await evaluate(`new Promise(resolve=>{let y=-1,stable=0,frames=0;const step=()=>{stable=scrollY===y?stable+1:0;y=scrollY;if(stable>6||frames++>180)resolve();else requestAnimationFrame(step);};requestAnimationFrame(step);})`);}
try{
 await cdp('Page.enable');await cdp('Runtime.enable');await cdp('Accessibility.enable');
 await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
 await cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:'dark'}]});
 const browser=await cdp('Browser.getVersion');
 await navigate('/labs/fake-bank/');
 const reference=await evaluate(`(()=>{const h=document.querySelector('.product-hero'),c=document.querySelector('.product-hero__copy'),r=h.getBoundingClientRect(),s=getComputedStyle(c);return {width:r.width,height:r.height,paddingTop:s.paddingTop,paddingLeft:s.paddingLeft,overlay:getComputedStyle(h,'::before').backgroundImage,titleFont:getComputedStyle(h.querySelector('h1')).fontSize,descriptionFont:getComputedStyle(h.querySelector('.product-hero__description')).fontSize};})()`);
 await navigate('/projects/pg27/');
 await evaluate(`document.documentElement.dataset.theme='dark';document.querySelector('astro-dev-toolbar')?.remove()`);
 const baseline=await evaluate(`({hero:document.querySelector('#overview').outerHTML,status:document.querySelector('#status').outerHTML,sidebar:[...document.querySelectorAll('[data-product-sidebar]')].map(e=>e.outerHTML),canonical:document.querySelector('link[rel=canonical]').href})`);
 await writeFile(new URL('browser-baseline.json',output),JSON.stringify(baseline,null,2)+'\n');
 const css=`
 .pg27-hero-preview{position:relative;isolation:isolate;overflow:hidden;height:${reference.height}px;min-height:0;padding:0;background:#101820;color:#fff;}
 .pg27-hero-preview::after{content:none;}
 .pg27-hero-preview::before{position:absolute;z-index:-1;inset:0;content:'';background:linear-gradient(90deg,rgba(5,13,19,.9),rgba(5,13,19,.46) 50%,rgba(5,13,19,.04) 85%),linear-gradient(0deg,rgba(5,13,19,.4),transparent 48%);}
 .pg27-hero-preview__image{position:absolute;z-index:-2;inset:0;width:100%;height:100%;display:block;object-fit:cover;object-position:center 48%;}
 .pg27-hero-preview__copy{padding:${reference.paddingTop} ${reference.paddingLeft};}
 .pg27-hero-preview .eyebrow{color:#80dafa;margin:0 0 12px;font-size:.72rem;font-weight:700;letter-spacing:.16em;line-height:1.3;}
 .pg27-hero-preview h1{display:flex;align-items:center;max-width:none;height:1.05em;margin:0 0 12px;font-size:clamp(2.5rem,4.5vw,4rem);line-height:1.05;}
 .pg27-hero-preview__wordmark{display:block;width:auto;height:1em;max-width:100%;}
 .pg27-hero-preview p.pg27-hero-preview__description{max-width:29ch;margin:0;font-size:clamp(1.1rem,1.7vw,1.5rem);line-height:1.4;color:#fff;}
 `;
 await writeFile(new URL('preview.css.txt',output),css);
 await evaluate(`(()=>{const style=document.createElement('style');style.id='pg27-local-preview-style';style.textContent=${JSON.stringify(css)};document.head.append(style);const hero=document.querySelector('#overview');hero.className='page-hero pg27-hero-preview';hero.setAttribute('aria-labelledby','pg27-preview-title');hero.innerHTML='<img class="pg27-hero-preview__image" alt="" aria-hidden="true" decoding="async" /><div class="pg27-hero-preview__copy"><p class="eyebrow">IN DEVELOPMENT · TRANSACTION INFRASTRUCTURE</p><h1 id="pg27-preview-title" aria-label="PG27"><img class="pg27-hero-preview__wordmark" src="/brand/pg27.svg" width="256" height="59" alt="" aria-hidden="true" /></h1><p class="pg27-hero-preview__description">Building transaction infrastructure.</p></div>';})()`);
 for(const [variant,name] of candidates){
  await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
  const bytes=await readFile(new URL('design/references/'+name,root));const source='data:image/png;base64,'+bytes.toString('base64');
  await evaluate(`(async()=>{const image=document.querySelector('.pg27-hero-preview__image');image.src=${JSON.stringify(source)};await image.decode();await document.querySelector('.pg27-hero-preview__wordmark').decode();await document.fonts.ready;history.replaceState(null,'','/projects/pg27/');window.dispatchEvent(new HashChangeEvent('hashchange'));document.activeElement?.blur();scrollTo({top:0,behavior:'instant'});await new Promise(r=>setTimeout(r,150));})()`);
  const state=await evaluate(`(()=>{const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom}};const hero=document.querySelector('#overview'),image=hero.querySelector('.pg27-hero-preview__image'),wordmark=hero.querySelector('.pg27-hero-preview__wordmark'),h1=hero.querySelector('h1');const normalized=hero.cloneNode(true);normalized.querySelector('.pg27-hero-preview__image').setAttribute('src','CANDIDATE');return {hero:rect(hero),copy:rect(hero.querySelector('.pg27-hero-preview__copy')),heading:rect(h1),wordmark:rect(wordmark),wordmarkSource:wordmark.getAttribute('src'),description:{...rect(hero.querySelector('.pg27-hero-preview__description')),text:hero.querySelector('.pg27-hero-preview__description').textContent,color:getComputedStyle(hero.querySelector('.pg27-hero-preview__description')).color},eyebrow:hero.querySelector('.eyebrow').textContent,overlay:getComputedStyle(hero,'::before').backgroundImage,position:getComputedStyle(image).objectPosition,fit:getComputedStyle(image).objectFit,natural:{width:image.naturalWidth,height:image.naturalHeight},sidebar:rect(document.querySelector('.product-navigation--desktop')),header:rect(document.querySelector('.site-header')),h1Count:document.querySelectorAll('h1').length,overflow:document.documentElement.scrollWidth>innerWidth,status:document.querySelector('#status').outerHTML,backlink:document.querySelector('.page-backlink').getAttribute('href'),normalizedHero:normalized.outerHTML};})()`);
  assert.equal(state.h1Count,1);assert.equal(state.overflow,false);assert.equal(state.hero.height,reference.height);assert.equal(state.hero.width,reference.width);assert.ok(state.hero.x>=state.sidebar.right);assert.ok(state.hero.y>=state.header.bottom);assert.ok(state.wordmark.right<state.hero.right);assert.ok(state.wordmark.bottom<state.hero.bottom);assert.equal(state.description.text,'Building transaction infrastructure.');assert.equal(state.description.color,'rgb(255, 255, 255)');assert.equal(state.status,baseline.status);assert.equal(state.backlink,'/#systems');assert.equal(state.fit,'cover');assert.equal(state.eyebrow,'IN DEVELOPMENT · TRANSACTION INFRASTRUCTURE');
  const ax=(await cdp('Accessibility.getFullAXTree')).nodes;assert.equal(ax.filter(n=>n.role?.value==='heading'&&n.name?.value==='PG27'&&n.properties?.some(p=>p.name==='level'&&p.value.value===1)).length,1);
  const shot=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile(new URL(`variant-${variant}-1440-dark.png`,output),Buffer.from(shot.data,'base64'));
  const box=state.hero;const close=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:box.x,y:box.y,width:box.width,height:box.height,scale:1}});await writeFile(new URL(`variant-${variant}-closeup.png`,output),Buffer.from(close.data,'base64'));
  results.push({variant,state});
  await evaluate(`document.querySelector('.product-navigation--desktop a[href="#status"]').click()`);await settle();assert.equal(await evaluate(`document.querySelector('.product-navigation--desktop [data-product-section-link][aria-current]').hash`),'#status');
 }
 const a={...results[0].state},b={...results[1].state};delete a.natural;delete b.natural;assert.deepEqual(a,b,'Only image source/natural dimensions may differ');
 await writeFile(new URL('comparison-results.json',output),JSON.stringify({browser,viewport:{width:1440,height:900,deviceScaleFactor:1,theme:'dark'},reference,results,equivalent:true},null,2)+'\n');console.log('Both variants rendered with identical layout, text, wordmark and overlay');
}finally{
 try{await navigate('/projects/pg27/');const original=JSON.parse(await readFile(new URL('browser-baseline.json',output),'utf8'));const restored=await evaluate(`({hero:document.querySelector('#overview').outerHTML,status:document.querySelector('#status').outerHTML,sidebar:[...document.querySelectorAll('[data-product-sidebar]')].map(e=>e.outerHTML),canonical:document.querySelector('link[rel=canonical]').href,previewPresent:!!document.querySelector('#pg27-local-preview-style,.pg27-hero-preview')})`);assert.equal(restored.previewPresent,false);const {previewPresent,...page}=restored;assert.deepEqual(page,original);await writeFile(new URL('restoration.json',output),JSON.stringify({restored:true,previewPresent,canonical:restored.canonical},null,2)+'\n');console.log('Original canonical page restored by reload');}finally{socket.close();}
}
