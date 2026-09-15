import { newItem, type Item } from './model';

export type ScreenplayElementType =
  | 'scene_heading'
  | 'action'
  | 'character'
  | 'parenthetical'
  | 'dialogue'
  | 'transition'
  | 'shot'
  | 'note';

export interface ScreenplayElement {
  id: string;
  type: ScreenplayElementType;
  text: string;
  sceneNumber?: string;
  notes?: string;
  dualDialogue?: boolean;
}

export interface TitlePageMeta {
  title: string;
  credit: string;
  author: string;
  source: string;
  draft: string;
  date: string;
  contact: string;
  notes: string;
}

export interface ScriptBreakdownStats {
  totalPages: number;
  totalScenes: number;
  totalWords: number;
  estimatedRuntimeMinutes: number;
  intScenes: number;
  extScenes: number;
  dayScenes: number;
  nightScenes: number;
  characters: {
    name: string;
    lineCount: number;
    wordCount: number;
    percentage: number;
  }[];
  locations: {
    name: string;
    sceneCount: number;
    intExt: string;
  }[];
  scenes: {
    number: string;
    heading: string;
    pageStart: number;
    pageLength: string;
    intExt: string;
    time: string;
    characters: string[];
  }[];
}

export const REVISION_COLORS = [
  {
    name: 'White',
    hex: '#f8fafc',
    bg: '#ffffff',
    text: '#0f172a',
    label: '1st Draft (White)',
  },
  {
    name: 'Blue',
    hex: '#60a5fa',
    bg: '#eff6ff',
    text: '#1e3a8a',
    label: '2nd Revision (Blue)',
  },
  {
    name: 'Pink',
    hex: '#f472b6',
    bg: '#fdf2f8',
    text: '#831843',
    label: '3rd Revision (Pink)',
  },
  {
    name: 'Yellow',
    hex: '#facc15',
    bg: '#fefce8',
    text: '#713f12',
    label: '4th Revision (Yellow)',
  },
  {
    name: 'Green',
    hex: '#4ade80',
    bg: '#f0fdf4',
    text: '#14532d',
    label: '5th Revision (Green)',
  },
  {
    name: 'Goldenrod',
    hex: '#fb923c',
    bg: '#fff7ed',
    text: '#7c2d12',
    label: '6th Revision (Goldenrod)',
  },
  {
    name: 'Buff',
    hex: '#d8b4fe',
    bg: '#faf5ff',
    text: '#581c87',
    label: '7th Revision (Buff)',
  },
  {
    name: 'Salmon',
    hex: '#fb7185',
    bg: '#fff1f2',
    text: '#881337',
    label: '8th Revision (Salmon)',
  },
  {
    name: 'Cherry',
    hex: '#e11d48',
    bg: '#ffe4e6',
    text: '#9f1239',
    label: '9th Revision (Cherry)',
  },
];

export const ELEMENT_DEFINITIONS: {
  type: ScreenplayElementType;
  label: string;
  shortcut: string;
  description: string;
  placeholder: string;
}[] = [
  {
    type: 'scene_heading',
    label: 'Scene Heading',
    shortcut: 'Ctrl+1',
    description: 'INT. hoặc EXT. kèm bối cảnh và thời gian (ALL CAPS)',
    placeholder: 'INT. PHÒNG KHÁCH - NGÀY',
  },
  {
    type: 'action',
    label: 'Action',
    shortcut: 'Ctrl+2',
    description: 'Mô tả hình ảnh và hành động ở thì hiện tại',
    placeholder: 'Mô tả bối cảnh và hành động của nhân vật...',
  },
  {
    type: 'character',
    label: 'Character',
    shortcut: 'Ctrl+3',
    description: 'Tên nhân vật phát biểu (ALL CAPS, thụt lề 3.7")',
    placeholder: 'TÊN NHÂN VẬT',
  },
  {
    type: 'parenthetical',
    label: 'Parenthetical',
    shortcut: 'Ctrl+4',
    description: 'Chỉ dẫn diễn xuất trong ngoặc đơn (thụt lề 3.1")',
    placeholder: '(thì thầm)',
  },
  {
    type: 'dialogue',
    label: 'Dialogue',
    shortcut: 'Ctrl+5',
    description: 'Lời thoại của nhân vật (thụt lề 2.5", rộng 3.5")',
    placeholder: 'Lời thoại của nhân vật...',
  },
  {
    type: 'transition',
    label: 'Transition',
    shortcut: 'Ctrl+6',
    description: 'Chuyển cảnh (CUT TO:, FADE OUT., căn phải)',
    placeholder: 'CUT TO:',
  },
  {
    type: 'shot',
    label: 'Shot',
    shortcut: 'Ctrl+7',
    description: 'Cỡ cảnh hoặc góc máy chuyên biệt',
    placeholder: 'CLOSE UP TRÊN GƯƠNG MẶT',
  },
  {
    type: 'note',
    label: 'Note / Beat',
    shortcut: 'Ctrl+8',
    description: 'Ghi chú kỹ thuật hoặc phân hồi (không in ra kịch bản)',
    placeholder: '[[Ghi chú sản xuất hoặc âm thanh]]',
  },
];

