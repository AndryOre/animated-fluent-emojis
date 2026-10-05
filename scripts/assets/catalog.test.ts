import { expect, test } from 'vitest'

import { buildCatalog, buildOutputPath, resolveCategory } from './catalog.js'
import { glyphToCodepoints } from './codepoints.js'
import type { MitEmoji } from './mit.js'
import { createTeamsManifest } from './test-support.js'

const mitEmoji = (overrides: Partial<MitEmoji> = {}): MitEmoji => ({
  codepoints: '1f3c1',
  glyph: '🏁',
  cldr: 'chequered flag',
  group: 'Flags',
  keywords: ['flag'],
  sprites: [
    {
      toneSuffix: '',
      path: 'assets/Chequered flag/a.png',
      blobSha: 'deadbeefcafe',
    },
  ],
  ...overrides,
})

const allEmoticons = (catalog: ReturnType<typeof buildCatalog>) =>
  catalog.manifest.categories.flatMap((category) => category.emoticons)

test('buildOutputPath nests sprites by category and tone', () => {
  expect(buildOutputPath('Hand gestures', '1f44b_wavinghand', '_s2')).toBe(
    'sprites/Hand gestures/1f44b_wavinghand_s2.png',
  )
})

test('keeps every Teams emoticon and plans its sprites with tones', () => {
  const catalog = buildCatalog(createTeamsManifest(), [])

  expect(allEmoticons(catalog).map((emoticon) => emoticon.id)).toEqual([
    '1f603_grinningfacewithbigeyes',
    '1f44b_wavinghand',
  ])
  const waving = catalog.tasks.filter((task) => task.id === '1f44b_wavinghand')
  expect(waving.map((task) => task.toneSuffix)).toEqual([
    '',
    '_s2',
    '_s3',
    '_s4',
    '_s5',
    '_s6',
  ])
  expect(waving.every((task) => task.source === 'teams')).toBe(true)
  expect(waving[1]?.sourceUrl).toContain(
    '/1f44b_wavinghand/default/100_anim_f_s2.png',
  )
})

test('drops earlier duplicates of an id, as the library does', () => {
  const manifest = createTeamsManifest()
  const duplicate = manifest.categories[0]?.emoticons[0]
  if (!duplicate) throw new Error('fixture changed')
  manifest.categories[2]?.emoticons.push({ ...duplicate })

  const catalog = buildCatalog(manifest, [])

  expect(catalog.manifest.categories[0]?.emoticons).toEqual([])
  expect(catalog.manifest.categories[2]?.emoticons).toHaveLength(1)
  expect(catalog.tasks.filter((task) => task.id === duplicate.id)).toHaveLength(
    1,
  )
})

test('adds official emojis Teams does not have, by codepoints', () => {
  const catalog = buildCatalog(createTeamsManifest(), [
    mitEmoji(),
    mitEmoji({
      codepoints: '1f603',
      glyph: '😃',
      cldr: 'grinning face with big eyes',
      group: 'Smileys & Emotion',
    }),
  ])

  const added = allEmoticons(catalog).filter((emoticon) =>
    catalog.mitEmojiIds.has(emoticon.id),
  )
  expect(added).toHaveLength(1)
  expect(added[0]).toMatchObject({
    id: '1f3c1_chequeredflag',
    description: 'Chequered flag',
    unicode: '🏁',
    etag: 'deadbeef',
    diverse: false,
  })
  expect(
    catalog.manifest.categories
      .find((category) => category.title === 'Symbols')
      ?.emoticons.map((emoticon) => emoticon.id),
  ).toEqual(['1f3c1_chequeredflag'])
  expect(catalog.tasks.at(-1)).toMatchObject({
    source: 'mit',
    outputPath: 'sprites/Symbols/1f3c1_chequeredflag.png',
    mitPath: 'assets/Chequered flag/a.png',
  })
})

