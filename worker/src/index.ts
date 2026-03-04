import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { generateRandomPuzzle } from './puzzleGenerator';

type Bindings = {
  DB: any;
  GEMINI_API_KEY: string;
  FRONTEND_URL: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
};

type Variables = {
  user: any;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// --- CORS ---
app.use('/api/*', async (c, next) => {
  const origin = c.env.FRONTEND_URL || '*';
  const corsMiddleware = cors({
    origin,
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  });
  return corsMiddleware(c, next);
});

// --- Auth middleware ---
const authenticate = async (c: any, next: () => Promise<void>) => {
  const authHeader = c.req.header('Authorization') ?? '';
  if (!authHeader.startsWith('Bearer ')) return c.json({ error: 'Unauthorized' }, 401);
  const sessionId = authHeader.split(' ')[1];
  const session = await c.env.DB.prepare(
    'SELECT * FROM sessions WHERE session_id = ? AND expires_at > CURRENT_TIMESTAMP'
  ).bind(sessionId).first();
  if (!session) return c.json({ error: 'Unauthorized' }, 401);
  const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(session.user_id).first();
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  c.set('user', user);
  await next();
};

// ============================================================
// AUTH
// ============================================================

app.post('/api/auth/request', async (c) => {
  const { email } = await c.req.json();
  if (!email) return c.json({ error: 'Email required' }, 400);

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  await c.env.DB.prepare('INSERT INTO auth_tokens (token, email, expires_at) VALUES (?, ?, ?)')
    .bind(token, email, expiresAt).run();

  const appUrl = c.env.FRONTEND_URL || `https://${c.req.header('host')}`;
  const magicLink = `${appUrl}/verify?token=${token}`;

  return c.json({ message: 'Magic link sent', simulatedLink: magicLink });
});

app.post('/api/auth/verify', async (c) => {
  const { token } = await c.req.json();
  if (!token) return c.json({ error: 'Token required' }, 400);

  const tokenRecord = await c.env.DB.prepare(
    'SELECT * FROM auth_tokens WHERE token = ? AND expires_at > CURRENT_TIMESTAMP'
  ).bind(token).first();

  if (!tokenRecord) return c.json({ error: 'Invalid or expired token' }, 401);

  const { email } = tokenRecord;
  let user = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();

  if (!user) {
    const userId = crypto.randomUUID();
    const username = `Agent_${Math.floor(Math.random() * 10000)}`;
    await c.env.DB.prepare('INSERT INTO users (id, email, username) VALUES (?, ?, ?)').bind(userId, email, username).run();
    user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first();
  }

  const sessionId = crypto.randomUUID();
  const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  await c.env.DB.prepare('INSERT INTO sessions (session_id, user_id, expires_at) VALUES (?, ?, ?)')
    .bind(sessionId, user.id, sessionExpiresAt).run();
  await c.env.DB.prepare('DELETE FROM auth_tokens WHERE token = ?').bind(token).run();

  return c.json({ user, token: sessionId });
});

app.post('/api/auth/logout', authenticate, async (c) => {
  const authHeader = c.req.header('Authorization') ?? '';
  const sessionId = authHeader.split(' ')[1];
  await c.env.DB.prepare('DELETE FROM sessions WHERE session_id = ?').bind(sessionId).run();
  return c.json({ message: 'Logged out' });
});

// ============================================================
// USER
// ============================================================

app.get('/api/me', authenticate, async (c) => {
  const user: any = c.get('user');
  const { results: solvedPuzzles } = await c.env.DB.prepare(
    'SELECT puzzle_id, score_earned, solved_at FROM solved_puzzles WHERE user_id = ?'
  ).bind(user.id).all();
  return c.json({ user, solvedPuzzles });
});

app.post('/api/me/username', authenticate, async (c) => {
  const user: any = c.get('user');
  const { username } = await c.req.json();
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  if (!username || !usernameRegex.test(username)) return c.json({ error: 'Invalid username' }, 400);
  try {
    await c.env.DB.prepare('UPDATE users SET username = ? WHERE id = ?').bind(username, user.id).run();
    return c.json({ message: 'Username updated' });
  } catch {
    return c.json({ error: 'Username taken' }, 400);
  }
});

// ============================================================
// PUZZLES
// ============================================================

app.get('/api/puzzles', authenticate, async (c) => {
  const user: any = c.get('user');

  let { results: unsolved } = await c.env.DB.prepare(
    'SELECT * FROM generated_puzzles WHERE user_id = ? AND solved = 0'
  ).bind(user.id).all();

  // Fill puzzle slot from the static base_puzzles pool (no AI cost)
  while (unsolved.length < 4) {
    // Pick a random base puzzle the user hasn't solved yet
    const pool = await c.env.DB.prepare(
      `SELECT * FROM base_puzzles WHERE id NOT IN (
        SELECT puzzle_id FROM solved_puzzles WHERE user_id = ?
       ) AND id NOT IN (
        SELECT id FROM generated_puzzles WHERE user_id = ?
       ) ORDER BY RANDOM() LIMIT 1`
    ).bind(user.id, user.id).first();
    
    let newPuzzle: any;
    if (pool) {
      // Clone from base pool into the user's generated_puzzles
      newPuzzle = { ...pool, user_id: user.id, id: crypto.randomUUID(), puzzle_id: pool.id };
    } else {
      // All base puzzles exhausted — generate AI puzzle only if within daily limit or Pro
      const today = new Date().toISOString().split('T')[0];
      const usage = await c.env.DB.prepare(
        'SELECT count FROM daily_ai_usage WHERE user_id = ? AND date = ?'
      ).bind(user.id, today).first();
      const dailyCount = (usage as any)?.count ?? 0;
      const isPro = user.is_pro === 1;
      if (!isPro && dailyCount >= 10) {
        // Serve oldest solved puzzle recycled rather than blocking
        const recycled = await c.env.DB.prepare(
          'SELECT * FROM base_puzzles ORDER BY RANDOM() LIMIT 1'
        ).first();
        newPuzzle = recycled ? { ...recycled, user_id: user.id, id: crypto.randomUUID() } : null;
      } else {
        newPuzzle = await generateRandomPuzzle(user.id, c.env.GEMINI_API_KEY);
        // Track usage
        await c.env.DB.prepare(
          'INSERT INTO daily_ai_usage (user_id, date, count) VALUES (?, ?, 1) ON CONFLICT(user_id, date) DO UPDATE SET count = count + 1'
        ).bind(user.id, today).run();
      }
    }
    if (!newPuzzle) break;
    await c.env.DB.prepare(
      'INSERT OR IGNORE INTO generated_puzzles (id, user_id, type, title, description, difficulty, multiplier, puzzle_data, answer) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(newPuzzle.id, user.id, newPuzzle.type, newPuzzle.title, newPuzzle.description,
      newPuzzle.difficulty, newPuzzle.multiplier, newPuzzle.puzzle_data, newPuzzle.answer).run();
    unsolved.push(newPuzzle);
  }

  const { results: solved } = await c.env.DB.prepare(
    'SELECT * FROM generated_puzzles WHERE user_id = ? AND solved = 1 ORDER BY created_at DESC LIMIT 10'
  ).bind(user.id).all();

  const formatPuzzle = (p: any) => ({
    id: p.id, type: p.type, title: p.title, description: p.description,
    difficulty: p.difficulty, multiplier: p.multiplier,
    puzzle_data: typeof p.puzzle_data === 'string' ? JSON.parse(p.puzzle_data) : p.puzzle_data,
    solved: p.solved === 1,
  });

  return c.json({ puzzles: unsolved.map(formatPuzzle), history: solved.map(formatPuzzle) });
});

app.post('/api/puzzles/:id/solve', authenticate, async (c) => {
  const user: any = c.get('user');
  const id = c.req.param('id');
  const { answer } = await c.req.json();

  const puzzle = await c.env.DB.prepare(
    'SELECT * FROM generated_puzzles WHERE id = ? AND user_id = ?'
  ).bind(id, user.id).first();
  if (!puzzle) return c.json({ error: 'Puzzle not found' }, 404);
  if (puzzle.solved) return c.json({ error: 'Already solved' }, 400);

  const isCorrect = checkAnswer(puzzle, answer);

  if (isCorrect) {
    const scoreEarned = 100 * puzzle.multiplier;
    await c.env.DB.prepare('UPDATE generated_puzzles SET solved = 1 WHERE id = ?').bind(id).run();
    await c.env.DB.prepare('INSERT INTO solved_puzzles (user_id, puzzle_id, score_earned) VALUES (?, ?, ?)')
      .bind(user.id, id, scoreEarned).run();
    await c.env.DB.prepare('UPDATE users SET score = score + ? WHERE id = ?').bind(scoreEarned, user.id).run();
    const updatedUser = await c.env.DB.prepare('SELECT score FROM users WHERE id = ?').bind(user.id).first();
    const newRank = calcRank(updatedUser.score);
    const newLevel = calcLevel(updatedUser.score);
    await c.env.DB.prepare('UPDATE users SET rank = ?, level = ? WHERE id = ?').bind(newRank, newLevel, user.id).run();
    return c.json({ correct: true, scoreEarned, newRank, newLevel });
  }
  return c.json({ correct: false });
});

// ============================================================
// LEADERBOARD
// ============================================================

app.get('/api/leaderboard', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT id, username, score, rank, level FROM users ORDER BY score DESC LIMIT 10'
  ).all();
  return c.json({ leaderboard: results });
});

