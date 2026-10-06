import { afterEach, describe, expect, it, vi } from 'vitest'

import publicIndexFixture from './fixtures/public-index.json'
import {
  fetchPublicIndex,
  fileUrl,
  loadPublicIndex,
  parsePublicIndex,
  PublicIndexError,
  type PublicEmoji,
} from './public-index'

const emojis = parsePublicIndex(publicIndexFixture)
const find = (slug: string): PublicEmoji => {
  const emoji = emojis.find((candidate) => candidate.slug === slug)
  if (!emoji) throw new Error(`fixture lacks ${slug}`)
  return emoji
}

const entry = () => structuredClone(publicIndexFixture[0]) as object

describe('public index validation', () => {
  it('accepts the fixture', () => {
    expect(emojis).toHaveLength(3)
  })

  it('rejects an empty list', () => {
    expect(() => parsePublicIndex([])).toThrow(PublicIndexError)
  })

  it('rejects a non-list', () => {
    expect(() => parsePublicIndex({})).toThrow(/non-empty list/)
  })

  it('rejects an entry with a missing field', () => {
    const broken = { ...entry(), unicode: undefined }
    expect(() => parsePublicIndex([broken])).toThrow(/"unicode"/)
  })

  it('rejects an entry without urls', () => {
    expect(() =>
      parsePublicIndex([{ ...entry(), urls: { gif: '/a.gif' } }]),
    ).toThrow(/"webp"/)
  })

  it('rejects an unknown tone', () => {
    const tone = { tone: 'purple', slug: 'x', urls: find('fire').urls }
    expect(() => parsePublicIndex([{ ...entry(), tones: [tone] }])).toThrow(
      /unknown tone/,
    )
  })

  it('rejects a duplicate slug', () => {
    expect(() => parsePublicIndex([entry(), entry()])).toThrow(/duplicate slug/)
  })

  it('fails loudly when the site is unreachable or answers an error', async () => {
    await expect(
      fetchPublicIndex(() => Promise.reject(new Error('offline'))),
    ).rejects.toThrow(/unreachable/)
    await expect(
      fetchPublicIndex(() =>
        Promise.resolve(new Response('', { status: 503 })),
      ),
    ).rejects.toThrow(/503/)
    await expect(
      fetchPublicIndex(() => Promise.resolve(new Response('nope'))),
    ).rejects.toThrow(/valid JSON/)
  })

  it('loads a valid response', async () => {
    const loaded = await fetchPublicIndex(() =>
      Promise.resolve(Response.json(publicIndexFixture)),
    )
    expect(loaded.map((emoji) => emoji.slug)).toContain('fire')
  })
})

describe('loadPublicIndex', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('fetches once per build and shares the result', async () => {
    const fetchStub = vi.fn(() =>
      Promise.resolve(Response.json(publicIndexFixture)),
    )
    vi.stubGlobal('fetch', fetchStub)
    const first = await loadPublicIndex()
    const second = await loadPublicIndex()
    expect(second).toBe(first)
    expect(fetchStub).toHaveBeenCalledTimes(1)
  })

  it('builds absolute file URLs', () => {
    expect(fileUrl('/gif/fire.gif')).toBe(
      'https://animated-fluent-emojis-files.andryore.dev/gif/fire.gif',
    )
  })
})
