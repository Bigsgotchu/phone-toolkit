#!/usr/bin/env bash
set -euo pipefail

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "ERROR: macOS production releases must be built on macOS."
  exit 1
fi

IDENTITIES="$(security find-identity -v -p codesigning 2>/dev/null || true)"

if ! grep -q "Developer ID Application" <<< "$IDENTITIES"; then
  echo "ERROR: Developer ID Application certificate is missing."
  echo "Use qa:mac:unsigned for private QA builds."
  exit 1
fi

required_variables=(
  APPLE_API_KEY
  APPLE_API_KEY_ID
  APPLE_API_ISSUER
)

for variable in "${required_variables[@]}"; do
  if [[ -z "${!variable:-}" ]]; then
    echo "ERROR: $variable is not configured."
    exit 1
  fi
done

if [[ ! -f "$APPLE_API_KEY" ]]; then
  echo "ERROR: APPLE_API_KEY file does not exist."
  exit 1
fi

echo "macOS production signing prerequisites passed."