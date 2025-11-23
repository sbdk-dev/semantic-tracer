import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./lawdraw/tests/setup.ts'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      'lawdraw/tests/e2e/**',
      './archive/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        'lawdraw/tests/e2e',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'dist/',
      ],
      // Coverage thresholds per project requirements
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
    // Performance baseline for tests
    testTimeout: 10000,
    hookTimeout: 10000,
    // Parallel execution for speed
    threads: true,
    // Clear mocks between tests
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tests': path.resolve(__dirname, './lawdraw/tests'),
    },
  },
});
