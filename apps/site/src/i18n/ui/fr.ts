import type { UiStrings } from './en'

/**
 * French UI strings.
 */
export const fr: UiStrings = {
  meta: {
    siteName: 'Animated Fluent Emojis',
    description:
      'Les emojis animés Fluent de Microsoft pour le web, sous forme de bibliothèque pour React, Vue, Svelte, Astro et HTML simple.',
  },
  header: {
    skipLink: 'Aller au contenu',
    homeLabel: 'Animated Fluent Emojis, accueil',
    navLabel: 'Principale',
    menu: 'Menu',
    nav: {
      gallery: 'Galerie',
      docs: 'Documentation',
      github: 'GitHub',
    },
    languageLabel: 'Langue',
    themeLabel: 'Thème',
    theme: {
      system: 'Système',
      light: 'Clair',
      dark: 'Sombre',
    },
  },
  footer: {
    attribution:
      "Les illustrations des emojis appartiennent à Microsoft. Le code est open source. Ce projet n'est ni affilié à Microsoft ni approuvé par Microsoft.",
    navLabel: 'Pied de page',
    links: {
      gallery: 'Galerie',
      docs: 'Documentation',
      github: 'GitHub',
      npm: 'npm',
    },
  },
  home: {
    title: 'Animated Fluent Emojis',
    tagline: 'Des emojis Fluent, mais qui bougent.',
    hero: {
      sub: 'Survolez-le. Il vous salue en retour.',
      installLabel: "Commande d'installation",
      copy: 'Copier',
      copied: 'Copié',
      eyebrow: 'Open source',
      docs: 'Lire la documentation',
      browse: 'Parcourir les emojis',
      attribution:
        "Les illustrations des emojis appartiennent à Microsoft. Ce projet n'est ni affilié à Microsoft ni approuvé par Microsoft.",
    },
    demo: {
      sizeLabel: 'Taille',
      toneLabel: 'Teinte de peau',
      playsLabel: "S'anime",
      emojiLabel: 'Emoji',
      reset: 'Réinitialiser',
      emojis: {
        wave: 'Main qui salue',
        fire: 'Feu',
        party: 'Cotillon',
        heart: 'Cœur rouge',
        rocket: 'Fusée',
        grin: 'Visage souriant',
      },
      tones: {
        default: 'Par défaut',
        light: 'Claire',
        medium: 'Moyenne',
        dark: 'Foncée',
      },
      plays: {
        hover: 'Au survol',
        load: 'Au chargement',
      },
    },
    pillars: {
      eyebrow: 'Atouts',
      title: 'Pensés pour être agréables à vivre',
      alive: {
        title: 'Vivants',
        body: 'Ils vous saluent en retour. Survolez-en un et voyez.',
      },
      light: {
        title: 'Légers',
        body: 'Ils ne bousculent jamais votre page pendant leur chargement.',
      },
      considerate: {
        title: 'Attentionnés',
        body: "Si quelqu'un demande à son appareil moins de mouvement, l'emoji reste immobile.",
      },
      credit: {
        title: 'Clair sur ce qui appartient à qui',
        body: 'Les illustrations des emojis appartiennent à Microsoft. Le code est open source.',
      },
    },
    snippets: {
      title: 'Une balise, tous les sites',
      body: "Choisissez votre framework, copiez le code, et l'emoji est sur la page.",
      tabsLabel: 'Framework',
      copy: 'Copier le code',
      copied: 'Copié',
    },
    noCode: {
      eyebrow: 'Sans code',
      formats: {
        gif: "Fonctionne dans n'importe quel chat",
        webp: 'Animé, plus léger',
        png: 'Une image fixe',
      },
      title: 'Pas de code ? Aucun souci.',
      body: "Téléchargez n'importe quel emoji en GIF, en WebP animé ou en PNG fixe, puis glissez-le dans une discussion ou un document.",
      cta: 'Parcourir les emojis',
      teaserLabel: 'Quelques emojis de la galerie',
    },
    faq: {
      eyebrow: 'FAQ',
      title: 'Questions',
      chat: {
        question: 'Puis-je les utiliser dans une discussion ou un document ?',
        answer:
          "Oui. Téléchargez l'emoji en GIF, en WebP animé ou en PNG fixe depuis la galerie, puis ajoutez-le à votre message ou à votre fichier comme n'importe quelle image.",
      },
      speed: {
        question: 'Vont-ils ralentir ma page ?',
        answer:
          "Non. Chaque emoji réserve sa place pendant son chargement, donc rien ne saute, et les fichiers d'animation ne sont récupérés que lorsqu'un emoji est affiché.",
      },
      motion: {
        question: "Que se passe-t-il si quelqu'un préfère moins de mouvement ?",
        answer:
          "L'emoji reste immobile sur sa première image. Il ne bouge que si le visiteur a laissé le mouvement activé.",
      },
    },
  },
  docs: {
    howToGroup: 'Guides pratiques',
    copyMarkdown: 'Copier la page en Markdown',
    copiedMarkdown: 'Copié',
    notices: {
      missing:
        "Cette page n'est pas encore disponible dans votre langue. La version anglaise est affichée.",
      stale:
        'La traduction de cette page est obsolète. La version anglaise est affichée.',
    },
  },
  gallery: {
    title: "Galerie d'emojis",
    description:
      'Recherchez parmi les emojis animés Fluent, choisissez une teinte de peau et copiez le code pour React, Vue, Svelte, Astro ou HTML simple.',
    searchLabel: 'Rechercher des emojis',
    searchPlaceholder:
      'Rechercher parmi {count} emojis, comme « feu » ou « salut »',
    categoryLabel: 'Catégorie',
    categoryAll: 'Toutes',
    toneLabel: 'Teinte de peau',
    toneDefault: 'Par défaut',
    toneLight: 'Claire',
    toneMediumLight: 'Moyennement claire',
    toneMedium: 'Moyenne',
    toneMediumDark: 'Moyennement foncée',
    toneDark: 'Foncée',
    noSkinTones: 'Aucune teinte de peau',
    sizeLabel: 'Taille',
    resultsLabel: 'Emojis',
    resultsCount: '{count} emojis',
    showMore: 'Afficher plus',
    detailLabel: "Détails de l'emoji",
    detailEmpty: 'Sélectionnez un emoji pour voir son code.',
    closeDetail: 'Fermer',
    idLabel: 'ID',
    snippetLabel: 'Code',
    tabReact: 'React',
    tabVue: 'Vue',
    tabSvelte: 'Svelte',
    tabAstro: 'Astro',
    tabHtml: 'HTML',
    tabNoCode: 'Sans code',
    copySnippet: "Copier l'extrait",
    copyUrl: "Copier l'URL",
    copyId: "Copier l'id",
    copyName: 'Copier le nom',
    zoomLabel: 'Zoom',
    download: 'Télécharger',
    downloadGif: 'Télécharger le GIF',
    downloadWebp: 'Télécharger le WebP',
    downloadPng: 'Télécharger le PNG',
    downloadFailed: 'Le téléchargement a échoué. Réessayez.',
    copied: 'Copié',
    noResultsTitle: 'Aucun emoji ne correspond à « {query} »',
    noResultsHint: "Vérifiez l'orthographe ou essayez un mot plus court.",
    clearSearch: 'Effacer la recherche',
    errorTitle: "La liste des emojis n'a pas pu se charger.",
    errorHint:
      'Vérifiez votre connexion et réessayez. La documentation et le reste du site fonctionnent toujours.',
    retry: 'Réessayer',
    loading: 'Chargement des emojis',
    filtersButton: 'Filtres',
    customizeTitle: 'Personnaliser',
  },
  emojiPage: {
    title: '{name}, emoji animé · Animated Fluent Emojis',
    description:
      "L'emoji animé {name} de Microsoft Fluent. Copiez le code pour React, Vue, Svelte, Astro ou HTML, ou téléchargez-le en GIF, WebP ou PNG.",
    breadcrumbLabel: "Fil d'Ariane",
    breadcrumbHome: 'Accueil',
    breadcrumbEmojis: 'Emojis',
    keywordsLabel: 'Mots-clés',
    relatedTitle: 'Emojis similaires',
  },
  notFound: {
    title: "Cette page n'existe pas.",
    body: "Le lien est peut-être ancien, ou l'emoji a peut-être changé de place.",
    home: "Retour à l'accueil",
    gallery: 'Parcourir les emojis',
  },
}
