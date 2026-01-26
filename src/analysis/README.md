# Gold Standard Generator

## Overview

The Gold Standard Generator is a three-layer AI-powered system that generates best-practice guidance for GDC (General Dental Council) requirement analysis. It helps dental education providers understand what a complete, audit-ready response should contain for each requirement.

## Three-Layer Structure

### Layer 1: High-Level Operational Summary
A concise paragraph that describes the key operational expectations and overall approach for meeting the requirement.

### Layer 2: Detailed Compliance Points
An array of specific, actionable requirements that providers should address. These are the concrete steps and processes needed for compliance.

### Layer 3: Evidence Anchors with Examples
An array of evidence types and practical examples that demonstrate compliance. These show providers what documentation and records they should maintain.

## API

### `generateGoldStandard(requirementText: string): GoldStandard`

Generates a three-layer gold standard for a single requirement.

**Parameters:**
- `requirementText`: The requirement text (can include ID like "R1" or "Requirement 1", or question ID like "Q6")

**Returns:**
```typescript
{
  layer1: string;           // High-level summary
  layer2: string[];         // Compliance points
  layer3: string[];         // Evidence examples
}
```

**Example:**
```typescript
import { generateGoldStandard } from './goldStandardGenerator';

const standard = generateGoldStandard('Requirement 1');
console.log(standard.layer1);
// "Students must demonstrate competence in pre-clinical training..."

standard.layer2.forEach(point => console.log(point));
// "Implement a formal gateway check between pre-clinical and clinical phases"
// "Electronic system (e.g., iDentity/CAFS) must block clinical access..."
// ...
```

### `generateForRequirements(requirements: Requirement[]): Record<number, GoldStandard>`

Generates gold standards for multiple requirements at once.

**Parameters:**
```typescript
requirements: Array<{
  id: number;
  title: string;
  description: string;
}>
```

**Returns:**
A record mapping requirement IDs to their gold standards.

**Example:**
```typescript
import { generateForRequirements } from './goldStandardGenerator';

const requirements = [
  { id: 1, title: 'Competency', description: 'Students must be competent' },
  { id: 2, title: 'Consent', description: 'Patients must consent' }
];

const goldStandards = generateForRequirements(requirements);
console.log(goldStandards[1].layer1);
console.log(goldStandards[2].layer2);
```

## Coverage

The generator includes pre-defined gold standards for:

- **Requirements**: R1, R2, R4, R7, R9, R16 (with default template for others)
- **Questions**: Q6, Q11 (with default template for others)

For requirements or questions without specific templates, a comprehensive default template is provided.

## Testing

Run the included test suite:

```bash
npx tsx src/analysis/goldStandardGenerator.test.ts
```

The test suite validates:
- Three-layer structure generation
- Requirement ID extraction (R1, r1, "Requirement 1", etc.)
- Question ID extraction (Q6, "Question 6", etc.)
- Batch generation for multiple requirements
- Default template for unknown requirements
- Data structure integrity

## Usage in Application

The gold standard generator can be integrated into your requirement analysis workflow:

```typescript
import { generateGoldStandard } from '@/analysis/goldStandardGenerator';

// When analyzing a requirement
const requirement = getRequirement(1);
const goldStandard = generateGoldStandard(`Requirement ${requirement.id}`);

// Display to user as best practice guidance
displayGuidance({
  title: requirement.title,
  operationalSummary: goldStandard.layer1,
  compliancePoints: goldStandard.layer2,
  evidenceExamples: goldStandard.layer3
});
```

## CI Integration

The gold standard generator is automatically tested in CI:

```yaml
- name: Run gold standard generator test
  run: npx tsx src/analysis/goldStandardGenerator.test.ts
```

This ensures the generator remains functional with all code changes.

## How to Run Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the test:
   ```bash
   npx tsx src/analysis/goldStandardGenerator.test.ts
   ```

3. Use in your code:
   ```typescript
   import { generateGoldStandard } from './src/analysis/goldStandardGenerator';
   ```

## Extending the Generator

To add gold standards for additional requirements or questions, edit the template objects in `goldStandardGenerator.ts`:

```typescript
const GOLD_STANDARD_TEMPLATES: Record<number, GoldStandard> = {
  // Add your requirement
  21: {
    layer1: "Your high-level summary...",
    layer2: [
      "First compliance point",
      "Second compliance point"
    ],
    layer3: [
      "Evidence: Example documentation",
      "Example: Specific implementation"
    ]
  }
};
```

## License

Part of the GDCGold project.
