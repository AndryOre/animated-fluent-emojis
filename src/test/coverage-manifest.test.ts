import { readdirSync } from 'node:fs'
import path from 'node:path'
import { expect, test } from 'vitest'

const REPOSITORY_ROOT = path.resolve(import.meta.dirname, '../..')

const SOURCE_ROOTS = [
  'src',
  'scripts',
  'eslint-rules',
  'docs/brand/tools',
] as const

const EXEMPTIONS: Readonly<Record<string, string>> = {
  'src/index.ts':
    'Public barrel that only re-exports Emoji, configureEmojis, preloadEmojis and the public types, covered by Emoji.test.tsx.',
  'src/hooks/index.ts': 'Barrel re-exporting hooks that have their own tests.',
  'src/utils/index.ts':
    'Barrel re-exporting utils, covered by emoji-manifest.test.ts.',
  'src/utils/is-development.ts':
    'Covered through the development warnings in emoji-manifest.store.test.ts and Emoji.correctness.test.tsx.',
  'src/element/index.ts':
    'Entry that registers the element and re-exports its types, covered by fluent-emoji.test.ts.',
  'src/element/types.ts':
    'Type-only module with global and framework typings, checked by element.types.test.ts.',
  'src/vue/index.ts':
    'Entry that re-exports the Vue Emoji and its types, covered by emoji.test.ts and the Vue conformance suite.',
  'src/svelte/index.ts':
    'Entry that re-exports the Svelte Emoji and its types, covered by svelte.conformance.test.ts and svelte.adapter.test.ts.',
  'src/svelte/runtime.ts':
    'Re-export seam between the shipped Svelte source and the shared chunks, covered by svelte.conformance.test.ts.',
  'src/svelte/Emoji.d.svelte.ts':
    'Declaration file for the shipped Emoji.svelte, with no runtime behavior to test.',
  'src/svelte/types.ts':
    'Type-only module with the Svelte Emoji props, no runtime behavior to test.',
  'src/astro/index.ts':
    'Type-only declaration of the .astro component, checked by the container render test in Emoji.test.ts.',
  'src/astro/types.ts': 'Type-only module with no runtime behavior to test.',
  'src/react/types.ts':
    'Type-only module with the React Emoji props, no runtime behavior to test.',
  'src/utils/types.ts': 'Type-only module with no runtime behavior to test.',
  'src/utils/emoji-id.generated.ts':
    'Generated type-only union, produced and tested by scripts/assets.',
  'src/svelte/Emoji.svelte':
    'Svelte component exercised end to end by svelte.conformance.test.ts and svelte.adapter.test.ts.',
  'src/svelte/FallbackHost.svelte':
    'Passthrough host mounted by Emoji.svelte for the fallback snippet and exercised by the fallback case in src/test/conformance/svelte.adapter.test.ts; v8 reports it at 0% because the template has no mapped statements.',
  'scripts/assets/build-context.ts':
    'Shared build context and constants consumed by build.ts, covered by build.test.ts and build-branches.test.ts.',
  'scripts/assets/known-teams-versions.ts':
    'Constants-only list of Teams hashes, consumed and checked by teams.test.ts.',
  'scripts/assets/test-support.ts':
    'Test-support helpers shared by the scripts/assets tests, with no behavior of their own.',
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
  (root === 'src' && absolute === path.join(REPOSITORY_ROOT, 'src', 'test'))

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
