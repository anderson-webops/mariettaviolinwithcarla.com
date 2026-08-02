#!/usr/bin/env bash
set -euo pipefail

system_path=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
node_bin_dir="${NODE_BIN_DIR:-/usr/bin}"
if [[ "$node_bin_dir" != /* ]] || [[ ! -x "$node_bin_dir/node" ]] || [[ ! -x "$node_bin_dir/npm" ]]; then
	echo "NODE_BIN_DIR must be an absolute directory containing executable node and npm binaries." >&2
	exit 1
fi
node_bin_dir_real="$(cd -- "$node_bin_dir" && pwd -P)"
PATH="$node_bin_dir_real:$system_path"
export PATH
export CYPRESS_INSTALL_BINARY=0
export NUXT_TELEMETRY_DISABLED=1
export PUPPETEER_SKIP_DOWNLOAD=true

release_root="${RELEASE_ROOT:-/srv/mariettaviolinwithcarla.com/releases}"

if [[ $# -ne 1 ]]; then
	echo "Usage: prepare-static-release.sh /srv/mariettaviolinwithcarla.com/releases/<release>" >&2
	exit 2
fi
if [[ ${EUID:-$(id -u)} -eq 0 ]]; then
	echo "Prepare releases as an unprivileged deployment user, not root." >&2
	exit 1
fi

release_root_real="$(cd -- "$release_root" && pwd -P)"
candidate="$(cd -- "$1" && pwd -P)"
case "$candidate/" in
	"$release_root_real/"*) ;;
	*) echo "Candidate must resolve beneath $release_root_real: $candidate" >&2; exit 1 ;;
esac

if [[ ! -f "$candidate/package-lock.json" ]] || ! git -C "$candidate" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
	echo "Candidate must be a complete Git checkout with the committed root lockfile." >&2
	exit 1
fi
if [[ -n "$(git -C "$candidate" status --porcelain)" ]]; then
	echo "Candidate checkout must be clean before preparation." >&2
	exit 1
fi
if [[ "$(node --version)" != "v24.18.1" || "$(npm --version)" != "12.0.2" ]]; then
	echo "Preparation requires Node 24.18.1 and npm 12.0.2." >&2
	exit 1
fi

export SOURCE_COMMIT="$(git -C "$candidate" rev-parse HEAD)"
export SOURCE_TAG="$(git -C "$candidate" describe --tags --exact-match 2>/dev/null || true)"
unset NODE_ENV

cd -- "$candidate"
npm ci --include=dev --include=optional --strict-allow-scripts
npm run audit
npm run audit:production
npm run audit:signatures
npm run verify:dependency-graph
npm run verify:native-lock
npm run verify:platform-install
npm run lint
npm run typecheck
npm test
npm run build
npm run a11y

node - <<'NODE'
import { copyFileSync, readFileSync } from "node:fs";

const release = JSON.parse(readFileSync("front-end/dist/release.json", "utf8"));
if (release.commit !== process.env.SOURCE_COMMIT) {
	throw new Error("Built release identity does not match the candidate commit.");
}
copyFileSync("front-end/dist/release.json", ".marietta-violin-static-release.json");
NODE

npm ci --omit=dev --include=optional --ignore-scripts
npm run audit:production
npm run verify:static
echo "Prepared direct static release $candidate at $SOURCE_COMMIT."
