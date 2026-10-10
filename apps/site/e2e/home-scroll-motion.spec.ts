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
})
