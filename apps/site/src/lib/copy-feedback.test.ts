import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { COPIED_MS, copyWithFeedback } from './copy-feedback'

const writeText = vi.fn()

beforeEach(() => {
  vi.useFakeTimers()
  writeText.mockReset()
  vi.stubGlobal('navigator', { clipboard: { writeText } })
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

test('copyWithFeedback copies the text, shows copied and resets after COPIED_MS', async () => {
  writeText.mockResolvedValue(undefined)
  const showCopied = vi.fn()
  await copyWithFeedback('hello', showCopied)
  expect(writeText).toHaveBeenCalledWith('hello')
  expect(showCopied).toHaveBeenCalledExactlyOnceWith(true)
  vi.advanceTimersByTime(COPIED_MS - 1)
  expect(showCopied).toHaveBeenCalledTimes(1)
  vi.advanceTimersByTime(1)
  expect(showCopied).toHaveBeenLastCalledWith(false)
})

test('copyWithFeedback does nothing when the clipboard write is rejected', async () => {
  writeText.mockRejectedValue(new Error('denied'))
  const showCopied = vi.fn()
  await copyWithFeedback('hello', showCopied)
  vi.advanceTimersByTime(COPIED_MS)
  expect(showCopied).not.toHaveBeenCalled()
})
