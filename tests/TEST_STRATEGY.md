# LawDraw Test Strategy

## Overview

This document outlines the comprehensive testing strategy for the legal entity diagram platform. The strategy ensures 90%+ test coverage, zero data loss, and validates the <15 minute creation time target.

---

## Testing Pyramid

```
         /\
        /E2E\        3-5 critical user journeys
       /------\
      / Integ \      20-30 integration tests
     /----------\
    /   Unit     \   100+ unit tests
   /--------------\
```

### Test Distribution
- **Unit Tests:** 70% of test suite (fast, focused, isolated)
- **Integration Tests:** 25% of test suite (component interactions)
- **E2E Tests:** 5% of test suite (critical user flows)

---

## Test Coverage Goals

### Minimum Coverage Requirements

| Type | Statements | Branches | Functions | Lines |
|------|-----------|----------|-----------|-------|
| Overall | 80% | 75% | 80% | 80% |
| Services | 90% | 85% | 90% | 90% |
| Components | 75% | 70% | 75% | 75% |
| Utilities | 95% | 90% | 95% | 95% |

### Critical Paths (100% Coverage Required)

1. **Data Persistence**
   - Save/load functionality
   - LocalStorage operations
   - Data serialization/deserialization
   - Auto-save mechanism

2. **Claude API Integration**
   - Diagram generation
   - Response parsing
   - Error handling
   - Retry logic

3. **React Flow Operations**
   - Node creation
   - Edge creation
   - Auto-layout
   - Zoom/pan

---

## Test Categories

### 1. Unit Tests

**Location:** `tests/unit/`

**Purpose:** Test individual functions and components in isolation.

**Examples:**
- Layout service (dagre integration)
- Storage service (localStorage)
- Claude API service (generation, parsing)
- Utility functions (validation, formatting)

**Characteristics:**
- Run in <100ms each
- No external dependencies
- Use mocks for all I/O
- Test one behavior per test

**Tools:**
- Vitest (test runner)
- @testing-library/react (component testing)
- vi.fn() (mocking)

**Run Command:**
```bash
npm test                    # Watch mode
npm run test:coverage       # With coverage report
npm run test:ui             # Interactive UI
```

### 2. Integration Tests

**Location:** `tests/integration/`

**Purpose:** Test component interactions and React Flow integration.

**Examples:**
- DiagramCanvas with entity nodes
- Node selection and editing
- Edge creation between nodes
- Auto-layout application
- Save/load workflow

**Characteristics:**
- Run in <1 second each
- Test multiple components together
- Mock external APIs (Claude, PostHog)
- Real DOM interactions

**Tools:**
- Vitest + JSDOM
- @testing-library/react
- @testing-library/user-event
- ReactFlowProvider

**Run Command:**
```bash
npm test tests/integration  # Run integration tests only
```

### 3. E2E Tests

**Location:** `tests/e2e/`

**Purpose:** Test complete user workflows in real browser.

**Examples:**
- Create diagram manually end-to-end
- Generate diagram with AI
- Modify diagram with chat
- Export PDF
- Save and reload

**Characteristics:**
- Run in real browser (Chromium, Firefox, WebKit)
- Full application stack running
- Real API calls (or stubbed at network level)
- Slowest tests (seconds to minutes)

**Tools:**
- Playwright
- Multiple browsers
- Screenshots/videos on failure

**Run Command:**
```bash
npm run test:e2e            # Headless mode
npm run test:e2e:ui         # Interactive UI mode
```

### 4. Stress/Performance Tests

**Location:** `tests/stress/`

**Purpose:** Validate performance with heavy loads (50+ nodes).

**Examples:**
- Render 50 nodes
- Render 100 nodes
- Apply layout to large diagram
- Test zoom/pan responsiveness
- Memory usage monitoring

**Characteristics:**
- Measure performance metrics
- Test against thresholds
- Generate performance reports
- Run in CI periodically

**Tools:**
- Playwright (automation)
- performance.now() (timing)
- performance.memory (memory)

**Run Command:**
```bash
npm run test:stress         # Run all stress tests
```

### 5. User Acceptance Tests

**Location:** `tests/uat/`

**Purpose:** Validate with real lawyers using real cases.

**Format:** Structured 6-week protocol with weekly sessions.

**Documentation:** See `VALIDATION_PROTOCOL.md`

**Metrics:**
- Time to completion
- Quality assessment
- SUS usability score
- Preference vs PowerPoint

---

## Test Fixtures

### Legal Entity Fixtures

**Location:** `tests/fixtures/legalEntities.ts`

