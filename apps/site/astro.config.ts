import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'

import { THEME_INIT_HASH } from './src/scripts/theme-init'

const CDN_ORIGIN = 'https://animated-fluent-emojis-cdn.andryore.dev'
const FILES_ORIGIN = 'https://animated-fluent-emojis-files.andryore.dev'

export default defineConfig({
  site: 'https://animated-fluent-emojis.andryore.dev',
  trailingSlash: 'always',
  security: {
    csp: {
      scriptDirective: { hashes: [THEME_INIT_HASH] },
      styleDirective: { resources: ["'self'", "'unsafe-inline'"] },
      directives: [
        "default-src 'none'",
        `img-src 'self' data: ${CDN_ORIGIN} ${FILES_ORIGIN}`,
        "font-src 'self'",
        `connect-src 'self' ${CDN_ORIGIN} ${FILES_ORIGIN}`,
        "manifest-src 'self'",
        "base-uri 'none'",
        "form-action 'none'",
      ],
    },
  },
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
})
