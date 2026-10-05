import { useSyncExternalStore } from 'react'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

const shared: { query?: MediaQueryList } = {}

const getSharedQuery = (): MediaQueryList | undefined => {
  if (typeof globalThis.matchMedia !== 'function') return undefined
  shared.query ??= globalThis.matchMedia(REDUCED_MOTION_QUERY)
  return shared.query
}

const subscribe = (onChange: () => void): (() => void) => {
  const query = getSharedQuery()
  query?.addEventListener('change', onChange)
  return () => {
    query?.removeEventListener('change', onChange)
  }
}

const getSnapshot = (): boolean => getSharedQuery()?.matches ?? false

const getServerSnapshot = (): boolean => false

/**
 * Tracks the `prefers-reduced-motion: reduce` media query through one
 * lazily created `MediaQueryList` shared by every emoji.
 * @returns Whether the user asked the system to reduce motion.
 */
export const usePrefersReducedMotion = (): boolean =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
