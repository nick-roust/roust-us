import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';

const base = 'http://localhost:4321';
const output = new URL('./', import.meta.url);
const slugs = [
  'when-code-stopped-being-the-main-thing',
  'registry-and-configuration-authority',
  'platform-node-integration',
  'we-built-all-the-pieces',
  '307-hours-for-one-invoice',
];
const legacy = ['from-scenarios-to-a-system', 'building-the-platform-node-boundary', 'the-first-completed-payment'];
const expectedHome = [slugs[0], slugs[1], slugs[3]];
const target = await (await fetch('http://127.0.0.1:9432/json/new?about:blank', { method: 'PUT' })).json();
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});
let sequence = 0;
const pending = new Map();
socket.addEventListener('message', ({ data }) => {
  const result = JSON.parse(data);
  const request = pending.get(result.id);
  if (!request) return;
  pending.delete(result.id);
  clearTimeout(request.timeout);
  if (result.error) request.reject(new Error(JSON.stringify(result.error)));
  else request.resolve(result.result);
});
function cdp(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++sequence;
    const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`Timeout: ${method}`)); }, 20000);
    pending.set(id, { resolve, reject, timeout });
    socket.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression) {
  const response = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (response.exceptionDetails) throw new Error(JSON.stringify(response.exceptionDetails));
  return response.result.value;
}
async function navigate(path) {
  await cdp('Page.navigate', { url: base + path });
  for (let attempt = 0; attempt < 100; attempt++) {
    const ready = await evaluate(`location.pathname === ${JSON.stringify(path)} && document.readyState === 'complete'`);
    if (ready) {
      await evaluate(`(async () => {
        await Promise.race([document.fonts.ready, new Promise(resolve => setTimeout(resolve, 5000))]);
        await Promise.race([Promise.all([...document.images].filter(img => img.loading !== 'lazy').map(img => img.decode().catch(() => {}))), new Promise(resolve => setTimeout(resolve, 5000))]);
        await new Promise(resolve => setTimeout(resolve, 100));
      })()`);
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error(`Page not ready: ${path}`);
}
async function screenshot(name, fullPage = false) {
  const options = { format: 'png', captureBeyondViewport: fullPage };
  if (fullPage) {
    const { cssContentSize } = await cdp('Page.getLayoutMetrics');
    options.clip = { x: 0, y: 0, width: cssContentSize.width, height: cssContentSize.height, scale: 1 };
  }
  const { data } = await cdp('Page.captureScreenshot', options);
  await writeFile(new URL(name, output), Buffer.from(data, 'base64'));
}

const results = await readFile(new URL('browser-results.json', output), 'utf8').then(JSON.parse).catch(() => ({ base, browser: 'Standalone headless Chromium; Browser plugin bootstrap unavailable', checks: [] }));
try {
  await cdp('Page.enable');
  await cdp('Runtime.enable');
  for (const slug of slugs) assert.equal((await fetch(`${base}/journal/${slug}/`)).status, 200, slug);
  for (const slug of legacy) assert.equal((await fetch(`${base}/journal/${slug}/`)).status, 404, slug);

  for (const width of [1440, 390]) {
    await cdp('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });
    for (const theme of ['light', 'dark']) {
      await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: theme }, { name: 'prefers-reduced-motion', value: 'reduce' }] });
      for (const path of ['/', '/journal/', ...slugs.map(slug => `/journal/${slug}/`)]) {
        if (results.checks.some(check => check.width === width && check.theme === theme && check.path === path)) continue;
        console.log(`Checking ${width} ${theme} ${path}`);
        await navigate(path);
        const state = await evaluate(`(() => {
          const rect = selector => { const el = document.querySelector(selector); if (!el) return null; const r = el.getBoundingClientRect(); return { top: r.top, bottom: r.bottom, width: r.width, height: r.height }; };
          return {
            overflow: document.documentElement.scrollWidth > innerWidth,
            h1: [...document.querySelectorAll('h1')].map(el => el.textContent),
            brokenImages: [...document.images].filter(img => img.complete && !img.naturalWidth).map(img => img.getAttribute('src')),
            journalImagesLoaded: [...document.querySelectorAll('.journal-story img, .journal-entry__hero-image, .journal-index-hero__image img')].every(img => img.complete && img.naturalWidth > 0),
            home: [...document.querySelectorAll('.journal-story__link')].map(el => el.getAttribute('href').split('/')[2]),
            index: [...document.querySelectorAll('.journal-timeline__content h3 a')].map(el => el.getAttribute('href').split('/')[2]),
            columns: document.querySelector('.journal-home__stories') ? getComputedStyle(document.querySelector('.journal-home__stories')).gridTemplateColumns.split(' ').length : null,
            paragraphs: document.querySelectorAll('.journal-entry__prose p').length,
            sections: document.querySelectorAll('.journal-entry__prose h2').length,
            bodyH1: document.querySelectorAll('.journal-entry__prose h1').length,
            hero: rect('.journal-entry__hero'), heading: rect('.journal-entry__hero h1'), body: rect('.journal-entry__body'),
            background: getComputedStyle(document.body).backgroundColor,
          };
        })()`);
        assert.equal(state.overflow, false, `${width} ${theme} ${path} overflow`);
        assert.equal(state.h1.length, 1, path);
        assert.deepEqual(state.brokenImages, [], path);
        assert.equal(state.journalImagesLoaded, true, path);
        if (path === '/') {
          assert.deepEqual(state.home, expectedHome);
          assert.equal(state.columns, width === 1440 ? 3 : 1);
          await evaluate(`document.querySelector('.journal-home').scrollIntoView({behavior: 'instant', block: 'start'})`);
        } else if (path === '/journal/') {
          assert.equal(state.index.length, 5);
          assert.deepEqual([...state.index].sort(), [...slugs].sort());
        } else {
          assert.equal(state.bodyH1, 0);
          assert.ok(state.paragraphs > 20, path);
          assert.ok(state.sections >= 6, path);
          assert.ok(state.heading.bottom <= state.hero.bottom, `${path} heading clips`);
          assert.ok(state.body.top >= state.hero.bottom, `${path} body overlaps header`);
          assert.equal(await evaluate(`document.querySelector('.journal-entry__footer a').getAttribute('href')`), '/journal');
        }
        const label = path === '/' ? 'home' : path === '/journal/' ? 'index' : path.split('/')[2];
        await screenshot(`${label}-${width}-${theme}.png`);
        if (width === 1440 && theme === 'light' && path !== '/') await screenshot(`${label}-full.png`, true);
        results.checks.push({ width, theme, path, ...state });
        await writeFile(new URL('browser-results.json', output), JSON.stringify(results, null, 2) + '\n');
      }
    }
  }

  await navigate('/');
  await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
  await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
  const skip = await evaluate(`({ href: document.activeElement.getAttribute('href'), outline: getComputedStyle(document.activeElement).outlineStyle })`);
  assert.equal(skip.href, '#main');
  assert.notEqual(skip.outline, 'none');
  await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
  await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
  assert.equal(await evaluate('document.activeElement.id'), 'main');
  results.skipLink = skip;
  await evaluate(`document.querySelector('.journal-story__link').focus()`);
  assert.equal(await evaluate(`getComputedStyle(document.activeElement).outlineStyle`), 'solid');
  results.cardKeyboardFocus = 'visible';
  const beforeToggle = await evaluate('getComputedStyle(document.body).backgroundColor');
  console.log('Theme before', await evaluate(`({ theme: document.documentElement.dataset.theme, label: document.querySelector('[data-theme-toggle]').getAttribute('aria-label'), background: getComputedStyle(document.body).backgroundColor })`));
  await evaluate(`document.querySelector('[data-theme-toggle]').click()`);
  await evaluate(`new Promise(resolve => setTimeout(resolve, 100))`);
  console.log('Theme after', await evaluate(`({ theme: document.documentElement.dataset.theme, label: document.querySelector('[data-theme-toggle]').getAttribute('aria-label'), background: getComputedStyle(document.body).backgroundColor })`));
  assert.notEqual(await evaluate('getComputedStyle(document.body).backgroundColor'), beforeToggle);
  results.themeToggle = 'changes rendered theme';
  results.status = 'PASS';
  await writeFile(new URL('browser-results.json', output), JSON.stringify(results, null, 2) + '\n');
  console.log(`PASS: ${results.checks.length} page/viewport/theme checks, five 200s, three legacy 404s, keyboard focus and theme toggle.`);
} finally {
  await cdp('Page.close').catch(() => {});
  socket.close();
}
