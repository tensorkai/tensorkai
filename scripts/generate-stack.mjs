import {readFile,writeFile} from 'node:fs/promises';
import {renderMasthead,renderStackArt} from './profile-art.mjs';
await writeFile(new URL('../assets/masthead.svg',import.meta.url),renderMasthead());
await writeFile(new URL('../assets/masthead-mobile.svg',import.meta.url),renderMasthead({mobile:true}));
const sources=JSON.parse(await readFile(new URL('../assets/logos/sources.json',import.meta.url),'utf8'));
const logos=Object.fromEntries(await Promise.all(Object.keys(sources).map(async key=>[key,await readFile(new URL('../assets/logos/'+key+'.svg',import.meta.url),'utf8')])));
await writeFile(new URL('../assets/stack.svg',import.meta.url),renderStackArt({logos}));
await writeFile(new URL('../assets/stack-mobile.svg',import.meta.url),renderStackArt({mobile:true,logos}));
console.log('Generated mastheads and logo-based technology stack.');
