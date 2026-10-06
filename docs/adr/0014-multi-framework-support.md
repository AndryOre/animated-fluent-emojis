# 0014: Multi-framework support through subpath adapters

## Status

Accepted

Date: 2026-10-06

## Context

The library only works in React, yet nothing underneath needs it: the manifest
store, the sprite URLs and the lookup are already framework-free. The brand
brief listed other frameworks as out of scope, which no longer matches the
direction. Server rendering and idiomatic slots decide where a native adapter is
worth its cost and where a generic element is enough.

## Decision

Ship one package with subpath exports, still ESM-only
([ADR 0003](0003-esm-only-and-vite-8.md)). Bundling every framework into one
entry would make consumers pay for code they do not use, so each adapter lives
behind its own subpath.

| Subpath    | Contents                                                          |
| ---------- | ----------------------------------------------------------------- |
| `.`        | Framework-free: `configureEmojis`, `preloadEmojis`, `createEmoji` |
| `/react`   | React component and hooks                                         |
| `/element` | `<fluent-emoji>` Web Component                                    |
| `/vue`     | Native Vue adapter                                                |
| `/svelte`  | Native Svelte adapter                                             |
| `/astro`   | Native Astro adapter                                              |

Native adapters exist for frameworks where server rendering and idiomatic slots
matter:

- **Vue**: about 20M weekly npm downloads, and Nuxt renders it on the server.
- **Svelte**: SvelteKit renders it on the server.
- **Astro**: static-first, and a custom element renders nothing until its
  JavaScript loads, so the element alone is not enough.

Angular, Solid, Preact, Lit, Alpine, htmx and plain HTML use `<fluent-emoji>`.
Preact also works through `preact/compat` on the React build. Native Angular,
Solid, Qwik and Ember adapters are out of scope until someone asks for them.

Every adapter is a thin layer over a framework-free core (size and iteration
normalization, a pure playback-gate state machine that produces plain CSS style,
image wiring). React hooks, the vanilla `createEmoji` controller, Vue and Svelte
sit on it, and one shared conformance suite runs against every adapter.

React moves in two steps:

- **0.6**: `/react` is added and the root `Emoji` stays, marked `@deprecated`.
- **0.7**: the root `Emoji` is removed and `react` becomes an optional peer
  (done).

Before 0.7, `react` was a required peer. `vue`, `svelte` and `astro` become
optional peers when their adapter lands. A monorepo with one package per
framework was rejected: the release workflow, npm OIDC
([ADR 0005](0005-npm-trusted-publishing.md)), size-limit and publint all work as
they are, and splitting would multiply them.

## Consequences

- The root export stops being React; consumers migrate to `/react` during 0.6
  and see a deprecation warning in their editor.
- 0.7 is a breaking release gated on 0.6 being cut by a human.
- New adapters cost a subpath, an optional peer and a run of the conformance
  suite, not a new package.
- The brand brief no longer rules out other frameworks, and `CONTEXT.md` defines
  core, adapter and element.
