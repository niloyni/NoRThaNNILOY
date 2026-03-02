/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from "react";
import { Header } from "./components/Header";
import { VoiceInterface } from "./components/VoiceInterface";
import { ChatHistory } from "./components/ChatHistory";
import { useGeminiLive } from "./hooks/useGeminiLive";
import { AlertCircle, Info, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const {
    isConnected,
    isRecording,
    messages,
    error,
    connect,
    disconnect,
    startRecording,
    stopRecording,
    clearMessages,
  } = useGeminiLive();

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 physics-gradient pointer-events-none" />
      <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none" />

      <Header isConnected={isConnected} />

      <main className="flex-1 flex flex-col relative z-10">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="flex justify-end px-6 pt-4">
            <AnimatePresence>
              {messages.length > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={clearMessages}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-400 border border-white/5 transition-all text-xs font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear History</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <VoiceInterface
            isConnected={isConnected}
            isRecording={isRecording}
            onConnect={connect}
            onDisconnect={disconnect}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
          />

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mx-6 mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <ChatHistory messages={messages} />
          <div ref={chatEndRef} />
        </div>

        {/* Footer Info */}
        <div className="p-6 border-t border-white/5 glass-panel">
          <div className="max-w-3xl mx-auto flex items-start gap-4 text-white/40">
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <p className="font-medium text-white/60 mb-1 tracking-wide uppercase">The Pablo Method</p>
              <p>
                Pablo uses the <span className="text-blue-400/60">Feynman Technique</span> to break down complex physics into simple, 
                relatable analogies. Ask him anything from quantum entanglement to why the sky is blue. 
                Supports English and Bengali (বাংলা).
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

