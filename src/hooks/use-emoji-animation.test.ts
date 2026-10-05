import { expect, test } from 'vitest'
import { renderHook } from 'vitest-browser-react'

import { FIXTURE_MANIFEST } from '../test/manifest-fixture.js'
import type { EmojiManifest } from '../utils/index.js'
import { useEmojiAnimation } from './use-emoji-animation.js'

const [firstCategory] = FIXTURE_MANIFEST.categories
const [firstEmoticon] = firstCategory?.emoticons ?? []
if (!firstEmoticon) throw new Error('Fixture manifest is empty')

const emoji: EmojiManifest = { ...firstEmoticon, category: 'Smilies' }

test('returns an empty style while the emoji is not loaded', async () => {
  const { result } = await renderHook(() =>
    useEmojiAnimation(null, false, 2, true, 64),
  )

  expect(result.current.animationStyle).toEqual({})
})

test('derives timing and a percentage poster offset from the manifest entry', async () => {
  const { result } = await renderHook(() =>
    useEmojiAnimation(emoji, false, 3, true, 64),
  )

  expect(result.current.animationStyle).toMatchObject({
    width: 64,
    animationDuration: '2s',
    animationTimingFunction: 'steps(40)',
    animationIterationCount: 3,
    animationPlayState: 'running',
    transform: 'translateY(-2.5%)',
  })
  expect(result.current.animationStyle.animationName).toBeUndefined()
})

test('disables the animation when autoPlay is off', async () => {
  const { result } = await renderHook(() =>
    useEmojiAnimation(emoji, false, 2, false, 64),
  )

  expect(result.current.isInitialAnimationComplete).toBe(true)
  expect(result.current.animationStyle).toMatchObject({
    animationName: 'none',
    animationPlayState: 'paused',
  })
})

test('loops forever once the initial animation is skipped for hover playback', async () => {
  const { result } = await renderHook(() =>
    useEmojiAnimation(emoji, true, 2, false, 64),
  )

  expect(result.current.animationStyle).toMatchObject({
    animationIterationCount: 'infinite',
    animationPlayState: 'running',
  })
  expect(result.current.animationStyle.animationName).toBeUndefined()
})
