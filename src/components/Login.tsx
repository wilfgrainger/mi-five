'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Send, AlertTriangle } from 'lucide-react';
import { useGameState } from '@/contexts/GameStateContext';

export default function Login() {
  const { login } = useGameState();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      // Since we're pure client-side, we simulate the "magic link" by logging in immediately after a short delay
      setTimeout(() => {
        setStatus('sent');
      }, 1000);
    } catch (e) {
      setStatus('error');
    }
  };

  const handleSimulateClick = () => {
    login(email);
  };

  return (
    <div className="min-h-screen bg-transparent text-white flex items-center justify-center font-sans p-4">
      <div className="max-w-md w-full border border-white/10 bg-black/40 backdrop-blur-2xl p-8 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative overflow-hidden">
        {/* Scanline effect */}
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20"></div>

        <div className="flex justify-center mb-8">
          <Shield className="w-16 h-16 text-violet-300" />
        </div>

        <h1 className="text-2xl font-bold text-center mb-2 tracking-wide uppercase">MI5 Secure Login</h1>
        <p className="text-center text-violet-400 text-sm mb-8 uppercase tracking-widest">Authorized Personnel Only</p>

        {status === 'idle' || status === 'error' ? (
          <form onSubmit={handleRequest} className="space-y-4 relative z-10">
            {status === 'error' && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> ACCESS DENIED. TRY AGAIN.
              </div>
            )}
            <div>
              <label className="block text-xs text-violet-400 mb-1 uppercase tracking-wider">Agent Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-3 text-violet-300 focus:outline-none focus:border-violet-400/50 focus:bg-white/5 transition-all shadow-inner"
                placeholder="agent@mi5.gov.uk"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-violet-300 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] uppercase tracking-widest"
            >
              <Send className="w-4 h-4" /> Request Access Link
            </button>
          </form>
        ) : status === 'loading' ? (
          <div className="text-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="inline-block w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full mb-4"
            />
            <p className="uppercase tracking-widest text-xs">Transmitting Request...</p>
          </div>
        ) : (
          <div className="text-center space-y-6 relative z-10">
            <div className="bg-black/40 border border-white/10 p-4 rounded-xl shadow-inner">
              <p className="mb-2 uppercase tracking-widest text-xs">Magic Link Transmitted To:</p>
              <p className="font-bold text-violet-300">{email}</p>
            </div>

            <div className="border-t border-dashed border-white/20 pt-6">
              <p className="text-xs text-violet-400 mb-4 uppercase tracking-wider font-bold">Verification simulated for prototype purposes:</p>
              <button
                onClick={handleSimulateClick}
                className="w-full bg-violet-500 text-black font-bold py-3 rounded-xl hover:bg-violet-400 transition-all shadow-[0_0_20px_rgba(139,92,246,0.4)] uppercase tracking-widest"
              >
                Simulate Email Click
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
