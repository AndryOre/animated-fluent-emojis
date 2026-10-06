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
- `.astro` files follow the same TSDoc-only comment rule as `.ts` and `.tsx`.
