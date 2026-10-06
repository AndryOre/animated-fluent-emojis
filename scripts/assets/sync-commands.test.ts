import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, expect, test, vi } from 'vitest'

import type { BuildResult } from './build.js'
import { PIPELINE_VERSION } from './catalog.js'
import { KNOWN_TEAMS_HASHES } from './known-teams-versions.js'
import type { PublishedVersion } from './site-writer.js'
import {
  runBuild,
  runCommand,
  runDetect,
  runLists,
  type SyncDependencies,
} from './sync.js'
import { buildManifestUrl } from './teams.js'
import { createFakeFetch, createTeamsManifest } from './test-support.js'

const SITE = 'https://site.test'
const HASH = 'c'.repeat(32)
const SHA = 'f'.repeat(40)
const BUNDLE_URL =
  'https://teams.public.onecdn.static.microsoft/teams-modular-packages/hashed-assets/config-prod-abc123.js'
const MIT_COMMIT =
  'GET https://api.github.com/repos/microsoft/fluentui-emoji-animated/commits/main'

const published: PublishedVersion = {
  teamsHash: HASH,
  teamsLastModified: '2025-10-16T22:08:15.000Z',
  mitSha: SHA,
  builtAt: '2026-10-05T00:00:00.000Z',
  pipelineVersion: PIPELINE_VERSION,
  layouts: ['v1'],
}

const discoveryRoutes = () => ({
  [`HEAD ${buildManifestUrl(HASH)}`]: {
    headers: { 'last-modified': 'Thu, 16 Oct 2025 22:08:15 GMT' },
  },
  'GET https://teams.microsoft.com/v2/': {
    body: `<script src="${BUNDLE_URL}"></script>`,
  },
  [`GET ${BUNDLE_URL}`]: {
    body: `emoticonAssetVersion:[{value:"${HASH}"}]`,
  },
  [MIT_COMMIT]: { body: { sha: SHA } },
})

const cleanups: string[] = []

async function createScratch(): Promise<string> {
  const directory = await mkdtemp(path.join(tmpdir(), 'sync-test-'))
  cleanups.push(directory)
  return directory
}

afterEach(async () => {
  vi.restoreAllMocks()
  await Promise.all(
    cleanups
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  )
})

const silence = () => {
  vi.spyOn(console, 'log').mockReturnValue()
  vi.spyOn(console, 'warn').mockReturnValue()
}

const detectOptions = {
  publishedUrl: SITE,
  rebuild: false,
  bypassGuards: false,
}

const createDependencies = (
  routes: Parameters<typeof createFakeFetch>[0],
  environment: SyncDependencies['environment'] = {},
  buildAssetsStub: SyncDependencies['buildAssets'] = vi.fn(),
): SyncDependencies => ({
  fetch: createFakeFetch(routes).fetch,
  environment,
  buildAssets: buildAssetsStub,
})

test('runDetect writes the changed, teams_hash and mit_sha outputs', async () => {
  silence()
  const scratch = await createScratch()
  const outputFile = path.join(scratch, 'output')
  const summaryFile = path.join(scratch, 'summary')
  const { fetch, requests } = createFakeFetch(discoveryRoutes())

  await runDetect(detectOptions, {
    fetch,
    environment: {
      GITHUB_OUTPUT: outputFile,
      GITHUB_STEP_SUMMARY: summaryFile,
      GITHUB_TOKEN: 'secret',
    },
    buildAssets: vi.fn(),
  })

  expect(await readFile(outputFile, 'utf8')).toBe(
    `changed=true\nteams_hash=${HASH}\nmit_sha=${SHA}\n`,
  )
  expect(await readFile(summaryFile, 'utf8')).toContain(
    '### Teams discovery warnings',
  )
  expect(requests).toContain(`GET ${SITE}/version.json`)
})

