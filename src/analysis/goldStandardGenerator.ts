/**
 * Gold Standard Generator for GDC Requirement Analysis
 * 
 * This module generates three-layer "gold standard" best-practice guidance
 * for GDC requirements to help providers understand what a complete,
 * audit-ready response should contain.
 * 
 * Layer 1: High-level operational summary (one paragraph)
 * Layer 2: Detailed compliance points (array of specific requirements)
 * Layer 3: Evidence anchors with examples (array of evidence types and examples)
 */

export interface GoldStandard {
  layer1: string;
  layer2: string[];
  layer3: string[];
}

export interface Requirement {
  id: number;
  title: string;
  description: string;
}

/**
 * Pre-defined gold standards for known GDC requirements
 */
const GOLD_STANDARD_TEMPLATES: Record<number, GoldStandard> = {
  1: {
    layer1: "Students must demonstrate competence in pre-clinical training before undertaking any patient care. A gateway assessment system should ensure students are 'signed off' in simulation labs before accessing clinical lists.",
    layer2: [
      "Implement a formal gateway check between pre-clinical and clinical phases",
      "Electronic system (e.g., iDentity/CAFS) must block clinical access until competency sign-off is recorded",
      "Maintain documentation of all pre-clinical competency assessments",
      "Define clear competency thresholds for each clinical procedure"
    ],
    layer3: [
      "Evidence: Gateway assessment records showing student progression",
      "Evidence: Electronic system logs demonstrating access controls",
      "Evidence: Pre-clinical competency sign-off documentation",
      "Example: 'Students complete 20 phantom head procedures before patient care authorization'"
    ]
  },
  2: {
    layer1: "Every patient must be informed they are being treated by a student and provide informed consent. This should be documented in the electronic health record (EHR) for every clinical session.",
    layer2: [
      "Develop formal SOP for obtaining patient consent",
      "Provide patient information leaflets explaining student involvement",
      "Ensure verbal consent is obtained and documented for each session",
      "Record all consent in the EHR system"
    ],
    layer3: [
      "Evidence: Patient consent forms and information leaflets",
      "Evidence: EHR records showing consent documentation",
      "Evidence: SOP for patient consent procedures",
      "Example: 'Patient consent form states clearly: You are being treated by a dental student under supervision'"
    ]
  },
  4: {
    layer1: "Clinical supervision must be appropriate to the student's stage of development. GDC-registered staff should supervise no more than 4 students during direct patient care to ensure adequate oversight.",
    layer2: [
      "All clinical supervisors must be GDC-registered",
      "Maintain staff-to-student ratio of 1:4 or better during patient care",
      "Supervision level should match student's stage of development",
      "Document supervision arrangements for all clinical sessions"
    ],
    layer3: [
      "Evidence: Staff GDC registration records",
      "Evidence: Clinical session records showing supervision ratios",
      "Evidence: Supervision policy documents",
      "Example: 'Year 3 students: direct supervision; Year 5 students: indirect supervision with immediate availability'"
    ]
  },
  7: {
    layer1: "Patient safety incidents must be systematically recorded, investigated, and reported. Serious incidents should be escalated to the GDC as required, with clear processes for incident management and learning.",
    layer2: [
      "Implement formal incident reporting system",
      "Define criteria for serious incidents requiring GDC notification",
      "Establish investigation procedures for all incidents",
      "Document actions taken and lessons learned"
    ],
    layer3: [
      "Evidence: Incident reporting system documentation",
      "Evidence: Records of incidents investigated and actions taken",
      "Evidence: GDC notifications for serious incidents",
      "Example: 'Patient safety incidents are recorded in central system within 24 hours and reviewed by Clinical Governance Committee'"
    ]
  },
  9: {
    layer1: "A quality management framework should ensure curriculum is mapped to GDC learning outcomes, regularly reviewed, and updated based on feedback and external examiner input.",
    layer2: [
      "Map all curriculum components to GDC learning outcomes",
      "Establish regular curriculum review cycle (at least annually)",
      "Incorporate feedback from students, staff, and external examiners",
      "Document curriculum changes and rationale"
    ],
    layer3: [
      "Evidence: Curriculum mapping documentation showing GDC outcomes coverage",
      "Evidence: Curriculum review committee minutes",
      "Evidence: External examiner reports and responses",
      "Example: 'Curriculum reviewed annually by Education Committee; all 21 GDC learning outcomes mapped to specific modules'"
    ]
  },
  16: {
    layer1: "Assessment methods must be valid, reliable, and fit for purpose. Quality assurance processes should ensure consistency across sites, with regular calibration of assessors and use of standard-setting methods.",
    layer2: [
      "Use validated assessment methods aligned with best practice",
      "Implement standard-setting for all summative assessments (e.g., Angoff method)",
      "Ensure regular assessor calibration and training",
      "Quality assure assessments across all clinical sites"
    ],
    layer3: [
      "Evidence: Assessment validation studies and psychometric data",
      "Evidence: Standard-setting documentation for exams",
      "Evidence: Assessor training and calibration records",
      "Example: 'OSCE stations validated using Angoff method; assessor calibration sessions held twice annually'"
    ]
  }
};

