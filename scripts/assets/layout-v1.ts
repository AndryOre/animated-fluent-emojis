import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'

import type { Manifest } from '../../src/utils/types.js'
import type { SpriteTask } from './catalog.js'
import { toSlimManifest, type SlimManifest } from './slim-manifest.js'
import { findSpriteSheetProblem, validateCatalog } from './validate.js'

/**
 * The directory holding the versioned asset layout, as described in ADR 0010.
 */
export const V1_DIRECTORY = 'v1'

/**
 * The `_headers` rules of the versioned layout. Sprite names carry their etag,
 * so they are immutable; the manifest may lag by an hour; `version.json` is
 * always revalidated.
 */
export const V1_HEADERS_FILE = `/v1/sprites/*
  Cache-Control: public, max-age=31536000, immutable
  Access-Control-Allow-Origin: *

/v1/manifest.slim.json
  Cache-Control: public, max-age=3600
  Access-Control-Allow-Origin: *

/v1/version.json
  Cache-Control: no-cache
  Access-Control-Allow-Origin: *
`

type SlimCategory = SlimManifest['categories'][number]

/**
 * The versioned slim manifest shape: the slim entries plus the `unicode`
 * string of each emoji.
 */
export interface V1Manifest {
  readonly categories: readonly (Omit<SlimCategory, 'emoticons'> & {
    readonly emoticons: readonly (SlimCategory['emoticons'][number] & {
      readonly unicode: string
    })[]
  })[]
}

/**
 * Inputs for {@link validateV1Layout}.
 */
export interface V1ValidationInput {
  readonly manifest: Manifest
  readonly tasks: readonly SpriteTask[]
  readonly outputDirectory: string
  readonly retained?: readonly RetainedSprite[]
}

/**
 * A previous-generation sheet kept in the site next to the current files.
 */
export interface RetainedSprite {
  readonly v1Path: string
  readonly hd: boolean
  readonly framesCount: number
}

/**
 * Derives the etag-named path of a sprite sheet in the versioned layout.
 * `sprites/Cat/id_s2.png` becomes `v1/sprites/Cat/id_s2.<etag>.png` and an HD
 * sheet `sprites/Cat/id_s2@2x.png` becomes
 * `v1/sprites/Cat/id_s2.<etag>@2x.png`.
 * @param legacyPath The legacy relative sprite path.
 * @param etag The etag of the emoji the sheet belongs to.
 * @returns The relative path inside the site.
 */
export function buildV1SpritePath(legacyPath: string, etag: string): string {
  const match = /^(.*?)(@2x)?\.png$/.exec(legacyPath)
  if (!match) throw new Error(`Not a sprite path: ${legacyPath}`)
  return `${V1_DIRECTORY}/${match[1] ?? ''}.${etag}${match[2] ?? ''}.png`
}

/**
 * Reduces the full manifest to the versioned slim manifest.
 * @param manifest The full manifest.
 * @returns The slim manifest with a `unicode` string per emoji.
 */
export function toV1Manifest(manifest: Manifest): V1Manifest {
  const unicodeById = new Map(
    manifest.categories.flatMap((category) =>
      category.emoticons.map(
        (emoticon) => [emoticon.id, emoticon.unicode] as const,
      ),
    ),
  )
  return {
    categories: toSlimManifest(manifest).categories.map((category) => ({
      ...category,
      emoticons: category.emoticons.map((emoticon) => ({
        ...emoticon,
        unicode: unicodeById.get(emoticon.id) ?? '',
      })),
    })),
  }
}

/**
 * Maps every sprite task to its etag-named path in the versioned layout.
 * @param tasks The sprite tasks with legacy output paths.
 * @param manifest The manifest providing each emoji's etag.
 * @returns The tasks with versioned `outputPath` and `hdOutputPath`.
 */
function toV1Tasks(
  tasks: readonly SpriteTask[],
  manifest: Manifest,
): SpriteTask[] {
  const etagById = new Map(
    manifest.categories.flatMap((category) =>
      category.emoticons.map(
        (emoticon) => [emoticon.id, emoticon.etag] as const,
      ),
    ),
  )
  return tasks.map((task) => {
    const etag = etagById.get(task.id) ?? task.etag
    return {
      ...task,
      outputPath: buildV1SpritePath(task.outputPath, etag),
      ...(task.hdOutputPath !== undefined && {
        hdOutputPath: buildV1SpritePath(task.hdOutputPath, etag),
      }),
    }
  })
}

async function listFiles(directory: string): Promise<string[]> {
  try {
    const entries = await readdir(directory, {
      recursive: true,
      withFileTypes: true,
    })
    return entries
      .filter((entry) => entry.isFile())
      .map((entry) => path.join(entry.parentPath, entry.name))
  } catch {
    return []
  }
}

function splitEtag(
  relativePath: string,
): { stem: string; etag: string } | null {
  const match = /^(.*)\.([^./]+)(@2x)?\.png$/.exec(relativePath)
  return match
    ? { stem: `${match[1] ?? ''}${match[3] ?? ''}`, etag: match[2] ?? '' }
    : null
}

