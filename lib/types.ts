export interface CandidateMember {
  id: string;
  name: string;
  jobRole: string;
  yearsExperience: number;
  education: string;
  status: string;
}

export interface CandidateMission {
  day: number;
  title: string;
  passed?: boolean;
  skipped?: boolean;
  attempts?: number;
}

export interface CandidateSignals {
  commitDays: number;
  missionsCompleted: number;
  missionsFirstTry: number;
}

export interface Candidate {
  member: CandidateMember;
  missions: CandidateMission[];
  signals: CandidateSignals;
}

export interface CurriculumModule {
  n: number;
  title: string;
  days: number[];
}

export interface CurriculumDay {
  day: number;
  title: string;
  type: string;
  tools: string[];
  objectives: string[];
}

export interface Curriculum {
  cohort: string;
  modules: CurriculumModule[];
  days: CurriculumDay[];
}

export type FocusCategory = 'gap' | 'confident' | 'shaky';

export interface FocusDay {
  day: number;
  title: string;
  moduleNumber: number;
  moduleTitle: string;
  category: FocusCategory;
  reasoning: string;
  objectives: string[];
  tools: string[];
}

export interface TranscriptItem {
  role: 'interviewer' | 'candidate';
  content: string;
  timestamp?: string;
}

export interface InterviewFeedback {
  summary: string;
  strengths: string[];
  gaps: string[];
  next: string[];
}

export interface SessionState {
  sessionId: string;
  candidate: Candidate;
  focusDays: FocusDay[];
  coveredDays: Set<number>;
  transcript: TranscriptItem[];
  questionCount: number;
  done: boolean;
  feedback?: InterviewFeedback;
  currentDayAsked?: number;
}

export interface StartInterviewRequest {
  sessionId: string;
  candidate: Candidate;
}

export interface TurnInterviewRequest {
  sessionId: string;
  message: string;
}

export type InterviewApiRequest = StartInterviewRequest | TurnInterviewRequest;

export interface InterviewApiResponse {
  reply: string;
  done: boolean;
  feedback?: InterviewFeedback;
}
