import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, copyFile, writeFile, readFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {parseCalendar,normalizeDays,summarize,renderPulse,renderSummary,updateReadme,START_MARKER,END_MARKER} from './activity.mjs';
import {renderContributionArt} from './profile-art.mjs';
const makeDays=(end='2026-10-10')=>Array.from({length:365},(_,i)=>({date:new Date(Date.parse(end+'T00:00:00Z')-(364-i)*86400000).toISOString().slice(0,10),count:0}));
const snapshot=()=>({username:'tensorkai',days:makeDays(),fetchedAt:'2026-10-10T10:00:00Z'});

test('public calendar joins exact tooltip counts by ID, not intensity or order',()=>{
 const html='<td data-date="2026-10-10" id="b" data-level="1"></td><td data-date="2026-10-09" id="a"></td><tool-tip for="a">No contributions on October 9th.</tool-tip><tool-tip for="b">1,234 contributions on October 10th.</tool-tip>';
 assert.deepEqual(parseCalendar(html),[{date:'2026-10-10',count:1234},{date:'2026-10-09',count:0}]);
 assert.equal(parseCalendar('<td id="c" data-date="2026-10-08"></td><tool-tip for="c">1 contribution on October 8th.</tool-tip>')[0].count,1);
});
test('missing counts and changed HTML fail instead of inventing activity',()=>{
 assert.throws(()=>parseCalendar('<td id="missing" data-date="2026-10-10" data-level="4"></td>'),/Missing exact/);
 assert.throws(()=>parseCalendar('<html>rate limit</html>'),/no contribution calendar/);
});
test('365-day window remains consecutive over leap day and input reordering',()=>{
 const days=makeDays('2024-03-01');
 const normalized=normalizeDays([...days].reverse(),'2024-03-01');
 assert.equal(normalized.length,365);
 assert.equal(normalized.at(-2).date,'2024-02-29');
 assert.deepEqual(normalized,days);
});
test('rejects gaps, duplicates, negative counts and malformed dates',()=>{
 const days=makeDays();
 assert.throws(()=>normalizeDays(days.slice(1),'2026-10-10'),/Incomplete/);
 assert.throws(()=>normalizeDays([...days,days[0]],'2026-10-10'),/duplicate/);
 assert.throws(()=>normalizeDays([{...days[0],count:-1},...days.slice(1)],'2026-10-10'),/Invalid/);
 assert.throws(()=>normalizeDays([{date:'2026-02-30',count:1}],'2026-10-10'),/Invalid/);
});
test('statistics count contributions, active days, and consecutive runs independently',()=>{
 const days=makeDays();
 [2,0,4,5,1,0,7].forEach((count,i)=>days[i].count=count);
 days.at(-1).count=3;
 const s=summarize(days);
 assert.equal(s.total,22); assert.equal(s.active,6); assert.equal(s.longest,3);
 assert.deepEqual(s.peak,days[6]); assert.equal(s.latest.count,3);
});
test('summary pairs local artwork with exact accessible totals, recent dates and UTC freshness',()=>{
 const data=snapshot();
 data.days[0].count=100;
 data.days.at(-20).count=8;
 data.days.at(-2).count=2;
 data.days.at(-1).count=3;
 const markdown=renderSummary(data);
 for(const [label,count] of [['Past 365 days',113],['Days active',4],['Longest streak',2],['Past 30 days',13],['Past 7 days',5],['Latest day',3]]){
  assert.ok(markdown.includes('| '+label+' | '+count+' '));
 }
 assert.ok(markdown.includes('10-10 Sat  '+'█'.repeat(18)+'    3'));
 assert.ok(markdown.includes('10-09 Fri  '+'█'.repeat(12)+'░'.repeat(6)+'    2'));
 assert.ok(markdown.includes('2026-10-10 10:00:00 UTC'));
 assert.match(markdown,/src="\.\/assets\/contribution-observatory\.svg"/);
 assert.match(markdown,/113 contributions, 4 active days, 2-day longest streak/);
 assert.equal(renderSummary(JSON.parse(JSON.stringify(data))),markdown);
});
test('zero activity and invalid snapshots are handled explicitly',()=>{
 assert.equal((renderSummary(snapshot()).match(/\| (?:Past 365 days|Days active|Longest streak|Past 30 days|Past 7 days|Latest day) \| 0 /g)||[]).length,6);
 assert.throws(()=>renderSummary({...snapshot(),username:'a<&"'}),/Invalid GitHub username/);
 assert.throws(()=>renderSummary({...snapshot(),fetchedAt:'bad'}),/timestamp/);
 assert.throws(()=>renderSummary({...snapshot(),days:makeDays().slice(1)}),/Incomplete/);
});
test('text pulse keeps seven dates in order and never invents activity for zero days',()=>{
 const days=makeDays();
 const zero=renderPulse(days);
 assert.equal(zero.split('\n').length,7);
 assert.doesNotMatch(zero,/█/);
 days.at(-3).count=100;
 days.at(-1).count=1;
 const rows=renderPulse(days).split('\n');
 assert.ok(rows[0].startsWith('10-04 Sun'));
 assert.ok(rows[6].startsWith('10-10 Sat'));
 assert.ok(rows[4].includes('█'.repeat(18)+'  100'));
 assert.ok(rows[6].includes('█'+'░'.repeat(17)+'    1'));
 for(const row of rows)assert.equal((row.match(/[█░]/g)||[]).length,18);
});
test('README refresh preserves handwritten content and is idempotent with either newline style',()=>{
 for(const nl of ['\n','\r\n']){
  const prefix='# My profile'+nl+'Personal introduction.'+nl+START_MARKER;
  const suffix=END_MARKER+nl+'Keep my links and photo.';
  const updated=updateReadme(prefix+nl+'Old stats'+nl+suffix,snapshot());
  assert.ok(updated.startsWith(prefix));
  assert.ok(updated.endsWith(suffix));
  assert.equal(updateReadme(updated,snapshot()),updated);
  if(nl==='\r\n')assert.doesNotMatch(updated,/(?<!\r)\n/);
 }
});
test('missing, duplicated or reversed markers cannot overwrite a README',()=>{
 for(const readme of ['',START_MARKER,END_MARKER+START_MARKER,START_MARKER+START_MARKER+END_MARKER,START_MARKER+END_MARKER+END_MARKER]){
  assert.throws(()=>updateReadme(readme,snapshot()),/markers/);
 }
});
test('offline updater writes Markdown and preserves files on validation failure',async()=>{
 const root=await mkdtemp(join(tmpdir(),'contribution-summary-test-'));
 try{
  await mkdir(join(root,'scripts'));
  await mkdir(join(root,'data'));
  for(const name of ['activity.mjs','update-activity.mjs','profile-art.mjs'])await copyFile(new URL(name,import.meta.url),join(root,'scripts',name));
  const data={...snapshot(),source:'https://github.com/users/tensorkai/contributions',avatarDataUrl:'old-image'};
  const dataPath=join(root,'data','contributions.json');
  const readmePath=join(root,'README.md');
  await writeFile(dataPath,JSON.stringify(data));
  await writeFile(readmePath,'Keep intro\n'+START_MARKER+'\n'+END_MARKER+'\nKeep footer');
  const run=()=>spawnSync(process.execPath,[join(root,'scripts','update-activity.mjs'),'--offline'],{encoding:'utf8'});
  const first=run();
  assert.equal(first.status,0,first.stderr);
  const output=await readFile(readmePath,'utf8');
  assert.ok(output.includes('## 02 / Contribution observatory'));
  const artPath=join(root,'assets','contribution-observatory.svg');
  const artwork=await readFile(artPath,'utf8');
  assert.match(artwork,/365 DAYS IN ORBIT/);
  assert.ok(output.endsWith('Keep footer'));
  const saved=await readFile(dataPath,'utf8');
  assert.equal(JSON.parse(saved).avatarDataUrl,undefined);
  assert.equal(run().status,0);
  assert.equal(await readFile(readmePath,'utf8'),output);
  assert.equal(await readFile(artPath,'utf8'),artwork);
  await writeFile(readmePath,'Missing markers; do not replace');
  assert.notEqual(run().status,0);
  assert.equal(await readFile(readmePath,'utf8'),'Missing markers; do not replace');
  assert.equal(await readFile(dataPath,'utf8'),saved);
  assert.equal(await readFile(artPath,'utf8'),artwork);
 }finally{
  // Only remove the unique fixture directory created by this test.
  assert.ok(resolve(root).startsWith(resolve(tmpdir()) + '\\') || resolve(root).startsWith(resolve(tmpdir()) + '/'));
  assert.ok(root.includes('contribution-summary-test-'));
  await rm(root,{recursive:true,force:true});
 }
});

