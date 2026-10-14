// Code / Circuits / Canvas: original, dependency-free SVG artwork.
// Google-inspired (Material 3) language: four-color accents, tonal surfaces,
// pill shapes, and automatic light/dark themes via prefers-color-scheme.
import {normalizeDays, summarize} from './activity.mjs';

const G = {blue:'#4285f4', red:'#ea4335', yellow:'#fbbc04', green:'#34a853'};
const SANS = "'Google Sans','Google Sans Text','Product Sans',Roboto,'Segoe UI','Helvetica Neue',Arial,sans-serif";
const MONO = "'Google Sans Mono','Roboto Mono',Consolas,monospace";
// Theme tokens as [light, dark]. Each becomes a CSS class; the light value is
// also written as a presentation attribute so CSS-less renderers stay legible.
const T = {
  bg:['#ffffff','#131314'], c1:['#f8fafd','#1b1c1d'], c2:['#f0f4f9','#1e1f20'], c3:['#e9eef6','#282a2c'],
  ink:['#1f1f1f','#e3e3e3'], mu:['#5f6368','#9aa0a6'], ol:['#dadce0','#3c4043'],
  ac:['#0b57d0','#a8c7fa'], acc:['#d3e3fd','#0842a0'], onacc:['#041e49','#d3e3fd'],
  l0:['#ebeef2','#282a2c'], l1:['#ceead6','#0d4f22'], l2:['#81c995','#137333'], l3:['#34a853','#34a853'], l4:['#137333','#81c995'],
};
const css = () => {
  const set = i => Object.entries(T).map(([k,v])=>`.${k}{fill:${v[i]}}.s-${k}{stroke:${v[i]}}`).join('');
  return `svg{font-family:${SANS}}text{font-kerning:normal}${set(0)}@media(prefers-color-scheme:dark){${set(1)}}`;
};
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
// Fill/stroke may be theme tokens (class + light fallback) or literal colors.
const paint = (fill, stroke) => {
  const out=[], cls=[];
  if(fill){ out.push(`fill="${T[fill]?.[0]??fill}"`); if(T[fill]) cls.push(fill); }
  if(stroke){ out.push(`stroke="${T[stroke]?.[0]??stroke}"`); if(T[stroke]) cls.push('s-'+stroke); }
  if(cls.length) out.push(`class="${cls.join(' ')}"`);
  return out.join(' ');
};
const rect = (x,y,w,h,fill,extra='',stroke) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" ${paint(fill,stroke)} ${extra}/>`;
const text = (x,y,value,size=18,fill='ink',extra='') => `<text x="${x}" y="${y}" font-size="${size}" ${paint(fill)} ${extra}>${escape(value)}</text>`;
const mono = (x,y,value,size=13,fill='mu',extra='') => text(x,y,value,size,fill,`font-family="${MONO}" ${extra}`);
const svg = (w,h,title,desc,body,styles='',defs='') => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title desc">
<title id="title">${escape(title)}</title><desc id="desc">${escape(desc)}</desc>
<style>${css()}${styles}@media(prefers-reduced-motion:reduce){*{animation:none!important}.activity-glint{display:none}}</style>
${defs?`<defs>${defs}</defs>`:''}${rect(.5,.5,w-1,h-1,'bg','rx="24"','ol')}${body}</svg>\n`;

// Small shared pieces of the visual language.
const dots = (x,y,r=5,gap=14) => [G.blue,G.red,G.yellow,G.green].map((c,i)=>`<circle cx="${x+i*gap}" cy="${y}" r="${r}" fill="${c}"/>`).join('');
const sparkle = s => `M0 ${-s}C${s*.14} ${-s*.3} ${s*.3} ${-s*.14} ${s} 0C${s*.3} ${s*.14} ${s*.14} ${s*.3} 0 ${s}C${-s*.14} ${s*.3} ${-s*.3} ${s*.14} ${-s} 0C${-s*.3} ${-s*.14} ${-s*.14} ${-s*.3} 0 ${-s}Z`;
const chipWidth = (label,size,dot) => Math.round(label.length*size*.56+(dot?44:30));
const chip = (x,y,label,{dot,size=14,h=32,fill='bg',stroke='ol',color='ink'}={}) =>
  rect(x,y,chipWidth(label,size,dot),h,fill,`rx="${h/2}"`,stroke)+
  (dot?`<circle cx="${x+18}" cy="${y+h/2}" r="5" fill="${dot}"/>`:'')+
  text(x+(dot?31:15),y+h/2+size*.36,label,size,color,'font-weight="500"');
// Lays chips out left-to-right from x, or right-to-left when align is 'end'.
const chipRow = (x,y,items,{align='start',gap=8,...opts}={}) => {
  const widths=items.map(it=>chipWidth(it.label,it.size??opts.size??14,it.dot));
  let cursor=align==='end'?x-widths.reduce((a,b)=>a+b,0)-gap*(items.length-1):x;
  return items.map((it,i)=>{const out=chip(cursor,y,it.label,{...opts,...it}); cursor+=widths[i]+gap; return out;}).join('');
};

const WORD=[...'tensorkai'], WORD_COLORS=[G.blue,G.red,G.yellow,G.blue,G.green,G.red,G.blue,G.yellow,G.green];
const wordmark = (x,y,size) => `<text x="${x}" y="${y}" font-size="${size}" font-weight="500" letter-spacing="${(-size*.02).toFixed(1)}">${WORD.map((c,i)=>`<tspan fill="${WORD_COLORS[i]}">${c}</tspan>`).join('')}</text>`;

const searchBar = (x,y,w,h,size) => {
  const r=h/2, cy=y+r, lens=size*.34;
  return `<g filter="url(#lift)">${rect(x,y,w,h,'c1',`rx="${r}"`,'ol')}</g>`+
    `<g fill="none" stroke-width="2.4" stroke-linecap="round" ${paint(null,'mu')}><circle cx="${x+r}" cy="${cy-2}" r="${lens}"/><path d="M${(x+r+lens*.72).toFixed(1)} ${(cy-2+lens*.72).toFixed(1)}l${(size*.28).toFixed(1)} ${(size*.28).toFixed(1)}"/></g>`+
    `<text x="${x+r+size*1.05}" y="${(cy+size*.36).toFixed(1)}" font-size="${size}" ${paint('ink')}>Turning “what if” into <tspan font-weight="500" ${paint('ac')}>“it works.”</tspan></text>`+
    `<circle cx="${x+w-r}" cy="${cy}" r="${r-8}" fill="${G.blue}"/>`+
    `<path d="M${x+w-r-size*.32} ${cy}h${size*.64}m${-size*.26} ${-size*.26} ${size*.26} ${size*.26} ${-size*.26} ${size*.26}" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;
};

