export interface PIQQuestion {
  id: string;
  title: string;
  prompt?: string;
  required?: boolean;
}

export interface PIQRequirement {
  id: number;
  standard: number;
  title: string;
  description?: string;
  evidenceExamples?: string[];
}

export const PIQ_QUESTIONS: PIQQuestion[] = [
  { id: 'Q1', title: 'Provider name', required: true },
  { id: 'Q2', title: 'Full title of qualification', required: true },
  { id: 'Q3', title: 'Lead institution delivering the course' },
  { id: 'Q4', title: 'Awarding body of the qualification' },
  { id: 'Q5', title: 'Duration of the course' },
  { id: 'Q6', title: 'Format of the programme' },
  { id: 'Q7', title: 'Programme lead and senior registrant' },
  { id: 'Q8', title: 'Annual student intake' },
  { id: 'Q9', title: 'Current student numbers' },
  { id: 'Q10', title: 'Other qualifications that lead to GDC registration' },
  { id: 'Q11', title: 'Organogram and staffing changes' },
  { id: 'Q12', title: 'Clinical locations and attendance' },
  { id: 'Q13', title: 'Assessment and delivery strategy' },
  { id: 'Q14', title: 'Blueprinting / mapping of assessment to GDC outcomes' },
  { id: 'Q15', title: 'Anything further to know about this programme' }
];

export const PIQ_REQUIREMENTS: PIQRequirement[] = [
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