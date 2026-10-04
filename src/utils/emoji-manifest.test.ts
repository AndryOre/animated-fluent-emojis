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

  expect(Object.keys(manifest)).toHaveLength(2)
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
  const { getCategoryFolder, generateEmojiStyle } = await importFreshModule()

  await getCategoryFolder('cat')
  await generateEmojiStyle('cat', 10)
  await getCategoryFolder('grinning-face')

  expect(requestCount).toBe(1)
})

test('rejects when the CDN responds with an HTTP error', async () => {
  server.use(
    http.get(MANIFEST_URL, () => new HttpResponse('nope', { status: 500 })),
  )
  const { emojiManifestPromise } = await importFreshModule()

  await expect(emojiManifestPromise).rejects.toThrow()
})

test('getCategoryFolder returns the category title', async () => {
  serveFixtureManifest()
  const { getCategoryFolder } = await importFreshModule()

  await expect(getCategoryFolder('grinning-face')).resolves.toBe('Smilies')
})

test('getCategoryFolder throws for an unknown id', async () => {
  serveFixtureManifest()
  const { getCategoryFolder } = await importFreshModule()

  await expect(getCategoryFolder('nope')).rejects.toThrow(
    'Emoji with id "nope" not found',
  )
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
