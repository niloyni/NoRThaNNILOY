import React from "react";
import { Mic, MicOff, Power, PowerOff, Zap, Atom } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface VoiceInterfaceProps {
  isConnected: boolean;
  isRecording: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

export function VoiceInterface({
  isConnected,
  isRecording,
  onConnect,
  onDisconnect,
  onStartRecording,
  onStopRecording,
}: VoiceInterfaceProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-12 py-16">
      <div className="relative">
        {/* Pulsing Rings */}
        <AnimatePresence>
          {isRecording && (
            <>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.5, opacity: 0.2 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-blue-500"
              />
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 2, opacity: 0.1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                className="absolute inset-0 rounded-full bg-blue-400"
              />
            </>
          )}
        </AnimatePresence>

        {/* Central Orb */}
        <motion.div
          animate={{
            scale: isRecording ? [1, 1.1, 1] : 1,
            boxShadow: isRecording 
              ? "0 0 40px rgba(59, 130, 246, 0.4)" 
              : "0 0 20px rgba(255, 255, 255, 0.05)"
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`w-40 h-40 rounded-full flex items-center justify-center relative z-10 
            ${isConnected ? "bg-blue-600/20 border-2 border-blue-500/30" : "bg-white/5 border border-white/10"}`}
        >
          <div className={`w-32 h-32 rounded-full flex items-center justify-center 
            ${isConnected ? "bg-blue-500/30" : "bg-white/5"}`}>
            {isConnected ? (
              <Zap className={`w-12 h-12 ${isRecording ? "text-blue-300 animate-pulse" : "text-blue-500"}`} />
            ) : (
              <Atom className="w-12 h-12 text-white/20" />
            )}
          </div>
        </motion.div>
      </div>

      <div className="flex items-center gap-6">
        {!isConnected ? (
          <button
            onClick={onConnect}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 transition-all font-medium shadow-lg shadow-blue-900/20"
          >
            <Power className="w-5 h-5" />
            <span>Awaken Pablo</span>
          </button>
        ) : (
          <>
            <button
              onClick={() => isRecording ? onStopRecording() : onStartRecording()}
              className={`p-6 rounded-full transition-all shadow-xl
                ${isRecording 
                  ? "bg-red-500 scale-110 shadow-red-900/40" 
                  : "bg-blue-600 hover:bg-blue-500 shadow-blue-900/40"}`}
            >
              {isRecording ? <Mic className="w-8 h-8 text-white" /> : <MicOff className="w-8 h-8 text-white" />}
            </button>
            
            <button
              onClick={onDisconnect}
              className="p-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
              title="Disconnect"
            >
              <PowerOff className="w-5 h-5 text-white/60" />
            </button>
          </>
        )}
      </div>
      
      <p className="text-sm text-white/40 font-medium tracking-wide">
        {!isConnected 
          ? "Connect to start your physics journey" 
          : isRecording 
            ? "Pablo is listening... Click to stop" 
            : "Click the mic to speak"}
      </p>
    </div>
  );
}
