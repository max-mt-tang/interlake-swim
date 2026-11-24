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

- Max: choose **Continue with Google** for `maxmttang@gmail.com`, or use password sign-in for `s-tangm@bsd405.org`. The school email needs a provisioned Firebase account and email verification.
- Coach: use `riverae@bsd405.org`. The page shows password sign-in for Coach Eberth and Google sign-in for Max’s Gmail. The project owner must provision Eberth’s email/password account in Firebase Authentication; there is no registration button on the site. The coach must verify the email before posting.
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

`firebase-config.js` contains the public web configuration. It is not a secret or an authorization boundary. `firestore.rules` grants writes only to the three approved, verified email addresses, restricts document fields and lengths, and lets the public read only published posts. All other collections are denied. Permanent deletion is disabled; unpublish instead.

Keep console rules in sync with `firestore.rules` (Firebase CLI: `firebase deploy --only firestore:rules --project interlake-swim`, after authenticating as the project owner). If changing editors, update the rules as well as `editorEmails` in `firebase-config.js`. A UI-only change never grants database access. Authorized domains include `ihsswim.vercel.app`; add a new domain before switching the site address.

The editor can import the existing Nov. 22 weekly update once. Its fixed document ID prevents duplicate imports or overwriting a later edit.

### Rich text and Google Drive photos

The editor uses vendored Quill 2.0.3 (license in `assets/vendor/`) for headings,
lists, emphasis, and links. `rich-content.js` renders an allowlisted structured
format using DOM nodes, never stored HTML. Existing plain-text posts still work.

Photo integration is implemented but requires a one-time connection before
uploads work. Use **max.interlake.swim@gmail.com**, the dedicated team account,
not Max's personal Drive. Firebase authentication remains unchanged.

Configure these **server-only Vercel environment variables**:

- `GOOGLE_DRIVE_CLIENT_ID` and `GOOGLE_DRIVE_CLIENT_SECRET`: a web OAuth client.
- `GOOGLE_DRIVE_REFRESH_TOKEN`: offline authorization by the dedicated account,
  limited to `https://www.googleapis.com/auth/drive.file`.
- `GOOGLE_DRIVE_FOLDER_ID`: a folder created through that same OAuth client.

Enable the Drive API for the OAuth project. Do not use a service account with a
personal My Drive folder (service accounts have no personal storage quota).
OAuth apps left in external Testing can issue refresh tokens that expire after
seven days; use the appropriate production configuration for the narrow
non-sensitive `drive.file` scope. Never commit tokens or client secrets.

`/api/upload-photo` validates Firebase identity and the verified editor allowlist,
then uploads resized JPEGs under random filenames. `/api/photo` serves only JPEGs
created by this app within the configured folder. The API does not expose Google
credentials or provide access to arbitrary Drive files. Photos are publicly
viewable by their site image URL even while a post is a draft. Removing an image
from a post does not delete its Drive file; the team account owner can delete it
in Drive. Cached copies may remain available for up to one hour after deletion.

Uploads accept JPG/PNG/WebP, resize to at most 1600px, and encode JPEG under 1MB.
The editor limits each post to six photos. Free Google storage and Vercel usage
quotas still apply; there is no paid billing configuration in this change.
Run API authorization checks with `node --test tests/photo-api.test.js`.
