import type { SitemapSource } from '../seo/sitemap'
import { CHANGELOG_SLUG } from './changelog-pages'
import { docSlug, PUBLISHED_DOCS } from './published'

/**
 * Sitemap routes for every published doc and the changelog, listed in every locale because
 * untranslated pages still render the English text.
 * @returns The docs routes.
 */
export const docsSitemapSource: SitemapSource = () =>
  [...PUBLISHED_DOCS.map((docPath) => docSlug(docPath)), CHANGELOG_SLUG].map(
    (slug) => ({
      path: `/${slug}/`,
      localized: true,
    }),
  )
