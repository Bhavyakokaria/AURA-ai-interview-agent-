'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Candidate, InterviewFeedback } from '@/lib/types';
import { Award, CheckCircle2, AlertTriangle, ArrowRight, RotateCcw, FileText } from 'lucide-react';

interface FeedbackReportProps {
  candidate: Candidate;
  feedback: InterviewFeedback;
  questionCount: number;
  coveredDaysCount: number;
  onReset: () => void;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function FeedbackReport({ candidate, feedback, questionCount, coveredDaysCount, onReset }: FeedbackReportProps) {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-6">
      <motion.div variants={item} className="glass-panel p-5 sm:p-6 rounded-2xl border-teal-500/25 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-[11px] font-mono font-semibold uppercase tracking-wider mb-2">
              <Award className="w-4 h-4" />
              <span>assessment complete</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[color:var(--foreground)]">Technical Evaluation: {candidate.member.name}</h1>
            <p className="text-sm text-[color:var(--dim)] mt-1">{candidate.member.jobRole} • {candidate.member.yearsExperience} Years Exp</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-black/30 px-4 py-2 rounded-xl text-center border border-[color:var(--border)]">
              <div className="text-xl font-bold font-mono text-[color:var(--amber)]">{questionCount}</div>
              <div className="text-[9px] text-[color:var(--dim)] uppercase font-semibold">Questions</div>
            </div>
            <div className="bg-black/30 px-4 py-2 rounded-xl text-center border border-[color:var(--border)]">
              <div className="text-xl font-bold font-mono text-teal-400">{coveredDaysCount}</div>
              <div className="text-[9px] text-[color:var(--dim)] uppercase font-semibold">Days</div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={item} className="glass-panel p-5 sm:p-6 rounded-2xl space-y-3">
        <div className="flex items-center space-x-2 text-[color:var(--amber)] font-mono font-semibold text-sm">
          <FileText className="w-4 h-4" />
          <span>executive summary</span>
        </div>
        <p className="text-[color:var(--foreground)] leading-relaxed text-sm sm:text-base">{feedback.summary}</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <motion.div variants={item} className="glass-panel p-5 sm:p-6 rounded-2xl space-y-4">
          <div className="flex items-center space-x-2 text-teal-400 font-mono font-semibold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>strengths</span>
          </div>
          <ul className="space-y-3">
            {feedback.strengths.map((s, i) => (
              <li key={i} className="flex items-start space-x-3 text-sm text-[color:var(--foreground)] bg-teal-500/5 p-3 rounded-xl border border-teal-500/15">
                <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div variants={item} className="glass-panel p-5 sm:p-6 rounded-2xl space-y-4">
          <div className="flex items-center space-x-2 text-rose-400 font-mono font-semibold text-sm">
            <AlertTriangle className="w-5 h-5" />
            <span>gaps</span>
          </div>
          <ul className="space-y-3">
            {feedback.gaps.map((g, i) => (
              <li key={i} className="flex items-start space-x-3 text-sm text-[color:var(--foreground)] bg-rose-500/5 p-3 rounded-xl border border-rose-500/15">
                <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">!</span>
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      <motion.div variants={item} className="glass-panel p-5 sm:p-6 rounded-2xl space-y-4">
        <div className="flex items-center space-x-2 text-[color:var(--amber)] font-mono font-semibold text-sm">
          <ArrowRight className="w-5 h-5" />
          <span>next_steps</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {feedback.next.map((step, i) => (
            <div key={i} className="bg-black/20 p-4 rounded-xl border border-[color:var(--border)] space-y-2">
              <span className="text-xs font-mono font-bold text-[color:var(--amber)]">step_0{i + 1}</span>
              <p className="text-xs text-[color:var(--foreground)] font-medium leading-normal">{step}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={item} className="flex justify-center pt-2">
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={onReset}
          className="py-3.5 px-8 rounded-xl font-semibold text-[color:var(--foreground)] bg-white/5 hover:bg-white/10 border border-[color:var(--border)] shadow-lg transition flex items-center space-x-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Assess Another Candidate</span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}