async function findEtagProblems(
  outputDirectory: string,
  expectedPaths: ReadonlySet<string>,
  retainedPaths: ReadonlySet<string>,
): Promise<string[]> {
  const expectedByStem = new Map(
    [...expectedPaths].map((expected) => {
      const parts = splitEtag(expected)
      return [parts?.stem ?? expected, parts?.etag ?? ''] as const
    }),
  )
  const spriteRoot = path.join(outputDirectory, V1_DIRECTORY, 'sprites')
  const files = await listFiles(spriteRoot)
  const present = files.map((file) =>
    path.relative(outputDirectory, file).split(path.sep).join('/'),
  )
  return present
    .filter((file) => !expectedPaths.has(file) && !retainedPaths.has(file))
    .map((file) => {
      const parts = splitEtag(file)
      const expectedEtag = parts ? expectedByStem.get(parts.stem) : undefined
      return expectedEtag === undefined
        ? `${file}: v1 sprite is not in the manifest`
        : `${file}: file name etag "${parts?.etag ?? ''}" disagrees with manifest etag "${expectedEtag}"`
    })
}

async function readJson(filePath: string): Promise<unknown> {
  try {
    return JSON.parse(await readFile(filePath, 'utf8')) as unknown
  } catch (error: unknown) {
    return error instanceof Error ? error : new Error(String(error))
  }
}

async function findManifestProblems(
  outputDirectory: string,
  manifest: Manifest,
): Promise<string[]> {
  const root = path.join(outputDirectory, V1_DIRECTORY)
  const published = await readJson(path.join(root, 'manifest.slim.json'))
  const version = await readJson(path.join(root, 'version.json'))
  const expected = toV1Manifest(manifest)
  const problems: string[] = []
  if (published instanceof Error) {
    problems.push(`v1/manifest.slim.json is unreadable (${published.message})`)
  } else if (JSON.stringify(published) !== JSON.stringify(expected)) {
    problems.push('v1/manifest.slim.json does not match the manifest')
  }
  for (const category of expected.categories) {
    for (const emoticon of category.emoticons) {
      if (emoticon.unicode.length === 0) {
        problems.push(`${emoticon.id}: v1 manifest entry has no unicode`)
      }
    }
  }
  if (version instanceof Error) {
    problems.push(`v1/version.json is unreadable (${version.message})`)
  }
  return problems
}

async function isNonEmptyFile(filePath: string): Promise<boolean> {
  try {
    const stats = await stat(filePath)
    return stats.isFile() && stats.size > 0
  } catch {
    return false
  }
}

async function findRetainedProblems(
  outputDirectory: string,
  retained: readonly RetainedSprite[],
): Promise<string[]> {
  const checks = await Promise.all(
    retained.map(async (sprite) => {
      const problem = await findSpriteSheetProblem(
        path.join(outputDirectory, sprite.v1Path),
        sprite.hd ? 200 : 100,
        sprite.framesCount,
      )
      return problem === undefined
        ? undefined
        : `retained sprite ${sprite.v1Path} ${problem}`
    }),
  )
  return checks.filter((problem) => problem !== undefined)
}

/**
 * Checks the versioned layout written into the site directory: the same sprite
 * checks as {@link validateCatalog} on the etag-named files, that every file
 * name's etag matches the manifest, and that the v1 manifest and
 * `version.json` are present and consistent.
 * Retained previous-generation sheets are decoded and checked against their
 * own frame counts.
 * @param input The manifest, the planned tasks and the built site directory.
 * @throws {Error} An error listing every problem found.
 */
export async function validateV1Layout(
  input: V1ValidationInput,
): Promise<void> {
  const { manifest, tasks, outputDirectory, retained = [] } = input
  const v1Tasks = toV1Tasks(tasks, manifest)
  const expectedPaths = new Set(
    v1Tasks.flatMap((task) =>
      task.hdOutputPath === undefined
        ? [task.outputPath]
        : [task.outputPath, task.hdOutputPath],
    ),
  )
  const problems = [
    ...(await findManifestProblems(outputDirectory, manifest)),
    ...(await findEtagProblems(
      outputDirectory,
      expectedPaths,
      new Set(retained.map((sprite) => sprite.v1Path)),
    )),
    ...(await findRetainedProblems(outputDirectory, retained)),
  ]
  for (const expected of expectedPaths) {
    if (!(await isNonEmptyFile(path.join(outputDirectory, expected)))) {
      problems.push(`missing v1 sprite ${expected}`)
    }
  }
  if (problems.length > 0) {
    throw new Error(
      `v1 layout validation failed with ${String(problems.length)} problem(s):\n${problems
        .map((problem) => `  - ${problem}`)
        .join('\n')}`,
    )
  }
  await validateCatalog({
    manifest,
    tasks: v1Tasks,
    cacheDirectory: outputDirectory,
  })
}