// Regex patterns for screenplay elements
const SCENE_HEADING_REGEX =
  /^(?:(?:\.?[ \t]*(?:INT|EXT|INT\.?\/EXT|EXT\.?\/INT|I\/E)[.\s]|(?:EST|EXTERIOR|INTERIOR)[.\s])|\.[A-Z0-9])/i;
const TRANSITION_REGEX =
  /^(?:[A-Z0-9\s]+ TO:|(?:FADE IN|FADE OUT|CUT TO|DISSOLVE TO|SMASH CUT TO|MATCH CUT TO|JUMP CUT TO)\.?|>[^<]+)$/i;
const SHOT_REGEX =
  /^(?:ANGLE ON|WIDE SHOT|CLOSE UP|EXTREME CLOSE UP|INSERT|POV|PAN TO|TRACKING SHOT|ESTABLISHING SHOT)/i;
const PARENTHETICAL_REGEX = /^\s*\(.*\)\s*$/;

/**
 * Parse standard Fountain or plain text screenplay into structured elements & metadata
 */
export function parseFountain(rawScript: string): {
  meta: TitlePageMeta;
  elements: ScreenplayElement[];
} {
  const normalized = rawScript.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n');

  const meta: TitlePageMeta = {
    title: '',
    credit: 'written by',
    author: '',
    source: '',
    draft: 'First Draft',
    date: new Date().toLocaleDateString('vi-VN'),
    contact: '',
    notes: '',
  };

  let inTitlePage = true;
  let lineIdx = 0;

  // 1. Extract Title Page metadata
  while (lineIdx < lines.length && inTitlePage) {
    const line = lines[lineIdx].trim();
    if (!line) {
      const nextNonEmpty = lines
        .slice(lineIdx + 1)
        .find((l) => l.trim().length > 0);
      if (
        !nextNonEmpty ||
        !/^(Title|Credit|Author|Authors|Source|Draft date|Date|Contact|Notes):/i.test(
          nextNonEmpty.trim(),
        )
      ) {
        inTitlePage = false;
      }
      lineIdx++;
      continue;
    }

    const match = line.match(
      /^(Title|Credit|Authors?|Source|Draft date|Date|Contact|Notes):\s*(.*)$/i,
    );
    if (match) {
      const key = match[1].toLowerCase();
      const val = match[2].trim();
      if (key === 'title') meta.title = val;
      else if (key === 'credit') meta.credit = val;
      else if (key === 'author' || key === 'authors') meta.author = val;
      else if (key === 'source') meta.source = val;
      else if (key === 'draft date' || key === 'date') meta.date = val;
      else if (key === 'contact') meta.contact = val;
      else if (key === 'notes') meta.notes = val;
      lineIdx++;
    } else {
      inTitlePage = false;
    }
  }

  // 2. Parse screenplay body elements
  const elements: ScreenplayElement[] = [];
  let prevType: ScreenplayElementType = 'action';
  let sceneCount = 0;

  // Collect paragraphs
  const rawParagraphs: string[] = [];
  let currentPara: string[] = [];

  for (let i = lineIdx; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) {
      if (currentPara.length > 0) {
        rawParagraphs.push(currentPara.join('\n'));
        currentPara = [];
      }
    } else {
      currentPara.push(line);
    }
  }
  if (currentPara.length > 0) {
    rawParagraphs.push(currentPara.join('\n'));
  }

  for (const para of rawParagraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    const sublines = trimmed.split('\n');

    // Check Scene Heading
    if (SCENE_HEADING_REGEX.test(sublines[0])) {
      sceneCount++;
      const cleanHeading = sublines[0]
        .replace(/^[\d\s]+(?=(?:INT|EXT|INT\.?\/EXT|EXT\.?\/INT|I\/E))/i, '')
        .replace(/^\.\s*/, '')
        .trim()
        .toUpperCase();
      elements.push({
        id: crypto.randomUUID(),
        type: 'scene_heading',
        text: cleanHeading,
        sceneNumber: String(sceneCount),
      });
      prevType = 'scene_heading';

      // Remaining lines in this paragraph are Action
      if (sublines.length > 1) {
        elements.push({
          id: crypto.randomUUID(),
          type: 'action',
          text: sublines.slice(1).join('\n'),
        });
        prevType = 'action';
      }
      continue;
    }

    // Check Transition
    if (TRANSITION_REGEX.test(trimmed) && trimmed.length < 50) {
      elements.push({
        id: crypto.randomUUID(),
        type: 'transition',
        text: trimmed.replace(/^>\s*/, '').toUpperCase(),
      });
      prevType = 'transition';
      continue;
    }

    // Check Shot
    if (SHOT_REGEX.test(trimmed) && trimmed.length < 60) {
      elements.push({
        id: crypto.randomUUID(),
        type: 'shot',
        text: trimmed.toUpperCase(),
      });
      prevType = 'shot';
      continue;
    }

    // Check Note
    if (trimmed.startsWith('[[') && trimmed.endsWith(']]')) {
      elements.push({
        id: crypto.randomUUID(),
        type: 'note',
        text: trimmed.slice(2, -2).trim(),
      });
      prevType = 'note';
      continue;
    }

    // Check Character + Dialogue block
    const firstLine = sublines[0].trim();
    const isCharacterLine =
      (firstLine.startsWith('@') ||
        (/^[A-Z0-9À-Ỹ\s\-'.()]+$/.test(firstLine) &&
          firstLine.length < 40 &&
          !SCENE_HEADING_REGEX.test(firstLine) &&
          !TRANSITION_REGEX.test(firstLine))) &&
      sublines.length >= 1;

    if (
      isCharacterLine &&
      (sublines.length > 1 ||
        prevType === 'parenthetical' ||
        prevType === 'dialogue' ||
        prevType === 'scene_heading' ||
        prevType === 'action')
    ) {
      const charName = firstLine.replace(/^@/, '').trim().toUpperCase();
      elements.push({
        id: crypto.randomUUID(),
        type: 'character',
        text: charName,
      });
      prevType = 'character';

      let j = 1;
      while (j < sublines.length) {
        const sub = sublines[j].trim();
        if (PARENTHETICAL_REGEX.test(sub)) {
          elements.push({
            id: crypto.randomUUID(),
            type: 'parenthetical',
            text: sub,
          });
          prevType = 'parenthetical';
        } else {
          const dialLines: string[] = [];
          while (
            j < sublines.length &&
            !PARENTHETICAL_REGEX.test(sublines[j].trim())
          ) {
            dialLines.push(sublines[j].trim());
            j++;
          }
          if (dialLines.length > 0) {
            elements.push({
              id: crypto.randomUUID(),
              type: 'dialogue',
              text: dialLines.join(' '),
            });
            prevType = 'dialogue';
          }
          continue;
        }
        j++;
      }
      continue;
    }

    // Default: Action
    elements.push({
      id: crypto.randomUUID(),
      type: 'action',
      text: trimmed,
    });
    prevType = 'action';
  }

  return { meta, elements };
}

