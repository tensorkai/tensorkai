import {writeFile} from 'node:fs/promises';
import {renderStackArt} from './profile-art.mjs';
await writeFile(new URL('../assets/tech-stack.svg',import.meta.url),renderStackArt());
await writeFile(new URL('../assets/tech-stack-mobile.svg',import.meta.url),renderStackArt({mobile:true}));
console.log('Generated the local tech-stack map.');
