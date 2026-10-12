# Automatic contribution summary

The profile README pairs a static studio masthead with an automatically refreshed
contribution section: six metric cells, a seven-day text bar chart, and an expandable
readout. The update process needs no image rendering or profile-photo downloads.
GitHub's native contribution calendar remains available on the profile.

`assets/studio-masthead.svg` is decorative, contains no contribution counts,
scripts, external image references, or animation, and is never rewritten by the updater.
The profile photo is a separate standard image. All live metrics and chart bars
are generated as HTML/Markdown inside the contribution markers, so hourly refreshes
preserve the surrounding design. The chart uses 18 text cells per day, scaled to
the seven-day maximum; zero days have no filled cells and each row shows its exact count.

## How it updates

`.github/workflows/contribution-observatory.yml` runs hourly at minute 17, when the
README or updater changes on `main`, and through **Actions → Update contribution
summary → Run workflow**. It fetches the public GitHub calendar, validates 365
consecutive UTC dates and exact counts, and updates only the block between
`CONTRIBUTIONS:START` and `CONTRIBUTIONS:END` plus `data/contributions.json`.

The summary shows the past 365 days, recent totals, the last seven daily counts,
and the last successful refresh time in UTC. An hourly refresh is scheduled,
not a live connection from a reader's browser.

The built-in `GITHUB_TOKEN` commits as `github-actions[bot]`. These commits do not
trigger another workflow run, and do not count as the profile owner's activity.
No personal token or package dependencies are required. If another commit arrives
during publication, the workflow regenerates from the latest main (up to three
attempts) rather than merging generated output. Invalid responses or missing
README markers fail without publishing partial changes.

Actions must be enabled and repository rules must allow the bot to push to main.
GitHub may delay scheduled runs or disable schedules after 60 days of repository
inactivity. Check the linked workflow runs and README timestamp if data looks stale.
See [GitHub's schedule documentation](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)
and [GITHUB_TOKEN event behavior](https://docs.github.com/en/actions/concepts/security/github_token).

## Local checks and refresh

Requires Node.js 24:

```sh
node --test scripts/activity.test.mjs
node scripts/update-activity.mjs
```

To rebuild the Markdown from saved counts without any network requests:

```sh
node scripts/update-activity.mjs --offline
```

Dates and daily counts follow GitHub's UTC calendar. Counts are contributions, not
just commits. The public HTML parser joins date cells to their exact tooltip
counts; it fails if upstream markup changes rather than guessing from color levels.

Earlier artwork (`contribution-orbit.svg`, `signal-*.svg`, `studio-colophon.svg`)
and `scripts/generate-art.mjs` is unused by the profile and the automatic updater.
