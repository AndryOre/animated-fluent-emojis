import type { SitemapSource } from '../seo/sitemap'
import { docSlug, PUBLISHED_DOCS } from './published'

/**
 * Sitemap routes for every published doc, listed in every locale because
 * untranslated pages still render the English text.
 * @returns The docs routes.
 */
export const docsSitemapSource: SitemapSource = () =>
  PUBLISHED_DOCS.map((docPath) => ({
    path: `/${docSlug(docPath)}/`,
    localized: true,
  }))
