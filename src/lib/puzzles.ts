export const PUZZLE_THEMES = {
  COLD_WAR: 'Cold War Operations',
  CYBER_SECURITY: 'Cyber Security & Crypto',
  GCHQ_CLASSIC: 'GCHQ Christmas Challenge',
  SIGNAL_INT: 'Signals Intelligence',
  LOGIC_OPS: 'Logic & Pattern Analysis',
  GEOLOCATION: 'Geospatial Intelligence'
};

const manualPuzzles = [
  // --- ELITE GCHQ STYLE (HARD) ---
  { 
    id: 'elite_1', 
    theme: PUZZLE_THEMES.GCHQ_CLASSIC, 
    title: 'The Letter Count', 
    description: 'If 1=3, 2=3, 3=5, 4=4, 5=4, 6=3, 7=5, 8=5, 9=4, and 10=3, what does 11 equal?', 
    difficulty: 'Hard' as const, 
    multiplier: 3.0, 
    type: 'logic', 
    answer: '6', 
    puzzle_data: {}, 
    hint: 'Ignore the mathematical value. Count the components of the word itself.' 
  },
  { 
    id: 'elite_2', 
    theme: PUZZLE_THEMES.GCHQ_CLASSIC, 
    title: 'The Connecting Link', 
    description: 'Find the single word that connects these four: GOLD, GLOVE, BOX, and PRINT.', 
    difficulty: 'Hard' as const, 
    multiplier: 2.8, 
    type: 'logic', 
    answer: 'FINGER', 
    puzzle_data: {}, 
    hint: 'It is a part of the human anatomy.' 
  },
  { 
    id: 'elite_3', 
    theme: PUZZLE_THEMES.GCHQ_CLASSIC, 
    title: 'Sequence of the Ages', 
    description: 'Identify the next character in this progression: M, V, E, M, J, S, U, ?', 
    difficulty: 'Hard' as const, 
    multiplier: 2.5, 
    type: 'logic', 
    answer: 'N', 
    puzzle_data: {}, 
    hint: 'Think of our neighborhood in the vacuum of space.' 
  },
  { 
    id: 'elite_4', 
    theme: PUZZLE_THEMES.GCHQ_CLASSIC, 
    title: 'The Missing Month', 
    description: 'What connects: APR, JUN, SEP, and NOV?', 
    difficulty: 'Hard' as const, 
    multiplier: 2.7, 
    type: 'logic', 
    answer: '30', 
    puzzle_data: {}, 
    hint: 'Check the calendar. Specifically, the length of their stays.' 
  },
  { 
    id: 'elite_5', 
    theme: PUZZLE_THEMES.LOGIC_OPS, 
    title: 'The Infinite Staircase', 
    description: 'What is the next number in this sequence: 2, 3, 10, 12, 13, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, ?', 
    difficulty: 'Hard' as const, 
    multiplier: 3.5, 
    type: 'logic', 
    answer: '200', 
    puzzle_data: {}, 
    hint: 'Write the numbers as words. Look for a letter that is missing from all of them.' 
  },
  { 
    id: 'elite_6', 
    theme: PUZZLE_THEMES.GEOLOCATION, 
    title: 'The Spy\'s Landmark', 
    description: 'Identify the city: It contains a "Checkpoint" named after a letter of the alphabet, it was once divided by a wall, and its name is an anagram of "LINREB".', 
    difficulty: 'Medium' as const, 
    multiplier: 1.8, 
    type: 'logic', 
    answer: 'BERLIN', 
    puzzle_data: {}, 
    hint: 'The checkpoint is "Charlie".' 
  },
  { 
    id: 'elite_7', 
    theme: PUZZLE_THEMES.GCHQ_CLASSIC, 
    title: 'The Seven Sisters', 
    description: 'Complete the set: ALCYONE, CELAENO, ELECTRA, MAIA, MEROPE, STEROPE, ?', 
    difficulty: 'Hard' as const, 
    multiplier: 3.2, 
    type: 'logic', 
    answer: 'TAYGETA', 
    puzzle_data: {}, 
    hint: 'These are the names of the Pleiades star cluster.' 
  },
  { 
    id: 'elite_8', 
    theme: PUZZLE_THEMES.CYBER_SECURITY, 
    title: 'The Prime Protocol', 
    description: 'Decrypt the target: The code is the 100th prime number. Intelligence suggests it is between 500 and 600.', 
    difficulty: 'Hard' as const, 
    multiplier: 3.0, 
    type: 'logic', 
    answer: '541', 
    puzzle_data: {}, 
    hint: 'Use a sieve or check your reference files for the 100th prime.' 
  },
  { 
    id: 'elite_9', 
    theme: PUZZLE_THEMES.SIGNAL_INT, 
    title: 'The NATO Mystery', 
    description: 'What connects: GOLF, HOTEL, INDIA, and JULIETT?', 
    difficulty: 'Medium' as const, 
    multiplier: 1.5, 
    type: 'logic', 
    answer: 'NATO', 
    puzzle_data: {}, 
    hint: 'Think about the standard alphabet used in radio communications.' 
  },
  { 
    id: 'elite_10', 
    theme: PUZZLE_THEMES.COLD_WAR, 
    title: 'The Double Agent', 
    description: 'Identify the spy: Born in Estoril, 1912. Codename GARBO. He helped deceive the Germans about the D-Day landing site.', 
    difficulty: 'Hard' as const, 
    multiplier: 2.9, 
    type: 'logic', 
    answer: 'PUJOL', 
    puzzle_data: {}, 
    hint: 'Juan ... Garcia.' 
  },

  // --- REFINED MEDIUM CHALLENGES ---
  { id: 'm_1', theme: PUZZLE_THEMES.GCHQ_CLASSIC, title: 'The Shared Suffix', description: 'What word can follow: RAIN, SNOW, SLOW, and FOOT?', difficulty: 'Medium' as const, multiplier: 1.6, type: 'logic', answer: 'FALL', puzzle_data: {}, hint: 'It describes movement towards the earth.' },
  { id: 'm_2', theme: PUZZLE_THEMES.GCHQ_CLASSIC, title: 'The Elemental Cipher', description: 'If H=1, HE=2, LI=3, then what does B equal?', difficulty: 'Medium' as const, multiplier: 1.7, type: 'logic', answer: '5', puzzle_data: {}, hint: 'Consult the periodic table of elements.' },
  { id: 'm_3', theme: PUZZLE_THEMES.LOGIC_OPS, title: 'The Square Root of Logic', description: 'What is the sum of the first four prime numbers?', difficulty: 'Medium' as const, multiplier: 1.4, type: 'logic', answer: '17', puzzle_data: {}, hint: 'Primes are 2, 3, 5, 7...' },
];

