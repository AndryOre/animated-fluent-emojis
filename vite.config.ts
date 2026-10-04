import path from 'node:path'
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

const rootDirectory = import.meta.dirname

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(rootDirectory, 'src/index.ts'),
      formats: ['es'],
      fileName: 'animated-fluent-emojis',
      cssFileName: 'style',
    },
    rolldownOptions: {
      external: ['react', 'react-dom', /^react\//, /^react-dom\//],
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
