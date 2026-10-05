import { execFile } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import sharp from 'sharp'

const execFileAsync = promisify(execFile)

/**
 * The frame size, in pixels, of the standard sprite sheets.
 */
const SPRITE_SIZE = 100

/**
 * A sprite sheet and the animation data derived from it.
 */
export interface ConvertedSprite {
  readonly png: Buffer
  readonly framesCount: number
  readonly fps: number
}

/**
 * The frame rate used when ffprobe reports no usable rate.
 */
const DEFAULT_FRAME_RATE = 24

function tryParseFrameRate(rate: string | undefined): number | undefined {
  if (rate === undefined) return undefined
  const [numerator, denominator] = rate.split('/').map(Number)
  if (numerator === undefined || denominator === undefined) return undefined
  const frameRate = numerator / denominator
  return Number.isFinite(frameRate) && frameRate > 0 ? frameRate : undefined
}

/**
 * Parses an ffprobe frame rate such as `143/6` into frames per second.
 * @param rate The ratio string reported by ffprobe.
 * @returns The exact, possibly fractional, frames per second.
 */
export function parseFrameRate(rate: string): number {
  const parsed = tryParseFrameRate(rate)
  if (parsed === undefined) throw new Error(`Invalid frame rate "${rate}"`)
  return parsed
}

/**
 * Picks the frame rate from ffprobe's reported rates, preferring the average
 * rate, then the base rate, then 24 fps.
 * @param averageRate The `avg_frame_rate` value, possibly `0/0`.
 * @param baseRate The `r_frame_rate` value, possibly missing or `0/0`.
 * @returns The exact, possibly fractional, frames per second, never throwing.
 */
export function resolveFrameRate(
  averageRate: string | undefined,
  baseRate: string | undefined,
): number {
  return (
    tryParseFrameRate(averageRate) ??
    tryParseFrameRate(baseRate) ??
    DEFAULT_FRAME_RATE
  )
}

/**
 * Converts an animated PNG into a vertical sprite sheet, the layout the
 * `Emoji` component steps through.
 * @param animatedPng The bytes of the animated PNG.
 * @param frameSize The width and height of each frame in pixels, 100 by
 * default; 200 builds the `@2x` sheet.
 * @returns The palette-optimized sprite sheet and its frame count and fps.
 */
export async function convertAnimatedPng(
  animatedPng: Buffer,
  frameSize: number = SPRITE_SIZE,
): Promise<ConvertedSprite> {
  if (!Number.isSafeInteger(frameSize) || frameSize < 1) {
    throw new Error(`Invalid sprite frame size ${String(frameSize)}`)
  }
  const workingDirectory = await mkdtemp(path.join(tmpdir(), 'emoji-sprite-'))
  try {
    const inputPath = path.join(workingDirectory, 'input.png')
    const outputPath = path.join(workingDirectory, 'sprite.png')
    await writeFile(inputPath, animatedPng)

    const probe = await execFileAsync('ffprobe', [
      '-v',
      'error',
      '-count_frames',
      '-select_streams',
      'v:0',
      '-show_entries',
      'stream=nb_read_frames,avg_frame_rate,r_frame_rate',
      '-of',
      'json',
      inputPath,
    ])
    const stream = (
      JSON.parse(probe.stdout) as {
        streams: {
          nb_read_frames: string
          avg_frame_rate?: string
          r_frame_rate?: string
        }[]
      }
    ).streams[0]
    const framesCount = Number(stream?.nb_read_frames)
    if (!stream || !Number.isSafeInteger(framesCount) || framesCount < 1) {
      throw new Error('ffprobe did not report a frame count')
    }

    await execFileAsync('ffmpeg', [
      '-v',
      'error',
      '-y',
      '-i',
      inputPath,
      '-vf',
      `scale=${String(frameSize)}:${String(frameSize)}:flags=lanczos,tile=1x${String(framesCount)}`,
      '-frames:v',
      '1',
      '-update',
      '1',
      outputPath,
    ])
    const png = await sharp(await readFile(outputPath))
      .png({ palette: true, quality: 90, effort: 10 })
      .toBuffer()
    return {
      png,
      framesCount,
      fps: resolveFrameRate(stream.avg_frame_rate, stream.r_frame_rate),
    }
  } finally {
    await rm(workingDirectory, { recursive: true, force: true })
  }
}
