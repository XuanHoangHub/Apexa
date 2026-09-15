'use client';
import { useRef, useState, type ChangeEvent } from 'react';
import Image from 'next/image';
import {
  ArrowRight,
  Plus,
  FileText,
  Film,
  CalendarDays,
  Users,
  ClipboardList,
  MapPin,
  Clock3,
  Check,
  Download,
  Upload,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Images,
  LayoutGrid,
  List,
  Printer,
  Copy,
  Archive,
  Layers,
  ArrowUp,
  ArrowDown,
  LoaderCircle,
  ExternalLink,
  Camera,
  Search,
  Save,
  Clapperboard,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import ScreenplayEditor from './screenplay-editor';
import KanbanBoard from './kanban-board';
import { definitions } from '@/lib/production/fields';
import {
  csv,
  download,
  newItem,
  localDate,
  phases,
  projectTypes,
  safeUrl,
  sceneLabel,
  type Collection,
  type Item,
  type Project,
  type ProjectData,
  type Section,
} from '@/lib/production/model';

type Props = {
  project: Project;
  section: Section;
  saving: boolean;
  userId: string | null;
  onNavigate: (section: Section) => void;
  onSave: (data: ProjectData, title?: string) => Promise<boolean>;
  onEdit: (collection: Collection, item?: Item) => void;
  onRemove: (collection: Collection, item: Item) => void;
  onNotice: (message: string) => void;
  onDuplicate: () => void;
  scriptDraft?: string;
  onScriptDraft: (value: string) => void;
};

export default function Workspace(props: Props) {
  const { section } = props;
  if (section === 'overview') return <Overview {...props} />;
  if (section === 'versions') return <Screenplay {...props} />;
  if (section === 'settings') return <Settings {...props} />;
  if (section === 'calendar') return <Calendar {...props} />;
  if (section === 'reports') return <Reports {...props} />;
  return <ProductionTools {...props} />;
}
function Heading({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="ps-section-heading">
      <div>
        {eyebrow && <span className="ps-eyebrow">{eyebrow}</span>}
        <h1>
          {title}
          <span>.</span>
        </h1>
        {description && <p>{description}</p>}
      </div>
      <div className="ps-tools">{children}</div>
    </div>
  );
}
function Empty({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="ps-empty">
      <Clapperboard size={30} />
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

function Overview({ project, onNavigate, onEdit }: Props) {
  const data = project.data;
  const done = data.tasks.filter((t) => t.status === 'Done').length;
  const nextDay = [...data.schedule]
    .filter((day) => day.date >= localDate())
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  return (
    <>
      <Heading
        eyebrow="PROJECT OVERVIEW"
        title={project.title}
        description={
          data.description || 'Mọi chi tiết của production, trong một góc nhìn.'
        }
      >
        <span className="ps-phase ps-phase-large">
          <i style={{ background: data.color }} />
          {data.phase}
        </span>
      </Heading>
      <div className="ps-project-summary">
        <div>
          <Film size={19} />
          <strong>{data.scenes.length.toString().padStart(2, '0')}</strong>
          <span>Scenes</span>
          <button onClick={() => onNavigate('versions')}>
            Kịch bản
            <ArrowRight size={13} />
          </button>
        </div>
        <div>
          <Camera size={19} />
          <strong>{data.shots.length.toString().padStart(2, '0')}</strong>
          <span>Planned shots</span>
          <button onClick={() => onNavigate('shots')}>
            Shot list
            <ArrowRight size={13} />
          </button>
        </div>
        <div>
          <CalendarDays size={19} />
          <strong>{data.schedule.length.toString().padStart(2, '0')}</strong>
          <span>Shoot days</span>
          <button onClick={() => onNavigate('schedule')}>
            Lịch quay
            <ArrowRight size={13} />
          </button>
        </div>
        <div>
          <Users size={19} />
          <strong>{data.contacts.length.toString().padStart(2, '0')}</strong>
          <span>Cast & crew</span>
          <button onClick={() => onNavigate('contacts')}>
            Contacts
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
      <div className="ps-overview-columns">
        <div>
          <div className="ps-block-heading">
            <h2>Creative workspace</h2>
            <span>BUILD THE VISION</span>
          </div>
          <div className="ps-tool-cards">
            {[
              {
                id: 'versions',
                title: 'Screenplay',
                text: 'Viết nên câu chuyện.',
                meta: `${data.scenes.length} scenes`,
                icon: FileText,
                color: '#86cee6',
              },
              {
                id: 'breakdown',
                title: 'Script breakdown',
                text: 'Không bỏ sót chi tiết.',
                meta: `${data.breakdown.length} elements`,
                icon: Layers,
                color: '#dda9ee',
              },
              {
                id: 'shots',
                title: 'Shot list',
                text: 'Từng góc máy có chủ đích.',
                meta: `${data.shots.length} shots`,
                icon: Film,
                color: '#e9c890',
              },
              {
                id: 'storyboard',
                title: 'Storyboards',
                text: 'Nhìn thấy bộ phim trước.',
                meta: `${data.shots.filter((s) => s.image).length} frames`,
                icon: Images,
                color: '#a5d9be',
              },
            ].map((tool) => (
              <button
                key={tool.id}
                className="ps-tool-card"
                onClick={() => onNavigate(tool.id as Section)}
              >
                <span className="ps-tool-icon" style={{ color: tool.color }}>
                  <tool.icon size={23} />
                </span>
                <ArrowRight className="ps-tool-arrow" size={17} />
                <h3>{tool.title}</h3>
                <p>{tool.text}</p>
                <span className="ps-tool-meta">{tool.meta}</span>
              </button>
            ))}
          </div>
          <div className="ps-block-heading">
            <h2>Production timeline</h2>
            <button onClick={() => onNavigate('calendar')}>
              Mở calendar
              <ArrowRight size={13} />
            </button>
          </div>
          <div className="ps-phase-track">
            {phases.map((phase, index) => (
              <button
                key={phase}
                className={
                  index <= phases.indexOf(data.phase) ? 'is-reached' : ''
                }
                onClick={() => onNavigate('settings')}
              >
                <span>
                  {index < phases.indexOf(data.phase) ? (
                    <Check size={13} />
                  ) : (
                    String(index + 1).padStart(2, '0')
                  )}
                </span>
                <strong>{phase}</strong>
              </button>
            ))}
          </div>
          <div className="ps-block-heading">
            <h2>Shot preview</h2>
            <button onClick={() => onNavigate('storyboard')}>
              Xem storyboard
              <ArrowRight size={13} />
            </button>
          </div>
          <div className="ps-shot-preview">
            {data.shots.slice(0, 3).map((shot) => (
              <button key={shot.id} onClick={() => onEdit('shots', shot)}>
                <Visual src={shot.image} title={shot.title} />
                <span>
                  <b>{shot.number}</b>
                  {shot.title}
                </span>
              </button>
            ))}
            {!data.shots.length && (
              <Empty
                title="Bắt đầu bằng một góc máy"
                description="Thêm shot đầu tiên để phác thảo ngôn ngữ hình ảnh."
                action={
                  <button className="ps-btn" onClick={() => onEdit('shots')}>
                    <Plus size={15} />
                    Thêm shot
                  </button>
                }
              />
            )}
          </div>
        </div>
        <aside className="ps-overview-right">
          <div className="ps-next-day">
            <div className="ps-block-heading">
              <h2>
                <span className="ps-live-dot" />
                Next shoot
              </h2>
              <Clapperboard size={17} />
            </div>
            {nextDay ? (
              <>
                <span className="ps-next-date">
                  {new Date(nextDay.date + 'T12:00:00').toLocaleDateString(
                    'vi-VN',
                    { day: '2-digit', month: 'long' },
                  )}
                </span>
                <h3>{nextDay.title}</h3>
                <p>
                  <MapPin size={14} />
                  {nextDay.location || 'Chưa chọn địa điểm'}
                </p>
                <div className="ps-call-times">
                  <span>
                    CREW CALL<strong>{nextDay.call || '—'}</strong>
                  </span>
                  <span>
                    EST. WRAP<strong>{nextDay.wrap || '—'}</strong>
                  </span>
                </div>
                <button
                  className="ps-btn ps-primary"
                  onClick={() => onNavigate('schedule')}
                >
                  Xem lịch quay
                  <ArrowRight size={15} />
                </button>
              </>
            ) : (
              <>
                <p>Lên lịch ngày quay đầu tiên.</p>
                <button className="ps-btn" onClick={() => onEdit('schedule')}>
                  <Plus size={15} />
                  Thêm ngày quay
                </button>
              </>
            )}
          </div>
          <div className="ps-task-widget">
            <div className="ps-block-heading">
              <h2>To keep things moving</h2>
              <span>
                {done}/{data.tasks.length}
              </span>
            </div>
            {data.tasks.slice(0, 4).map((task) => (
              <button key={task.id} onClick={() => onEdit('tasks', task)}>
                <span
                  className={`ps-task-check ${task.status === 'Done' ? 'done' : ''}`}
                >
                  {task.status === 'Done' && <Check size={11} />}
                </span>
                <span>
                  <strong>{task.title}</strong>
                  <small>
                    {task.assignee || 'Chưa phân công'} ·{' '}
                    {task.due || 'Chưa có hạn'}
                  </small>
                </span>
              </button>
            ))}
            {!data.tasks.length && <p>Thêm công việc để theo dõi tiến độ.</p>}
            <button
              className="ps-widget-link"
              onClick={() => onNavigate('tasks')}
            >
              Mở task board
              <ArrowRight size={14} />
            </button>
          </div>
          <div className="ps-crew-widget">
            <div className="ps-block-heading">
              <h2>The people behind it</h2>
              <button
                aria-label="Thêm thành viên"
                onClick={() => onEdit('contacts')}
              >
                <Plus size={16} />
              </button>
            </div>
            {data.contacts.slice(0, 4).map((person, index) => (
              <button
                key={person.id}
                onClick={() => onEdit('contacts', person)}
              >
                <span className={`ps-person-avatar color-${index % 4}`}>
                  {person.name.slice(0, 1)}
                </span>
                <span>
                  <strong>{person.name}</strong>
                  <small>{person.role || person.department}</small>
                </span>
              </button>
            ))}
            {!data.contacts.length && <p>Thêm cast & crew cho project.</p>}
          </div>
        </aside>
      </div>
    </>
  );
}

function Visual({ src, title }: { src?: string; title: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="ps-visual">
      {src && safeUrl(src) && !failed ? (
        <Image
          unoptimized
          width={640}
          height={360}
          src={safeUrl(src)}
          alt={title}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <div>
          <Camera size={28} strokeWidth={1} />
          <span>Thêm visual reference</span>
        </div>
      )}
    </div>
  );
}

function Screenplay({
  project,
  onSave,
  onEdit,
  onRemove,
  saving,
  onNotice,
}: Props) {
  const [script, setScript] = useState(project.data.script);
  const [tab, setTab] = useState('editor');
  const file = useRef<HTMLInputElement>(null);
  const dirty = script !== project.data.script;
  async function importScript(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];
    event.target.value = '';
    if (!selectedFile) return;
    if (selectedFile.size > 1000000) {
      onNotice('Kịch bản tối đa 1 MB.');
      return;
    }
    try {
      let text = await selectedFile.text();
      if (selectedFile.name.toLowerCase().endsWith('.fdx')) {
        const xml = new DOMParser().parseFromString(text, 'text/xml');
        if (xml.querySelector('parsererror')) throw new Error();
        text = Array.from(xml.querySelectorAll('Content > Paragraph'))
          .map((p) =>
            Array.from(p.querySelectorAll('Text'))
              .map((t) => t.textContent)
              .join(''),
          )
          .join('\n\n');
      } else if (!/\.(txt|fountain)$/i.test(selectedFile.name)) {
        onNotice('Hỗ trợ Fountain, TXT và Final Draft (.fdx).');
        return;
      }
      setScript(text);
      onNotice('Đã nhập vào bản nháp. Nhấn Lưu kịch bản để lưu project.');
    } catch {
      onNotice('Không đọc được tệp kịch bản.');
    }
  }
  return (
    <>
      {tab !== 'editor' && (
        <Heading
          eyebrow="WRITE"
          title="Screenplay"
          description="Không gian dành cho câu chuyện của bạn."
        >
          <input
            ref={file}
            type="file"
            hidden
            accept=".txt,.fountain,.fdx"
            onChange={(e) => void importScript(e)}
          />
          <button className="ps-btn" onClick={() => file.current?.click()}>
            <Upload size={15} />
            Import script
          </button>
          <button
            className="ps-btn ps-primary"
            disabled={saving}
            onClick={() => void onSave({ ...project.data, script })}
          >
            <Save size={15} />
            {dirty ? 'Lưu kịch bản *' : 'Lưu kịch bản'}
          </button>
        </Heading>
      )}
      <div
        className="ps-subtoolbar"
        style={tab === 'editor' ? { marginBottom: 12 } : undefined}
      >
        <div className="ps-segmented">
          {['editor', 'scenes', 'versions'].map((value) => (
            <button
              key={value}
              className={tab === value ? 'active' : ''}
              onClick={() => setTab(value)}
            >
              {value === 'editor'
                ? 'Screenplay Studio'
                : value === 'scenes'
                  ? `Scenes (${project.data.scenes.length})`
                  : `Versions (${project.data.versions.length})`}
            </button>
          ))}
        </div>
        {tab !== 'editor' && (
          <button
            className="ps-btn ps-compact"
            onClick={() =>
              download(project.data.script, project.title + '.fountain')
            }
          >
            <Download size={14} />
            Fountain
          </button>
        )}
      </div>
      {tab === 'editor' ? (
        <ScreenplayEditor
          project={project}
          saving={saving}
          onSave={onSave}
          onNotice={onNotice}
          onEdit={onEdit}
        />
      ) : tab === 'scenes' ? (
        <>
          <button className="ps-btn" onClick={() => onEdit('scenes')}>
            <Plus size={15} />
            Thêm cảnh
          </button>
          <DataTable
            collection="scenes"
            project={project}
            items={project.data.scenes}
            onEdit={onEdit}
            onRemove={onRemove}
          />
        </>
      ) : (
        <>
          <button
            className="ps-btn ps-primary"
            disabled={saving}
            onClick={() =>
              void onSave({
                ...project.data,
                script,
                versions: [
                  ...project.data.versions,
                  newItem({
                    title: `Draft ${project.data.versions.length + 1}`,
                    body: script,
                    date: new Date().toISOString(),
                  }),
                ],
              })
            }
          >
            <Plus size={15} />
            Lưu phiên bản hiện tại
          </button>
          <div className="ps-version-list">
            {project.data.versions.map((version) => (
              <div key={version.id}>
                <FileText size={20} />
                <span>
                  <strong>{version.title}</strong>
                  <small>
                    {version.date
                      ? new Date(version.date).toLocaleString('vi-VN')
                      : ''}
                  </small>
                </span>
                <button
                  className="ps-btn"
                  onClick={() =>
                    download(
                      version.body,
                      `${project.title}-${version.title}.fountain`,
                    )
                  }
                >
                  <Download size={14} />
                  Tải về
                </button>
                <button
                  className="ps-btn"
                  disabled={saving}
                  onClick={async () => {
                    const ok = await onSave({
                      ...project.data,
                      script: version.body,
                      versions: [
                        ...project.data.versions,
                        newItem({
                          title: 'Backup before restore',
                          body: script,
                          date: new Date().toISOString(),
                        }),
                      ],
                    });
                    if (ok) setScript(version.body);
                  }}
                >
                  Khôi phục
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}

function ProductionTools(props: Props) {
  const {
    project,
    section,
    onEdit,
    onRemove,
    onSave,
    saving,
    onNotice,
    userId,
  } = props;
  const collection = (
    section === 'storyboard' ? 'shots' : section
  ) as Collection;
  const definition = definitions[collection];
  const items = project.data[collection];
  const [search, setSearch] = useState('');
  const [scene, setScene] = useState('all');
  const [view, setView] = useState('cards');
  const [activeCall, setActiveCall] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fileLink, setFileLink] = useState('');
  const upload = useRef<HTMLInputElement>(null);
  const filtered = items.filter(
    (item) =>
      Object.values(item)
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (scene === 'all' || item.scene === scene),
  );
  async function uploadFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!userId || project.id === 'demo') {
      onNotice('Tạo project của bạn để tải tệp lên kho riêng tư.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      onNotice('Tệp tối đa 20 MB.');
      return;
    }
    const types = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
      'text/plain',
      'video/mp4',
      'audio/mpeg',
    ];
    if (!types.includes(file.type)) {
      onNotice('Hỗ trợ JPG, PNG, WebP, PDF, TXT, MP4 và MP3.');
      return;
    }
    setUploading(true);
    const path = `${userId}/${project.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
    const storage = createClient().storage.from('production-assets');
    try {
      const { error } = await storage.upload(path, file, {
        upsert: false,
        contentType: file.type,
      });
      if (error) throw error;
      const saved = await onSave({
        ...project.data,
        assets: [
          ...project.data.assets,
          newItem({
            title: file.name,
            path,
            type: file.type.startsWith('image/')
              ? 'Image'
              : file.type.startsWith('video/')
                ? 'Video'
                : file.type.startsWith('audio/')
                  ? 'Audio'
                  : 'Document',
            size: String(file.size),
            notes: '',
          }),
        ],
      });
      if (!saved) await storage.remove([path]);
    } catch {
      onNotice('Tải tệp thất bại. Kiểm tra kết nối và thử lại.');
    } finally {
      setUploading(false);
    }
  }
  async function openAsset(item: Item) {
    if (item.path) {
      const { data, error } = await createClient()
        .storage.from('production-assets')
        .createSignedUrl(item.path, 300);
      if (error) {
        onNotice('Không mở được tệp.');
        return;
      }
      setFileLink(data.signedUrl);
    } else setFileLink(safeUrl(item.url));
  }
  async function move(item: Item, direction: number) {
    const index = items.findIndex((row) => row.id === item.id);
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    await onSave({ ...project.data, [collection]: next });
  }
  const active = project.data.calls.find((call) => call.id === activeCall);
  return (
    <>
      <Heading
        eyebrow={
          ['shots', 'storyboard', 'mood', 'av', 'breakdown'].includes(section)
            ? 'PRE-PRODUCTION'
            : 'PRODUCTION'
        }
        title={section === 'storyboard' ? 'Storyboards' : definition.title}
        description={
          section === 'storyboard'
            ? 'Từ khung hình đầu tiên đến cú máy cuối cùng.'
            : definition.description
        }
      >
        <button
          className="ps-btn"
          disabled={!items.length}
          onClick={() =>
            download(
              csv(items),
              `${project.title}-${collection}.csv`,
              'text/csv;charset=utf-8',
            )
          }
        >
          <Download size={15} />
          Export
        </button>
        {section === 'assets' && (
          <>
            <input
              type="file"
              ref={upload}
              hidden
              accept="image/jpeg,image/png,image/webp,application/pdf,text/plain,video/mp4,audio/mpeg"
              onChange={(e) => void uploadFile(e)}
            />
            <button
              className="ps-btn"
              disabled={uploading || saving}
              onClick={() => upload.current?.click()}
            >
              {uploading ? (
                <LoaderCircle className="ps-spin" size={15} />
              ) : (
                <Upload size={15} />
              )}
              Upload file
            </button>
          </>
        )}
        <button
          className="ps-btn ps-primary"
          onClick={() => onEdit(collection)}
          disabled={saving}
        >
          <Plus size={16} />
          Thêm {definition.singular}
        </button>
      </Heading>
      <div className="ps-subtoolbar">
        <div className="ps-tools">
          <span className="ps-item-count">
            {items.length} {definition.singular}
          </span>
          {['breakdown', 'shots', 'storyboard'].includes(section) && (
            <select
              aria-label="Lọc theo cảnh"
              value={scene}
              onChange={(e) => setScene(e.target.value)}
            >
              <option value="all">Tất cả cảnh</option>
              {project.data.scenes.map((s) => (
                <option value={s.id} key={s.id}>
                  {s.number}. {s.heading}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="ps-tools">
          <label className="ps-search">
            <Search size={15} />
            <input
              aria-label={`Tìm ${definition.singular}`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm…"
            />
          </label>
          {['shots', 'contacts', 'mood', 'storyboard'].includes(section) && (
            <div className="ps-segmented">
              <button
                className={view === 'cards' ? 'active' : ''}
                aria-label="Xem thẻ"
                onClick={() => setView('cards')}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                className={view === 'table' ? 'active' : ''}
                aria-label="Xem bảng"
                onClick={() => setView('table')}
              >
                <List size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
      {fileLink && (
        <div className="ps-file-ready">
          <Check size={16} />
          Tệp đã sẵn sàng.
          <a href={fileLink} target="_blank" rel="noopener noreferrer">
            Mở / tải tệp
            <ExternalLink size={14} />
          </a>
          <button className="ps-icon" onClick={() => setFileLink('')}>
            ×
          </button>
        </div>
      )}
      {active && (
        <div className="ps-call-preview">
          <div className="ps-subtoolbar">
            <button className="ps-btn" onClick={() => setActiveCall(null)}>
              <ChevronLeft size={15} />
              Đóng preview
            </button>
            <button
              className="ps-btn ps-primary"
              onClick={() => window.print()}
            >
              <Printer size={15} />
              In / lưu PDF
            </button>
          </div>
          <CallSheet call={active} project={project} />
        </div>
      )}
      {!filtered.length ? (
        <Empty
          title={
            search
              ? 'Không có kết quả phù hợp'
              : `Chưa có ${definition.singular}`
          }
          description={search ? 'Thử từ khóa khác.' : definition.description}
          action={
            <button className="ps-btn" onClick={() => onEdit(collection)}>
              <Plus size={15} />
              Thêm {definition.singular}
            </button>
          }
        />
      ) : section === 'tasks' ? (
        <KanbanBoard
          project={project}
          tasks={items}
          filteredTasks={filtered}
          saving={saving}
          onSave={onSave}
          onEdit={onEdit}
          onRemove={onRemove}
          onNotice={onNotice}
        />
      ) : section === 'schedule' ? (
        <div className="ps-schedule">
          {filtered.map((day, index) => (
            <article key={day.id} className="ps-shoot-day">
              <header>
                <span className="ps-day-number">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3>{day.title}</h3>
                  <span>
                    <CalendarDays size={13} />
                    {day.date}
                    <MapPin size={13} />
                    {day.location || 'TBD'}
                  </span>
                </div>
                <div className="ps-tools">
                  <span className="ps-day-time">
                    {day.call || '—'} → {day.wrap || '—'}
                  </span>
                  <button
                    className="ps-icon"
                    disabled={saving || index === 0}
                    aria-label="Đưa ngày quay lên"
                    onClick={() => void move(day, -1)}
                  >
                    <ArrowUp size={15} />
                  </button>
                  <button
                    className="ps-icon"
                    disabled={saving || index === items.length - 1}
                    aria-label="Đưa ngày quay xuống"
                    onClick={() => void move(day, 1)}
                  >
                    <ArrowDown size={15} />
                  </button>
                  <button
                    className="ps-icon"
                    aria-label="Sửa ngày quay"
                    onClick={() => onEdit('schedule', day)}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    className="ps-icon"
                    aria-label="Xóa ngày quay"
                    onClick={() => onRemove('schedule', day)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </header>
              <div className="ps-stripboard">
                {(day.scenes || '')
                  .split(',')
                  .map((id) => project.data.scenes.find((s) => s.id === id))
                  .filter((s): s is Item => !!s)
                  .map((s) => (
                    <button
                      key={s.id}
                      className={`ps-scene-strip ${s.time === 'Night' ? 'night' : 'day'}`}
                      onClick={() => onEdit('scenes', s)}
                    >
                      <GripVertical size={14} />
                      <b>{s.number}</b>
                      <span>{s.heading}</span>
                      <small>{s.pages} pgs</small>
                      <em>
                        {s.intExt} / {s.time}
                      </em>
                    </button>
                  ))}
              </div>
              {day.notes && (
                <div className="ps-day-notes">
                  <Clock3 size={14} />
                  {day.notes}
                </div>
              )}
              <footer>
                <button
                  className="ps-btn ps-compact"
                  disabled={saving}
                  onClick={async () => {
                    const call = newItem({
                      title: day.title,
                      date: day.date,
                      call: day.call,
                      wrap: day.wrap,
                      location: day.location,
                      notes: day.notes,
                      hospital: '',
                      weather: '',
                    });
                    if (
                      await onSave({
                        ...project.data,
                        calls: [...project.data.calls, call],
                      })
                    ) {
                      props.onNavigate('calls');
                    }
                  }}
                >
                  <ClipboardList size={14} />
                  Tạo call sheet từ ngày quay
                  <ArrowRight size={14} />
                </button>
              </footer>
            </article>
          ))}
        </div>
      ) : section === 'calls' ? (
        <div className="ps-document-grid">
          {filtered.map((call) => (
            <article className="ps-call-card" key={call.id}>
              <span className="ps-paper-icon">
                <ClipboardList size={30} />
              </span>
              <span className="ps-phase">DRAFT</span>
              <h3>{call.title}</h3>
              <p>
                {call.date} · General call {call.call || 'TBD'}
              </p>
              <p>
                <MapPin size={14} />
                {call.location || 'Chưa chọn địa điểm'}
              </p>
              <div className="ps-tools">
                <button
                  className="ps-btn ps-primary"
                  onClick={() => setActiveCall(call.id)}
                >
                  Preview & PDF
                  <ArrowRight size={14} />
                </button>
                <button
                  className="ps-icon"
                  aria-label="Sửa call sheet"
                  onClick={() => onEdit('calls', call)}
                >
                  <Pencil size={15} />
                </button>
                <button
                  className="ps-icon"
                  aria-label="Xóa call sheet"
                  onClick={() => onRemove('calls', call)}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : section === 'av' ? (
        <div className="ps-av-script">
          <header>
            <span># / TIMING</span>
            <span>VIDEO</span>
            <span>AUDIO</span>
            <span />
          </header>
          {filtered.map((item, index) => (
            <div className="ps-av-row" key={item.id}>
              <span>
                <b>{String(index + 1).padStart(2, '0')}</b>
                <small>{item.duration || '0'} sec</small>
              </span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.video}</p>
              </div>
              <p>{item.audio || '—'}</p>
              <div>
                <button
                  className="ps-icon"
                  aria-label="Sửa AV script"
                  onClick={() => onEdit('av', item)}
                >
                  <Pencil size={14} />
                </button>
                <button
                  className="ps-icon"
                  aria-label="Xóa AV script"
                  onClick={() => onRemove('av', item)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          <footer>
            Total runtime:{' '}
            {items.reduce((n, i) => n + (Number(i.duration) || 0), 0)} seconds
          </footer>
        </div>
      ) : section === 'documents' ? (
        <div className="ps-document-grid">
          {filtered.map((item) => (
            <article className="ps-doc-card" key={item.id}>
              <FileText size={26} />
              <span className="ps-tool-meta">{item.category}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              <div className="ps-tools">
                <button
                  className="ps-btn"
                  onClick={() => onEdit('documents', item)}
                >
                  <Pencil size={14} />
                  Mở document
                </button>
                <button
                  className="ps-icon"
                  aria-label="Tải document"
                  onClick={() => download(item.body, item.title + '.txt')}
                >
                  <Download size={15} />
                </button>
                <button
                  className="ps-icon"
                  aria-label="Xóa document"
                  onClick={() => onRemove('documents', item)}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : section === 'assets' ? (
        <div className="ps-asset-list">
          {filtered.map((item) => (
            <div key={item.id}>
              <span className="ps-file-icon">
                <FileText size={22} />
              </span>
              <span>
                <strong>{item.title}</strong>
                <small>
                  {item.type}
                  {item.size
                    ? ` · ${(Number(item.size) / 1024 / 1024).toFixed(2)} MB`
                    : ''}
                  {item.path ? ' · Private file' : ' · External link'}
                </small>
              </span>
              <button className="ps-btn" onClick={() => void openAsset(item)}>
                <ExternalLink size={14} />
                Mở tệp
              </button>
              <button
                className="ps-icon"
                aria-label="Xóa tệp"
                onClick={() => onRemove('assets', item)}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      ) : (section === 'shots' ||
          section === 'storyboard' ||
          section === 'mood') &&
        view === 'cards' ? (
        <div
          className={`ps-story-grid ${section === 'mood' ? 'ps-mood-grid' : ''}`}
        >
          {filtered.map((item, index) => (
            <article className="ps-story-card" key={item.id}>
              <button
                className="ps-story-image"
                onClick={() => onEdit(collection, item)}
              >
                <Visual src={item.image || item.url} title={item.title} />
                <span className="ps-frame-number">
                  {item.number || String(index + 1).padStart(2, '0')}
                </span>
              </button>
              <div className="ps-story-body">
                <div>
                  <h3>{item.title}</h3>
                  <button
                    className="ps-icon"
                    aria-label="Sửa thẻ"
                    onClick={() => onEdit(collection, item)}
                  >
                    <Pencil size={14} />
                  </button>
                </div>
                <p>{item.description || item.notes}</p>
                {section !== 'mood' && (
                  <div className="ps-shot-specs">
                    <span>{item.size}</span>
                    <span>{item.lens || 'Lens TBD'}</span>
                    <span>{item.movement}</span>
                  </div>
                )}
                {section === 'mood' && (
                  <div className="ps-mood-palette">
                    {(item.palette || '')
                      .split(' ')
                      .filter((c) => /^#[a-f\d]{6}$/i.test(c))
                      .map((c) => (
                        <span key={c} style={{ background: c }} title={c} />
                      ))}
                  </div>
                )}
                <footer>
                  <span>
                    {item.scene
                      ? sceneLabel(project, item.scene)
                      : item.duration
                        ? `${item.duration}s`
                        : ''}
                  </span>
                  <div>
                    <button
                      className="ps-icon"
                      aria-label="Đưa thẻ lên"
                      disabled={saving || items.indexOf(item) === 0}
                      onClick={() => void move(item, -1)}
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      className="ps-icon"
                      aria-label="Đưa thẻ xuống"
                      disabled={
                        saving || items.indexOf(item) === items.length - 1
                      }
                      onClick={() => void move(item, 1)}
                    >
                      <ArrowDown size={13} />
                    </button>
                    <button
                      className="ps-icon"
                      aria-label="Xóa thẻ"
                      onClick={() => onRemove(collection, item)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </footer>
              </div>
            </article>
          ))}
        </div>
      ) : section === 'contacts' && view === 'cards' ? (
        <div className="ps-contact-grid">
          {filtered.map((person, index) => (
            <article key={person.id} className="ps-contact-card">
              <div className="ps-contact-top">
                <span className={`ps-person-avatar color-${index % 4}`}>
                  {person.name.slice(0, 1)}
                </span>
                <span className="ps-tool-meta">{person.department}</span>
                <button
                  className="ps-icon"
                  aria-label="Sửa liên hệ"
                  onClick={() => onEdit('contacts', person)}
                >
                  <Pencil size={15} />
                </button>
              </div>
              <h3>{person.name}</h3>
              <p>{person.role}</p>
              <div className="ps-contact-info">
                <span>{person.email || 'Chưa có email'}</span>
                <span>{person.phone || 'Chưa có số điện thoại'}</span>
              </div>
              <footer>
                <span>
                  Call time <b>{person.call || 'TBD'}</b>
                </span>
                <button
                  className="ps-icon"
                  aria-label="Xóa liên hệ"
                  onClick={() => onRemove('contacts', person)}
                >
                  <Trash2 size={14} />
                </button>
              </footer>
            </article>
          ))}
        </div>
      ) : (
        <DataTable
          collection={collection}
          project={project}
          items={filtered}
          onEdit={onEdit}
          onRemove={onRemove}
        />
      )}
      {section === 'calls' && (
        <p className="ps-capability-note">
          Bản nháp để in hoặc xuất PDF. Chưa kết nối gửi email/SMS và xác nhận
          từ người nhận.
        </p>
      )}
      {section === 'assets' && (
        <p className="ps-capability-note">
          Tệp riêng tư tối đa 20 MB. Liên kết ngoài giữ quyền truy cập theo dịch
          vụ nguồn.
        </p>
      )}
    </>
  );
}

function DataTable({
  collection,
  project,
  items,
  onEdit,
  onRemove,
}: {
  collection: Collection;
  project: Project;
  items: Item[];
  onEdit: Props['onEdit'];
  onRemove: Props['onRemove'];
}) {
  const fields = definitions[collection].fields
    .filter((f) => f.type !== 'textarea' && f.type !== 'url')
    .slice(0, 6);
  return (
    <div className="ps-table-wrap">
      <table className="ps-table">
        <thead>
          <tr>
            {fields.map((f) => (
              <th key={f.key}>{f.label}</th>
            ))}
            <th>
              <span className="sr-only">Thao tác</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              {fields.map((f, i) => (
                <td key={f.key}>
                  {f.key === 'scene' ? (
                    <span className="ps-scene-tag">
                      {sceneLabel(project, item.scene)}
                    </span>
                  ) : i === 0 ? (
                    <button
                      className="ps-table-title"
                      onClick={() => onEdit(collection, item)}
                    >
                      {item[f.key] || '—'}
                    </button>
                  ) : f.key === 'category' ||
                    f.key === 'status' ||
                    f.key === 'permit' ? (
                    <span
                      className={`ps-table-badge badge-${item[f.key]?.toLowerCase().replaceAll(' ', '-')}`}
                    >
                      {item[f.key] || '—'}
                    </span>
                  ) : (
                    item[f.key] || '—'
                  )}
                </td>
              ))}
              <td>
                <div className="ps-row-actions">
                  <button
                    className="ps-icon"
                    aria-label="Chỉnh sửa"
                    onClick={() => onEdit(collection, item)}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    className="ps-icon"
                    aria-label="Xóa"
                    onClick={() => onRemove(collection, item)}
                  >
                    <Trash2 size={14} />
                  </button>
                  {collection === 'locations' && item.address && (
                    <a
                      className="ps-icon"
                      aria-label="Xem bản đồ"
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.address)}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MapPin size={14} />
                    </a>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CallSheet({ call, project }: { call: Item; project: Project }) {
  const days = project.data.schedule.filter((d) => d.date === call.date);
  const scenes = days
    .flatMap((d) => (d.scenes || '').split(','))
    .map((id) => project.data.scenes.find((s) => s.id === id))
    .filter((s): s is Item => !!s);
  return (
    <div className="ps-print-area ps-call-paper">
      <header>
        <span>APEXA / PRODUCTION</span>
        <span>CALL SHEET · DRAFT</span>
      </header>
      <div className="ps-call-title">
        <div>
          <h1>{project.title}</h1>
          <h2>{call.title}</h2>
          <p>{call.date}</p>
        </div>
        <div>
          <span>GENERAL CALL</span>
          <strong>{call.call || 'TBD'}</strong>
          <small>Estimated wrap {call.wrap || 'TBD'}</small>
        </div>
      </div>
      <div className="ps-call-details">
        <div>
          <b>LOCATION</b>
          <p>{call.location || 'Chưa xác định'}</p>
        </div>
        <div>
          <b>WEATHER · MANUAL</b>
          <p>{call.weather || 'Chưa cập nhật'}</p>
        </div>
        <div>
          <b>EMERGENCY / HOSPITAL</b>
          <p>{call.hospital || 'Cần xác minh trước ngày quay'}</p>
        </div>
      </div>
      <h3>SHOOTING SCHEDULE</h3>
      <table>
        <thead>
          <tr>
            <th>SCENE</th>
            <th>DESCRIPTION</th>
            <th>I/E</th>
            <th>D/N</th>
            <th>PAGES</th>
          </tr>
        </thead>
        <tbody>
          {scenes.map((scene, index) => (
            <tr key={`${scene.id}-${index}`}>
              <td>{scene.number}</td>
              <td>{scene.heading}</td>
              <td>{scene.intExt}</td>
              <td>{scene.time}</td>
              <td>{scene.pages}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!scenes.length && <p>Chưa có cảnh trong lịch quay cùng ngày.</p>}
      <h3>CAST & CREW</h3>
      <table>
        <thead>
          <tr>
            <th>NAME</th>
            <th>ROLE</th>
            <th>PHONE</th>
            <th>CALL</th>
          </tr>
        </thead>
        <tbody>
          {project.data.contacts.map((person) => (
            <tr key={person.id}>
              <td>{person.name}</td>
              <td>{person.role}</td>
              <td>{person.phone || '—'}</td>
              <td>{person.call || call.call || 'TBD'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>PRODUCTION NOTES</h3>
      <p className="ps-preserve-lines">{call.notes || '—'}</p>
      <footer>PRIVATE PRODUCTION DOCUMENT · {project.title}</footer>
    </div>
  );
}

function Calendar({ project, onEdit }: Props) {
  const [month, setMonth] = useState(() => {
    const date = project.data.start || project.data.schedule[0]?.date;
    return date ? new Date(date + 'T12:00:00') : new Date();
  });
  const start = new Date(month.getFullYear(), month.getMonth(), 1);
  const offset = (start.getDay() + 6) % 7;
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const events: (Item & {
    eventType: 'schedule' | 'tasks';
    eventDate: string;
  })[] = [
    ...project.data.schedule.map((d) => ({
      ...d,
      eventType: 'schedule' as const,
      eventDate: d.date,
    })),
    ...project.data.tasks
      .filter((t) => t.due)
      .map((t) => ({ ...t, eventType: 'tasks' as const, eventDate: t.due })),
  ];
  return (
    <>
      <Heading
        eyebrow="PLAN"
        title="Production calendar"
        description="Lịch quay và deadline, cùng một góc nhìn."
      >
        <button
          className="ps-btn ps-primary"
          onClick={() => onEdit('schedule')}
        >
          <Plus size={16} />
          Thêm ngày quay
        </button>
      </Heading>
      <div className="ps-subtoolbar">
        <h2>
          {month.toLocaleDateString('vi-VN', {
            month: 'long',
            year: 'numeric',
          })}
        </h2>
        <div className="ps-tools">
          <span className="ps-calendar-legend">
            <i />
            Shoot day <i />
            Task due
          </span>
          <button
            className="ps-icon"
            aria-label="Tháng trước"
            onClick={() =>
              setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
            }
          >
            <ChevronLeft size={18} />
          </button>
          <button
            className="ps-btn ps-compact"
            onClick={() => setMonth(new Date())}
          >
            Hôm nay
          </button>
          <button
            className="ps-icon"
            aria-label="Tháng sau"
            onClick={() =>
              setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
            }
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div className="ps-calendar">
        <div className="ps-calendar-weekdays">
          {[
            'Thứ 2',
            'Thứ 3',
            'Thứ 4',
            'Thứ 5',
            'Thứ 6',
            'Thứ 7',
            'Chủ nhật',
          ].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="ps-calendar-days">
          {Array.from(
            { length: Math.ceil((offset + days) / 7) * 7 },
            (_, index) => {
              const day = index - offset + 1;
              const valid = day > 0 && day <= days;
              const key = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              return (
                <div key={index} className={!valid ? 'ps-calendar-muted' : ''}>
                  {valid && (
                    <>
                      <span>{day}</span>
                      {events
                        .filter((e) => e.eventDate === key)
                        .map((e) => (
                          <button
                            key={e.id}
                            className={`ps-calendar-event ${e.eventType}`}
                            onClick={() => onEdit(e.eventType, e)}
                          >
                            {e.title}
                          </button>
                        ))}
                    </>
                  )}
                </div>
              );
            },
          )}
        </div>
      </div>
    </>
  );
}

function Reports({ project }: Props) {
  const [report, setReport] = useState<Collection>('scenes');
  const [scene, setScene] = useState('all');
  const rows = project.data[report].filter(
    (item) => scene === 'all' || item.id === scene || item.scene === scene,
  );
  return (
    <>
      <Heading
        eyebrow="PRODUCTION REPORTS"
        title="Ready for the crew"
        description="Tổng hợp dữ liệu project thành tài liệu dễ mang theo."
      >
        <button
          className="ps-btn"
          onClick={() =>
            download(
              JSON.stringify(project, null, 2),
              project.title + '-project.json',
              'application/json',
            )
          }
        >
          <Download size={15} />
          Project backup
        </button>
        <button className="ps-btn ps-primary" onClick={() => window.print()}>
          <Printer size={15} />
          In / lưu PDF
        </button>
      </Heading>
      <div className="ps-report-options">
        {(
          [
            'scenes',
            'breakdown',
            'shots',
            'schedule',
            'contacts',
            'tasks',
          ] as Collection[]
        ).map((key) => (
          <button
            key={key}
            className={report === key ? 'active' : ''}
            onClick={() => {
              setReport(key);
              setScene('all');
            }}
          >
            <FileText size={20} />
            <span>{definitions[key].title}</span>
            <small>{project.data[key].length} entries</small>
          </button>
        ))}
      </div>
      <div className="ps-subtoolbar">
        <select
          aria-label="Lọc báo cáo theo cảnh"
          value={scene}
          onChange={(e) => setScene(e.target.value)}
          disabled={!['scenes', 'shots', 'breakdown'].includes(report)}
        >
          <option value="all">Tất cả cảnh</option>
          {project.data.scenes.map((s) => (
            <option value={s.id} key={s.id}>
              {s.number}. {s.heading}
            </option>
          ))}
        </select>
        <button
          className="ps-btn"
          onClick={() =>
            download(
              csv(rows),
              `${project.title}-${report}.csv`,
              'text/csv;charset=utf-8',
            )
          }
        >
          <Download size={15} />
          CSV
        </button>
      </div>
      <div className="ps-print-area ps-report-paper">
        <span className="ps-eyebrow">APEXA / PRODUCTION REPORT</span>
        <h2>{project.title}</h2>
        <h3>{definitions[report].title}</h3>
        <table>
          <thead>
            <tr>
              {definitions[report].fields.slice(0, 5).map((f) => (
                <th key={f.key}>{f.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                {definitions[report].fields.slice(0, 5).map((f) => (
                  <td key={f.key}>
                    {f.key === 'scene'
                      ? sceneLabel(project, row.scene)
                      : row[f.key] || '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {report === 'scenes' &&
          rows.map((row) => (
            <div className="ps-script-side" key={row.id}>
              <h3>{row.heading}</h3>
              <p>{row.synopsis}</p>
            </div>
          ))}
      </div>
    </>
  );
}

function Settings({ project, onSave, saving, onDuplicate }: Props) {
  const [title, setTitle] = useState(project.title);
  const [data, setData] = useState(project.data);
  const [error, setError] = useState('');
  return (
    <>
      <Heading
        eyebrow="PROJECT"
        title="Project settings"
        description="Những thông tin định hình production."
      />
      <form
        className="ps-settings-form"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!title.trim()) {
            setError('Tên project không được để trống.');
            return;
          }
          if (data.start && data.end && data.end < data.start) {
            setError('Ngày kết thúc cần sau ngày bắt đầu.');
            return;
          }
          setError('');
          await onSave(data, title.trim());
        }}
      >
        <div className="ps-form-grid">
          <label className="ps-field ps-span-2">
            Tên project
            <input
              required
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label className="ps-field">
            Loại
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
            Mô tả
            <textarea
              rows={5}
              maxLength={2000}
              value={data.description}
              onChange={(e) =>
                setData({ ...data, description: e.target.value })
              }
            />
          </label>
        </div>
        {error && (
          <p className="ps-form-error" role="alert">
            {error}
          </p>
        )}
        <button className="ps-btn ps-primary" disabled={saving}>
          <Save size={16} />
          Lưu thông tin
        </button>
      </form>
      <div className="ps-settings-operations">
        <div>
          <h3>Nhân bản project</h3>
          <p>
            Sao chép kế hoạch thành project mới. Tệp riêng tư cần được tải lại.
          </p>
        </div>
        <button className="ps-btn" disabled={saving} onClick={onDuplicate}>
          <Copy size={15} />
          Duplicate
        </button>
      </div>
      <div className="ps-settings-operations">
        <div>
          <h3>
            {project.data.archived ? 'Khôi phục project' : 'Lưu trữ project'}
          </h3>
          <p>Giữ nguyên dữ liệu và chuyển project vào mục Archived.</p>
        </div>
        <button
          className="ps-btn"
          disabled={saving}
          onClick={async () => {
            const archived = !project.data.archived;
            if (await onSave({ ...project.data, archived }))
              setData((current) => ({ ...current, archived }));
          }}
        >
          <Archive size={15} />
          {project.data.archived ? 'Restore' : 'Archive'}
        </button>
      </div>
    </>
  );
}
