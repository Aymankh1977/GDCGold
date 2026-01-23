#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const PIQ_REQUIREMENTS = [
  { id: 1, standard: 1, title: 'Requirement 1', description: 'Students provide patient care only after demonstrating adequate knowledge and skills.' },
  { id: 2, standard: 1, title: 'Requirement 2', description: 'Systems to inform patients they may be treated by students and record agreement.' },
  { id: 3, standard: 1, title: 'Requirement 3', description: 'Students provide care in safe and appropriate environments, complying with legislation.' },
  { id: 4, standard: 1, title: 'Requirement 4', description: 'Appropriate supervision according to activity and student stage.' },
  { id: 5, standard: 1, title: 'Requirement 5', description: 'Supervisors appropriately qualified and trained.' },
  { id: 6, standard: 1, title: 'Requirement 6', description: 'Raise concerns and candour: policies and protections in place.' },
  { id: 7, standard: 1, title: 'Requirement 7', description: 'Systems to identify and record patient safety issues and act appropriately.' },
  { id: 8, standard: 1, title: 'Requirement 8', description: 'Student fitness to practise policy aligned to GDC guidance.' },
  { id: 9, standard: 2, title: 'Requirement 9', description: 'Framework for managing quality and mapping to GDC outcomes.' },
  { id: 10, standard: 2, title: 'Requirement 10', description: 'Concerns in QM framework addressed and GDC notified of serious threats.' },
  { id: 11, standard: 2, title: 'Requirement 11', description: 'Rigorous internal and external QA, including external examiners.' },
  { id: 12, standard: 2, title: 'Requirement 12', description: 'Quality assure placements and collect feedback.' },
  { id: 13, standard: 3, title: 'Requirement 13', description: 'Assurance of attainment across learning outcomes and fitness to practise.' },
  { id: 14, standard: 3, title: 'Requirement 14', description: 'Management systems to plan, monitor and record assessment, including clinical experience.' },
  { id: 15, standard: 3, title: 'Requirement 15', description: 'Exposure to breadth of patients and procedures enough to demonstrate competency.' },
  { id: 16, standard: 3, title: 'Requirement 16', description: 'Assessments fit for purpose, valid, reliable and quality assured.' },
  { id: 17, standard: 3, title: 'Requirement 17', description: 'Assessment uses feedback from diverse sources including team, peers and patients.' },
  { id: 18, standard: 3, title: 'Requirement 18', description: 'Support students with regular feedback and encourage reflection.' },
  { id: 19, standard: 3, title: 'Requirement 19', description: 'Examiners/assessors appropriately trained and registered.' },
  { id: 20, standard: 3, title: 'Requirement 20', description: 'External examiners report on rigour, standard and equity of assessments.' },
  { id: 21, standard: 3, title: 'Requirement 21', description: 'Assessment fair and against clear criteria with appropriate standard setting.' }
];

function usage() {
  console.log('Usage: node scripts/piq-standalone-runner.js --piq <piq-txt> --refs <refs-folder>');
  process.exit(1);
}

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .filter(t => t.length > 2);
}

function splitIntoSentences(text) {
  if (!text) return [];
  return text
    .replace(/\r\n/g, '\n')
    .split(/(?<=[.?!])\s+(?=[A-Z0-9])/g)
    .map(s => s.trim())
    .filter(Boolean);
}

function buildRefIndex(docs) {
  const entries = [];
  const df = new Map();
  const totalDocs = docs.length;
  docs.forEach(doc => {
    const sentences = splitIntoSentences(doc.extractedText || '');
    const seenTokens = new Set();
    sentences.forEach((s, i) => {
      const tokens = tokenize(s);
      tokens.forEach(t => seenTokens.add(t));
      entries.push({
        docId: doc.id,
        sourceDocName: doc.name,
        sentence: s,
        tokens,
        tokenSet: new Set(tokens),
        location: `Sentence ${i + 1}`
      });
    });
    seenTokens.forEach(t => df.set(t, (df.get(t) || 0) + 1));
  });
  return { entries, df, totalDocs };
}

