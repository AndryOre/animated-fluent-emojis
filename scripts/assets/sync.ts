import { appendFileSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

import type { Manifest } from '../../src/utils/types.js'
import { buildAssets } from './build.js'
import { PIPELINE_VERSION } from './catalog.js'
import {
  formatSource,
  renderEmojiIdModule,
  renderEmojiLists,
} from './emoji-lists.js'
import {
  appendStepSummary,
  assertDiscoveryHealthy,
  assertFileCountWithinLimit,
  assertRemovalsWithinLimit,
} from './guards.js'
import { fetchOkOrMissing, type FetchLike } from './http.js'
import { KNOWN_TEAMS_HASHES } from './known-teams-versions.js'
import { V1_DIRECTORY } from './layout-v1.js'
import { diffManifests } from './manifest-ops.js'
import { fetchMitCommitSha } from './mit.js'
import type { PublishedVersion } from './site-writer.js'
import {
  discoverTeamsVersion,
  probeVersion,
  type TeamsVersion,
} from './teams.js'

const DEFAULT_PUBLISHED_URL = 'https://animated-fluent-emojis.pages.dev'

/**
 * Decides whether the published v1 layout is missing or was built by another
 * pipeline version.
 * @param publishedV1 The `/v1/version.json` marker, if it exists.
 * @returns Whether the layout must be published again.
 */
export function isV1LayoutStale(
  publishedV1: PublishedVersion | undefined,
): boolean {
  return (
    publishedV1 === undefined ||
    !publishedV1.layouts.includes(V1_DIRECTORY) ||
    publishedV1.pipelineVersion !== PIPELINE_VERSION
  )
}

/**
 * Decides whether the published catalog is out of date.
 * @param published The root version marker, if any.
 * @param publishedV1 The `/v1/version.json` marker, if any.
 * @param latest The newest Teams hash and official repository commit.
 * @param latest.teamsHash The newest Teams metadata hash.
 * @param latest.mitSha The latest official repository commit.
 * @param rebuild Whether to rebuild regardless.
 * @returns Whether a new build is needed.
 */
export function needsRebuild(
  published: PublishedVersion | undefined,
  publishedV1: PublishedVersion | undefined,
  latest: { teamsHash: string; mitSha: string },
  rebuild: boolean,
): boolean {
  return (
    rebuild ||
    published?.teamsHash !== latest.teamsHash ||
    published.mitSha !== latest.mitSha ||
    isV1LayoutStale(publishedV1)
  )
}

/**
 * Creates the removal guard that runs on the planned catalog, before any
 * sprite is converted.
 * @param previous The previously published manifest, if any.
 * @param bypassGuards Whether the guard is bypassed.
 * @returns A callback for `onPlanned`, or undefined when there is nothing to compare.
 */
export function createPlanGuard(
  previous: Manifest | undefined,
  bypassGuards: boolean,
): ((planned: Manifest) => void) | undefined {
  if (!previous) return undefined
  return (planned) => {
    assertRemovalsWithinLimit(
      previous,
      diffManifests(previous, planned),
      bypassGuards,
    )
  }
}

/**
 * Reads a JSON file from the published site.
 * @param fetchImplementation The fetch function to use.
 * @param baseUrl The site origin.
 * @param fileName The file to read, such as `version.json`.
 * @param attempts How many times to try before giving up.
 * @returns The parsed JSON, or undefined when the site or file does not exist yet.
 */
export async function fetchPublishedJson<Value>(
  fetchImplementation: FetchLike,
  baseUrl: string,
  fileName: string,
  attempts?: number,
): Promise<Value | undefined> {
  const url = `${baseUrl}/${fileName}`
  const response = await fetchOkOrMissing(
    fetchImplementation,
    url,
    {
      headers: { 'cache-control': 'no-cache' },
    },
    attempts,
  )
  if (!response) return undefined
  try {
    return (await response.json()) as Value
  } catch (error: unknown) {
    throw new Error(`Could not parse the JSON published at ${url}`, {
      cause: error,
    })
  }
}

/**
 * Renders an error with its full `cause` chain and stack for the CLI.
 * @param error The thrown value.
 * @returns A multi-line description.
 */
export function formatErrorChain(error: unknown): string {
  const lines: string[] = []
  let current: unknown = error
  let depth = 0
  while (current !== undefined && depth < 10) {
    const prefix = depth === 0 ? '' : 'Caused by: '
    if (current instanceof Error) {
      lines.push(`${prefix}${current.stack ?? current.message}`)
      if (current instanceof AggregateError) {
        for (const inner of current.errors as unknown[]) {
          lines.push(
            `  - ${formatErrorChain(inner).replaceAll('\n', '\n    ')}`,
          )
        }
      }
      current = current.cause
    } else {
      lines.push(
        `${prefix}${typeof current === 'string' ? current : JSON.stringify(current)}`,
      )
      current = undefined
    }
    depth += 1
  }
  return lines.join('\n')
}

function buildGithubHeaders(): Record<string, string> {
  const token = process.env.GITHUB_TOKEN
  return token ? { authorization: `Bearer ${token}` } : {}
}

function setOutputs(outputs: Record<string, string>): void {
  const outputFile = process.env.GITHUB_OUTPUT
  if (!outputFile) return
  appendFileSync(
    outputFile,
    Object.entries(outputs)
      .map(([key, value]) => `${key}=${value}\n`)
      .join(''),
  )
}

function reportDiscovery(warnings: readonly string[]): void {
  for (const warning of warnings) console.warn(`warning: ${warning}`)
  appendStepSummary('Teams discovery warnings', warnings)
}

async function runDetect(
  publishedUrl: string,
  rebuild: boolean,
  bypassGuards: boolean,
): Promise<void> {
  const fetchImplementation: FetchLike = fetch
  const published = await fetchPublishedJson<PublishedVersion>(
    fetchImplementation,
    publishedUrl,
    'version.json',
  )
  const publishedV1 = await fetchPublishedJson<PublishedVersion>(
    fetchImplementation,
    publishedUrl,
    `${V1_DIRECTORY}/version.json`,
  )
  const discovery = await discoverTeamsVersion({
    fetchImplementation,
    knownHashes: [
      ...(published ? [published.teamsHash] : []),
      ...KNOWN_TEAMS_HASHES,
    ],
  })
  reportDiscovery(discovery.warnings)
  assertDiscoveryHealthy(discovery, bypassGuards)
  const mitSha = await fetchMitCommitSha(
    fetchImplementation,
    buildGithubHeaders(),
  )
  const changed = needsRebuild(
    published,
    publishedV1,
    { teamsHash: discovery.version.hash, mitSha },
    rebuild,
  )
  console.log(
    JSON.stringify(
      { published, publishedV1, latest: discovery.version, mitSha, changed },
      null,
      2,
    ),
  )
  setOutputs({
    changed: String(changed),
    teams_hash: discovery.version.hash,
    mit_sha: mitSha,
  })
}

async function runBuild(options: {
  teamsHash: string | undefined
  publishedUrl: string
  outputDirectory: string
  cacheDirectory: string
  limit: number | undefined
  bypassGuards: boolean
}): Promise<void> {
  const fetchImplementation: FetchLike = fetch
  let teamsVersion: TeamsVersion | undefined
  if (options.teamsHash) {
    teamsVersion = await probeVersion(fetchImplementation, options.teamsHash)
    if (!teamsVersion) {
      throw new Error(`Teams manifest ${options.teamsHash} is not available`)
    }
  } else {
    const discovery = await discoverTeamsVersion({
      fetchImplementation,
      knownHashes: KNOWN_TEAMS_HASHES,
    })
    reportDiscovery(discovery.warnings)
    assertDiscoveryHealthy(discovery, options.bypassGuards)
    teamsVersion = discovery.version
  }

  const previousManifest = await fetchPublishedJson<Manifest>(
    fetchImplementation,
    options.publishedUrl,
    'manifest.json',
  )
  const result = await buildAssets({
    fetchImplementation,
    githubHeaders: buildGithubHeaders(),
    teamsVersion,
    outputDirectory: options.outputDirectory,
    cacheDirectory: options.cacheDirectory,
    limit: options.limit,
    previousManifest,
    liveUrl: options.publishedUrl,
    onPlanned:
      options.limit === undefined
        ? createPlanGuard(previousManifest, options.bypassGuards)
        : undefined,
  })
  await assertFileCountWithinLimit(options.outputDirectory)
  if (result.diff) {
    appendStepSummary('Catalog diff', [
      `Added: ${String(result.diff.added.length)}`,
      `Removed: ${String(result.diff.removed.length)}`,
      `Changed: ${String(result.diff.changed.length)}`,
    ])
  }
  appendStepSummary('Sprite sources', [
    `Seeded from the live site: ${String(result.seeded)} emoji(s)`,
    `Built from source: ${String(result.downloaded)} sprite(s)`,
    `Reused from the cache: ${String(result.reused)} sprite(s)`,
    `Retained from the previous generation: ${String(result.retained)} emoji(s)`,
  ])
  console.log(
    JSON.stringify(
      {
        version: result.version,
        sprites: result.spriteCount,
        downloaded: result.downloaded,
        reused: result.reused,
        seeded: result.seeded,
        retained: result.retained,
        diff: result.diff && {
          added: result.diff.added.length,
          removed: result.diff.removed.length,
          changed: result.diff.changed.length,
        },
      },
      null,
      2,
    ),
  )
}

async function runLists(
  manifestPath: string,
  docsDirectory: string,
  emojiIdPath: string,
): Promise<void> {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8')) as Manifest
  await mkdir(docsDirectory, { recursive: true })
  for (const [fileName, source] of renderEmojiLists(manifest)) {
    const filePath = path.join(docsDirectory, fileName)
    await writeFile(filePath, await formatSource(source, filePath))
  }
  await mkdir(path.dirname(emojiIdPath), { recursive: true })
  await writeFile(
    emojiIdPath,
    await formatSource(renderEmojiIdModule(manifest), emojiIdPath),
  )
}

async function main(): Promise<void> {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      'published-url': { type: 'string', default: DEFAULT_PUBLISHED_URL },
      'teams-hash': { type: 'string' },
      out: { type: 'string', default: 'dist-assets' },
      cache: { type: 'string', default: '.cache/assets' },
      limit: { type: 'string' },
      manifest: { type: 'string', default: 'dist-assets/manifest.json' },
      docs: { type: 'string', default: 'docs' },
      'emoji-id': {
        type: 'string',
        default: 'src/utils/emoji-id.generated.ts',
      },
      rebuild: { type: 'boolean', default: false },
      'bypass-guards': { type: 'boolean', default: false },
    },
  })
  const [command] = positionals
  switch (command) {
    case 'detect': {
      await runDetect(
        values['published-url'],
        values.rebuild,
        values['bypass-guards'],
      )
      break
    }
    case 'build': {
      await runBuild({
        teamsHash: values['teams-hash'],
        publishedUrl: values['published-url'],
        outputDirectory: values.out,
        cacheDirectory: values.cache,
        limit: values.limit === undefined ? undefined : Number(values.limit),
        bypassGuards: values['bypass-guards'],
      })
      break
    }
    case 'lists': {
      await runLists(values.manifest, values.docs, values['emoji-id'])
      break
    }
    default: {
      throw new Error('Usage: sync.ts <detect|build|lists> [options]')
    }
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    await main()
  } catch (error: unknown) {
    console.error(formatErrorChain(error))
    process.exitCode = 1
  }
}
