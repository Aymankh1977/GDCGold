{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 #!/usr/bin/env node\
const fs = require('fs');\
const path = require('path');\
\
async function loadTextFile(filePath) \{\
  const text = await fs.promises.readFile(filePath, 'utf8');\
  return text;\
\}\
\
function findTxtForPdf(pdfPath) \{\
  const txtPath = pdfPath.replace(/\\.pdf$/i, '.txt');\
  if (fs.existsSync(txtPath)) return txtPath;\
  return null;\
\}\
\
function usage() \{\
  console.log('Usage: node scripts/analysis-runner.js --piq <piq-txt> --refs <refs-folder> [--use-ai]');\
  process.exit(1);\
\}\
\
async function main() \{\
  const argv = process.argv.slice(2);\
  const args = \{\};\
  for (let i = 0; i < argv.length; i++) \{\
    const a = argv[i];\
    if (a === '--piq') args.piq = argv[++i];\
    else if (a === '--refs') args.refs = argv[++i];\
    else if (a === '--use-ai') args.useAI = true;\
  \}\
  if (!args.piq || !args.refs) usage();\
\
  if (!fs.existsSync(args.piq)) \{\
    console.error('PIQ file not found:', args.piq);\
    process.exit(2);\
  \}\
  const piqText = await loadTextFile(args.piq);\
  const selectedDoc = \{\
    id: 'bds-pre-inspection',\
    name: path.basename(args.piq),\
    type: 'txt',\
    extractedText: piqText,\
    metadata: \{\}\
  \};\
\
  const refsDir = path.resolve(args.refs);\
  if (!fs.existsSync(refsDir)) \{\
    console.error('Refs directory not found:', refsDir);\
    process.exit(2);\
  \}\
  const entries = fs.readdirSync(refsDir).filter(f => /\\.(pdf|txt)$/i.test(f));\
  const refs = [];\
  for (const e of entries) \{\
    const full = path.join(refsDir, e);\
    if (/\\.txt$/i.test(e)) \{\
      const txt = await loadTextFile(full);\
      refs.push(\{\
        id: path.basename(e, path.extname(e)),\
        name: e,\
        type: 'txt',\
        extractedText: txt,\
        metadata: \{\}\
      \});\
    \} else if (/\\.pdf$/i.test(e)) \{\
      const txtCandidate = findTxtForPdf(full);\
      if (txtCandidate) \{\
        const txt = await loadTextFile(txtCandidate);\
        refs.push(\{\
          id: path.basename(e, path.extname(e)),\
          name: e,\
          type: 'pdf',\
          extractedText: txt,\
          metadata: \{\}\
        \});\
      \} else \{\
        console.warn('Skipping PDF without .txt extract:', full);\
      \}\
    \}\
  \}\
\
  let runner;\
  try \{\
    runner = require('../dist/engines/analysis/runner').runPIQAnalysis;\
  \} catch (err) \{\
    try \{\
      runner = require('../src/engines/analysis/runner').runPIQAnalysis;\
    \} catch (e) \{\
      console.error('Cannot load runner module. Build or use ts-node.');\
      console.error(err, e);\
      process.exit(3);\
    \}\
  \}\
\
  const analysis = await runner(\{\
    selectedDocument: selectedDoc,\
    referenceDocuments: refs,\
    programDocument: null,\
    useAI: !!args.useAI\
  \});\
\
  const outDir = path.resolve('analyses');\
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);\
  const filename = `$\{analysis.documentId\}-$\{Date.now()\}.json`;\
  const outPath = path.join(outDir, filename);\
  fs.writeFileSync(outPath, JSON.stringify(analysis, null, 2), 'utf8');\
  console.log('Analysis written to', outPath);\
\}\
\
main().catch(err => \{\
  console.error('Runner error:', err);\
  process.exit(1);\
\});}