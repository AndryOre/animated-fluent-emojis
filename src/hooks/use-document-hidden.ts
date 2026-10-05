import { useSyncExternalStore } from 'react'

import { createSharedSubscription } from '../utils/shared-subscription.js'

const subscribe = createSharedSubscription((notify) => {
  document.addEventListener('visibilitychange', notify)
  return () => {
    document.removeEventListener('visibilitychange', notify)
  }
})

const noopSubscribe = (): (() => void) => Function.prototype as () => void
const getHidden = (): boolean => document.hidden
const getNeverHidden = (): boolean => false

/**
 * Tracks `document.hidden` through one `visibilitychange` listener shared by
 * every emoji. The server snapshot is always `false`.
 * @param isActive - When false the hook stays unsubscribed, reports `false` and never re-renders on tab switches.
 * @returns Whether the document is hidden.
 */
export const useDocumentHidden = (isActive: boolean): boolean =>
  useSyncExternalStore(
    isActive ? subscribe : noopSubscribe,
    isActive ? getHidden : getNeverHidden,
    getNeverHidden,
  )
