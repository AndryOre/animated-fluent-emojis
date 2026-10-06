import type { SitemapSource } from '../seo/sitemap'

/**
 * Sitemap source for the gallery page, in every locale.
 * @returns The gallery route.
 */
export const gallerySitemapSource: SitemapSource = () => [
  { path: '/emojis/', localized: true },
]
