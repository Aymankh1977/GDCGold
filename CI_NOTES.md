# CI and Testing Notes

## Running Tests Locally

### Prerequisites
- Node.js (v18 or later recommended)
- npm

### Installation
```bash
npm install
```

### Running Tests
```bash
# Run tests once
npm test

# Run tests in watch mode (for development)
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Building the Project
```bash
# TypeScript compilation and Vite build
npm run build
```

### Linting
```bash
npm run lint
```

## CI/CD Integration

### GitHub Actions Workflow (Future)

When adding GitHub Actions CI, create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linter
      run: npm run lint
    
    - name: Run tests
      run: npm test -- --run
    
    - name: Build project
      run: npm run build
```

## Test Structure

Tests are located in `src/analysis/goldStandardGenerator.test.ts` and use Vitest as the test runner.

### Test Coverage
- `generateGoldStandardForRequirement`: Tests for basic functionality, edge cases, and validation
- `generateGoldStandardsForAll`: Tests for batch processing and error handling

## Notes for Maintainers

- The gold standard generator is a pure function with no external dependencies
- Tests validate structure, content, and edge cases
- The safe storage wrapper in `documentStore.ts` handles QuotaExceededError gracefully
- All changes are designed to be backwards-compatible with existing functionality
