import { describe, expect, it } from 'vitest'

import publicIndexFixture from '../gallery/fixtures/public-index.json'
import { parsePublicIndex } from '../gallery/public-index'
import {
  buildCodeBlockTabs,
  buildInstallHtml,
  buildSnippetTabs,
  pickTeaserEmojis,
  SNIPPET_TABS,
} from './content'

const emojis = parsePublicIndex(publicIndexFixture)

describe('snippet tabs', () => {
  it('lists React, Vue, Svelte, Astro and HTML in order', () => {
    expect(SNIPPET_TABS.map((tab) => tab.label)).toEqual([
      'React',
      'Vue',
      'Svelte',
      'Astro',
      'HTML',
    ])
  })

  it('fills each tab with the generator output for the emoji', () => {
    const emoji = emojis[0]
    if (!emoji) throw new Error('fixture is empty')
    const tabs = buildSnippetTabs(emoji)
    expect(tabs).toHaveLength(5)
    expect(tabs[0]?.code).toContain(emoji.id)
    expect(tabs[4]?.code).toContain('<fluent-emoji')
  })
})

describe('highlighted blocks', () => {
  it('fills the placeholders of every framework tab at build time', async () => {
    const emoji = emojis[0]
    if (!emoji) throw new Error('fixture is empty')
    const tabs = await buildCodeBlockTabs(emoji)
    expect(tabs.map((tab) => tab.id)).toEqual([
      'react',
      'vue',
      'svelte',
      'astro',
      'element',
    ])
    for (const tab of tabs) {
      expect(tab.html).toContain(emoji.id)
      expect(tab.html).not.toContain('EMOJIID')
      expect(tab.html).not.toContain('99999')
    }
  })

  it('highlights the install command of every package manager', async () => {
    const html = await buildInstallHtml()
    expect(Object.keys(html)).toEqual(['bun', 'npm', 'pnpm', 'yarn'])
    expect(html.npm).toContain('install')
    expect(html.bun).not.toContain('class="gutter"')
  })
})

describe('teaser emojis', () => {
  it('returns the requested number of distinct emojis', () => {
    const count = Math.min(8, emojis.length)
    const picked = pickTeaserEmojis(emojis, count)
    expect(picked).toHaveLength(count)
    expect(new Set(picked.map((emoji) => emoji.slug)).size).toBe(count)
  })

  it('returns everything when fewer are available', () => {
    expect(pickTeaserEmojis(emojis.slice(0, 3), 8)).toHaveLength(3)
  })
})
