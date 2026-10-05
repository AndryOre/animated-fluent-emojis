import {
  appendFile,
  cp,
  mkdir,
  readFile,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises'
import path from 'node:path'

import type { Manifest } from '../../src/utils/types.js'
import { buildCatalog, type SpriteTask } from './catalog.js'
import { fetchOk, mapWithConcurrency, type FetchLike } from './http.js'
import {
  buildMitMediaUrl,
  loadMitIndex,
  MIT_REPOSITORY,
  type MitIndex,
} from './mit.js'
import { convertAnimatedPng, type ConvertedSprite } from './sprites.js'
import { fetchTeamsManifest, type TeamsVersion } from './teams.js'
import { validateCatalog } from './validate.js'

const DOWNLOAD_CONCURRENCY = 8

const HEADERS_FILE = `/sprites/*
  Cache-Control: public, max-age=31536000, immutable
  Access-Control-Allow-Origin: *

/manifest.json
  Cache-Control: public, max-age=3600
  Access-Control-Allow-Origin: *

/version.json
  Cache-Control: no-cache
  Access-Control-Allow-Origin: *
`

/**
 * The versions a published catalog was built from.
 */
export interface PublishedVersion {
  readonly teamsHash: string
  readonly teamsLastModified: string
  readonly mitSha: string
  readonly builtAt: string
}

interface AnimationState {
  readonly fps: number
  readonly framesCount: number
}

interface SpriteState {
  readonly etag: string
  readonly animation?: AnimationState
}

type StateFile = Record<string, SpriteState>

/**
 * A summary of how two manifests differ.
 */
export interface ManifestDiff {
  readonly added: readonly string[]
  readonly removed: readonly string[]
  readonly changed: readonly string[]
}

/**
 * An official-repository emoji dropped from the build because one of its
 * sprites could not be produced.
 */
interface SkippedEmoji {
  readonly id: string
  readonly reason: string
}

/**
 * The outcome of a build.
 */
export interface BuildResult {
  readonly manifest: Manifest
  readonly version: PublishedVersion
  readonly spriteCount: number
  readonly downloaded: number
  readonly reused: number
  readonly skipped: readonly SkippedEmoji[]
  readonly diff: ManifestDiff | undefined
}

/**
 * Options for {@link buildAssets}.
 */
export interface BuildOptions {
  readonly fetchImplementation: FetchLike
  readonly githubHeaders?: Record<string, string>
  readonly teamsVersion: TeamsVersion
  readonly outputDirectory: string
  readonly cacheDirectory: string
  readonly limit?: number
  readonly previousManifest?: Manifest
  readonly convert?: (animatedPng: Buffer) => Promise<ConvertedSprite>
  readonly now?: () => Date
  readonly stepSummaryPath?: string
}

/**
 * Compares two manifests by emoji id and etag.
 * @param previous The previously published manifest.
 * @param next The new manifest.
 * @returns The ids added, removed and whose etag changed.
 */
export function diffManifests(
  previous: Manifest,
  next: Manifest,
): ManifestDiff {
  const toEtags = (manifest: Manifest) =>
    new Map(
      manifest.categories.flatMap((category) =>
        category.emoticons.map(
          (emoticon) => [emoticon.id, emoticon.etag] as const,
        ),
      ),
    )
  const before = toEtags(previous)
  const after = toEtags(next)
  return {
    added: after
      .keys()
      .filter((id) => !before.has(id))
      .toArray(),
    removed: before
      .keys()
      .filter((id) => !after.has(id))
      .toArray(),
    changed: after
      .entries()
      .filter(([id, etag]) => before.has(id) && before.get(id) !== etag)
      .map(([id]) => id)
      .toArray(),
  }
}

/**
 * Applies converted animation data to the official-repository emoticons.
 * @param manifest The merged manifest with placeholder animations.
 * @param animationsById Animation data keyed by emoji id.
 * @returns A manifest with the real `fps` and `framesCount`.
 */
export function applyAnimations(
  manifest: Manifest,
  animationsById: ReadonlyMap<string, AnimationState>,
): Manifest {
  return {
    categories: manifest.categories.map((category) => ({
      ...category,
      emoticons: category.emoticons.map((emoticon) => {
        const animation = animationsById.get(emoticon.id)
        return animation
          ? { ...emoticon, animation: { ...animation, firstFrame: 1 } }
          : emoticon
      }),
    })),
  }
}

function isMissingFileError(error: unknown): boolean {
  return (error as NodeJS.ErrnoException | null)?.code === 'ENOENT'
}

/**
 * Checks whether a regular file exists. Only a missing file counts as absent;
 * any other filesystem error propagates.
 * @param filePath The file to check.
 * @returns Whether the file exists.
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    const stats = await stat(filePath)
    return stats.isFile()
  } catch (error: unknown) {
    if (isMissingFileError(error)) return false
    throw error
  }
}

/**
 * Reads the sprite state file. Only a missing file yields an empty state; any
 * other read or parse error propagates.
 * @param cacheDirectory The cache directory holding `state.json`.
 * @returns The stored state, or an empty state on first run.
 */
export async function readState(cacheDirectory: string): Promise<StateFile> {
  try {
    return JSON.parse(
      await readFile(path.join(cacheDirectory, 'state.json'), 'utf8'),
    ) as StateFile
  } catch (error: unknown) {
    if (isMissingFileError(error)) return {}
    throw error
  }
}

async function writeBytes(filePath: string, bytes: Uint8Array): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, bytes)
}

