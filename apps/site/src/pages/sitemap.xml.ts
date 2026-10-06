import { buildSitemapXml, collectSitemapRoutes } from '../seo/sitemap'
import { SITEMAP_SOURCES } from '../seo/sources'

export function GET() {
  return new Response(buildSitemapXml(collectSitemapRoutes(SITEMAP_SOURCES)), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
