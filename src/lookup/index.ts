import { loadEmojiManifest } from '../utils/emoji-manifest.js'
import type { EmojiManifest, SkinTone } from '../utils/types.js'

/**
 * An emoji of the catalog resolved from text.
 */
export interface EmojiMatch {
  /** The catalog id of the emoji. */
  id: string
  /** The skin tone found in the text; only set for emojis with skin tone variants. */
  skinTone?: SkinTone
}

/**
 * A catalog emoji found inside a longer text.
 */
export interface ExtractedEmoji extends EmojiMatch {
  /** The matched emoji text, as written in the input. */
  text: string
  /** UTF-16 offset of the match in the input. */
  index: number
  /** UTF-16 length of the match. */
  length: number
}

/**
 * Options for {@link searchEmojis}.
 */
export interface SearchEmojisOptions {
  /** Maximum number of results; defaults to 20. */
  limit?: number
}

type ManifestRecord = Record<string, EmojiManifest>

const DEFAULT_SEARCH_LIMIT = 20
const VARIATION_SELECTOR_16 = /️/g
const SKIN_TONE_MODIFIERS = /[\u{1F3FB}-\u{1F3FF}]/gu

const TONE_BY_MODIFIER: Readonly<Record<string, SkinTone>> = {
  '\u{1F3FB}': 'light',
  '\u{1F3FC}': 'medium-light',
  '\u{1F3FD}': 'medium',
  '\u{1F3FE}': 'medium-dark',
  '\u{1F3FF}': 'dark',
}

const indexCache = new WeakMap<ManifestRecord, Map<string, EmojiManifest>>()

/**
 * Removes the variation selector so text and catalog glyphs compare equal.
 * @param text - One emoji, optionally with VS16 or skin tone modifiers.
 * @returns The text without VS16.
 */
function stripVariationSelector(text: string): string {
  return text.replaceAll(VARIATION_SELECTOR_16, '')
}

/**
 * Indexes the catalog by its normalised unicode, once per manifest.
 * @param manifest - The loaded manifest.
 * @returns A map from normalised unicode to the manifest entry.
 */
function indexByUnicode(manifest: ManifestRecord): Map<string, EmojiManifest> {
  const cached = indexCache.get(manifest)
  if (cached) return cached
  const index = new Map<string, EmojiManifest>()
  for (const emoji of Object.values(manifest)) {
    if (emoji.unicode) index.set(stripVariationSelector(emoji.unicode), emoji)
  }
  indexCache.set(manifest, index)
  return index
}

/**
 * Resolves one emoji text against an already loaded catalog.
 * @param manifest - The loaded manifest.
 * @param text - A single emoji, with optional VS16 and skin tone modifiers.
 * @returns The match, or undefined when the text is not a catalog emoji.
 */
function resolveEmoji(
  manifest: ManifestRecord,
  text: string,
): EmojiMatch | undefined {
  const index = indexByUnicode(manifest)
  const normalized = stripVariationSelector(text)
  const direct = index.get(normalized)
  if (direct) return { id: direct.id }
  const modifier = normalized.match(SKIN_TONE_MODIFIERS)?.[0]
  if (!modifier) return undefined
  const base = index.get(normalized.replaceAll(SKIN_TONE_MODIFIERS, ''))
  return base?.diverse
    ? { id: base.id, skinTone: TONE_BY_MODIFIER[modifier] }
    : undefined
}

/**
 * Loads the shared manifest, resolving to undefined instead of rejecting.
 * @returns The manifest, or undefined when it could not be loaded.
 */
async function loadManifestOrUndefined(): Promise<ManifestRecord | undefined> {
  try {
    return await loadEmojiManifest()
  } catch {
    return undefined
  }
}

/**
 * Finds the catalog emoji for a single emoji character or sequence. Tolerates
 * the variation selector and maps skin tone modifiers to `skinTone`.
 * @param text - One emoji, optionally with VS16 or skin tone modifiers.
 * @returns The match, or undefined when unknown or when the manifest failed to load.
 */
export async function findEmojiByUnicode(
  text: string,
): Promise<EmojiMatch | undefined> {
  const manifest = await loadManifestOrUndefined()
  return manifest ? resolveEmoji(manifest, text) : undefined
}

/**
 * Finds every catalog emoji in a text, segmenting it by grapheme so ZWJ
 * sequences stay whole.
 * @param text - Free text that may contain emojis.
 * @returns The emojis in order of appearance; empty when there are none or the manifest failed to load.
 */
export async function extractEmojis(text: string): Promise<ExtractedEmoji[]> {
  const manifest = await loadManifestOrUndefined()
  if (!manifest) return []
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
  const found: ExtractedEmoji[] = []
  for (const { segment, index } of segmenter.segment(text)) {
    const match = resolveEmoji(manifest, segment)
    if (match) {
      found.push({ ...match, text: segment, index, length: segment.length })
    }
  }
  return found
}

/**
 * Searches the catalog by description, ignoring case.
 * @param query - The text to look for inside descriptions.
 * @param options - Optional result limit.
 * @returns Matching emojis, at most `limit`; empty when the manifest failed to load.
 */
export async function searchEmojis(
  query: string,
  options: SearchEmojisOptions = {},
): Promise<EmojiMatch[]> {
  const manifest = await loadManifestOrUndefined()
  const needle = query.trim().toLowerCase()
  if (!manifest || needle === '') return []
  const limit = options.limit ?? DEFAULT_SEARCH_LIMIT
  const results: EmojiMatch[] = []
  for (const emoji of Object.values(manifest)) {
    if (results.length >= limit) break
    if (emoji.description.toLowerCase().includes(needle)) {
      results.push({ id: emoji.id })
    }
  }
  return results
}
