/**
 * analyzeQuestionnaire.test.ts
 * 
 * Unit tests for the canonical analyzeQuestionnaire implementation
 */

import { describe, it, expect } from 'vitest';
import { 
  analyzeQuestionnaire, 
  classifyNarrative, 
  findEvidenceSignals,
  inspectionQuestionsForRequirement 
} from '../../src/analysis/analyzeQuestionnaire';
import type { Document } from '../../src/types';

// Test fixtures
const mockQuestionnaireDoc: Document = {
  id: 'doc_questionnaire_1',
  name: 'Sample PIQ.pdf',
  type: 'pdf',
  size: 50000,
  uploadedAt: new Date('2024-01-15'),
  extractedText: 'Sample questionnaire content',
  metadata: { pages: 10 },
  status: 'completed',
  category: 'pre-inspection-questionnaire'
};

const mockContextDocs: Document[] = [
  {
    id: 'doc_context_1',
    name: 'Quality Assurance Policy.pdf',
    type: 'pdf',
    size: 30000,
    uploadedAt: new Date('2024-01-10'),
    extractedText: 'This document describes our quality assurance framework and governance structures for clinical education. All supervisors must maintain appropriate ratios and documentation.',
    metadata: { pages: 5 },
    status: 'completed',
    category: 'policy'
  },
  {
    id: 'doc_context_2',
    name: 'Clinical Placement Guide.docx',
    type: 'docx',
    size: 20000,
    uploadedAt: new Date('2024-01-12'),
    extractedText: 'Students must complete competency assessments before patient care. The assessment framework ensures safety and professionalism.',
    metadata: { pages: 8 },
    status: 'completed',
    category: 'evidence'
  }
];

const mockParsedQuestionnaire = {
  questions: [
    {
      id: 'Q1',
      question: 'Institution name',
      answer: 'University Dental School'
    },
    {
      id: 'Q2',
      question: 'Programme title',
      answer: 'BDS - Bachelor of Dental Surgery'
    },
    {
      id: 'Q6',
      question: 'Describe your curriculum structure',
      answer: 'The programme consists of five years with progressive clinical integration. Year 1-2 focus on pre-clinical sciences and simulation. Year 3-5 involve patient care under supervision with increasing independence. Students must pass gateway assessments before clinical entry.'
    },
    {
      id: 'Q11',
      question: 'Describe your governance structure',
      answer: 'Brief structure'
    }
  ],
  sections: [
    {
      title: 'Requirement 1 - Patient Care Preparation',
      content: 'All students complete comprehensive simulation training and must achieve sign-off from qualified educators before treating patients. Our electronic patient management system enforces this requirement by blocking clinical access until competency is confirmed.',
      type: 'requirement'
    },
    {
      title: 'Requirement 4 - Supervision',
      content: 'Limited description'
    }
  ]
};

describe('classifyNarrative', () => {
  it('should classify empty text as incomplete', () => {
    expect(classifyNarrative('')).toBe('incomplete');
    expect(classifyNarrative(undefined)).toBe('incomplete');
    expect(classifyNarrative('   ')).toBe('incomplete');
  });

  it('should classify short text as needs-review', () => {
    expect(classifyNarrative('Short answer')).toBe('needs-review');
    expect(classifyNarrative('A bit longer but still under 200 characters total')).toBe('needs-review');
  });

  it('should classify long text as complete', () => {
    const longText = 'This is a comprehensive narrative that provides detailed information about the processes, governance structures, and operational controls in place. It includes specific examples and references to policies. The text is sufficiently detailed to meet GDC standards.';
    expect(classifyNarrative(longText)).toBe('complete');
  });
});

describe('findEvidenceSignals', () => {
  it('should find evidence in context documents', () => {
    const keywords = ['quality', 'assurance', 'governance'];
    const evidence = findEvidenceSignals(mockContextDocs, keywords, 2);
    
    expect(evidence.length).toBeGreaterThan(0);
    expect(evidence.length).toBeLessThanOrEqual(2);
    expect(evidence[0]).toHaveProperty('source');
    expect(evidence[0]).toHaveProperty('text');
    expect(evidence[0]).toHaveProperty('relevanceScore');
  });

  it('should return empty array when no keywords match', () => {
    const keywords = ['xyz123', 'nonexistent', 'fakekeyword'];
    const evidence = findEvidenceSignals(mockContextDocs, keywords);
    
    expect(evidence).toEqual([]);
  });

  it('should filter out stop words', () => {
    const keywords = ['the', 'how', 'quality', 'and'];
    const evidence = findEvidenceSignals(mockContextDocs, keywords);
    
    // Should find 'quality' but ignore stop words
    expect(evidence.length).toBeGreaterThan(0);
  });

  it('should respect the limit parameter', () => {
    const keywords = ['quality', 'students', 'assessment'];
    const evidence = findEvidenceSignals(mockContextDocs, keywords, 1);
    
    expect(evidence.length).toBeLessThanOrEqual(1);
  });
});

