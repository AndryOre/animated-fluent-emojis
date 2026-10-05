import { appendFileSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

import type { Manifest } from '../../src/utils/types.js'
import { buildAssets, type PublishedVersion } from './build.js'
import { formatMarkdown, renderEmojiLists } from './emoji-lists.js'
import type { FetchLike } from './http.js'
import { KNOWN_TEAMS_HASHES } from './known-teams-versions.js'
import { fetchMitCommitSha } from './mit.js'
import {
  discoverTeamsVersion,
  probeVersion,
  type TeamsVersion,
} from './teams.js'

const DEFAULT_PUBLISHED_URL = 'https://animated-fluent-emojis.pages.dev'

/**
 * Decides whether the published catalog is out of date.
 * @param published The published version marker, if any.
 * @param latest The newest Teams hash and official repository commit.
 * @param latest.teamsHash The newest Teams metadata hash.
 * @param latest.mitSha The latest official repository commit.
 * @param force Whether to rebuild regardless.
 * @returns Whether a new build is needed.
 */
export function needsRebuild(
  published: PublishedVersion | undefined,
  latest: { teamsHash: string; mitSha: string },
  force: boolean,
): boolean {
  return (
    force ||
    published?.teamsHash !== latest.teamsHash ||
    published.mitSha !== latest.mitSha
  )
}

/**
 * Reads a JSON file from the published site.
 * @param fetchImplementation The fetch function to use.
 * @param baseUrl The site origin.
 * @param fileName The file to read, such as `version.json`.
 * @returns The parsed JSON, or undefined when the site or file does not exist yet.
 */
export async function fetchPublishedJson<Value>(
  fetchImplementation: FetchLike,
  baseUrl: string,
  fileName: string,
): Promise<Value | undefined> {
  const url = `${baseUrl}/${fileName}`
  const response = await fetchImplementation(url, {
    headers: { 'cache-control': 'no-cache' },
  })
  if (response.status === 404) return undefined
  if (!response.ok) {
    throw new Error(`HTTP ${String(response.status)} for ${url}`)
  }
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

async function runDetect(publishedUrl: string, force: boolean): Promise<void> {
  const fetchImplementation: FetchLike = fetch
  const published = await fetchPublishedJson<PublishedVersion>(
    fetchImplementation,
    publishedUrl,
    'version.json',
  )
  const discovery = await discoverTeamsVersion({
    fetchImplementation,
    knownHashes: [
      ...(published ? [published.teamsHash] : []),
      ...KNOWN_TEAMS_HASHES,
    ],
  })
  for (const warning of discovery.warnings) console.warn(`warning: ${warning}`)
  const mitSha = await fetchMitCommitSha(
    fetchImplementation,
    buildGithubHeaders(),
  )
  const changed = needsRebuild(
    published,
    { teamsHash: discovery.version.hash, mitSha },
    force,
  )
  console.log(
    JSON.stringify(
      { published, latest: discovery.version, mitSha, changed },
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
  })
  console.log(
    JSON.stringify(
      {
        version: result.version,
        sprites: result.spriteCount,
        downloaded: result.downloaded,
        reused: result.reused,
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
): Promise<void> {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8')) as Manifest
  await mkdir(docsDirectory, { recursive: true })
  for (const [fileName, source] of renderEmojiLists(manifest)) {
    const filePath = path.join(docsDirectory, fileName)
    await writeFile(filePath, await formatMarkdown(source, filePath))
  }
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
      force: { type: 'boolean', default: false },
    },
  })
  const [command] = positionals
  switch (command) {
    case 'detect': {
      await runDetect(values['published-url'], values.force)
      break
    }
    case 'build': {
      await runBuild({
        teamsHash: values['teams-hash'],
        publishedUrl: values['published-url'],
        outputDirectory: values.out,
        cacheDirectory: values.cache,
        limit: values.limit === undefined ? undefined : Number(values.limit),
      })
      break
    }
    case 'lists': {
      await runLists(values.manifest, values.docs)
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
