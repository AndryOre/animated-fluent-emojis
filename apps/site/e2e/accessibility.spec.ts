import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { SAMPLED_PATHS } from './routes'

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

for (const colorScheme of ['light', 'dark'] as const) {
  test.describe(`${colorScheme} scheme`, () => {
    test.use({ colorScheme })

    for (const path of SAMPLED_PATHS) {
      test(`${path} has no axe violations`, async ({ page }) => {
        const response = await page.goto(path)
        expect(response?.status()).toBe(200)
        await expect(page.locator('h1').first()).toBeVisible()
        const results = await new AxeBuilder({ page })
          .withTags(AXE_TAGS)
          .analyze()
        expect(results.violations).toEqual([])
      })
    }
  })
}
