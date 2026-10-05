import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react'

import type { EmojiManifest } from '../utils/index.js'
import { observeVisibility } from '../utils/visibility-observer.js'
import { useDocumentHidden } from './use-document-hidden.js'
import { usePrefersReducedMotion } from './use-prefers-reduced-motion.js'

const normalizeIterations = (
  value: number | 'infinite',
): number | 'infinite' => {
  if (value === 'infinite' || value === Infinity) return 'infinite'
  return Number.isNaN(value) || value < 0 ? 0 : value
}

export interface EmojiPlaybackControls {
  playing?: boolean
  onPlaybackEnd?: () => void
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
 * Autoplay, including looping, runs only once the image has loaded, while the
 * emoji is on screen and while the document is visible.
 * @param size - The width of the image: a number of pixels or any CSS length.
 * @param spriteSource - The current sprite URL. A change re-attaches the listeners to the new image element.
 * @param hasSpriteFailed - Whether the current sprite failed and its image element is unmounted. Leaving that state re-attaches the listeners to the new element.
 * @param controls - Playback controls. `playing` overrides `autoPlay` and reduced motion (`true` runs the iterations, `false` holds the current frame); `onPlaybackEnd` is called once when a finite run ends.
 * @returns Animation state, inline style and the image element ref.
 */
export const useEmojiAnimation = (
  emoji: EmojiManifest | null,
  playOnHover: boolean,
  animationIterations: number | 'infinite',
  autoPlayRequested: boolean,
  size: number | string,
  spriteSource?: string,
  hasSpriteFailed = false,
  controls: EmojiPlaybackControls = {},
): UseEmojiAnimationResult => {
  const prefersReducedMotion = usePrefersReducedMotion()
  const iterationCount = normalizeIterations(animationIterations)
  const { playing, onPlaybackEnd } = controls
  const autoPlay =
    iterationCount !== 0 &&
    (playing !== undefined || (autoPlayRequested && !prefersReducedMotion))
  const emojiId = emoji?.id
  const [trackedSource, setTrackedSource] = useState(spriteSource)
  const [hasImageLoaded, setHasImageLoaded] = useState(false)
  const [isOnScreen, setIsOnScreen] = useState(false)
  const [hasInitialRunFinished, setHasInitialRunFinished] = useState(false)
  const [hasRunStarted, setHasRunStarted] = useState(false)
  if (trackedSource !== spriteSource) {
    setHasRunStarted(false)
    setTrackedSource(spriteSource)
    setHasInitialRunFinished(false)
    setHasImageLoaded(false)
    setIsOnScreen(false)
  }
  const isInitialAnimationComplete = hasInitialRunFinished || !autoPlay
  const isDocumentHidden = useDocumentHidden(!isInitialAnimationComplete)
  const imageRef = useRef<HTMLImageElement>(null)
  const latestRef = useRef({ onPlaybackEnd, isFiniteRun: false })
  useEffect(() => {
    latestRef.current = {
      onPlaybackEnd,
      isFiniteRun: autoPlay && iterationCount !== 'infinite',
    }
  })
  const canAutoplay = hasImageLoaded && isOnScreen && !isDocumentHidden
  const isRunBlocked =
    !(isInitialAnimationComplete || canAutoplay) || playing === false
  if (!isRunBlocked && !isInitialAnimationComplete && !hasRunStarted) {
    setHasRunStarted(true)
  }

  useEffect(() => {
    const imgElement = imageRef.current
    if (emojiId === undefined || !imgElement) return

    let hasReportedEnd = false
    const handleAnimationEnd = () => {
      setHasInitialRunFinished(true)
      if (hasReportedEnd || !latestRef.current.isFiniteRun) return
      hasReportedEnd = true
      latestRef.current.onPlaybackEnd?.()
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
  }, [emojiId, spriteSource, hasSpriteFailed])

  const animationStyle = useMemo<CSSProperties>(() => {
    if (!emoji) return {}

    const { framesCount, fps, firstFrame } = emoji.animation
    const isIdle = !playOnHover && isInitialAnimationComplete
    const holdsFrame = playing === false && hasRunStarted

    return {
      width: size,
      ...((isIdle || (isRunBlocked && !holdsFrame)) && {
        animationName: 'none',
      }),
      animationDuration: `${String(framesCount / fps)}s`,
      animationTimingFunction: `steps(${String(framesCount)})`,
      animationIterationCount:
        isInitialAnimationComplete && playOnHover ? 'infinite' : iterationCount,
      animationPlayState: isIdle || isRunBlocked ? 'paused' : 'running',
      transform: `translateY(${String((-(firstFrame - 1) / framesCount) * 100)}%)`,
    }
  }, [
    emoji,
    size,
    isInitialAnimationComplete,
    playOnHover,
    iterationCount,
    isRunBlocked,
    playing,
    hasRunStarted,
  ])

  return {
    isInitialAnimationComplete,
    animationStyle,
    imageRef,
  }
}
