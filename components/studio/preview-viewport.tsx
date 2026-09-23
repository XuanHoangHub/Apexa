'use client';

import React, { useState, useRef, useEffect } from 'react';
import NextImage from 'next/image';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Grid3X3,
  Split,
  Download,
  Copy,
  Sparkles,
  Film,
  WandSparkles,
  Clapperboard,
  Play,
  Pause,
  RotateCcw,
  Camera,
  Check,
  Bookmark,
  ArrowUpRight,
  Info,
  Layers,
  Crosshair,
  Volume2,
  VolumeX,
  X,
  Columns,
} from 'lucide-react';
import { TooltipProvider, StudioTooltip } from '@/components/ui/radix-tooltip';
import './studio-preview.css';

export interface GenerationItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  prompt: string;
  model: string;
  ratio: string;
  motion?: string;
  duration?: string;
  createdAt: string;
  favorite?: boolean;
}

interface PreviewViewportProps {
  result: {
    url: string;
    type: string;
    prompt?: string;
    model?: string;
    ratio?: string;
    duration?: string;
    motion?: string;
    id?: string;
  } | null;
  referenceImage?: string | null;
  compareItem?: GenerationItem | null;
  onClearCompare?: () => void;
  onAnimateToVideo?: (url: string, prompt?: string) => void;
  onSendToEditor?: (url: string) => void;
  onAddToStoryboard?: (url: string, prompt?: string) => void;
  onRemix?: (prompt: string) => void;
  onSaveToLibrary?: (item: {
    url: string;
    type: string;
    prompt?: string;
  }) => void;
  onNotice: (msg: string, type?: 'info' | 'success' | 'warning') => void;
  isAuthenticated: boolean;
  requireAuth: (action: () => void, msg?: string) => boolean;
}

