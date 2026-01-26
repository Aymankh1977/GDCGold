/**
 * goldStandardGenerator.test.ts
 * 
 * Unit tests for the gold standard generator
 */

import { describe, it, expect } from 'vitest';
import { 
  generateGoldStandardForRequirement,
  generateGoldStandardsForMultipleRequirements,
  type GoldStandardOutput 
} from '../../src/analysis/goldStandardGenerator';

describe('generateGoldStandardForRequirement', () => {
  it('should generate gold standard for R1', () => {
    const result = generateGoldStandardForRequirement('R1');
    
    expect(result).toHaveProperty('requirementId', 'R1');
    expect(result).toHaveProperty('principle');
    expect(result).toHaveProperty('practicalControls');
    expect(result).toHaveProperty('exampleWording');
    
    expect(typeof result.principle).toBe('string');
    expect(result.principle.length).toBeGreaterThan(0);
    
    expect(Array.isArray(result.practicalControls)).toBe(true);
    expect(result.practicalControls.length).toBeGreaterThan(0);
    
    expect(typeof result.exampleWording).toBe('string');
    expect(result.exampleWording.length).toBeGreaterThan(0);
  });

  it('should generate gold standard for R2', () => {
    const result = generateGoldStandardForRequirement('R2');
    
    expect(result.requirementId).toBe('R2');
    expect(result.principle).toContain('consent');
  });

  it('should generate gold standard for R4', () => {
    const result = generateGoldStandardForRequirement('R4');
    
    expect(result.requirementId).toBe('R4');
    expect(result.principle).toContain('supervision');
  });

  it('should generate gold standard for R7', () => {
    const result = generateGoldStandardForRequirement('R7');
    
    expect(result.requirementId).toBe('R7');
    expect(result.principle).toContain('safety');
  });

  it('should generate gold standard for R9', () => {
    const result = generateGoldStandardForRequirement('R9');
    
    expect(result.requirementId).toBe('R9');
    expect(result.principle.toLowerCase()).toContain('curriculum');
  });

  it('should generate gold standard for R16', () => {
    const result = generateGoldStandardForRequirement('R16');
    
    expect(result.requirementId).toBe('R16');
    expect(result.principle.toLowerCase()).toContain('assessment');
  });

  it('should handle lowercase requirement IDs', () => {
    const result = generateGoldStandardForRequirement('r1');
    
    expect(result.requirementId).toBe('R1');
  });

  it('should handle requirement IDs with extra whitespace', () => {
    const result = generateGoldStandardForRequirement('  R4  ');
    
    expect(result.requirementId).toBe('R4');
  });

  it('should generate heuristic gold standard for unknown requirements with supervision keywords', () => {
    const result = generateGoldStandardForRequirement(
      'R99',
      'This requirement relates to supervision and oversight of clinical activities'
    );
    
    expect(result.requirementId).toBe('R99');
    expect(result.principle).toContain('supervision');
    expect(result.practicalControls.length).toBeGreaterThan(0);
    expect(result.exampleWording.length).toBeGreaterThan(0);
  });

  it('should generate heuristic gold standard for assessment-related requirements', () => {
    const result = generateGoldStandardForRequirement(
      'R50',
      'Requirements for assessment and examination procedures'
    );
    
    expect(result.principle.toLowerCase()).toContain('assessment');
    expect(result.practicalControls.some(c => c.toLowerCase().includes('assess'))).toBe(true);
  });

  it('should generate heuristic gold standard for patient safety requirements', () => {
    const result = generateGoldStandardForRequirement(
      'R88',
      'Ensuring patient safety in clinical settings'
    );
    
    expect(result.principle.toLowerCase()).toContain('patient');
    expect(result.principle.toLowerCase()).toContain('safe');
  });

  it('should generate heuristic gold standard for curriculum requirements', () => {
    const result = generateGoldStandardForRequirement(
      'R77',
      'Curriculum development and programme quality'
    );
    
    expect(result.principle.toLowerCase()).toContain('curriculum');
  });

  it('should generate heuristic gold standard for quality requirements', () => {
    const result = generateGoldStandardForRequirement(
      'R66',
      'Quality assurance and standards monitoring'
    );
    
    expect(result.principle.toLowerCase()).toContain('quality');
  });

  it('should generate generic gold standard for completely unknown requirements', () => {
    const result = generateGoldStandardForRequirement('R999');
    
    expect(result.requirementId).toBe('R999');
    expect(result.principle).toBeTruthy();
    expect(result.practicalControls.length).toBeGreaterThan(0);
    expect(result.exampleWording).toBeTruthy();
  });

  it('should include program text context in heuristic generation', () => {
    const result = generateGoldStandardForRequirement(
      'R55',
      'Staff training requirements',
      'Our program includes comprehensive staff training on clinical supervision'
    );
    
    expect(result).toBeTruthy();
    expect(result.practicalControls).toBeTruthy();
  });

  it('should produce three distinct layers of output', () => {
    const result = generateGoldStandardForRequirement('R1');
    
    // Layer 1: Principle (concise statement)
    expect(result.principle).toBeTruthy();
    expect(result.principle.length).toBeLessThan(500);
    
    // Layer 2: Practical Controls (array of actionable items)
    expect(Array.isArray(result.practicalControls)).toBe(true);
    expect(result.practicalControls.length).toBeGreaterThanOrEqual(3);
    
    // Layer 3: Example Wording (detailed guidance)
    expect(result.exampleWording).toBeTruthy();
    expect(result.exampleWording.length).toBeGreaterThan(result.principle.length);
  });
});

