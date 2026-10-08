import { describe, expect, it, vi } from 'vitest'

import fixture from '../gallery/fixtures/public-index.json'
import { parsePublicIndex } from '../gallery/public-index'
import { buildRobotsTxt } from './robots'
import { buildSitemapXml, collectSitemapRoutes } from './sitemap'
import { ROBOTS_CONTRIBUTIONS, SITEMAP_SOURCES } from './sources'

vi.mock('../gallery/public-index', async (importOriginal) => {
  const original = await importOriginal<Record<string, unknown>>()
  return {
    ...original,
    loadPublicIndex: () => Promise.resolve(parsePublicIndex(fixture)),
  }
})

describe('seo sources', () => {
  it('renders the home page, the gallery, every doc and every emoji page in every locale from the registered sources', async () => {
    const xml = buildSitemapXml(await collectSitemapRoutes(SITEMAP_SOURCES))
    expect(xml.match(/<loc>/g)).toHaveLength(
      170 + parsePublicIndex(fixture).length * 10,
    )
  })

  it('renders a valid robots.txt from the registered contributions', () => {
    expect(buildRobotsTxt(ROBOTS_CONTRIBUTIONS)).toContain('Sitemap:')
  })
})
