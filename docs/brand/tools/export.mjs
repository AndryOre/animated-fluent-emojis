import { mkdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import sharp from 'sharp'

/**
 * Regenerates the derived raster assets of the brand kit from the SVG sources in
 * `docs/brand/logo`: the PNG marks, the README covers (`docs/assets/Cover.webp` and `Cover-light.webp`),
 * the GitHub social preview and the Open Graph image (`docs/brand/og/`). Run with
 * `bun run brand:export`.
 *
 * Fonts are embedded from `docs/brand/brandbook/fonts`, so output does not
 * depend on fonts installed on the host. The three emojis on the cover come
 * from the README's own files in `docs/assets`. The script throws when an image
 * misses its exact pixel size or byte budget: GitHub rejects a social preview
 * over 1 MB, and the Open Graph image stays under 300 KB.
 */
const brandRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
)
const repositoryRoot = path.resolve(brandRoot, '../..')
const fontsRoot = path.join(brandRoot, 'brandbook/fonts')
const assetsRoot = path.join(repositoryRoot, 'docs/assets')

const THEMES = {
  dark: {
    ground: '#0D1715',
    text: '#EAF4F1',
    muted: '#9AB0AA',
    accentRgb: '46,196,160',
    glow: 0.22,
  },
  light: {
    ground: 'oklch(0.983 0.003 174.5)',
    text: 'oklch(0.228 0.023 176.5)',
    muted: 'oklch(0.467 0.026 178.2)',
    accentRgb: '46,196,160',
    glow: 0.16,
  },
}
const MARK_SIZES = [16, 32, 48, 128, 512]
const KB = 1024
const MB = 1024 * KB
const COVER_SCALE = 1.5
const WEBP_QUALITY = 86
const TAGLINE = 'Fluent emojis,<br>but they move.'
const SUBLINE = "Microsoft's animated Fluent emojis as one component."
const NOTICE = 'Not affiliated with or endorsed by Microsoft.'

const browser = await chromium.launch()

const markSvg = await readFile(path.join(brandRoot, 'logo/mark.svg'), 'utf8')
const lockupSvgs = {
  dark: await readFile(
    path.join(brandRoot, 'logo/lockup-horizontal-dark.svg'),
    'utf8',
  ),
  light: await readFile(
    path.join(brandRoot, 'logo/lockup-horizontal.svg'),
    'utf8',
  ),
}

async function readBase64(filePath) {
  const buffer = await readFile(filePath)
  return buffer.toString('base64')
}

const fontRules = await Promise.all(
  [
    ['Figtree', 'Figtree-var.woff2', '300 900'],
    ['Geist Mono', 'GeistMono-var.woff2', '100 900'],
  ].map(async ([family, fileName, weight]) => {
    const data = await readBase64(path.join(fontsRoot, fileName))
    return `@font-face{font-family:'${family}';font-weight:${weight};src:url(data:font/woff2;base64,${data}) format('woff2')}`
  }),
)
const fontFaces = fontRules.join('')

const emojiFiles = ['rocket-launch.webp', 'fire.webp', 'hundred-points.webp']
const emojiUris = await Promise.all(
  emojiFiles.map(async (fileName) => {
    const data = await readBase64(path.join(assetsRoot, fileName))
    return `data:image/webp;base64,${data}`
  }),
)

async function renderMark(size, outPath) {
  const page = await browser.newPage({
    viewport: { width: size, height: size },
  })
  await page.setContent(
    `<style>svg{display:block;width:100%;height:100%}</style>` +
      `<body style="margin:0;width:${size}px;height:${size}px">${markSvg}</body>`,
  )
  await mkdir(path.dirname(outPath), { recursive: true })
  await page.screenshot({ path: outPath, omitBackground: true })
  await page.close()
  await assertSpec(outPath, { width: size, height: size, maxBytes: 200 * KB })
}

