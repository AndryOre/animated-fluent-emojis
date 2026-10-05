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
const VARIATION_SELECTOR_16 = /\u{FE0F}/gu
const SKIN_TONE_MODIFIERS = /[\u{1F3FB}-\u{1F3FF}]/gu
const EMOJI_CLUSTER =
  /[\u{1F1E6}-\u{1F1FF}]{2}|.(?:[\u{FE0E}\u{FE0F}\u{20E3}\u{1F3FB}-\u{1F3FF}\u{E0020}-\u{E007F}]|\u{200D}.)*/gsu

const TONES: readonly SkinTone[] = [
  'light',
  'medium-light',
  'medium',
  'medium-dark',
  'dark',
]

const indexCache = new WeakMap<ManifestRecord, Map<string, EmojiManifest>>()

/**
 * Removes the variation selector so text and catalog glyphs share one key.
 * @param text - One emoji, optionally with VS16 or skin tone modifiers.
 * @returns The text without VS16.
 */
function stripVariationSelector(text: string): string {
  return text.replaceAll(VARIATION_SELECTOR_16, '')
}

/**
 * Tells whether VS16 directly follows the first code point, which marks a
 * text-presentation base such as a copyright sign.
 * @param text - An emoji, if known.
 * @returns Whether the second code point is VS16.
 */
function hasVariationSelectorAfterBase(text: string | undefined): boolean {
  const base = text?.codePointAt(0)
  if (base === undefined) return false
  return text?.codePointAt(base > 0xff_ff ? 2 : 1) === 0xfe_0f
}

/**
 * Indexes the catalog by its unicode without VS16, once per manifest.
 * @param manifest - The loaded manifest.
 * @returns A map from VS16-free unicode to the manifest entry.
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
 * Resolves one emoji text against an already loaded catalog. Emoji-presentation
 * bases match with or without VS16; text-presentation bases require it.
 * @param manifest - The loaded manifest.
 * @param text - A single emoji, with optional VS16 and skin tone modifiers.
 * @returns The match, or undefined when the text is not a catalog emoji.
 */
function resolveEmoji(
  manifest: ManifestRecord,
  text: string,
): EmojiMatch | undefined {
  const index = indexByUnicode(manifest)
  const plain = stripVariationSelector(text)
  const direct = index.get(plain)
  if (direct) {
    return hasVariationSelectorAfterBase(direct.unicode) &&
      !hasVariationSelectorAfterBase(text)
      ? undefined
      : { id: direct.id }
  }
  const modifiers = plain.match(SKIN_TONE_MODIFIERS)
  const base = index.get(plain.replaceAll(SKIN_TONE_MODIFIERS, ''))
  if (!modifiers || !base?.diverse) return undefined
  return new Set(modifiers).size > 1
    ? { id: base.id }
    : {
        id: base.id,
        skinTone: TONES[(modifiers[0].codePointAt(0) ?? 0) - 0x1_f3_fb],
      }
}

/**
 * Splits text into graphemes, falling back to a code point grouper that keeps
 * ZWJ sequences, variation selectors, skin tones, keycaps and flags together
 * when the runtime has no `Intl.Segmenter`.
 * @param text - Free text.
 * @returns The segments with their UTF-16 offsets.
 */
function segmentText(text: string): { segment: string; index: number }[] {
  if (typeof Intl.Segmenter === 'function') {
    return [
      ...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(
        text,
      ),
    ]
  }
  return Array.from(text.matchAll(EMOJI_CLUSTER), (match) => ({
    segment: match[0],
    index: match.index,
  }))
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
  const found: ExtractedEmoji[] = []
  for (const { segment, index } of segmentText(text)) {
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
 * @param options - Optional result limit; a value that is not a positive number means no limit, except 0, which returns nothing.
 * @returns Matching emojis, at most `limit`; empty when the manifest failed to load.
 */
export async function searchEmojis(
  query: string,
  options: SearchEmojisOptions = {},
): Promise<EmojiMatch[]> {
  const manifest = await loadManifestOrUndefined()
  const needle = query.trim().toLowerCase()
  if (!manifest || needle === '') return []
  const requested = options.limit ?? DEFAULT_SEARCH_LIMIT
  if (requested === 0) return []
  const limit = requested > 0 ? requested : Infinity
  const results: EmojiMatch[] = []
  for (const emoji of Object.values(manifest)) {
    if (results.length >= limit) break
    if (emoji.description.toLowerCase().includes(needle)) {
      results.push({ id: emoji.id })
    }
  }
  return results
}
