'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import NextImage from 'next/image';
import {
  Zap,
  Link2,
  LoaderCircle,
  Download,
  Check,
  Copy,
  ExternalLink,
  Music,
  Video,
  FileText,
  Image as ImageIcon,
  Trash2,
  Tv,
  ArrowUpRight,
  X,
  Clock,
  User,
  Play,
  Layers,
  Sparkles,
  CheckSquare,
  Square,
  FileDown,
  Upload,
  Search,
  StopCircle,
  FileSpreadsheet,
  ChevronDown,
} from 'lucide-react';
import type {
  GetMediaResult,
  GetFormat,
  GetSubtitle,
  PlatformType,
} from './api/get/route';
import { sampleGetUrls } from '@/lib/studio-data';
import { motion, AnimatePresence } from 'framer-motion';
import { PlatformBrandIcon } from '@/components/platform-icon';
import { useAuthModal } from '@/components/auth/auth-modal-context';
import GetStudioSeo from '@/components/get-studio-seo';

interface Props {
  onNotice: (msg: string) => void;
}

export interface BatchItem {
  id: string;
  originalUrl: string;
  loading: boolean;
  error?: string;
  data?: GetMediaResult;
  selected: boolean;
  selectedFormatId?: string;
  status: 'idle' | 'downloading' | 'completed' | 'failed';
}

export function detectPlatformFromUrl(inputUrl: string): PlatformType {
  const low = inputUrl.toLowerCase().trim();
  if (!low) return 'other';
  if (low.includes('youtube.com') || low.includes('youtu.be')) return 'youtube';
  if (low.includes('tiktok.com') || low.includes('douyin.com')) return 'tiktok';
  if (
    low.includes('facebook.com') ||
    low.includes('fb.watch') ||
    low.includes('fb.com') ||
    low.includes('fb.me')
  )
    return 'facebook';
  if (low.includes('instagram.com') || low.includes('instagr.am'))
    return 'instagram';
  if (
    low.includes('twitter.com') ||
    low.includes('x.com') ||
    low.includes('t.co')
  )
    return 'twitter';
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
  if (low.includes('linkedin.com') || low.includes('lnkd.in'))
    return 'linkedin';
  if (
    low.includes('t.me/') ||
    low.includes('telegram.me/') ||
    low.includes('telegram.dog/')
  )
    return 'telegram';
  if (low.includes('tumblr.com') || low.includes('tmblr.co')) return 'tumblr';
  return 'other';
}

const SUPPORTED_PLATFORMS: {
  name: string;
  id: PlatformType;
  badge: string;
  color: string;
  placeholder: string;
}[] = [
  {
    name: 'YouTube',
    id: 'youtube',
    badge: 'Origin CDN',
    color: '#ff0033',
    placeholder: 'Dán liên kết YouTube (Video, Shorts, Music)...',
  },
  {
    name: 'TikTok',
    id: 'tiktok',
    badge: 'No Watermark',
    color: '#00f2fe',
    placeholder: 'Dán liên kết TikTok (Video không logo, Âm thanh)...',
  },
  {
    name: 'Facebook',
    id: 'facebook',
    badge: 'Reels / Video',
    color: '#1877f2',
    placeholder: 'Dán liên kết Facebook (Reel, Video, Watch)...',
  },
  {
    name: 'Instagram',
    id: 'instagram',
    badge: 'Post / Reel',
    color: '#e1306c',
    placeholder: 'Dán liên kết Instagram (Reel, Video, Post)...',
  },
  {
    name: 'X / Twitter',
    id: 'twitter',
    badge: 'HD MP4',
    color: '#1da1f2',
    placeholder: 'Dán liên kết X / Twitter (Video tweet, Clip)...',
  },
  {
    name: 'Vimeo',
    id: 'vimeo',
    badge: 'Akamai CDN',
    color: '#1ab7ea',
    placeholder: 'Dán liên kết Vimeo (Phim ngắn, Showcase)...',
  },
  {
    name: 'Twitch',
    id: 'twitch',
    badge: 'Clips HD',
    color: '#9146ff',
    placeholder: 'Dán liên kết Twitch Clip / Highlight...',
  },
  {
    name: 'BiliBili',
    id: 'bilibili',
    badge: 'Direct CDN',
    color: '#23ade5',
    placeholder: 'Dán liên kết BiliBili (BV/av)...',
  },
  {
    name: 'Pinterest',
    id: 'pinterest',
    badge: 'Original HD',
    color: '#e60023',
    placeholder: 'Dán liên kết Pinterest (Pin/Idea Pin)...',
  },
  {
    name: 'Weibo',
    id: 'weibo',
    badge: 'Sina CDN',
    color: '#e6162d',
    placeholder: 'Dán liên kết Weibo Video...',
  },
  {
    name: 'VK',
    id: 'vk',
    badge: 'Direct CDN',
    color: '#4c75a3',
    placeholder: 'Dán liên kết VKontakte / VK Video...',
  },
  {
    name: 'LinkedIn',
    id: 'linkedin',
    badge: 'Media Video',
    color: '#0a66c2',
    placeholder: 'Dán liên kết video LinkedIn...',
  },
  {
    name: 'Telegram',
    id: 'telegram',
    badge: 'Telescope CDN',
    color: '#24a1de',
    placeholder: 'Dán liên kết video Telegram (t.me/...)...',
  },
  {
    name: 'Tumblr',
    id: 'tumblr',
    badge: 'Origin Stream',
    color: '#36465d',
    placeholder: 'Dán liên kết video Tumblr...',
  },
];

function getBadgeClass(quality: string, type: string) {
  if (type === 'audio') return 'badge-audio';
  if (type === 'subtitle') return 'badge-sub';
  const q = quality.toLowerCase();
  if (q.includes('4k') || q.includes('2160')) return 'badge-4k';
  if (q.includes('1080')) return 'badge-1080p';
  if (q.includes('720')) return 'badge-720p';
  return 'badge-sd';
}

