# CI Notes for GDCGold / DetEdTech

## Overview

This document describes the continuous integration setup, test commands, and important implementation notes for the GDCGold project.

## Test Commands

The project uses Vitest as the testing framework. The following npm scripts are available:

### Run Tests

```bash
# Run all tests once (suitable for CI)
npm run test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with UI
npm run test -- --ui
```

### Build and Lint

```bash
# Build the project
npm run build

# Lint the codebase
npm run lint

# Run development server
npm run dev
```

## Environment Variables

No special environment variables are required for running tests. The test suite uses fixtures and does not require external services or API keys.

### Optional Environment Variables

- `NODE_ENV`: Set to `test` when running tests (handled automatically by Vitest)
- No localStorage quota configuration needed - the app handles storage fallback automatically

## Storage Fallback Implementation

### Problem

The application previously encountered `QuotaExceededError` when persisting large documents or analysis results to localStorage. This caused the analysis page to fail.

### Solution

A safe storage wrapper has been implemented at `src/utils/storageSafe.ts` that:

1. **Catches QuotaExceededError**: When localStorage quota is exceeded, the wrapper automatically switches to in-memory storage
2. **Transparent Fallback**: The application continues to function normally, with data stored in memory instead of localStorage
3. **User Warnings**: Clear console warnings inform developers and users when fallback mode is activated
4. **Zustand Integration**: The wrapper integrates seamlessly with Zustand's persist middleware used in `documentStore.ts`

### Usage

```typescript
import { createJSONStorage } from '@/utils/storageSafe';

// In Zustand store configuration
persist(
  (set, get) => ({
    // ... state and actions
  }),
  {
    name: 'my-storage-key',
    storage: createJSONStorage(), // Safe storage with automatic fallback
  }
);
```

### Limitations

- Data in fallback (in-memory) mode is **not persisted** across browser sessions
- Users should export important data or clear old documents when storage is full
- The app displays warnings in console and in analysis results when storage issues are detected

## Test Coverage

### Core Analysis Tests

**Location**: `tests/analysis/analyzeQuestionnaire.test.ts`

Tests for the canonical questionnaire analysis implementation:
- Question classification (extraction vs analytical)
- Narrative completeness assessment
- Evidence signal detection in context documents
- Requirement processing and gap identification
- Overall completeness calculation

**Location**: `tests/analysis/goldStandardGenerator.test.ts`

Tests for the gold standard best-practice generator:
- Three-layer output generation (Principle, Controls, Example Wording)
- Known requirement templates (R1, R2, R4, R7, R9, R16)
- Heuristic generation for unknown requirements
- Batch generation for multiple requirements

### Storage Safety Tests

**Location**: `tests/utils/storageSafe.test.ts`

Tests for localStorage quota error handling:
- Basic storage operations (get, set, remove, clear)
- QuotaExceededError simulation and fallback
- In-memory storage fallback functionality
- Zustand persist middleware integration
- Storage availability detection

## CI Pipeline Recommendations

### GitHub Actions Example

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

### Pre-commit Checks

Consider adding pre-commit hooks with husky:

```bash
npm install --save-dev husky lint-staged
npx husky install
npx husky add .husky/pre-commit "npm run lint && npm run test"
```

## Known Issues and Future Improvements

### Current Limitations

1. **In-memory fallback**: Data in fallback mode doesn't persist across sessions
2. **No quota monitoring**: The app doesn't proactively warn users before storage fills up
3. **Test environment**: Tests run in jsdom which doesn't perfectly simulate browser localStorage quota limits

### Recommended Improvements

1. **Quota Monitoring**: Add proactive storage usage monitoring and warnings
2. **Data Cleanup**: Implement automatic cleanup of old documents or analysis results
3. **Export Features**: Enhance data export features to help users manage storage
4. **IndexedDB Migration**: Consider migrating to IndexedDB for larger storage capacity
5. **Compression**: Implement compression for stored data to reduce storage usage

## Integration Notes

### TextExtractionEngine Mock

The codebase includes a `TextExtractionEngine.mock` notice. The analysis implementation in `src/analysis/analyzeQuestionnaire.ts` does **not** rely on this mock. Instead, it operates on passed-in `Document` objects with `extractedText` already populated.

### Analysis Consistency

Two analysis implementations exist in the codebase:
- `src/engines/analysis/analyzer.ts` - Contains older analysis with gold standards dictionary
- `src/analysis/analyzeQuestionnaire.ts` - New canonical implementation with quota error handling

The `src/engines/questionnaire/questionHandler.ts` file now imports and re-exports from the canonical implementation to ensure consistency.

### Gold Standard Generator

The `goldStandardGenerator.ts` provides three-layer best-practice guidance:
- **Layer 1**: Concise principle statement
- **Layer 2**: Practical controls and evidence requirements (array)
- **Layer 3**: Example wording and policy snippets

This is intended to complement (not replace) reference document matching and human review.

## Support and Troubleshooting

### Common Issues

**Q: Tests fail with "Cannot find module '@/...'"**
A: Ensure `vitest.config.ts` has the correct path alias configuration

**Q: localStorage tests fail in CI**
A: Ensure vitest is configured with `environment: 'jsdom'` to simulate browser environment

**Q: Build fails with TypeScript errors**
A: Run `npm install` to ensure all types are installed, then `npm run build`

**Q: Storage fallback not working**
A: Check console for warnings. Verify `createJSONStorage()` is being used instead of `createJSONStorage(() => localStorage)`

### Debug Mode

To see detailed storage operations:

```typescript
// In browser console
localStorage.clear(); // Start fresh
// Trigger analysis
// Watch console for storage warnings
```

## Contact

For questions or issues related to CI, testing, or storage implementation, please open an issue on the repository.
