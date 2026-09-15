import type { GetFormat } from '@/app/api/get/route';

export function sanitizeFilename(text: string): string {
  return (
    text
      .replace(/[^\w\s.-]/g, '')
      .trim()
      .slice(0, 80) || 'media'
  );
}

export function createProxyDownloadUrl(
  directUrl: string,
  filename: string,
  type: string,
  referer?: string,
): string {
  const params = new URLSearchParams({
    url: directUrl,
    filename: filename,
    type: type,
  });
  if (referer) {
    params.set('referer', referer);
  }
  return `/api/get/download?${params.toString()}`;
}

export interface ExtractedMedia {
  title: string;
  author: string;
  duration?: string;
  thumbnail: string;
  formats: GetFormat[];
}

// ───────────────────────────────────────────────
// 1. VIMEO EXTRACTOR (Akamai Origin CDN)
// ───────────────────────────────────────────────
export async function extractVimeo(
  rawUrl: string,
  cleanName: string,
): Promise<ExtractedMedia | null> {
  try {
    const m =
      rawUrl.match(
        /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^/]*)\/videos\/|album\/(?:\d+\/)?video\/|video\/|)(\d+))/i,
      ) || rawUrl.match(/vimeo\.com\/(\d+)/i);
    if (!m) return null;
    const videoId = m[m.length - 1];

    const res = await fetch(
      `https://player.vimeo.com/video/${videoId}/config`,
      {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        signal: AbortSignal.timeout(7000),
      },
    );
    if (!res.ok) return null;
    const json = await res.json();
    const video = json.video || {};
    const title = video.title || 'Vimeo Video';
    const author = video.owner?.name || 'Vimeo Creator';
    const duration = video.duration
      ? `${Math.floor(video.duration / 60)}m ${video.duration % 60}s`
      : undefined;
    const thumbnail =
      video.thumbs?.base ||
      video.thumbs?.['1280'] ||
      video.thumbs?.['640'] ||
      '';

    const files = json.request?.files?.progressive || [];
    const formats: GetFormat[] = [];
    const seen = new Set<string>();

    interface VimeoFile {
      id?: string;
      quality?: string;
      width?: number;
      height?: number;
      url?: string;
    }

    files.sort(
      (a: VimeoFile, b: VimeoFile) => (b.height || 0) - (a.height || 0),
    );

    for (const f of files) {
      if (!f.url || seen.has(f.url)) continue;
      seen.add(f.url);
      const q = f.quality ? `${f.quality}p` : `${f.height}p`;
      formats.push({
        id: `vimeo-${f.id || f.quality || formats.length}`,
        label: `${q} (${f.width}x${f.height}) · Akamai Origin`,
        ext: 'mp4',
        quality: q,
        type: 'video',
        size: `${f.width}x${f.height}`,
        url: f.url,
        downloadUrl: createProxyDownloadUrl(
          f.url,
          `${cleanName}-${q}.mp4`,
          'video/mp4',
          'https://vimeo.com/',
        ),
        isOriginal: formats.length === 0,
      });
    }

    if (formats.length === 0) {
      const hlsCdns = json.request?.files?.hls?.cdns;
      if (hlsCdns && typeof hlsCdns === 'object') {
        const defaultCdn =
          json.request?.files?.hls?.default_cdn || Object.keys(hlsCdns)[0];
        const cdnData =
          (hlsCdns as Record<string, { url?: string; fallback_url?: string }>)[
            defaultCdn
          ] || Object.values(hlsCdns)[0];
        const hlsUrl = cdnData?.url || cdnData?.fallback_url;
        if (hlsUrl) {
          formats.push({
            id: 'vimeo-hls',
            label: 'Auto HD Stream (Akamai Origin CDN)',
            ext: 'm3u8',
            quality: 'Auto HD',
            type: 'video',
            size: 'Master Playlist',
            url: hlsUrl,
            downloadUrl: createProxyDownloadUrl(
              hlsUrl,
              `${cleanName}-stream.m3u8`,
              'application/vnd.apple.mpegurl',
              'https://vimeo.com/',
            ),
            isOriginal: true,
          });
        }
      }
    }

    if (formats.length > 0) {
      return { title, author, duration, thumbnail, formats };
    }
  } catch (err) {
    console.warn('Vimeo extractor error:', err);
  }
  return null;
}

