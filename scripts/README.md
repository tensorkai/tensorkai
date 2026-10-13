# Profile artwork and contribution observatory

The README leads with a four-discipline tech map, followed by a contribution
observatory and the workbench. All artwork is stored in this repository; no badge
or statistics-image service is needed. Desktop and mobile SVGs are selected by
standard picture elements, with expandable text versions in the README.

## Contribution design

- The circular calendar has exactly one mark per UTC day, oldest at the top,
  moving clockwise. Length scales with the square root of the daily count.
  Orange marks exceed 60% of the peak daily count; zero days are muted ticks.
- Four readings show active days, longest streak, and 30-day and 7-day totals.
- Seven daily bars have exact counts. The latest, incomplete UTC day is orange.
- The desktop skyline groups consecutive seven-day blocks from the window start;
  the final block contains one day. Bars use linear scales and zero values have
  no filled activity bar. Weekly totals sum to the 365-day total.
- Subtle decorative motion respects prefers-reduced-motion. Activity marks never
  animate or imply extra contributions. SVGs have titles and descriptions, and
  the README includes exact text totals and a seven-day text chart.

## Hourly refresh

`.github/workflows/contribution-observatory.yml` runs at minute 17 each hour,
when the README or renderer changes on main, or through workflow_dispatch.
It fetches the public GitHub calendar and validates 365 consecutive UTC dates
and exact tooltip counts before generating any output. No personal token is needed.

The workflow updates:

- The block between CONTRIBUTIONS:START and CONTRIBUTIONS:END in README.md.
- data/contributions.json, the saved source snapshot.
- assets/contribution-observatory.svg and its mobile variant.

The bot commits these outputs together. If main advances during publication,
it regenerates from current main, up to three attempts. A failed fetch or invalid
snapshot leaves the previous output in place. GitHub may delay scheduled jobs;
the README and artwork display the last successful refresh timestamp.

## Commands

Requires Node.js 24, with no package dependencies:

```sh
node --test scripts/activity.test.mjs
node scripts/update-activity.mjs
```

Rebuild from saved counts without a network request:

```sh
node scripts/update-activity.mjs --offline
```

Rebuild both static tech maps after editing scripts/profile-art.mjs:

```sh
node scripts/generate-stack.mjs
```

The updater preserves content outside its markers. The tests cover parsing,
calendar gaps, invalid counts, leap days, rolling totals, accessible output,
artwork/data agreement, weekly aggregation, deterministic output, and failure
preservation in a temporary fixture repository.

The masthead and working-loop artwork are static assets. Earlier unused artwork
is retained; scripts/generate-art.mjs rebuilds the original studio artwork only.
