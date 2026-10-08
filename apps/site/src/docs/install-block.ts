import { PACKAGE_MANAGERS, type PackageManager } from '../lib/package-manager'

export interface InstallCommand {
  packages: string[]
  development: boolean
}

const COMMAND_PATTERN =
  /^(?:npm (?:install|i|add)|pnpm (?:add|install|i)|yarn add|bun (?:add|install|i)) (.+)$/
const PACKAGE_PATTERN = /^(?:@[\w.-]+\/)?[\w][\w.-]*(?:@[\w.^~<>=*-]+)?$/
const DEV_FLAGS = new Set(['-D', '-d', '--save-dev', '--dev'])
const SHELL_INFO = /^(?:sh|bash|shell|zsh)$/
const FENCE_OPEN = /^(`{3,}|~{3,})([^`]*)$/

const INSTALL_VERBS: Record<PackageManager, string> = {
  bun: 'bun add',
  npm: 'npm install',
  pnpm: 'pnpm add',
  yarn: 'yarn add',
}

const DEV_FLAG_BY_MANAGER: Record<PackageManager, string> = {
  bun: '-d',
  npm: '-D',
  pnpm: '-D',
  yarn: '-D',
}

/**
 * Reads a single package install command written for any supported package
 * manager. Anything with other flags, shell operators or no package name is
 * rejected so only unambiguous commands are ever rewritten.
 * @param line - One line of shell.
 * @returns The packages and whether they are dev dependencies, or `undefined`.
 */
export function parseInstallCommand(line: string): InstallCommand | undefined {
  const match = COMMAND_PATTERN.exec(line.trim())
  if (!match?.[1]) {
    return undefined
  }
  const packages: string[] = []
  let development = false
  const tokens = match[1].split(/\s+/)
  for (const token of tokens) {
    if (DEV_FLAGS.has(token)) {
      development = true
    } else if (PACKAGE_PATTERN.test(token)) {
      packages.push(token)
    } else {
      return undefined
    }
  }
  return packages.length > 0 ? { packages, development } : undefined
}

function commandFor(manager: PackageManager, command: InstallCommand): string {
  const flag = command.development ? ` ${DEV_FLAG_BY_MANAGER[manager]}` : ''
  return `${INSTALL_VERBS[manager]}${flag} ${command.packages.join(' ')}`
}

function renderInstallBlock(command: InstallCommand): string[] {
  const buttons = PACKAGE_MANAGERS.map(
    (manager) =>
      `<button type="button" data-package-manager="${manager}" aria-pressed="${String(manager === PACKAGE_MANAGERS[0])}">${manager}</button>`,
  )
  const panels = PACKAGE_MANAGERS.flatMap((manager, index) => [
    `<div class="afe-install-panel" data-package-manager="${manager}"${index === 0 ? '' : ' hidden'}>`,
    '',
    '```sh',
    commandFor(manager, command),
    '```',
    '',
    '</div>',
    '',
  ])
  return [
    '<div class="afe-install" data-install-block>',
    '<div class="afe-install-tabs" role="group">',
    ...buttons,
    '</div>',
    '',
    ...panels,
    '</div>',
  ]
}

function findClosingFence(
  lines: string[],
  from: number,
  marker: string,
): number {
  for (let index = from; index < lines.length; index += 1) {
    const line = lines[index] ?? ''
    if (line.startsWith(marker) && /^[`~]+\s*$/.test(line)) {
      return index
    }
  }
  return -1
}

/**
 * Rewrites every unindented `sh` fence that holds exactly one package install
 * command into a block with one highlighted command per package manager, which
 * the page script keeps in sync with the `afe:pm` preference. Run on the
 * rendered copy only: the stored Markdown source, and with it copy-as-Markdown
 * and GitHub, keeps the original command.
 * @param body - Markdown source.
 * @returns The Markdown with install blocks expanded.
 */
export function transformInstallBlocks(body: string): string {
  const lines = body.split('\n')
  const output: string[] = []
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? ''
    const open = FENCE_OPEN.exec(line)
    if (!open) {
      output.push(line)
      continue
    }
    const marker = open[1] ?? '```'
    const closing = findClosingFence(lines, index + 1, marker)
    if (closing === -1) {
      output.push(...lines.slice(index))
      break
    }
    const content = lines
      .slice(index + 1, closing)
      .filter((contentLine) => contentLine.trim() !== '')
    const command =
      content.length === 1 && SHELL_INFO.test((open[2] ?? '').trim())
        ? parseInstallCommand(content[0] ?? '')
        : undefined
    output.push(
      ...(command
        ? renderInstallBlock(command)
        : lines.slice(index, closing + 1)),
    )
    index = closing
  }
  return output.join('\n')
}
