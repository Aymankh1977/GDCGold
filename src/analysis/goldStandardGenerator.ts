/**
 * Gold Standard Generator Module
 * 
 * Generates 3-layer gold-standard guidance for GDC requirements when reference
 * documents do not contain explicit 'gold standard' text. This allows AI to
 * synthesize best-practice guidance from extracted content.
 * 
 * The 3 layers are:
 * - Layer 1 (Principle): A concise principle derived from the requirement
 * - Layer 2 (Operational Best Practice): 3-5 concrete operational statements
 * - Layer 3 (Evidence Anchors): Examples of evidence artifacts/artefacts
 */

/**
 * Gold standard structure with 3 layers
 */
export interface GoldStandard {
  principle: string;
  bestPractices: string[];
  evidenceAnchors: string[];
}

/**
 * Requirement input structure matching GDC types
 */
export interface RequirementInput {
  id: number;
  title: string;
  description: string;
  evidenceExamples: string[];
}

/**
 * Generates a principle (Layer 1) from a GDC requirement.
 * The principle is a concise statement of the core intent.
 * 
 * @param requirement - The GDC requirement
 * @returns A concise principle string
 */
function generatePrinciple(requirement: RequirementInput): string {
  // Extract key concepts from title and description
  const title = requirement.title || '';
  const description = requirement.description || '';
  
  if (!title && !description) {
    return 'Maintain compliance with regulatory standards and best practices.';
  }
  
  // Create a principle that captures the essence of the requirement
  if (title) {
    return `Ensure ${title.toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}.`;
  }
  
  // Fallback to first sentence of description
  const firstSentence = description.split(/[.!?]/)[0]?.trim();
  if (firstSentence) {
    return `${firstSentence}.`;
  }
  
  return 'Maintain compliance with regulatory standards and best practices.';
}

/**
 * Generates operational best practices (Layer 2) from requirement and extracted text.
 * These are concrete operational statements describing how a provider would meet the principle.
 * 
 * @param requirement - The GDC requirement
 * @param extractedText - Text extracted from reference documents
 * @returns Array of 3-5 best practice statements
 */
function generateBestPractices(
  requirement: RequirementInput,
  extractedText: string
): string[] {
  const practices: string[] = [];
  const title = requirement.title || '';
  const description = requirement.description || '';
  
  // Base practices derived from requirement
  if (title) {
    practices.push(`Establish clear processes and documentation for ${title.toLowerCase()}.`);
  }
  
  if (description) {
    practices.push(`Implement procedures that address: ${description.slice(0, 100)}${description.length > 100 ? '...' : ''}`);
  }
  
  // Add evidence-based practice if evidence examples exist
  if (requirement.evidenceExamples && requirement.evidenceExamples.length > 0) {
    practices.push(`Maintain documented evidence including ${requirement.evidenceExamples.slice(0, 2).join(', ')}.`);
  }
  
  // If extracted text is available, derive additional practices
  if (extractedText && extractedText.trim().length > 0) {
    const textLower = extractedText.toLowerCase();
    
    // Look for common compliance keywords in extracted text
    if (textLower.includes('policy') || textLower.includes('policies')) {
      practices.push('Develop and regularly review relevant policies aligned with this requirement.');
    }
    
    if (textLower.includes('training') || textLower.includes('education')) {
      practices.push('Provide regular training and competency assessments for relevant staff.');
    }
    
    if (textLower.includes('audit') || textLower.includes('review') || textLower.includes('monitoring')) {
      practices.push('Conduct periodic audits and reviews to ensure ongoing compliance.');
    }
    
    if (textLower.includes('patient') || textLower.includes('clinical')) {
      practices.push('Implement patient-centered processes that prioritize safety and quality of care.');
    }
  }
  
  // Ensure we have at least 3 practices
  while (practices.length < 3) {
    if (practices.length === 0) {
      practices.push('Establish comprehensive documentation of compliance activities.');
    } else if (practices.length === 1) {
      practices.push('Implement regular monitoring and quality assurance processes.');
    } else if (practices.length === 2) {
      practices.push('Ensure all staff are trained and competent in relevant procedures.');
    }
  }
  
  // Limit to 5 practices maximum
  return practices.slice(0, 5);
}

/**
 * Generates evidence anchors (Layer 3) - examples of artifacts providers could attach.
 * These are short examples of internal evidence artefacts or artefact names.
 * 
 * @param requirement - The GDC requirement
 * @param extractedText - Text extracted from reference documents
 * @returns Array of evidence anchor examples
 */
