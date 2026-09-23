#!/usr/bin/env bash
# Install this helper under /usr/local/libexec before privileged use.
set -euo pipefail
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
export PATH
unset NODE_OPTIONS NODE_PATH PYTHONHOME PYTHONPATH
umask 077

if [[ $# -ne 4 && $# -ne 6 ]]; then
	echo "Usage: promote-static-release.sh <archive> <sha256> <commit> <expected-current-commit|-> [<reviewed-legacy-archive> <reviewed-legacy-sha256>]" >&2
	exit 2
fi
if [[ ${EUID:-$(id -u)} -ne 0 ]]; then
	echo "Run the installed promotion helper with root privileges." >&2
	exit 1
fi

archive="$1"
archive_sha="$2"
commit="$3"
expected_current="$4"
rollback_archive="-"
rollback_sha="-"
if [[ $# -eq 6 ]]; then
	rollback_archive="$5"
	rollback_sha="$6"
fi
if [[ ! "$archive" = /* || ! "$archive_sha" =~ ^[0-9a-f]{64}$ || ! "$commit" =~ ^[0-9a-f]{40}$ ]]; then
	echo "Pass an absolute archive path, reviewed SHA-256, and exact lowercase source commit." >&2
	exit 1
fi
if [[ "$expected_current" != "-" && ! "$expected_current" =~ ^[0-9a-f]{40}$ ]]; then
	echo "Expected current commit must be an exact lowercase commit or - for no current release." >&2
	exit 1
fi
if [[ ! -f "$archive" || -L "$archive" ]]; then
	echo "Release archive must be a regular non-symlink file." >&2
	exit 1
fi
if [[ "$rollback_archive" == "-" || "$rollback_sha" == "-" ]]; then
	if [[ "$rollback_archive" != "-" || "$rollback_sha" != "-" ]]; then
		echo "Pass both reviewed legacy archive and SHA-256, or omit both." >&2
		exit 1
	fi
elif [[ ! "$rollback_archive" = /* || ! "$rollback_sha" =~ ^[0-9a-f]{64}$ ]]; then
	echo "Legacy rollback archive must be absolute and have a reviewed SHA-256." >&2
	exit 1
elif [[ ! -f "$rollback_archive" || -L "$rollback_archive" ]]; then
	echo "Legacy rollback archive must be a regular non-symlink file." >&2
	exit 1
fi

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
helper_root="$(cd -- "$script_dir/../.." && pwd -P)"
artifact_tool="$helper_root/scripts/static-artifact.py"
path_guard="$script_dir/trusted-paths.py"
base=/srv/mariettaviolinwithcarla.com
release_root="$base/artifact-releases"
incoming_root="$base/artifact-incoming"
recovery_root="$base/.deployment-recovery"
legacy_root="$base/releases"
current_link="$base/current"
host_header=mariettaviolinwithcarla.com
site_origin=https://mariettaviolinwithcarla.com
resolve_ipv4="$host_header:443:127.0.0.1"
resolve_ipv6="$host_header:443:[::1]"

/usr/bin/python3 -I "$path_guard" --tree "$helper_root"
/usr/bin/python3 -I "$path_guard" "$base" "$release_root" "$incoming_root" "$recovery_root"
if [[ "$(/usr/bin/stat -c '%u:%g:%a' "$release_root")" != "0:0:755" \
	|| "$(/usr/bin/stat -c '%u:%g:%a' "$incoming_root")" != "0:0:700" \
	|| "$(/usr/bin/stat -c '%u:%g:%a' "$recovery_root")" != "0:0:700" ]]; then
	echo "Protected release directories do not match their reviewed ownership and modes." >&2
	exit 1
fi
if [[ -e "$current_link" && ! -L "$current_link" ]]; then
	echo "Refusing to replace non-symlink deployment path: $current_link" >&2
	exit 1
fi

exec 9>"$recovery_root/promotion.lock"
if ! /usr/bin/flock -n 9; then
	echo "Another Marietta Violin promotion is active." >&2
	exit 1
fi
if /usr/bin/find "$recovery_root" -maxdepth 1 -type f -name 'promotion-state-*' -print -quit | /usr/bin/grep -q .; then
	echo "A protected promotion recovery record needs operator review before another activation." >&2
	exit 1
fi
if ! /usr/sbin/nginx -t; then
	echo "Nginx configuration must pass before artifact installation or activation." >&2
	exit 1
fi

protected_archive="$(/usr/bin/mktemp "$incoming_root/release-XXXXXXXX.tar.gz")"
protected_rollback_archive=""
candidate_temp=""
legacy_temp=""
next_link="${current_link}.next.$$"
response_ipv4="$(/usr/bin/mktemp)"
response_ipv6="$(/usr/bin/mktemp)"
headers_ipv4="$(/usr/bin/mktemp)"
headers_ipv6="$(/usr/bin/mktemp)"
state_record=""
mutation_started=false
finished=false
rollback_failed=false
previous_target=""
candidate=""

# shellcheck disable=SC2329 # Invoked from the EXIT trap.
cleanup() {
	if [[ -L "$next_link" ]]; then /usr/bin/unlink -- "$next_link"; fi
	if [[ -n "$candidate_temp" && -d "$candidate_temp" ]]; then
		/usr/bin/chmod -R u+rwX -- "$candidate_temp" 2>/dev/null || true
		/usr/bin/rm -rf -- "$candidate_temp"
	fi
	if [[ -n "$legacy_temp" && -d "$legacy_temp" ]]; then
		/usr/bin/chmod -R u+rwX -- "$legacy_temp" 2>/dev/null || true
		/usr/bin/rm -rf -- "$legacy_temp"
	fi
	/usr/bin/rm -f -- "$protected_archive" "$response_ipv4" "$response_ipv6" "$headers_ipv4" "$headers_ipv6"
	if [[ -n "$protected_rollback_archive" ]]; then
		/usr/bin/rm -f -- "$protected_rollback_archive"
	fi
}

activate_target() {
	local target="$1"
	if [[ -L "$next_link" ]]; then /usr/bin/unlink -- "$next_link" || return 1; fi
	/usr/bin/ln -s -- "$target" "$next_link" || return 1
	/usr/bin/mv -Tf -- "$next_link" "$current_link"
}

verify_release_tree() {
	local target="$1" expected="$2"
	/usr/bin/python3 -I "$path_guard" --tree "$target" \
		&& /usr/bin/python3 -I "$artifact_tool" verify "$target" --commit "$expected" --allow-legacy
}

strict_page_headers() {
	local headers="$1"
	/usr/bin/grep -Eiq "^Content-Security-Policy:.*script-src 'self' 'unsafe-inline';.*frame-ancestors 'none'" "$headers" \
		&& ! /usr/bin/grep -Eiq "^Content-Security-Policy:.*script-src[^;]*analytics\.mariettaviolinwithcarla\.com" "$headers" \
		&& /usr/bin/grep -Eiq '^Cross-Origin-Opener-Policy:[[:space:]]*same-origin' "$headers" \
		&& /usr/bin/grep -Eiq '^Cross-Origin-Resource-Policy:[[:space:]]*same-origin' "$headers" \
		&& /usr/bin/grep -Eiq '^X-Content-Type-Options:[[:space:]]*nosniff' "$headers" \
		&& /usr/bin/grep -Eiq '^X-Frame-Options:[[:space:]]*DENY' "$headers"
}

edge_status() {
	local family="$1" resolve="$2" url="$3"
	shift 3
	/usr/bin/curl --noproxy '*' "$family" --silent --show-error --max-time 5 \
		--resolve "$resolve" --output /dev/null --write-out '%{http_code}' "$@" "$url"
}

wait_for_target() {
	local target="$1"
	local _attempt
	for _attempt in {1..20}; do
		if /usr/bin/curl --noproxy '*' --ipv4 --fail --silent --show-error --max-time 5 \
				--resolve "$resolve_ipv4" "$site_origin/release.json" --output "$response_ipv4" \
			&& /usr/bin/curl --noproxy '*' --ipv6 --fail --silent --show-error --max-time 5 \
				--resolve "$resolve_ipv6" "$site_origin/release.json" --output "$response_ipv6" \
			&& /usr/bin/cmp -s "$target/front-end/dist/release.json" "$response_ipv4" \
			&& /usr/bin/cmp -s "$target/front-end/dist/release.json" "$response_ipv6" \
			&& /usr/bin/curl --noproxy '*' --ipv4 --fail --silent --show-error --max-time 5 \
				--resolve "$resolve_ipv4" --dump-header "$headers_ipv4" "$site_origin/" --output "$response_ipv4" \
			&& /usr/bin/curl --noproxy '*' --ipv6 --fail --silent --show-error --max-time 5 \
				--resolve "$resolve_ipv6" --dump-header "$headers_ipv6" "$site_origin/" --output "$response_ipv6" \
			&& strict_page_headers "$headers_ipv4" \
			&& strict_page_headers "$headers_ipv6" \
			&& [[ "$(edge_status --ipv4 "$resolve_ipv4" "$site_origin/__marietta-violin-missing")" == 404 ]] \
			&& [[ "$(edge_status --ipv6 "$resolve_ipv6" "$site_origin/__marietta-violin-missing")" == 404 ]] \
			&& [[ "$(edge_status --ipv4 "$resolve_ipv4" "$site_origin/" -X POST)" == 405 ]] \
			&& [[ "$(edge_status --ipv6 "$resolve_ipv6" "$site_origin/" -X POST)" == 405 ]]; then
			return 0
		fi
		/usr/bin/sleep 1
	done
	return 1
}

# shellcheck disable=SC2329 # Invoked from the EXIT trap.
rollback() {
	local failed=0
	if [[ -n "$previous_target" ]]; then
		verify_release_tree "$previous_target" "$expected_current" >/dev/null || failed=1
		activate_target "$previous_target" || failed=1
	else
		if [[ -L "$current_link" ]]; then /usr/bin/unlink -- "$current_link" || failed=1; fi
	fi
	/usr/sbin/nginx -t && /usr/bin/systemctl reload nginx || failed=1
	if [[ -n "$previous_target" ]]; then wait_for_target "$previous_target" || failed=1; fi
	return "$failed"
}

# shellcheck disable=SC2329 # Registered as the EXIT trap.
on_exit() {
	local status=$?
	trap - EXIT
	trap '' HUP INT TERM
	if [[ "$mutation_started" == true && "$finished" != true ]]; then
		if ! rollback; then
			rollback_failed=true
			echo "CRITICAL: rollback needs operator recovery; record retained at $state_record" >&2
		fi
		if [[ "$status" == 0 ]]; then status=1; fi
	fi
	cleanup
	if [[ "$rollback_failed" != true && -n "$state_record" ]]; then /usr/bin/rm -f -- "$state_record"; fi
	exit "$status"
}
trap on_exit EXIT
trap 'exit 129' HUP
trap 'exit 130' INT
trap 'exit 143' TERM

# Copy untrusted staging bytes into a root-only file, then authenticate only the
# copy against independently reviewed release metadata.
/usr/bin/install -o root -g root -m 0400 -- "$archive" "$protected_archive"
if [[ "$(/usr/bin/stat -c '%s' "$protected_archive")" -gt 67108864 ]]; then
	echo "Release archive exceeds the reviewed 64 MiB bound." >&2
	exit 1
fi

candidate="$release_root/$commit-${archive_sha:0:16}"
if [[ -e "$candidate" || -L "$candidate" ]]; then
	verify_release_tree "$candidate" "$commit" >/dev/null
	/usr/bin/python3 -I "$artifact_tool" verify "$candidate" \
		--archive "$protected_archive" --sha256 "$archive_sha" --commit "$commit" >/dev/null
else
	candidate_temp="$(/usr/bin/mktemp -d "$release_root/.candidate-XXXXXXXX")"
	/usr/bin/python3 -I "$artifact_tool" unpack "$candidate_temp" \
		--archive "$protected_archive" --sha256 "$archive_sha" --commit "$commit" >/dev/null
	/usr/bin/chown -R root:root -- "$candidate_temp"
	/usr/bin/chmod 0555 -- "$candidate_temp"
	/usr/bin/python3 -I "$path_guard" --tree "$candidate_temp"
	/usr/bin/mv -- "$candidate_temp" "$candidate"
	candidate_temp=""
fi

if [[ -L "$current_link" ]]; then
	current_target="$(/usr/bin/readlink -f -- "$current_link" 2>/dev/null || true)"
	if [[ -z "$current_target" ]]; then
		echo "Existing deployment symlink does not resolve." >&2
		exit 1
	fi
	if [[ "$expected_current" == "-" ]]; then
		echo "An existing release requires its independently reviewed current commit." >&2
		exit 1
	fi
	case "$current_target/" in
		"$release_root/"*)
			if [[ "$rollback_archive" != "-" ]]; then
				echo "A reviewed legacy archive is accepted only for the first transition from the legacy release root." >&2
				exit 1
			fi
			previous_target="$current_target"
			verify_release_tree "$previous_target" "$expected_current" >/dev/null
			;;
		"$legacy_root/"*)
			if [[ "$rollback_archive" == "-" ]]; then
				echo "The first legacy transition requires a separately prepared and reviewed rollback archive and SHA-256." >&2
				exit 1
			fi
			protected_rollback_archive="$(/usr/bin/mktemp "$incoming_root/legacy-XXXXXXXX.tar.gz")"
			/usr/bin/install -o root -g root -m 0400 -- \
				"$rollback_archive" "$protected_rollback_archive"
			if [[ "$(/usr/bin/stat -c '%s' "$protected_rollback_archive")" -gt 67108864 ]]; then
				echo "Legacy rollback archive exceeds the reviewed 64 MiB bound." >&2
				exit 1
			fi
			legacy_temp="$(/usr/bin/mktemp -d "$release_root/.legacy-XXXXXXXX")"
			/usr/bin/python3 -I "$artifact_tool" unpack "$legacy_temp" \
				--archive "$protected_rollback_archive" --sha256 "$rollback_sha" \
				--commit "$expected_current" --allow-legacy >/dev/null
			/usr/bin/chown -R root:root -- "$legacy_temp"
			/usr/bin/chmod 0555 -- "$legacy_temp"
			/usr/bin/python3 -I "$path_guard" --tree "$legacy_temp"
			sealed_legacy="$release_root/legacy-${expected_current:0:12}-${rollback_sha:0:16}"
			if [[ -e "$sealed_legacy" || -L "$sealed_legacy" ]]; then
				verify_release_tree "$sealed_legacy" "$expected_current" >/dev/null
				/usr/bin/python3 -I "$artifact_tool" verify "$sealed_legacy" \
					--archive "$protected_rollback_archive" --sha256 "$rollback_sha" \
					--commit "$expected_current" --allow-legacy >/dev/null
				/usr/bin/chmod -R u+rwX -- "$legacy_temp"
				/usr/bin/rm -rf -- "$legacy_temp"
			else
				/usr/bin/mv -- "$legacy_temp" "$sealed_legacy"
			fi
			legacy_temp=""
			previous_target="$sealed_legacy"
			;;
		*)
			echo "Existing deployment target is outside the reviewed legacy and artifact roots: $current_target" >&2
			exit 1
			;;
	esac
elif [[ "$expected_current" != "-" ]]; then
	echo "No current release exists, but an expected current commit was supplied." >&2
	exit 1
elif [[ "$rollback_archive" != "-" ]]; then
	echo "A reviewed legacy archive is not accepted when no current release exists." >&2
	exit 1
fi

state_record="$(/usr/bin/mktemp "$recovery_root/promotion-state-XXXXXXXX")"
/usr/bin/printf '%s\n%s\n%s\n' "$previous_target" "$candidate" "$commit" > "$state_record"
/usr/bin/chmod 0600 "$state_record"

mutation_started=true
activate_target "$candidate"
if /usr/sbin/nginx -t \
	&& /usr/bin/systemctl reload nginx \
	&& wait_for_target "$candidate"; then
	finished=true
	echo "Promoted immutable static artifact $commit and verified exact IPv4/IPv6 identity and edge policy."
	exit 0
fi

echo "Candidate acceptance failed; restoring the sealed previous release." >&2
exit 1
