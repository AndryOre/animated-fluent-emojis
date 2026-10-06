import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import react from '@vitejs/plugin-react-swc'
import { defineConfig, type Plugin } from 'vite'
import dts from 'vite-plugin-dts'

const rootDirectory = import.meta.dirname

const SVELTE_SOURCE_FILES = [
  'Emoji.svelte',
  'Emoji.d.svelte.ts',
  'FallbackHost.svelte',
] as const

const SVELTE_ENTRY = `export { default as Emoji } from './Emoji.svelte'\n`

const shipSvelteSource = (): Plugin => ({
  name: 'ship-svelte-source',
  apply: 'build',
  closeBundle: () => {
    const outputDirectory = path.resolve(rootDirectory, 'dist/svelte')
    mkdirSync(outputDirectory, { recursive: true })
    for (const file of SVELTE_SOURCE_FILES) {
      copyFileSync(
        path.resolve(rootDirectory, 'src/svelte', file),
        path.resolve(outputDirectory, file),
      )
    }
    writeFileSync(path.resolve(outputDirectory, 'index.js'), SVELTE_ENTRY)
  },
})

export default defineConfig({
  build: {
    lib: {
      entry: {
        'animated-fluent-emojis': path.resolve(rootDirectory, 'src/index.ts'),
        react: path.resolve(rootDirectory, 'src/react/index.ts'),
        element: path.resolve(rootDirectory, 'src/element/index.ts'),
        lookup: path.resolve(rootDirectory, 'src/lookup/index.ts'),
        'svelte/runtime': path.resolve(rootDirectory, 'src/svelte/runtime.ts'),
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
      cssFileName: 'style',
    },
    rolldownOptions: {
      external: ['react', 'react-dom', /^react\//, /^react-dom\//],
      output: {
        chunkFileNames: 'chunks/[name]-[hash].js',
        advancedChunks: {
          groups: [
            { name: 'manifest', test: /src[\\/]utils[\\/]emoji-manifest/ },
          ],
        },
        banner: (chunk) =>
          chunk.name === 'animated-fluent-emojis' || chunk.name === 'react'
            ? '"use client";'
            : '',
      },
    },
    sourcemap: true,
    emptyOutDir: true,
  },
  plugins: [
    react(),
    shipSvelteSource(),
    dts({
      include: ['src'],
      tsconfigPath: './tsconfig.build.json',
    }),
  ],
})