function bannerHtml(width, height, theme) {
  const { ground, text, muted, accentRgb, glow } = THEMES[theme]
  const lockupSvg = lockupSvgs[theme]
  const unit = width / 1280
  const px = (value) => `${Math.round(value * unit)}px`
  const emojiStyle = (size, rotate, left, top) =>
    `position:absolute;left:${px(left)};top:${px(top)};width:${px(size)};height:${px(size)};transform:rotate(${rotate}deg)`
  return `<html lang="en"><style>${fontFaces}svg{display:block;width:100%;height:auto}img{display:block}</style>
    <body style="margin:0;width:${width}px;height:${height}px;position:relative;overflow:hidden;font-family:Figtree,system-ui,sans-serif;color:${text};background:radial-gradient(52% 78% at 78% 50%, rgba(${accentRgb},${glow}), transparent 70%), ${ground}">
      <div style="position:absolute;left:${px(80)};top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;width:${px(640)}">
        <div style="width:${px(500)}">${lockupSvg}</div>
        <div style="font-weight:800;font-size:${px(62)};line-height:1.04;letter-spacing:-0.03em;margin-top:${px(52)}">${TAGLINE}</div>
        <div style="font-weight:400;font-size:${px(24)};line-height:1.4;color:${muted};margin-top:${px(22)}">${SUBLINE}</div>
      </div>
      <div style="position:absolute;left:${px(80)};bottom:${px(40)};font-size:${px(15)};color:${muted};opacity:0.8">${NOTICE}</div>
      <img src="${emojiUris[0]}" alt="" style="${emojiStyle(220, -7, 760, 118)}">
      <img src="${emojiUris[1]}" alt="" style="${emojiStyle(168, 6, 984, 280)}">
      <img src="${emojiUris[2]}" alt="" style="${emojiStyle(150, -4, 806, 360)}">
    </body></html>`
}

async function renderBanner({ width, height, scale = 1, theme = 'dark' }) {
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: scale,
  })
  await page.setContent(bannerHtml(width, height, theme))
  await page.waitForFunction('document.fonts.status === "loaded"')
  const buffer = await page.screenshot({ type: 'png' })
  await page.close()
  return buffer
}

async function assertSpec(outPath, { width, height, maxBytes }) {
  const { size } = await stat(outPath)
  const meta = await sharp(outPath).metadata()
  const name = path.basename(outPath)
  if (meta.width !== width || meta.height !== height) {
    throw new Error(
      `${name} is ${meta.width}x${meta.height}, expected ${width}x${height}`,
    )
  }
  if (size > maxBytes) {
    throw new Error(`${name} is ${size} bytes, over ${maxBytes}`)
  }
  console.log(
    `${path.relative(repositoryRoot, outPath)} ${(size / KB).toFixed(0)} KB`,
  )
}

try {
  for (const size of MARK_SIZES) {
    await renderMark(size, path.join(brandRoot, 'logo/png', `mark-${size}.png`))
  }

  const ogRoot = path.join(brandRoot, 'og')
  await mkdir(ogRoot, { recursive: true })
  const socialPath = path.join(ogRoot, 'social-preview.png')
  await sharp(await renderBanner({ width: 1280, height: 640 }))
    .png({ compressionLevel: 9 })
    .toFile(socialPath)
  await assertSpec(socialPath, { width: 1280, height: 640, maxBytes: 1 * MB })

  const ogPath = path.join(ogRoot, 'og.png')
  await sharp(await renderBanner({ width: 1200, height: 630 }))
    .png({ compressionLevel: 9, palette: true })
    .toFile(ogPath)
  await assertSpec(ogPath, { width: 1200, height: 630, maxBytes: 300 * KB })

  const coverSpec = {
    width: 1280 * COVER_SCALE,
    height: 640 * COVER_SCALE,
    maxBytes: 300 * KB,
  }
  const coverPath = path.join(assetsRoot, 'Cover.webp')
  await sharp(
    await renderBanner({ width: 1280, height: 640, scale: COVER_SCALE }),
  )
    .webp({ quality: WEBP_QUALITY })
    .toFile(coverPath)
  await assertSpec(coverPath, coverSpec)

  const lightCoverPath = path.join(assetsRoot, 'Cover-light.webp')
  await sharp(
    await renderBanner({
      width: 1280,
      height: 640,
      scale: COVER_SCALE,
      theme: 'light',
    }),
  )
    .webp({ quality: WEBP_QUALITY })
    .toFile(lightCoverPath)
  await assertSpec(lightCoverPath, coverSpec)
} finally {
  await browser.close()
}
