import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'

import { readWorkflow } from './workflow-files'

const DEPLOY_SCRIPT = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../.github/scripts/deploy-coolify.sh',
)

function runDeployScript(environment: Record<string, string>) {
  return spawnSync('bash', [DEPLOY_SCRIPT], {
    encoding: 'utf8',
    env: { PATH: process.env.PATH ?? '', ...environment },
  })
}

describe('deploy-coolify.sh', () => {
  test('fails fast naming both inputs when none is set', () => {
    const result = runDeployScript({})
    expect(result.status).toBe(1)
    expect(result.stdout).toContain('COOLIFY_API_TOKEN')
    expect(result.stdout).toContain('SITE_COOLIFY_APP_UUID')
  })

  test('names only the missing secret', () => {
    const result = runDeployScript({ SITE_COOLIFY_APP_UUID: 'uuid' })
    expect(result.status).toBe(1)
    expect(result.stdout).toContain('COOLIFY_API_TOKEN')
    expect(result.stdout).not.toContain('SITE_COOLIFY_APP_UUID')
  })

  test('names only the missing variable', () => {
    const result = runDeployScript({ COOLIFY_API_TOKEN: 'token' })
    expect(result.status).toBe(1)
    expect(result.stdout).toContain('SITE_COOLIFY_APP_UUID')
    expect(result.stdout).not.toContain('COOLIFY_API_TOKEN')
  })
})

describe('deploy-site.yml', () => {
  const workflow = readWorkflow('deploy-site.yml')
  const job = workflow.jobs?.deploy
  const steps = job?.steps ?? []

  test('runs on pushes to main that touch the site, docs or library', () => {
    const raw = JSON.stringify(workflow.on)
    expect(raw).toContain('"branches":["main"]')
    for (const path of [
      'apps/site/**',
      'docs/**',
      'packages/animated-fluent-emojis/**',
    ])
      expect(raw).toContain(`"${path}"`)
  })

  test('is serialized and never cancels a running deploy', () => {
    expect(JSON.stringify(workflow)).toContain('"cancel-in-progress":false')
  })

  test('builds the image before triggering the deploy', () => {
    const names = steps.map((step) => step.name)
    const build = names.indexOf('Build container')
    const deploy = names.indexOf(
      'Trigger Coolify deploy and wait for the result',
    )
    expect(build).toBeGreaterThan(-1)
    expect(deploy).toBeGreaterThan(build)
  })

  test('passes the token and uuid through env, not the script', () => {
    const deploy = steps.at(-1)
    expect(deploy?.env?.COOLIFY_API_TOKEN).toBe(
      '${{ secrets.COOLIFY_API_TOKEN }}',
    )
    expect(deploy?.env?.SITE_COOLIFY_APP_UUID).toBe(
      '${{ vars.SITE_COOLIFY_APP_UUID }}',
    )
    expect(deploy?.run).not.toContain('${{')
  })
})

describe('sync-assets.yml website redeploy', () => {
  const steps = readWorkflow('sync-assets.yml').jobs?.sync?.steps ?? []
  const names = steps.map((step) => step.name)
  const redeploy = steps.find((step) => step.name === 'Redeploy the website')

  test('runs after the files site smoke test, only when assets changed, and never fails the sync', () => {
    expect(names.indexOf('Redeploy the website')).toBeGreaterThan(
      names.indexOf('Smoke test the files site'),
    )
    expect(redeploy?.if).toBe(
      "steps.detect.outputs.changed == 'true' && success()",
    )
    expect(redeploy?.['continue-on-error']).toBe(true)
  })

  test('uses the shared deploy script with the same secret and variable', () => {
    expect(redeploy?.run).toContain('.github/scripts/deploy-coolify.sh')
    expect(redeploy?.env?.COOLIFY_API_TOKEN).toBe(
      '${{ secrets.COOLIFY_API_TOKEN }}',
    )
    expect(redeploy?.env?.SITE_COOLIFY_APP_UUID).toBe(
      '${{ vars.SITE_COOLIFY_APP_UUID }}',
    )
  })
})
