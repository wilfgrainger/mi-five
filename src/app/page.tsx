'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, Lock, Unlock, User, LogOut, Crosshair, 
  Terminal, ChevronRight, Globe, Database, ArrowLeft, 
  CheckCircle2, Swords, Radio, X, Star, Download, Upload
} from 'lucide-react';
import { useGameState, Puzzle, Challenge } from '@/contexts/GameStateContext';
import { PUZZLE_THEMES } from '@/lib/puzzles';
import Login from '@/components/Login';
import PuzzleSolver from '@/components/PuzzleSolver';
import ChallengeSolver from '@/components/ChallengeSolver';

export default function Home() {
  const { user, puzzles, leaderboard, challenges, logout, sendChallenge, exportDossier, importDossier } = useGameState();
  const [view, setView] = useState<'dashboard' | 'puzzle' | 'leaderboard' | 'challenge' | 'settings'>('dashboard');
  const [activePuzzle, setActivePuzzle] = useState<Puzzle | null>(null);
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [challengeSending, setChallengeSending] = useState<string | null>(null);
  const [upgradeModal, setUpgradeModal] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<string>('ALL');

  const filteredPuzzles = selectedTheme === 'ALL' 
    ? puzzles 
    : puzzles.filter(p => (p as any).theme === selectedTheme);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        importDossier(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-200 font-sans selection:bg-violet-500 selection:text-black overflow-hidden relative">
      <div className="scanline"></div>
      
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-900/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-900/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 flex flex-col h-screen">
        {/* Header */}
        <header className="border-b border-white/10 p-4 flex justify-between items-center bg-black/40 backdrop-blur-2xl">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-violet-500 blur-md opacity-20 rounded-full"></div>
              <div className="p-2.5 bg-slate-900/50 rounded-lg border border-white/20 relative z-10">
                <Shield className="w-6 h-6 text-violet-400" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white uppercase font-mono-spy">Q-BRANCH <span className="text-violet-500 font-light">//</span> TERMINAL</h1>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <p className="text-[10px] text-emerald-500 font-bold tracking-[0.2em] uppercase">Secure Connection Active</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block bg-black/20 px-4 py-2 rounded-xl border border-white/20 shadow-inner">
              <p className="text-sm font-bold text-white tracking-wide">{user.username}</p>
              <p className="text-[10px] text-violet-400 tracking-widest uppercase mt-1">Level {user.level || 1} | Rank: {user.rank} | Score: {user.score}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={exportDossier}
                className="p-2.5 rounded-full transition-all border hover:bg-emerald-500/10 text-emerald-400/70 hover:text-emerald-300 border-transparent hover:border-emerald-500/30"
                title="Export Dossier"
              >
                <Download className="w-5 h-5" />
              </button>
              <label className="p-2.5 rounded-full transition-all border hover:bg-blue-500/10 text-blue-400/70 hover:text-blue-300 border-transparent hover:border-blue-500/30 cursor-pointer" title="Import Dossier">
                <Upload className="w-5 h-5" />
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>
            </div>
            <button
              onClick={() => setUpgradeModal(true)}
              className="p-2.5 rounded-full transition-all border hover:bg-violet-500/10 text-violet-400/70 hover:text-violet-300 border-transparent hover:border-white/30"
              title="Contact Q-Branch"
            >
              <Radio className="w-5 h-5" />
            </button>
            <button
              onClick={logout}
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
            onClick={() => { setView('dashboard'); }}
            className={`flex-1 py-4 text-xs md:text-sm font-bold tracking-widest transition-all relative overflow-hidden uppercase ${view === 'dashboard' ? 'text-violet-200 bg-violet-900/20' : 'text-violet-500 hover:bg-violet-900/10 hover:text-violet-300'}`}
          >
            {view === 'dashboard' && <motion.div layoutId="nav-indicator" className="absolute bottom-0 left-0 right-0 h-1 bg-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.8)]" />}
            Operational Briefing
            {challenges.incoming.filter(c => c.status === 'pending').length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full">{challenges.incoming.filter(c => c.status === 'pending').length}</span>
            )}
          </button>
          <button
            onClick={() => { setView('leaderboard'); }}
            className={`flex-1 py-4 text-xs md:text-sm font-bold tracking-widest transition-all relative overflow-hidden uppercase ${view === 'leaderboard' ? 'text-violet-200 bg-violet-900/20' : 'text-violet-500 hover:bg-violet-900/10 hover:text-violet-300'}`}
          >
            {view === 'leaderboard' && <motion.div layoutId="nav-indicator" className="absolute bottom-0 left-0 right-0 h-1 bg-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.8)]" />}
            Global Network
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
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-blue-500/10 rounded-3xl blur-xl transition-all duration-500 group-hover:opacity-100 opacity-50"></div>
                    <div className="border border-white/20 bg-white/5 backdrop-blur-2xl p-8 rounded-3xl relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)]">

                      {/* Decorative Tech Elements */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-5 pointer-events-none"></div>
                      <div className="absolute top-4 right-4 flex gap-1">
                        <div className="w-1 h-1 bg-violet-500/50 rounded-full"></div>
                        <div className="w-1 h-1 bg-violet-500/50 rounded-full"></div>
                        <div className="w-1 h-1 bg-violet-500/50 rounded-full"></div>
                      </div>
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-violet-500/20 to-transparent"></div>

                      <div className="flex flex-col md:flex-row gap-8 items-start md:items-center relative z-10">
                        <div className="flex-shrink-0 relative">
                          <div className="w-24 h-24 rounded-2xl border-2 border-white/30 bg-black/20 flex items-center justify-center overflow-hidden relative">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                            <User className="w-10 h-10 text-violet-400/50" />
                            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-violet-900/50 to-transparent"></div>
                          </div>
                          <div className="absolute -bottom-2 -right-2 bg-violet-500 text-[#050b14] text-[10px] font-black px-2 py-1 rounded-md tracking-widest shadow-lg shadow-violet-500/20 uppercase">
                            00 Status
                          </div>
                        </div>

                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-6 w-full">
                          <div className="bg-black/20 p-4 rounded-2xl border border-white/10 relative overflow-hidden group-hover:border-white/30 transition-colors">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500/20"></div>
                            <p className="text-violet-500 text-[10px] mb-1 tracking-widest font-bold uppercase">Operative Alias</p>
                            <p className="text-xl font-bold text-white tracking-wide">{user.username}</p>
                          </div>
                          <div className="bg-black/20 p-4 rounded-2xl border border-white/10 relative overflow-hidden group-hover:border-white/30 transition-colors">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500/20"></div>
                            <p className="text-violet-500 text-[10px] mb-1 tracking-widest font-bold uppercase">Clearance Rank</p>
                            <p className="text-xl font-bold text-white tracking-wide">{user.rank}</p>
                          </div>
                          <div className="bg-black/20 p-4 rounded-2xl border border-white/10 relative overflow-hidden group-hover:border-white/30 transition-colors">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-pink-500/20"></div>
                            <p className="text-violet-500 text-[10px] mb-1 tracking-widest font-bold uppercase">Operative Level</p>
                            <p className="text-xl font-bold text-white tracking-wide">{user.level || 1}</p>
                          </div>
                          <div className="bg-black/20 p-4 rounded-2xl border border-white/10 relative overflow-hidden group-hover:border-white/30 transition-colors">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500/20"></div>
                            <p className="text-violet-500 text-[10px] mb-1 tracking-widest font-bold uppercase">Intelligence Rating</p>
                            <p className="text-2xl font-black text-violet-300 drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]">{user.score}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Theme Selector */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <button
                      onClick={() => setSelectedTheme('ALL')}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all border ${selectedTheme === 'ALL' ? 'bg-violet-500 text-black border-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.3)]' : 'bg-white/5 text-violet-500 border-white/10 hover:border-white/30'}`}
                    >
                      All Intelligence
                    </button>
                    {Object.entries(PUZZLE_THEMES).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedTheme(label)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all border ${selectedTheme === label ? 'bg-violet-500 text-black border-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.3)]' : 'bg-white/5 text-violet-500 border-white/10 hover:border-white/30'}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Missions Grid */}
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-sm font-bold flex items-center gap-3 text-violet-200 tracking-widest uppercase">
                        <div className="p-1.5 bg-violet-500/10 rounded border border-white/20">
                          <Crosshair className="w-4 h-4 text-violet-300" />
                        </div>
                        Active Field Assignments
                      </h2>
                      <div className="h-[1px] flex-1 bg-gradient-to-r from-violet-500/20 to-transparent ml-4"></div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {filteredPuzzles.map((puzzle) => (
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
                            : 'border-white/20 bg-white/5 hover:bg-white/5 hover:border-white/40 hover:-translate-y-1 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(139,92,246,0.15)]'
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
                                  <p className="text-[10px] text-violet-500 font-bold tracking-widest uppercase mt-0.5">File: {puzzle.id.substring(0, 8)}</p>
                                </div>
                              </div>

                              <span className={`text-[10px] px-3 py-1.5 rounded-full border font-bold tracking-widest uppercase ${puzzle.difficulty === 'Easy' ? 'border-blue-500/30 bg-blue-500/10 text-blue-400' :
                                puzzle.difficulty === 'Medium' ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' :
                                  'border-red-500/30 bg-red-500/10 text-red-400'
                                }`}>
                                {puzzle.difficulty} <span className="opacity-50 ml-1 font-black">x{puzzle.multiplier}</span>
                              </span>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-violet-100/60 mb-6 flex-1 leading-relaxed font-light">{puzzle.description}</p>

                            {/* Bottom Bar */}
                            <div className="flex justify-between items-center pt-4 border-t border-white/10">
                              <div className="flex items-center gap-2">
                                <Terminal className="w-3.5 h-3.5 text-violet-500" />
                                <span className="text-[10px] text-violet-400 font-bold tracking-widest uppercase">{puzzle.type}</span>
                              </div>

                              {puzzle.solved ? (
                                <span className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Decrypted
                                </span>
                              ) : (
                                <span className="text-xs text-violet-200 font-bold tracking-widest uppercase flex items-center gap-2 group-hover:text-violet-100 transition-colors bg-violet-500/10 px-4 py-2 rounded-full border border-white/20 group-hover:bg-violet-500/20">
                                  Initiate <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
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
                        <h2 className="text-sm font-bold flex items-center gap-3 text-violet-200 tracking-widest uppercase">
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
                              <p className="text-xs text-red-400 font-bold uppercase tracking-widest mb-1">Incoming Challenge</p>
                              <p className="font-bold text-white uppercase tracking-wide">{c.challenger_name} <span className="text-violet-400 font-normal normal-case">has challenged you to crack:</span></p>
                              <p className="text-sm text-violet-300 mt-1 font-bold">{c.puzzle_data.title} <span className="text-violet-500 text-xs font-normal">({c.puzzle_data.difficulty})</span></p>
                              {c.status !== 'pending' && (
                                <div className="mt-2 flex gap-3">
                                  {c.results.map((r: any) => (
                                    <span key={r.user_id} className="text-xs text-violet-400 uppercase tracking-widest">{r.username}: <span className="text-violet-200 font-bold">{r.score_earned} Pts</span></span>
                                  ))}
                                </div>
                              )}
                            </div>
                            {c.status === 'pending' && !c.results.find((r: any) => r.user_id === user?.id) && (
                              <button
                                onClick={() => { setActiveChallenge(c); setView('challenge'); }}
                                className="flex-shrink-0 flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-bold text-xs px-5 py-2.5 rounded-xl transition-all uppercase tracking-widest"
                              >
                                <Swords className="w-4 h-4" /> Accept
                              </button>
                            )}
                            {c.status !== 'pending' && <span className="text-[10px] text-violet-500 uppercase font-bold tracking-widest border border-white/20 px-3 py-1 rounded-full">{c.status}</span>}
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
                    className="mb-6 flex items-center gap-2 text-violet-400 hover:text-violet-200 text-xs font-bold tracking-widest uppercase transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Briefing
                  </button>
                  <div className="border border-red-500/30 bg-red-900/10 backdrop-blur-3xl rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.1)] relative">
                    <div className="h-1 w-full bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50"></div>
                    <div className="p-6 border-b border-red-500/20 bg-black/20">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-1.5 bg-red-500/20 rounded border border-red-500/30">
                          <Swords className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                          <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest">Challenge from {activeChallenge.challenger_name}</p>
                          <h2 className="text-2xl font-black text-white tracking-widest uppercase">{activeChallenge.puzzle_data.title}</h2>
                        </div>
                      </div>
                    </div>
                    <div className="p-8">
                      <ChallengeSolver
                        challenge={activeChallenge}
                        onSolved={() => {
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
                    className="mb-6 flex items-center gap-2 text-violet-400 hover:text-violet-200 text-xs font-bold tracking-widest uppercase transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Abort Mission
                  </button>

                  <PuzzleSolver
                    puzzle={activePuzzle}
                    onSolved={() => {
                      setView('dashboard');
                    }}
                  />
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
                          <h2 className="font-black text-xl text-white tracking-widest uppercase">Global Intelligence Network</h2>
                          <p className="text-[10px] text-violet-400 font-bold tracking-widest uppercase mt-1">Live Operative Rankings</p>
                        </div>
                      </div>
                    </div>

                    <div className="divide-y divide-white/10">
                      {leaderboard.map((u, i) => (
                        <div
                          key={u.id}
                          className={`p-6 flex items-center justify-between transition-colors relative overflow-hidden ${u.id === user.id ? 'bg-violet-900/20' : 'hover:bg-black/20'}`}
                        >
                          {u.id === user.id && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.8)]"></div>
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
                                {u.id === user.id && <span className="text-[10px] bg-violet-500/20 text-violet-200 px-2 py-0.5 rounded border border-white/30 tracking-widest uppercase">You</span>}
                              </p>
                              <p className="text-xs text-violet-500 font-bold tracking-widest uppercase mt-1">Lvl {u.level || 1} • {u.rank}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            {u.id !== user.id && (
                              <button
                                onClick={() => {
                                    sendChallenge(u.id);
                                    setChallengeSending(u.id);
                                    setTimeout(() => setChallengeSending(null), 1000);
                                }}
                                disabled={challengeSending === u.id}
                                className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-[10px] px-4 py-2 rounded-xl transition-all uppercase tracking-widest disabled:opacity-50"
                              >
                                <Swords className="w-3.5 h-3.5" />
                                {challengeSending === u.id ? 'Sending...' : 'Challenge'}
                              </button>
                            )}
                            <div className="text-right bg-black/20 px-5 py-3 rounded-2xl border border-white/20 shadow-inner">
                              <p className="font-black text-2xl text-violet-300 drop-shadow-[0_0_8px_rgba(139,92,246,0.5)] leading-none">{u.score}</p>
                              <p className="text-[9px] text-violet-500 tracking-widest font-bold uppercase mt-1">Intel Pts</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {leaderboard.length === 0 && (
                        <div className="p-16 flex flex-col items-center justify-center text-violet-500/50">
                          <Database className="w-12 h-12 mb-4 opacity-20" />
                          <p className="tracking-widest font-bold uppercase text-sm">No Operative Data Available</p>
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
                <h2 className="text-2xl font-black text-white tracking-widest uppercase">MI5 Operative</h2>
                <p className="text-yellow-400 font-bold text-sm tracking-widest uppercase mt-1">Pro Clearance</p>
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
                  '239+ static puzzles + infinite AI variants',
                  'Priority access to new mission types',
                  'Pro badge on global leaderboard',
                ].map((feat, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-violet-200">
                    <CheckCircle2 className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
                <p className="text-[10px] text-violet-500 mt-2 uppercase font-bold tracking-widest">Free tier: 3 AI challenges per day. Cancel anytime.</p>
              </div>
              {/* CTA */}
              <div className="px-8 pb-8">
                <button
                  onClick={() => setUpgradeModal(false)}
                  className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-black py-4 rounded-2xl transition-all shadow-[0_0_30px_rgba(250,204,21,0.4)] text-sm tracking-widest uppercase"
                >
                  Upgrade to Pro
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
