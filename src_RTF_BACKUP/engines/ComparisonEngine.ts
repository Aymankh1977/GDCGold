{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 import \{ \
  Document, \
  AnalysisResult, \
  ComparisonResult, \
  RequirementComparison \
\} from '../types';\
import \{ GDCAnalysisEngine \} from './GDCAnalysisEngine';\
\
export class ComparisonEngine \{\
  private gdcAnalysisEngine: GDCAnalysisEngine;\
\
  constructor() \{\
    this.gdcAnalysisEngine = new GDCAnalysisEngine();\
  \}\
\
  async compareDocuments(\
    targetDocument: Document,\
    referenceDocuments: Document[]\
  ): Promise<ComparisonResult> \{\
    // Analyze target document\
    const targetAnalysis = await this.gdcAnalysisEngine.analyzeDocument(targetDocument);\
\
    // Analyze reference documents and aggregate results\
    const referenceAnalyses = await Promise.all(\
      referenceDocuments.map(doc => this.gdcAnalysisEngine.analyzeDocument(doc))\
    );\
\
    const aggregatedReference = this.aggregateReferenceAnalyses(referenceAnalyses);\
\
    // Compare requirements\
    const requirementComparisons = this.compareRequirements(\
      targetAnalysis,\
      aggregatedReference\
    );\
\
    // Calculate alignment score\
    const alignmentScore = this.calculateAlignmentScore(requirementComparisons);\
\
    return \{\
      targetDocument: targetDocument.name,\
      referenceDocuments: referenceDocuments.map(d => d.name),\
      comparisonDate: new Date(),\
      alignmentScore,\
      requirementComparisons\
    \};\
  \}\
\
  private aggregateReferenceAnalyses(analyses: AnalysisResult[]): AnalysisResult \{\
    if (analyses.length === 0) \{\
      throw new Error('No reference analyses provided');\
    \}\
\
    // Use the first analysis as a template\
    const aggregated = \{ ...analyses[0] \};\
    \
    // For each requirement, take the best status from references\
    aggregated.requirements = aggregated.requirements.map((req, idx) => \{\
      const allStatuses = analyses.map(a => a.requirements[idx].status);\
      const bestStatus = this.getBestStatus(allStatuses);\
      \
      const allEvidence = analyses.flatMap(a => a.requirements[idx].evidence);\
      const uniqueEvidence = this.deduplicateEvidence(allEvidence);\
\
      return \{\
        ...req,\
        status: bestStatus,\
        evidence: uniqueEvidence,\
        confidence: Math.max(...analyses.map(a => a.requirements[idx].confidence))\
      \};\
    \});\
\
    return aggregated;\
  \}\
\
  private getBestStatus(statuses: ('met' | 'partially_met' | 'not_met')[]): 'met' | 'partially_met' | 'not_met' \{\
    if (statuses.includes('met')) return 'met';\
    if (statuses.includes('partially_met')) return 'partially_met';\
    return 'not_met';\
  \}\
\
  private deduplicateEvidence(evidence: any[]): any[] \{\
    const seen = new Set<string>();\
    return evidence.filter(e => \{\
      const key = e.text.substring(0, 50);\
      if (seen.has(key)) return false;\
      seen.add(key);\
      return true;\
    \}).slice(0, 10);\
  \}\
\
  private compareRequirements(\
    target: AnalysisResult,\
    reference: AnalysisResult\
  ): RequirementComparison[] \{\
    return target.requirements.map((targetReq, idx) => \{\
      const refReq = reference.requirements[idx];\
      \
      const gaps = this.identifyGaps(targetReq, refReq);\
      const improvements = this.identifyImprovements(targetReq, refReq);\
\
      return \{\
        requirementId: targetReq.requirementId,\
        targetStatus: targetReq.status,\
        referenceStatus: refReq.status,\
        gaps,\
        improvements\
      \};\
    \});\
  \}\
\
  private identifyGaps(target: any, reference: any): string[] \{\
    const gaps: string[] = [];\
\
    if (this.statusValue(target.status) < this.statusValue(reference.status)) \{\
      gaps.push(`Target document has lower compliance ($\{target.status\}) compared to reference ($\{reference.status\})`);\
    \}\
\
    // Find evidence in reference that's missing in target\
    const targetEvidenceTexts = new Set(target.evidence.map((e: any) => e.text.substring(0, 30)));\
    const missingEvidence = reference.evidence.filter(\
      (e: any) => !targetEvidenceTexts.has(e.text.substring(0, 30))\
    );\
\
    if (missingEvidence.length > 0) \{\
      gaps.push(`Missing $\{missingEvidence.length\} pieces of evidence found in reference documents`);\
    \}\
\
    return gaps;\
  \}\
\
  private identifyImprovements(target: any, reference: any): string[] \{\
    const improvements: string[] = [];\
\
    if (this.statusValue(target.status) >= this.statusValue(reference.status)) \{\
      improvements.push('Target document meets or exceeds reference standard for this requirement');\
    \}\
\
    if (target.confidence > reference.confidence) \{\
      improvements.push('Target document shows stronger evidence for this requirement');\
    \}\
\
    return improvements;\
  \}\
\
  private statusValue(status: 'met' | 'partially_met' | 'not_met'): number \{\
    const values = \{ met: 2, partially_met: 1, not_met: 0 \};\
    return values[status];\
  \}\
\
  private calculateAlignmentScore(comparisons: RequirementComparison[]): number \{\
    let score = 0;\
    \
    for (const comp of comparisons) \{\
      const targetValue = this.statusValue(comp.targetStatus);\
      const refValue = this.statusValue(comp.referenceStatus);\
      \
      if (targetValue >= refValue) \{\
        score += 1;\
      \} else if (targetValue === refValue - 1) \{\
        score += 0.5;\
      \}\
    \}\
\
    return (score / comparisons.length) * 100;\
  \}\
\}}