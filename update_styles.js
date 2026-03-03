import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const appTsxPath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(appTsxPath, 'utf8');

// Replace colors and backgrounds
content = content.replace(/bg-\[#050b14\]/g, 'bg-black/20');
content = content.replace(/bg-\[#0a1526\]/g, 'bg-white/5');
content = content.replace(/text-cyan-400/g, 'text-violet-300');
content = content.replace(/text-cyan-500/g, 'text-violet-400');
content = content.replace(/text-cyan-600/g, 'text-violet-500');
content = content.replace(/text-cyan-300/g, 'text-violet-200');
content = content.replace(/text-cyan-100/g, 'text-violet-100');
content = content.replace(/bg-cyan-900/g, 'bg-violet-900');
content = content.replace(/bg-cyan-500/g, 'bg-violet-500');
content = content.replace(/border-cyan-500/g, 'border-white/10');
content = content.replace(/border-cyan-400/g, 'border-white/20');
content = content.replace(/border-cyan-300/g, 'border-white/30');

// Replace green console colors
content = content.replace(/text-green-500/g, 'text-white');
content = content.replace(/text-green-400/g, 'text-violet-300');
content = content.replace(/text-green-600/g, 'text-violet-400');
content = content.replace(/bg-green-500/g, 'bg-violet-500');
content = content.replace(/border-green-500/g, 'border-violet-500');

// Remove console specific borders and fonts
content = content.replace(/font-mono/g, 'font-sans');
content = content.replace(/tracking-\[0\.2em\]/g, 'tracking-normal');
content = content.replace(/tracking-\[0\.3em\]/g, 'tracking-normal');
content = content.replace(/tracking-\[0\.5em\]/g, 'tracking-widest');
content = content.replace(/tracking-widest/g, 'tracking-wide');

// Fix specific shadows and backgrounds
content = content.replace(/shadow-\[0_0_10px_rgba\(6,182,212,0\.5\)\]/g, 'shadow-lg shadow-violet-500/20');
content = content.replace(/shadow-\[0_0_15px_rgba\(6,182,212,0\.5\)\]/g, 'shadow-xl shadow-violet-500/30');
content = content.replace(/shadow-\[0_0_20px_rgba\(6,182,212,0\.5\)\]/g, 'shadow-2xl shadow-violet-500/40');
content = content.replace(/shadow-\[0_4px_30px_rgba\(0,0,0,0\.5\)\]/g, 'shadow-[0_8px_32px_rgba(31,38,135,0.15)]');

fs.writeFileSync(appTsxPath, content);
console.log('App.tsx updated');
