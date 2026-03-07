'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { calcLevel, calcRank, checkAnswer } from '@/lib/gameLogic';

function getSecureRandomInt(maxExclusive: number): number {
  if (maxExclusive <= 0) {
    throw new Error('maxExclusive must be a positive integer');
  }
  const cryptoObj = (typeof window !== 'undefined' && window.crypto) || (typeof self !== 'undefined' && (self as any).crypto);
  if (!cryptoObj || typeof cryptoObj.getRandomValues !== 'function') {
    // Fallback to Math.random() if crypto is unavailable; this should be rare in modern browsers.
    return Math.floor(Math.random() * maxExclusive);
  }
  const range = maxExclusive;
  const maxUint32 = 0xffffffff;
  const limit = maxUint32 - (maxUint32 % range);
  const uint32 = new Uint32Array(1);
  let random;
  do {
    cryptoObj.getRandomValues(uint32);
    random = uint32[0];
  } while (random >= limit);
  return random % range;
}

export type User = {
  id: string;
  email: string;
  username: string;
  score: number;
  rank: string;
  level: number;
  is_pro?: number;
};

export type Puzzle = {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  multiplier: number;
  type: string;
  puzzle_data: any;
  answer?: string;
  solved: boolean;
};

export type Challenge = {
  id: string;
  challenger_id: string;
  challenged_id: string;
  challenger_name?: string;
  challenged_name?: string;
  puzzle_data: any;
  status: string;
  results: any[];
};

type GameStateContextType = {
  user: User | null;
  puzzles: Puzzle[];
  leaderboard: User[];
  challenges: { incoming: Challenge[]; outgoing: Challenge[] };
  login: (email: string) => void;
  logout: () => void;
  solvePuzzle: (puzzleId: string, answer: string) => Promise<{ correct: boolean; scoreEarned: number }>;
  sendChallenge: (challengedId: string) => void;
  solveChallenge: (challengeId: string, answer: string) => Promise<{ correct: boolean; scoreEarned: number }>;
};

const GameStateContext = createContext<GameStateContextType | null>(null);

const INITIAL_PUZZLES: Puzzle[] = [
  {
    id: 'puz_1',
    title: 'Operation Caesar',
    description: 'Intercepted text from a known syndicate. Decrypt the message using a shift of 3.',
    difficulty: 'Easy',
    multiplier: 1,
    type: 'substitution',
    puzzle_data: { encryptedText: 'KHOOR ZRUOG' },
    answer: 'HELLO WORLD',
    solved: false,
  },
  {
    id: 'puz_2',
    title: 'The Berlin Drop',
    description: 'Find the hidden extraction word at the given coordinates [Line, Word]',
    difficulty: 'Medium',
    multiplier: 2,
    type: 'book',
    puzzle_data: {
      text: "The quick brown fox\njumps over the lazy dog\nat midnight near the wall",
      coordinates: [[3, 5]]
    },
    answer: 'wall',
    solved: false,
  },
  {
    id: 'puz_3',
    title: 'Moscow Protocols',
    description: 'Assign frequencies to comm nodes so no two connected nodes share the same frequency. Use max 4 frequencies.',
    difficulty: 'Hard',
    multiplier: 3,
    type: 'map_coloring',
    puzzle_data: {
      nodes: [
        { id: 'Alpha', x: 20, y: 20 },
        { id: 'Beta', x: 80, y: 20 },
        { id: 'Gamma', x: 50, y: 80 }
      ],
      edges: [['Alpha', 'Beta'], ['Beta', 'Gamma'], ['Alpha', 'Gamma']]
    },
    solved: false,
  }
];

const INITIAL_LEADERBOARD: User[] = [
  { id: 'u_1', email: 'james@mi6.gov.uk', username: 'Agent007', score: 1500, rank: 'Director', level: 4, is_pro: 1 },
  { id: 'u_2', email: 'eve@mi5.gov.uk', username: 'EveM', score: 850, rank: 'Special Agent', level: 2, is_pro: 0 },
  { id: 'u_3', email: 'q@mi6.gov.uk', username: 'QBranch', score: 450, rank: 'Field Agent', level: 1, is_pro: 1 },
];

