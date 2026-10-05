import { spawn, spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

/**
 * Builds the commitlint invocation, mirroring the `commitlint` job of
 * `.github/workflows/ci.yml`.
 * @param base The commit to lint from.
 * @param head The commit to lint to.
 * @returns The command and its arguments.
 */
export function buildCommitlintCommand(base: string, head: string): string[] {
  return ['bunx', 'commitlint', '--from', base, '--to', head, '--verbose']
}

function runGit(arguments_: string[]): { ok: boolean; output: string } {
  const result = spawnSync('git', arguments_, { encoding: 'utf8' })
  return {
    ok: result.status === 0,
    output: (result.status === 0 ? result.stdout : result.stderr).trim(),
  }
}

/**
 * Resolves the merge-base of `origin/main` (or local `main`) and HEAD.
 * @returns The merge-base commit SHA.
 */
export function resolveCommitlintBase(): string {
  for (const mainRef of ['origin/main', 'main']) {
    const result = runGit(['merge-base', mainRef, 'HEAD'])
    if (result.ok) return result.output
  }
  throw new Error(
    'lint-commits: could not resolve a merge-base against "origin/main" or "main".',
  )
}

function exitCodeOf(code: number | null): number {
  return typeof code === 'number' ? code : 1
}

async function main(): Promise<void> {
  const base = resolveCommitlintBase()
  const head = runGit(['rev-parse', 'HEAD'])
  if (!head.ok) throw new Error('lint-commits: could not resolve HEAD.')
  if (base === head.output) {
    console.log('lint-commits: HEAD is at the merge-base, nothing to lint.')
    return
  }
  const [command, ...commandArguments] = buildCommitlintCommand(base, 'HEAD')
  if (command === undefined) throw new Error('lint-commits: empty command.')
  const child = spawn(command, commandArguments, { stdio: 'inherit' })
  process.exitCode = await new Promise<number>((resolve, reject) => {
    child.on('error', reject)
    child.on('close', (code) => {
      resolve(exitCodeOf(code))
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