// Layered shapes: a microchip, a sweep of paint, and a spark of intelligence.
const illustration = (cx,cy,scale) => `<g transform="translate(${cx} ${cy}) scale(${scale})" aria-hidden="true">
  <path d="M-150 -20C-150 -120 40 -150 130 -62" fill="none" stroke-width="2" stroke-dasharray="1 9" stroke-linecap="round" ${paint(null,'mu')}/>
  <g class="float-a"><circle cx="130" cy="-62" r="54" fill="${G.green}"/></g>
  <g class="float-b"><path d="M-160 128V38A90 90 0 0 1 -70 128Z" fill="${G.yellow}"/></g>
  <g transform="translate(110 94) rotate(-28)"><g class="float-c"><rect x="-58" y="-22" width="116" height="44" rx="22" fill="${G.red}"/></g></g>
  <g transform="rotate(-8)">
    <path d="${[-36,-12,12,36].map(n=>`M${n} -86v14M${n} 72v14M-86 ${n}h14M72 ${n}h14`).join('')}" stroke="${G.blue}" stroke-width="7" stroke-linecap="round"/>
    <rect x="-66" y="-66" width="132" height="132" rx="30" fill="${G.blue}"/>
    <rect x="-46" y="-46" width="92" height="92" rx="18" fill="none" stroke="#ffffff" stroke-opacity=".35" stroke-width="2"/>
    <text x="0" y="14" font-size="40" font-weight="700" fill="#ffffff" text-anchor="middle" font-family="${MONO}">&lt;/&gt;</text>
  </g>
  <g transform="translate(-128 -78)"><g class="twinkle"><path d="${sparkle(20)}" fill="${G.blue}"/></g></g>
  <g transform="translate(176 26)"><g class="twinkle" style="animation-delay:-2s"><path d="${sparkle(10)}" fill="${G.yellow}"/></g></g>
</g>`;

