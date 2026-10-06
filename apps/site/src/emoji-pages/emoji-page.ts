import { fileUrl, type PublicEmoji } from '../gallery/public-index'
import { fillTemplate } from '../gallery/template'
import { localeUrl, type Locale } from '../i18n/locales'
import type { SitemapSource } from '../seo/sitemap'

/**
 * How many related emojis an emoji page lists at most.
 */
const RELATED_LIMIT = 12

/**
 * Site path of an emoji page, without a locale prefix.
 * @param slug - The emoji's base slug.
 * @returns The path, with a trailing slash.
 */
export function emojiPagePath(slug: string): string {
  return `/emojis/${slug}/`
}

/**
 * Site path of an emoji's Open Graph image. It is the same for every locale.
 * @param slug - The emoji's base slug.
 * @returns The path of the generated PNG.
 */
export function ogImagePath(slug: string): string {
  return `/og/${slug}.png`
}

/**
 * Picks the emojis shown under an emoji page: the ones that follow it in its
 * category, wrapping around, so neighbouring pages link to different sets.
 * @param emoji - The emoji whose page is rendered.
 * @param all - The public index.
 * @param limit - Maximum number of related emojis.
 * @returns Up to `limit` emojis of the same category, never the emoji itself.
 */
export function relatedEmojis(
  emoji: PublicEmoji,
  all: readonly PublicEmoji[],
  limit: number = RELATED_LIMIT,
): PublicEmoji[] {
  const siblings = all.filter(
    (candidate) => candidate.category === emoji.category,
  )
  const position = siblings.findIndex(
    (candidate) => candidate.slug === emoji.slug,
  )
  return [
    ...siblings.slice(position + 1),
    ...siblings.slice(0, Math.max(position, 0)),
  ].slice(0, limit)
}

/**
 * Builds the schema.org `ImageObject` that describes the emoji's GIF.
 * @param emoji - The emoji whose GIF the object describes.
 * @param name - Its name in the page's locale.
 * @param locale - The page's locale.
 * @returns A JSON-LD object ready to serialise.
 */
export function imageObjectJsonLd(
  emoji: PublicEmoji,
  name: string,
  locale: Locale,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    name,
    contentUrl: fileUrl(emoji.urls.gif),
    thumbnailUrl: fileUrl(emoji.urls.png),
    encodingFormat: 'image/gif',
    url: localeUrl(locale, emojiPagePath(emoji.slug)),
    keywords: emoji.keywords.join(', '),
  }
}

/**
 * Fills the page title or description pattern with the emoji name.
 * @param pattern - A UI string containing `{name}`.
 * @param name - The emoji's name in the page's locale.
 * @returns The filled text.
 */
export function fillName(pattern: string, name: string): string {
  return fillTemplate(pattern, 'name', name)
}

/**
 * Sitemap source with one localized route per emoji page.
 * @param load - Loads the public index.
 * @returns A source that lists every base slug in every locale.
 */
export function createEmojiSitemapSource(
  load: () => Promise<readonly PublicEmoji[]>,
): SitemapSource {
  return async () => {
    const emojis = await load()
    return emojis.map((emoji) => ({
      path: emojiPagePath(emoji.slug),
      localized: true,
    }))
  }
}
