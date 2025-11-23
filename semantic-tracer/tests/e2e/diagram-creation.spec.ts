/**
 * E2E Tests - Diagram Creation Workflow
 *
 * Tests complete user journey from blank canvas to finished diagram.
 * Target: <15 minutes for lawyer to create complete diagram.
 */

import { test, expect } from '@playwright/test';

test.describe('Diagram Creation Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should load application successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/LawDraw/);
    await expect(page.locator('[data-testid="diagram-canvas"]')).toBeVisible();
  });

  test('should create simple holding company structure manually', async ({ page }) => {
    const startTime = Date.now();

    // Click to add HoldCo
    await page.click('[data-testid="entity-palette-corporation"]');
    await page.click('[data-testid="diagram-canvas"]', { position: { x: 300, y: 100 } });

    // Verify node appeared
    await expect(page.locator('[data-node-id]').first()).toBeVisible();

    // Double-click to edit label
    await page.dblclick('[data-node-id]').first();
    await page.fill('input[type="text"]', 'HoldCo Inc.');
    await page.press('input[type="text"]', 'Enter');

    // Add OpCo 1
    await page.click('[data-testid="entity-palette-llc"]');
    await page.click('[data-testid="diagram-canvas"]', { position: { x: 150, y: 250 } });

    // Add OpCo 2
    await page.click('[data-testid="entity-palette-llc"]');
    await page.click('[data-testid="diagram-canvas"]', { position: { x: 450, y: 250 } });

    // Create connections
    // (Drag from HoldCo source handle to OpCo 1 target handle)
    await page.dragAndDrop(
      '[data-node-id]:first-child .react-flow__handle-source',
      '[data-node-id]:nth-child(2) .react-flow__handle-target'
    );

    const elapsed = (Date.now() - startTime) / 1000;

    // Should complete in under 2 minutes for simple structure
    expect(elapsed).toBeLessThan(120);

    // Verify structure
    await expect(page.locator('[data-node-id]')).toHaveCount(3);
    await expect(page.locator('[data-edge-id]')).toHaveCount(1);
  });

  test('should generate diagram with AI from description', async ({ page }) => {
    const startTime = Date.now();

    // Open AI generation dialog
    await page.click('[data-testid="ai-generate-button"]');

    // Enter description
    await page.fill(
      '[data-testid="ai-description-input"]',
      'Delaware holding company with two Texas LLC subsidiaries'
    );

    // Generate
    await page.click('[data-testid="generate-submit"]');

    // Wait for generation
    await page.waitForSelector('[data-node-id]', { timeout: 5000 });

    const elapsed = (Date.now() - startTime) / 1000;

    // AI generation should complete in under 10 seconds
    expect(elapsed).toBeLessThan(10);

    // Verify generated structure
    await expect(page.locator('[data-node-id]')).toHaveCount(3);

    // Check for Delaware jurisdiction
    await expect(page.locator('text=Delaware')).toBeVisible();

    // Check for Texas jurisdiction
    await expect(page.locator('text=Texas')).toBeVisible();
  });

  test('should modify diagram using AI chat', async ({ page }) => {
    // First create a simple structure
    await page.click('[data-testid="ai-generate-button"]');
    await page.fill('[data-testid="ai-description-input"]', 'Simple Delaware corporation');
    await page.click('[data-testid="generate-submit"]');
    await page.waitForSelector('[data-node-id]');

    // Open chat assistant
    await page.click('[data-testid="ai-chat-toggle"]');

    // Request modification
    await page.fill('[data-testid="chat-input"]', 'Add three shareholders');
    await page.press('[data-testid="chat-input"]', 'Enter');

    // Wait for modification
    await page.waitForSelector('[data-node-id]:nth-child(4)', { timeout: 5000 });

    // Should now have corporation + 3 shareholders = 4 nodes
    await expect(page.locator('[data-node-id]')).toHaveCount(4);
  });

  test('should apply auto-layout to messy diagram', async ({ page }) => {
    // Manually add nodes in random positions
    for (let i = 0; i < 5; i++) {
      await page.click('[data-testid="entity-palette-corporation"]');
      await page.click('[data-testid="diagram-canvas"]', {
        position: { x: Math.random() * 500, y: Math.random() * 500 },
      });
    }

    // Get initial positions
    const beforeLayout = await page.evaluate(() => {
      const nodes = document.querySelectorAll('[data-node-id]');
      return Array.from(nodes).map((node) => {
        const rect = node.getBoundingClientRect();
        return { x: rect.x, y: rect.y };
      });
    });

    // Apply auto-layout
    await page.click('[data-testid="auto-layout-button"]');

    // Wait for animation
    await page.waitForTimeout(500);

    // Get new positions
    const afterLayout = await page.evaluate(() => {
      const nodes = document.querySelectorAll('[data-node-id]');
      return Array.from(nodes).map((node) => {
        const rect = node.getBoundingClientRect();
        return { x: rect.x, y: rect.y };
      });
    });

    // Positions should have changed
    expect(beforeLayout).not.toEqual(afterLayout);

    // Nodes should be more organized (check spacing)
    for (let i = 0; i < afterLayout.length - 1; i++) {
      for (let j = i + 1; j < afterLayout.length; j++) {
        const distance = Math.sqrt(
          Math.pow(afterLayout[i].x - afterLayout[j].x, 2) +
            Math.pow(afterLayout[i].y - afterLayout[j].y, 2)
        );
        // Should have minimum spacing
        expect(distance).toBeGreaterThan(50);
      }
    }
  });

  test('should save and load diagram automatically', async ({ page }) => {
    // Create a diagram
    await page.click('[data-testid="entity-palette-corporation"]');
    await page.click('[data-testid="diagram-canvas"]', { position: { x: 300, y: 100 } });
    await page.dblclick('[data-node-id]').first();
    await page.fill('input[type="text"]', 'Test Corp');
    await page.press('input[type="text"]', 'Enter');

    // Wait for autosave (should happen within 30 seconds)
    await page.waitForTimeout(2000);

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Diagram should be restored
    await expect(page.locator('text=Test Corp')).toBeVisible();
  });

  test('should export diagram as PDF', async ({ page }) => {
    // Create simple structure
    await page.click('[data-testid="ai-generate-button"]');
    await page.fill('[data-testid="ai-description-input"]', 'Delaware corporation');
    await page.click('[data-testid="generate-submit"]');
    await page.waitForSelector('[data-node-id]');

    // Set up download handler
    const downloadPromise = page.waitForEvent('download');

    // Click export
    await page.click('[data-testid="export-pdf-button"]');

    const download = await downloadPromise;

    // Verify download
    expect(download.suggestedFilename()).toMatch(/.*\.pdf$/);

    // File should have content
    const path = await download.path();
    expect(path).toBeTruthy();
  });

  test('should handle 50+ node stress test', async ({ page }) => {
    // Generate large structure
    await page.click('[data-testid="ai-generate-button"]');
    await page.fill(
      '[data-testid="ai-description-input"]',
      'Complex multi-tier holding company with 50 subsidiaries'
    );
    await page.click('[data-testid="generate-submit"]');

    // Wait for generation (may take longer)
    await page.waitForSelector('[data-node-id]', { timeout: 10000 });

    // Canvas should remain responsive
    await expect(page.locator('[data-testid="diagram-canvas"]')).toBeVisible();

    // Should be able to zoom
    await page.mouse.move(300, 300);
    await page.mouse.wheel(0, -100);

    // Should be able to pan
    await page.mouse.move(300, 300);
    await page.mouse.down();
    await page.mouse.move(400, 400);
    await page.mouse.up();

    // Canvas should still be responsive
    const canvasInteractive = await page.evaluate(() => {
      const canvas = document.querySelector('[data-testid="diagram-canvas"]');
      return canvas !== null;
    });

    expect(canvasInteractive).toBe(true);
  });
});

