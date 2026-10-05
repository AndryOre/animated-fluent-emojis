import { cp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
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

const DOWNLOAD_CONCURRENCY = 12

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
 * The outcome of a build.
 */
export interface BuildResult {
  readonly manifest: Manifest
  readonly version: PublishedVersion
  readonly spriteCount: number
  readonly downloaded: number
  readonly reused: number
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

async function fileExists(filePath: string): Promise<boolean> {
  try {
    const stats = await stat(filePath)
    return stats.isFile()
  } catch {
    return false
  }
}

async function readState(cacheDirectory: string): Promise<StateFile> {
  try {
    return JSON.parse(
      await readFile(path.join(cacheDirectory, 'state.json'), 'utf8'),
    ) as StateFile
  } catch {
    return {}
  }
}

async function writeBytes(filePath: string, bytes: Uint8Array): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, bytes)
}

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
  const catalog = buildCatalog(teamsManifest, mitIndex.emojis)
  const tasks = limitCatalog(catalog.tasks, options.limit)

  const state = await readState(options.cacheDirectory)
  let results: Awaited<ReturnType<typeof produceSprite>>[]
  try {
    results = await mapWithConcurrency(tasks, DOWNLOAD_CONCURRENCY, (task) =>
      produceSprite(task, {
        options,
        mitSha: mitIndex.commitSha,
        state,
        convert,
      }),
    )
  } finally {
    await mkdir(options.cacheDirectory, { recursive: true })
    await writeFile(
      path.join(options.cacheDirectory, 'state.json'),
      JSON.stringify(state),
    )
  }

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
      categories: catalog.manifest.categories.map((category) => ({
        ...category,
        emoticons:
          options.limit === undefined
            ? category.emoticons
            : category.emoticons.filter((emoticon) =>
                generatedIds.has(emoticon.id),
              ),
      })),
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
    diff: options.previousManifest
      ? diffManifests(options.previousManifest, manifest)
      : undefined,
  }
}
