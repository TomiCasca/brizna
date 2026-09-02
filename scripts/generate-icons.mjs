import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'icons');
mkdirSync(outDir, { recursive: true });

// Isotipo "Brizna": un solo trazo curvo + un punto, en blanco sobre azul.
const markSvg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#2563eb"/>
  <path d="M32 72 C37 46 55 28 74 23" fill="none" stroke="#ffffff" stroke-width="9" stroke-linecap="round"/>
  <circle cx="32" cy="72" r="6.5" fill="#ffffff"/>
</svg>`;

const targets = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 }
];

for (const { name, size } of targets) {
  await sharp(Buffer.from(markSvg(size)))
    .resize(size, size)
    .png()
    .toFile(join(outDir, name));
  console.log(`generated ${name}`);
}
