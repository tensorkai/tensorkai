# Code / Circuits / Canvas

A compact profile with an original microchip-and-brushstroke masthead and a
GitHub-style contribution grid. All artwork is local SVG geometry. No image
services, fonts, packages, or personal tokens are required. Desktop and mobile
mastheads have separate compositions; animation respects reduced motion.

`field-notes.mjs` defines the active artwork, exported through `profile-art.mjs`.
The older artwork remains in the repository but is no longer referenced by the
profile. The existing contribution filenames and static generation command are
retained for compatibility.

## Generate and verify

Requires Node.js 24:

```sh
node scripts/generate-stack.mjs
node scripts/update-activity.mjs --offline
node --test scripts/activity.test.mjs
```

The offline updater uses the saved snapshot and preserves its timestamp. Omit
`--offline` to fetch the current public GitHub calendar.

## Contribution data

Each rounded square represents one of 365 consecutive UTC days. Calendar weeks
run left to right; weekdays run Sunday to Saturday. Green levels represent 0,
1–3, 4–9, 10–19, and 20+ contributions. Blank cells are outside the window.
Counts are GitHub contributions, not just commits; the latest day is incomplete.
Totals, date range, freshness, and thresholds are also in the README's disclosure.

The hourly workflow validates exact tooltip counts before publishing the README,
snapshot, and both calendar SVGs together. Failed validation preserves existing
files. Scheduled runs can be delayed. Tests cover parsing, date gaps, leap days,
statistics, square calendar placement, idempotent updates, and failure handling.