/**
 * Serialize elements and title metadata back into standard Fountain text
 */
export function serializeToFountain(
  meta: TitlePageMeta,
  elements: ScreenplayElement[],
): string {
  const chunks: string[] = [];

  // Title Page
  if (meta.title) {
    chunks.push(`Title: ${meta.title}`);
    if (meta.credit) chunks.push(`Credit: ${meta.credit}`);
    if (meta.author) chunks.push(`Author: ${meta.author}`);
    if (meta.source) chunks.push(`Source: ${meta.source}`);
    if (meta.date) chunks.push(`Date: ${meta.date}`);
    if (meta.draft) chunks.push(`Draft: ${meta.draft}`);
    if (meta.contact) chunks.push(`Contact: ${meta.contact}`);
    if (meta.notes) chunks.push(`Notes: ${meta.notes}`);
    chunks.push('\n');
  }

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    const text = el.text.trim();
    if (!text) continue;

    switch (el.type) {
      case 'scene_heading':
        chunks.push(`\n${text.toUpperCase()}\n`);
        break;
      case 'character':
        chunks.push(`\n${text.toUpperCase()}`);
        break;
      case 'parenthetical':
        chunks.push(
          text.startsWith('(') && text.endsWith(')') ? text : `(${text})`,
        );
        break;
      case 'dialogue':
        chunks.push(`${text}\n`);
        break;
      case 'transition':
        chunks.push(`\n> ${text.toUpperCase()}\n`);
        break;
      case 'shot':
        chunks.push(`\n${text.toUpperCase()}\n`);
        break;
      case 'note':
        chunks.push(`\n[[${text}]]\n`);
        break;
      case 'action':
      default:
        chunks.push(`\n${text}\n`);
        break;
    }
  }

  return chunks
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Approximate line height / page count metrics based on industry standards:
 * - 54 lines per US Letter / A4 page
 * - 1 page ≈ 1 minute screen time
 */