type SpriteOutcome =
  | {
      status: 'ok'
      task: SpriteTask
      animation?: AnimationState
      reused: boolean
    }
  | { status: 'failed'; task: SpriteTask; error: Error }

async function produceSprite(
  task: SpriteTask,
  context: {
    options: BuildOptions
    mitSha: string
    state: StateFile
    convert: (animatedPng: Buffer) => Promise<ConvertedSprite>
  },
): Promise<{ task: SpriteTask; animation?: AnimationState; reused: boolean }> {
  const { options, mitSha, state, convert } = context
  const target = path.join(options.cacheDirectory, task.outputPath)
  const cached = state[task.outputPath]
  if (cached?.etag === task.etag && (await fileExists(target))) {
    return { task, animation: cached.animation, reused: true }
  }

  if (task.source === 'teams' && task.sourceUrl) {
    const response = await fetchOk(options.fetchImplementation, task.sourceUrl)
    await writeBytes(target, new Uint8Array(await response.arrayBuffer()))
    state[task.outputPath] = { etag: task.etag }
    return { task, reused: false }
  }

  if (task.source === 'mit' && task.mitPath) {
    const response = await fetchOk(
      options.fetchImplementation,
      buildMitMediaUrl(mitSha, task.mitPath),
    )
    const converted = await convert(Buffer.from(await response.arrayBuffer()))
    await writeBytes(target, converted.png)
    const animation = { fps: converted.fps, framesCount: converted.framesCount }
    state[task.outputPath] = { etag: task.etag, animation }
    return { task, animation, reused: false }
  }
  throw new Error(`Sprite task has no source: ${task.outputPath}`)
}

async function settleSprite(
  task: SpriteTask,
  context: Parameters<typeof produceSprite>[1],
): Promise<SpriteOutcome> {
  try {
    return { status: 'ok', ...(await produceSprite(task, context)) }
  } catch (error: unknown) {
    return {
      status: 'failed',
      task,
      error: error instanceof Error ? error : new Error(String(error)),
    }
  }
}

function assertNoPinnedSkipped(
  skippedById: ReadonlyMap<string, SkippedEmoji>,
  previousManifest: Manifest | undefined,
): void {
  const pinnedSkipped = (previousManifest?.categories ?? [])
    .flatMap((category) => category.emoticons)
    .filter(
      (emoticon) =>
        emoticon.origin === 'official' && skippedById.has(emoticon.id),
    )
    .map((emoticon) => emoticon.id)
  if (pinnedSkipped.length > 0) {
    throw new Error(
      `Pinned official emojis failed to build and would be dropped: ${pinnedSkipped.join(', ')}`,
    )
  }
}

function collectSkipped(
  outcomes: readonly SpriteOutcome[],
): Map<string, SkippedEmoji> {
  const skipped = new Map<string, SkippedEmoji>()
  for (const outcome of outcomes) {
    if (outcome.status === 'failed' && !skipped.has(outcome.task.id)) {
      skipped.set(outcome.task.id, {
        id: outcome.task.id,
        reason: `${outcome.task.outputPath}: ${outcome.error.message}`,
      })
    }
  }
  return skipped
}

async function reportSkipped(
  skipped: readonly SkippedEmoji[],
  stepSummaryPath: string | undefined,
): Promise<void> {
  if (skipped.length === 0) return
  for (const entry of skipped) {
    console.warn(`Skipped official emoji ${entry.id}: ${entry.reason}`)
  }
  if (!stepSummaryPath) return
  const lines = skipped.map((entry) => `- \`${entry.id}\`: ${entry.reason}`)
  await appendFile(
    stepSummaryPath,
    `### Skipped official emojis (${String(skipped.length)})\n\n${lines.join('\n')}\n`,
  )
}

function limitCatalog(
  tasks: readonly SpriteTask[],
  limit: number | undefined,
): SpriteTask[] {
  if (limit === undefined) return [...tasks]
  const ids = new Set<string>()
  for (const task of tasks) {
    if (ids.size >= limit) break
    ids.add(task.id)
  }
  return tasks.filter((task) => ids.has(task.id))
}

