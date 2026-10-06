/**
 * English UI strings, the source of truth for every locale's keys. The other
 * locale files are typed against this shape.
 */
export const en = {
  meta: {
    siteName: 'Animated Fluent Emojis',
    description:
      'Microsoft Fluent animated emojis for the web, as a library for React, Vue, Svelte, Astro and plain HTML.',
  },
  header: {
    skipLink: 'Skip to content',
    homeLabel: 'Animated Fluent Emojis, home',
    navLabel: 'Main',
    menu: 'Menu',
    nav: {
      gallery: 'Gallery',
      docs: 'Docs',
      github: 'GitHub',
    },
    languageLabel: 'Language',
    themeLabel: 'Theme',
    theme: {
      system: 'System',
      light: 'Light',
      dark: 'Dark',
    },
  },
  footer: {
    attribution:
      "The emoji artwork is Microsoft's. The code is open source. Not affiliated with or endorsed by Microsoft.",
    navLabel: 'Footer',
    links: {
      gallery: 'Gallery',
      docs: 'Docs',
      github: 'GitHub',
      npm: 'npm',
    },
  },
  home: {
    title: 'Animated Fluent Emojis',
    tagline: 'Fluent emojis, but they move.',
    hero: {
      sub: 'Hover it. It waves back.',
      installLabel: 'Install command',
      copy: 'Copy',
      copied: 'Copied',
      browse: 'Browse the emojis',
      attribution:
        "The emoji artwork is Microsoft's. Not affiliated with or endorsed by Microsoft.",
      stageLabel: 'A waving hand emoji, playing on hover',
    },
    demo: {
      title: 'Try one',
      sizeLabel: 'Size',
      toneLabel: 'Skin tone',
      playsLabel: 'Plays',
      tones: {
        default: 'Default',
        light: 'Light',
        medium: 'Medium',
        dark: 'Dark',
      },
      plays: {
        hover: 'On hover',
        load: 'On load',
      },
    },
    pillars: {
      title: 'Made to be easy to live with',
      alive: {
        title: 'Alive',
        body: 'They wave back. Hover one and see.',
      },
      light: {
        title: 'Light',
        body: 'They never push your page around while they load.',
      },
      considerate: {
        title: 'Considerate',
        body: 'If someone asks their device for less motion, the emoji stays still.',
      },
      credit: {
        title: 'Clear about what is whose',
        body: "The emoji artwork is Microsoft's. The code is open source.",
      },
    },
    snippets: {
      title: 'One tag, any site',
      body: 'Pick your framework, copy the code, and the emoji is on the page.',
      tabsLabel: 'Framework',
      copy: 'Copy code',
      copied: 'Copied',
    },
    noCode: {
      title: 'No code? No problem.',
      body: 'Download any emoji as a GIF, an animated WebP or a still PNG, and drop it into a chat or a document.',
      cta: 'Browse the emojis',
      teaserLabel: 'A few emojis from the gallery',
    },
    faq: {
      title: 'Questions',
      chat: {
        question: 'Can I use these in a chat or a document?',
        answer:
          'Yes. Download the emoji as a GIF, an animated WebP or a still PNG from the gallery, then add it to your message or file like any picture.',
      },
      speed: {
        question: 'Will they slow my page down?',
        answer:
          'No. Each emoji holds its space while it loads, so nothing jumps, and the animation files are only fetched when an emoji is shown.',
      },
      motion: {
        question: 'What happens if someone prefers less motion?',
        answer:
          'The emoji stays still on its first frame. It never moves unless the visitor has left motion switched on.',
      },
    },
  },
  docs: {
    howToGroup: 'How-to guides',
    copyMarkdown: 'Copy page as Markdown',
    copiedMarkdown: 'Copied',
    notices: {
      missing:
        'This page is not available in your language yet. Showing the English version.',
      stale:
        'The translation of this page is out of date. Showing the English version.',
    },
  },
  notFound: {
    title: "That page isn't here.",
    body: 'The link may be old, or the emoji may have moved.',
    home: 'Go home',
    gallery: 'Browse the emojis',
  },
} as const

type Widen<T> = T extends string
  ? string
  : { -readonly [Key in keyof T]: Widen<T[Key]> }

/**
 * Shape every locale's UI strings must satisfy, taken from English.
 */
export type UiStrings = Widen<typeof en>
