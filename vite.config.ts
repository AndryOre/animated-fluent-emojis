import path from 'node:path'
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

const rootDirectory = import.meta.dirname

export default defineConfig({
  build: {
    lib: {
      entry: {
        'animated-fluent-emojis': path.resolve(rootDirectory, 'src/index.ts'),
        react: path.resolve(rootDirectory, 'src/react/index.ts'),
        lookup: path.resolve(rootDirectory, 'src/lookup/index.ts'),
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
    dts({
      include: ['src'],
      tsconfigPath: './tsconfig.build.json',
    }),
  ],
})
