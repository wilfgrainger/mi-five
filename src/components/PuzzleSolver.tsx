'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Shield, CheckCircle2, AlertTriangle, Crosshair } from 'lucide-react';
import { useGameState, Puzzle } from '@/contexts/GameStateContext';

export default function PuzzleSolver({ puzzle, onSolved }: { puzzle: Puzzle; onSolved: () => void }) {
  const { solvePuzzle } = useGameState();
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
    <div className="border border-white/10 bg-black/40 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
        <h2 className="font-bold text-lg flex items-center gap-2 uppercase tracking-widest">
          <Terminal className="w-5 h-5" /> Mission: {puzzle.title}
        </h2>
        <span className="text-[10px] px-2 py-1 rounded border border-violet-500/50 text-violet-300 uppercase font-bold tracking-widest">
          Difficulty: {puzzle.difficulty}
        </span>
      </div>

      <div className="p-6 sm:p-8">
        <div className="bg-black/20 border border-white/10 p-6 rounded-xl mb-8 font-sans text-lg leading-relaxed shadow-inner text-violet-100">
          {puzzle.description}
        </div>

        {puzzle.type === 'substitution' && (
          <div className="bg-black/20 border border-white/10 p-6 rounded-xl mb-8 font-sans text-xl tracking-widest text-center break-all shadow-inner text-white">
            {puzzle.puzzle_data.encryptedText}
          </div>
        )}

        {puzzle.type === 'scytale' && (
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <label className="text-xs text-violet-400 uppercase tracking-widest font-bold">Cylinder Diameter: {diameter}</label>
              <input
                type="range"
                min="2"
                max={puzzle.puzzle_data.maxDiameter || 10}
                value={diameter}
                onChange={e => setDiameter(parseInt(e.target.value))}
                className="flex-1 accent-violet-500"
              />
            </div>
            <div className="bg-black/20 border border-white/10 p-6 rounded-xl font-sans text-xl text-center leading-loose tracking-widest shadow-inner text-white">
              {/* Scytale rendering logic */}
              {puzzle.puzzle_data.encryptedText}
            </div>
          </div>
        )}

        {puzzle.type === 'book' && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-black/20 border border-white/10 p-4 rounded-xl font-sans text-sm leading-relaxed shadow-inner">
              {puzzle.puzzle_data.text.split('\n').map((line: string, i: number) => (
                <div key={i} className="flex gap-4">
                  <span className="text-violet-400 opacity-50 w-6 text-right font-bold">{i + 1}</span>
                  <span className="text-violet-100">{line}</span>
                </div>
              ))}
            </div>
            <div className="bg-black/20 border border-white/10 p-4 rounded-xl shadow-inner">
              <h3 className="text-[10px] text-violet-400 mb-4 uppercase font-black tracking-widest">Target Coordinates [Line, Word]</h3>
              <div className="space-y-2">
                {puzzle.puzzle_data.coordinates.map((coord: number[], i: number) => (
                  <div key={i} className="text-lg font-bold tracking-widest text-violet-300">
                    [{coord[0]}, {coord[1]}]
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {puzzle.type === 'map_coloring' && (
          <div className="mb-8 bg-black/40 border border-white/10 rounded-xl p-4 relative h-64 overflow-hidden shadow-inner">
            <svg className="w-full h-full absolute inset-0">
              {puzzle.puzzle_data.edges.map((edge: string[], i: number) => {
                const n1 = puzzle.puzzle_data.nodes.find((n: any) => n.id === edge[0]);
                const n2 = puzzle.puzzle_data.nodes.find((n: any) => n.id === edge[1]);
                return (
                  <line
                    key={i}
                    x1={`${n1.x}%`} y1={`${n1.y}%`}
                    x2={`${n2.x}%`} y2={`${n2.y}%`}
                    stroke="rgba(139, 92, 246, 0.3)"
                    strokeWidth="2"
                  />
                );
              })}
            </svg>
            {puzzle.puzzle_data.nodes.map((node: any) => {
              const colorIdx = coloring[node.id] || 0;
              const colors = ['transparent', '#ef4444', '#3b82f6', '#22c55e', '#eab308'];
              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => setColoring({ ...coloring, [node.id]: (colorIdx + 1) % 5 })}
                  className="absolute w-10 h-10 -ml-5 -mt-5 rounded-full border-2 border-violet-500 flex items-center justify-center font-bold transition-colors z-10"
                  style={{
                    left: `${node.x}%`,
                    top: `${node.y}%`,
                    backgroundColor: colors[colorIdx],
                    color: colorIdx === 0 ? '#8b5cf6' : '#000'
                  }}
                >
                  {node.id}
                </button>
              );
            })}
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-md mx-auto relative z-10">
          {puzzle.type !== 'map_coloring' && (
            <div className="mb-6">
              <label className="block text-[10px] text-violet-400 font-bold tracking-widest uppercase mb-3 text-center">Input Decryption Key</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Terminal className="w-5 h-5 text-violet-500 group-focus-within:text-violet-300 transition-colors" />
                </div>
                <input
                  type="text"
                  required
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  disabled={status === 'checking' || status === 'correct'}
                  className={`w-full bg-black/20 backdrop-blur-md border-2 rounded-xl py-4 pl-12 pr-4 text-xl text-center uppercase tracking-widest focus:outline-none transition-all shadow-inner font-sans ${status === 'incorrect' ? 'border-red-500/50 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]' :
                    status === 'correct' ? 'border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' :
                      'border-white/30 text-violet-200 focus:border-white/20 focus:shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                    }`}
                  placeholder="Awaiting Input..."
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'checking' || status === 'correct' || (!answer.trim() && puzzle.type !== 'map_coloring')}
            className={`w-full font-black py-4 rounded-xl transition-all flex items-center justify-center gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.4)] tracking-widest uppercase ${status === 'correct' ? 'bg-emerald-500 text-[#050b14] shadow-[0_0_30px_rgba(16,185,129,0.5)] border-2 border-emerald-400' :
              status === 'incorrect' ? 'bg-red-500/20 text-red-400 border-2 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]' :
                'bg-violet-500 text-[#050b14] hover:bg-violet-400 border-2 border-white/20 disabled:opacity-50 hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] hover:-translate-y-0.5'
              }`}
          >
            {status === 'idle' && (
              <>
                <Shield className="w-5 h-5" /> Verify Solution
              </>
            )}
            {status === 'checking' && (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                  <Crosshair className="w-5 h-5" />
                </motion.div>
                Analyzing...
              </>
            )}
            {status === 'correct' && (
              <>
                <CheckCircle2 className="w-5 h-5" /> Access Granted
              </>
            )}
            {status === 'incorrect' && (
              <>
                <AlertTriangle className="w-5 h-5" /> Access Denied
              </>
            )}
          </button>
        </form>

        <AnimatePresence>
          {status === 'correct' && resultData && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="mt-8 text-center bg-emerald-900/20 border border-emerald-500/30 p-6 rounded-2xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <p className="text-2xl font-black text-emerald-400 mb-2 tracking-widest uppercase drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">Mission Accomplished</p>
              <p className="text-emerald-300 font-bold tracking-widest uppercase">+ {resultData.scoreEarned} Intel Points Earned</p>
              <p className="text-[10px] mt-6 text-emerald-500/70 tracking-widest uppercase animate-pulse font-black">Establishing Secure Connection to Q-Branch...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