export interface VirtualPage {
  pageNumber: number;
  elements: ScreenplayElement[];
}

export function paginateElements(
  elements: ScreenplayElement[],
  linesPerPage = 54,
): VirtualPage[] {
  const pages: VirtualPage[] = [];
  let currentPageElements: ScreenplayElement[] = [];
  let currentLineCount = 0;
  let pageNum = 1;

  function pushPage() {
    if (currentPageElements.length > 0) {
      pages.push({
        pageNumber: pageNum++,
        elements: [...currentPageElements],
      });
      currentPageElements = [];
      currentLineCount = 0;
    }
  }

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    let elementLines = 1;

    switch (el.type) {
      case 'scene_heading':
        elementLines = 3;
        break;
      case 'action':
        elementLines = Math.max(1, Math.ceil(el.text.length / 60)) + 1;
        break;
      case 'character':
        elementLines = 2;
        break;
      case 'parenthetical':
        elementLines = 1;
        break;
      case 'dialogue':
        elementLines = Math.max(1, Math.ceil(el.text.length / 35)) + 1;
        break;
      case 'transition':
      case 'shot':
        elementLines = 2;
        break;
      case 'note':
        elementLines = 1;
        break;
    }

    if (
      el.type === 'character' &&
      currentLineCount + elementLines + 3 > linesPerPage
    ) {
      pushPage();
    } else if (currentLineCount + elementLines > linesPerPage) {
      pushPage();
    }

    currentPageElements.push(el);
    currentLineCount += elementLines;
  }

  if (currentPageElements.length > 0) {
    pages.push({
      pageNumber: pageNum,
      elements: currentPageElements,
    });
  }

  if (pages.length === 0) {
    pages.push({ pageNumber: 1, elements: [] });
  }

  return pages;
}

/**
 * Extract rich production breakdown & statistics from script elements
 */
