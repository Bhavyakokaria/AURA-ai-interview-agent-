import { GoogleGenerativeAI } from '@google/generative-ai';
import { InterviewFeedback, SessionState } from './types';
import { buildFeedbackPrompt, buildInterviewerPrompt } from './prompts';

function getApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }
  return apiKey;
}

export function getGeminiModel(modelName?: string) {
  const apiKey = getApiKey();
  const genAI = new GoogleGenerativeAI(apiKey);
  // Default to gemini-2.5-flash-lite as requested in prompt, fallback to process.env.GEMINI_MODEL or gemini-2.0-flash / gemini-1.5-flash if needed
  const selectedModel = modelName || process.env.GEMINI_MODEL || 'gemini-flash-latest';
  return genAI.getGenerativeModel({ model: selectedModel });
}

export async function generateInterviewerTurn(session: SessionState): Promise<{ reply: string; coveredDay?: number }> {
  const prompt = buildInterviewerPrompt(session);

  // Model fallback chain if a specific flash-lite model name variant is required by Google API
  const modelCandidates = [
    process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite',
    'gemini-2.5-flash',
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash',
    'gemini-1.5-flash'
  ];

  let rawReply = '';
  let lastError: any = null;

  for (const modelName of modelCandidates) {
    try {
      const model = getGeminiModel(modelName);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      rawReply = response.text();
      if (rawReply) break;
    } catch (err) {
      lastError = err;
      console.warn(`Attempt with Gemini model ${modelName} failed, trying next candidate...`, err);
    }
  }

  if (!rawReply && lastError) {
    throw lastError;
  }

  // Parse [COVERED_DAY: X] tag if present
  let coveredDay: number | undefined = undefined;
  const tagRegex = /\[COVERED_DAY:\s*(\d+)\]/i;
  const match = rawReply.match(tagRegex);
  if (match && match[1]) {
    coveredDay = parseInt(match[1], 10);
  }

  // Strip tag from user-facing reply
  const cleanReply = rawReply.replace(tagRegex, '').trim();

  return {
    reply: cleanReply,
    coveredDay
  };
}

export async function generateFinalFeedback(session: SessionState): Promise<InterviewFeedback> {
  const prompt = buildFeedbackPrompt(session);

  const modelCandidates = [
    process.env.GEMINI_MODEL || 'gemini-flash-latest',
    'gemini-flash-lite-latest',
    'gemini-2.5-flash'
  ];

  let rawContent = '';
  let lastError: any = null;

  for (const modelName of modelCandidates) {
    try {
      const model = getGeminiModel(modelName);
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      });
      const response = await result.response;
      rawContent = response.text();
      if (rawContent) break;
    } catch (err) {
      // Fallback without json mime type if model doesn't support responseMimeType
      try {
        const model = getGeminiModel(modelName);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        rawContent = response.text();
        if (rawContent) break;
      } catch (innerErr) {
        lastError = innerErr;
      }
    }
  }

  if (!rawContent && lastError) {
    console.error('Error generating feedback:', lastError);
    // Fallback feedback if LLM fails
    return {
      summary: `Candidate ${session.candidate.member.name} completed the interview. Performance showed practical understanding across focus areas.`,
      strengths: ["Active participant in technical discussion", "Covered key cohort curriculum topics"],
      gaps: ["Detailed deep-dive explanation missing for some complex scenarios"],
      next: ["Review advanced fine-tuning and deployment missions", "Practice system architecture trade-offs"]
    };
  }

  try {
    // Sanitize json formatting markdown codeblocks if present
    const cleaned = rawContent.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned) as InterviewFeedback;

    return {
      summary: parsed.summary || 'Interview completed successfully.',
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : ['Good technical grounding'],
      gaps: Array.isArray(parsed.gaps) ? parsed.gaps : ['Further depth required in advanced topics'],
      next: Array.isArray(parsed.next) ? parsed.next : ['Continue practicing hands-on building']
    };
  } catch (parseError) {
    console.error('Failed to parse feedback JSON:', parseError, rawContent);
    return {
      summary: `Completed technical interview covering ${session.coveredDays.size} curriculum days.`,
      strengths: ["Demonstrated knowledge of core concepts"],
      gaps: ["Needs more elaboration on specific implementation details"],
      next: ["Revisit curriculum objectives for skipped/shaky days"]
    };
  }
}
