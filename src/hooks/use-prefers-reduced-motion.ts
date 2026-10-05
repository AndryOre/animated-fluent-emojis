import { useSyncExternalStore } from 'react'

import { createSharedSubscription } from '../utils/shared-subscription.js'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

const shared: { query?: MediaQueryList } = {}

const getSharedQuery = (): MediaQueryList | undefined => {
  if (typeof globalThis.matchMedia !== 'function') return undefined
  shared.query ??= globalThis.matchMedia(REDUCED_MOTION_QUERY)
  return shared.query
}

const subscribe = createSharedSubscription((notify) => {
  const query = getSharedQuery()
  query?.addEventListener('change', notify)
  return () => {
    query?.removeEventListener('change', notify)
  }
})

const getSnapshot = (): boolean => getSharedQuery()?.matches ?? false

const getServerSnapshot = (): boolean => false

/**
 * Tracks the `prefers-reduced-motion: reduce` media query through one
 * lazily created `MediaQueryList` and one change listener shared by every emoji.
 * @returns Whether the user asked the system to reduce motion.
 */
export const usePrefersReducedMotion = (): boolean =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
