import { spawn, spawnSync } from 'node:child_process'
import {
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Pinned lychee release. It is the default `lycheeVersion` of the
 * `lycheeverse/lychee-action` version in {@link EXPECTED_LYCHEE_ACTION_VERSION}.
 */
export const LYCHEE_VERSION = 'v0.24.2'

/**
 * The `lycheeverse/lychee-action` version pinned in
 * `.github/workflows/lint-docs.yml`. `scripts/lint-docs.test.ts` asserts the
 * workflow still pins it, so bumping the action fails the test until
 * {@link LYCHEE_VERSION} is re-checked against the new action default.
 */
export const EXPECTED_LYCHEE_ACTION_VERSION = 'v2.9.0'

/**
 * Arguments passed to lychee, identical to the `args:` of the workflow.
 * Globs are passed unexpanded, as the workflow's quoting does.
 */
export const LYCHEE_ARGS = [
  '--offline',
  '--include-fragments=anchor-only',
  '--no-progress',
  '*.md',
  'docs/**/*.md',
  '.github/**/*.md',
] as const

/**
 * Maps Node platform and architecture to the lychee Linux release arch.
 * @param arch The Node.js architecture.
 * @param platform The Node.js platform.
 * @returns The lychee release architecture string.
 */
export function resolveLycheeArch(
  arch: NodeJS.Architecture = process.arch,
  platform: NodeJS.Platform = process.platform,
): 'aarch64' | 'x86_64' {
  if (platform !== 'linux') {
    throw new Error(
      `lint-docs: unsupported platform "${platform}", lychee prebuilt binaries are Linux-only. Install lychee manually.`,
    )
  }
  if (arch === 'arm64') return 'aarch64'
  if (arch === 'x64') return 'x86_64'
  throw new Error(
    `lint-docs: unsupported architecture "${arch}", lychee only publishes x86_64 and aarch64 Linux binaries.`,
  )
}

/**
 * Builds the release asset URL for a lychee version and architecture.
 * @param version The release tag, such as `v0.24.2`.
 * @param arch The CPU part of the asset name, such as `x86_64`.
 * @returns An https GitHub release asset link.
 */
export function buildLycheeDownloadUrl(version: string, arch: string): string {
  return `https://github.com/lycheeverse/lychee/releases/download/lychee-${version}/lychee-${arch}-unknown-linux-gnu.tar.gz`
}

/**
 * Builds the cache path, relative to the git common dir, of a lychee binary.
 * @param version The release tag the binary belongs to.
 * @returns A path like `lychee/v0.24.2/lychee`.
 */
export function buildLycheeCacheRelativePath(version: string): string {
  return path.join('lychee', version, 'lychee')
}

function resolveGitCommonDirectory(): string {
  const result = spawnSync('git', ['rev-parse', '--git-common-dir'], {
    encoding: 'utf8',
  })
  if (result.status !== 0) {
    throw new Error(
      `lint-docs: "git rev-parse --git-common-dir" failed: ${result.stderr}`,
    )
  }
  return path.resolve(result.stdout.trim())
}

function findBinaryRecursively(
  rootDirectory: string,
  maxDepth: number,
): string | undefined {
  const entries = readdirSync(rootDirectory, { withFileTypes: true })
  for (const entry of entries) {
    const entryPath = path.join(rootDirectory, entry.name)
    if (entry.isFile() && entry.name === 'lychee') return entryPath
    if (!entry.isDirectory() || maxDepth <= 0) continue
    const found = findBinaryRecursively(entryPath, maxDepth - 1)
    if (found) return found
  }
  return undefined
}

async function downloadLycheeBinary(
  version: string,
  destinationPath: string,
): Promise<void> {
  const url = buildLycheeDownloadUrl(version, resolveLycheeArch())
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(
      `lint-docs: failed to download lychee from ${url} (HTTP ${String(response.status)}).`,
    )
  }

  const workingDirectory = mkdtempSync(path.join(tmpdir(), 'lint-docs-lychee-'))
  try {
    const archivePath = path.join(workingDirectory, 'lychee.tar.gz')
    writeFileSync(archivePath, Buffer.from(await response.arrayBuffer()))
    const extractedDirectory = path.join(workingDirectory, 'extracted')
    mkdirSync(extractedDirectory)
    const tar = spawnSync('tar', [
      '-xzf',
      archivePath,
      '-C',
      extractedDirectory,
    ])
    if (tar.status !== 0) {
      throw new Error(
        `lint-docs: failed to extract the archive from ${url}: ${tar.stderr.toString()}`,
      )
    }
    const extractedBinaryPath = findBinaryRecursively(extractedDirectory, 2)
    if (!extractedBinaryPath) {
      throw new Error(`lint-docs: no "lychee" binary found in ${url}.`)
    }
    mkdirSync(path.dirname(destinationPath), { recursive: true })
    const temporaryPath = `${destinationPath}.tmp-${String(process.pid)}-${String(Date.now())}`
    copyFileSync(extractedBinaryPath, temporaryPath)
    chmodSync(temporaryPath, 0o755)
    renameSync(temporaryPath, destinationPath)
  } finally {
    rmSync(workingDirectory, { recursive: true, force: true })
  }
}

/**
 * Returns a cached lychee binary, downloading it on first use.
 * @param version The lychee release version to ensure is cached.
 * @returns The absolute path of the cached binary.
 */
export async function ensureLycheeBinary(version: string): Promise<string> {
  const binaryPath = path.join(
    resolveGitCommonDirectory(),
    buildLycheeCacheRelativePath(version),
  )
  if (existsSync(binaryPath)) return binaryPath
  console.log(`lint-docs: lychee ${version} not cached, downloading...`)
  await downloadLycheeBinary(version, binaryPath)
  console.log(`lint-docs: cached lychee ${version} at ${binaryPath}.`)
  return binaryPath
}

async function main(): Promise<void> {
  const binaryPath = await ensureLycheeBinary(LYCHEE_VERSION)
  const child = spawn(binaryPath, [...LYCHEE_ARGS, ...process.argv.slice(2)], {
    stdio: 'inherit',
  })
  process.exitCode = await new Promise<number>((resolve, reject) => {
    child.on('error', reject)
    child.on('close', (code) => {
      resolve(code ?? 1)
    })
  })
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    await main()
  } catch (error: unknown) {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  }
}