const steps = (x,y,size) => `<text x="${x}" y="${y}" font-size="${size}" ${paint('mu')}>`+
  [['01','Think it',G.blue],['02','Build it',G.red],['03','Make it matter',G.green]]
    .map(([n,label,c],i)=>`${i?'<tspan dx="18"> </tspan>':''}<tspan fill="${c}" font-weight="700">${n}</tspan> ${label}`).join('')+'</text>';

export function renderMasthead({mobile=false}={}) {
  const w=mobile?600:1200,h=mobile?392:340;
  const pillars=[{label:'Code',dot:G.blue},{label:'Circuits',dot:G.red},{label:'Canvas',dot:G.yellow}];
  const body=mobile?
    dots(34,44)+text(92,49,'Benedict Fusin · @tensorkai',15,'mu','font-weight="500"')+
    wordmark(24,148,72)+illustration(482,138,.48)+
    searchBar(24,206,552,56,19)+
    chipRow(24,286,pillars,{size:14})+
    steps(24,360,14):
    dots(40,44)+text(100,50,'Benedict Fusin · @tensorkai',17,'mu','font-weight="500"')+
    wordmark(30,164,108)+
    searchBar(32,194,620,60,22)+
    chipRow(32,276,pillars,{size:14})+
    steps(362,298,16)+
    illustration(965,172,1);
  return svg(w,h,'TENSORKAI — Code / Circuits / Canvas','Benedict Fusin. Turning what if into it works. AI, embedded systems, and art.',body,
    `.float-a{animation:float 8s ease-in-out infinite}.float-b{animation:float 9s ease-in-out -3s infinite}.float-c{animation:drift 7s ease-in-out infinite}`+
    `.twinkle{transform-box:fill-box;transform-origin:center;animation:twinkle 4s ease-in-out infinite}`+
    `@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}`+
    `@keyframes drift{0%,100%{transform:translateX(0)}50%{transform:translateX(6px)}}`+
    `@keyframes twinkle{0%,100%{transform:scale(.8) rotate(0deg);opacity:.75}50%{transform:scale(1.1) rotate(45deg);opacity:1}}`,
    '<filter id="lift" x="-5%" y="-30%" width="110%" height="170%"><feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#3c4043" flood-opacity=".18"/><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#3c4043" flood-opacity=".1"/></filter>');
}

