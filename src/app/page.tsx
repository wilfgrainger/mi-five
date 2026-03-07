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
                    <div className="space-y-6 text-slate-300">
                      <div className="flex items-center gap-4">
                        <div className="h-[1px] w-8 bg-red-500/40"></div>
                        <h2 className="text-[10px] font-technical font-bold text-red-500 uppercase tracking-[0.3em]">Intercepted_Challenges_Queue</h2>
                        <div className="h-[1px] flex-1 bg-white/5"></div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4">
                        {challenges.incoming.map(c => (
                          <div key={c.id} className={`workstation-panel rounded p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden ${c.status === 'pending' ? 'border-l-4 border-l-red-600' : 'opacity-50 grayscale'}`}>
                            {c.status === 'pending' && <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 -mr-16 -mt-16 rounded-full blur-2xl"></div>}
                            
                            <div className="flex items-center gap-6 relative z-10">
                              <div className={`p-3 rounded border ${c.status === 'pending' ? 'border-red-500/20 bg-red-600/10' : 'border-white/5 bg-black/40'}`}>
                                <Swords className={`w-6 h-6 ${c.status === 'pending' ? 'text-red-500 animate-pulse' : 'text-slate-600'}`} />
                              </div>
                              <div>
                                <p className="text-[8px] font-technical font-black text-red-500/60 uppercase tracking-widest mb-1">Source: {c.challenger_name}</p>
                                <p className="text-white font-bold text-sm uppercase tracking-tight">Direct_Encryption_Challenge</p>
                                <div className="flex gap-3 mt-2">
                                  <span className="text-[9px] font-technical text-slate-500">MISSION: {c.puzzle_data.title}</span>
                                  <span className="text-slate-700">|</span>
                                  <span className="text-[9px] font-technical text-slate-500">CLASS: {c.puzzle_data.difficulty}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 relative z-10 w-full sm:w-auto">
                              {c.status === 'pending' ? (
                                <button
                                  onClick={() => { setActiveChallenge(c); setView('challenge'); }}
                                  className="w-full sm:w-auto bg-red-600 hover:bg-red-500 text-white font-technical font-black text-[10px] px-8 py-3 rounded transition-all uppercase tracking-widest shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                                >
                                  Accept_Bypass
                                </button>
                              ) : (
                                <div className="text-right">
                                  <p className="text-[8px] font-technical text-slate-600 uppercase mb-1">Status</p>
                                  <span className="text-[10px] font-technical font-bold text-slate-400 uppercase border border-white/5 px-3 py-1 rounded bg-black/40">{c.status}</span>
                                </div>
                              )}
                            </div>
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
                  className="max-w-5xl mx-auto"
                >
                  <button
                    onClick={() => setView('dashboard')}
                    className="mb-8 flex items-center gap-3 text-slate-500 hover:text-red-500 text-[10px] font-technical font-bold uppercase transition-colors group"
                  >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
                    Terminate_Bypass_Session
                  </button>
                  <div className="workstation-panel rounded-lg overflow-hidden border-t-2 border-t-red-600 shadow-2xl relative">
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
                  className="max-w-5xl mx-auto"
                >
                  <button
                    onClick={() => setView('dashboard')}
                    className="mb-8 flex items-center gap-3 text-slate-500 hover:text-blue-400 text-[10px] font-technical font-bold uppercase transition-colors group"
                  >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
                    Return_to_Operational_Files
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
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="max-w-5xl mx-auto space-y-8"
                >
                  <div className="workstation-panel rounded-lg overflow-hidden border-t-2 border-t-blue-600 shadow-2xl">
                    <div className="p-6 border-b border-white/5 bg-black/40 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-blue-600/10 rounded border border-blue-500/20">
                          <Globe className="w-6 h-6 text-blue-500 animate-pulse-soft" />
                        </div>
                        <div>
                          <h2 className="font-black text-lg text-white tracking-widest uppercase font-technical leading-none">Global_Intelligence_Network</h2>
                          <p className="text-[9px] text-blue-500/60 font-technical font-bold uppercase mt-2 tracking-tighter">Live_Operative_Registry // Verified_Assets_Only</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded border border-white/5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[9px] font-technical font-bold text-slate-500 uppercase">Uplink_Encrypted</span>
                      </div>
                    </div>

                    <div className="divide-y divide-white/5 bg-black/20">
                      <div className="grid grid-cols-12 p-4 text-[8px] font-technical font-black text-slate-600 uppercase tracking-[0.2em]">
                        <div className="col-span-1 pl-4">Pos</div>
                        <div className="col-span-5">Operative_Identifier</div>
                        <div className="col-span-3">Classification</div>
                        <div className="col-span-3 text-right pr-4">Intel_Yield</div>
                      </div>
                      
                      {leaderboard.map((u, i) => (
                        <div
                          key={u.id}
                          className={`grid grid-cols-12 p-6 items-center transition-all relative overflow-hidden group ${u.id === user.id ? 'bg-blue-600/5' : 'hover:bg-white/[0.02]'}`}
                        >
                          {u.id === user.id && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                          )}
                          
                          <div className="col-span-1 pl-4">
                            <span className={`text-lg font-black font-technical ${i === 0 ? 'text-warning glow-amber' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-orange-600' : 'text-slate-600'}`}>
                              {String(i + 1).padStart(2, '0')}
                            </span>
                          </div>
                          
                          <div className="col-span-5 flex items-center gap-4">
                            <div className={`w-10 h-10 rounded border ${u.id === user.id ? 'border-blue-500/30' : 'border-white/5'} bg-black/40 flex items-center justify-center relative overflow-hidden`}>
                              <User className={`w-5 h-5 ${u.id === user.id ? 'text-blue-400' : 'text-slate-700'}`} />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                            </div>
                            <div>
                              <p className="font-bold text-sm text-white tracking-tight flex items-center gap-3 uppercase">
                                {u.username}
                                {u.id === user.id && <span className="text-[7px] font-technical bg-blue-600 text-white px-1.5 py-0.5 rounded tracking-tighter">YOU</span>}
                              </p>
                              <p className="text-[8px] text-slate-600 font-technical uppercase mt-1 tracking-tighter leading-none">ID_{u.id.substring(0,8).toUpperCase()}</p>
                            </div>
                          </div>
                          
                          <div className="col-span-3">
                            <p className="text-[10px] font-technical font-black text-blue-500/80 uppercase">{u.rank}</p>
                            <p className="text-[8px] text-slate-600 font-technical mt-1 uppercase tracking-tighter">LVL_{u.level || 1}</p>
                          </div>
                          
                          <div className="col-span-3 text-right pr-4">
                            <div className="inline-block bg-black/40 px-4 py-2 rounded border border-white/5 group-hover:border-blue-500/20 transition-colors">
                              <p className="font-black text-xl text-emerald-500 tracking-tighter leading-none">{u.score}</p>
                              <p className="text-[7px] text-slate-600 font-technical uppercase mt-1 tracking-widest font-black leading-none">Yield_PTS</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {leaderboard.length === 0 && (
                        <div className="p-24 flex flex-col items-center justify-center text-slate-700 opacity-20">
                          <Database className="w-16 h-16 mb-6" />
                          <p className="font-technical font-black uppercase text-xs tracking-[0.4em]">No_Registry_Data</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* System Footer Readout */}
                  <div className="flex justify-between items-center px-4 opacity-30">
                    <div className="flex gap-8">
                      <div className="flex flex-col">
                        <span className="text-[7px] font-technical font-black uppercase text-slate-500">Node_Sync</span>
                        <span className="text-[9px] font-technical font-bold text-emerald-500">STABLE</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[7px] font-technical font-black uppercase text-slate-500">Registry_Size</span>
                        <span className="text-[9px] font-technical font-bold text-blue-400">{leaderboard.length}_ASSETS</span>
                      </div>
                    </div>
                    <p className="text-[7px] font-technical font-black uppercase text-slate-500">Access_Log: [0x7F_SESSION_ACTIVE]</p>
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
