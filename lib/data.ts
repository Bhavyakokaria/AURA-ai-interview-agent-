import fs from 'fs';
import path from 'path';
import { Candidate, Curriculum, CurriculumDay, CurriculumModule } from './types';

let cachedCurriculum: Curriculum | null = null;
let cachedCandidates: Candidate[] | null = null;

export function getCurriculum(): Curriculum {
  if (cachedCurriculum) return cachedCurriculum;
  
  const filePath = path.join(process.cwd(), 'curriculum.json');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  cachedCurriculum = JSON.parse(fileContent) as Curriculum;
  return cachedCurriculum;
}

export function getCandidates(): Candidate[] {
  if (cachedCandidates) return cachedCandidates;

  const filePath = path.join(process.cwd(), 'candidates.json');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const parsed = JSON.parse(fileContent);
  cachedCandidates = parsed.candidates as Candidate[];
  return cachedCandidates;
}

export function getCandidateById(id: string): Candidate | undefined {
  const candidates = getCandidates();
  return candidates.find(c => c.member.id === id);
}

export function getCurriculumDay(dayNumber: number): CurriculumDay | undefined {
  const curriculum = getCurriculum();
  return curriculum.days.find(d => d.day === dayNumber);
}

export function getModuleForDay(dayNumber: number): CurriculumModule | undefined {
  const curriculum = getCurriculum();
  return curriculum.modules.find(m => dayNumber >= m.days[0] && dayNumber <= m.days[1]);
}
