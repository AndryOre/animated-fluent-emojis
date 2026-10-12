/* eslint-disable unicorn/isolated-functions -- the evaluated callbacks run in the browser */
import { expect, test, type Page } from '@playwright/test'

const INSTALL = '[aria-labelledby="install-title"]'
const PHONE_WIDTH = 343

async function openInstall(page: Page) {
  await page.goto('/')
  const section = page.locator(INSTALL)
  await section.scrollIntoViewIfNeeded()
  const island = section.locator('astro-island[component-url*="InstallCard"]')
  await expect(island).not.toHaveAttribute('ssr', /.*/)
  return section
}

test.describe('install card', () => {
  test.use({
    viewport: { width: 1280, height: 900 },
    permissions: ['clipboard-read', 'clipboard-write'],
  })

  test('the tabs are 32px tall and switching one swaps code and preview', async ({
    page,
  }) => {
    const section = await openInstall(page)
    const tabs = section.getByRole('tab')
    await expect(tabs).toHaveText(['React', 'Vue', 'Svelte', 'Astro', 'HTML'])
    const box = await tabs.first().boundingBox()
    expect(box?.height).toBe(32)

    const preview = section.getByTestId('install-preview')
    const readSize = () =>
      preview.evaluate((element) => [
        (element as HTMLElement).offsetWidth,
        (element as HTMLElement).offsetHeight,
      ])
    const before = await readSize()
    await expect(section.locator('[data-preview-id="react"]')).toHaveAttribute(
      'data-active',
      'true',
    )

    await section.getByRole('tab', { name: 'Vue' }).click()

    await expect(section.getByRole('tab', { name: 'Vue' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(section.locator('[data-preview-id="vue"]')).toHaveAttribute(
      'data-active',
      'true',
    )
    await expect(
      section.getByRole('tabpanel').filter({ hasText: '<script setup' }),
    ).toBeVisible()
    const after = await readSize()
    expect(after).toEqual(before)
  })

  test('copying writes the active snippet, morphs the icon and bursts', async ({
    page,
  }) => {
    const section = await openInstall(page)
    await section.getByRole('tab', { name: 'Svelte' }).click()
    await section.getByRole('button', { name: 'Copy code' }).click()

    await expect(section.getByRole('button', { name: 'Copied' })).toBeVisible()
    await expect(section.locator('[data-copy-burst]')).toBeAttached()
    const copied = await page.evaluate(() => navigator.clipboard.readText())
    expect(copied).toContain('animated-fluent-emojis/svelte')
  })

  test('the steps sit in three columns and the shortcode demo is present', async ({
    page,
  }) => {
    const section = await openInstall(page)
    const steps = section.locator('[data-install-steps] > li')
    await expect(steps).toHaveCount(3)
    const tops = await steps.evaluateAll((items) =>
      items.map((item) => Math.round(item.getBoundingClientRect().top)),
    )
    expect(new Set(tops).size).toBe(1)
    await expect(section.locator('[data-shortcode-demo]')).toContainText(
      ':launch:',
    )
    await expect(section.locator('[data-install-architecture]')).toContainText(
      'core',
    )
  })
})

test.describe('narrow viewports', () => {
  test('the steps stack under 860px', async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 900 })
    const section = await openInstall(page)
    const lefts = await section
      .locator('[data-install-steps] > li')
      .evaluateAll((items) =>
        items.map((item) => (item as HTMLElement).offsetLeft),
      )
    expect(new Set(lefts).size).toBe(1)
  })

  test('the code scrolls inside its block and the page does not overflow', async ({
    page,
  }) => {
    await page.setViewportSize({ width: PHONE_WIDTH, height: 800 })
    await openInstall(page)
    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    )
    expect(scrollWidth).toBeLessThanOrEqual(PHONE_WIDTH)
  })
})

test.describe('reduced motion', () => {
  test.use({
    reducedMotion: 'reduce',
    viewport: { width: 1280, height: 900 },
    permissions: ['clipboard-read', 'clipboard-write'],
  })

  test('the shortcode demo rests on :launch: and copying shows no burst', async ({
    page,
  }) => {
    const section = await openInstall(page)
    const opacities = await section
      .locator('[data-shortcode-demo] > span')
      .evaluateAll((items) =>
        items.map((item) => getComputedStyle(item).opacity),
      )
    expect(opacities).toEqual(['0', '0', '1'])

    await section.getByRole('button', { name: 'Copy code' }).click()
    await expect(section.getByRole('button', { name: 'Copied' })).toBeVisible()
    await expect(section.locator('[data-copy-burst]')).toHaveCount(0)
  })
})
/* eslint-enable unicorn/isolated-functions -- end of browser-evaluated code */
