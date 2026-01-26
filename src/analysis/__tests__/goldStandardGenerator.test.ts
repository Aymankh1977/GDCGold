import { generateGoldStandard } from '../goldStandardGenerator';

describe('goldStandardGenerator basic behaviour', () => {
  it('returns three layers and includes requirement id', () => {
    const result = generateGoldStandard(1, 'Students must be competent in pre-clinical skills before treating patients.', []);
    expect(result).toHaveProperty('requirementId', 1);
    expect(result.layers.length).toBe(3);
    expect(result.layers.map(l => l.level)).toEqual([1, 2, 3]);
  });

  it('includes signals array (possibly empty) and generatedAt timestamp', () => {
    const result = generateGoldStandard(5, '', [
      { id: 'doc-1', name: 'ref.pdf', type: 'pdf', size: 0, uploadedAt: new Date(), content: '', extractedText: 'supervision competency assessment policy', metadata: {}, status: 'completed', category: 'reference' }
    ]);
    expect(Array.isArray(result.signals)).toBe(true);
    expect(result.generatedAt).toBeTruthy();
  });
});