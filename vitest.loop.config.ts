import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@project/money': resolve(root, 'packages/money/src/index.ts'),
    },
  },
  test: {
    environment: 'node',
    testTimeout: 10_000,
    hookTimeout: 10_000,
    retries: 0,
    include: ['tests/unit/**/*.test.ts', 'tests/property/**/*.test.ts'],
    reporters: ['verbose'],
  },
});
