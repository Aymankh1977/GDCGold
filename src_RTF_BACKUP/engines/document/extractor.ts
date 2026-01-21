{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 import * as pdfjsLib from 'pdfjs-dist';\
import mammoth from 'mammoth';\
\
// Configure PDF.js worker\
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/$\{pdfjsLib.version\}/pdf.worker.min.js`;\
\
export interface ExtractionResult \{\
  text: string;\
  pages?: number;\
  metadata?: Record<string, unknown>;\
\}\
\
export const extractFromPDF = async (file: File): Promise<ExtractionResult> => \{\
  const arrayBuffer = await file.arrayBuffer();\
  const pdf = await pdfjsLib.getDocument(\{ data: arrayBuffer \}).promise;\
  \
  let fullText = '';\
  const numPages = pdf.numPages;\
  \
  for (let i = 1; i <= numPages; i++) \{\
    const page = await pdf.getPage(i);\
    const textContent = await page.getTextContent();\
    const pageText = textContent.items\
      .map((item: \{ str?: string \}) => item.str || '')\
      .join(' ');\
    fullText += `\\n--- Page $\{i\} ---\\n$\{pageText\}`;\
  \}\
  \
  const metadata = await pdf.getMetadata().catch(() => null);\
  \
  return \{\
    text: fullText.trim(),\
    pages: numPages,\
    metadata: metadata?.info as Record<string, unknown> | undefined,\
  \};\
\};\
\
export const extractFromWord = async (file: File): Promise<ExtractionResult> => \{\
  const arrayBuffer = await file.arrayBuffer();\
  const result = await mammoth.extractRawText(\{ arrayBuffer \});\
  \
  return \{\
    text: result.value,\
    metadata: \{\
      messages: result.messages,\
    \},\
  \};\
\};\
\
export const extractText = async (file: File): Promise<ExtractionResult> => \{\
  const extension = file.name.split('.').pop()?.toLowerCase();\
  \
  switch (extension) \{\
    case 'pdf':\
      return extractFromPDF(file);\
    case 'docx':\
    case 'doc':\
      return extractFromWord(file);\
    default:\
      throw new Error(`Unsupported file type: $\{extension\}`);\
  \}\
\};}