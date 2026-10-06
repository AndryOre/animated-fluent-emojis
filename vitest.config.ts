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
        'eslint-rules/**/*.test.ts',
        'docs/brand/tools/**/*.test.ts',
        'docs/brand/tools/export.mjs',
      ],
      reporter: ['text', 'lcov'],
      thresholds: { lines: 94, functions: 95, branches: 87, statements: 94 },
    },
  },
})
