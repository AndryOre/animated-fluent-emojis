import { expect, test } from 'vitest'
import { render } from 'vitest-browser-react'
import { page, userEvent } from 'vitest/browser'

import { Emoji } from './Emoji.js'

const SPRITE_BASE = 'https://animated-fluent-emojis.pages.dev/sprites'

const getTransform = (image: ReturnType<typeof getImage>) =>
  getComputedStyle(image.element()).transform

const expectStill = async (image: ReturnType<typeof getImage>) => {
  const initial = getTransform(image)
  await new Promise((resolve) => {
    setTimeout(resolve, 150)
  })
  expect(getTransform(image)).toBe(initial)
}

const getImage = (name: string) => page.getByRole('img', { name })

test('renders the sprite for the given id', async () => {
  await render(<Emoji id="cat" />)

  const image = getImage('Cat')
  await expect
    .element(image)
    .toHaveAttribute('src', `${SPRITE_BASE}/Animals/cat.png?v=etag-cat`)
  await expect.element(image).toHaveAttribute('draggable', 'false')
})

test('uses the skin tone variant of a diverse emoji', async () => {
  await render(<Emoji id="waving-hand" skinTone="dark" />)

  await expect
    .element(getImage('Waving hand'))
    .toHaveAttribute(
      'src',
      `${SPRITE_BASE}/Smilies/waving-hand_s6.png?v=etag-wave`,
    )
})

test('uses the default sprite for a diverse emoji without a skin tone', async () => {
  await render(<Emoji id="waving-hand" />)

  await expect
    .element(getImage('Waving hand'))
    .toHaveAttribute(
      'src',
      `${SPRITE_BASE}/Smilies/waving-hand.png?v=etag-wave`,
    )
})

test('ignores the skin tone for emojis without variants', async () => {
  await render(<Emoji id="cat" skinTone="light" />)

  await expect
    .element(getImage('Cat'))
    .toHaveAttribute('src', `${SPRITE_BASE}/Animals/cat.png?v=etag-cat`)
})

test('applies the size to the container and the image', async () => {
  await render(<Emoji id="cat" size={48} />)

  const image = getImage('Cat')
  await expect.element(image).toHaveStyle({ width: '48px' })
  const container = image.element().parentElement
  expect(container?.style.width).toBe('48px')
  expect(container?.style.height).toBe('48px')
})

test('defaults to 100px and two iterations', async () => {
  await render(<Emoji id="cat" />)

  const image = getImage('Cat')
  await expect.element(image).toHaveStyle({ width: '100px' })
  expect(image.element().style.animationIterationCount).toBe('2')
})

test('honours animationIterations', async () => {
  await render(<Emoji id="cat" animationIterations={5} />)

  const image = getImage('Cat')
  await expect.element(image).toBeVisible()
  expect(image.element().style.animationIterationCount).toBe('5')
})

test('supports infinite iterations', async () => {
  await render(<Emoji id="cat" animationIterations="infinite" />)

  const image = getImage('Cat')
  await expect.element(image).toBeVisible()
  expect(image.element().style.animationIterationCount).toBe('infinite')
})

test('runs the animation on mount by default', async () => {
  await render(<Emoji id="cat" />)

  await expect
    .element(getImage('Cat'))
    .toHaveStyle({ animationPlayState: 'running' })
})

test('stays still on the poster frame when autoPlay is false', async () => {
  await render(<Emoji id="cat" autoPlay={false} />)

  const image = getImage('Cat')
  await expect
    .element(image)
    .toHaveStyle({ animationPlayState: 'paused', animationName: 'none' })
  await expectStill(image)
})

test('moves the image through its frames after mount', async () => {
  await render(<Emoji id="cat" animationIterations="infinite" />)

  const image = getImage('Cat')
  await expect.element(image).toBeVisible()
  const initial = getTransform(image)
  await expect.poll(() => getTransform(image)).not.toBe(initial)
})

test('keeps animating one instance when another with the same id and size unmounts', async () => {
  const first = await render(
    <Emoji id="cat" size={32} animationIterations="infinite" />,
  )
  const second = await render(
    <Emoji id="cat" size={32} animationIterations="infinite" />,
  )
  await first.unmount()

  const image = getImage('Cat')
  await expect.element(image).toBeVisible()
  const initial = getTransform(image)
  await expect.poll(() => getTransform(image)).not.toBe(initial)
  await second.unmount()
})

