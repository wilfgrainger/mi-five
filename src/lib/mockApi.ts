import { puzzles } from '../puzzles';
import { checkAnswer, calcRank, calcLevel } from './gameLogic';

// A simple in-memory mock backend
let db = {
  users: [
    { id: '1', email: 'guest@mi5.gov.uk', username: 'GuestAgent', score: 0, rank: 'Recruit', level: 1 }
  ],
  solvedPuzzles: [] as any[],
  challenges: [] as any[]
};

// Load from local storage if exists
try {
  const saved = localStorage.getItem('mi5_mock_db');
  if (saved) {
    db = JSON.parse(saved);
  }
} catch (e) {
  console.error("Failed to load mock db", e);
}

const saveDb = () => {
  localStorage.setItem('mi5_mock_db', JSON.stringify(db));
};

export const installMockApi = () => {
  const originalFetch = window.fetch;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    let url = '';
    if (typeof input === 'string') {
      url = input;
    } else if (input instanceof URL) {
      url = input.toString();
    } else {
      url = input.url;
    }

    // Only intercept /api/ calls
    if (!url.includes('/api/')) {
      return originalFetch(input, init);
    }

    const method = init?.method || 'GET';
    const bodyStr = init?.body ? String(init.body) : '';
    let body = {};
    if (bodyStr) {
      try { body = JSON.parse(bodyStr); } catch (e) {}
    }

    const authHeader = (init?.headers as any)?.['Authorization'] || (init?.headers as any)?.['authorization'];
    let currentUser = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token === 'mock-token-123') {
        currentUser = db.users[0];
      }
    }

    const createResponse = (status: number, data: any) => {
      return Promise.resolve(new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' }
      }));
    };

    console.log(`[MOCK API] ${method} ${url}`, body);

    // Auth endpoints
    if (url.includes('/api/auth/request')) {
      return createResponse(200, { simulatedLink: 'http://localhost?token=mock-verification-token' });
    }

    if (url.includes('/api/auth/verify')) {
      return createResponse(200, { token: 'mock-token-123' });
    }

    if (url.includes('/api/auth/logout')) {
      return createResponse(200, { success: true });
    }

    // User endpoints
    if (url.includes('/api/me') && method === 'GET') {
      if (!currentUser) return createResponse(401, { error: 'Unauthorized' });
      return createResponse(200, { user: currentUser });
    }

    // Puzzles endpoints
    if (url.includes('/api/puzzles') && method === 'GET') {
      if (!currentUser) return createResponse(401, { error: 'Unauthorized' });
      const enrichedPuzzles = puzzles.map(p => ({
        ...p,
        solved: db.solvedPuzzles.some(sp => sp.userId === currentUser.id && sp.puzzleId === p.id)
      }));
      return createResponse(200, { puzzles: enrichedPuzzles });
    }

    // Puzzle solving
    const solveMatch = url.match(/\/api\/puzzles\/([^\/]+)\/solve/);
    if (solveMatch && method === 'POST') {
      if (!currentUser) return createResponse(401, { error: 'Unauthorized' });
      const puzzleId = solveMatch[1];
      const puzzle = puzzles.find(p => p.id === puzzleId);
      if (!puzzle) return createResponse(404, { error: 'Not found' });

      const { answer } = body as any;
      const isCorrect = checkAnswer(puzzle, answer);

      if (isCorrect) {
        const alreadySolved = db.solvedPuzzles.some(sp => sp.userId === currentUser.id && sp.puzzleId === puzzleId);
        let earned = 0;
        if (!alreadySolved) {
          earned = puzzle.multiplier * 10;
          currentUser.score += earned;
          currentUser.rank = calcRank(currentUser.score);
          currentUser.level = calcLevel(currentUser.score);
          db.solvedPuzzles.push({ userId: currentUser.id, puzzleId });
          saveDb();
        }
        return createResponse(200, { correct: true, scoreEarned: earned, newScore: currentUser.score, newLevel: currentUser.level, newRank: currentUser.rank });
      } else {
        return createResponse(200, { correct: false });
      }
    }

    // Leaderboard
    if (url.includes('/api/leaderboard') && method === 'GET') {
      return createResponse(200, { leaderboard: db.users.sort((a, b) => b.score - a.score) });
    }

    // Checkout
    if (url.includes('/api/checkout') && method === 'POST') {
      if (!currentUser) return createResponse(401, { error: 'Unauthorized' });
      return createResponse(200, { url: 'https://example.com/checkout' });
    }

    // Challenge solving
    const challengeSolveMatch = url.match(/\/api\/challenges\/([^\/]+)\/solve/);
    if (challengeSolveMatch && method === 'POST') {
      if (!currentUser) return createResponse(401, { error: 'Unauthorized' });
      const challengeId = challengeSolveMatch[1];

      // Since challenges are mocked empty, we simulate a successful/unsuccessful response
      // based on whether the answer is provided to avoid breaking the frontend.
      const { answer } = body as any;
      if (answer) {
        // Just simulate a correct answer if any non-empty answer is given,
        // since we don't store actual challenge data in this simple mock.
        const earned = 50;
        currentUser.score += earned;
        currentUser.rank = calcRank(currentUser.score);
        currentUser.level = calcLevel(currentUser.score);
        saveDb();
        return createResponse(200, { correct: true, scoreEarned: earned });
      } else {
        return createResponse(200, { correct: false });
      }
    }

    // Challenges
    if (url.includes('/api/challenges') && method === 'GET') {
      if (!currentUser) return createResponse(401, { error: 'Unauthorized' });
      return createResponse(200, { incoming: [], outgoing: [] });
    }

    if (url.includes('/api/challenges') && method === 'POST') {
      if (!currentUser) return createResponse(401, { error: 'Unauthorized' });
      return createResponse(200, { success: true });
    }

    // Default 404 for unmatched API routes
    return createResponse(404, { error: 'Mock endpoint not implemented' });
  };

  console.log('[MOCK API] Installed and intercepting /api requests');
};