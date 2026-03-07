'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Shield, CheckCircle2, AlertTriangle, Crosshair, Cpu } from 'lucide-react';
import { useGameState, Puzzle } from '@/contexts/GameStateContext';

export default function PuzzleSolver({ puzzle, onSolved }: { puzzle: Puzzle; onSolved: () => void }) {
  const { solvePuzzle, requestHint } = useGameState();
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
    <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl max-w-4xl mx-auto">
      <div className="p-4 border-b border-white/5 bg-black/40 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Cpu className="w-4 h-4 text-violet-500 animate-pulse" />
          <h2 className="font-mono-spy text-xs font-bold tracking-widest text-violet-400 uppercase">
            MISSION_ID: {puzzle.id}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {puzzle.hint_used && (
            <span className="text-[8px] font-mono-spy text-amber-500 uppercase tracking-widest border border-amber-500/30 px-2 py-0.5 rounded">
              INTEL_PENALTY_ACTIVE
            </span>
          )}
          <span className="w-2 h-2 rounded-full bg-violet-500 animate-ping"></span>
          <span className="text-[8px] font-mono-spy text-violet-500 uppercase tracking-widest">
            {puzzle.difficulty} PRIORITY
          </span>
        </div>
      </div>

      <div className="p-6 md:p-10">
        <div className="mb-10">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl font-bold text-white uppercase tracking-tight">{puzzle.title}</h1>
            {puzzle.hint && !puzzle.hint_used && (
              <button 
                onClick={() => requestHint(puzzle.id)}
                className="text-[8px] font-mono-spy text-violet-400 hover:text-violet-300 border border-violet-500/20 px-3 py-1 rounded transition-colors uppercase tracking-widest"
              >
                [ Request Intel Hint ]
              </button>
            )}
          </div>
          <div className="p-6 bg-black/40 border-l-2 border-violet-500 rounded-r-xl font-mono-spy text-sm leading-relaxed text-slate-300">
            <span className="text-violet-500 mr-2 opacity-50">&gt;</span>
            {puzzle.description}
          </div>
          
          <AnimatePresence>
            {puzzle.hint_used && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mt-4 p-4 bg-amber-500/5 border-l-2 border-amber-500 rounded-r-xl font-mono-spy text-xs text-amber-200/80 italic overflow-hidden"
              >
                <div className="flex items-center gap-2 mb-2 text-amber-500 non-italic">
                  <AlertTriangle className="w-3 h-3" />
                  <span className="font-bold uppercase tracking-widest">Decrypted Intelligence Hint</span>
                </div>
                {puzzle.hint}
                <div className="mt-2 text-[10px] text-amber-500/50 non-italic uppercase tracking-tighter">
                  Warning: Using intelligence assets has reduced the mission score potential by 50%.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {puzzle.type === 'substitution' && puzzle.puzzle_data?.encryptedText && (
          <div className="bg-slate-900/50 border border-white/5 p-8 rounded-xl mb-10 font-mono-spy text-xl tracking-[0.3em] text-center text-violet-100 break-all">
            {puzzle.puzzle_data.encryptedText}
          </div>
        )}

        {puzzle.type === 'book' && puzzle.puzzle_data && (
          <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-black/40 border border-white/5 p-6 rounded-xl font-mono-spy text-xs leading-relaxed overflow-y-auto max-h-48 custom-scrollbar">
              {puzzle.puzzle_data.text?.split('\n').map((line: string, i: number) => (
                <div key={i} className="flex gap-4 mb-1">
                  <span className="text-violet-500 opacity-30 w-4 text-right select-none">{i + 1}</span>
                  <span className="text-slate-400">{line}</span>
                </div>
              ))}
            </div>
            <div className="glass-panel p-6 rounded-xl flex flex-col justify-center items-center">
              <h3 className="text-[10px] font-mono-spy text-violet-500 mb-4 uppercase tracking-[0.2em]">Coordinates [L, W]</h3>
              <div className="space-y-3">
                {puzzle.puzzle_data.coordinates?.map((coord: number[], i: number) => (
                  <div key={i} className="text-3xl font-black tracking-tighter text-white font-mono-spy">
                    [{coord[0]} : {coord[1]}]
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
          {puzzle.type !== 'map_coloring' && (
            <div className="space-y-2">
              <label className="block text-[8px] font-mono-spy text-slate-500 uppercase tracking-[0.3em] text-center">Decryption Input</label>
              <div className="relative group">
                <input
                  type="text"
                  required
                  autoFocus
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  disabled={status === 'checking' || status === 'correct'}
                  className={`w-full bg-black/60 border-2 rounded-xl py-5 px-4 text-2xl text-center uppercase tracking-[0.2em] font-mono-spy focus:outline-none transition-all ${
                    status === 'incorrect' ? 'border-red-500/50 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]' :
                    status === 'correct' ? 'border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]' :
                    'border-white/10 text-white focus:border-violet-500/50 focus:shadow-[0_0_20px_rgba(139,92,246,0.1)]'
                  }`}
                  placeholder="---"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'checking' || status === 'correct'}
            className={`w-full font-black py-4 rounded-xl transition-all flex items-center justify-center gap-3 tracking-[0.2em] uppercase text-xs ${
              status === 'correct' ? 'bg-emerald-600 text-white' :
              status === 'incorrect' ? 'bg-red-600 text-white' :
              'bg-violet-600 hover:bg-violet-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]'
            }`}
          >
            {status === 'idle' && (
              <>
                <Shield className="w-4 h-4" /> Submit Solution
              </>
            )}
            {status === 'checking' && (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Verifying...
              </>
            )}
            {status === 'correct' && (
              <>
                <CheckCircle2 className="w-4 h-4" /> Access Granted
              </>
            )}
            {status === 'incorrect' && (
              <>
                <AlertTriangle className="w-4 h-4" /> Failed - Retry
              </>
            )}
          </button>
        </form>

        <AnimatePresence>
          {status === 'correct' && resultData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10 text-center space-y-2"
            >
              <p className="text-2xl font-black text-emerald-400 uppercase tracking-tighter glow-text-emerald">Mission Accomplished</p>
              <p className="text-[10px] font-mono-spy text-emerald-500/60 uppercase tracking-[0.2em]">+ {resultData.scoreEarned} Intel Gained</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
