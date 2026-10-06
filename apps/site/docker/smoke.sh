#!/usr/bin/env bash
# Builds the site image from the repo root and checks redirects, headers, 404
# and masked logs. Not part of `bun run check`: run it by hand or from CI.
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
image="animated-fluent-emojis-site-smoke"
name="${image}-$$"

docker build -f "$root/apps/site/Dockerfile" -t "$image" "$root"
docker run -d --rm --name "$name" -p 127.0.0.1:0:80 "$image" >/dev/null
trap 'docker rm -f "$name" >/dev/null 2>&1 || true' EXIT
port="$(docker port "$name" 80/tcp | head -n1 | sed 's/.*://')"
base="http://127.0.0.1:$port"

for _ in $(seq 1 30); do
  curl -fs -o /dev/null "$base/" && break
  sleep 0.5
done

fail() { echo "FAIL: $*" >&2; exit 1; }

location() { curl -s -o /dev/null -D - "$1" | tr -d '\r' | awk 'tolower($1)=="location:"{print $2}'; }
status() { curl -s -o /dev/null -w '%{http_code}' "$1"; }
header_of() { curl -s -o /dev/null -D - "$2" | tr -d '\r' | awk -v name="$1:" 'tolower($1)==name{sub(/^[^ ]+ /,""); print}'; }

[ "$(status "$base/")" = 200 ] || fail "/ is not 200"

for alias in pt-BR pt_BR pt_br; do
  [ "$(status "$base/$alias/")" = 301 ] || fail "/$alias/ is not 301"
  [ "$(location "$base/$alias/")" = "/pt-br/" ] || fail "/$alias/ does not redirect to /pt-br/"
done
for alias in zh-CN zh_CN zh_cn; do
  [ "$(status "$base/$alias/")" = 301 ] || fail "/$alias/ is not 301"
  [ "$(location "$base/$alias/")" = "/zh-cn/" ] || fail "/$alias/ does not redirect to /zh-cn/"
done
[ "$(location "$base/pt-BR/docs/getting-started/?a=1")" = "/pt-br/docs/getting-started/?a=1" ] || fail "locale case redirect drops the path or query"

[ "$(status "$base/es")" = 301 ] || fail "/es is not 301"
[ "$(location "$base/es")" = "/es/" ] || fail "/es does not redirect to /es/"
[ "$(location "$base/docs/x?y=1")" = "/docs/x/?y=1" ] || fail "trailing-slash redirect drops the query"
[ "$(status "$base/index.html")" = 301 ] || fail "/index.html is not 301"
[ "$(location "$base/index.html")" = "/" ] || fail "/index.html does not redirect to /"

headers="$(curl -s -o /dev/null -D - "$base/" | tr -d '\r')"
for header in content-security-policy x-content-type-options referrer-policy permissions-policy x-frame-options cross-origin-opener-policy cross-origin-resource-policy strict-transport-security; do
  grep -qi "^$header:" <<<"$headers" || fail "missing $header"
done
csp="$(grep -i '^content-security-policy:' <<<"$headers")"
grep -qF "frame-ancestors 'none'" <<<"$csp" || fail "CSP header lacks frame-ancestors"
meta_csp="$(curl -s "$base/" | grep -Eo '<meta http-equiv="content-security-policy" content="[^"]*"' | head -n1 || true)"
[ -n "$meta_csp" ] || fail "page has no CSP meta tag"
cdn="https://animated-fluent-emojis-cdn.andryore.dev"
files="https://animated-fluent-emojis-files.andryore.dev"
if sed "s#$cdn##g;s#$files##g" <<<"$meta_csp" | grep -Eq 'https?://'; then
  fail "CSP names an origin other than the asset and files sites"
fi
for directive in img-src connect-src; do
  directive_value="$(tr ';' '\n' <<<"$meta_csp" | grep -E "(^|\")? ?$directive ")"
  grep -qF "$cdn" <<<"$directive_value" || fail "$directive lacks the asset site"
  grep -qF "$files" <<<"$directive_value" || fail "$directive lacks the files site"
done
script_src="$(tr ';' '\n' <<<"$meta_csp" | grep -E 'script-src ')"
case "$script_src" in *"'unsafe-inline'"*) fail "script-src allows unsafe-inline" ;; esac
grep -qF "base-uri 'none'" <<<"$meta_csp" || fail "CSP lacks base-uri"

[ "$(header_of cache-control "$base/")" = no-cache ] || fail "HTML lacks no-cache"
asset="$(curl -s "$base/" | grep -Eo '/_astro/[A-Za-z0-9._-]+' | head -n1 || true)"
[ -n "$asset" ] || fail "no /_astro/ asset referenced from /"
[ "$(header_of cache-control "$base$asset")" = "public, max-age=31536000, immutable" ] || fail "$asset is not immutable"

[ "$(status "$base/nope/")" = 404 ] || fail "missing page is not 404"
grep -q '<html lang="en"' <<<"$(curl -s "$base/nope/")" || fail "root 404 is not English"
[ "$(header_of cache-control "$base/nope/")" = no-cache ] || fail "404 lacks no-cache"
for prefix in es de fr it ja ko pt-br ru zh-cn; do
  [ "$(status "$base/$prefix/nope/")" = 404 ] || fail "/$prefix/nope/ is not 404"
  page="$(curl -s "$base/$prefix/nope/")"
  expected_lang="$(sed 's/-br/-BR/;s/-cn/-CN/' <<<"$prefix")"
  grep -q "<html lang=\"$expected_lang\"" <<<"$page" || fail "/$prefix/nope/ is not the $prefix 404"
done

logs="$(docker logs "$name" 2>&1)"
grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+\.0 ' <<<"$logs" || fail "log not masked"
if grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+\.[1-9][0-9]* ' <<<"$logs"; then
  fail "log has a full IP"
fi

echo "OK"
