import { runInNewContext } from 'node:vm'
import { describe, expect, it } from 'vitest'

import { THEME_INIT_HASH, THEME_INIT_SCRIPT } from './theme-init'
import { THEME_STORAGE_KEY } from './theme-keys'

interface FakeEnvironment {
  stored: string | null
  blocked?: boolean
  prefersDark: boolean
}

function runInit({ stored, blocked = false, prefersDark }: FakeEnvironment) {
  const classes = new Set<string>()
  const root = {
    classList: {
      toggle: (name: string, force: boolean) =>
        force ? classes.add(name) : classes.delete(name),
    },
    dataset: {} as Record<string, string>,
  }
  const localStorage = {
    getItem: (key: string) => {
      if (blocked) throw new Error('blocked')
      return key === THEME_STORAGE_KEY ? stored : null
    },
  }
  runInNewContext(THEME_INIT_SCRIPT, {
    document: { documentElement: root },
    localStorage,
    matchMedia: () => ({ matches: prefersDark }),
  })
  return { dark: classes.has('dark'), theme: root.dataset.theme }
}

describe('theme init script', () => {
  it('follows the system when nothing is stored', () => {
    expect(runInit({ stored: null, prefersDark: true })).toEqual({
      dark: true,
      theme: 'system',
    })
    expect(runInit({ stored: null, prefersDark: false }).dark).toBe(false)
  })

  it('lets a stored override win over the system', () => {
    expect(runInit({ stored: 'light', prefersDark: true })).toEqual({
      dark: false,
      theme: 'light',
    })
    expect(runInit({ stored: 'dark', prefersDark: false })).toEqual({
      dark: true,
      theme: 'dark',
    })
  })

  it('ignores junk and blocked storage', () => {
    expect(runInit({ stored: 'purple', prefersDark: false }).theme).toBe(
      'system',
    )
    expect(
      runInit({ stored: null, blocked: true, prefersDark: true }).dark,
    ).toBe(true)
  })

  it('exposes a sha256 hash for the CSP', () => {
    expect(THEME_INIT_HASH).toMatch(/^sha256-[A-Za-z0-9+/]+=*$/)
  })
})
