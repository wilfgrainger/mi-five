CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  username TEXT UNIQUE,
  score INTEGER DEFAULT 0,
  rank TEXT DEFAULT 'Recruit',
  level INTEGER DEFAULT 1,
  is_pro INTEGER DEFAULT 0,
  stripe_customer_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS base_puzzles (
  id TEXT PRIMARY KEY,
  type TEXT,
  title TEXT,
  description TEXT,
  difficulty TEXT,
  multiplier INTEGER,
  puzzle_data TEXT,
  answer TEXT
);

CREATE TABLE IF NOT EXISTS daily_ai_usage (
  user_id TEXT,
  date TEXT,
  count INTEGER DEFAULT 0,
  PRIMARY KEY(user_id, date),
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS auth_tokens (
  token TEXT PRIMARY KEY,
  email TEXT,
  expires_at DATETIME
);

CREATE TABLE IF NOT EXISTS sessions (
  session_id TEXT PRIMARY KEY,
  user_id TEXT,
  expires_at DATETIME,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS solved_puzzles (
  user_id TEXT,
  puzzle_id TEXT,
  score_earned INTEGER,
  solved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(user_id, puzzle_id),
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS generated_puzzles (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  type TEXT,
  title TEXT,
  description TEXT,
  difficulty TEXT,
  multiplier INTEGER,
  puzzle_data TEXT,
  answer TEXT,
  solved INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS challenges (
  id TEXT PRIMARY KEY,
  challenger_id TEXT NOT NULL,
  challenged_id TEXT NOT NULL,
  puzzle_id TEXT NOT NULL,
  puzzle_data TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(challenger_id) REFERENCES users(id),
  FOREIGN KEY(challenged_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS challenge_results (
  id TEXT PRIMARY KEY,
  challenge_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  score_earned INTEGER DEFAULT 0,
  solved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(challenge_id) REFERENCES challenges(id),
  FOREIGN KEY(user_id) REFERENCES users(id)
);
