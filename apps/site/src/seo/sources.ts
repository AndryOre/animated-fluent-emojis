import { docsSitemapSource } from '../docs/sitemap'
import { gallerySitemapSource } from '../gallery/sitemap'
import type { RobotsContribution } from './robots'
import { coreSitemapSource, type SitemapSource } from './sitemap'

/**
 * Every provider of sitemap routes. Gallery, docs and emoji pages append their
 * own source here; `pages/sitemap.xml.ts` renders the union.
 */
export const SITEMAP_SOURCES: readonly SitemapSource[] = [
  coreSitemapSource,
  docsSitemapSource,
  gallerySitemapSource,
]

/**
 * Every contribution to `robots.txt`. Modules append their disallowed paths or
 * extra sitemaps here; `pages/robots.txt.ts` renders the union.
 */
export const ROBOTS_CONTRIBUTIONS: readonly RobotsContribution[] = []
