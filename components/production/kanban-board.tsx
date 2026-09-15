'use client';

import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type KeyboardEvent,
} from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  CalendarDays,
  GripVertical,
  MoreHorizontal,
  Copy,
  ArrowLeft,
  ArrowRight,
  Check,
  X,
} from 'lucide-react';
import {
  defaultTaskColumns,
  newItem,
  type Item,
  type Project,
  type ProjectData,
} from '@/lib/production/model';

const PRESET_COLORS = [
  { label: 'Slate', value: '#819bb0' },
  { label: 'Cyan', value: '#76e4ef' },
  { label: 'Amber', value: '#d5b576' },
  { label: 'Purple', value: '#b7a0e6' },
  { label: 'Green', value: '#8fc8aa' },
  { label: 'Rose', value: '#e8959b' },
];

export type KanbanBoardProps = {
  project: Project;
  tasks: Item[];
  filteredTasks: Item[];
  saving: boolean;
  onSave: (data: ProjectData, title?: string) => Promise<boolean>;
  onEdit: (collection: 'tasks', item?: Item) => void;
  onRemove: (collection: 'tasks', item: Item) => void;
  onNotice: (message: string) => void;
};

type DragPayload =
  | { type: 'task'; id: string; fromColumnId: string }
  | { type: 'column'; id: string };

function parseDragData(e: DragEvent): DragPayload | null {
  try {
    const json = e.dataTransfer.getData('application/json');
    if (json) {
      const parsed = JSON.parse(json);
      if (parsed && (parsed.type === 'task' || parsed.type === 'column')) {
        return parsed as DragPayload;
      }
    }
  } catch {
    // fallback to text/plain
  }
  const plainId = e.dataTransfer.getData('text/plain');
  if (plainId) {
    return { type: 'task', id: plainId, fromColumnId: '' };
  }
  return null;
}

