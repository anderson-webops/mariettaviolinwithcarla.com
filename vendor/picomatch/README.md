# Maintained Picomatch

The original 4.0.7 archive is retained under `upstream/`, with its registry
integrity in `UPSTREAM.json`. `scripts/package-picomatch.py` deterministically
reproduces the owned template's archive used by the signed-source Unimport
provider, preserving the license and all implementation bytes except the
reviewed parser boundary and package identity. The Unimport preparation step
checks that reproduction before installing its fixtures.

Repeated extglobs containing effective variable-quantity output or alternatives
without a simple prefix-free proof use Picomatch's existing unsafe-expression
literalization policy. Ordinary globbing,
escaped or quoted stars, character classes and existing safe collapsed forms
retain their behavior. The repeated-output guard remains active when
`maxExtglobRecursion: false` disables the separate recursion-depth limit.
Literalization escapes backslashes as well as metacharacters. Alternative
comparisons use the effective case flags. Explicit raw-regex and caller-created
parser states retain their caller-owned trust boundary.

This vendored original archive is used only as a build input. Other consumers
retain their own scoped Picomatch resolutions.
