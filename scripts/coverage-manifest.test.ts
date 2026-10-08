import { readdirSync } from 'node:fs'
import path from 'node:path'
import { expect, test } from 'vitest'

const REPOSITORY_ROOT = path.resolve(import.meta.dirname, '..')

const SOURCE_ROOTS = [
  'packages/animated-fluent-emojis/src',
  'apps/assets',
  'apps/site/src',
  'scripts',
  'eslint-rules',
  'docs/brand/tools',
] as const

const ASTRO_PAGE_REASON =
  'Astro route that only picks a locale and renders a shared component, verified through the site build output.'
const ASTRO_PRESENTATION_REASON =
  'Presentational Astro component with no logic of its own; its inputs are tested in apps/site/src/i18n.'

const GALLERY_ISLAND_REASON =
  'Gallery React island with browser-only behavior, exercised in a real browser; its filtering, URL state, search and snippets are tested in apps/site/src/gallery.'

const EXEMPTIONS: Readonly<Record<string, string>> = {
  'packages/animated-fluent-emojis/src/index.ts':
    'Public barrel that only re-exports createEmoji, configureEmojis, preloadEmojis and the public types, covered by root-exports.test.ts.',
  'packages/animated-fluent-emojis/src/hooks/index.ts':
    'Barrel re-exporting hooks that have their own tests.',
  'packages/animated-fluent-emojis/src/utils/index.ts':
    'Barrel re-exporting utils, covered by emoji-manifest.test.ts.',
  'packages/animated-fluent-emojis/src/utils/is-development.ts':
    'Covered through the development warnings in emoji-manifest.store.test.ts and Emoji.correctness.test.tsx.',
  'packages/animated-fluent-emojis/src/element/index.ts':
    'Entry that registers the element and re-exports its types, covered by fluent-emoji.test.ts.',
  'packages/animated-fluent-emojis/src/element/types.ts':
    'Type-only module with global and framework typings, checked by element.types.test.ts.',
  'packages/animated-fluent-emojis/src/vue/index.ts':
    'Entry that re-exports the Vue Emoji and its types, covered by emoji.test.ts and the Vue conformance suite.',
  'packages/animated-fluent-emojis/src/svelte/index.ts':
    'Entry that re-exports the Svelte Emoji and its types, covered by svelte.conformance.test.ts and svelte.adapter.test.ts.',
  'packages/animated-fluent-emojis/src/svelte/runtime.ts':
    'Re-export seam between the shipped Svelte source and the shared chunks, covered by svelte.conformance.test.ts.',
  'packages/animated-fluent-emojis/src/svelte/Emoji.d.svelte.ts':
    'Declaration file for the shipped Emoji.svelte, with no runtime behavior to test.',
  'packages/animated-fluent-emojis/src/svelte/types.ts':
    'Type-only module with the Svelte Emoji props, no runtime behavior to test.',
  'packages/animated-fluent-emojis/src/astro/index.ts':
    'Type-only declaration of the .astro component, checked by the container render test in Emoji.test.ts.',
  'packages/animated-fluent-emojis/src/astro/types.ts':
    'Type-only module with no runtime behavior to test.',
  'packages/animated-fluent-emojis/src/react/types.ts':
    'Type-only module with the React Emoji props, no runtime behavior to test.',
  'packages/animated-fluent-emojis/src/utils/types.ts':
    'Type-only module with no runtime behavior to test.',
  'packages/animated-fluent-emojis/src/utils/emoji-id.generated.ts':
    'Generated type-only union, produced and tested by apps/assets.',
  'packages/animated-fluent-emojis/src/svelte/Emoji.svelte':
    'Svelte component exercised end to end by svelte.conformance.test.ts and svelte.adapter.test.ts.',
  'packages/animated-fluent-emojis/src/svelte/FallbackHost.svelte':
    'Passthrough host mounted by Emoji.svelte for the fallback snippet and exercised by the fallback case in packages/animated-fluent-emojis/src/test/conformance/svelte.adapter.test.ts; v8 reports it at 0% because the template has no mapped statements.',
  'apps/assets/build-context.ts':
    'Shared build context and constants consumed by build.ts, covered by build.test.ts and build-branches.test.ts.',
  'apps/assets/known-teams-versions.ts':
    'Constants-only list of Teams hashes, consumed and checked by teams.test.ts.',
  'apps/assets/test-support.ts':
    'Test-support helpers shared by the apps/assets tests, with no behavior of their own.',
  'apps/assets/vitest.config.ts':
    'Vitest configuration for the pipeline workspace, with no behavior to test.',
  'apps/site/src/pages/index.astro': ASTRO_PAGE_REASON,
  'apps/site/src/pages/404.astro': ASTRO_PAGE_REASON,
  'apps/site/src/pages/[locale]/index.astro': ASTRO_PAGE_REASON,
  'apps/site/src/pages/[locale]/404.astro': ASTRO_PAGE_REASON,
  'apps/site/src/components/Footer.astro': ASTRO_PRESENTATION_REASON,
  'apps/site/src/components/Header.astro': ASTRO_PRESENTATION_REASON,
  'apps/site/src/components/HomePage.astro': ASTRO_PRESENTATION_REASON,
  'apps/site/src/components/HeaderMenus.tsx':
    'Header menu React island with no logic of its own, exercised in a real browser by the accessibility and mobile-overflow e2e specs.',
  'apps/site/src/components/ui/input.tsx':
    'Styled wrapper over the Base UI input, exercised in a real browser through the gallery search.',
  'apps/site/src/components/ui/sheet.tsx':
    'Styled wrapper over the Base UI dialog, exercised in a real browser through the gallery mobile sheet.',
  'apps/site/src/components/ui/tabs.tsx':
    'Styled wrapper over the Base UI tabs, covered by EmojiDetail.test.tsx and the gallery e2e spec.',
  'apps/site/src/components/ui/accordion.tsx':
    'Styled wrapper over the Base UI accordion, exercised in a real browser through the landing FAQ.',
  'apps/site/src/home/FaqAccordion.tsx':
    'FAQ React island with no logic of its own, exercised in a real browser by the accessibility e2e spec.',
  'apps/site/src/home/SnippetTabs.tsx':
    'Snippet tabs React island that wires Base UI tabs to the copy helper, which is tested in copy-feedback.test.ts.',
  'apps/site/src/home/DemoPlayground.tsx':
    'React island that wires the demo toggles to the library Emoji; its option-to-props mapping is tested in demo.test.ts.',
  'apps/site/src/components/NotFoundPage.astro': ASTRO_PRESENTATION_REASON,
  'apps/site/src/components/ThemeToggle.astro':
    'Presentational Astro component plus a small DOM script; the pure init logic is tested in theme-init.test.ts.',
  'apps/site/src/layouts/Layout.astro': ASTRO_PRESENTATION_REASON,
  'apps/site/src/pages/robots.txt.ts':
    'Thin endpoint that feeds contributions to buildRobotsTxt, tested in seo/robots.test.ts.',
  'apps/site/src/pages/sitemap.xml.ts':
    'Thin endpoint that feeds route sources to buildSitemapXml, tested in seo/sitemap.test.ts.',
  'apps/site/src/scripts/theme-keys.ts':
    'Constants-only module shared by the init script and the toggle, exercised by theme-init.test.ts.',
  'apps/site/src/gallery/index.ts':
    'Barrel that only re-exports the gallery data API, each module tested in its own colocated test.',
  'apps/site/src/site-links.ts':
    'Constants-only list of external URLs, with no behavior to test.',
  'apps/site/src/content.config.ts':
    'Astro content collection wiring, verified through the site build output.',
  'apps/site/src/docs/loader.ts':
    'Astro content loader that feeds loadCatalog into the store, verified through the site build output; the catalog itself is tested in catalog.test.ts.',
  'apps/site/src/docs/paths.ts':
    'Constants-only module with the docs and translations directories.',
  'apps/site/src/docs/i18n-status.ts':
    'CLI entry that prints formatStatusReport, tested through status and catalog in catalog.test.ts.',
  'apps/site/src/docs/published.ts':
    'Allowlist and route helpers, exercised by links.test.ts.',
  'apps/site/src/docs/status.ts':
    'Report formatter, exercised by catalog.test.ts.',
  'apps/site/src/docs/sitemap.ts':
    'Docs sitemap source, exercised through the registered sources in seo/sources.test.ts.',
  'apps/site/src/pages/[...slug].md.ts': ASTRO_PAGE_REASON,
  'apps/site/src/pages/emojis/index.astro': ASTRO_PAGE_REASON,
  'apps/site/src/pages/[locale]/emojis/index.astro': ASTRO_PAGE_REASON,
  'apps/site/src/pages/search-index/[locale].json.ts':
    'Thin endpoint that feeds buildSearchIndex, tested in gallery/search.test.ts.',
  'apps/site/src/components/GalleryPage.astro': ASTRO_PRESENTATION_REASON,
  'apps/site/src/components/gallery/Gallery.tsx': GALLERY_ISLAND_REASON,
  'apps/site/src/components/gallery/EmojiPageDetail.tsx':
    'Emoji page island that wires tone chips and the query string around EmojiDetail, whose tone behavior is tested in EmojiDetail.test.tsx.',
  'apps/site/src/components/EmojiPage.astro': ASTRO_PRESENTATION_REASON,
  'apps/site/src/pages/emojis/[slug].astro': ASTRO_PAGE_REASON,
  'apps/site/src/pages/[locale]/emojis/[slug].astro': ASTRO_PAGE_REASON,
  'apps/site/src/pages/og/[slug].png.ts':
    'Thin endpoint that feeds composeOgImage, tested in emoji-pages/og-image.test.ts and the emoji-pages build-output test.',
  'apps/site/src/emoji-pages/data.ts':
    'Memoized join of the public index and annotations, both tested in gallery/, and exercised by the emoji-pages build-output test.',
  'apps/site/src/components/gallery/ChipGroup.tsx': GALLERY_ISLAND_REASON,
  'apps/site/src/components/gallery/use-gallery-data.ts': GALLERY_ISLAND_REASON,
  'apps/site/src/docs/components/DocumentationHeader.astro':
    ASTRO_PRESENTATION_REASON,
  'apps/site/src/docs/components/DocumentationPageTitle.astro':
    'Starlight override rendering the translation notice and the copy button, verified through the site build output.',
  'apps/site/src/docs/components/DocumentationThemeProvider.astro':
    ASTRO_PRESENTATION_REASON,
  'apps/site/src/docs/components/DocumentationThemeSelect.astro':
    'Starlight override that renders nothing, so the docs use the site theme toggle only; the accessibility spec covers the docs pages.',
  ...Object.fromEntries(
    ['en', 'es', 'de', 'fr', 'it', 'ja', 'ko', 'pt-br', 'ru', 'zh-cn'].map(
      (locale) => [
        `apps/site/src/i18n/ui/${locale}.ts`,
        'Data-only UI string file, checked for key parity by i18n/ui.test.ts.',
      ],
    ),
  ),
  'scripts/workflow-files.ts':
    'Workflow loader used by workflows-invariants.test.ts, which exercises it against the real workflows.',
  'docs/brand/tools/export.mjs':
    'Brand raster export CLI that needs a real browser and writes the committed rasters, excluded from coverage; its pure logic lives in brand-export-spec.mjs.',
}

