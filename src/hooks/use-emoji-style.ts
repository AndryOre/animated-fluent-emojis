import { useEffect, useState } from 'react'

import { emojiManifestPromise, type EmojiManifest } from '../utils/index.js'

export interface UseEmojiStyleResult {
  emoji: EmojiManifest | null
}

/**
 * Loads the manifest entry for an emoji.
 * @param id - Key of the emoji in the CDN manifest.
 * @returns The emoji manifest data, or null if not found.
 */
export const useEmojiStyle = (id: string): UseEmojiStyleResult => {
  const [emoji, setEmoji] = useState<EmojiManifest | null>(null)

  useEffect(() => {
    const fetchEmojiData = async () => {
      try {
        const manifest = await emojiManifestPromise
        setEmoji(manifest[id] ?? null)
      } catch (error) {
        console.error('Error fetching emoji data:', error)
        setEmoji(null)
      }
    }

    void fetchEmojiData()
  }, [id])

  return { emoji }
}
