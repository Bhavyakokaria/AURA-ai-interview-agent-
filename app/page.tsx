'use client';

import React, { useState, useEffect } from 'react';
import { Candidate, FocusDay, InterviewFeedback, TranscriptItem } from '@/lib/types';
import { selectFocusDays } from '@/lib/focusDays';
import CandidateSelector from '@/components/CandidateSelector';
import InterviewChat from '@/components/InterviewChat';
import FeedbackReport from '@/components/FeedbackReport';
import { Sparkles, Terminal, Code2 } from 'lucide-react';

export default function Home() {
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

  // Load candidates on mount
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

  // Start interview handler
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

  // Send candidate message turn handler
  const handleSendMessage = async (messageText: string) => {
    if (!sessionId || isLoading) return;

    // Append candidate message locally
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
        
        // Track unique covered days dynamically
        setQuestionCount((prev) => prev + 1);

        // Update covered days logic: cover next day sequentially if not yet present
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
    <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header Bar */}
      <header className="glass-panel p-4 sm:p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-100 tracking-tight flex items-center space-x-2">
              <span>AI Interview Agent</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Live API
              </span>
            </h1>
            <p className="text-xs text-slate-400">31-Day AI Cohort Technical Candidate Assessment</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono text-slate-400">
          <div className="flex items-center space-x-1.5">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <span>POST /api/interview</span>
          </div>
          {sessionId && (
            <div className="hidden sm:flex items-center space-x-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              <Code2 className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-slate-300">ID: {sessionId.substring(0, 16)}...</span>
            </div>
          )}
        </div>
      </header>

      {/* Main View Router */}
      <div className="flex-1 flex flex-col justify-center">
        {!isInterviewStarted ? (
          selectedCandidate && (
            <CandidateSelector
              candidates={candidates}
              selectedCandidate={selectedCandidate}
              onSelectCandidate={setSelectedCandidate}
              onStartInterview={handleStartInterview}
              isLoading={isLoading}
            />
          )
        ) : isDone && feedback && selectedCandidate ? (
          <FeedbackReport
            candidate={selectedCandidate}
            feedback={feedback}
            questionCount={questionCount}
            coveredDaysCount={coveredDays.length}
            onReset={handleReset}
          />
        ) : (
          selectedCandidate && (
            <InterviewChat
              candidate={selectedCandidate}
              focusDays={focusDays}
              transcript={transcript}
              questionCount={questionCount}
              coveredDays={coveredDays}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
          )
        )}
      </div>
    </main>
  );
}
