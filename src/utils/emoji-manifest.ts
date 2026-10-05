import type { EmojiManifest, SkinTone, SlimManifest } from './types.js'

declare const process: { env: { NODE_ENV?: string } }

const DEFAULT_ASSET_SITE_URL = 'https://animated-fluent-emojis.pages.dev'

type ManifestRecord = Record<string, EmojiManifest>

export type ManifestSnapshot =
  | { status: 'idle' | 'loading'; manifest: null }
  | { status: 'ready'; manifest: ManifestRecord }
  | { status: 'error'; manifest: null }

const LOADING_SNAPSHOT: ManifestSnapshot = { status: 'loading', manifest: null }

const state: {
  assetSiteUrl: string
  snapshot: ManifestSnapshot
  pending: Promise<ManifestSnapshot> | null
  generation: number
  lastError: unknown
  isWaitingForOnline: boolean
  warmedSources: Set<string>
} = {
  assetSiteUrl: DEFAULT_ASSET_SITE_URL,
  snapshot: { status: 'idle', manifest: null },
  pending: null,
  generation: 0,
  lastError: null,
  isWaitingForOnline: false,
  warmedSources: new Set(),
}

const listeners = new Set<() => void>()

/**
 * Replaces the current snapshot and notifies every subscriber.
 * @param snapshot - The new manifest snapshot.
 */
function publish(snapshot: ManifestSnapshot): void {
  state.snapshot = snapshot
  for (const listener of listeners) listener()
}

/**
 * Subscribes to manifest store changes, for `useSyncExternalStore`.
 * @param listener - Called whenever the snapshot changes.
 * @returns A function that removes the subscription.
 */
