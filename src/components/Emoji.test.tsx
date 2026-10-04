import { expect, test } from 'vitest'
import { render } from 'vitest-browser-react'
import { page, userEvent } from 'vitest/browser'

import { Emoji } from './Emoji.js'

const SPRITE_BASE = 'https://cdn.animated-fluent-emojis.com/sprites'

const getImage = (name: string) => page.getByRole('img', { name })

test('renders the sprite for the given id', async () => {
  await render(<Emoji id="cat" />)

  const image = getImage('Cat')
  await expect
    .element(image)
    .toHaveAttribute('src', `${SPRITE_BASE}/Animals/cat.png`)
  await expect.element(image).toHaveAttribute('draggable', 'false')
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

test('stays paused when autoPlay is false', async () => {
  await render(<Emoji id="cat" autoPlay={false} />)

  await expect
    .element(getImage('Cat'))
    .toHaveStyle({ animationPlayState: 'paused' })
})

test('plays only while hovered with playOnHover', async () => {
  await render(<Emoji id="cat" autoPlay={false} playOnHover />)

  const image = getImage('Cat')
  await expect.element(image).toHaveStyle({ animationPlayState: 'paused' })

  await userEvent.hover(image)
  await expect.element(image).toHaveStyle({ animationPlayState: 'running' })

  await userEvent.unhover(image)
  await expect.element(image).toHaveStyle({ animationPlayState: 'paused' })
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

test('registers the keyframes for the emoji and removes them on unmount', async () => {
  const { unmount } = await render(<Emoji id="cat" size={32} />)

  await expect
    .poll(() =>
      document
        .querySelector('#emoji-style-cat-32')
        ?.textContent.includes('@keyframes emoji-cat-32'),
    )
    .toBe(true)

  await unmount()
  expect(document.querySelector('#emoji-style-cat-32')).toBeNull()
})

test('renders nothing for an unknown id', async () => {
  const { container } = await render(<Emoji id="does-not-exist" />)

  await expect.poll(() => container.getHTML()).toBe('')
})
