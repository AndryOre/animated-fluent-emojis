# Set up asset hosting

The manifest and sprites are published to Cloudflare Pages by
`.github/workflows/sync-assets.yml`
([ADR 0006](../adr/0006-cloudflare-pages-asset-hosting.md)). This is done once;
after that the workflow keeps the site current.

## One-time setup

1. Create a Pages project named `animated-fluent-emojis` with the production
   branch `main`. It is a direct-upload project, so it is not connected to Git.
2. Create a Cloudflare API token limited to the account, with the permission
   **Account → Cloudflare Pages → Edit**.
3. Store the secrets in the repository:

   ```sh
   gh secret set CLOUDFLARE_ACCOUNT_ID --body "<account id>"
   gh secret set CLOUDFLARE_API_TOKEN
   ```

4. In the repository settings, allow GitHub Actions to create and approve pull
   requests, and enable auto-merge. The workflow opens a pull request with the
   regenerated emoji lists.

## First deployment

Run the workflow once from the Actions tab (**Sync Assets → Run workflow**, with
_Rebuild and redeploy even when nothing changed_ ticked). To deploy from a
machine instead, build and upload the site directly:

```sh
bun run assets:build
CLOUDFLARE_API_TOKEN=<token> bunx wrangler pages deploy dist-assets \
  --project-name animated-fluent-emojis --branch main
```

## Day to day

- The workflow runs every Monday and rebuilds only when a new Teams manifest or
  a new commit of Microsoft's repository is found.
- `bun run assets:detect` shows what it would do without changing anything.
- `bun run assets:build -- --limit 20` builds a small sample into `dist-assets/`
  for a quick local check. Building needs `ffmpeg` and `ffprobe` installed.
- `bun run assets:lists` regenerates `docs/EMOJI_LIST_*.md` from
  `dist-assets/manifest.json`.
- A new Teams manifest hash that the web client does not advertise yet can be
  added to `scripts/assets/known-teams-versions.ts`.