// ============================================================
// CHALLENGES
// ============================================================

app.post('/api/challenges', authenticate, async (c) => {
  const user: any = c.get('user');
  const { challenged_user_id } = await c.req.json();
  if (!challenged_user_id) return c.json({ error: 'challenged_user_id required' }, 400);

  const target = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(challenged_user_id).first();
  if (!target) return c.json({ error: 'User not found' }, 404);
  if ((target as any).id === user.id) return c.json({ error: 'Cannot challenge yourself' }, 400);

  // Freemium gate: 3 challenges/day free, unlimited for Pro
  const today = new Date().toISOString().split('T')[0];
  if (!user.is_pro) {
    const aiUsage = await c.env.DB.prepare(
      'SELECT count FROM daily_ai_usage WHERE user_id = ? AND date = ?'
    ).bind(user.id, today).first();
    const dailyCount = (aiUsage as any)?.count ?? 0;
    if (dailyCount >= 3) {
      return c.json({ error: 'LIMIT_REACHED', message: 'You have used your 3 free daily AI challenges. Upgrade to Pro for unlimited challenges at $4.99/month.' }, 402);
    }
  }

  const puzzle = await generateRandomPuzzle(user.id, c.env.GEMINI_API_KEY);
  const challengeId = crypto.randomUUID();

  await c.env.DB.prepare(
    'INSERT INTO challenges (id, challenger_id, challenged_id, puzzle_id, puzzle_data) VALUES (?, ?, ?, ?, ?)'
  ).bind(challengeId, user.id, (target as any).id, puzzle.id, JSON.stringify({
    type: puzzle.type, title: puzzle.title, description: puzzle.description,
    difficulty: puzzle.difficulty, multiplier: puzzle.multiplier,
    puzzle_data: puzzle.puzzle_data, answer: puzzle.answer,
  })).run();

  // Track AI usage for free users
  if (!user.is_pro) {
    await c.env.DB.prepare(
      'INSERT INTO daily_ai_usage (user_id, date, count) VALUES (?, ?, 1) ON CONFLICT(user.id, date) DO UPDATE SET count = count + 1'
    ).bind(user.id, today).run();
  }

  return c.json({ message: 'Challenge sent!', challengeId });
});

