import sharp from 'sharp';
import { mkdir, stat } from 'node:fs/promises';

await mkdir('public/media', { recursive: true });
const original = await stat('public/frame-chrome.png');
for (const width of [384, 640, 960, 1536]) {
  const target = `public/media/frame-chrome-${width}.webp`;
  await sharp('public/frame-chrome.png')
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 82, effort: 6 })
    .toFile(target);
  console.log(
    `${width}px: ${(await stat(target)).size} bytes (original: ${original.size})`,
  );
}
