import { Candidate, Curriculum, CurriculumDay, CurriculumModule } from './types';
import curriculumData from '../curriculum.json';
import candidatesRaw from '../candidates.json';

const curriculum = curriculumData as Curriculum;
const candidates = candidatesRaw.candidates as Candidate[];

export function getCurriculum(): Curriculum {
  return curriculum;
}

export function getCandidates(): Candidate[] {
  return candidates;
}

export function getCandidateById(id: string): Candidate | undefined {
  return candidates.find(c => c.member.id === id);
}

export function getCurriculumDay(dayNumber: number): CurriculumDay | undefined {
  return curriculum.days.find(d => d.day === dayNumber);
}

export function getModuleForDay(dayNumber: number): CurriculumModule | undefined {
  return curriculum.modules.find(m => dayNumber >= m.days[0] && dayNumber <= m.days[1]);
}
