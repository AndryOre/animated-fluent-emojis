#!/usr/bin/env bash
# Runs Lighthouse (mobile defaults) against SITE_URL, LIGHTHOUSE_RUNS times per
# page, and fails when a category's median score drops below its budget. A run
# that errors (for example the intermittent NO_NAVSTART trace error) is retried
# up to LIGHTHOUSE_ATTEMPTS times before the script gives up.
set -euo pipefail

base="${SITE_URL:-http://127.0.0.1:8080}"
runs="${LIGHTHOUSE_RUNS:-5}"
lighthouse_version="13.5.0"
out="$(mktemp -d)"
trap 'rm -rf "$out"' EXIT
declare -A budget=([performance]=90 [accessibility]=100 [best-practices]=95 [seo]=100)
failed=0

median_score() {
  local category="$1"
  shift
  jq -r --arg c "$category" '.categories[$c].score // "null"' "$@" |
    sort -g | awk '{ scores[NR] = $1 } END { print scores[int((NR + 1) / 2)] }'
}

max_attempts="${LIGHTHOUSE_ATTEMPTS:-3}"

run_lighthouse() {
  local url="$1" report="$2" attempt
  for attempt in $(seq 1 "$max_attempts"); do
    if bunx "lighthouse@${lighthouse_version}" "$url" \
      --quiet --output=json --output-path="$report" \
      --only-categories=performance,accessibility,best-practices,seo \
      --chrome-flags="--headless=new --no-sandbox"; then
      return 0
    fi
    echo "retry $attempt/$max_attempts: Lighthouse failed on $url" >&2
  done
  return 1
}

paths=(
  /
  /ja/
  /emojis/
  /emojis/fire/
  /docs/
  /docs/how-to/use-with-nextjs/
  /changelog/
)

for path in "${paths[@]}"; do
  reports=()
  for run in $(seq 1 "$runs"); do
    report="$out/report-$run.json"
    run_lighthouse "$base$path" "$report"
    reports+=("$report")
  done
  for category in performance accessibility best-practices seo; do
    raw="$(median_score "$category" "${reports[@]}")"
    if [ "$raw" = "null" ]; then
      echo "FAIL $path $category score is null (Lighthouse could not compute it)" >&2
      failed=1
      continue
    fi
    score="$(awk -v s="$raw" 'BEGIN { printf "%d", s * 100 + 0.5 }')"
    if [ "$score" -lt "${budget[$category]}" ]; then
      echo "FAIL $path $category $score < ${budget[$category]} (median of $runs)" >&2
      failed=1
    else
      echo "ok   $path $category $score >= ${budget[$category]} (median of $runs)"
    fi
  done
done

exit "$failed"
