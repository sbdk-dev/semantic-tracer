# Testing Checklist

Quick reference for running tests at different stages of development.

## Daily Development

- [ ] Run tests in watch mode: `npm test`
- [ ] Check specific test file: `npm test path/to/test.ts`
- [ ] Fix any failing tests before moving on

## Before Committing

- [ ] Run all unit tests: `npm test`
- [ ] Check TypeScript: `npm run typecheck`
- [ ] Run linter: `npm run lint`
- [ ] Verify coverage: `npm run test:coverage`
- [ ] Coverage meets thresholds (80%+ overall)

## Before Creating PR

- [ ] All unit tests passing: `npm test`
- [ ] All integration tests passing: `npm test tests/integration`
- [ ] TypeScript clean: `npm run typecheck`
- [ ] No lint errors: `npm run lint`
- [ ] Coverage report reviewed: `open coverage/index.html`
- [ ] E2E tests passing: `npm run test:e2e`

## Before Merging PR

- [ ] CI tests all green
- [ ] Code review approved
- [ ] Coverage maintained or improved
- [ ] No new warnings or errors
- [ ] Documentation updated if needed

## Before Release

- [ ] Full unit test suite: `npm test`
- [ ] Full integration suite: `npm test tests/integration`
- [ ] Full E2E suite: `npm run test:e2e`
- [ ] Stress tests: `npm run test:stress`
- [ ] All browsers (Chrome, Firefox, Safari): Verify in CI
- [ ] Coverage report: `npm run test:coverage`
- [ ] No critical bugs in backlog
- [ ] UAT session completed (if scheduled)

## Weekly UAT Session

- [ ] Application running locally
- [ ] PostHog tracking enabled
- [ ] Screen recording ready
- [ ] Follow protocol in `tests/uat/VALIDATION_PROTOCOL.md`
- [ ] Complete feedback form
- [ ] Log bugs in tracker
- [ ] Update metrics spreadsheet

## Monthly Maintenance

- [ ] Review test performance (identify slow tests)
- [ ] Update test fixtures
- [ ] Audit test quality
- [ ] Update documentation
- [ ] Review and archive old bugs

## When Tests Fail

1. **Read the error message carefully**
2. **Run the specific test:** `npm test path/to/failing-test.ts`
3. **Check recent changes:** `git diff`
4. **Review test logic:** Is test correct or is code broken?
5. **Debug:** Add `console.log` or use debugger
6. **Fix the issue:** Update code or test
7. **Verify fix:** Re-run all related tests
8. **Commit fix:** Don't commit failing tests

## Coverage Troubleshooting

**If coverage drops below threshold:**

1. Check coverage report: `npm run test:coverage && open coverage/index.html`
2. Identify uncovered lines (highlighted in red)
3. Write tests for critical uncovered code
4. Run coverage again to verify
5. Consider if 80% threshold should exclude certain files

**Excluding files from coverage:**

Edit `vitest.config.ts`:
```typescript
coverage: {
  exclude: [
    'node_modules/',
    'tests/',
    '**/*.config.*',
    // Add more as needed
  ]
}
```

## Performance Troubleshooting

**If tests are slow:**

1. Identify slow tests: `npm test -- --reporter=verbose`
2. Look for tests taking >1 second
3. Check for unnecessary `await` or timeouts
4. Mock expensive operations
5. Use `test.concurrent` for independent tests
6. Profile with `npm test -- --inspect-brk`

**If E2E tests timeout:**

1. Increase timeout in `playwright.config.ts`
2. Check if app is running: `npm run dev`
3. Review network tab in Playwright UI
4. Add explicit waits: `await page.waitForSelector(...)`
5. Check for infinite loops in app code

## Quick Commands Reference

```bash
# Unit tests
npm test                              # Watch mode
npm test -- --run                     # Run once
npm test path/to/test.ts              # Specific file
npm test -- --grep "pattern"          # Pattern match

# Coverage
npm run test:coverage                 # Generate report
open coverage/index.html              # View HTML report

# E2E tests
npm run test:e2e                      # Headless
npm run test:e2e:ui                   # Interactive UI
npx playwright test --debug           # Debug mode
npx playwright test --headed          # See browser

# Stress tests
npm run test:stress                   # Run all scenarios

# Other
npm run typecheck                     # TypeScript validation
npm run lint                          # ESLint
npm run test:ui                       # Vitest interactive UI
```

## Exit Criteria Checklist

**Before declaring "Done":**

Phase 1 (Core Canvas):
- [ ] Unit tests for all services (layout, storage)
- [ ] Integration tests for React Flow canvas
- [ ] E2E test for manual diagram creation
- [ ] 50+ node stress test passing
- [ ] Coverage ≥60%

Phase 2 (AI Generation):
- [ ] Unit tests for Claude API service
- [ ] Integration tests for AI dialogs
- [ ] E2E tests for AI generation workflow
- [ ] AI success rate >90% in tests
- [ ] Coverage ≥75%

Phase 3 (Validation):
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] All E2E tests passing
- [ ] All stress tests passing
- [ ] UAT protocol completed
- [ ] Partner lawyer validation positive
- [ ] Coverage ≥80%
- [ ] SUS score ≥70
- [ ] Time-to-completion <15 min (P90)

---

**Keep this checklist visible during development to maintain quality standards.**
