import { GDC_REQUIREMENTS, GDC_STANDARDS } from '../data/gdcStandards';
import { 
  Document, 
  GDCRequirement, 
  AnalysisResult, 
  RequirementAnalysis, 
  Evidence,
  AnalysisSummary 
} from '../types';

export class GDCAnalysisEngine {
  private keywordWeights: Map<string, number>;

  constructor() {
    this.keywordWeights = this.initializeKeywordWeights();
  }

  private initializeKeywordWeights(): Map<string, number> {
    const weights = new Map<string, number>();
    
    // High importance keywords
    const highImportance = [
      'policy', 'procedure', 'assessment', 'clinical', 'patient', 
      'safety', 'supervision', 'competency', 'gateway', 'milestone',
      'fitness to practise', 'consent', 'training', 'qualification',
      'external examiner', 'quality assurance', 'feedback'
    ];
    highImportance.forEach(kw => weights.set(kw, 3));

    // Medium importance keywords
    const mediumImportance = [
      'record', 'documentation', 'evidence', 'monitoring', 'review',
      'standard', 'requirement', 'compliance', 'guideline', 'protocol'
    ];
    mediumImportance.forEach(kw => weights.set(kw, 2));

    return weights;
  }

  async analyzeDocument(document: Document): Promise<AnalysisResult> {
    const requirements: RequirementAnalysis[] = [];
    
    for (const requirement of GDC_REQUIREMENTS) {
      const analysis = await this.analyzeRequirement(document, requirement);
      requirements.push(analysis);
    }

    const summary = this.generateSummary(requirements);
    const overallScore = this.calculateOverallScore(requirements);

    return {
      documentId: document.id,
      documentName: document.name,
      analysisDate: new Date(),
      overallScore,
      requirements,
      summary
    };
  }

  private async analyzeRequirement(
    document: Document, 
    requirement: GDCRequirement
  ): Promise<RequirementAnalysis> {
    const text = document.extractedText.toLowerCase();
    const evidence = this.findEvidence(text, requirement);
    const gaps = this.identifyGaps(text, requirement);
    const confidence = this.calculateConfidence(evidence, gaps, requirement);
    const status = this.determineStatus(confidence, evidence.length, gaps.length);
    const recommendations = this.generateRecommendations(requirement, status, gaps);

    return {
      requirementId: requirement.id,
      status,
      confidence,
      evidence,
      gaps,
      recommendations
    };
  }

  private findEvidence(text: string, requirement: GDCRequirement): Evidence[] {
    const evidence: Evidence[] = [];
    const sentences = text.split(/[.!?]+/);
    
    // Keywords from requirement description
    const keywords = this.extractKeywords(requirement.description);
    
    // Keywords from evidence examples
    const evidenceKeywords = requirement.evidenceExamples
      .flatMap(ex => this.extractKeywords(ex));
    
    const allKeywords = [...new Set([...keywords, ...evidenceKeywords])];

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim();
      if (sentence.length < 10) continue;

      const matchScore = this.calculateMatchScore(sentence, allKeywords);
      
      if (matchScore > 0.3) {
        evidence.push({
          text: sentence,
          location: `Sentence ${i + 1}`,
          relevanceScore: matchScore,
          sourceDocument: 'Current Document'
        });
      }
    }