// ───────────────────────────────────────────────
// 2. TWITCH CLIP EXTRACTOR (Twitch AWS CDN)
// ───────────────────────────────────────────────
export async function extractTwitch(
  rawUrl: string,
  cleanName: string,
): Promise<ExtractedMedia | null> {
  try {
    const m = rawUrl.match(
      /(?:clips\.twitch\.tv\/|twitch\.tv\/(?:[\w]+)\/clip\/)([\w-]+)/i,
    );
    if (!m) return null;
    const slug = m[1];

    const res = await fetch('https://gql.twitch.tv/gql', {
      method: 'POST',
      headers: {
        'Client-ID': 'kimne78kx3ncx6brgo4mv6wki5h1ko',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `query {
          clip(slug: "${slug}") {
            id
            title
            durationSeconds
            thumbnailURL
            broadcaster { displayName }
            videoQualities {
              frameRate
              quality
              sourceURL
            }
          }
        }`,
      }),
      signal: AbortSignal.timeout(7000),
    });

    if (!res.ok) return null;
    const json = await res.json();
    const clip = json.data?.clip;
    if (!clip) return null;

    const title = clip.title || 'Twitch Clip';
    const author = clip.broadcaster?.displayName || 'Twitch Streamer';
    const duration = clip.durationSeconds
      ? `${clip.durationSeconds}s`
      : undefined;
    const thumbnail = clip.thumbnailURL || '';

    interface TwitchQuality {
      quality?: string;
      frameRate?: number;
      sourceURL?: string;
    }

    const list: TwitchQuality[] = clip.videoQualities || [];
    list.sort((a, b) => Number(b.quality || 0) - Number(a.quality || 0));

    const formats: GetFormat[] = [];
    const seen = new Set<string>();

    for (const q of list) {
      if (!q.sourceURL || seen.has(q.sourceURL)) continue;
      seen.add(q.sourceURL);
      const qLabel = `${q.quality}p${q.frameRate ? ` (${q.frameRate}fps)` : ''}`;
      formats.push({
        id: `twitch-${q.quality}`,
        label: `${qLabel} HD Clip · Twitch Origin CDN`,
        ext: 'mp4',
        quality: `${q.quality}p`,
        type: 'video',
        url: q.sourceURL,
        downloadUrl: createProxyDownloadUrl(
          q.sourceURL,
          `${cleanName}-${q.quality}p.mp4`,
          'video/mp4',
        ),
        isOriginal: formats.length === 0,
      });
    }

    if (formats.length > 0) {
      return { title, author, duration, thumbnail, formats };
    }
  } catch (err) {
    console.warn('Twitch extractor error:', err);
  }
  return null;
}

// ───────────────────────────────────────────────
// 3. PINTEREST EXTRACTOR (Pinterest Origin CDN)
// ───────────────────────────────────────────────
export async function extractPinterest(
  rawUrl: string,
  cleanName: string,
): Promise<ExtractedMedia | null> {
  try {
    let target = rawUrl;
    if (rawUrl.includes('pin.it/')) {
      const redir = await fetch(rawUrl, {
        redirect: 'follow',
        signal: AbortSignal.timeout(5000),
      }).catch(() => null);
      if (redir?.url) target = redir.url;
    }

    const m = target.match(/pin\/(\d+)/i);
    if (!m) return null;
    const pinId = m[1];

    const res = await fetch(
      `https://www.pinterest.com/resource/PinResource/get/?data=${encodeURIComponent(
        JSON.stringify({ options: { id: pinId, field_set_key: 'detailed' } }),
      )}`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
        },
        signal: AbortSignal.timeout(7000),
      },
    );

    if (!res.ok) return null;
    const json = await res.json();
    const pin = json.resource_response?.data || {};
    const title =
      pin.grid_title || pin.title || pin.description || 'Pinterest Media';
    const author =
      pin.pinner?.full_name || pin.pinner?.username || 'Pinterest Creator';
    const thumbnail = pin.images?.orig?.url || pin.images?.['736x']?.url || '';

    const formats: GetFormat[] = [];
    const seen = new Set<string>();

    const videoList = pin.videos?.video_list || {};
    for (const key of ['V_720P', 'V_EXP7', 'V_HLSV4']) {
      const v = videoList[key];
      if (v?.url && !seen.has(v.url) && v.url.endsWith('.mp4')) {
        seen.add(v.url);
        const q = key === 'V_720P' ? '720p HD' : 'HD Video';
        formats.push({
          id: `pin-${key.toLowerCase()}`,
          label: `${q} · Pinterest Akamai Origin`,
          ext: 'mp4',
          quality: q,
          type: 'video',
          url: v.url,
          downloadUrl: createProxyDownloadUrl(
            v.url,
            `${cleanName}-${q.replace(/\s+/g, '-')}.mp4`,
            'video/mp4',
          ),
          isOriginal: true,
        });
      }
    }

    if (pin.images?.orig?.url && !seen.has(pin.images.orig.url)) {
      seen.add(pin.images.orig.url);
      const isGif = pin.images.orig.url.includes('.gif');
      const ext = isGif ? 'gif' : 'jpg';
      formats.push({
        id: 'pin-orig-img',
        label: `Original Full-Res ${ext.toUpperCase()} (${pin.images.orig.width}x${pin.images.orig.height})`,
        ext: ext,
        quality: `${pin.images.orig.width}x${pin.images.orig.height}`,
        type: 'thumbnail',
        url: pin.images.orig.url,
        downloadUrl: createProxyDownloadUrl(
          pin.images.orig.url,
          `${cleanName}.${ext}`,
          isGif ? 'image/gif' : 'image/jpeg',
        ),
        isOriginal: formats.length === 0,
      });
    }

    if (formats.length > 0) {
      return { title, author, thumbnail, formats };
    }
  } catch (err) {
    console.warn('Pinterest extractor error:', err);
  }
  return null;
}