describe('generateGoldStandardsForMultipleRequirements', () => {
  it('should generate gold standards for multiple requirements', () => {
    const requirementIds = ['R1', 'R2', 'R4'];
    const results = generateGoldStandardsForMultipleRequirements(requirementIds);
    
    expect(results).toHaveLength(3);
    expect(results[0].requirementId).toBe('R1');
    expect(results[1].requirementId).toBe('R2');
    expect(results[2].requirementId).toBe('R4');
  });

  it('should handle empty array', () => {
    const results = generateGoldStandardsForMultipleRequirements([]);
    
    expect(results).toEqual([]);
  });

  it('should accept optional descriptions map', () => {
    const requirementIds = ['R1', 'R2'];
    const descriptions = {
      'R1': 'Students must be competent before patient care',
      'R2': 'Informed consent must be obtained'
    };
    
    const results = generateGoldStandardsForMultipleRequirements(
      requirementIds,
      descriptions
    );
    
    expect(results).toHaveLength(2);
    results.forEach(result => {
      expect(result.principle).toBeTruthy();
    });
  });

  it('should accept program text for context', () => {
    const requirementIds = ['R99', 'R100'];
    const programText = 'Our supervision model ensures quality and safety';
    
    const results = generateGoldStandardsForMultipleRequirements(
      requirementIds,
      undefined,
      programText
    );
    
    expect(results).toHaveLength(2);
  });

  it('should handle mixed known and unknown requirements', () => {
    const requirementIds = ['R1', 'R999', 'R4'];
    const results = generateGoldStandardsForMultipleRequirements(requirementIds);
    
    expect(results).toHaveLength(3);
    
    // Known requirements should have specific content
    expect(results[0].principle).toContain('competent');
    
    // Unknown requirement should have generic content
    expect(results[1].requirementId).toBe('R999');
    expect(results[1].principle).toBeTruthy();
  });
});

describe('GoldStandardOutput structure', () => {
  it('should have consistent structure across all requirements', () => {
    const requirementIds = ['R1', 'R2', 'R4', 'R7', 'R9', 'R16', 'R999'];
    
    requirementIds.forEach(id => {
      const result = generateGoldStandardForRequirement(id);
      
      // Check all required properties exist
      expect(result).toHaveProperty('requirementId');
      expect(result).toHaveProperty('principle');
      expect(result).toHaveProperty('practicalControls');
      expect(result).toHaveProperty('exampleWording');
      
      // Check types
      expect(typeof result.requirementId).toBe('string');
      expect(typeof result.principle).toBe('string');
      expect(Array.isArray(result.practicalControls)).toBe(true);
      expect(typeof result.exampleWording).toBe('string');
      
      // Check content is not empty
      expect(result.principle.length).toBeGreaterThan(0);
      expect(result.practicalControls.length).toBeGreaterThan(0);
      expect(result.exampleWording.length).toBeGreaterThan(0);
    });
  });

  it('should have practical controls as array of strings', () => {
    const result = generateGoldStandardForRequirement('R1');
    
    result.practicalControls.forEach(control => {
      expect(typeof control).toBe('string');
      expect(control.length).toBeGreaterThan(0);
    });
  });
});
