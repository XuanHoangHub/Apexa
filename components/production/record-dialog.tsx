'use client';
import { useState, type SubmitEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { definitions, type Field } from '@/lib/production/fields';
import {
  newItem,
  type Collection,
  type Item,
  type Project,
} from '@/lib/production/model';
import { LoaderCircle, Check } from 'lucide-react';

export default function RecordDialog({
  collection,
  item,
  project,
  onClose,
  onSave,
}: {
  collection: Collection;
  item?: Item;
  project: Project;
  onClose: () => void;
  onSave: (item: Item) => Promise<boolean>;
}) {
  const definition = definitions[collection];
  const [values, setValues] = useState<Item>(
    () =>
      item ??
      newItem(
        Object.fromEntries(
          definition.fields.map((f) => [f.key, f.options?.[0] ?? '']),
        ),
      ),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  function set(key: string, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }
  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (definition.fields.some((f) => f.required && !values[f.key]?.trim())) {
      setError('Vui lòng điền các trường bắt buộc.');
      return;
    }
    if (
      collection === 'schedule' &&
      values.wrap &&
      values.call &&
      values.wrap <= values.call
    ) {
      setError(
        'Giờ wrap cần sau giờ call. Với lịch qua đêm, tách thành ngày quay tiếp theo.',
      );
      return;
    }
    const itemToSave = { ...values };
    if (collection === 'tasks' && project.data.taskColumns?.length) {
      const col = project.data.taskColumns.find(
        (c) => c.name.toLowerCase() === (itemToSave.status ?? '').toLowerCase(),
      );
      if (col) {
        itemToSave.columnId = col.id;
      }
    }
    setBusy(true);
    try {
      if (await onSave(itemToSave)) onClose();
      else setError('Chưa lưu được. Kiểm tra thông báo kết nối và thử lại.');
    } finally {
      setBusy(false);
    }
  }
  function control(f: Field) {
    const props = {
      id: `record-${f.key}`,
      value: values[f.key] ?? '',
      required: f.required,
      onChange: (
        e: React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
      ) => set(f.key, e.target.value),
    };
    if (f.key === 'scene')
      return (
        <select {...props}>
          <option value="">Chọn cảnh</option>
          {project.data.scenes.map((scene) => (
            <option key={scene.id} value={scene.id}>
              {scene.number}. {scene.heading}
            </option>
          ))}
        </select>
      );
    if (f.key === 'scenes')
      return (
        <div className="ps-scene-picks">
          {project.data.scenes.length === 0 && (
            <span>Thêm cảnh trong Screenplay trước.</span>
          )}
          {project.data.scenes.map((scene) => (
            <label key={scene.id}>
              <input
                type="checkbox"
                checked={(values.scenes ?? '').split(',').includes(scene.id)}
                onChange={(e) => {
                  const ids = (values.scenes ?? '').split(',').filter(Boolean);
                  set(
                    'scenes',
                    (e.target.checked
                      ? [...ids, scene.id]
                      : ids.filter((id) => id !== scene.id)
                    ).join(','),
                  );
                }}
              />
              {scene.number}. {scene.heading}
            </label>
          ))}
        </div>
      );
    if (f.options || (collection === 'tasks' && f.key === 'status')) {
      const options =
        collection === 'tasks' &&
        f.key === 'status' &&
        project.data.taskColumns?.length
          ? [
              ...new Set([
                ...project.data.taskColumns.map((c) => c.name),
                ...(values.status ? [values.status] : []),
              ]),
            ]
          : (f.options ?? []);
      return (
        <select {...props}>
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      );
    }
    if (f.type === 'textarea')
      return (
        <textarea
          {...props}
          rows={f.key === 'body' ? 12 : 4}
          maxLength={100000}
        />
      );
    return (
      <input
        {...props}
        type={f.type ?? 'text'}
        min={f.type === 'number' ? '0' : undefined}
        step={f.type === 'number' ? 'any' : undefined}
        maxLength={500}
      />
    );
  }
  return (
    <Dialog open onOpenChange={(open) => !open && !busy && onClose()}>
      <DialogContent className="ps-dialog">
        <DialogTitle>
          {item ? 'Chỉnh sửa' : 'Thêm'} {definition.singular}
        </DialogTitle>
        <DialogDescription>{definition.description}</DialogDescription>
        <form onSubmit={submit}>
          <fieldset disabled={busy} className="ps-form-grid">
            {definition.fields.map((f) => (
              <div
                key={f.key}
                className={`ps-field ${f.type === 'textarea' || f.key === 'scenes' ? 'ps-span-2' : ''}`}
              >
                <label htmlFor={`record-${f.key}`}>
                  {f.label}
                  {f.required && ' *'}
                </label>
                {control(f)}
              </div>
            ))}
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
                <Check size={16} />
              )}
              Lưu thay đổi
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
