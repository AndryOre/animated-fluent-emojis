# How-to guides

Task-focused recipes. For the full API, see the [usage guide](../usage.md).

## Using the library

- [`self-host-the-assets.md`](self-host-the-assets.md): serve the manifest and
  sprite sheets from your own origin and set the Content Security Policy.
- [`use-with-nextjs.md`](use-with-nextjs.md): the client boundary, the
  stylesheet import and where to call `configureEmojis` and `preloadEmojis`.
- [`preload-for-a-picker.md`](preload-for-a-picker.md): warm the manifest and
  sprite sheets before an emoji picker opens.
- [`use-with-angular.md`](use-with-angular.md): register `<fluent-emoji>`, allow
  the tag and bind properties and events in Angular.
- [`use-with-solid.md`](use-with-solid.md): the typed `<fluent-emoji>` tag and
  its events in Solid.
- [`use-with-preact.md`](use-with-preact.md): `<fluent-emoji>`, or the React
  adapter through `preact/compat`.

Vue, Svelte, Astro and React are covered by the
[usage guide](../usage.md#frameworks).

## Using the files

- [`use-without-code.md`](use-without-code.md): put an emoji in Slack, Notion,
  Google Docs, email or a GitHub README from a link, with no code.

## Maintaining

- [`cut-a-release.md`](cut-a-release.md): releasing and the npm trusted
  publisher setup.
- [`set-up-asset-hosting.md`](set-up-asset-hosting.md): creating the Cloudflare
  Pages project and the secrets behind the asset site.
- [`roll-back-the-asset-site.md`](roll-back-the-asset-site.md): restoring an
  earlier asset site deployment.
- [`translate-the-website.md`](translate-the-website.md): add a website
  translation and refresh a stale one with `i18n:status`.
