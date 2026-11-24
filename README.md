# Interlake Swim & Dive

A student-built information hub for Interlake High School’s boys’ swim and dive team.

Live site: https://ihsswim.vercel.app/

## Site files

- `index.html`: page structure, school identity, and coach contact information.
- `styles.css`: responsive layouts, colors, and typography.
- `app.js`: upcoming events, calendar views, event details, and calendar downloads.
- `team-data.js`: published announcements, events, pool addresses, school breaks, and optional public Google Sheets feed URLs.
- `assets/`: self-hosted school logos, coach photo, font, and SVG icons.

This is a static site with no build step or runtime dependencies. Serve the directory with a local HTTP server to preview it. Vercel publishes the `main` branch.

## Updating team information

Edit the published records in `team-data.js`. Dates use `YYYY-MM-DD`, and times use 24-hour Pacific Time. Practice dates are listed only when provided; the site does not generate a repeating practice schedule.

`TEAM_CONFIG` can point to published, public-content Google Sheets CSV feeds. Leave the URLs empty to use the local records. Successful empty feeds remain empty; if a feed fails, the page identifies the saved information it falls back to. The optional editor link opens the configured Google Sheet; the site does not provide its own posting or sign-in service. Never put credentials or private student information in these public files or feeds.

The month calendar is the desktop default; phones open in agenda view. Both views use the same event records as the meet list and postseason cards. Calendar downloads contain upcoming events at the time of download and must be downloaded again after changes.

## Design assets

- Interlake’s color and white wordmarks come from the [official school website](https://interlakehigh.bsd405.org/). The favicon uses the mascot portion of the same artwork. These are school identity assets, not a newly designed team logo.
- The coach photo and biography are retained from the previous site.
- [Barlow Condensed](https://github.com/google/fonts/tree/main/ofl/barlowcondensed) is self-hosted under the SIL Open Font License; see `assets/FONT-LICENSE.txt`.
- [Lucide 0.468.0](https://github.com/lucide-icons/lucide/tree/0.468.0) provides the outline icons; see `assets/ICON-LICENSE.txt`.
