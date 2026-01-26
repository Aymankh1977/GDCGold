import { Document, GDCRequirement, RequirementResult, Evidence, ComplianceStatus } from '@/types';
import { getAllRequirements } from '@/config/gdcStandards';
import { ReferenceIndexer } from '@/engines/referenceIndexer';
import { generateGoldStandard } from '@/engines/questionnaire/recommendationGenerator';

function safeSlice(text: string, start: number, end: number) {
  if (!text) return '';
  const s = Math.max(0, Math.min(text.length, start));
  const e = Math.max(s, Math.min(text.length, end));
  return text.substring(s, e);
}

export interface AnalysisContext {
  document: Document;
  referenceDocuments?: Document[];
}

export async function analyzeDocument(context: AnalysisContext): Promise<RequirementResult[]> {
  const requirements: GDCRequirement[] = getAllRequirements();
  const results: RequirementResult[] = [];

  const mainDoc = context.document;

  const indexer = new ReferenceIndexer();
  if (context.referenceDocuments && context.referenceDocuments.length > 0) {
    indexer.buildIndex(context.referenceDocuments);
  }

  for (const req of requirements) {
    const reqId = req.id;
    const evidence: Evidence[] = [];

    if (mainDoc && mainDoc.extractedText) {
      const sentences = splitIntoSentences(mainDoc.extractedText);
      const requirementQuery = buildRequirementQuery(req);

      for (let i = 0; i < sentences.length; i++) {
        const s = sentences[i];
        const sLower = s.toLowerCase();
        const matchCount = requirementQuery.filter(kw => kw && sLower.includes(kw)).length;
        if (matchCount > 0) {
          const idx = mainDoc.extractedText.toLowerCase().indexOf(sLower);
          const excerpt = safeSlice(mainDoc.extractedText, Math.max(0, idx - 80), idx + s.length + 80);
          evidence.push({
            sourceDocName: mainDoc.name || 'selected',
            sourceUrl: mainDoc.metadata?.sourceUrl || null,
            excerpt: excerpt.trim(),
            location: `Sentence ${i + 1}`,
            relevanceScore: matchCount / Math.max(1, requirementQuery.length),
            position: idx >= 0 ? { index: idx, length: s.length } : null,
            confidence: 0.9
          });
        }
      }
    }

    if (indexer && context.referenceDocuments && context.referenceDocuments.length > 0) {
      const queryText = req.title || req.description || `Requirement ${req.id}`;
      const top = indexer.search(queryText, 5);
      for (const hit of top) {
        evidence.push({
          sourceDocName: hit.sourceDocName,
          sourceUrl: hit.sourceUrl || null,
          excerpt: hit.excerpt,
          location: hit.location || 'reference',
          relevanceScore: hit.score,
          confidence: Math.min(0.95, hit.score)
        });
      }
    }

    const deduped = dedupeEvidence(evidence);

    const gaps: string[] = [];
    if (deduped.length === 0) {
      gaps.push('No direct evidence found in selected document or provided references for this requirement.');
    } else {
      if (req.evidenceExamples && req.evidenceExamples.length > 0) {
        const foundAny = req.evidenceExamples.some(ex => deduped.some(ev => ev.excerpt.toLowerCase().includes(ex.toLowerCase().slice(0, 10))));
        if (!foundAny) {
          gaps.push('Evidence found is partial and does not explicitly address suggested evidence examples.');
        }
      }
    }

    const avgRel = deduped.length > 0 ? deduped.reduce((s, e) => s + (e.relevanceScore || 0), 0) / deduped.length : 0;
    const confidenceScore = Math.max(0, Math.min(1, avgRel * 0.9 + (deduped.length >= 3 ? 0.1 : 0)));

    const status = deduped.length === 0
      ? ComplianceStatus.UNKNOWN
      : (confidenceScore >= 0.75 ? ComplianceStatus.MET : ComplianceStatus.PARTIALLY_MET);

    const gold = generateGoldStandard(req as any, {
      selectedDoc: mainDoc,
      evidence: deduped
    });

    const result: RequirementResult = {
      requirementId: reqId,
      status,
      evidence: deduped,
      gaps,
      recommendations: gold.suggestedActions,
      confidenceScore,
      goldStandard: gold.text,
      currentTextSummary: gold.summary || ''
    };

    results.push(result);
  }

  return results;
}

function splitIntoSentences(text: string): string[] {
  if (!text) return [];
  const raw = text.replace(/\r\n/g, '\n').split(/(?<=[.?!])\s+(?=[A-Z0-9])/g);
  return raw.map(s => s.trim()).filter(Boolean);
}

function buildRequirementQuery(req: GDCRequirement): string[] {
  const text = `${req.title || ''} ${req.description || ''}`;
  return text.toLowerCase().split(/\W+/).filter(w => w.length > 3);
}

function dedupeEvidence(items: Evidence[]): Evidence[] {
  const seen = new Set<string>();
  const out: Evidence[] = [];
  for (const it of items) {
    const key = (it.excerpt || '').slice(0, 200).replace(/\s+/g, ' ').trim();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(it);
    }
  }
  out.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
  return out;
}