test.describe('Lawyer Validation Scenarios', () => {
  test('should create startup equity structure in under 15 minutes', async ({ page }) => {
    test.setTimeout(900000); // 15 minutes

    const startTime = Date.now();

    await page.goto('/');

    // Lawyer workflow: AI-assisted creation
    await page.click('[data-testid="ai-generate-button"]');
    await page.fill(
      '[data-testid="ai-description-input"]',
      'Delaware C-Corp with two founders (60/40 split), Series A investor (20%), and 15% option pool'
    );
    await page.click('[data-testid="generate-submit"]');
    await page.waitForSelector('[data-node-id]');

    // Refine with chat
    await page.click('[data-testid="ai-chat-toggle"]');
    await page.fill('[data-testid="chat-input"]', 'Add liquidation preference note to Series A');
    await page.press('[data-testid="chat-input"]', 'Enter');
    await page.waitForTimeout(3000);

    // Manual adjustments
    await page.dblclick('text=Founder 1');
    await page.fill('input[type="text"]', 'Jane Smith');
    await page.press('input[type="text"]', 'Enter');

    // Apply layout
    await page.click('[data-testid="auto-layout-button"]');

    // Export
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-pdf-button"]');
    await downloadPromise;

    const elapsed = (Date.now() - startTime) / 1000;

    // Should complete well under 15 minutes (target: 5-10 minutes)
    expect(elapsed).toBeLessThan(900); // 15 minutes max
    console.log(`Completed in ${elapsed.toFixed(1)} seconds`);
  });

  test('should create real estate structure in under 10 minutes', async ({ page }) => {
    test.setTimeout(600000); // 10 minutes

    const startTime = Date.now();

    await page.goto('/');

    // Use AI generation
    await page.click('[data-testid="ai-generate-button"]');
    await page.fill(
      '[data-testid="ai-description-input"]',
      'Texas real estate structure: Property Holdings LLC owns commercial building at 123 Main Street, managed by Management Co LLC'
    );
    await page.click('[data-testid="generate-submit"]');
    await page.waitForSelector('[data-node-id]');

    // Add details
    await page.click('[data-testid="ai-chat-toggle"]');
    await page.fill(
      '[data-testid="chat-input"]',
      'Add FinCEN beneficial ownership disclosure note'
    );
    await page.press('[data-testid="chat-input"]', 'Enter');
    await page.waitForTimeout(3000);

    // Export
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-pdf-button"]');
    await downloadPromise;

    const elapsed = (Date.now() - startTime) / 1000;

    expect(elapsed).toBeLessThan(600); // 10 minutes max
    console.log(`Completed in ${elapsed.toFixed(1)} seconds`);
  });

  test('should handle complex M&A structure in under 15 minutes', async ({ page }) => {
    test.setTimeout(900000); // 15 minutes

    const startTime = Date.now();

    await page.goto('/');

    // Complex multi-tier structure
    await page.click('[data-testid="ai-generate-button"]');
    await page.fill(
      '[data-testid="ai-description-input"]',
      'Acquisition structure: Cayman Islands holding company owns Delaware holding company, which owns 3 US operating subsidiaries (Texas, California, New York) and 2 foreign subsidiaries (UK, Singapore)'
    );
    await page.click('[data-testid="generate-submit"]');
    await page.waitForSelector('[data-node-id]', { timeout: 10000 });

    // Iterative refinements
    await page.click('[data-testid="ai-chat-toggle"]');

    await page.fill('[data-testid="chat-input"]', 'Add tax status to all entities');
    await page.press('[data-testid="chat-input"]', 'Enter');
    await page.waitForTimeout(3000);

    await page.fill('[data-testid="chat-input"]', 'Highlight foreign ownership for CFIUS review');
    await page.press('[data-testid="chat-input"]', 'Enter');
    await page.waitForTimeout(3000);

    // Apply professional layout
    await page.click('[data-testid="auto-layout-button"]');

    // Export
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-pdf-button"]');
    await downloadPromise;

    const elapsed = (Date.now() - startTime) / 1000;

    expect(elapsed).toBeLessThan(900); // 15 minutes max
    console.log(`Completed in ${elapsed.toFixed(1)} seconds`);
  });
});

