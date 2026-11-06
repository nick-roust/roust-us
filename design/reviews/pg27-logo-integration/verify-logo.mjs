import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';

const phase = process.argv[2];
assert.ok(['before', 'after'].includes(phase));
const output = new URL('./', import.meta.url);
const target = await (await fetch('http://127.0.0.1:9433/json/new?about:blank', { method: 'PUT' })).json();
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
  await cdp('Accessibility.enable');
  for (const width of [1440, 768, 390]) {
    await cdp('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width === 390 });
    for (const theme of ['light', 'dark']) {
      await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: theme }, { name: 'prefers-reduced-motion', value: 'reduce' }] });
      await cdp('Page.navigate', { url: 'http://localhost:4321/' });
      for (let attempt = 0; attempt < 100; attempt++) {
        if (await evaluate(`location.pathname === '/' && document.readyState === 'complete' && !!document.querySelector('#building-title')`)) break;
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      await evaluate(`(async () => {
        document.querySelector('#building').scrollIntoView({behavior: 'instant', block: 'start'});
        await Promise.race([document.fonts.ready, new Promise(resolve => setTimeout(resolve, 3000))]);
        await Promise.race([Promise.all([...document.querySelectorAll('#building img')].map(img => img.decode().catch(() => {}))), new Promise(resolve => setTimeout(resolve, 5000))]);
        await new Promise(resolve => setTimeout(resolve, 150));
      })()`);
      const state = await evaluate(`(() => {
        const rect = el => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y + scrollY, width: r.width, height: r.height }; };
        const heading = document.querySelector('#building-title');
        const style = getComputedStyle(heading);
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = style.font;
        const metrics = context.measureText('PG27');
        const logo = heading.querySelector('img');
        return {
          viewport: innerWidth, theme: matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
          overflow: document.documentElement.scrollWidth > innerWidth,
          heading: rect(heading), fontSize: style.fontSize, lineHeight: style.lineHeight,
          textInkHeight: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent,
          textAscent: metrics.actualBoundingBoxAscent, textDescent: metrics.actualBoundingBoxDescent,
          logo: logo ? { ...rect(logo), loaded: logo.complete && logo.naturalWidth > 0, alt: logo.alt, src: logo.getAttribute('src'), ratio: logo.naturalWidth / logo.naturalHeight } : null,
          layout: [...document.querySelectorAll('main section, #building .building-section__inner, #building .building-section__copy, #building .building-section__subheading, #building .building-section__description, #building .building-counter, #building .building-section__link, #building .building-panel')].map(el => ({ tag: el.tagName, class: el.className, ...rect(el) })),
          copy: [...document.querySelectorAll('#building .eyebrow, #building .building-section__subheading, #building .building-section__description, #building .building-counter, #building .building-section__link, #building .building-panel')].map(el => el.textContent.replace(/\\s+/g, ' ').trim()),
        };
      })()`);
      state.width = width;
      state.theme = theme;
      assert.equal(state.overflow, false);
      if (phase === 'after') {
        assert.equal(state.logo.loaded, true);
        assert.equal(state.logo.alt, '');
        assert.ok(Math.abs(state.logo.width / state.logo.height - 256 / 59) < 0.01);
        const { nodes } = await cdp('Accessibility.getFullAXTree');
        const heading = nodes.filter(node => !node.ignored && node.role?.value === 'heading' && node.name?.value === 'PG27');
        assert.equal(heading.length, 1);
        assert.equal(heading[0].properties.find(property => property.name === 'level').value.value, 2);
        assert.equal(nodes.filter(node => !node.ignored && node.role?.value === 'image' && node.name?.value === 'PG27').length, 0);
        state.accessibility = { role: heading[0].role.value, name: heading[0].name.value, level: 2 };
        const before = JSON.parse(await readFile(new URL('before.json', output), 'utf8')).find(item => item.width === width && item.theme === theme);
        assert.deepEqual(state.layout, before.layout, `${width}/${theme}: section or surrounding layout changed`);
        assert.deepEqual(state.heading, before.heading, `${width}/${theme}: heading line box changed`);
        const withoutDevLocations = values => values.map(value => value.replace(/ data-astro-source-loc="[^"]*"/g, ''));
        assert.deepEqual(withoutDevLocations(state.copy), withoutDevLocations(before.copy), `${width}/${theme}: copy changed`);
        state.originalTextInkHeight = before.textInkHeight;
        assert.ok(Math.abs(state.logo.height - before.textInkHeight) < 1.5, `${width}: perceived height changed`);
        if ((width === 1440 && theme === 'light') || (width === 390 && theme === 'dark')) {
          await evaluate(`document.activeElement?.blur(); document.querySelector('astro-dev-toolbar')?.remove()`);
          assert.equal(await evaluate(`document.querySelector('.skip-link').matches(':focus')`), false);
          const building = state.layout.find(item => item.tag === 'SECTION' && item.class === 'building-section');
          const screenshot = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: Math.max(0, building.y - 40), width, height: building.height + 80, scale: 1 } });
          await writeFile(new URL(width === 1440 ? 'desktop-1440-light.png' : 'mobile-390-dark.png', output), Buffer.from(screenshot.data, 'base64'));
        }
      }
      results.push(state);
      console.log(`${phase}: ${width}/${theme}, text ink ${state.textInkHeight}px${state.logo ? ', logo ' + state.logo.width.toFixed(2) + ' × ' + state.logo.height.toFixed(2) + 'px' : ''}`);
    }
  }
  await writeFile(new URL(`${phase}.json`, output), JSON.stringify(results, null, 2) + '\n');
} finally {
  await cdp('Page.close').catch(() => {});
  socket.close();
}
