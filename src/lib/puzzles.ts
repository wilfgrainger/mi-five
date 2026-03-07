export const PUZZLE_THEMES = {
  COLD_WAR: 'Cold War Operations',
  CYBER_SECURITY: 'Cyber Security & Crypto',
  GCHQ_CLASSIC: 'GCHQ Christmas Challenge',
  SIGNAL_INT: 'Signals Intelligence',
  LOGIC_OPS: 'Logic & Pattern Analysis',
  GEOLOCATION: 'Geospatial Intelligence'
};

const manualPuzzles = [
  { id: 'gchq_1', theme: PUZZLE_THEMES.GCHQ_CLASSIC, title: 'The Chessboard', description: 'KING, QUEEN, ROOK, BISHOP, ???, PAWN', difficulty: 'Easy' as const, multiplier: 1.2, type: 'logic', answer: 'KNIGHT', puzzle_data: {} },
  { id: 'gchq_2', theme: PUZZLE_THEMES.GCHQ_CLASSIC, title: 'Alphabetical Shift', description: 'If A=1, B=2, what is G+C+H+Q?', difficulty: 'Medium' as const, multiplier: 1.4, type: 'logic', answer: '35', puzzle_data: {} },
  { id: 'gchq_3', theme: PUZZLE_THEMES.GCHQ_CLASSIC, title: 'The Missing Link', description: 'What word connects: FIRE, WATER, and WORKS?', difficulty: 'Medium' as const, multiplier: 1.5, type: 'logic', answer: 'WORKS', puzzle_data: {} },
  { id: 'gchq_4', theme: PUZZLE_THEMES.GCHQ_CLASSIC, title: 'Time Sequence', description: 'J, F, M, A, M, J, ?', difficulty: 'Easy' as const, multiplier: 1.1, type: 'logic', answer: 'J', puzzle_data: {} },
  { id: 'gchq_5', theme: PUZZLE_THEMES.GCHQ_CLASSIC, title: 'Binary Agent', description: '01001000 01001001', difficulty: 'Easy' as const, multiplier: 1.2, type: 'logic', answer: 'HI', puzzle_data: {} },
  { id: 'gchq_6', theme: PUZZLE_THEMES.GCHQ_CLASSIC, title: 'The Prime Operative', description: 'What is the 5th prime number?', difficulty: 'Easy' as const, multiplier: 1.1, type: 'logic', answer: '11', puzzle_data: {} },
  { id: 'gchq_7', theme: PUZZLE_THEMES.GCHQ_CLASSIC, title: 'NATO Phonetic', description: 'Sierra, Papa, Yankee', difficulty: 'Easy' as const, multiplier: 1.0, type: 'logic', answer: 'SPY', puzzle_data: {} },
  { id: 'gchq_8', theme: PUZZLE_THEMES.GCHQ_CLASSIC, title: 'Morse Code', description: '... --- ...', difficulty: 'Easy' as const, multiplier: 1.0, type: 'logic', answer: 'SOS', puzzle_data: {} },
  { id: 'gchq_9', theme: PUZZLE_THEMES.GCHQ_CLASSIC, title: 'The Grid', description: 'Assign 3 colors to 3 connected nodes.', difficulty: 'Hard' as const, multiplier: 2.0, type: 'map_coloring', puzzle_data: { nodes: [{id: '1', x: 50, y: 10}, {id: '2', x: 10, y: 90}, {id: '3', x: 90, y: 90}], edges: [['1','2'], ['2','3'], ['1','3']] } },
  { id: 'gchq_10', theme: PUZZLE_THEMES.GCHQ_CLASSIC, title: 'The Clock', description: 'If it is 3:00, what is the angle between the hands?', difficulty: 'Medium' as const, multiplier: 1.5, type: 'logic', answer: '90', puzzle_data: {} },
  { id: 'gchq_11', theme: PUZZLE_THEMES.GCHQ_CLASSIC, title: 'Roman Numerals', description: 'What is XIV + IX?', difficulty: 'Easy' as const, multiplier: 1.1, type: 'logic', answer: 'XXIII', puzzle_data: {} },
  { id: 'gchq_12', theme: PUZZLE_THEMES.GCHQ_CLASSIC, title: 'Anagram Intel', description: 'Rearrange "DIRTY ROOM" to find a location.', difficulty: 'Medium' as const, multiplier: 1.3, type: 'logic', answer: 'DORMITORY', puzzle_data: {} },
  { id: 'gchq_13', theme: PUZZLE_THEMES.GCHQ_CLASSIC, title: 'Rainbow Sequence', description: 'Red, Orange, Yellow, Green, Blue, Indigo, ?', difficulty: 'Easy' as const, multiplier: 1.0, type: 'logic', answer: 'VIOLET', puzzle_data: {} },
  { id: 'gchq_14', theme: PUZZLE_THEMES.GCHQ_CLASSIC, title: 'Planetary Order', description: 'Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, ?', difficulty: 'Easy' as const, multiplier: 1.0, type: 'logic', answer: 'NEPTUNE', puzzle_data: {} },
  { id: 'gchq_15', theme: PUZZLE_THEMES.GCHQ_CLASSIC, title: 'Keyboard Row', description: 'Q, W, E, R, T, Y, U, I, O, ?', difficulty: 'Easy' as const, multiplier: 1.1, type: 'logic', answer: 'P', puzzle_data: {} },
  { id: 'gchq_16', theme: PUZZLE_THEMES.GCHQ_CLASSIC, title: 'Vowel Progression', description: 'A, E, I, O, ?', difficulty: 'Easy' as const, multiplier: 1.0, type: 'logic', answer: 'U', puzzle_data: {} },
  { id: 'gchq_17', theme: PUZZLE_THEMES.LOGIC_OPS, title: 'Fibonacci Step', description: '1, 1, 2, 3, 5, 8, 13, ?', difficulty: 'Medium' as const, multiplier: 1.4, type: 'logic', answer: '21', puzzle_data: {} },
  { id: 'gchq_18', theme: PUZZLE_THEMES.LOGIC_OPS, title: 'Square Roots', description: '1, 4, 9, 16, 25, 36, ?', difficulty: 'Easy' as const, multiplier: 1.2, type: 'logic', answer: '49', puzzle_data: {} },
  { id: 'gchq_19', theme: PUZZLE_THEMES.LOGIC_OPS, title: 'Cube Sequence', description: '1, 8, 27, 64, ?', difficulty: 'Medium' as const, multiplier: 1.5, type: 'logic', answer: '125', puzzle_data: {} },
  { id: 'gchq_20', theme: PUZZLE_THEMES.LOGIC_OPS, title: 'Days in Month', description: '31, 28, 31, 30, 31, 30, ?', difficulty: 'Medium' as const, multiplier: 1.3, type: 'logic', answer: '31', puzzle_data: {} },
  { id: 'gchq_21', theme: PUZZLE_THEMES.LOGIC_OPS, title: 'The Triplet', description: 'Which number is missing? 2, 6, 12, 20, 30, ?', difficulty: 'Hard' as const, multiplier: 1.6, type: 'logic', answer: '42', puzzle_data: {} },
  { id: 'gchq_22', theme: PUZZLE_THEMES.GEOLOCATION, title: 'City of Light', description: 'Which capital city sits on the Seine river?', difficulty: 'Easy' as const, multiplier: 1.1, type: 'logic', answer: 'PARIS', puzzle_data: {} },
  { id: 'gchq_23', theme: PUZZLE_THEMES.GEOLOCATION, title: 'Meridian Zero', description: 'Through which London borough does the Prime Meridian pass?', difficulty: 'Medium' as const, multiplier: 1.3, type: 'logic', answer: 'GREENWICH', puzzle_data: {} },
  { id: 'gchq_24', theme: PUZZLE_THEMES.GEOLOCATION, title: 'Highest Peak', description: 'What is the highest mountain in the world above sea level?', difficulty: 'Easy' as const, multiplier: 1.0, type: 'logic', answer: 'EVEREST', puzzle_data: {} },
  { id: 'gchq_25', theme: PUZZLE_THEMES.COLD_WAR, title: 'Checkpoint Charlie', description: 'Which city was divided by a famous wall from 1961 to 1989?', difficulty: 'Easy' as const, multiplier: 1.2, type: 'logic', answer: 'BERLIN', puzzle_data: {} },
  { id: 'gchq_26', theme: PUZZLE_THEMES.COLD_WAR, title: 'Space Race', description: 'Who was the first human in space? (Surname only)', difficulty: 'Medium' as const, multiplier: 1.4, type: 'logic', answer: 'GAGARIN', puzzle_data: {} },
  { id: 'gchq_27', theme: PUZZLE_THEMES.CYBER_SECURITY, title: 'Hexadecimal Conversion', description: 'Convert hex 1A to decimal.', difficulty: 'Medium' as const, multiplier: 1.3, type: 'logic', answer: '26', puzzle_data: {} },
  { id: 'gchq_28', theme: PUZZLE_THEMES.CYBER_SECURITY, title: 'Secure Port', description: 'Which port is typically used for SSH?', difficulty: 'Easy' as const, multiplier: 1.1, type: 'logic', answer: '22', puzzle_data: {} },
  { id: 'gchq_29', theme: PUZZLE_THEMES.CYBER_SECURITY, title: 'DNS Resolution', description: 'What protocol translates domain names to IP addresses?', difficulty: 'Easy' as const, multiplier: 1.1, type: 'logic', answer: 'DNS', puzzle_data: {} },
  { id: 'gchq_30', theme: PUZZLE_THEMES.SIGNAL_INT, title: 'Frequency Band', description: 'What does VHF stand for? (First word only)', difficulty: 'Medium' as const, multiplier: 1.3, type: 'logic', answer: 'VERY', puzzle_data: {} },
  { id: 'gchq_31', theme: PUZZLE_THEMES.SIGNAL_INT, title: 'Aviation Alphabet', description: 'Alpha, Bravo, Charlie, ?, Echo', difficulty: 'Easy' as const, multiplier: 1.0, type: 'logic', answer: 'DELTA', puzzle_data: {} },
  { id: 'gchq_32', theme: PUZZLE_THEMES.GCHQ_CLASSIC, title: 'Riddle of the Sphinx', description: 'What has keys but can\'t open locks?', difficulty: 'Medium' as const, multiplier: 1.3, type: 'logic', answer: 'PIANO', puzzle_data: {} },
  { id: 'gchq_33', theme: PUZZLE_THEMES.GCHQ_CLASSIC, title: 'The Mirror', description: 'I am not alive, but I grow; I don\'t have lungs, but I need air; I don\'t have a mouth, but water kills me. What am I?', difficulty: 'Hard' as const, multiplier: 1.6, type: 'logic', answer: 'FIRE', puzzle_data: {} },
  { id: 'gchq_34', theme: PUZZLE_THEMES.GCHQ_CLASSIC, title: 'Word Play', description: 'What comes once in a minute, twice in a moment, but never in a thousand years?', difficulty: 'Medium' as const, multiplier: 1.4, type: 'logic', answer: 'M', puzzle_data: {} },
  { id: 'gchq_35', theme: PUZZLE_THEMES.LOGIC_OPS, title: 'Mathematical Oddity', description: 'What is 8 + 8 / 2 ?', difficulty: 'Medium' as const, multiplier: 1.5, type: 'logic', answer: '12', puzzle_data: {} },
  { id: 'gchq_36', theme: PUZZLE_THEMES.GCHQ_CLASSIC, title: 'Hidden Element', description: 'Hydrogen, Helium, Lithium, Beryllium, ?', difficulty: 'Easy' as const, multiplier: 1.2, type: 'logic', answer: 'BORON', puzzle_data: {} },
  { id: 'gchq_37', theme: PUZZLE_THEMES.CYBER_SECURITY, title: 'Data Unit', description: 'How many bits in a byte?', difficulty: 'Easy' as const, multiplier: 1.0, type: 'logic', answer: '8', puzzle_data: {} },
  { id: 'gchq_38', theme: PUZZLE_THEMES.CYBER_SECURITY, title: 'Network Layer', description: 'Which layer of the OSI model handles routing? (Number only)', difficulty: 'Hard' as const, multiplier: 1.8, type: 'logic', answer: '3', puzzle_data: {} },
  { id: 'gchq_39', theme: PUZZLE_THEMES.GEOLOCATION, title: 'The Equator', description: 'At what latitude is the equator?', difficulty: 'Easy' as const, multiplier: 1.0, type: 'logic', answer: '0', puzzle_data: {} },
  { id: 'gchq_40', theme: PUZZLE_THEMES.COLD_WAR, title: 'Cuban Missile', description: 'In which year was the Cuban Missile Crisis?', difficulty: 'Hard' as const, multiplier: 1.7, type: 'logic', answer: '1962', puzzle_data: {} },
];

