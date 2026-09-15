import type { Collection } from './model';
export type Field = {
  key: string;
  label: string;
  type?: 'textarea' | 'date' | 'time' | 'number' | 'email' | 'url';
  options?: string[];
  required?: boolean;
};
const field = (
  key: string,
  label: string,
  extra: Partial<Field> = {},
): Field => ({ key, label, ...extra });
export const definitions: Record<
  Collection,
  { title: string; singular: string; description: string; fields: Field[] }
> = {
  scenes: {
    title: 'Scenes',
    singular: 'cảnh',
    description: 'Từng cảnh quay, trong một mạch chuyện.',
    fields: [
      field('number', 'Số cảnh', { required: true }),
      field('heading', 'Scene heading', { required: true }),
      field('intExt', 'Bối cảnh', { options: ['INT', 'EXT', 'INT/EXT'] }),
      field('time', 'Thời điểm', { options: ['Day', 'Night', 'Dawn', 'Dusk'] }),
      field('location', 'Địa điểm'),
      field('pages', 'Số trang', { type: 'number' }),
      field('synopsis', 'Nội dung', { type: 'textarea' }),
      field('status', 'Trạng thái', { options: ['To shoot', 'Shot'] }),
    ],
  },
  breakdown: {
    title: 'Script breakdown',
    singular: 'yếu tố',
    description: 'Bóc tách những gì cần có trước khi máy quay chạy.',
    fields: [
      field('scene', 'Cảnh'),
      field('title', 'Tên yếu tố', { required: true }),
      field('category', 'Phân loại', {
        options: [
          'Cast',
          'Props',
          'Wardrobe',
          'Set dressing',
          'Vehicles',
          'Sound',
          'VFX',
          'Equipment',
          'Makeup',
          'Animals',
          'Stunts',
          'Extras',
        ],
      }),
      field('quantity', 'Số lượng', { type: 'number' }),
      field('notes', 'Ghi chú', { type: 'textarea' }),
    ],
  },
  shots: {
    title: 'Shot list',
    singular: 'shot',
    description: 'Mọi góc máy đều có chủ đích.',
    fields: [
      field('scene', 'Cảnh'),
      field('number', 'Shot #', { required: true }),
      field('title', 'Tên shot', { required: true }),
      field('description', 'Mô tả hành động', { type: 'textarea' }),
      field('size', 'Cỡ cảnh', {
        options: [
          'Extreme wide',
          'Wide',
          'Medium',
          'Close-up',
          'Extreme close-up',
          'Insert',
        ],
      }),
      field('angle', 'Góc máy', {
        options: [
          'Eye level',
          'Low angle',
          'High angle',
          'Overhead',
          'Dutch angle',
          'POV',
        ],
      }),
      field('movement', 'Chuyển động', {
        options: [
          'Static',
          'Pan',
          'Tilt',
          'Dolly in',
          'Dolly out',
          'Tracking',
          'Handheld',
          'Crane',
        ],
      }),
      field('lens', 'Lens'),
      field('duration', 'Thời lượng (giây)', { type: 'number' }),
      field('image', 'URL ảnh storyboard', { type: 'url' }),
      field('status', 'Trạng thái', { options: ['Planned', 'Ready', 'Shot'] }),
    ],
  },
  schedule: {
    title: 'Shooting schedule',
    singular: 'ngày quay',
    description: 'Từ kịch bản đến một lịch quay khả thi.',
    fields: [
      field('title', 'Tên ngày quay', { required: true }),
      field('date', 'Ngày', { type: 'date', required: true }),
      field('call', 'Crew call', { type: 'time' }),
      field('wrap', 'Wrap dự kiến', { type: 'time' }),
      field('scenes', 'Các cảnh'),
      field('location', 'Địa điểm'),
      field('notes', 'Meal breaks, company moves & ghi chú', {
        type: 'textarea',
      }),
    ],
  },
  calls: {
    title: 'Call sheets',
    singular: 'call sheet',
    description: 'Một bản kế hoạch rõ ràng cho cả ngày quay.',
    fields: [
      field('title', 'Tiêu đề', { required: true }),
      field('date', 'Ngày quay', { type: 'date', required: true }),
      field('call', 'General call', { type: 'time' }),
      field('wrap', 'Wrap', { type: 'time' }),
      field('location', 'Địa điểm & địa chỉ'),
      field('hospital', 'Bệnh viện gần nhất / số khẩn cấp'),
      field('weather', 'Dự báo thời tiết (tự nhập)'),
      field('notes', 'Lưu ý sản xuất', { type: 'textarea' }),
    ],
  },
  tasks: {
    title: 'Task board',
    singular: 'công việc',
    description: 'Rõ người phụ trách. Rõ bước tiếp theo.',
    fields: [
      field('title', 'Công việc', { required: true }),
      field('status', 'Trạng thái', {
        options: ['Backlog', 'Planning', 'In progress', 'Review', 'Done'],
      }),
      field('priority', 'Ưu tiên', { options: ['Low', 'Medium', 'High'] }),
      field('assignee', 'Người phụ trách'),
      field('due', 'Hạn hoàn thành', { type: 'date' }),
      field('notes', 'Checklist / ghi chú', { type: 'textarea' }),
    ],
  },
  contacts: {
    title: 'Cast & crew',
    singular: 'liên hệ',
    description: 'Những người biến ý tưởng thành thước phim.',
    fields: [
      field('name', 'Họ tên', { required: true }),
      field('role', 'Vai trò / nhân vật'),
      field('department', 'Bộ phận', {
        options: [
          'Cast',
          'Direction',
          'Production',
          'Camera',
          'Art',
          'Sound',
          'Lighting',
          'Makeup',
          'Wardrobe',
          'Post-production',
        ],
      }),
      field('email', 'Email', { type: 'email' }),
      field('phone', 'Số điện thoại'),
      field('call', 'Call time', { type: 'time' }),
      field('notes', 'Ghi chú riêng', { type: 'textarea' }),
    ],
  },
  locations: {
    title: 'Locations',
    singular: 'địa điểm',
    description: 'Tìm đúng không gian cho câu chuyện.',
    fields: [
      field('name', 'Tên địa điểm', { required: true }),
      field('address', 'Địa chỉ'),
      field('contact', 'Người liên hệ / điện thoại'),
      field('permit', 'Giấy phép', {
        options: ['Pending', 'Approved', 'Not required'],
      }),
      field('notes', 'Khảo sát, điện, âm thanh, đỗ xe', { type: 'textarea' }),
    ],
  },
  assets: {
    title: 'Media library',
    singular: 'tài liệu',
    description: 'Reference và tài liệu sản xuất, đúng nơi cần tìm.',
    fields: [
      field('title', 'Tên tài liệu', { required: true }),
      field('url', 'Liên kết', { type: 'url', required: true }),
      field('type', 'Loại', {
        options: ['Reference', 'Image', 'Video', 'Audio', 'Document'],
      }),
      field('notes', 'Ghi chú', { type: 'textarea' }),
    ],
  },
  documents: {
    title: 'Production docs',
    singular: 'document',
    description: 'Treatment, production notes và mọi chi tiết quan trọng.',
    fields: [
      field('title', 'Tiêu đề', { required: true }),
      field('category', 'Loại', {
        options: ['Creative', 'Production', 'Legal', 'Notes'],
      }),
      field('body', 'Nội dung', { type: 'textarea', required: true }),
    ],
  },
  av: {
    title: 'AV script',
    singular: 'phân đoạn',
    description: 'Hình ảnh và âm thanh, cùng một nhịp.',
    fields: [
      field('title', 'Phân đoạn', { required: true }),
      field('video', 'VIDEO — hình ảnh', { type: 'textarea', required: true }),
      field('audio', 'AUDIO — thoại / âm thanh', { type: 'textarea' }),
      field('duration', 'Thời lượng (giây)', { type: 'number' }),
    ],
  },
  mood: {
    title: 'Mood boards',
    singular: 'reference',
    description: 'Ngôn ngữ hình ảnh cho toàn bộ production.',
    fields: [
      field('title', 'Tiêu đề', { required: true }),
      field('url', 'URL hình ảnh', { type: 'url', required: true }),
      field('notes', 'Art direction / nguồn ảnh', { type: 'textarea' }),
      field('palette', 'Bảng màu / từ khóa'),
    ],
  },
  versions: {
    title: 'Script versions',
    singular: 'version',
    description: 'Lưu lại từng bước phát triển của kịch bản.',
    fields: [
      field('title', 'Tên phiên bản', { required: true }),
      field('body', 'Kịch bản', { type: 'textarea' }),
    ],
  },
};
