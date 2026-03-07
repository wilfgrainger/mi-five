'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, CheckCircle2, AlertTriangle, Cpu, ChevronRight, Crosshair } from 'lucide-react';
import { useGameState, Puzzle } from '@/contexts/GameStateContext';

export default function PuzzleSolver({ puzzle, onSolved }: { puzzle: Puzzle; onSolved: () => void }) {
  const { solvePuzzle, requestHint } = useGameState();
  const [answer, setAnswer] = useState('');
  const [status, setStatus] = useState<'idle' | 'checking' | 'correct' | 'incorrect'>('idle');
  const [resultData, setResultData] = useState<any>(null);

  const [coloring, setColoring] = useState<Record<string, number>>({});

  useEffect(() => {
    if (puzzle.type === 'map_coloring') {
      setAnswer(JSON.stringify(coloring));
    }
  }, [coloring, puzzle.type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() && puzzle.type !== 'map_coloring') return;

    setStatus('checking');
    try {
      const result = await solvePuzzle(puzzle.id, answer);
      if (result.correct) {
        setStatus('correct');
        setResultData(result);
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
    <div className="workstation-panel rounded-lg overflow-hidden border-t-4 border-t-blue-600 shadow-[0_0_80px_rgba(0,0,0,0.8)] max-w-5xl mx-auto relative">
      <div className="watermark opacity-[0.012] select-none">TOP_SECRET_SIGINT_CLEARANCE_REQUIRED</div>
      
      {/* Technical Header Bar */}
      <div className="p-5 border-b border-white/5 bg-black/60 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
            <span className="font-technical text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Active_Mission_Registry</span>
          </div>
          <span className="text-slate-800">|</span>
          <span className="font-technical text-[10px] text-slate-600 font-black uppercase tracking-tighter">0x_{puzzle.id.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-6">
          {puzzle.hint_used && (
            <div className="flex items-center gap-2 bg-warning/10 px-3 py-1 rounded border border-warning/20 animate-pulse">
              <span className="text-[9px] font-technical font-black text-warning uppercase tracking-widest">Intel_Leak_Active // -50%_Yield</span>
            </div>
          )}
          <span className={`text-[10px] font-technical font-black uppercase tracking-widest ${puzzle.difficulty === 'Easy' ? 'text-emerald-500' : puzzle.difficulty === 'Medium' ? 'text-warning' : 'text-red-500'}`}>
            [{puzzle.difficulty}_Priority_Level]
          </span>
        </div>
      </div>

      <div className="p-10 md:p-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Left Column: Mission Intelligence Display */}
          <div className="lg:col-span-7 space-y-10">
            <div className="space-y-6">
              <div className="flex justify-between items-start gap-6">
                <h1 className="text-4xl font-black text-white uppercase tracking-tight leading-none drop-shadow-lg">{puzzle.title}</h1>
                {puzzle.hint && !puzzle.hint_used && (
                  <button 
                    onClick={() => requestHint(puzzle.id)}
                    className="flex-shrink-0 text-[10px] font-technical font-black text-warning hover:text-white hover:bg-warning border-2 border-warning/30 px-4 py-2 rounded transition-all uppercase tracking-widest bg-black/40 shadow-inner active:scale-95"
                  >
                    Authorize_Hint
                  </button>
                )}
              </div>
              
              <div className="relative pl-6">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600/30 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.2)]"></div>
                <p className="text-slate-400 text-sm leading-relaxed font-semibold italic">
                  <span className="text-blue-500/60 not-italic mr-2 font-technical font-black">&gt; BRIEFING:</span>
                  {puzzle.description}
                </p>
              </div>
            </div>

            {/* Hint Interface - HIGH CONTRAST AMBER */}
            <AnimatePresence>
              {puzzle.hint_used && (
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="p-8 bg-warning/5 border-2 border-warning/40 rounded-lg relative overflow-hidden group shadow-[0_0_50px_rgba(245,158,11,0.08)]"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none group-hover:opacity-[0.06] transition-opacity">
                    <AlertTriangle className="w-24 h-24 text-warning" />
                  </div>
                  
                  <div className="flex items-center gap-4 mb-6 text-warning relative z-10">
                    <div className="p-2 bg-warning/10 rounded border border-warning/20">
                      <AlertTriangle className="w-5 h-5 animate-bounce" />
                    </div>
                    <span className="font-technical text-[11px] font-black uppercase tracking-[0.3em] glow-amber">Intercepted_Intelligence_Stream</span>
                  </div>
                  
                  <div className="bg-black/60 p-6 rounded border-2 border-warning/20 relative z-10 shadow-inner">
                    <p className="text-warning font-black text-base leading-relaxed tracking-wide">
                      <span className="opacity-40 mr-3 font-technical text-sm">&gt;&gt;</span>
                      {puzzle.hint}
                    </p>
                  </div>
                  
                  <div className="mt-6 flex items-center justify-between text-[10px] font-technical font-black text-warning/50 uppercase tracking-widest relative z-10">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse"></div>
                      <span>ORIGIN: SIGINT_RELAY_STATION_IV</span>
                    </div>
                    <span>CONFIDENCE_SCORE: 98.4%</span>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-warning/10 text-center">
                    <p className="text-[9px] font-technical font-black text-warning/40 uppercase animate-pulse">Warning: Yield potentials reduced by 50.00% for this mission identifier.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Puzzle Data Core */}
            <div className="pt-6 relative z-10">
              {puzzle.type === 'substitution' && puzzle.puzzle_data?.encryptedText && (
                <div className="bg-slate-950 border-2 border-white/5 p-12 rounded-xl font-technical text-3xl tracking-[0.5em] text-center text-blue-100 shadow-[inset_0_0_60px_rgba(59,130,246,0.05)] select-all group">
                  <div className="text-[8px] text-blue-500/20 font-technical font-black mb-4 tracking-[1em] uppercase group-hover:text-blue-500/40 transition-colors">RAW_ENCRYPTED_DATA_PACKET</div>
                  {puzzle.puzzle_data.encryptedText}
                </div>
              )}

              {puzzle.type === 'book' && puzzle.puzzle_data && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="bg-black/80 border-2 border-white/5 p-8 rounded-xl font-technical text-[12px] leading-relaxed overflow-y-auto max-h-80 custom-scrollbar text-slate-500 shadow-inner">
                    <div className="text-[8px] text-blue-500/20 font-technical font-black mb-6 tracking-widest uppercase text-center border-b border-white/5 pb-4 leading-none">Classified_Document_Fragment</div>
                    {puzzle.puzzle_data.text?.split('\n').map((line: string, i: number) => (
                      <div key={i} className="flex gap-6 mb-2 hover:bg-white/[0.02] p-1 rounded transition-colors group">
                        <span className="text-blue-500/30 w-6 text-right select-none font-black group-hover:text-blue-500/60">{i + 1}</span>
                        <span className="text-slate-400 group-hover:text-slate-200">{line}</span>
                      </div>
                    ))}
                  </div>
                  <div className="workstation-panel p-10 rounded-xl flex flex-col justify-center items-center border-2 border-blue-500/10 shadow-2xl">
                    <div className="p-3 bg-blue-600/5 rounded-full border border-blue-500/20 mb-8">
                      <Crosshair className="w-8 h-8 text-blue-500 animate-pulse-soft" />
                    </div>
                    <h3 className="text-[11px] font-technical text-blue-500 mb-8 uppercase tracking-[0.4em] font-black text-center leading-none">Target_Vector_Intercepts</h3>
                    <div className="space-y-6 w-full">
                      {puzzle.puzzle_data.coordinates?.map((coord: number[], i: number) => (
                        <div key={i} className="text-5xl font-black tracking-tighter text-white font-technical border-b-4 border-blue-600/20 pb-4 text-center group transition-all hover:border-blue-500/40">
                          <span className="opacity-20 text-3xl mr-2 text-blue-500 font-black">[{i}]</span>
                          {coord[0]}<span className="text-blue-500/40 mx-2">:</span>{coord[1]}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Decryption Override Console */}
          <div className="lg:col-span-5 border-l-2 border-white/5 pl-16 flex flex-col justify-center relative z-10">
            <div className="workstation-panel p-10 rounded-xl border-2 border-blue-500/20 shadow-[0_0_100px_rgba(0,0,0,0.8)] relative">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Cpu className="w-12 h-12 text-blue-500" />
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-10">
                {puzzle.type !== 'map_coloring' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center px-1">
                      <label className="block text-[11px] font-technical text-slate-500 font-black uppercase tracking-[0.3em]">Decryption_Command_Input</label>
                      <span className="text-[9px] font-technical text-blue-500 font-black animate-pulse bg-blue-500/10 px-2 py-0.5 rounded">READY</span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        autoFocus
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        disabled={status === 'checking' || status === 'correct'}
                        className={`w-full bg-slate-950 border-4 rounded-lg py-6 px-6 text-3xl text-center uppercase tracking-[0.3em] font-technical focus:outline-none transition-all shadow-[inset_0_0_30px_rgba(0,0,0,0.5)] ${
                          status === 'incorrect' ? 'border-red-600/60 text-red-500 shadow-[0_0_40px_rgba(239,68,68,0.2)]' :
                          status === 'correct' ? 'border-emerald-600/60 text-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.2)]' :
                          'border-white/5 text-white focus:border-blue-600/60 focus:bg-blue-900/[0.02]'
                        }`}
                        placeholder="..."
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'checking' || status === 'correct'}
                  className={`w-full font-technical font-black py-6 rounded-lg transition-all flex items-center justify-center gap-6 tracking-[0.4em] uppercase text-[13px] shadow-2xl border-2 ${
                    status === 'correct' ? 'bg-emerald-600 border-emerald-500 text-white' :
                    status === 'incorrect' ? 'bg-red-600 border-red-500 text-white animate-shake' :
                    'bg-blue-600 border-blue-500 hover:bg-blue-500 text-white shadow-[0_0_50px_rgba(59,130,246,0.3)] active:scale-95'
                  }`}
                >
                  {status === 'idle' && (
                    <>
                      <Shield className="w-5 h-5" /> Execute_Override
                    </>
                  )}
                  {status === 'checking' && (
                    <>
                      <div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                      PROCESSING_PAYLOAD...
                    </>
                  )}
                  {status === 'correct' && (
                    <>
                      <CheckCircle2 className="w-5 h-5 animate-bounce" /> UPLINK_AUTHORIZED
                    </>
                  )}
                  {status === 'incorrect' && (
                    <>
                      <AlertTriangle className="w-5 h-5" /> BYPASS_DENIED
                    </>
                  )}
                </button>
              </form>

              <AnimatePresence>
                {status === 'correct' && resultData && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-12 text-center space-y-6 p-8 bg-emerald-600/10 border-2 border-emerald-500/20 rounded-lg shadow-inner"
                  >
                    <p className="text-4xl font-black text-emerald-400 uppercase tracking-tighter leading-none glow-secure">MISSION_ACCOMPLISHED</p>
                    <div className="flex justify-center gap-10 pt-4">
                      <div className="text-left">
                        <p className="text-[9px] font-technical text-slate-600 uppercase font-black tracking-widest">Net_Yield</p>
                        <p className="text-2xl font-technical font-black text-emerald-500">+{resultData.scoreEarned}_PTS</p>
                      </div>
                      <div className="h-10 w-[1px] bg-white/5 self-center"></div>
                      <div className="text-left">
                        <p className="text-[9px] font-technical text-slate-600 uppercase font-black tracking-widest">Protocol_ID</p>
                        <p className="text-2xl font-technical font-black text-slate-400 uppercase tracking-tighter">SIGINT_0X</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Console Readouts */}
            <div className="mt-16 space-y-4 px-2">
              <div className="flex justify-between items-center text-[9px] font-technical font-black">
                <div className="flex items-center gap-3">
                  <span className="text-emerald-500 animate-pulse">DISK_WRITE: OK</span>
                  <span className="text-blue-500/40 tracking-tighter">0x4F92_ACCESS_GRANTED</span>
                </div>
                <span className="text-slate-700">KERNEL_v4.0.2_STABLE</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden flex">
                <div className="w-2/3 h-full bg-blue-600/40 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.3)]"></div>
                <div className="w-1/6 h-full bg-emerald-500/20 ml-1"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
