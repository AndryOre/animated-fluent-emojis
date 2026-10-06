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

## Roll back the files site

The files site is a separate Pages project, `animated-fluent-emojis-files`, that
`sync-assets.yml` deploys right after the asset site. It rolls back the same
way, independently of the asset site: use the dashboard steps above, or the
`wrangler` and API calls with `animated-fluent-emojis-files` as the project
name. Check the deployment's preview URL first: `/version.json`, `/index.json`
and one file listed in it must load.

Roll back only the project that is broken. The `Smoke test the files site` step
failing points at the files site; the legacy and v1 smoke tests point at the
asset site. Published file URLs do not change between deployments, so a rollback
never breaks existing links.

## After the rollback

- The rolled-back site serves an older `version.json`, so the next detect sees a
  Teams hash or repository commit that no longer matches upstream and rebuilds.
  The same holds for the files site, whose `version.json` is checked too. The
  next weekly run will therefore redeploy the bad build unless the cause is
  fixed first. To keep the project pinned until then, disable the
  `sync-assets.yml` workflow.
- Once the fix is merged, run **Sync Assets** manually with `rebuild` to build
  and deploy right away, or re-enable the workflow and wait for the schedule.
- Close the `sync-assets failing` issue when a run goes green.

See [`set-up-asset-hosting.md`](set-up-asset-hosting.md) for the project and its
secrets.
