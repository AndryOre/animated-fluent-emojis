import { describe, expect, it } from 'vitest'

import { parseGalleryUrl, serializeGalleryUrl } from './url-state'

describe('gallery url state', () => {
  it('round-trips the three filters', () => {
    const state = { query: 'fire', tone: 'dark', category: 'Smilies' } as const
    expect(parseGalleryUrl(serializeGalleryUrl(state))).toEqual(state)
  })

  it('serializes to an empty string with no filter', () => {
    expect(
      serializeGalleryUrl({ query: ' ', tone: undefined, category: undefined }),
    ).toBe('')
  })

  it('drops unknown tones and blank categories', () => {
    expect(parseGalleryUrl('?tone=purple&c=')).toEqual({
      query: '',
      tone: undefined,
      category: undefined,
    })
  })

  it('keeps non-ASCII queries', () => {
    const state = { query: 'fuego ñ', tone: undefined, category: undefined }
    expect(parseGalleryUrl(serializeGalleryUrl(state)).query).toBe('fuego ñ')
  })
})
