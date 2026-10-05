import { readdirSync } from 'node:fs'
import path from 'node:path'
import { expect, test } from 'vitest'

const SOURCE_ROOT = path.resolve(import.meta.dirname, '..')

const EXEMPTIONS: Readonly<Record<string, string>> = {
  'index.ts':
    'Public barrel that only re-exports Emoji, configureEmojis, preloadEmojis and the public types, covered by Emoji.test.tsx.',
  'hooks/index.ts': 'Barrel re-exporting hooks that have their own tests.',
  'utils/index.ts':
    'Barrel re-exporting utils, covered by emoji-manifest.test.ts.',
  'utils/is-development.ts':
    'Covered through the development warnings in emoji-manifest.store.test.ts and Emoji.correctness.test.tsx.',
  'utils/types.ts': 'Type-only module with no runtime behavior to test.',
  'utils/emoji-id.generated.ts':
    'Generated type-only union, produced and tested by scripts/assets.',
}

const exemptedFiles = new Set(Object.keys(EXEMPTIONS))

const isTestFile = (file: string) => /\.test\.tsx?$/.test(file)
const isSourceModule = (file: string) =>
  /\.tsx?$/.test(file) && !file.endsWith('.d.ts') && !isTestFile(file)

const listFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      return entry.name === 'test' ? [] : listFiles(absolute)
    }
    return absolute
  })

const allFiles = listFiles(SOURCE_ROOT).map((file) =>
  path.relative(SOURCE_ROOT, file).split(path.sep).join('/'),
)

const modules = allFiles.filter((file) => isSourceModule(file))
const testFiles = new Set(allFiles.filter((file) => isTestFile(file)))

const hasColocatedTest = (file: string) => {
  const base = file.replace(/\.tsx?$/, '')
  return testFiles.has(`${base}.test.ts`) || testFiles.has(`${base}.test.tsx`)
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
