import { stat } from 'node:fs/promises'
import path from 'node:path'

import type { Manifest } from '../../src/utils/types.js'
import type { SpriteTask } from './catalog.js'

const REQUIRED_TONE_SUFFIXES = ['_s2', '_s3', '_s4', '_s5', '_s6'] as const

/**
 * Inputs for {@link validateCatalog}.
 */
export interface ValidationInput {
  readonly manifest: Manifest
  readonly tasks: readonly SpriteTask[]
  readonly cacheDirectory: string
}

async function isNonEmptyFile(filePath: string): Promise<boolean> {
  try {
    const stats = await stat(filePath)
    return stats.isFile() && stats.size > 0
  } catch {
    return false
  }
}

function findAnimationProblems(manifest: Manifest): string[] {
  return manifest.categories.flatMap((category) =>
    category.emoticons.flatMap((emoticon) => {
      const { fps, framesCount } = emoticon.animation
      return framesCount < 1 || fps < 1
        ? [
            `${emoticon.id}: invalid animation (fps ${String(fps)}, framesCount ${String(framesCount)})`,
          ]
        : []
    }),
  )
}

function findToneProblems(
  manifest: Manifest,
  tasks: readonly SpriteTask[],
): string[] {
  const suffixesById = new Map<string, Set<string>>()
  for (const task of tasks) {
    const suffixes = suffixesById.get(task.id) ?? new Set<string>()
    suffixes.add(task.toneSuffix)
    suffixesById.set(task.id, suffixes)
  }
  return manifest.categories.flatMap((category) =>
    category.emoticons.flatMap((emoticon) => {
      if (!emoticon.diverse) return []
      const present = suffixesById.get(emoticon.id) ?? new Set<string>()
      return REQUIRED_TONE_SUFFIXES.filter(
        (suffix) => !present.has(suffix),
      ).map((suffix) => `${emoticon.id}: missing tone sprite ${suffix}`)
    }),
  )
}

async function findMissingSprites(
  tasks: readonly SpriteTask[],
  cacheDirectory: string,
): Promise<string[]> {
  const checks = await Promise.all(
    tasks.map(
      async (task) =>
        [
          task,
          await isNonEmptyFile(path.join(cacheDirectory, task.outputPath)),
        ] as const,
    ),
  )
  return checks
    .filter(([, exists]) => !exists)
    .map(([task]) => `${task.id}: missing sprite ${task.outputPath}`)
}

/**
 * Checks that a built catalog is complete enough to publish: every emoji has a
 * real animation, every planned sprite exists and every diverse emoji has all
 * five tone sprites.
 * @param input The manifest, the planned sprite tasks and the sprite cache.
 * @throws {Error} An error listing every problem found.
 */
export async function validateCatalog(input: ValidationInput): Promise<void> {
  const problems = [
    ...findAnimationProblems(input.manifest),
    ...findToneProblems(input.manifest, input.tasks),
    ...(await findMissingSprites(input.tasks, input.cacheDirectory)),
  ]
  if (problems.length === 0) return
  throw new Error(
    `Catalog validation failed with ${String(problems.length)} problem(s):\n${problems
      .map((problem) => `  - ${problem}`)
      .join('\n')}`,
  )
}
