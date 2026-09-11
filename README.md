# Strata

A personal learning engine. Type any topic, get an AI-generated **prerequisite graph** — the actual order concepts need to be learned in to reach near-foundational mastery — then work through it with confidence-calibrated quizzes and spaced-repetition review scheduled around each concept's real retention half-life.

**Live:** _(add your Vercel URL here after deploying)_

## How it's built

- **Mastery Map** (`/map/[slug]`) — a topic's concepts laid out in dependency layers. Locked concepts unlock as their prerequisites are mastered. Every check starts with a confidence prediction, then a quiz, then a calibration readout comparing the two.
- **Execution Loop** (`/loop`) — the companion dashboard: a due-for-review queue driven by spaced repetition (interval scaled by each concept's `retention` speed — slow/medium/fast), a compounding chart of concepts mastered over time, a session-cadence chart against your own rolling average, a streak counter, and a friction nudge that surfaces the single smallest next action when you've gone quiet.
- **Curated paths** — Special Relativity and Bayesian Thinking ship fully written, no API key required.
- **Generated paths** — any other topic is generated at request time via the Gemini API (`/api/generate`), using a structured JSON schema so the response is always a valid prerequisite DAG.

All progress is stored in `localStorage` — no backend, no accounts, fully private to your browser.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS v4 · Zustand (persisted store) · Framer Motion · Gemini API (`@google/generative-ai`) · hand-rolled SVG charts (no charting library)

## Running locally

```bash
npm install
cp .env.local.example .env.local   # optional — add a free Gemini key to unlock arbitrary topics
npm run dev
```

Without a `GEMINI_API_KEY`, the two curated paths (Special Relativity, Bayesian Thinking) work fully; any other topic shows a message explaining the key is missing instead of failing silently.

## Deploying

Push to GitHub, import into Vercel, add `GEMINI_API_KEY` as an environment variable in the Vercel project settings (server-side only — never exposed to the client).
