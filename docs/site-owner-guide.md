# Updating the website

Routine public wording can be proposed in GitHub without using the server, VPN,
or a separate content-management service.

## Make an update

1. Open the repository's `content-updates` branch in GitHub.
2. Open `front-end/src/content/site.json` and choose **Edit**.
3. Change only the public text or display setting you intend to update. Do not
   rename labels or change fields marked as maintainer-managed.
4. Commit the proposal to `content-updates`.
5. Open or refresh the pull request from `content-updates` to `main`.
6. Wait for **Content change boundary** and CI to pass.
7. Ask the repository owner to review and merge the proposal. Do not merge your
   own proposal or bypass a failed check.
8. After normal deployment completes, open the public site in a private browser
   window and confirm the intended wording.

## Safe routine changes

- announcement wording and whether it is visible;
- public contact details;
- headings, descriptions, lesson options, and student information;
- button wording and prefilled email subjects;
- the studio address; and
- the default light, dark, or visitor-device color setting.

The contact-form destination, form limits, icons, scripts, internal button
destinations, workflow files, and deployment settings require maintainer review.
The automated content boundary rejects those changes from this branch.

## Privacy

Do not add private student information, schedules, payment details, medical
information, passwords, or other sensitive personal information to the public
website or lesson-request form.

## If something looks wrong

Stop after the first failed check. Record what you changed and contact the
maintainer so the proposal can be corrected or closed. A failed check must not be
bypassed or treated as publishable.