const generateSequencePuzzles = (count: number, startId: number) => {
  const puzzles = [];
  for (let i = 0; i < count; i++) {
    const idNum = startId + i;
    const type = i % 6;
    let desc = "";
    let ans = "";
    let difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium';
    
    if (type === 0) {
      const base = i + 5;
      desc = `Triangular number sequence analysis: ${ (base*(base+1))/2 }, ${ ((base+1)*(base+2))/2 }, ${ ((base+2)*(base+3))/2 }, ?`;
      ans = (((base+3)*(base+4))/2).toString();
      difficulty = 'Medium';
    } else if (type === 1) {
      // Look-and-say sequence logic (simulated)
      desc = `Identify the next term in the verbal description sequence: 1, 11, 21, 1211, 111221, ?`;
      ans = "312211";
      difficulty = 'Hard';
    } else if (type === 2) {
      const base = (i % 4) + 2;
      desc = `Geometric progression with offset: ${ Math.pow(base, 1)+1 }, ${ Math.pow(base, 2)+1 }, ${ Math.pow(base, 3)+1 }, ?`;
      ans = (Math.pow(base, 4)+1).toString();
      difficulty = 'Hard';
    } else if (type === 3) {
      desc = `Binary digit summation: 1, 10, 11, 100, 101, 110, 111, ?`;
      ans = "1000";
      difficulty = 'Medium';
    } else if (type === 4) {
      // Fibonacci with a twist
      desc = `Sum of squares sequence: 1, 5, 14, 30, 55, ?`;
      ans = "91"; // 1^2 + 2^2 + 3^2 + 4^2 + 5^2 + 6^2
      difficulty = 'Hard';
    } else {
      desc = `Identify the missing day: Monday, Wednesday, Friday, ?`;
      ans = "Sunday";
      difficulty = 'Easy';
    }

    puzzles.push({
      id: `seq_${idNum}`,
      theme: PUZZLE_THEMES.LOGIC_OPS,
      title: `Tactical Data Stream ${idNum}`,
      description: desc,
      difficulty,
      multiplier: difficulty === 'Hard' ? 2.5 : difficulty === 'Medium' ? 1.8 : 1.2,
      type: 'logic',
      answer: ans.toUpperCase(),
      puzzle_data: {},
      hint: 'Apply advanced mathematical modeling to the intercepted sequence.'
    });
  }
  return puzzles;
};

