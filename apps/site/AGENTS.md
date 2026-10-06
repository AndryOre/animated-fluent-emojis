# AGENTS.md — `apps/site`

Stack rules for `@animated-fluent-emojis/site`, the website at
animated-fluent-emojis.andryore.dev. Repo-wide rules (scripts, commits,
comments) are in the root [`AGENTS.md`](../../AGENTS.md); the decision is
[ADR 0018](../../docs/adr/0018-website-on-coolify-with-astro-and-starlight.md).

## Stack

A static Astro 7 site with `@astrojs/react` islands, Tailwind CSS v4 and
Starlight for the docs. It depends on the library through
`animated-fluent-emojis@workspace:*` and renders emojis with the library's Astro
adapter.

## Rules

- Never run `bun run build`. Verify with `bun run check` and `bun run test` from
  the repo root.
- No third-party scripts, fonts, embeds or requests on page load, and no
  analytics of any kind. Fonts are self-hosted.
- Default to `.astro` components that render to static HTML. Use a React island
  (`client:*`) only for real interactivity.
- Docs are Starlight pages rendered from the allowlist in
  `src/docs/published.ts`; the English source stays in the repository `docs/`
  folder. Edit the English doc, never a copy.
- Ten locales (`src/i18n/locales.ts`), English at the root. UI strings live in
  `src/i18n/ui/`; a new key must exist in every locale.
- Translations live in `src/content/translations/<locale>/` and record the hash
  of their English source. After changing a published doc, run
  `bun run i18n:status` and refresh what it lists as stale. Code blocks stay
  byte-identical to English. Workflow:
  [`docs/how-to/translate-the-website.md`](../../docs/how-to/translate-the-website.md).
- `.astro` files follow the same TSDoc-only comment rule as `.ts` and `.tsx`.
