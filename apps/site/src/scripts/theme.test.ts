import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { applyTheme, isTheme, readStoredTheme, storeTheme } from './theme'
import { THEME_STORAGE_KEY } from './theme-keys'

function stubBrowser(prefersDark: boolean, storage: Map<string, string>) {
  const classes = new Set<string>()
  const root = {
    classList: {
      add: (name: string) => classes.add(name),
      remove: (name: string) => classes.delete(name),
      toggle: (name: string, force: boolean) =>
        force ? classes.add(name) : classes.delete(name),
    },
    dataset: {} as Record<string, string>,
  }
  const frames: FrameRequestCallback[] = []
  vi.stubGlobal('document', { documentElement: root })
  vi.stubGlobal('matchMedia', () => ({ matches: prefersDark }))
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.push(callback)
  })
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value)
    },
    removeItem: (key: string) => {
      storage.delete(key)
    },
  })
  return { classes, root, frames }
}

describe('theme', () => {
  const storage = new Map<string, string>()

  beforeEach(() => {
    storage.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('recognises only the three themes', () => {
    expect(isTheme('dark')).toBe(true)
    expect(isTheme('sepia')).toBe(false)
  })

  it('stores light and dark and clears the override for system', () => {
    stubBrowser(false, storage)
    storeTheme('dark')
    expect(storage.get(THEME_STORAGE_KEY)).toBe('dark')
    expect(readStoredTheme()).toBe('dark')
    storeTheme('system')
    expect(readStoredTheme()).toBe('system')
  })

  it('applies system by following the OS color scheme', () => {
    const { classes, root } = stubBrowser(true, storage)
    applyTheme('system')
    expect(classes.has('dark')).toBe(true)
    expect(root.dataset.theme).toBe('system')
  })

  it('holds theme-switching for two frames', () => {
    const { classes, frames } = stubBrowser(false, storage)
    applyTheme('dark')
    expect(classes.has('theme-switching')).toBe(true)
    frames.shift()?.(0)
    expect(classes.has('theme-switching')).toBe(true)
    frames.shift()?.(0)
    expect(classes.has('theme-switching')).toBe(false)
  })
})
