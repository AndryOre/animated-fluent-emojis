import type { UiStrings } from './en'

/**
 * Korean UI strings. Landing and social copy uses the plain vocabulary of the
 * brand voice guide; the docs notices use the technical one.
 */
export const ko: UiStrings = {
  meta: {
    siteName: 'Animated Fluent Emojis',
    description:
      'Microsoft의 Fluent 애니메이션 이모지를 React, Vue, Svelte, Astro, 일반 HTML에서 사용할 수 있는 라이브러리입니다.',
  },
  header: {
    skipLink: '본문으로 건너뛰기',
    homeLabel: 'Animated Fluent Emojis, 홈',
    navLabel: '메인',
    menu: '메뉴',
    nav: {
      gallery: '갤러리',
      docs: '문서',
      github: 'GitHub',
    },
    languageLabel: '언어',
    themeLabel: '테마',
    theme: {
      system: '시스템',
      light: '라이트',
      dark: '다크',
    },
  },
  footer: {
    attribution:
      '이모지 아트워크는 Microsoft의 것입니다. 코드는 오픈 소스입니다. Microsoft와 제휴하거나 승인받은 프로젝트가 아닙니다.',
    navLabel: '푸터',
    links: {
      gallery: '갤러리',
      docs: '문서',
      github: 'GitHub',
      npm: 'npm',
    },
  },
  home: {
    title: 'Animated Fluent Emojis',
    tagline: 'Fluent 이모지가 움직입니다.',
    hero: {
      sub: '마우스를 올리면 손을 흔들어 줍니다.',
      installLabel: '설치 명령어',
      copy: '복사',
      copied: '복사했어요',
      browse: '이모지 둘러보기',
      attribution:
        '이모지 아트워크는 Microsoft의 것입니다. Microsoft와 제휴하거나 승인받은 프로젝트가 아닙니다.',
      stageLabel: '마우스를 올리면 재생되는 손 흔드는 이모지',
    },
    demo: {
      sizeLabel: '크기',
      toneLabel: '피부색',
      playsLabel: '재생',
      tones: {
        default: '기본',
        light: '밝은',
        medium: '중간',
        dark: '어두운',
      },
      plays: {
        hover: '마우스를 올릴 때',
        load: '불러올 때',
      },
    },
    pillars: {
      eyebrow: '특징',
      title: '쓰기 편하게 만들었어요',
      alive: {
        title: '살아 있어요',
        body: '손을 흔들어 인사해 줍니다. 마우스를 올려 보세요.',
      },
      light: {
        title: '가벼워요',
        body: '불러오는 동안에도 페이지가 밀리지 않습니다.',
      },
      considerate: {
        title: '배려해요',
        body: '기기에서 동작 줄이기를 켜 두었다면 이모지는 멈춘 채로 있습니다.',
      },
      credit: {
        title: '누구의 것인지 분명하게',
        body: '이모지 아트워크는 Microsoft의 것입니다. 코드는 오픈 소스입니다.',
      },
    },
    snippets: {
      title: '태그 하나면 어느 사이트에서든',
      body: '프레임워크를 고르고 코드를 복사하면 이모지가 페이지에 나타납니다.',
      tabsLabel: '프레임워크',
      copy: '코드 복사',
      copied: '복사했어요',
    },
    noCode: {
      eyebrow: '노코드',
      formats: {
        gif: '모든 채팅에서 작동',
        webp: '애니메이션, 더 작은 용량',
        png: '정지 이미지',
      },
      title: '코드 없이도 괜찮아요.',
      body: '마음에 드는 이모지를 GIF, 애니메이션 WebP, 정지 PNG로 내려받아 채팅과 문서에 붙여 넣으세요.',
      cta: '이모지 둘러보기',
      teaserLabel: '갤러리에서 고른 이모지 몇 개',
    },
    faq: {
      eyebrow: '자주 묻는 질문',
      title: '자주 묻는 질문',
      chat: {
        question: '채팅이나 문서에서도 쓸 수 있나요?',
        answer:
          '네. 갤러리에서 이모지를 GIF, 애니메이션 WebP, 정지 PNG로 내려받아 일반 이미지처럼 메시지나 파일에 추가하세요.',
      },
      speed: {
        question: '페이지가 느려지지 않나요?',
        answer:
          '아니요. 각 이모지는 불러오는 동안에도 자리를 미리 잡아 두므로 페이지가 밀리지 않고, 애니메이션 파일은 이모지가 화면에 나타날 때만 가져옵니다.',
      },
      motion: {
        question: '동작 줄이기를 쓰는 사람에게는 어떻게 보이나요?',
        answer:
          '이모지는 첫 프레임에서 멈춘 채로 있습니다. 방문자가 동작을 켜지 않는 한 움직이지 않습니다.',
      },
    },
  },
  docs: {
    howToGroup: '사용 가이드',
    copyMarkdown: '페이지를 Markdown으로 복사',
    copiedMarkdown: '복사했어요',
    notices: {
      missing:
        '이 페이지는 아직 선택한 언어로 제공되지 않습니다. 영어 버전을 표시하고 있습니다.',
      stale:
        '이 페이지의 번역이 최신 상태가 아닙니다. 영어 버전을 표시하고 있습니다.',
    },
  },
  gallery: {
    title: '이모지 갤러리',
    description:
      'Fluent 애니메이션 이모지를 검색하고 피부색을 고른 뒤, React, Vue, Svelte, Astro, 일반 HTML용 코드를 복사하세요.',
    searchLabel: '이모지 검색',
    searchPlaceholder: '이모지 {count}개 검색 (예: "fire", "wave")',
    categoryLabel: '카테고리',
    categoryAll: '전체',
    toneLabel: '피부색',
    toneDefault: '기본',
    toneLight: '밝은',
    toneMediumLight: '약간 밝은',
    toneMedium: '중간',
    toneMediumDark: '약간 어두운',
    toneDark: '어두운',
    noSkinTones: '피부색 없음',
    sizeLabel: '크기',
    resultsLabel: '이모지',
    resultsCount: '이모지 {count}개',
    showMore: '더 보기',
    detailLabel: '이모지 상세 정보',
    detailEmpty: '이모지를 선택하면 코드가 표시됩니다.',
    closeDetail: '닫기',
    idLabel: 'ID',
    snippetLabel: '코드',
    tabReact: 'React',
    tabVue: 'Vue',
    tabSvelte: 'Svelte',
    tabAstro: 'Astro',
    tabHtml: 'HTML',
    tabNoCode: '코드 없이',
    copySnippet: '스니펫 복사',
    copyUrl: 'URL 복사',
    copyId: 'ID 복사',
    downloadGif: 'GIF 내려받기',
    downloadWebp: 'WebP 내려받기',
    downloadPng: 'PNG 내려받기',
    downloadFailed: '내려받지 못했습니다. 다시 시도해 주세요.',
    copied: '복사했어요',
    noResultsTitle: '"{query}"에 맞는 이모지가 없습니다',
    noResultsHint: '철자를 확인하거나 더 짧은 단어로 검색해 보세요.',
    clearSearch: '검색 지우기',
    errorTitle: '이모지 목록을 불러오지 못했습니다.',
    errorHint:
      '연결을 확인하고 다시 시도해 주세요. 문서와 사이트의 다른 부분은 계속 사용할 수 있습니다.',
    retry: '다시 시도',
    loading: '이모지를 불러오는 중',
    filtersButton: '필터',
    customizeTitle: '사용자 지정',
  },
  emojiPage: {
    title: '{name}, 애니메이션 이모지 · Animated Fluent Emojis',
    description:
      'Microsoft Fluent 애니메이션 이모지 "{name}". React, Vue, Svelte, Astro, HTML용 코드를 복사하거나 GIF, WebP, PNG로 내려받으세요.',
    breadcrumbLabel: '이동 경로',
    breadcrumbHome: '홈',
    breadcrumbEmojis: '이모지',
    keywordsLabel: '키워드',
    relatedTitle: '관련 이모지',
  },
  notFound: {
    title: '페이지를 찾을 수 없습니다.',
    body: '오래된 링크이거나 이모지가 옮겨졌을 수 있어요.',
    home: '홈으로',
    gallery: '이모지 둘러보기',
  },
}
