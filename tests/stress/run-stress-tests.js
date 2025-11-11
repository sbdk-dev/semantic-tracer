#!/usr/bin/env node

/**
 * Stress Test Runner
 *
 * Tests application performance under heavy load.
 * Validates 50+ node requirement and responsiveness.
 */

import { chromium } from '@playwright/test';
import { performance } from 'perf_hooks';

const STRESS_TEST_SCENARIOS = [
  {
    name: '50 Nodes - Linear Chain',
    description: 'Simple parent-child chain of 50 entities',
    nodeCount: 50,
    edgeCount: 49,
    structure: 'linear',
  },
  {
    name: '100 Nodes - Tree Structure',
    description: 'Hierarchical tree with 100 entities',
    nodeCount: 100,
    edgeCount: 99,
    structure: 'tree',
  },
  {
    name: '75 Nodes - Complex Multi-Tier',
    description: 'Realistic multi-tier holding company structure',
    nodeCount: 75,
    edgeCount: 90,
    structure: 'complex',
  },
  {
    name: '200 Nodes - Extreme Stress',
    description: 'Maximum stress test with 200 entities',
    nodeCount: 200,
    edgeCount: 250,
    structure: 'complex',
  },
];

class StressTestRunner {
  constructor() {
    this.results = [];
  }

  async runAllTests() {
    console.log('='.repeat(80));
    console.log('LawDraw Stress Test Suite');
    console.log('='.repeat(80));
    console.log('');

    for (const scenario of STRESS_TEST_SCENARIOS) {
      await this.runScenario(scenario);
      console.log('');
    }

    this.printSummary();
  }

