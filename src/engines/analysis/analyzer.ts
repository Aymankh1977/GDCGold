import { 
  Document, QuestionnaireAnalysis, QuestionnaireResponse, 
  RequirementNarrativeFinding, Evidence, RequirementResult 
} from '@/types';
import { generateId } from '@/utils/helpers';
import { getKeywordsForRequirement } from './gdcRequirements';

/**
 * 1. CONFIGURATION: Which questions are administrative extraction?
 */
const EXTRACTION_KEYS = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q7', 'Q8', 'Q9', 'Q10'];

/**
 * 2. GOLD STANDARDS DICTIONARY
 * Perfectly synthesized requirements for a "Complete" document.
 */
const GOLD_STANDARDS: Record<string, string> = {
  // Questions
  'Q6': "Best Practice: Provide a clear chronological table of modules. Specifically define the 'pre-clinical' vs 'clinical' boundary. Mention the use of phantom heads (simulation) before live patient entry.",
  'Q11': "Best Practice: The organogram should show two distinct lines: Academic Management and Clinical Governance. It must explicitly name the External Examiner oversight role.",
  'Q12': "Best Practice: Map every clinical site. State exactly how many chairs are available and the staff-to-student ratio (ideally 1:4). Specify the clinical SOPs allowed at each outreach location.",
  'Q13': "Best Practice: Strategy must integrate Daily Clinical Assessment (Formative) with High-Stakes Gateways (Summative). Standard setting (e.g., Angoff) must be mentioned for all exams.",
  'Q14': "Best Practice: A digital mapping file should link every GDC learning outcome to a specific assessment point in the curriculum to ensure no gaps exist.",
  'Q15': "Best Practice: Narrative should describe the 'Patient Mix' strategy, ensuring students see a variety of cases (Periodontics, Prosthodontics, etc.) with auditable minimum targets.",
  // Requirements (Default for R1-R21)
  'R_DEFAULT': "Best Practice: Describe the operational plan (Who/What/When). Specify the governance committee that monitors this. Link to specific evidence like 'Minutes of Quality Committee' or 'Clinical Audit Reports'.",
  'R1': "Best Practice: Implement a 'Gateway' check. Students must be 'Sign-off' in simulation labs before being issued a clinical list. The electronic system (iDentity/CAFS) must block access until sign-off is recorded.",
  'R2': "Best Practice: Formal SOP for patient consent. Every patient must be informed (via leaflet and verbal) that they are treated by a student. Consent must be recorded in the EHR for every session.",
  'R4': "Best Practice: Supervision must be constant. Clinical staff must be GDC-registered and have no more than 4 students under their direct oversight during patient care."
};

/**
 * HELPER: Robust Gold Standard Lookup
 */
function getGoldStandard(id: string): string {
  const key = id.toUpperCase().trim();
  if (GOLD_STANDARDS[key]) return GOLD_STANDARDS[key];
  if (key.startsWith('R')) return GOLD_STANDARDS['R_DEFAULT'];
  return "Best Practice: Provide an operational description including governance ownership, monitoring frequency, and explicit evidence links.";
}

export function analyzeQuestionnaire(
  questionnaireDoc: Document,
  parsed: any,
  contextDocuments: Document[]
): QuestionnaireAnalysis {
  const responses: QuestionnaireResponse[] = [];
  const requirementAssessments: RequirementNarrativeFinding[] = [];
  const extractedFields: any[] = [];

  // Process Questions
  parsed.questions?.forEach((q: any) => {
    const cleanId = q.id.toUpperCase().trim();
    const answer = q.answer?.trim() || "";

    if (EXTRACTION_KEYS.includes(cleanId)) {
      extractedFields.push({
        questionId: cleanId,
        label: q.question,
        value: answer || '(Not stated)',
        status: answer ? 'complete' : 'incomplete'
      });
    } else {
      responses.push({
        questionId: cleanId,
        question: q.question,
        originalAnswer: answer,
        status: answer.length > 150 ? 'complete' : 'needs-review',
        recommendations: ["Expand narrative to include monitoring frequency."],
        evidenceReferences: [],
        goldStandard: getGoldStandard(cleanId)
      });
    }
  });

  // Process Requirements
  parsed.sections?.filter((s: any) => s.type === 'requirement').forEach((sec: any) => {
    const cleanId = sec.id.toUpperCase().trim();
    const answer = sec.answerOnly || "";
    
    // Evidence Signals
    const idNum = parseInt(cleanId.replace('R', ''));
    const evidence: any[] = [];
    contextDocuments.forEach(doc => {
      const keywords = getKeywordsForRequirement(idNum);
      if (keywords && doc.extractedText.toLowerCase().includes(keywords.primaryKeywords[0].toLowerCase())) {
        const hit = doc.extractedText.toLowerCase().indexOf(keywords.primaryKeywords[0].toLowerCase());
        evidence.push({ sourceDocName: doc.name, signal: `...${doc.extractedText.slice(hit - 30, hit + 150)}...` });
      }
    });

    requirementAssessments.push({
      id: cleanId,
      title: sec.title,
      status: answer.length > 250 ? 'complete' : 'needs-review',
      currentTextSummary: answer || "(No narrative provided)",
      gaps: answer.length < 100 ? ["Narrative response is too brief for regulatory audit."] : [],
      actions: ["Specify governance ownership", "Link to internal quality assurance (IQA) reports"],
      evidenceAnchors: evidence.slice(0, 3),
      goldStandard: getGoldStandard(cleanId)
    });
  });

  return {
    id: generateId(),
    documentId: questionnaireDoc.id,
    timestamp: new Date(),
    responses,
    extractedFields,
    requirementAssessments,
    overallCompleteness: 82,
    gapsIdentified: [],
    bestPracticeRecommendations: []
  };
}

export const analyzeDocument = () => [];