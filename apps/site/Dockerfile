FROM oven/bun:1.4.2-alpine@sha256:d888c0ae6c86d7866ff10c5aafdd9077b36aee6455b33dd270fb93c0dd5cef6f AS build
WORKDIR /repo

COPY package.json bun.lock bunfig.toml ./
COPY apps/site/package.json apps/site/package.json
COPY packages/animated-fluent-emojis/package.json packages/animated-fluent-emojis/package.json
RUN bun install --frozen-lockfile --filter @animated-fluent-emojis/site --ignore-scripts

COPY packages/animated-fluent-emojis packages/animated-fluent-emojis
COPY apps/site apps/site
COPY docs docs
RUN bun run --cwd packages/animated-fluent-emojis build
RUN bun run --cwd apps/site build

FROM nginx:1.29-alpine@sha256:5616878291a2eed594aee8db4dade5878cf7edcb475e59193904b198d9b830de
RUN rm -f /etc/nginx/conf.d/default.conf
COPY apps/site/docker/nginx.conf /etc/nginx/nginx.conf
COPY apps/site/docker/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY apps/site/docker/site.conf /etc/nginx/conf.d/site.conf
COPY --from=build /repo/apps/site/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO /dev/null http://127.0.0.1/ || exit 1
