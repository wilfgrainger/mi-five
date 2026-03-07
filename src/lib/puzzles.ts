export const PUZZLE_THEMES = {
  COLD_WAR: 'Cold War Operations',
  CYBER_SECURITY: 'Cyber Security & Crypto',
  GCHQ_CLASSIC: 'GCHQ Christmas Challenge',
  SIGNAL_INT: 'Signals Intelligence',
  LOGIC_OPS: 'Logic & Pattern Analysis'
};

const generateSequencePuzzles = (count: number) => {
  const puzzles = [];
  for (let i = 1; i <= count; i++) {
    const difficulty: 'Easy' | 'Medium' | 'Hard' = i < 5 ? 'Easy' : i < 15 ? 'Medium' : 'Hard';
    puzzles.push({
      id: `seq_${i}`,
      theme: PUZZLE_THEMES.LOGIC_OPS,
      title: `Sequence Analysis ${i}`,
      description: `What is the next number in the sequence: ${i}, ${i * 2}, ${i * 4}, ${i * 8}, ?`,
      difficulty,
      multiplier: 1 + (i * 0.1),
      type: 'logic',
      answer: (i * 16).toString(),
      puzzle_data: {}
    });
  }
  return puzzles;
};

const generateCryptoPuzzles = (count: number) => {
  const puzzles = [];
  for (let i = 1; i <= count; i++) {
    const shift = (i % 5) + 1;
    puzzles.push({
      id: `cryp_${i}`,
      theme: PUZZLE_THEMES.CYBER_SECURITY,
      title: `Crypto Fragment ${i}`,
      description: `Decrypt this fragment using a Caesar shift of ${shift}: [ENCRYPTED DATA]`,
      difficulty: 'Medium' as const,
      multiplier: 1.5,
      type: 'substitution',
      answer: 'SECRET',
      puzzle_data: { shift }
    });
  }
  return puzzles;
};

export const ALL_PUZZLES = [
  // --- Manual GCHQ Style ---
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
  
  // --- Expand to 100+ ---
  ...generateSequencePuzzles(50),
  ...generateCryptoPuzzles(50)
];
