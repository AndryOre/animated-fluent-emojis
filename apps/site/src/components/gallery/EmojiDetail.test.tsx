import { renderToString } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import fixture from '../../gallery/fixtures/public-index.json'
import { parsePublicIndex, type PublicEmoji } from '../../gallery/public-index'
import { getUi } from '../../i18n/ui'
import { EmojiDetail } from './EmojiDetail'

vi.mock('animated-fluent-emojis/react', () => ({ Emoji: () => null }))

const found = parsePublicIndex(fixture).find(
  (candidate) => candidate.tones.length > 0,
)
if (!found) throw new Error('fixture needs an emoji with tones')
const emoji: PublicEmoji = found
const strings = getUi('en').gallery

function render(tone: 'light' | undefined): string {
  return renderToString(
    <EmojiDetail
      emoji={emoji}
      name="Waving hand"
      tone={tone}
      size={200}
      strings={strings}
      page
    />,
  )
}

describe('emoji detail on a page', () => {
  it('shows the default snippet without a tone', () => {
    const html = render(undefined)
    expect(html).toContain(emoji.id)
    expect(html).not.toContain('skinTone')
  })

  it('puts the chosen tone in the snippet', () => {
    expect(render('light')).toContain('light')
    expect(render('light')).not.toBe(render(undefined))
  })

  it('leaves the name heading to the page', () => {
    expect(render(undefined)).not.toContain('<h2')
  })
})
