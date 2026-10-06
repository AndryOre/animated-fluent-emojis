import { SKIN_TONES, type SkinTone } from './public-index'

/**
 * Gallery filters that live in the page URL, so a search can be reloaded and
 * shared.
 */
export interface GalleryUrlState {
  query: string
  tone: SkinTone | undefined
  category: string | undefined
}

/**
 * Reads the gallery filters from a query string. Unknown tones and blank
 * values are dropped.
 * @param search - The query string, with or without the leading `?`.
 * @returns The parsed filters.
 */
export function parseGalleryUrl(search: string): GalleryUrlState {
  const parameters = new URLSearchParams(search)
  const tone = parameters.get('tone')
  const category = parameters.get('c')?.trim()
  return {
    query: parameters.get('q') ?? '',
    tone: SKIN_TONES.find((candidate) => candidate === tone),
    category: category === '' ? undefined : category,
  }
}

/**
 * Writes the gallery filters as a query string.
 * @param state - The filters to write.
 * @returns A query string with a leading `?`, or an empty string when no
 * filter is set.
 */
export function serializeGalleryUrl(state: GalleryUrlState): string {
  const parameters = new URLSearchParams()
  if (state.query.trim() !== '') parameters.set('q', state.query)
  if (state.tone) parameters.set('tone', state.tone)
  if (state.category) parameters.set('c', state.category)
  const text = parameters.toString()
  return text === '' ? '' : `?${text}`
}
