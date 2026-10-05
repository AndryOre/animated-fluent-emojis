import type { Manifest } from '../../src/utils/types.js'
import { glyphToCodepoints } from './codepoints.js'
import type { MitEmoji } from './mit.js'
import { buildSpriteUrl } from './teams.js'

type Emoticon = Manifest['categories'][number]['emoticons'][number]

const TEAMS_TONE_SUFFIXES = ['_s2', '_s3', '_s4', '_s5', '_s6'] as const

const CATEGORY_BY_MIT_GROUP: Readonly<Record<string, string>> = {
  'Smileys & Emotion': 'Smilies',
  'People & Body': 'People',
  'Animals & Nature': 'Animals',
  'Food & Drink': 'Food',
  'Travel & Places': 'Travel and places',
  Activities: 'Activities',
  Objects: 'Objects',
  Symbols: 'Symbols',
  Flags: 'Symbols',
}

const CATEGORY_OVERRIDES_BY_CODEPOINTS: Readonly<Record<string, string>> = {
  '1f595': 'Hand gestures',
}

const PLACEHOLDER_ANIMATION = { fps: 0, framesCount: 0, firstFrame: 1 }

/**
 * Where a sprite comes from and where it is published.
 */
export interface SpriteTask {
  readonly source: 'teams' | 'mit'
  readonly id: string
  readonly category: string
  readonly toneSuffix: string
  readonly etag: string
  readonly sourceUrl?: string
  readonly mitPath?: string
  readonly outputPath: string
}

/**
 * The merged emoji catalog and the sprites needed to serve it.
 */
export interface Catalog {
  readonly manifest: Manifest
  readonly tasks: readonly SpriteTask[]
  readonly mitEmojiIds: ReadonlySet<string>
}

/**
 * Builds the published path of a sprite.
 * @param category The category folder.
 * @param id The emoji id.
 * @param toneSuffix The skin tone suffix.
 * @returns A path like `sprites/Smilies/1f603_grinningfacewithbigeyes.png`.
 */
export function buildOutputPath(
  category: string,
  id: string,
  toneSuffix: string,
): string {
  return `sprites/${category}/${id}${toneSuffix}.png`
}

