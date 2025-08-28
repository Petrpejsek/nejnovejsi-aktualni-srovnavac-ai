#!/usr/bin/env sh
set -eu

# POSIX-compatible validator for production .env
# Usage: ./scripts/validate-prod-env.sh [path_to_env]

ENV_FILE="${1:-.env.production}"

if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: env file not found: $ENV_FILE" >&2
  echo "ENV FAIL" >&2
  exit 1
fi

# Detect CRLF
if grep -q "\r" "$ENV_FILE"; then
  echo "ERROR: CRLF line endings detected. Convert $ENV_FILE to LF (Unix)" >&2
  echo "ENV FAIL" >&2
  exit 1
fi

# Read key=value pairs without expansion; detect duplicates
TMP_KEYS="$(mktemp)"
trap 'rm -f "$TMP_KEYS"' EXIT INT TERM

# shellcheck disable=SC2002
cat "$ENV_FILE" | while IFS= read -r line; do
  # Trim leading/trailing spaces
  case "$line" in
    ''|'#'*) continue ;;
  esac
  # Only accept KEY=VALUE lines
  case "$line" in
    *=*) : ;;
    *) continue ;;
  esac
  key=$(printf "%s" "$line" | awk -F'=' '{print $1}')
  val=$(printf "%s" "$line" | cut -d'=' -f2-)
  # Strip optional quotes around value (single or double)
  case "$val" in
    '"'*) val=$(printf "%s" "$val" | sed 's/^"//; s/"$//') ;;
    "'") val=$(printf "%s" "$val" | sed "s/^'//; s/'$//") ;;
  esac
  # Detect duplicate keys
  if grep -qx "$key" "$TMP_KEYS" 2>/dev/null; then
    echo "ERROR: Duplicate key: $key" >&2
    echo "ENV FAIL" >&2
    exit 1
  fi
  echo "$key" >> "$TMP_KEYS"
  # Export to current shell (shadowing), but we will not print values
  # shellcheck disable=SC2163
  export "$key=$val"
done

fail=0
err() { echo "ERROR: $1" >&2; fail=1; }

# Required keys exist and non-empty
req_keys="EMAIL_PROVIDER EMAIL_FROM POSTMARK_SERVER_TOKEN POSTMARK_MESSAGE_STREAM EMAIL_TEXT_MODE EMAIL_TEMPLATE_STRICT"
for k in $req_keys; do
  v="${!k-}"
  if [ -z "${v:-}" ]; then
    err "$k missing or empty"
  fi
done

# Specific validations
[ "${EMAIL_PROVIDER:-}" = "postmark" ] || err "EMAIL_PROVIDER must be 'postmark'"
[ "${EMAIL_TEXT_MODE:-}" = "explicit" ] || err "EMAIL_TEXT_MODE must be 'explicit'"
[ "${EMAIL_TEMPLATE_STRICT:-}" = "true" ] || err "EMAIL_TEMPLATE_STRICT must be 'true'"

# EMAIL_FROM format and domain comparee.ai
case "${EMAIL_FROM:-}" in
  *"@comparee.ai") : ;;
  *) err "EMAIL_FROM must be an email at domain comparee.ai" ;;
esac

# Basic email regex (very conservative)
echo "${EMAIL_FROM:-}" | grep -Eq '^[A-Za-z0-9._%+-]+@comparee\.ai$' || err "EMAIL_FROM invalid format"

# POSTMARK_SERVER_TOKEN length
if [ "${#POSTMARK_SERVER_TOKEN:-0}" -lt 20 ]; then
  err "POSTMARK_SERVER_TOKEN too short (min 20 chars)"
fi

# POSTMARK_MESSAGE_STREAM non-empty already checked

# API base URL: at least one of PYTHON_API_URL or NEXT_PUBLIC_API_BASE_URL must exist and be https and comparee.ai
api_ok=0
check_url() {
  u="$1"
  [ -n "$u" ] || return 1
  printf "%s" "$u" | grep -Eq '^https://comparee\.ai(/|$)' || return 1
  return 0
}

if check_url "${PYTHON_API_URL-}" || check_url "${NEXT_PUBLIC_API_BASE_URL-}"; then
  api_ok=1
fi

[ "$api_ok" -eq 1 ] || err "Missing or invalid API base URL (PYTHON_API_URL or NEXT_PUBLIC_API_BASE_URL must be https://comparee.ai/...)"

if [ "$fail" -ne 0 ]; then
  echo "ENV FAIL" >&2
  exit 1
fi

echo "ENV OK: $ENV_FILE passed all checks"
exit 0


