{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 import \{ MatchResult \} from './matcher';\
import \{ ComplianceStatus \} from '@/types';\
\
export interface ComparisonScore \{\
  requirementId: number;\
  score: number;\
  status: ComplianceStatus;\
  confidence: number;\
\}\
\
export const scoreComparison = (matchResults: MatchResult[]): ComparisonScore[] => \{\
  return matchResults.map(result => \{\
    const score = calculateScore(result);\
    const status = determineStatusFromScore(score);\
    const confidence = calculateConfidence(result);\
    \
    return \{\
      requirementId: result.requirementId,\
      score,\
      status,\
      confidence,\
    \};\
  \});\
\};\
\
const calculateScore = (result: MatchResult): number => \{\
  let score = result.matchScore;\
  \
  // Boost for matched evidence\
  score += result.matchedEvidence.length * 0.1;\
  \
  // Penalty for gaps\
  score -= result.gaps.length * 0.15;\
  \
  return Math.max(0, Math.min(1, score));\
\};\
\
const determineStatusFromScore = (score: number): ComplianceStatus => \{\
  if (score >= 0.7) return 'met';\
  if (score >= 0.4) return 'partially-met';\
  return 'not-met';\
\};\
\
const calculateConfidence = (result: MatchResult): number => \{\
  // Higher confidence with more matched evidence\
  const evidenceConfidence = Math.min(result.matchedEvidence.length * 0.2, 0.6);\
  const baseConfidence = result.matchScore * 0.4;\
  \
  return evidenceConfidence + baseConfidence;\
\};}