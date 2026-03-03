import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Shield, Lock, Unlock, Trophy, User, LogOut, Send, Crosshair, Cpu, ChevronRight, AlertTriangle, Radio, Globe, Database, ArrowLeft, ArrowRight, CheckCircle2, Swords, Bell, Star, X } from 'lucide-react';
import LiveSpyBot from './components/LiveSpyBot';
import { API_BASE } from './lib/api';

type User = {
  id: string;
  email: string;
  username: string;
  score: number;
  rank: string;
  level: number;
  is_pro?: number;
};

type Puzzle = {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  multiplier: number;
  type: string;
  puzzle_data: any;
  solved: boolean;
};

type Challenge = {
  id: string;
  challenger_id: string;
  challenged_id: string;
  challenger_name?: string;
  challenged_name?: string;
  puzzle_data: any;
  status: string;
  results: any[];
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'dashboard' | 'puzzle' | 'leaderboard' | 'challenge'>('dashboard');
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [activePuzzle, setActivePuzzle] = useState<Puzzle | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [showBot, setShowBot] = useState(false);
  const [challenges, setChallenges] = useState<{ incoming: Challenge[]; outgoing: Challenge[] }>({ incoming: [], outgoing: [] });
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [challengeSending, setChallengeSending] = useState<string | null>(null);
  const [upgradeModal, setUpgradeModal] = useState(false);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    if (user) fetchChallenges();
  }, [user]);

  const checkSession = async (isRetry = false) => {
    try {
      const token = localStorage.getItem('mi5_token');
      if (token) {
        const res = await fetch(`${API_BASE}/api/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          fetchPuzzles();
          return;
        }
      }

      if (!isRetry) {
        // Auto-login for prototype
        const reqRes = await fetch(`${API_BASE}/api/auth/request`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'guest@mi5.gov.uk' })
        });
        const d = await reqRes.json();
        const url = new URL(d.simulatedLink, window.location.origin);
        const verifyToken = url.searchParams.get('token');
        const verifyRes = await fetch(`${API_BASE}/api/auth/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: verifyToken })
        });

        if (verifyRes.ok) {
          const verifyData = await verifyRes.json();
          localStorage.setItem('mi5_token', verifyData.token);
          await checkSession(true);
        } else {
          setAuthError(true);
        }
      } else {
        setAuthError(true);
      }
    } catch (e) {
      console.error(e);
      setAuthError(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchPuzzles = async () => {
    const token = localStorage.getItem('mi5_token');
    const res = await fetch(`${API_BASE}/api/puzzles`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setPuzzles(data.puzzles);
    }
  };

  const fetchLeaderboard = async () => {
    const res = await fetch(`${API_BASE}/api/leaderboard`);
    if (res.ok) {
      const data = await res.json();
      setLeaderboard(data.leaderboard);
    }
  };

  const fetchChallenges = async () => {
    const token = localStorage.getItem('mi5_token');
    const res = await fetch(`${API_BASE}/api/challenges`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      setChallenges(data);
    }
  };

  const sendChallenge = async (rivalId: string) => {
    setChallengeSending(rivalId);
    const token = localStorage.getItem('mi5_token');
    try {
      const res = await fetch(`${API_BASE}/api/challenges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ challenged_user_id: rivalId })
      });
      if (res.status === 402) {
        setUpgradeModal(true);
      } else if (res.ok) {
        fetchChallenges();
      }
    } finally {
      setChallengeSending(null);
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('mi5_token');
    if (token) {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      localStorage.removeItem('mi5_token');
    }
    setUser(null);
  };

  const handleUpgrade = async () => {
    const token = localStorage.getItem('mi5_token');
    const res = await fetch(`${API_BASE}/api/checkout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const { url } = await res.json();
      window.location.href = url;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-sans">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="flex flex-col items-center gap-4"
        >
          <Cpu className="w-12 h-12" />
          <p>INITIALIZING SECURE CONNECTION...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-transparent text-white flex items-center justify-center font-sans">
        {authError ? (
          <div className="flex flex-col items-center gap-4 text-red-500">
            <AlertTriangle className="w-12 h-12" />
            <p>AUTHENTICATION FAILED. COOKIES MAY BE BLOCKED.</p>
            <button
              onClick={() => { setAuthError(false); setLoading(true); checkSession(); }}
              className="mt-4 px-6 py-2 border border-red-500/50 rounded hover:bg-red-500/10 transition-colors"
            >
              RETRY CONNECTION
            </button>
          </div>
        ) : (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="flex flex-col items-center gap-4"
          >
            <Shield className="w-12 h-12 text-violet-300" />
            <p>AUTHENTICATING GUEST AGENT...</p>
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black/20 text-violet-300 font-sans selection:bg-violet-500 selection:text-black overflow-hidden relative">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-violet-900/20 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-900/20 blur-[150px] rounded-full mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>

        {/* Scanning Line */}
        <motion.div
          className="absolute left-0 right-0 h-[2px] bg-violet-500/30 shadow-2xl shadow-violet-500/40"
          animate={{ top: ['-10%', '110%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="relative z-10 flex flex-col h-screen">
        {/* Header */}
        <header className="border-b border-white/20 p-4 flex justify-between items-center bg-white/5 backdrop-blur-xl shadow-[0_8px_32px_rgba(31,38,135,0.15)]">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-violet-500 blur-md opacity-40 rounded-full"></div>
              <div className="p-2.5 bg-black/20 rounded-full border border-white/50 relative z-10">
                <Shield className="w-6 h-6 text-violet-300" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-normal text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] uppercase">MI6 <span className="text-violet-400 font-light">|</span> Q-Branch</h1>
              <p className="text-[10px] text-violet-300/80 font-bold tracking-normal uppercase mt-0.5">Secure Operative Terminal</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block bg-black/20 px-4 py-2 rounded-xl border border-white/20 shadow-inner">
              <p className="text-sm font-bold text-white tracking-wide">{user.username}</p>
              <p className="text-[10px] text-violet-400 tracking-normal uppercase mt-1">Level {user.level || 1} | Rank: {user.rank} | Score: {user.score}</p>
            </div>
            <button
              onClick={() => setShowBot(!showBot)}
              className={`p-2.5 rounded-full transition-all border ${showBot ? 'bg-violet-500 text-[#050b14] border-white/20 shadow-xl shadow-violet-500/30' : 'hover:bg-violet-500/10 text-violet-400/70 hover:text-violet-300 border-transparent hover:border-white/30'}`}
              title="Contact Q-Branch"
            >
              <Radio className="w-5 h-5" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2.5 hover:bg-red-500/10 text-violet-400/70 hover:text-red-400 rounded-full transition-all border border-transparent hover:border-red-500/30"
              title="Terminate Session"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Navigation */}
        <nav className="flex border-b border-white/10 bg-white/5 backdrop-blur-md">
          <button
            onClick={() => { setView('dashboard'); fetchPuzzles(); fetchChallenges(); }}
            className={`flex-1 py-4 text-xs md:text-sm font-bold tracking-normal transition-all relative overflow-hidden ${view === 'dashboard' ? 'text-violet-200 bg-violet-900/20' : 'text-violet-500 hover:bg-violet-900/10 hover:text-violet-300'}`}
          >
            {view === 'dashboard' && <motion.div layoutId="nav-indicator" className="absolute bottom-0 left-0 right-0 h-1 bg-violet-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]" />}
            OPERATIONAL BRIEFING
            {challenges.incoming.filter(c => c.status === 'pending').length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full">{challenges.incoming.filter(c => c.status === 'pending').length}</span>
            )}
          </button>
          <button
            onClick={() => { setView('leaderboard'); fetchLeaderboard(); }}
            className={`flex-1 py-4 text-xs md:text-sm font-bold tracking-normal transition-all relative overflow-hidden ${view === 'leaderboard' ? 'text-violet-200 bg-violet-900/20' : 'text-violet-500 hover:bg-violet-900/10 hover:text-violet-300'}`}
          >
            {view === 'leaderboard' && <motion.div layoutId="nav-indicator" className="absolute bottom-0 left-0 right-0 h-1 bg-violet-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]" />}
            GLOBAL NETWORK
          </button>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              {view === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  {/* Agent Dossier Card */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-3xl blur-xl transition-all duration-500 group-hover:opacity-100 opacity-50"></div>
                    <div className="border border-white/20 bg-white/5 backdrop-blur-2xl p-8 rounded-3xl relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)]">

                      {/* Decorative Tech Elements */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-5 pointer-events-none"></div>
                      <div className="absolute top-4 right-4 flex gap-1">
                        <div className="w-1 h-1 bg-violet-500/50 rounded-full"></div>
                        <div className="w-1 h-1 bg-violet-500/50 rounded-full"></div>
                        <div className="w-1 h-1 bg-violet-500/50 rounded-full"></div>
                      </div>
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>

                      <div className="flex flex-col md:flex-row gap-8 items-start md:items-center relative z-10">
                        <div className="flex-shrink-0 relative">
                          <div className="w-24 h-24 rounded-2xl border-2 border-white/30 bg-black/20 flex items-center justify-center overflow-hidden relative">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                            <User className="w-10 h-10 text-violet-400/50" />
                            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-cyan-900/50 to-transparent"></div>
                          </div>
                          <div className="absolute -bottom-2 -right-2 bg-violet-500 text-[#050b14] text-[10px] font-black px-2 py-1 rounded-md tracking-wider shadow-lg shadow-violet-500/20">
                            00 STATUS
                          </div>
                        </div>

                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-6 w-full">
                          <div className="bg-black/20 p-4 rounded-2xl border border-white/10 relative overflow-hidden group-hover:border-white/30 transition-colors">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500/20"></div>
                            <p className="text-violet-500 text-[10px] mb-1 tracking-normal font-bold uppercase">Operative Alias</p>
                            <p className="text-xl font-bold text-white tracking-wide">{user.username}</p>
                          </div>
                          <div className="bg-black/20 p-4 rounded-2xl border border-white/10 relative overflow-hidden group-hover:border-white/30 transition-colors">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500/20"></div>
                            <p className="text-violet-500 text-[10px] mb-1 tracking-normal font-bold uppercase">Clearance Rank</p>
                            <p className="text-xl font-bold text-white tracking-wide">{user.rank}</p>
                          </div>
                          <div className="bg-black/20 p-4 rounded-2xl border border-white/10 relative overflow-hidden group-hover:border-white/30 transition-colors">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-pink-500/20"></div>
                            <p className="text-violet-500 text-[10px] mb-1 tracking-normal font-bold uppercase">Operative Level</p>
                            <p className="text-xl font-bold text-white tracking-wide">{user.level || 1}</p>
                          </div>
                          <div className="bg-black/20 p-4 rounded-2xl border border-white/10 relative overflow-hidden group-hover:border-white/30 transition-colors">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500/20"></div>
                            <p className="text-violet-500 text-[10px] mb-1 tracking-normal font-bold uppercase">Intelligence Rating</p>
                            <p className="text-2xl font-black text-violet-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">{user.score}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Missions Grid */}
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-sm font-bold flex items-center gap-3 text-violet-200 tracking-normal uppercase">
                        <div className="p-1.5 bg-violet-500/10 rounded border border-white/20">
                          <Crosshair className="w-4 h-4 text-violet-300" />
                        </div>
                        Active Field Assignments
                      </h2>
                      <div className="h-[1px] flex-1 bg-gradient-to-r from-cyan-500/20 to-transparent ml-4"></div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {puzzles.map((puzzle) => (
                        <div
                          key={puzzle.id}
                          className={`relative group cursor-pointer`}
                          onClick={() => {
                            if (!puzzle.solved) {
                              setActivePuzzle(puzzle);
                              setView('puzzle');
                            }
                          }}
                        >
                          {/* Hover Glow */}
                          {!puzzle.solved && (
                            <div className="absolute inset-0 bg-violet-500/5 rounded-3xl blur-md transition-opacity opacity-0 group-hover:opacity-100"></div>
                          )}

                          <div className={`border p-6 rounded-3xl backdrop-blur-xl transition-all duration-300 h-full flex flex-col relative z-10 ${puzzle.solved
                            ? 'border-emerald-500/20 bg-emerald-900/10 opacity-60'
                            : 'border-white/20 bg-white/5 hover:bg-white/5 hover:border-white/40 hover:-translate-y-1 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(6,182,212,0.15)]'
                            }`}>

                            {/* Top Bar */}
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl border ${puzzle.solved ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-black/20 border-white/30 shadow-inner'
                                  }`}>
                                  {puzzle.solved ? <Unlock className="w-5 h-5 text-emerald-400" /> : <Lock className="w-5 h-5 text-violet-300" />}
                                </div>
                                <div>
                                  <h3 className="font-bold text-lg text-white tracking-wide">{puzzle.title}</h3>
                                  <p className="text-[10px] text-violet-500 font-bold tracking-normal uppercase mt-0.5">FILE: {puzzle.id.substring(0, 8)}</p>
                                </div>
                              </div>

                              <span className={`text-[10px] px-3 py-1.5 rounded-full border font-bold tracking-wide uppercase ${puzzle.difficulty === 'Easy' ? 'border-blue-500/30 bg-blue-500/10 text-blue-400' :
                                puzzle.difficulty === 'Medium' ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' :
                                  'border-red-500/30 bg-red-500/10 text-red-400'
                                }`}>
                                {puzzle.difficulty} <span className="opacity-50 ml-1">x{puzzle.multiplier}</span>
                              </span>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-violet-100/60 mb-6 flex-1 leading-relaxed font-light">{puzzle.description}</p>

                            {/* Bottom Bar */}
                            <div className="flex justify-between items-center pt-4 border-t border-white/10">
                              <div className="flex items-center gap-2">
                                <Terminal className="w-3.5 h-3.5 text-violet-500" />
                                <span className="text-[10px] text-violet-400 font-bold tracking-normal uppercase">{puzzle.type}</span>
                              </div>

                              {puzzle.solved ? (
                                <span className="text-[10px] text-emerald-400 font-bold tracking-wide uppercase flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> DECRYPTED
                                </span>
                              ) : (
                                <span className="text-xs text-violet-200 font-bold tracking-wide uppercase flex items-center gap-2 group-hover:text-violet-100 transition-colors bg-violet-500/10 px-4 py-2 rounded-full border border-white/20 group-hover:bg-violet-500/20">
                                  INITIATE <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Challenges Inbox */}
                  {(challenges.incoming.length > 0 || challenges.outgoing.length > 0) && (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-sm font-bold flex items-center gap-3 text-violet-200 tracking-normal uppercase">
                          <div className="p-1.5 bg-red-500/10 rounded border border-red-500/20">
                            <Swords className="w-4 h-4 text-red-400" />
                          </div>
                          Agent Challenges
                        </h2>
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-red-500/20 to-transparent ml-4"></div>
                      </div>
                      <div className="space-y-3">
                        {challenges.incoming.map(c => (
                          <div key={c.id} className={`border rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-xl ${c.status === 'pending' ? 'border-red-500/30 bg-red-900/10' : 'border-white/20 bg-white/5 opacity-70'
                            }`}>
                            <div>
                              <p className="text-xs text-red-400 font-bold uppercase tracking-wider mb-1">Incoming Challenge</p>
                              <p className="font-bold text-white">{c.challenger_name} <span className="text-violet-400 font-normal">has challenged you to crack:</span></p>
                              <p className="text-sm text-violet-300 mt-1">{c.puzzle_data.title} <span className="text-violet-500 text-xs">({c.puzzle_data.difficulty})</span></p>
                              {c.status !== 'pending' && (
                                <div className="mt-2 flex gap-3">
                                  {c.results.map((r: any) => (
                                    <span key={r.username} className="text-xs text-violet-400">{r.username}: <span className="text-violet-200 font-bold">{r.score_earned} pts</span></span>
                                  ))}
                                </div>
                              )}
                            </div>
                            {c.status === 'pending' && !c.results.find((r: any) => r.user_id === user?.id) && (
                              <button
                                onClick={() => { setActiveChallenge(c); setView('challenge'); }}
                                className="flex-shrink-0 flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-bold text-xs px-5 py-2.5 rounded-xl transition-all uppercase tracking-wider"
                              >
                                <Swords className="w-4 h-4" /> ACCEPT
                              </button>
                            )}
                            {c.status !== 'pending' && <span className="text-[10px] text-violet-500 uppercase font-bold tracking-wider border border-white/20 px-3 py-1 rounded-full">{c.status}</span>}
                          </div>
                        ))}
                        {challenges.outgoing.filter(c => c.status !== 'completed').map(c => (
                          <div key={c.id} className="border border-white/20 bg-white/5 rounded-2xl p-5 flex items-center justify-between backdrop-blur-xl opacity-70">
                            <div>
                              <p className="text-xs text-violet-500 font-bold uppercase tracking-wider mb-1">Outgoing Challenge</p>
                              <p className="font-bold text-white">You challenged <span className="text-violet-300">{c.challenged_name}</span></p>
                              <p className="text-sm text-violet-400 mt-1">{c.puzzle_data.title}</p>
                            </div>
                            <span className="text-[10px] text-violet-500 uppercase font-bold tracking-wider border border-white/20 px-3 py-1 rounded-full">{c.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {view === 'challenge' && activeChallenge && (
                <motion.div
                  key="challenge"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="max-w-4xl mx-auto"
                >
                  <button
                    onClick={() => setView('dashboard')}
                    className="mb-6 flex items-center gap-2 text-violet-400 hover:text-violet-200 text-xs font-bold tracking-normal uppercase transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> BACK TO BRIEFING
                  </button>
                  <div className="border border-red-500/30 bg-red-900/10 backdrop-blur-3xl rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.1)] relative">
                    <div className="h-1 w-full bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50"></div>
                    <div className="p-6 border-b border-red-500/20 bg-black/20">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-1.5 bg-red-500/20 rounded border border-red-500/30">
                          <Swords className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                          <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Challenge from {activeChallenge.challenger_name}</p>
                          <h2 className="text-2xl font-black text-white">{activeChallenge.puzzle_data.title}</h2>
                        </div>
                      </div>
                    </div>
                    <div className="p-8">
                      <ChallengeSolver
                        challenge={activeChallenge}
                        onSolved={() => {
                          fetchChallenges();
                          checkSession();
                          setView('dashboard');
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {view === 'puzzle' && activePuzzle && (
                <motion.div
                  key="puzzle"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="max-w-4xl mx-auto"
                >
                  <button
                    onClick={() => setView('dashboard')}
                    className="mb-6 flex items-center gap-2 text-violet-400 hover:text-violet-200 text-xs font-bold tracking-normal uppercase transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> ABORT MISSION
                  </button>

                  <div className="border border-white/30 bg-white/5 backdrop-blur-3xl rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.1)] relative">
                    {/* Decorative Header Line */}
                    <div className="h-1 w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>

                    <div className="p-8 border-b border-white/10 bg-black/20">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-1.5 bg-violet-500/20 rounded border border-white/30">
                              <Terminal className="w-5 h-5 text-violet-300" />
                            </div>
                            <h2 className="text-2xl font-black text-white tracking-wide">{activePuzzle.title}</h2>
                          </div>
                          <p className="text-violet-400/70 text-sm font-bold tracking-normal uppercase">CLASSIFICATION: {activePuzzle.type}</p>
                        </div>
                        <span className={`text-xs px-4 py-2 rounded-full border font-bold tracking-wide uppercase shadow-inner ${activePuzzle.difficulty === 'Easy' ? 'border-blue-500/40 bg-blue-900/20 text-blue-400' :
                          activePuzzle.difficulty === 'Medium' ? 'border-amber-500/40 bg-amber-900/20 text-amber-400' :
                            'border-red-500/40 bg-red-900/20 text-red-400'
                          }`}>
                          {activePuzzle.difficulty} <span className="opacity-50 ml-1">x{activePuzzle.multiplier}</span>
                        </span>
                      </div>
                      <p className="text-violet-100/80 leading-relaxed font-light">{activePuzzle.description}</p>
                    </div>

                    <div className="p-8">
                      <PuzzleSolver
                        puzzle={activePuzzle}
                        onSolved={() => {
                          fetchPuzzles();
                          checkSession(); // refresh score
                          setView('dashboard');
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {view === 'leaderboard' && (
                <motion.div
                  key="leaderboard"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="max-w-4xl mx-auto"
                >
                  <div className="border border-white/20 bg-white/5 backdrop-blur-3xl rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                    <div className="p-6 border-b border-white/20 bg-black/20 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-violet-500/10 rounded-xl border border-white/30 relative overflow-hidden">
                          <div className="absolute inset-0 bg-violet-500/20 animate-pulse"></div>
                          <Globe className="w-6 h-6 text-violet-300 relative z-10" />
                        </div>
                        <div>
                          <h2 className="font-black text-xl text-white tracking-wide uppercase">Global Intelligence Network</h2>
                          <p className="text-[10px] text-violet-400 font-bold tracking-normal uppercase mt-1">Live Operative Rankings</p>
                        </div>
                      </div>
                    </div>

                    <div className="divide-y divide-white/10">
                      {leaderboard.map((u, i) => (
                        <div
                          key={i}
                          className={`p-6 flex items-center justify-between transition-colors relative overflow-hidden ${u.username === user.username ? 'bg-violet-900/20' : 'hover:bg-black/20'}`}
                        >
                          {u.username === user.username && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>
                          )}
                          <div className="flex items-center gap-6">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${i === 0 ? 'border-yellow-400/50 bg-yellow-400/10 text-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.3)]' :
                              i === 1 ? 'border-gray-300/50 bg-gray-300/10 text-gray-300' :
                                i === 2 ? 'border-amber-600/50 bg-amber-600/10 text-amber-500' :
                                  'border-white/10 bg-black/20 text-violet-500'
                              }`}>
                              <span className="font-black text-lg">{i + 1}</span>
                            </div>
                            <div>
                              <p className="font-bold text-lg text-white tracking-wide flex items-center gap-3">
                                {u.username}
                                {u.username === user.username && <span className="text-[10px] bg-violet-500/20 text-violet-200 px-2 py-0.5 rounded border border-white/30 tracking-wide uppercase">You</span>}
                              </p>
                              <p className="text-xs text-violet-500 font-bold tracking-normal uppercase mt-1">Lvl {u.level || 1} • {u.rank}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            {u.username !== user.username && (
                              <button
                                onClick={() => sendChallenge(u.id)}
                                disabled={challengeSending === u.id}
                                className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-[10px] px-4 py-2 rounded-xl transition-all uppercase tracking-wider disabled:opacity-50"
                              >
                                <Swords className="w-3.5 h-3.5" />
                                {challengeSending === u.id ? 'SENDING...' : 'CHALLENGE'}
                              </button>
                            )}
                            <div className="text-right bg-black/20 px-5 py-3 rounded-2xl border border-white/20 shadow-inner">
                              <p className="font-black text-2xl text-violet-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)] leading-none">{u.score}</p>
                              <p className="text-[9px] text-violet-500 tracking-normal font-bold uppercase mt-1">Intel Pts</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {leaderboard.length === 0 && (
                        <div className="p-16 flex flex-col items-center justify-center text-violet-500/50">
                          <Database className="w-12 h-12 mb-4 opacity-20" />
                          <p className="tracking-normal font-bold uppercase text-sm">No Operative Data Available</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      <AnimatePresence>
        {upgradeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            onClick={() => setUpgradeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-md w-full bg-gradient-to-b from-violet-950/90 to-black/90 border border-yellow-400/30 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(250,204,21,0.2)]"
            >
              <button onClick={() => setUpgradeModal(false)} className="absolute top-4 right-4 text-violet-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
              {/* Header */}
              <div className="p-8 text-center border-b border-yellow-400/20">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-400/10 border border-yellow-400/40 flex items-center justify-center shadow-[0_0_30px_rgba(250,204,21,0.3)]">
                  <Star className="w-8 h-8 text-yellow-400" />
                </div>
                <h2 className="text-2xl font-black text-white tracking-wide uppercase">MI5 OPERATIVE</h2>
                <p className="text-yellow-400 font-bold text-sm tracking-wide uppercase mt-1">PRO CLEARANCE</p>
                <div className="mt-4 flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-black text-white">$4.99</span>
                  <span className="text-violet-400 text-sm">/month</span>
                </div>
              </div>
              {/* Features */}
              <div className="p-8 space-y-3">
                {[
                  'Unlimited AI-generated challenges per day',
                  'Challenge any agent on the leaderboard, anytime',
                  '239+ static static puzzles + infinite AI variants',
                  'Priority access to new mission types',
                  'Pro badge on global leaderboard',
                ].map((feat, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-violet-200">
                    <CheckCircle2 className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
                <p className="text-[10px] text-violet-500 mt-2">Free tier: 3 AI challenges per day. Cancel anytime.</p>
              </div>
              {/* CTA */}
              <div className="px-8 pb-8">
                <button
                  onClick={handleUpgrade}
                  className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-black py-4 rounded-2xl transition-all shadow-[0_0_30px_rgba(250,204,21,0.4)] text-sm tracking-widest uppercase"
                >
                  UPGRADE TO PRO
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChallengeSolver({ challenge, onSolved }: { challenge: any; onSolved: () => void }) {
  const [answer, setAnswer] = useState('');
  const [status, setStatus] = useState<'idle' | 'checking' | 'correct' | 'incorrect'>('idle');
  const [scoreEarned, setScoreEarned] = useState(0);
  const [coloring, setColoring] = useState<Record<string, number>>({});

  const puzzle = challenge.puzzle_data;
  const puzzleDataParsed = typeof puzzle.puzzle_data === 'string' ? JSON.parse(puzzle.puzzle_data) : puzzle.puzzle_data;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submitAnswer = puzzle.type === 'map_coloring' ? JSON.stringify(coloring) : answer;
    if (!submitAnswer.trim()) return;

    setStatus('checking');
    const token = localStorage.getItem('mi5_token');
    try {
      const res = await fetch(`${API_BASE}/api/challenges/${challenge.id}/solve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ answer: submitAnswer })
      });
      const data = await res.json();
      if (data.correct) {
        setScoreEarned(data.scoreEarned);
        setStatus('correct');
        setTimeout(() => onSolved(), 3000);
      } else {
        setStatus('incorrect');
        setTimeout(() => setStatus('idle'), 2000);
      }
    } catch {
      setStatus('incorrect');
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-violet-100/80 leading-relaxed font-light">{puzzle.description}</p>

      {/* Puzzle Data Display */}
      {puzzle.type === 'substitution' && (
        <div className="bg-black/20 border border-white/10 p-6 rounded-xl font-sans text-xl tracking-wide text-center break-all shadow-inner">
          {puzzleDataParsed.encryptedText}
        </div>
      )}
      {puzzle.type === 'book' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-black/20 border border-white/10 p-4 rounded-xl text-sm leading-relaxed shadow-inner">
            {puzzleDataParsed.text?.split('\n').map((line: string, i: number) => (
              <div key={i} className="flex gap-4"><span className="text-violet-400 opacity-50 w-6 text-right">{i + 1}</span><span>{line}</span></div>
            ))}
          </div>
          <div className="bg-black/20 border border-white/10 p-4 rounded-xl shadow-inner">
            <h3 className="text-xs text-violet-400 mb-4">TARGET COORDINATES [LINE, WORD]</h3>
            {puzzleDataParsed.coordinates?.map((coord: number[], i: number) => (
              <div key={i} className="text-lg font-bold tracking-wide text-violet-300">[{coord[0]}, {coord[1]}]</div>
            ))}
          </div>
        </div>
      )}
      {puzzle.type === 'map_coloring' && (
        <div className="bg-black/40 border border-white/10 rounded-xl p-4 relative h-64 overflow-hidden shadow-inner">
          <svg className="w-full h-full absolute inset-0">
            {puzzleDataParsed.edges?.map((edge: string[], i: number) => {
              const n1 = puzzleDataParsed.nodes.find((n: any) => n.id === edge[0]);
              const n2 = puzzleDataParsed.nodes.find((n: any) => n.id === edge[1]);
              return <line key={i} x1={`${n1.x}%`} y1={`${n1.y}%`} x2={`${n2.x}%`} y2={`${n2.y}%`} stroke="rgba(239,68,68,0.3)" strokeWidth="2" />;
            })}
          </svg>
          {puzzleDataParsed.nodes?.map((node: any) => {
            const colorIdx = coloring[node.id] || 0;
            const colors = ['transparent', '#ef4444', '#3b82f6', '#22c55e', '#eab308'];
            return (
              <button key={node.id} type="button"
                onClick={() => setColoring({ ...coloring, [node.id]: (colorIdx + 1) % 5 })}
                className="absolute w-10 h-10 -ml-5 -mt-5 rounded-full border-2 border-red-500 flex items-center justify-center font-bold z-10"
                style={{ left: `${node.x}%`, top: `${node.y}%`, backgroundColor: colors[colorIdx], color: colorIdx === 0 ? '#ef4444' : '#000' }}
              >{node.id}</button>
            );
          })}
        </div>
      )}
      {/* Default: show raw puzzle data for AI-generated puzzles */}
      {!['substitution', 'book', 'map_coloring', 'scytale'].includes(puzzle.type) && (
        <div className="bg-black/20 border border-red-500/20 p-6 rounded-xl font-sans text-sm leading-relaxed shadow-inner text-violet-200">
          {typeof puzzleDataParsed === 'string' ? puzzleDataParsed : JSON.stringify(puzzleDataParsed, null, 2)}
        </div>
      )}

      {/* Answer Form */}
      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        {status === 'correct' ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <p className="text-emerald-400 font-bold text-lg">CHALLENGE COMPLETE</p>
            <p className="text-violet-400 text-sm mt-1">+{scoreEarned} Intel Points earned</p>
          </div>
        ) : (
          <>
            {puzzle.type !== 'map_coloring' && (
              <div className="mb-4">
                <label className="block text-[10px] text-red-400 font-bold tracking-normal uppercase mb-3 text-center">SUBMIT DECRYPTION KEY</label>
                <input
                  type="text"
                  required
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  disabled={status === 'checking'}
                  className={`w-full bg-black/20 border-2 rounded-xl py-4 px-4 text-xl text-center uppercase tracking-normal focus:outline-none transition-all shadow-inner font-sans ${status === 'incorrect' ? 'border-red-500/80 bg-red-900/20' : 'border-red-500/30 focus:border-red-400/60'
                    }`}
                  placeholder="..."
                />
              </div>
            )}
            <button
              type="submit"
              disabled={status === 'checking'}
              className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <Swords className="w-4 h-4" />
              {status === 'checking' ? 'VERIFYING...' : status === 'incorrect' ? 'INCORRECT — RETRY' : 'SUBMIT ANSWER'}
            </button>
          </>
        )}
      </form>
    </div>
  );
}

function Login({ onLogin }: { onLogin: () => void }) {

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [simulatedLink, setSimulatedLink] = useState('');

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/auth/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        const data = await res.json();
        setSimulatedLink(data.simulatedLink);
        setStatus('sent');
      } else {
        setStatus('error');
      }
    } catch (e) {
      setStatus('error');
    }
  };

  const handleSimulateClick = async () => {
    try {
      // Extract token from link
      const url = new URL(simulatedLink, window.location.origin);
      const token = url.searchParams.get('token');

      if (token) {
        const res = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        if (res.ok) {
          onLogin();
        } else {
          setStatus('error');
        }
      }
    } catch (e) {
      console.error("Failed to parse URL or verify token", e);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-white flex items-center justify-center font-sans p-4">
      <div className="max-w-md w-full border border-white/10 bg-black/40 backdrop-blur-2xl p-8 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative overflow-hidden">
        {/* Scanline effect */}
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20"></div>

        <div className="flex justify-center mb-8">
          <Shield className="w-16 h-16 text-violet-300" />
        </div>

        <h1 className="text-2xl font-bold text-center mb-2 tracking-wide">MI5 SECURE LOGIN</h1>
        <p className="text-center text-violet-400 text-sm mb-8">AUTHORIZED PERSONNEL ONLY</p>

        {status === 'idle' || status === 'error' ? (
          <form onSubmit={handleRequest} className="space-y-4 relative z-10">
            {status === 'error' && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> ACCESS DENIED. TRY AGAIN.
              </div>
            )}
            <div>
              <label className="block text-xs text-violet-400 mb-1">AGENT EMAIL</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-3 text-violet-300 focus:outline-none focus:border-violet-400/50 focus:bg-white/5 transition-all shadow-inner"
                placeholder="agent@mi5.gov.uk"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-violet-300 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            >
              <Send className="w-4 h-4" /> REQUEST ACCESS LINK
            </button>
          </form>
        ) : status === 'loading' ? (
          <div className="text-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="inline-block w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full mb-4"
            />
            <p>TRANSMITTING REQUEST...</p>
          </div>
        ) : (
          <div className="text-center space-y-6 relative z-10">
            <div className="bg-black/40 border border-white/10 p-4 rounded-xl shadow-inner">
              <p className="mb-2">MAGIC LINK TRANSMITTED TO:</p>
              <p className="font-bold text-violet-300">{email}</p>
            </div>

            <div className="border-t border-dashed border-white/20 pt-6">
              <p className="text-xs text-violet-400 mb-4">FOR PROTOTYPE PURPOSES, CLICK BELOW TO SIMULATE EMAIL VERIFICATION:</p>
              <button
                onClick={handleSimulateClick}
                className="w-full bg-violet-500 text-black font-bold py-3 rounded-xl hover:bg-violet-400 transition-all shadow-[0_0_20px_rgba(139,92,246,0.4)]"
              >
                SIMULATE EMAIL CLICK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PuzzleSolver({ puzzle, onSolved }: { puzzle: Puzzle, onSolved: () => void }) {
  const [answer, setAnswer] = useState('');
  const [status, setStatus] = useState<'idle' | 'checking' | 'correct' | 'incorrect'>('idle');
  const [resultData, setResultData] = useState<any>(null);

  const [coloring, setColoring] = useState<Record<string, number>>({});
  const [diameter, setDiameter] = useState(3);

  useEffect(() => {
    if (puzzle.type === 'map_coloring') {
      setAnswer(JSON.stringify(coloring));
    }
  }, [coloring, puzzle.type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;

    setStatus('checking');
    try {
      const token = localStorage.getItem('mi5_token');
      const res = await fetch(`/api/puzzles/${puzzle.id}/solve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ answer })
      });

      const data = await res.json();
      if (data.correct) {
        setStatus('correct');
        setResultData(data);
        setTimeout(() => {
          onSolved();
        }, 3000);
      } else {
        setStatus('incorrect');
        setTimeout(() => setStatus('idle'), 2000);
      }
    } catch (e) {
      setStatus('incorrect');
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  return (
    <div className="border border-white/10 bg-black/40 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <Terminal className="w-5 h-5" /> MISSION: {puzzle.title}
        </h2>
        <span className="text-xs px-2 py-1 rounded border border-violet-500/50 text-violet-300">
          DIFFICULTY: {puzzle.difficulty.toUpperCase()}
        </span>
      </div>

      <div className="p-6 sm:p-8">
        <div className="bg-black/20 border border-white/10 p-6 rounded-xl mb-8 font-sans text-lg leading-relaxed shadow-inner">
          {puzzle.description}
        </div>

        {puzzle.type === 'substitution' && (
          <div className="bg-black/20 border border-white/10 p-6 rounded-xl mb-8 font-sans text-xl tracking-wide text-center break-all shadow-inner">
            {puzzle.puzzle_data.encryptedText}
          </div>
        )}

        {puzzle.type === 'scytale' && (
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <label className="text-xs text-violet-400">CYLINDER DIAMETER: {diameter}</label>
              <input
                type="range"
                min="2"
                max={puzzle.puzzle_data.maxDiameter}
                value={diameter}
                onChange={e => setDiameter(parseInt(e.target.value))}
                className="flex-1 accent-green-500"
              />
            </div>
            <div className="bg-black/20 border border-white/10 p-6 rounded-xl font-sans text-xl text-center leading-loose tracking-wide shadow-inner">
              {Array.from({ length: Math.ceil(puzzle.puzzle_data.encryptedText.length / diameter) }).map((_, r) => (
                <div key={r}>
                  {Array.from({ length: diameter }).map((_, c) => puzzle.puzzle_data.encryptedText[c * Math.ceil(puzzle.puzzle_data.encryptedText.length / diameter) + r] || '').join(' ')}
                </div>
              ))}
            </div>
          </div>
        )}

        {puzzle.type === 'book' && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-black/20 border border-white/10 p-4 rounded-xl font-sans text-sm leading-relaxed shadow-inner">
              {puzzle.puzzle_data.text.split('\n').map((line: string, i: number) => (
                <div key={i} className="flex gap-4">
                  <span className="text-violet-400 opacity-50 w-6 text-right">{i + 1}</span>
                  <span>{line}</span>
                </div>
              ))}
            </div>
            <div className="bg-black/20 border border-white/10 p-4 rounded-xl shadow-inner">
              <h3 className="text-xs text-violet-400 mb-4">TARGET COORDINATES [LINE, WORD]</h3>
              <div className="space-y-2">
                {puzzle.puzzle_data.coordinates.map((coord: number[], i: number) => (
                  <div key={i} className="text-lg font-bold tracking-wide text-violet-300">
                    [{coord[0]}, {coord[1]}]
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {puzzle.type === 'map_coloring' && (
          <div className="mb-8 bg-black/40 border border-white/10 rounded-xl p-4 relative h-64 overflow-hidden shadow-inner">
            <svg className="w-full h-full absolute inset-0">
              {puzzle.puzzle_data.edges.map((edge: string[], i: number) => {
                const n1 = puzzle.puzzle_data.nodes.find((n: any) => n.id === edge[0]);
                const n2 = puzzle.puzzle_data.nodes.find((n: any) => n.id === edge[1]);
                return (
                  <line
                    key={i}
                    x1={`${n1.x}%`} y1={`${n1.y}%`}
                    x2={`${n2.x}%`} y2={`${n2.y}%`}
                    stroke="rgba(34, 197, 94, 0.3)"
                    strokeWidth="2"
                  />
                );
              })}
            </svg>
            {puzzle.puzzle_data.nodes.map((node: any) => {
              const colorIdx = coloring[node.id] || 0;
              const colors = ['transparent', '#ef4444', '#3b82f6', '#22c55e', '#eab308'];
              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => setColoring({ ...coloring, [node.id]: (colorIdx + 1) % 5 })}
                  className="absolute w-10 h-10 -ml-5 -mt-5 rounded-full border-2 border-violet-500 flex items-center justify-center font-bold transition-colors z-10"
                  style={{
                    left: `${node.x}%`,
                    top: `${node.y}%`,
                    backgroundColor: colors[colorIdx],
                    color: colorIdx === 0 ? '#22c55e' : '#000'
                  }}
                >
                  {node.id}
                </button>
              );
            })}
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-md mx-auto relative z-10">
          {puzzle.type !== 'map_coloring' && (
            <div className="mb-6">
              <label className="block text-[10px] text-violet-400 font-bold tracking-normal uppercase mb-3 text-center">INPUT DECRYPTION KEY</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Terminal className="w-5 h-5 text-violet-500 group-focus-within:text-violet-300 transition-colors" />
                </div>
                <input
                  type="text"
                  required
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  disabled={status === 'checking' || status === 'correct'}
                  className={`w-full bg-black/20 backdrop-blur-md border-2 rounded-xl py-4 pl-12 pr-4 text-xl text-center uppercase tracking-normal focus:outline-none transition-all shadow-inner font-sans ${status === 'incorrect' ? 'border-red-500/50 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]' :
                    status === 'correct' ? 'border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' :
                      'border-white/30 text-violet-200 focus:border-white/20 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    }`}
                  placeholder="AWAITING INPUT..."
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'checking' || status === 'correct' || (!answer.trim() && puzzle.type !== 'map_coloring')}
            className={`w-full font-black py-4 rounded-xl transition-all flex items-center justify-center gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.4)] tracking-normal uppercase ${status === 'correct' ? 'bg-emerald-500 text-[#050b14] shadow-[0_0_30px_rgba(16,185,129,0.5)] border-2 border-emerald-400' :
              status === 'incorrect' ? 'bg-red-500/20 text-red-400 border-2 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]' :
                'bg-violet-500 text-[#050b14] hover:bg-violet-400 border-2 border-white/20 disabled:opacity-50 hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:-translate-y-0.5'
              }`}
          >
            {status === 'idle' && (
              <>
                <Shield className="w-5 h-5" /> VERIFY SOLUTION
              </>
            )}
            {status === 'checking' && (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                  <Crosshair className="w-5 h-5" />
                </motion.div>
                ANALYZING...
              </>
            )}
            {status === 'correct' && (
              <>
                <CheckCircle2 className="w-5 h-5" /> ACCESS GRANTED
              </>
            )}
            {status === 'incorrect' && (
              <>
                <AlertTriangle className="w-5 h-5" /> ACCESS DENIED
              </>
            )}
          </button>
        </form>

        <AnimatePresence>
          {status === 'correct' && resultData && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="mt-8 text-center bg-emerald-900/20 border border-emerald-500/30 p-6 rounded-2xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <p className="text-2xl font-black text-emerald-400 mb-2 tracking-wide drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">MISSION ACCOMPLISHED</p>
              <p className="text-emerald-300 font-bold tracking-normal">+ {resultData.scoreEarned} INTEL POINTS</p>
              <p className="text-[10px] mt-6 text-emerald-500/70 tracking-normal uppercase animate-pulse">Establishing secure connection to Mission Control...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
