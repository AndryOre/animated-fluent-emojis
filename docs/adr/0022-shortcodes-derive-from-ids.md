# 0022: Shortcodes derive from ids

## Status

Accepted

Date: 2026-10-12

## Context

Lookup resolves unicode and descriptions, and users also write `:name:` in
chat-style text. The upstream catalog carries shortcut aliases, but the slim
manifest drops them to stay small
([ADR 0008](0008-static-keyframes-and-lazy-slim-manifest.md),
[ADR 0011](0011-compact-slim-manifest-and-hd-frame-cap.md)), and lookup must
stay inside its size budget without a new fetch.

## Decision

A shortcode is `:name:` matched, ignoring case, against emoji ids already in the
loaded manifest: first the exact id, then the id without its code point prefix.

- **Exact ids win**: three names collide after stripping the prefix (`turkey`,
  `umbrella`, `camera`); the plain id wins and the prefixed entry stays
  reachable by its full id.
- **Among stripped names**, the first entry in catalog order wins.
- **No aliases and no manifest change**: shortcodes are a view over ids.

Rejected:

- **Restoring upstream shortcuts in the manifest**: it grows the manifest for
  every consumer and needs a manifest version bump.
- **A separate shortcode table fetched on demand**: it adds a request and a
  second artifact to keep in sync.

## Consequences

- No manifest change and no new request. The lookup bundle grows by about 150 B
  brotlied, so its size limit moves from 2.8 kB to 3 kB.
- Shortcodes are not the names other tools use: `:fire:` works because the id is
  `fire`, while common aliases from other emoji sets may not resolve.
- Renaming an id changes its shortcode; because ids are public, ids are already
  treated as stable, and changing that rule is hard to reverse.
- The collision rule is surprising: `:turkey:` is the food, and the bird needs
  `:1f983_turkey:`.
