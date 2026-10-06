import { describe, expect, it } from 'vitest'

import { buildRobotsTxt } from './robots'

describe('robots', () => {
  it('allows everything and lists the sitemap by default', () => {
    expect(buildRobotsTxt()).toBe(
      'User-agent: *\nAllow: /\n\nSitemap: https://animated-fluent-emojis.andryore.dev/sitemap.xml\n',
    )
  })

  it('merges contributions from other modules', () => {
    const output = buildRobotsTxt([
      { disallow: ['/private/'] },
      { disallow: ['/private/', '/tmp/'], sitemaps: ['https://x.test/s.xml'] },
    ])
    expect(output).toContain('Disallow: /private/\nDisallow: /tmp/')
    expect(output).not.toContain('Allow: /\n')
    expect(output).toContain('Sitemap: https://x.test/s.xml')
  })
})
