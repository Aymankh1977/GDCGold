/**
 * Canonical structure builder:
 * - Always emits Q1–Q15 (placeholders if not detected)
 * - Always emits R1–R21 (placeholders if not detected)
 *
 * This prevents "missing questions/requirements" and removes duplication.
 */

export type QuestionnaireItemId = `Q${number}`;
export type RequirementId = `R${number}`;

export type QuestionnaireItemType = 'extraction' | 'analysis';

export interface CanonicalQuestionItem {
  id: QuestionnaireItemId;
  type: QuestionnaireItemType;
  stem: string;
  answerText: string;
  detected: boolean;
}

export interface CanonicalRequirementItem {
  id: RequirementId;
  requirementText: string;
  providerNarrative: string;
  attachEvidencePromptDetected: boolean;
  detected: boolean;
}

export interface CanonicalQuestionnaireModel {
  questions: CanonicalQuestionItem[];
  requirements: CanonicalRequirementItem[];
}

export const EXTRACTION_ONLY_QUESTIONS = new Set<string>([
  'Q1','Q2','Q3','Q4','Q7','Q10'
]);

export const CANONICAL_QUESTION_IDS: QuestionnaireItemId[] = Array.from({ length: 15 }, (_, i) => `Q${i + 1}` as QuestionnaireItemId);

export const CANONICAL_REQUIREMENTS: Array<{ id: RequirementId; text: string }> = [
  { id: 'R1', text: 'Students will provide patient care only when they have demonstrated adequate knowledge and skills. For clinical procedures, the student should be assessed as competent in the relevant skills at the levels required in the pre-clinical environments prior to treating patients.' },
  { id: 'R2', text: 'Providers must have systems in place to inform patients that they may be treated by students and the possible implications of this. Patient agreement to treatment by a student must be obtained and recorded prior to treatment commencing.' },
  { id: 'R3', text: 'Students must only provide patient care in an environment which is safe and appropriate. The provider must comply with relevant legislation and requirements regarding patient care, including equality and diversity, wherever treatment takes place.' },
  { id: 'R4', text: 'When providing patient care and services, providers must ensure that students are supervised appropriately according to the activity and the student’s stage of development.' },
  { id: 'R5', text: 'Supervisors must be appropriately qualified and trained. This should include training in equality and diversity legislation relevant for the role. Clinical supervisors must have appropriate general or specialist registration with a UK regulatory body.' },
  { id: 'R6', text: 'Providers must ensure that students and all those involved in the delivery of education and training are aware of their obligation to raise concerns if they identify any risks to patient safety and the need for candour when things go wrong. Providers should publish policies so that it is clear to all parties how concerns should be raised and how these concerns will be acted upon. Providers must support those who do raise concerns and provide assurance that staff and students will not be penalised for doing so.' },
  { id: 'R7', text: 'Systems must be in place to identify and record issues that may affect patient safety. Should a patient safety issue arise, appropriate action must be taken by the provider and where necessary the relevant regulatory body should be notified.' },
  { id: 'R8', text: 'Providers must have a student fitness to practise policy and apply as required. The content and significance of the student fitness to practise procedures must be conveyed to students and aligned to GDC Student Fitness to Practise Guidance. Staff involved in the delivery of the programme should be familiar with the GDC Student Fitness to Practise Guidance. Providers must also ensure the GDC’s Standards for the Dental Team are embedded within student training.' },
  { id: 'R9', text: 'The provider will have a framework in place that details how it manages the quality of the programme which includes making appropriate changes to ensure the curriculum continues to map across to the latest GDC outcomes and adapts to changing legislation and external guidance. There must be a clear statement about where responsibility lies for this function.' },
  { id: 'R10', text: 'Any concerns identified through the operation of the Quality Management framework, including internal and external reports relating to quality, must be addressed as soon as possible and the GDC notified of serious threats to students achieving the learning outcomes.' },
  { id: 'R11', text: 'Programmes must be subject to rigorous internal and external quality assurance procedures. External quality assurance should include the use of external examiners, who should be familiar with the GDC learning outcomes and their context and QAA guidelines should be followed where applicable. Patient and/or customer feedback must be collected and used to inform programme development.' },
  { id: 'R12', text: 'The provider must have effective systems in place to quality assure placements where students deliver treatment to ensure that patient care and student assessment across all locations meets these Standards. The quality assurance systems should include the regular collection of student and patient feedback relating to placements.' },
  { id: 'R13', text: 'To award the qualification, providers must be assured that students have demonstrated attainment across the full range of learning outcomes, and that they are fit to practise at the level of a safe beginner. Evidence must be provided that demonstrates this assurance, which should be supported by a coherent approach to the principles of assessment referred to in these standards.' },
  { id: 'R14', text: 'The provider must have in place effective management systems to plan, monitor and centrally record the assessment of students, including the monitoring of clinical and/or technical experience, throughout the programme against each of the learning outcomes.' },
  { id: 'R15', text: 'Students must have exposure to an appropriate breadth of patients and procedures and should undertake each activity relating to patient care on sufficient occasions to enable them to develop the skills and the level of competency to achieve the relevant learning outcomes.' },
  { id: 'R16', text: 'Providers must demonstrate that assessments are fit for purpose and deliver results which are valid and reliable. The methods of assessment used must be appropriate to the learning outcomes, in line with current and best practice and be routinely monitored, quality assured and developed.' },
  { id: 'R17', text: 'Assessment must utilise feedback collected from a variety of sources, which should include other members of the dental team, peers, patients and/or customers.' },
  { id: 'R18', text: 'The provider must support students to improve their performance by providing regular feedback and by encouraging students to reflect on their practise.' },
  { id: 'R19', text: 'Examiners/assessors must have appropriate skills, experience and training to undertake the task of assessment, including appropriate general or specialist registration with a UK regulatory body. Examiners/assessors should have received training in equality and diversity relevant for their role.' },
  { id: 'R20', text: 'Providers must ask external examiners to report on the extent to which assessment processes are rigorous, set at the correct standard, ensure equity of treatment for students and have been fairly conducted. The responsibilities of the external examiners must be clearly documented.' },
  { id: 'R21', text: 'Assessment must be fair and undertaken against clear criteria. The standard expected of students in each area to be assessed must be clear and students and staff involved in assessment must be aware of this standard. An appropriate standard setting process must be employed for summative assessments.' },
];

