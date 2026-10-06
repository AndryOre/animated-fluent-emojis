import { svelte } from '@sveltejs/vite-plugin-svelte'
import react from '@vitejs/plugin-react-swc'
import { playwright } from '@vitest/browser-playwright'
import { getViteConfig } from 'astro/config'
import { msw } from 'msw/vite'
import { defineConfig } from 'vitest/config'

const astroProject = await getViteConfig({
  test: {
    name: 'astro',
    environment: 'node',
    include: ['src/astro/Emoji.test.ts'],
  },
})({ command: 'serve', mode: 'test' })

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: [
        'src/**/*.{ts,tsx,svelte}',
        'scripts/**/*.ts',
        'eslint-rules/**/*.mjs',
        'docs/brand/tools/**/*.mjs',
      ],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/test/**',
        'src/**/*.d.ts',
        'scripts/**/*.test.ts',
        'scripts/assets/test-support.ts',
        'eslint-rules/**/*.test.ts',
        'docs/brand/tools/**/*.test.ts',
        'docs/brand/tools/export.mjs',
        'src/utils/types.ts',
        'src/utils/emoji-id.generated.ts',
      ],
      reporter: ['text', 'lcov'],
      thresholds: { lines: 95, functions: 95, branches: 90, statements: 95 },
    },
    projects: [
      {
        extends: true,
        plugins: [
          react(),
          svelte({ compilerOptions: { hmr: false } }),
          msw({ mode: 'worker-only' }),
        ],
        optimizeDeps: { include: ['svelte'] },
        test: {
          name: 'browser',
          include: [
            'src/components/**/*.test.tsx',
            'src/hooks/**/*.test.{ts,tsx}',
            'src/react/**/*.test.{ts,tsx}',
            'src/vanilla/**/*.test.ts',
            'src/element/**/*.test.ts',
            'src/vue/**/*.test.ts',
            'src/astro/client.test.ts',
            'src/test/conformance/**/*.test.{ts,tsx}',
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
        plugins: [svelte()],
        test: {
          name: 'node',
          environment: 'node',
          exclude: ['src/test/conformance/**'],
          include: [
            'src/core/**/*.test.ts',
            'src/utils/**/*.test.ts',
            'src/lookup/**/*.test.ts',
            'src/astro/{markup,server}.test.ts',
            'src/test/**/*.test.ts',
            'eslint-rules/**/*.test.ts',
            'docs/adr/**/*.test.ts',
            'scripts/**/*.test.ts',
            'docs/brand/tools/**/*.test.ts',
          ],
        },
      },
      astroProject,
    ],
  },
})
