/**
 * analyzeQuestionnaire.ts
 * 
 * Canonical implementation of questionnaire analysis that wires into existing
 * questionHandler utilities. This function:
 * - Accepts questionnaire document, parsed structure, and context documents
 * - Reuses helper functions from questionHandler.ts
 * - Builds thorough QuestionnaireAnalysis object
 * - Handles localStorage quota errors gracefully
 */

import type {
  Document,
  QuestionnaireAnalysis,
  QuestionnaireResponse,
  Evidence
} from '@/types';
import { generateId } from '@/utils/helpers';

/* ============================
   CONSTANTS & CONFIG
============================ */

const STOP_WORDS = new Set(['how', 'does', 'the', 'and', 'what', 'are', 'you', 'with', 'this', 'for']);

const EXTRACTION_ONLY_QUESTIONS = new Set(['Q1', 'Q2', 'Q3', 'Q4', 'Q7', 'Q10']);
const ANALYTICAL_QUESTIONS = new Set(['Q5', 'Q6', 'Q8', 'Q9', 'Q11', 'Q12', 'Q13', 'Q14', 'Q15']);

const PRIORITY_REQUIREMENTS = new Set(['R1', 'R4', 'R7', 'R9', 'R16']);

/* ============================
   HELPERS
============================ */

/**
 * Classify narrative response based on length and content quality
 */
export function classifyNarrative(text: string | undefined): 'complete' | 'incomplete' | 'needs-review' {
  if (!text || !text.trim()) return 'incomplete';
  // A 'complete' response in GDC standards usually needs more depth than 200 chars
  if (text.trim().length < 200) return 'needs-review';
  return 'complete';
}

/**
 * Find evidence signals in context documents based on keywords
 */
export function findEvidenceSignals(
  contextDocs: Document[],
  rawKeywords: string[],
  limit = 3
): Evidence[] {
  const hits: Evidence[] = [];
  // Filter out stop words and short fragments to get meaningful keywords
  const keywords = rawKeywords
    .map(k => k.toLowerCase().replace(/[^a-z0-9]/g, ''))
    .filter(k => k.length > 3 && !STOP_WORDS.has(k));

  for (const doc of contextDocs) {
    const originalText = doc.extractedText || '';
    const searchText = originalText.toLowerCase();
    if (!searchText) continue;

    let score = 0;
    let firstMatchIdx = -1;

    for (const k of keywords) {
      const idx = searchText.indexOf(k);
      if (idx !== -1) {
        score++;
        if (firstMatchIdx === -1) firstMatchIdx = idx;
      }
    }

    if (score === 0) continue;

    const start = Math.max(0, firstMatchIdx - 100);
    const end = Math.min(originalText.length, firstMatchIdx + 250);

    hits.push({
      id: generateId(),
      source: doc.name,
      // Slice from originalText, not searchText, to preserve casing
      text: "..." + originalText.slice(start, end).replace(/\s+/g, ' ').trim() + "...",
      relevanceScore: Math.min(1, score / keywords.length)
    });
  }

  return hits.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, limit);
}

/**
 * Get inspection questions for specific GDC requirement
 */
export function inspectionQuestionsForRequirement(reqId: string): string[] {
  const mapping: Record<string, string[]> = {
    'R1': ['How do you assure yourselves that no student undertakes patient care before meeting competency thresholds?', 'Who sets these thresholds?'],
    'R4': ['How do you determine appropriate supervision levels?', 'Who approves supervisor ratios?'],
    'R7': ['How are patient safety incidents identified?', 'How are serious issues escalated to the GDC?'],
    'R9': ['Who is responsible for curriculum quality oversight?', 'How is effectiveness of changes evaluated?'],
    'R16': ['How do you ensure assessments are valid?', 'How do you assure consistency across sites?']
  };
  return mapping[reqId] || ['How is ongoing compliance monitored and evidenced?'];
}

/* ============================
   MAIN ANALYSIS ENTRY POINT
============================ */

/**
 * Analyze questionnaire document against GDC requirements.
 * Handles localStorage quota errors gracefully by catching and surfacing in results.
 * 
 * @param questionnaireDoc - The questionnaire document being analyzed
 * @param parsed - Parsed questionnaire structure with questions and sections
 * @param contextDocuments - Reference documents to search for evidence
 * @returns QuestionnaireAnalysis with comprehensive assessment
 */
