import { mkdir, mkdtemp, rename, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, expect, test } from 'vitest'

import type { Manifest } from '../../src/utils/types.js'
import type { SpriteTask } from './catalog.js'
import {
  buildV1SpritePath,
  toV1Manifest,
  validateV1Layout,
} from './layout-v1.js'
import { createSpritePng } from './test-support.js'

const context = { outputDirectory: '' }

beforeEach(async () => {
  context.outputDirectory = await mkdtemp(path.join(tmpdir(), 'layout-v1-'))
})
afterEach(async () => {
  await rm(context.outputDirectory, { recursive: true, force: true })
})

const manifest = {
  categories: [
    {
      id: 'c',
      title: 'Cat',
      description: 'd',
      emoticons: [
        {
          id: 'e1',
          description: 'E',
          shortcuts: [],
          unicode: 'x',
          etag: 'abc',
          diverse: false,
          animation: { fps: 24, framesCount: 4, firstFrame: 1 },
          keywords: [],
        },
      ],
    },
  ],
} as unknown as Manifest

const tasks: SpriteTask[] = [
  {
    source: 'teams',
    id: 'e1',
    category: 'Cat',
    toneSuffix: '',
    etag: 'abc',
    outputPath: 'sprites/Cat/e1.png',
  },
]

const spritePath = 'v1/sprites/Cat/e1.abc.png'

const writeSite = async (): Promise<void> => {
  const root = context.outputDirectory
  await mkdir(path.join(root, 'v1/sprites/Cat'), { recursive: true })
  await writeFile(path.join(root, spritePath), await createSpritePng(4))
  await writeFile(
    path.join(root, 'v1/manifest.slim.json'),
    JSON.stringify(toV1Manifest(manifest)),
  )
  await writeFile(path.join(root, 'v1/version.json'), '{}')
}

const validate = () =>
  validateV1Layout({
    manifest,
    tasks,
    outputDirectory: context.outputDirectory,
  })

test('builds etag-named sprite paths', () => {
  expect(buildV1SpritePath('sprites/Cat/e1_s2.png', 'abc')).toBe(
    'v1/sprites/Cat/e1_s2.abc.png',
  )
  expect(buildV1SpritePath('sprites/Cat/e1_s2@2x.png', 'abc')).toBe(
    'v1/sprites/Cat/e1_s2.abc@2x.png',
  )
})

test('adds unicode to the v1 manifest', () => {
  expect(toV1Manifest(manifest).categories[0]?.emoticons[0]).toMatchObject({
    id: 'e1',
    unicode: 'x',
  })
})

test('passes a complete v1 layout', async () => {
  await writeSite()
  await expect(validate()).resolves.toBeUndefined()
})

test('fails when a v1 sprite is missing', async () => {
  await writeSite()
  await rm(path.join(context.outputDirectory, spritePath))
  await expect(validate()).rejects.toThrow('missing v1 sprite')
})

test('fails when a file name etag disagrees with the manifest', async () => {
  await writeSite()
  await rename(
    path.join(context.outputDirectory, spritePath),
    path.join(context.outputDirectory, 'v1/sprites/Cat/e1.old.png'),
  )
  await expect(validate()).rejects.toThrow(
    'file name etag "old" disagrees with manifest etag "abc"',
  )
})

test('fails when the v1 manifest is missing', async () => {
  await writeSite()
  await rm(path.join(context.outputDirectory, 'v1/manifest.slim.json'))
  await expect(validate()).rejects.toThrow(
    'v1/manifest.slim.json is unreadable',
  )
})
