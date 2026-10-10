import {readFile, writeFile, mkdir, rename} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {parseCalendar, normalizeDays, summarize, renderObservatory} from './activity.mjs';
const root=new URL('../',import.meta.url);
const file=relative=>fileURLToPath(new URL(relative,root));
const offline=process.argv.includes('--offline');
let snapshot;
if(offline){
  snapshot=JSON.parse(await readFile(file('data/contributions.json'),'utf8'));
  snapshot.days=normalizeDays(snapshot.days,snapshot.days.at(-1).date);
}else{
  const username=process.env.PROFILE_USERNAME || 'tensorkai';
  if(!/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(username))throw new Error('Invalid GitHub username');
  const source='https://github.com/users/'+username+'/contributions';
  const response=await fetch(source,{headers:{'User-Agent':'Contribution-Observatory','Accept':'text/html'},signal:AbortSignal.timeout(30000)});
  if(!response.ok)throw new Error('GitHub calendar request failed: HTTP '+response.status);
  const fetchedAt=new Date().toISOString();
  const input=parseCalendar(await response.text());
  const endDate=fetchedAt.slice(0,10);
  const days=normalizeDays(input,endDate);
  snapshot={username,source,fetchedAt,days};
}
// Validate and render before touching the last successful snapshot.
let avatarData = '';
try {
  const avatarResponse = await fetch(`https://github.com/${snapshot.username}.png`, {signal:AbortSignal.timeout(30000)});
  if (avatarResponse.ok) {
    const buffer = await avatarResponse.arrayBuffer();
    const mime = avatarResponse.headers.get('content-type') || 'image/png';
    avatarData = `data:${mime};base64,${Buffer.from(buffer).toString('base64')}`;
  }
} catch(e) {
  console.warn('Could not fetch avatar', e);
}
const art=renderObservatory({...snapshot, avatarData});
await mkdir(file('data/'),{recursive:true});
await mkdir(file('assets/'),{recursive:true});
await writeFile(file('assets/contribution-orbit.svg.tmp'),art);
await rename(file('assets/contribution-orbit.svg.tmp'),file('assets/contribution-orbit.svg'));
if(!offline){
  await writeFile(file('data/contributions.json.tmp'),JSON.stringify(snapshot,null,2)+'\n');
  await rename(file('data/contributions.json.tmp'),file('data/contributions.json'));
}
console.log(JSON.stringify({username:snapshot.username,days:snapshot.days.length,...summarize(snapshot.days)},null,2));
