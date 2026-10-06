import type { Loader, LoaderContext } from 'astro/loaders'

import { loadCatalog } from './catalog'
import { rewriteMarkdownLinks } from './markdown'
import { DOCS_DIR, TRANSLATIONS_DIR } from './paths'

async function loadPages(context: LoaderContext): Promise<void> {
  context.store.clear()
  const pages = loadCatalog({
    docsDirectory: DOCS_DIR,
    translationsDirectory: TRANSLATIONS_DIR,
  })
  for (const page of pages) {
    const data = await context.parseData({
      id: page.id,
      data: {
        title: page.title,
        ...(page.description && { description: page.description }),
        editUrl: page.editUrl,
        translationStatus: page.status,
      },
    })
    const body = rewriteMarkdownLinks(page.body, page)
    context.store.set({
      id: page.id,
      data,
      body: page.body,
      digest: context.generateDigest(`${page.status}\n${page.body}`),
      rendered: await context.renderMarkdown(body),
    })
  }
}

/**
 * Content loader for the Starlight `docs` collection. It emits one entry per
 * published doc and locale from the repository `docs/` folder and the site's
 * translation files, and records each entry's translation status for the
 * notice.
 * @returns A loader that fills the store on every build and file change.
 */
export function docsCatalogLoader(): Loader {
  return {
    name: 'docs-catalog-loader',
    async load(context) {
      await loadPages(context)
      context.watcher?.add([DOCS_DIR, TRANSLATIONS_DIR])
      context.watcher?.on('change', (file) => {
        if (file.startsWith(DOCS_DIR) || file.startsWith(TRANSLATIONS_DIR)) {
          void loadPages(context)
        }
      })
    },
  }
}