export function subscribeToManifest(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/**
 * Reads the current manifest snapshot, for `useSyncExternalStore`.
 * @returns The current snapshot; its identity only changes when the status does.
 */
export function getManifestSnapshot(): ManifestSnapshot {
  return state.snapshot
}

/**
 * Reads the snapshot used while rendering on the server and hydrating.
 * @returns Always the `loading` snapshot, so server and client markup match.
 */
export function getServerManifestSnapshot(): ManifestSnapshot {
  return LOADING_SNAPSHOT
}

/**
 * Tells whether the consumer's bundler left development checks enabled.
 * @returns True unless `process.env.NODE_ENV` is `production`; false where `process` does not exist.
 */
function isDevelopment(): boolean {
  try {
    return process.env.NODE_ENV !== 'production'
  } catch {
    return false
  }
}

/**
 * Configures where the manifest and the sprite sheets are served from.
 * The manifest is fetched once on first use, so call this before the first
 * `Emoji` renders. Changing the asset site afterwards discards the manifest and
 * refetches it from the new site, and in development warns that a fetch had
 * already started.
 * @param options - The configuration to apply.
 * @param options.assetSiteUrl - Origin of the asset site, without or with a trailing slash. Defaults to the published asset site.
 */
export function configureEmojis(options: { assetSiteUrl?: string }): void {
  let url = options.assetSiteUrl ?? DEFAULT_ASSET_SITE_URL
  while (url.endsWith('/')) url = url.slice(0, -1)
  if (url === state.assetSiteUrl) return
  if (state.snapshot.status !== 'idle' && isDevelopment()) {
    console.warn(
      'configureEmojis changed the asset site after the emoji manifest was requested. Call it before the first Emoji renders.',
    )
  }
  state.assetSiteUrl = url
  state.generation += 1
  state.pending = null
  state.warmedSources.clear()
  publish({ status: 'idle', manifest: null })
  if (listeners.size > 0) void startManifestLoad()
}

const SKIN_TONE_SUFFIXES: Readonly<Record<SkinTone, string>> = {
  default: '',
  light: '_s2',
  'medium-light': '_s3',
  medium: '_s4',
  'medium-dark': '_s5',
  dark: '_s6',
}

/**
 * Fetches the slim emoji manifest from the asset site.
 * @returns A promise that resolves to the raw manifest data.
 */
async function fetchManifest(): Promise<SlimManifest> {
  const response = await fetch(`${state.assetSiteUrl}/manifest.slim.json`)
  if (!response.ok) {
    throw new Error(
      `Failed to fetch the emoji manifest (${String(response.status)})`,
    )
  }
  return (await response.json()) as SlimManifest
}

/**
 * Generates the emoji manifest from the raw manifest data.
 * @returns A promise that resolves to the processed emoji manifest.
 */
async function generateEmojiManifest(): Promise<ManifestRecord> {
  const rawManifest = await fetchManifest()
  const manifest: ManifestRecord = {}
  for (const category of rawManifest.categories) {
    for (const emoticon of category.emoticons) {
      manifest[emoticon.id] = { ...emoticon, category: category.title }
    }
  }
  return manifest
}

/**
 * Retries a failed load once the browser reports it is back online.
 */
function retryWhenOnline(): void {
  if (
    state.isWaitingForOnline ||
    typeof globalThis.addEventListener !== 'function'
  )
    return
  state.isWaitingForOnline = true
  globalThis.addEventListener(
    'online',
    () => {
      state.isWaitingForOnline = false
      if (state.snapshot.status === 'error') void startManifestLoad()
    },
    { once: true },
  )
}

/**
 * Runs one manifest load and publishes its outcome unless it was superseded.
 * @param generation - The store generation the load belongs to.
 * @returns The snapshot this load produced; never rejects.
 */
async function runManifestLoad(generation: number): Promise<ManifestSnapshot> {
  let outcome: ManifestSnapshot
  try {
    outcome = { status: 'ready', manifest: await generateEmojiManifest() }
  } catch (error) {
    outcome = { status: 'error', manifest: null }
    if (generation === state.generation) {
      state.lastError = error
      console.error('Error fetching emoji data:', error)
    }
  }
  if (generation !== state.generation) return outcome
  state.pending = null
  publish(outcome)
  if (outcome.status === 'error') retryWhenOnline()
  return outcome
}

/**
 * Starts loading the manifest unless it is loading or already loaded. A store
 * in the `error` state starts a fresh attempt.
 * @returns A promise of the snapshot the load ends in; it never rejects.
 */
export function startManifestLoad(): Promise<ManifestSnapshot> {
  if (state.snapshot.status === 'ready') return Promise.resolve(state.snapshot)
  if (state.pending) return state.pending
  publish({ status: 'loading', manifest: null })
  state.pending = runManifestLoad(state.generation)
  return state.pending
}

/**
 * Loads the emoji manifest on first use and shares the result. A failed load
 * leaves the store retryable. Nothing is fetched at import.
 * @returns A promise that resolves to the manifest keyed by emoji id.
 */
export async function loadEmojiManifest(): Promise<ManifestRecord> {
  const outcome = await startManifestLoad()
  if (outcome.status === 'ready') return outcome.manifest
  throw state.lastError instanceof Error
    ? state.lastError
    : new Error('Failed to load the emoji manifest')
}

/**
 * Builds a sprite sheet URL.
 * @param emoji - The emoji manifest entry.
 * @param skinTone - The requested skin tone.
 * @param resolutionSuffix - Filename suffix placed before the extension, e.g. `@2x`.
 * @returns The sprite sheet URL, versioned by the emoji's etag.
 */
function buildSpriteUrl(
  emoji: EmojiManifest,
  skinTone: SkinTone,
  resolutionSuffix: string,
): string {
  const toneSuffix = emoji.diverse ? SKIN_TONE_SUFFIXES[skinTone] : ''
  return `${state.assetSiteUrl}/sprites/${encodeURIComponent(emoji.category)}/${emoji.id}${toneSuffix}${resolutionSuffix}.png?v=${encodeURIComponent(emoji.etag)}`
}

/**
 * Builds the URL of an emoji's sprite sheet.
 * @param emoji - The emoji manifest entry.
 * @param skinTone - The requested skin tone; ignored when the emoji has no variants.
 * @returns The sprite sheet URL, versioned by the emoji's etag.
 */
export function getSpriteUrl(
  emoji: EmojiManifest,
  skinTone: SkinTone = 'default',
): string {
  return buildSpriteUrl(emoji, skinTone, '')
}

/**
 * Builds the `srcSet` of an emoji's sprite sheet.
 * @param emoji - The emoji manifest entry.
 * @param skinTone - The requested skin tone; ignored when the emoji has no variants.
 * @returns The standard sheet at 1x and the HD sheet at 2x, or undefined when the emoji has no HD sheet.
 */
export function getSpriteSourceSet(
  emoji: EmojiManifest,
  skinTone: SkinTone = 'default',
): string | undefined {
  return emoji.hd
    ? `${buildSpriteUrl(emoji, skinTone, '')} 1x, ${buildSpriteUrl(emoji, skinTone, '@2x')} 2x`
    : undefined
}

/**
 * Starts fetching the emoji manifest ahead of the first render and, when given
 * ids, warms the sprite sheets of those emojis once the manifest resolves.
 * Failures are logged by the manifest store and never reject this promise.
 * @param ids - Emoji ids whose sprite sheets to warm; omit to only fetch the manifest.
 * @param options - Settings for the warmed sheets.
 * @param options.skinTone - Variant to request for emojis that have skin tones; defaults to the neutral one.
 * @returns A promise that settles once the manifest load has finished and the sheets are requested.
 */
export async function preloadEmojis(
  ids?: readonly string[],
  options: { skinTone?: SkinTone } = {},
): Promise<void> {
  const outcome = await startManifestLoad()
  if (!ids || typeof Image === 'undefined' || outcome.status !== 'ready') return
  for (const id of ids) {
    const emoji = outcome.manifest[id]
    if (!emoji) continue
    const source = getSpriteUrl(emoji, options.skinTone)
    if (state.warmedSources.has(source)) continue
    state.warmedSources.add(source)
    const image = new Image()
    const sourceSet = getSpriteSourceSet(emoji, options.skinTone)
    if (sourceSet) image.srcset = sourceSet
    image.src = source
  }
}
