import { describe, expect, it } from 'vitest'

import { buildRobotsTxt } from './robots'
import { buildSitemapXml, collectSitemapRoutes } from './sitemap'
import { ROBOTS_CONTRIBUTIONS, SITEMAP_SOURCES } from './sources'

describe('seo sources', () => {
  it('renders the home page and every doc in every locale from the registered sources', () => {
    const xml = buildSitemapXml(collectSitemapRoutes(SITEMAP_SOURCES))
    expect(xml.match(/<loc>/g)).toHaveLength(100)
  })

  it('renders a valid robots.txt from the registered contributions', () => {
    expect(buildRobotsTxt(ROBOTS_CONTRIBUTIONS)).toContain('Sitemap:')
  })
})
