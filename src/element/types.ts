import type { SkinTone } from '../utils/types.js'
/* eslint-disable unicorn/require-module-specifiers, @typescript-eslint/no-namespace -- bare type imports load the modules the augmentations below extend, and JSX typings are namespaces */
import type {} from 'vue'
import type {} from 'solid-js'
import type {} from 'preact'

/**
 * The properties of `<fluent-emoji>`. Each one has a matching kebab-case
 * attribute; setting a property does not rewrite the attribute.
 */
export interface FluentEmojiProperties {
  /** The unique identifier of the emoji. */
  id: string
  /** A number of pixels (default 100) or any CSS length. */
  size: number | string | undefined
  /** Whether to play the animation on hover. */
  playOnHover: boolean | undefined
  /** The number of times to play the animation, or 'infinite'. */
  animationIterations: number | 'infinite' | undefined
  /** Whether to automatically play the animation. */
  autoPlay: boolean | undefined
  /** `true` plays, overriding `autoPlay` and reduced motion; `false` pauses. */
  playing: boolean | undefined
  /** The skin tone, for emojis that support it. */
  skinTone: SkinTone | undefined
  /** Accessible text; an empty string marks the emoji as decorative. */
  alt: string | undefined
}

/**
 * The DOM interface of a `<fluent-emoji>` node, with every property typed.
 */
export interface FluentEmojiElement
  extends HTMLElement, FluentEmojiProperties {}

/**
 * The attributes accepted by `<fluent-emoji>` in markup and JSX.
 */
export interface FluentEmojiAttributes {
  id?: string
  size?: number | string
  'play-on-hover'?: boolean | 'true' | 'false'
  'animation-iterations'?: number | 'infinite'
  'auto-play'?: boolean | 'true' | 'false'
  playing?: boolean | 'true' | 'false'
  'skin-tone'?: SkinTone
  alt?: string
  slot?: string
  class?: string
  style?: string
}

declare global {
  interface HTMLElementTagNameMap {
    'fluent-emoji': FluentEmojiElement
  }
}

declare module 'vue' {
  interface GlobalComponents {
    'fluent-emoji': new () => { $props: FluentEmojiAttributes }
  }
}

declare module 'solid-js' {
  namespace JSX {
    interface IntrinsicElements {
      'fluent-emoji': FluentEmojiAttributes
    }
  }
}

declare module 'preact' {
  namespace JSX {
    interface IntrinsicElements {
      'fluent-emoji': FluentEmojiAttributes
    }
  }
}

/* eslint-enable unicorn/require-module-specifiers, @typescript-eslint/no-namespace -- end of the augmentation block */
