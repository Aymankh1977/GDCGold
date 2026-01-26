{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 import \{ AnalysisResult \} from '@/types';\
import * as fs from 'fs';\
import * as path from 'path';\
\
export class FileSystemAnalysisStore \{\
  private baseDir = path.resolve(process.cwd(), 'analyses');\
\
  constructor(baseDir?: string) \{\
    if (baseDir) this.baseDir = baseDir;\
    if (!fs.existsSync(this.baseDir)) \{\
      fs.mkdirSync(this.baseDir, \{ recursive: true \});\
    \}\
  \}\
\
  async saveAnalysis(analysis: AnalysisResult): Promise<string> \{\
    const name = `$\{analysis.documentId.replace(/[^a-z0-9-_]/gi, '_')\}-$\{Date.now()\}.json`;\
    const filePath = path.join(this.baseDir, name);\
    await fs.promises.writeFile(filePath, JSON.stringify(analysis, null, 2), 'utf8');\
    return filePath;\
  \}\
\
  async loadAnalysis(filename: string): Promise<AnalysisResult | null> \{\
    const filePath = path.join(this.baseDir, filename);\
    if (!fs.existsSync(filePath)) return null;\
    const raw = await fs.promises.readFile(filePath, 'utf8');\
    return JSON.parse(raw) as AnalysisResult;\
  \}\
\}}