function generateEvidenceAnchors(
  requirement: RequirementInput,
  extractedText: string
): string[] {
  const anchors: string[] = [];
  
  // Start with evidence examples from the requirement itself
  if (requirement.evidenceExamples && requirement.evidenceExamples.length > 0) {
    anchors.push(...requirement.evidenceExamples.slice(0, 3));
  }
  
  const textLower = extractedText?.toLowerCase() || '';
  const title = requirement.title?.toLowerCase() || '';
  const description = requirement.description?.toLowerCase() || '';
  
  // Generate context-aware evidence anchors
  const context = `${title} ${description} ${textLower}`.toLowerCase();
  
  // Common evidence artifacts based on context
  if (context.includes('policy') || context.includes('policies')) {
    if (!anchors.some(a => a.toLowerCase().includes('policy'))) {
      anchors.push('Policy document');
    }
  }
  
  if (context.includes('training') || context.includes('education')) {
    if (!anchors.some(a => a.toLowerCase().includes('training'))) {
      anchors.push('Training records and attendance logs');
    }
  }
  
  if (context.includes('assessment') || context.includes('evaluation')) {
    if (!anchors.some(a => a.toLowerCase().includes('assessment'))) {
      anchors.push('Assessment reports');
    }
  }
  
  if (context.includes('clinical') || context.includes('patient')) {
    if (!anchors.some(a => a.toLowerCase().includes('clinical'))) {
      anchors.push('Clinical protocol documents');
    }
  }
  
  if (context.includes('audit') || context.includes('review')) {
    if (!anchors.some(a => a.toLowerCase().includes('audit'))) {
      anchors.push('Audit reports and findings');
    }
  }
  
  if (context.includes('procedure') || context.includes('process')) {
    if (!anchors.some(a => a.toLowerCase().includes('procedure'))) {
      anchors.push('Standard operating procedures (SOPs)');
    }
  }
  
  // Ensure we have at least 2 anchors
  if (anchors.length === 0) {
    anchors.push('Compliance documentation');
    anchors.push('Evidence of implementation');
  } else if (anchors.length === 1) {
    anchors.push('Supporting documentation and records');
  }
  
  return anchors;
}

/**
 * Generates a 3-layer gold standard for a single GDC requirement.
 * 
 * This function is pure (deterministic) and does not call external services.
 * It synthesizes best-practice guidance from the requirement and extracted text.
 * 
 * @param requirement - The GDC requirement with id, title, description, and evidenceExamples
 * @param extractedText - Text extracted from reference documents (can be empty)
 * @returns A gold standard object with principle, bestPractices, and evidenceAnchors
 * 
 * @example
 * ```typescript
 * const requirement = {
 *   id: 1,
 *   title: "Patient Safety Protocols",
 *   description: "Implement comprehensive patient safety measures",
 *   evidenceExamples: ["Safety policy", "Incident reports"]
 * };
 * const goldStandard = generateGoldStandardForRequirement(requirement, extractedText);
 * console.log(goldStandard.principle); // "Ensure patient safety protocols."
 * console.log(goldStandard.bestPractices.length); // 3-5
 * console.log(goldStandard.evidenceAnchors.length); // >= 2
 * ```
 */
export function generateGoldStandardForRequirement(
  requirement: RequirementInput,
  extractedText: string = ''
): GoldStandard {
  // Input validation and fallbacks
  if (!requirement || typeof requirement !== 'object') {
    return {
      principle: 'Maintain compliance with regulatory standards and best practices.',
      bestPractices: [
        'Establish comprehensive documentation of compliance activities.',
        'Implement regular monitoring and quality assurance processes.',
        'Ensure all staff are trained and competent in relevant procedures.',
      ],
      evidenceAnchors: ['Compliance documentation', 'Evidence of implementation'],
    };
  }
  
  // Ensure extractedText is a string
  const safeExtractedText = typeof extractedText === 'string' ? extractedText : '';
  
  return {
    principle: generatePrinciple(requirement),
    bestPractices: generateBestPractices(requirement, safeExtractedText),
    evidenceAnchors: generateEvidenceAnchors(requirement, safeExtractedText),
  };
}

/**
 * Convenience function to generate gold standards for multiple requirements.
 * 
 * @param requirements - Array of GDC requirements
 * @param extractedText - Text extracted from reference documents (same text used for all)
 * @returns Array of gold standards, one for each requirement
 * 
 * @example
 * ```typescript
 * const requirements = [req1, req2, req3];
 * const goldStandards = generateGoldStandardsForAll(requirements, extractedText);
 * // Returns an array of 3 gold standards
 * ```
 */
export function generateGoldStandardsForAll(
  requirements: RequirementInput[],
  extractedText: string = ''
): GoldStandard[] {
  // Input validation
  if (!Array.isArray(requirements)) {
    return [];
  }
  
  return requirements.map(req => generateGoldStandardForRequirement(req, extractedText));
}
