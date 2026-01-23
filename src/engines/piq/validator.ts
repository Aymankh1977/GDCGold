import { Document } from '@/types';
import { PIQ_QUESTIONS, PIQ_REQUIREMENTS } from '@/config/piq';

export function validatePIQDocument(doc: Document) {
  const text = (doc?.extractedText || '').trim();
  const found: Record<string, string> = {};
  const missing: string[] = [];

  for (const q of PIQ_QUESTIONS) {
    const id = q.id;
    const title = (q.title || '').toLowerCase();
    const patterns = [`${id.toLowerCase()}`, title.toLowerCase()];
    const match = findAnswerForQuestion(text, patterns);
    if (match) found[id] = match;
    else missing.push(id);
  }

  const reqFound: Record<number, string> = {};
  const reqMissing: number[] = [];
  for (const r of PIQ_REQUIREMENTS) {
    const marker = `requirement ${r.id}`;
    const alt = `r${r.id}`;
    const match = findAnswerForQuestion(text, [marker, alt, r.title || '']);
    if (match) reqFound[r.id] = match;
    else reqMissing.push(r.id);
  }

  const totalQs = PIQ_QUESTIONS.length + PIQ_REQUIREMENTS.length;
  const filled = Object.keys(found).length + Object.keys(reqFound).length;
  const score = Math.round((filled / totalQs) * 100);

  return {
    questionsFound: found,
    questionsMissing: missing,
    requirementsFound: reqFound,
    requirementsMissing: reqMissing,
    completenessScore: score
  };
}

function findAnswerForQuestion(fullText: string, patterns: string[]) {
  if (!fullText) return null;
  const lower = fullText.toLowerCase();
  for (const p of patterns) {
    if (!p) continue;
    const idx = lower.indexOf(p.toLowerCase());
    if (idx >= 0) {
      const start = idx + p.length;
      const excerpt = fullText.substring(start, Math.min(fullText.length, start + 400)).trim();
      if (excerpt) return excerpt;
    }
  }
  return null;
}