{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 import \{ Document, Evidence, GDCRequirement \} from '../types';\
import \{ GDC_REQUIREMENTS \} from '../data/gdcStandards';\
\
export class EvidenceCitationEngine \{\
  findEvidenceForRequirement(\
    document: Document,\
    requirementId: number\
  ): Evidence[] \{\
    const requirement = GDC_REQUIREMENTS.find(r => r.id === requirementId);\
    if (!requirement) return [];\
\
    return this.searchForEvidence(document, requirement);\
  \}\
\
  private searchForEvidence(document: Document, requirement: GDCRequirement): Evidence[] \{\
    const evidence: Evidence[] = [];\
    const text = document.extractedText;\
    \
    // Split into paragraphs\
    const paragraphs = text.split(/\\n\\n+/);\
    \
    // Build search terms from requirement\
    const searchTerms = this.buildSearchTerms(requirement);\
    \
    for (let i = 0; i < paragraphs.length; i++) \{\
      const paragraph = paragraphs[i].trim();\
      if (paragraph.length < 50) continue;\
\
      const relevance = this.calculateRelevance(paragraph, searchTerms);\
      \
      if (relevance > 0.2) \{\
        evidence.push(\{\
          text: this.truncateText(paragraph, 500),\
          location: this.determineLocation(document.extractedText, paragraph, i),\
          relevanceScore: relevance,\
          sourceDocument: document.name\
        \});\
      \}\
    \}\
\
    return evidence\
      .sort((a, b) => b.relevanceScore - a.relevanceScore)\
      .slice(0, 10);\
  \}\
\
  private buildSearchTerms(requirement: GDCRequirement): string[] \{\
    const terms: string[] = [];\
    \
    // Extract key phrases from description\
    const descWords = requirement.description\
      .toLowerCase()\
      .replace(/[^\\w\\s]/g, '')\
      .split(/\\s+/)\
      .filter(w => w.length > 4);\
    \
    terms.push(...descWords);\
    \
    // Add terms from evidence examples\
    for (const example of requirement.evidenceExamples) \{\
      const exampleWords = example\
        .toLowerCase()\
        .replace(/[^\\w\\s]/g, '')\
        .split(/\\s+/)\
        .filter(w => w.length > 4);\
      terms.push(...exampleWords);\
    \}\
\
    // Remove duplicates\
    return [...new Set(terms)];\
  \}\
\
  private calculateRelevance(text: string, searchTerms: string[]): number \{\
    const textLower = text.toLowerCase();\
    let matches = 0;\
    let weightedMatches = 0;\
\
    // High-value terms get extra weight\
    const highValueTerms = [\
      'policy', 'procedure', 'assessment', 'clinical', 'patient',\
      'supervision', 'competency', 'gateway', 'milestone', 'safety',\
      'consent', 'fitness', 'quality', 'external', 'examiner'\
    ];\
\
    for (const term of searchTerms) \{\
      if (textLower.includes(term)) \{\
        matches++;\
        if (highValueTerms.includes(term)) \{\
          weightedMatches += 2;\
        \} else \{\
          weightedMatches += 1;\
        \}\
      \}\
    \}\
\
    const baseScore = matches / Math.max(searchTerms.length, 1);\
    const weightedScore = weightedMatches / (searchTerms.length * 1.5);\
    \
    return (baseScore + weightedScore) / 2;\
  \}\
\
  private determineLocation(fullText: string, paragraph: string, index: number): string \{\
    // Try to find section headers\
    const sectionPatterns = [\
      /(?:requirement|standard)\\s*(\\d+)/i,\
      /(?:section|part)\\s*(\\d+)/i,\
      /Q(\\d+)\\./i,\
      /(\\d+)\\.\\s+[A-Z]/\
    ];\
\
    const textBefore = fullText.substring(0, fullText.indexOf(paragraph));\
    \
    for (const pattern of sectionPatterns) \{\
      const matches = [...textBefore.matchAll(new RegExp(pattern, 'gi'))];\
      if (matches.length > 0) \{\
        const lastMatch = matches[matches.length - 1];\
        return `Section $\{lastMatch[1] || lastMatch[0]\}`;\
      \}\
    \}\
\
    return `Paragraph $\{index + 1\}`;\
  \}\
\
  private truncateText(text: string, maxLength: number): string \{\
    if (text.length <= maxLength) return text;\
    return text.substring(0, maxLength).trim() + '...';\
  \}\
\
  findEvidenceForQuestion(\
    document: Document,\
    questionKeywords: string[]\
  ): Evidence[] \{\
    const evidence: Evidence[] = [];\
    const sentences = document.extractedText.split(/[.!?]+/);\
\
    for (let i = 0; i < sentences.length; i++) \{\
      const sentence = sentences[i].trim();\
      if (sentence.length < 30) continue;\
\
      const sentenceLower = sentence.toLowerCase();\
      const matchCount = questionKeywords.filter(kw => \
        sentenceLower.includes(kw.toLowerCase())\
      ).length;\
\
      if (matchCount >= 2) \{\
        evidence.push(\{\
          text: sentence,\
          location: `Sentence $\{i + 1\}`,\
          relevanceScore: matchCount / questionKeywords.length,\
          sourceDocument: document.name\
        \});\
      \}\
    \}\
\
    return evidence\
      .sort((a, b) => b.relevanceScore - a.relevanceScore)\
      .slice(0, 5);\
  \}\
\
  generateCitation(evidence: Evidence): string \{\
    return `"$\{evidence.text\}" (Source: $\{evidence.sourceDocument\}, $\{evidence.location\}, Relevance: $\{(evidence.relevanceScore * 100).toFixed(0)\}%)`;\
  \}\
\
  groupEvidenceByRequirement(\
    document: Document\
  ): Map<number, Evidence[]> \{\
    const grouped = new Map<number, Evidence[]>();\
\
    for (const requirement of GDC_REQUIREMENTS) \{\
      const evidence = this.findEvidenceForRequirement(document, requirement.id);\
      grouped.set(requirement.id, evidence);\
    \}\
\
    return grouped;\
  \}\
\}}