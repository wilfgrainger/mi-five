'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Shield, CheckCircle2, AlertTriangle, Crosshair, Cpu, ChevronRight } from 'lucide-react';
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
    <div className="workstation-panel rounded-lg overflow-hidden border-t-2 border-t-blue-600 shadow-2xl max-w-5xl mx-auto relative">
      <div className="watermark opacity-[0.01]">TOP_SECRET_SIGINT</div>
      
      {/* Technical Header */}
      <div className="p-4 border-b border-white/5 bg-black/40 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="font-technical text-[10px] font-bold text-blue-500 uppercase tracking-widest">Active_Mission_Buffer</span>
          </div>
          <span className="text-slate-700">|</span>
          <span className="font-technical text-[10px] text-slate-500 font-bold uppercase tracking-tighter">ID_{puzzle.id.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-4">
          {puzzle.hint_used && (
            <span className="text-[9px] font-technical font-black text-warning bg-warning/10 px-2 py-0.5 rounded border border-warning/20 animate-pulse">
              INTEL_LEAK_DETECTED // -50%_YIELD
            </span>
          )}
          <span className={`text-[10px] font-technical font-black uppercase ${puzzle.difficulty === 'Easy' ? 'text-emerald-500' : puzzle.difficulty === 'Medium' ? 'text-warning' : 'text-red-500'}`}>
            {puzzle.difficulty}_PRIORITY_FILE
          </span>
        </div>
      </div>

      <div className="p-8 md:p-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Mission Intel */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <div className="flex justify-between items-end mb-6">
                <h1 className="text-3xl font-black text-white uppercase tracking-tight leading-none">{puzzle.title}</h1>
                {puzzle.hint && !puzzle.hint_used && (
                  <button 
                    onClick={() => requestHint(puzzle.id)}
                    className="text-[9px] font-technical font-bold text-warning hover:bg-warning/10 border border-warning/30 px-3 py-1.5 rounded transition-all uppercase tracking-widest bg-black/40"
                  >
                    [ REQUEST_INTEL_HINT ]
                  </button>
                )}
              </div>
              
              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-blue-600/40 rounded-full"></div>
                <p className="text-slate-400 text-sm leading-relaxed font-medium pl-2">
                  {puzzle.description}
                </p>
              </div>
            </div>

            {/* Hint Box - Extremely Visible */}
            <AnimatePresence>
              {puzzle.hint_used && (
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="p-6 bg-warning/5 border border-warning/30 rounded relative overflow-hidden group shadow-[0_0_30px_rgba(245,158,11,0.05)]"
                >
                  <div className="absolute top-0 right-0 p-2 opacity-5">
                    <AlertTriangle className="w-16 h-16 text-warning" />
                  </div>
                  <div className="flex items-center gap-3 mb-3 text-warning">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-technical text-[10px] font-black uppercase tracking-[0.2em] glow-amber">Intercepted_Intelligence_Feed</span>
                  </div>
                  <p className="text-warning font-bold text-sm leading-relaxed bg-black/40 p-4 rounded border border-warning/10">
                    <span className="opacity-50 mr-2 font-technical">&gt;</span>
                    {puzzle.hint}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-[9px] font-technical font-bold text-warning/60 uppercase">
                    <span>Source: Agent_Station_Delta</span>
                    <span>Confidence: 94%</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Puzzle Content */}
            <div className="pt-4">
              {puzzle.type === 'substitution' && puzzle.puzzle_data?.encryptedText && (
                <div className="bg-[#0f1115] border border-white/5 p-10 rounded-lg font-technical text-2xl tracking-[0.4em] text-center text-blue-100 shadow-inner">
                  {puzzle.puzzle_data.encryptedText}
                </div>
              )}

              {puzzle.type === 'book' && puzzle.puzzle_data && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-black/60 border border-white/5 p-6 rounded font-technical text-[11px] leading-relaxed overflow-y-auto max-h-64 custom-scrollbar text-slate-500">
                    {puzzle.puzzle_data.text?.split('\n').map((line: string, i: number) => (
                      <div key={i} className="flex gap-4 mb-1">
                        <span className="text-blue-500/20 w-4 text-right select-none">{i + 1}</span>
                        <span className="text-slate-400">{line}</span>
                      </div>
                    ))}
                  </div>
                  <div className="workstation-panel p-8 rounded flex flex-col justify-center items-center border-blue-500/10">
                    <h3 className="text-[10px] font-technical text-blue-500 mb-6 uppercase tracking-[0.3em] font-black">Target_Vector_Coordinates</h3>
                    <div className="space-y-4">
                      {puzzle.puzzle_data.coordinates?.map((coord: number[], i: number) => (
                        <div key={i} className="text-4xl font-black tracking-tighter text-white font-technical border-b-2 border-blue-600/20 pb-2 px-4">
                          [{coord[0]} : {coord[1]}]
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Decryption Console */}
          <div className="lg:col-span-5 border-l border-white/5 pl-12 flex flex-col justify-center">
            <div className="workstation-panel p-8 rounded-lg border-blue-500/20 shadow-[0_0_50px_rgba(0,0,0,0.3)]">
              <form onSubmit={handleSubmit} className="space-y-8">
                {puzzle.type !== 'map_coloring' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="block text-[10px] font-technical text-slate-500 font-bold uppercase tracking-widest">Input_Decryption_Key</label>
                      <span className="text-[8px] font-technical text-blue-500 animate-pulse">Awaiting_Input...</span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        autoFocus
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        disabled={status === 'checking' || status === 'correct'}
                        className={`w-full bg-black/80 border-2 rounded py-5 px-4 text-2xl text-center uppercase tracking-[0.2em] font-technical focus:outline-none transition-all ${
                          status === 'incorrect' ? 'border-red-500/50 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.1)]' :
                          status === 'correct' ? 'border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]' :
                          'border-white/10 text-white focus:border-blue-500/50 focus:bg-blue-900/5'
                        }`}
                        placeholder="---"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'checking' || status === 'correct'}
                  className={`w-full font-technical font-black py-5 rounded transition-all flex items-center justify-center gap-4 tracking-[0.3em] uppercase text-xs shadow-xl ${
                    status === 'correct' ? 'bg-emerald-600 text-white' :
                    status === 'incorrect' ? 'bg-red-600 text-white' :
                    'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_30px_rgba(59,130,246,0.3)]'
                  }`}
                >
                  {status === 'idle' && (
                    <>
                      <Shield className="w-4 h-4" /> Finalize_Decrypt
                    </>
                  )}
                  {status === 'checking' && (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing...
                    </>
                  )}
                  {status === 'correct' && (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Access_Granted
                    </>
                  )}
                  {status === 'incorrect' && (
                    <>
                      <AlertTriangle className="w-4 h-4" /> Auth_Failure
                    </>
                  )}
                </button>
              </form>

              <AnimatePresence>
                {status === 'correct' && resultData && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-10 text-center space-y-4 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded"
                  >
                    <p className="text-3xl font-black text-emerald-400 uppercase tracking-tighter leading-none">MISSION_COMPLETE</p>
                    <div className="flex justify-center gap-6">
                      <div className="text-left">
                        <p className="text-[8px] font-technical text-slate-500 uppercase font-bold">Yield</p>
                        <p className="text-xl font-technical font-black text-emerald-500">+{resultData.scoreEarned}_PTS</p>
                      </div>
                      <div className="text-left border-l border-white/5 pl-6">
                        <p className="text-[8px] font-technical text-slate-500 uppercase font-bold">Latency</p>
                        <p className="text-xl font-technical font-black text-slate-300">12ms</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="mt-12 space-y-2 opacity-30 px-2">
              <div className="flex justify-between text-[8px] font-technical">
                <span>Kernel_Log: [OK]</span>
                <span>Buffer: [0x4F92]</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="w-2/3 h-full bg-blue-600/40"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
