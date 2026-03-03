import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Radio, Activity, Volume2, XCircle, Terminal, AlertTriangle } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

export default function LiveSpyBot({ onClose }: { onClose: () => void }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);

  const startSession = async () => {
    try {
      setError(null);

      // Audio Setup
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      await audioContextRef.current.resume();
      nextStartTimeRef.current = audioContextRef.current.currentTime;

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      streamRef.current = stream;

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const sessionPromise = ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-09-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Fenrir" } },
          },
          systemInstruction: {
            parts: [{ text: "You are Q, the Quartermaster of MI6. You are talking to a field agent via a secure audio uplink. You are helpful, slightly impatient, and very knowledgeable about spycraft, gadgets, and the current mission. Keep your responses concise and professional. Do not break character. Use British spelling and terminology." }]
          },
        },
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            startAudioInput(stream);
          },
          onmessage: (msg: LiveServerMessage) => {
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
              setIsSpeaking(true);
              playAudioChunk(audioData);
            }
            
            if (msg.serverContent?.turnComplete) {
              setIsSpeaking(false);
            }
          },
          onclose: () => {
            setIsConnected(false);
            setIsSpeaking(false);
          },
          onerror: (err: any) => {
            console.error("Session error:", err);
            setError("Secure uplink interrupted.");
            cleanup();
          }
        }
      });
      
      sessionPromiseRef.current = sessionPromise;

    } catch (err: any) {
      console.error("Connection failed:", err);
      setError(err.message || "Secure uplink failed.");
      cleanup();
    }
  };

  const startAudioInput = (stream: MediaStream) => {
    if (!audioContextRef.current) return;

    const source = audioContextRef.current.createMediaStreamSource(stream);
    const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
    
    processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      
      // Calculate volume for UI visualization
      let sum = 0;
      for (let i = 0; i < inputData.length; i++) {
        sum += inputData[i] * inputData[i];
      }
      setVolume(Math.sqrt(sum / inputData.length));

      // Convert to PCM 16-bit
      const pcmData = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        const s = Math.max(-1, Math.min(1, inputData[i]));
        pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }
      
      // Convert to base64
      const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
      
      // Send to session
      if (sessionPromiseRef.current) {
        sessionPromiseRef.current.then(session => {
          session.sendRealtimeInput({
            media: {
              mimeType: "audio/pcm;rate=" + audioContextRef.current?.sampleRate,
              data: base64Data
            }
          });
        });
      }
    };

    source.connect(processor);
    processor.connect(audioContextRef.current.destination);
    
    sourceRef.current = source;
    processorRef.current = processor;
  };

  const playAudioChunk = (base64Data: string) => {
    if (!audioContextRef.current) return;

    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const pcmData = new Int16Array(bytes.buffer);
    const float32Data = new Float32Array(pcmData.length);
    for (let i = 0; i < pcmData.length; i++) {
      float32Data[i] = pcmData[i] / 32768.0;
    }

    const buffer = audioContextRef.current.createBuffer(1, float32Data.length, 24000);
    buffer.getChannelData(0).set(float32Data);

    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);

    const currentTime = audioContextRef.current.currentTime;
    if (nextStartTimeRef.current < currentTime) {
      nextStartTimeRef.current = currentTime;
    }
    
    source.start(nextStartTimeRef.current);
    nextStartTimeRef.current += buffer.duration;
  };

  const cleanup = () => {
    if (sessionPromiseRef.current) {
      // sessionPromiseRef.current.then(session => session.close()); // Assuming close exists or just let it drop
      // The SDK might handle cleanup on disconnect
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (processorRef.current && sourceRef.current) {
      processorRef.current.disconnect();
      sourceRef.current.disconnect();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsConnected(false);
    setIsSpeaking(false);
  };

  useEffect(() => {
    return () => cleanup();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed bottom-4 right-4 z-50"
    >
      <div className="bg-[#050b14]/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.3)] w-80 overflow-hidden">
        {/* Header */}
        <div className="bg-cyan-900/20 p-3 border-b border-cyan-500/20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Radio className={`w-4 h-4 ${isConnected ? 'text-emerald-400 animate-pulse' : 'text-cyan-600'}`} />
            <span className="text-xs font-bold tracking-widest text-cyan-300">Q-BRANCH UPLINK</span>
          </div>
          <button onClick={onClose} className="text-cyan-600 hover:text-cyan-400 transition-colors">
            <XCircle className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center justify-center gap-6 min-h-[200px]">
          {error ? (
            <div className="text-center">
              <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-xs text-red-400 font-mono">{error}</p>
              <button 
                onClick={startSession}
                className="mt-4 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs hover:bg-red-500/20"
              >
                RETRY CONNECTION
              </button>
            </div>
          ) : !isConnected ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-4 relative group cursor-pointer hover:bg-cyan-500/20 transition-colors" onClick={startSession}>
                <div className="absolute inset-0 rounded-full border border-cyan-500/50 animate-ping opacity-20"></div>
                <Mic className="w-6 h-6 text-cyan-400" />
              </div>
              <p className="text-xs text-cyan-500/70 font-mono tracking-wider mb-2">SECURE LINE READY</p>
              <button 
                onClick={startSession}
                className="px-6 py-2 bg-cyan-500 text-[#050b14] font-bold text-xs rounded-full hover:bg-cyan-400 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.4)]"
              >
                ESTABLISH LINK
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center w-full">
              {/* Visualizer */}
              <div className="flex items-center justify-center gap-1 h-12 mb-6 w-full">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 bg-cyan-400 rounded-full"
                    animate={{ 
                      height: isSpeaking 
                        ? [10, 20 + Math.random() * 30, 10] 
                        : [8, 8 + volume * 100, 8]
                    }}
                    transition={{ duration: 0.2, repeat: Infinity }}
                  />
                ))}
              </div>

              <div className="text-center space-y-2">
                <p className="text-xs font-bold text-cyan-300 tracking-widest uppercase">
                  {isSpeaking ? "INCOMING TRANSMISSION..." : "LISTENING..."}
                </p>
                <p className="text-[10px] text-cyan-600 font-mono">
                  {isSpeaking ? "DECRYPTING AUDIO STREAM" : "ENCRYPTING VOICE DATA"}
                </p>
              </div>

              <button 
                onClick={cleanup}
                className="mt-6 p-3 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors"
                title="Disconnect"
              >
                <MicOff className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="bg-[#050b14] p-2 border-t border-cyan-500/10 flex justify-between items-center text-[9px] text-cyan-700 font-mono">
          <span>ENCRYPTION: AES-256</span>
          <span>LATENCY: 12ms</span>
        </div>
      </div>
    </motion.div>
  );
}
