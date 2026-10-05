/**
 * Represents the animation properties of an emoji.
 */
interface Animation {
  /** The frames per second of the animation. */
  fps: number
  /** The total number of frames in the animation. */
  framesCount: number
  /** The index of the first frame in the animation. */
  firstFrame: number
}

/**
 * Represents an individual emoticon.
 */
interface Emoticon {
  /** Unique identifier for the emoticon. */
  id: string
  /** Human-readable description of the emoticon. */
  description: string
  /** Array of shortcut strings to represent this emoticon. */
  shortcuts: string[]
  /** Unicode representation of the emoticon. */
  unicode: string
  /** Entity tag for caching purposes. */
  etag: string
  /** Whether this emoticon has diverse (skin tone) variants. */
  diverse: boolean
  /** Animation properties for this emoticon. */
  animation: Animation
  /** Set to `"official"` on emoticons sourced from the official repository. Ignored at runtime. */
  origin?: 'official'
  /** Array of keywords associated with this emoticon. */
  keywords: string[]
}

/**
 * Represents a category of emoticons.
 */
interface Category {
  /** Unique identifier for the category. */
  id: string
  /** The display title of the category. */
  title: string
  /** A brief description of the category. */
  description: string
  /** An array of Emoticon objects in this category. */
  emoticons: Emoticon[]
}

/**
 * Represents the entire manifest structure.
 */
export interface Manifest {
  /** An array of Category objects representing all emoji categories. */
  categories: Category[]
}

/**
 * Extends the Emoticon interface with category information.
 */
export interface EmojiManifest extends Emoticon {
  /** The category to which this emoji belongs. */
  category: string
}

/**
 * Skin tones an emoji can be rendered with.
 */
export type SkinTone =
  'default' | 'light' | 'medium-light' | 'medium' | 'medium-dark' | 'dark'

/**
 * Represents the properties for the Emoji component.
 */
export interface EmojiProps {
  /** The unique identifier of the emoji. */
  id: string
  /** The size of the emoji in pixels. Default is 100. */
  size?: number
  /** Whether to play the animation on hover. Default is false. */
  playOnHover?: boolean
  /** The number of times to play the animation, or 'infinite'. Default is 2. */
  animationIterations?: number | 'infinite'
  /** Whether to automatically play the animation on mount. Default is true. */
  autoPlay?: boolean
  /** The skin tone, for emojis that support it. Default is 'default'. */
  skinTone?: SkinTone
  /** Accessible text. Defaults to the emoji description; an empty string marks the emoji as decorative. */
  alt?: string
}
