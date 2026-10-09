import { renderToString } from 'react-dom/server'
import { expect, test } from 'vitest'

import type { CodeBlockTab } from '@/components/CodeBlock'

import publicIndexFixture from '../gallery/fixtures/public-index.json'
import { parsePublicIndex } from '../gallery/public-index'
import { SNIPPET_TABS } from './content'
import DemoPlayground from './DemoPlayground'

const emojis = parsePublicIndex(publicIndexFixture)
const wave = emojis.find((emoji) => emoji.id === '1f44b_wavinghand')
if (!wave) throw new Error('fixture needs the waving hand')

const tabs: CodeBlockTab[] = SNIPPET_TABS.map((tab) => ({
  id: tab.kind,
  label: tab.label,
  code: tab.kind,
  html: `<div class="ec-line">${tab.kind}</div>`,
}))

const labels = {
  emojiLabel: 'Emoji',
  sizeLabel: 'Size',
  toneLabel: 'Skin tone',
  playsLabel: 'Plays',
  reset: 'Reset',
  emojis: {
    wave: 'Waving hand',
    fire: 'Fire',
    party: 'Party popper',
    heart: 'Red heart',
    rocket: 'Rocket',
    grin: 'Grinning face',
  },
  tones: { default: 'Default', light: 'Light', medium: 'Medium', dark: 'Dark' },
  plays: { hover: 'On hover', load: 'On load' },
  code: { tabsLabel: 'Framework', copy: 'Copy', copied: 'Copied' },
}

test('the customizer starts untouched, so Reset is disabled', () => {
  const html = renderToString(
    <DemoPlayground
      emojis={[wave]}
      plainTabs={tabs}
      tonedTabs={tabs}
      labels={labels}
    />,
  )

  expect(html).toMatch(/<button[^>]*disabled[^>]*>.*?Reset/s)
  expect(html).toContain('aria-label="Skin tone"')
  expect(html).toContain('aria-label="Framework"')
  expect(html).toContain('aria-label="Waving hand"')
})

test('each skin tone option has a decorative color dot before its label', () => {
  const html = renderToString(
    <DemoPlayground
      emojis={[wave]}
      plainTabs={tabs}
      tonedTabs={tabs}
      labels={labels}
    />,
  )

  for (const color of ['#feba46', '#fac7b4', '#b3867a', '#533938']) {
    expect(html.toLowerCase()).toContain(`background-color:${color}`)
  }
  expect(html).toMatch(/aria-hidden="true"[^>]*><\/span>Light/)
})

test('the stage is compact and the code block sits in the capped wrapper', () => {
  const html = renderToString(
    <DemoPlayground
      emojis={[wave]}
      plainTabs={tabs}
      tonedTabs={tabs}
      labels={labels}
    />,
  )

  expect(html).toContain('h-[180px]')
  expect(html).not.toContain('h-[260px]')
  expect(html).toMatch(/class="demo-code[^"]*"/)
})
