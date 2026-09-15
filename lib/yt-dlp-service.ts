import { execFile, spawn, type ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';
import { Readable } from 'stream';
import type {
  GetFormat,
  GetSubtitle,
  GetMediaResult,
} from '@/app/api/get/route';
import { sanitizeFilename } from '@/lib/get-extractors';

interface YtDlpFormat {
  vcodec?: string;
  acodec?: string;
  abr?: number;
  height?: number | string;
  ext?: string;
  filesize?: number;
  filesize_approx?: number;
  url?: string;
  [key: string]: unknown;
}

interface YtDlpSubtitle {
  ext?: string;
  url?: string;
  [key: string]: unknown;
}

const YT_DLP_PATH = path.resolve(
  process.cwd(),
  process.platform === 'win32' ? 'bin/yt-dlp.exe' : 'bin/yt-dlp',
);
const FFMPEG_DIR = path.resolve(process.cwd(), 'bin');
const FFMPEG_PATH = path.resolve(
  FFMPEG_DIR,
  process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg',
);

export function isYtDlpAvailable(): boolean {
  try {
    return fs.existsSync(YT_DLP_PATH);
  } catch {
    return false;
  }
}

export function isFfmpegAvailable(): boolean {
  try {
    return fs.existsSync(FFMPEG_PATH);
  } catch {
    return false;
  }
}

export async function extractWithYtDlp(
  rawUrl: string,
  cleanBase?: string,
): Promise<GetMediaResult | null> {
  if (!isYtDlpAvailable()) return null;

  return new Promise((resolve) => {
    const args = [
      '--ffmpeg-location',
      FFMPEG_DIR,
      '-J',
      '--no-warnings',
      '--no-playlist',
      rawUrl,
    ];

    execFile(
      YT_DLP_PATH,
      args,
      { maxBuffer: 50 * 1024 * 1024, timeout: 15000 },
      (err, stdout) => {
        if (err || !stdout) {
          console.warn('[yt-dlp] extraction error:', err?.message);
          return resolve(null);
        }

        try {
          const info = JSON.parse(stdout);
          const title = info.title || 'Video';
          const author = info.channel || info.uploader || 'Creator';
          const duration = info.duration_string || undefined;
          const thumbnail =
            info.thumbnail ||
            (info.thumbnails && info.thumbnails.length > 0
              ? info.thumbnails[info.thumbnails.length - 1].url
              : '');
          const videoId = info.id || '';
          const cleanName = sanitizeFilename(title || cleanBase || 'video');

          // Find best audio stream for calculating total composite sizes
          const audioStreams = ((info.formats as YtDlpFormat[]) || [])
            .filter((f) => f.vcodec === 'none' && f.acodec !== 'none')
            .sort((a, b) => (b.abr || 0) - (a.abr || 0));
          const bestAudio = audioStreams[0];
          const audioSize = bestAudio
            ? bestAudio.filesize || bestAudio.filesize_approx || 0
            : 0;

          // Group video formats by height
          const videoMap = new Map<number, YtDlpFormat>();
          for (const f of (info.formats as YtDlpFormat[]) || []) {
            if (!f.height || f.vcodec === 'none') continue;
            const height = Number(f.height);
            if (isNaN(height) || height < 144) continue;

            const existing = videoMap.get(height);
            if (
              !existing ||
              (f.ext === 'mp4' && existing.ext !== 'mp4') ||
              ((f.filesize || 0) > (existing.filesize || 0) &&
                f.ext === existing.ext)
            ) {
              videoMap.set(height, f);
            }
          }

          const sortedHeights = Array.from(videoMap.keys()).sort(
            (a, b) => b - a,
          );
          const formats: GetFormat[] = [];

          sortedHeights.forEach((h, index) => {
            const f = videoMap.get(h);
            if (!f) return;
            const vSize = f.filesize || f.filesize_approx || 0;
            const totalSize = vSize + (f.acodec === 'none' ? audioSize : 0);
            const sizeStr =
              totalSize > 0
                ? `${(totalSize / (1024 * 1024)).toFixed(1)} MB`
                : (f.format_note as string)
                  ? `${f.format_note as string}`
                  : `${h}p`;

            const qualityName =
              h >= 2160
                ? '4K Ultra HD'
                : h >= 1440
                  ? '2K Quad HD'
                  : h >= 1080
                    ? '1080p Full HD'
                    : h >= 720
                      ? '720p HD'
                      : h >= 480
                        ? '480p SD'
                        : `${h}p`;

            const downloadUrl = `/api/get/download?mediaUrl=${encodeURIComponent(
              rawUrl,
            )}&quality=${h}&filename=${encodeURIComponent(`${cleanName}-${h}p.mp4`)}&type=video/mp4`;

            formats.push({
              id: `yt-res-${h}`,
              label: `${qualityName} (${f.ext || 'mp4'})`,
              ext: f.ext || 'mp4',
              quality: `${h}p`,
              type: 'video',
              size: sizeStr,
              url: downloadUrl,
              downloadUrl,
              isOriginal: index === 0,
            });
          });

          // Add Audio options
          if (audioStreams.length > 0) {
            const bestM4a =
              audioStreams.find((f) => f.ext === 'm4a') || audioStreams[0];
            const aSize = bestM4a.filesize || bestM4a.filesize_approx || 0;
            const aSizeStr =
              aSize > 0
                ? `${(aSize / (1024 * 1024)).toFixed(1)} MB`
                : 'Approx 15 MB';

            const audioProxy = `/api/get/download?mediaUrl=${encodeURIComponent(
              rawUrl,
            )}&quality=audio&filename=${encodeURIComponent(`${cleanName}-audio.mp3`)}&type=audio/mpeg`;

            formats.push({
              id: 'yt-audio-high',
              label: `Audio MP3 (${Math.round(bestM4a.abr || 160)} kbps)`,
              ext: 'mp3',
              quality: `${Math.round(bestM4a.abr || 160)} kbps`,
              type: 'audio',
              size: aSizeStr,
              url: audioProxy,
              downloadUrl: audioProxy,
            });
          }

          // Subtitles
          const subtitles: GetSubtitle[] = [];
          if (info.subtitles) {
            for (const [lang, subList] of Object.entries(info.subtitles)) {
              if (!Array.isArray(subList)) continue;
              const subItems = subList as YtDlpSubtitle[];
              const srtOrVtt =
                subItems.find((s) => s.ext === 'srt') ||
                subItems.find((s) => s.ext === 'vtt') ||
                subItems[0];
              if (srtOrVtt && srtOrVtt.url) {
                const subExt = (srtOrVtt.ext === 'srt' ? 'srt' : 'vtt') as
                  | 'srt'
                  | 'vtt';
                subtitles.push({
                  lang,
                  label: `${lang.toUpperCase()} (${subExt.toUpperCase()})`,
                  ext: subExt,
                  url: srtOrVtt.url,
                  downloadUrl: `/api/get/download?url=${encodeURIComponent(
                    srtOrVtt.url,
                  )}&filename=${encodeURIComponent(`${cleanName}-${lang}.${subExt}`)}&type=text/plain`,
                });
              }
            }
          }

          // Fallback auto-subtitles if native subtitles are empty
          if (subtitles.length === 0 && videoId) {
            subtitles.push(
              {
                lang: 'en',
                label: 'English (SRT)',
                ext: 'srt',
                url: `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&fmt=srt`,
                downloadUrl: `/api/get/download?url=${encodeURIComponent(
                  `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&fmt=srt`,
                )}&filename=${encodeURIComponent(`${cleanName}-en.srt`)}&type=text/plain`,
              },
              {
                lang: 'vi',
                label: 'Vietnamese (SRT)',
                ext: 'srt',
                url: `https://www.youtube.com/api/timedtext?v=${videoId}&lang=vi&fmt=srt`,
                downloadUrl: `/api/get/download?url=${encodeURIComponent(
                  `https://www.youtube.com/api/timedtext?v=${videoId}&lang=vi&fmt=srt`,
                )}&filename=${encodeURIComponent(`${cleanName}-vi.srt`)}&type=text/plain`,
              },
            );
          }

          // Thumbnail
          if (thumbnail) {
            formats.push({
              id: 'yt-thumb',
              label: 'Cover Thumbnail (Max Resolution)',
              ext: 'jpg',
              quality: '1920x1080',
              type: 'thumbnail',
              url: thumbnail,
              downloadUrl: `/api/get/download?url=${encodeURIComponent(
                thumbnail,
              )}&filename=${encodeURIComponent(`${cleanName}-cover.jpg`)}&type=image/jpeg`,
            });
          }

          return resolve({
            success: true,
            platform: 'youtube',
            platformName: 'YouTube',
            id: videoId,
            title,
            author,
            duration,
            thumbnail,
            originalUrl: rawUrl,
            formats,
            subtitles,
          });
        } catch (e: unknown) {
          const message = e instanceof Error ? e.message : String(e);
          console.warn('[yt-dlp] parse error:', message);
          return resolve(null);
        }
      },
    );
  });
}

export function streamWithYtDlp(
  mediaUrl: string,
  quality?: string,
  abortSignal?: AbortSignal,
): { webStream: ReadableStream; process: ChildProcess } {
  let formatArg = 'bestvideo+bestaudio/best';
  const isAudio = quality === 'audio';

  if (isAudio) {
    formatArg = 'bestaudio/best';
  } else if (quality) {
    const numQ = parseInt(quality, 10);
    if (!isNaN(numQ) && numQ > 0) {
      formatArg = `bestvideo[height<=${numQ}]+bestaudio/best[height<=${numQ}]/best`;
    }
  }

  const args = [
    '--ffmpeg-location',
    FFMPEG_DIR,
    '-f',
    formatArg,
    '-o',
    '-',
    '--no-warnings',
    '--no-playlist',
    mediaUrl,
  ];

  const proc = spawn(YT_DLP_PATH, args, {
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  proc.stderr.on('data', (data) => {
    const text = data.toString();
    if (text.includes('ERROR')) {
      console.warn('[yt-dlp stream]', text.trim());
    }
  });

  if (isFfmpegAvailable()) {
    const ffmpegArgs = isAudio
      ? [
          '-i',
          'pipe:0',
          '-vn',
          '-c:a',
          'libmp3lame',
          '-b:a',
          '192k',
          '-f',
          'mp3',
          'pipe:1',
        ]
      : [
          '-i',
          'pipe:0',
          '-c:v',
          'copy',
          '-c:a',
          'aac',
          '-movflags',
          'frag_keyframe+empty_moov+default_base_moof',
          '-f',
          'mp4',
          'pipe:1',
        ];

    const ffmpegProc = spawn(FFMPEG_PATH, ffmpegArgs, {
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'ignore'],
    });

    proc.stdout.pipe(ffmpegProc.stdin);

    const cleanup = () => {
      try {
        proc.kill('SIGTERM');
      } catch {}
      try {
        ffmpegProc.kill('SIGTERM');
      } catch {}
    };

    proc.on('error', cleanup);
    ffmpegProc.on('error', cleanup);

    if (abortSignal) {
      abortSignal.addEventListener('abort', cleanup);
    }

    const webStream = Readable.toWeb(ffmpegProc.stdout) as ReadableStream;
    return { webStream, process: ffmpegProc };
  }

  if (abortSignal) {
    abortSignal.addEventListener('abort', () => {
      try {
        proc.kill('SIGTERM');
      } catch {}
    });
  }

  const webStream = Readable.toWeb(proc.stdout) as ReadableStream;
  return { webStream, process: proc };
}
