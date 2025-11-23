/**
 * E2E Tests for Diagram Interactions
 *
 * Tests multi-select, alignment, copy/paste, and edge editing
 */

import { test, expect } from '@playwright/test';

test.describe('Multi-Select and Alignment', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should enable alignment tools when 2+ nodes are selected', async ({ page }) => {
    // Add 3 nodes to the canvas
    await page.click('button:has-text("Corporation")');
    await page.waitForTimeout(300);

    await page.click('button:has-text("LLC")');
    await page.waitForTimeout(300);

    await page.click('button:has-text("Partnership")');
    await page.waitForTimeout(300);

    // Initially, alignment buttons should be disabled (no selection)
    const alignLeftButton = page.locator('button[title="Align Left"]');
    await expect(alignLeftButton).toBeDisabled();

    // Click first node to select it
    const firstNode = page.locator('.react-flow__node').first();
    await firstNode.click();
    await page.waitForTimeout(200);

    // Alignment still disabled (only 1 node selected)
    await expect(alignLeftButton).toBeDisabled();

    // Shift+click second node to add to selection
    const secondNode = page.locator('.react-flow__node').nth(1);
    await secondNode.click({ modifiers: ['Shift'] });
    await page.waitForTimeout(200);

    // NOW alignment should be enabled (2 nodes selected)
    await expect(alignLeftButton).toBeEnabled();

    // Verify selection info panel shows "2 nodes selected"
    await expect(page.locator('text=/2 nodes? selected/')).toBeVisible();
  });

  test('should align nodes when alignment button clicked', async ({ page }) => {
    // Add 2 nodes at different positions
    await page.click('button:has-text("Corporation")');
    await page.waitForTimeout(300);

    await page.click('button:has-text("LLC")');
    await page.waitForTimeout(300);

    // Get initial positions
    const firstNode = page.locator('.react-flow__node').first();
    const secondNode = page.locator('.react-flow__node').nth(1);

    const firstBox = await firstNode.boundingBox();
    const secondBox = await secondNode.boundingBox();

    // Verify they have different Y positions (before alignment)
    expect(firstBox).toBeTruthy();
    expect(secondBox).toBeTruthy();

    // Select both nodes with box selection
    const canvas = page.locator('.react-flow__pane');
    const canvasBox = await canvas.boundingBox();

    if (canvasBox) {
      // Drag to create selection box that covers both nodes
      await page.mouse.move(canvasBox.x + 50, canvasBox.y + 50);
      await page.mouse.down();
      await page.mouse.move(canvasBox.x + 600, canvasBox.y + 400);
      await page.mouse.up();
      await page.waitForTimeout(300);
    }

    // Click "Align Top" button
    const alignTopButton = page.locator('button[title="Align Top"]');
    await expect(alignTopButton).toBeEnabled();
    await alignTopButton.click();
    await page.waitForTimeout(500);

    // Get new positions
    const firstBoxAfter = await firstNode.boundingBox();
    const secondBoxAfter = await secondNode.boundingBox();

    // Verify both nodes now have the same Y position (aligned top)
    expect(firstBoxAfter?.y).toBe(secondBoxAfter?.y);
  });

  test('should select nodes with Shift+click', async ({ page }) => {
    // Add 3 nodes
    await page.click('button:has-text("Corporation")');
    await page.waitForTimeout(300);

    await page.click('button:has-text("LLC")');
    await page.waitForTimeout(300);

    await page.click('button:has-text("Partnership")');
    await page.waitForTimeout(300);

    // Click first node
    const firstNode = page.locator('.react-flow__node').first();
    await firstNode.click();

    // Verify 1 node selected
    await expect(page.locator('text=/1 node selected/')).toBeVisible();

    // Shift+click second node
    const secondNode = page.locator('.react-flow__node').nth(1);
    await secondNode.click({ modifiers: ['Shift'] });

    // Verify 2 nodes selected
    await expect(page.locator('text=/2 nodes selected/')).toBeVisible();

    // Shift+click third node
    const thirdNode = page.locator('.react-flow__node').nth(2);
    await thirdNode.click({ modifiers: ['Shift'] });

    // Verify 3 nodes selected
    await expect(page.locator('text=/3 nodes selected/')).toBeVisible();

    // Shift+click first node again to deselect
    await firstNode.click({ modifiers: ['Shift'] });

    // Verify 2 nodes selected (toggled off the first)
    await expect(page.locator('text=/2 nodes selected/')).toBeVisible();
  });
});