export function extractScriptBreakdown(
  elements: ScreenplayElement[],
  pages: VirtualPage[],
): ScriptBreakdownStats {
  const totalWords = elements.reduce(
    (sum, el) =>
      sum + (el.text.trim() ? el.text.trim().split(/\s+/).length : 0),
    0,
  );

  const characterMap = new Map<
    string,
    { lineCount: number; wordCount: number }
  >();
  const locationMap = new Map<string, { count: number; intExt: string }>();

  let intScenes = 0;
  let extScenes = 0;
  let dayScenes = 0;
  let nightScenes = 0;

  const scenes: ScriptBreakdownStats['scenes'] = [];
  let currentScene: ScriptBreakdownStats['scenes'][0] | null = null;
  let currentSceneCharacters = new Set<string>();

  for (const el of elements) {
    if (el.type === 'scene_heading') {
      if (currentScene) {
        currentScene.characters = Array.from(currentSceneCharacters);
        scenes.push(currentScene);
      }

      const heading = el.text.trim();
      const isExt = /^EXT/i.test(heading);
      const isInt = /^INT/i.test(heading);
      if (isExt) extScenes++;
      if (isInt) intScenes++;

      const isNight = /\bNIGHT\b/i.test(heading);
      const isDay = /\bDAY\b/i.test(heading);
      if (isNight) nightScenes++;
      else if (isDay) dayScenes++;

      const locName = heading
        .replace(/^(?:INT\.?\s*\/\s*EXT\.?|INT\.?|EXT\.?|I\/E\.?)\s*/i, '')
        .replace(/\s+-\s+.*$/, '')
        .trim();

      if (locName) {
        const existingLoc = locationMap.get(locName);
        if (existingLoc) {
          existingLoc.count++;
        } else {
          locationMap.set(locName, {
            count: 1,
            intExt: isExt ? 'EXT' : isInt ? 'INT' : 'I/E',
          });
        }
      }

      currentSceneCharacters = new Set<string>();
      currentScene = {
        number: el.sceneNumber || String(scenes.length + 1),
        heading,
        pageStart: 1,
        pageLength: '1',
        intExt: isExt ? 'EXT' : 'INT',
        time: isNight ? 'Night' : 'Day',
        characters: [],
      };
    } else if (el.type === 'character') {
      const cleanChar = el.text
        .replace(/\s*\(.*\)\s*$/, '')
        .replace(/^@/, '')
        .trim();
      if (cleanChar) {
        currentSceneCharacters.add(cleanChar);
        const existing = characterMap.get(cleanChar) || {
          lineCount: 0,
          wordCount: 0,
        };
        existing.lineCount++;
        characterMap.set(cleanChar, existing);
      }
    } else if (el.type === 'dialogue') {
      const words = el.text.trim().split(/\s+/).length;
      const lastChar = Array.from(characterMap.keys()).pop();
      if (lastChar) {
        const existing = characterMap.get(lastChar);
        if (existing) existing.wordCount += words;
      }
    }
  }

  if (currentScene) {
    currentScene.characters = Array.from(currentSceneCharacters);
    scenes.push(currentScene);
  }

  const totalDialogueLines = Array.from(characterMap.values()).reduce(
    (sum, c) => sum + c.lineCount,
    0,
  );

  const characters = Array.from(characterMap.entries())
    .map(([name, data]) => ({
      name,
      lineCount: data.lineCount,
      wordCount: data.wordCount,
      percentage:
        totalDialogueLines > 0
          ? Math.round((data.lineCount / totalDialogueLines) * 100)
          : 0,
    }))
    .sort((a, b) => b.lineCount - a.lineCount);

  const locations = Array.from(locationMap.entries())
    .map(([name, data]) => ({
      name,
      sceneCount: data.count,
      intExt: data.intExt,
    }))
    .sort((a, b) => b.sceneCount - a.sceneCount);

  const totalPages = Math.max(1, pages.length);

  return {
    totalPages,
    totalScenes: scenes.length,
    totalWords,
    estimatedRuntimeMinutes: totalPages,
    intScenes,
    extScenes,
    dayScenes,
    nightScenes,
    characters,
    locations,
    scenes,
  };
}

