'use client';
import dynamic from 'next/dynamic';
import NextImage from 'next/image';
import Link from 'next/link';
import AccountMenu from '@/components/auth/account-menu';
import {
  hero,
  works,
  modes,
  labels,
  shortLabels,
  navGroups,
  badges,
  motions,
  categories,
  type View,
  type Work,
  type Draft,
} from '@/lib/studio-data';
const StudioDialogs = dynamic(() => import('./studio-dialogs'));
const GetStudio = dynamic(() => import('./get-studio'));

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Aperture,
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  Clapperboard,
  Copy,
  FolderOpen,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  LoaderCircle,
  Menu,
  MoreHorizontal,
  MousePointer2,
  Plus,
  Search,
  Sparkles,
  Upload,
  WandSparkles,
  X,
  CircleHelp,
  Bell,
  Trash2,
  Volume2,
} from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { TooltipProvider, StudioTooltip } from '@/components/ui/radix-tooltip';
import { ArtworkInspectorCard } from '@/components/ui/radix-hover-card';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/radix-dropdown';
import { useGsapTilt } from '@/hooks/use-gsap-tilt';
import { motion, AnimatePresence } from 'framer-motion';

gsap.registerPlugin(useGSAP);

function Picker({
  value,
  onChange,
  values,
}: {
  value: string;
  onChange: (v: string) => void;
  values: string[];
}) {
  return (
    <Select value={value} onValueChange={(v) => v && onChange(v)}>
      <SelectTrigger className="picker">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {values.map((v) => (
          <SelectItem key={v} value={v}>
            {v}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function HeroSection({
  onRemix,
  onDetail,
}: {
  onRemix: (w: Work) => void;
  onDetail: (w: Work) => void;
}) {
  const heroRef = useRef<HTMLElement>(null);
  const { onMouseMove, onMouseLeave } = useGsapTilt({
    maxRotation: 3,
    scale: 1.008,
  });

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.fromTo(
        heroRef.current,
        { opacity: 0, scale: 0.97 },
        { opacity: 1, scale: 1, duration: 0.7 },
      )
        .fromTo(
          '.hero-tag',
          { opacity: 0, y: -10 },
          { opacity: 1, y: 0, duration: 0.4 },
          '-=0.35',
        )
        .fromTo(
          '.hero-copy h2',
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: 0.55 },
          '-=0.3',
        )
        .fromTo(
          '.hero-copy p',
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.45 },
          '-=0.35',
        )
        .fromTo(
          '.hero-copy .button',
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 0.4 },
          '-=0.3',
        )
        .fromTo(
          '.hero-bottom',
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.4 },
          '-=0.2',
        );
    },
    { scope: heroRef },
  );

  return (
    <section
      ref={heroRef}
      className="hero-card"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <NextImage
        fill
        preload
        sizes="100vw"
        src={hero}
        alt="Surreal liquid chrome artwork suspended above volcanic sand at sunset"
      />
      <div className="hero-shade" />
      <div className="hero-copy">
        <span className="hero-tag">
          <span />
          APEXA ORIGINALS <span className="tag-line" /> VOLUME 01
        </span>
        <h2>
          Make the
          <br />
          unimagined.
        </h2>
        <p>
          From a single thought.
          <br />
          To cinematic frames.
        </p>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="button light"
          onClick={() => onRemix(works[4])}
        >
          Start creating <ArrowUpRight size={17} />
        </motion.button>
      </div>
      <div className="hero-bottom">
        <span>
          <Sparkles size={14} /> IMAGINED WITH APEXA
        </span>
        <StudioTooltip content="Inspect Beyond the ordinary artwork">
          <button
            aria-label="View Beyond the ordinary artwork"
            onClick={() => onDetail(works[4])}
          >
            <ArrowUpRight size={21} />
          </button>
        </StudioTooltip>
      </div>
      <span className="hero-counter">
        01 <span>/ 01</span>
      </span>
    </section>
  );
}