const groupIcon = (kind,cx,cy,r,color) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}"/><g transform="translate(${cx} ${cy}) scale(${(r/20).toFixed(2)})" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${
  kind==='frontend'?'<path d="M-4 -7l-6 7 6 7M4 -7l6 7-6 7"/>':
  kind==='backend'?'<ellipse cx="0" cy="-6" rx="8" ry="3"/><path d="M-8 -6v12c0 1.7 3.6 3 8 3s8-1.3 8-3v-12M-8 0c0 1.7 3.6 3 8 3s8-1.3 8-3"/>':
  `<path d="${sparkle(10)}" fill="#ffffff" stroke="none"/>`}</g>`;

export function renderStackArt({mobile=false,logos={}}={}) {
  const groups=[
    {name:'Frontend',kind:'frontend',color:G.blue,tools:[['javascript','JavaScript'],['typescript','TypeScript'],['react','React'],['nextjs','Next.js'],['vuejs','Vue'],['tailwindcss','Tailwind CSS'],['flutter','Flutter'],['dart','Dart']]},
    {name:'Backend',kind:'backend',color:G.green,tools:[['nodejs','Node.js'],['fastapi','FastAPI'],['nestjs','NestJS'],['spring','Spring'],['postgresql','PostgreSQL'],['mongodb','MongoDB'],['mysql','MySQL']]},
    {name:'AI and Machine Learning',kind:'ai',color:G.red,tools:[['python','Python'],['pytorch','PyTorch'],['tensorflow','TensorFlow'],['huggingface','Hugging Face'],['langchain','LangChain'],['ollama','Ollama']]},
  ];
  const rowH=mobile?248:120,w=mobile?600:1200,h=16+3*rowH+2*12+16;
  const logo=(key,cx,cy,r)=>{
    if(!logos[key])throw new Error('Missing local technology logo: '+key);
    // Keep upstream geometry; namespace gradient IDs when combining SVG files.
    const source=logos[key].replace(/id="([^"]+)"/g,(_,id)=>`id="logo-${key}-${id}"`)
      .replace(/url\(#([^)]+)\)/g,(_,id)=>`url(#logo-${key}-${id})`)
      .replace(/(href=")#([^"]+)/g,(_,prefix,id)=>`${prefix}#logo-${key}-${id}`);
    const fill=key==='huggingface'?'#ffcf4a':['langchain','ollama'].includes(key)?'#1f1f1f':'#000';
    const size=Math.round(r*1.15);
    // Logos sit on white "app icon" discs so dark marks stay visible in dark mode.
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#ffffff" ${paint(null,'ol')}/>`+
      source.replace(/<svg\b([^>]*)>/,(_,attrs)=>`<svg ${attrs.replace(/\s(?:width|height)="[^"]*"/g,'')} x="${cx-size/2}" y="${cy-size/2}" width="${size}" height="${size}" fill="${fill}">`);
  };
  const rows=groups.map((group,i)=>{
    const y=16+i*(rowH+12);
    const count=`${group.tools.length} tools`;
    const heading=mobile?
      groupIcon(group.kind,44,y+34,18,group.color)+text(72,y+41,group.name,19,'ink','font-weight="500"')+text(w-36,y+41,count,13,'mu','text-anchor="end"'):
      groupIcon(group.kind,58,y+60,20,group.color)+(group.kind==='ai'?
        text(92,y+48,'AI and',20,'ink','font-weight="500"')+text(92,y+72,'Machine Learning',20,'ink','font-weight="500"')+text(92,y+95,count,14,'mu'):
        text(92,y+58,group.name,20,'ink','font-weight="500"')+text(92,y+81,count,14,'mu'));
    const items=group.tools.map(([key,name],j)=>{
      const cx=mobile?84+(j%4)*144:330+j*112;
      const cy=mobile?y+96+Math.floor(j/4)*92:y+48;
      return `<g data-tech="${key}">${logo(key,cx,cy,mobile?26:28)}`+
        text(cx,cy+(mobile?46:52),name,mobile?14:13,'mu','text-anchor="middle"')+'</g>';
    }).join('');
    return rect(16,y,w-32,rowH,'c2','rx="20"')+heading+items;
  }).join('');
  return svg(w,h,'Tech stack',groups.map(g=>g.name+': '+g.tools.map(t=>t[1]).join(', ')+'.').join(' '),rows);
}