export function GameStateProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [leaderboard, setLeaderboard] = useState<User[]>([]);
  const [challenges, setChallenges] = useState<{ incoming: Challenge[]; outgoing: Challenge[] }>({ incoming: [], outgoing: [] });

  useEffect(() => {
    // Initialize state from local storage or set defaults
    const storedUser = localStorage.getItem('mi5_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const storedPuzzles = localStorage.getItem('mi5_puzzles');
    if (storedPuzzles) {
      setPuzzles(JSON.parse(storedPuzzles));
    } else {
      setPuzzles(INITIAL_PUZZLES);
      localStorage.setItem('mi5_puzzles', JSON.stringify(INITIAL_PUZZLES));
    }

    const storedLeaderboard = localStorage.getItem('mi5_leaderboard');
    if (storedLeaderboard) {
      setLeaderboard(JSON.parse(storedLeaderboard));
    } else {
      setLeaderboard(INITIAL_LEADERBOARD);
      localStorage.setItem('mi5_leaderboard', JSON.stringify(INITIAL_LEADERBOARD));
    }

    const storedChallenges = localStorage.getItem('mi5_challenges');
    if (storedChallenges) {
      setChallenges(JSON.parse(storedChallenges));
    } else {
      setChallenges({ incoming: [], outgoing: [] });
      localStorage.setItem('mi5_challenges', JSON.stringify({ incoming: [], outgoing: [] }));
    }
  }, []);

  const saveState = (newState: { user?: User | null, puzzles?: Puzzle[], leaderboard?: User[], challenges?: any }) => {
    if (newState.user !== undefined) {
      setUser(newState.user);
      if (newState.user) localStorage.setItem('mi5_user', JSON.stringify(newState.user));
      else localStorage.removeItem('mi5_user');
    }
    if (newState.puzzles !== undefined) {
      setPuzzles(newState.puzzles);
      localStorage.setItem('mi5_puzzles', JSON.stringify(newState.puzzles));
    }
    if (newState.leaderboard !== undefined) {
      setLeaderboard(newState.leaderboard);
      localStorage.setItem('mi5_leaderboard', JSON.stringify(newState.leaderboard));
    }
    if (newState.challenges !== undefined) {
      setChallenges(newState.challenges);
      localStorage.setItem('mi5_challenges', JSON.stringify(newState.challenges));
    }
  };

  const login = (email: string) => {
    const username =
      email.split('@')[0].substring(0, 10).replace(/[^a-zA-Z0-9]/g, '') +
      getSecureRandomInt(100);
    const newUser: User = {
      id: uuidv4(),
      email,
      username,
      score: 0,
      rank: 'Recruit',
      level: 1,
    };
    saveState({ user: newUser, leaderboard: [...leaderboard, newUser].sort((a,b)=>b.score-a.score) });
  };

  const logout = () => {
    saveState({ user: null });
  };

  const solvePuzzle = async (puzzleId: string, answer: string) => {
    const puzzle = puzzles.find(p => p.id === puzzleId);
    if (!puzzle || !user) return { correct: false, scoreEarned: 0 };

    const correct = checkAnswer(puzzle, answer);
    if (correct) {
      const scoreEarned = 100 * puzzle.multiplier;
      const newScore = user.score + scoreEarned;

      const updatedUser = {
        ...user,
        score: newScore,
        level: calcLevel(newScore),
        rank: calcRank(newScore)
      };

      const updatedPuzzles = puzzles.map(p => p.id === puzzleId ? { ...p, solved: true } : p);

      const updatedLeaderboard = leaderboard.map(u => u.id === user.id ? updatedUser : u).sort((a,b)=>b.score-a.score);
      if(!updatedLeaderboard.find(u => u.id === user.id)) {
          updatedLeaderboard.push(updatedUser);
          updatedLeaderboard.sort((a,b)=>b.score-a.score);
      }

      saveState({ user: updatedUser, puzzles: updatedPuzzles, leaderboard: updatedLeaderboard });
      return { correct: true, scoreEarned };
    }
    return { correct: false, scoreEarned: 0 };
  };

  const sendChallenge = (challengedId: string) => {
    if (!user) return;
    const challenged = leaderboard.find(u => u.id === challengedId);
    if (!challenged) return;

    // Pick a random puzzle
    const puzzle = puzzles[getSecureRandomInt(puzzles.length)];

    const newChallenge: Challenge = {
      id: uuidv4(),
      challenger_id: user.id,
      challenged_id: challenged.id,
      challenger_name: user.username,
      challenged_name: challenged.username,
      puzzle_data: puzzle,
      status: 'pending',
      results: []
    };

    saveState({
      challenges: {
        incoming: challenges.incoming,
        outgoing: [...challenges.outgoing, newChallenge]
      }
    });
  };

  const solveChallenge = async (challengeId: string, answer: string) => {
    const challenge = challenges.incoming.find(c => c.id === challengeId);
    if (!challenge || !user) return { correct: false, scoreEarned: 0 };

    const correct = checkAnswer(challenge.puzzle_data, answer);
    if (correct) {
      const scoreEarned = 150;
      const newScore = user.score + scoreEarned;

      const updatedUser = {
        ...user,
        score: newScore,
        level: calcLevel(newScore),
        rank: calcRank(newScore)
      };

      const updatedChallenges = {
        incoming: challenges.incoming.map(c =>
          c.id === challengeId
            ? { ...c, status: 'completed', results: [...c.results, { user_id: user.id, username: user.username, score_earned: scoreEarned }] }
            : c
        ),
        outgoing: challenges.outgoing
      };

      const updatedLeaderboard = leaderboard.map(u => u.id === user.id ? updatedUser : u).sort((a,b)=>b.score-a.score);

      saveState({ user: updatedUser, challenges: updatedChallenges, leaderboard: updatedLeaderboard });
      return { correct: true, scoreEarned };
    } else {
         const updatedChallenges = {
            incoming: challenges.incoming.map(c =>
              c.id === challengeId
                ? { ...c, status: 'completed', results: [...c.results, { user_id: user.id, username: user.username, score_earned: 0 }] }
                : c
            ),
            outgoing: challenges.outgoing
          };
        saveState({challenges: updatedChallenges});
    }
    return { correct: false, scoreEarned: 0 };
  };

  return (
    <GameStateContext.Provider value={{ user, puzzles, leaderboard, challenges, login, logout, solvePuzzle, sendChallenge, solveChallenge }}>
      {children}
    </GameStateContext.Provider>
  );
}

export function useGameState() {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
}