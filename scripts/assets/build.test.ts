import { mkdtemp, readFile, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, expect, test } from 'vitest'

import {
  applyAnimations,
  buildAssets,
  diffManifests,
  type BuildOptions,
} from './build.js'
import { buildManifestUrl, buildSpriteUrl } from './teams.js'
import { createFakeFetch, createTeamsManifest } from './test-support.js'

const SHA = 'f'.repeat(40)
const HASH = 'c'.repeat(32)
const API = 'https://api.github.com/repos/microsoft/fluentui-emoji-animated'
const RAW = `https://raw.githubusercontent.com/microsoft/fluentui-emoji-animated/${SHA}`

const context = { workDirectory: '' }

beforeEach(async () => {
  context.workDirectory = await mkdtemp(
    path.join(tmpdir(), 'build-assets-test-'),
  )
})
afterEach(async () => {
  await rm(context.workDirectory, { recursive: true, force: true })
})

const spriteRoutes = () => {
  const manifest = createTeamsManifest()
  const routes: Record<string, { body: string } | { body: object }> = {
    [`GET ${buildManifestUrl(HASH)}`]: { body: manifest },
    [`GET ${API}/commits/main`]: { body: { sha: SHA } },
    [`GET ${API}/git/trees/${SHA}?recursive=1`]: {
      body: {
        truncated: false,
        tree: [
          {
            path: 'assets/Chequered flag/metadata.json',
            type: 'blob',
            sha: 'm1',
          },
          {
            path: 'assets/Chequered flag/animated/chequered_flag_animated.png',
            type: 'blob',
            sha: 'abcdef123456',
          },
        ],
      },
    },
    [`GET ${RAW}/assets/Chequered%20flag/metadata.json`]: {
      body: {
        cldr: 'chequered flag',
        glyph: '🏁',
        group: 'Flags',
        keywords: ['flag'],
        unicode: '1f3c1',
      },
    },
    [`GET ${RAW}/LICENSE`]: { body: 'MIT License' },
    [`GET https://media.githubusercontent.com/media/microsoft/fluentui-emoji-animated/${SHA}/assets/Chequered%20flag/animated/chequered_flag_animated.png`]:
      { body: 'apng-bytes' },
  }
  for (const category of manifest.categories) {
    for (const emoticon of category.emoticons) {
      const suffixes = emoticon.diverse
        ? ['', '_s2', '_s3', '_s4', '_s5', '_s6']
        : ['']
      for (const suffix of suffixes) {
        routes[`GET ${buildSpriteUrl(emoticon.id, suffix)}`] = {
          body: `sprite${suffix}`,
        }
      }
    }
  }
  return routes
}

const baseOptions = (
  fakeFetch: ReturnType<typeof createFakeFetch>,
): BuildOptions => ({
  fetchImplementation: fakeFetch.fetch,
  teamsVersion: { hash: HASH, lastModified: '2025-10-16T22:08:15.000Z' },
  outputDirectory: path.join(context.workDirectory, 'out'),
  cacheDirectory: path.join(context.workDirectory, 'cache'),
  convert: () =>
    Promise.resolve({
      png: Buffer.from('converted'),
      framesCount: 40,
      fps: 24,
    }),
  now: () => new Date('2026-10-05T00:00:00.000Z'),
})

test('builds the manifest, sprites, version marker, headers and license', async () => {
  const fakeFetch = createFakeFetch(spriteRoutes())
  const options = baseOptions(fakeFetch)

  const result = await buildAssets(options)

  const out = options.outputDirectory
  const manifest = JSON.parse(
    await readFile(path.join(out, 'manifest.json'), 'utf8'),
  ) as typeof result.manifest
  const ids = manifest.categories.flatMap((category) =>
    category.emoticons.map((emoticon) => emoticon.id),
  )
  expect(ids).toEqual([
    '1f603_grinningfacewithbigeyes',
    '1f44b_wavinghand',
    '1f3c1_chequeredflag',
  ])
  const flag = manifest.categories
    .flatMap((category) => category.emoticons)
    .find((emoticon) => emoticon.id === '1f3c1_chequeredflag')
  expect(flag?.animation).toEqual({ fps: 24, framesCount: 40, firstFrame: 1 })

  expect(result.spriteCount).toBe(8)
  expect(
    await readFile(
      path.join(out, 'sprites/Smilies/1f603_grinningfacewithbigeyes.png'),
      'utf8',
    ),
  ).toBe('sprite')
  expect(
    await readFile(
      path.join(out, 'sprites/Hand gestures/1f44b_wavinghand_s6.png'),
      'utf8',
    ),
  ).toBe('sprite_s6')
  expect(
    await readFile(
      path.join(out, 'sprites/Symbols/1f3c1_chequeredflag.png'),
      'utf8',
    ),
  ).toBe('converted')
  const version: unknown = JSON.parse(
    await readFile(path.join(out, 'version.json'), 'utf8'),
  )
  expect(version).toEqual({
    teamsHash: HASH,
    teamsLastModified: '2025-10-16T22:08:15.000Z',
    mitSha: SHA,
    builtAt: '2026-10-05T00:00:00.000Z',
  })
  expect(await readFile(path.join(out, '_headers'), 'utf8')).toContain(
    'immutable',
  )
  expect(
    await readFile(
      path.join(out, 'LICENSE-fluentui-emoji-animated.txt'),
      'utf8',
    ),
  ).toBe('MIT License')
})

