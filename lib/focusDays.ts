import { Candidate, FocusCategory, FocusDay } from './types';
import { getCurriculum, getModuleForDay } from './data';

export function selectFocusDays(candidate: Candidate): FocusDay[] {
  const curriculum = getCurriculum();
  
  // Map missions by day number
  const missionMap = new Map<number, { passed?: boolean; skipped?: boolean; attempts?: number; title: string }>();
  candidate.missions.forEach(m => {
    missionMap.set(m.day, m);
  });

  // Classify days
  const classifiedDays: FocusDay[] = [];

  curriculum.days.forEach(currDay => {
    const mission = missionMap.get(currDay.day);
    const mod = getModuleForDay(currDay.day);
    const moduleNumber = mod ? mod.n : 1;
    const moduleTitle = mod ? mod.title : 'General';

    let category: FocusCategory;
    let reasoning: string;

    if (!mission || mission.skipped) {
      category = 'gap';
      reasoning = `Candidate skipped or did not record Day ${currDay.day} (${currDay.title}). Probe if they know the concepts despite missing the mission.`;
    } else if (mission.passed === false) {
      category = 'gap';
      reasoning = `Candidate failed Day ${currDay.day} (${currDay.title}) after ${mission.attempts || 1} attempts. Probe fundamental knowledge gap.`;
    } else if (mission.passed && (mission.attempts ?? 1) >= 3) {
      category = 'shaky';
      reasoning = `Candidate needed ${mission.attempts} attempts to pass Day ${currDay.day} (${currDay.title}). Ask foundational or clarifying questions to verify solid understanding.`;
    } else {
      category = 'confident';
      reasoning = `Candidate passed Day ${currDay.day} (${currDay.title}) on attempt ${mission.attempts ?? 1}. Ask harder, deeper follow-up questions to test high-level mastery.`;
    }

    classifiedDays.push({
      day: currDay.day,
      title: currDay.title,
      moduleNumber,
      moduleTitle,
      category,
      reasoning,
      objectives: currDay.objectives,
      tools: currDay.tools
    });
  });

  // Group by module number
  const daysByModule = new Map<number, FocusDay[]>();
  classifiedDays.forEach(d => {
    const list = daysByModule.get(d.moduleNumber) || [];
    list.push(d);
    daysByModule.set(d.moduleNumber, list);
  });

  // Select 5-6 days spanning distinct modules
  const selected: FocusDay[] = [];
  const usedModules = new Set<number>();

  // Helper to try adding a candidate day of a specific category from an unused module
  const tryAddCategory = (cat: FocusCategory) => {
    for (const [modNum, days] of daysByModule.entries()) {
      if (usedModules.has(modNum)) continue;
      const match = days.find(d => d.category === cat);
      if (match) {
        selected.push(match);
        usedModules.add(modNum);
        if (selected.length >= 6) return;
      }
    }
  };

  // Priority 1: Pick gaps (up to 2-3 modules)
  tryAddCategory('gap');
  // Priority 2: Pick shaky (up to 2 modules)
  tryAddCategory('shaky');
  // Priority 3: Pick confident (remaining modules)
  tryAddCategory('confident');

  // If still less than 5 days selected, grab remaining unused modules
  if (selected.length < 5) {
    for (const [modNum, days] of daysByModule.entries()) {
      if (usedModules.has(modNum)) continue;
      if (days.length > 0) {
        selected.push(days[0]);
        usedModules.add(modNum);
        if (selected.length >= 6) break;
      }
    }
  }

  // If still less than 5, pick any days not already selected
  if (selected.length < 5) {
    for (const day of classifiedDays) {
      if (!selected.some(s => s.day === day.day)) {
        selected.push(day);
        if (selected.length >= 5) break;
      }
    }
  }

  // Sort selected focus days ascending by day number
  return selected.sort((a, b) => a.day - b.day);
}
