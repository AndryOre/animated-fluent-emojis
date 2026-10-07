import { createHash } from 'node:crypto'
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { LOCALES, localeUrl } from '../i18n/locales'
import { auditDistribution } from './distribution-audit'

const CSP =
  '<meta http-equiv="content-security-policy" content="default-src \'none\'">'

function sha256Source(script: string): string {
  return `sha256-${createHash('sha256').update(script).digest('base64')}`
}

const ICON_LINKS =
  '<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="icon" href="/favicon.ico" sizes="32x32"><link rel="apple-touch-icon" href="/apple-touch-icon.png">'

function pageHtml(
  route: string,
  extraHead = '',
  csp = CSP,
  iconLinks = ICON_LINKS,
): string {
  const alternates = [...LOCALES, 'x-default']
    .map((hreflang) => {
      const locale = hreflang === 'x-default' ? 'en' : hreflang
      return `<link rel="alternate" hreflang="${hreflang}" href="${localeUrl(locale as 'en', route)}">`
    })
    .join('')
  return `<!doctype html><html><head>${csp}${iconLinks}<link rel="canonical" href="${localeUrl('en', route)}">${alternates}${extraHead}</head><body>ok</body></html>`
}

function sitemapXml(routes: readonly string[]): string {
  const urls = routes.map(
    (route) => `<url><loc>${localeUrl('en', route)}</loc></url>`,
  )
  return `<urlset>${urls.join('')}</urlset>`
}

describe('auditDistribution', () => {
  let distribution = ''

  function write(relative: string, content: string) {
    const file = path.join(distribution, relative)
    mkdirSync(path.dirname(file), { recursive: true })
    writeFileSync(file, content)
  }

  beforeEach(() => {
    distribution = mkdtempSync(path.join(tmpdir(), 'distribution-audit-'))
    write('index.html', pageHtml('/'))
    write('emojis/fire/index.html', pageHtml('/emojis/fire/'))
    write('sitemap.xml', sitemapXml(['/', '/emojis/fire/']))
    for (const icon of ['favicon.svg', 'favicon.ico', 'apple-touch-icon.png']) {
      write(icon, 'icon')
    }
  })

  afterEach(() => {
    rmSync(distribution, { recursive: true, force: true })
  })

  it('passes a clean build', () => {
    expect(auditDistribution(distribution)).toEqual([])
  })

  it('flags a page without favicon links', () => {
    write('emojis/fire/index.html', pageHtml('/emojis/fire/', '', CSP, ''))
    const problems = auditDistribution(distribution)
    expect(problems).toEqual([
      'emojis/fire/index.html: missing favicon link',
      'emojis/fire/index.html: missing favicon fallback link',
      'emojis/fire/index.html: missing apple touch icon link',
    ])
  })

  it('accepts the shortcut icon relation Starlight emits', () => {
    write(
      'index.html',
      pageHtml(
        '/',
        '',
        CSP,
        ICON_LINKS.replace(
          'rel="icon" href="/favicon.svg"',
          'rel="shortcut icon" href="/favicon.svg"',
        ),
      ),
    )
    expect(auditDistribution(distribution)).toEqual([])
  })

  it('flags a missing icon file', () => {
    rmSync(path.join(distribution, 'favicon.ico'))
    expect(auditDistribution(distribution)).toEqual([
      'favicon.ico: missing from the build output',
    ])
  })

  it('reports a missing dist folder', () => {
    const missing = path.join(distribution, 'nope')
    expect(existsSync(missing)).toBe(false)
    expect(auditDistribution(missing)).toHaveLength(1)
  })

  it('flags a third-party script, stylesheet, image and css url', () => {
    write(
      'index.html',
      pageHtml(
        '/',
        '<script src="https://cdn.example.com/a.js"></script><link rel="stylesheet" href="https://fonts.googleapis.com/css">' +
          '<img src="//tracker.example.net/p.gif" srcset="https://img.example.org/a.png 1x">',
      ),
    )
    write('_astro/a.css', 'a{background:url(https://evil.example.io/x.png)}')
    const problems = auditDistribution(distribution).join('\n')
    expect(problems).toContain('cdn.example.com')
    expect(problems).toContain('fonts.googleapis.com')
    expect(problems).toContain('tracker.example.net')
    expect(problems).toContain('img.example.org')
    expect(problems).toContain('evil.example.io')
  })

  it('allows first-party hosts, namespaces and plain outbound links', () => {
    write(
      'index.html',
      pageHtml(
        '/',
        '<img src="https://animated-fluent-emojis-cdn.andryore.dev/a.png"><a href="https://github.com/x/y">repo</a><svg xmlns="http://www.w3.org/2000/svg"></svg>',
      ),
    )
    expect(auditDistribution(distribution)).toEqual([])
  })

  it('flags a page without a content security policy', () => {
    write('index.html', pageHtml('/').replace(CSP, ''))
    expect(auditDistribution(distribution).join('\n')).toContain(
      'content security policy',
    )
  })

  it('flags a page without a canonical link', () => {
    write(
      'index.html',
      pageHtml('/').replace(/<link rel="canonical"[^>]*>/, ''),
    )
    expect(auditDistribution(distribution).join('\n')).toContain('canonical')
  })

  it('flags a page without hreflang alternates', () => {
    write(
      'emojis/fire/index.html',
      pageHtml('/emojis/fire/').replaceAll(/<link rel="alternate"[^>]*>/g, ''),
    )
    expect(auditDistribution(distribution).join('\n')).toContain('hreflang')
  })

  it('flags a page that misses one locale alternate', () => {
    write(
      'index.html',
      pageHtml('/').replace(/<link rel="alternate" hreflang="ja"[^>]*>/, ''),
    )
    expect(auditDistribution(distribution).join('\n')).toContain('hreflang ja')
  })

  it('flags a page missing from the sitemap', () => {
    write('sitemap.xml', sitemapXml(['/']))
    expect(auditDistribution(distribution).join('\n')).toContain(
      '/emojis/fire/',
    )
  })

  it('flags an inline script the policy does not allow', () => {
    write('index.html', pageHtml('/', '<script>window.a = 1</script>'))
    expect(auditDistribution(distribution).join('\n')).toContain(
      'inline script',
    )
  })

  it('accepts inline scripts the policy hashes, and ignores data blocks and attributes', () => {
    const script = 'window.a = 1'
    const csp = `<meta http-equiv="content-security-policy" content="script-src 'self' '${sha256Source(script)}'">`
    write(
      'index.html',
      pageHtml(
        '/',
        `<script>${script}</script><script type="application/ld+json">{}</script><div data-code="<script>x()</script>"></div>`,
        csp,
      ),
    )
    expect(auditDistribution(distribution)).toEqual([])
  })

  it('ignores noindex and redirect pages', () => {
    write(
      '404.html',
      '<html><head><meta name="robots" content="noindex"></head></html>',
    )
    write(
      'old/index.html',
      '<html><head><meta http-equiv="refresh" content="0;url=/"></head></html>',
    )
    expect(auditDistribution(distribution)).toEqual([])
  })
})