function extractUrlsFromText(text: string): string[] {
  const matches = text.match(/https?:\/\/[^\s"'<>]+/gi) || [];
  const unique = Array.from(new Set(matches.map((m) => m.trim())));
  return unique.slice(0, 30);
}

function pickFormatByPreset(
  formats: GetFormat[],
  preset: 'highest' | '1080p' | '720p' | 'audio',
): GetFormat | undefined {
  if (!formats || formats.length === 0) return undefined;

  if (preset === 'audio') {
    const audios = formats.filter((f) => f.type === 'audio');
    if (audios.length > 0) return audios[0];
  }

  const videos = formats.filter((f) => f.type === 'video');
  if (videos.length === 0) return formats[0];

  if (preset === 'highest') {
    return videos[0];
  }

  if (preset === '1080p') {
    const f1080 = videos.find((f) => f.quality.includes('1080'));
    if (f1080) return f1080;
    return videos[0];
  }

  if (preset === '720p') {
    const f720 = videos.find((f) => f.quality.includes('720'));
    if (f720) return f720;
    return videos[0];
  }

  return videos[0];
}

export default function GetStudio({ onNotice }: Props) {
  const { isAuthenticated, requireAuth, openAuthModal } = useAuthModal();

  // Mode switcher: 'single' (traditional) | 'batch' (multi-URL)
  const [mode, setMode] = useState<'single' | 'batch'>('single');

  // Single URL state
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<GetMediaResult | null>(null);
  const [activeTab, setActiveTab] = useState<
    'video' | 'audio' | 'subtitles' | 'thumbnail'
  >('video');
  const [previewFormat, setPreviewFormat] = useState<GetFormat | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pasteSuccess, setPasteSuccess] = useState(false);
  const [speedMode, setSpeedMode] = useState<'fast' | 'proxy'>('fast');

  // Platform selector & auto-detect state
  const [selectedPlatform, setSelectedPlatform] = useState<
    PlatformType | 'auto'
  >('auto');
  const [isAutoDetected, setIsAutoDetected] = useState(false);
  const [platformDropdownOpen, setPlatformDropdownOpen] = useState(false);
  const [platformSearchQuery, setPlatformSearchQuery] = useState('');
  const platformDropdownRef = useRef<HTMLDivElement>(null);

  // Batch download state
  const [batchText, setBatchText] = useState('');
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchError, setBatchError] = useState('');
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [batchQualityPreset, setBatchQualityPreset] = useState<
    'highest' | '1080p' | '720p' | 'audio'
  >('highest');
  const [batchDownloading, setBatchDownloading] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [batchSearch, setBatchSearch] = useState('');
  const [batchPlatformFilter, setBatchPlatformFilter] = useState<string>('all');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cancelBatchRef = useRef<boolean>(false);

  // History state
  const [history, setHistory] = useState<GetMediaResult[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const stored =
          localStorage.getItem('apexa-get-history-v1') ||
          localStorage.getItem('frame-get-history-v1');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            return parsed.slice(0, 10);
          }
        }
      }
    } catch {}
    return [];
  });

  // Close platform dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        platformDropdownRef.current &&
        !platformDropdownRef.current.contains(e.target as Node)
      ) {
        setPlatformDropdownOpen(false);
      }
    }
    if (platformDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [platformDropdownOpen]);

  // Global keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (platformDropdownOpen) {
          setPlatformDropdownOpen(false);
        } else if (previewFormat) {
          setPreviewFormat(null);
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewFormat, platformDropdownOpen]);

  const activePlatformInfo = useMemo(() => {
    if (selectedPlatform === 'auto') return null;
    return SUPPORTED_PLATFORMS.find((p) => p.id === selectedPlatform) || null;
  }, [selectedPlatform]);

  const currentPlaceholder = useMemo(() => {
    if (activePlatformInfo) {
      return activePlatformInfo.placeholder;
    }
    return 'Dán link YouTube, TikTok, Facebook, Instagram, X, Vimeo, Twitch, Bilibili, Pinterest...';
  }, [activePlatformInfo]);

  const filteredDropdownPlatforms = useMemo(() => {
    if (!platformSearchQuery.trim()) return SUPPORTED_PLATFORMS;
    const q = platformSearchQuery.toLowerCase();
    return SUPPORTED_PLATFORMS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.badge.toLowerCase().includes(q) ||
        p.id.includes(q),
    );
  }, [platformSearchQuery]);

  const detectedUrls = useMemo(
    () => extractUrlsFromText(batchText),
    [batchText],
  );

  // Batch statistics
  const batchStats = useMemo(() => {
    const selected = batchItems.filter((i) => i.selected);
    let totalMb = 0;
    let completed = 0;

    for (const item of batchItems) {
      if (item.status === 'completed') completed++;
      if (item.selected && item.data) {
        const fmt =
          item.data.formats.find((f) => f.id === item.selectedFormatId) ||
          item.data.formats[0];
        if (fmt?.size) {
          const num = parseFloat(fmt.size.replace(/[^\d.]/g, ''));
          if (!isNaN(num)) {
            if (fmt.size.toLowerCase().includes('gb')) totalMb += num * 1024;
            else if (fmt.size.toLowerCase().includes('mb')) totalMb += num;
            else if (fmt.size.toLowerCase().includes('kb'))
              totalMb += num / 1024;
          }
        }
      }
    }

    return {
      total: batchItems.length,
      selected: selected.length,
      completed,
      estimatedSize:
        totalMb > 0
          ? totalMb >= 1024
            ? `${(totalMb / 1024).toFixed(2)} GB`
            : `${totalMb.toFixed(1)} MB`
          : null,
    };
  }, [batchItems]);

  // Platform breakdown in batch list
  const platformCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of batchItems) {
      const p = item.data?.platform || 'other';
      counts[p] = (counts[p] || 0) + 1;
    }
    return counts;
  }, [batchItems]);

  // Filtered batch items based on search and platform tab
  const filteredBatchItems = useMemo(() => {
    return batchItems.filter((item) => {
      if (
        batchPlatformFilter !== 'all' &&
        item.data?.platform !== batchPlatformFilter
      ) {
        return false;
      }
      if (batchSearch.trim()) {
        const q = batchSearch.toLowerCase();
        const title = item.data?.title?.toLowerCase() || '';
        const author = item.data?.author?.toLowerCase() || '';
        const origUrl = item.originalUrl.toLowerCase();
        if (!title.includes(q) && !author.includes(q) && !origUrl.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [batchItems, batchSearch, batchPlatformFilter]);

  function saveToHistory(item: GetMediaResult) {
    try {
      const filtered = history.filter(
        (x) => x.originalUrl !== item.originalUrl,
      );
      const updated = [item, ...filtered].slice(0, 10);
      setHistory(updated);
      localStorage.setItem('apexa-get-history-v1', JSON.stringify(updated));
    } catch {}
  }

  function clearHistory() {
    setHistory([]);
    try {
      localStorage.removeItem('apexa-get-history-v1');
      localStorage.removeItem('frame-get-history-v1');
      onNotice('Download history cleared.');
    } catch {}
  }

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        const clean = text.trim();
        setUrl(clean);
        setPasteSuccess(true);
        setTimeout(() => setPasteSuccess(false), 1600);
        const detected = detectPlatformFromUrl(clean);
        if (detected !== 'other') {
          setSelectedPlatform(detected);
          setIsAutoDetected(true);
          const pInfo = SUPPORTED_PLATFORMS.find((p) => p.id === detected);
          onNotice(`⚡ Đã tự động nhận diện: ${pInfo?.name || detected}`);
        } else {
          setSelectedPlatform('auto');
          setIsAutoDetected(false);
        }
        void handleGet(clean);
      }
    } catch {
      onNotice('Vui lòng cho phép quyền clipboard hoặc dán thủ công.');
    }
  }

  async function handleGet(targetUrl?: string) {
    const fetchUrl = (targetUrl ?? url).trim();
    if (!fetchUrl) {
      setError('Vui lòng nhập liên kết video hoặc âm thanh.');
      return;
    }

    if (
      !requireAuth(
        () => void handleGet(targetUrl),
        'Vui lòng đăng nhập để phân tích và tải media từ Get Studio.',
      )
    ) {
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/get', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: fetchUrl }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.error || 'Không thể trích xuất media từ liên kết.',
        );
      }

      setResult(data);
      saveToHistory(data);
      onNotice(`⚡ Đã phân tích thành công: ${data.title}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể lấy dữ liệu.');
    } finally {
      setLoading(false);
    }
  }

  async function triggerDownload(
    format: GetFormat | GetSubtitle,
    overrideMode?: 'fast' | 'proxy',
    mediaTitleParam?: string,
  ) {
    if (
      !requireAuth(
        () => void triggerDownload(format, overrideMode, mediaTitleParam),
        'Vui lòng đăng nhập để tải file media về thiết bị.',
      )
    ) {
      return;
    }

    const chosenMode = overrideMode || speedMode;
    const downloadId = format.downloadUrl || format.url;
    setDownloadingId(downloadId);

    const mediaTitle = mediaTitleParam || result?.title || 'media';
    const cleanTitle =
      mediaTitle
        .replace(/[^\w\s.-]/g, '')
        .trim()
        .slice(0, 60) || 'media';
    const ext = ('ext' in format ? format.ext : 'mp4') || 'mp4';
    const quality = ('quality' in format ? format.quality : '').replace(
      /\s+/g,
      '-',
    );
    const filename = `${cleanTitle}${quality ? `-${quality}` : ''}.${ext}`;

    const isDirectCdn =
      chosenMode === 'fast' &&
      format.url &&
      !format.url.startsWith('/') &&
      !format.url.includes('googlevideo.com');

    if (isDirectCdn) {
      onNotice(
        `⚡ Đang kết nối tải siêu tốc CDN: ${'label' in format ? format.label : 'Media'}`,
      );

      // Strategy A: Direct client-side blob fetch if CDN allows CORS (fastest + exact filename)
      try {
        const ctrl = new AbortController();
        const timeoutId = setTimeout(() => ctrl.abort(), 3500);
        const res = await fetch(format.url, {
          mode: 'cors',
          signal: ctrl.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const blob = await res.blob();
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(blobUrl), 20000);
          onNotice(
            `✅ Tải siêu tốc thành công: ${'label' in format ? format.label : 'Media'}`,
          );
          setDownloadingId(null);
          return;
        }
      } catch {
        // Fall through to Strategy B
      }

      // Strategy B: Direct CDN anchor download
      const a = document.createElement('a');
      a.href = format.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      onNotice(
        `⚡ Bắt đầu tải trực tiếp từ CDN: ${'label' in format ? format.label : 'Media'}`,
      );
      setTimeout(() => setDownloadingId(null), 2000);
      return;
    }

    // Strategy C: High-performance streaming proxy (supports Range, HEAD, and exact filename)
    const downloadUrl = format.downloadUrl || format.url;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    onNotice(
      `⬇️ Bắt đầu tải file: ${'label' in format ? format.label : 'Media'}`,
    );
    setTimeout(() => setDownloadingId(null), 2000);
  }

  function copyLink(text: string) {
    const fullUrl = text.startsWith('/')
      ? `${window.location.origin}${text}`
      : text;
    void navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    onNotice(
      '📋 Đã sao chép link stream trực tiếp (dán vào IDM/FDM để tải tối đa tốc độ).',
    );
    setTimeout(() => setCopied(false), 2500);
  }

  function handleSelectPlatformPill(platformId: PlatformType) {
    // Look for matching sample URL
    const match = sampleGetUrls.find(
      (s) =>
        s.platform.toLowerCase().includes(platformId) ||
        (platformId === 'twitter' && s.platform.includes('X')),
    );

    if (mode === 'single') {
      setSelectedPlatform(platformId);
      setIsAutoDetected(false);
      if (match) {
        setUrl(match.url);
        void handleGet(match.url);
        onNotice(`💡 Đã nạp liên kết mẫu ${match.platform}: "${match.title}"`);
      } else {
        onNotice(
          `💡 Đã chọn nền tảng ${platformId}. Hãy dán liên kết của bạn vào ô bên dưới.`,
        );
      }
    } else {
      // In batch mode, filter or add
      if (match) {
        setBatchText((prev) =>
          prev ? `${prev.trim()}\n${match.url}` : match.url,
        );
        onNotice(
          `💡 Đã thêm liên kết mẫu ${match.platform} vào danh sách hàng loạt.`,
        );
      }
    }
  }

  // ── Batch Mode Handlers ──

  async function handleBatchPaste() {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setBatchText((prev) =>
          prev ? `${prev.trim()}\n${text.trim()}` : text.trim(),
        );
        onNotice('📋 Đã dán nội dung từ clipboard.');
      }
    } catch {
      onNotice('Vui lòng cấp quyền clipboard hoặc dán thủ công.');
    }
  }

  function fillSampleBatchLinks() {
    const sampleUrls = sampleGetUrls.map((s) => s.url);
    setBatchText(sampleUrls.join('\n'));
    onNotice(`💡 Đã nạp ${sampleUrls.length} liên kết mẫu từ các nền tảng.`);
  }

  // File import for batch (.txt file)
  function handleFileRead(file: File) {
    if (!file.name.match(/\.(txt|url|text)$/i) && file.type !== 'text/plain') {
      onNotice('Vui lòng chọn file văn bản (.txt) chứa danh sách liên kết.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) || '';
      const extracted = extractUrlsFromText(text);
      if (extracted.length === 0) {
        onNotice('Không tìm thấy liên kết hợp lệ trong tệp này.');
        return;
      }
      setBatchText((prev) =>
        prev ? `${prev.trim()}\n${extracted.join('\n')}` : extracted.join('\n'),
      );
      onNotice(
        `📁 Đã nhập ${extracted.length} liên kết từ tệp "${file.name}".`,
      );
    };
    reader.readAsText(file);
  }

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileRead(e.dataTransfer.files[0]);
    }
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      handleFileRead(e.target.files[0]);
      e.target.value = '';
    }
  }

  async function handleResolveBatch() {
    if (detectedUrls.length === 0) {
      onNotice('Vui lòng dán ít nhất 1 liên kết hợp lệ.');
      return;
    }

    if (
      !requireAuth(
        () => void handleResolveBatch(),
        'Vui lòng đăng nhập để phân tích danh sách media.',
      )
    ) {
      return;
    }

    setBatchLoading(true);
    setBatchError('');

    const initialItems: BatchItem[] = detectedUrls.map((u, idx) => ({
      id: `batch-${Date.now()}-${idx}`,
      originalUrl: u,
      loading: true,
      selected: true,
      status: 'idle',
    }));
    setBatchItems(initialItems);

    try {
      const res = await fetch('/api/get', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: detectedUrls }),
      });

      const json = await res.json();
      if (!res.ok || !json.results) {
        throw new Error(json.error || 'Lỗi khi xử lý danh sách liên kết.');
      }

      const results: GetMediaResult[] = json.results;
      const updatedItems: BatchItem[] = results.map((r, idx) => {
        const defaultFormat = pickFormatByPreset(
          r.formats || [],
          batchQualityPreset,
        );
        return {
          id: `batch-${Date.now()}-${idx}`,
          originalUrl: r.originalUrl,
          loading: false,
          error: r.success ? undefined : r.error || 'Không thể lấy dữ liệu.',
          data: r,
          selected: r.success,
          selectedFormatId: defaultFormat?.id || r.formats?.[0]?.id,
          status: 'idle',
        };
      });

      setBatchItems(updatedItems);
      const successCount = updatedItems.filter((i) => i.data?.success).length;
      onNotice(
        `⚡ Đã phân tích thành công ${successCount}/${updatedItems.length} liên kết!`,
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Lỗi phân tích hàng loạt.';
      setBatchError(msg);
      onNotice(`❌ ${msg}`);
    } finally {
      setBatchLoading(false);
    }
  }

  function handleToggleSelectItem(itemId: string) {
    setBatchItems((prev) =>
      prev.map((it) =>
        it.id === itemId ? { ...it, selected: !it.selected } : it,
      ),
    );
  }

  function handleToggleSelectAll() {
    const allSelected =
      batchItems.length > 0 && batchItems.every((i) => i.selected);
    setBatchItems((prev) =>
      prev.map((it) => ({ ...it, selected: !allSelected })),
    );
  }

  function handleSelectBatchItemFormat(itemId: string, formatId: string) {
    setBatchItems((prev) =>
      prev.map((it) =>
        it.id === itemId ? { ...it, selectedFormatId: formatId } : it,
      ),
    );
  }

  function handleApplyPreset(preset: 'highest' | '1080p' | '720p' | 'audio') {
    setBatchQualityPreset(preset);
    setBatchItems((prev) =>
      prev.map((it) => {
        if (!it.data?.formats) return it;
        const fmt = pickFormatByPreset(it.data.formats, preset);
        return { ...it, selectedFormatId: fmt?.id || it.selectedFormatId };
      }),
    );
    onNotice(`Đã áp dụng định dạng "${preset}" cho tất cả mục.`);
  }

  function handleRemoveBatchItem(itemId: string) {
    setBatchItems((prev) => prev.filter((it) => it.id !== itemId));
  }

  function handleCancelBatch() {
    cancelBatchRef.current = true;
    setBatchDownloading(false);
    onNotice('⏹️ Đã dừng tiến trình tải hàng loạt.');
  }

  async function handleDownloadBatch() {
    const selectedItems = batchItems.filter(
      (i) => i.selected && i.data && i.data.formats.length > 0,
    );
    if (selectedItems.length === 0) {
      onNotice('Vui lòng chọn ít nhất một video/audio để tải.');
      return;
    }

    if (
      !requireAuth(
        () => void handleDownloadBatch(),
        'Vui lòng đăng nhập để tải hàng loạt file media.',
      )
    ) {
      return;
    }

    cancelBatchRef.current = false;
    setBatchDownloading(true);
    setBatchProgress({ current: 0, total: selectedItems.length });
    onNotice(`🚀 Bắt đầu tải hàng loạt ${selectedItems.length} tệp...`);

    for (let index = 0; index < selectedItems.length; index++) {
      if (cancelBatchRef.current) break;

      const item = selectedItems[index];
      setBatchProgress({ current: index + 1, total: selectedItems.length });

      setBatchItems((prev) =>
        prev.map((it) =>
          it.id === item.id ? { ...it, status: 'downloading' } : it,
        ),
      );

      const targetFormat =
        item.data?.formats.find((f) => f.id === item.selectedFormatId) ||
        item.data?.formats[0];

      if (targetFormat && item.data) {
        try {
          await triggerDownload(targetFormat, speedMode, item.data.title);
          setBatchItems((prev) =>
            prev.map((it) =>
              it.id === item.id ? { ...it, status: 'completed' } : it,
            ),
          );
        } catch {
          setBatchItems((prev) =>
            prev.map((it) =>
              it.id === item.id ? { ...it, status: 'failed' } : it,
            ),
          );
        }
      }

      if (index < selectedItems.length - 1 && !cancelBatchRef.current) {
        await new Promise((r) => setTimeout(r, 1200));
      }
    }

    setBatchDownloading(false);
    if (!cancelBatchRef.current) {
      onNotice(`🎉 Đã kích hoạt tải xong ${selectedItems.length} tệp tin!`);
    }
  }

  function copyAllBatchLinks() {
    const selectedItems = batchItems.filter((i) => i.selected && i.data);
    if (selectedItems.length === 0) {
      onNotice('Vui lòng chọn ít nhất một liên kết.');
      return;
    }

    const links = selectedItems
      .map((item) => {
        const fmt =
          item.data?.formats.find((f) => f.id === item.selectedFormatId) ||
          item.data?.formats[0];
        return fmt?.url || '';
      })
      .filter(Boolean);

    if (links.length === 0) {
      onNotice('Không tìm thấy liên kết hợp lệ.');
      return;
    }

    const text = links.join('\n');
    void navigator.clipboard.writeText(text);
    onNotice(
      `📋 Đã sao chép ${links.length} liên kết CDN máy chủ gốc! Dán trực tiếp vào IDM/FDM để tải.`,
    );
  }

  function exportBatchLinksToFile() {
    const selectedItems = batchItems.filter((i) => i.selected && i.data);
    if (selectedItems.length === 0) {
      onNotice('Vui lòng chọn ít nhất một liên kết để xuất file.');
      return;
    }

    const lines = selectedItems
      .map((item) => {
        const fmt =
          item.data?.formats.find((f) => f.id === item.selectedFormatId) ||
          item.data?.formats[0];
        return fmt?.url || '';
      })
      .filter(Boolean);

    if (lines.length === 0) {
      onNotice('Không tìm thấy liên kết hợp lệ.');
      return;
    }

    const blob = new Blob([lines.join('\r\n')], {
      type: 'text/plain;charset=utf-8',
    });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `frame-get-links-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    onNotice(
      `📁 Đã xuất danh sách ${lines.length} link vào file .txt (Sẵn sàng nạp vào IDM / FDM / aria2).`,
    );
  }

  const videoFormats = result?.formats.filter((f) => f.type === 'video') || [];
  const audioFormats = result?.formats.filter((f) => f.type === 'audio') || [];
  const subtitleFormats = result?.subtitles || [];
  const thumbFormat = result?.formats.find((f) => f.type === 'thumbnail');

  const bestVideoFormat = videoFormats[0];
  const bestAudioFormat = audioFormats[0];

  const allBatchSelected =
    batchItems.length > 0 && batchItems.every((i) => i.selected);
  const selectedBatchCount = batchItems.filter((i) => i.selected).length;

  return (
    <div className="get-studio-container">
      {!isAuthenticated && (
        <div className="studio-preview-banner">
          <div className="preview-banner-text">
            <Sparkles size={16} className="text-[#00d2ff]" />
            <span>
              <strong>Chế độ xem trước:</strong> Đăng nhập tài khoản Apexa để
              phân tích và tải video / âm thanh chất lượng gốc từ hơn 15 nền
              tảng.
            </span>
          </div>
          <button
            type="button"
            className="btn-banner-login"
            onClick={() =>
              openAuthModal(
                'login',
                'Vui lòng đăng nhập để sử dụng tính năng Get Studio.',
              )
            }
          >
            Đăng nhập ngay
          </button>
        </div>
      )}
      {/* Hidden File Input for .txt link list import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.url,.text"
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
      />

      {/* ── Hero & Search Section ── */}
      <section className="get-hero">
        <h1 className="get-hero-title">
          Apexa Get<span className="brand-dot">.</span>
        </h1>
        <p className="get-hero-desc">
          Tải video & âm thanh chất lượng gốc siêu tốc từ máy chủ CDN của 14+
          nền tảng: <strong>Facebook Reels</strong>,{' '}
          <strong>TikTok không logo</strong>, <strong>YouTube 4K</strong>,{' '}
          <strong>Instagram</strong>, <strong>X / Twitter</strong> và tách nhạc{' '}
          <strong>MP3 320kbps</strong> miễn phí 100%.
        </p>

        {/* Mode Switcher */}
        <div className="get-mode-switch">
          <button
            type="button"
            className={`get-mode-btn ${mode === 'single' ? 'active' : ''}`}
            onClick={() => setMode('single')}
          >
            <Link2 size={16} />
            <span>Tải đơn lẻ (Single Link)</span>
          </button>
          <button
            type="button"
            className={`get-mode-btn ${mode === 'batch' ? 'active' : ''}`}
            onClick={() => setMode('batch')}
          >
            <Layers size={16} />
            <span>Tải hàng loạt (Batch Download)</span>
            {batchItems.length > 0 && (
              <span className="get-mode-badge">{batchItems.length}</span>
            )}
          </button>
        </div>

        {/* Mode 1: Single URL Input */}
        {mode === 'single' && (
          <div className="get-search-box">
            <div className="get-input-wrap">
              {/* Platform Selector Dropdown */}
              <div
                className="get-platform-selector-wrap"
                ref={platformDropdownRef}
              >
                <button
                  type="button"
                  className={`get-platform-trigger ${selectedPlatform !== 'auto' ? 'is-selected' : ''} ${platformDropdownOpen ? 'is-open' : ''}`}
                  onClick={() => setPlatformDropdownOpen((prev) => !prev)}
                  title="Chọn nền tảng tải hoặc để tự động nhận diện theo liên kết"
                  aria-expanded={platformDropdownOpen}
                  aria-haspopup="listbox"
                >
                  {activePlatformInfo ? (
                    <>
                      <PlatformBrandIcon id={activePlatformInfo.id} size={18} />
                      <span className="platform-trigger-name">
                        {activePlatformInfo.name}
                      </span>
                      {isAutoDetected && (
                        <span
                          className="platform-trigger-tag"
                          title="Hệ thống tự động nhận diện từ liên kết"
                        >
                          AUTO
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <PlatformBrandIcon id="auto" size={17} />
                      <span className="platform-trigger-name">Tự động</span>
                    </>
                  )}
                  <ChevronDown
                    size={13}
                    className={`platform-trigger-chevron ${platformDropdownOpen ? 'rotate' : ''}`}
                  />
                </button>

                {/* Dropdown Menu (Opens Downwards) */}
                <AnimatePresence>
                  {platformDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.16, ease: 'easeOut' }}
                      className="get-platform-dropdown"
                    >
                      <div className="platform-dropdown-header">
                        <span className="platform-dropdown-title">
                          Nền tảng tải xuống
                        </span>
                        <span className="platform-dropdown-count">14 CDN</span>
                      </div>

                      {/* Quick Search */}
                      <div className="platform-dropdown-search-wrap">
                        <Search
                          size={13}
                          className="platform-dropdown-search-icon"
                        />
                        <input
                          type="text"
                          className="platform-dropdown-search-input"
                          placeholder="Lọc nền tảng..."
                          value={platformSearchQuery}
                          onChange={(e) =>
                            setPlatformSearchQuery(e.target.value)
                          }
                        />
                        {platformSearchQuery && (
                          <button
                            type="button"
                            className="platform-dropdown-search-clear"
                            onClick={() => setPlatformSearchQuery('')}
                            aria-label="Xóa bộ lọc"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>

                      <div className="platform-dropdown-list" role="menu">
                        {/* Auto-detect option */}
                        {!platformSearchQuery && (
                          <button
                            type="button"
                            className={`platform-dropdown-item auto-detect-item ${selectedPlatform === 'auto' ? 'active' : ''}`}
                            onClick={() => {
                              setSelectedPlatform('auto');
                              setIsAutoDetected(false);
                              setPlatformDropdownOpen(false);
                              if (url.trim()) {
                                const det = detectPlatformFromUrl(url);
                                if (det !== 'other') {
                                  setSelectedPlatform(det);
                                  setIsAutoDetected(true);
                                }
                              }
                            }}
                            role="menuitemradio"
                            aria-checked={selectedPlatform === 'auto'}
                          >
                            <div className="platform-dropdown-item-left">
                              <PlatformBrandIcon id="auto" size={22} />
                              <div className="platform-dropdown-item-meta">
                                <span className="platform-item-title">
                                  Tự động nhận diện
                                </span>
                                <span className="platform-item-desc">
                                  Phát hiện máy chủ qua link dán
                                </span>
                              </div>
                            </div>
                            {selectedPlatform === 'auto' && (
                              <Check
                                size={14}
                                className="platform-item-check"
                              />
                            )}
                          </button>
                        )}

                        <div className="platform-dropdown-divider-text">
                          NỀN TẢNG HỖ TRỢ ({filteredDropdownPlatforms.length})
                        </div>

                        {filteredDropdownPlatforms.map((p) => {
                          const isSelected = selectedPlatform === p.id;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              className={`platform-dropdown-item ${isSelected ? 'active' : ''}`}
                              onClick={() => {
                                setSelectedPlatform(p.id);
                                setIsAutoDetected(false);
                                setPlatformDropdownOpen(false);
                                setPlatformSearchQuery('');
                                onNotice(`🎯 Đã chọn nền tảng ${p.name}`);
                              }}
                              role="menuitemradio"
                              aria-checked={isSelected}
                            >
                              <div className="platform-dropdown-item-left">
                                <PlatformBrandIcon id={p.id} size={22} />
                                <span className="platform-item-title">
                                  {p.name}
                                </span>
                              </div>
                              <div className="platform-dropdown-item-right">
                                <span className="pill-badge">{p.badge}</span>
                                {isSelected && (
                                  <Check
                                    size={14}
                                    className="platform-item-check"
                                  />
                                )}
                              </div>
                            </button>
                          );
                        })}

                        {filteredDropdownPlatforms.length === 0 && (
                          <div className="platform-dropdown-empty">
                            <span>Không tìm thấy nền tảng phù hợp</span>
                          </div>
                        )}
                      </div>

                      {/* Footer: Quick sample button if platform is selected */}
                      {activePlatformInfo && (
                        <div className="platform-dropdown-footer">
                          <button
                            type="button"
                            className="platform-dropdown-sample-btn"
                            onClick={() => {
                              handleSelectPlatformPill(activePlatformInfo.id);
                              setPlatformDropdownOpen(false);
                            }}
                          >
                            <PlatformBrandIcon
                              id={activePlatformInfo.id}
                              size={14}
                            />
                            <span>Thử link mẫu {activePlatformInfo.name}</span>
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="selector-divider" />

              <input
                type="url"
                className="get-url-input"
                placeholder={currentPlaceholder}
                value={url}
                onChange={(e) => {
                  const val = e.target.value;
                  setUrl(val);
                  if (error) setError('');
                  if (val.trim()) {
                    const detected = detectPlatformFromUrl(val);
                    if (detected !== 'other') {
                      setSelectedPlatform(detected);
                      setIsAutoDetected(true);
                    } else if (isAutoDetected) {
                      setSelectedPlatform('auto');
                      setIsAutoDetected(false);
                    }
                  } else {
                    if (isAutoDetected) {
                      setSelectedPlatform('auto');
                      setIsAutoDetected(false);
                    }
                  }
                }}
                onPaste={(e) => {
                  const pasted = e.clipboardData.getData('text');
                  if (pasted && pasted.trim()) {
                    const detected = detectPlatformFromUrl(pasted.trim());
                    if (detected !== 'other') {
                      setSelectedPlatform(detected);
                      setIsAutoDetected(true);
                      const pInfo = SUPPORTED_PLATFORMS.find(
                        (p) => p.id === detected,
                      );
                      onNotice(
                        `⚡ Đã tự động nhận diện: ${pInfo?.name || detected}`,
                      );
                    }
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void handleGet();
                }}
              />
              {url && (
                <button
                  type="button"
                  className="get-clear-btn"
                  onClick={() => {
                    setUrl('');
                    setResult(null);
                    setError('');
                    if (isAutoDetected) {
                      setSelectedPlatform('auto');
                      setIsAutoDetected(false);
                    }
                  }}
                  aria-label="Xóa ô nhập"
                  title="Xóa nội dung ô nhập"
                >
                  <X size={15} />
                </button>
              )}
              <button
                type="button"
                className={`get-paste-btn ${pasteSuccess ? 'pasted' : ''}`}
                onClick={handlePaste}
                title="Dán từ Clipboard (Ctrl+V)"
              >
                {pasteSuccess ? (
                  <>
                    <Check size={14} />
                    <span>Đã dán!</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Dán link</span>
                    <kbd className="get-kbd-hint">Ctrl+V</kbd>
                  </>
                )}
              </button>
            </div>
            <motion.button
              whileHover={{ scale: url.trim() && !loading ? 1.02 : 1 }}
              whileTap={{ scale: url.trim() && !loading ? 0.98 : 1 }}
              className={`get-submit-btn ${url.trim() ? 'is-ready' : ''}`}
              disabled={loading || !url.trim()}
              onClick={() => handleGet()}
              type="button"
            >
              {loading ? (
                <>
                  <LoaderCircle className="spin" size={17} />
                  <span>Đang phân tích…</span>
                </>
              ) : (
                <>
                  <Zap size={16} />
                  <span>Lấy dữ liệu</span>
                  {url.trim() && <kbd className="get-enter-badge">↵</kbd>}
                </>
              )}
            </motion.button>
          </div>
        )}

        {/* Quick Platform Chips Bar */}
        {mode === 'single' && (
          <div className="get-quick-platforms">
            <span className="quick-platform-label">Nền tảng phổ biến:</span>
            {(
              [
                { id: 'youtube', name: 'YouTube', tag: '4K / MP3' },
                { id: 'tiktok', name: 'TikTok', tag: 'No Logo' },
                { id: 'facebook', name: 'Facebook', tag: 'Reels HD' },
                { id: 'instagram', name: 'Instagram', tag: 'Reels' },
                { id: 'twitter', name: 'X / Twitter', tag: 'MP4' },
                { id: 'pinterest', name: 'Pinterest' },
                { id: 'vimeo', name: 'Vimeo' },
                { id: 'bilibili', name: 'Bilibili' },
              ] as Array<{ id: PlatformType; name: string; tag?: string }>
            ).map((p) => {
              const isActive = selectedPlatform === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  className={`quick-platform-chip ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    handleSelectPlatformPill(p.id);
                    onNotice(`🎯 Đã chọn ${p.name}`);
                  }}
                  title={`Lọc nền tảng ${p.name}`}
                >
                  <PlatformBrandIcon id={p.id} size={15} />
                  <span>{p.name}</span>
                  {p.tag && <span className="chip-tag">{p.tag}</span>}
                </button>
              );
            })}
          </div>
        )}

        {/* Mode 2: Batch URL Input with Drag & Drop */}
        {mode === 'batch' && (
          <div
            className={`batch-input-card ${isDragging ? 'is-dragging' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileDrop}
          >
            {isDragging && (
              <div className="batch-drop-overlay">
                <Upload
                  size={32}
                  color="#00d2ff"
                  className="drop-icon-bounce"
                />
                <span>
                  Thả tệp text (.txt) vào đây để nạp tự động danh sách link
                </span>
              </div>
            )}

            <div className="batch-textarea-wrap">
              <textarea
                className="batch-textarea"
                placeholder={`Dán danh sách các link video/audio (mỗi link trên 1 dòng) hoặc kéo thả file .txt vào đây.
Hỗ trợ tối đa 30 liên kết cùng lúc:
https://www.youtube.com/watch?v=...
https://www.tiktok.com/@user/video/...
https://vimeo.com/...
https://www.pinterest.com/pin/...`}
                rows={5}
                value={batchText}
                onChange={(e) => {
                  setBatchText(e.target.value);
                  if (batchError) setBatchError('');
                }}
              />
            </div>
            <div className="batch-toolbar">
              <div className="batch-toolbar-left">
                <span className="batch-url-count">
                  🔗 {detectedUrls.length} liên kết hợp lệ
                </span>
                <button
                  type="button"
                  className="batch-tool-btn"
                  onClick={handleBatchPaste}
                  title="Dán nhanh từ Clipboard"
                >
                  <Copy size={13} />
                  <span>Dán clipboard</span>
                </button>
                <button
                  type="button"
                  className="batch-tool-btn"
                  onClick={() => fileInputRef.current?.click()}
                  title="Tải lên tệp .txt chứa danh sách link"
                >
                  <Upload size={13} />
                  <span>Nhập file .txt</span>
                </button>
                <button
                  type="button"
                  className="batch-tool-btn"
                  onClick={fillSampleBatchLinks}
                  title="Điền các liên kết mẫu thử nghiệm"
                >
                  <Sparkles size={13} />
                  <span>Link mẫu</span>
                </button>
                {batchText && (
                  <button
                    type="button"
                    className="batch-tool-btn danger"
                    onClick={() => {
                      setBatchText('');
                      setBatchItems([]);
                    }}
                    title="Xóa toàn bộ nội dung"
                  >
                    <Trash2 size={13} />
                    <span>Xóa tất cả</span>
                  </button>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="get-submit-btn"
                disabled={batchLoading || detectedUrls.length === 0}
                onClick={handleResolveBatch}
              >
                {batchLoading ? (
                  <>
                    <LoaderCircle className="spin" size={17} />
                    <span>Đang phân tích ({detectedUrls.length})…</span>
                  </>
                ) : (
                  <>
                    <Zap size={17} />
                    <span>Phân tích hàng loạt ({detectedUrls.length})</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        )}

        <AnimatePresence>
          {(error || batchError) && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="get-error-banner"
            >
              <X size={16} />
              <span>{error || batchError}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ── Mode 1: Single Media Result Card ── */}
      {mode === 'single' && (
        <AnimatePresence>
          {result && (
            <motion.section
              initial={{ opacity: 0, y: 22, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="get-result-section"
            >
              <div className="get-result-card">
                {/* Left: Thumbnail & basic meta */}
                <div className="get-result-media">
                  {previewFormat ? (
                    <div className="preview-player-container">
                      {previewFormat.type === 'audio' ? (
                        <div className="audio-player-preview">
                          <div className="audio-player-header">
                            <div className="audio-wave-visualizer">
                              <span className="wave-bar bar-1" />
                              <span className="wave-bar bar-2" />
                              <span className="wave-bar bar-3" />
                              <span className="wave-bar bar-4" />
                              <span className="wave-bar bar-5" />
                              <span className="wave-bar bar-6" />
                              <span className="wave-bar bar-7" />
                              <span className="wave-bar bar-8" />
                            </div>
                            <div className="audio-player-meta">
                              <b className="audio-track-title">
                                {previewFormat.label}
                              </b>
                              <span>Luồng âm thanh gốc trực tiếp</span>
                            </div>
                          </div>
                          <audio
                            controls
                            autoPlay
                            src={
                              previewFormat.downloadUrl
                                ? `${previewFormat.downloadUrl}${previewFormat.downloadUrl.includes('?') ? '&' : '?'}inline=1`
                                : previewFormat.url
                            }
                            style={{ width: '100%', marginTop: 12 }}
                          >
                            <track kind="captions" />
                          </audio>
                        </div>
                      ) : (
                        <video
                          controls
                          autoPlay
                          src={
                            previewFormat.downloadUrl
                              ? `${previewFormat.downloadUrl}${previewFormat.downloadUrl.includes('?') ? '&' : '?'}inline=1`
                              : previewFormat.url
                          }
                          className="preview-video-el"
                        >
                          <track kind="captions" />
                        </video>
                      )}
                      <button
                        className="button secondary mini-btn"
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          zIndex: 10,
                          background: 'rgba(0,0,0,0.75)',
                        }}
                        onClick={() => setPreviewFormat(null)}
                        title="Đóng phát thử (Esc)"
                      >
                        <X size={13} />
                        <span>Đóng</span>
                      </button>
                    </div>
                  ) : result.thumbnail ? (
                    <div className="result-thumb-wrap">
                      <NextImage
                        src={result.thumbnail}
                        alt={result.title}
                        width={480}
                        height={270}
                        className="result-thumb-img"
                        unoptimized
                      />
                      {result.duration && (
                        <span className="result-duration">
                          <Clock size={12} /> {result.duration}
                        </span>
                      )}
                      <span className="result-platform-badge">
                        <PlatformBrandIcon id={result.platform} size={15} />
                        <span>{result.platformName}</span>
                      </span>
                      {videoFormats.length > 0 && (
                        <button
                          type="button"
                          className="preview-play-overlay"
                          onClick={() => setPreviewFormat(videoFormats[0])}
                          title="Xem stream trực tiếp"
                          aria-label="Xem stream trực tiếp"
                        >
                          <div className="preview-play-circle">
                            <Play size={22} fill="currentColor" />
                          </div>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="result-thumb-placeholder">
                      <PlatformBrandIcon id={result.platform} size={48} />
                      <span>{result.platformName} Media</span>
                    </div>
                  )}

                  <div className="result-author-info">
                    <span className="author-name">
                      <User size={13} /> {result.author}
                    </span>
                    <a
                      href={result.originalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="source-link"
                    >
                      Xem bản gốc <ExternalLink size={12} />
                    </a>
                  </div>
                </div>

                {/* Right: Title & Download Formats */}
                <div className="get-result-body">
                  <h2 className="result-title">{result.title}</h2>

                  {/* ── Quick Recommendation Hero Card ── */}
                  <div className="quick-recommend-card">
                    <div className="quick-recommend-content">
                      <div className="quick-recommend-title-wrap">
                        <span className="quick-recommend-badge">
                          <Sparkles size={13} /> Khuyên dùng tốt nhất
                        </span>
                        <span className="quick-recommend-detail">
                          {bestVideoFormat
                            ? `${bestVideoFormat.quality} · ${bestVideoFormat.ext.toUpperCase()}${bestVideoFormat.size ? ` (${bestVideoFormat.size})` : ''}`
                            : 'Chất lượng gốc'}
                        </span>
                      </div>
                      <div className="quick-recommend-actions">
                        {bestVideoFormat && (
                          <button
                            type="button"
                            className="button primary download-btn speed-fast-btn quick-action-btn"
                            onClick={() => triggerDownload(bestVideoFormat)}
                            disabled={
                              downloadingId ===
                              (bestVideoFormat.downloadUrl ||
                                bestVideoFormat.url)
                            }
                          >
                            <Zap size={15} />
                            <span>Tải ngay bản nét nhất</span>
                          </button>
                        )}
                        {bestAudioFormat && (
                          <button
                            type="button"
                            className="button secondary download-btn quick-action-btn"
                            onClick={() => triggerDownload(bestAudioFormat)}
                            title="Tải riêng tệp MP3 âm thanh chất lượng cao"
                          >
                            <Music size={14} />
                            <span>Tải MP3</span>
                          </button>
                        )}
                        <button
                          type="button"
                          className="button secondary icon-only"
                          title="Sao chép link stream trực tiếp"
                          onClick={() =>
                            copyLink(
                              bestVideoFormat?.downloadUrl ||
                                bestVideoFormat?.url ||
                                result.originalUrl,
                            )
                          }
                        >
                          {copied ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Format selection tabs */}
                  <div className="get-tabs">
                    <button
                      className={`get-tab ${activeTab === 'video' ? 'active' : ''}`}
                      onClick={() => setActiveTab('video')}
                    >
                      <Video size={16} />
                      <span>Video ({videoFormats.length})</span>
                    </button>
                    <button
                      className={`get-tab ${activeTab === 'audio' ? 'active' : ''}`}
                      onClick={() => setActiveTab('audio')}
                    >
                      <Music size={16} />
                      <span>Audio ({audioFormats.length})</span>
                    </button>
                    <button
                      className={`get-tab ${activeTab === 'subtitles' ? 'active' : ''}`}
                      onClick={() => setActiveTab('subtitles')}
                    >
                      <FileText size={16} />
                      <span>Phụ đề ({subtitleFormats.length})</span>
                    </button>
                    {thumbFormat && (
                      <button
                        className={`get-tab ${activeTab === 'thumbnail' ? 'active' : ''}`}
                        onClick={() => setActiveTab('thumbnail')}
                      >
                        <ImageIcon size={16} />
                        <span>Ảnh bìa</span>
                      </button>
                    )}
                  </div>

                  {/* Speed Mode Selector */}
                  <div className="speed-mode-bar">
                    <div className="speed-mode-switch">
                      <button
                        type="button"
                        className={`speed-pill ${speedMode === 'fast' ? 'active' : ''}`}
                        onClick={() => setSpeedMode('fast')}
                        title="Tải trực tiếp từ CDN nguồn không qua trung gian (100% băng thông mạng)"
                      >
                        <Zap size={13} />
                        <span>Tải siêu tốc (Origin CDN)</span>
                      </button>
                      <button
                        type="button"
                        className={`speed-pill ${speedMode === 'proxy' ? 'active' : ''}`}
                        onClick={() => setSpeedMode('proxy')}
                        title="Tải qua máy chủ tối ưu hóa với tên file chuẩn"
                      >
                        <Download size={13} />
                        <span>Tải chuẩn (Proxy)</span>
                      </button>
                    </div>
                    <span className="speed-hint">
                      {speedMode === 'fast'
                        ? '⚡ Tối đa băng thông mạng từ CDN gốc'
                        : '💾 Đặt tên file chuẩn tự động'}
                    </span>
                  </div>

                  {/* Tab 1: Video Formats */}
                  {activeTab === 'video' && (
                    <div className="format-list">
                      {videoFormats.length > 0 ? (
                        videoFormats.map((f) => {
                          const isDownloading =
                            downloadingId === (f.downloadUrl || f.url);
                          return (
                            <div key={f.id} className="format-row">
                              <div className="format-info">
                                <span
                                  className={`format-badge ${getBadgeClass(f.quality, f.type)}`}
                                >
                                  {f.quality}
                                </span>
                                <div style={{ minWidth: 0 }}>
                                  <b className="format-label" title={f.label}>
                                    {f.label}
                                  </b>
                                  <div className="format-meta">
                                    <span>{f.ext.toUpperCase()}</span>
                                    {f.size && (
                                      <span className="format-meta-tag">
                                        {f.size}
                                      </span>
                                    )}
                                    {f.isOriginal && (
                                      <span
                                        className="format-meta-tag"
                                        style={{ color: '#34d399' }}
                                      >
                                        Gốc (Original)
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="format-actions">
                                <button
                                  className="button secondary icon-only"
                                  title="Xem thử luồng video"
                                  onClick={() => setPreviewFormat(f)}
                                >
                                  <Play size={14} />
                                </button>
                                <button
                                  className="button secondary icon-only"
                                  title="Sao chép link stream (dán vào IDM/FDM để tải đa luồng)"
                                  onClick={() => copyLink(f.url)}
                                >
                                  {copied ? (
                                    <Check size={14} />
                                  ) : (
                                    <Copy size={14} />
                                  )}
                                </button>
                                <button
                                  className={`button primary download-btn ${speedMode === 'fast' ? 'speed-fast-btn' : ''}`}
                                  disabled={isDownloading}
                                  onClick={() => triggerDownload(f)}
                                  title={
                                    speedMode === 'fast'
                                      ? 'Tải trực tiếp siêu tốc từ CDN'
                                      : 'Tải qua proxy máy chủ'
                                  }
                                >
                                  {isDownloading ? (
                                    <>
                                      <LoaderCircle
                                        className="spin"
                                        size={15}
                                      />
                                      <span>Đang tải…</span>
                                    </>
                                  ) : speedMode === 'fast' ? (
                                    <>
                                      <Zap size={15} />
                                      <span>Tải siêu tốc</span>
                                    </>
                                  ) : (
                                    <>
                                      <Download size={15} />
                                      <span>Tải chuẩn</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="tab-empty">
                          Không phát hiện định dạng video nào.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab 2: Audio Formats */}
                  {activeTab === 'audio' && (
                    <div className="format-list">
                      {audioFormats.length > 0 ? (
                        audioFormats.map((f) => {
                          const isDownloading =
                            downloadingId === (f.downloadUrl || f.url);
                          return (
                            <div key={f.id} className="format-row">
                              <div className="format-info">
                                <span className="format-badge badge-audio">
                                  AUDIO
                                </span>
                                <div style={{ minWidth: 0 }}>
                                  <b className="format-label" title={f.label}>
                                    {f.label}
                                  </b>
                                  <div className="format-meta">
                                    <span>{f.ext.toUpperCase()}</span>
                                    {f.size && (
                                      <span className="format-meta-tag">
                                        {f.size}
                                      </span>
                                    )}
                                    <span className="format-meta-tag">
                                      {f.quality}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="format-actions">
                                <button
                                  className="button secondary icon-only"
                                  title="Nghe thử audio"
                                  onClick={() => setPreviewFormat(f)}
                                >
                                  <Play size={14} />
                                </button>
                                <button
                                  className="button secondary icon-only"
                                  title="Sao chép link audio (dán vào IDM/FDM để tải nhanh)"
                                  onClick={() => copyLink(f.url)}
                                >
                                  <Copy size={14} />
                                </button>
                                <button
                                  className={`button primary download-btn ${speedMode === 'fast' ? 'speed-fast-btn' : ''}`}
                                  disabled={isDownloading}
                                  onClick={() => triggerDownload(f)}
                                  title={
                                    speedMode === 'fast'
                                      ? 'Tải trực tiếp siêu tốc từ CDN'
                                      : 'Tải qua proxy máy chủ'
                                  }
                                >
                                  {isDownloading ? (
                                    <>
                                      <LoaderCircle
                                        className="spin"
                                        size={15}
                                      />
                                      <span>Đang tải…</span>
                                    </>
                                  ) : speedMode === 'fast' ? (
                                    <>
                                      <Zap size={15} />
                                      <span>Tải MP3 siêu tốc</span>
                                    </>
                                  ) : (
                                    <>
                                      <Download size={15} />
                                      <span>Tải MP3 chuẩn</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="tab-empty">
                          Đang trích xuất luồng audio.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab 3: Subtitles */}
                  {activeTab === 'subtitles' && (
                    <div className="format-list">
                      {subtitleFormats.length > 0 ? (
                        subtitleFormats.map((s) => {
                          const isDownloading = downloadingId === s.downloadUrl;
                          return (
                            <div key={s.lang} className="format-row">
                              <div className="format-info">
                                <span className="format-badge sub">
                                  {s.lang.toUpperCase()}
                                </span>
                                <div>
                                  <b className="format-label">{s.label}</b>
                                  <span className="format-meta">
                                    Phụ đề · {s.ext.toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <button
                                className="button secondary download-btn"
                                disabled={isDownloading}
                                onClick={() => triggerDownload(s)}
                              >
                                <Download size={15} />
                                <span>Tải phụ đề SRT</span>
                              </button>
                            </div>
                          );
                        })
                      ) : (
                        <div className="tab-empty">
                          Không có phụ đề khả dụng cho nội dung này.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab 4: Thumbnail */}
                  {activeTab === 'thumbnail' && thumbFormat && (
                    <div className="thumbnail-tab-content">
                      <div className="thumb-preview-box">
                        <NextImage
                          src={thumbFormat.url}
                          alt="HD Cover"
                          width={640}
                          height={360}
                          className="thumb-hd-img"
                          unoptimized
                        />
                      </div>
                      <button
                        className="button primary download-btn"
                        onClick={() => triggerDownload(thumbFormat)}
                      >
                        <Download size={15} />
                        <span>Tải ảnh bìa gốc độ phân giải cao</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      )}

      {/* ── Mode 2: Batch Download Results & Management ── */}
      {mode === 'batch' && batchItems.length > 0 && (
        <section className="batch-results-section">
          {/* Top Batch Summary Stats Bar */}
          <div className="batch-stats-summary-card">
            <div className="batch-stat-item">
              <span className="batch-stat-label">Tổng video:</span>
              <b className="batch-stat-value">{batchStats.total}</b>
            </div>
            <div className="batch-stat-divider" />
            <div className="batch-stat-item">
              <span className="batch-stat-label">Đã chọn:</span>
              <b className="batch-stat-value highlight">
                {batchStats.selected}
              </b>
            </div>
            {batchStats.estimatedSize && (
              <>
                <div className="batch-stat-divider" />
                <div className="batch-stat-item">
                  <span className="batch-stat-label">Ước tính dung lượng:</span>
                  <b className="batch-stat-value green">
                    ~{batchStats.estimatedSize}
                  </b>
                </div>
              </>
            )}
            <div className="batch-stat-divider" />
            <div className="batch-stat-item">
              <span className="batch-stat-label">Hoàn tất:</span>
              <b className="batch-stat-value">
                {batchStats.completed}/{batchStats.total}
              </b>
            </div>
          </div>

          {/* Top Batch Control Bar */}
          <div className="batch-control-bar">
            <div className="batch-control-left">
              <button
                type="button"
                className="batch-check-all-btn"
                onClick={handleToggleSelectAll}
              >
                {allBatchSelected ? (
                  <CheckSquare size={16} color="#00d2ff" />
                ) : (
                  <Square size={16} color="#787a84" />
                )}
                <span>
                  Chọn tất cả ({selectedBatchCount}/{batchItems.length})
                </span>
              </button>

              {/* Quality Preset Switcher */}
              <div className="batch-preset-wrap">
                <span className="batch-preset-label">Định dạng chung:</span>
                <select
                  className="batch-preset-select"
                  value={batchQualityPreset}
                  onChange={(e) =>
                    handleApplyPreset(
                      e.target.value as 'highest' | '1080p' | '720p' | 'audio',
                    )
                  }
                >
                  <option value="highest">Cao nhất (Original / Max HD)</option>
                  <option value="1080p">Ưu tiên 1080p Full HD</option>
                  <option value="720p">720p HD Tiết kiệm</option>
                  <option value="audio">Chỉ tải MP3 / Âm thanh</option>
                </select>
              </div>
            </div>

            <div className="batch-control-right">
              {/* Copy all direct CDN links for IDM / FDM */}
              <button
                type="button"
                className="batch-action-btn secondary"
                onClick={copyAllBatchLinks}
                title="Sao chép tất cả link CDN để dán trực tiếp vào IDM (Tasks -> Add batch download) hoặc FDM"
              >
                <FileDown size={15} />
                <span>Sao chép link (IDM)</span>
              </button>

              {/* Export to .txt file for IDM / aria2 */}
              <button
                type="button"
                className="batch-action-btn secondary"
                onClick={exportBatchLinksToFile}
                title="Xuất danh sách link ra file .txt để nạp vào IDM hoặc aria2"
              >
                <FileSpreadsheet size={15} />
                <span>Xuất file .txt</span>
              </button>

              {/* Sequential batch download or Cancel */}
              {batchDownloading ? (
                <button
                  type="button"
                  className="batch-action-btn danger"
                  onClick={handleCancelBatch}
                  title="Dừng tiến trình tải hàng loạt"
                >
                  <StopCircle size={15} />
                  <span>Dừng tải</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="batch-action-btn primary speed-fast-btn"
                  disabled={selectedBatchCount === 0}
                  onClick={handleDownloadBatch}
                >
                  <Download size={15} />
                  <span>Tải {selectedBatchCount} mục đã chọn</span>
                </button>
              )}

              <button
                type="button"
                className="batch-action-btn icon-only"
                onClick={() => setBatchItems([])}
                title="Xóa danh sách này"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>

          {/* Sequential download progress bar */}
          {batchDownloading && batchProgress && (
            <div className="batch-progress-bar-wrap">
              <div
                className="batch-progress-bar-fill"
                style={{
                  width: `${Math.round((batchProgress.current / batchProgress.total) * 100)}%`,
                }}
              />
              <span className="batch-progress-text">
                Đang kích hoạt tải tuần tự: {batchProgress.current} /{' '}
                {batchProgress.total} tệp (Tránh chặn Popup trình duyệt)
              </span>
            </div>
          )}

          {/* Batch Search & Filter Bar */}
          <div className="batch-filter-row">
            <div className="batch-search-input-wrap">
              <Search size={14} className="batch-search-icon" />
              <input
                type="text"
                className="batch-search-input"
                placeholder="Tìm kiếm video trong danh sách..."
                value={batchSearch}
                onChange={(e) => setBatchSearch(e.target.value)}
              />
              {batchSearch && (
                <button
                  type="button"
                  className="batch-clear-search-btn"
                  onClick={() => setBatchSearch('')}
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="batch-platform-filter-tabs">
              <button
                type="button"
                className={`batch-filter-pill ${batchPlatformFilter === 'all' ? 'active' : ''}`}
                onClick={() => setBatchPlatformFilter('all')}
              >
                Tất cả ({batchItems.length})
              </button>
              {Object.entries(platformCounts).map(([platform, count]) => (
                <button
                  key={platform}
                  type="button"
                  className={`batch-filter-pill ${batchPlatformFilter === platform ? 'active' : ''}`}
                  onClick={() => setBatchPlatformFilter(platform)}
                >
                  {platform.toUpperCase()} ({count})
                </button>
              ))}
            </div>
          </div>

          {/* Batch Item Rows */}
          <div className="batch-items-list">
            {filteredBatchItems.length > 0 ? (
              filteredBatchItems.map((item, idx) => {
                const resData = item.data;
                const formats = resData?.formats || [];
                const chosenFormat =
                  formats.find((f) => f.id === item.selectedFormatId) ||
                  formats[0];

                return (
                  <div
                    key={item.id}
                    className={`batch-row ${item.selected ? 'selected' : ''} ${item.error ? 'has-error' : ''}`}
                  >
                    {/* Select Checkbox */}
                    <button
                      type="button"
                      className="batch-row-checkbox"
                      onClick={() => handleToggleSelectItem(item.id)}
                      aria-label="Chọn video"
                    >
                      {item.selected ? (
                        <CheckSquare size={18} color="#00d2ff" />
                      ) : (
                        <Square size={18} color="#555862" />
                      )}
                    </button>

                    {/* Index */}
                    <span className="batch-row-index">#{idx + 1}</span>

                    {/* Thumbnail / Icon */}
                    <div className="batch-row-thumb">
                      {resData?.thumbnail ? (
                        <NextImage
                          src={resData.thumbnail}
                          alt={resData.title}
                          width={90}
                          height={50}
                          className="batch-thumb-img"
                          unoptimized
                        />
                      ) : (
                        <div className="batch-thumb-placeholder">
                          <Tv size={20} />
                        </div>
                      )}
                      {resData?.duration && (
                        <span className="batch-thumb-duration">
                          {resData.duration}
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="batch-row-info">
                      <div className="batch-row-header">
                        {resData?.platformName && (
                          <span className="batch-platform-tag">
                            {resData.platformName}
                          </span>
                        )}
                        <a
                          href={item.originalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="batch-row-title"
                          title={resData?.title || item.originalUrl}
                        >
                          {resData?.title || item.originalUrl}
                        </a>
                      </div>

                      {item.error ? (
                        <span className="batch-row-error">⚠️ {item.error}</span>
                      ) : (
                        <div className="batch-row-meta">
                          {resData?.author && (
                            <span>Tác giả: {resData.author}</span>
                          )}
                          {chosenFormat && (
                            <span className="batch-format-badge">
                              {chosenFormat.ext.toUpperCase()} ·{' '}
                              {chosenFormat.quality}
                              {chosenFormat.size
                                ? ` (${chosenFormat.size})`
                                : ''}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Format Selector Dropdown */}
                    {formats.length > 0 && (
                      <div className="batch-format-select-wrap">
                        <select
                          className="batch-format-select"
                          value={chosenFormat?.id || ''}
                          onChange={(e) =>
                            handleSelectBatchItemFormat(item.id, e.target.value)
                          }
                        >
                          {formats.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.type === 'audio' ? '🎵 ' : '🎬 '}
                              {f.quality} · {f.ext.toUpperCase()}
                              {f.size ? ` (${f.size})` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Status Indicator */}
                    <div className="batch-status-wrap">
                      {item.status === 'downloading' && (
                        <span className="batch-status-badge downloading">
                          <LoaderCircle className="spin" size={12} /> Đang tải…
                        </span>
                      )}
                      {item.status === 'completed' && (
                        <span className="batch-status-badge completed">
                          <Check size={12} /> Hoàn tất
                        </span>
                      )}
                      {item.status === 'failed' && (
                        <span className="batch-status-badge failed">
                          <X size={12} /> Thất bại
                        </span>
                      )}
                      {item.status === 'idle' && !item.error && (
                        <span className="batch-status-badge ready">
                          <Check size={12} /> Sẵn sàng
                        </span>
                      )}
                    </div>

                    {/* Row Actions */}
                    <div className="batch-row-actions">
                      {chosenFormat && (
                        <>
                          <button
                            type="button"
                            className="button secondary icon-only"
                            title="Sao chép link trực tiếp"
                            onClick={() => copyLink(chosenFormat.url)}
                          >
                            <Copy size={13} />
                          </button>
                          <button
                            type="button"
                            className="button primary download-btn speed-fast-btn mini-download-btn"
                            title="Tải ngay mục này"
                            onClick={() =>
                              triggerDownload(
                                chosenFormat,
                                speedMode,
                                resData?.title || 'media',
                              )
                            }
                          >
                            <Download size={13} />
                            <span>Tải</span>
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        className="button secondary icon-only"
                        title="Xóa mục khỏi danh sách"
                        onClick={() => handleRemoveBatchItem(item.id)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="tab-empty">
                Không tìm thấy video nào phù hợp với bộ lọc tìm kiếm.
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Download History Section ── */}
      {history.length > 0 && (
        <section className="get-history-section">
          <div className="history-heading">
            <div>
              <h3>Lịch sử tải gần đây</h3>
              <p>Các nội dung đã phân tích trong phiên làm việc hiện tại</p>
            </div>
            <button className="text-button" onClick={clearHistory}>
              <Trash2 size={14} />
              <span>Xóa lịch sử</span>
            </button>
          </div>
          <div className="history-grid">
            {history.map((h) => (
              <div key={h.originalUrl} className="history-card">
                {h.thumbnail && (
                  <div className="history-thumb">
                    <NextImage
                      src={h.thumbnail}
                      alt={h.title}
                      width={120}
                      height={68}
                      unoptimized
                    />
                  </div>
                )}
                <div className="history-content">
                  <span className="history-platform">
                    <PlatformBrandIcon id={h.platform} size={14} />
                    <span>{h.platformName}</span>
                  </span>
                  <b className="history-title" title={h.title}>
                    {h.title}
                  </b>
                  <button
                    className="button secondary mini-btn"
                    onClick={() => {
                      setMode('single');
                      setUrl(h.originalUrl);
                      void handleGet(h.originalUrl);
                    }}
                  >
                    <ArrowUpRight size={13} />
                    <span>Mở lại</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SEO & Features Overview */}
      <GetStudioSeo
        onScrollToTop={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onTrySample={(sampleUrl, platform) => {
          setMode('single');
          setSelectedPlatform(platform);
          setUrl(sampleUrl);
          void handleGet(sampleUrl);
        }}
      />
    </div>
  );
}
