import { describe, expect, it } from 'vitest'

import { gallerySitemapSource } from './sitemap'

describe('gallery sitemap source', () => {
  it('lists the localized gallery route', () => {
    expect(gallerySitemapSource()).toEqual([
      { path: '/emojis/', localized: true },
    ])
  })
})
