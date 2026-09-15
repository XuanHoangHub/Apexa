import { NextRequest, NextResponse } from 'next/server';
import { downloadYouTube, downloadInstagram } from '@hiudyy/ytdl';
import { getInfo as getVidlyInfo } from '@raihan07/vidly';
import { extractWithYtDlp } from '@/lib/yt-dlp-service';
import {
  extractVimeo,
  extractTwitch,
  extractPinterest,
  extractBilibili,
  extractWeibo,
  extractTelegram,
  extractTumblr,
  extractLinkedIn,
  sanitizeFilename,
  createProxyDownloadUrl,
} from '@/lib/get-extractors';

export const runtime = 'nodejs';

export type PlatformType =
  | 'youtube'
  | 'tiktok'
  | 'facebook'
  | 'instagram'
  | 'twitter'
  | 'vimeo'
  | 'twitch'
  | 'vk'
  | 'weibo'
  | 'bilibili'
  | 'pinterest'
  | 'linkedin'
  | 'telegram'
  | 'tumblr'
  | 'other';

export interface GetFormat {
  id: string;
  label: string;
  ext: string;
  quality: string;
  type: 'video' | 'audio' | 'subtitle' | 'thumbnail' | 'image';
  size?: string;
  url: string;
  downloadUrl: string;
  isOriginal?: boolean;
}

export interface GetSubtitle {
  lang: string;
  label: string;
  ext: 'srt' | 'vtt';
  url: string;
  downloadUrl: string;
}

export interface GetMediaResult {
  success: boolean;
  platform: PlatformType;
  platformName: string;
  id?: string;
  title: string;
  author: string;
  duration?: string;
  thumbnail: string;
  originalUrl: string;
  formats: GetFormat[];
  subtitles: GetSubtitle[];
  error?: string;
}

export function detectPlatform(url: string): PlatformType {
  const low = url.toLowerCase();
  if (low.includes('youtube.com') || low.includes('youtu.be')) return 'youtube';
  if (low.includes('tiktok.com') || low.includes('douyin.com')) return 'tiktok';
  if (
    low.includes('facebook.com') ||
    low.includes('fb.watch') ||
    low.includes('fb.com')
  )
    return 'facebook';
  if (low.includes('instagram.com')) return 'instagram';
  if (low.includes('twitter.com') || low.includes('x.com')) return 'twitter';
  if (low.includes('vimeo.com')) return 'vimeo';
  if (low.includes('twitch.tv')) return 'twitch';
  if (low.includes('vk.com') || low.includes('vkvideo.ru')) return 'vk';
  if (
    low.includes('weibo.com') ||
    low.includes('weibo.cn') ||
    low.includes('m.weibo.cn')
  )
    return 'weibo';
  if (
    low.includes('bilibili.com') ||
    low.includes('b23.tv') ||
    low.includes('bilibili.tv')
  )
    return 'bilibili';
  if (low.includes('pinterest.com') || low.includes('pin.it'))
    return 'pinterest';
  if (low.includes('linkedin.com')) return 'linkedin';
  if (
    low.includes('t.me/') ||
    low.includes('telegram.me/') ||
    low.includes('telegram.dog/')
  )
    return 'telegram';
  if (low.includes('tumblr.com')) return 'tumblr';
  return 'other';
}

export function getPlatformDisplayName(p: PlatformType): string {
  switch (p) {
    case 'youtube':
      return 'YouTube';
    case 'tiktok':
      return 'TikTok';
    case 'facebook':
      return 'Facebook';
    case 'instagram':
      return 'Instagram';
    case 'twitter':
      return 'Twitter / X';
    case 'vimeo':
      return 'Vimeo';
    case 'twitch':
      return 'Twitch';
    case 'vk':
      return 'VKontakte';
    case 'weibo':
      return 'Weibo';
    case 'bilibili':
      return 'Bilibili';
    case 'pinterest':
      return 'Pinterest';
    case 'linkedin':
      return 'LinkedIn';
    case 'telegram':
      return 'Telegram';
    case 'tumblr':
      return 'Tumblr';
    default:
      return 'Online Video';
  }
}

