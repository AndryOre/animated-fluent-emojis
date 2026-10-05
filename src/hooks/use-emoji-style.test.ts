import { expect, test } from 'vitest'
import { renderHook } from 'vitest-browser-react'

import { useEmojiStyle } from './use-emoji-style.js'

test('resolves the manifest entry for a known id', async () => {
  const { result } = await renderHook(() => useEmojiStyle('cat'))

  await expect.poll(() => result.current.emoji?.id).toBe('cat')
  expect(Object.keys(result.current)).toEqual(['emoji'])
})

test('returns a null emoji for an unknown id', async () => {
  const { result } = await renderHook(() => useEmojiStyle('does-not-exist'))
  const { result: known } = await renderHook(() => useEmojiStyle('cat'))

  await expect.poll(() => known.current.emoji?.id).toBe('cat')
  expect(result.current).toEqual({ emoji: null })
})

test('follows the id when it changes', async () => {
  let currentId = 'cat'
  const { result, rerender } = await renderHook(() => useEmojiStyle(currentId))
  await expect.poll(() => result.current.emoji?.id).toBe('cat')

  currentId = 'grinning-face'
  await rerender()

  await expect.poll(() => result.current.emoji?.id).toBe('grinning-face')
})
