/**
 * goldStandardGenerator.ts
 * 
 * Generates three-layer gold-standard best-practice entries for GDC Requirements
 * when no exact benchmark text exists in reference documents.
 * 
 * Three-layer output structure:
 * (a) Principle - concise statement of what the requirement means
 * (b) Practical Controls & Evidence - what operational controls and evidence to provide
 * (c) Example Wording - policy snippets or example text that could be used
 */

export interface GoldStandardOutput {
  requirementId: string;
  principle: string;
  practicalControls: string[];
  exampleWording: string;
}

/**
 * Gold standard templates for common GDC requirements
 * Based on GDC inspection standards and best practices
 */
const REQUIREMENT_TEMPLATES: Record<string, GoldStandardOutput> = {
  'R1': {
    requirementId: 'R1',
    principle: 'Students must only provide treatment when adequately prepared and competent to do so.',
    practicalControls: [
      'Implement a gateway assessment in simulation labs before clinical entry',
      'Use electronic patient management systems to block access until sign-off is recorded',
      'Maintain documented records of all competency assessments',
      'Establish clear competency thresholds approved by clinical governance committee'
    ],
    exampleWording: 'All students must successfully complete phantom head assessments and receive formal sign-off from qualified clinical educators before treating patients. The clinical allocation system (e.g., iDentity/CAFS) enforces this requirement by preventing patient bookings until competency approval is electronically recorded.'
  },
  'R2': {
    requirementId: 'R2',
    principle: 'Patients must be informed that they are being treated by students and provide informed consent.',
    practicalControls: [
      'Develop patient information leaflets clearly stating student involvement',
      'Implement verbal consent procedures for each treatment session',
      'Record consent in electronic health records (EHR) for every patient encounter',
      'Train students on consent procedures and documentation'
    ],
    exampleWording: 'Every patient receives a written information leaflet and verbal explanation that their treatment will be provided by a student under qualified supervision. Informed consent is documented in the patient record before each clinical session, with both patient and student signatures recorded.'
  },
  'R4': {
    requirementId: 'R4',
    principle: 'Adequate supervision must be provided at all times during patient care.',
    practicalControls: [
      'Maintain staff-to-student ratios (recommended maximum 1:4)',
      'Ensure all clinical supervisors are GDC-registered',
      'Implement physical supervision protocols requiring supervisor presence',
      'Document supervision arrangements in clinical placement agreements'
    ],
    exampleWording: 'Clinical supervision is provided by GDC-registered clinicians at a ratio not exceeding 1:4 students. Supervisors must be physically present in the clinical environment during all patient treatment sessions. Supervision arrangements are reviewed quarterly by the Clinical Governance Committee.'
  },
  'R7': {
    requirementId: 'R7',
    principle: 'Patient safety incidents must be identified, managed, and reported appropriately.',
    practicalControls: [
      'Establish incident reporting system accessible to all students and staff',
      'Implement clear escalation pathways for serious incidents',
      'Report relevant incidents to GDC within required timeframes',
      'Conduct regular reviews of incident trends and implement learning'
    ],
    exampleWording: 'All patient safety incidents are reported through the institutional incident management system within 24 hours. Serious incidents requiring GDC notification are escalated immediately to the Head of Clinical Governance, who ensures statutory reporting obligations are met. Incident reviews are conducted monthly with learning points disseminated to all clinical staff.'
  },
  'R9': {
    requirementId: 'R9',
    principle: 'Curriculum quality and effectiveness must be monitored and continuously improved.',
    practicalControls: [
      'Designate senior academic leadership with curriculum oversight responsibility',
      'Establish curriculum monitoring committee with defined terms of reference',
      'Collect and analyze student performance data, feedback, and outcomes',
      'Implement evidence-based curriculum changes with documented rationale'
    ],
    exampleWording: 'The Curriculum Quality Committee, chaired by the Head of Dental Education, meets quarterly to review student progression data, external examiner reports, and stakeholder feedback. All curriculum changes are evidenced-based, formally approved, and evaluated for effectiveness using defined metrics.'
  },
  'R16': {
    requirementId: 'R16',
    principle: 'Assessments must be valid, reliable, and fairly applied across all delivery sites.',
    practicalControls: [
      'Use standard setting methods (e.g., Angoff, borderline regression) for assessments',
      'Ensure examiner training and calibration across all sites',
      'Implement moderation procedures to ensure consistency',
      'Maintain assessment blueprints aligned to learning outcomes'
    ],
    exampleWording: 'All high-stakes assessments undergo standard setting using the modified Angoff method. Examiners complete mandatory training and calibration exercises annually. Assessment results are moderated across sites by the Assessment Board to ensure consistency. Assessment blueprints are reviewed annually to ensure comprehensive coverage of learning outcomes.'
  }
};

/**
 * Generate gold standard best practice guidance for a GDC requirement.
 * Uses heuristics based on requirement description and program text.
 * 
 * @param requirementId - The GDC requirement identifier (e.g., 'R1', 'R2')
 * @param requirementDescription - Optional description of the requirement for context
 * @param programText - Optional extracted text from provider's current program description
 * @returns GoldStandardOutput with three-layer guidance
 */
