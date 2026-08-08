import { Candidate, FocusDay, InterviewFeedback, SessionState, TranscriptItem } from './types';
import { selectFocusDays } from './focusDays';

// Use globalThis singleton pattern to preserve session store during Next.js HMR
const globalForStore = globalThis as unknown as {
  sessionStore: Map<string, SessionState>;
};

const store = globalForStore.sessionStore || new Map<string, SessionState>();
if (process.env.NODE_ENV !== 'production') {
  globalForStore.sessionStore = store;
}

export function createSession(sessionId: string, candidate: Candidate): SessionState {
  const focusDays: FocusDay[] = selectFocusDays(candidate);
  const session: SessionState = {
    sessionId,
    candidate,
    focusDays,
    coveredDays: new Set<number>(),
    transcript: [],
    questionCount: 0,
    done: false,
  };
  store.set(sessionId, session);
  return session;
}

export function getSession(sessionId: string): SessionState | undefined {
  return store.get(sessionId);
}

export function updateSession(sessionId: string, updates: Partial<SessionState>): SessionState | undefined {
  const session = store.get(sessionId);
  if (!session) return undefined;

  const updatedSession = { ...session, ...updates };
  store.set(sessionId, updatedSession);
  return updatedSession;
}

export function addTranscriptItem(sessionId: string, item: TranscriptItem): SessionState | undefined {
  const session = store.get(sessionId);
  if (!session) return undefined;

  session.transcript.push(item);
  store.set(sessionId, session);
  return session;
}

export function markDayCovered(sessionId: string, day: number): SessionState | undefined {
  const session = store.get(sessionId);
  if (!session) return undefined;

  session.coveredDays.add(day);
  store.set(sessionId, session);
  return session;
}

export function deleteSession(sessionId: string): boolean {
  return store.delete(sessionId);
}

export function clearAllSessions(): void {
  store.clear();
}
