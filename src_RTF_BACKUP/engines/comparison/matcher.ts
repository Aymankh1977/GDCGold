{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 import \{ Document, RequirementResult, Evidence \} from '@/types';\
import \{ generateId \} from '@/utils/helpers';\
\
export interface MatchResult \{\
  requirementId: number;\
  matchScore: number;\
  matchedEvidence: MatchedEvidence[];\
  gaps: string[];\
\}\
\
export interface MatchedEvidence \{\
  sourceEvidence: Evidence;\
  referenceEvidence: Evidence;\
  similarity: number;\
\}\
\
export const matchDocuments = (\
  sourceDoc: Document,\
  referenceDoc: Document\
): MatchResult[] => \{\
  const results: MatchResult[] = [];\
  \
  // Simple text similarity matching\
  const sourceText = sourceDoc.extractedText.toLowerCase();\
  const referenceText = referenceDoc.extractedText.toLowerCase();\
  \
  // For each requirement, compare evidence\
  for (let reqId = 1; reqId <= 21; reqId++) \{\
    const result = matchRequirement(reqId, sourceText, referenceText);\
    results.push(result);\
  \}\
  \
  return results;\
\};\
\
const matchRequirement = (\
  requirementId: number,\
  sourceText: string,\
  referenceText: string\
): MatchResult => \{\
  // Extract relevant sections from both texts\
  const sourceSection = extractRequirementSection(sourceText, requirementId);\
  const referenceSection = extractRequirementSection(referenceText, requirementId);\
  \
  // Calculate similarity\
  const similarity = calculateTextSimilarity(sourceSection, referenceSection);\
  \
  // Find matching evidence\
  const matchedEvidence = findMatchingEvidence(sourceSection, referenceSection);\
  \
  // Identify gaps\
  const gaps = identifyMatchGaps(sourceSection, referenceSection, requirementId);\
  \
  return \{\
    requirementId,\
    matchScore: similarity,\
    matchedEvidence,\
    gaps,\
  \};\
\};\
\
const extractRequirementSection = (text: string, requirementId: number): string => \{\
  // Try to find the section related to this requirement\
  const patterns = [\
    new RegExp(`requirement\\\\s*$\{requirementId\}[:\\\\s]([\\\\s\\\\S]\{0,2000\})`, 'i'),\
    new RegExp(`r$\{requirementId\}[:\\\\s]([\\\\s\\\\S]\{0,2000\})`, 'i'),\
  ];\
  \
  for (const pattern of patterns) \{\
    const match = text.match(pattern);\
    if (match) return match[1];\
  \}\
  \
  return text.slice(0, 2000); // Fallback to first part of text\
\};\
\
const calculateTextSimilarity = (text1: string, text2: string): number => \{\
  if (!text1 || !text2) return 0;\
  \
  // Simple word overlap similarity\
  const words1 = new Set(text1.split(/\\s+/).filter(w => w.length > 3));\
  const words2 = new Set(text2.split(/\\s+/).filter(w => w.length > 3));\
  \
  let overlap = 0;\
  words1.forEach(word => \{\
    if (words2.has(word)) overlap++;\
  \});\
  \
  const union = words1.size + words2.size - overlap;\
  return union > 0 ? overlap / union : 0;\
\};\
\
const findMatchingEvidence = (\
  sourceSection: string,\
  referenceSection: string\
): MatchedEvidence[] => \{\
  const evidence: MatchedEvidence[] = [];\
  \
  // Split into sentences and find matches\
  const sourceSentences = sourceSection.split(/[.!?]+/).filter(s => s.trim().length > 20);\
  const referenceSentences = referenceSection.split(/[.!?]+/).filter(s => s.trim().length > 20);\
  \
  sourceSentences.forEach(sourceSent => \{\
    referenceSentences.forEach(refSent => \{\
      const similarity = calculateTextSimilarity(sourceSent, refSent);\
      if (similarity > 0.3) \{\
        evidence.push(\{\
          sourceEvidence: \{\
            id: generateId(),\
            text: sourceSent.trim(),\
            source: 'Source document',\
            relevanceScore: similarity,\
          \},\
          referenceEvidence: \{\
            id: generateId(),\
            text: refSent.trim(),\
            source: 'Reference document',\
            relevanceScore: similarity,\
          \},\
          similarity,\
        \});\
      \}\
    \});\
  \});\
  \
  return evidence.slice(0, 5);\
\};\
\
const identifyMatchGaps = (\
  sourceSection: string,\
  referenceSection: string,\
  requirementId: number\
): string[] => \{\
  const gaps: string[] = [];\
  \
  // Check for key terms in reference that are missing in source\
  const referenceWords = new Set(\
    referenceSection.split(/\\s+/).filter(w => w.length > 5)\
  );\
  const sourceWords = new Set(\
    sourceSection.split(/\\s+/).filter(w => w.length > 5)\
  );\
  \
  const missingWords: string[] = [];\
  referenceWords.forEach(word => \{\
    if (!sourceWords.has(word)) \{\
      missingWords.push(word);\
    \}\
  \});\
  \
  if (missingWords.length > 10) \{\
    gaps.push('Source document may be missing key content present in reference');\
  \}\
  \
  return gaps;\
\};}