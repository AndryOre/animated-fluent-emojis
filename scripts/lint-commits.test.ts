import { describe, expect, test } from 'vitest'

import { buildCommitlintCommand } from './lint-commits'
import { readWorkflow } from './workflow-files'

function findCommitlintRunCommand(): string {
  const job = readWorkflow('ci.yml').jobs?.commitlint
  const run = job?.steps?.find((step) => step.run?.includes('commitlint'))?.run
  if (run === undefined) {
    throw new Error('ci.yml has no commitlint run step.')
  }
  return run.trim()
}

describe('buildCommitlintCommand', () => {
  test('uses the same invocation and flags as the ci.yml commitlint job', () => {
    const workflowCommand = findCommitlintRunCommand()
      .replace('"$BASE_SHA"', 'BASE')
      .replace('"$HEAD_SHA"', 'HEAD')
    expect(buildCommitlintCommand('BASE', 'HEAD').join(' ')).toBe(
      workflowCommand,
    )
  })
})
