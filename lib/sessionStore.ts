import { kv } from '@vercel/kv';
import { Candidate, FocusDay, SessionState, TranscriptItem } from './types';
import { selectFocusDays } from './focusDays';

const SESSION_TTL_SECONDS = 60 * 60 * 2; // 2 hours

function kvKey(sessionId: string): string {
  return `session:${sessionId}`;
}

// Vercel KV stores plain JSON — Set is not serializable, so we store
// coveredDays as a plain number[] and rehydrate into a real Set on read.
interface SerializedSession extends Omit<SessionState, 'coveredDays'> {
  coveredDays: number[];
}

function serialize(session: SessionState): SerializedSession {
  return {
    ...session,
    coveredDays: Array.from(session.coveredDays),
  };
}

function deserialize(raw: SerializedSession): SessionState {
  return {
    ...raw,
    coveredDays: new Set<number>(raw.coveredDays),
  };
}

export async function createSession(
  sessionId: string,
  candidate: Candidate
): Promise<SessionState> {
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
  await kv.set(kvKey(sessionId), serialize(session), { ex: SESSION_TTL_SECONDS });
  return session;
}

export async function getSession(
  sessionId: string
): Promise<SessionState | undefined> {
  const raw = await kv.get<SerializedSession>(kvKey(sessionId));
  if (!raw) return undefined;
  return deserialize(raw);
}

export async function updateSession(
  sessionId: string,
  updates: Partial<SessionState>
): Promise<SessionState | undefined> {
  const session = await getSession(sessionId);
  if (!session) return undefined;

  const updatedSession: SessionState = { ...session, ...updates };
  await kv.set(kvKey(sessionId), serialize(updatedSession), { ex: SESSION_TTL_SECONDS });
  return updatedSession;
}

export async function addTranscriptItem(
  sessionId: string,
  item: TranscriptItem
): Promise<SessionState | undefined> {
  const session = await getSession(sessionId);
  if (!session) return undefined;

  session.transcript.push(item);
  await kv.set(kvKey(sessionId), serialize(session), { ex: SESSION_TTL_SECONDS });
  return session;
}

export async function markDayCovered(
  sessionId: string,
  day: number
): Promise<SessionState | undefined> {
  const session = await getSession(sessionId);
  if (!session) return undefined;

  session.coveredDays.add(day);
  await kv.set(kvKey(sessionId), serialize(session), { ex: SESSION_TTL_SECONDS });
  return session;
}

export async function deleteSession(sessionId: string): Promise<boolean> {
  const deleted = await kv.del(kvKey(sessionId));
  return deleted > 0;
}

export async function clearAllSessions(): Promise<void> {
  // Not used in production paths; left as a no-op stub for compatibility.
}
