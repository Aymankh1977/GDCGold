import { Document } from '@/types';

type IndexEntry = {
  docId: string;
  sourceDocName: string;
  sourceUrl?: string | null;
  sentence: string;
  tokens: string[];
  tokenSet: Set<string>;
  location?: string;
};

export class ReferenceIndexer {
  private entries: IndexEntry[] = [];
  private tokenDocFrequency: Map<string, number> = new Map();
  private totalDocs = 0;

  buildIndex(docs: Document[]) {
    this.entries = [];
    this.tokenDocFrequency = new Map();
    this.totalDocs = docs.length;

    docs.forEach(doc => {
      const sentences = this.splitIntoSentences(doc.extractedText || '');
      for (let i = 0; i < sentences.length; i++) {
        const s = sentences[i].trim();
        if (!s || s.length < 20) continue;
        const tokens = this.tokenize(s);
        const tokenSet = new Set(tokens);
        tokenSet.forEach(tok => {
          this.tokenDocFrequency.set(tok, (this.tokenDocFrequency.get(tok) || 0) + 1);
        });

        this.entries.push({
          docId: doc.id,
          sourceDocName: doc.name || doc.id,
          sourceUrl: doc.metadata?.sourceUrl || null,
          sentence: s,
          tokens,
          tokenSet,
          location: `Sentence ${i + 1}`
        });
      }
    });
  }

  search(query: string, topN = 5) {
    if (!query || this.entries.length === 0) return [];
    const qTokens = this.tokenize(query);
    const qSet = new Set(qTokens);

    const scored = this.entries.map(e => {
      let common = 0;
      for (const t of qSet) {
        if (e.tokenSet.has(t)) common++;
      }
      let score = 0;
      if (common > 0) {
        let idfSum = 0;
        for (const t of qSet) {
          if (e.tokenSet.has(t)) {
            const df = Math.max(1, this.tokenDocFrequency.get(t) || 1);
            const idf = Math.log(1 + (this.totalDocs / df));
            idfSum += idf;
          }
        }
        score = (common / Math.max(1, e.tokens.length)) * idfSum;
      }
      return { entry: e, score };
    }).filter(s => s.score > 0);

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topN).map(s => ({
      sourceDocName: s.entry.sourceDocName,
      sourceUrl: s.entry.sourceUrl,
      excerpt: s.entry.sentence,
      location: s.entry.location,
      score: Number(s.score.toFixed(4))
    }));
  }

  private splitIntoSentences(text: string): string[] {
    if (!text) return [];
    const raw = text.replace(/\r\n/g, '\n').split(/(?<=[.?!])\s+(?=[A-Z0-9])/g);
    return raw.map(s => s.trim()).filter(Boolean);
  }

  private tokenize(text: string): string[] {
    if (!text) return [];
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
      .filter(t => t.length > 2);
  }
}