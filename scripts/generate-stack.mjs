import {writeFile} from 'node:fs/promises';
import {renderMasthead,renderStackArt} from './profile-art.mjs';
await writeFile(new URL('../assets/masthead.svg',import.meta.url),renderMasthead());
await writeFile(new URL('../assets/masthead-mobile.svg',import.meta.url),renderMasthead({mobile:true}));
await writeFile(new URL('../assets/idea-engine.svg',import.meta.url),renderStackArt());
await writeFile(new URL('../assets/idea-engine-mobile.svg',import.meta.url),renderStackArt({mobile:true}));
console.log('Generated Code / Circuits / Canvas mastheads and technology modules.');