app.get('/api/challenges', authenticate, async (c) => {
  const user: any = c.get('user');

  const { results: incoming } = await c.env.DB.prepare(
    `SELECT c.*, u.username as challenger_name FROM challenges c
     JOIN users u ON u.id = c.challenger_id
     WHERE c.challenged_id = ? ORDER BY c.created_at DESC`
  ).bind(user.id).all();

  const { results: outgoing } = await c.env.DB.prepare(
    `SELECT c.*, u.username as challenged_name FROM challenges c
     JOIN users u ON u.id = c.challenged_id
     WHERE c.challenger_id = ? ORDER BY c.created_at DESC`
  ).bind(user.id).all();

  const withResults = async (list: any[]) => {
    return Promise.all(list.map(async (ch) => {
      const { results } = await c.env.DB.prepare(
        'SELECT cr.*, u.username FROM challenge_results cr JOIN users u ON u.id = cr.user_id WHERE cr.challenge_id = ?'
      ).bind(ch.id).all();
      return { ...ch, puzzle_data: JSON.parse(ch.puzzle_data), results };
    }));
  };

  return c.json({
    incoming: await withResults(incoming),
    outgoing: await withResults(outgoing),
  });
});

app.post('/api/challenges/:id/solve', authenticate, async (c) => {
  const user: any = c.get('user');
  const challengeId = c.req.param('id');
  const { answer } = await c.req.json();

  const challenge = await c.env.DB.prepare('SELECT * FROM challenges WHERE id = ?').bind(challengeId).first();
  if (!challenge) return c.json({ error: 'Challenge not found' }, 404);
  if (challenge.challenger_id !== user.id && challenge.challenged_id !== user.id)
    return c.json({ error: 'Not your challenge' }, 403);

  const already = await c.env.DB.prepare(
    'SELECT * FROM challenge_results WHERE challenge_id = ? AND user_id = ?'
  ).bind(challengeId, user.id).first();
  if (already) return c.json({ error: 'Already solved this challenge' }, 400);

  const puzzleData = JSON.parse(challenge.puzzle_data);
  const isCorrect = checkAnswer({ type: puzzleData.type, puzzle_data: puzzleData.puzzle_data, answer: puzzleData.answer }, answer);

  if (isCorrect) {
    const scoreEarned = 100 * (puzzleData.multiplier || 1);
    await c.env.DB.prepare(
      'INSERT INTO challenge_results (id, challenge_id, user_id, score_earned) VALUES (?, ?, ?, ?)'
    ).bind(crypto.randomUUID(), challengeId, user.id, scoreEarned).run();
    await c.env.DB.prepare('UPDATE users SET score = score + ? WHERE id = ?').bind(scoreEarned, user.id).run();

    const updatedUser = await c.env.DB.prepare('SELECT score FROM users WHERE id = ?').bind(user.id).first();
    const newRank = calcRank(updatedUser.score);
    const newLevel = calcLevel(updatedUser.score);
    await c.env.DB.prepare('UPDATE users SET rank = ?, level = ? WHERE id = ?').bind(newRank, newLevel, user.id).run();

    const { results: resultCount } = await c.env.DB.prepare(
      'SELECT COUNT(*) as cnt FROM challenge_results WHERE challenge_id = ?'
    ).bind(challengeId).all();
    const count = resultCount[0]?.cnt ?? 0;
    const newStatus = count >= 2 ? 'completed' : 'active';
    await c.env.DB.prepare('UPDATE challenges SET status = ? WHERE id = ?').bind(newStatus, challengeId).run();

    return c.json({ correct: true, scoreEarned });
  }
  return c.json({ correct: false });
});

