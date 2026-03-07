'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Swords, CheckCircle2, AlertTriangle, Crosshair, Cpu } from 'lucide-react';
import { useGameState, Challenge } from '@/contexts/GameStateContext';

export default function ChallengeSolver({ challenge, onSolved }: { challenge: Challenge; onSolved: () => void }) {
  const { solveChallenge } = useGameState();
  const [answer, setAnswer] = useState('');
  const [status, setStatus] = useState<'idle' | 'checking' | 'correct' | 'incorrect'>('idle');
  const [scoreEarned, setScoreEarned] = useState(0);
  const [coloring, setColoring] = useState<Record<string, number>>({});

  const puzzle = challenge.puzzle_data;
  const puzzleDataParsed = typeof puzzle.puzzle_data === 'string' ? JSON.parse(puzzle.puzzle_data) : puzzle.puzzle_data;

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
      const result = await solveChallenge(challenge.id, answer);
      if (result.correct) {
        setScoreEarned(result.scoreEarned);
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
    <div className="space-y-10 relative">
      <div className="watermark opacity-[0.01] text-red-500">INTERCEPTED_COMMS</div>
      
      <div className="flex items-center gap-6 p-6 bg-red-600/5 border-l-4 border-red-600 rounded-r-lg relative z-10">
        <div className="p-3 bg-red-600/10 border border-red-600/20 rounded shadow-[0_0_20px_rgba(239,68,68,0.1)]">
          <Swords className="w-8 h-8 text-red-500 animate-pulse" />
        </div>
        <div>
          <p className="font-technical text-[10px] font-black text-red-500/60 uppercase tracking-[0.3em] mb-1">Incoming_Direct_Challenge</p>
          <p className="text-lg font-black text-white uppercase tracking-tight font-technical">Source: {challenge.challenger_name}</p>
        </div>
      </div>

      <div className="p-8 bg-black/40 border border-white/5 rounded-lg relative z-10 shadow-inner">
        <div className="flex items-center gap-2 mb-4">
          <Terminal className="w-3 h-3 text-red-500" />
          <span className="font-technical text-[9px] font-bold text-red-500/40 uppercase tracking-widest">Decrypted_Instruction_Set</span>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed font-medium">
          {puzzle.description}
        </p>
      </div>

      {/* Puzzle Data Display */}
      <div className="relative z-10">
        {puzzle.type === 'substitution' && puzzleDataParsed.encryptedText && (
          <div className="bg-red-950/10 border border-red-600/20 p-12 rounded-lg font-technical text-3xl tracking-[0.5em] text-center text-red-100 shadow-[inset_0_0_40px_rgba(239,68,68,0.05)]">
            {puzzleDataParsed.encryptedText}
          </div>
        )}

        {puzzle.type === 'book' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-black/60 border border-white/5 p-6 rounded font-technical text-[11px] leading-relaxed h-64 overflow-y-auto custom-scrollbar text-slate-500">
              {puzzleDataParsed.text?.split('\n').map((line: string, i: number) => (
                <div key={i} className="flex gap-4 mb-1">
                  <span className="text-red-500/20 w-4 text-right select-none">{i + 1}</span>
                  <span className="text-slate-400">{line}</span>
                </div>
              ))}
            </div>
            <div className="workstation-panel p-8 rounded flex flex-col justify-center items-center border-red-600/10">
              <h3 className="font-technical text-[10px] font-black text-red-500 mb-6 uppercase tracking-[0.3em]">Intercept_Vectors</h3>
              <div className="space-y-4">
                {puzzleDataParsed.coordinates?.map((coord: number[], i: number) => (
                  <div key={i} className="text-3xl font-black tracking-tighter text-white font-technical border-b-2 border-red-600/20 pb-2 px-4">
                    [{coord[0]} : {coord[1]}]
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Answer Form */}
      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-8 relative z-10">
        {status === 'correct' ? (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-10 space-y-4 bg-emerald-500/10 border border-emerald-500/20 rounded shadow-[0_0_40px_rgba(16,185,129,0.1)]"
          >
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4 animate-bounce" />
            <p className="text-emerald-400 font-black text-2xl uppercase tracking-tighter font-technical">TARGET_NEUTRALIZED</p>
            <p className="font-technical text-[10px] font-bold text-emerald-500/60 uppercase tracking-[0.3em]">+{scoreEarned}_INTEL_SECURED</p>
          </motion.div>
        ) : (
          <div className="workstation-panel p-8 rounded-lg border-red-600/20">
            {puzzle.type !== 'map_coloring' && (
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-technical text-red-500/60 font-black uppercase tracking-widest text-center">Encryption_Override_Key</label>
                  <span className="text-[8px] font-technical text-red-500 animate-pulse">Critical_Bypass_Required</span>
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  disabled={status === 'checking'}
                  className={`w-full bg-black/80 border-2 rounded py-5 px-4 text-2xl text-center uppercase tracking-[0.2em] font-technical focus:outline-none transition-all ${
                    status === 'incorrect' ? 'border-red-600 text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : 
                    'border-red-600/20 text-white focus:border-red-600 focus:bg-red-900/5'
                  }`}
                  placeholder="---"
                />
              </div>
            )}
            <button
              type="submit"
              disabled={status === 'checking'}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-5 rounded transition-all flex items-center justify-center gap-4 tracking-[0.3em] uppercase text-xs shadow-[0_0_40px_rgba(239,68,68,0.2)]"
            >
              <Swords className="w-4 h-4" />
              {status === 'checking' ? 'BYPASSING...' : status === 'incorrect' ? 'FAILURE_RETRY' : 'EXECUTE_OVERRIDE'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