// ───────────────────────────────────────────────
// 4. BILIBILI EXTRACTOR (Bilibili Origin CDN)
// ───────────────────────────────────────────────
export async function extractBilibili(
  rawUrl: string,
  cleanName: string,
): Promise<ExtractedMedia | null> {
  try {
    let target = rawUrl;
    if (rawUrl.includes('b23.tv/')) {
      const redir = await fetch(rawUrl, {
        redirect: 'follow',
        signal: AbortSignal.timeout(5000),
      }).catch(() => null);
      if (redir?.url) target = redir.url;
    }

    const m = target.match(/(BV[a-zA-Z0-9]+)/i);
    if (!m) return null;
    const bvid = m[1];

    const vRes = await fetch(
      `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`,
      {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        signal: AbortSignal.timeout(7000),
      },
    );
    if (!vRes.ok) return null;
    const vData = await vRes.json();
    const data = vData.data;
    if (!data) return null;

    const title = data.title || 'Bilibili Video';
    const author = data.owner?.name || 'Bilibili Creator';
    const duration = data.duration
      ? `${Math.floor(data.duration / 60)}m ${data.duration % 60}s`
      : undefined;
    const thumbnail = data.pic || '';
    const cid = data.cid;

    const formats: GetFormat[] = [];
    const playRes = await fetch(
      `https://api.bilibili.com/x/player/playurl?bvid=${bvid}&cid=${cid}&qn=64&fnval=0&fnver=0&fourk=1`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          Referer: 'https://www.bilibili.com/',
        },
        signal: AbortSignal.timeout(7000),
      },
    );

    if (playRes.ok) {
      const pData = await playRes.json();
      const durls = pData.data?.durl || [];
      for (let i = 0; i < durls.length; i++) {
        const d = durls[i];
        if (!d.url) continue;
        const mb = d.size
          ? `${(d.size / (1024 * 1024)).toFixed(1)} MB`
          : undefined;
        formats.push({
          id: `bili-stream-${i}`,
          label: `HD Video Stream${mb ? ` (${mb})` : ''} · Bilibili Origin`,
          ext: 'mp4',
          quality: '720p HD',
          type: 'video',
          size: mb,
          url: d.url,
          downloadUrl: createProxyDownloadUrl(
            d.url,
            `${cleanName}-bilibili.mp4`,
            'video/mp4',
            'https://www.bilibili.com/',
          ),
          isOriginal: true,
        });
      }
    }

    if (formats.length > 0) {
      return { title, author, duration, thumbnail, formats };
    }
  } catch (err) {
    console.warn('Bilibili extractor error:', err);
  }
  return null;
}