**Available Structures:**
- Single corporation (simplest)
- Holding company (HoldCo → 2 OpCos)
- Startup equity (founders + investors)
- Foreign entity structure (offshore → US)
- Disregarded entity (single-member LLC)
- Real estate structure (property + management)
- Partnership (GP + LPs)
- Trust structure
- Complex multi-tier (50+ nodes stress test)

**Usage:**
```typescript
import { holdingCompanyStructure } from '@tests/fixtures/legalEntities';

const { nodes, edges } = holdingCompanyStructure;
```

### Claude API Response Fixtures

**Location:** `tests/fixtures/claudeResponses.ts`

**Available Mocks:**
- Valid responses (plain JSON, markdown-wrapped)
- Invalid responses (malformed, missing fields)
- Error responses (API error, auth error, timeout)
- Streaming responses
- Modification responses

**Usage:**
```typescript
import { mockClaudeGenerationResponse } from '@tests/fixtures/claudeResponses';

const mockClient = {
  messages: {
    create: vi.fn(async () => mockClaudeGenerationResponse.valid.simple)
  }
};
```

---

## Test Data Guidelines

### 1. Use Realistic Legal Structures

❌ **Bad:** Generic test data
```typescript
const nodes = [
  { id: '1', type: 'box', data: { name: 'Test' } }
];
```

✅ **Good:** Legal domain data
```typescript
const nodes = [
  {
    id: 'corp-1',
    type: 'corporation',
    data: {
      label: 'Acme Inc.',
      jurisdiction: 'Delaware',
      taxStatus: 'us'
    }
  }
];
```

### 2. Test Edge Cases

**Ownership Percentages:**
- Exactly 100%
- >100% (should fail validation)
- <100% (partial ownership)
- 0% (edge case)
- Fractional percentages (66.67%)

