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
})
afterAll(() => {
  server.close()
})

const importFreshModule = async () => import('./emoji-manifest.js')

const serveFixtureManifest = () => {
  server.use(http.get(MANIFEST_URL, () => HttpResponse.json(FIXTURE_MANIFEST)))
}

test('flattens the manifest and tags each emoji with its category', async () => {
  serveFixtureManifest()
  const { emojiManifestPromise } = await importFreshModule()

  const manifest = await emojiManifestPromise

  expect(Object.keys(manifest)).toHaveLength(3)
  expect(manifest['grinning-face']?.category).toBe('Smilies')
  expect(manifest.cat?.category).toBe('Animals')
})

test('fetches the manifest only once across lookups', async () => {
  let requestCount = 0
  server.use(
    http.get(MANIFEST_URL, () => {
      requestCount += 1
      return HttpResponse.json(FIXTURE_MANIFEST)
    }),
  )
  const { generateEmojiStyle } = await importFreshModule()

  await generateEmojiStyle('cat', 10)
  await generateEmojiStyle('grinning-face', 10)

  expect(requestCount).toBe(1)
})

test('rejects when the CDN responds with an HTTP error', async () => {
  server.use(
    http.get(MANIFEST_URL, () => new HttpResponse('nope', { status: 500 })),
  )
  const { emojiManifestPromise } = await importFreshModule()

  await expect(emojiManifestPromise).rejects.toThrow()
})

test('generateEmojiStyle builds keyframes spanning every frame', async () => {
  serveFixtureManifest()
  const { generateEmojiStyle } = await importFreshModule()

  const css = await generateEmojiStyle('grinning-face', 10)

  expect(css).toContain('@keyframes emoji-grinning-face-10')
  expect(css).toContain('translateY(-400px)')
})

test('generateEmojiStyle throws for an unknown id', async () => {
  serveFixtureManifest()
  const { generateEmojiStyle } = await importFreshModule()

  await expect(generateEmojiStyle('nope', 10)).rejects.toThrow(
    'Emoji with id "nope" not found',
  )
})

test('getSpriteUrl versions the sprite by etag and encodes the category', async () => {
  serveFixtureManifest()
  const { emojiManifestPromise, getSpriteUrl } = await importFreshModule()
  const manifest = await emojiManifestPromise

  const cat = manifest.cat
  if (!cat) throw new Error('fixture changed')
  expect(getSpriteUrl({ ...cat, category: 'Travel and places' })).toBe(
    'https://animated-fluent-emojis.pages.dev/sprites/Travel%20and%20places/cat.png?v=etag-cat',
  )
})

test('getSpriteUrl maps every skin tone for diverse emojis only', async () => {
  serveFixtureManifest()
  const { emojiManifestPromise, getSpriteUrl } = await importFreshModule()
  const manifest = await emojiManifestPromise
  const wave = manifest['waving-hand']
  const cat = manifest.cat
  if (!wave || !cat) throw new Error('fixture changed')

  const suffixes = (
    [
      'default',
      'light',
      'medium-light',
      'medium',
      'medium-dark',
      'dark',
    ] as const
  ).map((tone) => /waving-hand(.*)\.png/.exec(getSpriteUrl(wave, tone))?.[1])

  expect(suffixes).toEqual(['', '_s2', '_s3', '_s4', '_s5', '_s6'])
  expect(getSpriteUrl(cat, 'dark')).toContain('/cat.png?')
})
