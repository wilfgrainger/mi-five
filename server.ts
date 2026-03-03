import express from 'express';
import { createServer as createViteServer } from 'vite';
import cookieParser from 'cookie-parser';
import { v4 as uuidv4 } from 'uuid';
import db from './src/db.js';
import { generateRandomPuzzle } from './src/puzzleGenerator.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // API Routes
  app.post('/api/auth/request', (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

    db.prepare('INSERT INTO auth_tokens (token, email, expires_at) VALUES (?, ?, ?)').run(token, email, expiresAt);

    // In a real app, send an email here. For prototype, we return the token in response to simulate the link.
    const magicLink = `${process.env.APP_URL || `http://localhost:${PORT}`}/verify?token=${token}`;
    
    console.log(`[SIMULATED EMAIL] To: ${email} | Link: ${magicLink}`);
    
    res.json({ message: 'Magic link sent', simulatedLink: magicLink });
  });

  app.post('/api/auth/verify', (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token required' });

    const tokenRecord = db.prepare('SELECT * FROM auth_tokens WHERE token = ? AND expires_at > CURRENT_TIMESTAMP').get(token) as any;
    
    if (!tokenRecord) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const { email } = tokenRecord;

    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    
    if (!user) {
      const userId = uuidv4();
      const username = `Agent_${Math.floor(Math.random() * 10000)}`;
      db.prepare('INSERT INTO users (id, email, username) VALUES (?, ?, ?)').run(userId, email, username);
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
    }

    const sessionId = uuidv4();
    const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
    db.prepare('INSERT INTO sessions (session_id, user_id, expires_at) VALUES (?, ?, ?)').run(sessionId, user.id, sessionExpiresAt);

    db.prepare('DELETE FROM auth_tokens WHERE token = ?').run(token);

    res.json({ user, token: sessionId });
  });

  app.post('/api/auth/logout', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const sessionId = authHeader.split(' ')[1];
      db.prepare('DELETE FROM sessions WHERE session_id = ?').run(sessionId);
    }
    res.json({ message: 'Logged out' });
  });

  // Middleware to authenticate user
  const authenticate = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const sessionId = authHeader.split(' ')[1];

    const session = db.prepare('SELECT * FROM sessions WHERE session_id = ? AND expires_at > CURRENT_TIMESTAMP').get(sessionId) as any;
    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(session.user_id) as any;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    req.user = user;
    next();
  };

  app.get('/api/me', authenticate, (req: any, res) => {
    const solvedPuzzles = db.prepare('SELECT puzzle_id, score_earned, solved_at FROM solved_puzzles WHERE user_id = ?').all(req.user.id);
    res.json({ user: req.user, solvedPuzzles });
  });

  app.post('/api/me/username', authenticate, (req: any, res) => {
    const { username } = req.body;
    if (!username || username.length < 3) return res.status(400).json({ error: 'Invalid username' });
    
    try {
      db.prepare('UPDATE users SET username = ? WHERE id = ?').run(username, req.user.id);
      res.json({ message: 'Username updated' });
    } catch (e) {
      res.status(400).json({ error: 'Username taken' });
    }
  });

  app.get('/api/puzzles', authenticate, async (req: any, res) => {
    let unsolved = db.prepare('SELECT * FROM generated_puzzles WHERE user_id = ? AND solved = 0').all(req.user.id) as any[];
    
    while (unsolved.length < 4) {
      const newPuzzle = await generateRandomPuzzle(req.user.id);
      db.prepare(`INSERT INTO generated_puzzles 
        (id, user_id, type, title, description, difficulty, multiplier, puzzle_data, answer) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
        newPuzzle.id, newPuzzle.user_id, newPuzzle.type, newPuzzle.title, newPuzzle.description, 
        newPuzzle.difficulty, newPuzzle.multiplier, newPuzzle.puzzle_data, newPuzzle.answer
      );
      unsolved.push(newPuzzle);
    }

    const solved = db.prepare('SELECT * FROM generated_puzzles WHERE user_id = ? AND solved = 1 ORDER BY created_at DESC LIMIT 10').all(req.user.id) as any[];

    const formatPuzzle = (p: any) => ({
      id: p.id,
      type: p.type,
      title: p.title,
      description: p.description,
      difficulty: p.difficulty,
      multiplier: p.multiplier,
      puzzle_data: typeof p.puzzle_data === 'string' ? JSON.parse(p.puzzle_data) : p.puzzle_data,
      solved: p.solved === 1
    });

    res.json({ 
      puzzles: unsolved.map(formatPuzzle),
      history: solved.map(formatPuzzle)
    });
  });

  app.post('/api/puzzles/:id/solve', authenticate, (req: any, res) => {
    const { id } = req.params;
    const { answer } = req.body;

    const puzzle = db.prepare('SELECT * FROM generated_puzzles WHERE id = ? AND user_id = ?').get(id, req.user.id) as any;
    if (!puzzle) return res.status(404).json({ error: 'Puzzle not found' });
    if (puzzle.solved) return res.status(400).json({ error: 'Already solved' });

    let isCorrect = false;

    if (puzzle.type === 'map_coloring') {
      try {
        const coloring = typeof answer === 'string' ? JSON.parse(answer) : answer;
        const data = JSON.parse(puzzle.puzzle_data);
        const edges = data.edges;
        
        let valid = true;
        let colorsUsed = new Set();
        
        for (const [u, v] of edges) {
          if (coloring[u] === undefined || coloring[v] === undefined) {
            valid = false; break;
          }
          if (coloring[u] === coloring[v]) {
            valid = false; break;
          }
          colorsUsed.add(coloring[u]);
          colorsUsed.add(coloring[v]);
        }
        
        if (valid && colorsUsed.size <= 4) {
          isCorrect = true;
        }
      } catch (e) {
        isCorrect = false;
      }
    } else {
      isCorrect = answer.trim().toLowerCase() === puzzle.answer.toLowerCase();
    }

    if (isCorrect) {
      const baseScore = 100;
      const scoreEarned = baseScore * puzzle.multiplier;

      db.prepare('UPDATE generated_puzzles SET solved = 1 WHERE id = ?').run(id);
      db.prepare('INSERT INTO solved_puzzles (user_id, puzzle_id, score_earned) VALUES (?, ?, ?)').run(req.user.id, id, scoreEarned);
      
      // Update user score and rank
      db.prepare('UPDATE users SET score = score + ? WHERE id = ?').run(scoreEarned, req.user.id);
      
      const user = db.prepare('SELECT score FROM users WHERE id = ?').get(req.user.id) as any;
      let newRank = 'Recruit';
      if (user.score >= 1000) newRank = 'Director';
      else if (user.score >= 500) newRank = 'Special Agent';
      else if (user.score >= 200) newRank = 'Field Agent';
      
      db.prepare('UPDATE users SET rank = ? WHERE id = ?').run(newRank, req.user.id);

      res.json({ correct: true, scoreEarned, newRank });
    } else {
      res.json({ correct: false });
    }
  });

  app.get('/api/leaderboard', (req, res) => {
    const topUsers = db.prepare('SELECT id, username, score, rank FROM users ORDER BY score DESC LIMIT 10').all();
    res.json({ leaderboard: topUsers });
  });

  // --- Challenge System ---

  // Create a challenge: pick a random puzzle and challenge another user
  app.post('/api/challenges', authenticate, async (req: any, res) => {
    const { challenged_user_id } = req.body;
    if (!challenged_user_id) return res.status(400).json({ error: 'challenged_user_id required' });

    const target = db.prepare('SELECT * FROM users WHERE id = ?').get(challenged_user_id) as any;
    if (!target) return res.status(404).json({ error: 'User not found' });
    if (target.id === req.user.id) return res.status(400).json({ error: 'Cannot challenge yourself' });

    // Generate a shared puzzle for this challenge
    const puzzle = await generateRandomPuzzle(req.user.id);
    const challengeId = uuidv4();

    db.prepare(`INSERT INTO challenges (id, challenger_id, challenged_id, puzzle_id, puzzle_data) VALUES (?, ?, ?, ?, ?)`)
      .run(challengeId, req.user.id, target.id, puzzle.id, JSON.stringify({
        type: puzzle.type,
        title: puzzle.title,
        description: puzzle.description,
        difficulty: puzzle.difficulty,
        multiplier: puzzle.multiplier,
        puzzle_data: puzzle.puzzle_data,
        answer: puzzle.answer
      }));

    res.json({ message: 'Challenge sent!', challengeId });
  });

  // Get challenges for current user (incoming + outgoing)
  app.get('/api/challenges', authenticate, (req: any, res) => {
    const incoming = db.prepare(`
      SELECT c.*, u.username as challenger_name
      FROM challenges c
      JOIN users u ON u.id = c.challenger_id
      WHERE c.challenged_id = ? ORDER BY c.created_at DESC
    `).all(req.user.id) as any[];

    const outgoing = db.prepare(`
      SELECT c.*, u.username as challenged_name
      FROM challenges c
      JOIN users u ON u.id = c.challenged_id
      WHERE c.challenger_id = ? ORDER BY c.created_at DESC
    `).all(req.user.id) as any[];

    // Attach results for each challenge
    const withResults = (list: any[]) => list.map(c => {
      const results = db.prepare('SELECT cr.*, u.username FROM challenge_results cr JOIN users u ON u.id = cr.user_id WHERE cr.challenge_id = ?').all(c.id);
      return { ...c, puzzle_data: JSON.parse(c.puzzle_data), results };
    });

    res.json({ incoming: withResults(incoming), outgoing: withResults(outgoing) });
  });

  // Accept & solve a challenge
  app.post('/api/challenges/:id/solve', authenticate, (req: any, res) => {
    const { id } = req.params;
    const { answer } = req.body;

    const challenge = db.prepare('SELECT * FROM challenges WHERE id = ?').get(id) as any;
    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

    if (challenge.challenger_id !== req.user.id && challenge.challenged_id !== req.user.id) {
      return res.status(403).json({ error: 'Not your challenge' });
    }

    const alreadySolved = db.prepare('SELECT * FROM challenge_results WHERE challenge_id = ? AND user_id = ?').get(id, req.user.id);
    if (alreadySolved) return res.status(400).json({ error: 'Already solved this challenge' });

    const puzzleData = JSON.parse(challenge.puzzle_data);
    let isCorrect = false;

    if (puzzleData.type === 'map_coloring') {
      try {
        const coloring = typeof answer === 'string' ? JSON.parse(answer) : answer;
        const data = JSON.parse(puzzleData.puzzle_data);
        const edges = data.edges;
        let valid = true;
        let colorsUsed = new Set();
        for (const [u, v] of edges) {
          if (coloring[u] === undefined || coloring[v] === undefined) { valid = false; break; }
          if (coloring[u] === coloring[v]) { valid = false; break; }
          colorsUsed.add(coloring[u]); colorsUsed.add(coloring[v]);
        }
        if (valid && colorsUsed.size <= 4) isCorrect = true;
      } catch { isCorrect = false; }
    } else {
      isCorrect = answer.trim().toLowerCase() === puzzleData.answer.toLowerCase();
    }

    if (isCorrect) {
      const scoreEarned = 100 * (puzzleData.multiplier || 1);
      db.prepare('INSERT INTO challenge_results (id, challenge_id, user_id, score_earned) VALUES (?, ?, ?, ?)').run(uuidv4(), id, req.user.id, scoreEarned);
      db.prepare('UPDATE users SET score = score + ? WHERE id = ?').run(scoreEarned, req.user.id);

      // Mark challenge complete if both players have responded
      const resultCount = db.prepare('SELECT COUNT(*) as cnt FROM challenge_results WHERE challenge_id = ?').get(id) as any;
      if (resultCount.cnt >= 2) {
        db.prepare('UPDATE challenges SET status = ? WHERE id = ?').run('completed', id);
      } else if (challenge.status === 'pending') {
        db.prepare('UPDATE challenges SET status = ? WHERE id = ?').run('active', id);
      }

      res.json({ correct: true, scoreEarned });
    } else {
      res.json({ correct: false });
    }
  });


  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
