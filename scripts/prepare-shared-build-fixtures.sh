#!/usr/bin/env bash
set -euo pipefail
root=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
cd -- "$root"
node scripts/check-build-toolchain.mjs >/dev/null
for graph in \
  vendor/rollup-plugins/tools \
  vendor/rollup-plugins/upstream \
  vendor/watchers/upstream \
  vendor/unhead-bundler/upstream \
  vendor/nitro-tools/upstream \
  vendor/nitro-tools/current \
  vendor/schema-parents/tools \
  vendor/schema-parents/upstream \
  vendor/framework-parents/upstream \
  vendor/native-providers/upstream \
  vendor/vite-plugin-vue-devtools/upstream; do
  npm ci --prefix "$graph" --workspaces=false --include=optional --strict-allow-scripts
  npm ls --prefix "$graph" --workspaces=false --all --json
done
