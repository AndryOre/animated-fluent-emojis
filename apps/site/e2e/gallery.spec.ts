import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/emojis/')
  await expect(page.locator('[data-slug]').first()).toBeVisible()
})

test('arrow keys, Home and End move focus across the results', async ({
  page,
}) => {
  const cells = page.locator('[data-slug]')
  await cells.first().focus()
  await page.keyboard.press('ArrowRight')
  await expect(cells.nth(1)).toBeFocused()
  await page.keyboard.press('ArrowLeft')
  await expect(cells.first()).toBeFocused()
  await page.keyboard.press('End')
  await expect(cells.last()).toBeFocused()
  await page.keyboard.press('Home')
  await expect(cells.first()).toBeFocused()
})

test('Enter selects an emoji and shows its detail', async ({ page }) => {
  const cell = page.locator('[data-slug]').nth(1)
  await cell.focus()
  await page.keyboard.press('Enter')
  await expect(cell).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('button', { name: 'Copy id' })).toBeVisible()
})

test('copy buttons write to the clipboard and announce it', async ({
  context,
  page,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.locator('[data-slug]').first().click()
  await page.getByRole('button', { name: 'Copy URL' }).click()
  await expect(
    page.getByRole('status').filter({ hasText: 'Copied' }),
  ).toBeVisible()
  const copied = await page.evaluate<string>('navigator.clipboard.readText()')
  expect(copied).toMatch(/^https:\/\/.+\.gif$/)
})

test('download saves the emoji file under its slug', async ({ page }) => {
  const cell = page.locator('[data-slug]').first()
  const slug = await cell.getAttribute('data-slug')
  await cell.click()
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download PNG' }).click()
  const file = await download
  expect(file.suggestedFilename()).toBe(`${slug ?? ''}.png`)
})