// ============================================================
// STRIPE — Subscription ($4.99/month)
// ============================================================

app.post('/api/checkout', authenticate, async (c) => {
  const user: any = c.get('user');
  if (!c.env.STRIPE_SECRET_KEY) return c.json({ error: 'Payments not configured' }, 503);
  const origin = c.env.FRONTEND_URL || `https://${c.req.header('host')}`;

  const body = new URLSearchParams({
    'mode': 'subscription',
    'payment_method_types[]': 'card',
    'line_items[0][price_data][currency]': 'usd',
    'line_items[0][price_data][product_data][name]': 'MI5 Pro — Unlimited Challenges',
    'line_items[0][price_data][recurring][interval]': 'month',
    'line_items[0][price_data][unit_amount]': '499',
    'line_items[0][quantity]': '1',
    'success_url': `${origin}/?pro=success`,
    'cancel_url': `${origin}/?pro=cancelled`,
    'customer_email': user.email,
    'metadata[user_id]': user.id,
  });

  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${c.env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });
  const session = await res.json() as any;
  if (!res.ok) return c.json({ error: session.error?.message }, 500);
  return c.json({ url: session.url });
});

app.post('/api/webhooks/stripe', async (c) => {
  if (!c.env.STRIPE_WEBHOOK_SECRET) return c.json({ error: 'Not configured' }, 503);
  const sig = c.req.header('stripe-signature') ?? '';
  const rawBody = await c.req.text();

  // Verify webhook signature (simple timestamp+HMAC check)
  const parts = Object.fromEntries(sig.split(',').map(p => p.split('=')));
  const payload = `${parts.t}.${rawBody}`;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(c.env.STRIPE_WEBHOOK_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  const expected = Array.from(new Uint8Array(mac)).map(b => b.toString(16).padStart(2, '0')).join('');
  if (expected !== parts.v1) return c.json({ error: 'Invalid signature' }, 400);

  const event = JSON.parse(rawBody);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata?.user_id;
    const customerId = session.customer;
    if (userId) {
      await c.env.DB.prepare(
        'UPDATE users SET is_pro = 1, stripe_customer_id = ? WHERE id = ?'
      ).bind(customerId, userId).run();
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const customerId = event.data.object.customer;
    await c.env.DB.prepare(
      'UPDATE users SET is_pro = 0 WHERE stripe_customer_id = ?'
    ).bind(customerId).run();
  }

  return c.json({ received: true });
});

// ============================================================
// Helpers
// ============================================================

function checkAnswer(puzzle: any, answer: any): boolean {
  if (puzzle.type === 'map_coloring') {
    try {
      const coloring = typeof answer === 'string' ? JSON.parse(answer) : answer;
      const data = JSON.parse(typeof puzzle.puzzle_data === 'string' ? puzzle.puzzle_data : JSON.stringify(puzzle.puzzle_data));
      for (const [u, v] of data.edges) {
        if (coloring[u] === undefined || coloring[v] === undefined) return false;
        if (coloring[u] === coloring[v]) return false;
      }
      return new Set(Object.values(coloring)).size <= 4;
    } catch { return false; }
  }
  return String(answer).trim().toLowerCase() === String(puzzle.answer).toLowerCase();
}

function calcRank(score: number): string {
  if (score >= 1000) return 'Director';
  if (score >= 500) return 'Special Agent';
  if (score >= 200) return 'Field Agent';
  return 'Recruit';
}

function calcLevel(score: number): number {
  return Math.floor(score / 500) + 1;
}

export default app;
