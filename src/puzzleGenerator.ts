import { v4 as uuidv4 } from 'uuid';
import { GoogleGenAI } from '@google/genai';

const SPY_QUOTES = [
  "THE ASSET HAS BEEN COMPROMISED",
  "MEET AT THE SAFE HOUSE AT DAWN",
  "THE PACKAGE IS IN THE DROP ZONE",
  "ABORT MISSION IMMEDIATELY",
  "TARGET ACQUIRED AWAITING ORDERS",
  "OPERATION BLACKOUT IS A GO",
  "THE MOLE IS IN THE SYNDICATE"
];

export function generateSubstitution(userId: string) {
  const plaintext = SPY_QUOTES[Math.floor(Math.random() * SPY_QUOTES.length)];
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let shuffled = alphabet.split('').sort(() => 0.5 - Math.random()).join('');
  
  let encrypted = "";
  for (let char of plaintext) {
    if (char === " ") encrypted += " ";
    else {
      const idx = alphabet.indexOf(char);
      encrypted += shuffled[idx];
    }
  }

  return {
    id: uuidv4(),
    user_id: userId,
    type: 'substitution',
    title: 'Intercepted Cryptogram',
    description: 'Decrypt the following intercepted message. The enemy has used a simple substitution cipher. Analyze letter frequencies and patterns.',
    difficulty: 'Medium',
    multiplier: 2,
    puzzle_data: JSON.stringify({ encryptedText: encrypted }),
    answer: plaintext
  };
}

export function generateScytale(userId: string) {
  const plaintext = SPY_QUOTES[Math.floor(Math.random() * SPY_QUOTES.length)].replace(/ /g, '');
  const diameter = Math.floor(Math.random() * 4) + 3; // 3 to 6
  
  // Pad plaintext
  let padded = plaintext;
  while (padded.length % diameter !== 0) {
    padded += "X";
  }

  let encrypted = "";
  const rows = padded.length / diameter;
  for (let i = 0; i < diameter; i++) {
    for (let j = 0; j < rows; j++) {
      encrypted += padded[j * diameter + i];
    }
  }

  return {
    id: uuidv4(),
    user_id: userId,
    type: 'scytale',
    title: 'The Scytale Cylinder',
    description: 'This message was encrypted using an ancient transposition method. Wrap the text around a cylinder of the correct diameter to read it.',
    difficulty: 'Easy',
    multiplier: 1,
    puzzle_data: JSON.stringify({ encryptedText: encrypted, maxDiameter: 12 }),
    answer: padded
  };
}

export function generateBookCipher(userId: string) {
  const text = `The quick brown fox jumps over the lazy dog.
Agents must remain vigilant at all times.
Security is our number one priority today.
Never leave your terminal unlocked or unattended.
The eagle flies at midnight under the pale moon.
Trust no one and verify all incoming transmissions.`;
  
  const lines = text.split('\n');
  const words = lines.map(l => l.split(' '));
  
  const targetWords = [];
  const coordinates = [];
  
  for (let i = 0; i < 3; i++) {
    const lineIdx = Math.floor(Math.random() * lines.length);
    const wordIdx = Math.floor(Math.random() * words[lineIdx].length);
    targetWords.push(words[lineIdx][wordIdx].replace(/[^a-zA-Z]/g, '').toUpperCase());
    coordinates.push([lineIdx + 1, wordIdx + 1]); // 1-indexed
  }

  return {
    id: uuidv4(),
    user_id: userId,
    type: 'book',
    title: 'Book Cipher Intercept',
    description: 'Use the provided reference text and coordinates (Line, Word) to extract the hidden message.',
    difficulty: 'Medium',
    multiplier: 2,
    puzzle_data: JSON.stringify({ text, coordinates }),
    answer: targetWords.join(' ')
  };
}

export function generateMapColoring(userId: string) {
  // Simple planar graph
  const nodes = [
    { id: 'A', x: 20, y: 20 },
    { id: 'B', x: 80, y: 20 },
    { id: 'C', x: 50, y: 50 },
    { id: 'D', x: 20, y: 80 },
    { id: 'E', x: 80, y: 80 }
  ];
  const edges = [
    ['A', 'B'], ['A', 'C'], ['B', 'C'],
    ['A', 'D'], ['C', 'D'], ['C', 'E'], ['B', 'E'], ['D', 'E']
  ];

  return {
    id: uuidv4(),
    user_id: userId,
    type: 'map_coloring',
    title: 'Frequency Allocation',
    description: 'Assign frequencies (colors) to the surveillance nodes such that no two connected nodes share the same frequency. Use a maximum of 4 frequencies.',
    difficulty: 'Hard',
    multiplier: 3,
    puzzle_data: JSON.stringify({ nodes, edges }),
    answer: 'JSON_VERIFY' // Special flag to verify via custom logic
  };
}

export async function generateRandomPuzzle(userId: string) {
  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      // System prompt to ensure valid output format
      const prompt = `You are a game designer for a spy-themed puzzle game "MI5: Codename Enigma".
Generate a brand new, unique text-based spy puzzle.
The puzzle type should be creative (e.g., logic, deduction, cipher, steganography, pattern recognition).
It MUST be formatted as a pure JSON object without markdown formatting.
The JSON object must have these exactly:
- "type": A short string like "logic_deduction" or "morse_code" or "riddle"
- "title": A cool spycraft title
- "description": The flavor text and instructions to the user. Make it dramatic.
- "difficulty": "Easy", "Medium", or "Hard"
- "multiplier": 1, 2, or 3 based on difficulty
- "puzzle_data": A string containing the core puzzle content (the text they have to analyze, or JSON stringified data).
- "answer": The exact text string they need to type to solve it. Keep it brief, 1 to 5 words max.

Example:
{
  "type": "logic_bomb",
  "title": "Server Room Access",
  "description": "Agent, the enemy server room is protected. You must enter the 4-digit pin. The first digit is double the last. The second digit is the third digit plus 3. The digits sum to 18.",
  "difficulty": "Hard",
  "multiplier": 3,
  "puzzle_data": "Passcode required.",
  "answer": "8524"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: 0.9,
          responseMimeType: 'application/json'
        }
      });
      
      const genObj = JSON.parse(response.text || '{}');
      if (genObj.title && genObj.answer) {
        return {
          id: uuidv4(),
          user_id: userId,
          type: genObj.type || 'ai_generated',
          title: genObj.title,
          description: genObj.description,
          difficulty: genObj.difficulty || 'Medium',
          multiplier: genObj.multiplier || 2,
          puzzle_data: JSON.stringify(genObj.puzzle_data),
          answer: genObj.answer
        };
      }
    } catch (e) {
      console.error('Gemini puzzle generation failed. Falling back to static puzzles.', e);
    }
  }

  const generators = [generateSubstitution, generateScytale, generateBookCipher, generateMapColoring];
  const generator = generators[Math.floor(Math.random() * generators.length)];
  return generator(userId);
}
