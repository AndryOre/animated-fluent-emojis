# 0019: shadcn on Base UI for the website

## Status

Accepted

Date: 2026-10-07

## Context

The website ([ADR 0018](0018-website-on-coolify-with-astro-and-starlight.md))
hand-rolls its UI primitives: buttons, toggles, tabs and menus are repeated
Tailwind class strings and ad-hoc scripts. Its design tokens already follow the
shadcn naming (`--background`, `--primary`, `--muted-foreground`, `--ring`,
`--radius`), so shadcn components can consume them with a thin mapping.
Accessible interactive primitives (focus management, keyboard support, ARIA) are
costly to get right by hand.

## Decision

Adopt [shadcn/ui](https://ui.shadcn.com) on [Base UI](https://base-ui.com)
(`bunx shadcn@latest init --base base`) in `apps/site`.

- **Location**: components live in `apps/site/src/components/ui`, helpers in
  `src/lib`, configured by `apps/site/components.json` (style `base-nova`,
  aliases under `@/`). New primitives are added with
  `bunx shadcn@latest add <name>`, never hand-rolled.
- **Tokens stay ours**: `docs/brand/tokens.css` and `src/styles/theme.css`
  remain the source of truth. The shadcn CSS variables and theme injected by
  `init` are not committed; `theme.css` maps the colors and `--radius` scale the
  components consume. The radius scale reproduces Tailwind's defaults at the
  brand `--radius`, so existing `rounded-*` utilities do not change.
- **Interactivity in islands**: Base UI components are React and only ship in
  islands, in line with the rule to default to static `.astro` components.
- **Static elements**: Astro components that need button styling with no
  JavaScript call `buttonVariants` (class-variance-authority) instead of
  repeating classes. A brand `pill` shape (`rounded-full`) is part of the
  variants.
- **Cleanup**: the CLI output is edited to match the repo rules: `//` comments
  are stripped ([ADR 0002](0002-tsdoc-only-code-comments.md)), exports get
  TSDoc, and `cn` is the standard `clsx` plus `tailwind-merge`.

Rejected:

- **Radix-based shadcn**: Base UI is the actively developed successor to the
  same primitives and is where shadcn is moving.
- **No shadcn**: keeps rebuilding accessible primitives and drifting class
  strings by hand.

## Consequences

- New runtime dependencies: `@base-ui/react`, `class-variance-authority`, `clsx`
  and `tailwind-merge`. Base UI is only bundled for pages that hydrate a
  component that uses it.
- Knip fails on unused exports and dependencies, so only components that are
  used are committed; each later ticket adds its own.
- Each `shadcn add` must be post-processed: strip `//` comments, add TSDoc, drop
  injected CSS and keep the `@/` imports working in Astro and Vitest
  (`resolve.tsconfigPaths`).
- Components under `src/components/ui` need a colocated test or a manifest
  exemption like any other module.
