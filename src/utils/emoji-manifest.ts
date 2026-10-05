import type { EmojiManifest, SkinTone, SlimManifest } from './types.js'

const DEFAULT_ASSET_SITE_URL = 'https://animated-fluent-emojis.pages.dev'

const state: {
  assetSiteUrl: string
  manifestPromise: Promise<Record<string, EmojiManifest>> | null
} = { assetSiteUrl: DEFAULT_ASSET_SITE_URL, manifestPromise: null }

/**
 * Configures where the manifest and the sprite sheets are served from.
 * The manifest is fetched once on first use, so call this before the first
 * `Emoji` renders: changing the asset site afterwards does not refetch the
 * manifest, it only changes the sprite sheet URLs built from then on.
 * @param options - The configuration to apply.
 * @param options.assetSiteUrl - Origin of the asset site, without or with a trailing slash. Defaults to the published asset site.
 */
export function configureEmojis(options: { assetSiteUrl?: string }): void {
  state.assetSiteUrl = (options.assetSiteUrl ?? DEFAULT_ASSET_SITE_URL).replace(
    /\/+$/,
    '',
  )
}

const SKIN_TONE_SUFFIXES: Readonly<Record<SkinTone, string>> = {
  default: '',
  light: '_s2',
  'medium-light': '_s3',
  medium: '_s4',
  'medium-dark': '_s5',
  dark: '_s6',
}

/**
 * Fetches the slim emoji manifest from the asset site.
 * @returns A promise that resolves to the raw manifest data.
 */
async function fetchManifest(): Promise<SlimManifest> {
  const response = await fetch(`${state.assetSiteUrl}/manifest.slim.json`)
  if (!response.ok) {
    throw new Error(
      `Failed to fetch the emoji manifest (${String(response.status)})`,
    )
  }
  return (await response.json()) as SlimManifest
}

/**
 * Generates the emoji manifest from the raw manifest data.
 * @returns A promise that resolves to the processed emoji manifest.
 */
async function generateEmojiManifest(): Promise<Record<string, EmojiManifest>> {
  const rawManifest = await fetchManifest()
  const manifest: Record<string, EmojiManifest> = {}
  for (const category of rawManifest.categories) {
    for (const emoticon of category.emoticons) {
      manifest[emoticon.id] = { ...emoticon, category: category.title }
    }
  }
  return manifest
}

/**
 * Generates the manifest and drops the memoized promise if that fails.
 * @returns A promise that resolves to the manifest keyed by emoji id.
 */
async function loadAndClearOnFailure(): Promise<Record<string, EmojiManifest>> {
  try {
    return await generateEmojiManifest()
  } catch (error) {
    state.manifestPromise = null
    throw error
  }
}

/**
 * Loads the emoji manifest on first use and memoizes the result. A failed load
 * clears the cache so the next caller retries. Nothing is fetched at import.
 * @returns A promise that resolves to the manifest keyed by emoji id.
 */
export function loadEmojiManifest(): Promise<Record<string, EmojiManifest>> {
  state.manifestPromise ??= loadAndClearOnFailure()
  return state.manifestPromise
}

/**
 * Builds the URL of an emoji's sprite sheet.
 * @param emoji - The emoji manifest entry.
 * @param skinTone - The requested skin tone; ignored when the emoji has no variants.
 * @returns The sprite sheet URL, versioned by the emoji's etag.
 */
export function getSpriteUrl(
  emoji: EmojiManifest,
  skinTone: SkinTone = 'default',
): string {
  const suffix = emoji.diverse ? SKIN_TONE_SUFFIXES[skinTone] : ''
  return `${state.assetSiteUrl}/sprites/${encodeURIComponent(emoji.category)}/${emoji.id}${suffix}.png?v=${encodeURIComponent(emoji.etag)}`
}
