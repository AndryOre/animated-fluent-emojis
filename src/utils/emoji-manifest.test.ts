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
  const { loadEmojiManifest } = await importFreshModule()

  const manifest = await loadEmojiManifest()

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
  const { loadEmojiManifest } = await importFreshModule()

  await loadEmojiManifest()
  await loadEmojiManifest()

  expect(requestCount).toBe(1)
})

test('rejects when the asset site responds with an HTTP error', async () => {
  server.use(
    http.get(MANIFEST_URL, () => new HttpResponse('nope', { status: 500 })),
  )
  const { loadEmojiManifest } = await importFreshModule()

  await expect(loadEmojiManifest()).rejects.toThrow()
})

test('getSpriteUrl versions the sprite by etag and encodes the category', async () => {
  serveFixtureManifest()
  const { loadEmojiManifest, getSpriteUrl } = await importFreshModule()
  const manifest = await loadEmojiManifest()

  const cat = manifest.cat
  if (!cat) throw new Error('fixture changed')
  expect(getSpriteUrl({ ...cat, category: 'Travel and places' })).toBe(
    'https://animated-fluent-emojis.pages.dev/sprites/Travel%20and%20places/cat.png?v=etag-cat',
  )
})

test('getSpriteUrl maps every skin tone for diverse emojis only', async () => {
  serveFixtureManifest()
  const { loadEmojiManifest, getSpriteUrl } = await importFreshModule()
  const manifest = await loadEmojiManifest()
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

test('importing the package makes no request', async () => {
  let requestCount = 0
  server.use(
    http.get(MANIFEST_URL, () => {
      requestCount += 1
      return HttpResponse.json(FIXTURE_MANIFEST)
    }),
  )

  await import('../index.js')
  await new Promise((resolve) => {
    setTimeout(resolve, 20)
  })

  expect(requestCount).toBe(0)
})

test('a failed fetch is retried on the next call', async () => {
  let requestCount = 0
  server.use(
    http.get(MANIFEST_URL, () => {
      requestCount += 1
      return requestCount === 1
        ? new HttpResponse('nope', { status: 500 })
        : HttpResponse.json(FIXTURE_MANIFEST)
    }),
  )
  const { loadEmojiManifest } = await importFreshModule()

  await expect(loadEmojiManifest()).rejects.toThrow()
  const manifest = await loadEmojiManifest()

  expect(manifest.cat?.id).toBe('cat')
  expect(requestCount).toBe(2)
})

test('a custom asset site serves the manifest and the sprite sheets', async () => {
  const requested: string[] = []
  server.use(
    http.get('https://assets.example.com/manifest.slim.json', ({ request }) => {
      requested.push(request.url)
      return HttpResponse.json(FIXTURE_MANIFEST)
    }),
  )
  const { configureEmojis, loadEmojiManifest, getSpriteUrl } =
    await importFreshModule()

  configureEmojis({ assetSiteUrl: 'https://assets.example.com/' })
  const manifest = await loadEmojiManifest()
  const cat = manifest.cat
  if (!cat) throw new Error('fixture changed')

  expect(requested).toEqual(['https://assets.example.com/manifest.slim.json'])
  expect(getSpriteUrl(cat)).toBe(
    'https://assets.example.com/sprites/Animals/cat.png?v=etag-cat',
  )
})
