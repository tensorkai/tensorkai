import test from 'node:test';
import assert from 'node:assert/strict';
import {parseCalendar,normalizeDays,summarize,renderObservatory} from './activity.mjs';
const avatarDataUrl='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a7V8AAAAASUVORK5CYII=';
const makeDays=(end='2026-10-10')=>Array.from({length:365},(_,i)=>({date:new Date(Date.parse(end+'T00:00:00Z')-(364-i)*86400000).toISOString().slice(0,10),count:0}));
test('public calendar joins tooltip counts by ID, not DOM order or intensity',()=>{
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
test('zero-activity rendering stays finite and represents every day twice',()=>{
 const svg=renderObservatory({username:'tensorkai',days:makeDays(),fetchedAt:'2026-10-10T10:00:00Z',avatarDataUrl});
 assert.equal((svg.match(/class="day-spoke"/g)||[]).length,365);
 assert.equal((svg.match(/class="calendar-day"/g)||[]).length,365);
 assert.doesNotMatch(svg,/NaN|Infinity/);
 assert.match(svg,/prefers-reduced-motion:reduce/);
});
test('SVG text escapes data and generation is deterministic for a snapshot',()=>{
 const data={username:'a<&"',days:makeDays(),fetchedAt:'2026-10-10T10:00:00Z',avatarDataUrl};
 const svg=renderObservatory(data);
 assert.doesNotMatch(svg,/a<&"/);
 assert.equal(svg,renderObservatory(data));
});

test('profile image is embedded for README image rendering and offline redraws',()=>{
 const data={username:'tensorkai',days:makeDays(),fetchedAt:'2026-10-10T10:00:00Z',avatarDataUrl};
 const svg=renderObservatory(JSON.parse(JSON.stringify(data)));
 assert.ok(svg.includes('href="'+avatarDataUrl+'"'));
 assert.doesNotMatch(svg,/<image\b[^>]*href="https?:/);
 for(const invalid of [undefined,'','https://github.com/tensorkai.png','data:image/png;base64,']){
  assert.throws(()=>renderObservatory({...data,avatarDataUrl:invalid}),/embedded profile image/);
 }
});
