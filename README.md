# Strata

A personal tool for learning any topic from foundation to mastery, built around how memory
encoding actually works — not "read and quiz" flashcards.

## How it teaches

Every concept in a topic goes through the same five-stage pipeline, each stage mapping to a
specific encoding principle:

1. **Hook** — a genuine, specific curiosity question this concept will answer (generation effect).
2. **Predict** — you type your best guess before seeing any explanation (self-generated content
   encodes stronger than passively received content). An escalating hint ladder (up to 3, never
   naming the answer) is available if you're stuck.
3. **Reveal** — core idea, the causal "why," how it connects to something you already learned, a
   concrete analogy, a two-node diagram, a Derivable/Arbitrary tag telling you where to spend
   reasoning effort vs. rote memorization, and the concept's real common misconceptions. If
   something looks wrong, flag it and regenerate that concept.
4. **Retrieve** — you predict your confidence, then explain the concept from memory with no notes
   visible. An AI grader scores it 1–5 with specific, honest feedback, calls out any of the
   concept's known misconceptions your answer exhibits, and separately flags a fluency warning if
   the answer sounds confident but is short on real content.
5. **So-What** — you state what understanding this actually changes for you — a prediction, a
   decision, a link to something else you know. An AI checker calls out whether that's real or
   just restated information.

Once a concept clears all five stages it's marked learned and enters spaced repetition via
[FSRS](https://github.com/open-spaced-repetition/ts-fsrs) — the Retrieve-stage grade doubles as
the concept's first review, so its initial interval already reflects how well it actually landed.
A later review is retrieve-only: the grade (and any fluency warning) feeds straight back into
FSRS to reschedule it.

Concepts within a topic unlock strictly in sequence, but you're not stuck with the generated
order — reorder, remove, or add concepts, or mark one "I already know this" to skip straight to
its first review. A short adaptive diagnostic after generation does this automatically for
concepts you already know. A one-time background pass checks the generated ordering for
missing prerequisites and surfaces anything it finds.

`/settings` tracks confidence calibration across every graded answer — how far your predicted
confidence runs from your actual scores, and whether you trend over- or under-confident.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS v4 · Zustand (persisted store) · Gemini API
(`@google/generative-ai`) + Groq (Llama 3.3 70B, plain `fetch`) ·
[ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs) · Vercel Blob (`@vercel/blob`)

Every AI call goes through Gemini first, falling back to Groq automatically if Gemini is
quota-exhausted, rate-limited, having an outage, or simply not configured (`lib/llm.ts`). Gemini's
free tier alone is tight (20 requests/day for `gemini-3.6-flash`); Groq's free tier adds roughly
1,000 requests/day on `llama-3.3-70b-versatile`, so between the two the app comfortably outlasts
either single free tier. Only if both providers fail does the app return a real error — and it's a
specific one ("Gemini's daily quota is used up", "neither key is configured", etc.), not a generic
"try again."

Progress lives in `localStorage` first — no accounts, fully private to your browser, works
offline. `/settings` adds an optional manual cloud backup/restore against a single JSON blob,
gated by a passcode only you know (see below) — there's no automatic background sync, so two
devices never silently clobber each other; you choose when to push or pull.

## Running locally

```bash
npm install
cp .env.local.example .env.local   # add GEMINI_API_KEY and/or GROQ_API_KEY — see below
npm run dev
```

### AI keys

- `GEMINI_API_KEY` — free from [Google AI Studio](https://aistudio.google.com). 20 requests/day
  free tier for `gemini-3.6-flash`.
- `GROQ_API_KEY` — free from [console.groq.com](https://console.groq.com), no credit card. ~1,000
  requests/day on `llama-3.3-70b-versatile`.

Either alone works (the app just runs on whichever is configured); having both is what gives the
app real day-to-day headroom, since Gemini's fallback to Groq happens automatically. With neither
configured, every AI-backed action fails with a clear "no key configured" message instead of
breaking silently.

## Cloud backup (optional)

1. In the Vercel project dashboard → Storage, connect a **Blob** store. This injects
   `BLOB_READ_WRITE_TOKEN` into the deployed environment automatically.
2. Pick your own passcode and set `SYNC_PASSCODE` (deployment env var, and in `.env.local` for
   local dev). For local dev, also pull `BLOB_READ_WRITE_TOKEN` into `.env.local` (`vercel env
   pull`, or copy it from the dashboard).
3. Enter the same passcode on `/settings` in the app, then use "Back up to cloud" / "Restore
   from cloud".

Without `SYNC_PASSCODE` configured, `/settings` just says sync isn't set up — everything else
keeps working from `localStorage` alone.

## Deploying

Push to GitHub, import into Vercel, add `GEMINI_API_KEY`, `GROQ_API_KEY`, and (optionally)
`SYNC_PASSCODE` as environment variables in the Vercel project settings (server-side only —
never exposed to the client).
