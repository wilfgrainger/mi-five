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
    <div className="space-y-10">
      <div className="flex items-center gap-4 p-4 bg-red-500/10 border-l-2 border-red-500 rounded-r-lg">
        <Swords className="w-6 h-6 text-red-500" />
        <div>
          <p className="text-[10px] font-mono-spy text-red-500/60 uppercase tracking-[0.2em]">Intercepted Challenge</p>
          <p className="text-sm font-bold text-white uppercase tracking-tight">Origin: {challenge.challenger_name}</p>
        </div>
      </div>

      <div className="p-6 bg-black/40 border border-white/5 rounded-xl font-mono-spy text-sm leading-relaxed text-slate-300">
        <span className="text-red-500 mr-2 opacity-50">&gt;</span>
        {puzzle.description}
      </div>

      {/* Puzzle Data Display */}
      {puzzle.type === 'substitution' && puzzleDataParsed.encryptedText && (
        <div className="bg-red-950/20 border border-red-500/20 p-8 rounded-xl font-mono-spy text-xl tracking-[0.3em] text-center text-red-100 break-all shadow-[inset_0_0_20px_rgba(239,68,68,0.1)]">
          {puzzleDataParsed.encryptedText}
        </div>
      )}

      {puzzle.type === 'book' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-black/40 border border-white/5 p-6 rounded-xl text-xs font-mono-spy leading-relaxed h-48 overflow-y-auto custom-scrollbar">
            {puzzleDataParsed.text?.split('\n').map((line: string, i: number) => (
              <div key={i} className="flex gap-4 mb-1">
                <span className="text-red-500 opacity-30 w-4 text-right select-none">{i + 1}</span>
                <span className="text-slate-400">{line}</span>
              </div>
            ))}
          </div>
          <div className="glass-panel p-6 rounded-xl flex flex-col justify-center items-center border-red-500/20">
            <h3 className="text-[10px] font-mono-spy text-red-500 mb-4 uppercase tracking-[0.2em]">Target Vectors</h3>
            <div className="space-y-2">
              {puzzleDataParsed.coordinates?.map((coord: number[], i: number) => (
                <div key={i} className="text-2xl font-black tracking-tighter text-white font-mono-spy">[{coord[0]} : {coord[1]}]</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Answer Form */}
      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
        {status === 'correct' ? (
          <div className="text-center py-6 space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4 animate-bounce" />
            <p className="text-emerald-400 font-black text-xl uppercase tracking-tighter glow-text-emerald">Target Neutralized</p>
            <p className="text-[10px] font-mono-spy text-emerald-500/60 uppercase tracking-[0.2em]">+{scoreEarned} Intel Points Secure</p>
          </div>
        ) : (
          <>
            {puzzle.type !== 'map_coloring' && (
              <div className="space-y-2">
                <label className="block text-[8px] font-mono-spy text-red-500/60 uppercase tracking-[0.3em] text-center">Encryption Override Input</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  disabled={status === 'checking'}
                  className={`w-full bg-black/60 border-2 rounded-xl py-5 px-4 text-2xl text-center uppercase tracking-[0.2em] font-mono-spy focus:outline-none transition-all ${
                    status === 'incorrect' ? 'border-red-500 text-red-400' : 'border-red-500/30 text-white focus:border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.05)]'
                  }`}
                  placeholder="---"
                />
              </div>
            )}
            <button
              type="submit"
              disabled={status === 'checking'}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-xl transition-all flex items-center justify-center gap-3 tracking-[0.2em] uppercase text-xs shadow-[0_0_30px_rgba(239,68,68,0.2)]"
            >
              <Swords className="w-4 h-4" />
              {status === 'checking' ? 'Processing...' : status === 'incorrect' ? 'Override Failed - Retry' : 'Execute Override'}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
