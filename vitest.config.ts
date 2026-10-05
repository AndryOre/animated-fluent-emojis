import react from '@vitejs/plugin-react-swc'
import { playwright } from '@vitest/browser-playwright'
import { msw } from 'msw/vite'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/test/**',
        'src/**/*.d.ts',
        'src/utils/types.ts',
        'src/utils/emoji-id.generated.ts',
      ],
      reporter: ['text', 'lcov'],
      thresholds: { lines: 90, functions: 90, branches: 85, statements: 90 },
    },
    projects: [
      {
        extends: true,
        plugins: [react(), msw({ mode: 'worker-only' })],
        test: {
          name: 'browser',
          include: [
            'src/components/**/*.test.tsx',
            'src/hooks/**/*.test.{ts,tsx}',
          ],
          setupFiles: ['src/test/browser-setup.ts'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
      {
        extends: true,
        test: {
          name: 'node',
          environment: 'node',
          include: [
            'src/utils/**/*.test.ts',
            'src/lookup/**/*.test.ts',
            'src/test/**/*.test.ts',
            'eslint-rules/**/*.test.ts',
            'docs/adr/**/*.test.ts',
            'scripts/**/*.test.ts',
          ],
        },
      },
    ],
  },
})
