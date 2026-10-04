import axe from 'axe-core'
import { expect, test } from 'vitest'
import { render } from 'vitest-browser-react'
import { page } from 'vitest/browser'

import { Emoji } from './Emoji.js'

const BLOCKING_IMPACTS = new Set(['serious', 'critical'])

test('has no serious or critical WCAG A/AA violations', async () => {
  const { container } = await render(<Emoji id="cat" />)
  await expect.element(page.getByRole('img', { name: 'Cat' })).toBeVisible()

  const { violations } = await axe.run(container, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
  })

  const blocking = violations.filter(
    (violation) =>
      violation.impact != null && BLOCKING_IMPACTS.has(violation.impact),
  )
  expect(blocking).toEqual([])
})
