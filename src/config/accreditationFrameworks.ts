import { FrameworkConfig, AccreditationFramework } from '@/types';
import { GDC_STANDARDS } from './gdcStandards';

export const FRAMEWORKS: Record<AccreditationFramework, FrameworkConfig> = {
  GDC: {
    id: 'GDC',
    name: 'General Dental Council (UK)',
    standards: GDC_STANDARDS,
    inspectionCycle: {
      phases: [
        'Pre-inspection questionnaire submission',
        'Document review',
        'Site inspection',
        'Assessment/Examination inspection',
        'Report generation',
        'Decision by Registrar'
      ],
      duration: '6-12 months',
      requirements: [
        'Annual monitoring returns',
        'Self-assessment against Standards for Education',
        'Learning outcomes mapping',
        'Student clinical experience records'
      ]
    }
  },
  NCAAA: {
    id: 'NCAAA',
    name: 'National Center for Academic Accreditation and Assessment (Saudi Arabia)',
    standards: [], // To be populated with NCAAA standards
    inspectionCycle: {
      phases: [
        'Self-study report preparation',
        'Documentation submission',
        'Site visit',
        'Peer review',
        'Accreditation decision'
      ],
      duration: '12-18 months',
      requirements: [
        'Program specifications',
        'Course specifications',
        'Key Performance Indicators (KPIs)',
        'Student learning outcomes assessment'
      ]
    }
  },
  ADA: {
    id: 'ADA',
    name: 'American Dental Association (USA)',
    standards: [], // To be populated with ADA/CODA standards
    inspectionCycle: {
      phases: [
        'Self-study document preparation',
        'Site visit request',
        'Site visit',
        'Commission review',
        'Accreditation decision'
      ],
      duration: '18-24 months',
      requirements: [
        'Institutional self-study',
        'Curriculum documentation',
        'Faculty qualifications',
        'Clinical competency records'
      ]
    }
  }
};

export const getFramework = (id: AccreditationFramework): FrameworkConfig => {
  return FRAMEWORKS[id];
};

export const getAvailableFrameworks = (): AccreditationFramework[] => {
  return Object.keys(FRAMEWORKS) as AccreditationFramework[];
};