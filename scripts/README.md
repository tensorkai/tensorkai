# Code / Circuits / Canvas

A compact profile in a Google-inspired (Material 3) visual language: a
four-color `tensorkai` wordmark, a search-bar hero, tonal surface cards, pill
chips, and layered geometric shapes (microchip, paint sweep, sparkle). Every SVG
switches between light and dark palettes with `prefers-color-scheme`. The stack
has three labeled rows: Frontend, Backend, and AI and Machine Learning. Each
technology uses a recognizable logo on a white "app icon" disc and a name. Logos
are embedded from local SVG files in `assets/logos`; that directory includes
pinned source URLs and upstream licenses from Devicon and Simple Icons. No image
services, fonts, packages, or personal tokens are required; Google Sans and
Roboto are used when installed, with system fallbacks. Desktop and mobile
mastheads have separate compositions; animation respects reduced motion.
The stack has desktop and mobile layouts. A blue scanner with a four-color trail
travels over the raised contribution tiles in a 24-second serpentine loop. Its route
contains only calendar cells inside the saved window. The scanner is decorative;
it never changes activity colors, counts, or positions. Reduced motion hides it.

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

Each raised 3D tile represents one of 365 consecutive UTC days. Calendar weeks
run left to right; weekdays run Sunday to Saturday. Tile height and green levels represent 0,
1–3, 4–9, 10–19, and 20+ contributions. Blank cells are outside the window.
Counts are GitHub contributions, not just commits; the latest day is incomplete.
Totals, date range, freshness, and thresholds are also in the README's disclosure.

The hourly workflow validates exact tooltip counts before publishing the README,
snapshot, and both calendar SVGs together. Failed validation preserves existing
files. Scheduled runs can be delayed. Tests cover parsing, date gaps, leap days,
statistics, 3D calendar placement, idempotent updates, and failure handling.
