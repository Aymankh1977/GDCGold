/* src/analysis/goldStandardGenerator.ts
   Lightweight generator to synthesise three-layer "gold standard" guidance
   for a GDC requirement when an explicit gold-standard phrasing is not
   present in the reference documents.

   Layers:
   - layer1: concise core requirement statement (what must be true)
   - layer2: operational best-practice (how to implement / what to do)
   - layer3: evidence & metrics (what to provide/show to demonstrate)
*/

import type { Document } from '@/types';

/**
 * Minimal structure for a generated gold standard layer.
 */
export interface GoldLayer {
  level: 1 | 2 | 3;
  title: string;
  statement: string;
}

/**
 * Result of generation for a single requirement.
 */
export interface GoldStandard {
  requirementId: number;
  generatedAt: string;
  layers: GoldLayer[];
  signals: string[]; // short list of extracted signals used to craft the output
}

/**
 * Create a simple keyword extraction from text.
 * (Purpose: small, deterministic helper — no external deps.)
 */
function extractSignalsFromText(text: string, limit = 8): string[] {
  if (!text) return [];
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .filter(w => w.length > 3);

  const freq = new Map<string, number>();
  for (const w of words) freq.set(w, (freq.get(w) || 0) + 1);

  // sort by frequency and return the top items
  const sorted = Array.from(freq.entries()).sort((a, b) => b[1] - a[1]);
  return sorted.slice(0, limit).map(s => s[0]);
}

/**
 * Compose three layer gold-standard text given requirement id and available context.
 * - requirementId: numeric id (e.g., 1..21)
 * - mainText: narrative extracted for the requirement (may be short/missing)
 * - contextDocs: other documents (exam reports, programme docs) to mine signals from
 */
export function generateGoldStandard(
  requirementId: number,
  mainText: string | undefined,
  contextDocs: Document[] = []
): GoldStandard {
  const now = new Date().toISOString();

  // Combine texts for signal extraction
  const combinedTextParts: string[] = [];
  if (mainText) combinedTextParts.push(mainText);
  for (const d of contextDocs) {
    if (d.extractedText) combinedTextParts.push(d.extractedText);
  }
  const combinedText = combinedTextParts.join('\n\n');

  const signals = extractSignalsFromText(combinedText);

  // Layer 1: concise assertion — focus on the requirement intent
  const layer1 = {
    level: 1 as 1,
    title: 'Core requirement (concise)',
    statement:
      mainText && mainText.trim().length > 60
        ? summarizeToOneLine(mainText)
        : `Students must demonstrate required knowledge, clinical skills and professional behaviours before providing patient care under this requirement (R${requirementId}).`
  };

  // Layer 2: operational best-practice — specific actions, governance ownership
  const layer2 = {
    level: 2 as 2,
    title: 'Operational best-practice',
    statement: generateOperationalPractice(requirementId, signals)
  };

  // Layer 3: evidence & metrics — what to provide to show compliance
  const layer3 = {
    level: 3 as 3,
    title: 'Evidence & metrics (what to show)',
    statement: generateEvidenceList(requirementId, signals)
  };

  return {
    requirementId,
    generatedAt: now,
    layers: [layer1, layer2, layer3],
    signals
  };
}

/* ----------------------
   Small internal helpers
   ---------------------- */

function summarizeToOneLine(text: string, max = 200): string {
  const s = text.replace(/\s+/g, ' ').trim();
  if (s.length <= max) return s;
  return s.slice(0, max).trim() + '...';
}

function generateOperationalPractice(requirementId: number, signals: string[]): string {
  // Use signals to tailor the advice; keep deterministic and conservative.
  const key = signals.slice(0, 4);
  const ownership = 'Programme Lead with clear QA escalation to School/Faculty governance';
  const steps: string[] = [
    `Define explicit competency thresholds and prerequisites for clinical activity.`,
    `Require pre-clinical sign-off (phantom-head / simulated assessments / observed milestones) before patient contacts.`,
    `Maintain documented supervisor-to-student ratios and supervisor training records.`,
    `Adopt gateways or milestone assessments with documented standard-setting (e.g., Angoff, borderline regression) and moderation.`
  ];

  if (key.length > 0) {
    // Add tailored point referencing high-frequency signals
    steps.push(`Ensure curriculum documents explicitly reference: ${key.join(', ')}.`);
  }

  return `${ownership} should implement the following: ${steps.join(' ')}`;
}

function generateEvidenceList(requirementId: number, signals: string[]): string {
  const items: string[] = [
    'Policy or procedure documents that state when and how students may treat patients.',
    'Records of pre-clinical and clinical gate assessments, with dates and sign-offs.',
    'Supervisor training logs and supervision allocation spreadsheets (ratios).',
    'Examples of mapped assessments (blueprints) showing alignment to the learning outcomes and requirement.',
    'Logs from the student e-portfolio demonstrating milestones and CAFs (or equivalent) per clinical encounter.'
  ];

  if (signals.length > 0) {
    items.unshift(`Searchable signals found in supplied documents: ${signals.slice(0, 6).join(', ')}.`);
  }

  return `Suggested evidence (examples): ${items.join(' | ')}`;
}
