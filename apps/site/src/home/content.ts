import type { PublicEmoji } from '../gallery/public-index'
import { generateSnippet, type SnippetKind } from '../gallery/snippets'

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