const exemptedFiles = new Set(Object.keys(EXEMPTIONS))

const isTestFile = (file: string) => /\.test\.(tsx?|mjs)$/.test(file)
const isSourceModule = (file: string) =>
  /\.(tsx?|mjs|svelte|astro)$/.test(file) &&
  !/\.d\.m?ts$/.test(file) &&
  !isTestFile(file)

const isIgnoredDirectory = (root: string, absolute: string, name: string) =>
  name === 'node_modules' ||
  (root === 'packages/animated-fluent-emojis/src' &&
    absolute === path.join(REPOSITORY_ROOT, root, 'test'))

const listFiles = (root: string, directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      return isIgnoredDirectory(root, absolute, entry.name)
        ? []
        : listFiles(root, absolute)
    }
    return absolute
  })

const allFiles = SOURCE_ROOTS.flatMap((root) =>
  listFiles(root, path.join(REPOSITORY_ROOT, root)),
).map((file) => path.relative(REPOSITORY_ROOT, file).split(path.sep).join('/'))

const modules = allFiles.filter((file) => isSourceModule(file))
const testFiles = new Set(allFiles.filter((file) => isTestFile(file)))

const hasColocatedTest = (file: string) => {
  const base = file.replace(/\.(tsx?|mjs|svelte|astro)$/, '')
  return ['ts', 'tsx'].some((extension) =>
    testFiles.has(`${base}.test.${extension}`),
  )
}

test('every module has a colocated test or a written exemption', () => {
  const uncovered = modules.filter(
    (file) => !hasColocatedTest(file) && !exemptedFiles.has(file),
  )

  expect(uncovered).toEqual([])
})

test('exemptions are justified and not stale', () => {
  const stale = Object.entries(EXEMPTIONS)
    .filter(
      ([file, reason]) =>
        !modules.includes(file) ||
        hasColocatedTest(file) ||
        reason.trim() === '',
    )
    .map(([file]) => file)

  expect(stale).toEqual([])
})
