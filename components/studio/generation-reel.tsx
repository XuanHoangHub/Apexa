'use client';

import React, { useRef } from 'react';
import NextImage from 'next/image';
import {
  Film,
  ChevronLeft,
  ChevronRight,
  Split,
  Trash2,
  Bookmark,
  Clock,
  Layers,
} from 'lucide-react';
import type { GenerationItem } from './preview-viewport';

interface GenerationReelProps {
  items: GenerationItem[];
  activeId?: string | null;
  comparingId?: string | null;
  onSelect: (item: GenerationItem) => void;
  onCompare: (item: GenerationItem) => void;
  onDelete: (id: string) => void;
  onFavorite: (id: string) => void;
  onClearAll: () => void;
}

export default function GenerationReel({
  items,
  activeId,
  comparingId,
  onSelect,
  onCompare,
  onDelete,
  onFavorite,
  onClearAll,
}: GenerationReelProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="generation-reel-wrapper">
      <div className="reel-header">
        <div className="reel-title-group">
          <Layers size={14} className="text-[#00d2ff]" />
          <h3>Session Reel</h3>
          <span className="reel-count-pill">{items.length} takes</span>
        </div>

        <div className="reel-actions">
          {items.length > 1 && (
            <button
              type="button"
              className="reel-clear-btn"
              onClick={onClearAll}
              title="Clear session takes"
            >
              <Trash2 size={12} />
              <span>Clear</span>
            </button>
          )}
          <div className="reel-scroll-controls">
            <button
              type="button"
              className="scroll-btn"
              onClick={() => scroll('left')}
              title="Scroll left"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              className="scroll-btn"
              onClick={() => scroll('right')}
              title="Scroll right"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <div ref={scrollContainerRef} className="reel-scroll-track">
        {items.map((item, index) => {
          const isActive = item.id === activeId;
          const isComparing = item.id === comparingId;
          const isVideo = item.type === 'video';

          return (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              className={`reel-card ${isActive ? 'active' : ''} ${isComparing ? 'comparing' : ''}`}
              onClick={() => onSelect(item)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(item);
                }
              }}
            >
              {/* Thumbnail */}
              <div className="reel-thumb-container">
                {isVideo ? (
                  <div className="reel-video-thumb">
                    <video
                      src={item.url}
                      muted
                      playsInline
                      className="reel-thumb-media"
                    />
                    <span className="video-pill">
                      <Film size={10} />
                    </span>
                  </div>
                ) : (
                  <NextImage
                    src={item.url}
                    alt={item.prompt.slice(0, 30)}
                    unoptimized
                    width={180}
                    height={120}
                    className="reel-thumb-media"
                  />
                )}

                {/* Badges */}
                <div className="reel-card-badges">
                  <span className="take-number">#{items.length - index}</span>
                  {item.ratio && (
                    <span className="ratio-tag">{item.ratio}</span>
                  )}
                </div>

                {/* Hover Quick Actions */}
                <div className="reel-hover-actions">
                  <button
                    type="button"
                    className={`reel-action-btn ${isComparing ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onCompare(item);
                    }}
                    title="Compare with active preview in Split Slider"
                  >
                    <Split size={13} />
                  </button>

                  <button
                    type="button"
                    className={`reel-action-btn ${item.favorite ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onFavorite(item.id);
                    }}
                    title={item.favorite ? 'Unfavorite' : 'Favorite take'}
                  >
                    <Bookmark size={13} />
                  </button>

                  <button
                    type="button"
                    className="reel-action-btn delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                    title="Delete take"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Card Meta */}
              <div className="reel-card-meta">
                <p className="reel-prompt-snippet">{item.prompt}</p>
                <div className="reel-card-footer">
                  <span className="reel-model-tag">{item.model}</span>
                  <span className="reel-time">
                    <Clock size={10} />
                    {new Date(item.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
