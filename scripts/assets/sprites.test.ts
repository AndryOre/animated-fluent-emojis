import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import sharp from 'sharp'
import { expect, test } from 'vitest'

import {
  convertAnimatedPng,
  parseFrameRate,
  resolveFrameRate,
} from './sprites.js'

const hasFfmpeg =
  spawnSync('ffmpeg', ['-version']).status === 0 &&
  spawnSync('ffprobe', ['-version']).status === 0

test('parseFrameRate keeps the exact fractional rate', () => {
  expect(parseFrameRate('143/6')).toBeCloseTo(23.8333, 4)
  expect(parseFrameRate('10/1')).toBe(10)
})

test('parseFrameRate rejects invalid ratios', () => {
  expect(() => parseFrameRate('0/0')).toThrow('Invalid frame rate')
  expect(() => parseFrameRate('abc')).toThrow('Invalid frame rate')
})

test('resolveFrameRate keeps fractional rates and ignores non-positive ones', () => {
  expect(resolveFrameRate('143/6', '30/1')).toBeCloseTo(23.8333, 4)
  expect(resolveFrameRate('0/1', '30/1')).toBe(30)
})

test('resolveFrameRate prefers the average rate', () => {
  expect(resolveFrameRate('10/1', '30/1')).toBe(10)
})

test('resolveFrameRate falls back to the base rate on 0/0', () => {
  expect(resolveFrameRate('0/0', '30/1')).toBe(30)
  expect(resolveFrameRate(undefined, '12/1')).toBe(12)
})

test('resolveFrameRate falls back to 24 when no rate is usable', () => {
  expect(resolveFrameRate('0/0', '0/0')).toBe(24)
  expect(resolveFrameRate(undefined, undefined)).toBe(24)
  expect(resolveFrameRate('abc', '')).toBe(24)
})

async function convertTestAnimation(frameSize?: number) {
  const directory = await mkdtemp(path.join(tmpdir(), 'sprite-test-'))
  try {
    const apngPath = path.join(directory, 'input.png')
    execFileSync('ffmpeg', [
      '-v',
      'error',
      '-f',
      'lavfi',
      '-i',
      'testsrc=size=256x256:rate=10:duration=0.5',
      '-plays',
      '0',
      '-f',
      'apng',
      apngPath,
    ])
    const sprite = await convertAnimatedPng(await readFile(apngPath), frameSize)
    return { sprite, metadata: await sharp(sprite.png).metadata() }
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}

test.skipIf(!hasFfmpeg)(
  'convertAnimatedPng stacks every frame into a 100px wide sprite',
  async () => {
    const { sprite, metadata } = await convertTestAnimation()

    expect(sprite.framesCount).toBe(5)
    expect(sprite.fps).toBe(10)
    expect(metadata.width).toBe(100)
    expect(metadata.height).toBe(500)
  },
)

test.skipIf(!hasFfmpeg)(
  'convertAnimatedPng at frame size 200 builds a 200px wide HD sprite',
  async () => {
    const { sprite, metadata } = await convertTestAnimation(200)

    expect(sprite.framesCount).toBe(5)
    expect(metadata.width).toBe(200)
    expect(metadata.height).toBe(1000)
  },
)

test('convertAnimatedPng rejects an invalid frame size', async () => {
  await expect(convertAnimatedPng(Buffer.alloc(0), 0)).rejects.toThrow(
    'Invalid sprite frame size',
  )
})
