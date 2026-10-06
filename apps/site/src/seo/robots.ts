import { SITE_ORIGIN } from '../i18n/locales'

/**
 * Extra robots.txt directives. Feature modules add theirs to
 * `ROBOTS_CONTRIBUTIONS` in `seo/sources.ts`.
 */
export interface RobotsContribution {
  disallow?: readonly string[]
  sitemaps?: readonly string[]
}

/**
 * Renders `robots.txt`: everything is allowed except the paths contributed by
 * other modules, and the sitemap is always listed.
 * @param contributions - Directives from other modules.
 * @returns The file contents.
 */
export function buildRobotsTxt(
  contributions: readonly RobotsContribution[] = [],
): string {
  const disallow = [
    ...new Set(contributions.flatMap((entry) => entry.disallow ?? [])),
  ]
  const sitemaps = [
    ...new Set([
      `${SITE_ORIGIN}/sitemap.xml`,
      ...contributions.flatMap((entry) => entry.sitemaps ?? []),
    ]),
  ]
  const rules =
    disallow.length === 0
      ? ['Allow: /']
      : disallow.map((path) => `Disallow: ${path}`)
  return [
    'User-agent: *',
    ...rules,
    '',
    ...sitemaps.map((url) => `Sitemap: ${url}`),
    '',
  ].join('\n')
}
