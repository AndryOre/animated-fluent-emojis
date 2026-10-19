import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { runInNewContext } from 'node:vm'
import { describe, expect, test } from 'vitest'

interface CustomManager {
  readonly depNameTemplate?: string
  readonly managerFilePatterns: readonly string[]
  readonly matchStrings: readonly string[]
}

interface RenovateConfig {
  readonly extends: readonly string[]
  readonly rebaseWhen?: string
  readonly lockFileMaintenance?: { automerge?: boolean }
  readonly customManagers: readonly CustomManager[]
}

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

function readRepositoryFile(relativePath: string): string {
  return readFileSync(path.join(ROOT, relativePath), 'utf8')
}

const config = runInNewContext(
  `(${readRepositoryFile('renovate.json5')})`,
) as RenovateConfig

function findManager(dependencyName: string): CustomManager {
  const manager = config.customManagers.find(
    (candidate) => candidate.depNameTemplate === dependencyName,
  )
  if (!manager) throw new Error(`no custom manager for ${dependencyName}`)
  return manager
}

function captureCurrentValue(
  manager: CustomManager,
  content: string,
): string | undefined {
  for (const matchString of manager.matchStrings) {
    const match = new RegExp(matchString).exec(content)
    if (match?.groups?.currentValue) return match.groups.currentValue
  }
  return undefined
}

function filePatternMatches(manager: CustomManager, file: string): boolean {
  return manager.managerFilePatterns.some((pattern) =>
    new RegExp(pattern.slice(1, -1)).test(file),
  )
}

describe('renovate.json5 presets', () => {
  test('extends the shared presets', () => {
    expect(config.extends).toEqual(
      expect.arrayContaining([
        'config:best-practices',
        'helpers:pinGitHubActionDigests',
        'group:monorepos',
      ]),
    )
  })

  test('rebases branches that fall behind the base branch', () => {
    expect(config.rebaseWhen).toBe('behind-base-branch')
  })

  test('automerges lockfile maintenance', () => {
    expect(config.lockFileMaintenance?.automerge).toBe(true)
  })
})

describe('workflow tool version managers', () => {
  const workflowPath = '.github/workflows/lint-workflows.yml'
  const workflow = readRepositoryFile(workflowPath)

  test.each([
    ['rhysd/actionlint', /ACTIONLINT_VERSION: (\d+\.\d+\.\d+)/],
    ['zizmorcore/zizmor', /version: (v\d+\.\d+\.\d+)/],
  ])('%s manager captures the pinned version', (dependencyName, expected) => {
    const manager = findManager(dependencyName)
    expect(filePatternMatches(manager, workflowPath)).toBe(true)
    expect(captureCurrentValue(manager, workflow)).toBe(
      expected.exec(workflow)?.[1],
    )
  })

  test('the zizmor manager ignores a version of another action', () => {
    const fixture = [
      '- uses: other/action@abc # v1',
      '  with:',
      '    version: v9.9.9',
    ].join('\n')
    expect(
      captureCurrentValue(findManager('zizmorcore/zizmor'), fixture),
    ).toBeUndefined()
  })

  test('the actionlint manager reads a fixture line', () => {
    expect(
      captureCurrentValue(
        findManager('rhysd/actionlint'),
        '  ACTIONLINT_VERSION: 2.0.1\n',
      ),
    ).toBe('2.0.1')
  })

  test('the managers do not apply to other workflows', () => {
    expect(
      filePatternMatches(
        findManager('rhysd/actionlint'),
        '.github/workflows/ci.yml',
      ),
    ).toBe(false)
  })
})
