import { expect, test } from 'vitest'

import * as rootEntry from '../index.js'
import { createEmoji } from '../vanilla/create-emoji.js'

test('the root exports the vanilla createEmoji', () => {
  expect(rootEntry.createEmoji).toBe(createEmoji)
})