export async function resolveMediaUrl(
  rawUrl: string,
): Promise<GetMediaResult | null> {
  const platform = detectPlatform(rawUrl);
  const platformName = getPlatformDisplayName(platform);
  const cleanBase = sanitizeFilename(rawUrl.slice(-20));

  // 1. Vimeo (Akamai Origin CDN)
  if (platform === 'vimeo') {
    const res = await extractVimeo(rawUrl, cleanBase);
    if (res) {
      return {
        success: true,
        platform,
        platformName,
        title: res.title,
        author: res.author,
        duration: res.duration,
        thumbnail: res.thumbnail,
        originalUrl: rawUrl,
        formats: res.formats,
        subtitles: [],
      };
    }
  }

  // 2. Twitch (Twitch AWS CDN)
  if (platform === 'twitch') {
    const res = await extractTwitch(rawUrl, cleanBase);
    if (res) {
      return {
        success: true,
        platform,
        platformName,
        title: res.title,
        author: res.author,
        duration: res.duration,
        thumbnail: res.thumbnail,
        originalUrl: rawUrl,
        formats: res.formats,
        subtitles: [],
      };
    }
  }

  // 3. Pinterest (Pinterest Origin CDN)
  if (platform === 'pinterest') {
    const res = await extractPinterest(rawUrl, cleanBase);
    if (res) {
      return {
        success: true,
        platform,
        platformName,
        title: res.title,
        author: res.author,
        thumbnail: res.thumbnail,
        originalUrl: rawUrl,
        formats: res.formats,
        subtitles: [],
      };
    }
  }

  // 4. Bilibili (Bilibili Origin CDN)
  if (platform === 'bilibili') {
    const res = await extractBilibili(rawUrl, cleanBase);
    if (res) {
      return {
        success: true,
        platform,
        platformName,
        title: res.title,
        author: res.author,
        duration: res.duration,
        thumbnail: res.thumbnail,
        originalUrl: rawUrl,
        formats: res.formats,
        subtitles: [],
      };
    }
  }

  // 5. Weibo (Sina Origin CDN)
  if (platform === 'weibo') {
    const res = await extractWeibo(rawUrl, cleanBase);
    if (res) {
      return {
        success: true,
        platform,
        platformName,
        title: res.title,
        author: res.author,
        thumbnail: res.thumbnail,
        originalUrl: rawUrl,
        formats: res.formats,
        subtitles: [],
      };
    }
  }

  // 6. Telegram (Telegram Origin CDN)
  if (platform === 'telegram') {
    const res = await extractTelegram(rawUrl, cleanBase);
    if (res) {
      return {
        success: true,
        platform,
        platformName,
        title: res.title,
        author: res.author,
        thumbnail: res.thumbnail,
        originalUrl: rawUrl,
        formats: res.formats,
        subtitles: [],
      };
    }
  }

  // 7. Tumblr (Tumblr Origin CDN)
  if (platform === 'tumblr') {
    const res = await extractTumblr(rawUrl, cleanBase);
    if (res) {
      return {
        success: true,
        platform,
        platformName,
        title: res.title,
        author: res.author,
        thumbnail: res.thumbnail,
        originalUrl: rawUrl,
        formats: res.formats,
        subtitles: [],
      };
    }
  }

  // 8. LinkedIn (LinkedIn Origin CDN)
  if (platform === 'linkedin') {
    const res = await extractLinkedIn(rawUrl, cleanBase);
    if (res) {
      return {
        success: true,
        platform,
        platformName,
        title: res.title,
        author: res.author,
        thumbnail: res.thumbnail,
        originalUrl: rawUrl,
        formats: res.formats,
        subtitles: [],
      };
    }
  }

  // 9. VK (VKontakte Origin CDN)
  if (platform === 'vk') {
    try {
      const vInfo = await getVidlyInfo(rawUrl);
      if (vInfo && (vInfo.highQuality || vInfo.lowQuality)) {
        const title = vInfo.title || 'VKontakte Video';
        const cleanName = sanitizeFilename(title);
        const formats: GetFormat[] = [];
        if (vInfo.highQuality) {
          formats.push({
            id: 'vk-hd',
            label: 'HD Video · VK Origin CDN',
            ext: 'mp4',
            quality: 'HD',
            type: 'video',
            url: vInfo.highQuality,
            downloadUrl: createProxyDownloadUrl(
              vInfo.highQuality,
              `${cleanName}-vk-hd.mp4`,
              'video/mp4',
              'https://vk.com/',
            ),
            isOriginal: true,
          });
        }
        if (vInfo.lowQuality && vInfo.lowQuality !== vInfo.highQuality) {
          formats.push({
            id: 'vk-sd',
            label: 'SD Video · VK Origin CDN',
            ext: 'mp4',
            quality: 'SD',
            type: 'video',
            url: vInfo.lowQuality,
            downloadUrl: createProxyDownloadUrl(
              vInfo.lowQuality,
              `${cleanName}-vk-sd.mp4`,
              'video/mp4',
              'https://vk.com/',
            ),
          });
        }
        if (formats.length > 0) {
          return {
            success: true,
            platform,
            platformName,
            title,
            author: 'VK Creator',
            thumbnail: '',
            originalUrl: rawUrl,
            formats,
            subtitles: [],
          };
        }
      }
    } catch {}
  }

  // 10. TIKTOK RESOLUTION (ByteDance Origin CDN)
  if (platform === 'tiktok') {
    try {
      const tikwmRes = await fetch(
        `https://www.tikwm.com/api/?url=${encodeURIComponent(rawUrl)}`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          },
          signal: AbortSignal.timeout(6000),
        },
      );

      if (tikwmRes.ok) {
        const tikData = await tikwmRes.json();
        if (tikData.code === 0 && tikData.data) {
          const d = tikData.data;
          const title = d.title || 'TikTok Video';
          const author =
            d.author?.nickname || d.author?.unique_id || 'TikTok Creator';
          const thumbnail = d.cover || d.origin_cover || '';
          const duration = d.duration ? `${d.duration}s` : undefined;
          const cleanName = sanitizeFilename(title);

          const hdUrl = d.hdplay;
          const stdUrl = d.play;
          const wmVideoUrl = d.wmplay;
          const audioUrl = d.music || d.music_info?.play;

          const formats: GetFormat[] = [];
          const seenUrls = new Set<string>();

          if (hdUrl && !seenUrls.has(hdUrl)) {
            seenUrls.add(hdUrl);
            formats.push({
              id: 'tt-hd',
              label: '1080p Full HD (No Watermark)',
              ext: 'mp4',
              quality: '1080p HD',
              type: 'video',
              size: d.hd_size
                ? `${(d.hd_size / (1024 * 1024)).toFixed(1)} MB`
                : d.size
                  ? `${(d.size / (1024 * 1024)).toFixed(1)} MB`
                  : 'High Bitrate',
              url: hdUrl,
              downloadUrl: createProxyDownloadUrl(
                hdUrl,
                `${cleanName}-1080p.mp4`,
                'video/mp4',
              ),
              isOriginal: true,
            });
          }

          if (stdUrl && !seenUrls.has(stdUrl)) {
            seenUrls.add(stdUrl);
            formats.push({
              id: 'tt-std',
              label:
                formats.length === 0
                  ? 'HD Video (No Watermark)'
                  : '720p Standard (No Watermark)',
              ext: 'mp4',
              quality: formats.length === 0 ? 'HD' : '720p',
              type: 'video',
              size: d.size
                ? `${(d.size / (1024 * 1024)).toFixed(1)} MB`
                : 'Standard HD',
              url: stdUrl,
              downloadUrl: createProxyDownloadUrl(
                stdUrl,
                `${cleanName}-720p.mp4`,
                'video/mp4',
              ),
              isOriginal: formats.length === 0,
            });
          }

          if (wmVideoUrl && !seenUrls.has(wmVideoUrl)) {
            seenUrls.add(wmVideoUrl);
            formats.push({
              id: 'tt-watermark',
              label: 'Watermarked Original',
              ext: 'mp4',
              quality: 'Watermark',
              type: 'video',
              size: d.wm_size
                ? `${(d.wm_size / (1024 * 1024)).toFixed(1)} MB`
                : undefined,
              url: wmVideoUrl,
              downloadUrl: createProxyDownloadUrl(
                wmVideoUrl,
                `${cleanName}-watermark.mp4`,
                'video/mp4',
              ),
            });
          }

          if (audioUrl) {
            formats.push({
              id: 'tt-audio',
              label: 'Original Audio (MP3)',
              ext: 'mp3',
              quality: 'Audio',
              type: 'audio',
              size: 'Audio Track',
              url: audioUrl,
              downloadUrl: createProxyDownloadUrl(
                audioUrl,
                `${cleanName}-audio.mp3`,
                'audio/mpeg',
              ),
            });
          }

          return {
            success: true,
            platform,
            platformName,
            id: d.id,
            title,
            author,
            duration,
            thumbnail,
            originalUrl: rawUrl,
            formats,
            subtitles: [],
          };
        }
      }
    } catch (ttErr) {
      console.warn('TikTok primary extractor error:', ttErr);
    }
  }

  // 11. YOUTUBE RESOLUTION (High Quality Multi-Stream Engine)
  if (platform === 'youtube') {
    try {
      const ytdlpResult = await extractWithYtDlp(rawUrl, cleanBase);
      if (ytdlpResult && ytdlpResult.formats.length > 0) {
        return ytdlpResult;
      }
    } catch (ytErr) {
      console.warn(
        '[YouTube] yt-dlp extractor error, falling back to secondary providers:',
        ytErr,
      );
    }

    let title = 'YouTube Video';
    let author = 'YouTube Creator';
    let thumbnail = '';
    let videoId = '';

    const idMatch = rawUrl.match(
      /(?:v=|\/embed\/|youtu\.be\/|\/shorts\/)([\w-]{11})/,
    );
    if (idMatch) {
      videoId = idMatch[1];
      thumbnail = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
    }

    const oEmbedPromise = fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(rawUrl)}&format=json`,
      { signal: AbortSignal.timeout(4000) },
    )
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);

    const flvtoVideoPromise = videoId
      ? fetch('https://ht.flvto.online/converter', {
          method: 'POST',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10)',
            'Content-Type': 'application/json',
            Origin: 'https://ht.flvto.online',
            Referer: `https://ht.flvto.online/button?url=https://www.youtube.com/watch?v=${videoId}&fileType=mp4`,
          },
          body: JSON.stringify({ id: videoId, fileType: 'mp4' }),
          signal: AbortSignal.timeout(8000),
        })
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
      : Promise.resolve(null);

    const flvtoAudioPromise = videoId
      ? fetch('https://ht.flvto.online/converter', {
          method: 'POST',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10)',
            'Content-Type': 'application/json',
            Origin: 'https://ht.flvto.online',
            Referer: `https://ht.flvto.online/button?url=https://www.youtube.com/watch?v=${videoId}&fileType=mp3`,
          },
          body: JSON.stringify({ id: videoId, fileType: 'mp3' }),
          signal: AbortSignal.timeout(6000),
        })
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
      : Promise.resolve(null);

    const [oembed, data, aData] = await Promise.all([
      oEmbedPromise,
      flvtoVideoPromise,
      flvtoAudioPromise,
    ]);

    if (oembed) {
      if (oembed.title) title = oembed.title;
      if (oembed.author_name) author = oembed.author_name;
      if (!thumbnail && oembed.thumbnail_url) {
        thumbnail = oembed.thumbnail_url;
      }
    }

    const cleanName = sanitizeFilename(title);
    const formats: GetFormat[] = [];
    const subtitles: GetSubtitle[] = [];
    const seenUrls = new Set<string>();

    if (videoId) {
      subtitles.push(
        {
          lang: 'en',
          label: 'English (SRT)',
          ext: 'srt',
          url: `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&fmt=srt`,
          downloadUrl: createProxyDownloadUrl(
            `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&fmt=srt`,
            `${cleanName}-en.srt`,
            'text/plain',
          ),
        },
        {
          lang: 'vi',
          label: 'Vietnamese (SRT)',
          ext: 'srt',
          url: `https://www.youtube.com/api/timedtext?v=${videoId}&lang=vi&fmt=srt`,
          downloadUrl: createProxyDownloadUrl(
            `https://www.youtube.com/api/timedtext?v=${videoId}&lang=vi&fmt=srt`,
            `${cleanName}-vi.srt`,
            'text/plain',
          ),
        },
      );
    }

    if (data) {
      if (data.title && title === 'YouTube Video') title = data.title;
      if (Array.isArray(data.formats) && data.formats.length > 0) {
        for (const f of data.formats) {
          if (!f.url || seenUrls.has(f.url)) continue;
          seenUrls.add(f.url);
          const qLabel = f.qualityLabel || (f.height ? `${f.height}p` : 'HD');
          const isHD =
            qLabel.includes('1080') ||
            qLabel.includes('720') ||
            qLabel.includes('4K');
          const size = f.contentLength
            ? `${(Number(f.contentLength) / (1024 * 1024)).toFixed(1)} MB`
            : f.bitrate
              ? `${Math.round(Number(f.bitrate) / 1000)} kbps`
              : undefined;

          formats.push({
            id: `yt-${qLabel.replace(/\s+/g, '-').toLowerCase()}-${f.itag || formats.length}`,
            label: `${qLabel} Video Stream${f.width ? ` (${f.width}x${f.height})` : ''}`,
            ext: 'mp4',
            quality: qLabel,
            type: 'video',
            size: size || (isHD ? 'High Definition' : 'Standard Definition'),
            url: f.url,
            downloadUrl: createProxyDownloadUrl(
              f.url,
              `${cleanName}-${qLabel}.mp4`,
              'video/mp4',
              'https://ht.flvto.online/',
            ),
            isOriginal: isHD,
          });
        }
      }
    }

    if (aData && aData.link && !seenUrls.has(aData.link)) {
      seenUrls.add(aData.link);
      formats.push({
        id: 'yt-audio-mp3',
        label: 'Audio MP3 (High Bitrate)',
        ext: 'mp3',
        quality: '192 kbps',
        type: 'audio',
        size: 'Audio Track',
        url: aData.link,
        downloadUrl: createProxyDownloadUrl(
          aData.link,
          `${cleanName}-audio.mp3`,
          'audio/mpeg',
          'https://ht.flvto.online/',
        ),
      });
    }

    // Fallbacks
    if (formats.filter((f) => f.type === 'video').length === 0) {
      try {
        const ytRes = await downloadYouTube(rawUrl, 'mp4');
        if (ytRes.success && ytRes.filePath && !seenUrls.has(ytRes.filePath)) {
          seenUrls.add(ytRes.filePath);
          if (title === 'YouTube Video' && ytRes.title) title = ytRes.title;
          if (author === 'YouTube Creator' && ytRes.author)
            author = ytRes.author;
          if (ytRes.thumbnail) thumbnail = ytRes.thumbnail;
          const actualQuality = ytRes.quality || 'HD';

          formats.push({
            id: `yt-stream-${actualQuality.replace(/\s+/g, '-').toLowerCase()}`,
            label: `${actualQuality} Video Stream`,
            ext: 'mp4',
            quality: actualQuality,
            type: 'video',
            size: ytRes.size
              ? `${(ytRes.size / (1024 * 1024)).toFixed(1)} MB`
              : 'Direct Stream',
            url: ytRes.filePath,
            downloadUrl: createProxyDownloadUrl(
              ytRes.filePath,
              `${cleanName}-${actualQuality}.mp4`,
              'video/mp4',
            ),
            isOriginal: true,
          });
        }
      } catch {}
    }

    if (formats.filter((f) => f.type === 'audio').length === 0) {
      try {
        const ytAudio = await downloadYouTube(rawUrl, 'mp3');
        if (
          ytAudio.success &&
          ytAudio.filePath &&
          !seenUrls.has(ytAudio.filePath)
        ) {
          seenUrls.add(ytAudio.filePath);
          formats.push({
            id: 'yt-audio-320',
            label: 'Audio MP3 Track',
            ext: 'mp3',
            quality: '320 kbps',
            type: 'audio',
            size: 'Approx 5 MB',
            url: ytAudio.filePath,
            downloadUrl: createProxyDownloadUrl(
              ytAudio.filePath,
              `${cleanName}.mp3`,
              'audio/mpeg',
            ),
          });
        }
      } catch {}
    }

    if (thumbnail) {
      formats.push({
        id: 'yt-thumb',
        label: 'Cover Thumbnail (Max Resolution)',
        ext: 'jpg',
        quality: '1920x1080',
        type: 'thumbnail',
        url: thumbnail,
        downloadUrl: createProxyDownloadUrl(
          thumbnail,
          `${cleanName}-cover.jpg`,
          'image/jpeg',
        ),
      });
    }

    if (formats.length > 0) {
      return {
        success: true,
        platform,
        platformName,
        id: videoId,
        title,
        author,
        thumbnail,
        originalUrl: rawUrl,
        formats,
        subtitles,
      };
    }
  }

  // 12. FACEBOOK RESOLUTION (Meta Origin CDN)
  if (platform === 'facebook') {
    try {
      const vInfo = await getVidlyInfo(rawUrl);
      if (vInfo && (vInfo.highQuality || vInfo.lowQuality)) {
        const title = vInfo.title || 'Facebook Video';
        const cleanName = sanitizeFilename(title);
        const formats: GetFormat[] = [];
        const seenUrls = new Set<string>();

        if (vInfo.highQuality && !seenUrls.has(vInfo.highQuality)) {
          seenUrls.add(vInfo.highQuality);
          formats.push({
            id: 'fb-hd',
            label: 'HD Video (High Definition) · Meta Origin',
            ext: 'mp4',
            quality: 'HD',
            type: 'video',
            url: vInfo.highQuality,
            downloadUrl: createProxyDownloadUrl(
              vInfo.highQuality,
              `${cleanName}-hd.mp4`,
              'video/mp4',
              'https://www.facebook.com/',
            ),
            isOriginal: true,
          });
        }

        if (vInfo.lowQuality && !seenUrls.has(vInfo.lowQuality)) {
          seenUrls.add(vInfo.lowQuality);
          formats.push({
            id: 'fb-sd',
            label: 'SD Video (Standard Definition)',
            ext: 'mp4',
            quality: 'SD',
            type: 'video',
            url: vInfo.lowQuality,
            downloadUrl: createProxyDownloadUrl(
              vInfo.lowQuality,
              `${cleanName}-sd.mp4`,
              'video/mp4',
              'https://www.facebook.com/',
            ),
          });
        }

        if (formats.length > 0) {
          return {
            success: true,
            platform,
            platformName,
            title,
            author: 'Facebook Creator',
            thumbnail: '',
            originalUrl: rawUrl,
            formats,
            subtitles: [],
          };
        }
      }
    } catch {}
  }

  // 13. TWITTER / X RESOLUTION (Twitter Origin CDN)
  if (platform === 'twitter') {
    try {
      const tweetMatch = rawUrl.match(
        /(?:twitter\.com|x\.com)\/([^/]+)\/status\/(\d+)/i,
      );
      if (tweetMatch) {
        const [, username, statusId] = tweetMatch;
        const fxRes = await fetch(
          `https://api.fxtwitter.com/${username}/status/${statusId}`,
          {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            signal: AbortSignal.timeout(6000),
          },
        );
        if (fxRes.ok) {
          const fxData = await fxRes.json();
          const tweet = fxData?.tweet;
          if (tweet) {
            const title = tweet.text?.slice(0, 80) || 'Twitter / X Video';
            const cleanName = sanitizeFilename(title);
            const author = tweet.author?.name || `@${username}`;
            const thumbnail =
              tweet.media?.videos?.[0]?.thumbnail_url ||
              tweet.media?.photos?.[0]?.url ||
              '';
            const formats: GetFormat[] = [];
            const seenUrls = new Set<string>();

            if (Array.isArray(tweet.media?.videos)) {
              for (let vIdx = 0; vIdx < tweet.media.videos.length; vIdx++) {
                const vid = tweet.media.videos[vIdx];
                if (Array.isArray(vid.variants) && vid.variants.length > 0) {
                  const mp4s = vid.variants
                    .filter(
                      (v: {
                        content_type?: string;
                        bitrate?: number;
                        url?: string;
                      }) => v.url && v.content_type?.includes('mp4'),
                    )
                    .sort(
                      (a: { bitrate?: number }, b: { bitrate?: number }) =>
                        (b.bitrate || 0) - (a.bitrate || 0),
                    );

                  for (const m of mp4s) {
                    if (seenUrls.has(m.url)) continue;
                    seenUrls.add(m.url);
                    const bitrateKbps = Math.round((m.bitrate || 0) / 1000);
                    const qualityLabel =
                      bitrateKbps >= 1500
                        ? '1080p HD'
                        : bitrateKbps >= 800
                          ? '720p HD'
                          : bitrateKbps >= 400
                            ? '480p SD'
                            : '360p Fast';

                    formats.push({
                      id: `tw-${vIdx}-${bitrateKbps}`,
                      label: `${qualityLabel} · Twitter Origin CDN`,
                      ext: 'mp4',
                      quality: qualityLabel,
                      type: 'video',
                      size:
                        bitrateKbps > 0
                          ? `Bitrate ${bitrateKbps}k`
                          : 'Video Stream',
                      url: m.url,
                      downloadUrl: createProxyDownloadUrl(
                        m.url,
                        `${cleanName}-${qualityLabel.replace(/\s+/g, '-')}.mp4`,
                        'video/mp4',
                        'https://twitter.com/',
                      ),
                      isOriginal: formats.length === 0,
                    });
                  }
                } else if (vid.url && !seenUrls.has(vid.url)) {
                  seenUrls.add(vid.url);
                  formats.push({
                    id: `tw-${vIdx}-direct`,
                    label: 'HD Video · Twitter Origin',
                    ext: 'mp4',
                    quality: 'HD',
                    type: 'video',
                    url: vid.url,
                    downloadUrl: createProxyDownloadUrl(
                      vid.url,
                      `${cleanName}-video.mp4`,
                      'video/mp4',
                      'https://twitter.com/',
                    ),
                    isOriginal: true,
                  });
                }
              }
            }

            if (formats.length > 0) {
              return {
                success: true,
                platform,
                platformName,
                id: statusId,
                title,
                author,
                thumbnail,
                originalUrl: rawUrl,
                formats,
                subtitles: [],
              };
            }
          }
        }
      }
    } catch {}
  }

  // 14. INSTAGRAM RESOLUTION (Instagram Origin CDN)
  if (platform === 'instagram') {
    try {
      const ig = await downloadInstagram(rawUrl);
      if (ig && ig.medias && ig.medias.length > 0) {
        const formats: GetFormat[] = ig.medias.map(
          (m: { type: 'video' | 'image'; url: string }, idx: number) => ({
            id: `ig-${idx}`,
            label:
              m.type === 'video'
                ? `Reel / Video ${idx + 1} (HD) · Instagram CDN`
                : `Image ${idx + 1} (Full Res)`,
            ext: m.type === 'video' ? 'mp4' : 'jpg',
            quality: 'Original',
            type: m.type,
            url: m.url,
            downloadUrl: createProxyDownloadUrl(
              m.url,
              `instagram-media-${idx + 1}.${m.type === 'video' ? 'mp4' : 'jpg'}`,
              m.type === 'video' ? 'video/mp4' : 'image/jpeg',
            ),
            isOriginal: true,
          }),
        );

        return {
          success: true,
          platform,
          platformName,
          title: 'Instagram Post / Reel',
          author: 'Instagram Creator',
          thumbnail: ig.medias[0]?.url || '',
          originalUrl: rawUrl,
          formats,
          subtitles: [],
        };
      }
    } catch {}
  }

  // 15. UNIVERSAL / MULTI-PLATFORM FALLBACK
  try {
    const vInfo = await getVidlyInfo(rawUrl);
    if (vInfo && (vInfo.highQuality || vInfo.lowQuality)) {
      const title = vInfo.title || 'Online Video';
      const cleanName = sanitizeFilename(title);
      const url = vInfo.highQuality || vInfo.lowQuality;
      if (url) {
        return {
          success: true,
          platform,
          platformName,
          title,
          author: 'Content Creator',
          thumbnail: '',
          originalUrl: rawUrl,
          formats: [
            {
              id: 'gen-hd',
              label: 'High Quality Stream',
              ext: 'mp4',
              quality: 'HD',
              type: 'video',
              url: url,
              downloadUrl: createProxyDownloadUrl(
                url,
                `${cleanName}.mp4`,
                'video/mp4',
              ),
              isOriginal: true,
            },
          ],
          subtitles: [],
        };
      }
    }
  } catch {}

  // 12. Universal Fallback (Handles any supported video platform via yt-dlp)
  try {
    const universalResult = await extractWithYtDlp(rawUrl, cleanBase);
    if (universalResult && universalResult.formats.length > 0) {
      return universalResult;
    }
  } catch {}

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Batch resolution mode
    if (Array.isArray(body?.urls)) {
      const rawUrls: string[] = body.urls
        .filter(
          (u: unknown): u is string =>
            typeof u === 'string' && u.trim().length > 0,
        )
        .slice(0, 30);

      if (rawUrls.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No valid URLs provided.' },
          { status: 400 },
        );
      }

      const results = await Promise.allSettled(
        rawUrls.map((u) => resolveMediaUrl(u.trim())),
      );

      const resolvedItems: GetMediaResult[] = results.map((res, i) => {
        const originalUrl = rawUrls[i];
        if (res.status === 'fulfilled' && res.value && res.value.success) {
          return res.value;
        }
        const platform = detectPlatform(originalUrl);
        return {
          success: false,
          platform,
          platformName: getPlatformDisplayName(platform),
          title: 'Extraction failed',
          author: 'Unknown',
          thumbnail: '',
          originalUrl,
          formats: [],
          subtitles: [],
          error:
            res.status === 'rejected'
              ? res.reason?.message || 'Failed to extract media'
              : 'Could not extract streams from this link',
        };
      });

      return NextResponse.json({
        success: true,
        batch: true,
        total: resolvedItems.length,
        results: resolvedItems,
      });
    }

    // Single link mode
    const rawUrl = typeof body?.url === 'string' ? body.url.trim() : '';
    if (!rawUrl) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid video or audio URL.' },
        { status: 400 },
      );
    }

    const result = await resolveMediaUrl(rawUrl);
    if (result && result.success) {
      return NextResponse.json(result);
    }

    return NextResponse.json(
      {
        success: false,
        error:
          'Could not extract video streams from the provided link. Please ensure the link is public or try a different video.',
      },
      { status: 422 },
    );
  } catch (error) {
    console.error('Get API error:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'An error occurred during media extraction.',
      },
      { status: 500 },
    );
  }
}
