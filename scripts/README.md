# Contribution Observatory

The README cover is generated from the public daily calendar for [tensorkai](https://github.com/tensorkai).
It is a dated snapshot, not a live browser connection. Counts are GitHub contributions, not just commits.

## Refresh

Requires Node.js 24. There are no package dependencies or personal access tokens.

```sh
node --test scripts/activity.test.mjs
node scripts/update-activity.mjs
```

The refresh fetches GitHub's public calendar, joins each dated cell to its exact tooltip count,
validates 365 consecutive UTC calendar dates, and writes:

- `data/contributions.json`: source URLs, fetch timestamp, exact daily counts, and embedded profile image.
- `assets/contribution-orbit.svg`: the animated cover, profile photo, and daily calendar.

Each online refresh also fetches the GitHub avatar and embeds its bytes as a data URL.
SVGs displayed through README image tags cannot load external images, so the cover must
contain the photo itself. Offline redraws reuse the photo saved in the snapshot.

Missing dates or counts, malformed data, failed requests, and changed upstream markup fail the run
before the existing snapshot is replaced. A visible fetch date makes stale artwork identifiable.
The public HTML parser is intentionally strict; if GitHub changes its markup, update
`parseCalendar` and its tests. No contribution levels are converted into guessed counts.

For a deterministic offline redraw from the saved data:

```sh
node scripts/update-activity.mjs --offline
```

## Visual encoding

- Clockwise spokes: oldest day at 12 o'clock, moving toward the newest day.
- Spoke length: square-root scaling of the day's count against the window's maximum, so quiet days remain visible.
- Colors: zero activity, then four equal count intervals relative to the window's maximum.
- Calendar: one square per date; Sunday through Saturday from top to bottom.
- Longest streak: consecutive nonzero days within this 365-day window.
- The rotating scan and echoes replay the timeline; they do not indicate live events.
- Reduced-motion preferences disable animation. The full data remains visible.

## Automatic updates

`.github/workflows/contribution-observatory.yml` refreshes daily at **01:17 UTC / 09:17 Manila**,
on changes to the engine on `main`, or via **Actions → Update contribution observatory → Run workflow**.
Push these files to the repository's `main` branch to install the workflow. It has not been deployed by editing local files.

The workflow uses the built-in token only to commit the generated SVG and JSON as
`github-actions[bot]`; it does not attribute those maintenance commits to Benedict.
Actions must be enabled and repository rules must allow the bot to push to `main`.
No personal access token is needed. Failed runs preserve the last committed artwork.
The workflow's push path filter excludes generated files to avoid an update loop.

GitHub schedules can be delayed, run from the default branch, and may be disabled after prolonged
inactivity in a public repository. See [GitHub's schedule documentation](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule).

The older static artwork remains available through `node scripts/generate-art.mjs`.
