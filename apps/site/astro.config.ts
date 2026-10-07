import react from '@astrojs/react'
import starlight from '@astrojs/starlight'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
import starlightLlmsTxt from 'starlight-llms-txt'

import { docSlug, PUBLISHED_DOCS } from './src/docs/published'
import {
  LOCALE_NAMES,
  LOCALES,
  localeSegment,
  SITE_ORIGIN,
  type Locale,
} from './src/i18n/locales'
import { getUi } from './src/i18n/ui'
import { THEME_INIT_HASH } from './src/scripts/theme-init'
import { REPOSITORY_URL } from './src/site-links'

const CDN_ORIGIN = 'https://animated-fluent-emojis-cdn.andryore.dev'
const FILES_ORIGIN = 'https://animated-fluent-emojis-files.andryore.dev'

/**
 * Hashes of the inline scripts Starlight ships in its sidebar, mobile menu and
 * theme picker components, which Astro does not hash into the policy itself.
 * `src/seo/distribution-audit.ts` fails the build-output test when a Starlight upgrade
 * changes one of them.
 */
const STARLIGHT_INLINE_SCRIPT_HASHES = [
  'sha256-f/zAUE74ucc3JYp4r4QQvkJofoQdkOIhHYK+jeZ6eko=',
  'sha256-wX2yOADeV+NMngflD5uYi3vl50SHC4sfM1EmylVjlX4=',
  'sha256-7eCV4jtsr4t4knb3c4FCRPeu7GGZeOUGE3XvWix0XOQ=',
] as const

function localized(pick: (locale: Locale) => string): Record<string, string> {
  return Object.fromEntries(
    LOCALES.map((locale) => [localeSegment(locale), pick(locale)]),
  )
}

const starlightLocales = Object.fromEntries(
  LOCALES.map((locale) => [
    locale === 'en' ? 'root' : localeSegment(locale),
    { label: LOCALE_NAMES[locale], lang: locale },
  ]),
)

const { meta } = getUi('en')

const howToItems = PUBLISHED_DOCS.filter((docPath) =>
  docPath.startsWith('how-to/'),
).map((docPath) => ({ slug: docSlug(docPath) }))

export default defineConfig({
  site: SITE_ORIGIN,
  trailingSlash: 'always',
  security: {
    csp: {
      scriptDirective: {
        resources: ["'self'", "'wasm-unsafe-eval'"],
        hashes: [THEME_INIT_HASH, ...STARLIGHT_INLINE_SCRIPT_HASHES],
      },
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
  integrations: [
    react(),
    starlight({
      title: meta.siteName,
      description: meta.description,
      disable404Route: true,
      defaultLocale: 'root',
      locales: starlightLocales,
      customCss: ['./src/styles/docs.css'],
      editLink: { baseUrl: `${REPOSITORY_URL}/edit/main/` },
      lastUpdated: false,
      favicon: '/favicon.svg',
      head: [
        {
          tag: 'link',
          attrs: { rel: 'icon', href: '/favicon.ico', sizes: '32x32' },
        },
        {
          tag: 'link',
          attrs: { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        },
      ],
      components: {
        Header: './src/docs/components/DocumentationHeader.astro',
        PageTitle: './src/docs/components/DocumentationPageTitle.astro',
        ThemeProvider: './src/docs/components/DocumentationThemeProvider.astro',
        ThemeSelect: './src/docs/components/DocumentationThemeSelect.astro',
      },
      sidebar: [
        { slug: docSlug('usage.md') },
        { slug: docSlug('troubleshooting.md') },
        {
          label: getUi('en').docs.howToGroup,
          translations: localized((locale) => getUi(locale).docs.howToGroup),
          items: howToItems,
        },
      ],
      plugins: [
        starlightLlmsTxt({
          projectName: meta.siteName,
          description: meta.description,
        }),
      ],
    }),
  ],
  vite: { plugins: [tailwindcss()] },
})
