import { expect, test } from 'vitest'

import { compactItemClass } from './HeaderMenus'

test('header menu items never underline, so the portaled popups ignore docs link styles', () => {
  expect(compactItemClass.split(' ')).toContain('no-underline')
})