test('rests on the poster frame for emojis whose first frame is not 1', async () => {
  await render(<Emoji id="grinning-face" size={80} autoPlay={false} />)

  const image = getImage('Grinning face')
  await expect.element(image).toBeVisible()
  await expect
    .poll(() => new DOMMatrix(getTransform(image)).m42)
    .toBeCloseTo(-2, 5)
})

test('ends on the poster frame after the requested iterations', async () => {
  await render(<Emoji id="grinning-face" size={80} animationIterations={1} />)

  const image = getImage('Grinning face')
  await expect.element(image).toBeVisible()
  await expect
    .poll(() => image.element().getAnimations().length, { timeout: 5000 })
    .toBe(0)
  expect(new DOMMatrix(getTransform(image)).m42).toBeCloseTo(-2, 5)
})

test('replays on hover after the initial run with playOnHover', async () => {
  await render(<Emoji id="cat" size={50} playOnHover animationIterations={1} />)

  const image = getImage('Cat')
  await expect.element(image).toBeVisible()
  await userEvent.unhover(image)
  await expect
    .poll(() => image.element().getAnimations().length, { timeout: 5000 })
    .toBe(0)
  await expectStill(image)

  await userEvent.hover(image)
  await expect.poll(() => image.element().getAnimations().length).toBe(1)
  const initial = getTransform(image)
  await expect.poll(() => getTransform(image)).not.toBe(initial)

  await userEvent.unhover(image)
  await expect.poll(() => image.element().getAnimations().length).toBe(0)
})

test('plays only while hovered with playOnHover and no autoPlay', async () => {
  await render(<Emoji id="cat" autoPlay={false} playOnHover />)

  const image = getImage('Cat')
  await expect.element(image).toBeVisible()
  expect(image.element().getAnimations()).toHaveLength(0)

  await userEvent.hover(image)
  await expect.poll(() => image.element().getAnimations().length).toBe(1)

  await userEvent.unhover(image)
  await expect.poll(() => image.element().getAnimations().length).toBe(0)
})

test('switches to hover-only playback after the requested iterations', async () => {
  await render(<Emoji id="cat" playOnHover animationIterations={2} />)

  const image = getImage('Cat')
  await expect.element(image).toBeVisible()
  const container = image.element().parentElement
  expect(container?.className).not.toContain('animateOnHover')

  image.element().dispatchEvent(new Event('animationiteration'))
  expect(container?.className).not.toContain('animateOnHover')
  image.element().dispatchEvent(new Event('animationiteration'))

  await expect.poll(() => container?.className).toContain('animateOnHover')
  await expect
    .element(image)
    .toHaveStyle({ animationIterationCount: 'infinite' })
})

test('switches to hover-only playback when the animation ends', async () => {
  await render(<Emoji id="cat" playOnHover animationIterations={1} />)

  const image = getImage('Cat')
  await expect.element(image).toBeVisible()
  image.element().dispatchEvent(new Event('animationend'))

  await expect
    .poll(() => image.element().parentElement?.className)
    .toContain('animateOnHover')
})

test('offers the HD sprite sheet through srcset for hd emojis', async () => {
  await render(<Emoji id="waving-hand" skinTone="dark" />)

  await expect
    .element(getImage('Waving hand'))
    .toHaveAttribute(
      'srcset',
      `${SPRITE_BASE}/Smilies/waving-hand_s6.png?v=etag-wave 1x, ${SPRITE_BASE}/Smilies/waving-hand_s6@2x.png?v=etag-wave 2x`,
    )
})

test('sets no srcset for emojis without an hd sheet', async () => {
  await render(<Emoji id="cat" />)

  const image = getImage('Cat')
  await expect.element(image).toBeVisible()
  expect(image.element().hasAttribute('srcset')).toBe(false)
})

test('renders nothing for an unknown id', async () => {
  const { container } = await render(<Emoji id="does-not-exist" />)
  const { loadEmojiManifest } = await import('../utils/index.js')
  await loadEmojiManifest()

  await new Promise((resolve) => {
    setTimeout(resolve, 50)
  })
  expect(container.getHTML()).toBe('')
})