/**
 * Generate a production-ready Final Draft (.fdx) XML document string
 */
export function generateFinalDraftFdx(
  meta: TitlePageMeta,
  elements: ScreenplayElement[],
): string {
  function escapeXml(unsafe: string) {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  const fdxParagraphs: string[] = [];

  elements.forEach((el) => {
    let fdxType = 'Action';
    switch (el.type) {
      case 'scene_heading':
        fdxType = 'Scene Heading';
        break;
      case 'character':
        fdxType = 'Character';
        break;
      case 'parenthetical':
        fdxType = 'Parenthetical';
        break;
      case 'dialogue':
        fdxType = 'Dialogue';
        break;
      case 'transition':
        fdxType = 'Transition';
        break;
      case 'shot':
        fdxType = 'Shot';
        break;
      case 'action':
      default:
        fdxType = 'Action';
        break;
    }

    const sceneNumAttr =
      el.type === 'scene_heading' && el.sceneNumber
        ? ` Number="${escapeXml(el.sceneNumber)}"`
        : '';

    fdxParagraphs.push(`    <Paragraph Type="${fdxType}"${sceneNumAttr}>
      <Text>${escapeXml(el.text)}</Text>
    </Paragraph>`);
  });

  return `<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
<FinalDraft DocumentType="Script" Template="No" Version="3">
  <Content>
${fdxParagraphs.join('\n')}
  </Content>
  <TitlePage>
    <Content>
      <Paragraph Type="Title">
        <Text>${escapeXml(meta.title || 'Untitled')}</Text>
      </Paragraph>
      <Paragraph Type="Credit">
        <Text>${escapeXml(meta.credit || 'written by')}</Text>
      </Paragraph>
      <Paragraph Type="Author">
        <Text>${escapeXml(meta.author || '')}</Text>
      </Paragraph>
      <Paragraph Type="Source">
        <Text>${escapeXml(meta.source || '')}</Text>
      </Paragraph>
      <Paragraph Type="Draft">
        <Text>${escapeXml(meta.draft || 'First Draft')}</Text>
      </Paragraph>
      <Paragraph Type="Date">
        <Text>${escapeXml(meta.date || '')}</Text>
      </Paragraph>
      <Paragraph Type="Contact">
        <Text>${escapeXml(meta.contact || '')}</Text>
      </Paragraph>
    </Content>
  </TitlePage>
</FinalDraft>`;
}

/**
 * Convert parsed screenplay scenes directly into Apexa Production Scene items
 */
export function convertToProductionScenes(
  elements: ScreenplayElement[],
): Item[] {
  const scenes: Item[] = [];
  let sceneIndex = 1;
  let currentHeading = '';
  let currentBody: string[] = [];

  function commitScene() {
    if (!currentHeading) return;
    const isExt = /^EXT/i.test(currentHeading);
    const isNight = /\bNIGHT\b/i.test(currentHeading);
    const location = currentHeading
      .replace(/^(?:INT\.?\s*\/\s*EXT\.?|INT\.?|EXT\.?|I\/E\.?)\s*/i, '')
      .replace(/\s+-\s+.*$/, '')
      .trim();

    scenes.push(
      newItem({
        number: String(sceneIndex++),
        heading: currentHeading,
        synopsis:
          currentBody.slice(0, 3).join(' ').trim() ||
          'Cảnh kịch bản từ Screenplay',
        time: isNight ? 'Night' : 'Day',
        intExt: isExt ? 'EXT' : 'INT',
        location: location || 'Bối cảnh',
        pages: '1',
        status: 'To shoot',
      }),
    );
    currentBody = [];
  }

  for (const el of elements) {
    if (el.type === 'scene_heading') {
      commitScene();
      currentHeading = el.text.trim();
    } else if (el.type === 'action' || el.type === 'dialogue') {
      if (currentBody.length < 5) {
        currentBody.push(el.text.trim());
      }
    }
  }
  commitScene();

  return scenes;
}
