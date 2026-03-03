export interface Puzzle {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  multiplier: number;
  type: 'cipher' | 'logic' | 'trivia';
  answer: string;
}

export const puzzles: Puzzle[] = [
  {
    id: 'p1',
    title: 'Operation Caesar',
    description: 'Decrypt the following intercepted message using a Caesar cipher (shift 3 backwards): "WKH HDJOH KDV ODQGHG"',
    difficulty: 'Easy',
    multiplier: 1,
    type: 'cipher',
    answer: 'THE EAGLE HAS LANDED'
  },
  {
    id: 'p2',
    title: 'The Dead Drop',
    description: 'Agent X leaves a package at 14:00. Agent Y picks it up 45 minutes later. If Agent Z saw the drop 15 minutes before Y arrived, what time did Z see it? (Format: HH:MM)',
    difficulty: 'Easy',
    multiplier: 1,
    type: 'logic',
    answer: '14:30'
  },
  {
    id: 'p3',
    title: 'The Mole',
    description: 'There are 5 agents. One is a mole. Agent A says B is the mole. Agent B says C is the mole. Agent C says B is lying. Agent D says they are not the mole. Agent E says A is the mole. Only one agent is telling the truth. Who is the mole? (A, B, C, D, or E)',
    difficulty: 'Hard',
    multiplier: 3,
    type: 'logic',
    answer: 'D'
  },
  {
    id: 'p4',
    title: 'Morse Intercept',
    description: 'Translate this morse code: -- .. .....',
    difficulty: 'Medium',
    multiplier: 2,
    type: 'cipher',
    answer: 'MI5'
  },
  {
    id: 'p5',
    title: 'Binary Protocol',
    description: 'Convert this binary code to ASCII text: 01010011 01010000 01011001',
    difficulty: 'Medium',
    multiplier: 2,
    type: 'cipher',
    answer: 'SPY'
  }
];
