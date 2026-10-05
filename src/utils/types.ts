import type {
  HTMLAttributes,
  ReactEventHandler,
  ReactNode,
  SyntheticEvent,
} from 'react'

import type { DiverseEmojiId, EmojiId } from './emoji-id.generated.js'

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
 * The runtime-facing subset of an emoticon, as published in the slim manifest.
 */
interface SlimEmoticon {
  /** Unique identifier for the emoticon. */
  id: string
  /** Human-readable description of the emoticon. */
  description: string
  /** Entity tag for caching purposes. */
  etag: string
  /** Whether this emoticon has diverse (skin tone) variants. */
  diverse: boolean
  /** Animation properties for this emoticon. */
  animation: Animation
  /** Whether the asset site also serves an HD sprite sheet for this emoticon. */
  hd?: boolean
  /** The emoji as a Unicode string, used as the fallback glyph. */
  unicode?: string
}

/**
 * An emoticon as published in the compact v1 slim manifest. Omitted fields
 * mean `fps` 24, `firstFrame` 1, `diverse` false and `hd` false.
 */
interface CompactEmoticon {
  /** Unique identifier for the emoticon. */
  id: string
  /** Human-readable description of the emoticon. */
  description: string
  /** Entity tag for caching purposes. */
  etag: string
  /** The emoji as a Unicode string, used as the fallback glyph. */
  unicode?: string
  /** Animation properties; `fps` and `firstFrame` are omitted at their defaults. */
  animation: Partial<Animation> & Pick<Animation, 'framesCount'>
  /** Present and true when the emoticon has skin tone variants. */
  diverse?: true
  /** Present and true when the asset site serves an HD sprite sheet. */
  hd?: true
}

/**
 * The compact v1 slim manifest as fetched, before defaults are restored.
 */
export interface CompactManifest {
  /** The emoji categories. */
  categories: {
    id: string
    title: string
    description: string
    emoticons: CompactEmoticon[]
  }[]
}

/**
 * Represents an individual emoticon of the full manifest, used by the asset pipeline.
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
 * A slim manifest entry with the title of its category.
 */
export interface EmojiManifest extends SlimEmoticon {
  /** The category to which this emoji belongs. */
  category: string
}

/**
 * Skin tones an emoji can be rendered with.
 */
export type SkinTone =
  'default' | 'light' | 'medium-light' | 'medium' | 'medium-dark' | 'dark'

/**
 * Props the component controls itself, so they are not passed to the root span.
 */
type ControlledSpanProps = 'id' | 'children' | 'onLoad' | 'onError'

/**
 * The base properties of the Emoji component, without the id-dependent
 * `skinTone` rule. Any other prop is passed to the root span.
 */
interface EmojiBaseProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  ControlledSpanProps
> {
  /** The unique identifier of the emoji. Known ids autocomplete; any string compiles. */
  id: EmojiId | (string & {})
  /** The size of the emoji in pixels. Default is 100. */
  size?: number
  /** Whether to play the animation on hover. Default is false. */
  playOnHover?: boolean
  /** The number of times to play the animation, or 'infinite'. Default is 2. */
  animationIterations?: number | 'infinite'
  /** Whether to automatically play the animation on mount. Default is true. */
  autoPlay?: boolean
  /** Accessible text. Defaults to the emoji description; an empty string marks the emoji as decorative. */
  alt?: string
  /** Rendered when the image fails or the manifest fails to load. Defaults to the emoji's Unicode glyph when known; `null` renders nothing. */
  fallback?: ReactNode
  /** Called when the image loads. */
  onLoad?: ReactEventHandler<HTMLImageElement>
  /** Called when the image fails to load, and with no event when the manifest fails to load. */
  onError?: (event?: SyntheticEvent<HTMLImageElement>) => void
}

/**
 * Ids that are known not to support skin tones.
 */
type NonDiverseEmojiId = Exclude<EmojiId, DiverseEmojiId>

/**
 * The `skinTone` prop, rejected when `Id` is a known id without skin tone
 * variants and accepted for diverse ids and arbitrary strings.
 */
type SkinToneProps<Id extends string> = [Id] extends [NonDiverseEmojiId]
  ? { skinTone?: never }
  : {
      /** The skin tone, for emojis that support it. Default is 'default'. */
      skinTone?: SkinTone
    }

/**
 * Represents the properties for the Emoji component. `skinTone` is only
 * accepted when `Id` is a diverse or an arbitrary string id.
 */
export type EmojiProps<Id extends string = string> = Omit<
  EmojiBaseProps,
  'id'
> & { id: Id | EmojiId | (string & {}) } & SkinToneProps<Id>
