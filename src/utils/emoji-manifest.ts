import type { EmojiManifest, Manifest } from './types.js'

/**
 * Fetches the emoji manifest from the CDN.
 * @returns A promise that resolves to the raw manifest data.
 */
async function fetchManifest(): Promise<Manifest> {
  const response = await fetch(
    'https://cdn.animated-fluent-emojis.com/manifest.json',
  )
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
