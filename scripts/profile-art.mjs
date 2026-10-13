// Local, self-contained SVGs: no remote fonts, images, scripts, or services.
import {normalizeDays, summarize} from './activity.mjs';

const C = {bg:'#142a26', panel:'#1d3630', line:'#40594f', ink:'#f3eddb', muted:'#b4c3b6', orange:'#ed8959', green:'#c9dd9c'};
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const text = (x,y,value,size=16,color=C.ink,extra='') => `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" ${extra}>${escape(value)}</text>`;
const label = (x,y,value,color=C.muted,extra='') => text(x,y,value,15,color,`font-family="'Courier New',monospace" letter-spacing="1.3" ${extra}`);
const line = (x1,y1,x2,y2,color=C.line,extra='') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" ${extra}/>`;
const rect = (x,y,w,h,fill,extra='') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
const svg = (height,title,desc,body,style='',width=1200) => `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
<title id="title">${escape(title)}</title><desc id="desc">${escape(desc)}</desc>
<style>text{font-family:Arial,Helvetica,sans-serif}${style}
@media(prefers-reduced-motion:reduce){*{animation:none!important}}</style>
${rect(0,0,width,height,C.bg)}${body}</svg>\n`;

export function renderContributionArt(snapshot,{mobile=false}={}) {
  const fetched = new Date(snapshot.fetchedAt);
  if (!Number.isFinite(fetched.getTime())) throw new Error('Invalid refresh timestamp');
  const days = normalizeDays(snapshot.days, fetched.toISOString().slice(0,10));
  const s = summarize(days), maximum = Math.max(1,s.peak.count);
  const recent = n => days.slice(-n).reduce((sum,d)=>sum+d.count,0);
  const point = (i,r) => {
    const angle = i/365*Math.PI*2-Math.PI/2;
    return [290+Math.cos(angle)*r,330+Math.sin(angle)*r].map(n=>n.toFixed(2));
  };
  const ticks = days.map((d,i)=> {
    const a=point(i,138), b=point(i, d.count ? 146+Math.sqrt(d.count/maximum)*65 : 143);
    const color=d.count ? (d.count/maximum>.6?C.orange:C.green) : C.line;
    return `<g data-date="${d.date}" data-count="${d.count}"><title>${d.date}: ${d.count} contributions</title>${line(...a,...b,color,'stroke-width="1.8" stroke-linecap="round"')}</g>`;
  }).join('');
  const monthMarks=days.flatMap((d,i)=> {
    if(!d.date.endsWith('-01'))return [];
    const a=point(i,217),b=point(i,223),p=point(i,239);
    const month=new Date(d.date+'T00:00:00Z').toLocaleDateString('en-US',{month:'short',timeZone:'UTC'}).toUpperCase();
    return [line(...a,...b,C.muted)+text(...p,month,13,C.muted,'text-anchor="middle" dominant-baseline="middle"')];
  }).join('');
  const metric=(x,y,value,heading,detail)=>label(x,y,heading)+text(x,y+53,value,48,C.ink,'font-weight="700" letter-spacing="-2"')+text(x,y+79,detail,16,C.muted);
  const week=days.slice(-7),weekMax=Math.max(1,...week.map(d=>d.count));
  const bars=week.map((d,i)=> {
    const x=602+i*78, h=d.count/weekMax*82;
    const weekday=new Date(d.date+'T00:00:00Z').toLocaleDateString('en-US',{weekday:'short',timeZone:'UTC'});
    return `<g data-pulse-date="${d.date}"><title>${d.date}: ${d.count} contributions</title>`+
      rect(x,425,46,82,C.panel)+ (h?rect(x,507-h,46,h,i===6?C.orange:C.green):'')+
      text(x+23,414,d.count,19,C.ink,'text-anchor="middle" font-weight="700"')+
      text(x+23,533,weekday,15,C.muted,'text-anchor="middle"')+'</g>';
  }).join('');
  const weeks=Array.from({length:Math.ceil(days.length/7)},(_,i)=>days.slice(i*7,i*7+7));
  const totals=weeks.map(w=>w.reduce((n,d)=>n+d.count,0)),peakWeek=Math.max(1,...totals);
  const skyline=weeks.map((w,i)=> {
    const h=totals[i]/peakWeek*94,x=48+i*21;
    return `<g data-week-total="${totals[i]}"><title>${w[0].date} to ${w.at(-1).date}: ${totals[i]} contributions</title>`+
      rect(x,748,15,2,C.line)+(h?rect(x,748-h,15,h,i===weeks.length-1?C.orange:C.green,'opacity=".85"'):'')+'</g>';
  }).join('');
  const description=`${s.total} contributions across ${s.active} active days in 365 days. Longest streak: ${s.longest} days. Past 30 days: ${recent(30)}; past 7 days: ${recent(7)}. Each radial mark is one UTC day; its length scales with the square root of the daily count.`;
  const orbit='<g transform="translate(35 62) scale(.88)">'+
    `<circle cx="290" cy="330" r="126" fill="${C.panel}"/><circle cx="290" cy="330" r="217" fill="none" stroke="${C.line}" stroke-dasharray="1 7"/>`+
    ticks+monthMarks+label(290,290,'365 DAYS IN ORBIT',C.muted,'text-anchor="middle"')+
    text(290,357,s.total.toLocaleString('en-US'),76,C.ink,'text-anchor="middle" font-weight="700" letter-spacing="-4"')+
    text(290,391,'contributions',20,C.muted,'text-anchor="middle"')+
    line(255,416,325,416,C.orange,'stroke-width="3" class="signal"')+'</g>';
  const motion='.signal{animation:breathe 5s ease-in-out infinite}@keyframes breathe{0%,100%{opacity:.45}50%{opacity:1}}';
  if(mobile)return svg(1120,'Contribution Observatory / TENSORKAI',description,
    rect(0,0,5,1120,C.orange)+label(32,37,'02 / CONTRIBUTION OBSERVATORY',C.orange)+line(32,57,568,57)+
    text(32,104,'Proof of work. In living color.',32,C.ink,'font-weight="700" letter-spacing="-1"')+orbit+
    text(300,589,'One mark. One day. A year of making.',18,C.muted,'text-anchor="middle"')+line(32,613,568,613)+
    metric(40,648,s.active,'DAYS ACTIVE','out of the past 365')+metric(325,648,s.longest,'LONGEST STREAK','consecutive days')+
    metric(40,770,recent(30),'30-DAY VOLUME','contributions')+metric(325,770,recent(7),'7-DAY VOLUME','contributions')+
    `<g transform="translate(-523 510) scale(.92)">${bars}</g>`+
    text(40,1042,`${week[0].date.slice(5)} → ${s.latest.date.slice(5)} · UTC · latest day in progress`,16,C.muted)+
    line(32,1062,568,1062)+text(40,1094,`SNAPSHOT / ${fetched.toISOString().slice(0,16).replace('T',' ')} UTC`,16,C.muted),motion,600);
  return svg(852,'Contribution Observatory / TENSORKAI',description,
    rect(0,0,6,852,C.orange)+label(40,37,'02 / CONTRIBUTION OBSERVATORY',C.orange)+label(1160,37,'GITHUB TELEMETRY',C.muted,'text-anchor="end"')+
    line(40,57,1160,57)+text(40,104,'Proof of work. In living color.',36,C.ink,'font-weight="700" letter-spacing="-1"')+orbit+
    line(560,143,560,554)+metric(600,164,s.active,'DAYS ACTIVE','out of the past 365')+
    metric(885,164,s.longest,'LONGEST STREAK','consecutive days')+
    line(600,262,1150,262)+metric(600,293,recent(30),'30-DAY VOLUME','contributions')+
    metric(885,293,recent(7),'7-DAY VOLUME','contributions')+bars+
    text(290,589,'One mark. One day. A year of making.',18,C.muted,'text-anchor="middle"')+
    text(600,572,`${week[0].date.slice(5)} → ${s.latest.date.slice(5)} · UTC · latest day in progress`,15,C.muted)+
    line(40,613,1160,613)+label(48,644,'THE LONG VIEW / WEEKLY VOLUME')+skyline+
    text(48,778,days[0].date,15,C.muted)+text(1152,778,`${s.latest.date} · final block partial`,15,C.muted,'text-anchor="end"')+
    line(40,803,1160,803)+label(48,831,'ACTIVITY, NOT JUST COMMITS',C.orange)+text(1152,831,`SNAPSHOT / ${fetched.toISOString().slice(0,16).replace('T',' ')} UTC`,15,C.muted,'text-anchor="end"'),
    motion);
}

