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
