'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { calcLevel, calcRank, checkAnswer } from '@/lib/gameLogic';
import { ALL_PUZZLES } from '@/lib/puzzles';

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
  hint?: string;
  hint_used?: boolean;
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
  requestHint: (puzzleId: string) => void;
  sendChallenge: (challengedId: string) => void;
  solveChallenge: (challengeId: string, answer: string) => Promise<{ correct: boolean; scoreEarned: number }>;
  exportDossier: () => void;
  importDossier: (jsonString: string) => void;
  syncDatabase: () => void;
};

const GameStateContext = createContext<GameStateContextType | null>(null);

const INITIAL_PUZZLES: Puzzle[] = ALL_PUZZLES.map(p => ({ ...p, solved: false }));

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
      const parsedPuzzles: Puzzle[] = JSON.parse(storedPuzzles);
      // Migration: Sync with new master list (INITIAL_PUZZLES)
      // Keep solved status for existing IDs, add new puzzles from master list
      const syncedPuzzles = INITIAL_PUZZLES.map(masterPuzzle => {
        const existing = parsedPuzzles.find(p => p.id === masterPuzzle.id);
        return existing ? { ...masterPuzzle, solved: existing.solved } : masterPuzzle;
      });
      setPuzzles(syncedPuzzles);
      localStorage.setItem('mi5_puzzles', JSON.stringify(syncedPuzzles));
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
      let scoreEarned = 100 * puzzle.multiplier;
      if (puzzle.hint_used) {
        scoreEarned = Math.floor(scoreEarned * 0.5); // 50% penalty for using a hint
      }
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

  const requestHint = (puzzleId: string) => {
    const updatedPuzzles = puzzles.map(p => 
      p.id === puzzleId ? { ...p, hint_used: true } : p
    );
    saveState({ puzzles: updatedPuzzles });
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

  const exportDossier = () => {
    const data = {
      user,
      puzzles,
      leaderboard,
      challenges,
      version: '1.0.0',
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mi5_dossier_${user?.username || 'agent'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importDossier = (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.user && data.puzzles) {
        saveState({
          user: data.user,
          puzzles: data.puzzles,
          leaderboard: data.leaderboard || INITIAL_LEADERBOARD,
          challenges: data.challenges || { incoming: [], outgoing: [] }
        });
        window.location.reload(); // Refresh to ensure all state is clean
      }
    } catch (e) {
      console.error('Failed to import dossier:', e);
      alert('INVALID DOSSIER FORMAT. CORRUPTION DETECTED.');
    }
  };

  const syncDatabase = () => {
    // Force a full rebuild of the puzzle list while maintaining solved status
    const currentPuzzles = puzzles.length > 0 ? puzzles : JSON.parse(localStorage.getItem('mi5_puzzles') || '[]');
    const syncedPuzzles = INITIAL_PUZZLES.map(masterPuzzle => {
      const existing = currentPuzzles.find((p: any) => p.id === masterPuzzle.id);
      return existing ? { ...masterPuzzle, solved: existing.solved } : masterPuzzle;
    });
    saveState({ puzzles: syncedPuzzles });
    alert(`DATABASE RE-INDEXED: ${syncedPuzzles.length} MISSIONS LOADED.`);
  };

  return (
    <GameStateContext.Provider value={{ user, puzzles, leaderboard, challenges, login, logout, solvePuzzle, requestHint, sendChallenge, solveChallenge, exportDossier, importDossier, syncDatabase }}>
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