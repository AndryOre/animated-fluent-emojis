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
  imageRef: RefObject<HTMLImageElement | null>
}

/**
 * Custom hook for managing emoji animation.
 * @param emoji - The emoji manifest data or null if not loaded.
 * @param playOnHover - Whether to play the animation on hover.
 * @param animationIterations - The number of animation iterations.
 * @param autoPlay - Whether to autoplay the animation.
 * @param size - The size of the emoji in pixels.
 * @returns Animation state, inline style and the image element ref.
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
