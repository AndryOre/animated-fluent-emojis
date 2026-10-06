import type { APIRoute, GetStaticPaths } from 'astro'

import { loadCatalog, type DocumentPage } from '../docs/catalog'
import { toPageMarkdown } from '../docs/markdown'
import { DOCS_DIR, TRANSLATIONS_DIR } from '../docs/paths'

export const getStaticPaths = (() =>
  loadCatalog({
    docsDirectory: DOCS_DIR,
    translationsDirectory: TRANSLATIONS_DIR,
  }).map((page) => ({
    params: { slug: page.id },
    props: { page },
  }))) satisfies GetStaticPaths

export const GET: APIRoute<{ page: DocumentPage }> = ({ props }) =>
  new Response(toPageMarkdown(props.page), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  })
