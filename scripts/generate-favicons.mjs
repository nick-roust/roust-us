import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const master = join(root, 'brand/master/roust-monogram-color.svg');
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

  execFileSync('magick', [
    'montage',
    '-filter', 'point',
    '-label', '16 px', join(temporaryDir, 'icon-16.png'),
    '-label', '32 px', join(temporaryDir, 'icon-32.png'),
    '-label', '48 px', join(temporaryDir, 'icon-48.png'),
    '-background', '#f3f2ee',
    '-fill', '#15212b',
    '-font', 'DejaVu-Sans',
    '-pointsize', '18',
    '-gravity', 'center',
    '-tile', '3x1',
    '-geometry', '128x128+28+20',
    join(reviewDir, 'favicon-production-review.png'),
  ], { stdio: 'inherit' });
} finally {
  rmSync(temporaryDir, { recursive: true, force: true });
}
