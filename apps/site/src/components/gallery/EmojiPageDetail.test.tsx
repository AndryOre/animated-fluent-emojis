import { renderToString } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import fixture from '../../gallery/fixtures/public-index.json'
import { parsePublicIndex, type PublicEmoji } from '../../gallery/public-index'
import { getUi } from '../../i18n/ui'
import { EmojiPageDetail, KeywordList } from './EmojiPageDetail'

vi.mock('animated-fluent-emojis/react', () => ({ Emoji: () => null }))

const emojis = parsePublicIndex(fixture)
const toned = emojis.find((candidate) => candidate.tones.length > 0)
const untoned = emojis.find((candidate) => candidate.tones.length === 0)
if (!toned || !untoned) throw new Error('fixture needs both kinds of emoji')
const { gallery, emojiPage } = getUi('en')
const keywordStrings = {
  keywordsLabel: emojiPage.keywordsLabel,
  keywordsMore: emojiPage.keywordsMore,
  keywordsLess: emojiPage.keywordsLess,
}
const snippetTabs = { plain: [], toned: [] }

function words(count: number): string[] {
  return Array.from({ length: count }, (_, index) => `word${String(index)}`)
}

function renderPage(emoji: PublicEmoji, keywords: string[]): string {
  return renderToString(
    <EmojiPageDetail
      emoji={emoji}
      name="Waving hand"
      strings={gallery}
      snippetTabs={snippetTabs}
      category="Gestures"
      keywords={keywords}
      keywordStrings={keywordStrings}
      header={<h1>Waving hand</h1>}
    />,
  )
}

describe('emoji page island', () => {
  it('renders the static header, category, id and download in the left column', () => {
    const html = renderPage(toned, [])
    expect(html).toContain('<h1>Waving hand</h1>')
    expect(html).toContain('Gestures')
    expect(html).toContain(toned.id)
    expect(html).toContain(gallery.fileActionDownloadWebp)
  })

  it('shows tone chips only when the emoji has tones', () => {
    expect(renderPage(toned, [])).toContain(`aria-label="${gallery.toneLabel}"`)
    expect(renderPage(untoned, [])).not.toContain(
      `aria-label="${gallery.toneLabel}"`,
    )
  })

  it('renders the download once, outside the stage column', () => {
    const html = renderPage(toned, [])
    expect(html.split(gallery.fileActionDownloadWebp)).toHaveLength(2)
  })
})

describe('keyword list', () => {
  it('shows every chip and no summary at ten keywords or fewer', () => {
    const html = renderToString(
      <KeywordList keywords={words(10)} strings={keywordStrings} />,
    )
    expect(html).not.toContain('<details')
    expect(html).toContain('word9')
  })

  it('collapses the rest behind a +N more summary', () => {
    const html = renderToString(
      <KeywordList keywords={words(14)} strings={keywordStrings} />,
    )
    expect(html).toContain('<details')
    expect(html).toContain('+4 more')
    expect(html.indexOf('word9')).toBeLessThan(html.indexOf('<details'))
    expect(html.indexOf('word10')).toBeGreaterThan(html.indexOf('<details'))
  })
})
