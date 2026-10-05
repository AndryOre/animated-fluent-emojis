# How to roll back the asset site

The asset site is a Cloudflare Pages project (`animated-fluent-emojis`) that
`sync-assets.yml` redeploys whenever new emojis are detected. Every deployment
is kept, so a bad one is undone by promoting an earlier deployment back to
production. Nothing in the repository changes.

Use this when the `sync-assets failing` issue points at a smoke test failure, or
when the published manifest or sprites are broken.

## Roll back with the dashboard

1. Open the Cloudflare dashboard, then **Workers & Pages**, then the
   `animated-fluent-emojis` project, then **Deployments**.
2. Find the last deployment that served a good manifest. Check its preview URL:
   `/manifest.slim.json` and one sprite must load.
3. Open the deployment's menu and choose **Rollback to this deployment**, then
   confirm.

## Find the last good deployment with wrangler

`wrangler pages deployment` lists and inspects deployments but has no rollback
subcommand.

1. List the deployments and note the id of the last good one:
   `bunx wrangler pages deployment list --project-name=animated-fluent-emojis`
2. Check its preview URL, then promote it from the dashboard steps above. To
   script the promotion, call the Pages API:
   `POST /accounts/<account-id>/pages/projects/animated-fluent-emojis/deployments/<deployment-id>/rollback`
   with the same API token the workflow uses.

## After the rollback

- The weekly sync only redeploys when it detects new versions. Rolling back does
  not change that state, so the next run may redeploy the bad build. Fix the
  cause first, or leave the project pinned until you have.
- Run **Sync Assets** manually with `force` to rebuild and redeploy once the fix
  is merged.
- Close the `sync-assets failing` issue when a run goes green.

See [`set-up-asset-hosting.md`](set-up-asset-hosting.md) for the project and its
secrets.
