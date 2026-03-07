'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Send, AlertTriangle, Terminal, Cpu } from 'lucide-react';
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
    <div className="min-h-screen bg-[#0a0a0c] text-slate-300 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="scanline"></div>
      <div className="hud-vignette"></div>
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full workstation-panel p-10 rounded-lg border-t-4 border-t-blue-600 relative z-10 shadow-[0_0_100px_rgba(0,0,0,0.8)]"
      >
        <div className="watermark opacity-[0.02]">GATEWAY_AUTH</div>
        
        <div className="flex flex-col items-center mb-12 relative z-10">
          <div className="p-5 bg-blue-600/10 border border-blue-500/20 rounded mb-6 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
            <Shield className="w-14 h-14 text-blue-500" />
          </div>
          <h1 className="text-2xl font-black tracking-[0.4em] uppercase font-technical text-white glow-cia">Terminal_Handshake</h1>
          <div className="flex items-center gap-3 mt-4">
            <div className="flex gap-1">
              {[1,2,3].map(i => <div key={i} className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: `${i*0.2}s` }}></div>)}
            </div>
            <p className="text-[10px] text-blue-500 font-technical font-bold uppercase tracking-widest">Protocol: Secure_Gateway_v4</p>
          </div>
        </div>

        {status === 'idle' || status === 'error' ? (
          <form onSubmit={handleRequest} className="space-y-8 relative z-10">
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <label className="block text-[10px] font-technical text-slate-500 font-bold uppercase tracking-[0.2em]">Operative_Identifier</label>
                <span className="text-[8px] font-technical text-slate-600">INPUT_REQUIRED</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Terminal className="h-4 w-4 text-blue-500/40" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/60 border-2 border-white/5 rounded py-4 pl-12 pr-4 text-sm font-technical focus:outline-none focus:border-blue-500/50 transition-all text-white placeholder:text-slate-800"
                  placeholder="agent@intel.agency.gov"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded transition-all uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(59,130,246,0.2)] group"
            >
              <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" /> 
              Initialize_Uplink
            </button>
          </form>
        ) : status === 'loading' ? (
          <div className="text-center py-16 relative z-10">
            <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-8"></div>
            <p className="font-technical text-xs font-bold text-blue-500 uppercase tracking-[0.4em] animate-pulse">Establishing_Secure_Tunnel...</p>
          </div>
        ) : (
          <div className="text-center space-y-10 py-4 relative z-10">
            <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded">
              <p className="text-[10px] font-technical text-emerald-500 font-black uppercase tracking-[0.3em] mb-3">Verification_Token_Relayed</p>
              <p className="font-bold text-white tracking-tight text-lg">{email}</p>
            </div>
            <div className="space-y-6">
              <p className="text-[10px] text-slate-500 font-technical uppercase tracking-[0.2em] leading-relaxed max-w-xs mx-auto">
                Authentication request successful. Access the encrypted link dispatched to your device.
              </p>
              <button
                onClick={handleSimulateClick}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded transition-all uppercase tracking-[0.3em] text-[10px] shadow-[0_0_40px_rgba(16,185,129,0.2)]"
              >
                Simulate_Secure_Callback
              </button>
            </div>
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center opacity-30">
          <div className="flex items-center gap-2">
            <Cpu className="w-3 h-3" />
            <span className="text-[8px] font-technical font-bold uppercase tracking-tighter">Status: Listening_on_Port_443</span>
          </div>
          <span className="text-[8px] font-technical font-bold uppercase tracking-tighter">System: INTEL_OS_v4.0.2</span>
        </div>
      </motion.div>
    </div>
  );
}
