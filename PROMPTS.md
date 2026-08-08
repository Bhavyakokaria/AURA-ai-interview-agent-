# AI Usage Log

Prompts used to build the AI Interview Agent, in order.

## 1. Initial scaffold

Build a Next.js app called "AI Interview Agent" — a single repo, no separate backend, deployed later on Vercel.

CONTEXT
- curriculum.json: 31-day AI cohort curriculum (days, objectives, tools) — read it into the project.
- candidates.json: candidate profiles with completed/skipped missions and attempt counts — read it into the project.
- technical-spec.md: defines the exact API contract this app MUST expose. Follow it exactly — do not deviate from the request/response shapes.

REQUIREMENTS
1. Single Next.js app (App Router), API route(s) act as the backend — no FastAPI, no separate server.
2. Expose POST /api/interview matching technical-spec.md exactly:
   - Start: { sessionId, candidate } -> { reply, done: false }
   - Turn: { sessionId, message } -> { reply, done: false }
   - End: -> { reply, done: true, feedback: { summary, strengths[], gaps[], next[] } }
3. Session state: in-memory store (Map) keyed by sessionId. Track: candidate, focusDays, coveredDays (Set), transcript, questionCount, done. No database, no auth.
4. Focus-day selection logic (on session start): from candidate.missions, classify each as
   - skipped -> gap (probe if they know it anyway)
   - passed, attempts 1 -> confident (ask harder follow-up)
   - passed, attempts 3+ -> shaky (ask foundational/clarifying question)
   Pick 5-6 days spanning different curriculum modules.
5. LLM: Gemini API via @google/generative-ai, model gemini-2.5-flash-lite (or gemini-flash-lite equivalent available). Read API key from process.env.GEMINI_API_KEY.
6. System prompt per turn should include: candidate profile (role, years exp, focus days with reasoning), full transcript so far, current questionCount, coveredDays, and rules:
   - Minimum 8 questions total, covering at least 4 different curriculum days.
   - If candidate's last answer is short/shallow, ask ONE follow-up probing deeper before moving on.
   - If answer is thorough, move to next unvisited focus day.
   - Tone: supportive but professional senior tech-lead interviewer.
   - Once questionCount >= 8 AND coveredDays.size >= 4, wrap up the interview instead of asking more.
7. Final feedback: separate LLM call forcing JSON-only output matching { summary: string, strengths: string[], gaps: string[], next: string[] }. Parse and return it in the done:true response.
8. Frontend (same app, App Router page):
   - Candidate selector dropdown (loads from candidates.json).
   - Chat bubble UI, interviewer vs candidate messages.
   - Live status badge: "Questions: x/8" and "Days covered: x/4".
   - On done:true, show a feedback report screen (summary, strengths, gaps, next steps) instead of the chat input.
9. Keep code modular (separate files for: data loading, focus-day picker, session store, Gemini prompt builder, API route, UI components) so individual pieces can be changed quickly later.
10. Do not hardcode the Gemini API key anywhere — env var only, and add a .env.example file.

Set up git and commit after this initial scaffold is working, then continue with small incremental commits as we build each piece — do not do one giant commit.
