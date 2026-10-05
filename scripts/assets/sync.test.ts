import { expect, test } from 'vitest'

import type { PublishedVersion } from './build.js'
import { fetchPublishedJson, needsRebuild } from './sync.js'
import { createFakeFetch } from './test-support.js'

const published: PublishedVersion = {
  teamsHash: 'a'.repeat(32),
  teamsLastModified: '2025-10-16T22:08:15.000Z',
  mitSha: 'b'.repeat(40),
  builtAt: '2026-10-05T00:00:00.000Z',
}
const missingHost = () =>
  Promise.reject(new Error('fetch failed', { cause: { code: 'ENOTFOUND' } }))
const offline = () => Promise.reject(new Error('socket hang up'))
const latest = { teamsHash: published.teamsHash, mitSha: published.mitSha }

test('does not rebuild when nothing changed', () => {
  expect(needsRebuild(published, latest, false)).toBe(false)
})

test('rebuilds on a new Teams hash or official commit', () => {
  expect(
    needsRebuild(published, { ...latest, teamsHash: 'c'.repeat(32) }, false),
  ).toBe(true)
  expect(
    needsRebuild(published, { ...latest, mitSha: 'd'.repeat(40) }, false),
  ).toBe(true)
})

test('rebuilds on the first run and when forced', () => {
  expect(needsRebuild(undefined, latest, false)).toBe(true)
  expect(needsRebuild(published, latest, true)).toBe(true)
})

test('fetchPublishedJson returns the parsed JSON of a published file', async () => {
  const { fetch } = createFakeFetch({
    'GET https://site.test/version.json': { body: published },
  })

  await expect(
    fetchPublishedJson<PublishedVersion>(
      fetch,
      'https://site.test',
      'version.json',
    ),
  ).resolves.toEqual(published)
})

test('fetchPublishedJson treats a missing file or host as unpublished', async () => {
  const { fetch } = createFakeFetch({})
  await expect(
    fetchPublishedJson(fetch, 'https://site.test', 'version.json'),
  ).resolves.toBeUndefined()
  await expect(
    fetchPublishedJson(missingHost, 'https://nope.test', 'version.json'),
  ).resolves.toBeUndefined()
})

test('fetchPublishedJson surfaces other failures', async () => {
  const { fetch } = createFakeFetch({
    'GET https://site.test/version.json': { status: 500 },
  })
  await expect(
    fetchPublishedJson(fetch, 'https://site.test', 'version.json'),
  ).rejects.toThrow('HTTP 500')
  await expect(
    fetchPublishedJson(offline, 'https://site.test', 'version.json'),
  ).rejects.toThrow('socket hang up')
})
