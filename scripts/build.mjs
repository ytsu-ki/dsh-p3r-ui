import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const runtimeSrcPath = resolve(rootDir, 'src', 'skin-runtime.js');
const distDir = resolve(rootDir, 'dist');
const distOutPath = resolve(distDir, 'p3r-skin.js');

const bundled = readFileSync(runtimeSrcPath, 'utf8');

if (/<\/script/i.test(bundled)) {
  throw new Error('Built bundle must not contain </script tag');
}

mkdirSync(distDir, { recursive: true });
writeFileSync(distOutPath, bundled, 'utf8');
console.log(`Built ${distOutPath} (${(bundled.length / 1024).toFixed(1)} KB)`);
