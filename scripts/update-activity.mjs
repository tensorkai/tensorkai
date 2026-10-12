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
  const avatarSource='https://github.com/'+username+'.png?size=400';
  const avatarResponse=await fetch(avatarSource,{headers:{'User-Agent':'Contribution-Observatory','Accept':'image/png,image/jpeg,image/webp'},signal:AbortSignal.timeout(30000)});
  if(!avatarResponse.ok)throw new Error('GitHub profile image request failed: HTTP '+avatarResponse.status);
  const avatarType=avatarResponse.headers.get('content-type')?.split(';')[0].trim();
  if(!['image/png','image/jpeg','image/webp'].includes(avatarType))throw new Error('Unexpected profile image content type: '+avatarType);
  const avatarBytes=Buffer.from(await avatarResponse.arrayBuffer());
  if(!avatarBytes.length)throw new Error('GitHub returned an empty profile image');
  const avatarDataUrl='data:'+avatarType+';base64,'+avatarBytes.toString('base64');
  snapshot={username,source,fetchedAt,days,avatarSource,avatarDataUrl};
}
// Validate and render before touching the last successful snapshot.
const art=renderObservatory(snapshot);
await mkdir(file('data/'),{recursive:true});
await mkdir(file('assets/'),{recursive:true});
await writeFile(file('assets/contribution-orbit.svg.tmp'),art);
await rename(file('assets/contribution-orbit.svg.tmp'),file('assets/contribution-orbit.svg'));
if(!offline){
  await writeFile(file('data/contributions.json.tmp'),JSON.stringify(snapshot,null,2)+'\n');
  await rename(file('data/contributions.json.tmp'),file('data/contributions.json'));
}
console.log(JSON.stringify({username:snapshot.username,days:snapshot.days.length,...summarize(snapshot.days)},null,2));
