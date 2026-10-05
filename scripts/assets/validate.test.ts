import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, expect, test } from 'vitest'

import type { Manifest } from '../../src/utils/types.js'
import type { SpriteTask } from './catalog.js'
import { validateCatalog } from './validate.js'

const TONES = ['', '_s2', '_s3', '_s4', '_s5', '_s6']

const context = { cacheDirectory: '' }

beforeEach(async () => {
  context.cacheDirectory = await mkdtemp(path.join(tmpdir(), 'validate-test-'))
})
afterEach(async () => {
  await rm(context.cacheDirectory, { recursive: true, force: true })
})

const createManifest = (
  overrides: { fps?: number; framesCount?: number; diverse?: boolean } = {},
): Manifest => ({
  categories: [
    {
      id: 'c',
      title: 'Cat',
      emoticons: [
        {
          id: 'e1',
          description: 'E',
          shortcuts: [],
          unicode: 'x',
          etag: 'a',
          diverse: overrides.diverse ?? false,
          animation: {
            fps: overrides.fps ?? 24,
            framesCount: overrides.framesCount ?? 40,
            firstFrame: 1,
          },
          keywords: [],
        },
      ],
    },
  ] as unknown as Manifest['categories'],
})

const createTasks = (suffixes: readonly string[]): SpriteTask[] =>
  suffixes.map((toneSuffix) => ({
    source: 'teams',
    id: 'e1',
    category: 'Cat',
    toneSuffix,
    etag: 'a',
    outputPath: `sprites/Cat/e1${toneSuffix}.png`,
  }))

const writeSprites = async (tasks: readonly SpriteTask[]): Promise<void> => {
  for (const task of tasks) {
    const target = path.join(context.cacheDirectory, task.outputPath)
    await mkdir(path.dirname(target), { recursive: true })
    await writeFile(target, 'png')
  }
}

test('passes a complete catalog', async () => {
  const tasks = createTasks(TONES)
  await writeSprites(tasks)
  await expect(
    validateCatalog({
      manifest: createManifest({ diverse: true }),
      tasks,
      cacheDirectory: context.cacheDirectory,
    }),
  ).resolves.toBeUndefined()
})

test('rejects zero frames and zero fps', async () => {
  const tasks = createTasks([''])
  await writeSprites(tasks)
  const input = { tasks, cacheDirectory: context.cacheDirectory }
  await expect(
    validateCatalog({ ...input, manifest: createManifest({ framesCount: 0 }) }),
  ).rejects.toThrow('e1: invalid animation')
  await expect(
    validateCatalog({ ...input, manifest: createManifest({ fps: 0 }) }),
  ).rejects.toThrow('e1: invalid animation')
})

test('rejects a planned sprite missing from the cache', async () => {
  await expect(
    validateCatalog({
      manifest: createManifest(),
      tasks: createTasks(['']),
      cacheDirectory: context.cacheDirectory,
    }),
  ).rejects.toThrow('missing sprite sprites/Cat/e1.png')
})

test('rejects a diverse emoji lacking tone sprites', async () => {
  const tasks = createTasks(['', '_s2', '_s3'])
  await writeSprites(tasks)
  await expect(
    validateCatalog({
      manifest: createManifest({ diverse: true }),
      tasks,
      cacheDirectory: context.cacheDirectory,
    }),
  ).rejects.toThrow(/missing tone sprite _s4[\s\S]*_s5[\s\S]*_s6/)
})

test('lists every problem in one error', async () => {
  await expect(
    validateCatalog({
      manifest: createManifest({ framesCount: 0, diverse: true }),
      tasks: createTasks(['']),
      cacheDirectory: context.cacheDirectory,
    }),
  ).rejects.toThrow(/7 problem\(s\)/)
})
