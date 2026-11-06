import { execFileSync } from 'node:child_process'
import {
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

interface DryRunTask {
  taskId: string
  package: string
}

interface DryRun {
  tasks: DryRunTask[]
}

const repositoryRoot = path.resolve(import.meta.dirname, '..')
const turboBinary = path.join(repositoryRoot, 'node_modules', '.bin', 'turbo')

const workspaceDirectories = ['apps', 'packages'].flatMap((group) =>
  readdirSync(path.join(repositoryRoot, group)).map(
    (name) => `${group}/${name}`,
  ),
)

function readWorkspaceName(directory: string): string {
  const manifest = JSON.parse(
    readFileSync(path.join(repositoryRoot, directory, 'package.json'), 'utf8'),
  ) as { name: string }
  return manifest.name
}

function git(cwd: string, ...gitArguments: string[]): void {
  execFileSync('git', gitArguments, { cwd, stdio: 'pipe' })
}

function affectedPackages(sandbox: string): Set<string> {
  const output = execFileSync(
    turboBinary,
    ['run', 'test', '--affected', '--dry=json'],
    {
      cwd: sandbox,
      encoding: 'utf8',
      env: {
        ...process.env,
        TURBO_SCM_BASE: 'HEAD',
        TURBO_TELEMETRY_DISABLED: '1',
      },
      maxBuffer: 64 * 1024 * 1024,
    },
  )
  const dryRun = JSON.parse(output) as DryRun
  return new Set(
    dryRun.tasks
      .filter((task) => task.taskId.endsWith('#test'))
      .map((task) => task.package),
  )
}

describe('turbo --affected selection', () => {
  let sandbox = ''

  beforeAll(() => {
    sandbox = mkdtempSync(path.join(tmpdir(), 'affected-guard-'))
    git(
      repositoryRoot,
      'clone',
      '--quiet',
      '--no-hardlinks',
      '--no-checkout',
      repositoryRoot,
      sandbox,
    )
    git(sandbox, 'checkout', '--quiet', '--detach', 'HEAD')
    git(sandbox, 'config', 'user.name', 'guard')
    git(sandbox, 'config', 'user.email', 'guard@example.com')
  })

  afterAll(() => {
    rmSync(sandbox, { recursive: true, force: true })
  })

  test.each(workspaceDirectories)(
    'a change in %s selects that workspace test task',
    (directory) => {
      const marker = path.join(sandbox, directory, 'affected-guard-marker.txt')
      writeFileSync(marker, 'changed')
      try {
        expect(affectedPackages(sandbox)).toContain(
          readWorkspaceName(directory),
        )
      } finally {
        rmSync(marker, { force: true })
      }
    },
    60_000,
  )
})
