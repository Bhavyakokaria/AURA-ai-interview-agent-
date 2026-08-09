'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Candidate, FocusDay } from '@/lib/types';
import { selectFocusDays } from '@/lib/focusDays';
import { User, Briefcase, GraduationCap, Award, Play, Target, HelpCircle, CheckCircle2, AlertTriangle } from 'lucide-react';

interface CandidateSelectorProps {
  candidates: Candidate[];
  selectedCandidate: Candidate;
  onSelectCandidate: (candidate: Candidate) => void;
  onStartInterview: () => void;
  isLoading: boolean;
}

const categoryStyles = {
  gap: { badge: 'bg-rose-500/10 text-rose-400 border-rose-500/25', Icon: AlertTriangle },
  shaky: { badge: 'bg-amber-500/10 text-amber-400 border-amber-500/25', Icon: HelpCircle },
  confident: { badge: 'bg-teal-500/10 text-teal-400 border-teal-500/25', Icon: CheckCircle2 },
};

export default function CandidateSelector({
  candidates,
  selectedCandidate,
  onSelectCandidate,
  onStartInterview,
  isLoading,
}: CandidateSelectorProps) {
  const focusDays: FocusDay[] = useMemo(() => selectFocusDays(selectedCandidate), [selectedCandidate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-6"
    >
      <div className="glass-panel p-4 sm:p-6 rounded-2xl">
        <label className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-[color:var(--dim)] mb-2">
          select candidate - profile
        </label>
        <select
          value={selectedCandidate.member.id}
          onChange={(e) => {
            const found = candidates.find((c) => c.member.id === e.target.value);
            if (found) onSelectCandidate(found);
          }}
          className="w-full glass-input px-4 py-3 rounded-xl font-medium text-[color:var(--foreground)] cursor-pointer text-sm sm:text-base"
        >
          {candidates.map((c) => (
            <option key={c.member.id} value={c.member.id} className="bg-[#0a0e14] text-[color:var(--foreground)]">
              {c.member.name} — {c.member.jobRole} ({c.member.yearsExperience} yrs exp)
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <motion.div
          key={selectedCandidate.member.id + '-profile'}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="glass-panel p-5 sm:p-6 rounded-2xl md:col-span-1 space-y-4"
        >
          <div className="flex items-center space-x-3 pb-3 border-b border-[color:var(--border)]">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-[color:var(--amber)] shrink-0">
              <User className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-[color:var(--foreground)] truncate">{selectedCandidate.member.name}</h2>
              <span className="inline-block text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                {selectedCandidate.member.status}
              </span>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center text-[color:var(--foreground)]">
              <Briefcase className="w-4 h-4 mr-2 text-[color:var(--amber)] shrink-0" />
              <span className="truncate">{selectedCandidate.member.jobRole}</span>
            </div>
            <div className="flex items-center text-[color:var(--foreground)]">
              <Award className="w-4 h-4 mr-2 text-teal-400 shrink-0" />
              <span>{selectedCandidate.member.yearsExperience} Years Experience</span>
            </div>
            <div className="flex items-center text-[color:var(--foreground)]">
              <GraduationCap className="w-4 h-4 mr-2 text-rose-300 shrink-0" />
              <span className="truncate">{selectedCandidate.member.education}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-[color:var(--border)] grid grid-cols-3 gap-2 text-center">
            {[
              { val: selectedCandidate.signals.missionsCompleted, label: 'Missions', color: 'text-[color:var(--amber)]' },
              { val: selectedCandidate.signals.missionsFirstTry, label: '1st Try', color: 'text-teal-400' },
              { val: selectedCandidate.signals.commitDays, label: 'Commits', color: 'text-rose-300' },
            ].map((s) => (
              <div key={s.label} className="bg-black/20 p-2 rounded-lg">
                <div className={`text-lg font-bold font-mono ${s.color}`}>{s.val}</div>
                <div className="text-[9px] text-[color:var(--dim)] uppercase tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          key={selectedCandidate.member.id + '-focus'}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="glass-panel p-5 sm:p-6 rounded-2xl md:col-span-2 space-y-4 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-[color:var(--amber)]" />
                <h3 className="text-sm sm:text-base font-semibold text-[color:var(--foreground)]">Target Interview Focus Areas</h3>
              </div>
              <span className="font-mono text-[10px] text-[color:var(--dim)] bg-black/30 px-2 py-1 rounded-md">
                {focusDays.length} DAYS SELECTED
              </span>
            </div>

            <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
              {focusDays.map((fd, i) => {
                const style = categoryStyles[fd.category];
                const Icon = style.Icon;
                return (
                  <motion.div
                    key={fd.day}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-20px' }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                    className="p-3 rounded-xl bg-black/20 border border-[color:var(--border)] flex items-start justify-between gap-2 text-xs hover:border-white/15 transition"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-[color:var(--amber)]">d{String(fd.day).padStart(2, '0')}</span>
                        <span className="text-[color:var(--foreground)] font-medium truncate">{fd.title}</span>
                      </div>
                      <p className="text-[11px] text-[color:var(--dim)] line-clamp-1">{fd.reasoning}</p>
                    </div>
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-md text-[10px] font-mono font-semibold uppercase border shrink-0 ${style.badge}`}>
                      <Icon className="w-3 h-3" />
                      <span>{fd.category}</span>
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStartInterview}
            disabled={isLoading}
            className="w-full mt-4 py-3.5 px-6 rounded-xl font-semibold text-[#0a0e14] bg-[color:var(--amber)] hover:brightness-110 shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <span className="inline-flex items-center space-x-2">
                <span className="w-4 h-4 border-2 border-[#0a0e14] border-t-transparent rounded-full animate-spin" />
                <span>Initializing Session...</span>
              </span>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>Start Technical Interview</span>
              </>
            )}
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}