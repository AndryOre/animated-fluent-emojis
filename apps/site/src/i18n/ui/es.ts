import type { UiStrings } from './en'

/**
 * Spanish UI strings, in neutral Latin American Spanish.
 */
export const es: UiStrings = {
  meta: {
    siteName: 'Animated Fluent Emojis',
    description:
      'Emojis animados Fluent de Microsoft para la web, como biblioteca para React, Vue, Svelte, Astro y HTML simple.',
  },
  header: {
    skipLink: 'Saltar al contenido',
    homeLabel: 'Animated Fluent Emojis, inicio',
    navLabel: 'Principal',
    menu: 'Menú',
    nav: {
      gallery: 'Galería',
      docs: 'Documentación',
      github: 'GitHub',
    },
    languageLabel: 'Idioma',
    themeLabel: 'Tema',
    theme: {
      system: 'Sistema',
      light: 'Claro',
      dark: 'Oscuro',
    },
  },
  footer: {
    attribution:
      'Las ilustraciones de los emojis son de Microsoft. El código es de código abierto. No está afiliado a Microsoft ni cuenta con su respaldo.',
    navLabel: 'Pie de página',
    links: {
      gallery: 'Galería',
      docs: 'Documentación',
      github: 'GitHub',
      npm: 'npm',
    },
  },
  home: {
    title: 'Animated Fluent Emojis',
    tagline: 'Emojis Fluent, pero se mueven.',
    hero: {
      sub: 'Pasa el cursor. Te saluda.',
      installLabel: 'Comando de instalación',
      copy: 'Copiar',
      copied: 'Copiado',
      browse: 'Explorar los emojis',
      attribution:
        'Las ilustraciones de los emojis son de Microsoft. No está afiliado a Microsoft ni cuenta con su respaldo.',
      stageLabel: 'Un emoji de mano saludando, que se anima al pasar el cursor',
    },
    demo: {
      sizeLabel: 'Tamaño',
      toneLabel: 'Tono de piel',
      playsLabel: 'Se anima',
      tones: {
        default: 'Predeterminado',
        light: 'Claro',
        medium: 'Medio',
        dark: 'Oscuro',
      },
      plays: {
        hover: 'Al pasar el cursor',
        load: 'Al cargar',
      },
    },
    pillars: {
      title: 'Pensados para que sea fácil convivir con ellos',
      alive: {
        title: 'Vivos',
        body: 'Te saludan. Pasa el cursor sobre uno y míralo.',
      },
      light: {
        title: 'Ligeros',
        body: 'Nunca mueven tu página mientras cargan.',
      },
      considerate: {
        title: 'Considerados',
        body: 'Si alguien le pide a su dispositivo menos movimiento, el emoji se queda quieto.',
      },
      credit: {
        title: 'Claros sobre qué es de quién',
        body: 'Las ilustraciones de los emojis son de Microsoft. El código es de código abierto.',
      },
    },
    snippets: {
      title: 'Una etiqueta, cualquier sitio',
      body: 'Elige tu framework, copia el código y el emoji ya está en la página.',
      tabsLabel: 'Framework',
      copy: 'Copiar código',
      copied: 'Copiado',
    },
    noCode: {
      title: '¿Sin código? Sin problema.',
      body: 'Descarga cualquier emoji como GIF, WebP animado o PNG estático, y pégalo en un chat o en un documento.',
      cta: 'Explorar los emojis',
      teaserLabel: 'Algunos emojis de la galería',
    },
    faq: {
      title: 'Preguntas',
      chat: {
        question: '¿Puedo usarlos en un chat o en un documento?',
        answer:
          'Sí. Descarga el emoji como GIF, WebP animado o PNG estático desde la galería y agrégalo a tu mensaje o archivo como cualquier imagen.',
      },
      speed: {
        question: '¿Harán más lenta mi página?',
        answer:
          'No. Cada emoji reserva su espacio mientras carga, así que nada salta, y los archivos de animación solo se descargan cuando se muestra un emoji.',
      },
      motion: {
        question: '¿Qué pasa si alguien prefiere menos movimiento?',
        answer:
          'El emoji se queda quieto en su primer fotograma. Nunca se mueve, salvo que la persona haya dejado el movimiento activado.',
      },
    },
  },
  docs: {
    howToGroup: 'Guías prácticas',
    copyMarkdown: 'Copiar la página como Markdown',
    copiedMarkdown: 'Copiado',
    notices: {
      missing:
        'Esta página aún no está disponible en tu idioma. Se muestra la versión en inglés.',
      stale:
        'La traducción de esta página está desactualizada. Se muestra la versión en inglés.',
    },
  },
  gallery: {
    title: 'Galería de emojis',
    description:
      'Busca entre los emojis animados Fluent, elige un tono de piel y copia el código para React, Vue, Svelte, Astro o HTML simple.',
    searchLabel: 'Buscar emojis',
    searchPlaceholder: 'Busca entre {count} emojis, como “fuego” o “saludo”',
    categoryLabel: 'Categoría',
    categoryAll: 'Todas',
    toneLabel: 'Tono de piel',
    toneDefault: 'Predeterminado',
    toneLight: 'Claro',
    toneMediumLight: 'Medio claro',
    toneMedium: 'Medio',
    toneMediumDark: 'Medio oscuro',
    toneDark: 'Oscuro',
    noSkinTones: 'Sin tonos de piel',
    sizeLabel: 'Tamaño',
    resultsLabel: 'Emojis',
    resultsCount: '{count} emojis',
    showMore: 'Mostrar más',
    detailLabel: 'Detalles del emoji',
    detailEmpty: 'Selecciona un emoji para ver su código.',
    closeDetail: 'Cerrar',
    idLabel: 'ID',
    snippetLabel: 'Código',
    tabReact: 'React',
    tabVue: 'Vue',
    tabSvelte: 'Svelte',
    tabAstro: 'Astro',
    tabHtml: 'HTML',
    tabNoCode: 'Sin código',
    copySnippet: 'Copiar fragmento',
    copyUrl: 'Copiar URL',
    copyId: 'Copiar ID',
    downloadGif: 'Descargar GIF',
    downloadWebp: 'Descargar WebP',
    downloadPng: 'Descargar PNG',
    downloadFailed: 'La descarga falló. Inténtalo de nuevo.',
    copied: 'Copiado',
    noResultsTitle: 'Ningún emoji coincide con “{query}”',
    noResultsHint: 'Revisa la ortografía o prueba con una palabra más corta.',
    clearSearch: 'Borrar búsqueda',
    errorTitle: 'No se pudo cargar la lista de emojis.',
    errorHint:
      'Revisa tu conexión e inténtalo de nuevo. La documentación y el resto del sitio siguen funcionando.',
    retry: 'Reintentar',
    loading: 'Cargando emojis',
    filtersButton: 'Filtros',
    customizeTitle: 'Personalizar',
  },
  emojiPage: {
    title: '{name}, emoji animado · Animated Fluent Emojis',
    description:
      'El emoji animado {name} de Microsoft Fluent. Copia el código para React, Vue, Svelte, Astro o HTML, o descárgalo como GIF, WebP o PNG.',
    breadcrumbLabel: 'Ruta de navegación',
    breadcrumbHome: 'Inicio',
    breadcrumbEmojis: 'Emojis',
    keywordsLabel: 'Palabras clave',
    relatedTitle: 'Emojis relacionados',
  },
  notFound: {
    title: 'Esta página no está aquí.',
    body: 'Puede que el enlace sea antiguo, o que el emoji se haya movido.',
    home: 'Ir al inicio',
    gallery: 'Explorar los emojis',
  },
}