const generateSequencePuzzles = (count: number, startId: number) => {
  const puzzles = [];
  for (let i = 0; i < count; i++) {
    const idNum = startId + i;
    // Alternate sequence types
    const type = i % 4;
    let desc = "";
    let ans = "";
    
    if (type === 0) {
      const base = i + 2;
      desc = `What is the next number: ${base}, ${base + 3}, ${base + 6}, ${base + 9}, ?`;
      ans = (base + 12).toString();
    } else if (type === 1) {
      const base = (i % 5) + 2;
      desc = `What is the next number: ${base}, ${base * 2}, ${base * 4}, ${base * 8}, ?`;
      ans = (base * 16).toString();
    } else if (type === 2) {
      const start = (i % 10) + 10;
      desc = `Complete the countdown: ${start}, ${start - 2}, ${start - 4}, ${start - 6}, ?`;
      ans = (start - 8).toString();
    } else {
      const x = (i % 3) + 2;
      desc = `Identify the pattern: ${x}, ${x * x}, ${x * x * x}, ?`;
      ans = (x * x * x * x).toString();
    }

    const difficulty: 'Easy' | 'Medium' | 'Hard' = type === 0 ? 'Easy' : type === 3 ? 'Hard' : 'Medium';
    
    puzzles.push({
      id: `seq_${idNum}`,
      theme: PUZZLE_THEMES.LOGIC_OPS,
      title: `Sequence Protocol ${idNum}`,
      description: desc,
      difficulty,
      multiplier: difficulty === 'Hard' ? 1.8 : difficulty === 'Medium' ? 1.4 : 1.1,
      type: 'logic',
      answer: ans,
      puzzle_data: {}
    });
  }
  return puzzles;
};

