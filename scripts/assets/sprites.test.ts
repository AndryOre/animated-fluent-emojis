import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import sharp from 'sharp'
import { expect, test } from 'vitest'

import { convertAnimatedPng, parseFrameRate } from './sprites.js'

const hasFfmpeg =
  spawnSync('ffmpeg', ['-version']).status === 0 &&
  spawnSync('ffprobe', ['-version']).status === 0

test('parseFrameRate rounds ffprobe ratios', () => {
  expect(parseFrameRate('143/6')).toBe(24)
  expect(parseFrameRate('10/1')).toBe(10)
})

test('parseFrameRate rejects invalid ratios', () => {
  expect(() => parseFrameRate('0/0')).toThrow('Invalid frame rate')
  expect(() => parseFrameRate('abc')).toThrow('Invalid frame rate')
})

test.skipIf(!hasFfmpeg)(
  'convertAnimatedPng stacks every frame into a 100px wide sprite',
  async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'sprite-test-'))
    try {
      const apngPath = path.join(directory, 'input.png')
      execFileSync('ffmpeg', [
        '-v',
        'error',
        '-f',
        'lavfi',
        '-i',
        'testsrc=size=64x64:rate=10:duration=0.5',
        '-plays',
        '0',
        '-f',
        'apng',
        apngPath,
      ])

      const sprite = await convertAnimatedPng(await readFile(apngPath))

      expect(sprite.framesCount).toBe(5)
      expect(sprite.fps).toBe(10)
      const metadata = await sharp(sprite.png).metadata()
      expect(metadata.width).toBe(100)
      expect(metadata.height).toBe(500)
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  },
)
