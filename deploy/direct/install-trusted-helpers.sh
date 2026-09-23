#!/usr/bin/env bash
# Bootstrap only from a separately reviewed, root-owned source tree.
set -euo pipefail
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
export PATH
unset NODE_OPTIONS NODE_PATH PYTHONHOME PYTHONPATH
umask 077

if [[ ${EUID:-$(id -u)} -ne 0 ]]; then
	echo "Run the reviewed administrative installer as root." >&2
	exit 1
fi

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
source_root="$(cd -- "$script_dir/../.." && pwd -P)"
/usr/bin/python3 -I "$script_dir/trusted-paths.py" --tree "$source_root"

version="$(/usr/bin/python3 -I -c '
import json, pathlib, sys
value=json.loads(pathlib.Path(sys.argv[1]).read_text())["version"]
if not isinstance(value,str) or len(value.split(".")) != 3 or not all(part.isdigit() for part in value.split(".")): raise SystemExit(1)
print(value)
' "$source_root/package.json")"

helper_parent=/usr/local/libexec/marietta-violin-static-release
helper_root="$helper_parent/$version"
if [[ -e "$helper_parent" || -L "$helper_parent" ]]; then
	/usr/bin/python3 -I "$script_dir/trusted-paths.py" "$helper_parent"
fi
if [[ -e "$helper_root" || -L "$helper_root" ]]; then
	echo "Reviewed helper version already exists and will not be overwritten: $helper_root" >&2
	exit 1
fi

base=/srv/mariettaviolinwithcarla.com
ensure_directory() {
	local path="$1" mode="$2"
	if [[ ! -e "$path" ]]; then
		/usr/bin/install -d -o root -g root -m "$mode" "$path"
		return
	fi
	/usr/bin/python3 -I "$script_dir/trusted-paths.py" "$path"
	if [[ "$(/usr/bin/stat -c '%u:%g:%a' "$path")" != "0:0:$mode" ]]; then
		echo "Existing protected directory metadata needs operator review: $path" >&2
		exit 1
	fi
}

/usr/bin/python3 -I "$script_dir/trusted-paths.py" "$base"
ensure_directory "$base/artifact-releases" 755
ensure_directory "$base/artifact-incoming" 700
ensure_directory "$base/.deployment-recovery" 700

/usr/bin/install -d -o root -g root -m 0755 \
	"$helper_root" "$helper_root/scripts" "$helper_root/deploy" "$helper_root/deploy/direct"
/usr/bin/install -o root -g root -m 0755 \
	"$script_dir/promote-static-release.sh" \
	"$script_dir/trusted-paths.py" \
	"$helper_root/deploy/direct/"
/usr/bin/install -o root -g root -m 0755 \
	"$source_root/scripts/static-artifact.py" \
	"$helper_root/scripts/"
/usr/bin/install -o root -g root -m 0644 \
	"$source_root/deploy/static-artifact.json" \
	"$helper_root/deploy/"

/usr/bin/python3 -I "$helper_root/deploy/direct/trusted-paths.py" --tree "$helper_root"
echo "Installed immutable static-release helpers at $helper_root. No live release or Nginx configuration was changed."
