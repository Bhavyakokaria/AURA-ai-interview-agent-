'use client';

import React from 'react';
import { Candidate, InterviewFeedback } from '@/lib/types';
import { Award, CheckCircle2, AlertTriangle, ArrowRight, RotateCcw, FileText } from 'lucide-react';

interface FeedbackReportProps {
  candidate: Candidate;
  feedback: InterviewFeedback;
  questionCount: number;
  coveredDaysCount: number;
  onReset: () => void;
}

export default function FeedbackReport({
  candidate,
  feedback,
  questionCount,
  coveredDaysCount,
  onReset,
}: FeedbackReportProps) {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl border-emerald-500/30 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Award className="w-4 h-4" />
              <span>Assessment Completed</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100">Technical Evaluation Report: {candidate.member.name}</h1>
            <p className="text-sm text-slate-400 mt-1">
              {candidate.member.jobRole} • {candidate.member.yearsExperience} Years Exp
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-slate-800/80 px-4 py-2 rounded-xl text-center border border-slate-700">
              <div className="text-xl font-bold text-indigo-400">{questionCount}</div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Questions</div>
            </div>
            <div className="bg-slate-800/80 px-4 py-2 rounded-xl text-center border border-slate-700">
              <div className="text-xl font-bold text-purple-400">{coveredDaysCount}</div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Days Covered</div>
            </div>
          </div>
        </div>
      </div>

      {/* Executive Summary Card */}
      <div className="glass-panel p-6 rounded-2xl space-y-3 border-indigo-500/20">
        <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-sm">
          <FileText className="w-4 h-4" />
          <span>Executive Summary</span>
        </div>
        <p className="text-slate-200 leading-relaxed text-sm md:text-base">{feedback.summary}</p>
      </div>

      {/* Strengths and Gaps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Key Strengths */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 border-emerald-500/20">
          <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>Key Demonstrated Strengths</span>
          </div>
          <ul className="space-y-3">
            {feedback.strengths.map((strength, index) => (
              <li key={index} className="flex items-start space-x-3 text-sm text-slate-200 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  ✓
                </span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Identified Knowledge Gaps */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 border-amber-500/20">
          <div className="flex items-center space-x-2 text-amber-400 font-semibold text-sm">
            <AlertTriangle className="w-5 h-5" />
            <span>Identified Knowledge Gaps</span>
          </div>
          <ul className="space-y-3">
            {feedback.gaps.map((gap, index) => (
              <li key={index} className="flex items-start space-x-3 text-sm text-slate-200 bg-amber-500/5 p-3 rounded-xl border border-amber-500/10">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  !
                </span>
                <span>{gap}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommended Next Steps */}
      <div className="glass-panel p-6 rounded-2xl space-y-4 border-purple-500/20">
        <div className="flex items-center space-x-2 text-purple-400 font-semibold text-sm">
          <ArrowRight className="w-5 h-5" />
          <span>Recommended Next Steps & Actionable Learning</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {feedback.next.map((step, index) => (
            <div key={index} className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-purple-400">Step 0{index + 1}</span>
              <p className="text-xs text-slate-300 font-medium leading-normal">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex justify-center pt-2">
        <button
          onClick={onReset}
          className="py-3.5 px-8 rounded-xl font-semibold text-white bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 border border-slate-700 shadow-lg transition flex items-center space-x-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Assess Another Candidate</span>
        </button>
      </div>
    </div>
  );
}