/**
 * Builds the complete static site published to Cloudflare Pages: the merged
 * manifest, every sprite, the version marker, the headers file and the
 * license notice for the official repository assets.
 * @param options Build inputs.
 * @returns A summary of what was built.
 */
export async function buildAssets(options: BuildOptions): Promise<BuildResult> {
  const convert = options.convert ?? convertAnimatedPng
  const githubHeaders = options.githubHeaders ?? {}
  const teamsManifest = await fetchTeamsManifest(
    options.fetchImplementation,
    options.teamsVersion.hash,
  )
  const mitIndex: MitIndex = await loadMitIndex(
    options.fetchImplementation,
    githubHeaders,
  )
  const catalog = buildCatalog(
    teamsManifest,
    mitIndex.emojis,
    options.previousManifest,
  )
  const limitedTasks = limitCatalog(catalog.tasks, options.limit)

  const state = await readState(options.cacheDirectory)
  const outcomes = await mapWithConcurrency(
    limitedTasks,
    DOWNLOAD_CONCURRENCY,
    (task) =>
      settleSprite(task, {
        options,
        mitSha: mitIndex.commitSha,
        state,
        convert,
      }),
  )
  await mkdir(options.cacheDirectory, { recursive: true })
  await writeFile(
    path.join(options.cacheDirectory, 'state.json'),
    JSON.stringify(state),
  )

  const teamsFailures = outcomes.flatMap((outcome) =>
    outcome.status === 'failed' && outcome.task.source === 'teams'
      ? [outcome]
      : [],
  )
  if (teamsFailures.length > 0) {
    throw new AggregateError(
      teamsFailures.map((outcome) => outcome.error),
      `${String(teamsFailures.length)} Teams sprite download(s) failed:\n${teamsFailures
        .map((outcome) => `- ${outcome.task.id}: ${outcome.error.message}`)
        .join('\n')}`,
    )
  }

  const skippedById = collectSkipped(outcomes)
  assertNoPinnedSkipped(skippedById, options.previousManifest)
  const skipped = skippedById.values().toArray()
  await reportSkipped(
    skipped,
    options.stepSummaryPath ?? process.env.GITHUB_STEP_SUMMARY,
  )
  const tasks = limitedTasks.filter((task) => !skippedById.has(task.id))
  const results = outcomes.filter((outcome) => outcome.status === 'ok')

  const animationsById = new Map<string, AnimationState>()
  for (const result of results) {
    if (
      result.animation &&
      result.task.toneSuffix === '' &&
      catalog.mitEmojiIds.has(result.task.id)
    ) {
      animationsById.set(result.task.id, result.animation)
    }
  }
  const generatedIds = new Set(tasks.map((task) => task.id))
  const manifest = applyAnimations(
    {
      categories: catalog.manifest.categories
        .map((category) => ({
          ...category,
          emoticons: category.emoticons.filter(
            (emoticon) =>
              !skippedById.has(emoticon.id) &&
              (options.limit === undefined || generatedIds.has(emoticon.id)),
          ),
        }))
        .filter(
          (category) =>
            category.emoticons.length > 0 ||
            !catalog.manifest.categories
              .find((original) => original.id === category.id)
              ?.emoticons.some((emoticon) => skippedById.has(emoticon.id)),
        ),
    },
    animationsById,
  )

  await validateCatalog({
    manifest,
    tasks,
    cacheDirectory: options.cacheDirectory,
  })

  await rm(options.outputDirectory, { recursive: true, force: true })
  for (const task of tasks) {
    const destination = path.join(options.outputDirectory, task.outputPath)
    await mkdir(path.dirname(destination), { recursive: true })
    await cp(path.join(options.cacheDirectory, task.outputPath), destination)
  }

  const license = await fetchOk(
    options.fetchImplementation,
    `https://raw.githubusercontent.com/${MIT_REPOSITORY}/${mitIndex.commitSha}/LICENSE`,
  )
  const version: PublishedVersion = {
    teamsHash: options.teamsVersion.hash,
    teamsLastModified: options.teamsVersion.lastModified,
    mitSha: mitIndex.commitSha,
    builtAt: (options.now ?? (() => new Date()))().toISOString(),
  }
  await writeFile(
    path.join(options.outputDirectory, 'manifest.json'),
    JSON.stringify(manifest),
  )
  await writeFile(
    path.join(options.outputDirectory, 'version.json'),
    JSON.stringify(version, null, 2),
  )
  await writeFile(path.join(options.outputDirectory, '_headers'), HEADERS_FILE)
  await writeFile(
    path.join(options.outputDirectory, 'LICENSE-fluentui-emoji-animated.txt'),
    await license.text(),
  )

  const reused = results.filter((result) => result.reused).length
  return {
    manifest,
    version,
    spriteCount: tasks.length,
    downloaded: results.length - reused,
    reused,
    skipped,
    diff: options.previousManifest
      ? diffManifests(options.previousManifest, manifest)
      : undefined,
  }
}