**Entity Names:**
- Special characters (&, ", <, >)
- Unicode (中文, Société)
- Very long names (>100 chars)
- Empty strings

**Structure Complexity:**
- 0 nodes (empty diagram)
- 1 node (single entity)
- 50 nodes (stress test threshold)
- 100+ nodes (extreme stress)
- Circular references (A owns B owns A)

### 3. Test Browser Compatibility

**Browsers to Test:**
- Chrome/Chromium (primary)
- Firefox
- Safari (WebKit)
- Edge (Chromium-based)

**Screen Sizes:**
- Desktop: 1920x1080
- Laptop: 1366x768
- Small laptop: 1280x720

---

## Continuous Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test tests/integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-screenshots
          path: test-results/

  stress-tests:
    runs-on: ubuntu-latest
    # Only run on main branch
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:stress
```

### Pre-commit Hooks

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run typecheck && npm run lint",
      "pre-push": "npm run test:coverage"
    }
  }
}
```

---

## Testing Best Practices

### 1. Test Naming Convention

**Pattern:** `should [expected behavior] when [condition]`

✅ **Good:**
```typescript
test('should save diagram to localStorage when saveDiagram is called', () => {
  // ...
});

test('should throw error when JSON parsing fails', () => {
  // ...
});
```

❌ **Bad:**
```typescript
test('save test', () => { });
test('test1', () => { });
```

### 2. Arrange-Act-Assert Pattern

```typescript
test('should create node with correct data', () => {
  // Arrange
  const nodeData = { label: 'Test Corp', jurisdiction: 'Delaware' };

  // Act
  const node = createNode('corp-1', 'corporation', nodeData);

  // Assert
  expect(node.data.label).toBe('Test Corp');
  expect(node.data.jurisdiction).toBe('Delaware');
});
```

### 3. One Assertion Per Test (Generally)

❌ **Bad:** Testing multiple unrelated things
```typescript
test('node tests', () => {
  expect(node.id).toBe('corp-1');
  expect(edge.source).toBe('parent');
  expect(layout.direction).toBe('TB');
});
```

✅ **Good:** Focused tests
```typescript
test('should assign unique ID to node', () => {
  expect(node.id).toBe('corp-1');
});

test('should connect edge from parent to child', () => {
  expect(edge.source).toBe('parent');
  expect(edge.target).toBe('child');
});
```

### 4. Test Error Paths

Don't just test the happy path:

```typescript
describe('generateDiagram', () => {
  test('should generate valid diagram on success', async () => {
    // Happy path
  });

  test('should throw on API timeout', async () => {
    // Error path
  });

  test('should retry on transient errors', async () => {
    // Error recovery
  });

  test('should not retry on auth errors', async () => {
    // Error handling
  });
});
```

### 5. Mock External Dependencies

```typescript
// Mock PostHog
vi.mock('posthog-js', () => ({
  default: {
    init: vi.fn(),
    capture: vi.fn(),
  }
}));

// Mock Anthropic API
vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn(() => ({
    messages: {
      create: vi.fn(async () => mockResponse)
    }
  }))
}));
```

### 6. Clean Up After Tests

```typescript
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();              // Clean up React components
  localStorage.clear();   // Clear localStorage
  vi.clearAllMocks();     // Clear mock call history
});
```

---

## Performance Benchmarks

### Target Performance Metrics

| Operation | Target | Measurement |
|-----------|--------|-------------|
| Unit test | <100ms | Per test |
| Integration test | <1s | Per test |
| E2E test | <30s | Per test |
| Full test suite | <5min | Total |
| CI pipeline | <10min | Total |

### React Flow Performance

| Scenario | Target | Metric |
|----------|--------|--------|
| Render 50 nodes | <5s | Initial render |
| Render 100 nodes | <10s | Initial render |
| Apply layout (50 nodes) | <3s | Layout calculation |
| Zoom/pan | <100ms | Interaction response |
| Node selection | <50ms | Click to select |

### Claude API Performance

| Operation | Target | Metric |
|-----------|--------|--------|
| Simple generation | <3s | P95 |
| Complex generation | <5s | P95 |
| Modification | <3s | P95 |
| Parse response | <100ms | Average |

---

## Debugging Tests

### Running Specific Tests

```bash
# Single test file
npm test tests/unit/services/claude.test.ts

# Tests matching pattern
npm test -- --grep "should save"

# Watch mode for TDD
npm test -- --watch

# Debug mode
npm test -- --inspect-brk
```

### Playwright Debugging

```bash
# Interactive UI mode
npm run test:e2e:ui

# Debug mode (opens browser)
npx playwright test --debug

# Run only failing tests
npx playwright test --last-failed

# Generate screenshots
npx playwright test --screenshot=on
```

### Coverage Reports

```bash
# Generate coverage
npm run test:coverage

# View HTML report
open coverage/index.html

# Coverage for specific file
npm test -- --coverage --collectCoverageFrom=src/services/claude.ts
```

---

## Test Maintenance

### Weekly Tasks

- [ ] Review failing tests in CI
- [ ] Update snapshots if needed
- [ ] Remove obsolete tests
- [ ] Add tests for new features
- [ ] Check coverage reports

### Monthly Tasks

- [ ] Review test performance (identify slow tests)
- [ ] Update test fixtures
- [ ] Audit test quality
- [ ] Update this documentation
- [ ] Review and update UAT protocol based on findings

### Before Each Release

- [ ] Run full test suite locally
- [ ] Verify all E2E tests pass
- [ ] Run stress tests
- [ ] Check coverage meets thresholds
- [ ] Review PostHog data from UAT sessions

---

## Success Metrics

### Test Quality Indicators

**Good:**
- ✅ All tests passing in CI
- ✅ Coverage >80% overall
- ✅ Zero flaky tests
- ✅ Test suite runs in <5 minutes
- ✅ New features include tests
- ✅ UAT sessions complete on schedule

**Red Flags:**
- ❌ Failing tests ignored
- ❌ Coverage declining
- ❌ Flaky tests (>5% failure rate)
- ❌ Test suite too slow (>10 min)
- ❌ Untested features shipped
- ❌ UAT sessions skipped

### Exit Criteria for Production

Must achieve ALL:
- [ ] Unit test coverage ≥80%
- [ ] Integration test coverage ≥75%
- [ ] All E2E tests passing
- [ ] Zero data loss in stress tests
- [ ] Performance benchmarks met (50+ nodes in <5s)
- [ ] UAT protocol completed successfully
- [ ] Partner lawyer validation positive
- [ ] SUS score ≥70

---

## Resources

### Documentation
- [Vitest Docs](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Docs](https://playwright.dev/)
- [React Flow Testing](https://reactflow.dev/docs/guides/testing/)

### Internal Links
- Test Fixtures: `/tests/fixtures/`
- UAT Protocol: `/tests/uat/VALIDATION_PROTOCOL.md`
- Coverage Reports: `/coverage/index.html`
- Stress Test Results: `/test-results/stress/`

### Team Contacts
- QA Lead: [Name]
- Partner Lawyer: [Name]
- Product Manager: [Name]

---

**Document Version:** 1.0
**Last Updated:** 2025-11-09
**Next Review:** End of Week 2 (after first UAT session)
