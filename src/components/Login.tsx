'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Send, AlertTriangle, Terminal } from 'lucide-react';
import { useGameState } from '@/contexts/GameStateContext';

export default function Login() {
  const { login } = useGameState();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setTimeout(() => {
      setStatus('sent');
    }, 1500);
  };

  const handleSimulateClick = () => {
    login(email);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="scanline"></div>
      
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full glass-panel p-8 rounded-2xl relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 bg-slate-900 rounded-xl border border-white/10 mb-4 relative">
            <div className="absolute inset-0 bg-violet-500 blur-lg opacity-20"></div>
            <Shield className="w-12 h-12 text-violet-400 relative z-10" />
          </div>
          <h1 className="text-xl font-black tracking-[0.3em] uppercase font-mono-spy text-white">Handshake Protocol</h1>
          <p className="text-[10px] text-violet-500 font-bold tracking-widest uppercase mt-2">Level 4 Encryption Active</p>
        </div>

        {status === 'idle' || status === 'error' ? (
          <form onSubmit={handleRequest} className="space-y-6">
            <div>
              <label className="block text-[10px] font-mono-spy text-slate-500 uppercase tracking-widest mb-2">Operative Identifier (Email)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Terminal className="h-4 w-4 text-slate-600" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm font-mono-spy focus:outline-none focus:border-violet-500/50 transition-all text-violet-100 placeholder:text-slate-700"
                  placeholder="agent@qbranch.gov"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-3 rounded-lg transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(139,92,246,0.3)]"
            >
              <Send className="w-4 h-4" /> Initialize Connection
            </button>
          </form>
        ) : status === 'loading' ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="font-mono-spy text-[10px] uppercase tracking-widest animate-pulse">Establishing Secure Tunnel...</p>
          </div>
        ) : (
          <div className="text-center space-y-8 py-4">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <p className="text-[10px] font-mono-spy text-emerald-500 uppercase tracking-widest mb-2">Token Transmitted</p>
              <p className="font-bold text-white tracking-tight">{email}</p>
            </div>
            <div className="space-y-4">
              <p className="text-[9px] text-slate-500 uppercase tracking-[0.2em] leading-relaxed">
                Verification required. Access the link sent to your operative device to proceed.
              </p>
              <button
                onClick={handleSimulateClick}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition-all uppercase tracking-widest text-[10px]"
              >
                Simulate Secure Callback
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center opacity-40">
          <span className="text-[8px] font-mono-spy uppercase">Status: Awaiting_Auth</span>
          <span className="text-[8px] font-mono-spy uppercase">System: Q_OS_v2.4</span>
        </div>
      </motion.div>
    </div>
  );
}
