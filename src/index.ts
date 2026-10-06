import { Emoji as ReactEmoji } from './react/index.js'

/**
 * @deprecated Import `Emoji` from `animated-fluent-emojis/react` instead. The
 * root export is removed in 0.7.
 */
export const Emoji: typeof ReactEmoji = ReactEmoji
export { createEmoji } from './vanilla/create-emoji.js'
export type {
  EmojiController,
  EmojiFallback,
  EmojiOptions,
} from './vanilla/create-emoji.js'
export { configureEmojis, preloadEmojis } from './utils/emoji-manifest.js'
export type { DiverseEmojiId, EmojiId } from './utils/emoji-id.generated.js'
export type { EmojiProps, SkinTone } from './utils/types.js'
