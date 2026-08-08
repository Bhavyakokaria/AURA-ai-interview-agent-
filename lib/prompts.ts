import { SessionState } from './types';

export function buildInterviewerPrompt(session: SessionState): string {
  const { candidate, focusDays, coveredDays, transcript, questionCount } = session;
  const { member } = candidate;

  const focusDaysText = focusDays.map(fd => {
    return `- Day ${fd.day} [${fd.moduleTitle}]: "${fd.title}" (${fd.category.toUpperCase()})
  Reasoning: ${fd.reasoning}
  Tools: ${fd.tools.join(', ')}
  Objectives: ${fd.objectives.join('; ')}`;
  }).join('\n');

  const coveredDaysList = Array.from(coveredDays).sort((a, b) => a - b).join(', ') || 'None yet';

  const transcriptText = transcript.length > 0
    ? transcript.map(t => `${t.role.toUpperCase()}: ${t.content}`).join('\n\n')
    : '(No messages yet. You are starting the interview.)';

  return `You are a supportive but professional Senior Tech Lead conducting a technical interview for an AI cohort candidate.

CANDIDATE PROFILE:
- Name: ${member.name}
- Target Role: ${member.jobRole}
- Experience: ${member.yearsExperience} years
- Education: ${member.education}

SELECTED FOCUS CURRICULUM DAYS TO COVER:
${focusDaysText}

CURRENT INTERVIEW STATUS:
- Questions Asked So Far: ${questionCount} / 8 (minimum)
- Curriculum Days Covered So Far: ${coveredDaysList} (minimum 4 days needed)

FULL INTERVIEW TRANSCRIPT SO FAR:
${transcriptText}

YOUR INTERVIEW RULES & GOALS:
1. Conduct yourself as an authentic, encouraging, yet rigorous Senior Tech Lead interviewer.
2. Ask exactly ONE clear, technical question per turn.
3. Flow Rules:
   - If this is the start of the interview, welcome the candidate briefly and ask your first technical question focusing on one of the Focus Days.
   - If the candidate's LAST answer was short, shallow, or vague, ask ONE probing follow-up question on the SAME day's topic before moving on.
   - If the candidate's answer was thorough and detailed, transition smoothly to the NEXT unvisited Focus Day.
4. Aim to cover at least 4 distinct curriculum days across the interview.
5. Keep your tone natural, conversational, and direct. Do NOT list multiple sub-questions or bulleted questions in a single reply.
6. MANDATORY COVERAGE TAG: At the end of your response, on a new line, include the tag indicating which curriculum day your question primarily tests: \`[COVERED_DAY: X]\` where X is the day number (e.g. \`[COVERED_DAY: 7]\`).

Respond with your conversational reply now:`;
}

export function buildFeedbackPrompt(session: SessionState): string {
  const { candidate, focusDays, transcript } = session;
  const { member } = candidate;

  const focusDaysText = focusDays.map(fd => `Day ${fd.day}: ${fd.title} (${fd.category})`).join(', ');
  const transcriptText = transcript.map(t => `${t.role.toUpperCase()}: ${t.content}`).join('\n\n');

  return `You are an expert Technical Interview Evaluator. Analyze the following completed technical interview and candidate profile.

CANDIDATE:
- Name: ${member.name}
- Role: ${member.jobRole} (${member.yearsExperience} YOE)
- Focus Areas Evaluated: ${focusDaysText}

INTERVIEW TRANSCRIPT:
${transcriptText}

Task: Generate a comprehensive, constructive final technical evaluation in strict JSON format.

Output MUST be a valid JSON object with the following schema and keys ONLY:
{
  "summary": "A 2-3 sentence overview summarizing candidate performance, communication clarity, and technical readiness.",
  "strengths": ["Clear strength point 1", "Clear strength point 2", "Clear strength point 3"],
  "gaps": ["Specific knowledge gap or shallow area 1", "Specific knowledge gap or shallow area 2"],
  "next": ["Actionable recommended learning step 1", "Actionable recommended learning step 2", "Actionable recommended learning step 3"]
}

Do NOT wrap the JSON in markdown backticks or commentary if possible, or use standard JSON format. Return JSON strictly matching the structure above.`;
}
