# AI Interview Agent

An AI-powered technical interviewer that conducts personalized, multi-turn interviews based on a candidate's progress through the 31-Day AI Cohort curriculum.

## What it does

- Reads each candidate's mission history (completed, skipped, attempts) and picks focus curriculum days to interview them on — prioritizing skipped topics (gaps) and shaky attempts (multiple retries) alongside confident areas.
- Conducts a natural, adaptive multi-turn technical interview: detects vague or off-topic replies and asks a clarifying follow-up instead of advancing, moves to the next topic on solid answers.
- Covers a minimum of 8 questions across at least 4 curriculum days.
- Produces a structured feedback report at the end (summary, strengths, gaps, next steps).

## Stack

- **Next.js (App Router)** — single app, API routes act as the backend, no separate server.
- **Vercel KV (Upstash Redis)** — session state, so interviews reliably persist across serverless function calls in production.
- **Gemini API** (`@google/generative-ai`) — powers the interviewer's questions, follow-ups, and final feedback generation, with a model fallback chain using Google's latest-alias model names.
- **Framer Motion** — page transitions, chat animations, scroll-reveal effects.

## Running locally

1. Clone the repo and install dependencies:
```bash
   npm install
```
2. Copy `.env.example` to `.env.local` and fill in:
   - `GEMINI_API_KEY` — from [Google AI Studio](https://aistudio.google.com)
   - `KV_REST_API_URL` / `KV_REST_API_TOKEN` — from a Vercel KV (Upstash) database
3. Run the dev server:
```bash
   npm run dev
```
4. Open `http://localhost:3000`.

## API

Exposes `POST /api/interview` per the technical specification — see `technical-spec.md` for the full contract (start, turn, and end/feedback responses).

## AI usage

This project was built with heavy AI assistance (Google Antigravity + Claude). See `PROMPTS.md` for the full log of prompts used during development.