import {
  appendFile,
  cp,
  mkdir,
  readFile,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises'
import { availableParallelism } from 'node:os'
import path from 'node:path'

import type { Manifest } from '../../src/utils/types.js'
import {
  buildCatalog,
  hashEtag,
  hashHdEtag,
  PIPELINE_VERSION,
  type HdSkippedEmoji,
  type SpriteTask,
} from './catalog.js'
import { countFiles, MAX_OUTPUT_FILES } from './guards.js'
import { fetchOk, mapWithConcurrency, type FetchLike } from './http.js'
import {
  buildV1SpritePath,
  toV1Manifest,
  V1_DIRECTORY,
  V1_HEADERS_FILE,
  validateV1Layout,
  type RetainedSprite,
} from './layout-v1.js'
import { createLimiter } from './limiter.js'
import {
  buildMitMediaUrl,
  loadMitIndex,
  MIT_REPOSITORY,
  type MitIndex,
} from './mit.js'
import {
  expectEmojiEtag,
  indexPreviousEmojis,
  listPreviousFiles,
  retainFromLive,
  seedFromLive,
  type LiveSprite,
  type PreviousEmoji,
} from './seed.js'
import { toSlimManifest } from './slim-manifest.js'
import { convertAnimatedPng, type ConvertedSprite } from './sprites.js'
import { fetchTeamsManifest, type TeamsVersion } from './teams.js'
import { validateCatalog } from './validate.js'

/**
 * How many sprite tasks run at once. Each task is mostly waiting on the
 * network, so this is far above the CPU count.
 */
export const DOWNLOAD_CONCURRENCY = 24

/**
 * How many ffmpeg conversions run at once, independent of
 * {@link DOWNLOAD_CONCURRENCY}. Conversions are CPU-bound.
 * @returns The number of CPUs available to this process.
 */
export function getConversionConcurrency(): number {
  return availableParallelism()
}

const SPRITE_FRAME_SIZE = 100

const HD_FRAME_SIZE = 200

const LICENSE_FILE_COUNT = 1

const HEADERS_FILE = `/sprites/*
  Cache-Control: public, max-age=31536000, immutable
  Access-Control-Allow-Origin: *

/manifest.json
  Cache-Control: public, max-age=3600
  Access-Control-Allow-Origin: *

/manifest.slim.json
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
  readonly pipelineVersion: number
  readonly layouts: readonly string[]
}

type ConvertSprite = (
  animatedPng: Buffer,
  frameSizes: readonly number[],
) => Promise<ConvertedSprite[]>

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
  readonly hdSkipped: readonly HdSkippedEmoji[]
  readonly hdCount: number
  readonly seeded: number
  readonly retained: number
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
  readonly liveUrl?: string
  readonly maxOutputFiles?: number
  readonly convert?: ConvertSprite
  readonly now?: () => Date
  readonly stepSummaryPath?: string
  readonly onPlanned?: (planned: Manifest) => void
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
 * Marks emoticons as having HD sheets and moves their etag to the HD-aware one.
 * @param manifest The manifest with real animations.
 * @param hdEtagById The HD-aware etag of every emoji published with HD sheets.
 * @returns A manifest where those emoticons carry `hd: true`.
 */
export function applyHd(
  manifest: Manifest,
  hdEtagById: ReadonlyMap<string, string>,
): Manifest {
  return {
    categories: manifest.categories.map((category) => ({
      ...category,
      emoticons: category.emoticons.map((emoticon) => {
        const etag = hdEtagById.get(emoticon.id)
        return etag === undefined ? emoticon : { ...emoticon, etag, hd: true }
      }),
    })),
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
    convert: ConvertSprite
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
    const includeHd = await needsHdFromSameSource(task, state, options)
    const [converted, hdConverted] = await convert(
      Buffer.from(await response.arrayBuffer()),
      includeHd ? [SPRITE_FRAME_SIZE, HD_FRAME_SIZE] : [SPRITE_FRAME_SIZE],
    )
    if (!converted) throw new Error('Converter returned no sprite')
    await writeBytes(target, converted.png)
    const animation = { fps: converted.fps, framesCount: converted.framesCount }
    state[task.outputPath] = { etag: task.etag, animation }
    if (includeHd && hdConverted)
      await storeHdSprite(task, hdConverted, context)
    return { task, animation, reused: false }
  }
  throw new Error(`Sprite task has no source: ${task.outputPath}`)
}

function getHdEtag(task: SpriteTask): string {
  return hashEtag(['hd', task.hdBlobSha ?? ''])
}

async function isHdCached(
  task: SpriteTask,
  state: StateFile,
  options: BuildOptions,
): Promise<boolean> {
  if (!task.hdOutputPath) return false
  const cached = state[task.hdOutputPath]
  return (
    cached?.etag === getHdEtag(task) &&
    cached.animation !== undefined &&
    (await fileExists(path.join(options.cacheDirectory, task.hdOutputPath)))
  )
}

async function needsHdFromSameSource(
  task: SpriteTask,
  state: StateFile,
  options: BuildOptions,
): Promise<boolean> {
  return (
    task.hdOutputPath !== undefined &&
    task.hdBlobSha !== undefined &&
    task.hdMitPath === task.mitPath &&
    !(await isHdCached(task, state, options))
  )
}

async function storeHdSprite(
  task: SpriteTask,
  converted: ConvertedSprite,
  context: Parameters<typeof produceSprite>[1],
): Promise<void> {
  const { options, state } = context
  if (!task.hdOutputPath) return
  await writeBytes(
    path.join(options.cacheDirectory, task.hdOutputPath),
    converted.png,
  )
  state[task.hdOutputPath] = {
    etag: getHdEtag(task),
    animation: { fps: converted.fps, framesCount: converted.framesCount },
  }
}

async function produceHdSprite(
  task: SpriteTask,
  context: Parameters<typeof produceSprite>[1],
): Promise<number> {
  const { options, mitSha, state, convert } = context
  const { hdOutputPath, hdMitPath, hdBlobSha } = task
  if (!hdOutputPath || !hdMitPath || !hdBlobSha) {
    throw new Error(`Sprite task has no HD source: ${task.outputPath}`)
  }
  const cached = state[hdOutputPath]
  if (cached?.animation && (await isHdCached(task, state, options))) {
    return cached.animation.framesCount
  }
  const response = await fetchOk(
    options.fetchImplementation,
    buildMitMediaUrl(mitSha, hdMitPath),
  )
  const [converted] = await convert(Buffer.from(await response.arrayBuffer()), [
    HD_FRAME_SIZE,
  ])
  if (!converted) throw new Error('Converter returned no sprite')
  await storeHdSprite(task, converted, context)
  return converted.framesCount
}

async function settleHdSprite(
  task: SpriteTask,
  context: Parameters<typeof produceSprite>[1],
): Promise<
  { task: SpriteTask; framesCount: number } | { task: SpriteTask; error: Error }
> {
  try {
    return { task, framesCount: await produceHdSprite(task, context) }
  } catch (error: unknown) {
    return {
      task,
      error: error instanceof Error ? error : new Error(String(error)),
    }
  }
}

function withoutHd(task: SpriteTask): SpriteTask {
  return {
    source: task.source,
    id: task.id,
    category: task.category,
    toneSuffix: task.toneSuffix,
    etag: task.etag,
    sourceUrl: task.sourceUrl,
    mitPath: task.mitPath,
    outputPath: task.outputPath,
  }
}

function describeHdProblem(
  emojiTasks: readonly Awaited<ReturnType<typeof settleHdSprite>>[],
  standardFrames: number,
): string | undefined {
  for (const outcome of emojiTasks) {
    if ('error' in outcome) {
      return `${outcome.task.hdOutputPath ?? ''}: ${outcome.error.message}`
    }
    if (outcome.framesCount !== standardFrames) {
      return `${outcome.task.hdOutputPath ?? ''} has ${String(outcome.framesCount)} frames, standard sheet has ${String(standardFrames)}`
    }
  }
  return undefined
}

async function buildHdSheets(
  tasks: readonly SpriteTask[],
  manifest: Manifest,
  context: Parameters<typeof produceSprite>[1],
): Promise<{
  tasks: SpriteTask[]
  hdEtagById: Map<string, string>
  skipped: HdSkippedEmoji[]
}> {
  const emoticonById = new Map(
    manifest.categories.flatMap((category) =>
      category.emoticons.map((emoticon) => [emoticon.id, emoticon] as const),
    ),
  )
  const emojiTasksById = Map.groupBy(
    tasks.filter((task) => task.hdOutputPath !== undefined),
    (task) => task.id,
  )
  const outcomes = await mapWithConcurrency(
    emojiTasksById.values().toArray().flat(),
    DOWNLOAD_CONCURRENCY,
    (task) => settleHdSprite(task, context),
  )
  const outcomesById = Map.groupBy(outcomes, (outcome) => outcome.task.id)
  const hdEtagById = new Map<string, string>()
  const skipped: HdSkippedEmoji[] = []
  for (const [id, emojiOutcomes] of outcomesById) {
    const emoticon = emoticonById.get(id)
    const problem =
      emoticon === undefined
        ? 'emoji is not in the manifest'
        : describeHdProblem(emojiOutcomes, emoticon.animation.framesCount)
    if (problem !== undefined || emoticon === undefined) {
      skipped.push({ id, reason: problem ?? 'emoji is not in the manifest' })
      continue
    }
    hdEtagById.set(
      id,
      hashHdEtag(
        emoticon.etag,
        emojiOutcomes.map(({ task }) => ({
          toneSuffix: task.toneSuffix,
          blobSha: task.hdBlobSha ?? '',
        })),
      ),
    )
  }
  return {
    tasks: tasks.map((task) =>
      hdEtagById.has(task.id) ? task : withoutHd(task),
    ),
    hdEtagById,
    skipped,
  }
}

async function seedEmoji(
  emojiTasks: readonly SpriteTask[],
  previous: PreviousEmoji,
  context: Parameters<typeof produceSprite>[1],
  liveUrl: string,
): Promise<boolean> {
  const { options, state } = context
  const sprites = await seedFromLive(
    options.fetchImplementation,
    liveUrl,
    emojiTasks,
    previous,
  )
  if (!sprites) return false
  const animation = { fps: previous.fps, framesCount: previous.framesCount }
  const taskByPath = new Map(
    emojiTasks.flatMap((task) => [
      [task.outputPath, task] as const,
      ...(task.hdOutputPath === undefined
        ? []
        : [[task.hdOutputPath, task] as const]),
    ]),
  )
  for (const sprite of sprites) {
    const task = taskByPath.get(sprite.legacyPath)
    if (!task) continue
    await writeBytes(
      path.join(options.cacheDirectory, sprite.legacyPath),
      sprite.bytes,
    )
    state[sprite.legacyPath] = {
      etag: sprite.hd ? getHdEtag(task) : task.etag,
      animation,
    }
  }
  return true
}

async function isEmojiCached(
  emojiTasks: readonly SpriteTask[],
  context: Parameters<typeof produceSprite>[1],
): Promise<boolean> {
  const { options, state } = context
  const checks = await Promise.all(
    emojiTasks.map(async (task) => {
      const cached = state[task.outputPath]
      return (
        cached?.etag === task.etag &&
        (await fileExists(path.join(options.cacheDirectory, task.outputPath)))
      )
    }),
  )
  return checks.every(Boolean)
}

async function seedUnchangedEmojis(
  tasks: readonly SpriteTask[],
  catalogManifest: Manifest,
  context: Parameters<typeof produceSprite>[1],
): Promise<number> {
  const { liveUrl, previousManifest } = context.options
  if (liveUrl === undefined || previousManifest === undefined) return 0
  const previousById = indexPreviousEmojis(previousManifest)
  const baseEtagById = new Map(
    catalogManifest.categories.flatMap((category) =>
      category.emoticons.map(
        (emoticon) => [emoticon.id, emoticon.etag] as const,
      ),
    ),
  )
  const candidates = Map.groupBy(tasks, (task) => task.id)
    .entries()
    .filter(([id, emojiTasks]) => {
      const previous = previousById.get(id)
      const baseEtag = baseEtagById.get(id)
      return (
        previous !== undefined &&
        baseEtag !== undefined &&
        previous.etag === expectEmojiEtag(baseEtag, emojiTasks) &&
        previous.hd === emojiTasks.every((task) => task.hdOutputPath)
      )
    })
    .toArray()
  const seeded = await mapWithConcurrency(
    candidates,
    DOWNLOAD_CONCURRENCY,
    async ([id, emojiTasks]) => {
      const previous = previousById.get(id)
      const cached = await isEmojiCached(emojiTasks, context)
      return previous && !cached
        ? seedEmoji(emojiTasks, previous, context, liveUrl)
        : false
    },
  )
  return seeded.filter(Boolean).length
}

async function retainPreviousGeneration(input: {
  options: BuildOptions
  manifest: Manifest
  emojiIds: ReadonlySet<string>
  fileBudget: number
}): Promise<{ retained: RetainedSprite[]; emojiCount: number }> {
  const { options, manifest, emojiIds, fileBudget } = input
  if (options.liveUrl === undefined || options.previousManifest === undefined) {
    return { retained: [], emojiCount: 0 }
  }
  const liveUrl = options.liveUrl
  const previousById = indexPreviousEmojis(options.previousManifest)
  const changed = manifest.categories
    .flatMap((category) => category.emoticons)
    .filter((emoticon) => emojiIds.has(emoticon.id))
    .flatMap((emoticon) => {
      const previous = previousById.get(emoticon.id)
      return previous && previous.etag !== emoticon.etag ? [previous] : []
    })
    .toSorted((left, right) => left.id.localeCompare(right.id))
  let remaining = fileBudget
  const affordable: PreviousEmoji[] = []
  for (const previous of changed) {
    const fileCount = listPreviousFiles(previous).length
    if (fileCount > remaining) continue
    remaining -= fileCount
    affordable.push(previous)
  }
  const downloaded = await mapWithConcurrency(
    affordable,
    DOWNLOAD_CONCURRENCY,
    (previous) =>
      retainFromLive(options.fetchImplementation, liveUrl, previous),
  )
  const kept = downloaded.filter(
    (sprites): sprites is LiveSprite[] => sprites !== undefined,
  )
  for (const sprite of kept.flat()) {
    await writeBytes(
      path.join(options.outputDirectory, sprite.v1Path),
      sprite.bytes,
    )
  }
  return {
    retained: kept.flat().map(({ v1Path, hd, framesCount }) => ({
      v1Path,
      hd,
      framesCount,
    })),
    emojiCount: kept.length,
  }
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

async function reportHdSkipped(
  skipped: readonly HdSkippedEmoji[],
  stepSummaryPath: string | undefined,
): Promise<void> {
  if (skipped.length === 0) return
  for (const entry of skipped) {
    console.warn(`Skipped HD for ${entry.id}: ${entry.reason}`)
  }
  if (!stepSummaryPath) return
  const lines = skipped.map((entry) => `- \`${entry.id}\`: ${entry.reason}`)
  await appendFile(
    stepSummaryPath,
    `### Emojis without HD (${String(skipped.length)})\n\n${lines.join('\n')}\n`,
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
  const limitConversion = createLimiter(getConversionConcurrency())
  const rawConvert = options.convert ?? convertAnimatedPng
  const convert: ConvertSprite = (animatedPng, frameSizes) =>
    limitConversion(() => rawConvert(animatedPng, frameSizes))
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
  options.onPlanned?.(catalog.manifest)
  const limitedTasks = limitCatalog(catalog.tasks, options.limit)

  const state = await readState(options.cacheDirectory)
  const context = { options, mitSha: mitIndex.commitSha, state, convert }
  const seeded = await seedUnchangedEmojis(
    limitedTasks,
    catalog.manifest,
    context,
  )
  const outcomes = await mapWithConcurrency(
    limitedTasks,
    DOWNLOAD_CONCURRENCY,
    (task) => settleSprite(task, context),
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
  const animatedManifest = applyAnimations(
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

  const hd = await buildHdSheets(tasks, animatedManifest, context)
  await writeFile(
    path.join(options.cacheDirectory, 'state.json'),
    JSON.stringify(state),
  )
  const hdSkipped = [...catalog.hdSkipped, ...hd.skipped]
  await reportHdSkipped(
    hdSkipped,
    options.stepSummaryPath ?? process.env.GITHUB_STEP_SUMMARY,
  )
  const manifest = applyHd(animatedManifest, hd.hdEtagById)

  await validateCatalog({
    manifest,
    tasks: hd.tasks,
    cacheDirectory: options.cacheDirectory,
  })

  const etagById = new Map(
    manifest.categories.flatMap((category) =>
      category.emoticons.map(
        (emoticon) => [emoticon.id, emoticon.etag] as const,
      ),
    ),
  )
  await rm(options.outputDirectory, { recursive: true, force: true })
  for (const task of hd.tasks) {
    for (const relativePath of [task.outputPath, task.hdOutputPath]) {
      if (relativePath === undefined) continue
      const destination = path.join(options.outputDirectory, relativePath)
      await mkdir(path.dirname(destination), { recursive: true })
      await cp(path.join(options.cacheDirectory, relativePath), destination)
      const versioned = path.join(
        options.outputDirectory,
        buildV1SpritePath(relativePath, etagById.get(task.id) ?? task.etag),
      )
      await mkdir(path.dirname(versioned), { recursive: true })
      await cp(path.join(options.cacheDirectory, relativePath), versioned)
    }
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
    pipelineVersion: PIPELINE_VERSION,
    layouts: [V1_DIRECTORY],
  }
  await writeFile(
    path.join(options.outputDirectory, 'manifest.json'),
    JSON.stringify(manifest),
  )
  await writeFile(
    path.join(options.outputDirectory, 'manifest.slim.json'),
    JSON.stringify(toSlimManifest(manifest)),
  )
  await writeFile(
    path.join(options.outputDirectory, 'version.json'),
    JSON.stringify(version, null, 2),
  )
  const versionedDirectory = path.join(options.outputDirectory, V1_DIRECTORY)
  await mkdir(versionedDirectory, { recursive: true })
  await writeFile(
    path.join(versionedDirectory, 'manifest.slim.json'),
    JSON.stringify(toV1Manifest(manifest)),
  )
  await writeFile(
    path.join(versionedDirectory, 'version.json'),
    JSON.stringify(version, null, 2),
  )
  await writeFile(
    path.join(options.outputDirectory, '_headers'),
    `${HEADERS_FILE}\n${V1_HEADERS_FILE}`,
  )
  const fileBudget =
    (options.maxOutputFiles ?? MAX_OUTPUT_FILES) -
    (await countFiles(options.outputDirectory)) -
    LICENSE_FILE_COUNT
  const retention = await retainPreviousGeneration({
    options,
    manifest,
    emojiIds: generatedIds,
    fileBudget,
  })
  await validateV1Layout({
    manifest,
    tasks: hd.tasks,
    outputDirectory: options.outputDirectory,
    retained: retention.retained,
  })
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
    hdSkipped,
    hdCount: hd.hdEtagById.size,
    seeded,
    retained: retention.emojiCount,
    diff: options.previousManifest
      ? diffManifests(options.previousManifest, manifest)
      : undefined,
  }
}
