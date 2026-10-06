import { describe, expect, it } from 'vitest'

import publicIndexFixture from './fixtures/public-index.json'
import { parsePublicIndex, type PublicEmoji } from './public-index'
import { generateSnippet } from './snippets'

const emojis = parsePublicIndex(publicIndexFixture)
const find = (slug: string): PublicEmoji => {
  const emoji = emojis.find((candidate) => candidate.slug === slug)
  if (!emoji) throw new Error(`fixture lacks ${slug}`)
  return emoji
}

describe('snippets', () => {
  const wave = find('waving-hand')

  it('generates the React snippet from the documented API', () => {
    const snippet = generateSnippet(wave, 'react', { size: 48 })
    expect(snippet).toContain(
      `import { Emoji } from 'animated-fluent-emojis/react'`,
    )
    expect(snippet).toContain(`import 'animated-fluent-emojis/style.css'`)
    expect(snippet).toContain('<Emoji id="1f44b_wavinghand" size={48} />')
  })

  it('uses skinTone for adapters and skin-tone for Vue and the element', () => {
    expect(generateSnippet(wave, 'react', { tone: 'light' })).toContain(
      'skinTone="light"',
    )
    expect(generateSnippet(wave, 'svelte', { tone: 'dark' })).toContain(
      'skinTone="dark"',
    )
    expect(generateSnippet(wave, 'astro', { tone: 'medium' })).toContain(
      'skinTone="medium"',
    )
    expect(generateSnippet(wave, 'vue', { tone: 'light' })).toContain(
      'skin-tone="light"',
    )
    expect(generateSnippet(wave, 'element', { tone: 'light' })).toContain(
      'skin-tone="light"',
    )
  })

  it('imports each adapter from its subpath', () => {
    expect(generateSnippet(wave, 'vue')).toContain(
      `from 'animated-fluent-emojis/vue'`,
    )
    expect(generateSnippet(wave, 'svelte')).toContain(
      `from 'animated-fluent-emojis/svelte'`,
    )
    expect(generateSnippet(wave, 'astro')).toContain(
      `import Emoji from 'animated-fluent-emojis/astro'`,
    )
    const element = generateSnippet(wave, 'element')
    expect(element).toContain(`import 'animated-fluent-emojis/element'`)
    expect(element).toContain('<fluent-emoji id="1f44b_wavinghand" size="64">')
    expect(element).toContain('<span slot="fallback">👋</span>')
  })

  it('lists tone-slug file URLs for no code', () => {
    expect(generateSnippet(wave, 'no-code', { tone: 'light' })).toBe(
      [
        'https://animated-fluent-emojis-files.andryore.dev/gif/waving-hand-light.gif',
        'https://animated-fluent-emojis-files.andryore.dev/webp/waving-hand-light.webp',
        'https://animated-fluent-emojis-files.andryore.dev/png/waving-hand-light.png',
      ].join('\n'),
    )
  })

  it('rejects a tone the emoji does not have', () => {
    expect(() =>
      generateSnippet(find('fire'), 'react', { tone: 'dark' }),
    ).toThrow(/no "dark" tone/)
  })
})
