import { execFile } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import sharp from 'sharp'

const execFileAsync = promisify(execFile)
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
 * Parses an ffprobe frame rate such as `143/6` into frames per second.
 * @param rate The ratio string reported by ffprobe.
 * @returns The rate rounded to a whole number of frames per second.
 */
export function parseFrameRate(rate: string): number {
  const [numerator, denominator] = rate.split('/').map(Number)
  if (
    denominator === 0 ||
    numerator === undefined ||
    denominator === undefined ||
    !Number.isFinite(numerator) ||
    !Number.isFinite(denominator)
  ) {
    throw new Error(`Invalid frame rate "${rate}"`)
  }
  return Math.max(1, Math.round(numerator / denominator))
}

/**
 * Converts an animated PNG into a vertical 100px sprite sheet, the layout the
 * `Emoji` component steps through.
 * @param animatedPng The bytes of the animated PNG.
 * @returns The palette-optimized sprite sheet and its frame count and fps.
 */
export async function convertAnimatedPng(
  animatedPng: Buffer,
): Promise<ConvertedSprite> {
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
      'stream=nb_read_frames,avg_frame_rate',
      '-of',
      'json',
      inputPath,
    ])
    const stream = (
      JSON.parse(probe.stdout) as {
        streams: { nb_read_frames: string; avg_frame_rate: string }[]
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
      `scale=${String(SPRITE_SIZE)}:${String(SPRITE_SIZE)}:flags=lanczos,tile=1x${String(framesCount)}`,
      '-frames:v',
      '1',
      '-update',
      '1',
      outputPath,
    ])
    const png = await sharp(await readFile(outputPath))
      .png({ palette: true, quality: 90, effort: 10 })
      .toBuffer()
    return { png, framesCount, fps: parseFrameRate(stream.avg_frame_rate) }
  } finally {
    await rm(workingDirectory, { recursive: true, force: true })
  }
}
