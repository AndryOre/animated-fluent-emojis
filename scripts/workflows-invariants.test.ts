import { describe, expect, test } from 'vitest'

import {
  listWorkflowFiles,
  readWorkflow,
  type Workflow,
  type WorkflowStep,
} from './workflow-files'

const FULL_SHA_PATTERN = /^[\da-f]{40}$/

function collectSteps(workflow: Workflow): WorkflowStep[] {
  return Object.values(workflow.jobs ?? {}).flatMap((job) => job.steps ?? [])
}

function collectUses(workflow: Workflow): string[] {
  const jobUses = Object.values(workflow.jobs ?? {}).flatMap((job) =>
    job.uses === undefined ? [] : [job.uses],
  )
  const stepUses = collectSteps(workflow).flatMap((step) =>
    step.uses === undefined ? [] : [step.uses],
  )
  return [...jobUses, ...stepUses]
}

function triggerNames(workflow: Workflow): string[] {
  const trigger = workflow.on
  if (typeof trigger === 'string') return [trigger]
  if (Array.isArray(trigger)) return trigger.map(String)
  return trigger !== null && typeof trigger === 'object'
    ? Object.keys(trigger)
    : []
}

test('there is at least one workflow to check', () => {
  expect(listWorkflowFiles().length).toBeGreaterThan(0)
})

describe.each(listWorkflowFiles())('%s', (fileName) => {
  const workflow = readWorkflow(fileName)

  test('does not use the pull_request_target trigger', () => {
    expect(triggerNames(workflow)).not.toContain('pull_request_target')
  })

  test('every job sets timeout-minutes', () => {
    const jobs = Object.entries(workflow.jobs ?? {})
    for (const [jobName, job] of jobs) {
      expect(job['timeout-minutes'], `job "${jobName}"`).toBeTypeOf('number')
    }
  })

  test('top-level permissions are contents: read or empty', () => {
    expect([{ contents: 'read' }, {}]).toContainEqual(workflow.permissions)
  })

  test('every actions/checkout sets persist-credentials: false', () => {
    const checkoutSteps = collectSteps(workflow).filter((step) =>
      step.uses?.startsWith('actions/checkout@'),
    )
    for (const step of checkoutSteps) {
      expect(step.with?.['persist-credentials']).toBe(false)
    }
  })

  test('every external action is pinned to a 40-hex SHA', () => {
    const externalUses = collectUses(workflow).filter(
      (uses) => !uses.startsWith('./'),
    )
    for (const uses of externalUses) {
      const reference = uses.split('@', 2)[1] ?? ''
      expect(reference, uses).toMatch(FULL_SHA_PATTERN)
    }
  })
})

describe('sync-assets.yml docs pull request step', () => {
  const steps = collectSteps(readWorkflow('sync-assets.yml'))
  const script =
    steps.find((step) => step.run?.includes('gh pr create'))?.run ?? ''

  test('reuses only an open pull request', () => {
    expect(script).toMatch(/gh pr list[^\n]*--state open/)
    expect(script).not.toContain('gh pr view')
  })

  test('counts untracked docs files as changes', () => {
    expect(script).toContain('git status --porcelain -- docs')
    expect(script).not.toContain('git diff --quiet')
  })

  test('does not interpolate expressions into the script', () => {
    expect(script).not.toContain('${{')
  })
})
