import { type ReactElement } from 'react'

import { useEmojiAnimation, useEmojiStyle } from '../hooks/index.js'
import { getSpriteUrl, type EmojiProps } from '../utils/index.js'
import styles from './Emoji.module.css'

/**
 * Emoji component for displaying animated emojis.
 * @param props - The properties for the Emoji component.
 * @param props.id - The unique identifier of the emoji.
 * @param props.size - The size of the emoji in pixels.
 * @param props.playOnHover - Whether to play the animation on hover.
 * @param props.animationIterations - How many times to play the animation, or 'infinite'.
 * @param props.autoPlay - Whether to automatically play the animation on mount.
 * @param props.skinTone - The skin tone, for emojis that support it.
 * @returns The rendered Emoji component or null if the emoji is not found.
 */
export const Emoji = ({
  id,
  size = 100,
  playOnHover = false,
  animationIterations = 2,
  autoPlay = true,
  skinTone = 'default',
}: EmojiProps): ReactElement | null => {
  const { emoji } = useEmojiStyle(id)
  const { isInitialAnimationComplete, animationStyle, imageRef } =
    useEmojiAnimation(emoji, playOnHover, animationIterations, autoPlay, size)

  if (!emoji) {
    return null
  }

  const containerStyle = {
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    display: 'inline-block',
    overflow: 'hidden',
  }
  const containerClassName =
    isInitialAnimationComplete && playOnHover ? styles.animateOnHover : ''

  return (
    <span
      title={emoji.description}
      style={containerStyle}
      className={containerClassName}
    >
      <img
        ref={imageRef}
        alt={emoji.description}
        draggable="false"
        src={getSpriteUrl(emoji, skinTone)}
        style={animationStyle}
        className={styles.emojiImage}
      />
    </span>
  )
}
