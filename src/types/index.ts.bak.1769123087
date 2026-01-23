export interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'doc';
  size: number;
  uploadedAt: Date;
  extractedText: string;
  metadata: DocumentMetadata;
  category: DocumentCategory;
}

export interface DocumentMetadata {
  pages?: number;
  author?: string;
  createdDate?: Date;
  modifiedDate?: Date;
  keywords?: string[];
}

export type DocumentCategory =
  | 'inspection-report'
  | 'pre-inspection-questionnaire'
  | 'evidence'
  | 'policy'
  | 'other';

export interface GDCRequirement {
  id: number;
  standard: number;
  title: string;
  description: string;
  evidenceExamples: string[];
}

export interface GDCStandard {
  id: number;
  name: string;
  description: string;
  requirements: GDCRequirement[];
}

export interface RequirementResult {
  requirementId: number;
  status: ComplianceStatus;
  evidence: Evidence[];
  gaps: string[];
  recommendations: string[];
  confidenceScore: number;
  currentTextSummary?: string; // NEW
}

export type ComplianceStatus = 'met' | 'partially-met' | 'not-met';

export interface Evidence {
  id: string;
  text: string;
  source: string;
  page?: number;
  section?: string;
  relevanceScore: number;
}

export interface QuestionnaireResponse {
  questionId: string;
  question: string;
  originalAnswer?: string;
  status: 'complete' | 'incomplete' | 'needs-review';
  recommendations: string[];
  evidenceReferences: Evidence[];
}

export interface RequirementNarrativeFinding {
  id: string;
  title: string;
  status: 'complete' | 'incomplete' | 'needs-review';
  currentTextSummary: string; // This will hold the "Provider Narrative"
  gaps: string[];
  actions: string[];
  evidenceAnchors: Array<{ sourceDocName: string; signal: string }>;
}

export interface QuestionnaireAnalysis {
  id: string;
  documentId: string;
  timestamp: Date;
  responses: QuestionnaireResponse[];
  extractedFields: any[];
  requirementAssessments: RequirementNarrativeFinding[];
  overallCompleteness: number;
  gapsIdentified: string[];
  bestPracticeRecommendations: string[];
}