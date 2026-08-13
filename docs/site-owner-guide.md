# Updating the website

The preferred editor is [Pages CMS](https://app.pagescms.org). It presents the website text as labeled forms, so routine updates do not require editing code, using the server, or connecting through the VPN.

## Make an update

1. Open [Pages CMS](https://app.pagescms.org) and sign in with the GitHub account that has access to the website repository.
2. Open `anderson-webops/mariettaviolinwithcarla.com`.
3. Choose **Website content**.
4. Change only the fields you intend to update. The editor automatically keeps the phone link and repeated studio address in sync.
5. Review the changed fields, then save.
6. Wait for the automatic website checks to finish. You can also choose **Check website** in Pages CMS to run the checks again.
7. Allow about five minutes for the normal deployment cycle, then open [mariettaviolinwithcarla.com](https://mariettaviolinwithcarla.com) in a private browsing window and confirm the update.

Saving creates a normal GitHub revision, so every update has a history and can be reversed by the maintainer.

## Safe routine changes

The editor is intended for:

- the announcement and whether it is visible;
- contact email and phone number;
- headings, descriptions, lesson options, and student information;
- button wording and prefilled email subjects;
- the studio address; and
- the default light, dark, or visitor-device color setting.

The contact-form destination, form safety limits, icons, and internal button destinations are deliberately protected. Ask the maintainer to change those.

## Important privacy note

Do not add private student information, schedules, payment details, medical information, passwords, or other sensitive personal information to the public website or the lesson-request form. The form should only collect what is needed to arrange a lesson.

## If Pages CMS is unavailable

Use GitHub's [direct content-file editor](https://github.com/anderson-webops/mariettaviolinwithcarla.com/edit/main/front-end/src/content/site.json) as a fallback. Change only text inside quotation marks or the announcement's `true`/`false` setting, and do not rename or remove labels. GitHub will show the proposed changes before saving.

The server login and VPN are not needed for content edits. Keep them for deployment recovery or other maintainer-directed work.

## If something looks wrong

Do not make several follow-up edits trying to repair it. Record what you changed and approximately when, then contact the maintainer so the last revision can be checked or reversed. A failed website check should prevent an invalid build from being treated as ready.