// ───────────────────────────────────────────────
// 5. WEIBO EXTRACTOR (Sina Origin CDN)
// ───────────────────────────────────────────────
export async function extractWeibo(
  rawUrl: string,
  cleanName: string,
): Promise<ExtractedMedia | null> {
  try {
    const m =
      rawUrl.match(/(?:status|detail|show)\/([a-zA-Z0-9]+)/i) ||
      rawUrl.match(/weibo\.com\/[^/]+\/([a-zA-Z0-9]+)/i);
    if (!m) return null;
    const id = m[1];

    const res = await fetch(`https://m.weibo.cn/statuses/show?id=${id}`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
      },
      signal: AbortSignal.timeout(7000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const status = json.data || {};
    const title =
      status.page_info?.page_title ||
      status.text?.slice(0, 80) ||
      'Weibo Video';
    const author = status.user?.screen_name || 'Weibo Creator';
    const thumbnail = status.page_info?.page_pic?.url || '';
    const mediaInfo = status.page_info?.media_info || {};
    const streamUrl =
      mediaInfo.stream_url_hd ||
      mediaInfo.stream_url ||
      mediaInfo.mp4_720p_mp4 ||
      mediaInfo.mp4_hd_url;

    const formats: GetFormat[] = [];
    if (streamUrl) {
      formats.push({
        id: 'weibo-hd',
        label: 'HD Video Stream · Sina Origin CDN',
        ext: 'mp4',
        quality: 'HD',
        type: 'video',
        url: streamUrl,
        downloadUrl: createProxyDownloadUrl(
          streamUrl,
          `${cleanName}-weibo.mp4`,
          'video/mp4',
          'https://weibo.com/',
        ),
        isOriginal: true,
      });
    }

    if (formats.length > 0) {
      return { title, author, thumbnail, formats };
    }
  } catch (err) {
    console.warn('Weibo extractor error:', err);
  }
  return null;
}

// ───────────────────────────────────────────────
// 6. TELEGRAM EXTRACTOR (Telegram Origin CDN)
// ───────────────────────────────────────────────
export async function extractTelegram(
  rawUrl: string,
  cleanName: string,
): Promise<ExtractedMedia | null> {
  try {
    const m = rawUrl.match(
      /(?:t\.me|telegram\.me|telegram\.dog)\/([^/]+)\/(\d+)/i,
    );
    if (!m) return null;
    const [, channel, msgId] = m;

    const res = await fetch(`https://t.me/${channel}/${msgId}?embed=1`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(7000),
    });
    if (!res.ok) return null;
    const html = await res.text();

    const videoMatch = html.match(/<video[^>]*src="([^"]+)"/i);
    const photoMatch = html.match(
      /class="tgme_widget_message_photo_wrap"[^>]*style="[^"]*background-image:url\('([^']+)'\)/i,
    );
    const titleMatch = html.match(
      /class="tgme_widget_message_text[^"]*">([\s\S]*?)<\/div>/i,
    );
    const authorMatch = html.match(
      /class="tgme_widget_message_owner_name">([\s\S]*?)<\/div>/i,
    );

    const title = titleMatch
      ? titleMatch[1]
          .replace(/<[^>]+>/g, '')
          .trim()
          .slice(0, 80)
      : `Telegram @${channel} Media`;
    const author = authorMatch
      ? authorMatch[1].replace(/<[^>]+>/g, '').trim()
      : `@${channel}`;
    const thumbnail = photoMatch ? photoMatch[1] : '';

    const formats: GetFormat[] = [];
    if (videoMatch && videoMatch[1]) {
      formats.push({
        id: 'tg-video',
        label: 'Original Video Stream · Telegram Origin CDN',
        ext: 'mp4',
        quality: 'Original HD',
        type: 'video',
        url: videoMatch[1],
        downloadUrl: createProxyDownloadUrl(
          videoMatch[1],
          `${cleanName}-telegram.mp4`,
          'video/mp4',
        ),
        isOriginal: true,
      });
    } else if (photoMatch && photoMatch[1]) {
      formats.push({
        id: 'tg-photo',
        label: 'Original High-Res Photo · Telegram Origin CDN',
        ext: 'jpg',
        quality: 'Original',
        type: 'thumbnail',
        url: photoMatch[1],
        downloadUrl: createProxyDownloadUrl(
          photoMatch[1],
          `${cleanName}.jpg`,
          'image/jpeg',
        ),
        isOriginal: true,
      });
    }

    if (formats.length > 0) {
      return { title, author, thumbnail, formats };
    }
  } catch (err) {
    console.warn('Telegram extractor error:', err);
  }
  return null;
}

