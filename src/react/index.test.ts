import { expect, test } from 'vitest'

import * as rootEntry from '../index.js'
import { Emoji } from './index.js'

test('the react entry exposes the same component as the deprecated root export', () => {
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- the test pins the deprecated alias to the new entry
  expect(Emoji).toBe(rootEntry.Emoji)
  expect(typeof Emoji).toBe('object')
})
