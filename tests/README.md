# LawDraw Test Suite

Complete testing infrastructure for the legal entity diagram platform.

## Quick Start

```bash
# Install dependencies
npm install

# Run all unit tests
npm test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run stress tests
npm run test:stress

# Interactive test UI
npm run test:ui
```

## Directory Structure

```
tests/
├── README.md                    # This file
├── TEST_STRATEGY.md             # Comprehensive test strategy
├── setup.ts                     # Test environment configuration
│
├── fixtures/                    # Test data and mocks
│   ├── legalEntities.ts         # Legal structure fixtures
│   └── claudeResponses.ts       # Claude API mocks
│
├── unit/                        # Unit tests (70% of suite)
│   └── services/
│       ├── layout.test.ts       # Dagre auto-layout tests
│       ├── storage.test.ts      # localStorage persistence tests
│       └── claude.test.ts       # Claude API integration tests
│
├── integration/                 # Integration tests (25% of suite)
│   └── DiagramCanvas.test.tsx   # React Flow integration tests
│
├── e2e/                         # End-to-end tests (5% of suite)
│   └── diagram-creation.spec.ts # Complete user workflows
│
├── stress/                      # Performance/stress tests
│   └── run-stress-tests.js      # 50+ node performance validation
│
└── uat/                         # User acceptance testing
    └── VALIDATION_PROTOCOL.md   # 6-week lawyer validation protocol
```

## Test Categories

### Unit Tests

**Purpose:** Test individual functions and components in isolation.

**Location:** `tests/unit/`

**Run:**
```bash
npm test
```

**Coverage:**
- Layout service (dagre integration)
- Storage service (localStorage)
- Claude API service (generation, parsing)
- Utility functions

**Example:**
```typescript
import { describe, it, expect } from 'vitest';
import { getLayoutedElements } from '@/services/layout';

describe('Layout Service', () => {
  it('should layout nodes hierarchically', () => {
    const { nodes, edges } = holdingCompanyStructure;
    const result = getLayoutedElements(nodes, edges);
    expect(result.nodes).toBeDefined();
  });
});
```

### Integration Tests

**Purpose:** Test component interactions and React Flow integration.

**Location:** `tests/integration/`

**Run:**
```bash
npm test tests/integration
```

**Coverage:**
- DiagramCanvas with entity nodes
- Node selection and editing
- Edge creation
- Auto-layout application

**Example:**
```typescript
import { render, screen } from '@testing-library/react';
import { DiagramCanvas } from '@/components/Canvas/DiagramCanvas';

test('should render holding company structure', () => {
  const { nodes, edges } = holdingCompanyStructure;
  render(<DiagramCanvas initialNodes={nodes} initialEdges={edges} />);
  expect(screen.getByText('HoldCo Inc.')).toBeInTheDocument();
});
```

### E2E Tests

**Purpose:** Test complete user workflows in real browser.

**Location:** `tests/e2e/`

**Run:**
```bash
npm run test:e2e           # Headless
npm run test:e2e:ui        # Interactive UI
```

**Coverage:**
- Create diagram manually
- Generate diagram with AI
- Modify with chat
- Export PDF
- Save/load

**Example:**
```typescript
import { test, expect } from '@playwright/test';

test('should create diagram with AI', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="ai-generate-button"]');
  await page.fill('[data-testid="ai-description-input"]', 'Delaware corporation');
  await page.click('[data-testid="generate-submit"]');
  await expect(page.locator('[data-node-id]')).toBeVisible();
});
```

### Stress Tests

**Purpose:** Validate performance with 50+ nodes.

**Location:** `tests/stress/`

**Run:**
```bash
npm run test:stress
```

**Scenarios:**
- 50 nodes (linear chain)
- 100 nodes (tree structure)
- 75 nodes (complex multi-tier)
- 200 nodes (extreme stress)

**Metrics:**
- Render time
- Layout time
- Zoom/pan responsiveness
- Memory usage
- FPS

### User Acceptance Tests

**Purpose:** Validate with real lawyers using real cases.

**Location:** `tests/uat/`

**Documentation:** See `VALIDATION_PROTOCOL.md`

**6-Week Schedule:**
- Week 1-2: Smoke test (can they use it?)
- Week 3-4: Speed test (<15 min target)
- Week 5-6: Quality test (court-ready output)

**Exit Criteria:**
- Lawyer creates 3 diagrams in <15 min each
- Confirms preference over PowerPoint
- SUS score >70

## Test Fixtures

### Legal Entity Structures

```typescript
import {
  singleCorporation,
  holdingCompanyStructure,
  startupEquityStructure,
  foreignEntityStructure,
  disregardedEntityStructure,
  realEstateStructure,
  partnershipStructure,
  trustStructure,
  complexMultiTierStructure,
} from '@tests/fixtures/legalEntities';

// Use in tests
const { nodes, edges } = holdingCompanyStructure;
```

### Claude API Mocks

```typescript
import {
  mockClaudeGenerationResponse,
  mockModificationResponse,
  createMockAnthropicClient,
} from '@tests/fixtures/claudeResponses';

// Mock successful response
const mockClient = createMockAnthropicClient('success');

// Mock error response
const errorClient = createMockAnthropicClient('error');

// Mock timeout
const timeoutClient = createMockAnthropicClient('timeout');
```

## Helper Functions

### Creating Test Nodes

