export const PACKAGE_MANAGERS = ['bun', 'npm', 'pnpm', 'yarn'] as const

export type PackageManager = (typeof PACKAGE_MANAGERS)[number]

export const DEFAULT_PACKAGE_MANAGER: PackageManager = 'bun'

export const PACKAGE_MANAGER_STORAGE_KEY = 'afe:pm'

const PACKAGE_MANAGER_EVENT = 'afe:pm-change'

const PACKAGE_NAME = 'animated-fluent-emojis'

const INSTALL_VERBS: Record<PackageManager, string> = {
  bun: 'bun add',
  npm: 'npm install',
  pnpm: 'pnpm add',
  yarn: 'yarn add',
}

export interface PackageManagerStorage {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
}

export interface PackageManagerEnvironment {
  storage?: () => PackageManagerStorage
  target?: EventTarget
}

export interface PackageManagerStore {
  get: () => PackageManager
  set: (manager: PackageManager) => void
  subscribe: (listener: (manager: PackageManager) => void) => () => void
}

/**
 * Narrows a stored or user-provided value to a supported package manager.
 * @param value - The value to check.
 * @returns Whether it names a supported package manager.
 */
export function isPackageManager(value: unknown): value is PackageManager {
  return PACKAGE_MANAGERS.includes(value as PackageManager)
}

/**
 * The command that installs the library with a package manager.
 * @param manager - The package manager.
 * @returns A shell command to run in the project root.
 */
export function installCommand(manager: PackageManager): string {
  return `${INSTALL_VERBS[manager]} ${PACKAGE_NAME}`
}

/**
 * Creates the package manager preference shared by every install block on a
 * page. The choice persists under `afe:pm` and is announced on an event target,
 * so blocks hydrated by separate islands stay in sync without sharing module
 * state. A missing or throwing `localStorage` only costs persistence; the
 * choice still syncs for the rest of the page.
 * @param environment - Overrides for the storage getter and the event target.
 * @returns Accessors to read, change and observe the shared choice.
 */
export function createPackageManagerStore(
  environment: PackageManagerEnvironment = {},
): PackageManagerStore {
  const target = environment.target ?? globalThis
  const getStorage = environment.storage ?? (() => globalThis.localStorage)
  let current: PackageManager | undefined

  function readStored(): unknown {
    try {
      return getStorage().getItem(PACKAGE_MANAGER_STORAGE_KEY)
    } catch {
      return null
    }
  }

  function persist(manager: PackageManager): void {
    try {
      getStorage().setItem(PACKAGE_MANAGER_STORAGE_KEY, manager)
    } catch {
      return
    }
  }

  return {
    get: () => {
      const stored = readStored()
      return isPackageManager(stored)
        ? stored
        : (current ?? DEFAULT_PACKAGE_MANAGER)
    },
    set: (manager) => {
      current = manager
      persist(manager)
      target.dispatchEvent(
        new CustomEvent(PACKAGE_MANAGER_EVENT, { detail: manager }),
      )
    },
    subscribe: (listener) => {
      const handle = (event: Event): void => {
        const { detail } = event as CustomEvent<unknown>
        if (!isPackageManager(detail)) {
          return
        }

        current = detail
        listener(detail)
      }
      target.addEventListener(PACKAGE_MANAGER_EVENT, handle)
      return () => {
        target.removeEventListener(PACKAGE_MANAGER_EVENT, handle)
      }
    },
  }
}
