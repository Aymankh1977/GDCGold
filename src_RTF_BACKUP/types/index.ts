{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 // Document Types\
export interface Document \{\
  id: string;\
  name: string;\
  type: 'pdf' | 'docx' | 'doc';\
  size: number;\
  uploadedAt: Date;\
  content: string;\
  extractedText: string;\
  metadata: DocumentMetadata;\
  status: 'pending' | 'processing' | 'completed' | 'error';\
  category: DocumentCategory;\
\}\
\
export interface DocumentMetadata \{\
  pages?: number;\
  author?: string;\
  createdDate?: Date;\
  modifiedDate?: Date;\
  keywords?: string[];\
\}\
\
export type DocumentCategory = \
  | 'inspection-report'\
  | 'pre-inspection-questionnaire'\
  | 'evidence'\
  | 'policy'\
  | 'other';\
\
// GDC Types\
export interface GDCRequirement \{\
  id: number;\
  standard: number;\
  title: string;\
  description: string;\
  evidenceExamples: string[];\
\}\
\
export interface GDCStandard \{\
  id: number;\
  name: string;\
  description: string;\
  requirements: GDCRequirement[];\
\}\
\
// Analysis Types\
export interface AnalysisResult \{\
  id: string;\
  documentId: string;\
  timestamp: Date;\
  overallStatus: ComplianceStatus;\
  requirementResults: RequirementResult[];\
  summary: string;\
  recommendations: string[];\
\}\
\
export interface RequirementResult \{\
  requirementId: number;\
  status: ComplianceStatus;\
  evidence: Evidence[];\
  gaps: string[];\
  recommendations: string[];\
  confidenceScore: number;\
\}\
\
export type ComplianceStatus = 'met' | 'partially-met' | 'not-met';\
\
export interface Evidence \{\
  id: string;\
  text: string;\
  source: string;\
  page?: number;\
  section?: string;\
  relevanceScore: number;\
\}\
\
// Questionnaire Types\
export interface QuestionnaireResponse \{\
  questionId: string;\
  question: string;\
  originalAnswer?: string;\
  suggestedAnswer?: string;\
  recommendations: string[];\
  evidenceReferences: Evidence[];\
  status: 'complete' | 'incomplete' | 'needs-review';\
\}\
\
export interface QuestionnaireAnalysis \{\
  id: string;\
  documentId: string;\
  timestamp: Date;\
  responses: QuestionnaireResponse[];\
  overallCompleteness: number;\
  gapsIdentified: string[];\
  bestPracticeRecommendations: string[];\
\}\
\
// Report Types\
export interface EvaluationReport \{\
  id: string;\
  title: string;\
  generatedAt: Date;\
  documentAnalyzed: string;\
  referenceDocuments: string[];\
  executiveSummary: string;\
  standardsAnalysis: StandardAnalysis[];\
  overallCompliance: ComplianceStatus;\
  actionItems: ActionItem[];\
  appendix: AppendixItem[];\
\}\
\
export interface StandardAnalysis \{\
  standardId: number;\
  standardName: string;\
  requirementResults: RequirementResult[];\
  overallStatus: ComplianceStatus;\
  summary: string;\
\}\
\
export interface ActionItem \{\
  id: string;\
  priority: 'high' | 'medium' | 'low';\
  requirement: string;\
  action: string;\
  deadline?: string;\
\}\
\
export interface AppendixItem \{\
  title: string;\
  content: string;\
  evidenceList: Evidence[];\
\}\
\
// Accreditation Framework Types (for scalability)\
export type AccreditationFramework = 'GDC' | 'NCAAA' | 'ADA';\
\
export interface FrameworkConfig \{\
  id: AccreditationFramework;\
  name: string;\
  standards: GDCStandard[];\
  inspectionCycle: InspectionCycle;\
\}\
\
export interface InspectionCycle \{\
  phases: string[];\
  duration: string;\
  requirements: string[];\
\}}