import type { CodeBlockTab } from '../components/CodeBlock'
import type { PublicEmoji } from '../gallery/public-index'
import { generateSnippet, type SnippetKind } from '../gallery/snippets'
import { fillSnippetSlots } from '../highlight/snippet-html'
import {
  createSnippetRenderer,
  type SnippetRenderer,
} from '../highlight/snippet-render'
import { TEMPLATE_KINDS } from '../highlight/snippet-template'
import {
  installCommand,
  PACKAGE_MANAGERS,
  type PackageManager,
} from '../lib/package-manager'

export interface SnippetTab {
  kind: SnippetKind
  label: string
}

export interface SnippetTabContent extends SnippetTab {
  code: string
}

export const SNIPPET_TABS: readonly SnippetTab[] = [
  { kind: 'react', label: 'React' },
  { kind: 'vue', label: 'Vue' },
  { kind: 'svelte', label: 'Svelte' },
  { kind: 'astro', label: 'Astro' },
  { kind: 'element', label: 'HTML' },
]

/**
 * Builds the landing page snippet tabs from the snippet generator.
 * @param emoji - The emoji shown in every snippet.
 * @returns One entry per tab with its code.
 */
export function buildSnippetTabs(emoji: PublicEmoji): SnippetTabContent[] {
  return SNIPPET_TABS.map((tab) => ({
    ...tab,
    code: generateSnippet(emoji, tab.kind),
  }))
}

const SHOWN_SIZE = 64

const rendererCache = new Map<'shared', Promise<SnippetRenderer>>()

function sharedRenderer(): Promise<SnippetRenderer> {
  const cached = rendererCache.get('shared')
  if (cached) return cached
  const created = createSnippetRenderer()
  rendererCache.set('shared', created)
  return created
}

/**
 * Builds the highlighted code block tabs of the landing page. Each template is
 * highlighted once and its placeholders are filled with the emoji at build
 * time, so the HTML needs no client work to show the right snippet.
 * @param emoji - The emoji shown in every snippet.
 * @returns One code block tab per framework.
 */
export async function buildCodeBlockTabs(
  emoji: PublicEmoji,
): Promise<CodeBlockTab[]> {
  const renderer = await sharedRenderer()
  return Promise.all(
    buildSnippetTabs(emoji).map(async (tab) => {
      const templated = TEMPLATE_KINDS.find((kind) => kind === tab.kind)
      if (!templated) throw new Error(`no template for ${tab.kind}`)
      const rendered = await renderer.render(templated, false)
      return {
        id: tab.kind,
        label: tab.label,
        code: tab.code,
        html: fillSnippetSlots(rendered.html, {
          id: emoji.id,
          size: String(SHOWN_SIZE),
          unicode: emoji.unicode,
        }),
      }
    }),
  )
}

/**
 * Highlights the install command of every package manager at build time.
 * @returns The highlighted shell markup per package manager.
 */
export async function buildInstallHtml(): Promise<
  Record<PackageManager, string>
> {
  const renderer = await sharedRenderer()
  const entries = await Promise.all(
    PACKAGE_MANAGERS.map(async (manager) => {
      const rendered = await renderer.renderCode(
        installCommand(manager),
        'bash',
      )
      return [manager, rendered.html] as const
    }),
  )
  return Object.fromEntries(entries) as Record<PackageManager, string>
}

/**
 * Picks the emojis for the gallery teaser grid, evenly spread over the index
 * so the teaser shows variety and stays stable between builds.
 * @param emojis - The full public index.
 * @param count - How many emojis to pick.
 * @returns At most `count` distinct emojis.
 */
export function pickTeaserEmojis(
  emojis: readonly PublicEmoji[],
  count: number,
): PublicEmoji[] {
  if (emojis.length <= count) return [...emojis]
  const step = emojis.length / count
  return Array.from({ length: count }, (_, index) => {
    const emoji = emojis[Math.floor(index * step)]
    if (!emoji) throw new Error('teaser index out of range')
    return emoji
  })
}
