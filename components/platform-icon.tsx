import React from 'react';
import type { PlatformType } from '@/app/api/get/route';
import { Sparkles } from 'lucide-react';

interface Props {
  id: PlatformType | 'auto';
  size?: number;
  className?: string;
}

export function PlatformBrandIcon({ id, size = 18, className = '' }: Props) {
  const px = `${size}px`;

  switch (id) {
    case 'youtube':
      return (
        <svg
          viewBox="0 0 24 24"
          width={px}
          height={px}
          fill="none"
          className={`platform-svg-icon youtube-icon ${className}`}
          aria-label="YouTube"
        >
          <path
            d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
            fill="#FF0000"
          />
          <polygon points="9.6,15.6 15.8,12 9.6,8.4" fill="#FFFFFF" />
        </svg>
      );

    case 'tiktok':
      return (
        <svg
          viewBox="0 0 24 24"
          width={px}
          height={px}
          className={`platform-svg-icon tiktok-icon ${className}`}
          aria-label="TikTok"
        >
          <rect width="22" height="22" x="1" y="1" rx="5.5" fill="#000000" />
          <path
            d="M16.8 7.3A4.5 4.5 0 0 1 13.5 3.8v-.5h-2.9v10.5a2.4 2.4 0 1 1-1.7-2.3V8.8a5.3 5.3 0 1 0 4.6 5.2V8.4a7.1 7.1 0 0 0 3.3 1.4V7.3z"
            fill="#00F2FE"
            transform="translate(-0.5, -0.4)"
          />
          <path
            d="M16.8 7.3A4.5 4.5 0 0 1 13.5 3.8v-.5h-2.9v10.5a2.4 2.4 0 1 1-1.7-2.3V8.8a5.3 5.3 0 1 0 4.6 5.2V8.4a7.1 7.1 0 0 0 3.3 1.4V7.3z"
            fill="#FE2C55"
            transform="translate(0.5, 0.4)"
          />
          <path
            d="M16.8 7.3A4.5 4.5 0 0 1 13.5 3.8v-.5h-2.9v10.5a2.4 2.4 0 1 1-1.7-2.3V8.8a5.3 5.3 0 1 0 4.6 5.2V8.4a7.1 7.1 0 0 0 3.3 1.4V7.3z"
            fill="#FFFFFF"
          />
        </svg>
      );

    case 'facebook':
      return (
        <svg
          viewBox="0 0 24 24"
          width={px}
          height={px}
          className={`platform-svg-icon facebook-icon ${className}`}
          aria-label="Facebook"
        >
          <circle cx="12" cy="12" r="11" fill="#1877F2" />
          <path
            d="M14.5 12h-2v7h-3v-7H8v-2.5h1.5V7.8c0-2 1.2-3.3 3.3-3.3H15v2.7h-1.4c-.9 0-1.1.4-1.1 1.1V9.5h2.5L14.5 12z"
            fill="#FFFFFF"
          />
        </svg>
      );

    case 'instagram':
      return (
        <svg
          viewBox="0 0 24 24"
          width={px}
          height={px}
          className={`platform-svg-icon instagram-icon ${className}`}
          aria-label="Instagram"
        >
          <defs>
            <linearGradient
              id="ig-grad-icon"
              x1="0%"
              y1="100%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#fdf497" />
              <stop offset="10%" stopColor="#fdf497" />
              <stop offset="45%" stopColor="#fd5949" />
              <stop offset="65%" stopColor="#d6249f" />
              <stop offset="100%" stopColor="#285AEB" />
            </linearGradient>
          </defs>
          <rect
            width="22"
            height="22"
            x="1"
            y="1"
            rx="6"
            fill="url(#ig-grad-icon)"
          />
          <rect
            x="5"
            y="5"
            width="14"
            height="14"
            rx="4"
            stroke="#FFFFFF"
            strokeWidth="1.6"
            fill="none"
          />
          <circle
            cx="12"
            cy="12"
            r="3.4"
            stroke="#FFFFFF"
            strokeWidth="1.6"
            fill="none"
          />
          <circle cx="15.8" cy="8.2" r="0.9" fill="#FFFFFF" />
        </svg>
      );

    case 'twitter':
      return (
        <svg
          viewBox="0 0 24 24"
          width={px}
          height={px}
          className={`platform-svg-icon x-icon ${className}`}
          aria-label="X (Twitter)"
        >
          <rect width="22" height="22" x="1" y="1" rx="5.5" fill="#000000" />
          <path
            d="M16.5 5.5h2.3l-5 5.7 5.9 7.8H15l-3.6-4.7-4.2 4.7H4.9l5.3-6.1L4.5 5.5h4.8l3.3 4.3 3.9-4.3zm-.8 12.1h1.3L8.3 6.8H6.9l8.8 10.8z"
            fill="#FFFFFF"
          />
        </svg>
      );

    case 'vimeo':
      return (
        <svg
          viewBox="0 0 24 24"
          width={px}
          height={px}
          className={`platform-svg-icon vimeo-icon ${className}`}
          aria-label="Vimeo"
        >
          <rect width="22" height="22" x="1" y="1" rx="5.5" fill="#1AB7EA" />
          <path
            d="M18.5 8c-.1 1.8-1.3 4.2-3.6 7.3-2.3 3.1-4.3 4.7-6 4.7-1 0-1.9-1-2.6-2.9-.5-1.7-.9-3.5-1.4-5.2-.5-1.7-1-2.7-1.6-2.7-.1 0-.6.4-1.2 1L1 9c1-.9 2-1.8 3.1-2.6 1.5-1.3 2.5-2 3.3-2 1.8 0 2.9 1.2 3.2 3.8.4 2.7.6 4.5.8 5.1.5 2.1 1.1 3.2 1.8 3.2.5 0 1.2-.8 2.1-2.5.9-1.6 1.3-2.8 1.4-3.6.2-1.2-.3-1.8-1.5-1.8-.5 0-1.1.1-1.8.3 1.1-3.7 3.2-5.4 6.3-5.3 2.4.1 3.4 1.5 3.2 4.4z"
            fill="#FFFFFF"
          />
        </svg>
      );

    case 'twitch':
      return (
        <svg
          viewBox="0 0 24 24"
          width={px}
          height={px}
          className={`platform-svg-icon twitch-icon ${className}`}
          aria-label="Twitch"
        >
          <rect width="22" height="22" x="1" y="1" rx="5.5" fill="#9146FF" />
          <path
            d="M5 4.5h14v10L15.5 18H12l-2.5 2.5H7V18H5V4.5zm12.5 9V6H6.5v9h3v2l2-2h3.5l2.5-1.5zM10.5 8.5h1.5v3h-1.5v-3zm4 0H16v3h-1.5v-3z"
            fill="#FFFFFF"
          />
        </svg>
      );

    case 'bilibili':
      return (
        <svg
          viewBox="0 0 24 24"
          width={px}
          height={px}
          className={`platform-svg-icon bilibili-icon ${className}`}
          aria-label="BiliBili"
        >
          <rect width="22" height="22" x="1" y="1" rx="5.5" fill="#23ADE5" />
          <path
            d="M7.2 4.8l1.8 1.8h6l1.8-1.8c.3-.3.8-.3 1.1 0 .3.3.3.8 0 1.1L16.8 7H18c1 0 1.8.8 1.8 1.8v7.8c0 1-.8 1.8-1.8 1.8H6c-1 0-1.8-.8-1.8-1.8V8.8c0-1 .8-1.8 1.8-1.8h1.2L6.1 5.9c-.3-.3-.3-.8 0-1.1.3-.3.8-.3 1.1 0zM5.8 8.8v7.8c0 .2.2.4.4.4h11.6c.2 0 .4-.2.4-.4V8.8c0-.2-.2-.4-.4-.4H6.2c-.2 0-.4.2-.4.4zm3.2 2.6a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm6 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"
            fill="#FFFFFF"
          />
        </svg>
      );

    case 'pinterest':
      return (
        <svg
          viewBox="0 0 24 24"
          width={px}
          height={px}
          className={`platform-svg-icon pinterest-icon ${className}`}
          aria-label="Pinterest"
        >
          <circle cx="12" cy="12" r="11" fill="#E60023" />
          <path
            d="M12 4.5A7.5 7.5 0 0 0 9.3 19c-.1-.6-.2-1.6 0-2.3l1.3-5.5s-.3-.7-.3-1.7c0-1.6 1-2.8 2.1-2.8 1 0 1.4.7 1.4 1.6 0 1-.6 2.4-.9 3.7-.3 1.1.6 2 1.7 2 2 0 3.5-2.5 3.5-5.6 0-2.3-1.6-4-4.4-4-3.2 0-5.2 2.4-5.2 5.1 0 .9.3 1.9.8 2.5.1.1.1.2.1.3l-.3 1.2c0 .2-.2.3-.4.2-1.2-.5-1.8-2-1.8-3.3 0-2.5 2.1-5.5 6.3-5.5 3.3 0 5.6 2.4 5.6 5.1 0 3.5-1.9 6-4.8 6-.9 0-1.8-.5-2.1-1.1l-.6 2.2c-.3 1-.9 2-1.4 2.8A7.5 7.5 0 1 0 12 4.5z"
            fill="#FFFFFF"
          />
        </svg>
      );

    case 'weibo':
      return (
        <svg
          viewBox="0 0 24 24"
          width={px}
          height={px}
          className={`platform-svg-icon weibo-icon ${className}`}
          aria-label="Weibo"
        >
          <rect width="22" height="22" x="1" y="1" rx="5.5" fill="#E6162D" />
          <path
            d="M10.2 16.5c-3.4.4-6.3-1.2-6.5-3.6-.2-2.3 2.4-4.5 5.8-4.8 3.4-.4 6.3 1.2 6.5 3.6.2 2.4-2.4 4.5-5.8 4.8zm-1-5.2c-1.6.2-2.8 1.4-2.7 2.7.1 1.3 1.5 2.1 3.2 1.9 1.6-.2 2.8-1.4 2.7-2.7-.1-1.3-1.6-2.1-3.2-1.9zm7.6-2.2c-.3-.1-.5-.2-.5-.4.1-.4.2-.7.1-1.1-.2-1.1-1.1-1.7-2.2-1.6-.4.1-.6.2-.9.4-.3.2-.5.1-.6-.1-.1-.3 0-.5.3-.6.4-.3.9-.5 1.5-.6 1.6-.3 3 .6 3.3 2.2.1.6 0 1.1-.2 1.6-.1.3-.5.4-.8.2zm2.4-.6c-.3-.2-.5-.5-.4-.7.4-1.2.3-2.4-.3-3.5-1.1-1.9-3.3-2.9-5.5-2.5-.4.1-.7.1-1.1.3-.4.1-.7-.1-.8-.5-.1-.4.1-.7.5-.8.5-.2.9-.3 1.5-.4 2.6-.5 5.4.7 6.7 3.1.6 1.3.8 2.8.4 4.1-.1.4-.5.5-.9.4z"
            fill="#FFFFFF"
          />
        </svg>
      );

    case 'vk':
      return (
        <svg
          viewBox="0 0 24 24"
          width={px}
          height={px}
          className={`platform-svg-icon vk-icon ${className}`}
          aria-label="VKontakte"
        >
          <rect width="22" height="22" x="1" y="1" rx="5.5" fill="#4C75A3" />
          <path
            d="M13.2 15.5c-4.3 0-6.7-2.9-6.8-7.8h2.1c.1 3.6 1.6 5.1 2.9 5.4V7.7h2v3.1c1.2-.1 2.5-1.5 2.9-3.1h2c-.3 1.9-1.7 3.3-2.7 3.9 1 .5 2.6 1.7 3.1 3.9h-2.2c-.4-1.4-1.5-2.4-3-2.6v2.6h-.3z"
            fill="#FFFFFF"
          />
        </svg>
      );

    case 'linkedin':
      return (
        <svg
          viewBox="0 0 24 24"
          width={px}
          height={px}
          className={`platform-svg-icon linkedin-icon ${className}`}
          aria-label="LinkedIn"
        >
          <rect width="22" height="22" x="1" y="1" rx="5.5" fill="#0A66C2" />
          <path
            d="M7 5.2a1.7 1.7 0 1 1-3.4 0 1.7 1.7 0 0 1 3.4 0zM4 8.2h2.6v8.6H4V8.2zm6.6 0h2.5v1.2h.1c.4-.7 1.2-1.4 2.5-1.4 2.7 0 3.2 1.8 3.2 4.1v4.7H16.3v-4.2c0-1-.02-2.3-1.4-2.3-1.4 0-1.6 1.1-1.6 2.2v4.3h-2.7V8.2z"
            fill="#FFFFFF"
          />
        </svg>
      );

    case 'telegram':
      return (
        <svg
          viewBox="0 0 24 24"
          width={px}
          height={px}
          className={`platform-svg-icon telegram-icon ${className}`}
          aria-label="Telegram"
        >
          <circle cx="12" cy="12" r="11" fill="#24A1DE" />
          <path
            d="M5.8 11.7l10.6-4.1c.5-.2.9.1.7.7l-1.8 8.6c-.1.5-.5.7-.9.5l-2.6-1.9-1.3 1.2c-.2.2-.3.3-.5.3l.2-2.7 4.9-4.4c.2-.2 0-.3-.3-.1L8.7 13.5l-2.6-.8c-.6-.2-.6-.6-.3-1z"
            fill="#FFFFFF"
          />
        </svg>
      );

    case 'tumblr':
      return (
        <svg
          viewBox="0 0 24 24"
          width={px}
          height={px}
          className={`platform-svg-icon tumblr-icon ${className}`}
          aria-label="Tumblr"
        >
          <rect width="22" height="22" x="1" y="1" rx="5.5" fill="#36465D" />
          <path
            d="M14.5 16.5c-1.2 0-1.6-.6-1.6-1.5V10h2.7V7.8h-2.7V5.3c-.7-.2-1.7-.6-2.3-1.2-.2-.2-.4 0-.4.3v3.4H8v2.2h2.1v4.5c0 2.2 1.5 3.6 4.1 3.6 1.3 0 2.3-.4 2.5-.6l-.5-2c-.4.3-1 .3-1.7.3z"
            fill="#FFFFFF"
          />
        </svg>
      );

    case 'auto':
    default:
      return (
        <div
          className={`platform-auto-brand-badge ${className}`}
          style={{ width: px, height: px }}
          title="Tự động nhận diện nền tảng"
        >
          <Sparkles size={Math.round(size * 0.72)} />
        </div>
      );
  }
}
