import type { Manifest } from '../utils/index.js'

export const MANIFEST_URL =
  'https://animated-fluent-emojis.pages.dev/manifest.json'

export const SPRITE_URL_PATTERN =
  'https://animated-fluent-emojis.pages.dev/sprites/*'

export const FIXTURE_MANIFEST: Manifest = {
  categories: [
    {
      id: 'smilies',
      title: 'Smilies',
      description: 'Faces',
      emoticons: [
        {
          id: 'grinning-face',
          description: 'Grinning face',
          shortcuts: [':D'],
          unicode: '1f600',
          etag: 'etag-grin',
          diverse: false,
          animation: { fps: 20, framesCount: 40, firstFrame: 2 },
          keywords: ['grin'],
        },
        {
          id: 'waving-hand',
          description: 'Waving hand',
          shortcuts: [],
          unicode: '1f44b',
          etag: 'etag-wave',
          diverse: true,
          animation: { fps: 24, framesCount: 21, firstFrame: 1 },
          keywords: ['wave'],
        },
      ],
    },
    {
      id: 'animals',
      title: 'Animals',
      description: 'Critters',
      emoticons: [
        {
          id: 'cat',
          description: 'Cat',
          shortcuts: [],
          unicode: '1f431',
          etag: 'etag-cat',
          diverse: false,
          animation: { fps: 10, framesCount: 20, firstFrame: 1 },
          keywords: ['cat'],
        },
      ],
    },
  ],
}

export const TRANSPARENT_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
