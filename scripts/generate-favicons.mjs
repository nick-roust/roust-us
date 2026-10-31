import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const master = join(root, 'brand/master/roust-monogram-icon.svg');
const publicDir = join(root, 'public');
const reviewDir = join(root, 'design/references');
const temporaryDir = mkdtempSync(join(tmpdir(), 'roust-favicon-'));

try {
  mkdirSync(publicDir, { recursive: true });
  mkdirSync(reviewDir, { recursive: true });
  copyFileSync(master, join(publicDir, 'favicon.svg'));

  for (const size of [16, 32, 48, 180, 192, 512]) {
    execFileSync('inkscape', [master, `--export-filename=${join(temporaryDir, `icon-${size}.png`)}`, `--export-width=${size}`, `--export-height=${size}`], {
      env: { ...process.env, XDG_CONFIG_HOME: temporaryDir, XDG_CACHE_HOME: temporaryDir },
      stdio: 'inherit',
    });
  }

  execFileSync('magick', [
    join(temporaryDir, 'icon-16.png'),
    join(temporaryDir, 'icon-32.png'),
    join(temporaryDir, 'icon-48.png'),
    join(publicDir, 'favicon.ico'),
  ], { stdio: 'inherit' });

  copyFileSync(join(temporaryDir, 'icon-180.png'), join(publicDir, 'apple-touch-icon.png'));
  copyFileSync(join(temporaryDir, 'icon-192.png'), join(publicDir, 'icon-192.png'));
  copyFileSync(join(temporaryDir, 'icon-512.png'), join(publicDir, 'icon-512.png'));

  const reviewPanels = [];
  for (const surface of [
    { name: 'light', background: '#f3f2ee', foreground: '#15212b' },
    { name: 'dark', background: '#0b1219', foreground: '#edf2f4' },
  ]) {
    for (const [size, zoom] of [[16, 24], [32, 12], [48, 8]]) {
      const output = join(temporaryDir, `review-${surface.name}-${size}.png`);
      const native = join(temporaryDir, `icon-${size}.png`);
      copyFileSync(native, join(reviewDir, `favicon-core-dark-${size}.png`));
      execFileSync('magick', [
        '-size', '480x460', `xc:${surface.background}`,
        '(', native, '-filter', 'point', '-resize', '384x384', ')',
        '-gravity', 'center', '-geometry', '+0+18', '-composite',
        '-gravity', 'north', '-font', 'DejaVu-Sans', '-pointsize', '18',
        '-fill', surface.foreground, '-annotate', '+0+12', `${size}x${size} px · ${zoom}x nearest-neighbor`,
        output,
      ], { stdio: 'inherit' });
      reviewPanels.push(output);
    }
  }

  execFileSync('magick', [
    'montage', ...reviewPanels,
    '-tile', '3x2',
    '-geometry', '+0+0',
    join(reviewDir, 'favicon-production-review.png'),
  ], { stdio: 'inherit' });
} finally {
  rmSync(temporaryDir, { recursive: true, force: true });
}