test('official emojis with skin tones are marked diverse and get tone tasks', () => {
  const catalog = buildCatalog(createTeamsManifest(), [
    mitEmoji({
      codepoints: '1f595',
      glyph: '🖕',
      cldr: 'middle finger',
      group: 'People & Body',
      sprites: [
        { toneSuffix: '', path: 'a', blobSha: '11111111aa' },
        { toneSuffix: '_s6', path: 'b', blobSha: '22222222bb' },
      ],
    }),
  ])

  const added = allEmoticons(catalog).find(
    (emoticon) => emoticon.id === '1f595_middlefinger',
  )
  expect(added?.diverse).toBe(true)
  expect(
    catalog.tasks
      .filter((task) => task.id === '1f595_middlefinger')
      .map((task) => task.outputPath),
  ).toEqual([
    'sprites/Hand gestures/1f595_middlefinger.png',
    'sprites/Hand gestures/1f595_middlefinger_s6.png',
  ])
})

test('resolveCategory maps groups and throws on unknown ones', () => {
  expect(resolveCategory(mitEmoji({ group: 'Travel & Places' }))).toBe(
    'Travel and places',
  )
  expect(() => resolveCategory(mitEmoji({ group: 'Mystery' }))).toThrow(
    'Unmapped official emoji group',
  )
})

const middleFinger = (): MitEmoji =>
  mitEmoji({
    codepoints: '1f595',
    glyph: '🖕',
    cldr: 'middle finger',
    group: 'People & Body',
  })

const previousManifestPinning = (id: string) => {
  const manifest = createTeamsManifest()
  manifest.categories[1]?.emoticons.push({
    id,
    description: 'Middle finger',
    shortcuts: [],
    unicode: '🖕',
    etag: 'old',
    diverse: false,
    animation: { fps: 0, framesCount: 0, firstFrame: 1 },
    keywords: [],
    origin: 'official',
  })
  return manifest
}

test('marks added official emojis with origin official', () => {
  const catalog = buildCatalog(createTeamsManifest(), [mitEmoji()])

  expect(
    allEmoticons(catalog).find(
      (emoticon) => emoticon.id === '1f3c1_chequeredflag',
    )?.origin,
  ).toBe('official')
})

test('keeps a pinned official id when Teams now has the emoji', () => {
  const teams = createTeamsManifest()
  teams.categories[1]?.emoticons.push({
    id: 'middlefinger_teams',
    description: 'Middle finger',
    shortcuts: [],
    unicode: '🖕',
    etag: 'v1',
    diverse: false,
    animation: { fps: 24, framesCount: 10, firstFrame: 1 },
    keywords: [],
  })

  const catalog = buildCatalog(
    teams,
    [middleFinger()],
    previousManifestPinning('1f595_middlefinger'),
  )

  const ids = allEmoticons(catalog).map((emoticon) => emoticon.id)
  expect(ids).toContain('middlefinger_teams')
  expect(ids).toContain('1f595_middlefinger')
  expect(catalog.mitEmojiIds.has('1f595_middlefinger')).toBe(true)
  expect(
    catalog.tasks.find(
      (task) => task.id === '1f595_middlefinger' && task.source === 'mit',
    ),
  ).toBeDefined()
})

test('fails naming a pinned id whose official source vanished', () => {
  expect(() =>
    buildCatalog(
      createTeamsManifest(),
      [mitEmoji()],
      previousManifestPinning('1f595_middlefinger'),
    ),
  ).toThrow('1f595_middlefinger')
})

test('every official codepoint is present in the final manifest', () => {
  const mitEmojis = [
    mitEmoji(),
    mitEmoji({
      codepoints: '1f603',
      glyph: '😃',
      cldr: 'grinning face with big eyes',
      group: 'Smileys & Emotion',
    }),
    mitEmoji({
      codepoints: '1f44b',
      glyph: '👋',
      cldr: 'waving hand',
      group: 'People & Body',
    }),
  ]

  const catalog = buildCatalog(createTeamsManifest(), mitEmojis)

  const published = new Set(
    allEmoticons(catalog).map((emoticon) =>
      glyphToCodepoints(emoticon.unicode),
    ),
  )
  for (const emoji of mitEmojis) {
    expect(published.has(emoji.codepoints), emoji.cldr).toBe(true)
  }
})
