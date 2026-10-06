# Translate the website

Add a translation of a docs page, or refresh one that went stale. The website
has ten locales (en, es, de, fr, it, ja, ko, pt-BR, ru, zh-CN); English is the
source and is served at the root. A missing or stale translation falls back to
the English page, so nothing breaks while a translation is pending.

## See what needs work

```sh
bun run i18n:status
```

The report lists every `missing` and `stale` page as `status locale doc`, then
totals. It exits non-zero only when a translation file is malformed.

## Add a translation

1. Pick a published doc from `PUBLISHED_DOCS` in
   `apps/site/src/docs/published.ts`, for example `how-to/use-with-solid.md`.
2. Create `apps/site/src/content/translations/<locale>/<same path>`, using the
   lowercase locale folder the existing ones use (`es`, `de`, `fr`).
3. Add the frontmatter, then the translated body:

   ```markdown
   ---
   title: Translated title
   sourceHash: <hash>
   ---
   ```

4. Compute the hash from the English source, as its first 16 hex characters of
   the SHA-256 with LF line endings:

   ```sh
   sha256sum docs/how-to/use-with-solid.md | cut -c1-16
   ```

5. Keep every fenced code block byte-identical to English. Translate prose, link
   text and headings only. A test fails when a block differs.
6. Run `bun run i18n:status`, then `bun run check` and `bun run test`.

## Refresh a stale translation

A translation is stale when its `sourceHash` no longer matches the English doc.

1. Run `bun run i18n:status` and note the `stale` entries.
2. Read the English diff (`git log -p -- docs/<path>`), update the translated
   prose to match, and keep the code blocks identical.
3. Replace `sourceHash` with the new hash from the command above.
4. Run `bun run i18n:status` again: the page counts as up to date.

## Add a locale

The ten locales are fixed by the site's design. Adding an eleventh is a code
change:

1. Add the tag and its native name to `LOCALES` and `LOCALE_NAMES` in
   `apps/site/src/i18n/locales.ts`.
2. Add `apps/site/src/i18n/ui/<locale>.ts` with every key of `en.ts` and
   register it in `apps/site/src/i18n/ui.ts`.
3. Translate pages as above.

`bun run check` and `bun run test` fail while a locale lacks a UI string.