export default function KanbanBoard({
  project,
  tasks,
  filteredTasks,
  saving,
  onSave,
  onEdit,
  onRemove,
  onNotice,
}: KanbanBoardProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollRaf = useRef<number | null>(null);

  // Normalize or retrieve columns
  const columns: Item[] =
    project.data.taskColumns && project.data.taskColumns.length > 0
      ? project.data.taskColumns
      : defaultTaskColumns.map((c) => ({ ...c }));

  // Helper to map task to column
  const getTaskColumnId = useCallback(
    (task: Item): string => {
      if (task.columnId && columns.some((c) => c.id === task.columnId)) {
        return task.columnId;
      }
      const matchByName = columns.find(
        (c) => c.name.toLowerCase() === task.status?.toLowerCase(),
      );
      if (matchByName) return matchByName.id;
      if (task.status === 'To do') {
        const planning =
          columns.find((c) => c.name.toLowerCase() === 'planning') ||
          columns[0];
        if (planning) return planning.id;
      }
      return columns[0]?.id || 'col-backlog';
    },
    [columns],
  );

  // Auto-scroll when dragging near container left/right edges
  const handleDragOverContainer = useCallback((e: DragEvent) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const threshold = 60;
    const clientX = e.clientX;

    if (autoScrollRaf.current) {
      cancelAnimationFrame(autoScrollRaf.current);
      autoScrollRaf.current = null;
    }

    if (clientX - rect.left < threshold && container.scrollLeft > 0) {
      // scroll left
      const speed = Math.max(2, (threshold - (clientX - rect.left)) / 4);
      autoScrollRaf.current = requestAnimationFrame(() => {
        container.scrollLeft -= speed;
      });
    } else if (
      rect.right - clientX < threshold &&
      container.scrollLeft < container.scrollWidth - container.clientWidth
    ) {
      // scroll right
      const speed = Math.max(2, (threshold - (rect.right - clientX)) / 4);
      autoScrollRaf.current = requestAnimationFrame(() => {
        container.scrollLeft += speed;
      });
    }
  }, []);

  const handleDragLeaveContainer = useCallback(() => {
    if (autoScrollRaf.current) {
      cancelAnimationFrame(autoScrollRaf.current);
      autoScrollRaf.current = null;
    }
  }, []);

  // Wheel horizontal scroll translation when not over a vertically overflowing task list
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // If shift is pressed or horizontal wheel, native scroll works
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

    // Check if target is inside a task list that can scroll vertically
    let target = e.target as HTMLElement | null;
    let canScrollY = false;
    while (target && target !== container) {
      if (target.classList.contains('ps-kanban-task-list')) {
        const hasOverflow = target.scrollHeight > target.clientHeight;
        const isScrollingDown =
          e.deltaY > 0 &&
          target.scrollTop < target.scrollHeight - target.clientHeight;
        const isScrollingUp = e.deltaY < 0 && target.scrollTop > 0;
        if (hasOverflow && (isScrollingDown || isScrollingUp)) {
          canScrollY = true;
          break;
        }
      }
      target = target.parentElement;
    }

    if (!canScrollY && e.deltaY !== 0) {
      container.scrollLeft += e.deltaY;
    }
  }, []);

  // Add a new column
  const handleAddColumn = useCallback(
    async (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      const color = PRESET_COLORS[columns.length % PRESET_COLORS.length].value;
      const newCol: Item = {
        id: crypto.randomUUID(),
        name: trimmed,
        order: String(columns.length),
        color,
      };
      const updatedColumns = [...columns, newCol];
      const success = await onSave({
        ...project.data,
        taskColumns: updatedColumns,
      });
      if (success) {
        onNotice(`Đã thêm cột "${trimmed}".`);
        // Scroll to end of container
        setTimeout(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
              left: scrollContainerRef.current.scrollWidth,
              behavior: 'smooth',
            });
          }
        }, 100);
      }
    },
    [columns, onNotice, onSave, project.data],
  );

  // Rename column
  const handleRenameColumn = useCallback(
    async (columnId: string, newName: string) => {
      const trimmed = newName.trim();
      if (!trimmed) return;
      const updatedColumns = columns.map((c) =>
        c.id === columnId ? { ...c, name: trimmed } : c,
      );
      // Also update tasks that used old status name
      const targetCol = columns.find((c) => c.id === columnId);
      const oldName = targetCol?.name;
      const updatedTasks = tasks.map((t) => {
        if (t.columnId === columnId || (oldName && t.status === oldName)) {
          return { ...t, columnId, status: trimmed };
        }
        return t;
      });
      await onSave({
        ...project.data,
        taskColumns: updatedColumns,
        tasks: updatedTasks,
      });
      onNotice(`Đã đổi tên cột thành "${trimmed}".`);
    },
    [columns, onNotice, onSave, project.data, tasks],
  );

  // Change column color
  const handleChangeColumnColor = useCallback(
    async (columnId: string, color: string) => {
      const updatedColumns = columns.map((c) =>
        c.id === columnId ? { ...c, color } : c,
      );
      await onSave({
        ...project.data,
        taskColumns: updatedColumns,
      });
    },
    [columns, onSave, project.data],
  );

  // Duplicate column
  const handleDuplicateColumn = useCallback(
    async (columnId: string) => {
      const colIndex = columns.findIndex((c) => c.id === columnId);
      if (colIndex === -1) return;
      const original = columns[colIndex];
      const newColId = crypto.randomUUID();
      const newCol: Item = {
        id: newColId,
        name: `${original.name} (Bản sao)`,
        order: String(colIndex + 1),
        color: original.color || PRESET_COLORS[0].value,
      };
      const updatedColumns = [...columns];
      updatedColumns.splice(colIndex + 1, 0, newCol);
      // Re-index order
      const reindexed = updatedColumns.map((col, idx) => ({
        ...col,
        order: String(idx),
      }));
      await onSave({
        ...project.data,
        taskColumns: reindexed,
      });
      onNotice(`Đã nhân bản cột "${original.name}".`);
    },
    [columns, onNotice, onSave, project.data],
  );

  // Move column left or right
  const handleMoveColumn = useCallback(
    async (columnId: string, direction: -1 | 1) => {
      const index = columns.findIndex((c) => c.id === columnId);
      if (index === -1) return;
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= columns.length) return;
      const updated = [...columns];
      const [removed] = updated.splice(index, 1);
      updated.splice(targetIndex, 0, removed);
      const reindexed = updated.map((c, i) => ({ ...c, order: String(i) }));
      await onSave({
        ...project.data,
        taskColumns: reindexed,
      });
    },
    [columns, onSave, project.data],
  );

  // Delete column with safe task migration
  const handleDeleteColumn = useCallback(
    async (columnId: string) => {
      if (columns.length <= 1) {
        onNotice('Không thể xóa cột cuối cùng của Kanban.');
        return;
      }
      const colToDelete = columns.find((c) => c.id === columnId);
      if (!colToDelete) return;

      const remainingColumns = columns.filter((c) => c.id !== columnId);
      const targetFallbackCol = remainingColumns[0];

      // Migrate any tasks belonging to this column
      let migratedCount = 0;
      const updatedTasks = tasks.map((t) => {
        const isFromDeleted =
          t.columnId === columnId ||
          t.status?.toLowerCase() === colToDelete.name.toLowerCase();
        if (isFromDeleted) {
          migratedCount++;
          return {
            ...t,
            columnId: targetFallbackCol.id,
            status: targetFallbackCol.name,
          };
        }
        return t;
      });

      const reindexed = remainingColumns.map((c, i) => ({
        ...c,
        order: String(i),
      }));

      await onSave({
        ...project.data,
        taskColumns: reindexed,
        tasks: updatedTasks,
      });

      if (migratedCount > 0) {
        onNotice(
          `Đã xóa cột "${colToDelete.name}" và chuyển ${migratedCount} công việc sang "${targetFallbackCol.name}".`,
        );
      } else {
        onNotice(`Đã xóa cột "${colToDelete.name}".`);
      }
    },
    [columns, onNotice, onSave, project.data, tasks],
  );

  // Column Drag & Drop reorder
  const handleColumnDrop = useCallback(
    async (targetColumnId: string, droppedColumnId: string) => {
      if (targetColumnId === droppedColumnId) return;
      const fromIndex = columns.findIndex((c) => c.id === droppedColumnId);
      const toIndex = columns.findIndex((c) => c.id === targetColumnId);
      if (fromIndex === -1 || toIndex === -1) return;

      const nextColumns = [...columns];
      const [moved] = nextColumns.splice(fromIndex, 1);
      nextColumns.splice(toIndex, 0, moved);
      const reindexed = nextColumns.map((c, i) => ({ ...c, order: String(i) }));
      await onSave({
        ...project.data,
        taskColumns: reindexed,
      });
    },
    [columns, onSave, project.data],
  );

  // Task Move / Reorder
  const handleTaskDrop = useCallback(
    async (
      targetColumnId: string,
      taskId: string,
      targetTaskId?: string,
      position: 'before' | 'after' = 'after',
    ) => {
      const task = tasks.find((t) => t.id === taskId);
      const targetColumn = columns.find((c) => c.id === targetColumnId);
      if (!task || !targetColumn) return;

      // Build new task list with updated order & status
      let nextTasks = [...tasks];
      // Remove the dragged task first
      nextTasks = nextTasks.filter((t) => t.id !== taskId);

      const updatedTask: Item = {
        ...task,
        columnId: targetColumn.id,
        status: targetColumn.name,
      };

      if (targetTaskId) {
        const targetIndex = nextTasks.findIndex((t) => t.id === targetTaskId);
        if (targetIndex !== -1) {
          const insertIndex =
            position === 'before' ? targetIndex : targetIndex + 1;
          nextTasks.splice(insertIndex, 0, updatedTask);
        } else {
          nextTasks.push(updatedTask);
        }
      } else {
        // Appended to end of target column
        // Find last task belonging to targetColumn
        let lastColTaskIndex = -1;
        for (let i = nextTasks.length - 1; i >= 0; i--) {
          if (getTaskColumnId(nextTasks[i]) === targetColumnId) {
            lastColTaskIndex = i;
            break;
          }
        }
        if (lastColTaskIndex !== -1) {
          nextTasks.splice(lastColTaskIndex + 1, 0, updatedTask);
        } else {
          nextTasks.push(updatedTask);
        }
      }

      await onSave({
        ...project.data,
        tasks: nextTasks,
      });
    },
    [columns, getTaskColumnId, onSave, project.data, tasks],
  );

  return (
    <div className="ps-kanban-board">
      <div
        className="ps-kanban-scroll-container"
        ref={scrollContainerRef}
        onDragOver={handleDragOverContainer}
        onDragLeave={handleDragLeaveContainer}
        onWheel={handleWheel}
        aria-label="Kanban Board Scroll Area"
      >
        <div className="ps-kanban-row">
          {columns.map((column, columnIndex) => {
            const columnTasks = filteredTasks.filter(
              (t) => getTaskColumnId(t) === column.id,
            );
            return (
              <KanbanColumn
                key={column.id}
                column={column}
                columnIndex={columnIndex}
                totalColumns={columns.length}
                tasks={columnTasks}
                columns={columns}
                saving={saving}
                onSave={onSave}
                onEdit={onEdit}
                onRemove={onRemove}
                onRename={handleRenameColumn}
                onChangeColor={handleChangeColumnColor}
                onDuplicate={handleDuplicateColumn}
                onMove={handleMoveColumn}
                onDelete={handleDeleteColumn}
                onColumnDrop={handleColumnDrop}
                onTaskDrop={handleTaskDrop}
              />
            );
          })}

          <AddColumnButton onAdd={handleAddColumn} saving={saving} />
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Kanban Column Component
// --------------------------------------------------------------------------

type KanbanColumnProps = {
  column: Item;
  columnIndex: number;
  totalColumns: number;
  tasks: Item[];
  columns: Item[];
  saving: boolean;
  onSave: (data: ProjectData, title?: string) => Promise<boolean>;
  onEdit: (collection: 'tasks', item?: Item) => void;
  onRemove: (collection: 'tasks', item: Item) => void;
  onRename: (columnId: string, newName: string) => Promise<void>;
  onChangeColor: (columnId: string, color: string) => Promise<void>;
  onDuplicate: (columnId: string) => Promise<void>;
  onMove: (columnId: string, direction: -1 | 1) => Promise<void>;
  onDelete: (columnId: string) => Promise<void>;
  onColumnDrop: (
    targetColumnId: string,
    droppedColumnId: string,
  ) => Promise<void>;
  onTaskDrop: (
    targetColumnId: string,
    taskId: string,
    targetTaskId?: string,
    position?: 'before' | 'after',
  ) => Promise<void>;
};

const KanbanColumn = memo(function KanbanColumn({
  column,
  columnIndex,
  totalColumns,
  tasks,
  columns,
  saving,
  onEdit,
  onRemove,
  onRename,
  onChangeColor,
  onDuplicate,
  onMove,
  onDelete,
  onColumnDrop,
  onTaskDrop,
}: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isColumnDragOver, setIsColumnDragOver] = useState(false);
  const [quickAddActive, setQuickAddActive] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');

  // Column drag over & drop
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
      setIsColumnDragOver(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setIsColumnDragOver(false);

    const payload = parseDragData(e);
    if (!payload) return;

    if (payload.type === 'column') {
      void onColumnDrop(column.id, payload.id);
    } else if (payload.type === 'task') {
      void onTaskDrop(column.id, payload.id);
    }
  };

  const handleQuickAddSubmit = () => {
    const trimmed = quickTitle.trim();
    if (!trimmed) {
      setQuickAddActive(false);
      return;
    }
    // Launch onEdit with preset values
    onEdit(
      'tasks',
      newItem({
        title: trimmed,
        status: column.name,
        columnId: column.id,
        priority: 'Medium',
      }),
    );
    setQuickTitle('');
    setQuickAddActive(false);
  };

  const handleQuickAddKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleQuickAddSubmit();
    } else if (e.key === 'Escape') {
      setQuickAddActive(false);
      setQuickTitle('');
    }
  };

  return (
    <div
      className={`ps-kanban-column ${isDragOver ? 'is-drag-over' : ''} ${isColumnDragOver ? 'is-column-drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-column-id={column.id}
    >
      <KanbanColumnHeader
        column={column}
        columnIndex={columnIndex}
        totalColumns={totalColumns}
        count={tasks.length}
        saving={saving}
        onAddTask={() =>
          onEdit(
            'tasks',
            newItem({
              status: column.name,
              columnId: column.id,
              priority: 'Medium',
            }),
          )
        }
        onRename={(name) => onRename(column.id, name)}
        onChangeColor={(color) => onChangeColor(column.id, color)}
        onDuplicate={() => onDuplicate(column.id)}
        onMove={(direction) => onMove(column.id, direction)}
        onDelete={() => onDelete(column.id)}
      />

      <div className="ps-kanban-task-list">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            columns={columns}
            saving={saving}
            onEdit={onEdit}
            onRemove={onRemove}
            onTaskDrop={onTaskDrop}
          />
        ))}

        {quickAddActive && (
          <div className="ps-kanban-quick-add-form">
            <input
              className="ps-kanban-quick-add-input"
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              onKeyDown={handleQuickAddKeyDown}
              placeholder="Tên công việc…"
              aria-label="Tên công việc mới"
            />
            <div className="ps-kanban-quick-add-actions">
              <button
                type="button"
                className="ps-btn ps-primary ps-btn-sm"
                onClick={handleQuickAddSubmit}
              >
                Thêm
              </button>
              <button
                type="button"
                className="ps-icon-btn"
                aria-label="Hủy thêm công việc"
                onClick={() => {
                  setQuickAddActive(false);
                  setQuickTitle('');
                }}
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="ps-kanban-column-footer">
        {!quickAddActive && (
          <button
            type="button"
            className="ps-add-task"
            onClick={() => setQuickAddActive(true)}
            aria-label={`Thêm công việc vào ${column.name}`}
          >
            <Plus size={14} />
            Thêm công việc
          </button>
        )}
      </div>
    </div>
  );
});

// --------------------------------------------------------------------------
// Column Header Component with Menu & Inline Rename
// --------------------------------------------------------------------------

type KanbanColumnHeaderProps = {
  column: Item;
  columnIndex: number;
  totalColumns: number;
  count: number;
  saving: boolean;
  onAddTask: () => void;
  onRename: (newName: string) => Promise<void>;
  onChangeColor: (color: string) => Promise<void>;
  onDuplicate: () => Promise<void>;
  onMove: (direction: -1 | 1) => Promise<void>;
  onDelete: () => Promise<void>;
};

function KanbanColumnHeader({
  column,
  columnIndex,
  totalColumns,
  count,
  saving,
  onAddTask,
  onRename,
  onChangeColor,
  onDuplicate,
  onMove,
  onDelete,
}: KanbanColumnHeaderProps) {
  const [editing, setEditing] = useState(false);
  const [nameVal, setNameVal] = useState(column.name);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: globalThis.MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleSaveRename = async () => {
    setEditing(false);
    if (nameVal.trim() && nameVal.trim() !== column.name) {
      await onRename(nameVal.trim());
    } else {
      setNameVal(column.name);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      void handleSaveRename();
    } else if (e.key === 'Escape') {
      setEditing(false);
      setNameVal(column.name);
    }
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    if (saving) return;
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({ type: 'column', id: column.id }),
    );
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <header
      className="ps-kanban-column-header"
      draggable={!saving && !editing}
      onDragStart={handleDragStart}
    >
      <div
        className="ps-kanban-grip"
        aria-label="Kéo để đổi vị trí cột"
        title="Kéo để đổi vị trí cột"
      >
        <GripVertical size={13} />
      </div>

      <i
        className="ps-status-dot"
        style={{
          backgroundColor:
            column.color ||
            (column.name === 'Done'
              ? '#8fc8aa'
              : column.name === 'In progress'
                ? '#d5b576'
                : '#819bb0'),
        }}
      />

      {editing ? (
        <input
          className="ps-kanban-column-title-input"
          value={nameVal}
          onChange={(e) => setNameVal(e.target.value)}
          onBlur={() => void handleSaveRename()}
          onKeyDown={handleKeyDown}
          aria-label="Đổi tên cột"
        />
      ) : (
        <span
          className="ps-kanban-column-title"
          onDoubleClick={() => {
            setNameVal(column.name);
            setEditing(true);
          }}
          title="Nhấp đúp để đổi tên"
        >
          {column.name}
        </span>
      )}

      <span className="ps-kanban-column-count">{count}</span>

      <div className="ps-kanban-header-actions" ref={menuRef}>
        <button
          type="button"
          className="ps-icon-btn"
          aria-label={`Thêm công việc ${column.name}`}
          title="Thêm công việc"
          onClick={onAddTask}
        >
          <Plus size={15} />
        </button>

        <button
          type="button"
          className="ps-icon-btn"
          aria-label="Menu quản lý cột"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <MoreHorizontal size={15} />
        </button>

        {menuOpen && (
          <div className="ps-kanban-column-menu" role="menu">
            <button
              type="button"
              className="ps-kanban-menu-item"
              onClick={() => {
                setMenuOpen(false);
                setNameVal(column.name);
                setEditing(true);
              }}
            >
              <Pencil size={13} />
              Đổi tên cột
            </button>

            <button
              type="button"
              className="ps-kanban-menu-item"
              onClick={() => {
                setMenuOpen(false);
                void onDuplicate();
              }}
            >
              <Copy size={13} />
              Nhân bản cột
            </button>

            <div className="ps-kanban-menu-divider" />

            <div className="ps-kanban-menu-section-label">Màu chỉ báo</div>
            <div className="ps-kanban-color-picker">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  className={`ps-kanban-color-dot ${column.color === c.value ? 'is-selected' : ''}`}
                  style={{ backgroundColor: c.value }}
                  aria-label={`Chọn màu ${c.label}`}
                  onClick={() => {
                    setMenuOpen(false);
                    void onChangeColor(c.value);
                  }}
                />
              ))}
            </div>

            <div className="ps-kanban-menu-divider" />

            <button
              type="button"
              className="ps-kanban-menu-item"
              disabled={columnIndex === 0}
              onClick={() => {
                setMenuOpen(false);
                void onMove(-1);
              }}
            >
              <ArrowLeft size={13} />
              Di chuyển sang trái
            </button>

            <button
              type="button"
              className="ps-kanban-menu-item"
              disabled={columnIndex === totalColumns - 1}
              onClick={() => {
                setMenuOpen(false);
                void onMove(1);
              }}
            >
              <ArrowRight size={13} />
              Di chuyển sang phải
            </button>

            <div className="ps-kanban-menu-divider" />

            <button
              type="button"
              className="ps-kanban-menu-item ps-text-danger"
              onClick={() => {
                setMenuOpen(false);
                void onDelete();
              }}
            >
              <Trash2 size={13} />
              Xóa cột
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

// --------------------------------------------------------------------------
// Task Card Component
// --------------------------------------------------------------------------

type TaskCardProps = {
  task: Item;
  columns: Item[];
  saving: boolean;
  onEdit: (collection: 'tasks', item?: Item) => void;
  onRemove: (collection: 'tasks', item: Item) => void;
  onTaskDrop: (
    targetColumnId: string,
    taskId: string,
    targetTaskId?: string,
    position?: 'before' | 'after',
  ) => Promise<void>;
};

const TaskCard = memo(function TaskCard({
  task,
  columns,
  saving,
  onEdit,
  onRemove,
  onTaskDrop,
}: TaskCardProps) {
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | null>(
    null,
  );

  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    if (saving) return;
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        type: 'task',
        id: task.id,
        fromColumnId: task.columnId || '',
      }),
    );
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    if (e.clientY < midY) {
      setDropPosition('before');
    } else {
      setDropPosition('after');
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDropPosition(null);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const currentPosition = dropPosition || 'after';
    setDropPosition(null);

    const payload = parseDragData(e);
    if (!payload || payload.type !== 'task' || payload.id === task.id) return;

    // Target column id
    const targetColId =
      task.columnId ||
      columns.find((c) => c.name.toLowerCase() === task.status?.toLowerCase())
        ?.id ||
      columns[0]?.id;

    if (targetColId) {
      void onTaskDrop(targetColId, payload.id, task.id, currentPosition);
    }
  };

  const currentColumnId =
    task.columnId ||
    columns.find((c) => c.name.toLowerCase() === task.status?.toLowerCase())
      ?.id ||
    columns[0]?.id;

  return (
    <div
      className={`ps-task-card ${dropPosition ? `is-drop-${dropPosition}` : ''}`}
      draggable={!saving}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <span className={`ps-priority priority-${task.priority || 'Medium'}`}>
        {task.priority || 'Medium'}
      </span>

      <button
        type="button"
        className="ps-card-edit"
        aria-label="Sửa công việc"
        onClick={() => onEdit('tasks', task)}
      >
        <Pencil size={14} />
      </button>

      <h4>{task.title}</h4>
      {task.notes && <p>{task.notes}</p>}

      <div className="ps-task-card-footer">
        <span>
          <CalendarDays size={12} />
          {task.due || 'No due date'}
        </span>
        <span className="ps-person-avatar">
          {task.assignee?.slice(0, 1) || '?'}
        </span>
      </div>

      <select
        aria-label={`Trạng thái ${task.title}`}
        value={task.status}
        disabled={saving}
        onChange={(e) => {
          const newStatus = e.target.value;
          const targetCol = columns.find(
            (c) => c.name.toLowerCase() === newStatus.toLowerCase(),
          );
          const newColId = targetCol ? targetCol.id : currentColumnId;
          void onTaskDrop(newColId, task.id);
        }}
      >
        {columns.map((c) => (
          <option key={c.id} value={c.name}>
            {c.name}
          </option>
        ))}
      </select>

      <button
        type="button"
        className="ps-text-danger"
        onClick={() => onRemove('tasks', task)}
      >
        Xóa
      </button>
    </div>
  );
});

// --------------------------------------------------------------------------
// Add Column Button & Inline Form Component
// --------------------------------------------------------------------------

type AddColumnButtonProps = {
  onAdd: (name: string) => Promise<void>;
  saving: boolean;
};

function AddColumnButton({ onAdd, saving }: AddColumnButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setIsOpen(false);
      return;
    }
    setSubmitting(true);
    try {
      await onAdd(trimmed);
      setName('');
      setIsOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      void handleSubmit();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setName('');
    }
  };

  if (isOpen) {
    return (
      <div className="ps-kanban-add-column is-open">
        <input
          className="ps-kanban-add-column-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tên cột mới…"
          disabled={submitting || saving}
          aria-label="Tên cột mới"
        />
        <div className="ps-kanban-add-column-actions">
          <button
            type="button"
            className="ps-btn ps-primary ps-btn-sm"
            onClick={() => void handleSubmit()}
            disabled={submitting || saving || !name.trim()}
          >
            <Check size={14} />
            Thêm cột
          </button>
          <button
            type="button"
            className="ps-icon-btn"
            aria-label="Hủy thêm cột"
            onClick={() => {
              setIsOpen(false);
              setName('');
            }}
          >
            <X size={15} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      className="ps-kanban-add-column"
      onClick={() => setIsOpen(true)}
      disabled={saving}
      aria-label="Thêm cột mới"
    >
      <Plus size={16} />
      <span>Thêm cột</span>
    </button>
  );
}
