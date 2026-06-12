#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DESKTOP="$ROOT/apps/desktop"

echo "Checking production release..."

if git -C "$ROOT" status --porcelain | grep -q .; then
  echo "ERROR: Git working tree is not clean."
  exit 1
fi

if git -C "$ROOT" ls-files | grep -Eq '\.(p8|p12|cer|mobileprovision)$'; then
  echo "ERROR: A signing credential is tracked by Git."
  exit 1
fi

if [[ ! -f "$DESKTOP/electron-builder.yml" ]]; then
  echo "ERROR: electron-builder.yml is missing."
  exit 1
fi

if [[ ! -f "$DESKTOP/build/entitlements.mac.plist" ]]; then
  echo "ERROR: macOS entitlements file is missing."
  exit 1
fi

if grep -RniE \
  'sk_live_[A-Za-z0-9]+|whsec_[A-Za-z0-9]+|BEGIN (RSA |EC )?PRIVATE KEY' \
  "$ROOT" \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude-dir=release; then
  echo "ERROR: Possible production secret committed in the repository."
  exit 1
fi

echo "Production release checks passed."