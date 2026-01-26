/**
 * Lightweight test/demo for goldStandardGenerator
 * 
 * This file can be run directly with: npx tsx src/analysis/goldStandardGenerator.test.ts
 * or via: npm run test (if configured)
 */

import {
  generateGoldStandard,
  generateForRequirements,
  type Requirement
} from './goldStandardGenerator';

// Test helper
function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(message);
  }
  console.log(`✅ PASSED: ${message}`);
}

// Test 1: Generate gold standard for specific requirement
console.log('\n=== Test 1: generateGoldStandard for Requirement 1 ===');
const gs1 = generateGoldStandard('Requirement 1');
assert(gs1.layer1.includes('competence'), 'Layer 1 should mention competence');
assert(Array.isArray(gs1.layer2), 'Layer 2 should be an array');
assert(gs1.layer2.length > 0, 'Layer 2 should have items');
assert(Array.isArray(gs1.layer3), 'Layer 3 should be an array');
assert(gs1.layer3.length > 0, 'Layer 3 should have items');
console.log('Layer 1:', gs1.layer1.substring(0, 80) + '...');
console.log('Layer 2 count:', gs1.layer2.length);
console.log('Layer 3 count:', gs1.layer3.length);

// Test 2: Generate gold standard for unknown requirement (should use default)
console.log('\n=== Test 2: generateGoldStandard for unknown requirement ===');
const gs2 = generateGoldStandard('Requirement 99');
assert(gs2.layer1.includes('governance'), 'Default should mention governance');
assert(Array.isArray(gs2.layer2), 'Layer 2 should be an array');
assert(gs2.layer2.length > 0, 'Layer 2 should have items');
console.log('Default Layer 1:', gs2.layer1.substring(0, 80) + '...');

// Test 3: Generate gold standard for question
console.log('\n=== Test 3: generateGoldStandard for Question 6 ===');
const gs3 = generateGoldStandard('Question 6');
assert(gs3.layer1.includes('chronological') || gs3.layer1.includes('modules'), 'Q6 should mention curriculum structure');
console.log('Q6 Layer 1:', gs3.layer1.substring(0, 80) + '...');

// Test 4: Generate for multiple requirements
console.log('\n=== Test 4: generateForRequirements ===');
const requirements: Requirement[] = [
  { id: 1, title: 'Competency', description: 'Students must be competent' },
  { id: 2, title: 'Consent', description: 'Patients must consent' },
  { id: 4, title: 'Supervision', description: 'Appropriate supervision' }
];
const goldStandards = generateForRequirements(requirements);
assert(Object.keys(goldStandards).length === 3, 'Should have 3 gold standards');
assert(goldStandards[1] !== undefined, 'Should have gold standard for R1');
assert(goldStandards[2] !== undefined, 'Should have gold standard for R2');
assert(goldStandards[4] !== undefined, 'Should have gold standard for R4');
console.log('Generated gold standards for requirements:', Object.keys(goldStandards).join(', '));

// Test 5: Verify structure of generated gold standards
console.log('\n=== Test 5: Verify structure ===');
for (const [id, gs] of Object.entries(goldStandards)) {
  assert(typeof gs.layer1 === 'string', `R${id}: layer1 should be string`);
  assert(Array.isArray(gs.layer2), `R${id}: layer2 should be array`);
  assert(Array.isArray(gs.layer3), `R${id}: layer3 should be array`);
  assert(gs.layer2.every(item => typeof item === 'string'), `R${id}: layer2 items should be strings`);
  assert(gs.layer3.every(item => typeof item === 'string'), `R${id}: layer3 items should be strings`);
}
console.log('All structures are valid');

// Test 6: Edge cases
console.log('\n=== Test 6: Edge cases ===');
const gs6a = generateGoldStandard('R1');
assert(gs6a.layer1.length > 0, 'Should handle R1 format');
const gs6b = generateGoldStandard('r1');
assert(gs6b.layer1.length > 0, 'Should handle lowercase r1');
const gs6c = generateGoldStandard('Some text with Requirement 7 mentioned');
assert(gs6c.layer1.includes('incident'), 'Should extract R7 from text');
console.log('Edge cases handled correctly');

console.log('\n✅ All tests passed!');
console.log('\n=== Sample Output ===');
console.log('Gold Standard for Requirement 1:');
console.log('Layer 1:', gs1.layer1);
console.log('\nLayer 2 (Compliance Points):');
gs1.layer2.forEach((item, i) => console.log(`  ${i + 1}. ${item}`));
console.log('\nLayer 3 (Evidence & Examples):');
gs1.layer3.forEach((item, i) => console.log(`  ${i + 1}. ${item}`));