export function renderContributionArt(snapshot,{mobile=false}={}) {
  const fetched=new Date(snapshot.fetchedAt);
  if(!Number.isFinite(fetched.getTime())) throw new Error('Invalid refresh timestamp');
  const days=normalizeDays(snapshot.days,fetched.toISOString().slice(0,10));
  const s=summarize(days),w=mobile?600:1200,h=mobile?248:300;
  const level=n=>n===0?0:n<=3?1:n<=9?2:n<=19?3:4;
  const offset=new Date(days[0].date+'T00:00:00Z').getUTCDay();
  const step=mobile?9.5:19,tile=mobile?7.5:15,gx=mobile?30:64,gy=mobile?114:120;
  // Oblique projection keeps weeks readable while giving each day real depth.
  const project=(col,row)=>({x:gx+col*step+row*step*.45,y:gy+row*step*.72});
  const elevation=count=>(mobile?1.2:2.4)+level(count)*(mobile?1.6:3.2);
  const face=(x,y)=>`M${x} ${y}h${tile}l${tile*.45} ${tile*.72}h${-tile}Z`;
  const tiles=days.map((d,i)=>{
    const {x,y}=project(Math.floor((i+offset)/7),(i+offset)%7),z=elevation(d.count);
    const sides=`M${x} ${y-z}v${z}l${tile*.45} ${tile*.72}h${tile}v${-z}h${-tile}Z`;
    return `<g data-date="${d.date}" data-count="${d.count}"><title>${d.date}: ${d.count} contributions</title>`+
      `<path d="${sides}" ${paint('l'+level(d.count))}/><path d="${sides}" fill="#000000" opacity=".22"/>`+
      `<path class="tile-top l${level(d.count)}" data-height="${z}" d="${face(x,y-z)}" fill="${T['l'+level(d.count)][0]}"/>`+
      `<path d="M${x} ${y-z}h${tile}l${tile*.45} ${tile*.72}" fill="none" stroke="#ffffff" stroke-opacity=".3" stroke-width=".6"/></g>`;
  }).join('');
  // A blue scanner with a four-color trail follows a serpentine route through
  // actual calendar cells. It is separate from the immutable data tiles.
  const route=days.map((d,i)=>({col:Math.floor((i+offset)/7),row:(i+offset)%7,count:d.count}))
    .sort((a,b)=>a.col-b.col||(a.col%2?b.row-a.row:a.row-b.row));
  const keyframes=route.map((cell,i)=>{const {x,y}=project(cell.col,cell.row);return `${(i/(route.length-1)*100).toFixed(4)}%{transform:translate(${x}px,${y-elevation(cell.count)}px)}`;}).join('');
  const trail=[G.red,G.yellow,G.green,G.blue];
  const scanner='<g class="calendar-scanner" aria-hidden="true">'+Array.from({length:11},(_,i)=>{
    const lag=10-i,alpha=lag===0?1:(.7*(1-lag/11)).toFixed(2);
    const color=lag===0?G.blue:trail[(lag-1)%4];
    return `<g class="scan-particle" style="animation-delay:${(-8+lag*.075).toFixed(3)}s;opacity:${alpha}">`+
      `<path d="${face(0,0)}" fill="none" stroke="${color}" stroke-linejoin="round" stroke-width="${lag===0?(mobile?1.6:2.4):(mobile?1:1.5)}"/>`+
      (lag===0?`<path d="M${tile/2} -3v-2M${tile/2} ${tile+3}v2" stroke="${G.blue}" stroke-width="${mobile?1:1.5}" stroke-linecap="round"/>`:'')+'</g>';
  }).join('')+'</g>';
  const firstMonthCol=days.findIndex((d,i)=>i>0&&d.date.endsWith('-01'));
  const months=days.flatMap((d,i)=>{
    const col=Math.floor((i+offset)/7);
    if((i!==0&&d.date.slice(-2)!=='01')||col>51)return [];
    if(i===0&&firstMonthCol>0&&Math.floor((firstMonthCol+offset)/7)<3)return [];
    return text(gx+col*step,gy-(mobile?20:28),new Date(d.date+'T00:00:00Z').toLocaleDateString('en-US',{month:'short',timeZone:'UTC'}),mobile?10:13,'mu');
  }).join('');
  const weekdays=[1,3,5].map(row=>{const {x,y}=project(0,row);return text(x-8,y+tile*.5,['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][row],mobile?8:11,'mu','text-anchor="end"');}).join('');
  const stats=[
    {label:`${s.total.toLocaleString('en-US')} contributions`,fill:'acc',stroke:'acc',color:'onacc'},
    {label:`${s.active} active days`,dot:G.green},
    {label:`${s.longest}-day best streak`,dot:G.yellow},
  ];
  const ly=mobile?187:262,lx=mobile?366:1022;
  const legend=text(lx-38,ly+10,'Less',mobile?11:12,'mu')+
    [0,1,2,3,4].map(i=>rect(lx+i*18,ly,12,12,'l'+i,'rx="3"')).join('')+
    text(lx+95,ly+10,'More',mobile?11:12,'mu');
  return svg(w,h,'The daily practice / GitHub contributions',`${s.total} contributions, ${s.active} active days, ${s.longest}-day longest streak. One 3D tile per UTC day; height and green intensity show contribution levels. Weeks in columns, Sunday through Saturday in rows.`,
    (mobile?
      text(24,36,'The daily practice.',20,'ink','font-weight="500"')+chipRow(24,46,stats,{size:12,h:24}):
      dots(36,42,4.5,12)+text(90,49,'The daily practice.',24,'ink','font-weight="500"')+chipRow(1168,26,stats,{align:'end',size:14,h:34}))+
    months+weekdays+tiles+scanner+legend+
    (mobile?text(24,228,'One 3D tile per UTC day · past 365 days',12,'mu'):
      text(34,273,'One 3D tile per UTC day · past 365 days',13,'mu')),
    `.scan-particle{animation:calendar-scan 24s linear infinite}@keyframes calendar-scan{${keyframes}}@media(prefers-reduced-motion:reduce){.calendar-scanner{display:none}}`);
}