function WorkCardItem({
  w,
  isSaved,
  onToggleSave,
  onOpenDetail,
  onRemix,
  onCopyPrompt,
}: {
  w: Work;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onOpenDetail: (w: Work) => void;
  onRemix: (w: Work) => void;
  onCopyPrompt: (prompt: string) => void;
}) {
  const { onMouseMove, onMouseLeave } = useGsapTilt({
    maxRotation: 5,
    scale: 1.015,
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.18 } }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 32,
        mass: 0.8,
      }}
      className={'work-card work-' + w.id}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <ArtworkInspectorCard work={w} onRemix={onRemix}>
        <button
          className="work-image"
          onClick={() => onOpenDetail(w)}
          aria-label={`View ${w.title}`}
        >
          <NextImage
            fill
            src={w.image}
            alt={w.title}
            sizes={
              w.id === 'chrome' || w.id === 'car'
                ? '(max-width: 1000px) 100vw, 50vw'
                : '(max-width: 767px) 100vw, (max-width: 1000px) 50vw, 25vw'
            }
          />
          <span className="work-type">
            {w.id === 'chrome' ? (
              <Sparkles size={12} />
            ) : (
              <ImageIcon size={12} />
            )}{' '}
            {w.id === 'chrome' ? 'AI ORIGINAL' : 'INSPIRATION'}
          </span>
          <span className="work-hover">
            <ArrowUpRight />
            Explore concept
          </span>
        </button>
      </ArtworkInspectorCard>

      <div className="card-actions-top">
        <StudioTooltip
          content={isSaved ? 'Remove from saved' : 'Save to collection'}
          side="top"
        >
          <button
            className={'save-work ' + (isSaved ? 'is-saved' : '')}
            onClick={() => onToggleSave(w.id)}
            aria-label={
              isSaved ? 'Remove ' + w.title + ' from saved' : 'Save ' + w.title
            }
          >
            <Bookmark size={16} fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        </StudioTooltip>

        <DropdownMenu>
          <StudioTooltip content="More actions" side="top">
            <DropdownMenuTrigger asChild>
              <button
                className="card-more-btn"
                aria-label={`More options for ${w.title}`}
              >
                <MoreHorizontal size={16} />
              </button>
            </DropdownMenuTrigger>
          </StudioTooltip>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onRemix(w)}>
              <WandSparkles size={14} className="text-[#00d2ff]" />
              <span>Remix in Studio</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCopyPrompt(w.prompt)}>
              <Copy size={14} />
              <span>Copy Prompt</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onToggleSave(w.id)}>
              <Bookmark size={14} />
              <span>{isSaved ? 'Remove Bookmark' : 'Bookmark Art'}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onOpenDetail(w)}>
              <ArrowUpRight size={14} />
              <span>Inspect Details</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <button
        type="button"
        className="work-info"
        onClick={() => onOpenDetail(w)}
        aria-label={`View details for ${w.title}`}
      >
        <div>
          <h3>{w.title}</h3>
          <p>{w.author}</p>
        </div>
        <ArrowUpRight size={17} />
      </button>
    </motion.div>
  );
}

function MotionCardItem({
  m,
  index,
  previewImage,
  onSelect,
}: {
  m: string;
  index: number;
  previewImage: string;
  onSelect: () => void;
}) {
  const { onMouseMove, onMouseLeave } = useGsapTilt({
    maxRotation: 5,
    scale: 1.02,
  });

  return (
    <button
      className="motion-card"
      onClick={onSelect}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <NextImage
        fill
        sizes="(max-width: 767px) 50vw, 33vw"
        src={previewImage}
        alt="Camera motion reference preview"
      />
      <span className="motion-number">0{index + 1}</span>
      <div>
        <MousePointer2 />
        <h3>{m}</h3>
        <span>
          Apply motion <ArrowUpRight size={15} />
        </span>
      </div>
    </button>
  );
}

