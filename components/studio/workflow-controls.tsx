'use client';

import React, { useState } from 'react';
import {
  Sun,
  Camera,
  ChevronDown,
  ChevronUp,
  Ban,
  Film,
  Compass,
  Palette,
  Check,
} from 'lucide-react';

export const STYLE_PRESETS = [
  {
    id: 'cinematic-35mm',
    label: 'Cinematic 35mm',
    promptChunk:
      'cinematic 35mm film still, Kodak Vision3 grain, anamorphic lens flare, shallow depth of field',
  },
  {
    id: 'editorial-vogue',
    label: 'Editorial Vogue',
    promptChunk:
      'high-fashion editorial photography, striking lighting, textured fabric, studio backdrop, minimalist composition',
  },
  {
    id: 'cyberpunk-neon',
    label: 'Cyberpunk Neon',
    promptChunk:
      'cyberpunk aesthetic, vibrant neon reflections on wet asphalt, holographic lighting, dark chromatic atmosphere',
  },
  {
    id: 'photoreal-8k',
    label: 'Hyperreal 8K',
    promptChunk:
      'hyperrealistic 8k resolution, authentic surface imperfections, ray-traced subsurface scattering, ultra-detailed',
  },
  {
    id: 'film-noir',
    label: 'Film Noir',
    promptChunk:
      'dramatic film noir, high-contrast monochrome, venetian blind shadows, hazy smoke, vintage atmosphere',
  },
  {
    id: 'macro-detail',
    label: 'Macro Botanical',
    promptChunk:
      'extreme macro photography, delicate translucent textures, dew drops, dreamy bokeh background',
  },
  {
    id: 'anime-ghibli',
    label: 'Anime Studio',
    promptChunk:
      'hand-painted anime background aesthetic, lush painted clouds, nostalgic warm lighting, vibrant palette',
  },
  {
    id: 'brutalist-arch',
    label: 'Architectural',
    promptChunk:
      'brutalist sculptural architecture, monumental concrete angles, twilight sky, clean geometric shadows',
  },
];

export const LIGHTING_PRESETS = [
  {
    id: 'golden-hour',
    label: 'Golden Hour',
    promptChunk:
      'warm golden hour sun, soft elongated shadows, atmospheric haze',
  },
  {
    id: 'studio-softbox',
    label: 'Studio Softbox',
    promptChunk:
      'pristine studio softbox lighting, clean rim light, balanced neutral fill',
  },
  {
    id: 'volumetric-rays',
    label: 'God Rays',
    promptChunk:
      'volumetric god rays cutting through misty air, dramatic beams',
  },
  {
    id: 'chiaroscuro',
    label: 'Chiaroscuro',
    promptChunk:
      'deep Rembrandt chiaroscuro lighting, dark rich shadows, intense spotlight',
  },
  {
    id: 'neon-glow',
    label: 'Neon Glow',
    promptChunk:
      'saturated cyan and magenta neon ambient illumination, reflective glow',
  },
];

export const ASPECT_RATIOS = [
  {
    id: '16:9',
    label: '16:9',
    subtitle: 'Landscape / Cinema',
    width: 32,
    height: 18,
  },
  {
    id: '9:16',
    label: '9:16',
    subtitle: 'Portrait / Reels',
    width: 18,
    height: 32,
  },
  { id: '1:1', label: '1:1', subtitle: 'Square / Feed', width: 24, height: 24 },
  {
    id: '4:3',
    label: '4:3',
    subtitle: 'Classic Standard',
    width: 28,
    height: 21,
  },
  {
    id: '21:9',
    label: '21:9',
    subtitle: 'Ultra-Wide Scope',
    width: 36,
    height: 15,
  },
];

export const CAMERA_MOTIONS = [
  { id: 'Dolly in', label: 'Dolly in', desc: 'Smooth forward push' },
  { id: 'Orbit 360°', label: 'Orbit 360°', desc: 'Continuous circular spin' },
  { id: 'Crane up', label: 'Crane up', desc: 'Rising vertical ascent' },
  { id: 'Handheld', label: 'Handheld', desc: 'Organic cinema sway' },
  { id: 'FPV fly-through', label: 'FPV fly', desc: 'Dynamic sweeping drone' },
  { id: 'Slow zoom', label: 'Slow zoom', desc: 'Subtle optical punch-in' },
];

