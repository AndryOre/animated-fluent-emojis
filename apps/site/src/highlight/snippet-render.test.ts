import { beforeAll, describe, expect, it } from 'vitest'

import publicIndexFixture from '../gallery/fixtures/public-index.json'
import { parsePublicIndex, type PublicEmoji } from '../gallery/public-index'
import { generateSnippet } from '../gallery/snippets'
import {
  createSnippetRenderer,
  type RenderedSnippet,
  type SnippetRenderer,
} from './snippet-render'
import { swapSnippetSlots, type SlotElement } from './snippet-swap'
import {
  SLOT_SENTINELS,
  SNIPPET_SLOTS,
  TEMPLATE_KINDS,
  type SnippetSlot,
  type TemplateKind,
} from './snippet-template'

const SLOT_PATTERN =
  /<span([^>]*) data-snippet-slot="(\w+)"([^>]*)>([^<]*)<\/span>/g
const CODE_LINE_PATTERN = /<div class="code">(.*?)<\/div><\/div>/gs

const emoji = parsePublicIndex(publicIndexFixture).find(
  (candidate): candidate is PublicEmoji =>
    candidate.slug === 'waving-hand' && candidate.tones.length > 0,
)

function expectedSlots(kind: TemplateKind, withTone: boolean): SnippetSlot[] {
  const hasUnicode = kind === 'astro' || kind === 'element'
  return SNIPPET_SLOTS.filter(
    (slot) =>
      slot === 'id' ||
      slot === 'size' ||
      (slot === 'tone' && withTone) ||
      (slot === 'unicode' && hasUnicode),
  )
}

function compareSlots(left: SnippetSlot, right: SnippetSlot): number {
  return left.localeCompare(right)
}

function decodeEntities(text: string): string {
  return text
    .replaceAll(/&#x([\dA-F]+);/gi, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replaceAll('&amp;', '&')
}

function escapeText(text: string): string {
  return text.replaceAll('&', '&#x26;').replaceAll('<', '&#x3C;')
}

function textOf(html: string): string {
  return html
    .matchAll(CODE_LINE_PATTERN)
    .map(([, line = '']) => decodeEntities(line.replaceAll(/<[^>]+>|\n/g, '')))
    .toArray()
    .join('\n')
}

function swapInHtml(
  html: string,
  values: Partial<Record<SnippetSlot, string>>,
): string {
  const slots: { element: SlotElement; match: string }[] = html
    .matchAll(SLOT_PATTERN)
    .map(([match, , slot = '', , text = '']) => ({
      match,
      element: { dataset: { snippetSlot: slot }, textContent: text },
    }))
    .toArray()
  swapSnippetSlots(
    slots.map(({ element }) => element),
    values,
  )
  let cursor = 0
  return html.replaceAll(SLOT_PATTERN, (match) => {
    const entry = slots[cursor++]
    if (!entry) throw new Error('slot count changed')
    return match.replace(
      />([^<]*)<\/span>$/,
      () => `>${escapeText(entry.element.textContent ?? '')}</span>`,
    )
  })
}

describe('snippet templates', () => {
  let renderer: SnippetRenderer
  const rendered = new Map<string, RenderedSnippet>()

  beforeAll(async () => {
    renderer = await createSnippetRenderer()
    for (const kind of TEMPLATE_KINDS) {
      for (const withTone of [false, true]) {
        rendered.set(
          `${kind}:${String(withTone)}`,
          await renderer.render(kind, withTone),
        )
      }
    }
  })

  const variants = TEMPLATE_KINDS.flatMap((kind) =>
    [false, true].map((withTone) => ({ kind, withTone })),
  )

  describe.each(variants)('$kind (tone: $withTone)', ({ kind, withTone }) => {
    const get = (): RenderedSnippet => {
      const result = rendered.get(`${kind}:${String(withTone)}`)
      if (!result) throw new Error('missing render')
      return result
    }

    it('holds each placeholder in exactly one token', () => {
      const { html, slots } = get()
      expect(slots.toSorted(compareSlots)).toEqual(
        expectedSlots(kind, withTone).toSorted(compareSlots),
      )
      for (const slot of SNIPPET_SLOTS) {
        const tokens = html
          .matchAll(SLOT_PATTERN)
          .filter((match) => match[2] === slot)
          .toArray()
        const expected = slots.includes(slot) ? 1 : 0
        expect(tokens).toHaveLength(expected)
        for (const token of tokens) {
          expect(token[4]).toBe(SLOT_SENTINELS[slot])
        }
      }
    })

    it('keeps the highlighting colors on the slot tokens', () => {
      for (const [, before = '', , after = ''] of get().html.matchAll(
        SLOT_PATTERN,
      )) {
        expect(`${before}${after}`).toContain('style="--0:')
      }
    })

    it('swaps to the text generateSnippet produces', () => {
      if (!emoji) throw new Error('fixture lacks waving-hand tones')
      const tone = withTone ? emoji.tones[0]?.tone : undefined
      const size = 48
      const swapped = swapInHtml(get().html, {
        id: emoji.id,
        size: String(size),
        unicode: emoji.unicode,
        ...(tone && { tone }),
      })
      expect(textOf(swapped)).toBe(
        generateSnippet(emoji, kind, { size, ...(tone && { tone }) }),
      )
    })
  })

  it('leaves untouched slots alone', () => {
    const html = rendered.get('react:false')?.html ?? ''
    expect(textOf(swapInHtml(html, { size: '12' }))).toContain(
      `id="${SLOT_SENTINELS.id}" size={12}`,
    )
  })

  it('exposes the shared base and theme styles', async () => {
    const styles = await renderer.sharedStyles()
    expect(styles).toContain('--ec-codeBg:var(--card)')
    expect(styles).toContain('.dark')
  })
})
