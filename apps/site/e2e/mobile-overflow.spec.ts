/* eslint-disable unicorn/isolated-functions -- the evaluated callback runs in the browser */
import { expect, test } from '@playwright/test'

import { docRoute } from '../src/docs/published'
import { localePath, LOCALES } from '../src/i18n/locales'

const VIEWPORT_WIDTHS = [320, 375] as const

const OVERFLOW_TOLERANCE_PX = 1

/**
 * One page per kind, in every locale: landing, gallery, an emoji page and a
 * docs page.
 */
const OVERFLOW_PATHS = LOCALES.flatMap((locale) => [
  localePath(locale),
  localePath(locale, '/emojis/'),
  localePath(locale, '/emojis/fire/'),
  docRoute(locale, 'usage.md'),
])

for (const width of VIEWPORT_WIDTHS) {
  test.describe(`${String(width)}px viewport`, () => {
    test.use({ viewport: { width, height: 800 } })

    for (const path of OVERFLOW_PATHS) {
      test(`${path} does not overflow horizontally`, async ({ page }) => {
        const response = await page.goto(path)
        expect(response?.status()).toBe(200)
        await expect(page.locator('h1').first()).toBeVisible()

        const metrics = await page.evaluate((tolerance) => {
          const root = document.documentElement
          const viewportWidth = root.clientWidth
          const isOffender = (element: Element): boolean => {
            if (element.closest('svg, [hidden]')) return false
            if (
              element.closest('details:not([open])') &&
              !element.closest('summary')
            ) {
              return false
            }
            for (
              let ancestor = element.parentElement;
              ancestor && ancestor !== document.body;
              ancestor = ancestor.parentElement
            ) {
              if (getComputedStyle(ancestor).overflowX !== 'visible') {
                return false
              }
            }
            const rect = element.getBoundingClientRect()
            const isEmpty = rect.width === 0 || rect.height === 0
            const isFixed = getComputedStyle(element).position === 'fixed'
            return (
              !isEmpty &&
              !isFixed &&
              (rect.right > viewportWidth + tolerance || rect.left < -tolerance)
            )
          }
          const offenders = [...document.body.querySelectorAll('*')]
            .filter((element) => isOffender(element))
            .slice(0, 10)
            .map((element) => {
              const rect = element.getBoundingClientRect()
              const span = `${String(Math.round(rect.left))}..${String(Math.round(rect.right))}`
              return `${element.tagName.toLowerCase()}.${element.className} [${span}]`
            })
          return {
            scrollWidth: root.scrollWidth,
            clientWidth: viewportWidth,
            offenders,
          }
        }, OVERFLOW_TOLERANCE_PX)

        expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth)
        expect(metrics.offenders).toEqual([])
      })

      test(`${path} header menus stay inside the viewport`, async ({
        page,
      }) => {
        await page.goto(path)
        const menus = page.locator('header details[data-menu]')
        const menuCount = await menus.count()
        for (let index = 0; index < menuCount; index += 1) {
          const menu = menus.nth(index)
          const summary = menu.locator('summary')
          if (!(await summary.isVisible())) continue
          await summary.click()
          const box = await menu
            .locator('> :not(summary)')
            .first()
            .boundingBox()
          const left = box?.x ?? -Infinity
          const right = left + (box?.width ?? Infinity)
          expect(left).toBeGreaterThanOrEqual(-OVERFLOW_TOLERANCE_PX)
          expect(right).toBeLessThanOrEqual(width + OVERFLOW_TOLERANCE_PX)
          await summary.click()
        }
      })
    }
  })
}

/* eslint-enable unicorn/isolated-functions -- end of browser-evaluated code */
