import {
  FILE_FORMATS,
  fileUrl,
  type FileUrls,
  type PublicEmoji,
  type SkinTone,
} from './public-index'

export const SNIPPET_KINDS = [
  'react',
  'vue',
  'svelte',
  'astro',
  'element',
  'no-code',
] as const

export type SnippetKind = (typeof SNIPPET_KINDS)[number]

export interface SnippetOptions {
  size?: number
  tone?: SkinTone
}

const DEFAULT_SIZE = 64

function toneAttribute(tone: SkinTone | undefined, name: string): string {
  return tone ? ` ${name}="${tone}"` : ''
}

/**
 * Slug and file URLs for an emoji, or for one of its tone variants.
 * @param emoji - The emoji to resolve.
 * @param tone - The skin tone, or none for the default.
 * @returns The slug and file URLs to use.
 * @throws {Error} When the emoji has no variant for the tone.
 */
function resolveFiles(
  emoji: PublicEmoji,
  tone?: SkinTone,
): { slug: string; urls: FileUrls } {
  if (!tone) {
    return { slug: emoji.slug, urls: emoji.urls }
  }
  const variant = emoji.tones.find((candidate) => candidate.tone === tone)
  if (!variant) {
    throw new Error(`${emoji.slug} has no "${tone}" tone`)
  }
  return { slug: variant.slug, urls: variant.urls }
}

/**
 * Generates the usage snippet for one adapter, the `<fluent-emoji>` element or
 * plain file URLs, following the API in `docs/guide/`.
 * @param emoji - The emoji to show.
 * @param kind - Which snippet to produce.
 * @param options - Size in pixels and an optional skin tone.
 * @param options.size - Size in pixels.
 * @param options.tone - The skin tone.
 * @returns The snippet text.
 * @throws {Error} When the tone is not available for the emoji.
 */
export function generateSnippet(
  emoji: PublicEmoji,
  kind: SnippetKind,
  { size = DEFAULT_SIZE, tone }: SnippetOptions = {},
): string {
  if (tone) {
    resolveFiles(emoji, tone)
  }
  switch (kind) {
    case 'react': {
      return [
        `import { Emoji } from 'animated-fluent-emojis/react'`,
        '',
        `import 'animated-fluent-emojis/style.css'`,
        '',
        `<Emoji id="${emoji.id}" size={${String(size)}}${toneAttribute(tone, 'skinTone')} />`,
      ].join('\n')
    }
    case 'vue': {
      return [
        '<script setup lang="ts">',
        `import { Emoji } from 'animated-fluent-emojis/vue'`,
        '',
        `import 'animated-fluent-emojis/style.css'`,
        '</script>',
        '',
        '<template>',
        `  <Emoji id="${emoji.id}" :size="${String(size)}"${toneAttribute(tone, 'skin-tone')} />`,
        '</template>',
      ].join('\n')
    }
    case 'svelte': {
      return [
        '<script lang="ts">',
        `  import { Emoji } from 'animated-fluent-emojis/svelte'`,
        '',
        `  import 'animated-fluent-emojis/style.css'`,
        '</script>',
        '',
        `<Emoji id="${emoji.id}" size={${String(size)}}${toneAttribute(tone, 'skinTone')} />`,
      ].join('\n')
    }
    case 'astro': {
      return [
        '---',
        `import Emoji from 'animated-fluent-emojis/astro'`,
        '---',
        '',
        `<Emoji id="${emoji.id}" size={${String(size)}}${toneAttribute(tone, 'skinTone')}>`,
        `  <span slot="fallback">${emoji.unicode}</span>`,
        '</Emoji>',
      ].join('\n')
    }
    case 'element': {
      return [
        '<script type="module">',
        `  import 'animated-fluent-emojis/element'`,
        '</script>',
        '',
        `<fluent-emoji id="${emoji.id}" size="${String(size)}"${toneAttribute(tone, 'skin-tone')}>`,
        `  <span slot="fallback">${emoji.unicode}</span>`,
        '</fluent-emoji>',
      ].join('\n')
    }
    case 'no-code': {
      const { urls } = resolveFiles(emoji, tone)
      return FILE_FORMATS.map((format) => fileUrl(urls[format])).join('\n')
    }
  }
}
