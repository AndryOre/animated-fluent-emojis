import type { SlimManifest } from '../utils/index.js'

export const MANIFEST_URL =
  'https://animated-fluent-emojis.pages.dev/manifest.slim.json'

export const SPRITE_URL_PATTERN =
  'https://animated-fluent-emojis.pages.dev/sprites/*'

export const FIXTURE_MANIFEST: SlimManifest = {
  categories: [
    {
      id: 'smilies',
      title: 'Smilies',
      description: 'Faces',
      emoticons: [
        {
          id: 'grinning-face',
          description: 'Grinning face',
          etag: 'etag-grin',
          diverse: false,
          animation: { fps: 20, framesCount: 40, firstFrame: 2 },
        },
        {
          id: 'waving-hand',
          description: 'Waving hand',
          etag: 'etag-wave',
          diverse: true,
          animation: { fps: 24, framesCount: 21, firstFrame: 1 },
          hd: true,
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
          etag: 'etag-cat',
          diverse: false,
          animation: { fps: 10, framesCount: 20, firstFrame: 1 },
        },
      ],
    },
  ],
}

export const TRANSPARENT_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
