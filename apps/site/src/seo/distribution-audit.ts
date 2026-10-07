import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { LOCALES, SITE_ORIGIN } from '../i18n/locales'

const FIRST_PARTY_HOST_PATTERN = /(^|\.)andryore\.dev$/
const ICON_FILES = ['favicon.svg', 'favicon.ico', 'apple-touch-icon.png']
const LOADING_LINK_RELATIONS = new Set([
  'stylesheet',
  'preload',
  'modulepreload',
  'prefetch',
  'preconnect',
  'dns-prefetch',
  'icon',
  'apple-touch-icon',
  'manifest',
])
const SOURCE_TAG_PATTERN =
  /<(?:script|img|iframe|source|video|audio|embed|object|track|input)\b[^>]*>/gi
const LINK_TAG_PATTERN = /<link\b[^>]*>/gi
const CSS_URL_PATTERN = /url\(\s*['"]?([^'")\s]+)/gi
const CSS_IMPORT_PATTERN = /@import\s+['"]([^'"]+)/gi

function attribute(tag: string, name: string): string | undefined {
  const pattern = new RegExp(
    String.raw`\s${name}\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))`,
    'i',
  )
  const match = pattern.exec(tag)
  return match?.[1] ?? match?.[2] ?? match?.[3]
}

function isThirdParty(reference: string): boolean {
  if (!/^(?:https?:)?\/\//i.test(reference)) return false
  try {
    const { hostname } = new URL(reference, SITE_ORIGIN)
    return !FIRST_PARTY_HOST_PATTERN.test(hostname)
  } catch {
    return true
  }
}

function srcsetUrls(value: string): string[] {
  return value
    .split(',')
    .flatMap((candidate) => candidate.trim().split(/\s+/).slice(0, 1))
}

function requestedUrls(html: string): string[] {
  const urls: string[] = []
  for (const [tag] of html.matchAll(SOURCE_TAG_PATTERN)) {
    const source = attribute(tag, 'src')
    if (source) urls.push(source)
    const srcset = attribute(tag, 'srcset')
    if (srcset) urls.push(...srcsetUrls(srcset))
  }
  for (const [tag] of html.matchAll(LINK_TAG_PATTERN)) {
    const relations = (attribute(tag, 'rel') ?? '').toLowerCase().split(/\s+/)
    const href = attribute(tag, 'href')
    if (
      href &&
      relations.some((relation) => LOADING_LINK_RELATIONS.has(relation))
    ) {
      urls.push(href)
    }
  }
  return urls
}

const TAG_OR_SCRIPT_PATTERN = /<([a-z][\w-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/gi
const DATA_SCRIPT_TYPE_PATTERN =
  /type\s*=\s*["']?(?:application\/(?:ld\+)?json|importmap)/i

function inlineScripts(html: string): string[] {
  const scripts: string[] = []
  for (const match of html.matchAll(TAG_OR_SCRIPT_PATTERN)) {
    const [tag, name = '', attributes = ''] = match
    if (
      name.toLowerCase() !== 'script' ||
      /\ssrc\s*=/i.test(attributes) ||
      DATA_SCRIPT_TYPE_PATTERN.test(attributes)
    )
      continue
    const start = match.index + tag.length
    const end = html.indexOf('</script>', start)
    if (end !== -1) scripts.push(html.slice(start, end))
  }
  return scripts
}

function cssUrls(css: string): string[] {
  const matches = [
    ...css.matchAll(CSS_URL_PATTERN),
    ...css.matchAll(CSS_IMPORT_PATTERN),
  ]
  return matches.map((match) => match[1] ?? '')
}

function thirdPartyProblems(route: string, urls: readonly string[]): string[] {
  return urls
    .filter((url) => isThirdParty(url))
    .map((url) => `${route}: third-party request to ${url}`)
}

function walk(directory: string): string[] {
  const files: string[] = []
  const entries = readdirSync(directory, { withFileTypes: true })
  for (const entry of entries) {
    const full = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...walk(full))
    else files.push(full)
  }
  return files
}

function isIndexable(html: string): boolean {
  return (
    !/<meta[^>]+name=["']robots["'][^>]*noindex/i.test(html) &&
    !/http-equiv=["']refresh["']/i.test(html)
  )
}

function auditPage(
  route: string,
  html: string,
  sitemapLocations: ReadonlySet<string>,
): string[] {
  const problems: string[] = []
  if (!/http-equiv=["']content-security-policy["']/i.test(html)) {
    problems.push(`${route}: missing content security policy`)
  }
  const policy =
    /http-equiv=["']content-security-policy["'][^>]*content="([^"]*)"|content="([^"]*)"[^>]*http-equiv=["']content-security-policy["']/i.exec(
      html,
    )
  const policyText = policy?.[1] ?? policy?.[2] ?? ''
  for (const script of inlineScripts(html)) {
    const hash = createHash('sha256').update(script).digest('base64')
    if (!policyText.includes(`'sha256-${hash}'`)) {
      problems.push(
        `${route}: inline script not allowed by the content security policy: ${script.trim().slice(0, 60)}`,
      )
    }
  }
  const links = html
    .matchAll(LINK_TAG_PATTERN)
    .map(([tag]) => tag)
    .toArray()
  const canonical = links
    .filter((tag) => attribute(tag, 'rel') === 'canonical')
    .map((tag) => attribute(tag, 'href'))[0]
  if (!canonical) {
    problems.push(`${route}: missing canonical link`)
  } else if (!sitemapLocations.has(canonical)) {
    problems.push(`${route}: ${canonical} is not listed in the sitemap`)
  }
  const hasIcon = (predicate: (tag: string) => boolean) =>
    links.some((tag) => {
      const relations = (attribute(tag, 'rel') ?? '').toLowerCase().split(/\s+/)
      return (
        predicate(tag) &&
        relations.some((r) => r === 'icon' || r === 'apple-touch-icon')
      )
    })
  if (!hasIcon((tag) => attribute(tag, 'href') === '/favicon.svg')) {
    problems.push(`${route}: missing favicon link`)
  }
  if (!hasIcon((tag) => attribute(tag, 'href') === '/favicon.ico')) {
    problems.push(`${route}: missing favicon fallback link`)
  }
  if (!hasIcon((tag) => attribute(tag, 'href') === '/apple-touch-icon.png')) {
    problems.push(`${route}: missing apple touch icon link`)
  }
  const alternates = new Set(
    links
      .filter((tag) => attribute(tag, 'rel') === 'alternate')
      .map((tag) => attribute(tag, 'hreflang')),
  )
  for (const hreflang of [...LOCALES, 'x-default']) {
    if (!alternates.has(hreflang)) {
      problems.push(`${route}: missing hreflang ${hreflang}`)
    }
  }
  return problems
}

/**
 * Audits a built site folder. Every indexable page needs a content security
 * policy, a canonical link listed in the sitemap, favicon, ICO fallback and
 * apple touch icon links, and hreflang alternates for every locale plus
 * `x-default`; no page or stylesheet may request a resource
 * from a host outside `andryore.dev`.
 * @param distribution - The build output folder.
 * @returns One message per problem, empty when the build is clean.
 */
export function auditDistribution(distribution: string): string[] {
  if (!existsSync(distribution))
    return [`${distribution}: build output folder does not exist`]
  const sitemapFile = path.join(distribution, 'sitemap.xml')
  const sitemap = existsSync(sitemapFile)
    ? readFileSync(sitemapFile, 'utf8')
    : ''
  const sitemapLocations = new Set(
    sitemap.matchAll(/<loc>([^<]+)<\/loc>/g).map((match) => match[1] ?? ''),
  )
  const problems = sitemap === '' ? ['sitemap.xml: missing or empty'] : []
  for (const icon of ICON_FILES) {
    if (!existsSync(path.join(distribution, icon))) {
      problems.push(`${icon}: missing from the build output`)
    }
  }
  for (const file of walk(distribution)) {
    const route = path.relative(distribution, file)
    if (file.endsWith('.html')) {
      const html = readFileSync(file, 'utf8')
      problems.push(...thirdPartyProblems(route, requestedUrls(html)))
      if (path.basename(file) === 'index.html' && isIndexable(html)) {
        problems.push(...auditPage(route, html, sitemapLocations))
      }
    } else if (file.endsWith('.css')) {
      const css = readFileSync(file, 'utf8')
      problems.push(...thirdPartyProblems(route, cssUrls(css)))
    }
  }
  return problems
}
