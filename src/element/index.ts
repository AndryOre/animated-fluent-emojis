import { defineFluentEmoji } from './fluent-emoji.js'

// eslint-disable-next-line unicorn/no-top-level-side-effects -- importing this entry is meant to register the element
defineFluentEmoji()

export { FLUENT_EMOJI_PRE_UPGRADE_CSS } from './fluent-emoji.js'
export type {
  FluentEmojiAttributes,
  FluentEmojiElement,
  FluentEmojiProperties,
} from './types.js'
