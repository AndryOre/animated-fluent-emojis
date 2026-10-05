import { readFileSync } from 'node:fs'
import path from 'node:path'
import { http, HttpResponse } from 'msw/http'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, expect, test, vi } from 'vitest'

import { FIXTURE_MANIFEST, MANIFEST_URL } from '../test/manifest-fixture.js'

const server = setupServer()

beforeAll(() => {
  server.listen({ onUnhandledFrame: 'error' })
})
afterEach(() => {
  server.resetHandlers()
  vi.resetModules()
  vi.restoreAllMocks()
})
afterAll(() => {
  server.close()
})

const serveFixtureManifest = () => {
  let requests = 0
  server.use(
    http.get(MANIFEST_URL, () => {
      requests += 1
      return HttpResponse.json(FIXTURE_MANIFEST)
    }),
  )
  return () => requests
}

const importFresh = async () => import('./index.js')

test('findEmojiByUnicode finds a plain emoji and tolerates VS16', async () => {
  serveFixtureManifest()
  const { findEmojiByUnicode } = await importFresh()

  expect(await findEmojiByUnicode('😀')).toEqual({ id: 'grinning-face' })
  expect(await findEmojiByUnicode('😀️')).toEqual({ id: 'grinning-face' })
})

test('findEmojiByUnicode maps skin tone modifiers for diverse emojis only', async () => {
  serveFixtureManifest()
  const { findEmojiByUnicode } = await importFresh()

  expect(await findEmojiByUnicode('👋🏽')).toEqual({
    id: 'waving-hand',
    skinTone: 'medium',
  })
  expect(await findEmojiByUnicode('👋🏿')).toEqual({
    id: 'waving-hand',
    skinTone: 'dark',
  })
  expect(await findEmojiByUnicode('🐱🏽')).toBeUndefined()
})

test('findEmojiByUnicode returns undefined for an unknown character', async () => {
  serveFixtureManifest()
  const { findEmojiByUnicode } = await importFresh()

  expect(await findEmojiByUnicode('Z')).toBeUndefined()
})

test('extractEmojis returns matches with offsets', async () => {
  serveFixtureManifest()
  const { extractEmojis } = await importFresh()

  expect(await extractEmojis('hi 😀 and 👋🏻 ok')).toEqual([
    { id: 'grinning-face', text: '😀', index: 3, length: 2 },
    {
      id: 'waving-hand',
      skinTone: 'light',
      text: '👋🏻',
      index: 10,
      length: 4,
    },
  ])
})

test('extractEmojis keeps a ZWJ sequence whole and skips unknown ones', async () => {
  serveFixtureManifest()
  const { extractEmojis } = await importFresh()

  expect(await extractEmojis('🐱‍⬛')).toEqual([])
  expect(await extractEmojis('no emojis here')).toEqual([])
})

test('searchEmojis matches descriptions ignoring case and honours the limit', async () => {
  serveFixtureManifest()
  const { searchEmojis } = await importFresh()

  expect(await searchEmojis('FACE')).toEqual([{ id: 'grinning-face' }])
  expect(await searchEmojis('a', { limit: 1 })).toHaveLength(1)
  expect(await searchEmojis(' '.repeat(3))).toEqual([])
  expect(await searchEmojis('zzz')).toEqual([])
})

test('lookups share one manifest fetch with the Emoji store', async () => {
  const requestCount = serveFixtureManifest()
  const { findEmojiByUnicode, searchEmojis, extractEmojis } =
    await importFresh()
  const { loadEmojiManifest } = await import('../utils/emoji-manifest.js')

  await Promise.all([
    findEmojiByUnicode('😀'),
    searchEmojis('cat'),
    extractEmojis('🐱'),
    loadEmojiManifest(),
  ])

  expect(requestCount()).toBe(1)
})

test('every lookup resolves empty when the manifest fails', async () => {
  server.use(http.get(MANIFEST_URL, () => HttpResponse.error()))
  vi.spyOn(console, 'error').mockImplementation(() => 0 as never)
  const { findEmojiByUnicode, searchEmojis, extractEmojis } =
    await importFresh()

  expect(await findEmojiByUnicode('😀')).toBeUndefined()
  expect(await extractEmojis('😀')).toEqual([])
  expect(await searchEmojis('face')).toEqual([])
})

