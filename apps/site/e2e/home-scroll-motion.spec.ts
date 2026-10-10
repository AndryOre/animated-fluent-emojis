/* eslint-disable unicorn/isolated-functions -- the evaluated callback runs in the browser */
import { expect, test, type Locator } from '@playwright/test'

const PILLAR_CARD = '[aria-labelledby="pillars-title"] li.scroll-reveal'
const TEASER_ROW = '.scroll-drift'

interface ScrollAnimationState {
  name: string
  timeline: string
  opacity: string
}

const readAnimationState = (locator: Locator) =>
  locator.evaluate((element): ScrollAnimationState => {
    const style = getComputedStyle(element)
    return {
      name: style.animationName,
      timeline: style.animationTimeline,
      opacity: style.opacity,
    }
  })

const readTranslateX = (locator: Locator) =>
  locator.evaluate((element): number => {
    const { transform } = getComputedStyle(element)
    if (transform === 'none') return 0
    const match = /^matrix\((.+)\)$/.exec(transform)
    if (!match?.[1]) throw new Error(`Unexpected transform: ${transform}`)
    return Number(match[1].split(',', 5)[4])
  })

const TEASER_LINK = '.scroll-drift-scope'

test.describe('with motion allowed', () => {
  test.use({ reducedMotion: 'no-preference' })

  test('a below-fold pillar card reveals on a view timeline', async ({
    page,
  }) => {
    await page.goto('/')
    const card = page.locator(PILLAR_CARD).nth(1)
    await expect(card).toBeAttached()
    const initial = await readAnimationState(card)
    expect(initial.name).toBe('scroll-reveal')
    expect(initial.timeline).toContain('view')

    await card.evaluate((element) => {
      element.scrollIntoView({ block: 'center' })
    })
    await expect
      .poll(() => card.evaluate((element) => getComputedStyle(element).opacity))
      .toBe('1')
  })

  test('the teaser row drifts on a view timeline', async ({ page }) => {
    await page.goto('/')
    const state = await readAnimationState(page.locator(TEASER_ROW))
    expect(state.name).toBe('scroll-drift')
    expect(state.timeline).toContain('view')
  })

  test('the teaser row translates further as the page scrolls', async ({
    page,
  }) => {
    await page.goto('/')
    const row = page.locator(TEASER_ROW)
    await expect(row).toBeAttached()
    const start = await readTranslateX(row)
    expect(start).toBeGreaterThan(-1)

    await page.locator(TEASER_LINK).evaluate((element) => {
      element.scrollIntoView({ block: 'center' })
    })
    await expect.poll(() => readTranslateX(row)).toBeLessThan(start - 5)
    const centred = await readTranslateX(row)

    await page.locator(TEASER_LINK).evaluate((element) => {
      element.scrollIntoView({ block: 'start' })
    })
    await expect.poll(() => readTranslateX(row)).toBeLessThan(centred - 1)
  })

  test('the hero has no scroll animation', async ({ page }) => {
    await page.goto('/')
    const heroAnimationNames = await page
      .locator('main > section:first-child, main > section:first-child *')
      .evaluateAll((elements) =>
        elements.map((element) => getComputedStyle(element).animationName),
      )
    expect(heroAnimationNames.length).toBeGreaterThan(0)
    expect(heroAnimationNames).not.toContain('scroll-reveal')
    expect(heroAnimationNames).not.toContain('scroll-drift')
  })
})

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('the pillar card and teaser row stay static and visible', async ({
    page,
  }) => {
    await page.goto('/')
    const card = await readAnimationState(page.locator(PILLAR_CARD).nth(1))
    expect(card.name).toBe('none')
    expect(card.opacity).toBe('1')

    const row = await readAnimationState(page.locator(TEASER_ROW))
    expect(row.name).toBe('none')
    expect(row.opacity).toBe('1')
  })

  test('the teaser row transform is static while scrolling', async ({
    page,
  }) => {
    await page.goto('/')
    const row = page.locator(TEASER_ROW)
    await page.locator(TEASER_LINK).evaluate((element) => {
      element.scrollIntoView({ block: 'center' })
    })
    expect(await readTranslateX(row)).toBe(0)
  })
})

test.describe('on a 320px viewport', () => {
  test.use({
    reducedMotion: 'no-preference',
    viewport: { width: 320, height: 800 },
  })

  test('the page does not overflow with the teaser mid-drift', async ({
    page,
  }) => {
    await page.goto('/')
    await page.locator(TEASER_LINK).evaluate((element) => {
      element.scrollIntoView({ block: 'center' })
    })
    await expect
      .poll(() => readTranslateX(page.locator(TEASER_ROW)))
      .toBeLessThan(-5)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })
})
/* eslint-enable unicorn/isolated-functions -- end of browser-evaluated code */
