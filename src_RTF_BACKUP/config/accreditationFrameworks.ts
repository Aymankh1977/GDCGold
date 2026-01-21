{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 import \{ FrameworkConfig, AccreditationFramework \} from '@/types';\
import \{ GDC_STANDARDS \} from './gdcStandards';\
\
export const FRAMEWORKS: Record<AccreditationFramework, FrameworkConfig> = \{\
  GDC: \{\
    id: 'GDC',\
    name: 'General Dental Council (UK)',\
    standards: GDC_STANDARDS,\
    inspectionCycle: \{\
      phases: [\
        'Pre-inspection questionnaire submission',\
        'Document review',\
        'Site inspection',\
        'Assessment/Examination inspection',\
        'Report generation',\
        'Decision by Registrar'\
      ],\
      duration: '6-12 months',\
      requirements: [\
        'Annual monitoring returns',\
        'Self-assessment against Standards for Education',\
        'Learning outcomes mapping',\
        'Student clinical experience records'\
      ]\
    \}\
  \},\
  NCAAA: \{\
    id: 'NCAAA',\
    name: 'National Center for Academic Accreditation and Assessment (Saudi Arabia)',\
    standards: [], // To be populated with NCAAA standards\
    inspectionCycle: \{\
      phases: [\
        'Self-study report preparation',\
        'Documentation submission',\
        'Site visit',\
        'Peer review',\
        'Accreditation decision'\
      ],\
      duration: '12-18 months',\
      requirements: [\
        'Program specifications',\
        'Course specifications',\
        'Key Performance Indicators (KPIs)',\
        'Student learning outcomes assessment'\
      ]\
    \}\
  \},\
  ADA: \{\
    id: 'ADA',\
    name: 'American Dental Association (USA)',\
    standards: [], // To be populated with ADA/CODA standards\
    inspectionCycle: \{\
      phases: [\
        'Self-study document preparation',\
        'Site visit request',\
        'Site visit',\
        'Commission review',\
        'Accreditation decision'\
      ],\
      duration: '18-24 months',\
      requirements: [\
        'Institutional self-study',\
        'Curriculum documentation',\
        'Faculty qualifications',\
        'Clinical competency records'\
      ]\
    \}\
  \}\
\};\
\
export const getFramework = (id: AccreditationFramework): FrameworkConfig => \{\
  return FRAMEWORKS[id];\
\};\
\
export const getAvailableFrameworks = (): AccreditationFramework[] => \{\
  return Object.keys(FRAMEWORKS) as AccreditationFramework[];\
\};}