# Set up asset hosting

The manifest and sprites (the asset site) and the public GIF, WebP and PNG files
(the files site) are published to two Cloudflare Pages projects by
`.github/workflows/sync-assets.yml`
([ADR 0006](../adr/0006-cloudflare-pages-asset-hosting.md),
[ADR 0015](../adr/0015-public-files-site.md)). This is done once; after that the
workflow keeps both sites current.

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

4. Add the custom domain `animated-fluent-emojis-cdn.andryore.dev` to the Pages
   project (Custom domains tab). It is the address the library uses by default.
   The `animated-fluent-emojis.pages.dev` address keeps working alongside it.
5. Create a second Pages project named `animated-fluent-emojis-files` with the
   production branch `main`, also a direct-upload project. The same API token
   and secrets cover it, since the token is scoped to the account.
6. Add the custom domain `animated-fluent-emojis-files.andryore.dev` to the
   files project (Custom domains tab). The workflow builds the files site with
   that origin and smoke tests it there.
7. Create a fine-grained personal access token for the emoji-lists pull request
   ([ADR 0017](../adr/0017-personal-token-for-the-emoji-lists-pr.md)): resource
   owner is the maintainer, repository access is only this repository, and the
   permissions are **Contents: Read and write** and **Pull requests: Read and
   write** (Metadata read is implicit). Set no expiry. Store it, then enable
   auto-merge in the repository settings:

   ```sh
   gh secret set LISTS_BOT_TOKEN
   ```

   The workflow opens a pull request with the regenerated emoji lists using this
   token. The "Allow GitHub Actions to create and approve pull requests" setting
   stays off.

## First deployment

Run the workflow once from the Actions tab (**Sync Assets → Run workflow**, with
_Rebuild and redeploy even when nothing changed_ ticked). To deploy from a
machine instead, build and upload the site directly:

```sh
bun run assets:build
CLOUDFLARE_API_TOKEN=<token> bunx wrangler pages deploy apps/assets/dist-assets \
  --project-name animated-fluent-emojis --branch main
```

To deploy the files site from a machine, build the asset site first, then build
and upload the files site:

```sh
bun run assets:files
CLOUDFLARE_API_TOKEN=<token> bunx wrangler pages deploy apps/assets/dist-files \
  --project-name animated-fluent-emojis-files --branch main
```

The files site's first deployment can happen before it has a public index. Until
then the emoji-lists job in the workflow logs that `index.json` is missing and
uses the committed slug registry alone.

## Day to day

- The workflow runs every Monday and rebuilds only when a new Teams manifest or
  a new commit of Microsoft's repository is found.
- `bun run assets:detect` shows what it would do without changing anything.
- `bun run assets:build -- --limit 20` builds a small sample into
  `apps/assets/dist-assets/` for a quick local check. Building needs `ffmpeg`
  and `ffprobe` installed.
- `bun run assets:files` builds the files site into `apps/assets/dist-files/`
  from `apps/assets/dist-assets/`. The weekly run also rebuilds it when its
  `version.json` is missing or stale.
- `bun run assets:lists` regenerates `docs/EMOJI_LIST_*.md` from
  `apps/assets/dist-assets/manifest.json`.
- A new Teams manifest hash that the web client does not advertise yet can be
  added to `apps/assets/known-teams-versions.ts`.

### Rotate the lists token

1. Create a new fine-grained token with the same scopes as in step 7.
2. Store it with `gh secret set LISTS_BOT_TOKEN`.
3. Revoke the old token in the maintainer's token settings.
4. Re-run **Sync Assets** from the Actions tab and check that the emoji-lists
   pull request opens, passes CI and merges.

If the token is missing, revoked or lacks a scope, the emoji-lists step fails on
the next run where the lists changed (it exits before using the token when
nothing changed), and the `Report a failed sync` job opens or comments on the
`sync-assets failing` issue. Rotate the token, then re-run the workflow.
