import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'

import { THEME_INIT_HASH } from './src/scripts/theme-init'

export default defineConfig({
  site: 'https://animated-fluent-emojis.andryore.dev',
  trailingSlash: 'always',
  security: {
    csp: {
      scriptDirective: { hashes: [THEME_INIT_HASH] },
    },
  },
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
})