function slugify(text: string): string {
  return text.toLowerCase().replaceAll(/[^\da-z]/g, '')
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * Maps an official emoji to the category folder it is published under.
 * @param emoji The official emoji.
 * @returns The Teams-style category title.
 */
export function resolveCategory(emoji: MitEmoji): string {
  const override = CATEGORY_OVERRIDES_BY_CODEPOINTS[emoji.codepoints]
  if (override) return override
  const category = CATEGORY_BY_MIT_GROUP[emoji.group]
  if (!category) {
    throw new Error(
      `Unmapped official emoji group "${emoji.group}" (${emoji.cldr})`,
    )
  }
  return category
}

function dedupeKeepingLast(manifest: Manifest): Manifest {
  const lastCategoryById = new Map<string, number>()
  for (const [categoryIndex, category] of manifest.categories.entries()) {
    for (const emoticon of category.emoticons) {
      lastCategoryById.set(emoticon.id, categoryIndex)
    }
  }
  return {
    categories: manifest.categories.map((category, categoryIndex) => ({
      ...category,
      emoticons: category.emoticons.filter(
        (emoticon) => lastCategoryById.get(emoticon.id) === categoryIndex,
      ),
    })),
  }
}

function buildTeamsTasks(manifest: Manifest): SpriteTask[] {
  return manifest.categories.flatMap((category) =>
    category.emoticons.flatMap((emoticon) => {
      const suffixes = emoticon.diverse ? ['', ...TEAMS_TONE_SUFFIXES] : ['']
      return suffixes.map((toneSuffix): SpriteTask => ({
        source: 'teams',
        id: emoticon.id,
        category: category.title,
        toneSuffix,
        etag: emoticon.etag,
        sourceUrl: buildSpriteUrl(emoticon.id, toneSuffix),
        outputPath: buildOutputPath(category.title, emoticon.id, toneSuffix),
      }))
    }),
  )
}

function collectPinnedOfficialIds(
  previousManifest: Manifest | undefined,
  mitEmojis: readonly MitEmoji[],
  teamsIds: ReadonlySet<string>,
): Map<string, string> {
  const pinnedIdByCodepoints = new Map<string, string>()
  const officialCodepoints = new Set(mitEmojis.map((emoji) => emoji.codepoints))
  const previousCategories = previousManifest?.categories ?? []
  for (const category of previousCategories) {
    for (const emoticon of category.emoticons) {
      if (emoticon.origin !== 'official') continue
      const codepoints = glyphToCodepoints(emoticon.unicode)
      if (!officialCodepoints.has(codepoints)) {
        throw new Error(
          `Pinned official emoji "${emoticon.id}" no longer exists in the official repository`,
        )
      }
      if (!teamsIds.has(emoticon.id)) {
        pinnedIdByCodepoints.set(codepoints, emoticon.id)
      }
    }
  }
  return pinnedIdByCodepoints
}

function buildMitEmoticon(emoji: MitEmoji, id: string, etag: string): Emoticon {
  return {
    id,
    description: capitalize(emoji.cldr),
    shortcuts: [],
    unicode: emoji.glyph,
    etag,
    diverse: emoji.sprites.some((sprite) => sprite.toneSuffix !== ''),
    animation: PLACEHOLDER_ANIMATION,
    keywords: [...emoji.keywords],
    origin: 'official',
  }
}

/**
 * Merges the Teams manifest with the official emojis Teams does not have.
 * @param teamsManifest The Teams emoticon manifest.
 * Official ids published before are pinned: they stay in the catalog, sourced
 * from the official repository, even when Teams now has the emoji.
 * @param mitEmojis The official repository emojis.
 * @param previousManifest The previously published manifest, if any.
 * @returns The final manifest and the sprites to produce.
 */
export function buildCatalog(
  teamsManifest: Manifest,
  mitEmojis: readonly MitEmoji[],
  previousManifest?: Manifest,
): Catalog {
  const teams = dedupeKeepingLast(teamsManifest)
  const teamsCodepoints = new Set(
    teams.categories.flatMap((category) =>
      category.emoticons.map((emoticon) => glyphToCodepoints(emoticon.unicode)),
    ),
  )
  const usedIds = new Set(
    teams.categories.flatMap((category) =>
      category.emoticons.map((emoticon) => emoticon.id),
    ),
  )

  const pinnedIdByCodepoints = collectPinnedOfficialIds(
    previousManifest,
    mitEmojis,
    usedIds,
  )
  for (const pinnedId of pinnedIdByCodepoints.values()) usedIds.add(pinnedId)

  const missing = mitEmojis.filter(
    (emoji) =>
      !teamsCodepoints.has(emoji.codepoints) ||
      pinnedIdByCodepoints.has(emoji.codepoints),
  )
  const tasks = buildTeamsTasks(teams)
  const additionsByCategory = new Map<string, Emoticon[]>()
  const mitEmojiIds = new Set<string>()

  for (const emoji of missing) {
    const baseId = `${emoji.codepoints.replaceAll('-', '_')}_${slugify(emoji.cldr)}`
    const id =
      pinnedIdByCodepoints.get(emoji.codepoints) ??
      (usedIds.has(baseId) ? `${baseId}_mit` : baseId)
    usedIds.add(id)
    mitEmojiIds.add(id)
    const category = resolveCategory(emoji)
    const defaultSprite = emoji.sprites.find(
      (sprite) => sprite.toneSuffix === '',
    )
    const etag = (defaultSprite ?? emoji.sprites[0])?.blobSha.slice(0, 8) ?? ''
    additionsByCategory.set(category, [
      ...(additionsByCategory.get(category) ?? []),
      buildMitEmoticon(emoji, id, etag),
    ])
    for (const sprite of emoji.sprites) {
      tasks.push({
        source: 'mit',
        id,
        category,
        toneSuffix: sprite.toneSuffix,
        etag: sprite.blobSha.slice(0, 8),
        mitPath: sprite.path,
        outputPath: buildOutputPath(category, id, sprite.toneSuffix),
      })
    }
  }

  const knownTitles = new Set(
    teams.categories.map((category) => category.title),
  )
  for (const category of additionsByCategory.keys()) {
    if (!knownTitles.has(category)) {
      throw new Error(`Category "${category}" is not in the Teams manifest`)
    }
  }

  const manifest: Manifest = {
    categories: teams.categories.map((category) => ({
      ...category,
      emoticons: [
        ...category.emoticons,
        ...(additionsByCategory.get(category.title) ?? []),
      ],
    })),
  }
  return { manifest, tasks, mitEmojiIds }
}
