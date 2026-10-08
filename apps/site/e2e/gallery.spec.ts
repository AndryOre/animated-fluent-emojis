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

test('size segments switch by role and keep one pressed', async ({ page }) => {
  const size = page.getByRole('group', { name: 'Size' })
  await size.getByRole('button', { name: '96' }).click()
  await expect(size.getByRole('button', { name: '96' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await expect(size.getByRole('button', { name: '64' })).toHaveAttribute(
    'aria-pressed',
    'false',
  )
})

test('categories filter the grid and are pressed by role', async ({ page }) => {
  const categories = page.getByRole('group', { name: 'Category' })
  const all = categories.getByRole('button').first()
  await expect(all).toHaveAttribute('aria-pressed', 'true')
  const second = categories.getByRole('button').nth(1)
  const label = await second.innerText()
  const count = label.trim().split(/\s+/).pop() ?? ''
  await second.click()
  await expect(second).toHaveAttribute('aria-pressed', 'true')
  await expect(all).toHaveAttribute('aria-pressed', 'false')
  await expect(
    page.getByRole('status').filter({ hasText: 'emojis' }),
  ).toHaveText(`${count} emojis`)
  await expect(page).toHaveURL(/[?&]c=/)
})

test('Ctrl+K focuses the search and typing updates the URL', async ({
  page,
}) => {
  const search = page.getByRole('searchbox', { name: 'Search emojis' })
  await page.locator('[data-slug]').first().focus()
  await page.keyboard.press('Control+k')
  await expect(search).toBeFocused()
  await page.keyboard.type('fire')
  await expect(page).toHaveURL(/[?&]q=fire/)
})

test('snippet tabs switch with the arrow keys', async ({ page }) => {
  await page.locator('[data-slug]').first().click()
  await page.getByRole('tab', { name: 'React' }).focus()
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('tab', { name: 'Vue' })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  await expect(page.getByRole('tabpanel')).toBeVisible()
})

test.describe('mobile sheet', () => {
  test.use({ viewport: { width: 390, height: 800 } })

  test('filters sheet traps focus and returns it to the Filters button on Escape', async ({
    page,
  }) => {
    await page.goto('/emojis/')
    const trigger = page.getByRole('button', { name: 'Filters' })
    await trigger.click()
    const dialog = page.getByRole('dialog', { name: 'Filters' })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('group', { name: 'Category' })).toBeVisible()
    for (let press = 0; press < 40; press++) {
      await page.keyboard.press('Tab')
      await expect(dialog.locator(':focus')).toHaveCount(1)
    }
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(trigger).toBeFocused()
  })

  test('traps focus and returns it to the cell on Escape', async ({ page }) => {
    await page.goto('/emojis/')
    const cell = page.locator('[data-slug]').first()
    await cell.click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    for (let press = 0; press < 40; press++) {
      await page.keyboard.press('Tab')
      await expect(dialog.locator(':focus')).toHaveCount(1)
    }
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(cell).toBeFocused()
  })
})