export function generateGoldStandardForRequirement(
  requirementId: string,
  requirementDescription?: string,
  programText?: string
): GoldStandardOutput {
  const cleanId = requirementId.toUpperCase().trim();
  
  // Return template if available
  if (REQUIREMENT_TEMPLATES[cleanId]) {
    return REQUIREMENT_TEMPLATES[cleanId];
  }
  
  // Extract requirement number for heuristic matching
  const reqNumber = cleanId.replace(/[^0-9]/g, '');
  
  // Generic template based on requirement characteristics
  return generateHeuristicGoldStandard(cleanId, reqNumber, requirementDescription, programText);
}

/**
 * Generate heuristic gold standard when no template exists.
 * Uses requirement patterns and keywords to synthesize guidance.
 */
function generateHeuristicGoldStandard(
  requirementId: string,
  reqNumber: string,
  description?: string,
  programText?: string
): GoldStandardOutput {
  const descLower = (description || '').toLowerCase();
  const textLower = (programText || '').toLowerCase();
  
  // Detect requirement themes from description
  const isSupervisionRelated = descLower.includes('supervis') || descLower.includes('oversight');
  const isAssessmentRelated = descLower.includes('assess') || descLower.includes('examin');
  const isPatientSafetyRelated = descLower.includes('patient') && (descLower.includes('safe') || descLower.includes('care'));
  const isCurriculumRelated = descLower.includes('curriculum') || descLower.includes('programme');
  const isQualityRelated = descLower.includes('quality') || descLower.includes('standard');
  
  let principle: string;
  let practicalControls: string[];
  let exampleWording: string;
  
  if (isSupervisionRelated) {
    principle = 'Appropriate supervision and oversight must be maintained for all clinical activities.';
    practicalControls = [
      'Define clear supervision requirements and staff-to-student ratios',
      'Ensure all supervisors meet GDC registration and training requirements',
      'Document supervision arrangements and monitor compliance',
      'Review supervision effectiveness through regular quality audits'
    ];
    exampleWording = 'Clinical supervision is provided by appropriately qualified and GDC-registered staff. Supervision ratios are maintained according to approved protocols, and arrangements are reviewed regularly to ensure effectiveness and compliance with GDC standards.';
  } else if (isAssessmentRelated) {
    principle = 'Assessment processes must be valid, reliable, and fairly applied to ensure competency standards are met.';
    practicalControls = [
      'Implement robust standard setting and moderation procedures',
      'Provide comprehensive training for all assessors',
      'Ensure assessment blueprints align with learning outcomes',
      'Monitor assessment performance data and conduct regular reviews'
    ];
    exampleWording = 'All assessments are designed with clear blueprints aligned to learning outcomes. Standard setting procedures ensure appropriate pass marks, and assessor training maintains consistency. Assessment data is monitored to identify trends and inform continuous improvement.';
  } else if (isPatientSafetyRelated) {
    principle = 'Patient safety must be the paramount consideration in all clinical education activities.';
    practicalControls = [
      'Establish clear patient safety protocols and incident reporting systems',
      'Ensure students understand their responsibilities for patient safety',
      'Implement immediate escalation pathways for safety concerns',
      'Conduct regular safety reviews and implement learning from incidents'
    ];
    exampleWording = 'Patient safety is prioritized through comprehensive protocols, mandatory student training, and robust incident management systems. All safety concerns are reported and investigated promptly, with learning points shared across the clinical environment.';
  } else if (isCurriculumRelated) {
    principle = 'The curriculum must be regularly reviewed and updated to ensure it meets GDC standards and prepares students for safe and effective practice.';
    practicalControls = [
      'Establish curriculum governance committee with appropriate membership',
      'Collect and analyze performance data, feedback, and external input',
      'Implement evidence-based curriculum changes with documented rationale',
      'Evaluate effectiveness of curriculum changes using defined metrics'
    ];
    exampleWording = 'The curriculum is overseen by a designated committee that meets regularly to review student outcomes, stakeholder feedback, and external examiner reports. All changes are evidence-based, formally approved, and evaluated to ensure they achieve intended improvements.';
  } else if (isQualityRelated) {
    principle = 'Quality assurance processes must be embedded to ensure consistent standards and continuous improvement.';
    practicalControls = [
      'Implement systematic quality monitoring across all activities',
      'Collect and analyze quality indicators and performance metrics',
      'Establish clear accountability for quality outcomes',
      'Use quality data to drive evidence-based improvements'
    ];
    exampleWording = 'Quality assurance is embedded throughout the program with systematic monitoring, regular reviews, and clear accountability structures. Quality data informs decision-making and drives continuous improvement initiatives.';
  } else {
    // Generic fallback
    principle = 'This requirement must be met through appropriate governance, operational controls, and evidence-based practice.';
    practicalControls = [
      'Establish clear policies and procedures addressing the requirement',
      'Designate responsibility and accountability for compliance',
      'Implement monitoring systems to track performance',
      'Conduct regular reviews and implement improvements as needed'
    ];
    exampleWording = 'Formal policies and procedures address this requirement, with designated leadership accountability. Regular monitoring and review processes ensure ongoing compliance and identify opportunities for improvement.';
  }
  
  return {
    requirementId,
    principle,
    practicalControls,
    exampleWording
  };
}

/**
 * Generate gold standards for multiple requirements at once.
 * Useful for batch processing when analyzing a full questionnaire.
 */
export function generateGoldStandardsForMultipleRequirements(
  requirementIds: string[],
  requirementDescriptions?: Record<string, string>,
  programText?: string
): GoldStandardOutput[] {
  return requirementIds.map(id => 
    generateGoldStandardForRequirement(
      id,
      requirementDescriptions?.[id],
      programText
    )
  );
}