export function analyzeQuestionnaire(
  questionnaireDoc: Document,
  parsed: any,
  contextDocuments: Document[]
): QuestionnaireAnalysis {
  const responses: QuestionnaireResponse[] = [];
  const extractedFields: any[] = [];
  const requirementAssessments: any[] = [];
  const gaps: string[] = [];
  let storageWarning: string | null = null;

  // Attempt to persist intermediate state with quota error handling
  try {
    // Check if localStorage is available and has space
    if (typeof localStorage !== 'undefined') {
      const testKey = '__storage_test__';
      const testData = JSON.stringify({ test: 'data', timestamp: Date.now() });
      localStorage.setItem(testKey, testData);
      localStorage.removeItem(testKey);
    }
  } catch (error) {
    if (error instanceof DOMException && 
        (error.name === 'QuotaExceededError' || error.code === 22)) {
      storageWarning = 'LocalStorage quota exceeded. Analysis results may not persist across sessions. Consider clearing old data or using export features.';
      console.warn('QuotaExceededError detected during analysis:', error);
    }
  }

  const questions = parsed?.questions || [];

  for (const q of questions) {
    const qId = (q.id || '').toUpperCase();
    const answer = q.answer?.trim();
    const label = q.question || qId;

    if (EXTRACTION_ONLY_QUESTIONS.has(qId)) {
      extractedFields.push({
        questionId: qId,
        label,
        value: answer || '(Not stated)',
        status: answer ? 'complete' : 'incomplete'
      });
      if (!answer) gaps.push(`Missing administrative field: ${qId}`);
      continue;
    }

    // Process all analytical questions
    const status = classifyNarrative(answer);
    const evidence = findEvidenceSignals(contextDocuments, label.split(' '));

    if (status !== 'complete') {
      gaps.push(`Insufficient narrative for ${qId}: ${label}`);
    }

    responses.push({
      questionId: qId,
      question: label,
      originalAnswer: answer || '(Not stated)',
      status,
      recommendations: [
        status === 'incomplete' ? 'Immediate action: Provide detailed operational narrative.' : 'Refine response with specific governance owners.',
        'Cross-reference with clinical placement audits.'
      ],
      evidenceReferences: evidence
    });
  }

  /* REQUIREMENTS PROCESSING */
  const requirementSections = parsed?.sections?.filter((s: any) => /^Requirement\s*\d+/i.test(s.title)) || [];
  const seen = new Set<string>();

  for (const sec of requirementSections) {
    const match = sec.title.match(/Requirement\s*(\d+)/i);
    const rId = match ? `R${match[1]}` : sec.title;
    if (seen.has(rId)) continue;
    seen.add(rId);

    const narrative = sec.content?.trim();
    const status = classifyNarrative(narrative);
    const evidence = findEvidenceSignals(contextDocuments, sec.title.split(' '));

    requirementAssessments.push({
      id: rId,
      title: sec.title,
      status,
      isPriority: PRIORITY_REQUIREMENTS.has(rId),
      currentTextSummary: narrative ? narrative.slice(0, 400) : '(Not stated)',
      inspectionQuestions: inspectionQuestionsForRequirement(rId),
      actions: ['Specify governance ownership', 'Link to internal quality assurance (IQA) reports'],
      evidenceAnchors: evidence.map(e => ({
        sourceDocName: e.source,
        signal: e.text
      }))
    });
  }

  // Add storage warning to gaps if detected
  if (storageWarning) {
    gaps.push(storageWarning);
  }

  // Calculate completeness based on items evaluated
  const totalItems = responses.length + extractedFields.length + requirementAssessments.length || 1;
  const completeItems = [
    ...responses, 
    ...extractedFields, 
    ...requirementAssessments
  ].filter(item => item.status === 'complete').length;

  return {
    id: generateId(),
    documentId: questionnaireDoc.id,
    timestamp: new Date(),
    responses,
    extractedFields,
    requirementAssessments,
    overallCompleteness: Math.round((completeItems / totalItems) * 100),
    gapsIdentified: gaps,
    bestPracticeRecommendations: [
      "Ensure all clinical supervisors have documented GDC-specific training.",
      "Implement a centralized dashboard for real-time monitoring of student competency thresholds."
    ]
  };
}