test('observatory represents every date once and weekly volumes conserve the total',()=>{
 const data=snapshot();
 data.days.forEach((d,i)=>d.count=i%11);
 const art=renderContributionArt(data);
 const marks=[...art.matchAll(/data-date="([^"]+)" data-count="(\d+)"/g)];
 assert.deepEqual(marks.map(m=>({date:m[1],count:Number(m[2])})),data.days);
 const totals=[...art.matchAll(/data-week-total="(\d+)"/g)].map(m=>Number(m[1]));
 assert.equal(totals.length,53);
 assert.equal(totals.reduce((a,b)=>a+b,0),summarize(data.days).total);
 assert.equal((art.match(/data-pulse-date=/g)||[]).length,7);
 assert.doesNotMatch(art,/NaN|Infinity|<script|<foreignObject|(?:href|src)=/);
 assert.match(art,/prefers-reduced-motion/);
 assert.equal(renderContributionArt(data),art);
});

test('empty contribution artwork stays finite and extreme values remain valid',()=>{
 const data=snapshot();
 assert.doesNotMatch(renderContributionArt(data),/NaN|Infinity/);
 data.days.at(-1).count=12345;
 assert.match(renderContributionArt(data),/12,345/);
 assert.throws(()=>renderContributionArt({...data,days:data.days.slice(1)}),/Incomplete/);
});
