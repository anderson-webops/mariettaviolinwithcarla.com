#!/usr/bin/env bash
set -euo pipefail
root=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
cd -- "$root"
bash scripts/prepare-unimport-source.sh
npm ci --include=optional --strict-allow-scripts
npm run build
