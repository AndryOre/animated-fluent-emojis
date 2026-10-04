import { useEffect, useState } from 'react'

import {
  emojiManifestPromise,
  getCategoryFolder,
  type EmojiManifest,
} from '../utils/index.js'

export interface UseEmojiStyleResult {
  emoji: EmojiManifest | null
  categoryFolder: string
}

/**
 * Loads the manifest entry and category folder for an emoji.
 * @param id - Key of the emoji in the CDN manifest.
 * @returns The emoji manifest data (or null if not found) and its category folder.
 */
export const useEmojiStyle = (id: string): UseEmojiStyleResult => {
  const [emoji, setEmoji] = useState<EmojiManifest | null>(null)
  const [categoryFolder, setCategoryFolder] = useState<string>('')

  useEffect(() => {
    const fetchEmojiData = async () => {
      try {
        const manifest = await emojiManifestPromise
        setEmoji(manifest[id] ?? null)
        setCategoryFolder(await getCategoryFolder(id))
      } catch (error) {
        console.error('Error fetching emoji data:', error)
        setEmoji(null)
        setCategoryFolder('')
      }
    }

    void fetchEmojiData()
  }, [id])

  return { emoji, categoryFolder }
}
