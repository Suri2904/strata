# Strata

A personal tool for learning any topic from foundation to mastery, built around how memory
encoding actually works — not "read and quiz" flashcards.

## How it teaches

Every concept in a topic goes through the same five-stage pipeline, each stage mapping to a
specific encoding principle:

1. **Hook** — a genuine, specific curiosity question this concept will answer (generation effect).
2. **Predict** — you type your best guess before seeing any explanation (self-generated content
   encodes stronger than passively received content).
3. **Reveal** — core idea, the causal "why," how it connects to something you already learned, a
   concrete analogy, a two-node diagram, and a Derivable/Arbitrary tag telling you where to spend
   reasoning effort vs. rote memorization.
4. **Retrieve** — you explain the concept from memory, with no notes visible. An AI grader scores
   it 1–5 with specific, honest feedback, and separately flags a fluency warning if the answer
   sounds confident but is short on real content.
5. **So-What** — you state what understanding this actually changes for you — a prediction, a
   decision, a link to something else you know. An AI checker calls out whether that's real or
   just restated information.

Once a concept clears all five stages it's marked learned and enters spaced repetition —
Leitner boxes 0–4 with intervals of 1/3/7/16/35 days. A review is retrieve-only: a good, warning-free
answer pushes the box (and the interval) up; a weak or falsely-fluent one resets it to daily review.

Concepts within a topic unlock strictly in sequence — you can't skip ahead.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS v4 · Zustand (persisted store) · Gemini API
(`@google/generative-ai`)

All progress lives in `localStorage` — no backend, no accounts, fully private to your browser.

## Running locally

```bash
npm install
cp .env.local.example .env.local   # add a free Gemini key — required, there's no offline fallback
npm run dev
```

## Deploying

Push to GitHub, import into Vercel, add `GEMINI_API_KEY` as an environment variable in the Vercel
project settings (server-side only — never exposed to the client).
