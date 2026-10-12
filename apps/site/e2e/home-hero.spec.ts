import { expect, test } from '@playwright/test'

const MOBILE_WIDTH = 390

test.describe('home hero, stats and marquee', () => {
  test.use({ viewport: { width: MOBILE_WIDTH, height: 800 } })

  test('renders the redesigned sections without horizontal overflow', async ({
    page,
  }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('[data-hero-ready] li')).toHaveCount(5)
    await expect(page.locator('[data-stat]')).toHaveCount(4)
    await expect(page.locator('[data-marquee-row]')).toHaveCount(2)
    const scrollWidth = await page.evaluate(
      'document.documentElement.scrollWidth',
    )
    expect(scrollWidth).toBeLessThanOrEqual(MOBILE_WIDTH)
    const emojiBoxes = await page
      .locator('[data-hero-emojis] > span')
      .evaluateAll((elements) =>
        elements.map((element) => {
          const { left, right, width } = element.getBoundingClientRect()
          const layoutWidth = (element as HTMLElement).offsetWidth
          return { left, right, width, layoutWidth }
        }),
      )
    const visibleBoxes = emojiBoxes.filter((box) => box.width > 0)
    expect(visibleBoxes).toHaveLength(2)
    for (const box of visibleBoxes) {
      expect(box.left).toBeGreaterThanOrEqual(0)
      expect(box.right).toBeLessThanOrEqual(MOBILE_WIDTH)
      expect(box.layoutWidth).toBeLessThanOrEqual(96)
    }
  })

  test('the two marquee rows run in opposite directions', async ({ page }) => {
    await page.goto('/')
    const directions = await page
      .locator('[data-marquee-row] .marquee-track')
      .evaluateAll((tracks) =>
        tracks.map((track) => getComputedStyle(track).animationDirection),
      )
    expect(directions).toEqual(['normal', 'reverse'])
  })
})

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce', viewport: { width: 1280, height: 800 } })

  test('the marquee is a static centered row and the duplicate is hidden', async ({
    page,
  }) => {
    await page.goto('/')
    const tracks = page.locator('[data-marquee-row] .marquee-track')
    await expect(tracks).toHaveCount(2)
    for (const index of [0, 1]) {
      const track = tracks.nth(index)
      expect(
        await track.evaluate(
          (element) => getComputedStyle(element).animationName,
        ),
      ).toBe('none')
      await expect(track.locator('> [aria-hidden="true"]')).toBeHidden()
    }
    const justify = await page
      .locator('[data-marquee-row]')
      .first()
      .evaluate((element) => getComputedStyle(element).justifyContent)
    expect(justify).toBe('center')
  })
})
