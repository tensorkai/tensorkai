// Contribution Observatory: dependency-free data validation and accessible readout.
const DAY = 86_400_000;
const attr = (tag, name) => tag.match(new RegExp('\\b' + name + '="([^"]*)"'))?.[1];

export function parseCalendar(html) {
  const counts = new Map();
  for (const match of html.matchAll(/<tool-tip\b([^>]*)>([\s\S]*?)<\/tool-tip>/g)) {
    const id = attr(match[1], 'for');
    const count = match[2].replace(/<[^>]+>/g, '').trim().match(/^(No|[\d,]+) contributions? on\b/);
    if (id && count) counts.set(id, count[1] === 'No' ? 0 : Number(count[1].replaceAll(',', '')));
  }
  const days = [];
  for (const match of html.matchAll(/<td\b[^>]*\bdata-date="[^"]*"[^>]*>/g)) {
    const date = attr(match[0], 'data-date');
    const id = attr(match[0], 'id');
    if (!counts.has(id)) throw new Error('Missing exact contribution count for ' + date);
    days.push({date, count: counts.get(id)});
  }
  if (!days.length) throw new Error('GitHub returned no contribution calendar. Keeping the previous summary.');
  return days;
}

export function normalizeDays(input, endDate) {
  const end = Date.parse(endDate + 'T00:00:00Z');
  if (!Number.isFinite(end) || new Date(end).toISOString().slice(0,10) !== endDate) throw new Error('Invalid end date');
  const byDate = new Map();
  for (const day of input) {
    const time = Date.parse(day.date + 'T00:00:00Z');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day.date) || !Number.isFinite(time) ||
        new Date(time).toISOString().slice(0,10) !== day.date ||
        !Number.isSafeInteger(day.count) || day.count < 0 || byDate.has(day.date)) {
      throw new Error('Invalid or duplicate contribution day: ' + day.date);
    }
    byDate.set(day.date, day);
  }
  return Array.from({length:365}, (_, i) => {
    const date = new Date(end - (364-i)*DAY).toISOString().slice(0,10);
    if (!byDate.has(date)) throw new Error('Incomplete contribution calendar: ' + date);
    return {date, count:byDate.get(date).count};
  });
}

export function summarize(days) {
  let total=0, active=0, run=0, longest=0;
  let peak=days[0];
  for (const day of days) {
    total += day.count;
    if (day.count > 0) { active++; run++; } else run=0;
    longest=Math.max(longest,run);
    if (day.count > peak.count) peak=day;
  }
  return {total, active, longest, peak, latest:days.at(-1)};
}


export const START_MARKER = '<!-- CONTRIBUTIONS:START -->';
export const END_MARKER = '<!-- CONTRIBUTIONS:END -->';

export function renderPulse(days) {
  const week = days.slice(-7);
  const peak = Math.max(1, ...week.map(day => day.count));
  return week.map(day => {
    const filled = day.count === 0 ? 0 : Math.max(1, Math.round(day.count / peak * 18));
    const weekday = new Date(day.date + 'T00:00:00Z').toLocaleDateString('en-US', {weekday: 'short', timeZone: 'UTC'});
    return day.date.slice(5) + ' ' + weekday + '  ' + '█'.repeat(filled) + '░'.repeat(18 - filled) + '  ' + String(day.count).padStart(3);
  }).join('\n');
}

export function renderSummary({username, days, fetchedAt}) {
  if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(username)) throw new Error('Invalid GitHub username');
  const fetched = new Date(fetchedAt);
  if (!Number.isFinite(fetched.getTime())) throw new Error('Invalid refresh timestamp');
  const validated = normalizeDays(days, fetched.toISOString().slice(0, 10));
  const s = summarize(validated);
  const recent = count => validated.slice(-count).reduce((total, day) => total + day.count, 0);
  const profile = 'https://github.com/' + username;
  return [
    '## 02 / Contribution observatory',
    '',
    '**A year of making, drawn from the source.** Every mark is a day. Every bar is real activity.',
    '',
    '<a href="' + profile + '#year-list-container">',
    '<picture>',
    '  <source media="(max-width: 640px)" srcset="./assets/contribution-observatory-mobile.svg" />',
    '  <img src="./assets/contribution-observatory.svg" width="100%" alt="Contribution observatory: ' + s.total + ' contributions, ' + s.active + ' active days, ' + s.longest + '-day longest streak. Past 30 days: ' + recent(30) + '; past 7 days: ' + recent(7) + '. Full text readout below." />',
    '</picture>',
    '</a>',
    '',
    '<details>',
    '<summary>Read the numbers / accessible text version ↗</summary>',
    '',
    '| Measurement | Reading |',
    '| :--- | :--- |',
    '| Past 365 days | ' + s.total + ' contributions |',
    '| Days active | ' + s.active + ' of 365 |',
    '| Longest streak | ' + s.longest + ' consecutive days in this window |',
    '| Past 30 days | ' + recent(30) + ' contributions |',
    '| Past 7 days | ' + recent(7) + ' contributions |',
    '| Window | ' + validated[0].date + ' → ' + s.latest.date + ' |',
    '| Peak day | ' + s.peak.count + ' contributions · ' + s.peak.date + ' |',
    '| Latest day | ' + s.latest.count + ' contributions · ' + s.latest.date + ' (still in progress) |',
    '',
    '**The past seven UTC days**',
    '',
    '```text',
    renderPulse(validated),
    '```',
    '',
    'Counts are GitHub contributions, not just commits. The circular calendar runs clockwise, oldest day at the top. Mark length uses a square-root scale; orange marks exceed 60% of the peak daily count. The weekly skyline groups consecutive seven-day blocks from the window start; the final block is partial. Daily and weekly bars use linear scales. Zero days have no activity bar.',
    '',
    '</details>',
    '',
    '<sub>Last refreshed: <b>' + fetched.toISOString().replace('T', ' ').slice(0, 19) + ' UTC</b> · Scheduled hourly; GitHub may delay runs.</sub>',
    '',
    '[View GitHub contribution calendar](' + profile + '#year-list-container) · ' +
      '[Update history](' + profile + '/' + username + '/actions/workflows/contribution-observatory.yml)',
  ].join('\n');
}

export function updateReadme(readme, snapshot) {
  const start = readme.indexOf(START_MARKER);
  const end = readme.indexOf(END_MARKER);
  if (start < 0 || end < start ||
      readme.indexOf(START_MARKER, start + START_MARKER.length) !== -1 ||
      readme.indexOf(END_MARKER, end + END_MARKER.length) !== -1) {
    throw new Error('README must contain exactly one ordered pair of contribution markers');
  }
  const newline = readme.includes('\r\n') ? '\r\n' : '\n';
  const block = renderSummary(snapshot).replaceAll('\n', newline);
  return readme.slice(0, start + START_MARKER.length) + newline + newline +
    block + newline + newline + readme.slice(end);
}
