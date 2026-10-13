import {writeFile} from 'node:fs/promises';
import {renderMasthead} from './profile-art.mjs';
await writeFile(new URL('../assets/masthead.svg',import.meta.url),renderMasthead());
await writeFile(new URL('../assets/masthead-mobile.svg',import.meta.url),renderMasthead({mobile:true}));
console.log('Generated Code / Circuits / Canvas mastheads.');