export function renderStackArt({mobile=false}={}) {
  const cards=[
    {x:32,y:112,n:'01',name:'INTELLIGENCE',hero:'Python',accent:C.orange,sub:'Models → useful behavior',rows:['PyTorch / TensorFlow / Hugging Face','LangChain / Ollama'],glyph:'M0 18L20 0L40 18L20 38Z M0 18L20 18L40 18 M20 0V38'},
    {x:616,y:112,n:'02',name:'INTERFACES',hero:'TypeScript + JavaScript',accent:C.green,sub:'Ideas → things people can use',rows:['React / Next.js / Vue / Tailwind CSS','Flutter / Dart'],glyph:'M12 4L0 19L12 34 M28 4L40 19L28 34 M24 0L16 38'},
    {x:32,y:330,n:'03',name:'BACKEND & DATA',hero:'APIs. Data. Connection.',accent:C.green,sub:'Requests → working systems',rows:['Node.js / FastAPI / NestJS / Spring','PostgreSQL / MongoDB / MySQL'],glyph:'M0 6Q20 -6 40 6V31Q20 43 0 31Z M0 6Q20 18 40 6 M0 18Q20 30 40 18'},
    {x:616,y:330,n:'04',name:'HARDWARE & SIMULATION',hero:'C++ + NodeMCU + MATLAB',accent:C.orange,sub:'Code → the physical world',rows:['Embedded systems / IoT automation','Prototypes that leave the screen'],glyph:'M7 7H33V33H7Z M14 0V7 M26 0V7 M14 33V40 M26 33V40 M0 14H7 M0 26H7 M33 14H40 M33 26H40'}
  ];
  if(mobile)cards.forEach((c,i)=>{c.x=24;c.y=112+i*218;});
  const body=cards.map(c=>rect(c.x,c.y,552,200,C.panel,'rx="8"')+rect(c.x,c.y+20,3,35,c.accent)+
    label(c.x+24,c.y+32,`${c.n} / ${c.name}`,c.accent)+
    `<path d="${c.glyph}" transform="translate(${c.x+486} ${c.y+19})" fill="none" stroke="${c.accent}" stroke-width="1.8" stroke-linejoin="round"/>`+
    text(c.x+24,c.y+79,c.hero,c.n==='04'?29:30,C.ink,'font-weight="700" letter-spacing="-.8"')+
    text(c.x+24,c.y+108,c.sub,17,C.muted)+line(c.x+24,c.y+126,c.x+528,c.y+126)+
    text(c.x+24,c.y+153,c.rows[0],18,C.ink)+text(c.x+24,c.y+180,c.rows[1],18,C.ink)).join('');
  return svg(mobile?1020:574,'Tech stack / from model to physical world',
    'Intelligence: Python, PyTorch, TensorFlow, Hugging Face, LangChain, Ollama. Interfaces: TypeScript, JavaScript, React, Next.js, Vue, Tailwind CSS, Flutter, Dart. Backend: Node.js, FastAPI, NestJS, Spring, PostgreSQL, MongoDB, MySQL. Hardware: C++, NodeMCU, MATLAB.',
    label(32,33,'01 / TECH STACK',C.orange)+text(32,82,mobile?'One connected practice.':'Different tools. One connected practice.',34,C.ink,'font-weight="700" letter-spacing="-1"')+body+
    label(32,mobile?1000:558,'MODEL → INTERFACE → SYSTEM → REAL WORLD',C.muted)+(mobile?'':label(1168,558,'TENSORKAI / TOOLKIT',C.orange,'text-anchor="end"')),'',mobile?600:1200);
}
