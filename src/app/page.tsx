'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, Lock, Unlock, User, LogOut, Crosshair, 
  Terminal, ChevronRight, Globe, Database, ArrowLeft, 
  CheckCircle2, Swords, Radio, X, Star, Download, Upload, RefreshCw
} from 'lucide-react';
import { useGameState, Puzzle, Challenge } from '@/contexts/GameStateContext';
import { PUZZLE_THEMES } from '@/lib/puzzles';
import Login from '@/components/Login';
import PuzzleSolver from '@/components/PuzzleSolver';
import ChallengeSolver from '@/components/ChallengeSolver';

export default function Home() {
  const { user, puzzles, leaderboard, challenges, logout, sendChallenge, exportDossier, importDossier, syncDatabase } = useGameState();
  const [view, setView] = useState<'dashboard' | 'puzzle' | 'leaderboard' | 'challenge' | 'settings'>('dashboard');
  const [activePuzzle, setActivePuzzle] = useState<Puzzle | null>(null);
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [challengeSending, setChallengeSending] = useState<string | null>(null);
  const [upgradeModal, setUpgradeModal] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<string>('ALL');

  const filteredPuzzles = selectedTheme === 'ALL' 
    ? puzzles 
    : puzzles.filter(p => (p as any).theme === selectedTheme);

  const getCount = (theme: string) => {
    if (theme === 'ALL') return puzzles.length;
    return puzzles.filter(p => (p as any).theme === theme).length;
  };

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
    <div className="min-h-screen bg-transparent text-slate-300 font-sans selection:bg-blue-500 selection:text-white overflow-hidden relative">
      <div className="scanline"></div>
      <div className="hud-vignette"></div>
      
      {/* Background depth elements */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[60%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 flex flex-col h-screen">
        {/* Header - Industrial Agency Style */}
        <header className="border-b border-white/5 p-3 flex justify-between items-center bg-[#0f1115]/90 backdrop-blur-xl">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600/10 border border-blue-500/30 rounded shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                <Shield className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h1 className="text-sm font-extrabold tracking-[0.25em] text-white font-technical glow-cia">CENTRAL_INTELLIGENCE // SIGINT</h1>
                <p className="text-[9px] text-blue-500/60 font-technical font-bold">Protocol: Secure_Terminal_v4.0.2</p>
              </div>
            </div>
            
            {/* System Monitor readout */}
            <div className="hidden lg:flex gap-4 border-l border-white/5 pl-6 items-center">
              <div className="flex flex-col">
                <span className="text-[8px] text-slate-500 font-technical font-bold uppercase">Uplink_Status</span>
                <span className="text-[10px] text-emerald-500 font-technical font-bold uppercase animate-pulse">Online</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] text-slate-500 font-technical font-bold uppercase">Encryption</span>
                <span className="text-[10px] text-blue-400 font-technical font-bold uppercase">AES-256-GCM</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={syncDatabase}
                className="p-2 text-slate-500 hover:text-blue-400 transition-colors"
                title="Sync Database"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={exportDossier}
                className="p-2 text-slate-500 hover:text-emerald-400 transition-colors"
                title="Backup Dossier"
              >
                <Download className="w-4 h-4" />
              </button>
              <label className="p-2 text-slate-500 hover:text-blue-400 transition-colors cursor-pointer" title="Restore Dossier">
                <Upload className="w-4 h-4" />
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>
            </div>
            
            <div className="h-8 w-[1px] bg-white/5 mx-2"></div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-bold text-white uppercase tracking-wider">{user.username}</p>
                <div className="flex gap-2 justify-end">
                  <span className="text-[8px] text-blue-500 font-technical">LVL_{user.level || 1}</span>
                  <span className="text-[8px] text-blue-500 font-technical">XP_{user.score}</span>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-2 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded transition-all border border-transparent hover:border-red-500/20"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Global Navigation - Professional Tabs */}
        <nav className="flex px-4 bg-[#0f1115]/50 border-b border-white/5">
          <button
            onClick={() => { setView('dashboard'); }}
            className={`px-6 py-3 text-[10px] font-technical font-bold transition-all relative ${view === 'dashboard' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
          >
            01_OPERATIONAL_FILES
            {challenges.incoming.filter(c => c.status === 'pending').length > 0 && (
              <span className="ml-2 px-1 bg-red-600 text-white text-[8px] rounded">!</span>
            )}
          </button>
          <button
            onClick={() => { setView('leaderboard'); }}
            className={`px-6 py-3 text-[10px] font-technical font-bold transition-all relative ${view === 'leaderboard' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
          >
            02_GLOBAL_ASSETS
          </button>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar relative">
          <div className="watermark opacity-[0.015]">CLASSIFIED_EYES_ONLY</div>
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              {view === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-10"
                >
                  {/* Agent Dossier - Identity Card Style */}
                  <div className="workstation-panel rounded-lg p-6 flex flex-col md:flex-row gap-8 items-center border-l-4 border-l-blue-600 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 -mr-16 -mt-16 rounded-full blur-2xl"></div>
                    
                    <div className="flex-shrink-0 relative">
                      <div className="w-24 h-24 rounded border border-white/10 bg-black/40 p-1">
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center relative overflow-hidden">
                          <User className="w-12 h-12 text-slate-600" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        </div>
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white text-[7px] font-technical font-black px-1.5 py-0.5 rounded shadow-lg">
                        LEVEL_{user.level || 1}
                      </div>
                    </div>

                    <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-8 w-full border-l border-white/5 pl-8">
                      <div>
                        <p className="text-[9px] text-slate-500 font-technical font-bold uppercase mb-1">Operative_Alias</p>
                        <p className="text-xl font-bold text-white tracking-tight leading-none uppercase">{user.username}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-500 font-technical font-bold uppercase mb-1">Clearance_Rank</p>
                        <p className="text-xl font-bold text-blue-400 tracking-tight leading-none uppercase">{user.rank}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-500 font-technical font-bold uppercase mb-1">Intel_Rating</p>
                        <p className="text-2xl font-black text-emerald-500 tracking-tighter leading-none">{user.score}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-500 font-technical font-bold uppercase mb-1">Status</p>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                          <p className="text-sm font-technical font-bold text-emerald-500/80 uppercase">Active_Duty</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section: Operational Theatres */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="h-[1px] w-8 bg-blue-500/40"></div>
                      <h2 className="text-[10px] font-technical font-bold text-blue-500 uppercase tracking-[0.3em]">Operational_Theatre_Selector</h2>
                      <div className="h-[1px] flex-1 bg-white/5"></div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedTheme('ALL')}
                        className={`px-4 py-2 text-[10px] font-technical font-bold transition-all border ${selectedTheme === 'ALL' ? 'bg-blue-600 text-white border-blue-500' : 'bg-white/5 text-slate-500 border-white/5 hover:border-white/10 hover:text-slate-300'}`}
                      >
                        ALL_INTEL ({getCount('ALL')})
                      </button>
                      {Object.entries(PUZZLE_THEMES).map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => setSelectedTheme(label)}
                          className={`px-4 py-2 text-[10px] font-technical font-bold transition-all border ${selectedTheme === label ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]' : 'bg-white/5 text-slate-500 border-white/5 hover:border-white/10 hover:text-slate-300'}`}
                        >
                          {key} ({getCount(label)})
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Section: Intelligence Files */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredPuzzles.map((puzzle) => (
                      <div
                        key={puzzle.id}
                        className={`workstation-panel workstation-panel-hover rounded p-5 cursor-pointer transition-all relative overflow-hidden group ${puzzle.solved ? 'opacity-40 grayscale' : ''}`}
                        onClick={() => {
                          if (!puzzle.solved) {
                            setActivePuzzle(puzzle);
                            setView('puzzle');
                          }
                        }}
                      >
                        <div className="flex justify-between items-start mb-6">
                          <div className={`p-1.5 border rounded ${puzzle.solved ? 'border-emerald-500/20 text-emerald-500' : 'border-white/10 text-slate-500'}`}>
                            {puzzle.solved ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          </div>
                          <div className="text-right">
                            <p className="text-[8px] font-technical text-slate-500 uppercase tracking-widest leading-none mb-1">Classification</p>
                            <span className={`text-[9px] font-technical font-bold uppercase ${puzzle.difficulty === 'Easy' ? 'text-emerald-500' : puzzle.difficulty === 'Medium' ? 'text-warning' : 'text-red-500'}`}>
                              {puzzle.difficulty}_PRIORITY
                            </span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h3 className="font-extrabold text-white text-xs uppercase tracking-wider group-hover:text-blue-400 transition-colors leading-tight">
                            {puzzle.title}
                          </h3>
                          <div className="h-12 overflow-hidden">
                            <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed font-medium group-hover:text-slate-400">
                              {puzzle.description}
                            </p>
                          </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
                          <span className="text-[8px] font-technical text-slate-600">ID_{puzzle.id.toUpperCase()}</span>
                          {!puzzle.solved && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-technical font-bold text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">Initiate_Decrypt</span>
                              <ChevronRight className="w-3 h-3 text-blue-500 group-hover:translate-x-1 transition-transform" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
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
