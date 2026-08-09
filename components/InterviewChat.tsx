'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Candidate, FocusDay, TranscriptItem } from '@/lib/types';
import { Bot, User, Send, CheckCircle2, BookOpen, MessageSquare } from 'lucide-react';

interface InterviewChatProps {
  candidate: Candidate;
  focusDays: FocusDay[];
  transcript: TranscriptItem[];
  questionCount: number;
  coveredDays: number[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export default function InterviewChat({
  candidate,
  focusDays,
  transcript,
  questionCount,
  coveredDays,
  onSendMessage,
  isLoading,
}: InterviewChatProps) {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;
    onSendMessage(inputMessage.trim());
    setInputMessage('');
  };

  const isQuestionsMet = questionCount >= 8;
  const isDaysMet = coveredDays.length >= 4;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-4xl mx-auto flex flex-col h-[80vh] sm:h-[750px] glass-panel rounded-2xl overflow-hidden border border-[color:var(--border)]"
    >
      <div className="p-3 sm:p-4 bg-black/20 border-b border-[color:var(--border)] flex flex-wrap items-center justify-between gap-2 sm:gap-3 shrink-0">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-[color:var(--amber)] shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-[color:var(--foreground)] truncate">Interviewing {candidate.member.name}</h2>
            <p className="text-[11px] sm:text-xs text-[color:var(--dim)] truncate">{candidate.member.jobRole} • Senior Tech Lead</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border font-mono text-[10px] sm:text-xs font-semibold ${
            isQuestionsMet ? 'bg-teal-500/10 text-teal-400 border-teal-500/30' : 'bg-blue-500/10 text-[color:var(--amber)] border-blue-500/25'
          }`}>
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{questionCount}/8</span>
            {isQuestionsMet && <CheckCircle2 className="w-3.5 h-3.5" />}
          </div>
          <div className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border font-mono text-[10px] sm:text-xs font-semibold ${
            isDaysMet ? 'bg-teal-500/10 text-teal-400 border-teal-500/30' : 'bg-rose-500/10 text-rose-300 border-rose-500/25'
          }`}>
            <BookOpen className="w-3.5 h-3.5" />
            <span>{coveredDays.length}/4</span>
            {isDaysMet && <CheckCircle2 className="w-3.5 h-3.5" />}
          </div>
        </div>
      </div>

      <div className="px-3 sm:px-4 py-2 bg-black/30 border-b border-[color:var(--border)]/60 flex items-center space-x-2 overflow-x-auto text-[11px] shrink-0 font-mono">
        <span className="text-[color:var(--dim)] shrink-0">
          coverage <span className="cursor-blink">_</span>
        </span>
        {focusDays.map((fd) => {
          const isCovered = coveredDays.includes(fd.day);
          return (
            <motion.span
              key={fd.day}
              animate={{ scale: isCovered ? [1, 1.08, 1] : 1 }}
              transition={{ duration: 0.3 }}
              className={`px-2 py-0.5 rounded-md border shrink-0 transition ${
                isCovered
                  ? 'bg-teal-500/15 text-teal-300 border-teal-500/35 font-semibold'
                  : 'bg-white/5 text-[color:var(--dim)] border-[color:var(--border)]'
              }`}
            >
              d{String(fd.day).padStart(2, '0')} {isCovered ? '✓' : ''}
            </motion.span>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
        <AnimatePresence initial={false}>
          {transcript.map((msg, index) => {
            const isInterviewer = msg.role === 'interviewer';
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={`flex items-start space-x-2 sm:space-x-3 ${isInterviewer ? 'justify-start' : 'justify-end'}`}
              >
                {isInterviewer && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-[color:var(--amber)] shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-3 sm:p-4 text-sm leading-relaxed shadow-sm ${
                    isInterviewer
                      ? 'bg-white/5 text-[color:var(--foreground)] border border-[color:var(--border)] rounded-tl-none'
                      : 'bg-[color:var(--amber)] text-[#0a0e14] rounded-tr-none font-medium'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1 text-[10px] font-mono opacity-70">
                    <span className="font-semibold uppercase tracking-wider">
                      {isInterviewer ? 'senior_tech_lead' : candidate.member.name.split(' ')[0].toLowerCase()}
                    </span>
                  </div>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
                {!isInterviewer && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-black/30 border border-[color:var(--border)] flex items-center justify-center text-[color:var(--foreground)] shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start space-x-3 justify-start">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-[color:var(--amber)] shrink-0 mt-1">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white/5 border border-[color:var(--border)] rounded-2xl rounded-tl-none p-4 flex items-center space-x-2">
              <span className="text-xs text-[color:var(--dim)] font-mono">formulating next question</span>
              <div className="flex space-x-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-[color:var(--amber)]"
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-3 sm:p-4 bg-black/20 border-t border-[color:var(--border)] flex items-center space-x-2 sm:space-x-3 shrink-0">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your response..."
          disabled={isLoading}
          className="flex-1 glass-input px-4 py-3 rounded-xl text-sm placeholder:text-[color:var(--dim)] focus:outline-none min-w-0"
        />
        <motion.button
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={isLoading || !inputMessage.trim()}
          className="px-4 sm:px-5 py-3 rounded-xl bg-[color:var(--amber)] hover:brightness-110 text-[#0a0e14] font-semibold text-sm shadow-md flex items-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shrink-0"
        >
          <span className="hidden sm:inline">Send</span>
          <Send className="w-4 h-4" />
        </motion.button>
      </form>
    </motion.div>
  );
}