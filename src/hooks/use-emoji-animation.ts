import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type RefObject,
} from 'react'

import type { EmojiManifest } from '../utils/index.js'
import { observeVisibility } from '../utils/visibility-observer.js'
import { usePrefersReducedMotion } from './use-prefers-reduced-motion.js'

const normalizeIterations = (
  value: number | 'infinite',
): number | 'infinite' => {
  if (value === 'infinite' || value === Infinity) return 'infinite'
  return Number.isNaN(value) || value < 0 ? 0 : value
}

const subscribeToDocumentVisibility = (onChange: () => void) => {
  document.addEventListener('visibilitychange', onChange)
  return () => {
    document.removeEventListener('visibilitychange', onChange)
  }
}

const getDocumentHidden = () => document.hidden
const getServerDocumentHidden = () => false

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
 * Autoplay, including looping, runs only once the image has loaded, while the
 * emoji is on screen and while the document is visible.
 * @param size - The size of the emoji in pixels.
 * @param spriteSource - The current sprite URL. A change re-attaches the listeners to the new image element.
 * @returns Animation state, inline style and the image element ref.
 */
export const useEmojiAnimation = (
  emoji: EmojiManifest | null,
  playOnHover: boolean,
  animationIterations: number | 'infinite',
  autoPlayRequested: boolean,
  size: number,
  spriteSource?: string,
): UseEmojiAnimationResult => {
  const prefersReducedMotion = usePrefersReducedMotion()
  const iterationCount = normalizeIterations(animationIterations)
  const autoPlay =
    autoPlayRequested && !prefersReducedMotion && iterationCount !== 0
  const emojiId = emoji?.id
  const [trackedSource, setTrackedSource] = useState(spriteSource)
  const [hasImageLoaded, setHasImageLoaded] = useState(false)
  const [isOnScreen, setIsOnScreen] = useState(false)
  const isDocumentHidden = useSyncExternalStore(
    subscribeToDocumentVisibility,
    getDocumentHidden,
    getServerDocumentHidden,
  )
  const [hasInitialRunFinished, setHasInitialRunFinished] = useState(false)
  if (trackedSource !== spriteSource) {
    setTrackedSource(spriteSource)
    setHasInitialRunFinished(false)
    setHasImageLoaded(false)
    setIsOnScreen(false)
  }
  const isInitialAnimationComplete = hasInitialRunFinished || !autoPlay
  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const imgElement = imageRef.current
    if (emojiId === undefined || !imgElement) return

    const handleAnimationEnd = () => {
      setHasInitialRunFinished(true)
    }

    const handleLoad = () => {
      setHasImageLoaded(true)
    }

    imgElement.addEventListener('animationend', handleAnimationEnd)
    imgElement.addEventListener('load', handleLoad)
    const stopObserving = observeVisibility(imgElement, (isVisible) => {
      setIsOnScreen(isVisible)
      if (imgElement.complete && imgElement.naturalWidth > 0) handleLoad()
    })
    return () => {
      imgElement.removeEventListener('animationend', handleAnimationEnd)
      imgElement.removeEventListener('load', handleLoad)
      stopObserving()
    }
  }, [emojiId, spriteSource])

  const animationStyle = useMemo<CSSProperties>(() => {
    if (!emoji) return {}

    const { framesCount, fps, firstFrame } = emoji.animation
    const isIdle = !playOnHover && isInitialAnimationComplete
    const canAutoplay = hasImageLoaded && isOnScreen && !isDocumentHidden
    const isAutoplayHeld = !(isInitialAnimationComplete || canAutoplay)

    return {
      width: size,
      ...((isIdle || isAutoplayHeld) && { animationName: 'none' }),
      animationDuration: `${String(framesCount / fps)}s`,
      animationTimingFunction: `steps(${String(framesCount)})`,
      animationIterationCount:
        isInitialAnimationComplete && playOnHover ? 'infinite' : iterationCount,
      animationPlayState: isIdle || isAutoplayHeld ? 'paused' : 'running',
      transform: `translateY(${String((-(firstFrame - 1) / framesCount) * 100)}%)`,
    }
  }, [
    emoji,
    size,
    isInitialAnimationComplete,
    playOnHover,
    iterationCount,
    hasImageLoaded,
    isOnScreen,
    isDocumentHidden,
  ])

  return {
    isInitialAnimationComplete,
    animationStyle,
    imageRef,
  }
}
