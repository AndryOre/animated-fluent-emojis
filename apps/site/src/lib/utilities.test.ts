import { expect, test } from 'vitest'

import { cn } from './utilities'

test('cn joins truthy class names and drops falsy ones', () => {
  expect(cn('a', false, undefined, 'b', ['c'])).toBe('a b c')
})

test('cn resolves conflicting Tailwind utilities in favor of the last one', () => {
  expect(cn('px-2 rounded-lg', 'px-6 rounded-full')).toBe('px-6 rounded-full')
})
