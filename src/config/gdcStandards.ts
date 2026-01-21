import { GDCStandard, GDCRequirement } from '@/types';

export const GDC_STANDARDS: GDCStandard[] = [
  {
    id: 1,
    name: 'Protecting Patients',
    description: 'Providers must be aware of their duty to protect the public. Providers must ensure that patient safety is paramount and care of patients is of an appropriate standard. Any risk to the safety of patients and their care by students must be minimised.',
    requirements: [
      {
        id: 1,
        standard: 1,
        title: 'Student Competency for Patient Care',
        description: 'Students must provide patient care only when they have demonstrated adequate knowledge and skills. For clinical procedures, the student should be assessed as competent in the relevant skills at the levels required in the pre-clinical environments prior to treating patients.',
        evidenceExamples: [
          'Relevant policy and procedures',
          'Timetable of assessments',
          'Details of clinical and technical gateway assessments',
          'Student sign off records',
          'Student progression statistics',
          'Student portfolio',
          'Self-assessment forms',
          'Handbooks',
          'Student evaluation and reflection documentation'
        ]
      },
      {
        id: 2,
        standard: 1,
        title: 'Patient Information and Consent',
        description: 'Providers must have systems in place to inform patients that they may be treated by students and the possible implications of this. Patient agreement to treatment by a student must be obtained and recorded prior to treatment commencing.',
        evidenceExamples: [
          'Policy on communicating treatment by students to patients',
          'Evidence of student training in this area',
          'Examples of leaflets, letters and consent forms',
          'Notices in the clinical environment',
          'Examples of recorded consent across departments'
        ]
      },
      {
        id: 3,
        standard: 1,
        title: 'Safe Clinical Environment',
        description: 'Students must only provide patient care in an environment which is safe and appropriate. The provider must comply with relevant legislation and requirements regarding patient care, including equality and diversity, wherever treatment takes place.',
        evidenceExamples: [
          'Policies on clinical and workplace safety',
          'Equality and diversity policies',
          'Governance and/or systems regulator reports',
          'Audit reports',
          'Incident logs and actions taken',
          'Minutes of relevant committee meetings',
          'Records of complaints and how they were addressed'
        ]
      },
      {
        id: 4,
        standard: 1,
        title: 'Appropriate Supervision',
        description: 'When providing patient care and services, providers must ensure that students are supervised appropriately according to the activity and the student\'s stage of development.',
        evidenceExamples: [
          'Policy and procedures for supervision of students',
          'Staff to student ratios across departments/clinics',
          'Records showing who is supervising each clinic'
        ]
      },
      {
        id: 5,
        standard: 1,
        title: 'Qualified Supervisors',
        description: 'Supervisors must be appropriately qualified and trained. This should include training in equality and diversity legislation relevant for the role. Clinical supervisors must have appropriate general or specialist registration with a UK regulatory body.',
        evidenceExamples: [
          'Relevant policy and procedures',
          'Records of supervisor training and induction',
          'Equality and diversity training records',
          'Evidence of registration including UK registration numbers',
          'Timetable showing supervisor allocation'
        ]
      },
      {
        id: 6,
        standard: 1,
        title: 'Raising Concerns and Candour',
        description: 'Providers must ensure that students and all those involved in the delivery of education and training are aware of their obligation to raise concerns if they identify any risks to patient safety and the need for candour when things go wrong.',
        evidenceExamples: [
          'Relevant policy and procedures',
          'Student and staff training regarding candour and raising concerns',
          'Communication mechanisms',
          'Records of concerns raised and actions taken',
          'Surveys of staff and students'
        ]
      },
      {
        id: 7,
        standard: 1,
        title: 'Patient Safety Systems',
        description: 'Systems must be in place to identify and record issues that may affect patient safety. Should a patient safety issue arise, appropriate action must be taken by the provider and where necessary the relevant regulatory body should be notified.',
        evidenceExamples: [
          'Policies outlining systems in place',
          'Process maps',
          'Incident logs and records of actions taken',
          'Reporting and recording systems for serious incidents',
          'Evidence of notification of regulatory body'
        ]
      },
      {
        id: 8,
        standard: 1,
        title: 'Student Fitness to Practise',
        description: 'Providers must have a student fitness to practise policy and apply it as required. The content and significance of the student fitness to practise procedures must be conveyed to students and aligned to GDC Student Fitness to Practise Guidance.',
        evidenceExamples: [
          'Student fitness to practise policy and procedures',
          'Method of communication to staff and students',
          'Details of student fitness to practise cases',
          'Documentation showing where Standards for the Dental Team is embedded'
        ]
      }
    ]
  },
  {
    id: 2,
    name: 'Quality Evaluation and Review of the Programme',
    description: 'The provider must have in place effective policy and procedures for the monitoring and review of the programme.',
    requirements: [
      {
        id: 9,
        standard: 2,
        title: 'Quality Management Framework',
        description: 'The provider must have a framework in place that details how it manages the quality of the programme which includes making appropriate changes to ensure the curriculum continues to map across to the latest GDC learning outcomes.',
        evidenceExamples: [
          'Relevant policy, procedures and documentation',
          'Review policy and timeline',
          'Use of multisource feedback including patient feedback',
          'Changes to the programme submitted to the GDC'
        ]
      },
      {
        id: 10,
        standard: 2,
        title: 'Addressing Quality Concerns',
        description: 'Any concerns identified through the operation of the quality management framework, including internal and external reports relating to quality, must be addressed as soon as possible and the GDC notified of serious threats to students achieving the learning outcomes.',
        evidenceExamples: [
          'Relevant policy and procedures including escalation process',
          'Whistleblowing policy',
          'Minutes from committees responsible for programme review',
          'Audit reports',
          'Risk log with solutions and actions taken',
          'Evidence of past notifications to the GDC'
        ]
      },
      {
        id: 11,
        standard: 2,
        title: 'Internal and External Quality Assurance',
        description: 'Programmes must be subject to rigorous internal and external quality assurance procedures. External quality assurance should include the use of external examiners, who should be familiar with the GDC learning outcomes.',
        evidenceExamples: [
          'Relevant policy and procedures',
          'Information on external review bodies (QAA, Ofqual)',
          'External examiner reports',
          'Internal verification reports',
          'Patient/customer feedback forms and actions taken'
        ]
      },
      {
        id: 12,
        standard: 2,
        title: 'Placement Quality Assurance',
        description: 'The provider must have effective systems in place to quality assure placements where students deliver treatment to ensure that patient care and student assessment across all locations meets these Standards.',
        evidenceExamples: [
          'Relevant policy and procedures for placement QA',
          'Feedback from staff, patients and students',
          'Audit reports',
          'Monitoring reports from provider and placement providers'
        ]
      }
    ]
  },
  {
    id: 3,
    name: 'Student Assessment',
    description: 'Assessment must be reliable and valid. The choice of assessment method must be appropriate to demonstrate achievement of the GDC learning outcomes. Assessors must be fit to perform the assessment task.',
    requirements: [
      {
        id: 13,
        standard: 3,
        title: 'Demonstration of Learning Outcomes',
        description: 'To award the qualification, providers must be assured that students have demonstrated attainment across the full range of learning outcomes, and that they are fit to practise at the level of a safe beginner.',
        evidenceExamples: [
          'Assessment strategy for the programme',
          'Assessment timetable',
          'Assessment records/central recording system',
          'Student portfolio',
          'Student progression policy and statistics',
          'Minutes of progression boards'
        ]
      },
      {
        id: 14,
        standard: 3,
        title: 'Assessment Management Systems',
        description: 'The provider must have in place effective management systems to plan, monitor and centrally record the assessment of students, including the monitoring of clinical and/or technical experience.',
        evidenceExamples: [
          'Central recording and monitoring system',
          'Relevant policy and procedures',
          'External examiner reports',
          'Records of student clinical experience',
          'Minutes of assessment planning meetings'
        ]
      },
      {
        id: 15,
        standard: 3,
        title: 'Breadth of Clinical Experience',
        description: 'Students must have exposure to an appropriate breadth of patients and procedures and should undertake each activity relating to patient care on sufficient occasions.',
        evidenceExamples: [
          'Relevant policy and procedures',
          'Summary of individual students\' clinical experience',
          'Central recording system',
          'Clinical treatment records',
          'Competency sign off policy and procedures'
        ]
      },
      {
        id: 16,
        standard: 3,
        title: 'Assessment Validity and Reliability',
        description: 'Providers must demonstrate that assessments are fit for purpose and deliver results which are valid and reliable. The methods of assessment used must be appropriate to the learning outcomes.',
        evidenceExamples: [
          'Mapping and description of assessments',
          'Remit and minutes of responsible committees',
          'Internal programme review process',
          'External examiner feedback',
          'Psychometric analysis of assessments'
        ]
      },
      {
        id: 17,
        standard: 3,
        title: 'Multi-source Feedback',
        description: 'Assessment must utilise feedback collected from a variety of sources, which should include other members of the dental team, peers, patients and/or customers.',
        evidenceExamples: [
          'Relevant policy and procedures',
          'Feedback forms for patients and colleagues',
          'Patient/peer/customer comments',
          'Relevant assessment records',
          'Records showing continuous assessment'
        ]
      },
      {
        id: 18,
        standard: 3,
        title: 'Feedback and Reflection',
        description: 'The provider must support students to improve their performance by providing regular feedback and by encouraging students to reflect on their practice.',
        evidenceExamples: [
          'Student portfolio',
          'Relevant training in reflection and receiving feedback',
          'Evidence of reflection',
          'Evidence of mentoring sessions and feedback'
        ]
      },
      {
        id: 19,
        standard: 3,
        title: 'Examiner Qualifications',
        description: 'Examiners/assessors must have appropriate skills, experience and training to undertake the task of assessment, including appropriate general or specialist registration with a UK regulatory body.',
        evidenceExamples: [
          'List of assessors showing qualifications and registration',
          'Evidence of training specific to student assessment',
          'Recruitment and appointment policy',
          'Assessor calibration training',
          'External examiner reports'
        ]
      },
      {
        id: 20,
        standard: 3,
        title: 'External Examiner Reporting',
        description: 'Providers must ask external examiners to report on the extent to which assessment processes are rigorous, set at the correct standard, ensure equity of treatment for students and have been fairly conducted.',
        evidenceExamples: [
          'External examiners reports',
          'Records showing responses to external examiner input',
          'Documentation and training provided to external examiners',
          'External examiner role profile'
        ]
      },
      {
        id: 21,
        standard: 3,
        title: 'Fair Assessment and Standard Setting',
        description: 'Assessment must be fair and undertaken against clear criteria. The standard expected of students in each area to be assessed must be clear and students and staff involved in assessment must be aware of this standard.',
        evidenceExamples: [
          'Marking/assessment criteria and guidance',
          'Standard setting procedures',
          'Evidence of the range of assessors used',
          'Arrangements for failed candidates',
          'Appeals process',
          'Student and staff handbooks'
        ]
      }
    ]
  }
];

export const getAllRequirements = (): GDCRequirement[] => {
  return GDC_STANDARDS.flatMap(standard => standard.requirements);
};

export const getRequirementById = (id: number): GDCRequirement | undefined => {
  return getAllRequirements().find(req => req.id === id);
};

export const getStandardById = (id: number): GDCStandard | undefined => {
  return GDC_STANDARDS.find(standard => standard.id === id);
};

export const getRequirementsByStandard = (standardId: number): GDCRequirement[] => {
  const standard = getStandardById(standardId);
  return standard?.requirements || [];
};