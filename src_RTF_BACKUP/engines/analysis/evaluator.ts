{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 import \{ \
  RequirementResult, \
  AnalysisResult, \
  ComplianceStatus,\
  Document \
\} from '@/types';\
import \{ GDC_STANDARDS \} from '@/config/gdcStandards';\
import \{ calculateOverallStatus, generateId \} from '@/utils/helpers';\
\
export const evaluateResults = (\
  documentId: string,\
  requirementResults: RequirementResult[]\
): AnalysisResult => \{\
  const statuses = requirementResults.map((r) => r.status);\
  const overallStatus = calculateOverallStatus(statuses);\
  \
  const summary = generateSummary(requirementResults, overallStatus);\
  const recommendations = generateOverallRecommendations(requirementResults);\
  \
  return \{\
    id: generateId(),\
    documentId,\
    timestamp: new Date(),\
    overallStatus,\
    requirementResults,\
    summary,\
    recommendations,\
  \};\
\};\
\
const generateSummary = (\
  results: RequirementResult[],\
  overallStatus: ComplianceStatus\
): string => \{\
  const metCount = results.filter((r) => r.status === 'met').length;\
  const partialCount = results.filter((r) => r.status === 'partially-met').length;\
  const notMetCount = results.filter((r) => r.status === 'not-met').length;\
  const total = results.length;\
  \
  let summaryText = `Analysis of $\{total\} GDC requirements:\\n\\n`;\
  summaryText += `\'95 Met: $\{metCount\} ($\{Math.round((metCount / total) * 100)\}%)\\n`;\
  summaryText += `\'95 Partially Met: $\{partialCount\} ($\{Math.round((partialCount / total) * 100)\}%)\\n`;\
  summaryText += `\'95 Not Met: $\{notMetCount\} ($\{Math.round((notMetCount / total) * 100)\}%)\\n\\n`;\
  \
  // Add standard-wise summary\
  GDC_STANDARDS.forEach((standard) => \{\
    const standardResults = results.filter((r) => \
      standard.requirements.some((req) => req.id === r.requirementId)\
    );\
    const standardMet = standardResults.filter((r) => r.status === 'met').length;\
    summaryText += `Standard $\{standard.id\} ($\{standard.name\}): $\{standardMet\}/$\{standardResults.length\} met\\n`;\
  \});\
  \
  summaryText += `\\nOverall Status: $\{formatStatus(overallStatus)\}`;\
  \
  return summaryText;\
\};\
\
const formatStatus = (status: ComplianceStatus): string => \{\
  switch (status) \{\
    case 'met':\
      return 'SUFFICIENT - Requirements Met';\
    case 'partially-met':\
      return 'PARTIALLY SUFFICIENT - Some Requirements Need Attention';\
    case 'not-met':\
      return 'NOT SUFFICIENT - Significant Gaps Identified';\
  \}\
\};\
\
const generateOverallRecommendations = (results: RequirementResult[]): string[] => \{\
  const recommendations: string[] = [];\
  \
  // Prioritize not-met requirements\
  const notMetResults = results.filter((r) => r.status === 'not-met');\
  const partialResults = results.filter((r) => r.status === 'partially-met');\
  \
  if (notMetResults.length > 0) \{\
    recommendations.push(\
      `Priority: Address $\{notMetResults.length\} requirements that are not met`\
    );\
    \
    notMetResults.slice(0, 3).forEach((r) => \{\
      recommendations.push(`\'95 Requirement $\{r.requirementId\}: $\{r.recommendations[0] || 'Review and improve'\}`);\
    \});\
  \}\
  \
  if (partialResults.length > 0) \{\
    recommendations.push(\
      `Improve: $\{partialResults.length\} requirements are partially met and need strengthening`\
    );\
  \}\
  \
  // Add general recommendations\
  const avgConfidence = results.reduce((sum, r) => sum + r.confidenceScore, 0) / results.length;\
  if (avgConfidence < 0.6) \{\
    recommendations.push(\
      'Consider enhancing documentation to provide clearer evidence of compliance'\
    );\
  \}\
  \
  return recommendations.slice(0, 6);\
\};\
\
export const compareWithReferences = (\
  currentResults: RequirementResult[],\
  referenceDocuments: Document[]\
): RequirementResult[] => \{\
  // This function compares current results with reference documents\
  // that have previously passed inspection\
  \
  return currentResults.map((result) => \{\
    const adjustedResult = \{ ...result \};\
    \
    // Look for additional evidence in reference documents\
    referenceDocuments.forEach((doc) => \{\
      const text = doc.extractedText.toLowerCase();\
      // Check if reference document has relevant content\
      // This would be expanded with more sophisticated matching\
      if (text.includes(`requirement $\{result.requirementId\}`)) \{\
        adjustedResult.confidenceScore = Math.min(\
          1,\
          adjustedResult.confidenceScore + 0.1\
        );\
      \}\
    \});\
    \
    return adjustedResult;\
  \});\
\};}