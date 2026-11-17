import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    include: ['tests/**/*.test.js'],
    reporters: 'verbose',
    coverage: {
      provider: 'v8',
      include: ['works-wheel.js'],
      reporter: ['text', 'json-summary'],
    },
  },
});
