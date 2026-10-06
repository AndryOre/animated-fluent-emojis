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
  'apps/site/src/pages/index.astro':
    'Placeholder landing page that renders one emoji through the library Astro adapter, with no logic to test.',
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
