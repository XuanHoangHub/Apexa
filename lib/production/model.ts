export type Item = { id: string; [key: string]: string };
export const collections = [
  'scenes',
  'breakdown',
  'shots',
  'schedule',
  'calls',
  'tasks',
  'contacts',
  'locations',
  'assets',
  'documents',
  'av',
  'mood',
  'versions',
] as const;
export type Collection = (typeof collections)[number];
export type ProjectData = Record<Collection, Item[]> & {
  description: string;
  type: string;
  phase: string;
  start: string;
  end: string;
  color: string;
  script: string;
  archived: boolean;
  taskColumns?: Item[];
};
export type Project = {
  id: string;
  title: string;
  data: ProjectData;
  revision: number;
  updated_at: string;
  created_at: string;
  owner_id?: string;
};
export type Section =
  | 'overview'
  | Collection
  | 'storyboard'
  | 'calendar'
  | 'reports'
  | 'settings';
export const phases = [
  'Development',
  'Pre-production',
  'Production',
  'Post-production',
  'Completed',
];
export const projectTypes = [
  'Short film',
  'Feature film',
  'Commercial',
  'Music video',
  'Documentary',
  'Series',
  'Photoshoot',
];
export const colors = ['#76e4ef', '#e8b97a', '#b7a0e6', '#93c8aa', '#e8959b'];
export const defaultTaskColumns: Item[] = [
  { id: 'col-backlog', name: 'Backlog', order: '0', color: '#819bb0' },
  { id: 'col-planning', name: 'Planning', order: '1', color: '#76e4ef' },
  { id: 'col-in-progress', name: 'In progress', order: '2', color: '#d5b576' },
  { id: 'col-review', name: 'Review', order: '3', color: '#b7a0e6' },
  { id: 'col-done', name: 'Done', order: '4', color: '#8fc8aa' },
];
export function emptyData(): ProjectData {
  return {
    scenes: [],
    breakdown: [],
    shots: [],
    schedule: [],
    calls: [],
    tasks: [],
    contacts: [],
    locations: [],
    assets: [],
    documents: [],
    av: [],
    mood: [],
    versions: [],
    taskColumns: defaultTaskColumns.map((c) => ({ ...c })),
    description: '',
    type: 'Short film',
    phase: 'Development',
    start: '',
    end: '',
    color: colors[0],
    script: '',
    archived: false,
  };
}
export function newItem(values: Record<string, string> = {}): Item {
  return { ...values, id: crypto.randomUUID() };
}
export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function normalizeData(value: unknown): ProjectData {
  const output = emptyData();
  if (!value || typeof value !== 'object' || Array.isArray(value))
    return output;
  const data = value as Record<string, unknown>;
  for (const key of collections) {
    if (Array.isArray(data[key]))
      output[key] = data[key].filter(
        (item): item is Item =>
          !!item &&
          typeof item === 'object' &&
          typeof item.id === 'string' &&
          Object.values(item).every((v) => typeof v === 'string'),
      );
  }
  if (Array.isArray(data.taskColumns)) {
    output.taskColumns = data.taskColumns.filter(
      (item): item is Item =>
        !!item &&
        typeof item === 'object' &&
        typeof item.id === 'string' &&
        Object.values(item).every((v) => typeof v === 'string'),
    );
  } else {
    output.taskColumns = defaultTaskColumns.map((c) => ({ ...c }));
  }
  for (const key of [
    'description',
    'type',
    'phase',
    'start',
    'end',
    'script',
  ] as const)
    if (typeof data[key] === 'string') output[key] = data[key];
  if (typeof data.color === 'string' && /^#[a-f0-9]{6}$/i.test(data.color))
    output.color = data.color;
  output.archived = data.archived === true;
  return output;
}
export function mergeScenes(existing: Item[], parsed: Item[]) {
  const output = [...existing];
  const used = new Set<string>();
  for (const scene of parsed) {
    const match = existing.find(
      (item) => item.heading === scene.heading && !used.has(item.id),
    );
    if (match) used.add(match.id);
    else output.push(scene);
  }
  return output;
}
export function reportItems(project: Project, items: Item[]) {
  return items.map((item) => ({
    ...item,
    ...('scene' in item ? { scene: sceneLabel(project, item.scene) } : {}),
    ...('scenes' in item
      ? {
          scenes: item.scenes
            .split(',')
            .filter(Boolean)
            .map((id) => sceneLabel(project, id))
            .join('; '),
        }
      : {}),
  }));
}
export function parseScenes(script: string): Item[] {
  const chunks = script
    .replace(/\r\n/g, '\n')
    .split(/^(?=(?:INT\.?\s*\/\s*EXT\.?|INT\.?|EXT\.?|I\/E\.?)\s)/im);
  return chunks
    .filter((chunk) =>
      /^(?:INT\.?\s*\/\s*EXT\.?|INT\.?|EXT\.?|I\/E\.?)\s/i.test(chunk.trim()),
    )
    .map((chunk, index) => {
      const [heading, ...body] = chunk.trim().split('\n');
      return newItem({
        number: String(index + 1),
        heading,
        synopsis: body.join('\n').trim(),
        time: /\bNIGHT\b/i.test(heading) ? 'Night' : 'Day',
        intExt: /^EXT/i.test(heading) ? 'EXT' : 'INT',
        location: heading
          .replace(/^(?:INT\.?\s*\/\s*EXT\.?|INT\.?|EXT\.?|I\/E\.?)\s*/i, '')
          .replace(/\s+-\s+.*$/, ''),
        pages: '1',
        status: 'To shoot',
      });
    });
}
export function sceneLabel(project: Project, id: string) {
  const scene = project.data.scenes.find((item) => item.id === id);
  return scene ? `${scene.number}. ${scene.heading}` : 'Chưa gắn cảnh';
}
export function safeUrl(value: string) {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}
export function csv(items: Item[]) {
  const keys = [...new Set(items.flatMap((item) => Object.keys(item)))].filter(
    (key) => key !== 'id',
  );
  const cell = (value: string) =>
    '"' +
    (/^[=+@\-\t\r]/.test(value) ? "'" + value : value).replaceAll('"', '""') +
    '"';
  return (
    '\uFEFF' +
    [keys, ...items.map((item) => keys.map((key) => item[key] ?? ''))]
      .map((row) => row.map(cell).join(','))
      .join('\r\n')
  );
}
export function download(content: string, name: string, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export const demo: Project = {
  id: 'demo',
  title: 'The quiet between',
  revision: 1,
  created_at: '2026-09-07T00:00:00Z',
  updated_at: '2026-09-07T00:00:00Z',
  data: {
    ...emptyData(),
    type: 'Short film',
    phase: 'Pre-production',
    start: '2026-09-14',
    end: '2026-09-25',
    color: colors[0],
    description:
      'Một hành trình đi tìm sự tĩnh lặng giữa những chuyển động của thành phố. Phim ngắn, 8 phút.',
    script:
      'Title: THE QUIET BETWEEN\nCredit: An Apexa sample production\n\nEXT. SAND DUNES - DAY\n\nThe first light sweeps across the sand. AN walks alone, a small camera in hand.\n\nAN\nCó những nơi, im lặng cũng có tiếng nói.\n\nINT. APARTMENT - NIGHT\n\nCity light spills through the window. An studies a photograph on the table.\n\nEXT. ROOFTOP - DAY\n\nThe city wakes. An raises the camera, finally ready to look again.',
    scenes: [
      {
        id: 's1',
        number: '1',
        heading: 'EXT. SAND DUNES - DAY',
        intExt: 'EXT',
        time: 'Day',
        location: 'Sand dunes',
        pages: '2',
        synopsis: 'An đi qua đồi cát lúc bình minh.',
        status: 'To shoot',
      },
      {
        id: 's2',
        number: '2',
        heading: 'INT. APARTMENT - NIGHT',
        intExt: 'INT',
        time: 'Night',
        location: 'Apartment',
        pages: '3',
        synopsis: 'Một bức ảnh cũ gợi lại ký ức.',
        status: 'To shoot',
      },
      {
        id: 's3',
        number: '3',
        heading: 'EXT. ROOFTOP - DAY',
        intExt: 'EXT',
        time: 'Day',
        location: 'Rooftop',
        pages: '1',
        synopsis: 'An tìm thấy một góc nhìn mới.',
        status: 'To shoot',
      },
    ],
    shots: [
      {
        id: 'sh1',
        scene: 's1',
        number: '1A',
        title: 'The first light',
        description:
          'Đường chân trời và những đồi cát. An bước vào khung hình.',
        size: 'Wide',
        angle: 'Eye level',
        movement: 'Static',
        lens: '24mm',
        duration: '12',
        status: 'Planned',
        image:
          'https://images.unsplash.com/photo-1564107628966-daff03746bee?auto=format&fit=crop&w=900&q=85',
      },
      {
        id: 'sh2',
        scene: 's1',
        number: '1B',
        title: 'A moment of stillness',
        description: 'Cận cảnh An, gió lùa qua tóc.',
        size: 'Close-up',
        angle: 'Eye level',
        movement: 'Dolly in',
        lens: '85mm',
        duration: '8',
        status: 'Planned',
        image:
          'https://images.unsplash.com/photo-1742163512400-7af30b2d17cc?auto=format&fit=crop&w=900&q=85',
      },
      {
        id: 'sh3',
        scene: 's3',
        number: '3A',
        title: 'The city wakes',
        description: 'Kiến trúc và chuyển động của thành phố.',
        size: 'Wide',
        angle: 'Low angle',
        movement: 'Pan',
        lens: '35mm',
        duration: '10',
        status: 'Planned',
        image:
          'https://images.unsplash.com/photo-1515986503437-c617811ba008?auto=format&fit=crop&w=900&q=85',
      },
    ],
    taskColumns: defaultTaskColumns.map((c) => ({ ...c })),
    tasks: [
      {
        id: 't1',
        title: 'Chốt kịch bản shooting draft',
        status: 'Done',
        columnId: 'col-done',
        order: '0',
        priority: 'High',
        assignee: 'Linh',
        due: '2026-09-10',
        notes: 'Kiểm tra lại scene headings.',
      },
      {
        id: 't2',
        title: 'Location scout · Đồi cát',
        status: 'In progress',
        columnId: 'col-in-progress',
        order: '0',
        priority: 'High',
        assignee: 'Minh',
        due: '2026-09-12',
        notes: 'Chụp reference lúc 5:30 sáng.',
      },
      {
        id: 't3',
        title: 'Hoàn thiện shot list',
        status: 'Planning',
        columnId: 'col-planning',
        order: '0',
        priority: 'Medium',
        assignee: 'Linh',
        due: '2026-09-13',
        notes: '',
      },
      {
        id: 't4',
        title: 'Kiểm tra camera & lenses',
        status: 'Backlog',
        columnId: 'col-backlog',
        order: '0',
        priority: 'Medium',
        assignee: 'Huy',
        due: '2026-09-14',
        notes: '',
      },
    ],
    contacts: [
      {
        id: 'c1',
        name: 'Linh Nguyễn',
        role: 'Director',
        department: 'Direction',
        email: '',
        phone: '',
        call: '05:00',
        notes: 'Liên hệ mẫu',
      },
      {
        id: 'c2',
        name: 'Minh Trần',
        role: 'Producer',
        department: 'Production',
        email: '',
        phone: '',
        call: '04:30',
        notes: 'Liên hệ mẫu',
      },
      {
        id: 'c3',
        name: 'Huy Lê',
        role: 'Cinematographer',
        department: 'Camera',
        email: '',
        phone: '',
        call: '05:00',
        notes: 'Liên hệ mẫu',
      },
    ],
    schedule: [
      {
        id: 'd1',
        title: 'Day 01 · First light',
        date: '2026-09-16',
        call: '05:00',
        wrap: '12:00',
        scenes: 's1,s3',
        location: 'Sand dunes',
        notes: '06:30 breakfast • 09:00 company move',
      },
      {
        id: 'd2',
        title: 'Day 02 · After hours',
        date: '2026-09-17',
        call: '17:00',
        wrap: '23:00',
        scenes: 's2',
        location: 'Apartment',
        notes: '19:00 dinner',
      },
    ],
    breakdown: [
      {
        id: 'b1',
        scene: 's1',
        title: 'An',
        category: 'Cast',
        quantity: '1',
        notes: 'Vai chính',
      },
      {
        id: 'b2',
        scene: 's1',
        title: 'Máy ảnh film',
        category: 'Props',
        quantity: '1',
        notes: 'Có dây đeo',
      },
      {
        id: 'b3',
        scene: 's2',
        title: 'Bức ảnh cũ',
        category: 'Props',
        quantity: '1',
        notes: '',
      },
      {
        id: 'b4',
        scene: 's1',
        title: 'Áo linen',
        category: 'Wardrobe',
        quantity: '2',
        notes: 'Một bộ dự phòng',
      },
    ],
    locations: [
      {
        id: 'l1',
        name: 'Sand dunes',
        address: 'Mũi Né, Bình Thuận',
        contact: '',
        permit: 'Pending',
        notes: 'Địa điểm minh họa; cần xác minh và xin phép trước khi quay.',
      },
      {
        id: 'l2',
        name: 'Apartment',
        address: 'Thảo Điền, TP. Hồ Chí Minh',
        contact: '',
        permit: 'Pending',
        notes: 'Khảo sát tiếng ồn và nguồn điện.',
      },
    ],
    documents: [
      {
        id: 'doc1',
        title: 'Director’s treatment',
        category: 'Creative',
        body: 'Một bộ phim về khoảng dừng.\n\nHình ảnh ít chuyển động, ánh sáng tự nhiên, nhịp cắt chậm. Màu cát ấm đối lập ánh đèn thành phố lạnh.',
      },
    ],
    mood: [
      {
        id: 'm1',
        title: 'Stillness & scale',
        url: 'https://images.unsplash.com/photo-1564107628966-daff03746bee?auto=format&fit=crop&w=900&q=85',
        notes: 'Ánh sáng tự nhiên, bố cục tối giản. Martin Sanchez / Unsplash.',
        palette: '#d2a77e #6f594a #c4d9dd',
      },
    ],
  },
};
