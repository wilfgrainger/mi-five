import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const appTsxPath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(appTsxPath, 'utf8');

// Fix double-opacity broken patterns like border-white/10/20 → border-white/20
// Also bg-white/5/80 → bg-white/10, bg-black/20/50 → bg-black/20, etc.
content = content.replace(/border-white\/10\/(\d+)/g, (_, n) => `border-white/${n}`);
content = content.replace(/border-white\/20\/(\d+)/g, (_, n) => `border-white/${n}`);
content = content.replace(/border-white\/30\/(\d+)/g, (_, n) => `border-white/${n}`);
content = content.replace(/bg-white\/5\/(\d+)/g, (_, n) => `bg-white/5`);
content = content.replace(/bg-white\/(\d+)\/(\d+)/g, (_, a, b) => `bg-white/${a}`);
content = content.replace(/bg-black\/(\d+)\/(\d+)/g, (_, a, b) => `bg-black/${a}`);
content = content.replace(/divide-cyan-500\/10/g, 'divide-white/10');
content = content.replace(/border-cyan-800/g, 'border-white/10');
// bg-cyan-400 was missed
content = content.replace(/bg-cyan-400/g, 'bg-violet-400');
content = content.replace(/text-cyan-800/g, 'text-violet-800');
// Fix the leftover cyan-400 accent color in leaderboard highlight bar
content = content.replace(/bg-cyan-400\s/g, 'bg-violet-400 ');

fs.writeFileSync(appTsxPath, content);
console.log('Done!');
