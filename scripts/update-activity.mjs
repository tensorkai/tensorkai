import {readFile, writeFile, mkdir, rename} from 'node:fs/promises';
import {parseCalendar, normalizeDays, summarize, updateReadme} from './activity.mjs';

const root = new URL('../', import.meta.url);
const file = relative => new URL(relative, root);
const offline = process.argv.includes('--offline');
let snapshot;
if (offline) {
  const saved = JSON.parse(await readFile(file('data/contributions.json'), 'utf8'));
  snapshot = {username: saved.username, source: saved.source, fetchedAt: saved.fetchedAt,
    days: normalizeDays(saved.days, saved.days.at(-1).date)};
} else {
  const username = process.env.PROFILE_USERNAME || 'tensorkai';
  if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(username)) throw new Error('Invalid GitHub username');
  const source = 'https://github.com/users/' + username + '/contributions';
  const response = await fetch(source, {
    headers: {'User-Agent': 'Contribution-Summary', 'Accept': 'text/html'},
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error('GitHub calendar request failed: HTTP ' + response.status);
  const input = parseCalendar(await response.text());
  const fetchedAt = new Date().toISOString();
  snapshot = {username, source, fetchedAt, days: normalizeDays(input, fetchedAt.slice(0, 10))};
}

// Validate data and README boundaries before replacing either file.
const readme = updateReadme(await readFile(file('README.md'), 'utf8'), snapshot);
await mkdir(file('data/'), {recursive: true});
await writeFile(file('README.md.tmp'), readme);
await writeFile(file('data/contributions.json.tmp'), JSON.stringify(snapshot, null, 2) + '\n');
await rename(file('data/contributions.json.tmp'), file('data/contributions.json'));
await rename(file('README.md.tmp'), file('README.md'));
console.log(JSON.stringify({username: snapshot.username, days: snapshot.days.length, ...summarize(snapshot.days)}, null, 2));