    // Sort by relevance and take top results
    return evidence
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 10);
  }

  private extractKeywords(text: string): string[] {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
      'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
      'could', 'should', 'may', 'might', 'must', 'shall', 'this', 'that',
      'these', 'those', 'it', 'its', 'they', 'them', 'their', 'which'
    ]);

    return text
      .toLowerCase()
      .split(/\W+/)
      .filter(word => word.length > 3 && !stopWords.has(word));
  }

  private calculateMatchScore(text: string, keywords: string[]): number {
    const textWords = new Set(text.toLowerCase().split(/\W+/));
    let score = 0;
    let maxScore = 0;

    for (const keyword of keywords) {
      const weight = this.keywordWeights.get(keyword) || 1;
      maxScore += weight;
      
      if (textWords.has(keyword) || text.includes(keyword)) {
        score += weight;
      }
    }

    return maxScore > 0 ? score / maxScore : 0;
  }

  private identifyGaps(text: string, requirement: GDCRequirement): string[] {
    const gaps: string[] = [];
    
    for (const evidenceExample of requirement.evidenceExamples) {
      const keywords = this.extractKeywords(evidenceExample);
      const found = keywords.some(kw => text.includes(kw));
      
      if (!found) {
        gaps.push(`Missing evidence related to: ${evidenceExample}`);
      }
    }

    return gaps;
  }

  private calculateConfidence(
    evidence: Evidence[], 
    gaps: string[], 
    requirement: GDCRequirement
  ): number {
    const evidenceScore = Math.min(evidence.length / 3, 1) * 0.5;
    const gapPenalty = Math.min(gaps.length / requirement.evidenceExamples.length, 1) * 0.3;
    const avgRelevance = evidence.length > 0 
      ? evidence.reduce((sum, e) => sum + e.relevanceScore, 0) / evidence.length 
      : 0;
    
    return Math.max(0, Math.min(1, evidenceScore - gapPenalty + avgRelevance * 0.2));
  }

  private determineStatus(
    confidence: number, 
    evidenceCount: number, 
    gapCount: number
  ): 'met' | 'partially_met' | 'not_met' {
    if (confidence >= 0.7 && evidenceCount >= 3 && gapCount <= 2) {
      return 'met';
    } else if (confidence >= 0.4 || evidenceCount >= 1) {
      return 'partially_met';
    }
    return 'not_met';
  }

  private generateRecommendations(
    requirement: GDCRequirement, 
    status: string, 
    gaps: string[]
  ): string[] {
    const recommendations: string[] = [];

    if (status !== 'met') {
      recommendations.push(
        `Review and strengthen documentation for Requirement ${requirement.id}: ${requirement.title}`
      );
      
      if (gaps.length > 0) {
        recommendations.push(
          `Address the following gaps: ${gaps.slice(0, 3).join('; ')}`
        );
      }

      recommendations.push(
        `Consider providing additional evidence such as: ${requirement.evidenceExamples.slice(0, 2).join(', ')}`
      );
    }

    return recommendations;
  }

  private generateSummary(requirements: RequirementAnalysis[]): AnalysisSummary {
    const met = requirements.filter(r => r.status === 'met').length;
    const partiallyMet = requirements.filter(r => r.status === 'partially_met').length;
    const notMet = requirements.filter(r => r.status === 'not_met').length;

    const strengths = requirements
      .filter(r => r.status === 'met' && r.confidence > 0.8)
      .map(r => {
        const req = GDC_REQUIREMENTS.find(gr => gr.id === r.requirementId);
        return req ? req.title : '';
      })
      .filter(s => s);

    const areasForImprovement = requirements
      .filter(r => r.status === 'partially_met')
      .map(r => {
        const req = GDC_REQUIREMENTS.find(gr => gr.id === r.requirementId);
        return req ? req.title : '';
      })
      .filter(s => s);

    const criticalGaps = requirements
      .filter(r => r.status === 'not_met')
      .map(r => {
        const req = GDC_REQUIREMENTS.find(gr => gr.id === r.requirementId);
        return req ? `${req.title}: ${r.gaps.slice(0, 2).join('; ')}` : '';
      })
      .filter(s => s);

    return {
      totalRequirements: requirements.length,
      met,
      partiallyMet,
      notMet,
      strengths,
      areasForImprovement,
      criticalGaps
    };
  }

  private calculateOverallScore(requirements: RequirementAnalysis[]): number {
    const weights = { met: 1, partially_met: 0.5, not_met: 0 };
    const totalScore = requirements.reduce((sum, r) => sum + weights[r.status], 0);
    return (totalScore / requirements.length) * 100;
  }

  getRequirementDetails(requirementId: number): GDCRequirement | undefined {
    return GDC_REQUIREMENTS.find(r => r.id === requirementId);
  }

  getAllRequirements(): GDCRequirement[] {
    return GDC_REQUIREMENTS;
  }

  getStandardInfo(standardId: 1 | 2 | 3) {
    return GDC_STANDARDS[standardId];
  }
}