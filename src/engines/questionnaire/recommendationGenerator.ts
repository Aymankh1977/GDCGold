import { Document } from '@/types';
import { getKeywordsForRequirement } from './gdcRequirements';

/**
 * AI-Synthesized Gold Standards for GDC PIQ.
 * These reflect the precise regulatory requirements for a "Pass".
 */
const GOLD_STANDARDS_DATABASE: Record<string, string> = {
  'Q6': "Year 1: Foundation sciences and early clinical observation. Year 2: Transition to phantom head and basic operative skills. Year 3-4: Integrated clinical practice with increasing complexity. Year 5: Full clinical responsibility and preparation for independent practice.",
  'Q11': "Organogram must show clear accountability from the Board/University Council down to the Programme Lead. Must include the 'External Examiner' as an independent quality check.",
  'Q12': "List all outreach locations with chair capacity, supervisor-to-student ratios (Max 1:4), and specific clinical procedures permitted at each site.",
  'Q13': "Assessment strategy must combine Summative (Gateways/Exams) and Formative (Daily CAFs) feedback. Use of Angoff standard setting is required for validity.",
  'R1': "A 'Gateways' system ensures students pass simulated competency tests before touching patients. Digital logs (iDentity/CAFS) must verify this before clinics begin.",
  'R4': "Clinical supervision ratios are maintained at 1:4. All supervisors are GDC registered and have undergone equality and diversity training.",
  'R7': "Incident reporting uses a 'No-Blame' culture. Serious incidents are escalated to the GDC within 5 working days as per 'Duty of Candour' requirements.",
  'R9': "Curriculum mapping to 'Preparing for Practice' outcomes is reviewed annually by a Curriculum Committee including student and patient reps."
};

/**
 * Generates a Gold Standard string for the report.
 */
export const generateGoldStandard = (id: string, contextDocs: Document[]): string => {
  const criteria = GOLD_STANDARDS_DATABASE[id] || "Best practice requires a clear narrative, governance ownership, and explicit links to supporting evidence.";
  
  // Find a real-world benchmark from context docs (e.g. Dundee or Glasgow)
  let benchmark = "";
  const idNum = parseInt(id.replace(/\D/g, '')) || 1;
  const keywords = getKeywordsForRequirement(idNum);

  if (contextDocs.length > 0 && keywords) {
    const topDoc = contextDocs.find(d => d.category === 'inspection-report') || contextDocs[0];
    const text = topDoc.extractedText;
    const match = text.toLowerCase().indexOf(keywords.primaryKeywords[0].toLowerCase());
    
    if (match !== -1) {
      benchmark = `\n\nBENCHMARK (from ${topDoc.name}): "...${text.slice(match, match + 300).replace(/\s+/g, ' ')}..."`;
    }
  }

  return `CRITERIA: ${criteria}${benchmark}`;
};