describe('inspectionQuestionsForRequirement', () => {
  it('should return specific questions for known requirements', () => {
    const questions = inspectionQuestionsForRequirement('R1');
    
    expect(questions).toHaveLength(2);
    expect(questions[0]).toContain('competency thresholds');
  });

  it('should return default question for unknown requirements', () => {
    const questions = inspectionQuestionsForRequirement('R99');
    
    expect(questions).toHaveLength(1);
    expect(questions[0]).toContain('compliance monitored');
  });
});

describe('analyzeQuestionnaire', () => {
  it('should return a complete QuestionnaireAnalysis object', () => {
    const result = analyzeQuestionnaire(
      mockQuestionnaireDoc,
      mockParsedQuestionnaire,
      mockContextDocs
    );

    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('documentId', mockQuestionnaireDoc.id);
    expect(result).toHaveProperty('timestamp');
    expect(result).toHaveProperty('responses');
    expect(result).toHaveProperty('extractedFields');
    expect(result).toHaveProperty('requirementAssessments');
    expect(result).toHaveProperty('overallCompleteness');
    expect(result).toHaveProperty('gapsIdentified');
    expect(result).toHaveProperty('bestPracticeRecommendations');
  });

  it('should extract administrative fields', () => {
    const result = analyzeQuestionnaire(
      mockQuestionnaireDoc,
      mockParsedQuestionnaire,
      mockContextDocs
    );

    expect(result.extractedFields.length).toBe(2);
    expect(result.extractedFields[0]).toHaveProperty('questionId', 'Q1');
    expect(result.extractedFields[0]).toHaveProperty('value', 'University Dental School');
    expect(result.extractedFields[0]).toHaveProperty('status', 'complete');
  });

  it('should process analytical questions', () => {
    const result = analyzeQuestionnaire(
      mockQuestionnaireDoc,
      mockParsedQuestionnaire,
      mockContextDocs
    );

    expect(result.responses.length).toBe(2);
    
    const q6Response = result.responses.find(r => r.questionId === 'Q6');
    expect(q6Response).toBeDefined();
    expect(q6Response?.status).toBe('complete');
    expect(q6Response?.recommendations).toBeDefined();
    expect(q6Response?.recommendations.length).toBeGreaterThan(0);
  });

  it('should process requirement sections', () => {
    const result = analyzeQuestionnaire(
      mockQuestionnaireDoc,
      mockParsedQuestionnaire,
      mockContextDocs
    );

    expect(result.requirementAssessments.length).toBe(2);
    
    const r1Assessment = result.requirementAssessments.find(r => r.id === 'R1');
    expect(r1Assessment).toBeDefined();
    expect(r1Assessment?.status).toBe('complete');
    expect(r1Assessment?.isPriority).toBe(true);
    expect(r1Assessment?.inspectionQuestions).toBeDefined();
  });

  it('should identify gaps for incomplete responses', () => {
    const result = analyzeQuestionnaire(
      mockQuestionnaireDoc,
      mockParsedQuestionnaire,
      mockContextDocs
    );

    expect(result.gapsIdentified).toBeDefined();
    expect(Array.isArray(result.gapsIdentified)).toBe(true);
    
    // Q11 has a brief answer, should be flagged
    const hasGapForQ11 = result.gapsIdentified.some(gap => gap.includes('Q11'));
    expect(hasGapForQ11).toBe(true);
  });

  it('should calculate overall completeness percentage', () => {
    const result = analyzeQuestionnaire(
      mockQuestionnaireDoc,
      mockParsedQuestionnaire,
      mockContextDocs
    );

    expect(result.overallCompleteness).toBeGreaterThanOrEqual(0);
    expect(result.overallCompleteness).toBeLessThanOrEqual(100);
    expect(typeof result.overallCompleteness).toBe('number');
  });

  it('should provide best practice recommendations', () => {
    const result = analyzeQuestionnaire(
      mockQuestionnaireDoc,
      mockParsedQuestionnaire,
      mockContextDocs
    );

    expect(result.bestPracticeRecommendations).toBeDefined();
    expect(result.bestPracticeRecommendations.length).toBeGreaterThan(0);
    expect(typeof result.bestPracticeRecommendations[0]).toBe('string');
  });

  it('should handle empty questionnaire data', () => {
    const emptyParsed = {
      questions: [],
      sections: []
    };

    const result = analyzeQuestionnaire(
      mockQuestionnaireDoc,
      emptyParsed,
      mockContextDocs
    );

    expect(result.responses).toEqual([]);
    expect(result.extractedFields).toEqual([]);
    expect(result.requirementAssessments).toEqual([]);
    expect(result.overallCompleteness).toBeDefined();
  });
});
