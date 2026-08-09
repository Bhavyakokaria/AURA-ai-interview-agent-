'use client';

import { useScroll, useTransform } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Candidate, FocusDay, InterviewFeedback, TranscriptItem } from '@/lib/types';
import { selectFocusDays } from '@/lib/focusDays';
import CandidateSelector from '@/components/CandidateSelector';
import InterviewChat from '@/components/InterviewChat';
import FeedbackReport from '@/components/FeedbackReport';
import AnimatedBackground from '@/components/AnimatedBackground';
import { Sparkles, Terminal, Code2 } from 'lucide-react';

export default function Home() {
  const { scrollY } = useScroll();
  const headerY = useTransform(scrollY, [0, 200], [0, -20]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [isInterviewStarted, setIsInterviewStarted] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [questionCount, setQuestionCount] = useState<number>(0);
  const [coveredDays, setCoveredDays] = useState<number[]>([]);
  const [isDone, setIsDone] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const res = await fetch('/api/candidates');
        if (res.ok) {
          const data = await res.json();
          setCandidates(data.candidates);
          if (data.candidates.length > 0) {
            setSelectedCandidate(data.candidates[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching candidates:', err);
      }
    }
    loadInitialData();
  }, []);

  const focusDays: FocusDay[] = selectedCandidate ? selectFocusDays(selectedCandidate) : [];

  const handleStartInterview = async () => {
    if (!selectedCandidate) return;
    setIsLoading(true);

    const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setSessionId(newSessionId);

    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: newSessionId,
          candidate: selectedCandidate,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setTranscript([{ role: 'interviewer', content: data.reply }]);
        setQuestionCount(1);
        setIsInterviewStarted(true);
        if (focusDays.length > 0) {
          setCoveredDays([focusDays[0].day]);
        }
      } else {
        alert(data.error || 'Failed to start interview session');
      }
    } catch (err) {
      console.error('Error starting interview:', err);
      alert('Network error initializing interview.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (messageText: string) => {
    if (!sessionId || isLoading) return;

    const newTranscript: TranscriptItem[] = [...transcript, { role: 'candidate', content: messageText }];
    setTranscript(newTranscript);
    setIsLoading(true);

    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: messageText,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setTranscript([...newTranscript, { role: 'interviewer', content: data.reply }]);
        setQuestionCount((prev) => prev + 1);

        setCoveredDays((prev) => {
          if (prev.length < focusDays.length) {
            const nextFocus = focusDays.find((fd) => !prev.includes(fd.day));
            if (nextFocus) return [...prev, nextFocus.day];
          }
          return prev;
        });

        if (data.done) {
          setIsDone(true);
          setFeedback(data.feedback);
        }
      } else {
        alert(data.error || 'Error during interview turn');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to connect to interview server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setIsInterviewStarted(false);
    setIsDone(false);
    setFeedback(null);
    setTranscript([]);
    setQuestionCount(0);
    setCoveredDays([]);
    setSessionId('');
  };

  return (
    <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto p-3 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
      <AnimatedBackground />

      <motion.header
        style={{ y: headerY }}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-4 sm:p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[color:var(--amber)] flex items-center justify-center text-[#0a0e14] shadow-lg shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-extrabold text-[color:var(--foreground)] tracking-tight flex items-center space-x-2 flex-wrap font-mono">
              <span>AI Interview Agent</span>
              <span className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-400 border border-teal-500/25">
                live_api
              </span>
            </h1>
            <p className="text-xs text-[color:var(--dim)]">31-Day AI Cohort Technical Candidate Assessment</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-4 text-xs font-mono text-[color:var(--dim)]">
          <div className="flex items-center space-x-1.5">
            <Terminal className="w-4 h-4 text-[color:var(--amber)]" />
            <span>POST /api/interview</span>
          </div>
          {sessionId && (
            <div className="flex items-center space-x-1.5 bg-black/30 px-3 py-1.5 rounded-lg border border-[color:var(--border)]">
              <Code2 className="w-3.5 h-3.5 text-teal-400" />
              <span>{sessionId.substring(0, 16)}...</span>
            </div>
          )}
        </div>
      </motion.header>

      <div className="flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {!isInterviewStarted ? (
            selectedCandidate && (
              <motion.div key="selector" exit={{ opacity: 0, y: -12 }}>
                <CandidateSelector
                  candidates={candidates}
                  selectedCandidate={selectedCandidate}
                  onSelectCandidate={setSelectedCandidate}
                  onStartInterview={handleStartInterview}
                  isLoading={isLoading}
                />
              </motion.div>
            )
          ) : isDone && feedback && selectedCandidate ? (
            <motion.div key="feedback" exit={{ opacity: 0, y: -12 }}>
              <FeedbackReport
                candidate={selectedCandidate}
                feedback={feedback}
                questionCount={questionCount}
                coveredDaysCount={coveredDays.length}
                onReset={handleReset}
              />
            </motion.div>
          ) : (
            selectedCandidate && (
              <motion.div key="chat" exit={{ opacity: 0, y: -12 }}>
                <InterviewChat
                  candidate={selectedCandidate}
                  focusDays={focusDays}
                  transcript={transcript}
                  questionCount={questionCount}
                  coveredDays={coveredDays}
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                />
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}