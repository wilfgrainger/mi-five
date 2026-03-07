'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, Lock, Unlock, User, LogOut, Crosshair, 
  Terminal, ChevronRight, Globe, Database, ArrowLeft, 
  CheckCircle2, Swords, RefreshCw, Download, Upload, Cpu
} from 'lucide-react';
import { useGameState, Puzzle, Challenge } from '@/contexts/GameStateContext';
import { PUZZLE_THEMES } from '@/lib/puzzles';
import Login from '@/components/Login';
import PuzzleSolver from '@/components/PuzzleSolver';
import ChallengeSolver from '@/components/ChallengeSolver';

export default function Home() {
  const { user, puzzles, leaderboard, challenges, logout, sendChallenge, exportDossier, importDossier, syncDatabase } = useGameState();
  const [view, setView] = useState<'dashboard' | 'puzzle' | 'leaderboard' | 'challenge'>('dashboard');
  const [activePuzzle, setActivePuzzle] = useState<Puzzle | null>(null);
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
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
    <div className="min-h-screen bg-[#0a0a0c] text-slate-300 font-sans selection:bg-blue-500 selection:text-white overflow-hidden relative">
      <div className="scanline"></div>
      <div className="hud-vignette"></div>
      
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[60%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 flex flex-col h-screen">
        {/* Header - Global Intelligence Authority Style */}
        <header className="border-b border-white/5 p-3 flex justify-between items-center bg-[#0f1115]/95 backdrop-blur-2xl">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-blue-600/10 border border-blue-500/30 rounded shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                <Shield className="w-5 h-5 text-blue-500" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-sm font-black tracking-[0.3em] text-white font-technical glow-cia">INTELLIGENCE_AUTHORITY // NODE_01</h1>
                <p className="text-[8px] text-blue-500/60 font-technical font-bold tracking-widest mt-0.5">ESTABLISHED_SECURE_TUNNEL // 0xAF92</p>
              </div>
            </div>
            
            <div className="hidden xl:flex gap-6 border-l border-white/5 pl-8 items-center opacity-60">
              <div className="flex flex-col">
                <span className="text-[7px] text-slate-500 font-technical font-bold">CORE_LINK</span>
                <span className="text-[10px] text-emerald-500 font-technical font-bold animate-pulse">ENCRYPTED</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[7px] text-slate-500 font-technical font-bold">SYSTEM_LOAD</span>
                <div className="w-16 h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                  <div className="w-1/3 h-full bg-blue-500/40"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <button onClick={syncDatabase} className="p-2 text-slate-500 hover:text-blue-400 transition-colors" title="Sync Intelligence DB"><RefreshCw className="w-4 h-4" /></button>
              <button onClick={exportDossier} className="p-2 text-slate-500 hover:text-emerald-400 transition-colors" title="Export Secure Dossier"><Download className="w-4 h-4" /></button>
              <label className="p-2 text-slate-500 hover:text-blue-400 transition-colors cursor-pointer" title="Import External Dossier">
                <Upload className="w-4 h-4" />
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>
            </div>
            
            <div className="h-8 w-[1px] bg-white/5 mx-2"></div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-[10px] font-black text-white uppercase tracking-[0.1em]">{user.username}</p>
                <p className="text-[8px] text-blue-500 font-technical font-bold leading-none mt-1 uppercase">{user.rank} // CL_0{user.level || 1}</p>
              </div>
              <button onClick={logout} className="p-2.5 hover:bg-red-600/10 text-slate-500 hover:text-red-500 rounded-lg transition-all border border-transparent hover:border-red-600/20 shadow-inner"><LogOut className="w-4 h-4" /></button>
            </div>
          </div>
        </header>

        {/* System Navigation Tabs */}
        <nav className="flex px-6 bg-[#0f1115]/60 border-b border-white/5 overflow-x-auto no-scrollbar scroll-smooth">
          {[
            { id: 'dashboard', label: 'OPERATIONAL_FILES', key: '01' },
            { id: 'leaderboard', label: 'GLOBAL_ASSETS', key: '02' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id as any)}
              className={`px-8 py-4 text-[10px] font-technical font-black transition-all relative whitespace-nowrap tracking-widest ${view === tab.id ? 'text-blue-400 border-b-2 border-blue-500 bg-blue-500/5' : 'text-slate-600 hover:text-slate-300 hover:bg-white/[0.02]'}`}
            >
              <span className="opacity-40 mr-2">{tab.key}_</span>{tab.label}
              {tab.id === 'dashboard' && challenges.incoming.filter(c => c.status === 'pending').length > 0 && (
                <span className="ml-3 px-1.5 py-0.5 bg-red-600 text-white text-[8px] rounded-sm animate-pulse font-black shadow-[0_0_10px_rgba(239,68,68,0.4)]">CRITICAL</span>
              )}
            </button>
          ))}
        </nav>

        {/* Main View Port */}
        <main className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar relative">
          <div className="watermark opacity-[0.012] select-none">AUTHORIZED_PERSONNEL_ONLY_RESTRICTED_ACCESS</div>
          
          <div className="max-w-7xl mx-auto pb-20">
            <AnimatePresence mode="wait">
              {view === 'dashboard' && (
                <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
                  
                  {/* High-Fidelity Agent Card */}
                  <div className="workstation-panel rounded-lg p-8 flex flex-col lg:flex-row gap-10 items-center border-l-4 border-l-blue-600 relative overflow-hidden group shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/[0.03] -mr-32 -mt-32 rounded-full blur-[80px]"></div>
                    
                    <div className="flex-shrink-0 relative">
                      <div className="w-28 h-28 rounded-lg border-2 border-white/5 bg-slate-900/80 p-1 relative group-hover:border-blue-500/30 transition-colors">
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center relative overflow-hidden rounded">
                          <User className="w-14 h-14 text-slate-700" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                        </div>
                      </div>
                      <div className="absolute -bottom-3 -right-3 bg-blue-600 text-white text-[8px] font-technical font-black px-2 py-1 rounded shadow-[0_4px_15px_rgba(59,130,246,0.4)] tracking-tighter uppercase">ACCESS_LEVEL_{user.level || 1}</div>
                    </div>

                    <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-10 w-full md:border-l md:border-white/5 md:pl-10">
                      <div>
                        <p className="text-[10px] text-slate-600 font-technical font-black uppercase mb-2 tracking-widest">Operative_Identifier</p>
                        <p className="text-2xl font-black text-white tracking-tight leading-none uppercase drop-shadow-md">{user.username}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-600 font-technical font-black uppercase mb-2 tracking-widest">Clearance_Classification</p>
                        <p className="text-2xl font-black text-blue-500/90 tracking-tight leading-none uppercase">{user.rank}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-600 font-technical font-black uppercase mb-2 tracking-widest">Current_Intelligence_Yield</p>
                        <p className="text-3xl font-black text-emerald-500 tracking-tighter leading-none glow-secure">{user.score}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-600 font-technical font-black uppercase mb-2 tracking-widest">Uplink_Status</p>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                          <p className="text-sm font-technical font-black text-emerald-500/90 uppercase tracking-tighter">Active_Deployment</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Operational Theatres (Themes) */}
                  <div className="space-y-8 pt-4">
                    <div className="flex items-center gap-6">
                      <h2 className="text-[11px] font-technical font-black text-blue-500 uppercase tracking-[0.4em] whitespace-nowrap opacity-80">Operational_Theatre_Registry</h2>
                      <div className="h-[1px] flex-1 bg-gradient-to-r from-blue-500/20 via-white/5 to-transparent"></div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      <button 
                        onClick={() => setSelectedTheme('ALL')} 
                        className={`px-6 py-2.5 text-[10px] font-technical font-black border-2 transition-all rounded uppercase tracking-widest ${selectedTheme === 'ALL' ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.3)]' : 'bg-[#0f1115] text-slate-600 border-white/5 hover:border-blue-500/30 hover:text-blue-400'}`}
                      >
                        [ ALL_DATA_FILES // {getCount('ALL')} ]
                      </button>
                      {Object.entries(PUZZLE_THEMES).map(([key, label]) => (
                        <button 
                          key={key} 
                          onClick={() => setSelectedTheme(label)} 
                          className={`px-6 py-2.5 text-[10px] font-technical font-black border-2 transition-all rounded uppercase tracking-widest ${selectedTheme === label ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.3)]' : 'bg-[#0f1115] text-slate-600 border-white/5 hover:border-blue-500/30 hover:text-blue-400'}`}
                        >
                          [ {key} // {getCount(label)} ]
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mission Files Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredPuzzles.map((puzzle) => (
                      <div 
                        key={puzzle.id} 
                        className={`workstation-panel workstation-panel-hover rounded-lg p-6 cursor-pointer transition-all relative overflow-hidden group flex flex-col h-full border-t-2 ${puzzle.solved ? 'opacity-30 grayscale border-t-emerald-900/20' : 'border-t-blue-600/40 hover:border-t-blue-500 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.4)]'}`} 
                        onClick={() => !puzzle.solved && (setActivePuzzle(puzzle), setView('puzzle'))}
                      >
                        <div className="flex justify-between items-start mb-8">
                          <div className={`p-2 border rounded shadow-inner ${puzzle.solved ? 'border-emerald-900/20 text-emerald-900' : 'border-blue-500/20 bg-blue-500/5 text-blue-500'}`}>
                            {puzzle.solved ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                          </div>
                          <div className="text-right">
                            <p className="text-[7px] font-technical text-slate-600 uppercase tracking-widest font-black mb-1">Classification_Priority</p>
                            <span className={`text-[9px] font-technical font-black uppercase px-2 py-0.5 rounded border ${puzzle.difficulty === 'Easy' ? 'border-emerald-500/20 text-emerald-500 bg-emerald-500/5' : puzzle.difficulty === 'Medium' ? 'border-warning/20 text-warning bg-warning/5' : 'border-red-500/20 text-red-500 bg-red-500/5'}`}>
                              {puzzle.difficulty}_SENSITIVE
                            </span>
                          </div>
                        </div>

                        <div className="space-y-4 flex-1">
                          <h3 className="font-black text-white text-[13px] uppercase tracking-wider group-hover:text-blue-400 transition-colors leading-tight">
                            {puzzle.title}
                          </h3>
                          <div className="h-16 overflow-hidden">
                            <p className="text-[11px] text-slate-500 line-clamp-3 leading-relaxed font-medium group-hover:text-slate-400">
                              {puzzle.description}
                            </p>
                          </div>
                        </div>

                        <div className="mt-8 pt-5 border-t border-white/5 flex justify-between items-center relative z-10">
                          <div className="flex flex-col">
                            <span className="text-[7px] font-technical text-slate-700 font-black">REGISTRY_ID</span>
                            <span className="text-[9px] font-technical text-slate-500 font-bold uppercase tracking-tighter">0x_{puzzle.id.toUpperCase()}</span>
                          </div>
                          {!puzzle.solved && (
                            <div className="flex items-center gap-2 group-hover:translate-x-1 transition-transform bg-blue-600/5 px-3 py-1.5 rounded border border-blue-500/10">
                              <span className="text-[9px] font-technical font-black text-blue-500 uppercase tracking-widest">Execute_Decrypt</span>
                              <ChevronRight className="w-3.5 h-3.5 text-blue-500" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Intercepted Challenges */}
                  {(challenges.incoming.length > 0 || challenges.outgoing.length > 0) && (
                    <div className="space-y-10 pt-16 border-t border-white/5">
                      <div className="flex items-center gap-6">
                        <h2 className="text-[11px] font-technical font-black text-red-500 uppercase tracking-[0.4em] whitespace-nowrap opacity-80">Critical_Intelligence_Directives</h2>
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-red-500/20 via-white/5 to-transparent"></div>
                      </div>
                      <div className="grid grid-cols-1 gap-6">
                        {challenges.incoming.map(c => (
                          <div key={c.id} className={`workstation-panel rounded-lg p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-10 relative overflow-hidden transition-all border-l-4 ${c.status === 'pending' ? 'border-l-red-600 bg-red-600/[0.02] shadow-[0_0_40px_rgba(239,68,68,0.05)]' : 'opacity-40 grayscale border-l-white/5'}`}>
                            <div className="flex items-center gap-8 relative z-10">
                              <div className={`p-4 rounded border-2 shadow-inner ${c.status === 'pending' ? 'border-red-600/20 bg-red-600/10' : 'border-white/10'}`}>
                                <Swords className={`w-8 h-8 ${c.status === 'pending' ? 'text-red-500 animate-pulse' : 'text-slate-700'}`} />
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                  <p className="text-[9px] font-technical font-black text-red-500/60 uppercase tracking-[0.2em]">Source_Node: {c.challenger_name}</p>
                                  <div className="w-1 h-1 rounded-full bg-red-500/40"></div>
                                  <span className="text-[8px] font-technical text-slate-600 uppercase">PRIORITY_ALPHA</span>
                                </div>
                                <p className="text-white font-black text-lg uppercase tracking-tight leading-none">Direct_Override_Challenge</p>
                                <div className="flex items-center gap-4 pt-1">
                                  <span className="text-[10px] font-technical text-slate-500 font-bold">TARGET: {c.puzzle_data.title}</span>
                                  <span className="text-slate-800">|</span>
                                  <span className="text-[10px] font-technical text-slate-500 font-bold uppercase tracking-tighter">DATA_TYPE: ENCRYPTED_STREAM</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-6 relative z-10 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-white/5 pt-6 sm:pt-0 sm:pl-10">
                              {c.status === 'pending' ? (
                                <button onClick={() => (setActiveChallenge(c), setView('challenge'))} className="w-full sm:w-auto bg-red-600 hover:bg-red-500 text-white font-technical font-black text-[11px] px-10 py-4 rounded uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(239,68,68,0.25)] transition-all hover:scale-[1.02] active:scale-[0.98]">Authorize_Bypass</button>
                              ) : (
                                <div className="text-right">
                                  <p className="text-[8px] font-technical text-slate-600 uppercase font-black tracking-widest mb-2 text-center">Status_Log</p>
                                  <span className="text-[11px] font-technical font-black text-slate-400 uppercase border border-white/10 px-4 py-2 rounded bg-black/60 block">{c.status}_RESOLVED</span>
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

              {view === 'leaderboard' && (
                <motion.div key="leaderboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-5xl mx-auto space-y-10">
                  <div className="workstation-panel rounded-lg overflow-hidden border-t-4 border-t-blue-600 shadow-[0_0_60px_rgba(0,0,0,0.6)] relative">
                    <div className="watermark opacity-[0.01] pointer-events-none">REGISTRY_DATABASE_INTERNAL</div>
                    <div className="p-8 border-b border-white/5 bg-black/40 flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-6">
                        <div className="p-3 bg-blue-600/10 border border-blue-500/30 rounded"><Globe className="w-7 h-7 text-blue-500 animate-pulse-soft" /></div>
                        <div>
                          <h2 className="font-black text-xl text-white tracking-[0.2em] uppercase font-technical leading-none">Global_Asset_Registry</h2>
                          <p className="text-[10px] text-blue-500/60 font-technical font-bold uppercase mt-3 tracking-widest">Node_Synchronization: ONLINE // Data_Integrity: VERIFIED</p>
                        </div>
                      </div>
                      <div className="hidden md:flex items-center gap-4 bg-black/60 px-5 py-2.5 rounded-lg border border-white/10 shadow-inner">
                        <Cpu className="w-4 h-4 text-slate-600" />
                        <span className="text-[9px] font-technical font-black text-slate-500 tracking-[0.2em] uppercase">Compute_Cluster_Delta</span>
                      </div>
                    </div>
                    <div className="divide-y divide-white/5 bg-black/20 relative z-10">
                      <div className="grid grid-cols-12 p-5 text-[9px] font-technical font-black text-slate-600 uppercase tracking-[0.25em] bg-black/40">
                        <div className="col-span-1 pl-6">IDX</div>
                        <div className="col-span-5">Operative_Handshake</div>
                        <div className="col-span-3">Assigned_Classification</div>
                        <div className="col-span-3 text-right pr-8">Total_Intel_Yield</div>
                      </div>
                      {leaderboard.map((u, i) => (
                        <div key={u.id} className={`grid grid-cols-12 p-8 items-center transition-all relative overflow-hidden group ${u.id === user.id ? 'bg-blue-600/[0.03]' : 'hover:bg-white/[0.015]'}`}>
                          {u.id === user.id && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.6)]"></div>}
                          <div className="col-span-1 pl-6"><span className={`text-xl font-black font-technical leading-none ${i === 0 ? 'text-warning glow-amber' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-orange-700' : 'text-slate-700'}`}>{String(i + 1).padStart(2, '0')}</span></div>
                          <div className="col-span-5 flex items-center gap-6">
                            <div className={`w-14 h-14 rounded border-2 shadow-inner ${u.id === user.id ? 'border-blue-500/30 bg-blue-900/10' : 'border-white/5 bg-black/40'} flex items-center justify-center relative overflow-hidden`}>
                              <User className={`w-7 h-7 ${u.id === user.id ? 'text-blue-400' : 'text-slate-700'} opacity-60`} />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            </div>
                            <div>
                              <p className="font-black text-[15px] text-white tracking-tight uppercase flex items-center gap-3">
                                {u.username}
                                {u.id === user.id && <span className="text-[8px] font-technical font-black bg-blue-600 text-white px-2 py-0.5 rounded shadow-[0_0_10px_rgba(59,130,246,0.3)]">SELF</span>}
                              </p>
                              <p className="text-[9px] text-slate-600 font-technical font-bold uppercase mt-2 tracking-tighter leading-none">NODE_ACCESS_ID: 0x_{u.id.substring(0,12).toUpperCase()}</p>
                            </div>
                          </div>
                          <div className="col-span-3">
                            <p className="text-[11px] font-technical font-black text-blue-500 uppercase tracking-widest">{u.rank}</p>
                            <p className="text-[9px] text-slate-600 font-technical mt-2 uppercase font-black opacity-60">Classification_Level: 0{u.level || 1}</p>
                          </div>
                          <div className="col-span-3 text-right pr-8">
                            <div className="inline-block bg-black/60 px-6 py-3 rounded-lg border border-white/5 group-hover:border-blue-500/20 transition-all shadow-inner">
                              <p className="font-black text-2xl text-emerald-500 tracking-tighter leading-none">{u.score}</p>
                              <p className="text-[8px] text-slate-600 font-technical font-black uppercase mt-2 tracking-widest leading-none">Yield_Units</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center px-6 opacity-40">
                    <div className="flex gap-12">
                      <div className="flex flex-col"><span className="text-[8px] font-technical font-black uppercase text-slate-600">Sync_Protocol</span><span className="text-[10px] font-technical font-black text-emerald-500/80 tracking-widest mt-1 uppercase">ESTABLISHED</span></div>
                      <div className="flex flex-col"><span className="text-[8px] font-technical font-black uppercase text-slate-600">Registry_Population</span><span className="text-[10px] font-technical font-black text-blue-500/80 tracking-widest mt-1 uppercase">{leaderboard.length}_VERIFIED_NODES</span></div>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-technical font-black uppercase text-slate-600">Access_Log_0x7F</p>
                      <p className="text-[9px] font-technical text-slate-500 mt-1 uppercase tracking-tighter">Session_Authority: ACTIVE</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {view === 'challenge' && activeChallenge && (
                <motion.div key="challenge" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="max-w-5xl mx-auto pb-20">
                  <button onClick={() => setView('dashboard')} className="mb-10 flex items-center gap-4 text-slate-600 hover:text-red-500 text-[11px] font-technical font-black uppercase transition-all group tracking-[0.3em]"><ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> TERMINATE_BYPASS_SESSION</button>
                  <div className="workstation-panel rounded-lg overflow-hidden border-t-4 border-t-red-600 shadow-[0_0_80px_rgba(220,38,38,0.15)] relative">
                    <div className="p-8"><ChallengeSolver challenge={activeChallenge} onSolved={() => setView('dashboard')} /></div>
                  </div>
                </motion.div>
              )}

              {view === 'puzzle' && activePuzzle && (
                <motion.div key="puzzle" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="max-w-5xl mx-auto pb-20">
                  <button onClick={() => setView('dashboard')} className="mb-10 flex items-center gap-4 text-slate-600 hover:text-blue-400 text-[11px] font-technical font-black uppercase transition-all group tracking-[0.3em]"><ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> DISENGAGE_REMOTE_UPLINK</button>
                  <PuzzleSolver puzzle={activePuzzle} onSolved={() => setView('dashboard')} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
