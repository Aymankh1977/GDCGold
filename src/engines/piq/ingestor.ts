import { Document } from '@/types';
import { PIQ_QUESTIONS, PIQ_REQUIREMENTS } from '@/config/piq';

export function ingestProgramDocument(doc: Document) {
  const text = (doc?.extractedText || '').trim();
  if (!text) return { inferred: {}, confidence: {} };

  const inferred: Record<string, string> = {};
  const confidence: Record<string, number> = {};

  for (const q of PIQ_QUESTIONS) {
    const keywords = q.title.split(/\s+/).slice(0, 5).map(s => s.toLowerCase().replace(/[^\w]/g, ''));
    const match = findBestParagraphForKeywords(text, keywords);
    if (match) {
      inferred[q.id] = match;
      confidence[q.id] = Math.min(0.95, 0.2 + (keywords.length > 0 ? 0.2 : 0.1));
    } else {
      confidence[q.id] = 0;
    }
  }

  for (const r of PIQ_REQUIREMENTS) {
    const keywords = (r.title || '').split(/\s+/).slice(0, 6).map(s => s.toLowerCase().replace(/[^\w]/g, ''));
    const match = findBestParagraphForKeywords(text, keywords);
    if (match) {
      inferred[`R${r.id}`] = match;
      confidence[`R${r.id}`] = Math.min(0.95, 0.1 + (keywords.length > 0 ? 0.25 : 0.1));
    } else {
      confidence[`R${r.id}`] = 0;
    }
  }

  return { inferred, confidence };
}

function splitIntoParagraphs(text: string) {
  return text.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
}

function tokenize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
}

function findBestParagraphForKeywords(text: string, keywords: string[]) {
  const paras = splitIntoParagraphs(text);
  let bestScore = 0;
  let bestPara: string | null = null;
  for (const p of paras) {
    const tokens = new Set(tokenize(p));
    let score = 0;
    for (const k of keywords) {
      if (tokens.has(k)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      bestPara = p;
    }
  }
  return bestScore > 0 ? bestPara : null;
}