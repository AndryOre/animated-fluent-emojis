import path from 'node:path'
import { expect, test } from 'vitest'

import {
  buildCategoryFileName,
  formatMarkdown,
  renderEmojiLists,
} from './emoji-lists.js'
import { createTeamsManifest } from './test-support.js'

test('buildCategoryFileName matches the existing docs naming', () => {
  expect(buildCategoryFileName('Travel and places')).toBe(
    'EMOJI_LIST_Travel_and_places.md',
  )
  expect(buildCategoryFileName('Smilies')).toBe('EMOJI_LIST_Smilies.md')
})

test('renders one table per category and leaves the index alone', () => {
  const files = renderEmojiLists(createTeamsManifest())

  expect(files.keys().toArray()).toEqual([
    'EMOJI_LIST_Smilies.md',
    'EMOJI_LIST_Hand_gestures.md',
    'EMOJI_LIST_Symbols.md',
  ])
  const smilies = files.get('EMOJI_LIST_Smilies.md') ?? ''
  expect(smilies).toContain('# Smilies')
  expect(smilies).toContain(
    '| 1f603_grinningfacewithbigeyes | 😃 | Grinning face with big eyes | grinning |',
  )
})

test('escapes pipes and collapses whitespace in cells', () => {
  const manifest = createTeamsManifest()
  const emoticon = manifest.categories[0]?.emoticons[0]
  if (!emoticon) throw new Error('fixture changed')
  const [smiliesCategory] = manifest.categories
  if (!smiliesCategory) throw new Error('fixture changed')
  smiliesCategory.emoticons = [{ ...emoticon, description: 'a | b\n  c' }]

  const smilies = renderEmojiLists(manifest).get('EMOJI_LIST_Smilies.md') ?? ''

  expect(smilies).toContain(String.raw`a \| b c`)
})

test('formatMarkdown aligns the table with the repository Prettier config', async () => {
  const source = '| A | B |\n| - | - |\n| longer cell | x |\n'

  const formatted = await formatMarkdown(
    source,
    path.resolve(import.meta.dirname, '../../docs/EMOJI_LIST_Test.md'),
  )

  expect(formatted).toContain('| A           | B   |')
})
