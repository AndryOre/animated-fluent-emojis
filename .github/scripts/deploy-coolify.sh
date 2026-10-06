#!/usr/bin/env bash
# Triggers a Coolify deploy and waits for its result.
# Requires COOLIFY_API_TOKEN (repository secret) and
# SITE_COOLIFY_APP_UUID (repository variable).
set -euo pipefail

api_base="${COOLIFY_API_BASE:-https://app.coolify.io/api/v1}"
poll_interval_seconds="${POLL_INTERVAL_SECONDS:-10}"
max_polls=90

missing=()
[[ -n "${COOLIFY_API_TOKEN:-}" ]] || missing+=("COOLIFY_API_TOKEN (repository secret)")
[[ -n "${SITE_COOLIFY_APP_UUID:-}" ]] || missing+=("SITE_COOLIFY_APP_UUID (repository variable)")
if ((${#missing[@]} > 0)); then
  echo "::error::Missing ${missing[*]}. Set them in the repository settings before deploying the site."
  exit 1
fi

coolify_request() {
  local method="$1"
  local path="$2"
  curl --silent --show-error --fail --max-time 30 \
    --request "${method}" \
    --header "Authorization: Bearer ${COOLIFY_API_TOKEN}" \
    "${api_base}/${path}"
}

trigger_response=$(coolify_request POST "deploy?uuid=${SITE_COOLIFY_APP_UUID}&force=false") || {
  echo "::error::Coolify rejected the deploy request."
  exit 1
}

deployment_uuid=$(jq -r '.deployments[0].deployment_uuid // empty' <<<"${trigger_response}")
if [[ -z "${deployment_uuid}" ]]; then
  echo "::error::Coolify did not return a deployment uuid."
  exit 1
fi
echo "Deployment queued: ${deployment_uuid}"

for ((poll = 1; poll <= max_polls; poll++)); do
  status=$(coolify_request GET "deployments/${deployment_uuid}" | jq -r '.status // "unknown"') || status="unknown"
  echo "Deployment status: ${status}"
  case "${status}" in
    finished)
      echo "Deploy succeeded."
      exit 0
      ;;
    failed | cancelled-by-user)
      echo "::error::Coolify deployment ${deployment_uuid} ended with status '${status}'. Check the build logs in Coolify."
      exit 1
      ;;
  esac
  sleep "${poll_interval_seconds}"
done

echo "::error::Coolify deployment ${deployment_uuid} did not finish within $((max_polls * poll_interval_seconds)) seconds."
exit 1
