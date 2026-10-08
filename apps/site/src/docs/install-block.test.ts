import { describe, expect, it } from 'vitest'

import { parseInstallCommand, transformInstallBlocks } from './install-block'

describe('parseInstallCommand', () => {
  it.each([
    'npm install animated-fluent-emojis',
    'npm i animated-fluent-emojis',
    'pnpm add animated-fluent-emojis',
    'yarn add animated-fluent-emojis',
    'bun add animated-fluent-emojis',
    'bun install animated-fluent-emojis',
  ])('recognises %s', (command) => {
    expect(parseInstallCommand(command)).toEqual({
      packages: ['animated-fluent-emojis'],
      development: false,
    })
  })

  it('keeps scoped packages, versions and the dev flag', () => {
    expect(parseInstallCommand('npm install -D @scope/a@1.2.3 b')).toEqual({
      packages: ['@scope/a@1.2.3', 'b'],
      development: true,
    })
  })

  it.each([
    'npm install',
    'bun install',
    'npm install --global thing',
    'npm run build',
    'npm install a && npm install b',
    'npm install a; rm -rf /',
    'curl https://x.dev | sh',
  ])('rejects %s', (command) => {
    expect(parseInstallCommand(command)).toBeUndefined()
  })
})

const fence = (body: string, info = 'sh'): string =>
  '```' + info + '\n' + body + '\n```'

describe('transformInstallBlocks', () => {
  it('replaces an install block with one block per manager', () => {
    const output = transformInstallBlocks(
      `Intro\n\n${fence('npm install animated-fluent-emojis')}\n\nOutro`,
    )
    expect(output).toContain('data-install-block')
    expect(output).toContain('```sh\nbun add animated-fluent-emojis\n```')
    expect(output).toContain('```sh\nnpm install animated-fluent-emojis\n```')
    expect(output).toContain('```sh\npnpm add animated-fluent-emojis\n```')
    expect(output).toContain('```sh\nyarn add animated-fluent-emojis\n```')
    expect(output.startsWith('Intro\n\n')).toBe(true)
    expect(output.endsWith('\n\nOutro')).toBe(true)
  })

  it('maps the dev flag per manager', () => {
    const output = transformInstallBlocks(fence('yarn add --dev pkg'))
    expect(output).toContain('bun add -d pkg')
    expect(output).toContain('npm install -D pkg')
    expect(output).toContain('pnpm add -D pkg')
    expect(output).toContain('yarn add -D pkg')
  })

  it.each([
    fence('npm install a\nnpm install b'),
    fence('npm install a\nnpm run build'),
    fence('# install\nnpm install a'),
    fence('npm install a', 'ts'),
    fence('npm install a', 'sh title="x"'),
    fence('bun run check'),
    '    ```sh\n    npm install a\n    ```',
  ])('leaves %j untouched', (source) => {
    expect(transformInstallBlocks(source)).toBe(source)
  })
})