test('reuses cached sprites by etag on the next build', async () => {
  const firstFetch = createFakeFetch(spriteRoutes())
  const first = await buildAssets(baseOptions(firstFetch))
  const secondFetch = createFakeFetch(spriteRoutes())

  const second = await buildAssets(baseOptions(secondFetch))

  expect(first.downloaded).toBe(8)
  expect(second.downloaded).toBe(0)
  expect(second.reused).toBe(8)
  expect(
    secondFetch.requests.some((request) => request.includes('100_anim_f')),
  ).toBe(false)
  const flag = second.manifest.categories
    .flatMap((category) => category.emoticons)
    .find((emoticon) => emoticon.id === '1f3c1_chequeredflag')
  expect(flag?.animation.framesCount).toBe(40)
})

test('limits the build to the first emojis', async () => {
  const fakeFetch = createFakeFetch(spriteRoutes())

  const result = await buildAssets({ ...baseOptions(fakeFetch), limit: 1 })

  expect(result.spriteCount).toBe(1)
  expect(
    result.manifest.categories.flatMap((category) => category.emoticons),
  ).toHaveLength(1)
  await expect(
    stat(path.join(context.workDirectory, 'out/sprites/Hand gestures')),
  ).rejects.toThrow()
})

test('skips an official emoji whose sprite fails and reports it', async () => {
  const fakeFetch = createFakeFetch(spriteRoutes())
  const options = baseOptions(fakeFetch)
  const summaryPath = path.join(context.workDirectory, 'summary.md')

  const result = await buildAssets({
    ...options,
    stepSummaryPath: summaryPath,
    convert: () => Promise.reject(new Error('bad apng')),
  })

  expect(result.skipped).toHaveLength(1)
  expect(result.skipped[0]?.id).toBe('1f3c1_chequeredflag')
  expect(result.spriteCount).toBe(7)
  const ids = result.manifest.categories.flatMap((category) =>
    category.emoticons.map((emoticon) => emoticon.id),
  )
  expect(ids).not.toContain('1f3c1_chequeredflag')
  await expect(
    stat(path.join(options.outputDirectory, 'sprites/Symbols')),
  ).rejects.toThrow()
  expect(await readFile(summaryPath, 'utf8')).toContain('1f3c1_chequeredflag')
  const state = JSON.parse(
    await readFile(path.join(options.cacheDirectory, 'state.json'), 'utf8'),
  ) as Record<string, unknown>
  expect(Object.keys(state)).toHaveLength(7)
})

test('fails the build when a Teams sprite fails', async () => {
  const missingUrl = `GET ${buildSpriteUrl('1f603_grinningfacewithbigeyes', '')}`
  const routes = Object.fromEntries(
    Object.entries(spriteRoutes()).filter(([route]) => route !== missingUrl),
  )
  const fakeFetch = createFakeFetch(routes)

  await expect(buildAssets(baseOptions(fakeFetch))).rejects.toThrow()
})

test('writes nothing when the catalog fails validation', async () => {
  const fakeFetch = createFakeFetch(spriteRoutes())
  const options = {
    ...baseOptions(fakeFetch),
    convert: () =>
      Promise.resolve({
        png: Buffer.from('converted'),
        framesCount: 0,
        fps: 0,
      }),
  }

  await expect(buildAssets(options)).rejects.toThrow(
    'Catalog validation failed',
  )

  await expect(stat(options.outputDirectory)).rejects.toThrow()
})

test('diffManifests reports added, removed and changed ids', () => {
  const previous = createTeamsManifest()
  const next = createTeamsManifest()
  const [smilies, hands] = next.categories
  if (!smilies || !hands) throw new Error('fixture changed')
  const [wave] = hands.emoticons
  const [grin] = smilies.emoticons
  if (!wave || !grin) throw new Error('fixture changed')
  hands.emoticons = [{ ...wave, etag: 'v6' }]
  smilies.emoticons = [{ ...grin, id: 'new-one' }]

  expect(diffManifests(previous, next)).toEqual({
    added: ['new-one'],
    removed: ['1f603_grinningfacewithbigeyes'],
    changed: ['1f44b_wavinghand'],
  })
})

test('applyAnimations only touches emojis with converted animations', () => {
  const manifest = createTeamsManifest()

  const result = applyAnimations(
    manifest,
    new Map([['1f44b_wavinghand', { fps: 30, framesCount: 60 }]]),
  )

  const emoticons = result.categories.flatMap((category) => category.emoticons)
  expect(emoticons[1]?.animation).toEqual({
    fps: 30,
    framesCount: 60,
    firstFrame: 1,
  })
  expect(emoticons[0]?.animation).toEqual({
    fps: 24,
    framesCount: 72,
    firstFrame: 1,
  })
})
