/**
 * Puzzle Seed Generator — produces 250 diverse spy puzzles
 * Run: npx tsx worker/generate-seed.ts > worker/puzzles-seed.sql
 */

import { randomUUID } from 'crypto';

type Puzzle = {
  id: string;
  type: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  multiplier: number;
  puzzle_data: string;
  answer: string;
};

const puzzles: Puzzle[] = [];

// ─────────────────────────────────────────────────
// HELPER: escape single quotes for SQL
// ─────────────────────────────────────────────────
const esc = (s: string) => s.replace(/'/g, "''");

// ─────────────────────────────────────────────────
// TYPE 1 — CAESAR CIPHER (60 puzzles)
// ─────────────────────────────────────────────────
const CAESAR_MESSAGES = [
  "THE PACKAGE HAS BEEN DELIVERED", "ABORT THE OPERATION NOW", "MEET ME AT THE DOCK AT MIDNIGHT",
  "THE MOLE IS INSIDE THE AGENCY", "OPERATION NIGHTFALL IS COMPROMISED", "EXTRACT THE ASSET IMMEDIATELY",
  "THE CODE BOOK IS HIDDEN IN THE VAULT", "SWITCH TO SECONDARY COMMUNICATIONS", "BURN ALL DOCUMENTS",
  "THE TARGET HAS LEFT THE BUILDING", "PROCEED WITH CAUTION", "SURVEILLANCE HAS BEEN DETECTED",
  "THE RENDEZVOUS IS CANCELLED", "ACTIVATE THE SLEEPER AGENT", "THE SHADOW PROTOCOL IS LIVE",
  "ENEMY FORCES INBOUND", "HOLD YOUR POSITION", "SIGNAL RECEIVED AWAITING ORDERS",
  "THE COURIER HAS BEEN INTERCEPTED", "INITIATE RADIO SILENCE"
];

for (const [idx, msg] of CAESAR_MESSAGES.entries()) {
  const shift = (idx % 12) + 3; // shifts 3-14
  let encrypted = '';
  for (const ch of msg) {
    if (ch === ' ') { encrypted += ' '; continue; }
    encrypted += String.fromCharCode(((ch.charCodeAt(0) - 65 + shift) % 26) + 65);
  }
  const difficulty = shift <= 6 ? 'Easy' : shift <= 10 ? 'Medium' : 'Hard';
  const multiplier = shift <= 6 ? 1 : shift <= 10 ? 2 : 3;
  puzzles.push({
    id: randomUUID(), type: 'caesar',
    title: `CAESAR INTERCEPT #${idx + 1}`,
    description: `Intercepted transmission encrypted with a Caesar cipher. Each letter has been shifted by a fixed number of positions. Shift: ${shift}. Decrypt the message.`,
    difficulty, multiplier,
    puzzle_data: JSON.stringify({ encryptedText: encrypted, shift }),
    answer: msg,
  });
}

// Extra Caesar puzzles to reach ~60
const EXTRA_CAESAR = [
  "SECURE CHANNEL OFFLINE", "AWAITING EXTRACTION COORDINATES", "THE BRIDGE IS COMPROMISED",
  "TRUST NO ONE IN THE EMBASSY", "DEAD DROP AT CHECKPOINT CHARLIE", "THE ASSET IS BURNED",
  "HANDLER REQUESTS IMMEDIATE EXTRACTION", "COUNTER SURVEILLANCE DETECTED",
  "USE ONE TIME PAD FOR NEXT TRANSMISSION", "THE CLOCK IS TICKING",
  "EXFILTRATE BEFORE DAWN", "COMPROMISED COVER IDENTITY", "MEETING POSTPONED FORTY EIGHT HOURS",
  "SECONDARY SAFE HOUSE ACTIVATED", "CONFIRM RECEIPT OF PACKAGE",
  "ELIMINATE THE DOUBLE AGENT", "OPERATION BLACKBIRD APPROVED",
  "RADIO FREQUENCIES HAVE CHANGED", "PASSPORT IS IN THE DEAD LETTERBOX",
  "CONTACT THE HANDLER USING CODE SEVEN", "CLEAN TEAM EN ROUTE",
  "ABORT AND EXTRACT USING ALPHA ROUTE", "ENEMY SIGNAL JAMMER DETECTED",
  "DEBRIEF SCHEDULED FOR THURSDAY", "SATELLITE COVERAGE WINDOW NOW OPEN",
  "COMMS WILL GO DARK FOR SIX HOURS", "PROCEED ON SCHEDULE", "NEW IDENTITY PAPERS READY",
  "DO NOT MAKE CONTACT AT THIS TIME", "SILENCE IS PARAMOUNT",
  "THE WATCHER HAS BEEN MADE", "STASH THE DEVICE AND RETREAT",
  "SHADOW THE TARGET FOR FORTY EIGHT HOURS", "REPORT ANY ANOMALIES IMMEDIATELY",
  "THIRD ASSET FROM THE LEFT", "THE CLOCK RESETS AT MIDNIGHT",
  "ECHO TEAM IS IN POSITION", "ADVANCE RECONNAISSANCE COMPLETE",
  "PRIORITY ONE EXTRACTION INITIATED", "OPERATION WHISPER HAS BEGUN",
];
for (const [i, msg] of EXTRA_CAESAR.entries()) {
  const shift = ((i * 3) % 22) + 2;
  let encrypted = '';
  for (const ch of msg) {
    if (ch === ' ') { encrypted += ' '; continue; }
    encrypted += String.fromCharCode(((ch.charCodeAt(0) - 65 + shift) % 26) + 65);
  }
  const difficulty = shift <= 8 ? 'Easy' : shift <= 16 ? 'Medium' : 'Hard';
  puzzles.push({
    id: randomUUID(), type: 'caesar',
    title: `CAESAR SHIFT INTERCEPT`,
    description: `Message encrypted with Caesar cipher (shift: ${shift}). Reverse the shift to read the transmission.`,
    difficulty, multiplier: difficulty === 'Easy' ? 1 : difficulty === 'Medium' ? 2 : 3,
    puzzle_data: JSON.stringify({ encryptedText: encrypted, shift }),
    answer: msg,
  });
}

// ─────────────────────────────────────────────────
// TYPE 2 — MORSE CODE (40 puzzles)
// ─────────────────────────────────────────────────
const MORSE_MAP: Record<string, string> = {
  A:'.-', B:'-...', C:'-.-.', D:'-..', E:'.', F:'..-.',
  G:'--.', H:'....', I:'..', J:'.---', K:'-.-', L:'.-..',
  M:'--', N:'-.', O:'---', P:'.--.', Q:'--.-', R:'.-.', 
  S:'...', T:'-', U:'..-', V:'...-', W:'.--', X:'-..-', 
  Y:'-.--', Z:'--..'
};
const toMorse = (s: string) => s.split('').map(c => c === ' ' ? '/' : (MORSE_MAP[c] ?? '')).join(' ');

const MORSE_MESSAGES = [
  "SOS AGENT DOWN", "GO DARK NOW", "ABORT MISSION", "SIGNAL CLEAR",
  "ASSET SECURE", "EXTRACT NOW", "CODE RED", "STAND BY",
  "MOVE OUT", "ALL CLEAR", "RENDEZVOUS ALPHA", "HOLD POSITION",
  "TARGET ACQUIRED", "MISSION COMPLETE", "ENEMY SPOTTED",
  "COVER BLOWN", "SAFE HOUSE", "BURN NOTICE", "DOUBLE AGENT",
  "DROP ZONE CLEAR", "RADIO SILENCE", "DEAD DROP", "SHADOW TEAM",
  "NIGHT OWL", "WHISPER NET", "COLD WAR", "IRON CURTAIN",
  "BLACK OPS", "DEEP COVER", "MOLE HUNT", "CLEAN EXIT",
  "GHOST PROTOCOL", "YELLOW ALERT", "OMEGA SIGNAL", "BASE CAMP ALPHA",
  "FIRE AT WILL", "DARK MATTER", "EYES ONLY", "ZERO HOUR", "LAST RESORT"
];
for (const [i, msg] of MORSE_MESSAGES.entries()) {
  const morse = toMorse(msg);
  const difficulty = msg.split(' ').join('').length <= 8 ? 'Easy' : msg.length <= 15 ? 'Medium' : 'Hard';
  puzzles.push({
    id: randomUUID(), type: 'morse',
    title: `MORSE SIGNAL INTERCEPT #${i + 1}`,
    description: `A distress signal has been intercepted in Morse code. Dots (.) and dashes (-) separated by spaces. Words separated by /. Decode the message.`,
    difficulty, multiplier: difficulty === 'Easy' ? 1 : difficulty === 'Medium' ? 2 : 3,
    puzzle_data: JSON.stringify({ morseText: morse }),
    answer: msg,
  });
}

// ─────────────────────────────────────────────────
// TYPE 3 — SPY RIDDLES (50 puzzles)
// ─────────────────────────────────────────────────
const RIDDLES: Array<{ q: string; a: string; difficulty: 'Easy' | 'Medium' | 'Hard' }> = [
  { q: "I have cities, but no houses live there. Countries, but no trees. Rivers, but no water. What am I?", a: "MAP", difficulty: 'Easy' },
  { q: "The more you take, the more you leave behind. What am I?", a: "FOOTSTEPS", difficulty: 'Easy' },
  { q: "I speak without a mouth and hear without ears. I have no body but come alive with wind. What am I?", a: "ECHO", difficulty: 'Medium' },
  { q: "A spy sends 10 letters to 10 different people. All are intercepted. How many reach their destination?", a: "ZERO", difficulty: 'Easy' },
  { q: "I can be cracked, made, told, played. What am I?", a: "JOKE", difficulty: 'Easy' },
  { q: "The enemy's enemy is my friend. The enemy's friend is my enemy. If Viktor is my friend's enemy, what is Viktor to me?", a: "ENEMY", difficulty: 'Medium' },
  { q: "What gets stronger the more you remove from it?", a: "HOLE", difficulty: 'Medium' },
  { q: "A spy must cross a river with a wolf, a chicken, and a bag of grain. The boat fits only one extra. The wolf eats the chicken; the chicken eats the grain. What does the spy take first?", a: "CHICKEN", difficulty: 'Hard' },
  { q: "I am always in front of you but cannot be seen. What am I?", a: "FUTURE", difficulty: 'Easy' },
  { q: "A spy has a 3-litre and a 5-litre container. He needs exactly 4 litres to disarm the bomb. How many pourings does it take?", a: "SEVEN", difficulty: 'Hard' },
  { q: "What has keys but no locks, space but no rooms, and you can enter but can't go inside?", a: "KEYBOARD", difficulty: 'Easy' },
  { q: "I have one eye but cannot see. Spies thread me when they sew their disguises. What am I?", a: "NEEDLE", difficulty: 'Easy' },
  { q: "Which is heavier: a kilogram of documents or a kilogram of feathers?", a: "SAME", difficulty: 'Easy' },
  { q: "What can travel around the world without moving from its corner?", a: "STAMP", difficulty: 'Medium' },
  { q: "An agent is in a room with two doors. One leads to freedom, one to death. Two guards: one always lies, one always tells truth. You may ask ONE guard ONE question. What do you ask?", a: "WHICH DOOR", difficulty: 'Hard' },
  { q: "I am taken from a mine and shut up in a wood. I help everyone, yet I am used by criminals and saints alike. What am I?", a: "PENCIL", difficulty: 'Medium' },
  { q: "What is always coming but never arrives?", a: "TOMORROW", difficulty: 'Easy' },
  { q: "The more of me there is, the less you can see. What am I?", a: "DARKNESS", difficulty: 'Easy' },
  { q: "A spy receives a message: 'The third letter after E.' The agent replies with one word. What is it?", a: "HOTEL", difficulty: 'Hard' },
  { q: "What runs but never walks, has a mouth but never speaks, has a head but never weeps?", a: "RIVER", difficulty: 'Medium' },
  { q: "I have hands but cannot clap. I tell secrets in silence. Agents rely on me every mission. What am I?", a: "CLOCK", difficulty: 'Easy' },
  { q: "What can you catch but not throw?", a: "COLD", difficulty: 'Easy' },
  { q: "A spy has 12 coins. One is counterfeit and lighter or heavier. Using a balance 3 times, how do you find it?", a: "THREE WEIGHINGS", difficulty: 'Hard' },
  { q: "What comes once in a minute, twice in a moment, but never in a thousand years?", a: "LETTER M", difficulty: 'Easy' },
  { q: "I am not alive, but I grow. I don't have lungs, but I need air. I lack a mouth, yet water kills me. What am I?", a: "FIRE", difficulty: 'Medium' },
  { q: "What can fill a room but takes up no space?", a: "LIGHT", difficulty: 'Easy' },
  { q: "The spy hid the document in plain sight. It was neither in a drawer nor a safe. Where was it?", a: "BOOKSHELF", difficulty: 'Medium' },
  { q: "If you drop me I shatter. If you smile at me, I smile back. What am I?", a: "MIRROR", difficulty: 'Easy' },
  { q: "What has a head, a tail, but no body?", a: "COIN", difficulty: 'Easy' },
  { q: "What gets wetter the more it dries?", a: "TOWEL", difficulty: 'Easy' },
  { q: "A spy sends a coded message: 'Read every other word starting with the third.' The message has 12 words. How many contain crucial intel?", a: "FIVE", difficulty: 'Hard' },
  { q: "What can you keep after giving it to someone?", a: "WORD", difficulty: 'Easy' },
  { q: "I protect you with a lock, yet I have keys. I sit in your pocket. What am I?", a: "PHONE", difficulty: 'Easy' },
  { q: "A spy walks into an embassy. There are no lights on, no power, but she can see perfectly. How?", a: "DAYTIME", difficulty: 'Medium' },
  { q: "What must be broken before you can use it?", a: "EGG", difficulty: 'Easy' },
  { q: "The more you share me, the less you have. What am I?", a: "SECRET", difficulty: 'Medium' },
  { q: "Agent X is double agent Y's handler. Y reports to X, but also to Z. X reports to Z. Who is at the top?", a: "AGENT Z", difficulty: 'Hard' },
  { q: "What is full of holes but still holds water?", a: "SPONGE", difficulty: 'Easy' },
  { q: "I have no voice, yet I speak to you. I never lived, yet I tell of those who did. What am I?", a: "BOOK", difficulty: 'Easy' },
  { q: "A spy jumps from a plane without a parachute and survives. How?", a: "ON THE GROUND", difficulty: 'Medium' },
  { q: "What is so fragile that saying its name breaks it?", a: "SILENCE", difficulty: 'Easy' },
  { q: "What goes up when rain comes down?", a: "UMBRELLA", difficulty: 'Easy' },
  { q: "An agent is given 8 files. 3 are fake. She can only test 2. What is the minimum tests needed to guarantee finding a real file?", a: "TWO", difficulty: 'Hard' },
  { q: "What kind of room has no doors or windows?", a: "MUSHROOM", difficulty: 'Easy' },
  { q: "I follow you all day long but when the night or rain comes, I am gone. What am I?", a: "SHADOW", difficulty: 'Easy' },
  { q: "A spy is locked in a concrete room. There is only a mirror and a table. How does she escape?", a: "MIRROR DOOR", difficulty: 'Hard' },
  { q: "What has 13 hearts but no other organs?", a: "DECK OF CARDS", difficulty: 'Medium' },
  { q: "The spy wrote the password in invisible ink. The paper was then soaked in lemon juice. What appeared?", a: "THE PASSWORD", difficulty: 'Easy' },
  { q: "What word becomes shorter when you add two letters to it?", a: "SHORT", difficulty: 'Medium' },
  { q: "If two spies can decode two messages in two minutes, how long for 100 spies to decode 100 messages?", a: "TWO MINUTES", difficulty: 'Medium' },
];
for (const riddle of RIDDLES) {
  puzzles.push({
    id: randomUUID(), type: 'riddle',
    title: `AGENT LOGIC ASSESSMENT`,
    description: `PSYCHOLOGICAL EVALUATION IN PROGRESS. Answer the following riddle precisely. One word or short phrase required.\n\n"${riddle.q}"`,
    difficulty: riddle.difficulty,
    multiplier: riddle.difficulty === 'Easy' ? 1 : riddle.difficulty === 'Medium' ? 2 : 3,
    puzzle_data: JSON.stringify({ question: riddle.q }),
    answer: riddle.a,
  });
}

// ─────────────────────────────────────────────────
// TYPE 4 — NUMBER / SEQUENCE PUZZLES (30 puzzles)
// ─────────────────────────────────────────────────
const SEQUENCES: Array<{ seq: number[]; next: number; difficulty: 'Easy' | 'Medium' | 'Hard' }> = [
  { seq: [2,4,6,8,10], next: 12, difficulty: 'Easy' },
  { seq: [1,1,2,3,5,8,13], next: 21, difficulty: 'Easy' },
  { seq: [1,4,9,16,25], next: 36, difficulty: 'Easy' },
  { seq: [2,3,5,7,11,13], next: 17, difficulty: 'Medium' },
  { seq: [3,6,12,24,48], next: 96, difficulty: 'Easy' },
  { seq: [1,8,27,64,125], next: 216, difficulty: 'Medium' },
  { seq: [0,1,3,6,10,15], next: 21, difficulty: 'Medium' },
  { seq: [100,90,81,73,66], next: 60, difficulty: 'Medium' },
  { seq: [7,14,21,28,35], next: 42, difficulty: 'Easy' },
  { seq: [1,2,4,8,16,32], next: 64, difficulty: 'Easy' },
  { seq: [1,3,7,15,31], next: 63, difficulty: 'Medium' },
  { seq: [256,128,64,32,16], next: 8, difficulty: 'Easy' },
  { seq: [1,5,14,30,55], next: 91, difficulty: 'Hard' },
  { seq: [2,5,11,23,47], next: 95, difficulty: 'Hard' },
  { seq: [31,28,31,30,31,30], next: 31, difficulty: 'Medium' },
  { seq: [1,4,10,20,35], next: 56, difficulty: 'Hard' },
  { seq: [0,3,8,15,24,35], next: 48, difficulty: 'Medium' },
  { seq: [5,10,20,40,80], next: 160, difficulty: 'Easy' },
  { seq: [1,2,6,24,120], next: 720, difficulty: 'Hard' },
  { seq: [9,18,27,36,45], next: 54, difficulty: 'Easy' },
  { seq: [1,16,81,256], next: 625, difficulty: 'Hard' },
  { seq: [4,7,12,19,28,39], next: 52, difficulty: 'Medium' },
  { seq: [3,9,27,81,243], next: 729, difficulty: 'Easy' },
  { seq: [2,6,12,20,30], next: 42, difficulty: 'Medium' },
  { seq: [1,3,6,10,15], next: 21, difficulty: 'Easy' },
  { seq: [10,9,7,4,0], next: -5, difficulty: 'Hard' },
  { seq: [1,2,3,5,8], next: 13, difficulty: 'Easy' },
  { seq: [2,4,8,14,22,32], next: 44, difficulty: 'Hard' },
  { seq: [1,4,13,40,121], next: 364, difficulty: 'Hard' },
  { seq: [100,50,25,12], next: 6, difficulty: 'Medium' },
];
for (const [i, s] of SEQUENCES.entries()) {
  puzzles.push({
    id: randomUUID(), type: 'sequence',
    title: `CIPHER LOCK SEQUENCE #${i + 1}`,
    description: `The vault requires the next number in this classified sequence to unlock. Analyse the pattern and submit the next number.\n\nSequence: ${s.seq.join(', ')}, ?`,
    difficulty: s.difficulty,
    multiplier: s.difficulty === 'Easy' ? 1 : s.difficulty === 'Medium' ? 2 : 3,
    puzzle_data: JSON.stringify({ sequence: s.seq }),
    answer: String(s.next),
  });
}

// ─────────────────────────────────────────────────
// TYPE 5 — SUBSTITUTION CIPHER (30 puzzles)
// ─────────────────────────────────────────────────
const SPY_QUOTES = [
  "THE ASSET HAS BEEN COMPROMISED", "MEET AT THE SAFE HOUSE AT DAWN",
  "THE PACKAGE IS IN THE DROP ZONE", "ABORT MISSION IMMEDIATELY",
  "TARGET ACQUIRED AWAITING ORDERS", "OPERATION BLACKOUT IS A GO",
  "THE MOLE IS IN THE SYNDICATE", "SECURE CHANNEL OFFLINE",
  "AWAITING EXTRACTION COORDINATES", "THE BRIDGE IS COMPROMISED",
  "TRUST NO ONE IN THE EMBASSY", "DEAD DROP AT CHECKPOINT CHARLIE",
  "THE ASSET IS BURNED", "HANDLER REQUESTS IMMEDIATE EXTRACTION",
  "COUNTER SURVEILLANCE DETECTED", "USE ONE TIME PAD NEXT TRANSMISSION",
  "THE CLOCK IS TICKING", "EXFILTRATE BEFORE DAWN",
  "COMPROMISED COVER IDENTITY", "MEETING POSTPONED FORTY EIGHT HOURS",
  "SECONDARY SAFE HOUSE ACTIVATED", "CONFIRM RECEIPT OF PACKAGE",
  "ELIMINATE THE DOUBLE AGENT", "OPERATION BLACKBIRD APPROVED",
  "CONTACT HANDLER USING CODE SEVEN", "CLEAN TEAM EN ROUTE",
  "ABORT AND EXTRACT USING ALPHA ROUTE", "NEW IDENTITY PAPERS READY",
  "SILENCE IS PARAMOUNT", "THE WATCHER HAS BEEN MADE",
];
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
for (const [i, plaintext] of SPY_QUOTES.entries()) {
  // Create a deterministic shuffle for each puzzle
  const arr = alphabet.split('');
  const seed = i * 17 + 3;
  for (let j = arr.length - 1; j > 0; j--) {
    const k = (seed * (j + 1) * 31 + 7) % (j + 1);
    [arr[j], arr[k]] = [arr[k], arr[j]];
  }
  const shuffled = arr.join('');
  let encrypted = '';
  for (const ch of plaintext) {
    if (ch === ' ') encrypted += ' ';
    else encrypted += shuffled[alphabet.indexOf(ch)];
  }
  puzzles.push({
    id: randomUUID(), type: 'substitution',
    title: `CRYPTOGRAM INTERCEPT #${i + 1}`,
    description: 'Decrypt the intercepted enemy transmission. Each letter has been replaced by a unique substitute. Use frequency analysis to crack the code.',
    difficulty: 'Medium', multiplier: 2,
    puzzle_data: JSON.stringify({ encryptedText: encrypted }),
    answer: plaintext,
  });
}

// ─────────────────────────────────────────────────
// TYPE 6 — MAP COLORING VARIANTS (10 puzzles)
// ─────────────────────────────────────────────────
const MAP_CONFIGS = [
  { nodes: [{id:'A',x:20,y:20},{id:'B',x:80,y:20},{id:'C',x:50,y:50},{id:'D',x:20,y:80},{id:'E',x:80,y:80}], edges: [['A','B'],['A','C'],['B','C'],['A','D'],['C','D'],['C','E'],['B','E'],['D','E']] },
  { nodes: [{id:'A',x:10,y:50},{id:'B',x:40,y:20},{id:'C',x:70,y:20},{id:'D',x:90,y:50},{id:'E',x:50,y:80}], edges: [['A','B'],['B','C'],['C','D'],['D','E'],['E','A'],['B','E'],['C','E']] },
  { nodes: [{id:'A',x:50,y:10},{id:'B',x:85,y:35},{id:'C',x:70,y:80},{id:'D',x:30,y:80},{id:'E',x:15,y:35}], edges: [['A','B'],['B','C'],['C','D'],['D','E'],['E','A'],['A','C'],['A','D']] },
  { nodes: [{id:'A',x:50,y:20},{id:'B',x:80,y:50},{id:'C',x:65,y:80},{id:'D',x:35,y:80},{id:'E',x:20,y:50},{id:'F',x:50,y:50}], edges: [['A','B'],['B','C'],['C','D'],['D','E'],['E','A'],['A','F'],['B','F'],['C','F'],['D','F'],['E','F']] },
  { nodes: [{id:'A',x:25,y:25},{id:'B',x:75,y:25},{id:'C',x:75,y:75},{id:'D',x:25,y:75}], edges: [['A','B'],['B','C'],['C','D'],['D','A'],['A','C']] },
  { nodes: [{id:'A',x:50,y:15},{id:'B',x:80,y:40},{id:'C',x:65,y:75},{id:'D',x:35,y:75},{id:'E',x:20,y:40},{id:'F',x:50,y:50}], edges: [['A','F'],['B','F'],['C','F'],['D','F'],['E','F'],['A','B'],['B','C'],['D','E']] },
  { nodes: [{id:'N',x:50,y:10},{id:'S',x:50,y:90},{id:'E',x:90,y:50},{id:'W',x:10,y:50},{id:'C',x:50,y:50}], edges: [['N','E'],['E','S'],['S','W'],['W','N'],['N','C'],['E','C'],['S','C'],['W','C']] },
  { nodes: [{id:'A',x:20,y:20},{id:'B',x:50,y:10},{id:'C',x:80,y:20},{id:'D',x:80,y:80},{id:'E',x:50,y:90},{id:'F',x:20,y:80}], edges: [['A','B'],['B','C'],['C','D'],['D','E'],['E','F'],['F','A'],['A','D'],['B','E']] },
  { nodes: [{id:'A',x:30,y:20},{id:'B',x:70,y:20},{id:'C',x:90,y:55},{id:'D',x:50,y:85},{id:'E',x:10,y:55}], edges: [['A','B'],['B','C'],['C','D'],['D','E'],['E','A'],['A','C'],['B','D'],['C','E']] },
  { nodes: [{id:'A',x:20,y:15},{id:'B',x:80,y:15},{id:'C',x:50,y:45},{id:'D',x:80,y:75},{id:'E',x:20,y:75},{id:'F',x:50,y:90}], edges: [['A','B'],['A','C'],['B','C'],['C','D'],['C','E'],['D','F'],['E','F'],['D','E']] },
];
for (const [i, config] of MAP_CONFIGS.entries()) {
  puzzles.push({
    id: randomUUID(), type: 'map_coloring',
    title: `FREQUENCY ALLOCATION GRID #${i + 1}`,
    description: 'Assign radio frequencies (colors) to surveillance nodes. No two connected nodes can share the same frequency. Maximum 4 frequencies allowed.',
    difficulty: 'Hard', multiplier: 3,
    puzzle_data: JSON.stringify(config),
    answer: 'JSON_VERIFY',
  });
}

// ─────────────────────────────────────────────────
// TYPE 7 — BOOK CIPHER VARIANTS (10 puzzles)
// ─────────────────────────────────────────────────
const BOOK_TEXTS = [
  `The quick brown fox jumps over the lazy dog.\nAgents must remain vigilant at all times.\nSecurity is our number one priority today.\nNever leave your terminal unlocked or unattended.\nThe eagle flies at midnight under the pale moon.\nTrust no one and verify all incoming transmissions.`,
  `London is the capital of the intelligence world.\nEvery shadow hides a potential asset or threat.\nMicrodots can carry gigabytes of stolen data.\nA good spy never uses the same route twice.\nThe most dangerous weapon is information itself.\nSilence is a language every operative must master.`,
  `Cold war secrets buried beneath embassy floors.\nDiplomacy and deception walk hand in hand always.\nA cover identity must be lived not just memorised.\nBack channels matter more than official protocols.\nThe dead drop location changes every forty eight hours.\nBiometric data cannot lie but humans always can.`
];
for (const [ti, text] of BOOK_TEXTS.entries()) {
  const lines = text.split('\n');
  const words = lines.map(l => l.split(' '));
  for (let ci = 0; ci < 3; ci++) {
    const coords: number[][] = [];
    const targetWords: string[] = [];
    for (let wi = 0; wi < 3; wi++) {
      const li = (ti + wi + ci) % lines.length;
      const word_idx = (wi * 3 + ci) % words[li].length;
      targetWords.push(words[li][word_idx].replace(/[^a-zA-Z]/g, '').toUpperCase());
      coords.push([li + 1, word_idx + 1]);
    }
    puzzles.push({
      id: randomUUID(), type: 'book',
      title: `BOOK CIPHER INTERCEPT #${ti * 3 + ci + 1}`,
      description: 'Decode the book cipher. Use the reference text and coordinates [Line, Word] to extract the hidden message.',
      difficulty: 'Medium', multiplier: 2,
      puzzle_data: JSON.stringify({ text, coordinates: coords }),
      answer: targetWords.join(' '),
    });
  }
}

// ─────────────────────────────────────────────────
// TYPE 8 — SCYTALE (10 puzzles)
// ─────────────────────────────────────────────────
const SCYTALE_MESSAGES = [
  "THEASSETISCOMPROMISED", "MEETATMIDNIGHT", "OPERATIONBLACKOUT",
  "EXTRACTIMMEDIATELY", "DEADDROPLOCATION", "COVERTOPERATIVE",
  "ENCRYPTEDPROTOCOL", "SECRETHANDSHAKE", "OPERATIONDAWN", "NIGHTOWLSTRIKE"
];
for (const [i, msg] of SCYTALE_MESSAGES.entries()) {
  const diameter = (i % 4) + 3; // 3–6
  let padded = msg;
  while (padded.length % diameter !== 0) padded += 'X';
  let encrypted = '';
  const rows = padded.length / diameter;
  for (let col = 0; col < diameter; col++)
    for (let row = 0; row < rows; row++)
      encrypted += padded[row * diameter + col];
  puzzles.push({
    id: randomUUID(), type: 'scytale',
    title: `SCYTALE CYLINDER #${i + 1}`,
    description: `An ancient transposition cipher. Wrap the encrypted text around a cylinder of diameter ${diameter} to decode it.`,
    difficulty: diameter <= 3 ? 'Easy' : diameter <= 5 ? 'Medium' : 'Hard',
    multiplier: diameter <= 3 ? 1 : diameter <= 5 ? 2 : 3,
    puzzle_data: JSON.stringify({ encryptedText: encrypted, maxDiameter: 12 }),
    answer: padded,
  });
}

// ─────────────────────────────────────────────────
// OUTPUT SQL
// ─────────────────────────────────────────────────
console.log(`-- Puzzle Seed File — ${puzzles.length} puzzles generated ${new Date().toISOString()}`);
console.log(`-- Run with: npx wrangler d1 execute spycraft --local --file=worker/puzzles-seed.sql`);
console.log();
console.log(`BEGIN TRANSACTION;`);
for (const p of puzzles) {
  console.log(
    `INSERT OR IGNORE INTO base_puzzles (id, type, title, description, difficulty, multiplier, puzzle_data, answer) VALUES ('${p.id}', '${esc(p.type)}', '${esc(p.title)}', '${esc(p.description)}', '${p.difficulty}', ${p.multiplier}, '${esc(p.puzzle_data)}', '${esc(p.answer)}');`
  );
}
console.log(`COMMIT;`);
console.error(`Generated ${puzzles.length} puzzles.`);
