import { describe, expect, test } from 'vitest'

import {
  buildLycheeCacheRelativePath,
  buildLycheeDownloadUrl,
  EXPECTED_LYCHEE_ACTION_VERSION,
  LYCHEE_ARGS,
  LYCHEE_VERSION,
  resolveLycheeArch,
} from './lint-docs'
import { readWorkflow, readWorkflowText } from './workflow-files'

const WORKFLOW_FILE = 'lint-docs.yml'
const LYCHEE_ACTION_PREFIX = 'lycheeverse/lychee-action@'

function findLycheeArguments(): string {
  const jobs = Object.values(readWorkflow(WORKFLOW_FILE).jobs ?? {})
  const steps = jobs.flatMap((job) => job.steps ?? [])
  const lycheeStep = steps.find((step) =>
    step.uses?.startsWith(LYCHEE_ACTION_PREFIX),
  )
  const lycheeArguments = lycheeStep?.with?.args
  if (typeof lycheeArguments !== 'string') {
    throw new TypeError(
      `No lychee-action step with string args in ${WORKFLOW_FILE}.`,
    )
  }
  return lycheeArguments
}

function tokenizeShellLikeArguments(input: string): string[] {
  return Array.from(
    input.matchAll(/'([^']*)'|(\S+)/g),
    (match) => match[1] ?? match[2] ?? '',
  )
}

describe('LYCHEE_ARGS parity with the lint-docs workflow', () => {
  test('the script args match the lychee-action args', () => {
    expect(tokenizeShellLikeArguments(findLycheeArguments())).toEqual([
      ...LYCHEE_ARGS,
    ])
  })

  test('the workflow still pins the action version LYCHEE_VERSION assumes', () => {
    const match = new RegExp(
      String.raw`uses:\s*${LYCHEE_ACTION_PREFIX}\S+\s*#\s*(v[\d.]+)`,
    ).exec(readWorkflowText(WORKFLOW_FILE))
    expect(match?.[1]).toBe(EXPECTED_LYCHEE_ACTION_VERSION)
  })
})

describe('resolveLycheeArch', () => {
  test('maps arm64 and x64 on linux', () => {
    expect(resolveLycheeArch('arm64', 'linux')).toBe('aarch64')
    expect(resolveLycheeArch('x64', 'linux')).toBe('x86_64')
  })

  test('throws for an unsupported architecture', () => {
    expect(() => resolveLycheeArch('ia32', 'linux')).toThrow(
      /unsupported architecture/,
    )
  })

  test('throws for a non-linux platform', () => {
    expect(() => resolveLycheeArch('x64', 'darwin')).toThrow(
      /unsupported platform/,
    )
  })
})

describe('lychee paths', () => {
  test('builds the release asset URL', () => {
    expect(buildLycheeDownloadUrl(LYCHEE_VERSION, 'x86_64')).toBe(
      `https://github.com/lycheeverse/lychee/releases/download/lychee-${LYCHEE_VERSION}/lychee-x86_64-unknown-linux-gnu.tar.gz`,
    )
  })

  test('nests the cached binary under lychee/<version>/lychee', () => {
    expect(buildLycheeCacheRelativePath('v0.24.2')).toBe(
      'lychee/v0.24.2/lychee',
    )
  })
})
