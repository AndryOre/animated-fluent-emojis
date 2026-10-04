# Roadmap

This document describes the project's direction at a high level. It is reviewed
yearly; day-to-day planning happens in
[GitHub issues](https://github.com/AndryOre/animated-fluent-emojis/issues),
which are the source of truth for what's actually being worked on next.

## Next 12 months

The focus for the next year is maintenance rather than new surface area:

- **Maintenance** — keeping dependencies, tooling, and CI current as React and
  the bundler ecosystem evolve.
- **React 19** — supporting React 19 as the primary target, with the library
  shipped as ESM-only.
- **Bug fixes** — addressing defects as they're reported.
- **Issue triage** — keeping the issue tracker current so contributors and users
  know what's open, planned, or declined.

## Future enhancements under consideration

Nothing is queued at the moment. New ideas are welcome as
[GitHub issues](https://github.com/AndryOre/animated-fluent-emojis/issues);
being listed here would never be a promise that they ship.

## Out of scope

The following are explicitly not planned:

- **Custom emoji artwork** — the library wraps Microsoft's Fluent emoji set and
  does not ship or accept original artwork.
- **Non-React framework wrappers** — Vue, Svelte, Solid, and similar bindings
  are not planned; the library targets React only.
- **Backend services and telemetry** — the library is a client-side component
  set; it makes no network calls of its own and collects no usage data.

## Where planning actually happens

This roadmap is intentionally coarse. Concrete, scheduled work lives in
[GitHub issues](https://github.com/AndryOre/animated-fluent-emojis/issues).
Those are the places to check for what's happening next, and the places to
propose new work.
