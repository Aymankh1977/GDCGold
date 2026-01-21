{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 export interface ParsedSection \{\
  title: string;\
  content: string;\
  level: number;\
  startIndex: number;\
  endIndex: number;\
\}\
\
export interface ParsedDocument \{\
  sections: ParsedSection[];\
  questions: ParsedQuestion[];\
  tables: string[][];\
  keyPhrases: string[];\
\}\
\
export interface ParsedQuestion \{\
  id: string;\
  question: string;\
  answer?: string;\
  context: string;\
\}\
\
export const parseDocument = (text: string): ParsedDocument => \{\
  const sections = extractSections(text);\
  const questions = extractQuestions(text);\
  const tables = extractTables(text);\
  const keyPhrases = extractKeyPhrases(text);\
  \
  return \{\
    sections,\
    questions,\
    tables,\
    keyPhrases,\
  \};\
\};\
\
const extractSections = (text: string): ParsedSection[] => \{\
  const sections: ParsedSection[] = [];\
  \
  // Pattern for common section headers (Q1., Requirement 1:, Standard 1, etc.)\
  const headerPatterns = [\
    /^(Q\\d+\\.?\\s*.+?)$/gm,\
    /^(Requirement\\s*\\d+:?\\s*.+?)$/gm,\
    /^(Standard\\s*\\d+:?\\s*.+?)$/gm,\
    /^(\\d+\\.\\s*.+?)$/gm,\
    /^(#\{1,3\}\\s*.+?)$/gm,\
  ];\
  \
  headerPatterns.forEach((pattern) => \{\
    let match;\
    while ((match = pattern.exec(text)) !== null) \{\
      sections.push(\{\
        title: match[1].trim(),\
        content: '',\
        level: 1,\
        startIndex: match.index,\
        endIndex: match.index + match[0].length,\
      \});\
    \}\
  \});\
  \
  // Sort sections by position and extract content\
  sections.sort((a, b) => a.startIndex - b.startIndex);\
  \
  for (let i = 0; i < sections.length; i++) \{\
    const nextStart = sections[i + 1]?.startIndex || text.length;\
    sections[i].content = text.slice(sections[i].endIndex, nextStart).trim();\
    sections[i].endIndex = nextStart;\
  \}\
  \
  return sections;\
\};\
\
const extractQuestions = (text: string): ParsedQuestion[] => \{\
  const questions: ParsedQuestion[] = [];\
  \
  // Pattern for Q&A format\
  const qaPattern = /Q(\\d+)\\.?\\s*([^\\n]+)\\n+([\\s\\S]*?)(?=Q\\d+\\.|$)/gi;\
  \
  let match;\
  while ((match = qaPattern.exec(text)) !== null) \{\
    questions.push(\{\
      id: `Q$\{match[1]\}`,\
      question: match[2].trim(),\
      answer: match[3].trim(),\
      context: text.slice(Math.max(0, match.index - 100), match.index),\
    \});\
  \}\
  \
  return questions;\
\};\
\
const extractTables = (text: string): string[][] => \{\
  const tables: string[][] = [];\
  \
  // Simple table detection (rows with consistent delimiters)\
  const lines = text.split('\\n');\
  let currentTable: string[] = [];\
  \
  lines.forEach((line) => \{\
    if (line.includes('\\t') || line.includes('|')) \{\
      currentTable.push(line);\
    \} else if (currentTable.length > 0) \{\
      if (currentTable.length > 1) \{\
        tables.push(currentTable);\
      \}\
      currentTable = [];\
    \}\
  \});\
  \
  return tables;\
\};\
\
const extractKeyPhrases = (text: string): string[] => \{\
  const keyPhrases: string[] = [];\
  \
  // GDC-specific key terms\
  const gdcTerms = [\
    'patient safety',\
    'fitness to practise',\
    'learning outcomes',\
    'clinical competence',\
    'supervision',\
    'assessment',\
    'quality assurance',\
    'external examiner',\
    'student progression',\
    'consent',\
    'clinical governance',\
  ];\
  \
  gdcTerms.forEach((term) => \{\
    if (text.toLowerCase().includes(term)) \{\
      keyPhrases.push(term);\
    \}\
  \});\
  \
  return keyPhrases;\
\};}