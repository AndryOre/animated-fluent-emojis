import { readFileSync } from 'node:fs'
import path from 'node:path'
import react from '@vitejs/plugin-react-swc'
import { defineConfig, type Plugin } from 'vite'
import dts from 'vite-plugin-dts'

const rootDirectory = import.meta.dirname

const ASTRO_RAW_FILES = ['Emoji.astro', 'emoji.css']

const copyAstroComponent = (): Plugin => ({
  name: 'copy-astro-component',
  generateBundle() {
    for (const fileName of ASTRO_RAW_FILES) {
      // eslint-disable-next-line unicorn/no-this-outside-of-class -- the bundler passes its plugin context as `this`
      this.emitFile({
        type: 'asset',
        fileName: `astro/${fileName}`,
        source: readFileSync(
          path.resolve(rootDirectory, 'src/astro', fileName),
          'utf8',
        ),
      })
    }
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
        'astro/client': path.resolve(rootDirectory, 'src/astro/client.ts'),
        'astro/server': path.resolve(rootDirectory, 'src/astro/server.ts'),
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
    copyAstroComponent(),
    dts({
      include: ['src'],
      tsconfigPath: './tsconfig.build.json',
    }),
  ],
})