const generateCryptoPuzzles = (count: number, startId: number) => {
  const puzzles = [];
  const words = ["ENIGMA", "CIPHER", "AGENT", "MISSION", "COVERT", "INTEL", "SIGNAL", "STEALTH", "TANGO", "VECTOR"];
  for (let i = 0; i < count; i++) {
    const idNum = startId + i;
    const shift = (i % 10) + 1;
    const targetWord = words[i % words.length];
    
    // Simple Caesar shift generator
    const encrypt = (word: string, s: number) => {
      return word.split('').map(char => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) {
          return String.fromCharCode(((code - 65 + s) % 26) + 65);
        }
        return char;
      }).join('');
    };

    const encrypted = encrypt(targetWord, shift);

    puzzles.push({
      id: `cryp_${idNum}`,
      theme: PUZZLE_THEMES.CYBER_SECURITY,
      title: `Intercepted Transmission ${idNum}`,
      description: `Decrypt this message using a Caesar shift of ${shift} (A + ${shift}): ${encrypted}`,
      difficulty: 'Medium' as const,
      multiplier: 1.5,
      type: 'substitution',
      answer: targetWord,
      puzzle_data: { encryptedText: encrypted }
    });
  }
  return puzzles;
};

const generateBookCiphers = (count: number, startId: number) => {
  const puzzles = [];
  const texts = [
    "The target is moving North.\nIntercept at the station.\nAwait further orders.",
    "Operation sunrise is a go.\nExtraction point alpha.\nDo not engage.",
    "Assets are secured.\nProceed to the safehouse.\nMaintain radio silence.",
    "Verify the credentials.\nTarget wears a red tie.\nWatch for the signal."
  ];

  for(let i=0; i<count; i++) {
    const idNum = startId + i;
    const textIdx = i % texts.length;
    const text = texts[textIdx];
    const lines = text.split('\n');
    
    // pick a random word
    const targetLineIdx = i % lines.length;
    const words = lines[targetLineIdx].split(' ').map(w => w.replace(/[^a-zA-Z]/g, '').toUpperCase());
    const targetWordIdx = (i * 2) % words.length;
    const answerWord = words[targetWordIdx];

    puzzles.push({
      id: `book_${idNum}`,
      theme: PUZZLE_THEMES.SIGNAL_INT,
      title: `Dead Drop Cipher ${idNum}`,
      description: `Locate the extraction word using the provided coordinates [Line, Word].`,
      difficulty: 'Hard' as const,
      multiplier: 1.9,
      type: 'book',
      answer: answerWord,
      puzzle_data: {
        text: text.toUpperCase(),
        coordinates: [[targetLineIdx + 1, targetWordIdx + 1]]
      }
    });
  }
  return puzzles;
}

export const ALL_PUZZLES = [
  ...manualPuzzles,
  ...generateSequencePuzzles(30, 41),
  ...generateCryptoPuzzles(30, 71),
  ...generateBookCiphers(20, 101)
];
