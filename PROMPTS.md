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

## 2. Replace in-memory session store with Vercel KV

The current session store in lib/sessionStore.ts uses an in-memory Map with a globalThis singleton pattern. This works in local dev but breaks in production on Vercel because serverless functions don't guarantee the same instance handles consecutive requests — session state can silently disappear between interview turns.

Fix this by replacing the in-memory store with Vercel KV (Upstash Redis):

1. Add @vercel/kv as a dependency.
2. Rewrite lib/sessionStore.ts so createSession, getSession, updateSession, and deleteSession all read/write through Vercel KV instead of a Map. Keep the exact same function signatures so nothing else in the codebase needs to change.
3. Store each SessionState as JSON under key `session:{sessionId}`, with a reasonable TTL (e.g. 2 hours) so stale sessions don't linger forever.
4. Add KV_REST_API_URL and KV_REST_API_TOKEN to .env.example as required env vars (placeholder values only, do not add real values).
5. Update PROMPTS.md to append this as the next numbered entry with the prompt text.
6. Commit this as its own commit: "fix: replace in-memory session store with Vercel KV for serverless persistence".

Do not change the API contract, the focus-day logic, or any other files.

## 3. Fix non-answer detection in interviewer prompt

The interviewer prompt logic in lib/prompts.ts isn't correctly detecting low-quality answers. When a candidate responds with something like "hello" or a one-word non-answer, the agent should recognize this as not actually answering the technical question and ask a clarifying follow-up instead of advancing to the next curriculum day.

Updated the system prompt's flow rules to:
1. Explicitly check whether the candidate's response actually addresses the technical question asked, not just whether a response exists.
2. Treat greetings, filler, or off-topic replies as non-answers: ask a direct follow-up re-asking or clarifying the same question, without advancing questionCount or marking the day covered.
3. Only advance to a new curriculum day on a substantive, on-topic response.
4. Added a few-shot example in the prompt showing a non-answer like "hello" getting a follow-up instead of a topic change.

Commit: "fix: improve non-answer detection in interviewer prompt logic"

## 4. Fix deprecated Gemini model names

Discovered via Vercel logs that every Gemini API call was silently failing — the model fallback chain in lib/gemini.ts (gemini-2.5-flash-lite, gemini-2.5-flash, gemini-2.0-flash-lite, gemini-2.0-flash, gemini-1.5-flash) was entirely deprecated/retired model names, causing every interview turn to run on hardcoded fallback text instead of real LLM output.

Fixed by replacing all pinned model names with Google's floating alias model names (gemini-flash-latest, gemini-flash-lite-latest, gemini-2.5-flash) across all three locations in the file: getGeminiModel's default, generateInterviewerTurn's candidate list, and generateFinalFeedback's candidate list.

Commit: "fix: replace deprecated pinned Gemini model names with latest aliases" and "fix: update remaining model candidate list in generateInterviewerTurn"