test('runDetect reports no change when the published catalog is current', async () => {
  silence()
  const scratch = await createScratch()
  const outputFile = path.join(scratch, 'output')

  await runDetect(
    detectOptions,
    createDependencies(
      {
        ...discoveryRoutes(),
        [`GET ${SITE}/version.json`]: { body: published },
        [`GET ${SITE}/v1/version.json`]: { body: published },
      },
      { GITHUB_OUTPUT: outputFile },
    ),
  )

  expect(await readFile(outputFile, 'utf8')).toContain('changed=false\n')
})

test('runDetect runs without output or token configured', async () => {
  silence()

  const dependencies = createDependencies(discoveryRoutes())

  await expect(runDetect(detectOptions, dependencies)).resolves.toBeUndefined()
})

test('runDetect fails when discovery is unhealthy unless guards are bypassed', async () => {
  silence()
  const routes = {
    [`HEAD ${buildManifestUrl(KNOWN_TEAMS_HASHES[0] ?? HASH)}`]: {
      headers: { 'last-modified': 'Thu, 16 Oct 2025 22:08:15 GMT' },
    },
    [MIT_COMMIT]: { body: { sha: SHA } },
  }

  await expect(
    runDetect(detectOptions, createDependencies(routes)),
  ).rejects.toThrow('Teams discovery failed')
  await expect(
    runDetect(
      { ...detectOptions, bypassGuards: true },
      createDependencies(routes),
    ),
  ).resolves.toBeUndefined()
})

const createBuildOptions = async () => {
  const scratch = await createScratch()
  const outputDirectory = path.join(scratch, 'out')
  await mkdir(outputDirectory, { recursive: true })
  return {
    scratch,
    teamsHash: undefined,
    publishedUrl: SITE,
    outputDirectory,
    cacheDirectory: path.join(scratch, 'cache'),
    limit: undefined,
    bypassGuards: false,
  }
}

const buildResult = (diff: BuildResult['diff']): BuildResult => ({
  manifest: createTeamsManifest(),
  version: published,
  spriteCount: 8,
  downloaded: 3,
  reused: 4,
  skipped: [],
  hdSkipped: [],
  hdCount: 0,
  seeded: 1,
  retained: 2,
  diff,
})

type BuildCall = [
  {
    githubHeaders: Record<string, string>
    limit: number | undefined
    onPlanned: unknown
    teamsVersion: { hash: string }
  },
]

test('runBuild fails loudly when the pinned teams hash is unavailable', async () => {
  const options = await createBuildOptions()
  const buildAssetsStub = vi.fn()

  await expect(
    runBuild(
      { ...options, teamsHash: HASH },
      createDependencies({}, {}, buildAssetsStub),
    ),
  ).rejects.toThrow(`Teams manifest ${HASH} is not available`)
  expect(buildAssetsStub).not.toHaveBeenCalled()
})

test('runBuild builds with the pinned hash and writes step summaries', async () => {
  silence()
  const { scratch, ...options } = await createBuildOptions()
  const summaryFile = path.join(scratch, 'summary')
  const diff = { added: ['a'], removed: [], changed: ['b', 'c'] }
  const buildAssetsStub = vi.fn(() =>
    Promise.resolve(buildResult(diff as unknown as BuildResult['diff'])),
  )

  await runBuild(
    { ...options, teamsHash: HASH, limit: 5 },
    createDependencies(
      {
        ...discoveryRoutes(),
        [`GET ${SITE}/manifest.json`]: { body: createTeamsManifest() },
      },
      { GITHUB_STEP_SUMMARY: summaryFile, GITHUB_TOKEN: 'secret' },
      buildAssetsStub,
    ),
  )

  const summary = await readFile(summaryFile, 'utf8')
  expect(summary).toContain('### Catalog diff')
  expect(summary).toContain('Added: 1')
  expect(summary).toContain('Changed: 2')
  expect(summary).toContain('### Sprite sources')
  expect(summary).toContain('Built from source: 3 sprite(s)')
  const [call] = buildAssetsStub.mock.calls as unknown as BuildCall[]
  expect(call?.[0].githubHeaders).toEqual({ authorization: 'Bearer secret' })
  expect(call?.[0].limit).toBe(5)
  expect(call?.[0].onPlanned).toBeUndefined()
})

