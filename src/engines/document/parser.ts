export interface ParsedSection {
  id: string;
  title: string;
  content: string;
  answerOnly: string;
  type: 'question' | 'requirement' | 'other';
}

/**
 * EXACT phrases from the GDC template where the prompt ends.
 */
const SPLIT_MARKERS = [
  "how these plans assure you that the requirement is/will be met",
  "prior to treating patients Describe, in detail, your plans",
  "patient care commencing Describe, in detail, your plans",
  "shadowing)",
  "not applicable",
  "intake",
  "each year of study",
  "involvement and role",
  "undertaken at each",
  "last monitoring form",
  "leads to GDC registration",
  "awarding body",
  "qualification",
  "Provider Name"
];

function cleanNarrative(text: string): string {
  let cleaned = text;
  for (const marker of SPLIT_MARKERS) {
    const idx = cleaned.toLowerCase().lastIndexOf(marker.toLowerCase());
    if (idx !== -1) {
      cleaned = cleaned.slice(idx + marker.length);
    }
  }
  return cleaned.replace(/^[:.\-–—\s]*/, '').trim();
}

export function parseDocument(text: string): { sections: ParsedSection[], questions: any[] } {
  const normalized = (text || '').replace(/\[PAGE\s*\d+\]/gi, '').replace(/\s+/g, ' ').trim();
  const questions: any[] = [];
  const sections: ParsedSection[] = [];

  const masterRegex = /\b(Q|Requirement)\s*(\d{1,2})\b/gi;
  const markers: any[] = [];
  let m;
  while ((m = masterRegex.exec(normalized)) !== null) {
    markers.push({ id: `${m[1][0].toUpperCase()}${m[2]}`, type: m[1].toLowerCase() === 'q' ? 'question' : 'requirement', idx: m.index });
  }

  for (let i = 0; i < markers.length; i++) {
    const start = markers[i].idx;
    const end = markers[i + 1]?.idx ?? normalized.length;
    const block = normalized.slice(start, end).trim();
    
    const answerOnly = cleanNarrative(block);
    const stem = block.slice(0, block.length - answerOnly.length).trim();

    if (markers[i].type === 'question') {
      questions.push({ id: markers[i].id, question: stem, answer: answerOnly });
    }

    sections.push({
      id: markers[i].id,
      title: stem.slice(0, 120),
      content: block,
      answerOnly: answerOnly,
      type: markers[i].type as any
    });
  }

  return { sections, questions };
}