export const COMMON_NEGATIVES = [
  'blurry, unfocused',
  'deformed hands & fingers',
  'distorted face',
  'watermark, signature, text',
  'oversaturated, cartoonish',
  'low resolution, artifacts',
];

interface WorkflowControlsProps {
  prompt: string;
  onPromptChange: (next: string) => void;
  ratio: string;
  onRatioChange: (r: string) => void;
  cameraMotion: string;
  onCameraMotionChange: (m: string) => void;
  negativePrompt: string;
  onNegativePromptChange: (n: string) => void;
  mode: string;
  onNotice: (msg: string, type?: 'info' | 'success' | 'warning') => void;
}

export default function WorkflowControls({
  prompt,
  onPromptChange,
  ratio,
  onRatioChange,
  cameraMotion,
  onCameraMotionChange,
  negativePrompt,
  onNegativePromptChange,
  mode,
  onNotice,
}: WorkflowControlsProps) {
  const [showNegative, setShowNegative] = useState(false);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedLighting, setSelectedLighting] = useState<string | null>(null);

  // Toggle style chip in prompt
  const toggleStyle = (style: (typeof STYLE_PRESETS)[0]) => {
    const isSelected = selectedStyles.includes(style.id);
    let updatedPrompt = prompt.trim();

    if (isSelected) {
      // Remove style text
      updatedPrompt = updatedPrompt
        .replace(new RegExp(`(, )?${style.promptChunk}`, 'gi'), '')
        .trim();
      setSelectedStyles((prev) => prev.filter((id) => id !== style.id));
      onNotice(`Removed style: ${style.label}`, 'info');
    } else {
      // Append style text
      updatedPrompt = updatedPrompt
        ? `${updatedPrompt}, ${style.promptChunk}`
        : style.promptChunk;
      setSelectedStyles((prev) => [...prev, style.id]);
      onNotice(`Applied style: ${style.label}`, 'success');
    }
    onPromptChange(updatedPrompt);
  };

  // Toggle lighting chip in prompt
  const toggleLighting = (light: (typeof LIGHTING_PRESETS)[0]) => {
    const isSelected = selectedLighting === light.id;
    let updatedPrompt = prompt.trim();

    if (isSelected) {
      updatedPrompt = updatedPrompt
        .replace(new RegExp(`(, )?${light.promptChunk}`, 'gi'), '')
        .trim();
      setSelectedLighting(null);
    } else {
      // If previous lighting existed, try to clean it
      if (selectedLighting) {
        const prev = LIGHTING_PRESETS.find((l) => l.id === selectedLighting);
        if (prev) {
          updatedPrompt = updatedPrompt
            .replace(new RegExp(`(, )?${prev.promptChunk}`, 'gi'), '')
            .trim();
        }
      }
      updatedPrompt = updatedPrompt
        ? `${updatedPrompt}, ${light.promptChunk}`
        : light.promptChunk;
      setSelectedLighting(light.id);
      onNotice(`Applied lighting: ${light.label}`, 'success');
    }
    onPromptChange(updatedPrompt);
  };

  // Append negative tag
  const appendNegativeTag = (tag: string) => {
    if (negativePrompt.toLowerCase().includes(tag.toLowerCase())) return;
    const next = negativePrompt.trim() ? `${negativePrompt}, ${tag}` : tag;
    onNegativePromptChange(next);
  };

  const isVideoOrCinema = mode === 'video' || mode === 'cinema';

  return (
    <div className="workflow-controls-container">
      {/* Creative Pipeline Stepper */}
      <div className="creative-stepper">
        <div className="step-item active">
          <span className="step-dot">1</span>
          <span className="step-title">Prompt & Concept</span>
        </div>
        <div className="step-connector" />
        <div className="step-item active">
          <span className="step-dot">2</span>
          <span className="step-title">Style & Framing</span>
        </div>
        <div className="step-connector" />
        <div className="step-item">
          <span className="step-dot">3</span>
          <span className="step-title">Generate & Inspect</span>
        </div>
        <div className="step-connector" />
        <div className="step-item">
          <span className="step-dot">4</span>
          <span className="step-title">Direct & Storyboard</span>
        </div>
      </div>

      {/* Visual Aspect Ratio Selector */}
      <div className="workflow-section">
        <div className="section-label-row">
          <label className="field-label">
            <Compass size={14} />
            Aspect Ratio & Framing
          </label>
          <span className="active-ratio-badge">{ratio}</span>
        </div>

        <div className="ratio-cards-grid">
          {ASPECT_RATIOS.map((item) => {
            const isSelected = ratio === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`ratio-card ${isSelected ? 'selected' : ''}`}
                onClick={() => onRatioChange(item.id)}
              >
                <div className="ratio-visual-box">
                  <div
                    className="ratio-rect"
                    style={{
                      width: `${item.width}px`,
                      height: `${item.height}px`,
                    }}
                  />
                </div>
                <span className="ratio-text">{item.label}</span>
                <small className="ratio-sub">
                  {item.subtitle.split(' / ')[0]}
                </small>
              </button>
            );
          })}
        </div>
      </div>

      {/* Style Presets Palette */}
      <div className="workflow-section">
        <div className="section-label-row">
          <label className="field-label">
            <Palette size={14} />
            Art Direction & Styles
          </label>
          <span className="chips-hint">Click to combine</span>
        </div>

        <div className="chips-flow">
          {STYLE_PRESETS.map((s) => {
            const isSelected = selectedStyles.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                className={`style-chip ${isSelected ? 'active' : ''}`}
                onClick={() => toggleStyle(s)}
              >
                {isSelected && <Check size={12} className="text-[#00d2ff]" />}
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lighting & Atmosphere Chips */}
      <div className="workflow-section">
        <div className="section-label-row">
          <label className="field-label">
            <Sun size={14} />
            Lighting & Atmosphere
          </label>
        </div>

        <div className="chips-flow">
          {LIGHTING_PRESETS.map((l) => {
            const isSelected = selectedLighting === l.id;
            return (
              <button
                key={l.id}
                type="button"
                className={`style-chip lighting-chip ${isSelected ? 'active' : ''}`}
                onClick={() => toggleLighting(l)}
              >
                {isSelected && <Check size={12} className="text-[#ffaa40]" />}
                <span>{l.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Camera Motion Visual Cards (Video / Cinema only) */}
      {isVideoOrCinema && (
        <div className="workflow-section">
          <div className="section-label-row">
            <label className="field-label">
              <Camera size={14} />
              Camera Movement
            </label>
            <span className="active-ratio-badge">{cameraMotion}</span>
          </div>

          <div className="motion-chips-grid">
            {CAMERA_MOTIONS.map((m) => {
              const isSelected = cameraMotion === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  className={`motion-chip-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => onCameraMotionChange(m.id)}
                >
                  <div className="motion-card-top">
                    <Film
                      size={13}
                      className={
                        isSelected ? 'text-[#00d2ff]' : 'text-[#828b98]'
                      }
                    />
                    <span className="motion-name">{m.label}</span>
                  </div>
                  <small className="motion-desc">{m.desc}</small>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Collapsible Negative Prompt */}
      <div className="workflow-section negative-prompt-accordion">
        <button
          type="button"
          className="negative-accordion-header"
          onClick={() => setShowNegative(!showNegative)}
        >
          <div className="negative-title">
            <Ban size={14} className="text-[#ff5252]" />
            <span>Negative Prompt</span>
            <small>Exclude unwanted attributes</small>
          </div>
          {showNegative ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {showNegative && (
          <div className="negative-accordion-content">
            <textarea
              value={negativePrompt}
              onChange={(e) => onNegativePromptChange(e.target.value)}
              placeholder="e.g. blurry, low quality, deformed hands, watermark, oversaturated..."
              rows={3}
              className="negative-textarea"
            />
            <div className="negative-quick-tags">
              <span className="quick-tag-label">Quick exclude:</span>
              {COMMON_NEGATIVES.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="neg-tag-pill"
                  onClick={() => appendNegativeTag(tag)}
                >
                  + {tag.split(',')[0]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
