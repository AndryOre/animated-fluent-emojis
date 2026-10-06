import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: [
      'scripts/**/*.test.ts',
      'eslint-rules/**/*.test.ts',
      'docs/adr/**/*.test.ts',
      'docs/brand/tools/**/*.test.ts',
    ],
    coverage: {
      provider: 'v8',
      include: [
        'scripts/**/*.ts',
        'eslint-rules/**/*.mjs',
        'docs/brand/tools/**/*.mjs',
      ],
      exclude: [
        'scripts/**/*.test.ts',
        'scripts/assets/test-support.ts',
        'eslint-rules/**/*.test.ts',
        'docs/brand/tools/**/*.test.ts',
        'docs/brand/tools/export.mjs',
      ],
      reporter: ['text', 'lcov'],
      thresholds: { lines: 95, functions: 95, branches: 89, statements: 95 },
    },
  },
})
