{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 import \{ \
  QuestionnaireResponse, \
  QuestionnaireAnalysis, \
  Evidence,\
  Document \
\} from '@/types';\
import \{ ParsedQuestion \} from '../documentEngine/parser';\
import \{ generateId \} from '@/utils/helpers';\
\
export const analyzeQuestionnaire = (\
  document: Document,\
  questions: ParsedQuestion[]\
): QuestionnaireAnalysis => \{\
  const responses = questions.map(q => analyzeQuestion(q, document));\
  \
  const overallCompleteness = calculateCompleteness(responses);\
  const gapsIdentified = identifyGaps(responses);\
  const bestPracticeRecommendations = generateBestPracticeRecommendations(responses);\
  \
  return \{\
    id: generateId(),\
    documentId: document.id,\
    timestamp: new Date(),\
    responses,\
    overallCompleteness,\
    gapsIdentified,\
    bestPracticeRecommendations,\
  \};\
\};\
\
const analyzeQuestion = (\
  question: ParsedQuestion,\
  document: Document\
): QuestionnaireResponse => \{\
  const hasAnswer = question.answer && question.answer.trim().length > 10;\
  const evidenceRefs = findEvidenceForQuestion(question, document);\
  const suggestions = generateSuggestions(question);\
  \
  return \{\
    questionId: question.id,\
    question: question.question,\
    originalAnswer: question.answer,\
    suggestedAnswer: hasAnswer ? undefined : generateSuggestedAnswer(question),\
    recommendations: suggestions,\
    evidenceReferences: evidenceRefs,\
    status: hasAnswer ? 'complete' : 'incomplete',\
  \};\
\};\
\
const findEvidenceForQuestion = (\
  question: ParsedQuestion,\
  document: Document\
): Evidence[] => \{\
  const evidence: Evidence[] = [];\
  const text = document.extractedText.toLowerCase();\
  \
  // Extract key terms from question\
  const keyTerms = extractKeyTerms(question.question);\
  \
  keyTerms.forEach(term => \{\
    const index = text.indexOf(term.toLowerCase());\
    if (index !== -1) \{\
      const start = Math.max(0, index - 100);\
      const end = Math.min(text.length, index + term.length + 100);\
      \
      evidence.push(\{\
        id: generateId(),\
        text: '...' + text.slice(start, end) + '...',\
        source: document.name,\
        relevanceScore: 0.7,\
      \});\
    \}\
  \});\
  \
  return evidence.slice(0, 3);\
\};\
\
const extractKeyTerms = (questionText: string): string[] => \{\
  const terms: string[] = [];\
  \
  // Common question-related terms\
  const importantWords = questionText\
    .split(/\\s+/)\
    .filter(w => w.length > 4)\
    .filter(w => !['which', 'where', 'please', 'provide', 'describe'].includes(w.toLowerCase()));\
  \
  terms.push(...importantWords.slice(0, 5));\
  \
  return terms;\
\};\
\
const generateSuggestedAnswer = (question: ParsedQuestion): string => \{\
  // Generate a template answer based on the question type\
  const questionLower = question.question.toLowerCase();\
  \
  if (questionLower.includes('name') || questionLower.includes('title')) \{\
    return '[Please provide the specific name/title]';\
  \}\
  \
  if (questionLower.includes('describe') || questionLower.includes('explain')) \{\
    return '[Please provide a detailed description including relevant policies, procedures, and evidence]';\
  \}\
  \
  if (questionLower.includes('list') || questionLower.includes('details')) \{\
    return '[Please provide a comprehensive list with supporting details]';\
  \}\
  \
  return '[Please provide complete information as requested]';\
\};\
\
const generateSuggestions = (question: ParsedQuestion): string[] => \{\
  const suggestions: string[] = [];\
  \
  if (!question.answer || question.answer.length < 50) \{\
    suggestions.push('Consider providing more detailed information');\
  \}\
  \
  if (question.answer && !question.answer.includes('policy')) \{\
    suggestions.push('Reference relevant policies where applicable');\
  \}\
  \
  if (question.answer && !question.answer.includes('evidence')) \{\
    suggestions.push('Include specific evidence or documentation references');\
  \}\
  \
  return suggestions;\
\};\
\
const calculateCompleteness = (responses: QuestionnaireResponse[]): number => \{\
  const complete = responses.filter(r => r.status === 'complete').length;\
  return Math.round((complete / responses.length) * 100);\
\};\
\
const identifyGaps = (responses: QuestionnaireResponse[]): string[] => \{\
  const gaps: string[] = [];\
  \
  const incomplete = responses.filter(r => r.status === 'incomplete');\
  if (incomplete.length > 0) \{\
    gaps.push(`$\{incomplete.length\} questions require answers`);\
  \}\
  \
  const needsReview = responses.filter(r => r.status === 'needs-review');\
  if (needsReview.length > 0) \{\
    gaps.push(`$\{needsReview.length\} answers may need enhancement`);\
  \}\
  \
  return gaps;\
\};\
\
const generateBestPracticeRecommendations = (\
  responses: QuestionnaireResponse[]\
): string[] => \{\
  const recommendations: string[] = [\
    'Ensure all responses reference specific policies and procedures',\
    'Include evidence citations for each claim made',\
    'Cross-reference with GDC Standards for Education requirements',\
    'Maintain consistency in terminology across all responses',\
  ];\
  \
  return recommendations;\
\};}