```typescript
import { createMockNode, createMockEdge } from '@tests/fixtures/legalEntities';

const node = createMockNode('corp-1', 'corporation', {
  data: { label: 'Test Corp', jurisdiction: 'Delaware' }
});

const edge = createMockEdge('parent', 'child', {
  label: '100%',
  data: { ownershipType: 'both', votingPercentage: 100, economicPercentage: 100 }
});
```

### Validating Ownership

```typescript
import { validateOwnershipPercentages } from '@tests/fixtures/legalEntities';

const isValid = validateOwnershipPercentages(edges, 'target-node-id');
expect(isValid).toBe(true);
```

## Coverage Requirements

| Type | Statements | Branches | Functions | Lines |
|------|-----------|----------|-----------|-------|
| Overall | 80% | 75% | 80% | 80% |
| Services | 90% | 85% | 90% | 90% |
| Components | 75% | 70% | 75% | 75% |

**View Coverage:**
```bash
npm run test:coverage
open coverage/index.html
```

## Performance Benchmarks

### Test Suite Performance

- Unit test: <100ms each
- Integration test: <1s each
- E2E test: <30s each
- Full suite: <5 min

### Application Performance

- Render 50 nodes: <5s
- Apply layout (50 nodes): <3s
- Zoom/pan: <100ms response
- Node selection: <50ms
- AI generation: <3s (P95)

## Continuous Integration

Tests run automatically on:
- Every push to any branch
- Every pull request
- Before merging to main

**GitHub Actions:**
- Unit tests (always)
- Integration tests (always)
- E2E tests (always)
- Stress tests (main branch only)

**Pre-commit Hooks:**
- Typecheck
- Lint
- Unit tests

**Pre-push Hooks:**
- Full test coverage

## Debugging

### Run Specific Test

```bash
# Single file
npm test tests/unit/services/claude.test.ts

# Pattern matching
npm test -- --grep "should save"

# Watch mode
npm test -- --watch
```

### Debug E2E Tests

```bash
# Interactive mode
npm run test:e2e:ui

# Debug mode (opens browser)
npx playwright test --debug

# With screenshots
npx playwright test --screenshot=on
```

### View Test Results

```bash
# Coverage report
open coverage/index.html

# E2E test report
npx playwright show-report

# Stress test results
cat test-results/stress-tests.log
```

## Common Issues

### Issue: Tests fail with "localStorage is not defined"

**Solution:** Check `tests/setup.ts` includes localStorage mock:
```typescript
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});
```

### Issue: React Flow tests fail with ResizeObserver error

**Solution:** Check `tests/setup.ts` includes ResizeObserver mock:
```typescript
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
```

### Issue: Playwright can't find selectors

**Solution:** Ensure app is running:
```bash
# Terminal 1
npm run dev

# Terminal 2
npm run test:e2e
```

### Issue: Stress tests timeout

**Solution:** Increase timeout in `playwright.config.ts`:
```typescript
use: {
  ...
  timeout: 60000, // 60 seconds
}
```

## Writing New Tests

### 1. Choose Test Type

- **Unit:** Testing a single function/class
- **Integration:** Testing component interactions
- **E2E:** Testing complete user flow

### 2. Use Appropriate Fixtures

```typescript
// For legal structures
import { holdingCompanyStructure } from '@tests/fixtures/legalEntities';

// For API mocks
import { mockClaudeGenerationResponse } from '@tests/fixtures/claudeResponses';
```

### 3. Follow Naming Convention

```typescript
describe('ComponentName', () => {
  describe('methodName', () => {
    it('should [expected behavior] when [condition]', () => {
      // Arrange
      const input = ...;

      // Act
      const result = methodName(input);

      // Assert
      expect(result).toBe(expected);
    });
  });
});
```

### 4. Clean Up

```typescript
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.clearAllMocks();
});
```

## Best Practices

### ✅ Do

- Write tests before or with implementation (TDD)
- Use descriptive test names
- Follow Arrange-Act-Assert pattern
- Mock external dependencies
- Test error paths, not just happy path
- Keep tests fast (<100ms for unit tests)
- Use fixtures for consistent test data

### ❌ Don't

- Test implementation details
- Write flaky tests (inconsistent results)
- Skip cleanup between tests
- Make tests dependent on each other
- Use real API calls in unit tests
- Commit failing tests
- Ignore coverage warnings

## Resources

### Documentation
- [Test Strategy](./TEST_STRATEGY.md) - Comprehensive testing approach
- [UAT Protocol](./uat/VALIDATION_PROTOCOL.md) - Lawyer validation process
- [Vitest Docs](https://vitest.dev/)
- [Playwright Docs](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)

### Examples
- Unit test example: `tests/unit/services/claude.test.ts`
- Integration test example: `tests/integration/DiagramCanvas.test.tsx`
- E2E test example: `tests/e2e/diagram-creation.spec.ts`

### Getting Help

1. Check this README
2. Review TEST_STRATEGY.md
3. Look at existing test examples
4. Ask in team Slack channel

---

## Success Criteria

**Project is production-ready when:**

✅ All unit tests passing (≥80% coverage)
✅ All integration tests passing
✅ All E2E tests passing in 3 browsers
✅ Stress tests confirm 50+ node performance
✅ UAT protocol completed successfully
✅ Partner lawyer validation positive
✅ Zero data loss incidents
✅ SUS score ≥70

**Current Status:** [Track in CI dashboard]

---

**Last Updated:** 2025-11-09
**Next Review:** End of Week 2 (after first UAT session)
