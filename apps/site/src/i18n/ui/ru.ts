import type { UiStrings } from './en'

/**
 * Russian UI strings. Landing and social copy uses the plain vocabulary of
 * the brand voice guide; the docs notices use the technical one.
 */
export const ru: UiStrings = {
  meta: {
    siteName: 'Animated Fluent Emojis',
    description:
      'Библиотека анимированных эмодзи Microsoft Fluent для React, Vue, Svelte, Astro и обычного HTML.',
  },
  header: {
    skipLink: 'Перейти к содержимому',
    homeLabel: 'Animated Fluent Emojis, главная',
    navLabel: 'Основное',
    menu: 'Меню',
    nav: {
      gallery: 'Галерея',
      docs: 'Документация',
      github: 'GitHub',
    },
    languageLabel: 'Язык',
    themeLabel: 'Тема',
    theme: {
      system: 'Системная',
      light: 'Светлая',
      dark: 'Тёмная',
    },
  },
  footer: {
    attribution:
      'Графика эмодзи принадлежит Microsoft. Код с открытым исходным кодом. Проект не связан с Microsoft и не одобрен ею.',
    navLabel: 'Подвал',
    links: {
      gallery: 'Галерея',
      docs: 'Документация',
      github: 'GitHub',
      npm: 'npm',
    },
  },
  home: {
    title: 'Animated Fluent Emojis',
    tagline: 'Эмодзи Fluent оживают.',
    hero: {
      sub: 'Наведите курсор, и эмодзи помашет в ответ.',
      installLabel: 'Команда установки',
      copy: 'Копировать',
      copied: 'Скопировано',
      browse: 'Смотреть эмодзи',
      attribution:
        'Графика эмодзи принадлежит Microsoft. Проект не связан с Microsoft и не одобрен ею.',
      stageLabel: 'Машущее эмодзи, воспроизводится при наведении',
    },
    demo: {
      sizeLabel: 'Размер',
      toneLabel: 'Тон кожи',
      playsLabel: 'Воспроизведение',
      tones: {
        default: 'По умолчанию',
        light: 'Светлый',
        medium: 'Средний',
        dark: 'Тёмный',
      },
      plays: {
        hover: 'При наведении',
        load: 'При загрузке',
      },
    },
    pillars: {
      title: 'Приятно в использовании',
      alive: {
        title: 'Живые',
        body: 'Они машут в ответ. Наведите курсор и проверьте.',
      },
      light: {
        title: 'Лёгкие',
        body: 'Страница не прыгает, пока эмодзи загружаются.',
      },
      considerate: {
        title: 'Внимательные',
        body: 'Если на устройстве включено уменьшение движения, эмодзи остаются неподвижными.',
      },
      credit: {
        title: 'Авторство на виду',
        body: 'Графика эмодзи принадлежит Microsoft. Код с открытым исходным кодом.',
      },
    },
    snippets: {
      title: 'Один тег для любого сайта',
      body: 'Выберите фреймворк, скопируйте код, и эмодзи появится на вашей странице.',
      tabsLabel: 'Фреймворк',
      copy: 'Копировать код',
      copied: 'Скопировано',
    },
    noCode: {
      title: 'Код не нужен.',
      body: 'Скачайте любое эмодзи как GIF, анимированный WebP или статичный PNG и вставьте в чат или документ.',
      cta: 'Смотреть эмодзи',
      teaserLabel: 'Несколько эмодзи из галереи',
    },
    faq: {
      title: 'Частые вопросы',
      chat: {
        question: 'Можно ли использовать их в чатах и документах?',
        answer:
          'Да. Скачайте эмодзи из галереи как GIF, анимированный WebP или статичный PNG и добавьте в сообщение или файл, как обычную картинку.',
      },
      speed: {
        question: 'Не замедлят ли они страницу?',
        answer:
          'Нет. Каждое эмодзи заранее резервирует место, поэтому страница не прыгает при загрузке, а файл анимации запрашивается только тогда, когда эмодзи появляется на экране.',
      },
      motion: {
        question: 'Что увидят люди с включённым уменьшением движения?',
        answer:
          'Эмодзи остаётся неподвижным на первом кадре. Оно не двигается, пока посетитель сам не включит движение.',
      },
    },
  },
  docs: {
    howToGroup: 'Практические руководства',
    copyMarkdown: 'Копировать страницу как Markdown',
    copiedMarkdown: 'Скопировано',
    notices: {
      missing:
        'Эта страница пока недоступна на вашем языке. Показана версия на английском.',
      stale: 'Перевод этой страницы устарел. Показана версия на английском.',
    },
  },
  gallery: {
    title: 'Галерея эмодзи',
    description:
      'Ищите анимированные эмодзи Fluent, выбирайте тон кожи и копируйте код для React, Vue, Svelte, Astro и обычного HTML.',
    searchLabel: 'Поиск эмодзи',
    searchPlaceholder: 'Поиск среди {count} эмодзи, например «fire» или «wave»',
    categoryLabel: 'Категория',
    categoryAll: 'Все',
    toneLabel: 'Тон кожи',
    toneDefault: 'По умолчанию',
    toneLight: 'Светлый',
    toneMediumLight: 'Средне-светлый',
    toneMedium: 'Средний',
    toneMediumDark: 'Средне-тёмный',
    toneDark: 'Тёмный',
    noSkinTones: 'Без тонов кожи',
    sizeLabel: 'Размер',
    resultsLabel: 'Эмодзи',
    resultsCount: 'Эмодзи: {count}',
    showMore: 'Показать ещё',
    detailLabel: 'Сведения об эмодзи',
    detailEmpty: 'Выберите эмодзи, чтобы увидеть код.',
    closeDetail: 'Закрыть',
    idLabel: 'ID',
    snippetLabel: 'Код',
    tabReact: 'React',
    tabVue: 'Vue',
    tabSvelte: 'Svelte',
    tabAstro: 'Astro',
    tabHtml: 'HTML',
    tabNoCode: 'Без кода',
    copySnippet: 'Копировать код',
    copyUrl: 'Копировать URL',
    copyId: 'Копировать ID',
    downloadGif: 'Скачать GIF',
    downloadWebp: 'Скачать WebP',
    downloadPng: 'Скачать PNG',
    downloadFailed: 'Не удалось скачать. Попробуйте ещё раз.',
    copied: 'Скопировано',
    noResultsTitle: 'Нет эмодзи по запросу «{query}»',
    noResultsHint: 'Проверьте написание или попробуйте более короткое слово.',
    clearSearch: 'Очистить поиск',
    errorTitle: 'Не удалось загрузить эмодзи.',
    errorHint:
      'Проверьте подключение и попробуйте ещё раз. Документация и остальные разделы сайта работают.',
    retry: 'Повторить',
    loading: 'Загрузка эмодзи',
    filtersButton: 'Фильтры',
    customizeTitle: 'Настройка',
  },
  emojiPage: {
    title: '{name}, анимированное эмодзи · Animated Fluent Emojis',
    description:
      'Анимированное эмодзи Microsoft Fluent «{name}». Скопируйте код для React, Vue, Svelte, Astro и HTML или скачайте как GIF, WebP и PNG.',
    breadcrumbLabel: 'Навигационная цепочка',
    breadcrumbHome: 'Главная',
    breadcrumbEmojis: 'Эмодзи',
    keywordsLabel: 'Ключевые слова',
    relatedTitle: 'Похожие эмодзи',
  },
  notFound: {
    title: 'Страница не найдена.',
    body: 'Возможно, ссылка устарела или эмодзи переехало.',
    home: 'На главную',
    gallery: 'Смотреть эмодзи',
  },
}
