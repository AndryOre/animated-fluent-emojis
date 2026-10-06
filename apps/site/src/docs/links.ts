import type { Locale } from '../i18n/locales'
import { docRoute, githubBlobUrl, isPublishedDocument } from './published'

/**
 * Where a rendered page's Markdown lives and which locale it renders for.
 */
export interface LinkContext {
  docPath: string
  locale: Locale
}

const NOT_RELATIVE = /^(?:[a-z][a-z0-9+.-]*:|\/|#)/i

function resolveSegments(segments: string[]): string[] | undefined {
  const resolved: string[] = []
  for (const segment of segments) {
    if (segment === '..') {
      if (resolved.length === 0) return undefined
      resolved.pop()
    } else if (segment !== '.' && segment !== '') {
      resolved.push(segment)
    }
  }
  return resolved
}

/**
 * Rewrites a relative link found in a doc. A link to a published doc becomes
 * its site route in the page's locale; a link to any other repository file
 * becomes a GitHub blob URL on `main`. Anchors, absolute paths, URLs with a
 * scheme and links that escape the repository are left alone.
 * @param href - The link target as written in the Markdown.
 * @param context - The doc containing the link and the locale it renders for.
 * @returns The rewritten target.
 */
export function rewriteDocumentLink(
  href: string,
  context: LinkContext,
): string {
  if (NOT_RELATIVE.test(href)) return href
  const match = /^([^#?]*)([?#].*)?$/.exec(href)
  const target = match?.[1] ?? ''
  if (target === '') return href
  const fragment = match?.[2]?.startsWith('#') ? match[2] : ''
  const repositorySegments = resolveSegments([
    'docs',
    ...context.docPath.split('/').slice(0, -1),
    ...target.split('/'),
  ])
  if (!repositorySegments) return href
  const [first, ...rest] = repositorySegments
  const docPath = rest.join('/')
  return first === 'docs' && isPublishedDocument(docPath)
    ? `${docRoute(context.locale, docPath)}${fragment}`
    : `${githubBlobUrl(repositorySegments.join('/'))}${fragment}`
}
