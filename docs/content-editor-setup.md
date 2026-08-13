# Content editor setup and maintenance

This repository is prepared for the hosted [Pages CMS](https://app.pagescms.org) editor. Pages CMS writes the existing JSON file in GitHub; it does not add an application account system, API, database, or runtime service to the public website.

## One-time activation

Activation requires an owner of the GitHub account or organization:

1. Sign in at [app.pagescms.org](https://app.pagescms.org) with GitHub.
2. Install the Pages CMS GitHub App for **only** `anderson-webops/mariettaviolinwithcarla.com`, rather than granting access to every repository.
3. Confirm that the site owner can open the repository and the **Website content** form.
4. On a temporary branch, make a harmless test edit and reverse it, then run **Check website**. Confirm that both revisions retain the protected `contactForm` object.
5. Bookmark the editor and give the site owner `docs/site-owner-guide.md`.

The hosted app currently requests GitHub repository permissions for administration, Actions, and contents in addition to read-only check/status metadata. Restricting installation to this repository limits that third-party trust boundary. Re-review the installation and vendor need periodically, and remove the app if it is no longer used.

## Repository safeguards

- `.pages.yml` exposes routine content as labeled fields, hides editor administration, disables file creation/renaming/deletion, and avoids explicitly publishing an editor's email in commit metadata.
- `settings.content.merge: true` preserves the maintainer-managed contact-form object that is intentionally absent from the editor form.
- `scripts/validate-site-content.mjs` enforces the complete content shape, links, phone and email formats, list limits, Basin endpoint, disclosure, and form-field bounds.
- `front-end/src/content/site.schema.json` supplies the same editing guidance in GitHub's editor and VS Code.
- The root test and build commands validate content before proceeding, and CI runs an explicit content-validation step.
- The phone link and repeated studio address are generated from one editable value each, preventing common copy-and-paste drift.

## Publishing behavior

Pages CMS saves to the branch currently selected in the editor. Saving to `main` starts the existing CI checks and the external five-minute deployment poll. The **Check website** action is a read-only rerun of content validation, linting, type checking, tests, and the static build for the selected branch.

Do not enable branch protection that rejects Pages CMS writes until a tested draft-branch and publish flow is in place. If editorial review becomes necessary, use a dedicated content branch and pull requests as a separate, documented workflow change.

## Deliberately excluded

- No media manager is configured because the current content model has no owner-managed images.
- No self-hosted CMS is added; that would introduce PostgreSQL, secrets, maintenance, and a new authentication surface.
- No production preview service is connected. Add one only if draft review becomes a recurring need and after reviewing its repository permissions, retention, and cost.
- Basin form settings remain maintainer-managed because they are part of the site's privacy and security contract.
