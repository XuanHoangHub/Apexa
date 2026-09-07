'use client';
import { useEffect, useRef, useState } from 'react';
import {
  Aperture,
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  Bookmark,
  Box,
  Check,
  ChevronDown,
  Clapperboard,
  Compass,
  Film,
  FolderOpen,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  LoaderCircle,
  MoreHorizontal,
  MousePointer2,
  Plus,
  Search,
  Sparkles,
  Upload,
  WandSparkles,
  X,
  Zap,
  CircleHelp,
  Bell,
  Scissors,
  Trash2,
  Volume2,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

type View =
  | 'explore'
  | 'image'
  | 'video'
  | 'audio'
  | 'edit'
  | 'cinema'
  | 'marketing'
  | 'canvas'
  | 'presets'
  | 'library'
  | 'saved';
type Work = {
  id: string;
  title: string;
  image: string;
  category: string;
  prompt: string;
  author: string;
  source?: string;
};
type Draft = {
  id: string;
  title: string;
  prompt: string;
  mode: View;
  model: string;
  ratio: string;
  created: string;
  scenes?: { id: string; text: string }[];
  motion?: string;
  duration?: string;
  brand?: string;
};
const hero = '/frame-chrome.png';
const works: Work[] = [
  {
    id: 'red',
    title: 'After hours',
    image:
      'https://images.unsplash.com/photo-1742163512400-7af30b2d17cc?auto=format&fit=crop&w=900&q=85',
    category: 'Chân dung',
    author: 'Jay Soundo · Unsplash',
    source: 'https://unsplash.com/photos/0KS30qLnM_8',
    prompt:
      'An editorial portrait illuminated by deep red light, rich shadows, subtle grain, cinematic close-up, fashion photography.',
  },
  {
    id: 'dune',
    title: 'The quiet between',
    image:
      'https://images.unsplash.com/photo-1564107628966-daff03746bee?auto=format&fit=crop&w=900&q=85',
    category: 'Thiên nhiên',
    author: 'Martin Sanchez · Unsplash',
    source: 'https://unsplash.com/photos/rFh890jKgcs',
    prompt:
      'Aerial view of sculptural desert dunes, soft evening light, sweeping curves, warm terracotta tones, cinematic wide shot.',
  },
  {
    id: 'building',
    title: 'Future, by design',
    image:
      'https://images.unsplash.com/photo-1515986503437-c617811ba008?auto=format&fit=crop&w=900&q=85',
    category: 'Kiến trúc',
    author: 'Road Trip with Raj · Unsplash',
    source: 'https://unsplash.com/photos/xrCNPGLk1wk',
    prompt:
      'Sculptural futuristic architecture at twilight, sweeping white curves, deep blue sky, minimalist composition, architectural photography.',
  },
  {
    id: 'flower',
    title: 'A different kind of bloom',
    image:
      'https://images.unsplash.com/photo-1746126087099-e3e743d42f70?auto=format&fit=crop&w=900&q=85',
    category: 'Thiên nhiên',
    author: 'Dmytro Koplyk · Unsplash',
    source: 'https://unsplash.com/photos/mA2BYYaFVRU',
    prompt:
      'A vivid purple flower against pure black, macro photography, delicate translucent petals, dramatic studio lighting.',
  },
  {
    id: 'chrome',
    title: 'Beyond the ordinary',
    image: hero,
    category: 'Trừu tượng',
    author: 'FRAME Originals',
    prompt:
      'A liquid chrome sculpture suspended above volcanic sand at sunset, surreal cinematic lighting, dramatic reflections, 35mm film.',
  },
  {
    id: 'car',
    title: 'Chasing the light',
    image:
      'https://images.unsplash.com/photo-1683916136420-f0981b6dd5dd?auto=format&fit=crop&w=900&q=85',
    category: 'Sản phẩm',
    author: 'noir. · Unsplash',
    source: 'https://unsplash.com/photos/3vz86OsQcKY',
    prompt:
      'A red sports car driving through a tunnel, dramatic light trails, cinematic motion blur, low camera angle, high contrast.',
  },
];
const modes = [
  {
    id: 'image' as View,
    name: 'Tạo hình ảnh',
    sub: 'Biến ý tưởng thành hình',
    icon: ImageIcon,
  },
  {
    id: 'video' as View,
    name: 'Tạo video',
    sub: 'Khung hình thành chuyển động',
    icon: Film,
  },
  {
    id: 'cinema' as View,
    name: 'Cinema Studio',
    sub: 'Kể câu chuyện của bạn',
    icon: Clapperboard,
  },
  {
    id: 'edit' as View,
    name: 'Chỉnh sửa ảnh',
    sub: 'Hoàn thiện từng chi tiết',
    icon: WandSparkles,
  },
  {
    id: 'audio' as View,
    name: 'Âm thanh',
    sub: 'Thêm tiếng nói cho ý tưởng',
    icon: AudioLines,
  },
];
const labels: Record<View, string> = {
  explore: 'Khám phá',
  image: 'Tạo hình ảnh',
  video: 'Tạo video',
  audio: 'Âm thanh',
  edit: 'Chỉnh sửa',
  cinema: 'Cinema Studio',
  marketing: 'Brand Studio',
  canvas: 'Canvas',
  presets: 'Motion presets',
  library: 'Thư viện của tôi',
  saved: 'Đã lưu',
};
const motions = [
  'Dolly in',
  'Orbit 360°',
  'Crane up',
  'Handheld',
  'FPV fly-through',
  'Slow zoom',
];
const categories = [
  'Tất cả',
  'Điện ảnh',
  'Chân dung',
  'Thiên nhiên',
  'Trừu tượng',
  'Kiến trúc',
  'Sản phẩm',
];
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
export default function CreativeApp() {
  return (
    <SidebarProvider
      style={{ '--sidebar-width': '218px' } as React.CSSProperties}
    >
      <Studio />
    </SidebarProvider>
  );
}
function Studio() {
  const [brand, setBrand] = useState('');
  const [view, setView] = useState<View>('explore');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Tất cả');
  const [detail, setDetail] = useState<Work | null>(null);
  const [saved, setSaved] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('FRAME Image');
  const [ratio, setRatio] = useState('16:9');
  const [duration, setDuration] = useState('5 giây');
  const [motion, setMotion] = useState('Dolly in');
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
      text: 'Toàn cảnh mở đầu — ánh sáng bình minh trên những đụn cát.',
    },
  ]);
  const fileRef = useRef<HTMLInputElement>(null);
  const { setOpenMobile } = useSidebar();
  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem('frame-local-v1') || '{}');
      setSaved(
        Array.isArray(p.saved)
          ? p.saved.filter((x: unknown) => typeof x === 'string')
          : [],
      );
      setDrafts(
        Array.isArray(p.drafts)
          ? p.drafts.filter(
              (x: Draft) =>
                x && typeof x.prompt === 'string' && x.mode in labels,
            )
          : [],
      );
    } catch {}
    const v = location.hash.slice(1) as View;
    if (v in labels) {
      setView(v);
      setModel(v === 'video' || v === 'cinema' ? 'FRAME Video' : 'FRAME Image');
    }
    const handler = () => {
      const v = location.hash.slice(1) as View;
      setView(v in labels ? v : 'explore');
      setModel(v === 'video' || v === 'cinema' ? 'FRAME Video' : 'FRAME Image');
      setResult(null);
    };
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(''), 6500);
    return () => clearTimeout(t);
  }, [notice]);
  function navigate(v: View) {
    setView(v);
    location.hash = v;
    setOpenMobile(false);
    setResult(null);
    setQuery('');
    setModel(v === 'video' || v === 'cinema' ? 'FRAME Video' : 'FRAME Image');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function persist(nextSaved: string[], nextDrafts: Draft[]) {
    try {
      localStorage.setItem(
        'frame-local-v1',
        JSON.stringify({ saved: nextSaved, drafts: nextDrafts }),
      );
      return true;
    } catch {
      setNotice('Bộ nhớ trình duyệt đã đầy. Hãy xuất bản nháp để giữ dữ liệu.');
      return false;
    }
  }
  function toggleSave(id: string) {
    const next = saved.includes(id)
      ? saved.filter((x) => x !== id)
      : [...saved, id];
    if (persist(next, drafts)) setSaved(next);
  }
  function saveDraft() {
    if (!prompt.trim()) {
      setNotice('Hãy viết ý tưởng trước khi lưu.');
      return;
    }
    const d: Draft = {
      id: crypto.randomUUID(),
      title: prompt.slice(0, 54),
      scenes,
      motion,
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
      setNotice('Đã lưu bản nháp trên thiết bị này.');
    }
  }
  function download(data: Blob, name: string) {
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function exportBrief() {
    download(
      new Blob(
        [
          JSON.stringify(
            {
              app: 'FRAME',
              prompt,
              model,
              ratio,
              duration,
              motion,
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
    setNotice('Đã xuất creative brief.');
  }
  function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (
      !['image/png', 'image/jpeg', 'image/webp'].includes(file.type) ||
      file.size > 10 * 1024 * 1024
    ) {
      setNotice('Chọn ảnh JPG, PNG hoặc WebP dưới 10 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setUpload(reader.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }
  async function generate() {
    if (!prompt.trim()) {
      setNotice('Mô tả điều bạn muốn tạo trước nhé.');
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
          motion,
          image: upload,
        }),
      });
      const data = (await res.json()) as {
        url: string;
        type: string;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || 'Không thể tạo lúc này.');
      setResult(data);
      setNotice('Tác phẩm đã sẵn sàng.');
    } catch (e) {
      setNotice(
        e instanceof Error ? e.message : 'Kết nối thất bại. Vui lòng thử lại.',
      );
    } finally {
      setBusy(false);
    }
  }
  function remix(w: Work) {
    setPrompt(w.prompt);
    setDetail(null);
    navigate('image');
  }
  function exportImage() {
    if (!upload) {
      setNotice('Tải ảnh của bạn lên để chỉnh sửa và xuất.');
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
  }
  const visible = works.filter(
    (w) =>
      (category === 'Tất cả' ||
        w.category === category ||
        (category === 'Điện ảnh' && ['chrome', 'car'].includes(w.id))) &&
      `${w.title} ${w.category} ${w.prompt}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (view !== 'saved' || saved.includes(w.id)),
  );
  const navItem = (id: View, Icon: typeof Compass, badge?: string) => (
    <SidebarMenuItem key={id}>
      <SidebarMenuButton
        className="nav-item"
        isActive={view === id}
        onClick={() => navigate(id)}
      >
        <Icon />
        <span>{labels[id]}</span>
        {badge && <em className="nav-badge">{badge}</em>}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
  return (
    <>
      <Sidebar className="frame-sidebar">
        <SidebarHeader>
          <button
            className="brand"
            onClick={() => navigate('explore')}
            aria-label="FRAME trang chủ"
          >
            <Aperture />
            <span>
              frame<span className="brand-dot">.</span>
            </span>
          </button>
          <button className="workspace" onClick={() => setHelp(true)}>
            <span className="workspace-icon">H</span>
            <span>
              Personal workspace<small>Không gian của bạn</small>
            </span>
            <ChevronDown size={14} />
          </button>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>{navItem('explore', Compass)}</SidebarMenu>
          <div className="nav-label">SÁNG TẠO</div>
          <SidebarMenu>
            {navItem('image', ImageIcon)}
            {navItem('video', Film)}
            {navItem('audio', AudioLines)}
            {navItem('edit', Scissors)}
          </SidebarMenu>
          <div className="nav-label">STUDIO</div>
          <SidebarMenu>
            {navItem('cinema', Clapperboard, 'MỚI')}
            {navItem('marketing', Box)}
            {navItem('canvas', Layers)}
            {navItem('presets', MousePointer2)}
          </SidebarMenu>
          <div className="nav-label">KHÔNG GIAN CỦA BẠN</div>
          <SidebarMenu>
            {navItem('library', FolderOpen)}
            {navItem('saved', Bookmark, String(saved.length))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="plan-card">
            <div>
              <Zap size={15} />
              <b>Ý tưởng không giới hạn</b>
            </div>
            <p>Một không gian. Mọi công cụ.</p>
            <button onClick={() => setHelp(true)}>
              Khám phá FRAME <ArrowUpRight size={14} />
            </button>
          </div>
          <button className="help-button" onClick={() => setHelp(true)}>
            <CircleHelp size={17} />
            Trợ giúp & thông tin
            <ArrowUpRight size={14} />
          </button>
          <div className="profile">
            <span className="avatar">H</span>
            <div>
              Hoàng<small>Personal account</small>
            </div>
            <button
              className="icon-button"
              aria-label="Cài đặt tài khoản"
              onClick={() => setHelp(true)}
            >
              <MoreHorizontal />
            </button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <div className="app-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <SidebarTrigger className="mobile-trigger" />
            <span>Workspace</span>
            <span className="slash">/</span>
            <b>{labels[view]}</b>
          </div>
          <div className="header-actions">
            <button className="demo-pill" onClick={() => setHelp(true)}>
              <span />
              Bản trải nghiệm
            </button>
            <button
              className="icon-button notification"
              aria-label="Thông báo"
              onClick={() =>
                setNotice('Bạn đã cập nhật tất cả. Chào mừng đến với FRAME!')
              }
            >
              <Bell size={18} />
            </button>
            <span className="header-divider" />
            <button
              className="avatar small"
              aria-label="Tài khoản"
              onClick={() => setHelp(true)}
            >
              H
            </button>
          </div>
        </header>
        <main className="main-content">
          {view === 'explore' || view === 'saved' || view === 'presets' ? (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">
                    YOUR NEXT GREAT IDEA STARTS HERE
                  </div>
                  <h1>
                    {view === 'saved'
                      ? 'Bộ sưu tập cảm hứng'
                      : view === 'presets'
                        ? 'Một chuyển động. Vạn cảm xúc.'
                        : 'Không giới hạn trí tưởng tượng.'}
                  </h1>
                  <p>
                    {view === 'saved'
                      ? 'Những ý tưởng bạn muốn quay lại.'
                      : view === 'presets'
                        ? 'Chọn góc máy, định hình câu chuyện của bạn.'
                        : 'Tạo những điều chưa từng có. Theo cách của bạn.'}
                  </p>
                </div>
                <button
                  className="button primary"
                  onClick={() => navigate('image')}
                >
                  <Plus size={17} />
                  Tạo mới
                </button>
              </div>
              {view === 'explore' && (
                <>
                  <section className="hero-card">
                    <img
                      src={hero}
                      alt="Tác phẩm chrome siêu thực trên cát núi lửa lúc hoàng hôn"
                    />
                    <div className="hero-shade" />
                    <div className="hero-copy">
                      <span className="hero-tag">
                        <span />
                        FRAME ORIGINALS <span className="tag-line" /> VOLUME 01
                      </span>
                      <h2>
                        Make the
                        <br />
                        unimagined.
                      </h2>
                      <p>
                        Từ một tia ý tưởng.
                        <br />
                        Đến những khung hình không tưởng.
                      </p>
                      <button
                        className="button light"
                        onClick={() => remix(works[4])}
                      >
                        Bắt đầu sáng tạo <ArrowUpRight size={17} />
                      </button>
                    </div>
                    <div className="hero-bottom">
                      <span>
                        <Sparkles size={14} /> IMAGINED WITH FRAME
                      </span>
                      <button
                        aria-label="Xem tác phẩm Beyond the ordinary"
                        onClick={() => setDetail(works[4])}
                      >
                        <ArrowUpRight size={21} />
                      </button>
                    </div>
                    <span className="hero-counter">
                      01 <span>/ 01</span>
                    </span>
                  </section>
                  <section
                    className="quick-tools"
                    aria-label="Công cụ sáng tạo"
                  >
                    {modes.map((m) => (
                      <button key={m.id} onClick={() => navigate(m.id)}>
                        <span className={'tool-icon ' + m.id}>
                          <m.icon size={21} />
                        </span>
                        <span>
                          <b>{m.name}</b>
                          <small>{m.sub}</small>
                        </span>
                        <ArrowUpRight className="tool-arrow" size={16} />
                      </button>
                    ))}
                  </section>
                </>
              )}
              {view === 'presets' ? (
                <div className="motion-grid">
                  {motions.map((m, i) => (
                    <button
                      className="motion-card"
                      key={m}
                      onClick={() => {
                        setMotion(m);
                        navigate('video');
                      }}
                    >
                      <img
                        src={works[i % works.length].image}
                        alt="Ảnh tham chiếu cho chuyển động camera"
                      />
                      <span className="motion-number">0{i + 1}</span>
                      <div>
                        <MousePointer2 />
                        <h3>{m}</h3>
                        <span>
                          Áp dụng chuyển động <ArrowUpRight size={15} />
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <>
                  <div className="section-heading">
                    <div>
                      <span className="section-mark" />
                      <h2>
                        {view === 'saved'
                          ? 'Đã lưu cho lần sáng tạo tiếp theo'
                          : 'Dành cho trí tưởng tượng của bạn'}
                      </h2>
                      <span className="subtle-label">CURATED INSPIRATION</span>
                    </div>
                    <button
                      className="text-button"
                      onClick={() => navigate('presets')}
                    >
                      Khám phá presets <ArrowRight size={16} />
                    </button>
                  </div>
                  <div className="discovery-controls">
                    <Tabs
                      value={category}
                      onValueChange={(v) => setCategory(String(v))}
                    >
                      <TabsList className="category-tabs" variant="line">
                        {categories.map((c) => (
                          <TabsTrigger key={c} value={c}>
                            {c}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </Tabs>
                    <label className="search">
                      <Search size={16} />
                      <input
                        aria-label="Tìm cảm hứng"
                        placeholder="Tìm cảm hứng..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                      {query && (
                        <button
                          aria-label="Xóa tìm kiếm"
                          onClick={() => setQuery('')}
                        >
                          <X size={14} />
                        </button>
                      )}
                    </label>
                  </div>
                  <div className="gallery">
                    {visible.map((w) => (
                      <article className={'work-card work-' + w.id} key={w.id}>
                        <button
                          className="work-image"
                          onClick={() => setDetail(w)}
                        >
                          <img src={w.image} alt={w.title} loading="lazy" />
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
                            Khám phá ý tưởng
                          </span>
                        </button>
                        <button
                          className={
                            'save-work ' +
                            (saved.includes(w.id) ? 'is-saved' : '')
                          }
                          onClick={() => toggleSave(w.id)}
                          aria-label={
                            saved.includes(w.id)
                              ? 'Bỏ lưu ' + w.title
                              : 'Lưu ' + w.title
                          }
                        >
                          <Bookmark
                            size={16}
                            fill={
                              saved.includes(w.id) ? 'currentColor' : 'none'
                            }
                          />
                        </button>
                        <div className="work-info">
                          <div>
                            <h3>{w.title}</h3>
                            <p>{w.author}</p>
                          </div>
                          <ArrowUpRight size={17} />
                        </div>
                      </article>
                    ))}
                  </div>
                  {!visible.length && (
                    <div className="empty-state">
                      <Bookmark />
                      <h3>
                        {view === 'saved'
                          ? 'Chưa có ý tưởng nào được lưu'
                          : 'Chưa tìm thấy cảm hứng phù hợp'}
                      </h3>
                      <p>
                        {view === 'saved'
                          ? 'Chạm vào biểu tượng lưu trên tác phẩm bạn thích.'
                          : 'Thử từ khóa khác hoặc chọn Tất cả.'}
                      </p>
                      <button
                        className="button secondary"
                        onClick={() => {
                          setQuery('');
                          setCategory('Tất cả');
                          if (view === 'saved') navigate('explore');
                        }}
                      >
                        Khám phá ý tưởng
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
                  <div className="eyebrow">YOUR CREATIVE SPACE</div>
                  <h1>Thư viện của tôi</h1>
                  <p>Bản nháp được lưu riêng trên trình duyệt này.</p>
                </div>
                <button
                  className="button primary"
                  onClick={() => navigate('image')}
                >
                  <Plus size={17} />
                  Dự án mới
                </button>
              </div>
              <div className="draft-grid">
                {drafts.map((d) => (
                  <article className="draft-card" key={d.id}>
                    <div className="draft-icon">
                      <Layers />
                    </div>
                    <small>
                      {labels[d.mode]} ·{' '}
                      {new Date(d.created).toLocaleDateString('vi-VN')}
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
                          setMotion(d.motion || 'Dolly in');
                          setDuration(d.duration || '5 giây');
                          setBrand(d.brand || '');
                        }}
                      >
                        Tiếp tục <ArrowUpRight size={15} />
                      </button>
                      <button
                        className="icon-button"
                        aria-label="Xóa bản nháp"
                        onClick={() => {
                          const next = drafts.filter((x) => x.id !== d.id);
                          if (persist(saved, next)) {
                            setDrafts(next);
                            setNotice('Đã xóa bản nháp.');
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
                  <h2>Mọi ý tưởng đều bắt đầu ở đâu đó.</h2>
                  <p>Tạo và lưu bản nháp đầu tiên của bạn.</p>
                  <button
                    className="button primary"
                    onClick={() => navigate('image')}
                  >
                    Bắt đầu sáng tạo <Plus size={16} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="page-heading studio-heading">
                <div>
                  <div className="eyebrow">THE CREATIVE WORKSPACE</div>
                  <h1>
                    {labels[view]}
                    <span className="heading-dot">.</span>
                  </h1>
                  <p>
                    {view === 'cinema'
                      ? 'Từng cảnh một. Câu chuyện thuộc về bạn.'
                      : view === 'edit'
                        ? 'Một chút tinh chỉnh. Một góc nhìn khác.'
                        : view === 'audio'
                          ? 'Cho những ý tưởng của bạn một tiếng nói.'
                          : 'Một ý tưởng nhỏ. Vô vàn khả năng.'}
                  </p>
                </div>
                <button className="button secondary" onClick={exportBrief}>
                  <ArrowDownToLine size={16} />
                  Xuất brief
                </button>
              </div>
              <div className="studio-layout">
                <section className="control-panel">
                  <div className="panel-title">
                    <Sparkles size={17} />
                    <h2>
                      {view === 'edit'
                        ? 'Điều chỉnh hình ảnh'
                        : 'Thiết lập sáng tạo'}
                    </h2>
                  </div>
                  {view !== 'audio' && (
                    <>
                      <label className="field-label">
                        Ảnh tham chiếu <span>Tùy chọn</span>
                      </label>
                      <button
                        className={
                          'upload-zone ' + (upload ? 'has-upload' : '')
                        }
                        onClick={() => fileRef.current?.click()}
                      >
                        {upload ? (
                          <img src={upload} alt="Ảnh tham chiếu đã tải lên" />
                        ) : (
                          <>
                            <Upload size={23} />
                            <span>Tải ảnh của bạn lên</span>
                            <small>JPG, PNG, WebP · Tối đa 10 MB</small>
                          </>
                        )}
                      </button>
                      {upload && (
                        <button
                          className="text-button remove-upload"
                          onClick={() => setUpload(null)}
                        >
                          <X size={13} />
                          Gỡ ảnh
                        </button>
                      )}
                    </>
                  )}
                  {view === 'marketing' && (
                    <div className="brand-brief">
                      <label className="field-label" htmlFor="brand">
                        Thương hiệu / sản phẩm
                      </label>
                      <input
                        id="brand"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        placeholder="Ví dụ: AURA — nước hoa thiên nhiên"
                        maxLength={160}
                      />
                      <label className="field-label">Bắt đầu chiến dịch</label>
                      <div className="campaign-presets">
                        {['Ra mắt sản phẩm', 'Social media', 'Lifestyle'].map(
                          (style, i) => (
                            <button
                              key={style}
                              onClick={() => {
                                if (!brand.trim()) {
                                  setNotice(
                                    'Nhập thương hiệu hoặc sản phẩm trước.',
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
                          ),
                        )}
                      </div>
                    </div>
                  )}
                  {view === 'edit' ? (
                    <>
                      <div className="slider-label">
                        <label>Độ sáng</label>
                        <span>{brightness}%</span>
                      </div>
                      <Slider
                        value={[brightness]}
                        onValueChange={(v) =>
                          setBrightness(Array.isArray(v) ? v[0] : v)
                        }
                        min={20}
                        max={180}
                      />
                      <div className="slider-label">
                        <label>Độ bão hòa</label>
                        <span>{saturation}%</span>
                      </div>
                      <Slider
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
                        Khôi phục gốc
                      </button>
                      <button
                        className="button primary full"
                        onClick={exportImage}
                      >
                        <ArrowDownToLine size={16} />
                        Xuất ảnh PNG
                      </button>
                      <p className="field-hint">
                        Chỉnh màu ngay trên thiết bị. Ảnh không được gửi đi.
                      </p>
                    </>
                  ) : (
                    <>
                      <label className="field-label" htmlFor="prompt">
                        {view === 'audio'
                          ? 'Nội dung lời đọc'
                          : 'Ý tưởng của bạn'}
                        <button
                          onClick={() =>
                            setPrompt(
                              works[Math.floor(Math.random() * works.length)]
                                .prompt,
                            )
                          }
                          aria-label="Gợi ý prompt"
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
                            ? 'Nhập nội dung bạn muốn nghe...'
                            : 'Mô tả chủ thể, bối cảnh, ánh sáng và cảm xúc bạn muốn truyền tải...'
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
                              setNotice('Đã thêm gợi ý ánh sáng và bố cục.');
                            } else
                              setNotice('Viết ý tưởng trước khi thêm gợi ý.');
                          }}
                        >
                          <Sparkles size={12} />
                          Thêm gợi ý
                        </button>
                      </div>
                      {view !== 'audio' && (
                        <>
                          <label className="field-label">Mô hình</label>
                          <Picker
                            value={model}
                            onChange={setModel}
                            values={
                              view === 'video' || view === 'cinema'
                                ? ['FRAME Video']
                                : ['FRAME Image']
                            }
                          />
                          <p className="field-hint">
                            Cần kết nối nhà cung cấp AI để tạo nội dung.
                          </p>
                          <div className="field-row">
                            <div>
                              <label className="field-label">
                                Tỷ lệ khung hình
                              </label>
                              <Picker
                                value={ratio}
                                onChange={setRatio}
                                values={['16:9', '9:16', '1:1', '4:3', '3:2']}
                              />
                            </div>
                            <div>
                              <label className="field-label">
                                {view === 'video' || view === 'cinema'
                                  ? 'Thời lượng'
                                  : 'Chất lượng'}
                              </label>
                              <Picker
                                value={
                                  view === 'video' || view === 'cinema'
                                    ? duration
                                    : 'Tiêu chuẩn'
                                }
                                onChange={setDuration}
                                values={
                                  view === 'video' || view === 'cinema'
                                    ? ['5 giây', '10 giây']
                                    : ['Tiêu chuẩn']
                                }
                              />
                            </div>
                          </div>
                          {(view === 'video' || view === 'cinema') && (
                            <>
                              <label className="field-label">
                                Chuyển động camera
                              </label>
                              <Picker
                                value={motion}
                                onChange={setMotion}
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
                                setNotice('Nhập nội dung lời đọc trước.');
                                return;
                              }
                              if (!('speechSynthesis' in window)) {
                                setNotice(
                                  'Trình duyệt này không hỗ trợ đọc văn bản.',
                                );
                                return;
                              }
                              speechSynthesis.cancel();
                              const speech = new SpeechSynthesisUtterance(
                                prompt,
                              );
                              speech.lang = 'vi-VN';
                              speechSynthesis.speak(speech);
                              setNotice(
                                'Đang đọc bằng giọng có sẵn của thiết bị.',
                              );
                            }}
                          >
                            <Volume2 size={17} />
                            Nghe thử trên thiết bị
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
                              ? 'Đang xử lý…'
                              : view === 'video' || view === 'cinema'
                                ? 'Tạo video'
                                : 'Tạo hình ảnh'}
                            <ArrowRight size={17} />
                          </button>
                        )}
                        <button
                          className="button secondary full"
                          onClick={saveDraft}
                        >
                          <Bookmark size={15} />
                          Lưu bản nháp
                        </button>
                        {view === 'audio' && (
                          <button
                            className="text-button"
                            onClick={() => window.speechSynthesis?.cancel()}
                          >
                            Dừng nghe
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
                          ? 'Bảng ý tưởng'
                          : 'Không gian xem trước'}
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
                            ? 'Câu chuyện của bạn'
                            : 'Ghi lại mọi ý tưởng'}
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
                          Thêm {view === 'cinema' ? 'cảnh' : 'thẻ'}
                        </button>
                      </div>
                      {scenes.map((s, i) => (
                        <article className="scene" key={s.id}>
                          <div className="scene-number">
                            {String(i + 1).padStart(2, '0')}
                          </div>
                          <textarea
                            aria-label={'Nội dung cảnh ' + (i + 1)}
                            placeholder="Mô tả cảnh, góc máy, hành động..."
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
                              aria-label="Dùng cảnh này làm prompt"
                              onClick={() => {
                                setPrompt(s.text);
                                setNotice('Đã đưa cảnh vào prompt.');
                              }}
                            >
                              <ArrowLeft size={15} />
                            </button>
                            <button
                              className="icon-button"
                              aria-label="Xóa cảnh"
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
                        Xuất brief để giữ storyboard và các thiết lập của bạn.
                      </p>
                    </div>
                  ) : result ? (
                    <div className="result-preview">
                      {result.type === 'video' ? (
                        <video src={result.url} controls />
                      ) : (
                        <img
                          src={result.url}
                          alt="Kết quả AI tạo từ prompt của bạn"
                        />
                      )}
                      <a
                        className="button secondary"
                        href={result.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Mở tác phẩm <ArrowUpRight size={16} />
                      </a>
                    </div>
                  ) : upload ? (
                    <div className="uploaded-preview">
                      <img
                        src={upload}
                        alt="Bản xem trước ảnh của bạn"
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
                          ? 'Mỗi câu chuyện đều có một giọng nói.'
                          : 'Điều tuyệt vời tiếp theo bắt đầu ở đây.'}
                      </h2>
                      <p>
                        {view === 'edit'
                          ? 'Tải ảnh lên để điều chỉnh và xuất ảnh.'
                          : view === 'audio'
                            ? 'Nhập lời thoại và nghe thử bằng giọng đọc trên thiết bị.'
                            : 'Viết ý tưởng hoặc bắt đầu với một hình ảnh tham chiếu.'}
                      </p>
                      <div className="preview-suggestions">
                        {works.slice(0, 3).map((w) => (
                          <button
                            key={w.id}
                            onClick={() => setPrompt(w.prompt)}
                          >
                            <img src={w.image} alt={w.title} />
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
                      {busy
                        ? 'Đang chờ kết quả'
                        : 'Sẵn sàng cho ý tưởng của bạn'}
                    </span>
                    <span>FRAME STUDIO</span>
                  </div>
                </section>
              </div>
            </>
          )}
          <footer className="page-footer">
            <span className="footer-brand">
              <Aperture size={14} />
              frame.
            </span>
            <span>Made for your imagination.</span>
            <button onClick={() => setHelp(true)}>
              Thông tin & nguồn hình ảnh <ArrowUpRight size={12} />
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
      <Dialog open={!!detail} onOpenChange={(v) => !v && setDetail(null)}>
        <DialogContent className="detail-dialog">
          {detail && (
            <>
              <img
                className="detail-image"
                src={detail.image}
                alt={detail.title}
              />
              <div className="detail-body">
                <span className="eyebrow">{detail.category}</span>
                <DialogTitle>{detail.title}</DialogTitle>
                <DialogDescription>
                  {detail.author} ·{' '}
                  {detail.source
                    ? 'Ảnh tham khảo sáng tạo'
                    : 'Tác phẩm AI nguyên bản của FRAME'}
                </DialogDescription>
                <label className="field-label">Prompt gợi ý</label>
                <p className="detail-prompt">{detail.prompt}</p>
                <div className="detail-actions">
                  <button
                    className="button primary"
                    onClick={() => remix(detail)}
                  >
                    <Sparkles size={16} />
                    Dùng prompt này
                  </button>
                  <button
                    className="button secondary"
                    onClick={() => toggleSave(detail.id)}
                  >
                    <Bookmark size={16} />
                    {saved.includes(detail.id) ? 'Đã lưu' : 'Lưu ý tưởng'}
                  </button>
                </div>
                {detail.source && (
                  <a
                    className="source-link"
                    href={detail.source}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ảnh gốc trên Unsplash <ArrowUpRight size={12} />
                  </a>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={help} onOpenChange={setHelp}>
        <DialogContent className="help-dialog">
          <div className="brand">
            <Aperture />
            <span>frame.</span>
          </div>
          <DialogTitle>Không gian cho ý tưởng của bạn.</DialogTitle>
          <DialogDescription>
            FRAME là studio sáng tạo độc lập. Bản trải nghiệm hiện tại ưu tiên
            công cụ và quy trình sáng tạo.
          </DialogDescription>
          <div className="help-feature">
            <Check />
            Khám phá, dùng prompt và lưu ý tưởng.
          </div>
          <div className="help-feature">
            <Check />
            Tải ảnh, chỉnh màu và xuất PNG trên thiết bị.
          </div>
          <div className="help-feature">
            <Check />
            Viết storyboard, xuất brief và nghe lời đọc.
          </div>
          <div className="connection-note">
            <Zap size={18} />
            <div>
              <b>Kết nối AI</b>
              <p>
                Tạo ảnh và video cần nhà cung cấp AI được cấu hình bởi chủ ứng
                dụng. Hiện chưa có mô hình kết nối. Không có phí hoặc credit bị
                trừ.
              </p>
            </div>
          </div>
          <p className="field-hint">
            Bản nháp và mục đã lưu chỉ nằm trong trình duyệt này. Chưa có đồng
            bộ tài khoản. Ảnh tham khảo có ghi nguồn Unsplash; hình chrome được
            tạo riêng. FRAME không liên kết với Higgsfield.
          </p>
        </DialogContent>
      </Dialog>
      {notice && (
        <div className="toast" role="status">
          <Sparkles size={17} />
          <span>{notice}</span>
          <button onClick={() => setNotice('')} aria-label="Đóng thông báo">
            <X size={15} />
          </button>
        </div>
      )}
    </>
  );
}
