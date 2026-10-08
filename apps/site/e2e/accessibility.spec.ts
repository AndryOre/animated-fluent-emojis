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

test('the language menu opens by role and navigates to the Japanese site', async ({
  page,
}) => {
  await page.goto('/')
  await expect(
    page.locator('astro-island[component-url*="HeaderMenus"]'),
  ).not.toHaveAttribute('ssr', /.*/)
  const trigger = page.getByRole('button', { name: 'Language' })
  await trigger.focus()
  await page.keyboard.press('Enter')
  const menu = page.getByRole('menu')
  await expect(menu).toBeVisible()
  await expect(menu.getByRole('menuitem', { name: /English/ })).toHaveAttribute(
    'aria-current',
    'true',
  )
  await page.keyboard.press('Escape')
  await expect(menu).toBeHidden()
  await expect(trigger).toBeFocused()

  await trigger.click()
  await page.getByRole('menuitem', { name: /日本語/ }).click()
  await expect(page).toHaveURL(/\/ja\/$/)
})
