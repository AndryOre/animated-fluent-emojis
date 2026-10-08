# 0020: Build-time code highlighting

## Status

Accepted

Date: 2026-10-08

## Context

The website shows code in two places: the documentation, which Starlight renders
with Expressive Code, and its own snippets (the install command and the usage
snippet per adapter), which change with the chosen emoji, size and skin tone.
The snippets must look like the docs, follow the light and dark themes, and cost
almost no JavaScript. The CSP
([ADR 0018](0018-website-on-coolify-with-astro-and-starlight.md)) allows no
`eval`, so the highlighting cannot depend on generated code.

## Decision

Highlight at build time with [Expressive Code](https://expressive-code.com), and
let the client swap only literals.

- **One configuration**: `apps/site/src/highlight/code-config.ts` holds the
  themes (`github-light` and `github-dark`, keyed on the `.dark` class), the
  style overrides (12px radius, `var(--border)`, `var(--card)`, the mono token
  font, no frame shadow) and `@expressive-code/plugin-line-numbers`. Starlight
  and the site's snippet renderer both consume it.
- **Templates with placeholders**: for React, Vue, Svelte, Astro and the
  `<fluent-emoji>` element, per structural variant (with and without a tone),
  the build renders a template whose emoji id, size, tone and fallback glyph are
  sentinel values. The template text comes from `generateSnippet`, which stays
  the source of truth for the copied text.
- **One token per placeholder**: after highlighting, each sentinel is split out
  of its token into its own `data-snippet-slot` span that keeps the token's
  colors. A test asserts every placeholder is exactly one token in every
  language.
- **Client swap**: a small function replaces the text of those spans. It never
  tokenizes, so no highlighter ships to the browser, and a test asserts the
  swapped text equals `generateSnippet`'s output.
- **Package manager**: the install block uses a store that persists the choice
  under `afe:pm`, syncs blocks on the same page through an event, and keeps
  working when `localStorage` throws.

Rejected:

- **Shiki on the client**: the simplest way to highlight arbitrary text, but it
  adds about 145 KB gzipped plus grammars and a regex engine, for text that
  changes only in a few literals.
- **Sugar High and TanStack Highlight**: small, but neither has an Astro grammar
  and both only approximate the GitHub themes, so snippets would not match the
  docs.
- **Prism and highlight.js**: weak TSX, Vue and Svelte grammars, and no shared
  theme with the docs.
- **A hand-written tokenizer**: another grammar to maintain for five languages,
  and it would still need to match the themes.

## Consequences

- No new client JavaScript for highlighting and no CSP hash change: the markup
  is static and the swap only sets `textContent`.
- Shiki and its regex engine run only during the build.
- Snippet markup is rendered once per language and variant, not once per emoji,
  which keeps the page weight flat as the catalog grows.
- A new snippet shape must keep each placeholder inside a string or number
  literal or a text node; the placeholder test fails otherwise.
- Docs code blocks pick up the new themes and line numbers; shell commands are
  excluded from line numbering.
- New direct dependencies: `expressive-code`,
  `@expressive-code/plugin-line-numbers` and `hast-util-to-html`, plus
  `@types/hast` for types.
