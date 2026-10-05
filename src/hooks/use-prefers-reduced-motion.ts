import { useSyncExternalStore } from 'react'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

const hasMatchMedia = (): boolean => typeof globalThis.matchMedia === 'function'

const subscribe = (onChange: () => void): (() => void) => {
  const mediaQuery = hasMatchMedia()
    ? globalThis.matchMedia(REDUCED_MOTION_QUERY)
    : undefined
  mediaQuery?.addEventListener('change', onChange)
  return () => {
    mediaQuery?.removeEventListener('change', onChange)
  }
}

const getSnapshot = (): boolean =>
  hasMatchMedia() && globalThis.matchMedia(REDUCED_MOTION_QUERY).matches

const getServerSnapshot = (): boolean => false

/**
 * Tracks the `prefers-reduced-motion: reduce` media query.
 * @returns Whether the user asked the system to reduce motion.
 */
export const usePrefersReducedMotion = (): boolean =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
