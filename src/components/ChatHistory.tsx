import React from "react";
import Markdown from "react-markdown";
import { Role, Message } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface ChatHistoryProps {
  messages: Message[];
}

export function ChatHistory({ messages }: ChatHistoryProps) {
  return (
    <div className="flex flex-col gap-6 px-6 pb-24 max-w-3xl mx-auto w-full">
      <AnimatePresence initial={false}>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col ${msg.role === Role.USER ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[85%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm
                ${msg.role === Role.USER 
                  ? "bg-blue-600/20 border border-blue-500/20 text-blue-100 rounded-tr-none" 
                  : "bg-white/5 border border-white/10 text-white/90 rounded-tl-none"}`}
            >
              <div className="markdown-body">
                <Markdown>{msg.text}</Markdown>
              </div>
            </div>
            <span className="text-[10px] text-white/20 font-mono mt-1.5 px-1">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
