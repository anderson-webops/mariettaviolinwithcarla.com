#!/usr/bin/env bash
set -euo pipefail

PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
export PATH

release_root="${RELEASE_ROOT:-/srv/mariettaviolinwithcarla.com/releases}"
current_link="${CURRENT_LINK:-/srv/mariettaviolinwithcarla.com/current}"
host_header="${HOST_HEADER:-mariettaviolinwithcarla.com}"
site_origin="${SITE_ORIGIN:-https://$host_header}"
site_resolve_ipv4="${SITE_RESOLVE_IPV4:-$host_header:443:127.0.0.1}"
site_resolve_ipv6="${SITE_RESOLVE_IPV6:-$host_header:443:[::1]}"

if [[ $# -ne 1 ]]; then
	echo "Usage: promote-static-release.sh /srv/mariettaviolinwithcarla.com/releases/<prepared-release>" >&2
	exit 2
fi
if [[ ${EUID:-$(id -u)} -ne 0 ]]; then
	echo "Run promotion with root privileges." >&2
	exit 1
fi

release_root_real="$(cd -- "$release_root" && pwd -P)"
candidate="$(cd -- "$1" && pwd -P)"
case "$candidate/" in
	"$release_root_real/"*) ;;
	*) echo "Candidate must resolve beneath $release_root_real: $candidate" >&2; exit 1 ;;
esac

for required_file in \
	front-end/dist/index.html \
	front-end/dist/404.html \
	front-end/dist/readyz.json \
	front-end/dist/release.json \
	.marietta-violin-static-release.json; do
	if [[ ! -f "$candidate/$required_file" ]]; then
		echo "Prepared release is missing $required_file." >&2
		exit 1
	fi
done
if ! cmp -s "$candidate/front-end/dist/release.json" "$candidate/.marietta-violin-static-release.json"; then
	echo "Prepared release metadata does not match the public release identity." >&2
	exit 1
fi
if [[ -e "$current_link" && ! -L "$current_link" ]]; then
	echo "Refusing to replace non-symlink deployment path: $current_link" >&2
	exit 1
fi

previous_target="$(readlink -f -- "$current_link" 2>/dev/null || true)"
next_link="${current_link}.next.$$"
response_ipv4="$(mktemp)"
response_ipv6="$(mktemp)"
headers_file="$(mktemp)"
cleanup() {
	if [[ -L "$next_link" ]]; then unlink -- "$next_link"; fi
	rm -f -- "$response_ipv4" "$response_ipv6" "$headers_file"
}
trap cleanup EXIT

activate_target() {
	local target="$1"
	ln -s -- "$target" "$next_link"
	mv -Tf -- "$next_link" "$current_link"
}

wait_for_target() {
	local target="$1"
	local attempt
	local missing_ipv4
	local missing_ipv6
	for attempt in {1..20}; do
		if curl --noproxy '*' --ipv4 --fail --silent --show-error --max-time 5 \
				--resolve "$site_resolve_ipv4" "$site_origin/release.json" --output "$response_ipv4" \
			&& curl --noproxy '*' --ipv6 --fail --silent --show-error --max-time 5 \
				--resolve "$site_resolve_ipv6" "$site_origin/release.json" --output "$response_ipv6" \
			&& cmp -s "$target/front-end/dist/release.json" "$response_ipv4" \
			&& cmp -s "$target/front-end/dist/release.json" "$response_ipv6" \
			&& curl --noproxy '*' --ipv4 --fail --silent --show-error --max-time 5 \
				--resolve "$site_resolve_ipv4" --dump-header "$headers_file" \
				"$site_origin/readyz" --output "$response_ipv4" \
			&& grep -Eq '"status"[[:space:]]*:[[:space:]]*"ready"' "$response_ipv4" \
			&& curl --noproxy '*' --ipv6 --fail --silent --show-error --max-time 5 \
				--resolve "$site_resolve_ipv6" "$site_origin/readyz" --output "$response_ipv6" \
			&& grep -Eq '"status"[[:space:]]*:[[:space:]]*"ready"' "$response_ipv6" \
			&& grep -Eiq '^Content-Security-Policy:' "$headers_file" \
			&& grep -Eiq '^Cross-Origin-Opener-Policy:[[:space:]]*same-origin' "$headers_file" \
			&& grep -Eiq '^Cross-Origin-Resource-Policy:[[:space:]]*same-origin' "$headers_file"; then
			missing_ipv4="$(curl --noproxy '*' --ipv4 --silent --show-error --max-time 5 \
				--resolve "$site_resolve_ipv4" --output "$response_ipv4" --write-out '%{http_code}' \
				"$site_origin/__marietta-violin-deployment-probe-missing")"
			missing_ipv6="$(curl --noproxy '*' --ipv6 --silent --show-error --max-time 5 \
				--resolve "$site_resolve_ipv6" --output "$response_ipv6" --write-out '%{http_code}' \
				"$site_origin/__marietta-violin-deployment-probe-missing")"
			if [[ "$missing_ipv4" == "404" && "$missing_ipv6" == "404" ]]; then
				return 0
			fi
		fi
		sleep 1
	done
	return 1
}

activate_target "$candidate"
if nginx -t && systemctl reload nginx && wait_for_target "$candidate"; then
	echo "Promoted $candidate and verified exact IPv4/IPv6 static release identity."
	exit 0
fi

echo "Candidate health failed; restoring the previous release." >&2
if [[ -n "$previous_target" ]]; then
	activate_target "$previous_target"
	nginx -t && systemctl reload nginx
	if ! wait_for_target "$previous_target"; then
		echo "The previous release was restored but did not pass identity checks." >&2
	fi
else
	unlink -- "$current_link"
	nginx -t && systemctl reload nginx
fi
exit 1
