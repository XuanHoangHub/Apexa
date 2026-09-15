'use client';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type SubmitEvent,
} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MotionConfig, motion } from 'framer-motion';
import {
  Aperture,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Plus,
  Search,
  LayoutGrid,
  List,
  ChevronRight,
  ChevronDown,
  Clapperboard,
  FolderOpen,
  FileText,
  Rows3,
  Film,
  Images,
  CalendarDays,
  ClipboardList,
  Users,
  MapPin,
  Folder,
  Settings2,
  PanelsTopLeft,
  Layers,
  Check,
  Cloud,
  LoaderCircle,
  X,
  Menu,
  BarChart3,
  CircleHelp,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import AccountMenu from '@/components/auth/account-menu';
import { createClient } from '@/lib/supabase/client';
import {
  colors,
  demo,
  emptyData,
  normalizeData,
  localDate,
  phases,
  projectTypes,
  type Project,
  type ProjectData,
  type Section,
  type Collection,
  type Item,
} from '@/lib/production/model';
import RecordDialog from './record-dialog';
import Workspace from './workspace';

export const navigation: {
  group: string;
  items: { id: Section; label: string; icon: typeof Aperture }[];
}[] = [
  {
    group: 'PROJECT',
    items: [{ id: 'overview', label: 'Overview', icon: PanelsTopLeft }],
  },
  {
    group: 'WRITE & VISUALIZE',
    items: [
      { id: 'versions', label: 'Screenplay', icon: FileText },
      { id: 'av', label: 'AV script', icon: Rows3 },
      { id: 'breakdown', label: 'Script breakdown', icon: Layers },
      { id: 'shots', label: 'Shot list', icon: Film },
      { id: 'storyboard', label: 'Storyboards', icon: Images },
      { id: 'mood', label: 'Mood boards', icon: LayoutGrid },
    ],
  },
  {
    group: 'PLAN & PRODUCE',
    items: [
      { id: 'schedule', label: 'Shooting schedule', icon: CalendarDays },
      { id: 'calls', label: 'Call sheets', icon: ClipboardList },
      { id: 'calendar', label: 'Production calendar', icon: CalendarDays },
      { id: 'tasks', label: 'Task board', icon: PanelsTopLeft },
      { id: 'contacts', label: 'Cast & crew', icon: Users },
      { id: 'locations', label: 'Locations', icon: MapPin },
    ],
  },
  {
    group: 'ORGANIZE',
    items: [
      { id: 'documents', label: 'Documents', icon: FileText },
      { id: 'assets', label: 'Media library', icon: Folder },
      { id: 'reports', label: 'Reports & exports', icon: BarChart3 },
      { id: 'settings', label: 'Project settings', icon: Settings2 },
    ],
  },
];

export default function ProductionSuite() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [sample, setSample] = useState(demo);
  const [selected, setSelected] = useState<string | null>(null);
  const [section, setSection] = useState<Section>('overview');
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const saveLock = useRef(false);
  const loadEpoch = useRef(0);
  const [saveFailed, setSaveFailed] = useState(false);
  const [scriptDrafts, setScriptDrafts] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All projects');
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [mobile, setMobile] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editor, setEditor] = useState<{
    collection: Collection;
    item?: Item;
  } | null>(null);
  const [confirmation, setConfirmation] = useState<{
    title: string;
    description: string;
    action: () => Promise<void>;
  } | null>(null);
  const [help, setHelp] = useState(false);
  const project =
    selected === 'demo' ? sample : projects.find((p) => p.id === selected);

  const load = useCallback(async () => {
    const epoch = ++loadEpoch.current;
    try {
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();
      if (epoch !== loadEpoch.current) return;
      setLoading(true);
      setUserId(auth.user?.id ?? null);
      if (auth.user) {
        const { data, error } = await supabase
          .from('production_projects')
          .select('*')
          .order('updated_at', { ascending: false });
        if (error) throw error;
        if (epoch !== loadEpoch.current) return;
        setProjects(
          (data ?? []).map((row) => ({
            ...row,
            data: normalizeData(row.data),
          })) as Project[],
        );
      } else setProjects([]);
    } catch {
      if (epoch === loadEpoch.current)
        setNotice('Không tải được project. Kiểm tra kết nối và nhấn tải lại.');
    } finally {
      if (epoch === loadEpoch.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    function restore() {
      const params = new URLSearchParams(window.location.search);
      setSelected(params.get('project'));
      const tab = params.get('tab');
      setSection(
        navigation.some((group) => group.items.some((item) => item.id === tab))
          ? (tab as Section)
          : 'overview',
      );
    }
    restore();
    window.addEventListener('popstate', restore);
    let bootstrap: ReturnType<typeof setTimeout> | undefined;
    const { data } = createClient().auth.onAuthStateChange((event) => {
      if (event === 'INITIAL_SESSION') {
        // Start queries outside the Auth subscription's session lock.
        bootstrap = setTimeout(() => void load(), 0);
      }
      if (event === 'SIGNED_OUT') {
        loadEpoch.current++;
        setProjects([]);
        setScriptDrafts({});
        setUserId(null);
        setSelected(null);
      }
    });
    const epoch = loadEpoch;
    return () => {
      epoch.current++;
      clearTimeout(bootstrap);
      window.removeEventListener('popstate', restore);
      data.subscription.unsubscribe();
    };
  }, [load]);
  useEffect(() => {
    const hasDraft = Object.entries(scriptDrafts).some(
      ([id, draft]) =>
        draft !==
        (id === 'demo' ? sample : projects.find((p) => p.id === id))?.data
          .script,
    );
    if (!hasDraft) return;
    const prevent = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', prevent);
    return () => window.removeEventListener('beforeunload', prevent);
  }, [scriptDrafts, sample, projects]);
  function navigate(id: string | null, tab: Section = 'overview') {
    if (saveLock.current) return;
    setSelected(id);
    setSection(tab);
    setMobile(false);
    setQuery('');
    const params = new URLSearchParams();
    if (id) {
      params.set('project', id);
      params.set('tab', tab);
    }
    window.history.pushState(
      null,
      '',
      `/production${id ? '?' + params.toString() : ''}`,
    );
  }
  async function save(
    data: ProjectData,
    title = project?.title ?? '',
  ): Promise<boolean> {
    if (!project || saveLock.current) return false;
    if (project.id === 'demo') {
      setSample({ ...project, data, title });
      setNotice(
        'Đã cập nhật bản demo trong phiên này. Tạo project để lưu lâu dài.',
      );
      return true;
    }
    saveLock.current = true;
    setSaving(true);
    setSaveFailed(false);
    try {
      const { data: row, error } = await createClient()
        .from('production_projects')
        .update({
          title,
          data,
          revision: project.revision + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', project.id)
        .eq('revision', project.revision)
        .select()
        .maybeSingle();
      if (error) throw error;
      if (!row) {
        setSaveFailed(true);
        setNotice(
          'Project đã thay đổi ở cửa sổ khác. Tải lại trước khi lưu tiếp.',
        );
        return false;
      }
      setProjects((current) =>
        current.map((p) => (p.id === row.id ? (row as Project) : p)),
      );
      setNotice('Đã lưu vào project.');
      return true;
    } catch {
      setSaveFailed(true);
      setNotice('Chưa lưu được. Nội dung chưa được đồng bộ; vui lòng thử lại.');
      return false;
    } finally {
      saveLock.current = false;
      setSaving(false);
    }
  }
  async function addProject(title: string, data: ProjectData) {
    if (!userId) return false;
    setSaving(true);
    try {
      const { data: row, error } = await createClient()
        .from('production_projects')
        .insert({ title, data, owner_id: userId })
        .select()
        .single();
      if (error) throw error;
      setProjects((current) => [row as Project, ...current]);
      setCreateOpen(false);
      navigate(row.id);
      setNotice('Project mới đã sẵn sàng.');
      return true;
    } catch {
      setNotice('Không tạo được project. Vui lòng thử lại.');
      return false;
    } finally {
      setSaving(false);
    }
  }
  function remove(collection: Collection, item: Item) {
    if (!project) return;
    setConfirmation({
      title: 'Xóa mục này?',
      description:
        'Mục sẽ được xóa khỏi project. Các tài liệu khác được giữ lại.',
      action: async () => {
        let data = {
          ...project.data,
          [collection]: project.data[collection].filter(
            (row) => row.id !== item.id,
          ),
        };
        if (collection === 'scenes')
          data = {
            ...data,
            shots: data.shots.map((row) =>
              row.scene === item.id ? { ...row, scene: '' } : row,
            ),
            breakdown: data.breakdown.map((row) =>
              row.scene === item.id ? { ...row, scene: '' } : row,
            ),
            schedule: data.schedule.map((row) => ({
              ...row,
              scenes: (row.scenes ?? '')
                .split(',')
                .filter((id) => id !== item.id)
                .join(','),
            })),
          };
        if (await save(data)) {
          if (collection === 'assets' && item.path && project.id !== 'demo') {
            const { error } = await createClient()
              .storage.from('production-assets')
              .remove([item.path]);
            if (error)
              setNotice(
                'Đã xóa khỏi project; chưa xóa được tệp gốc khỏi kho lưu trữ.',
              );
          }
          setConfirmation(null);
        }
      },
    });
  }
  const visible = projects.filter(
    (p) =>
      (filter === 'Archived' ? p.data.archived : !p.data.archived) &&
      (filter === 'All projects' ||
        filter === 'Archived' ||
        p.data.phase === filter) &&
      p.title.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <MotionConfig reducedMotion="user">
      <div className="ps-shell" lang="vi">
        <header className="ps-topbar">
          <Link className="ps-brand" href="/">
            <Aperture size={26} />
            <span>
              apexa<span>.</span>
            </span>
          </Link>
          <span className="ps-top-divider" />
          <button className="ps-suite-label" onClick={() => navigate(null)}>
            <Clapperboard size={16} />
            Production Suite
          </button>
          <span className="ps-beta">WORKSPACE</span>
          <div className="ps-top-actions">
            <Link href="/" className="ps-back-studio">
              <ArrowUpRight size={14} />
              Creative Studio
            </Link>
            <button
              className="ps-icon"
              aria-label="Hướng dẫn Production Suite"
              onClick={() => setHelp(true)}
            >
              <CircleHelp size={18} />
            </button>
            <AccountMenu />
          </div>
        </header>
        {project ? (
          <div className="ps-workspace">
            <aside className={`ps-sidebar ${mobile ? 'is-open' : ''}`}>
              <button
                className="ps-back-projects"
                onClick={() => navigate(null)}
              >
                <ArrowLeft size={14} />
                Tất cả project
              </button>
              <button
                className="ps-project-switch"
                onClick={() => navigate(null)}
              >
                <span
                  className="ps-project-icon"
                  style={{ color: project.data.color }}
                >
                  <Clapperboard size={20} />
                </span>
                <span>
                  <strong>{project.title}</strong>
                  <small>{project.data.type}</small>
                </span>
                <ChevronDown size={14} />
              </button>
              <nav aria-label="Công cụ sản xuất">
                {navigation.map((group) => (
                  <div className="ps-nav-group" key={group.group}>
                    <span>{group.group}</span>
                    {group.items.map((item) => (
                      <button
                        key={item.id}
                        className={section === item.id ? 'active' : ''}
                        onClick={() => navigate(project.id, item.id)}
                      >
                        <item.icon size={16} />
                        {item.label}
                        {item.id === 'tasks' && (
                          <em>
                            {
                              project.data.tasks.filter(
                                (t) => t.status !== 'Done',
                              ).length
                            }
                          </em>
                        )}
                      </button>
                    ))}
                  </div>
                ))}
              </nav>
              <div className="ps-sidebar-footer">
                <Cloud size={15} />
                <span>
                  {project.id === 'demo'
                    ? 'Demo · chưa lưu cloud'
                    : 'Project riêng tư'}
                </span>
              </div>
            </aside>
            <main className="ps-work-main">
              <div className="ps-breadcrumb">
                <button
                  className="ps-icon ps-mobile-toggle"
                  aria-label="Mở menu công cụ"
                  onClick={() => setMobile(!mobile)}
                >
                  <Menu size={18} />
                </button>
                <button onClick={() => navigate(null)}>Projects</button>
                <ChevronRight size={13} />
                <span>{project.title}</span>
                <ChevronRight size={13} />
                <strong>
                  {
                    navigation
                      .flatMap((g) => g.items)
                      .find((i) => i.id === section)?.label
                  }
                </strong>
                <span className="ps-sync">
                  {saving ? (
                    <LoaderCircle className="ps-spin" size={13} />
                  ) : (
                    <Check size={13} />
                  )}
                  {saving
                    ? 'Đang lưu'
                    : project.id === 'demo'
                      ? 'Project mẫu'
                      : saveFailed
                        ? 'Chưa lưu'
                        : 'Đã đồng bộ'}
                </span>
              </div>
              {project.id === 'demo' && (
                <div className="ps-demo-banner">
                  <span>
                    Đây là project mẫu. Thay đổi chỉ tồn tại trong phiên xem
                    thử.
                  </span>
                  <button
                    onClick={() =>
                      userId
                        ? void addProject(`${sample.title} — Copy`, {
                            ...sample.data,
                            archived: false,
                          })
                        : setCreateOpen(true)
                    }
                    disabled={saving}
                  >
                    Tạo bản của bạn
                    <ArrowRight size={13} />
                  </button>
                </div>
              )}
              <motion.div
                className="ps-section"
                key={`${project.id}-${section}`}
                initial={{ opacity: 0, y: 7 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.23 }}
              >
                <Workspace
                  project={project}
                  section={section}
                  saving={saving}
                  onNavigate={(tab) => navigate(project.id, tab)}
                  onSave={save}
                  scriptDraft={scriptDrafts[project.id]}
                  onScriptDraft={(value) =>
                    setScriptDrafts((current) => ({
                      ...current,
                      [project.id]: value,
                    }))
                  }
                  onEdit={(collection, item) => setEditor({ collection, item })}
                  onRemove={remove}
                  onNotice={setNotice}
                  userId={userId}
                  onDuplicate={() =>
                    userId
                      ? void addProject(`${project.title} — Copy`, {
                          ...project.data,
                          archived: false,
                          assets: project.data.assets.filter((a) => !a.path),
                        })
                      : setCreateOpen(true)
                  }
                />
              </motion.div>
            </main>
          </div>
        ) : (
          <main className="ps-projects-page">
            <div className="ps-page-intro">
              <div>
                <div className="ps-eyebrow">
                  <span /> FROM FIRST IDEA TO FINAL CUT
                </div>
                <h1>
                  Production Suite<span>.</span>
                </h1>
                <p>Mỗi câu chuyện lớn, bắt đầu từ một project.</p>
              </div>
              <button
                className="ps-btn ps-primary"
                onClick={() => setCreateOpen(true)}
              >
                <Plus size={17} />
                Tạo project
              </button>
            </div>
            <div className="ps-overview-stats">
              {[
                {
                  label: 'Active projects',
                  value: projects.filter((p) => !p.data.archived).length,
                  icon: FolderOpen,
                },
                {
                  label: 'Upcoming shoot days',
                  value: projects
                    .filter((p) => !p.data.archived)
                    .reduce(
                      (n, p) =>
                        n +
                        p.data.schedule.filter((d) => d.date >= localDate())
                          .length,
                      0,
                    ),
                  icon: Clapperboard,
                },
                {
                  label: 'Open tasks',
                  value: projects
                    .filter((p) => !p.data.archived)
                    .reduce(
                      (n, p) =>
                        n +
                        p.data.tasks.filter((t) => t.status !== 'Done').length,
                      0,
                    ),
                  icon: ClipboardList,
                },
                {
                  label: 'Cast & crew entries',
                  value: projects
                    .filter((p) => !p.data.archived)
                    .reduce((n, p) => n + p.data.contacts.length, 0),
                  icon: Users,
                },
              ].map((stat) => (
                <div key={stat.label}>
                  <stat.icon size={18} />
                  <strong>
                    {loading ? '—' : String(stat.value).padStart(2, '0')}
                  </strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
            <div className="ps-project-toolbar">
              <div className="ps-project-filters">
                {[
                  'All projects',
                  'Pre-production',
                  'Production',
                  'Archived',
                ].map((value) => (
                  <button
                    key={value}
                    className={filter === value ? 'active' : ''}
                    onClick={() => setFilter(value)}
                  >
                    {value}
                    {value === 'All projects' && (
                      <em>{projects.filter((p) => !p.data.archived).length}</em>
                    )}
                  </button>
                ))}
              </div>
              <div className="ps-tools">
                <label className="ps-search">
                  <Search size={15} />
                  <input
                    aria-label="Tìm project"
                    placeholder="Tìm project…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
                <button
                  className={`ps-icon ${layout === 'grid' ? 'selected' : ''}`}
                  aria-label="Xem dạng lưới"
                  onClick={() => setLayout('grid')}
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  className={`ps-icon ${layout === 'list' ? 'selected' : ''}`}
                  aria-label="Xem dạng danh sách"
                  onClick={() => setLayout('list')}
                >
                  <List size={17} />
                </button>
              </div>
            </div>
            {loading ? (
              <div className="ps-loading">
                <LoaderCircle className="ps-spin" size={24} />
                Đang tải workspace…
              </div>
            ) : (
              <div
                className={`ps-project-grid ${layout === 'list' ? 'ps-list-layout' : ''}`}
              >
                {visible.map((p) => (
                  <ProjectCard
                    key={p.id}
                    project={p}
                    onOpen={() => navigate(p.id)}
                  />
                ))}
                {filter === 'All projects' && !query && (
                  <ProjectCard
                    project={sample}
                    isDemo
                    onOpen={() => navigate('demo')}
                  />
                )}
                {filter === 'All projects' && !query && (
                  <button
                    className="ps-new-card"
                    onClick={() => setCreateOpen(true)}
                  >
                    <span>
                      <Plus size={26} />
                    </span>
                    <strong>Câu chuyện tiếp theo của bạn</strong>
                    <p>
                      Phim ngắn, TVC, MV hay documentary.
                      <br />
                      Tất cả bắt đầu ở đây.
                    </p>
                    <span className="ps-new-link">
                      Tạo project mới
                      <ArrowRight size={15} />
                    </span>
                  </button>
                )}
              </div>
            )}
            {!loading &&
              visible.length === 0 &&
              (query || filter !== 'All projects') && (
                <div className="ps-empty">
                  <FolderOpen size={32} />
                  <h3>Chưa có project phù hợp</h3>
                  <p>Thử thay đổi bộ lọc hoặc tạo một project mới.</p>
                  <button
                    className="ps-btn"
                    onClick={() => {
                      setFilter('All projects');
                      setQuery('');
                    }}
                  >
                    Xem tất cả
                  </button>
                </div>
              )}
            <div className="ps-workflow-footer">
              <span>ONE CONNECTED WORKFLOW</span>
              <div>
                {['Write', 'Break down', 'Visualize', 'Plan', 'Shoot'].map(
                  (label, i) => (
                    <span key={label}>
                      <i>{String(i + 1).padStart(2, '0')}</i>
                      {label}
                      {i < 4 && <ArrowRight size={14} />}
                    </span>
                  ),
                )}
              </div>
              <p>Kịch bản, con người và lịch trình. Cùng một không gian.</p>
            </div>
            {selected && !loading && (
              <p className="ps-form-error">
                Project không tồn tại hoặc bạn chưa có quyền truy cập.
              </p>
            )}
          </main>
        )}
        {notice && (
          <output className="ps-toast">
            <span>{notice}</span>
            <button onClick={() => void load()} aria-label="Tải lại project">
              <Cloud size={16} />
            </button>
            <button onClick={() => setNotice('')} aria-label="Đóng thông báo">
              <X size={16} />
            </button>
          </output>
        )}
        {editor && project && (
          <RecordDialog
            key={`${editor.collection}-${editor.item?.id ?? 'new'}`}
            {...editor}
            project={project}
            onClose={() => setEditor(null)}
            onSave={async (item) =>
              save({
                ...project.data,
                [editor.collection]: editor.item
                  ? project.data[editor.collection].map((row) =>
                      row.id === item.id ? item : row,
                    )
                  : [...project.data[editor.collection], item],
              })
            }
          />
        )}
        {createOpen && (
          <CreateProject
            userId={userId}
            busy={saving}
            onClose={() => setCreateOpen(false)}
            onCreate={addProject}
          />
        )}
        <Dialog
          open={!!confirmation}
          onOpenChange={(open) => !open && !saving && setConfirmation(null)}
        >
          <DialogContent className="ps-dialog ps-confirm">
            <DialogTitle>{confirmation?.title}</DialogTitle>
            <DialogDescription>{confirmation?.description}</DialogDescription>
            <div className="ps-dialog-actions">
              <button
                className="ps-btn"
                onClick={() => setConfirmation(null)}
                disabled={saving}
              >
                Hủy
              </button>
              <button
                className="ps-btn ps-danger"
                disabled={saving}
                onClick={() => void confirmation?.action()}
              >
                Xóa
              </button>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={help} onOpenChange={setHelp}>
          <DialogContent className="ps-dialog ps-confirm">
            <DialogTitle>Từ ý tưởng đến ngày bấm máy.</DialogTitle>
            <DialogDescription>
              Tạo project, viết hoặc nhập kịch bản Fountain/TXT, thêm cảnh rồi
              xây dựng shot list, lịch quay và call sheet. Tài khoản của bạn lưu
              project và tệp riêng tư trên Supabase.
            </DialogDescription>
            <p className="ps-help-text">
              Call sheet có thể in hoặc lưu PDF từ trình duyệt. Email/SMS,
              tracking người nhận và cộng tác nhiều tài khoản chưa được kết nối.
              Các liên hệ và người phụ trách là dữ liệu kế hoạch trong project,
              không tự gửi lời mời.
            </p>
            <button
              className="ps-btn ps-primary"
              onClick={() => setHelp(false)}
            >
              Đã hiểu
              <Check size={16} />
            </button>
          </DialogContent>
        </Dialog>
      </div>
    </MotionConfig>
  );
}

function ProjectCard({
  project,
  isDemo,
  onOpen,
}: {
  project: Project;
  isDemo?: boolean;
  onOpen: () => void;
}) {
  const total = project.data.tasks.length;
  const progress = total
    ? Math.round(
        (project.data.tasks.filter((t) => t.status === 'Done').length / total) *
          100,
      )
    : 0;
  return (
    <motion.button
      className="ps-project-card"
      onClick={onOpen}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.995 }}
    >
      <div
        className="ps-card-art"
        style={{ '--project-color': project.data.color } as React.CSSProperties}
      >
        {isDemo ? (
          <Image
            src="https://images.unsplash.com/photo-1564107628966-daff03746bee?auto=format&fit=crop&w=900&q=85"
            alt="Đồi cát — ảnh tham khảo của Martin Sanchez / Unsplash"
            fill
            sizes="(max-width: 700px) 100vw, 33vw"
          />
        ) : (
          <>
            <span className="ps-card-monogram">
              {project.title.slice(0, 2).toUpperCase()}
            </span>
            <Clapperboard size={100} strokeWidth={0.6} />
          </>
        )}
        <span className="ps-card-type">{project.data.type.toUpperCase()}</span>
        <span className="ps-card-open">
          <ArrowUpRight size={17} />
        </span>
        {isDemo && <span className="ps-demo-chip">SAMPLE PROJECT</span>}
      </div>
      <div className="ps-card-body">
        <span className="ps-phase">
          <i style={{ background: project.data.color }} />
          {project.data.archived ? 'Archived' : project.data.phase}
        </span>
        <h2>{project.title}</h2>
        <p>
          {project.data.description || 'Câu chuyện của bạn đang chờ được kể.'}
        </p>
        <div className="ps-card-meta">
          <span>
            <Film size={13} />
            {project.data.scenes.length} scenes
          </span>
          <span>
            <Users size={13} />
            {project.data.contacts.length} people
          </span>
          <span>
            <CalendarDays size={13} />
            {project.data.schedule.length} shoot days
          </span>
        </div>
        <div className="ps-progress">
          <span
            style={{ width: `${progress}%`, background: project.data.color }}
          />
        </div>
        <div className="ps-card-bottom">
          <span>{progress}% tasks completed</span>
          <span>{project.data.start || 'Chưa đặt ngày'}</span>
        </div>
      </div>
    </motion.button>
  );
}

function CreateProject({
  userId,
  busy,
  onClose,
  onCreate,
}: {
  userId: string | null;
  busy: boolean;
  onClose: () => void;
  onCreate: (title: string, data: ProjectData) => Promise<boolean>;
}) {
  const [title, setTitle] = useState('');
  const [data, setData] = useState(emptyData);
  const [error, setError] = useState('');
  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      setError('Nhập tên project để tiếp tục.');
      return;
    }
    if (data.start && data.end && data.end < data.start) {
      setError('Ngày kết thúc cần sau ngày bắt đầu.');
      return;
    }
    if (!(await onCreate(title.trim(), data)))
      setError('Chưa tạo được project. Vui lòng thử lại.');
  }
  return (
    <Dialog open onOpenChange={(open) => !open && !busy && onClose()}>
      <DialogContent className="ps-dialog">
        <span className="ps-dialog-symbol">
          <Clapperboard size={24} />
        </span>
        <DialogTitle>Câu chuyện mới. Project mới.</DialogTitle>
        <DialogDescription>
          Một không gian riêng cho mọi bước sản xuất.
        </DialogDescription>
        {!userId ? (
          <div className="ps-signin-prompt">
            <p>
              Đăng nhập để tạo project và lưu dữ liệu trên tài khoản của bạn.
            </p>
            <Link className="ps-btn ps-primary" href="/login">
              Đăng nhập
              <ArrowRight size={16} />
            </Link>
            <button className="ps-btn" onClick={onClose}>
              Tiếp tục khám phá demo
            </button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <fieldset className="ps-form-grid" disabled={busy}>
              <label className="ps-field ps-span-2">
                Tên project *
                <input
                  required
                  maxLength={120}
                  placeholder="Ví dụ: The next chapter"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </label>
              <label className="ps-field">
                Loại production
                <select
                  value={data.type}
                  onChange={(e) => setData({ ...data, type: e.target.value })}
                >
                  {projectTypes.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </label>
              <label className="ps-field">
                Giai đoạn
                <select
                  value={data.phase}
                  onChange={(e) => setData({ ...data, phase: e.target.value })}
                >
                  {phases.map((phase) => (
                    <option key={phase}>{phase}</option>
                  ))}
                </select>
              </label>
              <label className="ps-field">
                Ngày bắt đầu
                <input
                  type="date"
                  value={data.start}
                  onChange={(e) => setData({ ...data, start: e.target.value })}
                />
              </label>
              <label className="ps-field">
                Ngày kết thúc
                <input
                  type="date"
                  min={data.start}
                  value={data.end}
                  onChange={(e) => setData({ ...data, end: e.target.value })}
                />
              </label>
              <label className="ps-field ps-span-2">
                Logline / mô tả
                <textarea
                  rows={3}
                  maxLength={2000}
                  value={data.description}
                  onChange={(e) =>
                    setData({ ...data, description: e.target.value })
                  }
                  placeholder="Câu chuyện này nói về điều gì?"
                />
              </label>
              <div className="ps-field ps-span-2">
                <span>Màu project</span>
                <div className="ps-colors">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      aria-label={`Chọn màu ${color}`}
                      aria-pressed={data.color === color}
                      style={{ background: color }}
                      onClick={() => setData({ ...data, color })}
                    >
                      {data.color === color && <Check size={15} />}
                    </button>
                  ))}
                </div>
              </div>
            </fieldset>
            {error && (
              <p className="ps-form-error" role="alert">
                {error}
              </p>
            )}
            <div className="ps-dialog-actions">
              <button
                type="button"
                className="ps-btn"
                disabled={busy}
                onClick={onClose}
              >
                Hủy
              </button>
              <button className="ps-btn ps-primary" disabled={busy}>
                {busy ? (
                  <LoaderCircle className="ps-spin" size={16} />
                ) : (
                  <Plus size={16} />
                )}
                Tạo project
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
