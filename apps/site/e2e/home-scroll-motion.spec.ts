/* eslint-disable unicorn/isolated-functions -- the evaluated callback runs in the browser */
import { expect, test, type Locator } from '@playwright/test'

const PILLAR_CARD = '[aria-labelledby="pillars-title"] li.scroll-reveal'
const HERO_HEADING = 'main > section:first-child h1'
const HERO_ENTER = 'main > section:first-child .hero-enter'
const HERO_DEMO_ENTER = 'main > section:first-child .hero-demo-enter'

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

const readTranslateY = (locator: Locator) =>
  locator.evaluate((element): number => {
    const { transform } = getComputedStyle(element)
    if (transform === 'none') return 0
    const match = /^matrix\((.+)\)$/.exec(transform)
    if (!match?.[1]) throw new Error(`Unexpected transform: ${transform}`)
    return Number(match[1].split(',', 6)[5])
  })

const readOpacity = (locator: Locator) =>
  locator.evaluate((element) => Number(getComputedStyle(element).opacity))

const PILLAR_INDICES = [0, 1, 2, 3]
const BENTO_CURSOR = `${PILLAR_CARD} .bento-cursor`
const BENTO_STAGE = `${PILLAR_CARD} .bento-stage`
const BENTO_SWITCH_THUMB = `${PILLAR_CARD} .bento-switch-thumb`

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

  for (const index of PILLAR_INDICES) {
    test(`pillar card ${String(index)} is clearly moving low in the viewport and settled when centred`, async ({
      page,
    }) => {
      await page.goto('/')
      const card = page.locator(PILLAR_CARD).nth(index)
      await expect(card).toBeAttached()

      await page.waitForLoadState('load')
      await card.evaluate(async (element) => {
        for (let attempt = 0; attempt < 5; attempt += 1) {
          const { top } = element.getBoundingClientRect()
          window.scrollBy(0, top - window.innerHeight * 0.85)
          await new Promise((resolve) => requestAnimationFrame(resolve))
        }
      })
      await expect.poll(() => readOpacity(card)).toBeLessThan(1)
      await expect.poll(() => readTranslateY(card)).toBeGreaterThan(24)

      await card.evaluate((element) => {
        element.scrollIntoView({ block: 'center' })
      })
      await expect.poll(() => readOpacity(card)).toBe(1)
      await expect
        .poll(() =>
          card.evaluate((element) => getComputedStyle(element).transform),
        )
        .toMatch(/^(none|matrix\(1, 0, 0, 1, 0, 0\))$/)
    })
  }

  test('every reveal is settled once the page is scrolled to the end', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForLoadState('load')
    await page.evaluate(() => {
      window.scrollTo(0, document.documentElement.scrollHeight)
    })
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            [...document.querySelectorAll('.scroll-reveal')].filter(
              (element) => {
                const style = getComputedStyle(element)
                const matrix = new DOMMatrix(style.transform)
                return style.opacity !== '1' || !matrix.isIdentity
              },
            ).length,
        ),
      )
      .toBe(0)
  })

  test('the bento cursors loop and every stage keeps a fixed height', async ({
    page,
  }) => {
    await page.goto('/')
    const cursors = page.locator(BENTO_CURSOR)
    await expect(cursors).toHaveCount(2)
    const names = await cursors.evaluateAll((elements) =>
      elements.map((element) => getComputedStyle(element).animationName),
    )
    expect(names).toEqual(['fake-cursor-loop', 'fake-cursor-loop'])

    const heights = await page
      .locator(BENTO_STAGE)
      .evaluateAll((elements) =>
        elements.map((element) => (element as HTMLElement).offsetHeight),
      )
    expect(heights[0]).toBeGreaterThanOrEqual(168)
    expect(heights.slice(1)).toEqual([168, 168, 168])
  })

  test('the considerate switch moves while the cursor loops', async ({
    page,
  }) => {
    await page.goto('/')
    const thumb = page.locator(BENTO_SWITCH_THUMB)
    await expect(thumb).toBeAttached()
    const name = await thumb.evaluate(
      (element) => getComputedStyle(element).animationName,
    )
    expect(name).toBe('bento-switch-thumb')
  })

  test('the pillar spotlight variables follow the mouse', async ({ page }) => {
    await page.goto('/')
    const card = page.locator(PILLAR_CARD).nth(1)
    await card.evaluate((element) => {
      element.scrollIntoView({ block: 'center' })
    })
    await expect.poll(() => readOpacity(card)).toBe(1)
    const box = await card.boundingBox()
    if (!box) throw new Error('Pillar card has no box')
    const readSpotlight = () =>
      card.evaluate((element) =>
        element.style.getPropertyValue('--spotlight-x'),
      )

    await page.mouse.move(box.x + 20, box.y + 20)
    await page.mouse.move(box.x + 30, box.y + 20)
    await expect.poll(readSpotlight).toBe('30px')
    await page.mouse.move(box.x + 60, box.y + 40)
    await expect.poll(readSpotlight).toBe('60px')
  })

  test('the hero secondary content settles in without touching the h1', async ({
    page,
  }) => {
    await page.goto('/')
    const heading = page.locator(HERO_HEADING)
    const entering = page.locator(HERO_ENTER)
    await expect(entering).toHaveCount(4)
    const headingTransition = await heading.evaluate((element) => {
      const style = getComputedStyle(element)
      return {
        duration: style.transitionDuration,
        animation: style.animationName,
      }
    })
    expect(headingTransition).toEqual({ duration: '0s', animation: 'none' })

    for (const index of [0, 1, 2, 3]) {
      const element = entering.nth(index)
      await expect.poll(() => readOpacity(element)).toBe(1)
      await expect.poll(() => readTranslateY(element)).toBe(0)
    }
    const stagger = await entering.evaluateAll((elements) =>
      elements.map((element) => getComputedStyle(element).transitionDelay),
    )
    expect(stagger).toEqual(['0s', '0.12s', '0.24s', '0.36s'])
  })

  test('the hero demo only moves and never drops below full opacity', async ({
    page,
  }) => {
    await page.goto('/')
    const demo = page.locator(HERO_DEMO_ENTER)
    await expect(demo).toBeAttached()
    const transition = await demo.evaluate(
      (element) => getComputedStyle(element).transitionProperty,
    )
    expect(transition).toBe('transform')
    await expect.poll(() => readOpacity(demo)).toBe(1)
    await expect
      .poll(() =>
        demo.evaluate((element) => getComputedStyle(element).transform),
      )
      .toMatch(/^(none|matrix\(1, 0, 0, 1, 0, 0\))$/)
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

  test('the pillar card stays static and visible', async ({ page }) => {
    await page.goto('/')
    const card = await readAnimationState(page.locator(PILLAR_CARD).nth(1))
    expect(card.name).toBe('none')
    expect(card.opacity).toBe('1')
  })

  test('the bento shows no cursor and rests on the switch on', async ({
    page,
  }) => {
    await page.goto('/')
    const cursorDisplays = await page
      .locator(BENTO_CURSOR)
      .evaluateAll((elements) =>
        elements.map((element) => getComputedStyle(element).display),
      )
    expect(cursorDisplays).toEqual(['none', 'none'])

    const thumb = page.locator(BENTO_SWITCH_THUMB)
    const resting = await thumb.evaluate((element) => {
      const style = getComputedStyle(element)
      return { name: style.animationName, translate: style.translate }
    })
    expect(resting.name).toBe('none')
    expect(resting.translate).toBe('18px')

    const playing = await page
      .locator(
        `${PILLAR_CARD} .bento-play-first, ${PILLAR_CARD} .bento-play-second, ${PILLAR_CARD} .bento-motion-on`,
      )
      .evaluateAll((elements) =>
        elements.map((element) => {
          const style = getComputedStyle(element)
          return { name: style.animationName, opacity: style.opacity }
        }),
      )
    expect(playing).toHaveLength(3)
    for (const state of playing) {
      expect(state.name).toBe('none')
      expect(state.opacity).toBe('0')
    }
  })

  test('the hero is static and fully visible', async ({ page }) => {
    await page.goto('/')
    const states = await page
      .locator(`${HERO_ENTER}, ${HERO_DEMO_ENTER}`)
      .evaluateAll((elements) =>
        elements.map((element) => {
          const style = getComputedStyle(element)
          return {
            opacity: style.opacity,
            transition: style.transitionDuration,
            transform: style.transform,
          }
        }),
      )
    expect(states).toHaveLength(5)
    for (const state of states) {
      expect(state.opacity).toBe('1')
      expect(state.transition).toBe('0s')
      expect(state.transform).toBe('none')
    }
  })
})
/* eslint-enable unicorn/isolated-functions -- end of browser-evaluated code */
