/**
 * questionHandler.ts
 * 
 * Re-exports the canonical analyzeQuestionnaire implementation from src/analysis
 * and provides helper utilities for questionnaire processing.
 */

// Re-export canonical implementation
export {
  analyzeQuestionnaire,
  classifyNarrative,
  findEvidenceSignals,
  inspectionQuestionsForRequirement
} from '@/analysis/analyzeQuestionnaire';