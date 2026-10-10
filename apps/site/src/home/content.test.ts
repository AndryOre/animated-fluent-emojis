import { describe, expect, it } from 'vitest'

import publicIndexFixture from '../gallery/fixtures/public-index.json'
import { parsePublicIndex } from '../gallery/public-index'
import { generateSnippet, type SnippetKind } from '../gallery/snippets'
import {
  buildCodeBlockTabs,
  buildEmojiPageTabs,
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

function text(html: string): string {
  return html
    .replaceAll(/<[^>]+>/g, '')
    .replaceAll('&#x22;', '"')
    .replaceAll('&#x3C;', '<')
}

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

  it('expresses the play mode in code and filled html', async () => {
    const emoji = emojis[0]
    if (!emoji) throw new Error('fixture is empty')
    const hover = await buildCodeBlockTabs(emoji, undefined, 64, 'hover')
    const loop = await buildCodeBlockTabs(emoji, undefined, 64, 'loop')
    expect(hover[0]?.code).toContain('playOnHover autoPlay={false}')
    expect(text(hover[0]?.html ?? '')).toContain('playOnHover autoPlay={false}')
    expect(hover[1]?.code).toContain('play-on-hover :auto-play="false"')
    expect(loop[4]?.code).toContain('animation-iterations="infinite"')
    expect(text(loop[4]?.html ?? '')).toContain(
      'animation-iterations="infinite"',
    )
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

const CODE_LINE_PATTERN = /<div class="code">(.*?)<\/div><\/div>/gs

function stripTags(html: string): string {
  let text = ''
  let insideTag = false
  for (const character of html) {
    if (character === '<') insideTag = true
    else if (character === '>' && insideTag) insideTag = false
    else if (!insideTag) text += character
  }
  return text
}

function visibleText(html: string): string {
  return Array.from(
    html.replaceAll('\n', '').matchAll(CODE_LINE_PATTERN),
    ([, line = '']) =>
      stripTags(line)
        .replaceAll(/&#x([\dA-F]+);/gi, (_, code: string) =>
          String.fromCodePoint(Number.parseInt(code, 16)),
        )
        .replaceAll('&amp;', '&'),
  ).join('\n')
}

describe('emoji page tabs', () => {
  const withTones = emojis.find((candidate) => candidate.tones.length > 0)
  const withoutTones = emojis.find((candidate) => candidate.tones.length === 0)

  it('shows the same text generateSnippet copies', async () => {
    if (!withTones) throw new Error('fixture needs an emoji with tones')
    const tone = withTones.tones[0]?.tone
    const { plain, toned } = await buildEmojiPageTabs(withTones, 200)
    for (const tab of plain) {
      expect(visibleText(tab.html)).toBe(tab.code)
      expect(tab.code).toBe(
        generateSnippet(withTones, tab.id as SnippetKind, { size: 200 }),
      )
    }
    for (const tab of toned) {
      expect(visibleText(tab.html)).toBe(
        generateSnippet(withTones, tab.id as SnippetKind, { size: 200, tone }),
      )
    }
  })

  it('has no toned tabs for an emoji without skin tones', async () => {
    if (!withoutTones) throw new Error('fixture needs an emoji without tones')
    const { plain, toned } = await buildEmojiPageTabs(withoutTones, 200)
    expect(plain).toHaveLength(5)
    expect(toned).toEqual([])
  })
})