// ───────────────────────────────────────────────
// 7. TUMBLR EXTRACTOR (Tumblr Media Origin CDN)
// ───────────────────────────────────────────────
export async function extractTumblr(
  rawUrl: string,
  cleanName: string,
): Promise<ExtractedMedia | null> {
  try {
    const oRes = await fetch(
      `https://www.tumblr.com/oembed/1.0?url=${encodeURIComponent(rawUrl)}`,
      {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(5000),
      },
    ).catch(() => null);

    let title = 'Tumblr Media';
    let author = 'Tumblr Creator';
    let thumbnail = '';

    if (oRes?.ok) {
      const oj = await oRes.json();
      if (oj.title) title = oj.title;
      if (oj.author_name) author = oj.author_name;
      if (oj.thumbnail_url) thumbnail = oj.thumbnail_url;
    }

    const pageRes = await fetch(rawUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      signal: AbortSignal.timeout(6000),
    });
    const html = await pageRes.text();
    const vMatch =
      html.match(/<video[^>]*src="([^"]+)"/i) ||
      html.match(/<source[^>]*src="([^"]+)"/i) ||
      html.match(/(https:\/\/(?:v|va)\.media\.tumblr\.com\/[^\s"'>]+)/i);

    const formats: GetFormat[] = [];
    if (vMatch && vMatch[1]) {
      formats.push({
        id: 'tumblr-vid',
        label: 'Original Video · Tumblr Origin CDN',
        ext: 'mp4',
        quality: 'HD',
        type: 'video',
        url: vMatch[1],
        downloadUrl: createProxyDownloadUrl(
          vMatch[1],
          `${cleanName}-tumblr.mp4`,
          'video/mp4',
        ),
        isOriginal: true,
      });
    }

    if (formats.length > 0) {
      return { title, author, thumbnail, formats };
    }
  } catch (err) {
    console.warn('Tumblr extractor error:', err);
  }
  return null;
}

// ───────────────────────────────────────────────
// 8. LINKEDIN EXTRACTOR (LinkedIn Origin CDN)
// ───────────────────────────────────────────────
export async function extractLinkedIn(
  rawUrl: string,
  cleanName: string,
): Promise<ExtractedMedia | null> {
  try {
    const oRes = await fetch(
      `https://www.linkedin.com/page-views/oembed?url=${encodeURIComponent(rawUrl)}&format=json`,
      {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(5000),
      },
    ).catch(() => null);

    let title = 'LinkedIn Video';
    let author = 'LinkedIn Member';
    let thumbnail = '';

    if (oRes?.ok) {
      const oj = await oRes.json();
      if (oj.title) title = oj.title;
      if (oj.author_name) author = oj.author_name;
      if (oj.thumbnail_url) thumbnail = oj.thumbnail_url;
    }

    const pRes = await fetch(rawUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      signal: AbortSignal.timeout(6000),
    });
    const html = await pRes.text();
    const match =
      html.match(/data-sources='(\[[^']+\])'/i) ||
      html.match(/<video[^>]*src="([^"]+)"/i);

    const formats: GetFormat[] = [];
    if (match) {
      if (match[1].startsWith('[')) {
        try {
          const sources = JSON.parse(match[1]);
          for (const s of sources) {
            if (s.src) {
              formats.push({
                id: `li-vid-${formats.length}`,
                label: 'HD Video Stream · LinkedIn Origin CDN',
                ext: 'mp4',
                quality: 'HD',
                type: 'video',
                url: s.src,
                downloadUrl: createProxyDownloadUrl(
                  s.src,
                  `${cleanName}-linkedin.mp4`,
                  'video/mp4',
                ),
                isOriginal: true,
              });
            }
          }
        } catch {}
      } else {
        formats.push({
          id: 'li-vid',
          label: 'HD Video Stream · LinkedIn Origin CDN',
          ext: 'mp4',
          quality: 'HD',
          type: 'video',
          url: match[1],
          downloadUrl: createProxyDownloadUrl(
            match[1],
            `${cleanName}-linkedin.mp4`,
            'video/mp4',
          ),
          isOriginal: true,
        });
      }
    }

    if (formats.length > 0) {
      return { title, author, thumbnail, formats };
    }
  } catch (err) {
    console.warn('LinkedIn extractor error:', err);
  }
  return null;
}
