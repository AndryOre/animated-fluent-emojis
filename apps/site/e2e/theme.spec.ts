import { expect, test, type Page } from '@playwright/test'

const THEME_STORAGE_KEY = 'afe:theme'

async function shimmerAnimation(
  page: Page,
  reducedMotion: 'reduce' | 'no-preference',
) {
  await page.emulateMedia({ reducedMotion })
  await page.route('**/index.json', (route) => route.request())
  await page.goto('/emojis/')
  const placeholder = page.locator('.shimmer').first()
  await expect(placeholder).toBeVisible()
  return placeholder.evaluate(
    (element) => getComputedStyle(element).animationName,
  )
}

test('the toggle cycles system, light and dark and remembers the choice', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/')
  const html = page.locator('html')
  const toggle = page.locator('[data-theme-toggle]').first()

  await expect(html).not.toHaveClass(/dark/)
  await toggle.click()
  await expect(html).toHaveAttribute('data-theme', 'light')
  await toggle.click()
  await expect(html).toHaveAttribute('data-theme', 'dark')
  await expect(html).toHaveClass(/dark/)

  await page.reload()
  await expect(html).toHaveClass(/dark/)
  expect(
    await page.evaluate<string | null>(
      `localStorage.getItem('${THEME_STORAGE_KEY}')`,
    ),
  ).toBe('dark')

  await toggle.click()
  await expect(html).toHaveAttribute('data-theme', 'system')
  await expect(html).not.toHaveClass(/dark/)
})

test('the system theme follows the browser color scheme', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/')
  await expect(page.locator('html')).toHaveClass(/dark/)
})

test.describe('reduced motion', () => {
  test('stops the loading shimmer', async ({ page }) => {
    expect(await shimmerAnimation(page, 'reduce')).toBe('none')
  })

  test('keeps the loading shimmer otherwise', async ({ page }) => {
    expect(await shimmerAnimation(page, 'no-preference')).toBe('shimmer')
  })
})
