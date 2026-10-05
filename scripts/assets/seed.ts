import type { Manifest } from '../../src/utils/types.js'
import {
  buildHdOutputPath,
  buildOutputPath,
  hashHdEtag,
  type SpriteTask,
} from './catalog.js'
import { fetchOkOrMissing, type FetchLike } from './http.js'
import { buildV1SpritePath } from './layout-v1.js'
import { findSpriteSheetProblem } from './validate.js'

const STANDARD_FRAME_SIZE = 100
const HD_FRAME_SIZE = 200
const TONE_SUFFIXES = ['_s2', '_s3', '_s4', '_s5', '_s6'] as const

/**
 * What the previously published manifest says about one emoji.
 */
export interface PreviousEmoji {
  readonly id: string
  readonly categoryTitle: string
  readonly etag: string
  readonly diverse: boolean
  readonly hd: boolean
  readonly fps: number
  readonly framesCount: number
}

/**
 * A sprite sheet downloaded from the live site and checked.
 */
export interface LiveSprite {
  readonly legacyPath: string
  readonly v1Path: string
  readonly bytes: Buffer
  readonly hd: boolean
  readonly framesCount: number
}

interface SpriteFileRef {
  readonly legacyPath: string
  readonly hd: boolean
}

/**
 * Builds the live URL of a file in the versioned layout.
 * @param liveUrl The base URL of the published site.
 * @param v1Path A relative path such as `v1/sprites/Cat/id.<etag>.png`.
 * @returns The URL with every path segment percent-encoded.
 */
export function buildLiveSpriteUrl(liveUrl: string, v1Path: string): string {
  const encoded = v1Path
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')
  return `${liveUrl.replace(/\/+$/, '')}/${encoded}`
}

/**
 * Indexes the previously published manifest by emoji id.
 * @param manifest The previous manifest, if any.
 * @returns What is known about each previously published emoji.
 */
export function indexPreviousEmojis(
  manifest: Manifest | undefined,
): Map<string, PreviousEmoji> {
  const entries = (manifest?.categories ?? []).flatMap((category) =>
    category.emoticons.map((emoticon): [string, PreviousEmoji] => [
      emoticon.id,
      {
        id: emoticon.id,
        categoryTitle: category.title,
        etag: emoticon.etag,
        diverse: emoticon.diverse,
        hd: (emoticon as { hd?: unknown }).hd === true,
        fps: emoticon.animation.fps,
        framesCount: emoticon.animation.framesCount,
      },
    ]),
  )
  return new Map(entries)
}

/**
 * Derives the etag an emoji will be published under, before building it.
 * @param baseEtag The etag the catalog gives the emoji without HD.
 * @param emojiTasks Every sprite task of the emoji.
 * @returns The HD-aware etag when every tone has an HD source, else the base.
 */
export function expectEmojiEtag(
  baseEtag: string,
  emojiTasks: readonly SpriteTask[],
): string {
  const withHd = emojiTasks.filter(
    (task) => task.hdOutputPath !== undefined && task.hdBlobSha !== undefined,
  )
  if (withHd.length === 0 || withHd.length !== emojiTasks.length) {
    return baseEtag
  }
  return hashHdEtag(
    baseEtag,
    withHd.map((task) => ({
      toneSuffix: task.toneSuffix,
      blobSha: task.hdBlobSha ?? '',
    })),
  )
}

async function downloadLiveSprite(
  fetchImplementation: FetchLike,
  liveUrl: string,
  file: SpriteFileRef,
  previous: PreviousEmoji,
): Promise<LiveSprite | undefined> {
  const v1Path = buildV1SpritePath(file.legacyPath, previous.etag)
  try {
    const response = await fetchOkOrMissing(
      fetchImplementation,
      buildLiveSpriteUrl(liveUrl, v1Path),
    )
    if (!response) return undefined
    const bytes = Buffer.from(await response.arrayBuffer())
    const problem = await findSpriteSheetProblem(
      bytes,
      file.hd ? HD_FRAME_SIZE : STANDARD_FRAME_SIZE,
      previous.framesCount,
    )
    if (problem !== undefined) {
      console.warn(`Live sprite ${v1Path} ${problem}`)
      return undefined
    }
    return {
      legacyPath: file.legacyPath,
      v1Path,
      bytes,
      hd: file.hd,
      framesCount: previous.framesCount,
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.warn(`Live sprite ${v1Path} could not be fetched: ${message}`)
    return undefined
  }
}

async function downloadAll(
  fetchImplementation: FetchLike,
  liveUrl: string,
  files: readonly SpriteFileRef[],
  previous: PreviousEmoji,
): Promise<LiveSprite[] | undefined> {
  const sprites = await Promise.all(
    files.map((file) =>
      downloadLiveSprite(fetchImplementation, liveUrl, file, previous),
    ),
  )
  return sprites.every((sprite) => sprite !== undefined) ? sprites : undefined
}

/**
 * Lists the legacy-relative sprite paths a previously published emoji owns.
 * @param previous The emoji as the previous manifest described it.
 * @returns Every standard sheet, plus every HD sheet when it was published.
 */
export function listPreviousFiles(previous: PreviousEmoji): SpriteFileRef[] {
  const suffixes = previous.diverse ? ['', ...TONE_SUFFIXES] : ['']
  return suffixes.flatMap((suffix) => [
    {
      legacyPath: buildOutputPath(previous.categoryTitle, previous.id, suffix),
      hd: false,
    },
    ...(previous.hd
      ? [
          {
            legacyPath: buildHdOutputPath(
              previous.categoryTitle,
              previous.id,
              suffix,
            ),
            hd: true,
          },
        ]
      : []),
  ])
}

/**
 * Downloads every sheet of an unchanged emoji from the live versioned layout.
 * It is all or nothing: one missing or invalid file rejects the whole emoji so
 * its tones and HD sheets always come from one source.
 * @param fetchImplementation The fetch function to use.
 * @param liveUrl The base URL of the published site.
 * @param emojiTasks Every sprite task of the emoji.
 * @param previous The emoji as the previous manifest described it.
 * @returns The checked sheets, or undefined to build from source.
 */
export function seedFromLive(
  fetchImplementation: FetchLike,
  liveUrl: string,
  emojiTasks: readonly SpriteTask[],
  previous: PreviousEmoji,
): Promise<LiveSprite[] | undefined> {
  const files = emojiTasks.flatMap((task): SpriteFileRef[] => [
    { legacyPath: task.outputPath, hd: false },
    ...(task.hdOutputPath === undefined
      ? []
      : [{ legacyPath: task.hdOutputPath, hd: true }]),
  ])
  return downloadAll(fetchImplementation, liveUrl, files, previous)
}

/**
 * Downloads the previous generation of a changed emoji from the live layout,
 * under its old etag file names.
 * @param fetchImplementation The fetch function to use.
 * @param liveUrl The base URL of the published site.
 * @param previous The emoji as the previous manifest described it.
 * @returns The checked sheets, or undefined when any is missing or invalid.
 */
export function retainFromLive(
  fetchImplementation: FetchLike,
  liveUrl: string,
  previous: PreviousEmoji,
): Promise<LiveSprite[] | undefined> {
  return downloadAll(
    fetchImplementation,
    liveUrl,
    listPreviousFiles(previous),
    previous,
  )
}
