import { useEffect, type ReactElement } from 'react'

import { useEmojiAnimation, useEmojiStyle } from '../hooks/index.js'
import { generateEmojiStyle, type EmojiProps } from '../utils/index.js'
import styles from './Emoji.module.css'

/**
 * Emoji component for displaying animated emojis.
 * @param props - The properties for the Emoji component.
 * @param props.id - The unique identifier of the emoji.
 * @param props.size - The size of the emoji in pixels.
 * @param props.playOnHover - Whether to play the animation on hover.
 * @param props.animationIterations - How many times to play the animation, or 'infinite'.
 * @param props.autoPlay - Whether to automatically play the animation on mount.
 * @returns The rendered Emoji component or null if the emoji is not found.
 */
export const Emoji = ({
  id,
  size = 100,
  playOnHover = false,
  animationIterations = 2,
  autoPlay = true,
}: EmojiProps): ReactElement | null => {
  const { emoji, categoryFolder } = useEmojiStyle(id)
  const {
    isInitialAnimationComplete,
    animationStyle,
    handleMouseEnter,
    handleMouseLeave,
    imageRef,
  } = useEmojiAnimation(emoji, playOnHover, animationIterations, autoPlay, size)

  useEffect(() => {
    if (!emoji) return

    const styleId = `emoji-style-${id}-${String(size)}`
    let styleElement = document.querySelector(`#${styleId}`)

    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = styleId
      document.head.append(styleElement)
    }

    const targetElement = styleElement
    void generateEmojiStyle(id, size).then((style) => {
      targetElement.innerHTML = style
    })

    return () => {
      if (document.head.contains(targetElement)) {
        targetElement.remove()
      }
    }
  }, [id, size, emoji])

  if (!emoji) {
    return null
  }

  const containerStyle = {
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    display: 'inline-block',
    overflow: 'hidden',
  }
  const containerClassName = [
    styles.emojiContainer,
    isInitialAnimationComplete && playOnHover ? styles.animateOnHover : '',
  ]
    .join(' ')
    .trim()

  return (
    <span
      title={emoji.description}
      style={containerStyle}
      className={containerClassName}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <img
        ref={imageRef}
        alt={emoji.description}
        draggable="false"
        src={`https://cdn.animated-fluent-emojis.com/sprites/${categoryFolder}/${id}.png`}
        style={animationStyle}
        className={styles.emojiImage}
      />
    </span>
  )
}
