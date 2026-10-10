// Contribution Observatory: dependency-free data validation and SVG rendering.
const DAY = 86_400_000;
export const escapeXml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
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
  if (!days.length) throw new Error('GitHub returned no contribution calendar. Keeping the previous artwork.');
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

export function renderObservatory({username, days, fetchedAt, avatarData}) {
  const s=summarize(days);
  const ink='#111a17', paper='#f2efe6', muted='#a8b8a8', copper='#f38c61';
  const colors=['#24332c','#476447','#769656','#b4ca7b','#f38c61'];
  const level=count=>count===0?0:Math.min(4,Math.ceil(count/Math.max(s.peak.count,1)*4));
  const polar=(r,a)=>[345+Math.cos(a)*r,435+Math.sin(a)*r].map(n=>n.toFixed(2));
  const label=(x,y,t,c=muted,extra='')=>'<text x="'+x+'" y="'+y+'" font-family="monospace" font-size="14" letter-spacing="1" fill="'+c+'" '+extra+'>'+escapeXml(t)+'</text>';
  const text=(x,y,t,size=18,c=paper,extra='')=>'<text x="'+x+'" y="'+y+'" font-family="Arial,sans-serif" font-size="'+size+'" fill="'+c+'" '+extra+'>'+escapeXml(t)+'</text>';
  const max=Math.max(1,s.peak.count);
  const spokes=days.map((day,i)=>{
    const a=i/365*Math.PI*2-Math.PI/2;
    const r=day.count?172+Math.sqrt(day.count/max)*72:165;
    const start=polar(160,a),end=polar(r,a);
    return '<g class="day-spoke" data-date="'+day.date+'" data-count="'+day.count+'"><title>'+day.date+': '+day.count+' contributions</title><path d="M'+start.join(' ')+'L'+end.join(' ')+'" stroke="'+colors[level(day.count)]+'" stroke-width="'+(day.count?2:1)+'" stroke-linecap="round"/>'+
      (day.count?'<circle class="echo" cx="'+end[0]+'" cy="'+end[1]+'" r="2.4" fill="'+copper+'" style="animation-delay:'+(i/365*24-24).toFixed(3)+'s"/>':'')+'</g>';
  }).join('\n');
  const monthTicks=days.map((day,i)=>{
    if(day.date.slice(-2)!=='01')return '';
    const a=i/365*Math.PI*2-Math.PI/2, p=polar(265,a);
    const month=new Date(day.date+'T00:00:00Z').toLocaleString('en-US',{month:'short',timeZone:'UTC'}).toUpperCase();
    return label(p[0],Number(p[1])+4,month,muted,'text-anchor="middle"');
  }).join('');
  const offset=new Date(days[0].date+'T00:00:00Z').getUTCDay();
  const monthLabels=[];
  let lastMonthColumn=-10;
  const calendar=days.map((day,i)=>{
    const col=Math.floor((i+offset)/7),row=(i+offset)%7;
    const x=91+col*19.8,y=757+row*18;
    if(day.date.slice(-2)==='01' && col-lastMonthColumn>=3){
      monthLabels.push(label(x,742,new Date(day.date+'T00:00:00Z').toLocaleString('en-US',{month:'short',timeZone:'UTC'})));
      lastMonthColumn=col;
    }
    return '<rect class="calendar-day" data-date="'+day.date+'" data-count="'+day.count+'" x="'+x.toFixed(1)+'" y="'+y+'" width="15" height="14" rx="2" fill="'+colors[level(day.count)]+'"><title>'+day.date+': '+day.count+' contributions</title></rect>';
  }).join('\n');
  const latestCol=Math.floor((364+offset)/7);
  const description=username+': '+s.total+' contributions across '+s.active+' active days. Longest streak in this 365-day window: '+s.longest+' days. Peak: '+s.peak.count+' on '+s.peak.date+'. Latest day: '+s.latest.count+' on '+s.latest.date+'. Snapshot fetched '+fetchedAt+'.';
  return '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="964" viewBox="0 0 1200 964" role="img" aria-labelledby="title description">\n'+
  '<title id="title">'+escapeXml(username.toUpperCase()+' / Contribution Observatory')+'</title><desc id="description">'+escapeXml(description)+'</desc>\n'+
  '<style>text{font-kerning:normal}.sweep{transform-origin:345px 435px;animation:orbit 24s linear infinite}.echo{opacity:.15;animation:echo 24s linear infinite}.calendar-scan{animation:readout 24s linear infinite}@keyframes orbit{to{transform:rotate(360deg)}}@keyframes echo{0%,4%{opacity:1}10%,100%{opacity:.15}}@keyframes readout{from{transform:translateX(0)}to{transform:translateX('+((latestCol+1)*19.8).toFixed(1)+'px)}}@media(prefers-reduced-motion:reduce){*{animation:none!important}.echo{opacity:.5}.sweep,.calendar-scan{display:none}}</style>\n'+
  '<defs><pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="#1c2a22" stroke-width=".7"/></pattern><linearGradient id="beam"><stop stop-color="'+copper+'" stop-opacity="0"/><stop offset="1" stop-color="'+copper+'" stop-opacity=".5"/></linearGradient><clipPath id="calendar-clip"><rect x="87" y="752" width="'+((latestCol+1)*19.8+4).toFixed(1)+'" height="130"/></clipPath><clipPath id="profile-clip"><circle cx="940" cy="410" r="170"/></clipPath></defs>'+
  '<rect width="1200" height="964" fill="'+ink+'"/><rect width="1200" height="698" fill="url(#grid)"/><rect width="6" height="964" fill="'+copper+'"/>'+
  label(48,44,'FIELD NOTES / BENEDICT FUSIN',paper)+label(1152,44,'GENERATED FROM GITHUB ACTIVITY',copper,'text-anchor="end"')+
  text(43,128,username.toUpperCase(),84,paper,'font-weight="900" letter-spacing="-4"')+
  text(48,171,'A year of work. One living signal.',26,muted)+
  '<path d="M48 198H1152" stroke="#36483b"/>'+
  '<g transform="translate(48.3 76.9) scale(.86)"><circle cx="345" cy="435" r="253" fill="none" stroke="#304535" stroke-dasharray="1 7"/><circle cx="345" cy="435" r="151" fill="none" stroke="#425641"/><circle cx="345" cy="435" r="139" fill="none" stroke="#293a2f"/>'+
  spokes+monthTicks+
  '<g class="sweep"><path d="M345 184 A251 251 0 0 1 462.8 213.4 L345 435Z" fill="'+copper+'" opacity=".05"/><path d="M345 283V190" stroke="'+copper+'" opacity=".7"/><circle cx="345" cy="182" r="3" fill="'+copper+'"/></g>'+
  label(345,400,'THE DAILY ORBIT',copper,'text-anchor="middle"')+
  text(345,463,'365',76,paper,'text-anchor="middle" font-weight="700" letter-spacing="-3"')+
  label(345,494,'DAYS IN THE MAKING',muted,'text-anchor="middle"')+
  '</g>'+
  '<g clip-path="url(#profile-clip)"><image x="770" y="240" width="340" height="340" href="'+(avatarData || ('https://github.com/'+username+'.png'))+'" preserveAspectRatio="xMidYMid slice"/></g>'+
  label(48,715,'THE DAILY TRANSMISSION',paper)+label(1152,715,days[0].date+' → '+days.at(-1).date,muted,'text-anchor="end"')+
  monthLabels.join('')+['S','M','T','W','T','F','S'].map((d,i)=>label(53,769+i*18,d)).join('')+calendar+
  '<g clip-path="url(#calendar-clip)"><rect class="calendar-scan" x="87" y="752" width="17" height="130" fill="'+paper+'" opacity=".13"/></g>'+
  label(48,911,'QUIET')+colors.map((color,i)=>'<rect x="'+(108+i*21)+'" y="900" width="15" height="13" rx="2" fill="'+color+'"/>').join('')+label(224,911,'INTENSE')+
  label(1152,911,'EXACT DAILY COUNTS · PUBLIC PROFILE',muted,'text-anchor="end"')+
  '<path d="M48 932H1152" stroke="#36483b"/>'+
  label(48,952,'SNAPSHOT / '+fetchedAt.slice(0,10))+label(1152,952,'CODE · CIRCUITS · CANVAS',copper,'text-anchor="end"')+
  '\n</svg>\n';
}