test('the lookup module does not import React', () => {
  const source = readFileSync(
    path.resolve(import.meta.dirname, 'index.ts'),
    'utf8',
  )

  expect(source).not.toMatch(/from\s+['"]react/)
  expect(source).not.toContain('use client')
})

const TEXT_SYMBOL_MANIFEST = {
  categories: [
    {
      id: 'symbols',
      title: 'Symbols',
      description: 'Symbols',
      emoticons: [
        {
          id: 'copyright',
          description: 'Copyright',
          etag: 'e1',
          unicode: '©️',
          animation: { framesCount: 10 },
        },
        {
          id: 'trade-mark',
          description: 'Trade mark',
          etag: 'e2',
          unicode: '™️',
          animation: { framesCount: 10 },
        },
        {
          id: 'keycap-1',
          description: 'Keycap 1',
          etag: 'e3',
          unicode: '1️⃣',
          animation: { framesCount: 10 },
        },
        {
          id: 'grinning-face',
          description: 'Grinning face',
          etag: 'e4',
          unicode: '\u{1F600}',
          animation: { framesCount: 10 },
        },
        {
          id: 'waving-hand',
          description: 'Waving hand',
          etag: 'e5',
          unicode: '\u{1F44B}',
          animation: { framesCount: 10 },
          diverse: true,
        },
        {
          id: 'people-holding-hands',
          description: 'People holding hands',
          etag: 'e6',
          unicode: '\u{1F9D1}‍\u{1F91D}‍\u{1F9D1}',
          animation: { framesCount: 10 },
          diverse: true,
        },
        {
          id: 'family',
          description: 'Family',
          etag: 'e7',
          unicode: '\u{1F468}‍\u{1F469}‍\u{1F467}',
          animation: { framesCount: 10 },
        },
      ],
    },
  ],
}

const serveSymbolManifest = () => {
  server.use(
    http.get(MANIFEST_URL, () => HttpResponse.json(TEXT_SYMBOL_MANIFEST)),
  )
}

test('text presentation bases require VS16 while emoji presentation bases do not', async () => {
  serveSymbolManifest()
  const { extractEmojis, findEmojiByUnicode } = await importFresh()

  expect(await extractEmojis('© 2024 Acme™')).toEqual([])
  expect(await extractEmojis('©️')).toEqual([
    { id: 'copyright', text: '©️', index: 0, length: 2 },
  ])
  expect(await findEmojiByUnicode('™')).toBeUndefined()
  expect(await findEmojiByUnicode('™︎')).toBeUndefined()
  expect(await findEmojiByUnicode('™️')).toEqual({ id: 'trade-mark' })
  expect(await findEmojiByUnicode('\u{1F600}')).toEqual({ id: 'grinning-face' })
  expect(await findEmojiByUnicode('\u{1F600}️')).toEqual({
    id: 'grinning-face',
  })
})

test('a zwj sequence still resolves without the VS16 it carries inside', async () => {
  server.use(
    http.get(MANIFEST_URL, () =>
      HttpResponse.json({
        categories: [
          {
            id: 'people',
            title: 'People',
            description: 'People',
            emoticons: [
              {
                id: 'woman-running',
                description: 'Woman running',
                etag: 'e9',
                unicode: '\u{1F3C3}\u{200D}\u{2640}\u{FE0F}',
                animation: { framesCount: 10 },
              },
            ],
          },
        ],
      }),
    ),
  )
  const { findEmojiByUnicode } = await importFresh()

  expect(await findEmojiByUnicode('\u{1F3C3}\u{200D}\u{2640}')).toEqual({
    id: 'woman-running',
  })
  expect(await findEmojiByUnicode('\u{1F3C3}\u{200D}\u{2640}\u{FE0F}')).toEqual(
    {
      id: 'woman-running',
    },
  )
})

test('keycap sequences resolve whole', async () => {
  serveSymbolManifest()
  const { extractEmojis } = await importFresh()

  expect(await extractEmojis('a 1️⃣')).toEqual([
    { id: 'keycap-1', text: '1️⃣', index: 2, length: 3 },
  ])
  expect(await extractEmojis('1⃣')).toEqual([])
})

test('two different skin tones resolve to the base id, one tone is kept', async () => {
  serveSymbolManifest()
  const { findEmojiByUnicode } = await importFresh()

  expect(
    await findEmojiByUnicode('\u{1F9D1}\u{1F3FB}‍\u{1F91D}‍\u{1F9D1}\u{1F3FF}'),
  ).toEqual({ id: 'people-holding-hands' })
  expect(
    await findEmojiByUnicode('\u{1F9D1}\u{1F3FB}‍\u{1F91D}‍\u{1F9D1}\u{1F3FB}'),
  ).toEqual({ id: 'people-holding-hands', skinTone: 'light' })
})

test('extractEmojis works without Intl.Segmenter', async () => {
  serveSymbolManifest()
  vi.stubGlobal('Intl', { ...Intl, Segmenter: undefined })
  const { extractEmojis } = await importFresh()

  const found = await extractEmojis(
    'hi \u{1F44B}\u{1F3FD} \u{1F468}‍\u{1F469}‍\u{1F467} 1️⃣',
  )
  vi.unstubAllGlobals()

  expect(found).toEqual([
    {
      id: 'waving-hand',
      skinTone: 'medium',
      text: '\u{1F44B}\u{1F3FD}',
      index: 3,
      length: 4,
    },
    {
      id: 'family',
      text: '\u{1F468}‍\u{1F469}‍\u{1F467}',
      index: 8,
      length: 8,
    },
    { id: 'keycap-1', text: '1️⃣', index: 17, length: 3 },
  ])
})

test('searchEmojis treats a non finite positive limit as unlimited and 0 as empty', async () => {
  serveSymbolManifest()
  const { searchEmojis } = await importFresh()

  expect(await searchEmojis('a', { limit: 0 })).toEqual([])
  expect(await searchEmojis('a', { limit: NaN })).toHaveLength(6)
  expect(await searchEmojis('a', { limit: -3 })).toHaveLength(6)
  expect(await searchEmojis('a', { limit: Infinity })).toHaveLength(6)
  expect(await searchEmojis('a', { limit: 2 })).toHaveLength(2)
})
