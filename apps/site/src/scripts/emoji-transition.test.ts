import { beforeAll, describe, expect, it, vi } from 'vitest'

import { emojiSlugFromUrl, nameGalleryTile } from './emoji-transition'

beforeAll(() => {
  vi.stubGlobal('CSS', { escape: (value: string) => value })
})

describe('emojiSlugFromUrl', () => {
  it('reads the slug from an emoji page', () => {
    expect(emojiSlugFromUrl('https://x.test/emojis/waving-hand/')).toBe(
      'waving-hand',
    )
  })

  it('ignores the gallery and other pages', () => {
    expect(emojiSlugFromUrl('https://x.test/emojis/')).toBeUndefined()
    expect(emojiSlugFromUrl('https://x.test/docs/')).toBeUndefined()
    expect(emojiSlugFromUrl(undefined)).toBeUndefined()
  })
})

describe('nameGalleryTile', () => {
  it('names the matched tile emoji and can clear it', () => {
    const target = { style: { viewTransitionName: '' } }
    const root = {
      querySelector: (selector: string) =>
        selector === '[data-slug="b"] [data-transition-target]' ? target : null,
    } as unknown as ParentNode
    const clear = nameGalleryTile(root, 'b')
    expect(target.style.viewTransitionName).toBe('emoji-b')
    clear?.()
    expect(target.style.viewTransitionName).toBe('')
  })

  it('returns undefined when the tile is not rendered', () => {
    const root = { querySelector: () => null } as unknown as ParentNode
    expect(nameGalleryTile(root, 'zzz')).toBeUndefined()
  })
})
