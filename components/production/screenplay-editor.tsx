'use client';

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import {
  Save,
  Download,
  Upload,
  Printer,
  Sparkles,
  Layers,
  ChevronLeft,
  ChevronRight,
  Eye,
  BarChart3,
  Code,
  BookOpen,
  HelpCircle,
  X,
  Users,
  Film,
} from 'lucide-react';
import './screenplay.css';
import {
  parseFountain,
  serializeToFountain,
  paginateElements,
  extractScriptBreakdown,
  generateFinalDraftFdx,
  convertToProductionScenes,
  REVISION_COLORS,
  ELEMENT_DEFINITIONS,
  type ScreenplayElement,
  type ScreenplayElementType,
  type TitlePageMeta,
  type VirtualPage,
} from '@/lib/production/screenplay-utils';
import {
  download,
  newItem,
  type Project,
  type ProjectData,
  type Item,
  type Collection,
} from '@/lib/production/model';

type Props = {
  project: Project;
  saving: boolean;
  onSave: (data: ProjectData, title?: string) => Promise<boolean>;
  onNotice: (message: string) => void;
  onEdit?: (collection: Collection, item?: Item) => void;
};

type ViewMode = 'page' | 'fountain' | 'read' | 'analytics';

export default function ScreenplayEditor({
  project,
  saving,
  onSave,
  onNotice,
  onEdit: _onEdit,
}: Props) {
  // Initial parsing of script
  const initialData = useMemo(() => {
    return parseFountain(
      project.data.script ||
        'Title: ' +
          project.title +
          '\nCredit: written by\nAuthor: Biên kịch Apexa\nDraft: First Draft\n\nINT. BỐI CẢNH ĐẦU TIÊN - NGÀY\n\nMô tả hành động mở đầu ở đây. Ánh sáng tràn vào căn phòng.\n\nNHÂN VẬT\n(nói nhỏ)\nLời thoại đầu tiên của kịch bản.',
    );
  }, [project.data.script, project.title]);

  const [meta, setMeta] = useState<TitlePageMeta>(initialData.meta);
  const [elements, setElements] = useState<ScreenplayElement[]>(
    initialData.elements,
  );
  const [viewMode, setViewMode] = useState<ViewMode>('page');
  const [fountainText, setFountainText] = useState(() =>
    serializeToFountain(initialData.meta, initialData.elements),
  );
  const [activeElementId, setActiveElementId] = useState<string | null>(
    initialData.elements[0]?.id || null,
  );
  const [activeRevision, setActiveRevision] = useState(REVISION_COLORS[0]);
  const [showSceneNumbers, setShowSceneNumbers] = useState(true);
  const [showTitlePage, setShowTitlePage] = useState(true);
  const [zoom, setZoom] = useState<number>(1.0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [readCharacterFilter, setReadCharacterFilter] = useState<string>('all');
  const [dirty, setDirty] = useState(false);

  // Modals
  const [titleModalOpen, setTitleModalOpen] = useState(false);
  const [revisionsModalOpen, setRevisionsModalOpen] = useState(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);

  // Auto-suggestion state
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestionIdx, setSelectedSuggestionIdx] = useState(0);
  const [suggestionPos, setSuggestionPos] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const importFileInputRef = useRef<HTMLInputElement>(null);
  const elementRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Virtual pagination calculation
  const pages: VirtualPage[] = useMemo(() => {
    return paginateElements(elements);
  }, [elements]);

  // Breakdown metrics
  const stats = useMemo(() => {
    return extractScriptBreakdown(elements, pages);
  }, [elements, pages]);

  // Sync back to Fountain when switching to Fountain view
  useEffect(() => {
    if (viewMode === 'fountain') {
      const timer = setTimeout(() => {
        setFountainText(serializeToFountain(meta, elements));
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [viewMode, meta, elements]);

  // Mark dirty
  const updateElements = useCallback((newElements: ScreenplayElement[]) => {
    setElements(newElements);
    setDirty(true);
  }, []);

  // Update text of single element
  const updateElementText = useCallback((id: string, text: string) => {
    setElements((prev) =>
      prev.map((el) => {
        if (el.id !== id) return el;
        return { ...el, text };
      }),
    );
    setDirty(true);
  }, []);

  // Change type of element
  const setElementType = useCallback(
    (id: string, type: ScreenplayElementType) => {
      setElements((prev) =>
        prev.map((el) => {
          if (el.id !== id) return el;
          let cleanText = el.text;
          if (
            type === 'scene_heading' ||
            type === 'character' ||
            type === 'transition' ||
            type === 'shot'
          ) {
            cleanText = cleanText.toUpperCase();
          }
          if (
            type === 'parenthetical' &&
            !cleanText.startsWith('(') &&
            cleanText.trim()
          ) {
            cleanText = `(${cleanText.replace(/\)/g, '')})`;
          }
          return { ...el, type, text: cleanText };
        }),
      );
      setDirty(true);
    },
    [],
  );

  // Find active element object
  const activeElement = useMemo(() => {
    return elements.find((el) => el.id === activeElementId) || null;
  }, [elements, activeElementId]);

  // Focus element helper
  const focusElement = useCallback((id: string, caretAtEnd = true) => {
    setActiveElementId(id);
    setTimeout(() => {
      const el = elementRefs.current.get(id);
      if (el) {
        el.focus();
        if (caretAtEnd && typeof window !== 'undefined') {
          const range = document.createRange();
          const sel = window.getSelection();
          range.selectNodeContents(el);
          range.collapse(false);
          sel?.removeAllRanges();
          sel?.addRange(range);
        }
      }
    }, 10);
  }, []);

  // Cycle element type (Tab flow)
  const cycleElementType = useCallback(
    (id: string, reverse = false) => {
      const el = elements.find((e) => e.id === id);
      if (!el) return;

      const order: ScreenplayElementType[] = [
        'scene_heading',
        'action',
        'character',
        'parenthetical',
        'dialogue',
        'transition',
      ];
      const currentIndex = order.indexOf(el.type);
      const nextIndex = reverse
        ? (currentIndex - 1 + order.length) % order.length
        : (currentIndex + 1) % order.length;
      setElementType(id, order[nextIndex]);
    },
    [elements, setElementType],
  );

  // Apply chosen suggestion
  const applySuggestion = useCallback(
    (id: string, suggestion: string) => {
      const el = elements.find((e) => e.id === id);
      if (!el) return;

      let newText = el.text;
      if (el.type === 'scene_heading') {
        if (suggestion.startsWith('INT.') || suggestion.startsWith('EXT.')) {
          newText = suggestion + ' ';
        } else if (suggestion.startsWith(' - ')) {
          newText = newText.replace(/\s+-\s+.*$/, '').trim() + suggestion;
        } else {
          newText =
            newText.replace(/^(INT\.|EXT\.|INT\.\/EXT\.)\s*/, '$1 ') +
            suggestion;
        }
      } else if (el.type === 'character') {
        if (suggestion.startsWith(' (')) {
          newText = newText.replace(/\s*\(.*\)\s*$/, '').trim() + suggestion;
        } else {
          newText = suggestion;
        }
      } else if (el.type === 'transition') {
        newText = suggestion;
      }

      updateElementText(id, newText);
      setSuggestions([]);
      setSuggestionPos(null);
      focusElement(id);
    },
    [elements, updateElementText, focusElement],
  );

  // Save changes to project
  const handleSave = useCallback(async () => {
    const finalScript =
      viewMode === 'fountain'
        ? fountainText
        : serializeToFountain(meta, elements);

    const ok = await onSave({
      ...project.data,
      script: finalScript,
    });

    if (ok) {
      setDirty(false);
      onNotice('✅ Đã lưu kịch bản thành công.');
    }
  }, [viewMode, fountainText, meta, elements, onSave, project.data, onNotice]);

  // Smart Typewriter keyboard logic
  const handleKeyDown = useCallback(
    (
      e: React.KeyboardEvent<HTMLDivElement>,
      el: ScreenplayElement,
      index: number,
    ) => {
      // 1. Check suggestion popover keyboard navigation
      if (suggestions.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedSuggestionIdx((prev) => (prev + 1) % suggestions.length);
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedSuggestionIdx(
            (prev) => (prev - 1 + suggestions.length) % suggestions.length,
          );
          return;
        }
        if (e.key === 'Enter' || e.key === 'Tab') {
          e.preventDefault();
          const chosen = suggestions[selectedSuggestionIdx];
          applySuggestion(el.id, chosen);
          return;
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          setSuggestions([]);
          return;
        }
      }

      // 2. Element type shortcuts: Ctrl/Cmd + 1..8
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
        const num = parseInt(e.key, 10);
        if (num >= 1 && num <= 8) {
          e.preventDefault();
          const targetDef = ELEMENT_DEFINITIONS[num - 1];
          if (targetDef) {
            setElementType(el.id, targetDef.type);
          }
          return;
        }
        if (e.key.toLowerCase() === 's') {
          e.preventDefault();
          void handleSave();
          return;
        }
      }

      // 3. Tab key: Smart element cycling
      if (e.key === 'Tab') {
        e.preventDefault();
        cycleElementType(el.id, e.shiftKey);
        return;
      }

      // 4. Enter key: Smart typewriter transition
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();

        // Calculate next element type based on Hollywood rules
        let nextType: ScreenplayElementType = 'action';

        if (el.type === 'scene_heading') {
          nextType = 'action';
        } else if (el.type === 'action') {
          if (!el.text.trim()) {
            // Empty action -> switch to character
            setElementType(el.id, 'character');
            return;
          }
          nextType = 'action';
        } else if (el.type === 'character') {
          nextType = 'dialogue';
        } else if (el.type === 'parenthetical') {
          nextType = 'dialogue';
        } else if (el.type === 'dialogue') {
          if (!el.text.trim()) {
            // Double Enter on empty dialogue -> switch to action
            setElementType(el.id, 'action');
            return;
          }
          // Enter on dialogue -> switch to Character for the other speaker
          nextType = 'character';
        } else if (el.type === 'transition') {
          nextType = 'scene_heading';
        }

        // Insert new element right below
        const newEl: ScreenplayElement = {
          id: crypto.randomUUID(),
          type: nextType,
          text: '',
        };

        const newElements = [...elements];
        newElements.splice(index + 1, 0, newEl);
        updateElements(newElements);
        focusElement(newEl.id);
        return;
      }

      // 5. Backspace on empty element: merge or delete
      if (e.key === 'Backspace' && !el.text.trim() && elements.length > 1) {
        e.preventDefault();
        const prevEl = elements[index - 1];
        const newElements = elements.filter((item) => item.id !== el.id);
        updateElements(newElements);
        if (prevEl) {
          focusElement(prevEl.id);
        }
        return;
      }

      // 6. Up/Down Arrow navigation across blocks
      if (e.key === 'ArrowUp' && index > 0) {
        const sel = window.getSelection();
        if (sel && sel.anchorOffset === 0) {
          e.preventDefault();
          focusElement(elements[index - 1].id);
        }
      }
      if (e.key === 'ArrowDown' && index < elements.length - 1) {
        const sel = window.getSelection();
        if (sel && sel.anchorOffset >= el.text.length) {
          e.preventDefault();
          focusElement(elements[index + 1].id, false);
        }
      }
    },
    [
      suggestions,
      selectedSuggestionIdx,
      elements,
      cycleElementType,
      setElementType,
      updateElements,
      focusElement,
      applySuggestion,
      handleSave,
    ],
  );

  // Trigger suggestions on input
  const checkSuggestions = useCallback(
    (el: ScreenplayElement, domEl: HTMLDivElement) => {
      const text = el.text.trim();
      let matches: string[] = [];

      if (el.type === 'scene_heading') {
        if (!text || text.length <= 4) {
          matches = ['INT.', 'EXT.', 'INT./EXT.', 'EXT./INT.'];
        } else if (text.endsWith('-')) {
          matches = [
            ' - DAY',
            ' - NIGHT',
            ' - DAWN',
            ' - DUSK',
            ' - LATER',
            ' - CONTINUOUS',
          ];
        } else {
          // Suggest locations already used
          const locs = stats.locations.map((l) => l.name);
          matches = locs.filter(
            (l) =>
              !text.includes(l) &&
              l.toLowerCase().includes(text.toLowerCase().slice(-3)),
          );
        }
      } else if (el.type === 'character') {
        const charNames = stats.characters.map((c) => c.name);
        if (text) {
          matches = charNames.filter(
            (n) => n.toLowerCase().startsWith(text.toLowerCase()) && n !== text,
          );
          if (matches.length === 0) {
            matches = [' (V.O.)', ' (O.S.)', " (CONT'D)"];
          }
        } else {
          matches = charNames.slice(0, 5);
        }
      } else if (el.type === 'transition') {
        matches = [
          'CUT TO:',
          'FADE OUT.',
          'FADE IN:',
          'DISSOLVE TO:',
          'SMASH CUT TO:',
        ];
      }

      if (matches.length > 0) {
        const rect = domEl.getBoundingClientRect();
        setSuggestionPos({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
        });
        setSuggestions(matches.slice(0, 6));
        setSelectedSuggestionIdx(0);
      } else {
        setSuggestions([]);
        setSuggestionPos(null);
      }
    },
    [stats],
  );

  // Save new Revision Draft (Hollywood colored draft)
  const handleSaveRevision = useCallback(async () => {
    const finalScript = serializeToFountain(meta, elements);
    const newVersion: Item = newItem({
      title: `${activeRevision.label}`,
      body: finalScript,
      color: activeRevision.hex,
      date: new Date().toISOString(),
    });

    const ok = await onSave({
      ...project.data,
      script: finalScript,
      versions: [...project.data.versions, newVersion],
    });

    if (ok) {
      setRevisionsModalOpen(false);
      onNotice(
        `🌟 Đã lưu bản nháp "${activeRevision.label}" vào lịch sử phiên bản.`,
      );
    }
  }, [meta, elements, activeRevision, onSave, project.data, onNotice]);

  // 1-Click Production Sync: Parse scenes and sync into project.data.scenes
  const handleSyncWithProduction = useCallback(async () => {
    const prodScenes = convertToProductionScenes(elements);
    if (prodScenes.length === 0) {
      onNotice(
        'Không tìm thấy Scene Heading nào để trích xuất. Hãy thêm cảnh bằng INT. hoặc EXT.',
      );
      return;
    }

    const finalScript = serializeToFountain(meta, elements);
    const ok = await onSave({
      ...project.data,
      script: finalScript,
      scenes: prodScenes,
    });

    if (ok) {
      onNotice(
        `🎬 Đã đồng bộ ${prodScenes.length} phân cảnh vào Apexa Production Suite!`,
      );
    }
  }, [elements, meta, onSave, project.data, onNotice]);

  // Import external file (.fountain, .fdx, .txt)
  const handleImportFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file) return;

      try {
        let rawContent = await file.text();

        // Handle Final Draft (.fdx) XML
        if (file.name.toLowerCase().endsWith('.fdx')) {
          const xml = new DOMParser().parseFromString(rawContent, 'text/xml');
          const paragraphs = Array.from(
            xml.querySelectorAll('Content > Paragraph'),
          );
          const reconstructed: string[] = [];

          paragraphs.forEach((p) => {
            const type = p.getAttribute('Type') || 'Action';
            const text = Array.from(p.querySelectorAll('Text'))
              .map((t) => t.textContent)
              .join('');

            if (type === 'Scene Heading')
              reconstructed.push(`\n${text.toUpperCase()}\n`);
            else if (type === 'Character')
              reconstructed.push(`\n${text.toUpperCase()}`);
            else if (type === 'Parenthetical')
              reconstructed.push(`(${text.replace(/[()]/g, '')})`);
            else if (type === 'Dialogue') reconstructed.push(`${text}\n`);
            else if (type === 'Transition')
              reconstructed.push(`\n> ${text.toUpperCase()}\n`);
            else reconstructed.push(`\n${text}\n`);
          });

          rawContent = reconstructed.join('\n');
        }

        const parsed = parseFountain(rawContent);
        setMeta(parsed.meta);
        setElements(parsed.elements);
        setDirty(true);
        onNotice(
          `📥 Đã nhập kịch bản từ tệp "${file.name}". Bấm "Lưu kịch bản" để cập nhật.`,
        );
      } catch {
        onNotice(
          'Không thể phân tích tệp kịch bản. Vui lòng kiểm tra định dạng .fountain, .fdx hoặc .txt.',
        );
      }
    },
    [onNotice],
  );

  // Export handlers
  const exportPdf = useCallback(() => {
    window.print();
  }, []);

  const exportFountain = useCallback(() => {
    const text = serializeToFountain(meta, elements);
    download(text, `${meta.title || project.title || 'Screenplay'}.fountain`);
    onNotice('Đã xuất tệp Fountain (.fountain)');
  }, [meta, elements, project.title, onNotice]);

  const exportFinalDraft = useCallback(() => {
    const fdx = generateFinalDraftFdx(meta, elements);
    download(
      fdx,
      `${meta.title || project.title || 'Screenplay'}.fdx`,
      'application/xml',
    );
    onNotice('Đã xuất tệp Final Draft XML (.fdx)');
  }, [meta, elements, project.title, onNotice]);

  // Scroll to scene heading when clicking scene item in outline
  const scrollToScene = useCallback(
    (sceneHeadingText: string) => {
      const target = elements.find(
        (el) =>
          el.type === 'scene_heading' &&
          el.text.trim() === sceneHeadingText.trim(),
      );
      if (target) {
        focusElement(target.id);
        const domEl = elementRefs.current.get(target.id);
        domEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    },
    [elements, focusElement],
  );

  return (
    <div className="screenplay-studio">
      {/* ── Top Header Toolbar ── */}
      <header className="sp-header-toolbar">
        <div className="sp-header-left">
          <button
            type="button"
            className="sp-action-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={
              sidebarCollapsed
                ? 'Mở thanh Outline cảnh'
                : 'Thu gọn Outline cảnh'
            }
          >
            {sidebarCollapsed ? (
              <ChevronRight size={14} />
            ) : (
              <ChevronLeft size={14} />
            )}
            <span>Scenes</span>
          </button>

          <div className="sp-project-badge">
            <Film size={14} style={{ color: '#38bdf8' }} />
            <span>{meta.title || project.title}</span>
          </div>

          <button
            type="button"
            className="sp-revision-pill"
            style={{
              background: activeRevision.bg,
              color: activeRevision.text,
            }}
            onClick={() => setRevisionsModalOpen(true)}
            title="Đổi màu bản nháp kịch bản chuẩn Hollywood"
          >
            <span
              className="sp-revision-dot"
              style={{ background: activeRevision.hex }}
            />
            <span>{activeRevision.label}</span>
          </button>

          <div className="sp-stats-pill">
            <span>
              Trang: <b>{stats.totalPages}</b>
            </span>
            <span>·</span>
            <span>
              Ước tính: <b>~{stats.estimatedRuntimeMinutes} phút</b>
            </span>
            <span>·</span>
            <span>
              Cảnh: <b>{stats.totalScenes}</b>
            </span>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="sp-header-center">
          <button
            type="button"
            className={`sp-view-tab ${viewMode === 'page' ? 'active' : ''}`}
            onClick={() => setViewMode('page')}
            title="Chế độ trang in chuẩn Hollywood"
          >
            <BookOpen size={14} />
            <span>Page View</span>
          </button>
          <button
            type="button"
            className={`sp-view-tab ${viewMode === 'fountain' ? 'active' : ''}`}
            onClick={() => setViewMode('fountain')}
            title="Soạn thảo văn bản thuần Fountain"
          >
            <Code size={14} />
            <span>Fountain</span>
          </button>
          <button
            type="button"
            className={`sp-view-tab ${viewMode === 'read' ? 'active' : ''}`}
            onClick={() => setViewMode('read')}
            title="Chế độ đọc kịch bản / Tập thoại Table Read"
          >
            <Eye size={14} />
            <span>Table Read</span>
          </button>
          <button
            type="button"
            className={`sp-view-tab ${viewMode === 'analytics' ? 'active' : ''}`}
            onClick={() => setViewMode('analytics')}
            title="Thống kê nhân vật, thoại và bối cảnh"
          >
            <BarChart3 size={14} />
            <span>Breakdown</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="sp-header-right">
          <input
            ref={importFileInputRef}
            type="file"
            hidden
            accept=".fountain,.fdx,.txt"
            onChange={handleImportFile}
          />

          <button
            type="button"
            className="sp-action-btn"
            onClick={() => importFileInputRef.current?.click()}
            title="Nhập kịch bản từ Fountain (.fountain), Final Draft (.fdx), hoặc TXT"
          >
            <Upload size={13} />
            <span>Import</span>
          </button>

          {/* Export Dropdown */}
          <div className="sp-export-wrap" style={{ position: 'relative' }}>
            <button
              type="button"
              className="sp-action-btn"
              onClick={exportPdf}
              title="In kịch bản hoặc Lưu dưới dạng PDF chuẩn WGA"
            >
              <Printer size={13} />
              <span>In PDF</span>
            </button>
          </div>

          <button
            type="button"
            className="sp-action-btn"
            onClick={exportFinalDraft}
            title="Xuất file Final Draft XML (.fdx) chuẩn điện ảnh"
          >
            <Download size={13} />
            <span>.FDX</span>
          </button>

          <button
            type="button"
            className="sp-action-btn"
            onClick={exportFountain}
            title="Xuất kịch bản định dạng Fountain"
          >
            <Download size={13} />
            <span>.Fountain</span>
          </button>

          <button
            type="button"
            className="sp-action-btn"
            onClick={() => setShortcutsModalOpen(true)}
            title="Phím tắt soạn thảo chuẩn ngành"
          >
            <HelpCircle size={14} />
          </button>

          <button
            type="button"
            className="sp-action-btn primary"
            disabled={saving}
            onClick={handleSave}
            title="Lưu kịch bản vào project"
          >
            <Save size={14} />
            <span>{dirty ? 'Lưu kịch bản *' : 'Đã lưu'}</span>
          </button>
        </div>
      </header>

      {/* ── Secondary Format Bar (When in Page View) ── */}
      {viewMode === 'page' && (
        <div className="sp-format-bar">
          <div className="sp-element-buttons">
            {ELEMENT_DEFINITIONS.map((def) => (
              <button
                key={def.type}
                type="button"
                className={`sp-element-btn ${
                  activeElement?.type === def.type ? 'active' : ''
                }`}
                onClick={() => {
                  if (activeElementId) {
                    setElementType(activeElementId, def.type);
                    focusElement(activeElementId);
                  }
                }}
                title={`${def.description} (${def.shortcut} hoặc Tab)`}
              >
                <span>{def.label}</span>
                <kbd>{def.shortcut.replace('Ctrl+', '')}</kbd>
              </button>
            ))}
          </div>

          <div className="sp-format-controls">
            <label
              className="sp-toggle-pill"
              title="Hiển thị số thứ tự phân cảnh ở hai lề"
            >
              <input
                type="checkbox"
                checked={showSceneNumbers}
                onChange={(e) => setShowSceneNumbers(e.target.checked)}
              />
              <span>Số cảnh</span>
            </label>

            <label
              className="sp-toggle-pill"
              title="Hiển thị trang bìa kịch bản (Title Page)"
            >
              <input
                type="checkbox"
                checked={showTitlePage}
                onChange={(e) => setShowTitlePage(e.target.checked)}
              />
              <span>Trang bìa</span>
            </label>

            <button
              type="button"
              className="sp-action-btn"
              style={{ padding: '2px 8px', fontSize: '11px' }}
              onClick={() => setTitleModalOpen(true)}
              title="Chỉnh sửa thông tin trang bìa"
            >
              <span>Sửa bìa</span>
            </button>

            <select
              className="sp-zoom-select"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              title="Thu phóng trang"
            >
              <option value="0.75">75%</option>
              <option value="0.9">90%</option>
              <option value="1.0">100%</option>
              <option value="1.15">115%</option>
              <option value="1.25">125%</option>
            </select>
          </div>
        </div>
      )}

      {/* ── Main Workspace: Sidebar + Content ── */}
      <div
        className={`sp-main-workspace ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}
      >
        {/* Left Sidebar: Scene Outline */}
        <aside className="sp-sidebar">
          <div className="sp-sidebar-header">
            <span className="sp-sidebar-title">
              SCENE OUTLINE ({stats.totalScenes})
            </span>
            <button
              type="button"
              className="sp-action-btn"
              style={{ padding: '2px 6px', fontSize: '10px' }}
              onClick={handleSyncWithProduction}
              title="Tự động trích xuất các cảnh vào Apexa Production Suite"
            >
              <Sparkles size={11} />
              <span>Đồng bộ</span>
            </button>
          </div>

          <div className="sp-scene-list">
            {stats.scenes.map((sc) => (
              <button
                key={sc.number}
                type="button"
                className="sp-scene-item"
                onClick={() => scrollToScene(sc.heading)}
              >
                <span className="sp-scene-num">{sc.number}</span>
                <div className="sp-scene-info">
                  <span className="sp-scene-heading-text">{sc.heading}</span>
                  <div className="sp-scene-meta">
                    <span className="sp-scene-intext">{sc.intExt}</span>
                    <span>·</span>
                    <span>{sc.time}</span>
                    {sc.characters.length > 0 && (
                      <>
                        <span>·</span>
                        <span>{sc.characters.length} nhân vật</span>
                      </>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="sp-sidebar-footer">
            <button
              type="button"
              className="sp-action-btn primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleSyncWithProduction}
            >
              <Layers size={13} />
              <span>Trích xuất Scenes vào Studio</span>
            </button>
          </div>
        </aside>

        {/* Content View Area */}
        <main className="sp-content-area">
          {/* 1. Page View (WYSIWYG Monospaced Sheets) */}
          {viewMode === 'page' && (
            <div
              className="sp-pages-container"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'top center',
              }}
            >
              {/* Optional Title Page */}
              {showTitlePage && (
                <div className="sp-title-page-canvas">
                  <div className="sp-title-block">
                    <div className="sp-title-main">
                      {meta.title || project.title}
                    </div>
                    <div className="sp-title-credit">
                      {meta.credit || 'written by'}
                    </div>
                    <div className="sp-title-author">
                      {meta.author || 'Tác giả'}
                    </div>
                    {meta.source && (
                      <div className="sp-title-source">{meta.source}</div>
                    )}
                  </div>

                  <div className="sp-title-footer">
                    <div className="sp-title-contact">
                      {meta.contact ? (
                        meta.contact
                          .split('\n')
                          .map((l, i) => <div key={i}>{l}</div>)
                      ) : (
                        <div>Apexa Production Suite</div>
                      )}
                    </div>
                    <div className="sp-title-meta">
                      <div>{meta.draft || activeRevision.label}</div>
                      <div>
                        {meta.date || new Date().toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Paginated Script Pages */}
              {pages.map((page) => (
                <div key={page.pageNumber} className="sp-paper-page">
                  {/* Page number top right (Page 1 has no number) */}
                  {page.pageNumber > 1 && (
                    <div className="sp-page-header">{page.pageNumber}.</div>
                  )}

                  {page.elements.map((el) => {
                    const globalIdx = elements.findIndex(
                      (item) => item.id === el.id,
                    );
                    const isSceneHeading = el.type === 'scene_heading';

                    return (
                      <div key={el.id} className="sp-block-wrapper">
                        {/* Left & Right Scene Number Gutters for Production Shooting Scripts */}
                        {isSceneHeading &&
                          showSceneNumbers &&
                          el.sceneNumber && (
                            <>
                              <span className="sp-scene-gutter-left">
                                {el.sceneNumber}
                              </span>
                              <span className="sp-scene-gutter-right">
                                {el.sceneNumber}
                              </span>
                            </>
                          )}
                        <div
                          ref={(node) => {
                            if (node) elementRefs.current.set(el.id, node);
                            else elementRefs.current.delete(el.id);
                          }}
                          role="textbox"
                          aria-multiline="true"
                          tabIndex={0}
                          contentEditable
                          suppressContentEditableWarning
                          className={`sp-block ${el.type}`}
                          data-placeholder={
                            ELEMENT_DEFINITIONS.find((d) => d.type === el.type)
                              ?.placeholder
                          }
                          onFocus={() => setActiveElementId(el.id)}
                          onBlur={(e) => {
                            updateElementText(
                              el.id,
                              e.currentTarget.innerText || '',
                            );
                          }}
                          onInput={(e) => {
                            const currentText = e.currentTarget.innerText || '';
                            el.text = currentText;
                            setDirty(true);
                            checkSuggestions(el, e.currentTarget);
                          }}
                          onKeyDown={(e) => handleKeyDown(e, el, globalIdx)}
                        >
                          {el.text}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          {/* 2. Fountain Raw Editor Mode */}
          {viewMode === 'fountain' && (
            <div className="sp-fountain-container">
              <textarea
                className="sp-fountain-textarea"
                value={fountainText}
                onChange={(e) => {
                  setFountainText(e.target.value);
                  setDirty(true);
                }}
                onBlur={() => {
                  const parsed = parseFountain(fountainText);
                  setMeta(parsed.meta);
                  setElements(parsed.elements);
                }}
                placeholder="Nhập hoặc dán cú pháp Fountain ở đây..."
              />
            </div>
          )}

          {/* 3. Read Mode (Table Read / Teleprompter) */}
          {viewMode === 'read' && (
            <div className="sp-read-mode-container">
              <div className="sp-read-controls-bar">
                <div className="sp-character-filter">
                  <Users size={16} />
                  <span>Highlight vai diễn:</span>
                  <select
                    className="sp-read-select"
                    value={readCharacterFilter}
                    onChange={(e) => setReadCharacterFilter(e.target.value)}
                  >
                    <option value="all">Tất cả nhân vật</option>
                    {stats.characters.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name} ({c.lineCount} câu thoại)
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ fontSize: '12px', color: '#8da4b4' }}>
                  Chế độ đọc thử kịch bản & tập thoại (Table Read)
                </div>
              </div>

              {elements.map((el) => {
                const isChar = el.type === 'character';
                const isDialogue = el.type === 'dialogue';
                const isTargetChar =
                  readCharacterFilter !== 'all' &&
                  ((isChar &&
                    el.text.toUpperCase().includes(readCharacterFilter)) ||
                    (isDialogue &&
                      elements[
                        elements.findIndex((e) => e.id === el.id) - 1
                      ]?.text
                        .toUpperCase()
                        .includes(readCharacterFilter)));

                return (
                  <div
                    key={el.id}
                    className={`sp-read-paragraph ${isTargetChar ? 'highlighted-char' : ''}`}
                  >
                    {isChar && <b className="sp-read-speaker">{el.text}</b>}
                    {!isChar && <span>{el.text}</span>}
                  </div>
                );
              })}
            </div>
          )}

          {/* 4. Analytics & Breakdown Mode */}
          {viewMode === 'analytics' && (
            <div className="sp-analytics-container">
              {/* Metric Cards */}
              <div className="sp-metrics-grid">
                <div className="sp-metric-card">
                  <span className="sp-metric-label">Tổng số trang</span>
                  <span className="sp-metric-value">{stats.totalPages}</span>
                  <span className="sp-metric-sub">
                    ~{stats.estimatedRuntimeMinutes} phút phim
                  </span>
                </div>
                <div className="sp-metric-card">
                  <span className="sp-metric-label">Tổng số phân cảnh</span>
                  <span className="sp-metric-value">{stats.totalScenes}</span>
                  <span className="sp-metric-sub">
                    {stats.locations.length} bối cảnh khác nhau
                  </span>
                </div>
                <div className="sp-metric-card">
                  <span className="sp-metric-label">Số lượng nhân vật</span>
                  <span className="sp-metric-value">
                    {stats.characters.length}
                  </span>
                  <span className="sp-metric-sub">Có lời thoại</span>
                </div>
                <div className="sp-metric-card">
                  <span className="sp-metric-label">Tổng số từ</span>
                  <span className="sp-metric-value">
                    {stats.totalWords.toLocaleString()}
                  </span>
                  <span className="sp-metric-sub">Kịch bản hoàn chỉnh</span>
                </div>
              </div>

              {/* Ratios & Charts */}
              <div className="sp-charts-grid">
                {/* INT vs EXT */}
                <div className="sp-chart-card">
                  <h4 className="sp-chart-title">
                    Tỷ lệ Nội cảnh (INT) / Ngoại cảnh (EXT)
                  </h4>
                  <div className="sp-ratio-bar">
                    <div
                      className="sp-ratio-segment"
                      style={{
                        width: `${
                          stats.totalScenes > 0
                            ? (stats.intScenes / stats.totalScenes) * 100
                            : 50
                        }%`,
                        background: '#0284c7',
                      }}
                    >
                      INT {stats.intScenes}
                    </div>
                    <div
                      className="sp-ratio-segment"
                      style={{
                        width: `${
                          stats.totalScenes > 0
                            ? (stats.extScenes / stats.totalScenes) * 100
                            : 50
                        }%`,
                        background: '#10b981',
                      }}
                    >
                      EXT {stats.extScenes}
                    </div>
                  </div>
                  <div className="sp-ratio-legend">
                    <span>Nội cảnh (INT): {stats.intScenes} cảnh</span>
                    <span>Ngoại cảnh (EXT): {stats.extScenes} cảnh</span>
                  </div>
                </div>

                {/* Day vs Night */}
                <div className="sp-chart-card">
                  <h4 className="sp-chart-title">
                    Thời điểm quay (Ngày / Đêm)
                  </h4>
                  <div className="sp-ratio-bar">
                    <div
                      className="sp-ratio-segment"
                      style={{
                        width: `${
                          stats.totalScenes > 0
                            ? (stats.dayScenes / stats.totalScenes) * 100
                            : 50
                        }%`,
                        background: '#f59e0b',
                      }}
                    >
                      DAY {stats.dayScenes}
                    </div>
                    <div
                      className="sp-ratio-segment"
                      style={{
                        width: `${
                          stats.totalScenes > 0
                            ? (stats.nightScenes / stats.totalScenes) * 100
                            : 50
                        }%`,
                        background: '#6366f1',
                      }}
                    >
                      NIGHT {stats.nightScenes}
                    </div>
                  </div>
                  <div className="sp-ratio-legend">
                    <span>Ban ngày (Day): {stats.dayScenes} cảnh</span>
                    <span>Ban đêm (Night): {stats.nightScenes} cảnh</span>
                  </div>
                </div>
              </div>

              {/* Characters Breakdown Table */}
              <div className="sp-chart-card">
                <h4 className="sp-chart-title">
                  Phân tích Nhân vật & Lời thoại
                </h4>
                <table className="sp-character-table">
                  <thead>
                    <tr>
                      <th>Nhân vật</th>
                      <th>Số câu thoại</th>
                      <th>Số từ</th>
                      <th>Tỷ lệ thoại (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.characters.map((c) => (
                      <tr key={c.name}>
                        <td style={{ fontWeight: 600, color: '#38bdf8' }}>
                          {c.name}
                        </td>
                        <td>{c.lineCount}</td>
                        <td>{c.wordCount}</td>
                        <td aria-label={`Tỷ lệ thoại: ${c.percentage}%`}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                            }}
                          >
                            <div
                              style={{
                                width: 80,
                                height: 6,
                                background: '#27313a',
                                borderRadius: 3,
                                overflow: 'hidden',
                              }}
                            >
                              <div
                                style={{
                                  width: `${c.percentage}%`,
                                  height: '100%',
                                  background: '#38bdf8',
                                }}
                              />
                            </div>
                            <span>{c.percentage}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── Auto-Suggestions Popover ── */}
      {suggestionPos && suggestions.length > 0 && (
        <div
          className="sp-suggestion-popover"
          style={{ top: suggestionPos.top, left: suggestionPos.left }}
        >
          {suggestions.map((s, idx) => (
            <button
              type="button"
              key={s}
              className={`sp-suggestion-item ${
                idx === selectedSuggestionIdx ? 'selected' : ''
              }`}
              onClick={() => {
                if (activeElementId) {
                  applySuggestion(activeElementId, s);
                }
              }}
            >
              <span>{s}</span>
              <span className="sp-suggestion-tag">↵ Tab</span>
            </button>
          ))}
        </div>
      )}

      {/* ── Title Page Modal ── */}
      {titleModalOpen && (
        <div
          className="sp-modal-overlay"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setTitleModalOpen(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setTitleModalOpen(false);
          }}
        >
          <div
            className="sp-modal-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sp-title-page-modal-heading"
          >
            <div className="sp-modal-header">
              <h3 id="sp-title-page-modal-heading">
                Chỉnh sửa Trang Bìa (Title Page)
              </h3>
              <button
                type="button"
                className="sp-modal-close"
                onClick={() => setTitleModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="sp-modal-body">
              <div className="sp-form-group">
                <label htmlFor="meta-title">Tên phim (Title)</label>
                <input
                  id="meta-title"
                  type="text"
                  className="sp-form-input"
                  value={meta.title}
                  onChange={(e) => {
                    setMeta({ ...meta, title: e.target.value });
                    setDirty(true);
                  }}
                  placeholder="TÊN BỘ PHIM"
                />
              </div>

              <div className="sp-form-group">
                <label htmlFor="meta-credit">Lời đề tặng (Credit)</label>
                <input
                  id="meta-credit"
                  type="text"
                  className="sp-form-input"
                  value={meta.credit}
                  onChange={(e) => {
                    setMeta({ ...meta, credit: e.target.value });
                    setDirty(true);
                  }}
                  placeholder="written by"
                />
              </div>

              <div className="sp-form-group">
                <label htmlFor="meta-author">
                  Tác giả / Biên kịch (Author)
                </label>
                <input
                  id="meta-author"
                  type="text"
                  className="sp-form-input"
                  value={meta.author}
                  onChange={(e) => {
                    setMeta({ ...meta, author: e.target.value });
                    setDirty(true);
                  }}
                  placeholder="Tên biên kịch"
                />
              </div>

              <div className="sp-form-group">
                <label htmlFor="meta-source">Dựa trên tác phẩm (Source)</label>
                <input
                  id="meta-source"
                  type="text"
                  className="sp-form-input"
                  value={meta.source}
                  onChange={(e) => {
                    setMeta({ ...meta, source: e.target.value });
                    setDirty(true);
                  }}
                  placeholder="Dựa trên truyện ngắn / ý tưởng gốc của..."
                />
              </div>

              <div className="sp-form-group">
                <label htmlFor="meta-draft">
                  Phiên bản nháp (Draft / Revision)
                </label>
                <input
                  id="meta-draft"
                  type="text"
                  className="sp-form-input"
                  value={meta.draft}
                  onChange={(e) => {
                    setMeta({ ...meta, draft: e.target.value });
                    setDirty(true);
                  }}
                  placeholder="First Draft"
                />
              </div>

              <div className="sp-form-group">
                <label htmlFor="meta-contact">
                  Liên hệ / Bản quyền (Contact)
                </label>
                <textarea
                  id="meta-contact"
                  rows={3}
                  className="sp-form-textarea"
                  value={meta.contact}
                  onChange={(e) => {
                    setMeta({ ...meta, contact: e.target.value });
                    setDirty(true);
                  }}
                  placeholder="Email, số điện thoại hoặc công ty sản xuất..."
                />
              </div>
            </div>

            <div className="sp-modal-footer">
              <button
                type="button"
                className="sp-action-btn"
                onClick={() => setTitleModalOpen(false)}
              >
                Đóng
              </button>
              <button
                type="button"
                className="sp-action-btn primary"
                onClick={() => setTitleModalOpen(false)}
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Revision Draft Colors Modal ── */}
      {revisionsModalOpen && (
        <div
          className="sp-modal-overlay"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setRevisionsModalOpen(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setRevisionsModalOpen(false);
          }}
        >
          <div
            className="sp-modal-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sp-revision-modal-heading"
          >
            <div className="sp-modal-header">
              <h3 id="sp-revision-modal-heading">
                Bản nháp & Màu Revision Hollywood
              </h3>
              <button
                type="button"
                className="sp-modal-close"
                onClick={() => setRevisionsModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="sp-modal-body">
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                Trong ngành điện ảnh, mỗi lần sửa đổi kịch bản sau bản thảo đầu
                tiên (White) sẽ được đánh dấu bằng một màu giấy quy ước để toàn
                bộ đoàn phim phân biệt các trang mới.
              </p>

              <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
                {REVISION_COLORS.map((rev) => (
                  <button
                    key={rev.name}
                    type="button"
                    className="sp-action-btn"
                    style={{
                      justifyContent: 'flex-start',
                      background:
                        rev.name === activeRevision.name
                          ? '#1e293b'
                          : '#141a20',
                      border: `1px solid ${
                        rev.name === activeRevision.name ? '#38bdf8' : '#27313a'
                      }`,
                      padding: '10px 14px',
                    }}
                    onClick={() => setActiveRevision(rev)}
                  >
                    <span
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        background: rev.hex,
                        border: '1px solid rgba(0,0,0,0.2)',
                        marginRight: 8,
                      }}
                    />
                    <span style={{ fontWeight: 600, color: '#f1f5f9' }}>
                      {rev.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="sp-modal-footer">
              <button
                type="button"
                className="sp-action-btn"
                onClick={() => setRevisionsModalOpen(false)}
              >
                Hủy
              </button>
              <button
                type="button"
                className="sp-action-btn primary"
                disabled={saving}
                onClick={handleSaveRevision}
              >
                Lưu vào Lịch sử Phiên bản
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Keyboard Shortcuts Modal ── */}
      {shortcutsModalOpen && (
        <div
          className="sp-modal-overlay"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShortcutsModalOpen(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setShortcutsModalOpen(false);
          }}
        >
          <div
            className="sp-modal-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sp-shortcuts-modal-heading"
          >
            <div className="sp-modal-header">
              <h3 id="sp-shortcuts-modal-heading">
                Quy tắc Gõ & Phím tắt Chuẩn Ngành (Smart Typewriter)
              </h3>
              <button
                type="button"
                className="sp-modal-close"
                onClick={() => setShortcutsModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="sp-modal-body">
              <div style={{ display: 'grid', gap: 12 }}>
                <div
                  style={{
                    background: '#12171e',
                    padding: 12,
                    borderRadius: 8,
                  }}
                >
                  <b style={{ color: '#38bdf8', fontSize: '13px' }}>
                    Quy tắc chuyển dòng (Enter):
                  </b>
                  <ul
                    style={{
                      fontSize: '12px',
                      color: '#cbd5e1',
                      paddingLeft: 18,
                      margin: '8px 0 0',
                    }}
                  >
                    <li>
                      <b>Scene Heading</b> + Enter → Tạo dòng <b>Action</b>.
                    </li>
                    <li>
                      <b>Character</b> + Enter → Tạo dòng <b>Dialogue</b>{' '}
                      (thoại).
                    </li>
                    <li>
                      <b>Parenthetical</b> + Enter → Tạo dòng <b>Dialogue</b>.
                    </li>
                    <li>
                      <b>Dialogue</b> + Enter → Tạo dòng <b>Character</b> (cho
                      nhân vật tiếp theo đối đáp).
                    </li>
                    <li>
                      <b>Dialogue trống</b> + Enter → Chuyển thành <b>Action</b>
                      .
                    </li>
                    <li>
                      <b>Transition</b> + Enter → Tạo <b>Scene Heading</b> mới.
                    </li>
                  </ul>
                </div>

                <div
                  style={{
                    background: '#12171e',
                    padding: 12,
                    borderRadius: 8,
                  }}
                >
                  <b style={{ color: '#38bdf8', fontSize: '13px' }}>
                    Chuyển đổi thành phần (Tab):
                  </b>
                  <p
                    style={{
                      fontSize: '12px',
                      color: '#cbd5e1',
                      margin: '6px 0 0',
                    }}
                  >
                    Nhấn <b>Tab</b> để luân chuyển nhanh:{' '}
                    <i>
                      Action → Character → Parenthetical → Dialogue → Transition
                      → Scene Heading
                    </i>
                    . Nhấn <b>Shift + Tab</b> để lùi lại.
                  </p>
                </div>

                <div
                  style={{
                    background: '#12171e',
                    padding: 12,
                    borderRadius: 8,
                  }}
                >
                  <b style={{ color: '#38bdf8', fontSize: '13px' }}>
                    Phím tắt nhanh:
                  </b>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: 6,
                      fontSize: '12px',
                      color: '#cbd5e1',
                      marginTop: 8,
                    }}
                  >
                    <div>
                      <kbd
                        style={{
                          background: '#27313a',
                          color: '#fff',
                          padding: '1px 5px',
                          borderRadius: 3,
                        }}
                      >
                        Ctrl+1
                      </kbd>{' '}
                      : Scene Heading
                    </div>
                    <div>
                      <kbd
                        style={{
                          background: '#27313a',
                          color: '#fff',
                          padding: '1px 5px',
                          borderRadius: 3,
                        }}
                      >
                        Ctrl+2
                      </kbd>{' '}
                      : Action
                    </div>
                    <div>
                      <kbd
                        style={{
                          background: '#27313a',
                          color: '#fff',
                          padding: '1px 5px',
                          borderRadius: 3,
                        }}
                      >
                        Ctrl+3
                      </kbd>{' '}
                      : Character
                    </div>
                    <div>
                      <kbd
                        style={{
                          background: '#27313a',
                          color: '#fff',
                          padding: '1px 5px',
                          borderRadius: 3,
                        }}
                      >
                        Ctrl+4
                      </kbd>{' '}
                      : Dialogue
                    </div>
                    <div>
                      <kbd
                        style={{
                          background: '#27313a',
                          color: '#fff',
                          padding: '1px 5px',
                          borderRadius: 3,
                        }}
                      >
                        Ctrl+5
                      </kbd>{' '}
                      : Parenthetical
                    </div>
                    <div>
                      <kbd
                        style={{
                          background: '#27313a',
                          color: '#fff',
                          padding: '1px 5px',
                          borderRadius: 3,
                        }}
                      >
                        Ctrl+6
                      </kbd>{' '}
                      : Transition
                    </div>
                    <div>
                      <kbd
                        style={{
                          background: '#27313a',
                          color: '#fff',
                          padding: '1px 5px',
                          borderRadius: 3,
                        }}
                      >
                        Ctrl+7
                      </kbd>{' '}
                      : Shot
                    </div>
                    <div>
                      <kbd
                        style={{
                          background: '#27313a',
                          color: '#fff',
                          padding: '1px 5px',
                          borderRadius: 3,
                        }}
                      >
                        Ctrl+S
                      </kbd>{' '}
                      : Lưu kịch bản
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="sp-modal-footer">
              <button
                type="button"
                className="sp-action-btn primary"
                onClick={() => setShortcutsModalOpen(false)}
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
