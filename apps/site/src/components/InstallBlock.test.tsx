import { renderToString } from 'react-dom/server'
import { expect, test } from 'vitest'

import { PACKAGE_MANAGERS } from '@/lib/package-manager'

import InstallBlock from './InstallBlock'

const labels = {
  tabsLabel: 'Package manager',
  copy: 'Copy',
  copied: 'Copied',
}

const htmlByManager = Object.fromEntries(
  PACKAGE_MANAGERS.map((id) => [id, `<pre>${id}</pre>`]),
) as Record<(typeof PACKAGE_MANAGERS)[number], string>

test('InstallBlock renders the sliding tab-pill indicator', () => {
  const html = renderToString(
    <InstallBlock htmlByManager={htmlByManager} labels={labels} />,
  )

  expect(html).toContain('tab-pill-list')
  expect(html).toContain('class="tab-pill"')
})
