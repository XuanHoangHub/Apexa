import {
  Image as ImageIcon,
  Film,
  Clapperboard,
  WandSparkles,
  AudioLines,
} from 'lucide-react';

export type View =
  | 'explore'
  | 'image'
  | 'video'
  | 'audio'
  | 'edit'
  | 'cinema'
  | 'marketing'
  | 'canvas'
  | 'presets'
  | 'library'
  | 'saved'
  | 'get';
export type Work = {
  id: string;
  title: string;
  image: string;
  category: string;
  prompt: string;
  author: string;
  source?: string;
};
export type Draft = {
  id: string;
  title: string;
  prompt: string;
  mode: View;
  model: string;
  ratio: string;
  created: string;
  scenes?: { id: string; text: string }[];
  motion?: string;
  duration?: string;
  brand?: string;
};
export const hero = '/frame-chrome.png';
export const works: Work[] = [
  {
    id: 'red',
    title: 'After hours',
    image:
      'https://images.unsplash.com/photo-1742163512400-7af30b2d17cc?auto=format&fit=crop&w=900&q=85',
    category: 'Portrait',
    author: 'Jay Soundo · Unsplash',
    source: 'https://unsplash.com/photos/0KS30qLnM_8',
    prompt:
      'An editorial portrait illuminated by deep red light, rich shadows, subtle grain, cinematic close-up, fashion photography.',
  },
  {
    id: 'dune',
    title: 'The quiet between',
    image:
      'https://images.unsplash.com/photo-1564107628966-daff03746bee?auto=format&fit=crop&w=900&q=85',
    category: 'Nature',
    author: 'Martin Sanchez · Unsplash',
    source: 'https://unsplash.com/photos/rFh890jKgcs',
    prompt:
      'Aerial view of sculptural desert dunes, soft evening light, sweeping curves, warm terracotta tones, cinematic wide shot.',
  },
  {
    id: 'building',
    title: 'Future, by design',
    image:
      'https://images.unsplash.com/photo-1515986503437-c617811ba008?auto=format&fit=crop&w=900&q=85',
    category: 'Architecture',
    author: 'Road Trip with Raj · Unsplash',
    source: 'https://unsplash.com/photos/xrCNPGLk1wk',
    prompt:
      'Sculptural futuristic architecture at twilight, sweeping white curves, deep blue sky, minimalist composition, architectural photography.',
  },
  {
    id: 'flower',
    title: 'A different kind of bloom',
    image:
      'https://images.unsplash.com/photo-1746126087099-e3e743d42f70?auto=format&fit=crop&w=900&q=85',
    category: 'Nature',
    author: 'Dmytro Koplyk · Unsplash',
    source: 'https://unsplash.com/photos/mA2BYYaFVRU',
    prompt:
      'A vivid purple flower against pure black, macro photography, delicate translucent petals, dramatic studio lighting.',
  },
  {
    id: 'chrome',
    title: 'Beyond the ordinary',
    image: hero,
    category: 'Abstract',
    author: 'Apexa Originals',
    prompt:
      'A liquid chrome sculpture suspended above volcanic sand at sunset, surreal cinematic lighting, dramatic reflections, 35mm film.',
  },
  {
    id: 'car',
    title: 'Chasing the light',
    image:
      'https://images.unsplash.com/photo-1683916136420-f0981b6dd5dd?auto=format&fit=crop&w=900&q=85',
    category: 'Product',
    author: 'noir. · Unsplash',
    source: 'https://unsplash.com/photos/3vz86OsQcKY',
    prompt:
      'A red sports car driving through a tunnel, dramatic light trails, cinematic motion blur, low camera angle, high contrast.',
  },
];
export const modes = [
  {
    id: 'image' as View,
    name: 'Image Generation',
    sub: 'Turn ideas into imagery',
    icon: ImageIcon,
  },
  {
    id: 'video' as View,
    name: 'Video Generation',
    sub: 'Frames into motion',
    icon: Film,
  },
  {
    id: 'cinema' as View,
    name: 'Cinema Studio',
    sub: 'Direct your visual story',
    icon: Clapperboard,
  },
  {
    id: 'edit' as View,
    name: 'Image Editor',
    sub: 'Refine every detail',
    icon: WandSparkles,
  },
  {
    id: 'audio' as View,
    name: 'Audio & Voice',
    sub: 'Give voice to your concepts',
    icon: AudioLines,
  },
];
export const labels: Record<View, string> = {
  explore: 'Explore',
  image: 'Image Generation',
  video: 'Video Generation',
  audio: 'Audio & Voice',
  edit: 'Image Editor',
  cinema: 'Cinema Studio',
  marketing: 'Brand Studio',
  canvas: 'Canvas',
  presets: 'Motion Presets',
  library: 'My Library',
  saved: 'Saved',
  get: 'Get Media Downloader',
};
/** Short labels used in the compact header nav bar. */
export const shortLabels: Partial<Record<View, string>> = {
  cinema: 'Cinema Studio',
  marketing: 'Brand Studio',
  presets: 'Presets',
  library: 'Library',
  get: 'Get',
};
/** Navigation groups for the header bar — each group is separated by a divider. */
export const navGroups: { label?: string; views: View[] }[] = [
  { views: ['explore', 'get'] },
  { label: 'Create', views: ['image', 'video', 'audio', 'edit'] },
  { label: 'Studio', views: ['cinema', 'marketing', 'canvas', 'presets'] },
  { label: 'Content', views: ['library', 'saved'] },
];
/** Badges displayed next to nav items. */
export const badges: Partial<Record<View, string>> = {
  get: 'FAST',
  cinema: 'NEW',
};
export const sampleGetUrls = [
  {
    platform: 'YouTube',
    title: 'YouTube 4K Music Video',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    platform: 'TikTok',
    title: 'TikTok Viral Video (No Watermark)',
    url: 'https://www.tiktok.com/@scout2015/video/6718335390845095173',
  },
  {
    platform: 'Vimeo',
    title: 'Vimeo Staff Pick (The Mountain)',
    url: 'https://vimeo.com/22439234',
  },
  {
    platform: 'Pinterest',
    title: 'Pinterest Aesthetic Pin',
    url: 'https://www.pinterest.com/pin/295548794303867629/',
  },
  {
    platform: 'Facebook',
    title: 'Facebook Video Reel',
    url: 'https://www.facebook.com/watch/?v=10153231379946729',
  },
  {
    platform: 'BiliBili',
    title: 'BiliBili HD Video',
    url: 'https://www.bilibili.com/video/BV1GJ411x7h7',
  },
  {
    platform: 'Telegram',
    title: 'Telegram Video Post',
    url: 'https://t.me/telegram/123',
  },
];
export const motions = [
  'Dolly in',
  'Orbit 360°',
  'Crane up',
  'Handheld',
  'FPV fly-through',
  'Slow zoom',
];
export const categories = [
  'All',
  'Cinematic',
  'Portrait',
  'Nature',
  'Abstract',
  'Architecture',
  'Product',
];
