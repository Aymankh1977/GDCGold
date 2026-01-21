import { GDC_STANDARDS, getAllRequirements, getRequirementById } from '@/config/gdcStandards';

export { GDC_STANDARDS, getAllRequirements, getRequirementById };

export interface RequirementKeywords {
  requirementId: number;
  primaryKeywords: string[];
  secondaryKeywords: string[];
  negativeKeywords: string[];
}

export const REQUIREMENT_KEYWORDS: RequirementKeywords[] = [
  {
    requirementId: 1,
    primaryKeywords: [
      'competent', 'competency', 'pre-clinical', 'gateway', 'assessment',
      'skills', 'knowledge', 'patient care', 'clinical procedure'
    ],
    secondaryKeywords: [
      'sign off', 'progression', 'portfolio', 'self-assessment'
    ],
    negativeKeywords: ['not competent', 'failed', 'insufficient']
  },
  {
    requirementId: 2,
    primaryKeywords: [
      'consent', 'patient information', 'treated by student', 'agreement',
      'informed', 'implications'
    ],
    secondaryKeywords: [
      'leaflet', 'notice', 'form', 'communication'
    ],
    negativeKeywords: ['without consent', 'not informed']
  },
  {
    requirementId: 3,
    primaryKeywords: [
      'safe environment', 'clinical environment', 'health and safety',
      'equality', 'diversity', 'legislation', 'compliance'
    ],
    secondaryKeywords: [
      'audit', 'incident', 'governance', 'CQC', 'policy'
    ],
    negativeKeywords: ['unsafe', 'non-compliant', 'breach']
  },
  {
    requirementId: 4,
    primaryKeywords: [
      'supervision', 'supervised', 'supervisor', 'staff ratio',
      'appropriate supervision'
    ],
    secondaryKeywords: [
      'stage of development', 'clinical activity', 'oversight'
    ],
    negativeKeywords: ['unsupervised', 'inadequate supervision']
  },
  {
    requirementId: 5,
    primaryKeywords: [
      'qualified', 'training', 'registration', 'GDC registered',
      'specialist registration'
    ],
    secondaryKeywords: [
      'equality training', 'diversity training', 'induction'
    ],
    negativeKeywords: ['unqualified', 'not registered', 'expired']
  },
  {
    requirementId: 6,
    primaryKeywords: [
      'raise concerns', 'candour', 'patient safety concerns',
      'whistleblowing', 'duty of candour'
    ],
    secondaryKeywords: [
      'support', 'policy', 'procedure', 'training'
    ],
    negativeKeywords: ['penalised', 'retaliation']
  },
  {
    requirementId: 7,
    primaryKeywords: [
      'patient safety', 'incident', 'reporting', 'recording',
      'regulatory notification'
    ],
    secondaryKeywords: [
      'system', 'process', 'action', 'serious incident'
    ],
    negativeKeywords: ['unreported', 'no system']
  },
  {
    requirementId: 8,
    primaryKeywords: [
      'fitness to practise', 'FtP', 'professional standards',
      'Standards for the Dental Team'
    ],
    secondaryKeywords: [
      'policy', 'procedure', 'embedded', 'guidance'
    ],
    negativeKeywords: ['no policy', 'not aligned']
  },
  {
    requirementId: 9,
    primaryKeywords: [
      'quality management', 'framework', 'curriculum mapping',
      'learning outcomes', 'GDC outcomes'
    ],
    secondaryKeywords: [
      'review', 'update', 'feedback', 'change'
    ],
    negativeKeywords: ['outdated', 'not mapped']
  },
  {
    requirementId: 10,
    primaryKeywords: [
      'quality concerns', 'escalation', 'address concerns',
      'GDC notification', 'serious threat'
    ],
    secondaryKeywords: [
      'risk', 'action', 'audit', 'committee'
    ],
    negativeKeywords: ['unaddressed', 'delayed']
  },
  {
    requirementId: 11,
    primaryKeywords: [
      'quality assurance', 'external examiner', 'internal review',
      'QAA', 'patient feedback'
    ],
    secondaryKeywords: [
      'verification', 'audit', 'report', 'procedure'
    ],
    negativeKeywords: ['no external', 'inadequate QA']
  },
  {
    requirementId: 12,
    primaryKeywords: [
      'placement', 'outreach', 'quality assure placement',
      'student feedback'
    ],
    secondaryKeywords: [
      'monitoring', 'assessment', 'patient care'
    ],
    negativeKeywords: ['no placement QA', 'unmonitored']
  },
  {
    requirementId: 13,
    primaryKeywords: [
      'learning outcomes', 'safe beginner', 'fit to practise',
      'award qualification', 'demonstrated attainment'
    ],
    secondaryKeywords: [
      'assessment', 'progression', 'sign-off', 'portfolio'
    ],
    negativeKeywords: ['not demonstrated', 'incomplete']
  },
  {
    requirementId: 14,
    primaryKeywords: [
      'assessment management', 'central recording', 'monitoring system',
      'clinical experience', 'technical experience'
    ],
    secondaryKeywords: [
      'plan', 'record', 'track', 'system'
    ],
    negativeKeywords: ['no system', 'inadequate tracking']
  },
  {
    requirementId: 15,
    primaryKeywords: [
      'breadth of patients', 'clinical exposure', 'sufficient occasions',
      'competency', 'procedures'
    ],
    secondaryKeywords: [
      'variety', 'experience', 'skills development'
    ],
    negativeKeywords: ['limited exposure', 'insufficient']
  },
  {
    requirementId: 16,
    primaryKeywords: [
      'valid', 'reliable', 'fit for purpose', 'assessment methods',
      'quality assured'
    ],
    secondaryKeywords: [
      'psychometric', 'best practice', 'monitoring'
    ],
    negativeKeywords: ['invalid', 'unreliable']
  },
  {
    requirementId: 17,
    primaryKeywords: [
      'multi-source feedback', 'peer feedback', 'patient feedback',
      'dental team feedback'
    ],
    secondaryKeywords: [
      'continuous assessment', 'variety of sources'
    ],
    negativeKeywords: ['single source', 'no feedback']
  },
  {
    requirementId: 18,
    primaryKeywords: [
      'feedback', 'reflection', 'improve performance',
      'regular feedback', 'reflective practice'
    ],
    secondaryKeywords: [
      'mentor', 'portfolio', 'support'
    ],
    negativeKeywords: ['no feedback', 'no reflection']
  },
  {
    requirementId: 19,
    primaryKeywords: [
      'examiner qualification', 'assessor training', 'registered',
      'calibration', 'equality training'
    ],
    secondaryKeywords: [
      'experience', 'skills', 'appointment'
    ],
    negativeKeywords: ['unqualified', 'not trained', 'not registered']
  },
  {
    requirementId: 20,
    primaryKeywords: [
      'external examiner report', 'rigorous', 'correct standard',
      'equity', 'fair'
    ],
    secondaryKeywords: [
      'responsibilities', 'documented', 'review'
    ],
    negativeKeywords: ['no external review', 'undocumented']
  },
  {
    requirementId: 21,
    primaryKeywords: [
      'fair assessment', 'clear criteria', 'standard setting',
      'summative assessment', 'pass mark'
    ],
    secondaryKeywords: [
      'marking criteria', 'guidance', 'appeals', 'handbook'
    ],
    negativeKeywords: ['unclear criteria', 'unfair', 'no standard setting']
  }
];

export const getKeywordsForRequirement = (requirementId: number): RequirementKeywords | undefined => {
  return REQUIREMENT_KEYWORDS.find(k => k.requirementId === requirementId);
};