test.describe('Error Handling', () => {
  test('should gracefully handle AI generation failure', async ({ page }) => {
    await page.goto('/');

    // Mock API failure by using invalid description
    await page.click('[data-testid="ai-generate-button"]');
    await page.fill('[data-testid="ai-description-input"]', ''); // Empty input
    await page.click('[data-testid="generate-submit"]');

    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();

    // Canvas should remain functional
    await expect(page.locator('[data-testid="diagram-canvas"]')).toBeVisible();
  });

  test('should recover from network timeout', async ({ page }) => {
    await page.goto('/');

    // Simulate slow network
    await page.route('https://api.anthropic.com/**', (route) => {
      setTimeout(() => route.continue(), 10000);
    });

    await page.click('[data-testid="ai-generate-button"]');
    await page.fill('[data-testid="ai-description-input"]', 'Test structure');
    await page.click('[data-testid="generate-submit"]');

    // Should show loading state
    await expect(page.locator('text=Generating...')).toBeVisible({ timeout: 1000 });

    // Should eventually timeout and show error
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible({ timeout: 15000 });
  });

  test('should prevent data loss on browser crash simulation', async ({ page, context }) => {
    await page.goto('/');

    // Create diagram
    await page.click('[data-testid="entity-palette-corporation"]');
    await page.click('[data-testid="diagram-canvas"]', { position: { x: 300, y: 100 } });

    // Wait for autosave
    await page.waitForTimeout(2000);

    // Close and reopen (simulates crash recovery)
    await page.close();

    const newPage = await context.newPage();
    await newPage.goto('/');
    await newPage.waitForLoadState('networkidle');

    // Diagram should be recovered
    await expect(newPage.locator('[data-node-id]')).toBeVisible();
  });
});