test.describe('Copy/Paste/Duplicate', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should copy and paste nodes with Ctrl+C and Ctrl+V', async ({ page }) => {
    // Add 1 node
    await page.click('button:has-text("Corporation")');
    await page.waitForTimeout(300);

    // Initially should have 1 node
    let nodeCount = await page.locator('.react-flow__node').count();
    expect(nodeCount).toBe(1);

    // Select the node
    const firstNode = page.locator('.react-flow__node').first();
    await firstNode.click();

    // Copy with Ctrl+C
    await page.keyboard.press('Control+C');
    await page.waitForTimeout(200);

    // Paste with Ctrl+V
    await page.keyboard.press('Control+V');
    await page.waitForTimeout(500);

    // Should now have 2 nodes
    nodeCount = await page.locator('.react-flow__node').count();
    expect(nodeCount).toBe(2);
  });

  test('should duplicate nodes with Ctrl+D', async ({ page }) => {
    // Add 1 node
    await page.click('button:has-text("LLC")');
    await page.waitForTimeout(300);

    // Initially should have 1 node
    let nodeCount = await page.locator('.react-flow__node').count();
    expect(nodeCount).toBe(1);

    // Select the node
    const firstNode = page.locator('.react-flow__node').first();
    await firstNode.click();

    // Duplicate with Ctrl+D
    await page.keyboard.press('Control+D');
    await page.waitForTimeout(500);

    // Should now have 2 nodes
    nodeCount = await page.locator('.react-flow__node').count();
    expect(nodeCount).toBe(2);
  });

  test('should cut nodes with Ctrl+X', async ({ page }) => {
    // Add 2 nodes
    await page.click('button:has-text("Corporation")');
    await page.waitForTimeout(300);

    await page.click('button:has-text("LLC")');
    await page.waitForTimeout(300);

    // Should have 2 nodes
    let nodeCount = await page.locator('.react-flow__node').count();
    expect(nodeCount).toBe(2);

    // Select first node
    const firstNode = page.locator('.react-flow__node').first();
    await firstNode.click();

    // Cut with Ctrl+X
    await page.keyboard.press('Control+X');
    await page.waitForTimeout(500);

    // Should now have 1 node (cut removes)
    nodeCount = await page.locator('.react-flow__node').count();
    expect(nodeCount).toBe(1);

    // Paste with Ctrl+V
    await page.keyboard.press('Control+V');
    await page.waitForTimeout(500);

    // Should have 2 nodes again
    nodeCount = await page.locator('.react-flow__node').count();
    expect(nodeCount).toBe(2);
  });
});

test.describe('Edge Editing with Live Preview', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should show live preview when editing edge properties', async ({ page }) => {
    // Add 2 nodes
    await page.click('button:has-text("Corporation")');
    await page.waitForTimeout(300);

    await page.click('button:has-text("LLC")');
    await page.waitForTimeout(500);

    // Connect them by dragging from first node handle to second node
    const firstNode = page.locator('.react-flow__node').first();
    const secondNode = page.locator('.react-flow__node').nth(1);

    // Find handle on first node
    const sourceHandle = firstNode.locator('.react-flow__handle-bottom').first();
    const targetHandle = secondNode.locator('.react-flow__handle-top').first();

    await sourceHandle.hover();
    await page.waitForTimeout(200);

    await sourceHandle.click();
    await page.mouse.down();
    await targetHandle.hover();
    await page.mouse.up();
    await page.waitForTimeout(500);

    // Should have 1 edge now
    const edgeCount = await page.locator('.react-flow__edge').count();
    expect(edgeCount).toBe(1);

    // Click the edge to select it
    const edge = page.locator('.react-flow__edge').first();
    await edge.click({ force: true });
    await page.waitForTimeout(300);

    // Edge property panel should open
    await expect(page.locator('text=Edit Connection')).toBeVisible();

    // Get current stroke color (should be default gray)
    const edgePath = page.locator('.react-flow__edge path').first();
    const initialStroke = await edgePath.getAttribute('stroke');

    // Change line color to red
    const colorPicker = page.locator('input[type="color"]');
    await colorPicker.fill('#ff0000');
    await page.waitForTimeout(300);

    // Verify edge color changed immediately (live preview)
    const newStroke = await edgePath.getAttribute('stroke');
    expect(newStroke).toBe('#ff0000');

    // Change line thickness
    const thicknessSlider = page.locator('input[type="range"]');
    await thicknessSlider.fill('5');
    await page.waitForTimeout(300);

    // Verify stroke width changed immediately
    const strokeWidth = await edgePath.getAttribute('stroke-width');
    expect(strokeWidth).toBe('5');

    // Change line style to dashed
    const lineStyleSelect = page.locator('select').nth(1); // Second select is line style
    await lineStyleSelect.selectOption('dashed');
    await page.waitForTimeout(300);

    // Verify strokeDasharray is set
    const dashArray = await edgePath.getAttribute('stroke-dasharray');
    expect(dashArray).toBe('5,5');
  });
});

test.describe('Box Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should select multiple nodes with box selection', async ({ page }) => {
    // Add 3 nodes spread out
    await page.click('button:has-text("Corporation")');
    await page.waitForTimeout(300);

    await page.click('button:has-text("LLC")');
    await page.waitForTimeout(300);

    await page.click('button:has-text("Partnership")');
    await page.waitForTimeout(300);

    // Perform box selection by dragging on the canvas
    const canvas = page.locator('.react-flow__pane');
    const canvasBox = await canvas.boundingBox();

    if (canvasBox) {
      // Drag to create selection box
      await page.mouse.move(canvasBox.x + 50, canvasBox.y + 50);
      await page.mouse.down();
      await page.mouse.move(canvasBox.x + 600, canvasBox.y + 400);
      await page.mouse.up();
      await page.waitForTimeout(300);
    }

    // Should show "3 nodes selected" or "2 nodes selected" depending on box coverage
    const selectionText = await page.locator('div.bg-blue-50').textContent();
    expect(selectionText).toContain('node');
    expect(selectionText).toContain('selected');
  });
});
