'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Swords, CheckCircle2, AlertTriangle, Crosshair } from 'lucide-react';
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
    <div className="space-y-6">
      <div className="bg-black/20 border border-white/10 p-6 rounded-xl font-sans text-lg leading-relaxed shadow-inner text-violet-100">
        {puzzle.description}
      </div>

      {/* Puzzle Data Display */}
      {puzzle.type === 'substitution' && (
        <div className="bg-black/20 border border-white/10 p-6 rounded-xl font-sans text-xl tracking-widest text-center break-all shadow-inner text-white">
          {puzzleDataParsed.encryptedText}
        </div>
      )}
      {puzzle.type === 'book' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-black/20 border border-white/10 p-4 rounded-xl text-sm leading-relaxed shadow-inner">
            {puzzleDataParsed.text?.split('\n').map((line: string, i: number) => (
              <div key={i} className="flex gap-4"><span className="text-violet-400 opacity-50 w-6 text-right font-bold">{i + 1}</span><span className="text-violet-100">{line}</span></div>
            ))}
          </div>
          <div className="bg-black/20 border border-white/10 p-4 rounded-xl shadow-inner">
            <h3 className="text-[10px] text-violet-400 mb-4 uppercase font-black tracking-widest">Target Coordinates [Line, Word]</h3>
            {puzzleDataParsed.coordinates?.map((coord: number[], i: number) => (
              <div key={i} className="text-lg font-bold tracking-widest text-violet-300">[{coord[0]}, {coord[1]}]</div>
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

      {/* Answer Form */}
      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        {status === 'correct' ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <p className="text-emerald-400 font-bold text-lg uppercase tracking-widest">Challenge Complete</p>
            <p className="text-violet-400 text-sm mt-1 uppercase tracking-widest">+{scoreEarned} Intel Points Earned</p>
          </div>
        ) : (
          <>
            {puzzle.type !== 'map_coloring' && (
              <div className="mb-4">
                <label className="block text-[10px] text-red-400 font-bold tracking-widest uppercase mb-3 text-center">Submit Decryption Key</label>
                <input
                  type="text"
                  required
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  disabled={status === 'checking'}
                  className={`w-full bg-black/20 border-2 rounded-xl py-4 px-4 text-xl text-center uppercase tracking-widest focus:outline-none transition-all shadow-inner font-sans ${status === 'incorrect' ? 'border-red-500/80 bg-red-900/20 text-red-400' : 'border-red-500/30 focus:border-red-400/60 text-white'
                    }`}
                  placeholder="..."
                />
              </div>
            )}
            <button
              type="submit"
              disabled={status === 'checking'}
              className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              <Swords className="w-4 h-4" />
              {status === 'checking' ? 'Verifying...' : status === 'incorrect' ? 'Incorrect - Retry' : 'Submit Answer'}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
