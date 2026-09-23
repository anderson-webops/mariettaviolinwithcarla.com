# Safe content editing setup

The public website remains static and has no runtime CMS, account system,
database, or editor service. Routine copy changes use GitHub's native web editor
on a dedicated branch, then pass independent validation and owner review before
they can reach `main`.

## One-time repository setup

1. Create `content-updates` from the current `main` branch.
2. Protect `main` so pull requests require the **Content change boundary**,
   normal CI, one approving review, and Code Owner review. Repository
   administrators may retain the reviewed direct-delivery bypass used by the
   repository's automation policy.
3. Do not grant a content editor repository administration, Actions write, or
   direct `main` write. Grant only the minimum GitHub role needed to edit the
   dedicated branch and open a pull request.
4. Remove the Pages CMS GitHub App from this repository. Its current permission
   model includes Administration, Actions, and Contents write access, which is
   broader than this one-file content workflow requires.
5. Confirm that a proposed public-text change passes both CI and **Content
   change boundary**, while a form-destination or code change is rejected.

The policy workflow uses `pull_request_target` only to run the trusted base
revision. It does not check out or execute proposed-branch code, receives no
repository secrets, and fetches the proposed JSON only as bounded data through a
read-only token.

## Maintainer-managed fields

The form destination, form limits, internal announcement destination, hidden
compatibility values, scripts, workflow files, and deployment policy are not
routine content. A maintainer changes them through the repository's normal
reviewed source workflow.

## No runtime cost

This workflow runs only on GitHub. It adds no process, memory use, writable
state, secret, or network listener to production.