/**
 * Default gold standard template for requirements without specific guidance
 */
const DEFAULT_GOLD_STANDARD: GoldStandard = {
  layer1: "Provide a comprehensive operational description that includes clear governance ownership, monitoring frequency, and explicit links to supporting evidence. The narrative should demonstrate systematic processes and quality assurance.",
  layer2: [
    "Define clear governance ownership and accountability",
    "Specify monitoring and review frequency",
    "Describe systematic processes and procedures",
    "Link to supporting policies and evidence"
  ],
  layer3: [
    "Evidence: Committee minutes showing governance oversight",
    "Evidence: Policy documents and procedures",
    "Evidence: Audit reports and quality assurance documentation",
    "Example: 'Quality Committee reviews compliance quarterly; all findings documented in meeting minutes'"
  ]
};

/**
 * Generate a three-layer gold standard for a requirement text
 * 
 * @param requirementText - The text of the requirement (can include ID, title, or description)
 * @returns GoldStandard object with three layers of best-practice guidance
 */
export function generateGoldStandard(requirementText: string): GoldStandard {
  // Try to extract requirement ID from the text
  const match = requirementText.match(/\b[Rr](?:equirement\s*)?(\d+)\b/);
  
  if (match) {
    const reqId = parseInt(match[1]);
    if (GOLD_STANDARD_TEMPLATES[reqId]) {
      return GOLD_STANDARD_TEMPLATES[reqId];
    }
  }
  
  // For questions (Q1, Q6, etc.), provide question-specific guidance
  const qMatch = requirementText.match(/\b[Qq](?:uestion\s*)?(\d+)\b/);
  if (qMatch) {
    return generateQuestionGoldStandard(parseInt(qMatch[1]));
  }
  
  // Return default template if no specific match found
  return DEFAULT_GOLD_STANDARD;
}

/**
 * Generate gold standards for a list of requirements
 * 
 * @param requirements - Array of requirement objects with id, title, and description
 * @returns Record mapping requirement IDs to their gold standards
 */
export function generateForRequirements(
  requirements: Requirement[]
): Record<number, GoldStandard> {
  const result: Record<number, GoldStandard> = {};
  
  for (const req of requirements) {
    // Try to use template if available, otherwise use default
    result[req.id] = GOLD_STANDARD_TEMPLATES[req.id] || {
      layer1: `${req.title}: Provide a comprehensive operational description with clear governance, monitoring processes, and evidence links. ${DEFAULT_GOLD_STANDARD.layer1}`,
      layer2: DEFAULT_GOLD_STANDARD.layer2,
      layer3: DEFAULT_GOLD_STANDARD.layer3
    };
  }
  
  return result;
}

/**
 * Generate gold standard for questionnaire questions
 */
function generateQuestionGoldStandard(questionNumber: number): GoldStandard {
  const questionStandards: Record<number, GoldStandard> = {
    6: {
      layer1: "Provide a clear chronological table of modules defining the boundary between pre-clinical and clinical phases. Mention the use of simulation (phantom heads) before live patient entry.",
      layer2: [
        "Present curriculum in chronological order with clear phase boundaries",
        "Specify when students transition from simulation to patient care",
        "List all modules with their learning outcomes",
        "Indicate assessment points throughout the curriculum"
      ],
      layer3: [
        "Evidence: Module handbook showing curriculum structure",
        "Evidence: Gateway assessment documentation",
        "Example: 'Years 1-2: Pre-clinical simulation; Year 3: Transition to supervised patient care after gateway assessment'"
      ]
    },
    11: {
      layer1: "The organogram should show two distinct lines: Academic Management and Clinical Governance. It must explicitly name the External Examiner oversight role and key committee structures.",
      layer2: [
        "Show clear separation of academic and clinical governance structures",
        "Include all key committees and their reporting relationships",
        "Name specific roles for quality oversight (e.g., External Examiner)",
        "Indicate accountability lines to senior management"
      ],
      layer3: [
        "Evidence: Organizational chart with named roles",
        "Evidence: Committee terms of reference",
        "Example: 'Education Committee reports to Academic Board; Clinical Governance Committee reports to Medical Director; External Examiner provides independent oversight'"
      ]
    }
  };
  
  return questionStandards[questionNumber] || DEFAULT_GOLD_STANDARD;
}
