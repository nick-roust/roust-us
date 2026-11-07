import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';

const output = new URL('./', import.meta.url);
const target = await (await fetch('http://127.0.0.1:9435/json/new?about:blank', { method: 'PUT' })).json();
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
const articles = [
  ['when-code-stopped-being-the-main-thing', 'scenario-road.webp'],
  ['registry-and-configuration-authority', 'platform-node-bridge.webp'],
  ['platform-node-integration', 'platform-node-bridge-construction.webp'],
  ['we-built-all-the-pieces', 'first-payment-tunnel.webp'],
  ['307-hours-for-one-invoice', 'invoice-hidden-foundation-hydroelectric-hall.webp'],
];
const targets = new Set(['platform-node-integration', '307-hours-for-one-invoice']);
const baseline = JSON.parse(await readFile(new URL('article-baseline.json', output), 'utf8'));
const results = [];
try {
  await cdp('Page.enable');
  await cdp('Runtime.enable');
  await cdp('Page.addScriptToEvaluateOnNewDocument', { source: `window.heroCLS = 0; new PerformanceObserver(list => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.heroCLS += entry.value; }).observe({ type: 'layout-shift', buffered: true });` });
  for (const width of [1440, 390]) {
    await cdp('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width === 390 });
    for (const theme of ['light', 'dark']) {
      await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: theme }] });
      for (const [slug, image] of articles) {
        if (!targets.has(slug) && (width !== 1440 || theme !== 'light')) continue;
        const url = `http://localhost:4321/journal/${slug}/`;
        assert.equal((await fetch(url)).status, 200);
        await cdp('Page.navigate', { url });
        for (let attempt = 0; attempt < 100; attempt++) {
          if (await evaluate(`location.pathname === '/journal/${slug}/' && document.readyState === 'complete' && !!document.querySelector('.journal-entry__hero-image')`)) break;
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        await evaluate(`(async () => {
          await document.fonts.ready;
          await document.querySelector('.journal-entry__hero-image').decode();
          document.activeElement?.blur();
          document.querySelector('astro-dev-toolbar')?.remove();
          scrollTo({ top: 0, behavior: 'instant' });
          await new Promise(resolve => setTimeout(resolve, 150));
        })()`);
        const state = await evaluate(`(() => {
          const image = document.querySelector('.journal-entry__hero-image');
          const hero = document.querySelector('.journal-entry__hero');
          const title = hero.querySelector('h1');
          const rect = el => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height, bottom: r.bottom }; };
          return {
            image: { src: image.getAttribute('src'), naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight, complete: image.complete, objectFit: getComputedStyle(image).objectFit, objectPosition: getComputedStyle(image).objectPosition, ...rect(image) },
            hero: rect(hero), title: { text: title.textContent, color: getComputedStyle(title).color, ...rect(title) },
            date: document.querySelector('.journal-entry__date').textContent,
            body: rect(document.querySelector('.journal-entry__body')),
            h1Count: document.querySelectorAll('h1').length,
            overflow: document.documentElement.scrollWidth > innerWidth,
            layoutShift: window.heroCLS,
          };
        })()`);
        const original = baseline[`src/content/journal/${slug}.md`].metadata;
        assert.equal(state.title.text, original.title);
        assert.equal(state.date, original.displayDate);
        assert.equal(state.h1Count, 1);
        assert.equal(state.overflow, false);
        assert.equal(state.image.src, '/images/journal/' + image);
        assert.equal(state.image.complete, true);
        assert.equal(state.image.objectFit, 'cover');
        assert.ok(state.image.naturalWidth > 0);
        assert.ok(state.title.bottom < state.hero.bottom);
        assert.ok(state.body.y >= state.hero.bottom);
        assert.ok(state.layoutShift < 0.01);
        if (targets.has(slug)) {
          assert.equal(state.image.naturalWidth, 1774);
          assert.equal(state.image.naturalHeight, 887);
          if ((width === 1440 && theme === 'light') || (width === 390 && theme === 'dark')) {
            const name = slug === '307-hours-for-one-invoice' ? 'invoice' : 'protocol';
            const screenshot = await cdp('Page.captureScreenshot', { format: 'png' });
            await writeFile(new URL(`${name}-${width === 1440 ? 'desktop' : 'mobile'}.png`, output), Buffer.from(screenshot.data, 'base64'));
          }
        }
        if (width === 1440 && theme === 'light') {
          const tile = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width, height: state.hero.height, scale: 1 } });
          await writeFile(new URL(`contact-${slug}.png`, output), Buffer.from(tile.data, 'base64'));
        }
        results.push({ slug, width, theme, status: 200, ...state });
        console.log(`PASS ${slug}: ${width}/${theme}, hero ${state.hero.width} × ${state.hero.height}px; CLS ${state.layoutShift}`);
      }
    }
  }
  await writeFile(new URL('browser-results.json', output), JSON.stringify({ status: 'PASS', checks: results }, null, 2) + '\n');
} finally {
  await cdp('Page.close').catch(() => {});
  socket.close();
}
