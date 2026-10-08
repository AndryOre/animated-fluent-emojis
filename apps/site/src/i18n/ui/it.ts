import type { UiStrings } from './en'

/**
 * Italian UI strings.
 */
export const it: UiStrings = {
  meta: {
    siteName: 'Animated Fluent Emojis',
    description:
      'Emoji animate Fluent di Microsoft per il web, come libreria per React, Vue, Svelte, Astro e HTML semplice.',
  },
  header: {
    skipLink: 'Vai al contenuto',
    homeLabel: 'Animated Fluent Emojis, home',
    navLabel: 'Principale',
    menu: 'Menu',
    nav: {
      gallery: 'Galleria',
      docs: 'Documentazione',
      github: 'GitHub',
    },
    languageLabel: 'Lingua',
    themeLabel: 'Tema',
    theme: {
      system: 'Sistema',
      light: 'Chiaro',
      dark: 'Scuro',
    },
  },
  footer: {
    attribution:
      'Le illustrazioni delle emoji sono di Microsoft. Il codice è open source. Non affiliato a Microsoft né approvato da Microsoft.',
    navLabel: 'Piè di pagina',
    links: {
      gallery: 'Galleria',
      docs: 'Documentazione',
      github: 'GitHub',
      npm: 'npm',
    },
  },
  home: {
    title: 'Animated Fluent Emojis',
    tagline: 'Emoji Fluent, ma si muovono.',
    hero: {
      sub: 'Passaci sopra. Ti saluta.',
      installLabel: 'Comando di installazione',
      copy: 'Copia',
      copied: 'Copiato',
      eyebrow: 'Open source',
      docs: 'Leggi la documentazione',
      browse: 'Sfoglia le emoji',
      attribution:
        'Le illustrazioni delle emoji sono di Microsoft. Non affiliato a Microsoft né approvato da Microsoft.',
    },
    demo: {
      sizeLabel: 'Dimensione',
      toneLabel: 'Tono della pelle',
      playsLabel: 'Si anima',
      emojiLabel: 'Emoji',
      reset: 'Ripristina',
      emojis: {
        wave: 'Mano che saluta',
        fire: 'Fuoco',
        party: 'Spara coriandoli',
        heart: 'Cuore rosso',
        rocket: 'Razzo',
        grin: 'Faccina sorridente',
      },
      tones: {
        default: 'Predefinito',
        light: 'Chiaro',
        medium: 'Medio',
        dark: 'Scuro',
      },
      plays: {
        hover: 'Al passaggio',
        load: 'Al caricamento',
      },
    },
    pillars: {
      eyebrow: 'Caratteristiche',
      title: 'Pensate per essere facili da usare',
      alive: {
        title: 'Vive',
        body: 'Ti salutano. Passaci sopra e guarda.',
      },
      light: {
        title: 'Leggere',
        body: 'Non spostano mai la tua pagina mentre si caricano.',
      },
      considerate: {
        title: 'Attente',
        body: "Se qualcuno chiede al proprio dispositivo meno movimento, l'emoji resta ferma.",
      },
      credit: {
        title: 'Chiare su cosa è di chi',
        body: 'Le illustrazioni delle emoji sono di Microsoft. Il codice è open source.',
      },
    },
    snippets: {
      title: 'Un solo tag, qualsiasi sito',
      body: "Scegli il tuo framework, copia il codice e l'emoji è sulla pagina.",
      tabsLabel: 'Framework',
      copy: 'Copia il codice',
      copied: 'Copiato',
    },
    noCode: {
      eyebrow: 'Senza codice',
      formats: {
        gif: 'Funziona in qualsiasi chat',
        webp: 'Animata, più leggera',
        png: "Un'immagine statica",
      },
      title: 'Niente codice? Nessun problema.',
      body: 'Scarica qualsiasi emoji come GIF, WebP animata o PNG statica e inseriscila in una chat o in un documento.',
      cta: 'Sfoglia le emoji',
      teaserLabel: 'Alcune emoji della galleria',
    },
    faq: {
      eyebrow: 'FAQ',
      title: 'Domande',
      chat: {
        question: 'Posso usarle in una chat o in un documento?',
        answer:
          "Sì. Scarica l'emoji come GIF, WebP animata o PNG statica dalla galleria, poi aggiungila al tuo messaggio o file come una qualsiasi immagine.",
      },
      speed: {
        question: 'Rallenteranno la mia pagina?',
        answer:
          "No. Ogni emoji riserva il proprio spazio mentre si carica, quindi nulla salta, e i file dell'animazione vengono recuperati solo quando un'emoji viene mostrata.",
      },
      motion: {
        question: 'Cosa succede se qualcuno preferisce meno movimento?',
        answer:
          "L'emoji resta ferma sul primo fotogramma. Non si muove mai, a meno che il visitatore non abbia lasciato attivo il movimento.",
      },
    },
  },
  docs: {
    howToGroup: 'Guide pratiche',
    copyMarkdown: 'Copia la pagina come Markdown',
    copiedMarkdown: 'Copiato',
    notices: {
      missing:
        'Questa pagina non è ancora disponibile nella tua lingua. Viene mostrata la versione in inglese.',
      stale:
        'La traduzione di questa pagina non è aggiornata. Viene mostrata la versione in inglese.',
    },
  },
  gallery: {
    title: 'Galleria delle emoji',
    description:
      'Cerca tra le emoji Fluent animate, scegli un tono della pelle e copia il codice per React, Vue, Svelte, Astro o HTML semplice.',
    searchLabel: 'Cerca emoji',
    searchPlaceholder: 'Cerca tra {count} emoji, come “fuoco” o “saluto”',
    categoryLabel: 'Categoria',
    categoryAll: 'Tutte',
    toneLabel: 'Tono della pelle',
    toneDefault: 'Predefinito',
    toneLight: 'Chiaro',
    toneMediumLight: 'Medio chiaro',
    toneMedium: 'Medio',
    toneMediumDark: 'Medio scuro',
    toneDark: 'Scuro',
    noSkinTones: 'Nessun tono della pelle',
    sizeLabel: 'Dimensione',
    resultsLabel: 'Emoji',
    resultsCount: '{count} emoji',
    showMore: 'Mostra altre',
    detailLabel: "Dettagli dell'emoji",
    detailEmpty: "Seleziona un'emoji per vedere il suo codice.",
    closeDetail: 'Chiudi',
    idLabel: 'ID',
    snippetLabel: 'Codice',
    tabReact: 'React',
    tabVue: 'Vue',
    tabSvelte: 'Svelte',
    tabAstro: 'Astro',
    tabHtml: 'HTML',
    tabNoCode: 'Senza codice',
    copySnippet: 'Copia lo snippet',
    copyUrl: "Copia l'URL",
    copyId: "Copia l'id",
    copyName: 'Copia il nome',
    zoomLabel: 'Zoom',
    download: 'Scarica',
    downloadGif: 'Scarica GIF',
    downloadWebp: 'Scarica WebP',
    downloadPng: 'Scarica PNG',
    downloadFailed: 'Download non riuscito. Riprova.',
    copied: 'Copiato',
    noResultsTitle: 'Nessuna emoji corrisponde a “{query}”',
    noResultsHint: "Controlla l'ortografia o prova con una parola più corta.",
    clearSearch: 'Cancella la ricerca',
    errorTitle: "Impossibile caricare l'elenco delle emoji.",
    errorHint:
      'Controlla la connessione e riprova. La documentazione e il resto del sito continuano a funzionare.',
    retry: 'Riprova',
    loading: 'Caricamento delle emoji',
    filtersButton: 'Filtri',
    customizeTitle: 'Personalizza',
  },
  emojiPage: {
    title: '{name}, emoji animata · Animated Fluent Emojis',
    description:
      "L'emoji animata {name} di Microsoft Fluent. Copia il codice per React, Vue, Svelte, Astro o HTML, oppure scaricala come GIF, WebP o PNG.",
    breadcrumbLabel: 'Briciole di pane',
    breadcrumbHome: 'Home',
    breadcrumbEmojis: 'Emoji',
    keywordsLabel: 'Parole chiave',
    relatedTitle: 'Emoji correlate',
  },
  notFound: {
    title: "Questa pagina non c'è.",
    body: "Il link potrebbe essere vecchio, o l'emoji potrebbe essere stata spostata.",
    home: 'Torna alla home',
    gallery: 'Sfoglia le emoji',
  },
}
