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
  vi.unstubAllGlobals()
})
afterAll(() => {
  server.close()
})

const importFreshModule = async () => import('./emoji-manifest.js')

const serveFixtureManifest = () => {
  server.use(http.get(MANIFEST_URL, () => HttpResponse.json(FIXTURE_MANIFEST)))
}

const silence = (method: 'error' | 'warn') =>
  vi.spyOn(console, method).mockImplementation(() => 0 as never)

test('the server snapshot is always loading', async () => {
  serveFixtureManifest()
  const { getServerManifestSnapshot, loadEmojiManifest } =
    await importFreshModule()

  expect(getServerManifestSnapshot().status).toBe('loading')
  await loadEmojiManifest()
  expect(getServerManifestSnapshot().status).toBe('loading')
})

test('the store moves idle, loading, ready and notifies subscribers', async () => {
  serveFixtureManifest()
  const { getManifestSnapshot, subscribeToManifest, startManifestLoad } =
    await importFreshModule()
  const seen: string[] = []
  const unsubscribe = subscribeToManifest(() => {
    seen.push(getManifestSnapshot().status)
  })

  expect(getManifestSnapshot().status).toBe('idle')
  await startManifestLoad()
  unsubscribe()

  expect(seen).toEqual(['loading', 'ready'])
  expect(getManifestSnapshot().manifest?.cat?.id).toBe('cat')
})

test('a failed load logs once, publishes error and retries on the next start', async () => {
  let requestCount = 0
  server.use(
    http.get(MANIFEST_URL, () => {
      requestCount += 1
      return requestCount === 1
        ? new HttpResponse('nope', { status: 500 })
        : HttpResponse.json(FIXTURE_MANIFEST)
    }),
  )
  const errorSpy = silence('error')
  const { getManifestSnapshot, startManifestLoad } = await importFreshModule()

  await Promise.all([startManifestLoad(), startManifestLoad()])
  expect(getManifestSnapshot().status).toBe('error')
  expect(errorSpy).toHaveBeenCalledTimes(1)

  await startManifestLoad()
  expect(getManifestSnapshot().status).toBe('ready')
})

test('configureEmojis with a new url refetches from it and warns after a fetch', async () => {
  const requested: string[] = []
  server.use(
    http.get(MANIFEST_URL, ({ request }) => {
      requested.push(request.url)
      return HttpResponse.json(FIXTURE_MANIFEST)
    }),
    http.get('https://other.example.com/manifest.slim.json', ({ request }) => {
      requested.push(request.url)
      return HttpResponse.json(FIXTURE_MANIFEST)
    }),
  )
  const warnSpy = silence('warn')
  const { configureEmojis, loadEmojiManifest, getManifestSnapshot } =
    await importFreshModule()

  configureEmojis({})
  expect(warnSpy).not.toHaveBeenCalled()
  await loadEmojiManifest()
  configureEmojis({ assetSiteUrl: 'https://other.example.com' })
  expect(getManifestSnapshot().status).toBe('idle')
  await loadEmojiManifest()

  expect(requested).toEqual([
    MANIFEST_URL,
    'https://other.example.com/manifest.slim.json',
  ])
  expect(warnSpy).toHaveBeenCalledTimes(1)
})

test('preloadEmojis starts the fetch and resolves once it completes', async () => {
  let requestCount = 0
  server.use(
    http.get(MANIFEST_URL, () => {
      requestCount += 1
      return HttpResponse.json(FIXTURE_MANIFEST)
    }),
  )
  const { preloadEmojis, getManifestSnapshot } = await importFreshModule()

  await preloadEmojis()

  expect(requestCount).toBe(1)
  expect(getManifestSnapshot().status).toBe('ready')
})

test('preloadEmojis warms the sprite sheets of the given ids once', async () => {
  serveFixtureManifest()
  const requestedSources: string[] = []
  class FakeImage {
    srcset = ''
    set src(value: string) {
      requestedSources.push(value)
    }
  }
  vi.stubGlobal('Image', FakeImage)
  const { preloadEmojis } = await importFreshModule()

  await preloadEmojis(['cat', 'waving-hand', 'unknown'], { skinTone: 'dark' })
  await preloadEmojis(['cat'], { skinTone: 'dark' })

  expect(requestedSources).toEqual([
    'https://animated-fluent-emojis.pages.dev/sprites/Animals/cat.png?v=etag-cat',
    'https://animated-fluent-emojis.pages.dev/sprites/Smilies/waving-hand_s6.png?v=etag-wave',
  ])
})
