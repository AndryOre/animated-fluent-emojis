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

describe('sync-assets.yml build step', () => {
  const steps = collectSteps(readWorkflow('sync-assets.yml'))
  const script =
    steps.find((step) => step.run?.includes('assets:build'))?.run ?? ''

  test('forwards bypass_guards to the build and never rebuild', () => {
    expect(script).toContain('--bypass-guards')
    expect(script).toContain('BYPASS_GUARDS')
    expect(script).not.toContain('--force')
  })

  test('does not interpolate expressions into the script', () => {
    expect(script).not.toContain('${{')
  })
})

describe('sync-assets.yml dispatch inputs', () => {
  const workflow = readWorkflow('sync-assets.yml')
  const raw = JSON.stringify(workflow)

  test('splits force into rebuild and bypass_guards and drops smoke_v1', () => {
    expect(raw).toContain('"rebuild"')
    expect(raw).toContain('"bypass_guards"')
    expect(raw).not.toContain('"force"')
    expect(raw).not.toContain('smoke_v1')
  })
})

describe('sync-assets.yml failure report job', () => {
  const workflow = readWorkflow('sync-assets.yml')
  const job = workflow.jobs?.['report-failure']

  test('runs only on failure and depends on every other job', () => {
    expect(job?.if).toBe('failure()')
    expect(job?.needs).toEqual(['sync', 'emoji-lists'])
  })

  test('has only issues: write permission', () => {
    expect(job?.permissions).toEqual({ issues: 'write' })
  })

  test('is, with resolve-failure, the only job granted issues: write', () => {
    const writers = Object.entries(workflow.jobs ?? {})
      .filter(([, other]) =>
        JSON.stringify(other.permissions ?? {}).includes('issues'),
      )
      .map(([name]) => name)
    expect(writers).toEqual(['report-failure', 'resolve-failure'])
  })

  test('does not interpolate expressions into the script', () => {
    const script = job?.steps?.map((step) => step.run ?? '').join('\n') ?? ''
    expect(script).toContain('gh issue')
    expect(script).not.toContain('${{')
  })
})

describe('sync-assets.yml smoke steps', () => {
  const steps = collectSteps(readWorkflow('sync-assets.yml'))
  const legacy = steps.find(
    (step) => step.name === 'Smoke test the legacy layout',
  )
  const v1 = steps.find((step) => step.name === 'Smoke test the v1 layout')

  test('checks the legacy manifest and a legacy sprite', () => {
    expect(legacy?.run).toContain('/manifest.slim.json')
    expect(legacy?.run).toContain('/sprites/')
  })

  test('always runs the v1 checks, including builtAt and an @2x sprite', () => {
    expect(v1?.if).not.toContain('smoke_v1')
    expect(v1?.run).toContain('/v1/version.json')
    expect(v1?.run).toContain('builtAt')
    expect(v1?.run).toContain('/v1/manifest.slim.json')
    expect(v1?.run).toContain('/v1/sprites/')
    expect(v1?.run).toContain('@2x.png')
  })

  test('retries every v1 request', () => {
    const requests = (v1?.run ?? '')
      .split('\n')
      .filter((line) => line.includes('curl '))
    expect(requests.length).toBeGreaterThanOrEqual(4)
    for (const line of requests) expect(line).toContain('--retry 5')
  })

  test('does not interpolate expressions into the scripts', () => {
    expect(legacy?.run).not.toContain('${{')
    expect(v1?.run).not.toContain('${{')
  })
})

describe('sync-assets.yml emoji-lists job', () => {
  const job = readWorkflow('sync-assets.yml').jobs?.['emoji-lists']
  const runs = job?.steps?.map((step) => step.run ?? '').join('\n') ?? ''

  test('installs without running lifecycle scripts', () => {
    expect(runs).toContain('bun install --frozen-lockfile --ignore-scripts')
  })

  test('retries the manifest fetch', () => {
    const fetchLine =
      runs.split('\n').find((line) => line.includes('curl ')) ?? ''
    expect(fetchLine).toContain('--retry 5')
  })

  test('appends a changelog entry under Unreleased when EmojiId changes', () => {
    expect(runs).toContain('src/utils/emoji-id.generated.ts')
    expect(runs).toContain(String.raw`## \[Unreleased\]`)
    expect(runs).toContain('git add CHANGELOG.md')
  })
})

