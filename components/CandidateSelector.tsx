'use client';

import React, { useMemo } from 'react';
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

export default function CandidateSelector({
  candidates,
  selectedCandidate,
  onSelectCandidate,
  onStartInterview,
  isLoading,
}: CandidateSelectorProps) {
  const focusDays: FocusDay[] = useMemo(() => {
    return selectFocusDays(selectedCandidate);
  }, [selectedCandidate]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Candidate Dropdown Selector */}
      <div className="glass-panel p-6 rounded-2xl">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Select Candidate Profile for Assessment
        </label>
        <select
          value={selectedCandidate.member.id}
          onChange={(e) => {
            const found = candidates.find((c) => c.member.id === e.target.value);
            if (found) onSelectCandidate(found);
          }}
          className="w-full glass-input px-4 py-3 rounded-xl font-medium text-slate-100 cursor-pointer text-base"
        >
          {candidates.map((c) => (
            <option key={c.member.id} value={c.member.id} className="bg-slate-900 text-slate-100">
              {c.member.name} — {c.member.jobRole} ({c.member.yearsExperience} yrs exp)
            </option>
          ))}
        </select>
      </div>

      {/* Candidate Card & Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="glass-panel p-6 rounded-2xl md:col-span-1 space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">{selectedCandidate.member.name}</h2>
              <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {selectedCandidate.member.status}
              </span>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center text-slate-300">
              <Briefcase className="w-4 h-4 mr-2 text-indigo-400 shrink-0" />
              <span>{selectedCandidate.member.jobRole}</span>
            </div>
            <div className="flex items-center text-slate-300">
              <Award className="w-4 h-4 mr-2 text-amber-400 shrink-0" />
              <span>{selectedCandidate.member.yearsExperience} Years Experience</span>
            </div>
            <div className="flex items-center text-slate-300">
              <GraduationCap className="w-4 h-4 mr-2 text-purple-400 shrink-0" />
              <span>{selectedCandidate.member.education}</span>
            </div>
          </div>

          {/* Cohort Signals */}
          <div className="pt-4 border-t border-slate-800 grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-800/40 p-2 rounded-lg">
              <div className="text-lg font-bold text-indigo-400">{selectedCandidate.signals.missionsCompleted}</div>
              <div className="text-[10px] text-slate-400 uppercase">Missions</div>
            </div>
            <div className="bg-slate-800/40 p-2 rounded-lg">
              <div className="text-lg font-bold text-emerald-400">{selectedCandidate.signals.missionsFirstTry}</div>
              <div className="text-[10px] text-slate-400 uppercase">1st Try</div>
            </div>
            <div className="bg-slate-800/40 p-2 rounded-lg">
              <div className="text-lg font-bold text-purple-400">{selectedCandidate.signals.commitDays}</div>
              <div className="text-[10px] text-slate-400 uppercase">Commit Days</div>
            </div>
          </div>
        </div>

        {/* Selected Focus Days Preview */}
        <div className="glass-panel p-6 rounded-2xl md:col-span-2 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-semibold text-slate-100">Target Interview Focus Areas</h3>
              </div>
              <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded-md">
                {focusDays.length} Curriculum Days Selected
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Our agent automatically classified this candidate's history to pick target curriculum days:
            </p>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {focusDays.map((fd) => {
                let categoryBadgeClass = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
                let Icon = CheckCircle2;
                if (fd.category === 'gap') {
                  categoryBadgeClass = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
                  Icon = AlertTriangle;
                } else if (fd.category === 'shaky') {
                  categoryBadgeClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                  Icon = HelpCircle;
                }

                return (
                  <div
                    key={fd.day}
                    className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 flex items-start justify-between text-xs hover:border-slate-700 transition"
                  >
                    <div className="space-y-1 pr-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-200">Day {fd.day}:</span>
                        <span className="text-slate-300 font-medium">{fd.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{fd.reasoning}</p>
                    </div>

                    <span
                      className={`inline-flex items-center space-x-1 px-2 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider border shrink-0 ${categoryBadgeClass}`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{fd.category}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={onStartInterview}
            disabled={isLoading}
            className="w-full mt-4 py-3.5 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 shadow-lg shadow-purple-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <span className="inline-flex items-center space-x-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Initializing Interview Session...</span>
              </span>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>Start Technical Interview</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