export default function CreativeApp() {
  return <Studio />;
}
function Studio() {
  const [brand, setBrand] = useState('');
  const [view, setView] = useState<View>('explore');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [detail, setDetail] = useState<Work | null>(null);
  const [saved, setSaved] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('Apexa Image');
  const [ratio, setRatio] = useState('16:9');
  const [duration, setDuration] = useState('5s');
  const [cameraMotion, setCameraMotion] = useState('Dolly in');
  const [notice, setNotice] = useState('');
  const [help, setHelp] = useState(false);
  const [busy, setBusy] = useState(false);
  const [upload, setUpload] = useState<string | null>(null);
  const [result, setResult] = useState<{ url: string; type: string } | null>(
    null,
  );
  const [brightness, setBrightness] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [scenes, setScenes] = useState([
    {
      id: '1',
      text: 'Opening wide shot — dawn light sweeps across sculpted sand dunes.',
    },
  ]);
  const fileRef = useRef<HTMLInputElement>(null);
  const studioRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headerCompact, setHeaderCompact] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);

  const copyPromptToClipboard = useCallback((text: string) => {
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(text);
      setNotice('Prompt copied to clipboard!');
    }
  }, []);

  useGSAP(
    () => {
      // Animate page heading on view change
      gsap.fromTo(
        '.page-heading',
        { opacity: 0, y: -16 },
        { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' },
      );

      // Animate quick tools
      if (view === 'explore') {
        gsap.fromTo(
          '.quick-tools button',
          { opacity: 0, y: 14, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.4,
            stagger: 0.05,
            ease: 'power2.out',
            delay: 0.25,
          },
        );
      }

      // Animate motion cards
      if (view === 'presets') {
        gsap.fromTo(
          '.motion-grid .motion-card',
          { opacity: 0, y: 18, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.45,
            stagger: 0.04,
            ease: 'power2.out',
            delay: 0.1,
          },
        );
      }

      // Animate studio creator panels when in image/video/cinema/canvas/audio
      if (
        [
          'image',
          'video',
          'cinema',
          'canvas',
          'audio',
          'edit',
          'marketing',
        ].includes(view)
      ) {
        gsap.fromTo(
          '.studio-layout, .cinema-layout, .canvas-layout, .marketing-layout',
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
        );
      }
    },
    { scope: studioRef, dependencies: [view] },
  );

  const navigate = useCallback((v: View) => {
    setView(v);
    location.hash = v;
    setMobileMenuOpen(false);
    setCmdOpen(false);
    setResult(null);
    setQuery('');
    setModel(v === 'video' || v === 'cinema' ? 'Apexa Video' : 'Apexa Image');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const raw =
          localStorage.getItem('apexa-local-v1') ||
          localStorage.getItem('frame-local-v1');
        if (raw) {
          const p = JSON.parse(raw);
          if (Array.isArray(p.saved)) {
            setSaved(p.saved.filter((x: unknown) => typeof x === 'string'));
          }
          if (Array.isArray(p.drafts)) {
            setDrafts(
              p.drafts.filter(
                (x: Draft) =>
                  x &&
                  typeof x.prompt === 'string' &&
                  Object.hasOwn(labels, x.mode),
              ),
            );
          }
        }
      } catch {}
      const v = location.hash.slice(1) as View;
      if (Object.hasOwn(labels, v)) {
        setView(v);
        setModel(
          v === 'video' || v === 'cinema' ? 'Apexa Video' : 'Apexa Image',
        );
      }
    }, 0);
    const handler = () => {
      const v = location.hash.slice(1) as View;
      setView(v in labels ? v : 'explore');
      setModel(v === 'video' || v === 'cinema' ? 'Apexa Video' : 'Apexa Image');
      setResult(null);
    };
    window.addEventListener('hashchange', handler);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('hashchange', handler);
    };
  }, []);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(''), 6500);
    return () => clearTimeout(t);
  }, [notice]);
  /* Scroll-driven compact header */
  useEffect(() => {
    const onScroll = () => setHeaderCompact(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  /* Keyboard shortcuts */
  useEffect(() => {
    const allViews = navGroups.flatMap((g) => g.views);
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen((v) => !v);
        return;
      }
      if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('.search input')?.focus();
        return;
      }
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setHelp(true);
        return;
      }
      if (e.key === 'n' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        navigate('image');
        return;
      }
      const num = parseInt(e.key);
      if (num >= 1 && num <= allViews.length) {
        e.preventDefault();
        navigate(allViews[num - 1]);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [navigate]);
  const persist = useCallback((nextSaved: string[], nextDrafts: Draft[]) => {
    try {
      localStorage.setItem(
        'apexa-local-v1',
        JSON.stringify({ saved: nextSaved, drafts: nextDrafts }),
      );
      return true;
    } catch {
      setNotice(
        'Browser storage is full. Export a brief to preserve your data.',
      );
      return false;
    }
  }, []);
  const toggleSave = useCallback(
    (id: string) => {
      setSaved((prev) => {
        const next = prev.includes(id)
          ? prev.filter((x) => x !== id)
          : [...prev, id];
        persist(next, drafts);
        return next;
      });
    },
    [drafts, persist],
  );
  const saveDraft = useCallback(() => {
    if (!prompt.trim()) {
      setNotice('Please write a concept before saving.');
      return;
    }
    const d: Draft = {
      id: crypto.randomUUID(),
      title: prompt.slice(0, 54),
      scenes,
      motion: cameraMotion,
      duration,
      brand,
      prompt,
      mode: view,
      model,
      ratio,
      created: new Date().toISOString(),
    };
    const next = [d, ...drafts];
    if (persist(saved, next)) {
      setDrafts(next);
      setNotice('Draft saved on this device.');
    }
  }, [
    prompt,
    scenes,
    cameraMotion,
    duration,
    brand,
    view,
    model,
    ratio,
    drafts,
    persist,
    saved,
  ]);
  const download = useCallback((data: Blob, name: string) => {
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, []);
  const exportBrief = useCallback(() => {
    download(
      new Blob(
        [
          JSON.stringify(
            {
              app: 'Apexa',
              prompt,
              model,
              ratio,
              duration,
              motion: cameraMotion,
              scenes,
              brand,
            },
            null,
            2,
          ),
        ],
        { type: 'application/json' },
      ),
      'frame-creative-brief.json',
    );
    setNotice('Creative brief exported.');
  }, [download, prompt, model, ratio, duration, cameraMotion, scenes, brand]);
  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (
      !['image/png', 'image/jpeg', 'image/webp'].includes(file.type) ||
      file.size > 10 * 1024 * 1024
    ) {
      setNotice('Please choose a JPG, PNG, or WebP image under 10 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setUpload(reader.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };
  const generate = async () => {
    if (!prompt.trim()) {
      setNotice('Please describe what you want to create first.');
      return;
    }
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          mode: view,
          model,
          ratio,
          duration,
          motion: cameraMotion,
          image: upload,
        }),
      });
      const data = (await res.json()) as {
        url: string;
        type: string;
        error?: string;
      };
      if (!res.ok)
        throw new Error(data.error || 'Generation is currently unavailable.');
      setResult(data);
      setNotice('Your creation is ready.');
    } catch (e) {
      setNotice(
        e instanceof Error ? e.message : 'Connection failed. Please try again.',
      );
    } finally {
      setBusy(false);
    }
  };
  const remix = (w: Work) => {
    setPrompt(w.prompt);
    setDetail(null);
    navigate('image');
  };
  const exportImage = () => {
    if (!upload) {
      setNotice('Upload an image to adjust and export.');
      return;
    }
    const im = new window.Image();
    im.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = im.naturalWidth;
      canvas.height = im.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.filter = `brightness(${brightness}%) saturate(${saturation}%)`;
      ctx.drawImage(im, 0, 0);
      canvas.toBlob((b) => b && download(b, 'frame-edited.png'), 'image/png');
    };
    im.src = upload;
  };
  const visible = works.filter(
    (w) =>
      (category === 'All' ||
        w.category === category ||
        (category === 'Cinematic' && ['chrome', 'car'].includes(w.id))) &&
      `${w.title} ${w.category} ${w.prompt}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (view !== 'saved' || saved.includes(w.id)),
  );
  const navLabel = (id: View) =>
    (shortLabels[id] ?? labels[id]).replace(/ (Generation|& Voice)/, '');
  return (
    <TooltipProvider delayDuration={150}>
      <div ref={studioRef} className="frame-app-root">
        {/* ── Header navigation bar ── */}
        <header className={`frame-header${headerCompact ? ' compact' : ''}`}>
          <div className="header-inner">
            {/* Brand logo */}
            <StudioTooltip content="Apexa Home · Explore" side="bottom">
              <button
                className="header-brand"
                onClick={() => navigate('explore')}
                aria-label="Apexa home"
              >
                <Aperture />
                <span>
                  apexa<span className="brand-dot">.</span>
                </span>
              </button>
            </StudioTooltip>

            {/* Desktop scrollable nav */}
            <nav className="header-nav" aria-label="Main navigation">
              <div className="header-nav-scroll">
                {navGroups.map((group, gi) => (
                  <span key={gi} className="nav-group">
                    {gi > 0 && <span className="nav-divider" aria-hidden />}
                    {group.views.map((id) => (
                      <button
                        key={id}
                        className={`nav-link${view === id ? ' active' : ''}`}
                        onClick={() => navigate(id)}
                      >
                        {view === id && (
                          <motion.span
                            layoutId="headerActivePill"
                            className="nav-active-pill"
                            transition={{
                              type: 'spring',
                              stiffness: 480,
                              damping: 36,
                            }}
                          />
                        )}
                        <span className="nav-link-content">
                          {navLabel(id)}
                          {badges[id] && (
                            <em className="nav-badge">{badges[id]}</em>
                          )}
                          {id === 'saved' && saved.length > 0 && (
                            <em className="nav-badge">{saved.length}</em>
                          )}
                        </span>
                      </button>
                    ))}
                  </span>
                ))}
                <span className="nav-group">
                  <span className="nav-divider" aria-hidden />
                  <Link className="nav-link" href="/production">
                    <Clapperboard size={14} />
                    <span className="nav-link-content">Production Suite</span>
                  </Link>
                </span>
              </div>
            </nav>

            {/* Right actions */}
            <div className="header-actions">
              <StudioTooltip content="Help & Shortcuts" kbd="?" side="bottom">
                <button className="header-action" onClick={() => setHelp(true)}>
                  <CircleHelp size={16} />
                  <span>Help</span>
                </button>
              </StudioTooltip>
              <StudioTooltip content="Notifications" side="bottom">
                <button
                  className="icon-button notification"
                  aria-label="Notifications"
                  onClick={() =>
                    setNotice('You are all caught up. Welcome to Apexa!')
                  }
                >
                  <Bell size={18} />
                </button>
              </StudioTooltip>
              <span className="header-divider" />
              <AccountMenu />
              {/* Mobile hamburger */}
              <button
                className="mobile-menu-toggle"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </header>

        {/* ── Mobile slide-down menu ── */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              key="mobile-overlay"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
              tabIndex={-1}
              className="mobile-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={(e: React.MouseEvent) => {
                if (e.target === e.currentTarget) setMobileMenuOpen(false);
              }}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'Escape') setMobileMenuOpen(false);
              }}
            >
              <motion.nav
                className="mobile-menu"
                aria-label="Mobile navigation menu"
                initial={{ y: -18, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -18, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              >
                {navGroups.map((group, gi) => (
                  <div key={gi} className="mobile-nav-group">
                    {group.label && (
                      <div className="mobile-nav-label">{group.label}</div>
                    )}
                    {group.views.map((id) => (
                      <button
                        key={id}
                        className={`mobile-nav-link${view === id ? ' active' : ''}`}
                        onClick={() => navigate(id)}
                      >
                        {labels[id]}
                        {badges[id] && (
                          <em className="nav-badge">{badges[id]}</em>
                        )}
                        {id === 'saved' && saved.length > 0 && (
                          <em className="nav-badge">{saved.length}</em>
                        )}
                      </button>
                    ))}
                  </div>
                ))}
                <div className="mobile-nav-footer">
                  <Link className="mobile-nav-link" href="/production">
                    <Clapperboard size={16} /> Production Suite
                  </Link>
                  <button
                    onClick={() => {
                      setHelp(true);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <CircleHelp size={16} /> Help & Information
                  </button>
                </div>
              </motion.nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Command palette (Ctrl+K) ── */}
        <AnimatePresence>
          {cmdOpen && (
            <motion.div
              key="cmd-overlay"
              role="dialog"
              aria-modal="true"
              aria-label="Command palette"
              tabIndex={-1}
              className="cmd-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={(e: React.MouseEvent) => {
                if (e.target === e.currentTarget) setCmdOpen(false);
              }}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'Escape') setCmdOpen(false);
              }}
            >
              <motion.div
                className="cmd-palette"
                initial={{ scale: 0.94, opacity: 0, y: -14 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.94, opacity: 0, y: -14 }}
                transition={{ type: 'spring', stiffness: 460, damping: 30 }}
              >
                <div className="cmd-search">
                  <Search size={18} />
                  <input
                    ref={(el) => {
                      el?.focus();
                    }}
                    placeholder="Search views, actions, presets…"
                    onChange={(e) => {
                      const q = e.target.value.toLowerCase();
                      if (!q) return;
                      const match = navGroups
                        .flatMap((g) => g.views)
                        .find(
                          (id) =>
                            labels[id].toLowerCase().includes(q) ||
                            id.includes(q),
                        );
                      if (match) navigate(match);
                    }}
                    onKeyDown={(e) => e.key === 'Escape' && setCmdOpen(false)}
                  />
                  <kbd>ESC</kbd>
                </div>
                <div className="cmd-items">
                  {navGroups.flatMap((g) =>
                    g.views.map((id) => (
                      <button
                        key={id}
                        className="cmd-item"
                        onClick={() => navigate(id)}
                      >
                        <span>{labels[id]}</span>
                        {badges[id] && (
                          <em className="nav-badge">{badges[id]}</em>
                        )}
                      </button>
                    )),
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Main content ── */}
        <div className="app-main">
          <main className="main-content">
            {view === 'explore' || view === 'saved' || view === 'presets' ? (
              <>
                <div className="page-heading">
                  <div>
                    <h1>
                      {view === 'saved'
                        ? 'Curated Inspiration'
                        : view === 'presets'
                          ? 'One movement. Endless emotion.'
                          : 'Unbounded Imagination.'}
                    </h1>
                    <p>
                      {view === 'saved'
                        ? 'Concepts and styles you want to revisit.'
                        : view === 'presets'
                          ? 'Choose camera motion and direct your visual story.'
                          : 'Make the unimagined. In your own vision.'}
                    </p>
                  </div>
                  <StudioTooltip
                    content="Create new project"
                    kbd="N"
                    side="left"
                  >
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="button primary"
                      onClick={() => navigate('image')}
                    >
                      <Plus size={17} />
                      New Project
                    </motion.button>
                  </StudioTooltip>
                </div>
                {view === 'explore' && (
                  <>
                    <HeroSection onRemix={remix} onDetail={setDetail} />
                    <section
                      className="quick-tools"
                      aria-label="Creative tools"
                    >
                      {modes.map((m) => (
                        <StudioTooltip
                          key={m.id}
                          content={`Launch ${m.name}`}
                          side="bottom"
                        >
                          <motion.button
                            whileHover={{ y: -3 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{
                              type: 'spring',
                              stiffness: 450,
                              damping: 25,
                            }}
                            onClick={() => navigate(m.id)}
                          >
                            <span className={'tool-icon ' + m.id}>
                              <m.icon size={21} />
                            </span>
                            <span>
                              <b>{m.name}</b>
                              <small>{m.sub}</small>
                            </span>
                            <ArrowUpRight className="tool-arrow" size={16} />
                          </motion.button>
                        </StudioTooltip>
                      ))}
                    </section>
                  </>
                )}
                {view === 'presets' ? (
                  <div className="motion-grid">
                    {motions.map((m, i) => (
                      <MotionCardItem
                        key={m}
                        m={m}
                        index={i}
                        previewImage={works[i % works.length].image}
                        onSelect={() => {
                          setCameraMotion(m);
                          navigate('video');
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="section-heading">
                      <div>
                        <span className="section-mark" />
                        <h2>
                          {view === 'saved'
                            ? 'Saved for your next production'
                            : 'Designed for your imagination'}
                        </h2>
                        <span className="subtle-label">
                          CURATED INSPIRATION
                        </span>
                      </div>
                      <button
                        className="text-button"
                        onClick={() => navigate('presets')}
                      >
                        Explore presets <ArrowRight size={16} />
                      </button>
                    </div>
                    <div className="discovery-controls">
                      <div
                        className="motion-category-tabs"
                        role="tablist"
                        aria-label="Inspiration categories"
                      >
                        {categories.map((c) => {
                          const isActive = category === c;
                          return (
                            <button
                              key={c}
                              role="tab"
                              aria-selected={isActive}
                              className={`motion-tab-btn${isActive ? ' is-active' : ''}`}
                              onClick={() => setCategory(c)}
                            >
                              {isActive && (
                                <motion.span
                                  layoutId="activeCategoryPill"
                                  className="motion-tab-pill"
                                  transition={{
                                    type: 'spring',
                                    stiffness: 480,
                                    damping: 36,
                                  }}
                                />
                              )}
                              <span className="motion-tab-text">{c}</span>
                            </button>
                          );
                        })}
                      </div>
                      <label className="search">
                        <Search size={16} />
                        <input
                          aria-label="Search inspiration"
                          placeholder="Search inspiration..."
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                        />
                        {query && (
                          <button
                            aria-label="Clear search"
                            onClick={() => setQuery('')}
                          >
                            <X size={14} />
                          </button>
                        )}
                      </label>
                    </div>
                    <div className="gallery">
                      <AnimatePresence mode="popLayout">
                        {visible.map((w) => (
                          <WorkCardItem
                            key={w.id}
                            w={w}
                            isSaved={saved.includes(w.id)}
                            onToggleSave={toggleSave}
                            onOpenDetail={setDetail}
                            onRemix={remix}
                            onCopyPrompt={copyPromptToClipboard}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                    {!visible.length && (
                      <div className="empty-state">
                        <Bookmark />
                        <h3>
                          {view === 'saved'
                            ? 'No saved concepts yet'
                            : 'No matching inspiration found'}
                        </h3>
                        <p>
                          {view === 'saved'
                            ? 'Bookmark artworks to keep them in your collection.'
                            : 'Try different keywords or select All.'}
                        </p>
                        <button
                          className="button secondary"
                          onClick={() => {
                            setQuery('');
                            setCategory('All');
                            if (view === 'saved') navigate('explore');
                          }}
                        >
                          Explore inspiration
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : view === 'library' ? (
              <>
                <div className="page-heading">
                  <div>
                    <h1>My Library</h1>
                    <p>Drafts saved locally on this browser.</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="button primary"
                    onClick={() => navigate('image')}
                  >
                    <Plus size={17} />
                    New Project
                  </motion.button>
                </div>
                <div className="draft-grid">
                  {drafts.map((d) => (
                    <article className="draft-card" key={d.id}>
                      <div className="draft-icon">
                        <Layers />
                      </div>
                      <small>
                        {labels[d.mode]} ·{' '}
                        {new Date(d.created).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </small>
                      <h3>{d.title}</h3>
                      <p>
                        {d.model} · {d.ratio}
                      </p>
                      <div>
                        <button
                          className="button secondary"
                          onClick={() => {
                            navigate(d.mode);
                            setPrompt(d.prompt);
                            setModel(d.model);
                            setRatio(d.ratio);
                            setScenes(d.scenes || []);
                            setCameraMotion(d.motion || 'Dolly in');
                            setDuration(d.duration || '5s');
                            setBrand(d.brand || '');
                          }}
                        >
                          Resume <ArrowUpRight size={15} />
                        </button>
                        <button
                          className="icon-button"
                          aria-label="Delete draft"
                          onClick={() => {
                            const next = drafts.filter((x) => x.id !== d.id);
                            if (persist(saved, next)) {
                              setDrafts(next);
                              setNotice('Draft deleted.');
                            }
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
                {!drafts.length && (
                  <div className="empty-state">
                    <FolderOpen />
                    <h2>Every production starts somewhere.</h2>
                    <p>Create and save your first creative draft.</p>
                    <button
                      className="button primary"
                      onClick={() => navigate('image')}
                    >
                      Start creating <Plus size={16} />
                    </button>
                  </div>
                )}
              </>
            ) : view === 'get' ? (
              <GetStudio onNotice={setNotice} />
            ) : (
              <>
                <div className="page-heading studio-heading">
                  <div>
                    <h1>
                      {labels[view]}
                      <span className="heading-dot">.</span>
                    </h1>
                    <p>
                      {view === 'cinema'
                        ? 'Scene by scene. Direct your narrative.'
                        : view === 'edit'
                          ? 'Precision adjustments. Fresh perspectives.'
                          : view === 'audio'
                            ? 'Give your concepts a distinct voice.'
                            : 'One spark. Endless creative possibilities.'}
                    </p>
                  </div>
                  <button className="button secondary" onClick={exportBrief}>
                    <ArrowDownToLine size={16} />
                    Export brief
                  </button>
                </div>
                <div className="studio-layout">
                  <section className="control-panel">
                    <div className="panel-title">
                      <Sparkles size={17} />
                      <h2>
                        {view === 'edit'
                          ? 'Image Adjustments'
                          : 'Creative Studio'}
                      </h2>
                    </div>
                    {view !== 'audio' && (
                      <>
                        <label
                          className="field-label"
                          htmlFor="upload-zone-btn"
                        >
                          Reference Image <span>Optional</span>
                        </label>
                        <button
                          id="upload-zone-btn"
                          className={
                            'upload-zone ' + (upload ? 'has-upload' : '')
                          }
                          onClick={() => fileRef.current?.click()}
                        >
                          {upload ? (
                            <NextImage
                              src={upload}
                              alt="Uploaded reference image"
                              unoptimized
                              width={400}
                              height={118}
                            />
                          ) : (
                            <>
                              <Upload size={23} />
                              <span>Upload your image</span>
                              <small>JPG, PNG, WebP · Up to 10 MB</small>
                            </>
                          )}
                        </button>
                        {upload && (
                          <button
                            className="text-button remove-upload"
                            onClick={() => setUpload(null)}
                          >
                            <X size={13} />
                            Remove image
                          </button>
                        )}
                      </>
                    )}
                    {view === 'marketing' && (
                      <div className="brand-brief">
                        <label className="field-label" htmlFor="brand">
                          Brand / Product Name
                        </label>
                        <input
                          id="brand"
                          value={brand}
                          onChange={(e) => setBrand(e.target.value)}
                          placeholder="e.g. AURA — Botanical Fragrance"
                          maxLength={160}
                        />
                        <label className="field-label" htmlFor="brand">
                          Campaign Presets
                        </label>
                        <div className="campaign-presets">
                          {[
                            'Product Launch',
                            'Social Campaign',
                            'Lifestyle Story',
                          ].map((style, i) => (
                            <button
                              key={style}
                              onClick={() => {
                                if (!brand.trim()) {
                                  setNotice(
                                    'Please enter a brand or product name first.',
                                  );
                                  return;
                                }
                                setRatio(i === 1 ? '9:16' : '1:1');
                                setPrompt(
                                  `Create a ${style} campaign image for ${brand}. Elegant product styling, considered composition, premium lighting, clean space for brand messaging. ${i === 2 ? 'Natural lifestyle setting, authentic moments.' : 'Studio product photography, detailed textures.'}`,
                                );
                              }}
                            >
                              {style}
                              <ArrowUpRight size={12} />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {view === 'edit' ? (
                      <>
                        <div className="slider-label">
                          <label htmlFor="brightness-slider">Brightness</label>
                          <span>{brightness}%</span>
                        </div>
                        <Slider
                          id="brightness-slider"
                          value={[brightness]}
                          onValueChange={(v) =>
                            setBrightness(Array.isArray(v) ? v[0] : v)
                          }
                          min={20}
                          max={180}
                        />
                        <div className="slider-label">
                          <label htmlFor="saturation-slider">Saturation</label>
                          <span>{saturation}%</span>
                        </div>
                        <Slider
                          id="saturation-slider"
                          value={[saturation]}
                          onValueChange={(v) =>
                            setSaturation(Array.isArray(v) ? v[0] : v)
                          }
                          min={0}
                          max={200}
                        />
                        <button
                          className="button secondary full"
                          onClick={() => {
                            setBrightness(100);
                            setSaturation(100);
                          }}
                        >
                          Reset adjustments
                        </button>
                        <button
                          className="button primary full"
                          onClick={exportImage}
                        >
                          <ArrowDownToLine size={16} />
                          Export PNG
                        </button>
                        <p className="field-hint">
                          Processed entirely on your device. Images are never
                          uploaded.
                        </p>
                      </>
                    ) : (
                      <>
                        <label className="field-label" htmlFor="prompt">
                          {view === 'audio'
                            ? 'Voiceover Script'
                            : 'Your Creative Prompt'}
                          <button
                            onClick={() =>
                              setPrompt(
                                works[Math.floor(Math.random() * works.length)]
                                  .prompt,
                              )
                            }
                            aria-label="Inspire prompt"
                          >
                            <WandSparkles size={15} />
                          </button>
                        </label>
                        <textarea
                          id="prompt"
                          maxLength={4000}
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          placeholder={
                            view === 'audio'
                              ? 'Enter the voiceover script or dialogue you want to audition...'
                              : 'Describe your subject, environment, lighting, camera angle, and mood...'
                          }
                          rows={6}
                        />
                        <div className="prompt-meta">
                          <span>{prompt.length}/4000</span>
                          <button
                            onClick={() => {
                              if (prompt.trim()) {
                                setPrompt(
                                  (
                                    prompt +
                                    ', cinematic composition, detailed lighting, rich color grading'
                                  ).slice(0, 4000),
                                );
                                setNotice(
                                  'Added lighting and composition enhancements.',
                                );
                              } else
                                setNotice('Enter a concept before enhancing.');
                            }}
                          >
                            <Sparkles size={12} />
                            Enhance
                          </button>
                        </div>
                        {view !== 'audio' && (
                          <>
                            <span className="field-label">Model</span>
                            <Picker
                              value={model}
                              onChange={setModel}
                              values={
                                view === 'video' || view === 'cinema'
                                  ? ['Apexa Video']
                                  : ['Apexa Image']
                              }
                            />
                            <p className="field-hint">
                              Requires an active AI endpoint configuration to
                              generate.
                            </p>
                            <div className="field-row">
                              <div>
                                <span className="field-label">
                                  Aspect Ratio
                                </span>
                                <Picker
                                  value={ratio}
                                  onChange={setRatio}
                                  values={['16:9', '9:16', '1:1', '4:3', '3:2']}
                                />
                              </div>
                              <div>
                                <span className="field-label">
                                  {view === 'video' || view === 'cinema'
                                    ? 'Duration'
                                    : 'Quality'}
                                </span>
                                <Picker
                                  value={
                                    view === 'video' || view === 'cinema'
                                      ? duration
                                      : 'Standard'
                                  }
                                  onChange={setDuration}
                                  values={
                                    view === 'video' || view === 'cinema'
                                      ? ['5s', '10s']
                                      : ['Standard']
                                  }
                                />
                              </div>
                            </div>
                            {(view === 'video' || view === 'cinema') && (
                              <>
                                <span className="field-label">
                                  Camera Motion
                                </span>
                                <Picker
                                  value={cameraMotion}
                                  onChange={setCameraMotion}
                                  values={motions}
                                />
                              </>
                            )}
                          </>
                        )}
                        <div className="generation-actions">
                          {view === 'audio' ? (
                            <button
                              className="button primary full"
                              onClick={() => {
                                if (!prompt.trim()) {
                                  setNotice(
                                    'Please enter a voiceover script first.',
                                  );
                                  return;
                                }
                                if (!('speechSynthesis' in window)) {
                                  setNotice(
                                    'Speech synthesis is not supported on this browser.',
                                  );
                                  return;
                                }
                                speechSynthesis.cancel();
                                const speech = new SpeechSynthesisUtterance(
                                  prompt,
                                );
                                speech.lang = 'en-US';
                                speechSynthesis.speak(speech);
                                setNotice('Auditioning with device voice.');
                              }}
                            >
                              <Volume2 size={17} />
                              Audition on Device
                            </button>
                          ) : (
                            <button
                              className="button primary full"
                              disabled={busy}
                              onClick={generate}
                            >
                              {busy ? (
                                <LoaderCircle className="spin" size={17} />
                              ) : (
                                <Sparkles size={17} />
                              )}{' '}
                              {busy
                                ? 'Generating…'
                                : view === 'video' || view === 'cinema'
                                  ? 'Generate Video'
                                  : 'Generate Image'}
                              <ArrowRight size={17} />
                            </button>
                          )}
                          <button
                            className="button secondary full"
                            onClick={saveDraft}
                          >
                            <Bookmark size={15} />
                            Save Draft
                          </button>
                          {view === 'audio' && (
                            <button
                              className="text-button"
                              onClick={() => window.speechSynthesis?.cancel()}
                            >
                              Stop playback
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </section>
                  <section className="preview-panel">
                    <div className="preview-bar">
                      <span>
                        <LayoutGrid size={16} />
                        {view === 'cinema'
                          ? 'Storyboard'
                          : view === 'canvas'
                            ? 'Idea Canvas'
                            : 'Preview Space'}
                      </span>
                      <span className="subtle-label">
                        {ratio} <span>·</span>{' '}
                        {view === 'edit' ? 'LOCAL EDITOR' : 'CREATIVE STUDIO'}
                      </span>
                    </div>
                    {view === 'cinema' || view === 'canvas' ? (
                      <div
                        className={
                          view === 'canvas'
                            ? 'storyboard canvas-board'
                            : 'storyboard'
                        }
                      >
                        <div className="board-title">
                          <h2>
                            {view === 'cinema'
                              ? 'Your Visual Story'
                              : 'Idea Board'}
                          </h2>
                          <button
                            className="button secondary"
                            onClick={() =>
                              setScenes([
                                ...scenes,
                                { id: crypto.randomUUID(), text: '' },
                              ])
                            }
                          >
                            <Plus size={16} />
                            Add {view === 'cinema' ? 'Scene' : 'Card'}
                          </button>
                        </div>
                        {scenes.map((s, i) => (
                          <article className="scene" key={s.id}>
                            <div className="scene-number">
                              {String(i + 1).padStart(2, '0')}
                            </div>
                            <textarea
                              aria-label={'Scene content ' + (i + 1)}
                              placeholder="Describe scene, camera angle, action, lighting..."
                              value={s.text}
                              onChange={(e) =>
                                setScenes(
                                  scenes.map((x) =>
                                    x.id === s.id
                                      ? { ...x, text: e.target.value }
                                      : x,
                                  ),
                                )
                              }
                            />
                            <div>
                              <button
                                className="icon-button"
                                aria-label="Use scene as prompt"
                                onClick={() => {
                                  setPrompt(s.text);
                                  setNotice('Scene transferred to prompt.');
                                }}
                              >
                                <ArrowLeft size={15} />
                              </button>
                              <button
                                className="icon-button"
                                aria-label="Delete scene"
                                onClick={() =>
                                  setScenes(scenes.filter((x) => x.id !== s.id))
                                }
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </article>
                        ))}
                        <p className="field-hint">
                          Export a brief to preserve your storyboard and
                          settings.
                        </p>
                      </div>
                    ) : result ? (
                      <div className="result-preview">
                        {result.type === 'video' ? (
                          <video src={result.url} controls>
                            <track kind="captions" />
                          </video>
                        ) : (
                          <NextImage
                            src={result.url}
                            alt="AI generated creation"
                            unoptimized
                            width={1200}
                            height={800}
                          />
                        )}
                        <a
                          className="button secondary"
                          href={result.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open Artwork <ArrowUpRight size={16} />
                        </a>
                      </div>
                    ) : upload ? (
                      <div className="uploaded-preview">
                        <NextImage
                          src={upload}
                          alt="Uploaded image preview"
                          unoptimized
                          width={1200}
                          height={800}
                          style={{
                            filter: `brightness(${brightness}%) saturate(${saturation}%)`,
                          }}
                        />
                      </div>
                    ) : (
                      <div className="preview-empty">
                        <div className="preview-symbol">
                          <Aperture size={48} />
                        </div>
                        <h2>
                          {view === 'audio'
                            ? 'Every story deserves a distinct voice.'
                            : 'Your next creation starts here.'}
                        </h2>
                        <p>
                          {view === 'edit'
                            ? 'Upload an image to adjust grades and export full-resolution PNG.'
                            : view === 'audio'
                              ? 'Enter a script to audition synthesized speech directly on your device.'
                              : 'Type a prompt or upload a reference image to begin.'}
                        </p>
                        <div className="preview-suggestions">
                          {works.slice(0, 3).map((w) => (
                            <button
                              key={w.id}
                              onClick={() => setPrompt(w.prompt)}
                            >
                              <NextImage
                                width={260}
                                height={200}
                                src={w.image}
                                alt={w.title}
                                sizes="140px"
                              />
                              <span>
                                {w.category}
                                <ArrowUpRight size={13} />
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="preview-footer">
                      <span>
                        <span className="status-dot" />
                        {busy ? 'Generating asset…' : 'Ready for your concepts'}
                      </span>
                      <span>APEXA STUDIO</span>
                    </div>
                  </section>
                </div>
              </>
            )}
            <footer className="page-footer">
              <span className="footer-brand">
                <Aperture size={14} />
                apexa.
              </span>
              <span>Made for your imagination.</span>
              <button onClick={() => setHelp(true)}>
                About & Image Provenance <ArrowUpRight size={12} />
              </button>
            </footer>
          </main>
        </div>
        <input
          ref={fileRef}
          className="sr-only"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={onUpload}
        />
        {(detail || help) && (
          <StudioDialogs
            detail={detail}
            setDetail={setDetail}
            help={help}
            setHelp={setHelp}
            saved={saved}
            remix={remix}
            toggleSave={toggleSave}
          />
        )}
        <AnimatePresence>
          {notice && (
            <motion.output
              key="app-notice-toast"
              className="toast"
              initial={{ opacity: 0, y: 24, x: '-50%', scale: 0.94 }}
              animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
              exit={{
                opacity: 0,
                y: 16,
                x: '-50%',
                scale: 0.94,
                transition: { duration: 0.18 },
              }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            >
              <Sparkles size={17} />
              <span>{notice}</span>
              <button
                onClick={() => setNotice('')}
                aria-label="Dismiss notification"
              >
                <X size={15} />
              </button>
            </motion.output>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
}