describe('sync-assets.yml failure resolution job', () => {
  const job = readWorkflow('sync-assets.yml').jobs?.['resolve-failure']

  test('runs after a sync that did not fail, with only issues: write', () => {
    expect(job?.if).toBe('${{ !failure() && !cancelled() }}')
    expect(job?.needs).toEqual(['sync', 'emoji-lists'])
    expect(job?.permissions).toEqual({ issues: 'write' })
  })

  test('closes the open failure issue without interpolating expressions', () => {
    const script = job?.steps?.map((step) => step.run ?? '').join('\n') ?? ''
    expect(script).toContain('gh issue close')
    expect(script).toContain('sync-assets failing')
    expect(script).not.toContain('${{')
  })
})

describe('release.yml job split', () => {
  const workflow = readWorkflow('release.yml')
  const verify = workflow.jobs?.verify
  const publish = workflow.jobs?.publish
  const publishScript =
    publish?.steps?.map((step) => step.run ?? '').join('\n') ?? ''
  const verifyScript =
    verify?.steps?.map((step) => step.run ?? '').join('\n') ?? ''

  test('id-token: write appears only in the publish job', () => {
    const writers = Object.entries(workflow.jobs ?? {})
      .filter(([, job]) =>
        JSON.stringify(job.permissions ?? {}).includes('id-token'),
      )
      .map(([name]) => name)
    expect(writers).toEqual(['publish'])
    expect(publish?.permissions).toEqual({
      contents: 'write',
      'id-token': 'write',
    })
  })

  test('verify is read-only and runs the full quality gate', () => {
    expect(verify?.permissions).toEqual({ contents: 'read' })
    for (const command of [
      'bun ci',
      'bun run check',
      'bun run test',
      'bun run build',
    ]) {
      expect(verifyScript).toContain(command)
    }
  })

  test('publish needs verify and runs no dependency install', () => {
    expect(publish?.needs).toBe('verify')
    const withoutPinnedNpm = publishScript.replaceAll(
      /npm install -g npm@\d+\.\d+\.\d+/g,
      '',
    )
    expect(withoutPinnedNpm).not.toMatch(
      /\b(bun (ci|install|add|x)|bunx|npm (ci|install|i)|npx|pnpm|yarn)\b/,
    )
    const usesSetupBun = publish?.steps?.some((step) =>
      step.uses?.includes('setup-bun'),
    )
    expect(usesSetupBun).toBe(false)
  })

  test('publish passes the tarball to npm as an explicit relative path', () => {
    expect(publishScript).toMatch(
      /tarball=\$\(ls \.\/release-artifact\/\*\.tgz\)/,
    )
  })

  test('publish pins npm to 11.5.1 or newer and never uses latest', () => {
    const match = /npm install -g npm@(\d+)\.(\d+)\.(\d+)/.exec(publishScript)
    expect(match).not.toBeNull()
    const [major = 0, minor = 0, patch = 0] = (match ?? []).slice(1).map(Number)
    const atLeast =
      major > 11 || (major === 11 && (minor > 5 || (minor === 5 && patch >= 1)))
    expect(atLeast).toBe(true)
    expect(JSON.stringify(workflow)).not.toContain('npm@latest')
  })

  test('verify gates on the v1 layout returning 200', () => {
    expect(verifyScript).toContain(
      'https://animated-fluent-emojis.pages.dev/v1/version.json',
    )
    expect(verifyScript).toContain('%{http_code}')
    expect(verifyScript).toContain('"200"')
  })

  test('verify checks the tag, main ancestry and non-empty notes', () => {
    expect(verifyScript).toContain('package.json')
    expect(verifyScript).toContain('merge-base --is-ancestor')
    expect(verifyScript).toContain('release-notes.md')
  })

  test('publish is idempotent for npm and the GitHub Release', () => {
    expect(publishScript).toMatch(/npm view [^\n]*version/)
    expect(publishScript).toContain('npm publish')
    expect(publishScript).toContain('gh release view')
    expect(publishScript).toContain('gh release create')
  })

  test('does not interpolate expressions into the scripts', () => {
    expect(verifyScript).not.toContain('${{')
    expect(publishScript).not.toContain('${{')
  })
})