test('runBuild discovers the newest hash and guards removals on a full build', async () => {
  silence()
  const options = await createBuildOptions()
  const buildAssetsStub = vi.fn(() => Promise.resolve(buildResult(undefined)))

  await runBuild(
    options,
    createDependencies(
      {
        ...discoveryRoutes(),
        [`GET ${SITE}/manifest.json`]: { body: createTeamsManifest() },
      },
      {},
      buildAssetsStub,
    ),
  )

  const [call] = buildAssetsStub.mock.calls as unknown as BuildCall[]
  expect(call?.[0].teamsVersion.hash).toBe(HASH)
  expect(call?.[0].onPlanned).toBeTypeOf('function')
})

test('runLists writes the emoji lists and the emoji-id module', async () => {
  const scratch = await createScratch()
  const manifestPath = path.join(scratch, 'manifest.json')
  await writeFile(manifestPath, JSON.stringify(createTeamsManifest()))
  const docsDirectory = path.join(scratch, 'docs')
  const emojiIdPath = path.join(scratch, 'nested', 'emoji-id.generated.ts')

  await runLists(manifestPath, docsDirectory, emojiIdPath)

  expect(
    await readFile(path.join(docsDirectory, 'EMOJI_LIST_Smilies.md'), 'utf8'),
  ).toContain('1f603_grinningfacewithbigeyes')
  expect(await readFile(emojiIdPath, 'utf8')).toContain('1f44b_wavinghand')
})

test('runCommand dispatches lists with the given paths', async () => {
  const scratch = await createScratch()
  const manifestPath = path.join(scratch, 'manifest.json')
  await writeFile(manifestPath, JSON.stringify(createTeamsManifest()))
  const emojiIdPath = path.join(scratch, 'emoji-id.generated.ts')

  await runCommand(
    [
      'lists',
      '--manifest',
      manifestPath,
      '--docs',
      path.join(scratch, 'docs'),
      '--emoji-id',
      emojiIdPath,
    ],
    createDependencies({}),
  )

  expect(await readFile(emojiIdPath, 'utf8')).toContain('EmojiId')
})

test('runCommand dispatches detect, build and verify-live', async () => {
  silence()
  const options = await createBuildOptions()
  const buildAssetsStub = vi.fn(() => Promise.resolve(buildResult(undefined)))
  const { fetch, requests } = createFakeFetch({
    ...discoveryRoutes(),
    [`GET ${SITE}/v1/version.json`]: { body: published },
  })
  const dependencies: SyncDependencies = {
    fetch,
    environment: {},
    buildAssets: buildAssetsStub,
  }

  await runCommand(
    ['detect', '--published-url', SITE, '--rebuild'],
    dependencies,
  )
  await runCommand(
    [
      'build',
      '--published-url',
      SITE,
      '--out',
      options.outputDirectory,
      '--cache',
      options.cacheDirectory,
      '--limit',
      '2',
      '--bypass-guards',
    ],
    dependencies,
  )
  await runCommand(['verify-live', '--published-url', SITE], dependencies)

  expect(buildAssetsStub).toHaveBeenCalledOnce()
  expect(
    requests.filter((request) => request === `GET ${SITE}/v1/version.json`),
  ).toHaveLength(2)
})

test('runCommand rejects an unknown command with the usage message', async () => {
  const dependencies = createDependencies({})

  await expect(runCommand(['nope'], dependencies)).rejects.toThrow(
    'Usage: sync.ts <detect|build|verify-live|lists> [options]',
  )
  await expect(runCommand([], dependencies)).rejects.toThrow('Usage:')
})
