declare module '@hiudyy/ytdl' {
  export interface YouTubeDownloadResult {
    success?: boolean;
    filePath?: string;
    title?: string;
    author?: string;
    thumbnail?: string;
    quality?: string;
    size?: number;
    [key: string]: unknown;
  }

  export interface InstagramDownloadResult {
    medias?: Array<{
      type: 'video' | 'image';
      url: string;
      [key: string]: unknown;
    }>;
    [key: string]: unknown;
  }

  export function downloadYouTube(
    url: string,
    format: string,
    options?: Record<string, unknown>,
  ): Promise<YouTubeDownloadResult>;
  export function downloadTiktok(
    url: string,
    options?: Record<string, unknown>,
  ): Promise<Record<string, unknown>>;
  export function downloadInstagram(
    url: string,
    options?: Record<string, unknown>,
  ): Promise<InstagramDownloadResult>;
  export function isYouTubeURL(url: string): boolean;
  export function isValidTiktokURL(url: string): boolean;
  export function isValidInstagramURL(url: string): boolean;
}

declare module '@raihan07/vidly' {
  export function getInfo(url: string): Promise<{
    title?: string;
    highQuality?: string;
    lowQuality?: string;
    [key: string]: unknown;
  }>;
  export function downloadVideo(
    url: string,
    options?: Record<string, unknown>,
  ): Promise<unknown>;
  export class VideoDownloader {
    constructor(url: string);
    fetchMetadata(): Promise<unknown>;
    download(options?: Record<string, unknown>): Promise<unknown>;
  }
}
