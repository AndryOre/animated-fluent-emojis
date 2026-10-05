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

const normalizeIterations = (
  value: number | 'infinite',
): number | 'infinite' => {
  if (value === 'infinite' || value === Infinity) return 'infinite'
  return Number.isNaN(value) || value < 0 ? 0 : value
}

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
  const iterationCount = normalizeIterations(animationIterations)
  const autoPlay =
    autoPlayRequested && !prefersReducedMotion && iterationCount !== 0
  const emojiId = emoji?.id
  const [trackedEmojiId, setTrackedEmojiId] = useState(emojiId)
  const [hasInitialRunFinished, setHasInitialRunFinished] = useState(false)
  if (trackedEmojiId !== emojiId) {
    setTrackedEmojiId(emojiId)
    setHasInitialRunFinished(false)
  }
  const isInitialAnimationComplete = hasInitialRunFinished || !autoPlay
  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const imgElement = imageRef.current
    if (emojiId === undefined || !imgElement) return

    const handleAnimationEnd = () => {
      setHasInitialRunFinished(true)
    }

    imgElement.addEventListener('animationend', handleAnimationEnd)
    return () => {
      imgElement.removeEventListener('animationend', handleAnimationEnd)
    }
  }, [emojiId])

  const animationStyle = useMemo<CSSProperties>(() => {
    if (!emoji) return {}

    const { framesCount, fps, firstFrame } = emoji.animation
    const isIdle = !playOnHover && isInitialAnimationComplete

    return {
      width: size,
      ...(isIdle && { animationName: 'none' }),
      animationDuration: `${String(framesCount / fps)}s`,
      animationTimingFunction: `steps(${String(framesCount)})`,
      animationIterationCount:
        isInitialAnimationComplete && playOnHover ? 'infinite' : iterationCount,
      animationPlayState: isIdle ? 'paused' : 'running',
      transform: `translateY(${String((-(firstFrame - 1) / framesCount) * 100)}%)`,
    }
  }, [emoji, size, isInitialAnimationComplete, playOnHover, iterationCount])

  return {
    isInitialAnimationComplete,
    animationStyle,
    imageRef,
  }
}
