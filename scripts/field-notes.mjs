// Code / Circuits / Canvas: original, dependency-free SVG artwork.
import {normalizeDays, summarize} from './activity.mjs';

const p = {bg:'#0d1117', panel:'#161b22', line:'#30363d', ink:'#f0f6fc', muted:'#919ba8', lime:'#b9f27c', violet:'#bca7ff'};
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const rect = (x,y,w,h,fill,extra='') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
const text = (x,y,value,size=18,fill=p.ink,extra='') => `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" ${extra}>${escape(value)}</text>`;
const mono = (x,y,value,size=13,fill=p.muted,extra='') => text(x,y,value,size,fill,`font-family="monospace" ${extra}`);
const svg = (w,h,title,desc,body,styles='') => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title desc">
<title id="title">${escape(title)}</title><desc id="desc">${escape(desc)}</desc>
<style>svg{font-family:Arial,Helvetica,sans-serif}.signal{animation:signal 5s ease-in-out infinite}@keyframes signal{0%,100%{opacity:.4}50%{opacity:1}}${styles}@media(prefers-reduced-motion:reduce){*{animation:none!important}.activity-glint{display:none}}</style>
${rect(0,0,w,h,p.bg,'rx="16"')}${body}</svg>\n`;

export function renderMasthead({mobile=false}={}) {
  const w=mobile?600:1200,h=mobile?390:320;
  // An exploded microchip becomes a brushstroke: code, circuitry, and art.
  const drawing = `<g transform="translate(${mobile?428:961} ${mobile?289:159}) scale(${mobile?.61:1})">
    <circle r="109" fill="none" stroke="${p.line}" stroke-dasharray="2 7"/>
    <path d="M-140 0H-63M63 0H142M0-112V-63M0 63V112" fill="none" stroke="${p.line}"/>
    <g transform="rotate(-12)">
      ${[-42,-14,14,42].map(n=>`<path d="M${n}-78v18M${n} 60v18M-78 ${n}h18M60 ${n}h18" stroke="${p.violet}" stroke-width="5"/>`).join('')}
      ${rect(-60,-60,120,120,p.panel,`rx="12" stroke="${p.violet}" stroke-width="2"`)}
      ${text(0,14,'</>',43,p.ink,'text-anchor="middle" font-family="monospace"')}
    </g>
    <path d="M-100 69Q-45 27 25 64T122 26" stroke="${p.lime}" stroke-width="21" fill="none" stroke-linecap="square"/>
    <path d="M-94 77Q-41 42 27 74T127 36" stroke="${p.bg}" stroke-width="3" fill="none"/>
    <g class="signal">${rect(-122,-65,10,10,p.lime)}${rect(119,-57,7,7,p.violet)}${rect(82,107,7,7,p.lime)}</g>
  </g>`;
  return svg(w,h,'TENSORKAI — Code / Circuits / Canvas','Benedict Fusin. Turning what if into it works. AI, embedded systems, and art.',
    mono(32,36,'BENEDICT FUSIN  /  @TENSORKAI',mobile?14:15,p.violet)+
    (mobile?'':mono(w-32,36,'CODE / CIRCUITS / CANVAS',13,p.muted,'text-anchor="end"'))+
    text(27,mobile?118:136,'TENSORKAI',mobile?73:102,p.ink,'font-weight="900" letter-spacing="-5"')+
    text(32,mobile?165:191,'Turning “what if”',mobile?29:32,p.ink)+
    text(32,mobile?203:232,'into “it works.”',mobile?29:32,p.lime)+drawing+
    mono(32,h-30,mobile?'CODE / CIRCUITS / CANVAS':'01 / THINK IT.     02 / BUILD IT.     03 / MAKE IT MATTER.',mobile?13:14));
}

export function renderStackArt({mobile=false}={}) {
  const w=mobile?600:1200,h=mobile?674:362;
  const modules=[
    {name:'MODELS',title:'Teach it.',color:p.violet,tools:[['Py','Python'],['PT','PyTorch'],['TF','TensorFlow'],['HF','Hugging Face'],['Ol','Ollama']],icon:'model'},
    {name:'INTERFACES',title:'Give it shape.',color:'#79d8ef',tools:[['TS','TypeScript'],['Re','React'],['Nx','Next.js'],['Fl','Flutter'],['Da','Dart']],icon:'screen'},
    {name:'SYSTEMS',title:'Make it run.',color:p.lime,tools:[['FA','FastAPI'],['Js','Node.js'],['Pg','PostgreSQL'],['C+','C++'],['MC','NodeMCU'],['ML','MATLAB']],icon:'chip'},
  ];
  const icon=(type,x,y,color)=>{
    const drawing=type==='model'?
      '<path d="M4 8 22 2 42 12 36 36 12 42 4 8 36 36 22 2 12 42 42 12Z"/>'+[[4,8],[22,2],[42,12],[36,36],[12,42]].map(([cx,cy])=>`<circle cx="${cx}" cy="${cy}" r="4" fill="${p.panel}"/>`).join(''):
      type==='screen'?'<rect x="2" y="2" width="32" height="25" rx="4"/><rect x="12" y="16" width="32" height="25" rx="4" fill="'+p.panel+'"/><path d="m24 25-4 4 4 4m8-8 4 4-4 4"/>':
      '<rect x="8" y="8" width="28" height="28" rx="5"/><path d="M16 0v8M28 0v8M16 36v8M28 36v8M0 16h8M0 28h8M36 16h8M36 28h8M16 16h12v12H16Z"/>';
    return `<g transform="translate(${x} ${y})" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round">${drawing}</g>`;
  };
  const cards=modules.map((m,i)=>{
    const x=mobile?36:24+i*388,y=mobile?96+i*186:106,cw=mobile?540:376,ch=mobile?168:218;
    const cols=mobile?3:2,tw=mobile?163:166,th=mobile?30:29,spacing=mobile?32:33;
    const badges=m.tools.map(([mark,name],j)=>{
      const bx=x+16+j%cols*(tw+9),by=y+(mobile?82:106)+Math.floor(j/cols)*spacing;
      return `<g>${rect(bx,by,tw,th,p.bg,'rx="6"')}${rect(bx+5,by+5,22,th-10,m.color,'rx="3" fill-opacity=".14"')}`+
        mono(bx+16,by+th/2+4,mark,10,m.color,'text-anchor="middle" font-weight="700"')+
        text(bx+34,by+th/2+5,name,mobile?14:14,p.ink)+'</g>';
    }).join('');
    return rect(x,y,cw,ch,p.panel,`rx="12" stroke="${p.line}"`)+
      rect(x+16,y+17,4,12,m.color,'rx="2"')+mono(x+28,y+28,`0${i+1} / ${m.name}`,12,m.color)+
      text(x+16,y+65,m.title,mobile?26:28,p.ink,'font-weight="700" letter-spacing="-.5"')+
      icon(m.icon,x+cw-68,y+20,m.color)+badges;
  }).join('');
  const wire=mobile?'M18 123V609m0-486h18m-18 186h18m-18 186h18':'M212 106V86H988V106M600 86V106';
  return svg(w,h,'The idea engine / Technology stack','Models: Python, PyTorch, TensorFlow, Hugging Face, Ollama. Interfaces: TypeScript, React, Next.js, Flutter, Dart. Systems: FastAPI, Node.js, PostgreSQL, C++, NodeMCU, MATLAB.',
    mono(24,29,'THE IDEA ENGINE',13,p.violet)+text(24,62,'Different tools. One curious mind.',mobile?26:29,p.ink,'font-weight="700"')+
    (mobile?'':mono(w-24,48,'LEARN → MAKE → CONNECT',13,p.muted,'text-anchor="end"'))+
    `<path d="${wire}" fill="none" stroke="${p.line}" stroke-width="2"/>`+
    `<path class="stack-current" d="${wire}" fill="none" stroke="${p.violet}" stroke-width="2" stroke-dasharray="18 90"/>`+cards,
    '.stack-current{animation:current 6s linear infinite}@keyframes current{to{stroke-dashoffset:-216}}');
}

