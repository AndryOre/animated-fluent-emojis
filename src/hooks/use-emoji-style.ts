import { useEffect, useState } from 'react'

import { loadEmojiManifest, type EmojiManifest } from '../utils/index.js'

export type UseEmojiStyleResult =
  | { status: 'loading'; emoji: null }
  | { status: 'ready'; emoji: EmojiManifest }
  | { status: 'missing'; emoji: null }

interface Resolution {
  id: string
  emoji: EmojiManifest | null
}

/**
 * Loads the manifest entry for an emoji.
 * @param id - Key of the emoji in the manifest.
 * @returns `loading` while the manifest is pending, `ready` with the entry, or
 * `missing` when the id is unknown or the manifest failed to load.
 */
export const useEmojiStyle = (id: string): UseEmojiStyleResult => {
  const [resolution, setResolution] = useState<Resolution | null>(null)

  useEffect(() => {
    let isCurrent = true

    const resolve = async () => {
      let emoji: EmojiManifest | null = null
      try {
        const manifest = await loadEmojiManifest()
        emoji = manifest[id] ?? null
      } catch (error) {
        console.error('Error fetching emoji data:', error)
      }
      if (isCurrent) setResolution({ id, emoji })
    }

    void resolve()
    return () => {
      isCurrent = false
    }
  }, [id])

  if (resolution?.id !== id) return { status: 'loading', emoji: null }
  return resolution.emoji
    ? { status: 'ready', emoji: resolution.emoji }
    : { status: 'missing', emoji: null }
}
