import { expectTypeOf, test } from 'vitest'

import type { EmojiId, EmojiProps, SkinTone } from '../index.js'

test('id accepts known literals and dynamic strings', () => {
  expectTypeOf<{ id: 'happyface' }>().toExtend<EmojiProps>()
  expectTypeOf<{ id: string }>().toExtend<EmojiProps>()
  expectTypeOf<'happyface'>().toExtend<EmojiId>()
  expectTypeOf<'dark'>().toExtend<SkinTone>()
})
