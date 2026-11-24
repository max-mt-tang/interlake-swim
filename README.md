# Interlake Swim & Dive

A student-built information hub for Interlake High School’s boys’ swim and dive team.

Live site: https://ihsswim.vercel.app/

## Site files

- `index.html`: page structure, school identity, and coach contact information.
- `styles.css`: responsive layouts, colors, and typography.
- `app.js`: upcoming events, calendar views, event details, and calendar downloads.
- `team-data.js`: published announcements, events, pool addresses, school breaks, and optional public Google Sheets feed URLs.
- `assets/`: self-hosted school logos, coach photo, font, and SVG icons.

This is a static site with no build step. Firebase browser SDK modules are loaded from Google’s CDN for sign-in and posts. Serve the directory with a local HTTP server to preview it. Vercel publishes the `main` branch.

## Updating team information

Max and Coach Eberth write announcements at https://ihsswim.vercel.app/admin.html. Posts are saved in Cloud Firestore, not GitHub.

- Max: choose **Sign in with Google** and use `maxmttang@gmail.com`.
- Coach: use `riverae@bsd405.org`. The page shows password sign-in for Coach Eberth and Google sign-in for Max. The project owner must provision Eberth’s email/password account in Firebase Authentication; there is no registration button on the site. The coach must verify the email before posting.
- Choose **New update**, enter a title, date and message, optionally add a link, and choose **Publish update**.
- **Save draft / unpublish** keeps a post private to the two editors. Parents need no account to read published updates.
- To edit a post, select it from the list. Conflicting edits are rejected so another editor’s work is not silently overwritten.
- Announcements contain public team information only. Do not publish private student or medical details.

The schedule remains in `team-data.js` and is updated separately from announcements. Dates use `YYYY-MM-DD`, and times use 24-hour Pacific Time. Practice dates are listed only when provided; the site does not generate a repeating practice schedule.

`TEAM_CONFIG` can point to published, public-content Google Sheets CSV feeds. Leave the URLs empty to use the local records. Successful empty feeds remain empty; if a feed fails, the page identifies the saved information it falls back to. The homepage announcement feed uses Firestore when Firebase is configured. A database failure displays an error rather than showing stale or unpublished posts. Never put credentials or private student information in these public files or feeds.

The month calendar is the desktop default; phones open in agenda view. Both views use the same event records as the meet list and postseason tables. Calendar downloads contain upcoming events at the time of download and must be downloaded again after changes.

## Design assets

- Interlake’s color and white wordmarks come from the [official school website](https://interlakehigh.bsd405.org/). The favicon uses the mascot portion of the same artwork. These are school identity assets, not a newly designed team logo.
- The coach photo and biography are retained from the previous site.
- [Barlow Condensed](https://github.com/google/fonts/tree/main/ofl/barlowcondensed) is self-hosted under the SIL Open Font License; see `assets/FONT-LICENSE.txt`.
- [Lucide 0.468.0](https://github.com/lucide-icons/lucide/tree/0.468.0) provides the outline icons; see `assets/ICON-LICENSE.txt`.

## Firebase maintenance

Project: `interlake-swim`, owned by Max’s Google account. Authentication uses Google and verified email/password; Firestore is the Standard default database in `nam5`. The project uses Spark (no billing upgrade). Photos remain static assets in the repository.

`firebase-config.js` contains the public web configuration. It is not a secret or an authorization boundary. `firestore.rules` grants writes only to the two verified editor emails, restricts document fields and lengths, and lets the public read only published posts. All other collections are denied. Permanent deletion is disabled; unpublish instead.

Keep console rules in sync with `firestore.rules` (Firebase CLI: `firebase deploy --only firestore:rules --project interlake-swim`, after authenticating as the project owner). If changing editors, update the rules as well as `editorEmails` in `firebase-config.js`. A UI-only change never grants database access. Authorized domains include `ihsswim.vercel.app`; add a new domain before switching the site address.

The editor can import the existing Nov. 22 weekly update once. Its fixed document ID prevents duplicate imports or overwriting a later edit.
