const SPY_QUOTES = [
  "THE ASSET HAS BEEN COMPROMISED",
  "MEET AT THE SAFE HOUSE AT DAWN",
  "THE PACKAGE IS IN THE DROP ZONE",
  "ABORT MISSION IMMEDIATELY",
  "TARGET ACQUIRED AWAITING ORDERS",
  "OPERATION BLACKOUT IS A GO",
  "THE MOLE IS IN THE SYNDICATE",
];

export function generateSubstitution(userId: string) {
  const plaintext = SPY_QUOTES[Math.floor(Math.random() * SPY_QUOTES.length)];
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const shuffled = alphabet.split('').sort(() => 0.5 - Math.random()).join('');
  let encrypted = "";
  for (const char of plaintext) {
    if (char === " ") encrypted += " ";
    else encrypted += shuffled[alphabet.indexOf(char)];
  }
  return {
    id: crypto.randomUUID(),
    user_id: userId,
    type: 'substitution',
    title: 'Intercepted Cryptogram',
    description: 'Decrypt the intercepted message. The enemy used a simple substitution cipher. Analyze letter frequencies and patterns.',
    difficulty: 'Medium',
    multiplier: 2,
    puzzle_data: JSON.stringify({ encryptedText: encrypted }),
    answer: plaintext,
  };
}

export function generateScytale(userId: string) {
  const plaintext = SPY_QUOTES[Math.floor(Math.random() * SPY_QUOTES.length)].replace(/ /g, '');
  const diameter = Math.floor(Math.random() * 4) + 3;
  let padded = plaintext;
  while (padded.length % diameter !== 0) padded += "X";
  let encrypted = "";
  const rows = padded.length / diameter;
  for (let i = 0; i < diameter; i++)
    for (let j = 0; j < rows; j++)
      encrypted += padded[j * diameter + i];
  return {
    id: crypto.randomUUID(),
    user_id: userId,
    type: 'scytale',
    title: 'The Scytale Cylinder',
    description: 'This message was encrypted using an ancient transposition method. Wrap the text around a cylinder of the correct diameter to read it.',
    difficulty: 'Easy',
    multiplier: 1,
    puzzle_data: JSON.stringify({ encryptedText: encrypted, maxDiameter: 12 }),
    answer: padded,
  };
}

export function generateBookCipher(userId: string) {
  const text = `The quick brown fox jumps over the lazy dog.\nAgents must remain vigilant at all times.\nSecurity is our number one priority today.\nNever leave your terminal unlocked or unattended.\nThe eagle flies at midnight under the pale moon.\nTrust no one and verify all incoming transmissions.`;
  const lines = text.split('\n');
  const words = lines.map(l => l.split(' '));
  const targetWords: string[] = [];
  const coordinates: number[][] = [];
  for (let i = 0; i < 3; i++) {
    const lineIdx = Math.floor(Math.random() * lines.length);
    const wordIdx = Math.floor(Math.random() * words[lineIdx].length);
    targetWords.push(words[lineIdx][wordIdx].replace(/[^a-zA-Z]/g, '').toUpperCase());
    coordinates.push([lineIdx + 1, wordIdx + 1]);
  }
  return {
    id: crypto.randomUUID(),
    user_id: userId,
    type: 'book',
    title: 'Book Cipher Intercept',
    description: 'Use the reference text and coordinates (Line, Word) to extract the hidden message.',
    difficulty: 'Medium',
    multiplier: 2,
    puzzle_data: JSON.stringify({ text, coordinates }),
    answer: targetWords.join(' '),
  };
}

export function generateMapColoring(userId: string) {
  const nodes = [
    { id: 'A', x: 20, y: 20 }, { id: 'B', x: 80, y: 20 },
    { id: 'C', x: 50, y: 50 }, { id: 'D', x: 20, y: 80 }, { id: 'E', x: 80, y: 80 },
  ];
  const edges = [['A','B'],['A','C'],['B','C'],['A','D'],['C','D'],['C','E'],['B','E'],['D','E']];
  return {
    id: crypto.randomUUID(),
    user_id: userId,
    type: 'map_coloring',
    title: 'Frequency Allocation',
    description: 'Assign frequencies (colors) to surveillance nodes so no two connected nodes share the same frequency. Use max 4 frequencies.',
    difficulty: 'Hard',
    multiplier: 3,
    puzzle_data: JSON.stringify({ nodes, edges }),
    answer: 'JSON_VERIFY',
  };
}

export async function generateRandomPuzzle(userId: string, geminiKey?: string) {
  if (geminiKey) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `You are a game designer for "MI5: Codename Enigma". Generate a unique text-based spy puzzle as a pure JSON object (no markdown). Fields required: "type" (string), "title" (dramatic spy title), "description" (instructions + flavor text), "difficulty" ("Easy"/"Medium"/"Hard"), "multiplier" (1/2/3), "puzzle_data" (string with puzzle content), "answer" (exact string, 1-5 words max). Be creative: logic puzzles, riddles, Morse code, steganography, pattern recognition, deduction, etc.` }] }],
          generationConfig: { temperature: 0.9, responseMimeType: 'application/json' }
        })
      });
      if (response.ok) {
        const data: any = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const genObj = JSON.parse(text);
          if (genObj.title && genObj.answer) {
            return {
              id: crypto.randomUUID(),
              user_id: userId,
              type: genObj.type || 'ai_generated',
              title: genObj.title,
              description: genObj.description,
              difficulty: genObj.difficulty || 'Medium',
              multiplier: Number(genObj.multiplier) || 2,
              puzzle_data: JSON.stringify(genObj.puzzle_data ?? genObj.puzzle_data),
              answer: String(genObj.answer),
            };
          }
        }
      }
    } catch (e) {
      console.error('Gemini generation failed, falling back to static puzzle', e);
    }
  }
  const generators = [generateSubstitution, generateScytale, generateBookCipher, generateMapColoring];
  return generators[Math.floor(Math.random() * generators.length)](userId);
}