export function renderContributionArt(snapshot,{mobile=false}={}) {
  const fetched=new Date(snapshot.fetchedAt);
  if(!Number.isFinite(fetched.getTime())) throw new Error('Invalid refresh timestamp');
  const days=normalizeDays(snapshot.days,fetched.toISOString().slice(0,10));
  const s=summarize(days),w=mobile?600:1200,h=mobile?248:290;
  const colors=['#161b22','#0e4429','#006d32','#26a641','#39d353'];
  const level=n=>n===0?0:n<=3?1:n<=9?2:n<=19?3:4;
  const offset=new Date(days[0].date+'T00:00:00Z').getUTCDay();
  const step=mobile?10:20,tile=mobile?8:16,gx=mobile?42:90,gy=mobile?98:100;
  const tiles=days.map((d,i)=>{
    const x=gx+Math.floor((i+offset)/7)*step,y=gy+(i+offset)%7*step;
    // Only decorative outlines animate. Data colors and square positions stay fixed.
    const glint=d.count?rect(x,y,tile,tile,'none',`class="activity-glint" rx="${mobile?1.5:3}" stroke="${p.lime}" stroke-width="${mobile?.8:1.2}" style="animation-delay:${(Math.floor((i+offset)/7)*.09).toFixed(2)}s"`):'';
    return `<g data-date="${d.date}" data-count="${d.count}"><title>${d.date}: ${d.count} contributions</title>${rect(x,y,tile,tile,colors[level(d.count)],`rx="${mobile?1.5:3}" stroke="#ffffff" stroke-opacity=".06"`)}${glint}</g>`;
  }).join('');
  const months=days.flatMap((d,i)=>{
    const col=Math.floor((i+offset)/7);
    if((i!==0&&d.date.slice(-2)!=='01')||col>51)return [];
    return text(gx+col*step,gy-12,new Date(d.date+'T00:00:00Z').toLocaleDateString('en-US',{month:'short',timeZone:'UTC'}),mobile?10:13,p.muted);
  }).join('');
  const weekdays=[1,3,5].map(row=>text(mobile?12:34,gy+row*step+tile-2,['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][row],mobile?9:12,p.muted)).join('');
  const ly=mobile?187:260,lx=mobile?366:960;
  return svg(w,h,'The daily practice / GitHub contributions',`${s.total} contributions, ${s.active} active days, ${s.longest}-day longest streak. One square per UTC day; weeks in columns, Sunday through Saturday in rows.`,
    text(24,36,'The daily practice.',mobile?22:26,p.ink,'font-weight="700"')+
    (mobile?mono(24,61,`${s.total.toLocaleString('en-US')} contributions / past 365 days`,13,p.lime):
      mono(w-26,36,`${s.total.toLocaleString('en-US')} contributions / past 365 days`,16,p.lime,'text-anchor="end"'))+
    months+weekdays+tiles+
    (mobile?'':mono(26,272,`${s.active} active days  /  ${s.longest}-day best streak`,13))+
    text(lx-38,ly+10,'Less',mobile?11:12,p.muted)+colors.map((color,i)=>rect(lx+i*18,ly,12,12,color,'rx="2"')).join('')+
    text(lx+95,ly+10,'More',mobile?11:12,p.muted)+
    (mobile?mono(24,228,`${s.active} active days / ${s.longest}-day best streak`,12):''),
    '.activity-glint{opacity:0;animation:activity-wave 8s ease-in-out infinite}@keyframes activity-wave{0%,18%,100%{opacity:0}8%{opacity:.95}}');
}
