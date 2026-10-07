import { renderToString } from 'react-dom/server'
import { expect, test } from 'vitest'

import { ToggleGroup, ToggleGroupItem } from './toggle-group'

test('ToggleGroup renders a labelled group whose pressed item is marked', () => {
  const html = renderToString(
    <ToggleGroup aria-label="Size" value={['96']}>
      <ToggleGroupItem value="64">64</ToggleGroupItem>
      <ToggleGroupItem value="96">96</ToggleGroupItem>
    </ToggleGroup>,
  )

  expect(html).toContain('role="group"')
  expect(html).toContain('aria-label="Size"')
  expect(html.match(/aria-pressed="true"/g)).toHaveLength(1)
})
