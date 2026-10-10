// Original Signal / Studio artwork for Benedict Fusin. No dependencies.
// Regenerate from the repository root: node scripts/generate-art.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const out = fileURLToPath(new URL('../assets/', import.meta.url));
mkdirSync(out, { recursive: true });
const seed = [...'TENSORKAI / BENEDICT FUSIN'].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261);
const phase = (seed % 6283) / 1000;
const paper = '#f2efe6', ink = '#202723', muted = '#62685e', orange = '#d54b25';
const label = (x,y,t,c=muted,extra='') => `<text x="${x}" y="${y}" font-family="'Courier New',monospace" font-size="13" letter-spacing="1.2" fill="${c}" ${extra}>${t}</text>`;
const text = (x,y,t,size=14,c=ink,extra='') => `<text x="${x}" y="${y}" font-family="Arial,sans-serif" font-size="${size}" fill="${c}" ${extra}>${t}</text>`;
function svg(w,h,title,desc,body,styles='') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title desc">
<title id="title">${title}</title><desc id="desc">${desc}</desc>
<style>text{font-kerning:normal}${styles}
@media(prefers-reduced-motion:reduce){*{animation:none!important}}</style>
${body}
</svg>\n`;
}
// Each nested contour is a different slice of the same identity-seeded field.
const contours = Array.from({length:25},(_,layer) => {
  const radius=22+layer*4.55;
  const d=Array.from({length:181},(_,step)=>{
    const theta=step/180*Math.PI*2;
    const wave=1+0.15*Math.cos(theta*3+phase+layer*0.033)+0.055*Math.sin(theta*5-layer*0.045);
    const x=909+Math.cos(theta)*radius*wave*1.27, y=398+Math.sin(theta)*radius*wave;
    return `${step?'L':'M'}${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ')+' Z';
  return `<path d="${d}" fill="none" stroke="${layer%5===0?'#f89b70':'#cbd1b7'}" stroke-width="${layer%5===0?1.5:0.8}" opacity="${(0.4+layer/48).toFixed(2)}"/>`;
}).join('\n');
const bits=[...'TENSORKAI'].flatMap(c=>c.charCodeAt(0).toString(2).padStart(8,'0').split(''));
const marks=bits.map((b,i)=>`<rect x="${730+i*5}" y="570" width="2" height="${b==='1'?12:4}" fill="${b==='1'?orange:muted}"/>`).join('');
const ticks=Array.from({length:19},(_,i)=>`<path d="M${48+i*61.33} 208v${i%3===0?10:5}" stroke="#a8aa9d"/>`).join('');
writeFileSync(out+'signal-studio.svg',svg(1200,630,'TENSORKAI — Signal / Studio',
'Benedict Fusin. From signal to something that ships. A personal contour sculpture connects AI, electronics, and art.',
`<defs>
<pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#303b34" stroke-width="0.6"/></pattern>
<clipPath id="panel"><rect x="704" y="241" width="448" height="306" rx="2"/></clipPath>
<linearGradient id="scan"><stop stop-color="#f89b70" stop-opacity="0"/><stop offset="0.5" stop-color="#f89b70" stop-opacity="0.12"/><stop offset="1" stop-color="#f89b70" stop-opacity="0"/></linearGradient>
</defs>
<rect width="1200" height="630" fill="${paper}"/><rect width="8" height="630" fill="${orange}"/>
<path d="M48 71H1152M48 208H1152" stroke="#c1c2b5"/>
<rect x="48" y="34" width="10" height="10" fill="${orange}"/>
${label(72,44,'SIGNAL / STUDIO',ink)}
${label(1152,44,'BENEDICT FUSIN / ENGINEER + ARTIST',ink,'text-anchor="end"')}
${text(41,183,'TENSORKAI',133,ink,'font-weight="900" letter-spacing="-7"')}
${label(1152,130,'APPLIED ML',muted,'text-anchor="end"')}
${label(1152,155,'EDGE SYSTEMS',muted,'text-anchor="end"')}
${label(1152,180,'PRODUCT CRAFT',muted,'text-anchor="end"')}
${ticks}
${label(48,263,'01 / A PRACTICE IN MAKING',orange)}
${text(45,333,'From signal',59,ink,'font-weight="700" letter-spacing="-2.5"')}
${text(45,399,'to something',59,ink,'font-weight="700" letter-spacing="-2.5"')}
${text(45,465,'that ships.',59,orange,'font-weight="700" letter-spacing="-2.5"')}
${text(48,512,'Models. Microcontrollers. Human hands.',21,muted)}
${text(48,540,'The interesting part is connecting them.',21,muted)}
<rect x="704" y="241" width="448" height="306" rx="2" fill="${ink}"/>
<g clip-path="url(#panel)">
<rect x="704" y="241" width="448" height="306" fill="url(#grid)"/>
<path d="M704 398H1152M909 241V547" stroke="#58614f" stroke-width="0.6" stroke-dasharray="3 8"/>
<g class="sculpture">${contours}</g>
<rect class="scan" x="684" y="241" width="80" height="306" fill="url(#scan)"/>
<circle cx="909" cy="398" r="5" fill="#f89b70"/>
<circle class="pulse" cx="909" cy="398" r="13" fill="none" stroke="#f89b70" opacity="0.5"/>
</g>
${label(721,263,'FIG. 01','#dce0cb')}
${label(1136,529,'IDENTITY → CONTOUR','#dce0cb','text-anchor="end"')}
${marks}<path d="M48 593H1152" stroke="#c1c2b5"/>
${label(48,616,'PUP STA. MESA / LOOMPOINT AI')}
${label(1152,616,'CODE · CIRCUITS · CANVAS',ink,'text-anchor="end"')}`,
`.sculpture{transform-origin:909px 398px;animation:breathe 12s ease-in-out infinite}
.scan{animation:scan 10s ease-in-out infinite}
.pulse{transform-origin:909px 398px;animation:pulse 6s ease-in-out infinite}
@keyframes breathe{0%,100%{transform:rotate(-5deg) scale(.94)}50%{transform:rotate(5deg) scale(1)}}
@keyframes scan{0%,15%{transform:translateX(0)}75%,100%{transform:translateX(480px)}}
@keyframes pulse{0%,100%{transform:scale(.7);opacity:.3}50%{transform:scale(1.4);opacity:.8}}`));
const stations=[
{x:48,n:'01',title:'Observe.',detail:'Start with the problem.'},
{x:342,n:'02',title:'Model.',detail:'Give the idea a shape.'},
{x:636,n:'03',title:'Build.',detail:'Meet the constraints.'},
{x:930,n:'04',title:'Ship.',detail:'Put it in human hands.'}];
writeFileSync(out+'signal-path.svg',svg(1200,228,'From observation to a working product',
'Observe, model, build, ship. A returning signal connects the last step to the first.',
`<rect width="1200" height="228" fill="${ink}"/>
${label(48,32,'THE WORKING LOOP','#bdc5b3')}
<path d="M60 68H1140" fill="none" stroke="#55604f"/>
<path class="transmit" d="M60 68H1140" fill="none" stroke="#f89b70" stroke-width="2" stroke-dasharray="24 1056"/>
${stations.map(s=>`<circle cx="${s.x+12}" cy="68" r="12" fill="${ink}" stroke="#a1ad96"/>
${text(s.x+12,72,s.n,10,'#f4eee1','text-anchor="middle"')}
${text(s.x,123,s.title,32,paper,'font-weight="700" letter-spacing="-1"')}
${text(s.x,151,s.detail,17,'#c3cabb')}`).join('\n')}
<path d="M1140 172v23H60v-16m-5 5 5-5 5 5" fill="none" stroke="#73816c"/>
<rect x="453" y="184" width="294" height="22" fill="${ink}"/>
${label(600,200,'LEARN. REFINE. RETURN.','#f89b70','text-anchor="middle"')}`,
'.transmit{animation:transmit 9s linear infinite}@keyframes transmit{from{stroke-dashoffset:24}to{stroke-dashoffset:-1056}}'));
writeFileSync(out+'studio-colophon.svg',svg(1200,206,'Ship it where it actually has to run.',
'Benedict Fusin / TENSORKAI. Code, circuits, canvas.',
`<rect width="1200" height="206" fill="${paper}"/><rect width="8" height="206" fill="${orange}"/>
${label(48,39,'A NOTE TO BUILD BY',orange)}
${text(46,99,'Ship it where it actually has to run.',43,ink,'font-weight="700" letter-spacing="-1.5"')}
<path d="M48 134H1152" stroke="#c1c2b5"/>
${label(48,171,'BENEDICT FUSIN / TENSORKAI',ink)}
${label(1152,171,'CODE · CIRCUITS · CANVAS',muted,'text-anchor="end"')}
<path d="M1070 85h66m-18-18 18 18-18 18" fill="none" stroke="${orange}" stroke-width="3"/>`));
console.log('Generated three Signal / Studio SVG assets.');
