import type { ComponentRef } from 'react'
import { expectTypeOf, test } from 'vitest'

import type { DiverseEmojiId, EmojiId, EmojiProps, SkinTone } from '../index.js'
import { Emoji } from './Emoji.js'

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

test('skinTone is rejected for a known non-diverse id', () => {
  expectTypeOf<{
    id: '1f603_grinningfacewithbigeyes'
    skinTone: 'dark'
  }>().not.toExtend<EmojiProps<'1f603_grinningfacewithbigeyes'>>()
  expectTypeOf<{
    id: '1f603_grinningfacewithbigeyes'
  }>().toExtend<EmojiProps<'1f603_grinningfacewithbigeyes'>>()
})

test('skinTone is accepted for a diverse id and for an arbitrary string id', () => {
  expectTypeOf<{
    id: '1f44b_wavinghand'
    skinTone: 'dark'
  }>().toExtend<EmojiProps<'1f44b_wavinghand'>>()
  expectTypeOf<'1f44b_wavinghand'>().toExtend<DiverseEmojiId>()
  expectTypeOf<{ id: string; skinTone: 'dark' }>().toExtend<EmojiProps>()
})

test('the component enforces the same rule in JSX', () => {
  const dynamicId = 'anything' as string
  const examples = (
    <>
      <Emoji id="1f44b_wavinghand" skinTone="dark" />
      <Emoji id={dynamicId} skinTone="dark" />
      {/* @ts-expect-error skinTone is not accepted for a non-diverse id */}
      <Emoji id="1f603_grinningfacewithbigeyes" skinTone="dark" />
    </>
  )
  expectTypeOf(examples).not.toBeAny()
})
