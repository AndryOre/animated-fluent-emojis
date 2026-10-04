import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react'

import type { EmojiManifest } from '../utils/index.js'

export interface UseEmojiAnimationResult {
  isInitialAnimationComplete: boolean
  animationStyle: CSSProperties
  handleMouseEnter: () => void
  handleMouseLeave: () => void
  imageRef: RefObject<HTMLImageElement | null>
}

/**
 * Custom hook for managing emoji animation.
 * @param emoji - The emoji manifest data or null if not loaded.
 * @param playOnHover - Whether to play the animation on hover.
 * @param animationIterations - The number of animation iterations.
 * @param autoPlay - Whether to autoplay the animation.
 * @param size - The size of the emoji in pixels.
 * @returns Animation state, style, mouse handlers and the image element ref.
 */
export const useEmojiAnimation = (
  emoji: EmojiManifest | null,
  playOnHover: boolean,
  animationIterations: number | 'infinite',
  autoPlay: boolean,
  size: number,
): UseEmojiAnimationResult => {
  const [isInitialAnimationComplete, setIsInitialAnimationComplete] =
    useState(!autoPlay)
  const [isHovered, setIsHovered] = useState(false)
  const animationCountRef = useRef(0)
  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (!emoji) return

    const handleAnimationIteration = () => {
      animationCountRef.current += 1
      if (
        !isInitialAnimationComplete &&
        typeof animationIterations === 'number' &&
        animationCountRef.current >= animationIterations
      ) {
        setIsInitialAnimationComplete(true)
      }
    }

    const handleAnimationEnd = () => {
      if (!isInitialAnimationComplete) {
        setIsInitialAnimationComplete(true)
      }
    }

    const imgElement = imageRef.current
    if (imgElement) {
      imgElement.addEventListener(
        'animationiteration',
        handleAnimationIteration,
      )
      imgElement.addEventListener('animationend', handleAnimationEnd)
    }

    return () => {
      if (!imgElement) return

      imgElement.removeEventListener(
        'animationiteration',
        handleAnimationIteration,
      )
      imgElement.removeEventListener('animationend', handleAnimationEnd)
    }
  }, [emoji, animationIterations, isInitialAnimationComplete])

  useEffect(() => {
    if (!playOnHover || !isInitialAnimationComplete || !emoji) return

    const imgElement = imageRef.current
    if (!imgElement) return

    if (isHovered) {
      imgElement.style.animationPlayState = 'running'
    } else {
      imgElement.style.animationPlayState = 'paused'
      imgElement.style.transform = `translateY(-${String(
        (emoji.animation.firstFrame - 1) * size,
      )}px)`
    }
  }, [isHovered, playOnHover, isInitialAnimationComplete, emoji, size])

  const animationStyle = useMemo<CSSProperties>(() => {
    if (!emoji) return {}

    return {
      width: size,
      animationName: `emoji-${emoji.id}-${String(size)}`,
      animationDuration: `${String(
        emoji.animation.framesCount / emoji.animation.fps,
      )}s`,
      animationTimingFunction: `steps(${String(emoji.animation.framesCount)})`,
      animationIterationCount:
        isInitialAnimationComplete && playOnHover
          ? 'infinite'
          : animationIterations,
      animationPlayState:
        (autoPlay && !isInitialAnimationComplete) ||
        (isInitialAnimationComplete && playOnHover && isHovered)
          ? 'running'
          : 'paused',
      transform: `translateY(-${String((emoji.animation.firstFrame - 1) * size)}px)`,
    }
  }, [
    emoji,
    size,
    isInitialAnimationComplete,
    playOnHover,
    animationIterations,
    autoPlay,
    isHovered,
  ])

  const handleMouseEnter = () => {
    setIsHovered(true)
  }
  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  return {
    isInitialAnimationComplete,
    animationStyle,
    handleMouseEnter,
    handleMouseLeave,
    imageRef,
  }
}