export default function PreviewViewport({
  result,
  referenceImage,
  compareItem,
  onClearCompare,
  onAnimateToVideo,
  onSendToEditor,
  onAddToStoryboard,
  onRemix,
  onSaveToLibrary,
  onNotice,
  isAuthenticated: _isAuthenticated,
  requireAuth,
}: PreviewViewportProps) {
  // Viewport display controls
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Overlay Guides
  const [showGrid, setShowGrid] = useState(false);
  const [showCrosshair, setShowCrosshair] = useState(false);
  const [showSafeAreas, setShowSafeAreas] = useState(false);
  const [showHud, setShowHud] = useState(true);

  // Comparison mode
  const [splitPos, setSplitPos] = useState(50); // percentage
  const [manualComparing, setManualComparing] = useState<boolean | null>(null);
  const isComparing =
    manualComparing !== null ? manualComparing : !!compareItem;
  const [compareMode, setCompareMode] = useState<'split' | 'side-by-side'>(
    'split',
  );
  const splitDraggingRef = useRef(false);

  // Video playback controls
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isLooping, setIsLooping] = useState(true);
  const [snapshotSuccess, setSnapshotSuccess] = useState(false);

  // Copy state
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Track previous result url to reset zoom & pan without cascading renders
  const [prevUrl, setPrevUrl] = useState(result?.url);
  if (result?.url !== prevUrl) {
    setPrevUrl(result?.url);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setIsPlaying(false);
  }

  // Comparison target: compareItem if present, else referenceImage if available
  const compareTargetUrl = compareItem?.url || referenceImage;
  const compareTargetLabel = compareItem
    ? `Take ${compareItem.id.slice(0, 4)}`
    : referenceImage
      ? 'Reference Image'
      : '';

  // Handle Fullscreen toggle with ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
      if (
        e.key === 'f' &&
        !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)
      ) {
        if (result) {
          setIsFullscreen((prev) => !prev);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, result]);

  // Mouse pan handlers for zoom > 1
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (splitDraggingRef.current && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const pos = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitPos(Math.max(5, Math.min(95, pos)));
      return;
    }
    if (!isDragging || zoom <= 1) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    splitDraggingRef.current = false;
  };

  // Zoom helpers
  const zoomIn = () => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)));
  const zoomOut = () =>
    setZoom((z) => {
      const next = Math.max(0.5, +(z - 0.25).toFixed(2));
      if (next <= 1) setPan({ x: 0, y: 0 });
      return next;
    });
  const resetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Video helpers
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      void videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleVideoTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleVideoLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const changeSpeed = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  };

  // Video frame snapshot (Captures current frame to high-res PNG)
  const captureFrame = () => {
    if (!videoRef.current) return;
    try {
      const v = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = v.videoWidth || 1280;
      canvas.height = v.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');

      setSnapshotSuccess(true);
      setTimeout(() => setSnapshotSuccess(false), 2500);

      // Offer direct options to user
      onNotice(
        'Frame captured! You can send it to Image Editor or download it.',
        'success',
      );

      // Auto-trigger download or send to editor if user wants
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `apexa-frame-${Math.floor(currentTime * 1000)}ms.png`;
      a.click();
    } catch {
      onNotice(
        'Cannot capture frame from cross-origin video source.',
        'warning',
      );
    }
  };

  // Copy prompt helper
  const handleCopyPrompt = () => {
    if (result?.prompt && navigator.clipboard) {
      void navigator.clipboard.writeText(result.prompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
      onNotice('Prompt copied to clipboard!', 'success');
    }
  };

  // Direct download file
  const handleDirectDownload = async () => {
    if (!result?.url) return;
    try {
      const ext = result.type === 'video' ? 'mp4' : 'png';
      const filename = `apexa-${result.type}-${Date.now()}.${ext}`;

      // If data URL, download directly
      if (result.url.startsWith('data:')) {
        const a = document.createElement('a');
        a.href = result.url;
        a.download = filename;
        a.click();
        onNotice('Download started.', 'success');
        return;
      }

      // Fetch blob to guarantee local download without tab opening
      const response = await fetch(result.url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      onNotice('Artwork downloaded successfully.', 'success');
    } catch {
      // Fallback
      window.open(result.url, '_blank');
    }
  };

  if (!result) return null;

  const isVideo = result.type === 'video';

  return (
    <TooltipProvider>
      <div
        ref={containerRef}
        role="region"
        aria-label="Creative Preview Viewport"
        className={`preview-viewport-container ${isFullscreen ? 'viewport-fullscreen' : ''}`}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Top Control Bar */}
        <div className="viewport-top-bar">
          <div className="viewport-left-controls">
            <span className="viewport-badge">
              {isVideo ? <Film size={13} /> : <Sparkles size={13} />}
              {isVideo ? 'AI Video' : 'AI Artwork'}
            </span>

            {result.ratio && (
              <span className="viewport-meta-pill">{result.ratio}</span>
            )}
            {result.model && (
              <span className="viewport-meta-pill">{result.model}</span>
            )}

            {/* Compare Toggle (if reference or compare item exists) */}
            {compareTargetUrl && (
              <button
                type="button"
                className={`viewport-btn ${isComparing ? 'active' : ''}`}
                onClick={() => setManualComparing(!isComparing)}
                title="Toggle Before / After Comparison"
              >
                <Split size={14} />
                <span>Compare</span>
                {compareItem && (
                  <button
                    type="button"
                    className="compare-clear-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setManualComparing(false);
                      onClearCompare?.();
                    }}
                    title="Clear comparison"
                  >
                    <X size={12} />
                  </button>
                )}
              </button>
            )}

            {isComparing && compareTargetUrl && (
              <div className="compare-mode-selector">
                <button
                  type="button"
                  className={`sub-btn ${compareMode === 'split' ? 'active' : ''}`}
                  onClick={() => setCompareMode('split')}
                  title="Split Slider mode"
                >
                  <Split size={13} />
                </button>
                <button
                  type="button"
                  className={`sub-btn ${compareMode === 'side-by-side' ? 'active' : ''}`}
                  onClick={() => setCompareMode('side-by-side')}
                  title="Side by Side mode"
                >
                  <Columns size={13} />
                </button>
              </div>
            )}
          </div>

          <div className="viewport-right-controls">
            {/* Composition Grid Guides */}
            <StudioTooltip content="Rule of Thirds Grid (3x3)">
              <button
                type="button"
                className={`viewport-icon-btn ${showGrid ? 'active' : ''}`}
                onClick={() => setShowGrid(!showGrid)}
              >
                <Grid3X3 size={15} />
              </button>
            </StudioTooltip>

            {/* Center Crosshair */}
            <StudioTooltip content="Center Crosshair">
              <button
                type="button"
                className={`viewport-icon-btn ${showCrosshair ? 'active' : ''}`}
                onClick={() => setShowCrosshair(!showCrosshair)}
              >
                <Crosshair size={15} />
              </button>
            </StudioTooltip>

            {/* Platform Safe Areas */}
            <StudioTooltip content="Platform Safe Areas (16:9, 9:16, 1:1)">
              <button
                type="button"
                className={`viewport-icon-btn ${showSafeAreas ? 'active' : ''}`}
                onClick={() => setShowSafeAreas(!showSafeAreas)}
              >
                <Layers size={15} />
              </button>
            </StudioTooltip>

            {/* Metadata HUD toggle */}
            <StudioTooltip content="Toggle Generation HUD">
              <button
                type="button"
                className={`viewport-icon-btn ${showHud ? 'active' : ''}`}
                onClick={() => setShowHud(!showHud)}
              >
                <Info size={15} />
              </button>
            </StudioTooltip>

            <div className="viewport-divider" />

            {/* Zoom Controls */}
            <div className="zoom-stepper">
              <StudioTooltip content="Zoom Out">
                <button
                  type="button"
                  className="viewport-icon-btn"
                  onClick={zoomOut}
                  disabled={zoom <= 0.5}
                >
                  <ZoomOut size={15} />
                </button>
              </StudioTooltip>
              <button
                type="button"
                className="zoom-display"
                onClick={resetZoom}
                title="Click to reset zoom"
              >
                {Math.round(zoom * 100)}%
              </button>
              <StudioTooltip content="Zoom In">
                <button
                  type="button"
                  className="viewport-icon-btn"
                  onClick={zoomIn}
                  disabled={zoom >= 3}
                >
                  <ZoomIn size={15} />
                </button>
              </StudioTooltip>
              {zoom !== 1 && (
                <button
                  type="button"
                  className="viewport-pill-btn"
                  onClick={resetZoom}
                  title="Fit to Screen"
                >
                  Fit
                </button>
              )}
            </div>

            <div className="viewport-divider" />

            {/* Fullscreen Lightbox */}
            <StudioTooltip
              content={
                isFullscreen
                  ? 'Exit Fullscreen (Esc)'
                  : 'Fullscreen Lightbox (F)'
              }
            >
              <button
                type="button"
                className="viewport-icon-btn"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? (
                  <Minimize2 size={16} />
                ) : (
                  <Maximize2 size={16} />
                )}
              </button>
            </StudioTooltip>
          </div>
        </div>

        {/* Main Viewport Stage */}
        <div
          role="presentation"
          className={`viewport-stage ${zoom > 1 ? (isDragging ? 'dragging' : 'draggable') : ''}`}
          onMouseDown={handleMouseDown}
        >
          {/* Side by Side mode */}
          {isComparing && compareMode === 'side-by-side' && compareTargetUrl ? (
            <div className="side-by-side-stage">
              <div className="side-pane">
                <span className="pane-tag">Before: {compareTargetLabel}</span>
                {compareTargetUrl.endsWith('.mp4') ||
                compareItem?.type === 'video' ? (
                  <video
                    src={compareTargetUrl}
                    controls
                    muted
                    className="side-media"
                  >
                    <track kind="captions" />
                  </video>
                ) : (
                  <NextImage
                    src={compareTargetUrl}
                    alt="Comparison target"
                    unoptimized
                    width={800}
                    height={600}
                    className="side-media"
                  />
                )}
              </div>
              <div className="side-pane">
                <span className="pane-tag active">After: Generated Result</span>
                {isVideo ? (
                  <video src={result.url} controls muted className="side-media">
                    <track kind="captions" />
                  </video>
                ) : (
                  <NextImage
                    src={result.url}
                    alt="Generated artwork"
                    unoptimized
                    width={800}
                    height={600}
                    className="side-media"
                  />
                )}
              </div>
            </div>
          ) : (
            /* Standard or Split Slider Viewport */
            <div
              className="viewport-media-wrapper"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              }}
            >
              {/* Main Media (Generated Result) */}
              {isVideo ? (
                <video
                  ref={videoRef}
                  src={result.url}
                  className="viewport-media"
                  playsInline
                  loop={isLooping}
                  muted={isMuted}
                  onTimeUpdate={handleVideoTimeUpdate}
                  onLoadedMetadata={handleVideoLoadedMetadata}
                  onClick={togglePlay}
                >
                  <track kind="captions" />
                </video>
              ) : (
                <NextImage
                  src={result.url}
                  alt="AI Generated Artwork"
                  unoptimized
                  width={1400}
                  height={900}
                  className="viewport-media"
                  priority
                />
              )}

              {/* Split Slider Comparison Overlay */}
              {isComparing && compareMode === 'split' && compareTargetUrl && (
                <div
                  className="split-comparison-overlay"
                  style={{ clipPath: `inset(0 ${100 - splitPos}% 0 0)` }}
                >
                  <NextImage
                    src={compareTargetUrl}
                    alt="Comparison reference"
                    unoptimized
                    width={1400}
                    height={900}
                    className="viewport-media split-underlay-media"
                  />
                  <span className="split-badge before-badge">
                    Before: {compareTargetLabel}
                  </span>
                </div>
              )}

              {isComparing && compareMode === 'split' && compareTargetUrl && (
                <>
                  <span
                    className="split-badge after-badge"
                    style={{ left: `calc(${splitPos}% + 14px)` }}
                  >
                    After: Result
                  </span>
                  {/* Draggable Divider Handle */}
                  <div
                    role="separator"
                    aria-label="Before/After Divider"
                    aria-valuenow={splitPos}
                    tabIndex={0}
                    className="split-divider-line"
                    style={{ left: `${splitPos}%` }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      splitDraggingRef.current = true;
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowLeft')
                        setSplitPos((p) => Math.max(5, p - 5));
                      if (e.key === 'ArrowRight')
                        setSplitPos((p) => Math.min(95, p + 5));
                    }}
                  >
                    <div className="split-handle">
                      <Split size={14} />
                    </div>
                  </div>
                </>
              )}

              {/* Composition Overlays */}
              {showGrid && (
                <div className="composition-grid-overlay">
                  <div className="grid-line v1" />
                  <div className="grid-line v2" />
                  <div className="grid-line h1" />
                  <div className="grid-line h2" />
                </div>
              )}

              {showCrosshair && (
                <div className="crosshair-overlay">
                  <div className="crosshair-center" />
                </div>
              )}

              {showSafeAreas && (
                <div className="safe-areas-overlay">
                  <div
                    className="safe-box safe-16-9"
                    title="16:9 Landscape Safe Area"
                  >
                    <span>16:9</span>
                  </div>
                  <div
                    className="safe-box safe-1-1"
                    title="1:1 Square Safe Area"
                  >
                    <span>1:1</span>
                  </div>
                  <div
                    className="safe-box safe-9-16"
                    title="9:16 Vertical Safe Area"
                  >
                    <span>9:16</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Video Player Custom Bottom Controls (if video mode) */}
        {isVideo && (
          <div className="video-custom-controls">
            <button
              type="button"
              className="video-ctrl-btn play-pause-btn"
              onClick={togglePlay}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={17} /> : <Play size={17} />}
            </button>

            {/* Time progress bar */}
            <div className="video-scrubber-group">
              <span className="time-code">
                {Math.floor(currentTime)}s / {Math.floor(duration || 0)}s
              </span>
              <input
                type="range"
                min={0}
                max={duration || 10}
                step={0.05}
                value={currentTime}
                onChange={handleSeek}
                className="video-scrubber"
              />
            </div>

            {/* Speed selector */}
            <div className="speed-pills">
              {[0.5, 1, 1.5, 2].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`speed-pill ${playbackSpeed === s ? 'active' : ''}`}
                  onClick={() => changeSpeed(s)}
                >
                  {s}x
                </button>
              ))}
            </div>

            {/* Loop toggle */}
            <button
              type="button"
              className={`video-ctrl-btn ${isLooping ? 'active' : ''}`}
              onClick={() => setIsLooping(!isLooping)}
              title="Toggle Loop"
            >
              <RotateCcw size={15} />
            </button>

            {/* Mute toggle */}
            <button
              type="button"
              className="video-ctrl-btn"
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.muted = !isMuted;
                  setIsMuted(!isMuted);
                }
              }}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>

            {/* Frame Snapshot Button */}
            <button
              type="button"
              className="video-snapshot-btn"
              onClick={captureFrame}
              title="Capture High-Res Frame Snapshot (PNG)"
            >
              {snapshotSuccess ? (
                <Check size={15} className="text-green-400" />
              ) : (
                <Camera size={15} />
              )}
              <span>{snapshotSuccess ? 'Captured!' : 'Capture Frame'}</span>
            </button>
          </div>
        )}

        {/* Floating Metadata HUD */}
        {showHud && (
          <div className="viewport-hud">
            <div className="hud-header">
              <div className="hud-title">
                <Sparkles size={13} className="text-[#00d2ff]" />
                <span>Creative Metadata</span>
              </div>
              <button
                type="button"
                className="hud-close-btn"
                onClick={() => setShowHud(false)}
                title="Hide HUD"
              >
                <X size={12} />
              </button>
            </div>

            {result.prompt && (
              <div className="hud-prompt-block">
                <p className="hud-prompt">{result.prompt}</p>
                <button
                  type="button"
                  className="hud-copy-btn"
                  onClick={handleCopyPrompt}
                  title="Copy Prompt"
                >
                  {copiedPrompt ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedPrompt ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            )}

            <div className="hud-specs-grid">
              {result.model && (
                <div className="spec-item">
                  <span className="spec-label">Model</span>
                  <span className="spec-value">{result.model}</span>
                </div>
              )}
              {result.ratio && (
                <div className="spec-item">
                  <span className="spec-label">Aspect</span>
                  <span className="spec-value">{result.ratio}</span>
                </div>
              )}
              {result.motion && (
                <div className="spec-item">
                  <span className="spec-label">Motion</span>
                  <span className="spec-value">{result.motion}</span>
                </div>
              )}
              {result.duration && (
                <div className="spec-item">
                  <span className="spec-label">Duration</span>
                  <span className="spec-value">{result.duration}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom Interactive Workflow Action Bar (Inter-Studio Hub) */}
        <div className="viewport-action-bar">
          <div className="action-bar-left">
            {/* Animate to Video */}
            {!isVideo && onAnimateToVideo && (
              <button
                type="button"
                className="action-pill-btn animate-btn"
                onClick={() =>
                  requireAuth(
                    () => onAnimateToVideo(result.url, result.prompt),
                    'Đăng nhập để tạo video từ ảnh này.',
                  )
                }
              >
                <Film size={15} />
                <span>Animate into Video</span>
              </button>
            )}

            {/* Send to Image Editor */}
            {!isVideo && onSendToEditor && (
              <button
                type="button"
                className="action-pill-btn"
                onClick={() =>
                  requireAuth(
                    () => onSendToEditor(result.url),
                    'Đăng nhập để chỉnh màu tác phẩm.',
                  )
                }
              >
                <WandSparkles size={15} />
                <span>Adjust in Editor</span>
              </button>
            )}

            {/* Add to Storyboard */}
            {onAddToStoryboard && (
              <button
                type="button"
                className="action-pill-btn"
                onClick={() =>
                  requireAuth(
                    () => onAddToStoryboard(result.url, result.prompt),
                    'Đăng nhập để thêm vào Storyboard.',
                  )
                }
              >
                <Clapperboard size={15} />
                <span>Add to Storyboard</span>
              </button>
            )}

            {/* Remix Variation */}
            {onRemix && result.prompt && (
              <button
                type="button"
                className="action-pill-btn"
                onClick={() => onRemix(result.prompt!)}
              >
                <Sparkles size={15} />
                <span>Remix</span>
              </button>
            )}
          </div>

          <div className="action-bar-right">
            {/* Save to Library */}
            {onSaveToLibrary && (
              <button
                type="button"
                className="action-icon-pill"
                onClick={() =>
                  requireAuth(
                    () =>
                      onSaveToLibrary({
                        url: result.url,
                        type: result.type,
                        prompt: result.prompt,
                      }),
                    'Đăng nhập để lưu vào Thư viện.',
                  )
                }
                title="Bookmark to My Library"
              >
                <Bookmark size={15} />
                <span>Save</span>
              </button>
            )}

            {/* Direct Download */}
            <button
              type="button"
              className="action-icon-pill highlight"
              onClick={handleDirectDownload}
              title={`Download ${isVideo ? 'MP4 Video' : 'PNG Artwork'}`}
            >
              <Download size={15} />
              <span>Download {isVideo ? 'MP4' : 'PNG'}</span>
            </button>

            {/* Open Raw Artwork */}
            <a
              href={result.url}
              target="_blank"
              rel="noreferrer"
              className="action-icon-pill"
              title="Open raw artwork in new tab"
            >
              <ArrowUpRight size={15} />
            </a>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
