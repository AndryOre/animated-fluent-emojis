import { createHash } from 'node:crypto'

/**
 * Token in `docker/security-headers.conf` replaced with the built script
 * hashes.
 */
const SCRIPT_HASHES_PLACEHOLDER = '__SCRIPT_HASHES__'

const HASH_SOURCE = /'sha(?:256|384|512)-[^']+'/g
const OPENING_TAG = /<([a-z][\w-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/gi
const META_CSP_TAG =
  /<meta http-equiv="content-security-policy" content="(?<policy>[^"]*)"[^>]*>/gi

/**
 * A built HTML page.
 */
export interface BuiltPage {
  file: string
  html: string
}

/**
 * Hash sources in the `script-src` directive of the Astro-emitted CSP meta tag.
 * @param html - A built page.
 * @returns The quoted hash sources, or an empty list without a CSP meta tag.
 */
export function collectMetaScriptHashes(html: string): string[] {
  const policy = new RegExp(META_CSP_TAG.source, 'i').exec(html)?.groups?.policy
  const scriptDirective = (policy ?? '')
    .split(';')
    .map((directive) => directive.trim())
    .find((directive) => directive.startsWith('script-src '))
  return scriptDirective?.match(HASH_SOURCE) ?? []
}

/**
 * Removes the Astro CSP meta tag, so the header is the only policy served.
 * @param html - A built page.
 * @returns The page without its CSP meta tag.
 */
export function stripMetaCsp(html: string): string {
  return html.replaceAll(META_CSP_TAG, '')
}

/**
 * SHA-256 CSP sources for every executable inline script in a page.
 * @param html - A built page.
 * @returns One quoted hash source per inline script that is not a data block.
 */
export function findInlineScriptHashes(html: string): string[] {
  const tag = new RegExp(OPENING_TAG.source, 'gi')
  const hashes: string[] = []
  for (let match = tag.exec(html); match; match = tag.exec(html)) {
    if (match[1]?.toLowerCase() !== 'script') continue
    const end = html.indexOf('</script', tag.lastIndex)
    const body = html.slice(tag.lastIndex, end === -1 ? undefined : end)
    tag.lastIndex = end === -1 ? html.length : end
    const attributes = match[2] ?? ''
    const type = /\btype\s*=\s*["']?([^"'\s>]*)/i.exec(attributes)?.[1]
    if (/\ssrc\s*=/i.test(attributes) || (type && type !== 'module')) continue
    const digest = createHash('sha256').update(body).digest('base64')
    hashes.push(`'sha256-${digest}'`)
  }
  return hashes
}

/**
 * Fills the header template with the sorted, de-duplicated script hashes.
 * @param template - The nginx header snippet containing the placeholder.
 * @param hashes - Quoted hash sources to allow.
 * @returns The rendered snippet.
 * @throws {Error} When no hashes are given, which would silently block every script.
 */
export function renderSecurityHeaders(
  template: string,
  hashes: readonly string[],
): string {
  if (hashes.length === 0) {
    throw new Error('No script hashes found in the built pages')
  }
  const rendered = [...new Set(hashes)]
    .toSorted((first, second) => first.localeCompare(second))
    .join(' ')
  return template.replace(SCRIPT_HASHES_PLACEHOLDER, () => rendered)
}

/**
 * Checks every inline script against the hashes Astro declared and renders
 * the header snippet.
 * @param pages - The built HTML pages.
 * @param template - The nginx header snippet containing the placeholder.
 * @returns The rendered snippet and the pages without their CSP meta tag.
 * @throws {Error} When an inline script has no declared hash.
 */
export function prepareSecurityHeaders(
  pages: readonly BuiltPage[],
  template: string,
): { snippet: string; pages: BuiltPage[] } {
  const allowed = new Set(
    pages.flatMap(({ html }) => collectMetaScriptHashes(html)),
  )
  const unhashed = pages.flatMap(({ file, html }) =>
    findInlineScriptHashes(html)
      .filter((hash) => !allowed.has(hash))
      .map((hash) => `${file} ${hash}`),
  )
  if (unhashed.length > 0) {
    throw new Error(
      `Inline scripts missing from the CSP:\n${unhashed.join('\n')}`,
    )
  }
  return {
    snippet: renderSecurityHeaders(template, [...allowed]),
    pages: pages.map(({ file, html }) => ({
      file,
      html: stripMetaCsp(html),
    })),
  }
}
