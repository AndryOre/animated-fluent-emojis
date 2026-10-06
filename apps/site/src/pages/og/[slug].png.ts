import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { APIRoute } from 'astro'

import { loadEmojiPageData } from '../../emoji-pages/data'
import { composeOgImage } from '../../emoji-pages/og-image'
import { fileUrl } from '../../gallery/public-index'

const TEMPLATE_PATH = path.resolve(process.cwd(), '../../docs/brand/og/og.png')

const FETCH_ATTEMPTS = 4

/**
 * Downloads an emoji PNG, retrying network failures and server errors so a
 * transient connection reset does not fail a build of thousands of images.
 * @param url - Absolute URL of the emoji PNG on the files site.
 * @returns The raw PNG bytes.
 */
async function fetchPng(url: string): Promise<ArrayBuffer> {
  let lastError: unknown
  for (let attempt = 1; attempt <= FETCH_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url)
      if (response.ok) return await response.arrayBuffer()
      lastError = new Error(`${url} answered ${String(response.status)}`)
      if (response.status < 500) break
    } catch (error) {
      lastError = error
    }
    await new Promise((resolve) => setTimeout(resolve, attempt * 500))
  }
  throw lastError
}

export async function getStaticPaths() {
  const { emojis } = await loadEmojiPageData('en')
  return emojis.map(({ slug }) => ({ params: { slug } }))
}

export const GET: APIRoute = async ({ params }) => {
  const { emojis } = await loadEmojiPageData('en')
  const emoji = emojis.find(({ slug }) => slug === params.slug)
  if (!emoji) throw new Error(`Unknown emoji "${String(params.slug)}"`)
  const png = await fetchPng(fileUrl(emoji.urls.png))
  const image = await composeOgImage(
    await readFile(TEMPLATE_PATH),
    new Uint8Array(png),
    emoji.description,
  )
  return new Response(new Uint8Array(image))
}