const generateCryptoPuzzles = (count: number, startId: number) => {
  const puzzles = [];
  const words = ["OPERATIVE", "CLASSIFIED", "INTEL", "EXTRACTION", "TERMINATE", "ENCRYPTION", "VULNERABLE", "PROTOCOL", "SURVEILLANCE", "RECONNAISSANCE"];
  for (let i = 0; i < count; i++) {
    const idNum = startId + i;
    const shift = (i % 20) + 1;
    const targetWord = words[i % words.length];
    
    const encrypt = (word: string, s: number) => {
      return word.split('').map(char => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCharCode(((code - 65 + s) % 26) + 65);
        return char;
      }).join('');
    };

    const encrypted = encrypt(targetWord, shift);
    const difficulty: 'Easy' | 'Medium' | 'Hard' = shift > 15 ? 'Hard' : shift > 8 ? 'Medium' : 'Easy';

    puzzles.push({
      id: `cryp_${idNum}`,
      theme: PUZZLE_THEMES.CYBER_SECURITY,
      title: `Signal Override 0x${idNum.toString(16).toUpperCase()}`,
      description: `Multiple encryption layers detected. Primary layer: ROT-${shift}. Decrypt payload: ${encrypted}`,
      difficulty,
      multiplier: difficulty === 'Hard' ? 2.8 : difficulty === 'Medium' ? 2.0 : 1.3,
      type: 'substitution',
      answer: targetWord,
      puzzle_data: { encryptedText: encrypted },
      hint: `Rotate the character set backwards by ${shift} positions.`
    });
  }
  return puzzles;
};

const generateBookCiphers = (count: number, startId: number) => {
  const puzzles = [];
  const texts = [
    "THE END OF THE COLD WAR MARKED A NEW ERA FOR GLOBAL INTELLIGENCE ASSETS.\nFORMER ADVERSARIES BECAME UNLIKELY ALLIES IN THE FIGHT AGAINST CYBER THREATS.\nSECURITY PROTOCOLS HAD TO BE REWRITTEN FROM THE GROUND UP.",
    "OUR SOURCES INDICATE THAT THE EMBASSY WAS COMPROMISED BY A ROGUE AGENT.\nALL SENSITIVE FILES MUST BE DESTROYED IMMEDIATELY TO PREVENT DATA LEAKAGE.\nGODSPEED TO ALL OPERATIVES IN THE FIELD.",
    "THE ENIGMA MACHINE WAS CRACKED BY ELITE CRYPTOGRAPHERS AT BLETCHLEY PARK.\nTHEIR WORK SHORTENED THE WAR AND SAVED COUNTLESS LIVES ACROSS EUROPE.\nNEVER FORGET THE SILENT HEROES OF THE SHADOW WAR."
  ];

  for(let i=0; i<count; i++) {
    const idNum = startId + i;
    const textIdx = i % texts.length;
    const text = texts[textIdx];
    const lines = text.split('\n');
    
    const targetLineIdx = i % lines.length;
    const words = lines[targetLineIdx].split(' ').map(w => w.replace(/[^a-zA-Z]/g, '').toUpperCase());
    const targetWordIdx = (i * 4) % words.length;
    const answerWord = words[targetWordIdx];

    puzzles.push({
      id: `book_${idNum}`,
      theme: PUZZLE_THEMES.SIGNAL_INT,
      title: `SIGINT Intercept 0x${idNum}`,
      description: `Cross-reference document fragment with coordinates [L, W] to isolate the keyword. Data: [${targetLineIdx + 1}, ${targetWordIdx + 1}]`,
      difficulty: 'Hard' as const,
      multiplier: 3.0,
      type: 'book',
      answer: answerWord,
      puzzle_data: {
        text: text,
        coordinates: [[targetLineIdx + 1, targetWordIdx + 1]]
      },
      hint: `Count words from the left on the specified line index.`
    });
  }
  return puzzles;
}

export const ALL_PUZZLES = [
  ...manualPuzzles,
  ...generateSequencePuzzles(40, 100),
  ...generateCryptoPuzzles(40, 200),
  ...generateBookCiphers(20, 300)
];
