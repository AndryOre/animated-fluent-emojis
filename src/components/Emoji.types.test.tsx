import type { ComponentRef } from 'react'
import { expectTypeOf, test } from 'vitest'

import type { EmojiId, EmojiProps, SkinTone } from '../index.js'
import type { Emoji } from './Emoji.js'

test('id accepts known literals and dynamic strings', () => {
  expectTypeOf<{ id: 'happyface' }>().toExtend<EmojiProps>()
  expectTypeOf<{ id: string }>().toExtend<EmojiProps>()
  expectTypeOf<'happyface'>().toExtend<EmojiId>()
  expectTypeOf<'dark'>().toExtend<SkinTone>()
})

test('props extend span attributes and ref targets the root span', () => {
  expectTypeOf<{
    id: 'cat'
    className: string
    'aria-label': string
    onClick: () => void
    fallback: null
  }>().toExtend<EmojiProps>()
  expectTypeOf<ComponentRef<typeof Emoji>>().toEqualTypeOf<HTMLSpanElement>()
})