function normalizeWhitespace(s: string): string {
  return (s || '').replace(/\r/g, '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * Extract detected Q blocks (best-effort). We later fill missing Qs with placeholders.
 */
function extractDetectedQBlocks(rawText: string): Array<{ id: QuestionnaireItemId; stem: string; answer: string; start: number }> {
  const text = normalizeWhitespace(rawText);

  const headerRe = /(^|\n)\s*(?:Q\s*(\d{1,2})\b|Question\s*(\d{1,2})\b)\s*[:.\-]?\s*([^\n]{0,240})/gi;

  const hits: Array<{ id: QuestionnaireItemId; stem: string; start: number; headerEnd: number }> = [];
  let m: RegExpExecArray | null;

  while ((m = headerRe.exec(text)) !== null) {
    const n = parseInt(m[2] || m[3] || '', 10);
    if (!Number.isFinite(n) || n < 1 || n > 15) continue;

    const id = `Q${n}` as QuestionnaireItemId;
    const stem = (m[4] || '').trim() || `Question ${n}`;
    hits.push({ id, stem, start: m.index, headerEnd: headerRe.lastIndex });
  }

  hits.sort((a, b) => a.start - b.start);

  // keep earliest occurrence per Q id
  const first = new Map<string, { id: QuestionnaireItemId; stem: string; start: number; headerEnd: number }>();
  for (const h of hits) if (!first.has(h.id)) first.set(h.id, h);

  const ordered = Array.from(first.values()).sort((a, b) => a.start - b.start);

  const blocks: Array<{ id: QuestionnaireItemId; stem: string; answer: string; start: number }> = [];
  for (let i = 0; i < ordered.length; i++) {
    const cur = ordered[i];
    const nextStart = ordered[i + 1]?.start ?? text.length;
    const segment = normalizeWhitespace(text.slice(cur.headerEnd, nextStart));
    blocks.push({ id: cur.id, stem: cur.stem, answer: segment, start: cur.start });
  }

  return blocks;
}

/**
 * Extract requirement narratives (best-effort). We always output all R1–R21 in canonical order.
 */
function extractRequirementNarratives(rawText: string): Map<RequirementId, { narrative: string; attachDetected: boolean; detected: boolean; start: number }> {
  const text = normalizeWhitespace(rawText);

  const reqHeaderRe = /(^|\n)\s*Requirement\s*(\d{1,2})\b\s*[:.\-]?\s*/gi;
  const hits: Array<{ id: RequirementId; start: number; headerEnd: number }> = [];

  let m: RegExpExecArray | null;
  while ((m = reqHeaderRe.exec(text)) !== null) {
    const n = parseInt(m[2] || '', 10);
    if (!Number.isFinite(n) || n < 1 || n > 21) continue;
    hits.push({ id: `R${n}` as RequirementId, start: m.index, headerEnd: reqHeaderRe.lastIndex });
  }

  hits.sort((a, b) => a.start - b.start);

  // keep earliest occurrence per R id (dedupe)
  const first = new Map<string, { id: RequirementId; start: number; headerEnd: number }>();
  for (const h of hits) if (!first.has(h.id)) first.set(h.id, h);

  const ordered = Array.from(first.values()).sort((a, b) => a.start - b.start);

  const out = new Map<RequirementId, { narrative: string; attachDetected: boolean; detected: boolean; start: number }>();
  for (let i = 0; i < ordered.length; i++) {
    const cur = ordered[i];
    const nextStart = ordered[i + 1]?.start ?? text.length;
    const seg = normalizeWhitespace(text.slice(cur.headerEnd, nextStart));

    const attachDetected = /attach\s+evidence/i.test(seg);
    let narrative = seg;
    const attachIdx = seg.search(/attach\s+evidence/i);
    if (attachIdx >= 0) narrative = seg.slice(0, attachIdx).trim();

    out.set(cur.id, { narrative, attachDetected, detected: true, start: cur.start });
  }

  // ensure all exist
  for (const r of CANONICAL_REQUIREMENTS) {
    if (!out.has(r.id)) out.set(r.id, { narrative: '', attachDetected: false, detected: false, start: -1 });
  }

  return out;
}

export function buildCanonicalQuestionnaireModel(rawText: string): CanonicalQuestionnaireModel {
  const detected = extractDetectedQBlocks(rawText);
  const byId = new Map<string, { stem: string; answer: string }>();
  for (const b of detected) byId.set(b.id, { stem: b.stem, answer: b.answer });

  const questions: CanonicalQuestionItem[] = CANONICAL_QUESTION_IDS.map((id) => {
    const found = byId.get(id);
    const stem = found?.stem || `${id} (not detected in extracted text)`;
    const answerText = found?.answer || '';
    return {
      id,
      type: EXTRACTION_ONLY_QUESTIONS.has(id) ? 'extraction' : 'analysis',
      stem,
      answerText,
      detected: Boolean(found),
    };
  });

  const reqMap = extractRequirementNarratives(rawText);

  const requirements: CanonicalRequirementItem[] = CANONICAL_REQUIREMENTS.map((r) => {
    const found = reqMap.get(r.id);
    return {
      id: r.id,
      requirementText: r.text,
      providerNarrative: found?.narrative || '',
      attachEvidencePromptDetected: Boolean(found?.attachDetected),
      detected: Boolean(found?.detected),
    };
  });

  return { questions, requirements };
}
