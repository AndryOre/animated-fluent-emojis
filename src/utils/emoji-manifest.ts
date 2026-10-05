import type { EmojiManifest, Manifest, SkinTone } from './types.js'

/**
 * Origin that serves the manifest and the sprite sheets.
 */
export const CDN_BASE_URL = 'https://animated-fluent-emojis.pages.dev'

const SKIN_TONE_SUFFIXES: Readonly<Record<SkinTone, string>> = {
  default: '',
  light: '_s2',
  'medium-light': '_s3',
  medium: '_s4',
  'medium-dark': '_s5',
  dark: '_s6',
}

/**
 * Fetches the emoji manifest from the CDN.
 * @returns A promise that resolves to the raw manifest data.
 */
async function fetchManifest(): Promise<Manifest> {
  const response = await fetch(`${CDN_BASE_URL}/manifest.json`)
  if (!response.ok) {
    throw new Error(
      `Failed to fetch the emoji manifest (${String(response.status)})`,
    )
  }
  return (await response.json()) as Manifest
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
 * A promise that resolves to the processed emoji manifest.
 */
export const emojiManifestPromise: Promise<Record<string, EmojiManifest>> =
  generateEmojiManifest()

/**
 * Gets the category folder for a given emoji id.
 * @param id - Key of the emoji in the CDN manifest.
 * @returns A promise that resolves to the category folder name.
 * @throws {Error} If the emoji is not found.
 */
export async function getCategoryFolder(id: string): Promise<string> {
  const manifest = await emojiManifestPromise
  const emoji = manifest[id]
  if (!emoji) throw new Error(`Emoji with id "${id}" not found`)
  return emoji.category
}

/**
 * Builds the CSS keyframes that step through an emoji's sprite frames.
 * @param id - Key of the emoji in the CDN manifest.
 * @param size - Rendered edge length of the emoji, in pixels.
 * @returns A promise that resolves to the generated CSS string.
 * @throws {Error} If the emoji is not found.
 */
export async function generateEmojiStyle(
  id: string,
  size: number,
): Promise<string> {
  const manifest = await emojiManifestPromise
  const emoji = manifest[id]
  if (!emoji) throw new Error(`Emoji with id "${id}" not found`)

  return `
    @keyframes emoji-${id}-${String(size)} {
      0% { transform: translateY(0); }
      100% { transform: translateY(-${String(emoji.animation.framesCount * size)}px); }
    }
  `
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
  return `${CDN_BASE_URL}/sprites/${encodeURIComponent(emoji.category)}/${emoji.id}${suffix}.png?v=${encodeURIComponent(emoji.etag)}`
}
