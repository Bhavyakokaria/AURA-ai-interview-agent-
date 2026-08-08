'use client';

import React, { useState, useRef, useEffect } from 'react';
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
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
    <div className="w-full max-w-4xl mx-auto flex flex-col h-[750px] glass-panel rounded-2xl overflow-hidden border border-slate-800">
      {/* Header Bar with Live Badges */}
      <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <span>Interviewing {candidate.member.name}</span>
            </h2>
            <p className="text-xs text-slate-400">{candidate.member.jobRole} • Senior Tech Lead AI Interviewer</p>
          </div>
        </div>

        {/* Live Status Badges */}
        <div className="flex items-center space-x-3">
          {/* Question Count Badge */}
          <div
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
              isQuestionsMet
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Questions: {questionCount}/8</span>
            {isQuestionsMet && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
          </div>

          {/* Days Covered Badge */}
          <div
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
              isDaysMet
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-purple-500/10 text-purple-300 border-purple-500/30'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Days covered: {coveredDays.length}/4</span>
            {isDaysMet && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
          </div>
        </div>
      </div>

      {/* Focus Topics Pill Tracker Bar */}
      <div className="px-4 py-2 bg-slate-950/40 border-b border-slate-800/60 flex items-center space-x-2 overflow-x-auto text-[11px] shrink-0">
        <span className="text-slate-400 font-medium uppercase tracking-wider text-[10px] shrink-0">Coverage:</span>
        {focusDays.map((fd) => {
          const isCovered = coveredDays.includes(fd.day);
          return (
            <span
              key={fd.day}
              className={`px-2 py-0.5 rounded-md border shrink-0 transition ${
                isCovered
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold'
                  : 'bg-slate-800/40 text-slate-400 border-slate-700/50'
              }`}
            >
              Day {fd.day}: {fd.title} {isCovered ? '✓' : ''}
            </span>
          );
        })}
      </div>

      {/* Messages Transcript Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {transcript.map((msg, index) => {
          const isInterviewer = msg.role === 'interviewer';
          return (
            <div
              key={index}
              className={`flex items-start space-x-3 ${isInterviewer ? 'justify-start' : 'justify-end'}`}
            >
              {isInterviewer && (
                <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                  isInterviewer
                    ? 'bg-slate-800/90 text-slate-100 border border-slate-700/80 rounded-tl-none'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-none'
                }`}
              >
                <div className="flex items-center justify-between mb-1 text-[10px] opacity-75">
                  <span className="font-semibold uppercase tracking-wider">
                    {isInterviewer ? 'Senior Tech Lead' : candidate.member.name}
                  </span>
                </div>
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>

              {!isInterviewer && (
                <div className="w-8 h-8 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator when waiting for LLM response */}
        {isLoading && (
          <div className="flex items-start space-x-3 justify-start">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0 mt-1">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl rounded-tl-none p-4 flex items-center space-x-2">
              <span className="text-xs text-slate-400 font-medium">Interviewer is formulating next question...</span>
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-indigo-400 pulse-dot-1"></div>
                <div className="w-2 h-2 rounded-full bg-purple-400 pulse-dot-2"></div>
                <div className="w-2 h-2 rounded-full bg-pink-400 pulse-dot-3"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center space-x-3 shrink-0">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your technical response here..."
          disabled={isLoading}
          className="flex-1 glass-input px-4 py-3 rounded-xl text-sm placeholder:text-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={isLoading || !inputMessage.trim()}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-sm shadow-md flex items-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
        >
          <span>Send</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
