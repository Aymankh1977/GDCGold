{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 import \{ SUPPORTED_FILE_TYPES, FILE_SIZE_LIMIT \} from './constants';\
\
export const validateFileType = (filename: string): boolean => \{\
  const extension = '.' + filename.split('.').pop()?.toLowerCase();\
  return SUPPORTED_FILE_TYPES.includes(extension);\
\};\
\
export const validateFileSize = (size: number): boolean => \{\
  return size <= FILE_SIZE_LIMIT;\
\};\
\
export const validateFile = (file: File): \{ valid: boolean; error?: string \} => \{\
  if (!validateFileType(file.name)) \{\
    return \{\
      valid: false,\
      error: `Invalid file type. Supported types: $\{SUPPORTED_FILE_TYPES.join(', ')\}`\
    \};\
  \}\
  \
  if (!validateFileSize(file.size)) \{\
    return \{\
      valid: false,\
      error: `File too large. Maximum size: $\{FILE_SIZE_LIMIT / (1024 * 1024)\}MB`\
    \};\
  \}\
  \
  return \{ valid: true \};\
\};\
\
export const isValidEmail = (email: string): boolean => \{\
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;\
  return emailRegex.test(email);\
\};\
\
export const isNotEmpty = (value: string): boolean => \{\
  return value.trim().length > 0;\
\};}