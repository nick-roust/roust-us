import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';

const phase = process.argv[2];
assert.ok(['before', 'after'].includes(phase));
const output = new URL('./', import.meta.url);
const target = await (await fetch('http://127.0.0.1:9434/json/new?about:blank', { method: 'PUT' })).json();
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
const results = [];
try {
  await cdp('Page.enable');
  await cdp('Runtime.enable');
  for (const width of [1440, 390]) {
    await cdp('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width === 390 });
    for (const theme of ['light', 'dark']) {
      await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: theme }] });
      await cdp('Page.navigate', { url: 'http://localhost:4321/' });
      for (let attempt = 0; attempt < 100; attempt++) {
        if (await evaluate(`document.readyState === 'complete' && !!document.querySelector('.site-footer')`)) break;
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      await evaluate(`(async () => {
        document.querySelector('.site-footer').scrollIntoView({ behavior: 'instant', block: 'end' });
        await document.querySelector('.site-footer__brand img').decode();
        await new Promise(resolve => setTimeout(resolve, 100));
        document.activeElement?.blur();
        document.querySelector('astro-dev-toolbar')?.remove();
      })()`);
      const state = await evaluate(`(() => {
        const rect = el => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y + scrollY, width: r.width, height: r.height }; };
        const link = document.querySelector('.site-footer__brand');
        const img = link.querySelector('img');
        return {
          overflow: document.documentElement.scrollWidth > innerWidth,
          background: getComputedStyle(document.querySelector('.site-footer')).backgroundColor,
          logo: { ...rect(img), src: img.getAttribute('src'), loaded: img.complete && img.naturalWidth > 0 },
          accessibleName: link.getAttribute('aria-label'), imageAlt: img.alt,
          layout: [...document.querySelectorAll('main section, .professional-identity, .site-footer, .site-footer__inner, .site-footer__inner > *')].map(el => ({ class: el.className, ...rect(el) })),
          copy: document.querySelector('.site-footer').innerText,
          centerOffset: rect(link).x + rect(link).width / 2 - document.documentElement.clientWidth / 2,
        };
      })()`);
      state.width = width;
      state.theme = theme;
      assert.equal(state.overflow, false);
      assert.equal(state.logo.loaded, true);
      assert.equal(state.logo.width, width === 1440 ? 48 : 40);
      assert.equal(state.logo.height, state.logo.width);
      assert.ok(Math.abs(state.centerOffset) < 0.1);
      assert.equal(state.accessibleName, 'ROUST.US home');
      assert.equal(state.imageAlt, '');
      if (phase === 'after') {
        const before = JSON.parse(await readFile(new URL('before.json', output), 'utf8')).find(item => item.width === width && item.theme === theme);
        assert.deepEqual(state.layout, before.layout);
        assert.equal(state.copy, before.copy);
        assert.equal(state.background, before.background);
        assert.equal(state.logo.src, '/brand/roust-monogram-muted.svg');
        const footer = state.layout.find(item => item.class === 'site-footer');
        const screenshot = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: footer.y - 350, width, height: footer.height + 350, scale: 1 } });
        await writeFile(new URL(`footer-${width}-${theme}.png`, output), Buffer.from(screenshot.data, 'base64'));
      }
      results.push(state);
      console.log(`${phase}: ${width}/${theme}; logo ${state.logo.width} × ${state.logo.height}px; centered; footer ${state.background}`);
    }
  }
  await writeFile(new URL(`${phase}.json`, output), JSON.stringify(results, null, 2) + '\n');
} finally {
  await cdp('Page.close').catch(() => {});
  socket.close();
}
