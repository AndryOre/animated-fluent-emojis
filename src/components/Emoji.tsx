import { type ReactElement } from 'react'

import { useEmojiAnimation, useEmojiStyle } from '../hooks/index.js'
import {
  getSpriteSourceSet,
  getSpriteUrl,
  type EmojiProps,
} from '../utils/index.js'
import styles from './Emoji.module.css'

const DEFAULT_SIZE = 100

const normalizeSize = (size: number): number =>
  Number.isFinite(size) && Math.round(size) > 0
    ? Math.round(size)
    : DEFAULT_SIZE

/**
 * Emoji component for displaying animated emojis.
 * @param props - The properties for the Emoji component.
 * @param props.id - The unique identifier of the emoji.
 * @param props.size - The size of the emoji in pixels. Fractions are rounded; anything but a finite positive number falls back to 100.
 * @param props.playOnHover - Whether to play the animation on hover.
 * @param props.animationIterations - How many times to play the animation, or 'infinite'.
 * @param props.autoPlay - Whether to automatically play the animation on mount.
 * @param props.skinTone - The skin tone, for emojis that support it.
 * @param props.alt - Accessible text, defaults to the emoji description. An empty string marks the emoji as decorative.
 * @returns The emoji, an empty placeholder of the final size while the manifest loads, or null if the emoji is not found or the manifest failed to load.
 */
export const Emoji = ({
  id,
  size: requestedSize = DEFAULT_SIZE,
  playOnHover = false,
  animationIterations = 2,
  autoPlay = true,
  skinTone = 'default',
  alt,
}: EmojiProps): ReactElement | null => {
  const size = normalizeSize(requestedSize)
  const { status, emoji } = useEmojiStyle(id)
  const { isInitialAnimationComplete, animationStyle, imageRef } =
    useEmojiAnimation(emoji, playOnHover, animationIterations, autoPlay, size)

  const containerStyle = {
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    display: 'inline-block',
    overflow: 'hidden',
  }

  if (status === 'loading') {
    return <span aria-hidden="true" style={containerStyle} />
  }

  if (!emoji) {
    return null
  }
  const containerClassName =
    isInitialAnimationComplete && playOnHover ? styles.animateOnHover : ''

  return (
    <span
      aria-hidden={alt === '' || undefined}
      style={containerStyle}
      className={containerClassName}
    >
      <img
        ref={imageRef}
        alt={alt ?? emoji.description}
        loading="lazy"
        decoding="async"
        draggable="false"
        src={getSpriteUrl(emoji, skinTone)}
        srcSet={getSpriteSourceSet(emoji, skinTone)}
        sizes={`${String(size)}px`}
        style={animationStyle}
        className={styles.emojiImage}
      />
    </span>
  )
}
