import type { UiStrings } from './en'

/**
 * German UI strings, addressing the reader with the informal "du".
 */
export const de: UiStrings = {
  meta: {
    siteName: 'Animated Fluent Emojis',
    description:
      'Animierte Fluent-Emojis von Microsoft fürs Web, als Bibliothek für React, Vue, Svelte, Astro und reines HTML.',
  },
  header: {
    skipLink: 'Zum Inhalt springen',
    homeLabel: 'Animated Fluent Emojis, Startseite',
    navLabel: 'Hauptnavigation',
    menu: 'Menü',
    nav: {
      gallery: 'Galerie',
      docs: 'Doku',
      github: 'GitHub',
    },
    languageLabel: 'Sprache',
    themeLabel: 'Design',
    theme: {
      system: 'System',
      light: 'Hell',
      dark: 'Dunkel',
    },
  },
  footer: {
    attribution:
      'Die Emoji-Grafiken gehören Microsoft. Der Code ist Open Source. Keine Verbindung zu Microsoft und keine Billigung durch Microsoft.',
    navLabel: 'Fußbereich',
    links: {
      gallery: 'Galerie',
      docs: 'Doku',
      github: 'GitHub',
      npm: 'npm',
    },
  },
  home: {
    title: 'Animated Fluent Emojis',
    tagline: 'Fluent-Emojis, aber sie bewegen sich.',
    hero: {
      sub: 'Fahr drüber. Es winkt zurück.',
      installLabel: 'Installationsbefehl',
      copy: 'Kopieren',
      copied: 'Kopiert',
      eyebrow: 'Open Source',
      docs: 'Dokumentation lesen',
      browse: 'Emojis durchstöbern',
      attribution:
        'Die Emoji-Grafiken gehören Microsoft. Keine Verbindung zu Microsoft und keine Billigung durch Microsoft.',
    },
    demo: {
      sizeLabel: 'Größe',
      toneLabel: 'Hautfarbe',
      playsLabel: 'Wiedergabe',
      emojiLabel: 'Emoji',
      reset: 'Zurücksetzen',
      emojis: {
        wave: 'Winkende Hand',
        fire: 'Feuer',
        party: 'Konfettikanone',
        heart: 'Rotes Herz',
        rocket: 'Rakete',
        grin: 'Grinsendes Gesicht',
      },
      tones: {
        default: 'Standard',
        light: 'Hell',
        medium: 'Mittel',
        dark: 'Dunkel',
      },
      plays: {
        hover: 'Beim Darüberfahren',
        load: 'Beim Laden',
      },
    },
    pillars: {
      eyebrow: 'Eigenschaften',
      title: 'Gemacht, damit sie dir nicht im Weg sind',
      alive: {
        title: 'Lebendig',
        body: 'Sie winken zurück. Fahr über eins und sieh selbst.',
      },
      light: {
        title: 'Leicht',
        body: 'Sie schieben deine Seite nie herum, während sie laden.',
      },
      considerate: {
        title: 'Rücksichtsvoll',
        body: 'Wenn jemand sein Gerät um weniger Bewegung bittet, bleibt das Emoji ruhig.',
      },
      credit: {
        title: 'Klar, was wem gehört',
        body: 'Die Emoji-Grafiken gehören Microsoft. Der Code ist Open Source.',
      },
    },
    snippets: {
      title: 'Ein Tag, jede Website',
      body: 'Wähle dein Framework, kopiere den Code, und das Emoji ist auf der Seite.',
      tabsLabel: 'Framework',
      copy: 'Code kopieren',
      copied: 'Kopiert',
    },
    noCode: {
      eyebrow: 'Ohne Code',
      formats: {
        gif: 'Funktioniert in jedem Chat',
        webp: 'Animiert, kleiner',
        png: 'Ein Standbild',
      },
      title: 'Kein Code? Kein Problem.',
      body: 'Lade jedes Emoji als GIF, animiertes WebP oder stehendes PNG herunter und füge es in einen Chat oder ein Dokument ein.',
      cta: 'Emojis durchstöbern',
      teaserLabel: 'Ein paar Emojis aus der Galerie',
    },
    faq: {
      eyebrow: 'FAQ',
      title: 'Fragen',
      chat: {
        question: 'Kann ich sie in einem Chat oder Dokument verwenden?',
        answer:
          'Ja. Lade das Emoji in der Galerie als GIF, animiertes WebP oder stehendes PNG herunter und füge es wie jedes Bild zu deiner Nachricht oder Datei hinzu.',
      },
      speed: {
        question: 'Machen sie meine Seite langsamer?',
        answer:
          'Nein. Jedes Emoji reserviert seinen Platz, solange es lädt, also springt nichts, und die Animationsdateien werden erst geladen, wenn ein Emoji angezeigt wird.',
      },
      motion: {
        question: 'Was passiert, wenn jemand weniger Bewegung bevorzugt?',
        answer:
          'Das Emoji bleibt auf seinem ersten Bild stehen. Es bewegt sich nur, wenn die Besucherin oder der Besucher Bewegung eingeschaltet gelassen hat.',
      },
    },
  },
  docs: {
    howToGroup: 'Anleitungen',
    copyMarkdown: 'Seite als Markdown kopieren',
    copiedMarkdown: 'Kopiert',
    notices: {
      missing:
        'Diese Seite ist in deiner Sprache noch nicht verfügbar. Es wird die englische Version angezeigt.',
      stale:
        'Die Übersetzung dieser Seite ist veraltet. Es wird die englische Version angezeigt.',
    },
  },
  gallery: {
    title: 'Emoji-Galerie',
    description:
      'Durchsuche die animierten Fluent-Emojis, wähle eine Hautfarbe und kopiere den Code für React, Vue, Svelte, Astro oder reines HTML.',
    searchLabel: 'Emojis suchen',
    searchPlaceholder:
      '{count} Emojis durchsuchen, z. B. „Feuer“ oder „winken“',
    categoryLabel: 'Kategorie',
    categoryAll: 'Alle',
    toneLabel: 'Hautfarbe',
    toneDefault: 'Standard',
    toneLight: 'Hell',
    toneMediumLight: 'Mittelhell',
    toneMedium: 'Mittel',
    toneMediumDark: 'Mitteldunkel',
    toneDark: 'Dunkel',
    noSkinTones: 'Keine Hautfarben',
    sizeLabel: 'Größe',
    resultsLabel: 'Emojis',
    resultsCount: '{count} Emojis',
    showMore: 'Mehr anzeigen',
    detailLabel: 'Emoji-Details',
    detailEmpty: 'Wähle ein Emoji, um seinen Code zu sehen.',
    closeDetail: 'Schließen',
    idLabel: 'ID',
    snippetLabel: 'Code',
    tabReact: 'React',
    tabVue: 'Vue',
    tabSvelte: 'Svelte',
    tabAstro: 'Astro',
    tabHtml: 'HTML',
    tabNoCode: 'Ohne Code',
    copySnippet: 'Snippet kopieren',
    copyUrl: 'URL kopieren',
    copyId: 'ID kopieren',
    copyName: 'Namen kopieren',
    zoomLabel: 'Zoom',
    download: 'Herunterladen',
    downloadGif: 'GIF herunterladen',
    downloadWebp: 'WebP herunterladen',
    downloadPng: 'PNG herunterladen',
    downloadFailed: 'Der Download ist fehlgeschlagen. Versuch es noch einmal.',
    copied: 'Kopiert',
    noResultsTitle: 'Kein Emoji passt zu „{query}“',
    noResultsHint: 'Prüfe die Schreibweise oder versuch ein kürzeres Wort.',
    clearSearch: 'Suche löschen',
    errorTitle: 'Die Emoji-Liste konnte nicht geladen werden.',
    errorHint:
      'Prüfe deine Verbindung und versuch es noch einmal. Die Doku und der Rest der Website funktionieren weiterhin.',
    retry: 'Noch einmal versuchen',
    loading: 'Emojis werden geladen',
    filtersButton: 'Filter',
    customizeTitle: 'Anpassen',
  },
  emojiPage: {
    title: '{name}, animiertes Emoji · Animated Fluent Emojis',
    description:
      'Das animierte {name}-Emoji von Microsoft Fluent. Kopiere den Code für React, Vue, Svelte, Astro oder HTML, oder lade es als GIF, WebP oder PNG herunter.',
    breadcrumbLabel: 'Brotkrumennavigation',
    breadcrumbHome: 'Startseite',
    breadcrumbEmojis: 'Emojis',
    keywordsLabel: 'Schlagwörter',
    relatedTitle: 'Ähnliche Emojis',
  },
  notFound: {
    title: 'Diese Seite gibt es nicht.',
    body: 'Der Link ist vielleicht veraltet, oder das Emoji ist umgezogen.',
    home: 'Zur Startseite',
    gallery: 'Emojis durchstöbern',
  },
}
