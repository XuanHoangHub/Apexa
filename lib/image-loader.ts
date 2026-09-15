import type { ImageLoaderProps } from 'next/image';

const localWidths = [384, 640, 960, 1536];

export default function imageLoader({ src, width, quality }: ImageLoaderProps) {
  if (src.startsWith('/')) {
    if (src === '/frame-chrome.png') {
      const size = localWidths.find((size) => size >= width) ?? 1536;
      return `/media/frame-chrome-${size}.webp`;
    }
    return src;
  }
  try {
    const url = new URL(src);
    if (url.protocol === 'https:' && url.hostname === 'images.unsplash.com') {
      url.searchParams.set('auto', 'format');
      url.searchParams.set('fit', 'crop');
      url.searchParams.set('w', String(width));
      url.searchParams.set('q', String(quality ?? 75));
      return url.toString();
    }
    return src;
  } catch {
    return src;
  }
}
