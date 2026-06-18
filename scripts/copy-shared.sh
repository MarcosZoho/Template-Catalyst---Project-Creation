#!/usr/bin/env bash
# Catalyst CLI packages only each function's own directory: it does not
# include parent dirs and does not follow symlinks when zipping. shared/
# must be physically copied into every function before each deploy.
#
# Usage (from anywhere): ./scripts/copy-shared.sh
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -d shared ]; then
  echo "ERROR: shared/ not found at project root" >&2
  exit 1
fi

copied=0
for dir in functions/*/; do
  # Skip dirs without an entry point (not yet scaffolded functions)
  if [ ! -f "${dir}index.js" ] && [ ! -f "${dir}main.py" ]; then
    continue
  fi
  rm -rf "${dir}shared"
  cp -R shared "${dir}shared"
  rm -f "${dir}shared/README.md"
  echo "✓ ${dir}shared"
  copied=$((copied + 1))
done

echo "Done: shared/ copied into ${copied} function(s)."
