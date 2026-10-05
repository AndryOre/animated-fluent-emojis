import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react'

import type { EmojiManifest } from '../utils/index.js'
import { usePrefersReducedMotion } from './use-prefers-reduced-motion.js'

export interface UseEmojiAnimationResult {
  isInitialAnimationComplete: boolean
  animationStyle: CSSProperties
  imageRef: RefObject<HTMLImageElement | null>
}

/**
 * Custom hook for managing emoji animation.
 * @param emoji - The emoji manifest data or null if not loaded.
 * @param playOnHover - Whether to play the animation on hover.
 * @param animationIterations - The number of animation iterations.
 * @param autoPlayRequested - Whether to autoplay the animation. Ignored while the user prefers reduced motion.
 * @param size - The size of the emoji in pixels.
 * @returns Animation state, inline style and the image element ref.
 */
export const useEmojiAnimation = (
  emoji: EmojiManifest | null,
  playOnHover: boolean,
  animationIterations: number | 'infinite',
  autoPlayRequested: boolean,
  size: number,
): UseEmojiAnimationResult => {
  const prefersReducedMotion = usePrefersReducedMotion()
  const autoPlay = autoPlayRequested && !prefersReducedMotion
  const [hasInitialRunFinished, setHasInitialRunFinished] = useState(false)
  const isInitialAnimationComplete = hasInitialRunFinished || !autoPlay
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
        setHasInitialRunFinished(true)
      }
    }

    const handleAnimationEnd = () => {
      if (!isInitialAnimationComplete) {
        setHasInitialRunFinished(true)
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

  const animationStyle = useMemo<CSSProperties>(() => {
    if (!emoji) return {}

    const { framesCount, fps, firstFrame } = emoji.animation
    const isIdle = !autoPlay && !playOnHover

    return {
      width: size,
      ...(isIdle && { animationName: 'none' }),
      animationDuration: `${String(framesCount / fps)}s`,
      animationTimingFunction: `steps(${String(framesCount)})`,
      animationIterationCount:
        isInitialAnimationComplete && playOnHover
          ? 'infinite'
          : animationIterations,
      animationPlayState: isIdle ? 'paused' : 'running',
      transform: `translateY(${String((-(firstFrame - 1) / framesCount) * 100)}%)`,
    }
  }, [
    emoji,
    size,
    isInitialAnimationComplete,
    playOnHover,
    animationIterations,
    autoPlay,
  ])

  return {
    isInitialAnimationComplete,
    animationStyle,
    imageRef,
  }
}
