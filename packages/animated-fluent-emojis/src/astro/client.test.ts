import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test,
  vi,
} from 'vitest'

import type {
  ConformanceDriver,
  ConformanceOptions,
} from '../test/conformance/driver.js'
import { defineConformanceSuite } from '../test/conformance/suite.js'
import { hydrateEmojis } from './client.js'
import componentStyles from './emoji.css?inline'
import { ROOT_ATTRIBUTE, ROOT_SELECTOR } from './markup.js'
import { renderEmojiHtml } from './server.js'

const stylesheet = document.createElement('style')
stylesheet.textContent = componentStyles

beforeAll(() => {
  document.head.append(stylesheet)
})

afterAll(() => {
  stylesheet.remove()
})

const renderOptions = async (options: ConformanceOptions): Promise<string> =>
  renderEmojiHtml(
    {
      id: options.id,
      size: options.size,
      animationIterations: options.animationIterations,
      autoPlay: options.autoPlay,
      playing: options.playing,
      alt: options.alt,
    },
    '',
  )

defineConformanceSuite(
  'astro',
  (): ConformanceDriver => {
    let host: HTMLElement | undefined
    let stop: (() => void) | undefined
    const listen = (type: string, callback: (() => void) | undefined): void => {
      if (!callback) return
      host?.addEventListener(type, callback)
    }
    return {
      mount: async (container, options) => {
        host = container
        container.innerHTML = await renderOptions(options)
        listen('playback-end', options.onPlaybackEnd)
        listen('emoji-error', options.onError)
        stop = hydrateEmojis(container)
      },
      update: async (options) => {
        const template = document.createElement('div')
        template.innerHTML = await renderOptions(options)
        const next = template
          .querySelector(ROOT_SELECTOR)
          ?.getAttribute(ROOT_ATTRIBUTE)
        if (next) {
          host?.querySelector(ROOT_SELECTOR)?.setAttribute(ROOT_ATTRIBUTE, next)
        }
      },
      unmount: () => {
        stop?.()
        host?.replaceChildren()
      },
    }
  },
  [
    'shows a sized, hidden placeholder, then the ready image',
    'a manifest error reports onError once and renders nothing',
  ],
)

describe('astro client script', () => {
  const containers: HTMLElement[] = []

  afterEach(() => {
    for (const container of containers) container.remove()
    containers.length = 0
    vi.restoreAllMocks()
  })

  const mountHtml = async (
    props: Parameters<typeof renderEmojiHtml>[0],
    fallbackHtml = '',
  ): Promise<HTMLElement> => {
    const container = document.createElement('div')
    document.body.append(container)
    containers.push(container)
    container.innerHTML = await renderEmojiHtml(props, fallbackHtml)
    return container
  }

  test('a failed image swaps in the slotted fallback', async () => {
    const container = await mountHtml({ id: 'cat' }, '<b class="slotted">?</b>')
    const stop = hydrateEmojis(container)

    container.querySelector('img')?.dispatchEvent(new Event('error'))

    await expect.poll(() => container.querySelector('.slotted')).not.toBeNull()
    expect(container.querySelector('img')).toBeNull()
    stop()
  })

  test('an unparsable config attribute is ignored without hydrating', async () => {
    const container = await mountHtml({ id: 'cat' }, '<b class="slotted">?</b>')
    container
      .querySelector(ROOT_SELECTOR)
      ?.setAttribute(ROOT_ATTRIBUTE, '{not valid json')
    const onError = vi.fn()
    container.addEventListener('emoji-error', onError)

    const stop = hydrateEmojis(container)
    container.querySelector('img')?.dispatchEvent(new Event('error'))

    expect(onError).not.toHaveBeenCalled()
    expect(container.querySelector('img')).not.toBeNull()
    expect(container.querySelector('.slotted')).toBeNull()
    expect(() => {
      stop()
    }).not.toThrow()
  })

  test('astro:page-load hydrates roots added after the first hydration', async () => {
    const container = await mountHtml({ id: 'cat' }, '<b class="slotted">?</b>')

    document.dispatchEvent(new Event('astro:page-load'))
    container.querySelector('img')?.dispatchEvent(new Event('error'))

    await expect.poll(() => container.querySelector('.slotted')).not.toBeNull()
    expect(container.querySelector('img')).toBeNull()
  })

  test('hydrating twice does not duplicate listeners', async () => {
    const container = await mountHtml({
      id: 'waving-hand',
      animationIterations: 1,
    })
    const onEnd = vi.fn()
    container.addEventListener('playback-end', onEnd)
    const stopFirst = hydrateEmojis(container)
    const stopSecond = hydrateEmojis(container)

    await expect.poll(() => onEnd.mock.calls.length, { timeout: 5000 }).toBe(1)
    stopFirst()
    stopSecond()
  })

  test('play on hover keeps the hover class once the first run is over', async () => {
    const container = await mountHtml({
      id: 'cat',
      playOnHover: true,
      autoPlay: false,
    })
    const stop = hydrateEmojis(container)

    await expect
      .poll(() =>
        container
          .querySelector('[data-fluent-emoji]')
          ?.classList.contains('afe-hover'),
      )
      .toBe(true)
    stop()
  })
})