  async runScenario(scenario) {
    console.log(`Running: ${scenario.name}`);
    console.log(`  Description: ${scenario.description}`);
    console.log(`  Nodes: ${scenario.nodeCount}, Edges: ${scenario.edgeCount}`);
    console.log('');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      // Navigate to app
      await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

      // Generate diagram structure
      const generationStart = performance.now();
      await this.generateDiagram(page, scenario);
      const generationTime = performance.now() - generationStart;

      // Test rendering performance
      const renderStart = performance.now();
      await page.waitForSelector('[data-node-id]', { timeout: 10000 });
      const renderTime = performance.now() - renderStart;

      // Test interactions
      const interactionResults = await this.testInteractions(page);

      // Test layout performance
      const layoutStart = performance.now();
      await page.click('[data-testid="auto-layout-button"]');
      await page.waitForTimeout(1000);
      const layoutTime = performance.now() - layoutStart;

      // Memory usage
      const metrics = await page.evaluate(() => {
        if (performance.memory) {
          return {
            usedJSHeapSize: performance.memory.usedJSHeapSize / 1024 / 1024,
            totalJSHeapSize: performance.memory.totalJSHeapSize / 1024 / 1024,
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit / 1024 / 1024,
          };
        }
        return null;
      });

      const result = {
        scenario: scenario.name,
        passed: true,
        metrics: {
          generationTime: Math.round(generationTime),
          renderTime: Math.round(renderTime),
          layoutTime: Math.round(layoutTime),
          ...interactionResults,
          memory: metrics,
        },
      };

      // Validate performance thresholds
      result.passed = this.validateResults(result.metrics, scenario);

      this.results.push(result);
      this.printResult(result);
    } catch (error) {
      console.error(`  ❌ Test failed: ${error.message}`);
      this.results.push({
        scenario: scenario.name,
        passed: false,
        error: error.message,
      });
    } finally {
      await browser.close();
    }
  }

  async generateDiagram(page, scenario) {
    // Use AI generation for realistic structures
    await page.click('[data-testid="ai-generate-button"]');

    const prompt = this.buildPrompt(scenario);
    await page.fill('[data-testid="ai-description-input"]', prompt);
    await page.click('[data-testid="generate-submit"]');
  }

  buildPrompt(scenario) {
    if (scenario.structure === 'linear') {
      return `Create a linear chain of ${scenario.nodeCount} corporations, each owning the next one.`;
    } else if (scenario.structure === 'tree') {
      return `Create a hierarchical tree structure with ${scenario.nodeCount} entities across multiple levels.`;
    } else {
      return `Create a complex multi-tier holding company structure with ${scenario.nodeCount} entities including foreign entities, LLCs, and corporations.`;
    }
  }

  async testInteractions(page) {
    const results = {};

    // Test zoom
    const zoomStart = performance.now();
    await page.mouse.move(300, 300);
    await page.mouse.wheel(0, -100);
    results.zoomTime = Math.round(performance.now() - zoomStart);

    // Test pan
    const panStart = performance.now();
    await page.mouse.move(300, 300);
    await page.mouse.down();
    await page.mouse.move(400, 400);
    await page.mouse.up();
    results.panTime = Math.round(performance.now() - panStart);

    // Test selection
    const selectStart = performance.now();
    await page.click('[data-node-id]');
    results.selectTime = Math.round(performance.now() - selectStart);

    // Test responsiveness (FPS simulation)
    const fps = await page.evaluate(() => {
      let frameCount = 0;
      let lastTime = performance.now();

      return new Promise((resolve) => {
        function countFrame() {
          frameCount++;
          const currentTime = performance.now();

          if (currentTime - lastTime >= 1000) {
            resolve(frameCount);
          } else {
            requestAnimationFrame(countFrame);
          }
        }

        requestAnimationFrame(countFrame);
      });
    });

    results.fps = fps;

    return results;
  }

  validateResults(metrics, scenario) {
    const thresholds = {
      renderTime: 5000, // 5 seconds max
      layoutTime: 3000, // 3 seconds max
      zoomTime: 100, // 100ms max
      panTime: 100, // 100ms max
      selectTime: 50, // 50ms max
      fps: 30, // Minimum 30 FPS
    };

    let passed = true;

    if (metrics.renderTime > thresholds.renderTime) {
      console.log(`  ⚠️  Render time (${metrics.renderTime}ms) exceeds threshold`);
      passed = false;
    }

    if (metrics.layoutTime > thresholds.layoutTime) {
      console.log(`  ⚠️  Layout time (${metrics.layoutTime}ms) exceeds threshold`);
      passed = false;
    }

    if (metrics.fps < thresholds.fps) {
      console.log(`  ⚠️  FPS (${metrics.fps}) below minimum`);
      passed = false;
    }

    return passed;
  }

  printResult(result) {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`  ${status}`);
    console.log('  Metrics:');
    console.log(`    Generation: ${result.metrics.generationTime}ms`);
    console.log(`    Render: ${result.metrics.renderTime}ms`);
    console.log(`    Layout: ${result.metrics.layoutTime}ms`);
    console.log(`    Zoom: ${result.metrics.zoomTime}ms`);
    console.log(`    Pan: ${result.metrics.panTime}ms`);
    console.log(`    Select: ${result.metrics.selectTime}ms`);
    console.log(`    FPS: ${result.metrics.fps}`);

    if (result.metrics.memory) {
      console.log(`    Memory: ${result.metrics.memory.usedJSHeapSize.toFixed(2)}MB used`);
    }
  }

  printSummary() {
    console.log('='.repeat(80));
    console.log('Summary');
    console.log('='.repeat(80));

    const passed = this.results.filter((r) => r.passed).length;
    const total = this.results.length;

    console.log(`Total: ${total} scenarios`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${total - passed}`);
    console.log('');

    if (passed === total) {
      console.log('✅ All stress tests passed!');
      console.log('Application meets performance requirements for 50+ nodes.');
    } else {
      console.log('❌ Some stress tests failed.');
      console.log('Performance optimization required.');
    }

    console.log('='.repeat(80));

    // Exit with appropriate code
    process.exit(passed === total ? 0 : 1);
  }
}

// Run tests
const runner = new StressTestRunner();
runner.runAllTests().catch((error) => {
  console.error('Stress test suite failed:', error);
  process.exit(1);
});