function searchIndex(index, query, topN = 5) {
  const qTokens = tokenize(query);
  const qSet = new Set(qTokens);
  const scored = index.entries.map(e => {
    let common = 0;
    let idfSum = 0;
    for (const t of qSet) {
      if (e.tokenSet.has(t)) {
        common++;
        const df = Math.max(1, index.df.get(t) || 1);
        idfSum += Math.log(1 + (index.totalDocs / df));
      }
    }
    let score = 0;
    if (common > 0) score = (common / Math.max(1, e.tokens.length)) * idfSum;
    return { entry: e, score };
  }).filter(x => x.score > 0);
  scored.sort((a,b)=>b.score-a.score);
  return scored.slice(0, topN).map(s => ({
    sourceDocName: s.entry.sourceDocName,
    excerpt: s.entry.sentence,
    location: s.entry.location,
    score: Number(s.score.toFixed(4))
  }));
}

function dedupeEvidence(evidence) {
  const seen = new Set();
  const out = [];
  for (const e of evidence) {
    const key = (e.excerpt || '').slice(0, 200).replace(/\s+/g, ' ').trim();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(e);
    }
  }
  out.sort((a,b)=>(b.relevanceScore||0)-(a.relevanceScore||0));
  return out;
}

function determineStatus(deduped) {
  if (!deduped || deduped.length === 0) return 'unknown';
  const avg = deduped.reduce((s,e)=>s+(e.relevanceScore||0),0)/deduped.length;
  if (avg >= 0.75) return 'met';
  return 'partially_met';
}

async function main() {
  const argv = process.argv.slice(2);
  let piqPath = null;
  let refsDir = null;
  for (let i=0;i<argv.length;i++){
    if (argv[i]==='--piq') piqPath = argv[++i];
    else if (argv[i]==='--refs') refsDir = argv[++i];
  }
  if (!piqPath || !refsDir) usage();

  if (!fs.existsSync(piqPath)) {
    console.error('PIQ file not found:', piqPath);
    process.exit(2);
  }
  const piqText = fs.readFileSync(piqPath,'utf8');
  const piqSentences = splitIntoSentences(piqText);

  const refs = [];
  const refFiles = fs.readdirSync(refsDir).filter(f=>/\.txt$/i.test(f));
  for (const f of refFiles) {
    const full = path.join(refsDir,f);
    const txt = fs.readFileSync(full,'utf8');
    refs.push({ id: path.basename(f,path.extname(f)), name: f, extractedText: txt });
  }

  const index = buildRefIndex(refs);

  const results = [];
  for (const req of PIQ_REQUIREMENTS) {
    const evidence = [];

    // search PIQ sentences
    const reqQuery = `${req.title} ${req.description || ''}`;
    const keywords = tokenize(reqQuery);
    for (let i=0;i<piqSentences.length;i++){
      const s = piqSentences[i];
      const tokens = new Set(tokenize(s));
      let common = 0;
      for (const k of keywords) if (tokens.has(k)) common++;
      if (common>0) {
        evidence.push({
          sourceDocName: 'PIQ',
          excerpt: s,
          location: `Sentence ${i+1}`,
          relevanceScore: common/Math.max(1,keywords.length),
          confidence: 0.9
        });
      }
    }

    // search reference index
    const topHits = searchIndex(index, reqQuery, 5);
    for (const h of topHits) {
      evidence.push({
        sourceDocName: h.sourceDocName,
        excerpt: h.excerpt,
        location: h.location,
        relevanceScore: h.score,
        confidence: Math.min(0.95, h.score)
      });
    }

    const deduped = dedupeEvidence(evidence);
    const status = determineStatus(deduped);
    const avgRel = deduped.length>0 ? deduped.reduce((s,e)=>s+(e.relevanceScore||0),0)/deduped.length : 0;
    const confidenceScore = Math.max(0, Math.min(1, avgRel));

    results.push({
      requirementId: req.id,
      status,
      evidence: deduped,
      gaps: deduped.length===0 ? ['No direct evidence found in selected document or provided references for this requirement.'] : [],
      recommendations: deduped.length===0 ? ['Provide documents or narrative mapping to this requirement.'] : [],
      confidenceScore,
      goldStandard: `Auto-generated gold standard for ${req.title}`,
      currentTextSummary: `Found ${deduped.length} evidence items`
    });
  }

  const analysis = {
    id: `analysis-standalone-${Date.now()}`,
    documentId: path.basename(piqPath, path.extname(piqPath)),
    timestamp: new Date().toISOString(),
    requirementResults: results,
    summary: `Standalone PIQ analysis (${results.length} requirements)`
  };

  const outDir = path.resolve('analyses');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${analysis.id}.json`);
  fs.writeFileSync(outPath, JSON.stringify(analysis, null, 2), 'utf8');
  console.log('Wrote analysis to', outPath);
}

main().catch(err=>{
  console.error('Error:', err);
  process.exit(1);
});
