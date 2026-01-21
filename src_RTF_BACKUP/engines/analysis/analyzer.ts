{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 import \{ \
  Document, \
  GDCRequirement, \
  RequirementResult, \
  Evidence, \
  ComplianceStatus \
\} from '@/types';\
import \{ getAllRequirements \} from '@/config/gdcStandards';\
import \{ getKeywordsForRequirement, RequirementKeywords \} from './gdcRequirements';\
import \{ generateId \} from '@/utils/helpers';\
\
export interface AnalysisContext \{\
  document: Document;\
  referenceDocuments?: Document[];\
\}\
\
export const analyzeDocument = (context: AnalysisContext): RequirementResult[] => \{\
  const requirements = getAllRequirements();\
  const results: RequirementResult[] = [];\
  \
  for (const requirement of requirements) \{\
    const result = analyzeRequirement(requirement, context);\
    results.push(result);\
  \}\
  \
  return results;\
\};\
\
export const analyzeRequirement = (\
  requirement: GDCRequirement,\
  context: AnalysisContext\
): RequirementResult => \{\
  const keywords = getKeywordsForRequirement(requirement.id);\
  const text = context.document.extractedText.toLowerCase();\
  \
  // Find evidence in the document\
  const evidence = findEvidence(text, requirement, keywords);\
  \
  // Calculate confidence score\
  const confidenceScore = calculateConfidence(evidence, keywords, text);\
  \
  // Determine status based on evidence and confidence\
  const status = determineStatus(confidenceScore, evidence.length);\
  \
  // Identify gaps\
  const gaps = identifyGaps(requirement, evidence, keywords, text);\
  \
  // Generate recommendations\
  const recommendations = generateRecommendations(requirement, status, gaps);\
  \
  return \{\
    requirementId: requirement.id,\
    status,\
    evidence,\
    gaps,\
    recommendations,\
    confidenceScore,\
  \};\
\};\
\
const findEvidence = (\
  text: string,\
  requirement: GDCRequirement,\
  keywords?: RequirementKeywords\
): Evidence[] => \{\
  const evidence: Evidence[] = [];\
  \
  if (!keywords) return evidence;\
  \
  // Search for primary keywords\
  keywords.primaryKeywords.forEach((keyword) => \{\
    const lowerKeyword = keyword.toLowerCase();\
    let index = text.indexOf(lowerKeyword);\
    \
    while (index !== -1) \{\
      // Extract context around the keyword\
      const start = Math.max(0, index - 150);\
      const end = Math.min(text.length, index + keyword.length + 150);\
      const context = text.slice(start, end);\
      \
      // Check if this context is meaningful\
      if (context.length > 50) \{\
        evidence.push(\{\
          id: generateId(),\
          text: '...' + context + '...',\
          source: 'Document text',\
          relevanceScore: 0.8,\
          section: findSectionForIndex(text, index),\
        \});\
      \}\
      \
      index = text.indexOf(lowerKeyword, index + 1);\
    \}\
  \});\
  \
  // Deduplicate and limit evidence\
  const uniqueEvidence = deduplicateEvidence(evidence);\
  return uniqueEvidence.slice(0, 5);\
\};\
\
const findSectionForIndex = (text: string, index: number): string => \{\
  // Find the nearest section header before this index\
  const beforeText = text.slice(0, index);\
  const sectionPatterns = [\
    /(?:requirement|standard|q)\\s*\\d+[.:]/gi,\
    /(?:section|chapter)\\s*\\d+/gi,\
  ];\
  \
  for (const pattern of sectionPatterns) \{\
    const matches = beforeText.match(pattern);\
    if (matches && matches.length > 0) \{\
      return matches[matches.length - 1];\
    \}\
  \}\
  \
  return 'General';\
\};\
\
const deduplicateEvidence = (evidence: Evidence[]): Evidence[] => \{\
  const seen = new Set<string>();\
  return evidence.filter((e) => \{\
    const normalized = e.text.slice(0, 100).toLowerCase();\
    if (seen.has(normalized)) return false;\
    seen.add(normalized);\
    return true;\
  \});\
\};\
\
const calculateConfidence = (\
  evidence: Evidence[],\
  keywords: RequirementKeywords | undefined,\
  text: string\
): number => \{\
  if (!keywords) return 0;\
  \
  let score = 0;\
  \
  // Base score from evidence count\
  score += Math.min(evidence.length * 0.15, 0.45);\
  \
  // Primary keyword coverage\
  const primaryFound = keywords.primaryKeywords.filter(\
    (k) => text.includes(k.toLowerCase())\
  ).length;\
  score += (primaryFound / keywords.primaryKeywords.length) * 0.35;\
  \
  // Secondary keyword coverage\
  const secondaryFound = keywords.secondaryKeywords.filter(\
    (k) => text.includes(k.toLowerCase())\
  ).length;\
  score += (secondaryFound / keywords.secondaryKeywords.length) * 0.15;\
  \
  // Penalty for negative keywords\
  const negativeFound = keywords.negativeKeywords.filter(\
    (k) => text.includes(k.toLowerCase())\
  ).length;\
  score -= negativeFound * 0.1;\
  \
  return Math.max(0, Math.min(1, score));\
\};\
\
const determineStatus = (\
  confidenceScore: number,\
  evidenceCount: number\
): ComplianceStatus => \{\
  if (confidenceScore >= 0.7 && evidenceCount >= 2) \{\
    return 'met';\
  \}\
  if (confidenceScore >= 0.4 || evidenceCount >= 1) \{\
    return 'partially-met';\
  \}\
  return 'not-met';\
\};\
\
const identifyGaps = (\
  requirement: GDCRequirement,\
  evidence: Evidence[],\
  keywords: RequirementKeywords | undefined,\
  text: string\
): string[] => \{\
  const gaps: string[] = [];\
  \
  if (!keywords) return gaps;\
  \
  // Check for missing primary keywords\
  const missingPrimary = keywords.primaryKeywords.filter(\
    (k) => !text.includes(k.toLowerCase())\
  );\
  \
  if (missingPrimary.length > keywords.primaryKeywords.length * 0.5) \{\
    gaps.push(`Limited evidence of: $\{missingPrimary.slice(0, 3).join(', ')\}`);\
  \}\
  \
  // Check for required evidence types\
  const missingEvidence = requirement.evidenceExamples.filter((example) => \{\
    const exampleLower = example.toLowerCase();\
    return !text.includes(exampleLower) && \
           !evidence.some((e) => e.text.toLowerCase().includes(exampleLower));\
  \});\
  \
  if (missingEvidence.length > 0) \{\
    gaps.push(`Missing evidence: $\{missingEvidence.slice(0, 2).join('; ')\}`);\
  \}\
  \
  if (evidence.length === 0) \{\
    gaps.push('No direct evidence found in the document');\
  \}\
  \
  return gaps;\
\};\
\
const generateRecommendations = (\
  requirement: GDCRequirement,\
  status: ComplianceStatus,\
  gaps: string[]\
): string[] => \{\
  const recommendations: string[] = [];\
  \
  if (status === 'met') \{\
    recommendations.push('Continue current practices and maintain documentation');\
    return recommendations;\
  \}\
  \
  if (status === 'not-met') \{\
    recommendations.push(\
      `Urgent: Develop comprehensive documentation for $\{requirement.title\}`\
    );\
  \}\
  \
  gaps.forEach((gap) => \{\
    if (gap.includes('Missing evidence')) \{\
      recommendations.push(`Provide: $\{gap.replace('Missing evidence: ', '')\}`);\
    \}\
  \});\
  \
  // Add specific recommendations based on requirement\
  if (requirement.evidenceExamples.length > 0) \{\
    const example = requirement.evidenceExamples[0];\
    recommendations.push(`Consider preparing: $\{example\}`);\
  \}\
  \
  return recommendations.slice(0, 3);\
\};}