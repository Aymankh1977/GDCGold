/**
 * Unit tests for Gold Standard Generator
 */
import { describe, it, expect } from 'vitest';
import {
  generateGoldStandardForRequirement,
  generateGoldStandardsForAll,
  type RequirementInput,
} from './goldStandardGenerator';

describe('goldStandardGenerator', () => {
  describe('generateGoldStandardForRequirement', () => {
    it('should return expected structure with non-empty fields for simple requirement', () => {
      const requirement: RequirementInput = {
        id: 1,
        title: 'Patient Safety Protocols',
        description: 'Implement comprehensive patient safety measures and reporting systems.',
        evidenceExamples: ['Safety policy', 'Incident reports'],
      };

      const result = generateGoldStandardForRequirement(requirement, '');

      // Validate structure
      expect(result).toHaveProperty('principle');
      expect(result).toHaveProperty('bestPractices');
      expect(result).toHaveProperty('evidenceAnchors');

      // Validate principle
      expect(result.principle).toBeTruthy();
      expect(typeof result.principle).toBe('string');
      expect(result.principle.length).toBeGreaterThan(0);

      // Validate best practices (should be at least 3)
      expect(Array.isArray(result.bestPractices)).toBe(true);
      expect(result.bestPractices.length).toBeGreaterThanOrEqual(3);
      expect(result.bestPractices.length).toBeLessThanOrEqual(5);
      result.bestPractices.forEach((practice) => {
        expect(typeof practice).toBe('string');
        expect(practice.length).toBeGreaterThan(0);
      });

      // Validate evidence anchors (should be at least 2)
      expect(Array.isArray(result.evidenceAnchors)).toBe(true);
      expect(result.evidenceAnchors.length).toBeGreaterThanOrEqual(2);
      result.evidenceAnchors.forEach((anchor) => {
        expect(typeof anchor).toBe('string');
        expect(anchor.length).toBeGreaterThan(0);
      });
    });

    it('should generate reasonable best practices even with empty extractedText', () => {
      const requirement: RequirementInput = {
        id: 2,
        title: 'Clinical Governance',
        description: 'Establish effective clinical governance frameworks.',
        evidenceExamples: ['Governance policy', 'Committee minutes'],
      };

      const result = generateGoldStandardForRequirement(requirement, '');

      // Should still generate valid structure
      expect(result.principle).toBeTruthy();
      expect(result.bestPractices.length).toBeGreaterThanOrEqual(3);
      expect(result.evidenceAnchors.length).toBeGreaterThanOrEqual(2);

      // Best practices should reference the requirement
      const practicesText = result.bestPractices.join(' ').toLowerCase();
      expect(
        practicesText.includes('clinical') || 
        practicesText.includes('governance') ||
        practicesText.includes('documentation')
      ).toBe(true);
    });

    it('should enhance best practices when extractedText contains relevant keywords', () => {
      const requirement: RequirementInput = {
        id: 3,
        title: 'Staff Training',
        description: 'Ensure all staff receive appropriate training.',
        evidenceExamples: ['Training records'],
      };

      const extractedText = `
        The practice must ensure that all clinical and non-clinical staff receive
        regular training on patient safety, infection control, and policy compliance.
        Training records should be maintained and audited regularly. Staff competency
        should be assessed through periodic reviews.
      `;

      const result = generateGoldStandardForRequirement(requirement, extractedText);

      // Should include training-related best practices
      const practicesText = result.bestPractices.join(' ').toLowerCase();
      expect(practicesText.includes('training') || practicesText.includes('competency')).toBe(true);

      // Should include audit-related best practice when audit is mentioned in text
      expect(practicesText.includes('audit') || practicesText.includes('review')).toBe(true);
    });

    it('should handle requirement with minimal information', () => {
      const requirement: RequirementInput = {
        id: 4,
        title: '',
        description: '',
        evidenceExamples: [],
      };

      const result = generateGoldStandardForRequirement(requirement, '');

      // Should still return valid structure with fallbacks
      expect(result.principle).toBeTruthy();
      expect(result.bestPractices.length).toBeGreaterThanOrEqual(3);
      expect(result.evidenceAnchors.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle null or undefined requirement gracefully', () => {
      const result1 = generateGoldStandardForRequirement(null as any, '');
      const result2 = generateGoldStandardForRequirement(undefined as any, '');

      // Should return valid default structure
      expect(result1).toHaveProperty('principle');
      expect(result1.bestPractices.length).toBeGreaterThanOrEqual(3);
      expect(result1.evidenceAnchors.length).toBeGreaterThanOrEqual(2);

      expect(result2).toHaveProperty('principle');
      expect(result2.bestPractices.length).toBeGreaterThanOrEqual(3);
      expect(result2.evidenceAnchors.length).toBeGreaterThanOrEqual(2);
    });

    it('should use evidenceExamples in generated anchors', () => {
      const requirement: RequirementInput = {
        id: 5,
        title: 'Quality Assurance',
        description: 'Maintain quality assurance processes.',
        evidenceExamples: ['QA Policy Document', 'Audit Reports', 'Review Minutes'],
      };

      const result = generateGoldStandardForRequirement(requirement, '');

      // Should include some of the provided evidence examples
      const anchorsText = result.evidenceAnchors.join(' ').toLowerCase();
      expect(
        anchorsText.includes('qa') ||
        anchorsText.includes('policy') ||
        anchorsText.includes('audit')
      ).toBe(true);
    });

    it('should limit best practices to maximum of 5', () => {
      const requirement: RequirementInput = {
        id: 6,
        title: 'Comprehensive Compliance Framework',
        description: 'Very detailed description about multiple aspects of compliance.',
        evidenceExamples: ['Policy', 'Training', 'Audit', 'Assessment', 'Review'],
      };

      const extractedText = `
        This requirement covers policy development, training programs, audit processes,
        regular reviews, patient care, clinical procedures, monitoring systems,
        quality assurance, and continuous improvement initiatives.
      `;

      const result = generateGoldStandardForRequirement(requirement, extractedText);

      // Should not exceed 5 best practices
      expect(result.bestPractices.length).toBeLessThanOrEqual(5);
      expect(result.bestPractices.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('generateGoldStandardsForAll', () => {
    it('should generate gold standards for multiple requirements', () => {
      const requirements: RequirementInput[] = [
        {
          id: 1,
          title: 'Requirement One',
          description: 'First requirement',
          evidenceExamples: ['Evidence 1'],
        },
        {
          id: 2,
          title: 'Requirement Two',
          description: 'Second requirement',
          evidenceExamples: ['Evidence 2'],
        },
        {
          id: 3,
          title: 'Requirement Three',
          description: 'Third requirement',
          evidenceExamples: ['Evidence 3'],
        },
      ];

      const extractedText = 'Sample extracted text with policy and training mentions.';
      const results = generateGoldStandardsForAll(requirements, extractedText);

      // Should return array with same length
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(3);

      // Each result should have valid structure
      results.forEach((result, index) => {
        expect(result.principle).toBeTruthy();
        expect(result.bestPractices.length).toBeGreaterThanOrEqual(3);
        expect(result.evidenceAnchors.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('should handle empty requirements array', () => {
      const results = generateGoldStandardsForAll([], '');

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });

    it('should handle null or invalid input gracefully', () => {
      const results1 = generateGoldStandardsForAll(null as any, '');
      const results2 = generateGoldStandardsForAll(undefined as any, '');

      expect(Array.isArray(results1)).toBe(true);
      expect(results1.length).toBe(0);

      expect(Array.isArray(results2)).toBe(true);
      expect(results2.length).toBe(0);
    });

    it('should use same extractedText for all requirements', () => {
      const requirements: RequirementInput[] = [
        {
          id: 1,
          title: 'Training Program',
          description: 'Staff training',
          evidenceExamples: [],
        },
        {
          id: 2,
          title: 'Policy Framework',
          description: 'Policy management',
          evidenceExamples: [],
        },
      ];

      const extractedText = 'This text mentions training and audit processes.';
      const results = generateGoldStandardsForAll(requirements, extractedText);

      // Both should benefit from the extracted text
      const allPractices = results.flatMap(r => r.bestPractices).join(' ').toLowerCase();
      
      // At least one should mention training or audit since it's in the extracted text
      expect(allPractices.includes('training') || allPractices.includes('audit')).toBe(true);
    });
  });
});
