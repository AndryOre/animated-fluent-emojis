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
    tagline: 'Microsoft Fluent animated emojis for the web.',
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
  gallery: {
    title: 'Emoji gallery',
    description:
      'Search the animated Fluent emojis, pick a skin tone and copy the code for React, Vue, Svelte, Astro or plain HTML.',
    searchLabel: 'Search emojis',
    searchPlaceholder: 'Search {count} emojis, like “fire” or “wave”',
    categoryLabel: 'Category',
    categoryAll: 'All',
    toneLabel: 'Skin tone',
    toneDefault: 'Default',
    toneLight: 'Light',
    toneMediumLight: 'Medium light',
    toneMedium: 'Medium',
    toneMediumDark: 'Medium dark',
    toneDark: 'Dark',
    noSkinTones: 'No skin tones',
    sizeLabel: 'Size',
    resultsLabel: 'Emojis',
    resultsCount: '{count} emojis',
    showMore: 'Show more',
    detailLabel: 'Emoji details',
    detailEmpty: 'Select an emoji to see its code.',
    closeDetail: 'Close',
    idLabel: 'ID',
    snippetLabel: 'Code',
    tabReact: 'React',
    tabVue: 'Vue',
    tabSvelte: 'Svelte',
    tabAstro: 'Astro',
    tabHtml: 'HTML',
    tabNoCode: 'No code',
    copySnippet: 'Copy snippet',
    copyUrl: 'Copy URL',
    copyId: 'Copy id',
    downloadGif: 'Download GIF',
    downloadWebp: 'Download WebP',
    downloadPng: 'Download PNG',
    downloadFailed: 'The download failed. Try again.',
    copied: 'Copied',
    noResultsTitle: 'No emoji matches “{query}”',
    noResultsHint: 'Check the spelling or try a shorter word.',
    clearSearch: 'Clear search',
    errorTitle: 'The emoji list could not load.',
    errorHint:
      'Check your connection and try again. The docs and the rest of the site still work.',
    retry: 'Try again',
    loading: 'Loading emojis',
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
