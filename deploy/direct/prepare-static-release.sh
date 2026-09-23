#!/usr/bin/env bash
set -euo pipefail

system_path=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
node_bin_dir="${NODE_BIN_DIR:-/opt/node-24.18.1/bin}"
if [[ "$node_bin_dir" != /* ]] || [[ ! -x "$node_bin_dir/node" ]] || [[ ! -x "$node_bin_dir/npm" ]]; then
	echo "NODE_BIN_DIR must be an absolute directory containing executable node and npm binaries." >&2
	exit 1
fi
node_bin_dir_real="$(cd -- "$node_bin_dir" && pwd -P)"
PATH="$node_bin_dir_real:$system_path"
export PATH
export NUXT_TELEMETRY_DISABLED=1
export PUPPETEER_SKIP_DOWNLOAD=true
umask 077

if [[ $# -ne 2 ]]; then
	echo "Usage: prepare-static-release.sh <clean-checkout> <artifact-output-directory>" >&2
	exit 2
fi
if [[ ${EUID:-$(id -u)} -eq 0 ]]; then
	echo "Build release artifacts as an unprivileged deployment user, not root." >&2
	exit 1
fi

candidate="$(cd -- "$1" && pwd -P)"
output="$(cd -- "$2" && pwd -P)"
if [[ -L "$1" || -L "$2" || ! -f "$candidate/package-lock.json" ]]; then
	echo "Checkout and output must be real directories, and the checkout must contain the root lockfile." >&2
	exit 1
fi
if ! git -C "$candidate" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
	echo "Candidate must be a complete Git checkout." >&2
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

SOURCE_COMMIT="$(git -C "$candidate" rev-parse HEAD)"
SOURCE_TAG="$(git -C "$candidate" describe --tags --exact-match 2>/dev/null || true)"
export SOURCE_COMMIT SOURCE_TAG
unset NODE_ENV

stage="$(mktemp -d "$output/.marietta-static-stage-XXXXXXXX")"
cleanup() {
	if [[ -d "$stage" ]]; then
		chmod -R u+rwX -- "$stage" 2>/dev/null || true
		rm -rf -- "$stage"
	fi
}
trap cleanup EXIT

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
npm run test:e2e
npm run verify:static

version="$(node -p 'require(process.argv[1]).version' "$candidate/package.json")"
if [[ ! "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
	echo "Package version must be a stable semantic version." >&2
	exit 1
fi
archive="$output/mariettaviolinwithcarla-v$version-${SOURCE_COMMIT:0:12}-static.tar.gz"
receipt="${archive%.tar.gz}.json"
checksum="$archive.sha256"
for target in "$archive" "$receipt" "$checksum"; do
	if [[ -e "$target" || -L "$target" ]]; then
		echo "Refusing to overwrite existing release artifact: $target" >&2
		exit 1
	fi
done

mkdir -p "$stage/front-end"
cp -a -- "$candidate/front-end/dist" "$stage/front-end/dist"
if find "$stage" -type l -print -quit | grep -q .; then
	echo "Static staging tree must not contain symlinks." >&2
	exit 1
fi
find "$stage" -type f -exec chmod 0444 {} +
pack_json="$(python3 -B "$candidate/scripts/static-artifact.py" pack "$stage" \
	--archive "$archive" --commit "$SOURCE_COMMIT")"
printf '%s\n' "$pack_json" > "$receipt"
archive_sha="$(python3 -I -c '
import hashlib, pathlib, sys
checksum = hashlib.sha256()
with pathlib.Path(sys.argv[1]).open("rb") as stream:
    for chunk in iter(lambda: stream.read(1024 * 1024), b""):
        checksum.update(chunk)
print(checksum.hexdigest())
' "$archive")"
printf '%s  %s\n' "$archive_sha" "$(basename -- "$archive")" > "$checksum"
chmod 0444 "$archive" "$receipt" "$checksum"

echo "Prepared sealed static artifact for $SOURCE_COMMIT:"
echo "  $archive"
echo "  SHA-256 $archive_sha"
