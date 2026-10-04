import { expect, test, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'

import { useEmojiStyle } from './use-emoji-style.js'

test('resolves the manifest entry and category folder for a known id', async () => {
  const { result } = await renderHook(() => useEmojiStyle('cat'))

  await expect.poll(() => result.current.emoji?.id).toBe('cat')
  expect(result.current.categoryFolder).toBe('Animals')
})

test('returns a null emoji and empty folder for an unknown id', async () => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {
    return
  })
  const { result } = await renderHook(() => useEmojiStyle('does-not-exist'))

  await expect.poll(() => consoleError.mock.calls.length).toBeGreaterThan(0)
  expect(result.current).toEqual({ emoji: null, categoryFolder: '' })
  consoleError.mockRestore()
})

test('follows the id when it changes', async () => {
  let currentId = 'cat'
  const { result, rerender } = await renderHook(() => useEmojiStyle(currentId))
  await expect.poll(() => result.current.emoji?.id).toBe('cat')

  currentId = 'grinning-face'
  await rerender()

  await expect.poll(() => result.current.emoji?.id).toBe('grinning-face')
  expect(result.current.categoryFolder).toBe('Smilies')
})
