import type { UiStrings } from './en'

/**
 * Brazilian Portuguese UI strings. Landing and social copy uses the plain
 * vocabulary of the brand voice guide; the docs notices use the technical one.
 */
export const pt_BR: UiStrings = {
  meta: {
    siteName: 'Animated Fluent Emojis',
    description:
      'Uma biblioteca com os emojis animados Fluent da Microsoft para React, Vue, Svelte, Astro e HTML puro.',
  },
  header: {
    skipLink: 'Ir para o conteúdo',
    homeLabel: 'Animated Fluent Emojis, início',
    navLabel: 'Principal',
    menu: 'Menu',
    nav: {
      gallery: 'Galeria',
      docs: 'Documentação',
      github: 'GitHub',
    },
    languageLabel: 'Idioma',
    themeLabel: 'Tema',
    theme: {
      system: 'Sistema',
      light: 'Claro',
      dark: 'Escuro',
    },
  },
  footer: {
    attribution:
      'A arte dos emojis é da Microsoft. O código é aberto. Não temos afiliação nem aprovação da Microsoft.',
    navLabel: 'Rodapé',
    links: {
      gallery: 'Galeria',
      docs: 'Documentação',
      github: 'GitHub',
      npm: 'npm',
    },
  },
  home: {
    title: 'Animated Fluent Emojis',
    tagline: 'Os emojis Fluent ganham vida.',
    hero: {
      sub: 'Passe o mouse e ele acena de volta.',
      installLabel: 'Comando de instalação',
      copy: 'Copiar',
      copied: 'Copiado',
      browse: 'Ver os emojis',
      attribution:
        'A arte dos emojis é da Microsoft. Não temos afiliação nem aprovação da Microsoft.',
      stageLabel: 'Emoji acenando, que anima ao passar o mouse',
    },
    demo: {
      sizeLabel: 'Tamanho',
      toneLabel: 'Tom de pele',
      playsLabel: 'Animar',
      tones: {
        default: 'Padrão',
        light: 'Claro',
        medium: 'Médio',
        dark: 'Escuro',
      },
      plays: {
        hover: 'Ao passar o mouse',
        load: 'Ao carregar',
      },
    },
    pillars: {
      title: 'Feito para ser agradável de usar',
      alive: {
        title: 'Cheio de vida',
        body: 'Ele acena de volta. Passe o mouse e veja.',
      },
      light: {
        title: 'Leve',
        body: 'A página não se mexe enquanto os emojis carregam.',
      },
      considerate: {
        title: 'Atencioso',
        body: 'Se o dispositivo está configurado para reduzir movimento, os emojis ficam parados.',
      },
      credit: {
        title: 'Créditos claros',
        body: 'A arte dos emojis é da Microsoft. O código é aberto.',
      },
    },
    snippets: {
      title: 'Uma tag, em qualquer site',
      body: 'Escolha seu framework, copie o código e o emoji aparece na página.',
      tabsLabel: 'Frameworks',
      copy: 'Copiar código',
      copied: 'Copiado',
    },
    noCode: {
      title: 'Sem código? Sem problema.',
      body: 'Baixe qualquer emoji como GIF, WebP animado ou PNG estático e cole no chat ou em um documento.',
      cta: 'Ver os emojis',
      teaserLabel: 'Alguns emojis da galeria',
    },
    faq: {
      title: 'Perguntas frequentes',
      chat: {
        question: 'Posso usar os emojis em chats e documentos?',
        answer:
          'Sim. Baixe um emoji da galeria como GIF, WebP animado ou PNG estático e adicione a mensagens e arquivos como qualquer outra imagem.',
      },
      speed: {
        question: 'Eles deixam minha página lenta?',
        answer:
          'Não. Cada emoji reserva seu espaço enquanto carrega, então a página não se mexe, e o arquivo da animação só é buscado quando o emoji aparece.',
      },
      motion: {
        question: 'E para quem reduz o movimento?',
        answer:
          'O emoji fica parado no primeiro quadro. Ele só se move se a pessoa ativar o movimento.',
      },
    },
  },
  docs: {
    howToGroup: 'Guias práticos',
    copyMarkdown: 'Copiar página como Markdown',
    copiedMarkdown: 'Copiado',
    notices: {
      missing:
        'Esta página ainda não está disponível no seu idioma. Você está vendo a versão em inglês.',
      stale:
        'A tradução desta página está desatualizada. Você está vendo a versão em inglês.',
    },
  },
  gallery: {
    title: 'Galeria de emojis',
    description:
      'Pesquise os emojis animados Fluent, escolha um tom de pele e copie o código para React, Vue, Svelte, Astro e HTML puro.',
    searchLabel: 'Pesquisar emojis',
    searchPlaceholder: 'Pesquise entre {count} emojis, como “fire” ou “wave”',
    categoryLabel: 'Categoria',
    categoryAll: 'Todos',
    toneLabel: 'Tom de pele',
    toneDefault: 'Padrão',
    toneLight: 'Claro',
    toneMediumLight: 'Médio-claro',
    toneMedium: 'Médio',
    toneMediumDark: 'Médio-escuro',
    toneDark: 'Escuro',
    noSkinTones: 'Sem tons de pele',
    sizeLabel: 'Tamanho',
    resultsLabel: 'Emojis',
    resultsCount: '{count} emojis',
    showMore: 'Mostrar mais',
    detailLabel: 'Detalhes do emoji',
    detailEmpty: 'Escolha um emoji para ver o código.',
    closeDetail: 'Fechar',
    idLabel: 'ID',
    snippetLabel: 'Código',
    tabReact: 'React',
    tabVue: 'Vue',
    tabSvelte: 'Svelte',
    tabAstro: 'Astro',
    tabHtml: 'HTML',
    tabNoCode: 'Sem código',
    copySnippet: 'Copiar trecho',
    copyUrl: 'Copiar URL',
    copyId: 'Copiar ID',
    downloadGif: 'Baixar GIF',
    downloadWebp: 'Baixar WebP',
    downloadPng: 'Baixar PNG',
    downloadFailed: 'Não foi possível baixar. Tente novamente.',
    copied: 'Copiado',
    noResultsTitle: 'Nenhum emoji para “{query}”',
    noResultsHint: 'Confira a grafia ou tente uma palavra mais curta.',
    clearSearch: 'Limpar pesquisa',
    errorTitle: 'Não foi possível carregar os emojis.',
    errorHint:
      'Verifique sua conexão e tente novamente. A documentação e o resto do site continuam funcionando.',
    retry: 'Tentar novamente',
    loading: 'Carregando emojis',
    filtersButton: 'Filtros',
    customizeTitle: 'Personalizar',
  },
  emojiPage: {
    title: '{name}, emoji animado · Animated Fluent Emojis',
    description:
      'O emoji animado Microsoft Fluent “{name}”. Copie o código para React, Vue, Svelte, Astro e HTML, ou baixe como GIF, WebP e PNG.',
    breadcrumbLabel: 'Trilha de navegação',
    breadcrumbHome: 'Início',
    breadcrumbEmojis: 'Emojis',
    keywordsLabel: 'Palavras-chave',
    relatedTitle: 'Emojis relacionados',
  },
  notFound: {
    title: 'Página não encontrada.',
    body: 'O link pode estar desatualizado, ou o emoji mudou de lugar.',
    home: 'Ir para o início',
    gallery: 'Ver os emojis',
  },
}
