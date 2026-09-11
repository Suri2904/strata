import { Curriculum } from "../types";

export const bayesianThinking: Curriculum = {
  slug: "bayesian-thinking",
  topic: "Bayesian Thinking",
  tagline: "From 'what probability even means' to catching your own overconfidence, each idea derived from the last.",
  generatedAt: "2026-01-01T00:00:00.000Z",
  source: "mock",
  nodes: [
    {
      id: "bt-prob-meaning",
      title: "What Probability Actually Means",
      depth: 0,
      explanation: {
        foundation:
          "You already reason under uncertainty constantly — 'it'll probably rain,' 'that's unlikely to work' — without needing a formal theory to do it.",
        reasoning:
          "Ask what \"70% chance of rain tomorrow\" could possibly mean. One answer: run tomorrow 1,000 times and count how many have rain. But tomorrow only happens once — there's no long-run frequency to measure, and the meteorologist isn't claiming otherwise. So the frequency definition, however natural it feels for dice and coins, quietly breaks down the moment you ask about a one-off event.\n\nWhat the forecaster actually means is closer to: given everything currently known — pressure systems, satellite data, historical patterns — the evidence leans toward rain, and 70% expresses HOW STRONGLY. This is a degree of belief, not a count. Crucially, it's not arbitrary either: two forecasters with access to the same data and the same reasoning process should land on similar numbers, and — this is the part that makes it a real theory rather than just a vibe — the number should update in a very specific, calculable way when new evidence arrives.\n\nSo probability, in this view, isn't fundamentally about repetition at all. Repetition (rolling a die many times) is just one special case where degrees of belief happen to converge to observed frequencies. The general concept — the one that lets you reason about elections, one-off scientific claims, or whether a single email is spam — is a calibrated degree of belief, updatable by evidence. That's the Bayesian starting point, and everything else in this path is about doing the updating correctly.",
        formalStatement:
          "Bayesian probability treats P(X) as a degree of belief that a claim X is true, conditional on current evidence — well-defined even for unique, non-repeatable events — in contrast to the frequentist definition, which restricts probability to long-run frequencies over repeated trials.",
        example:
          "A geologist says there's a 15% probability a specific fault will produce a major earthquake in the next 30 years. This isn't a frequency (that exact 30-year window happens once) — it's a calibrated belief given current seismic data, updatable as new measurements come in.",
        misconception:
          "People sometimes think the Bayesian view means probability is just subjective opinion with no right answer. A well-calibrated Bayesian probability is still accountable to evidence and to a precise updating rule (coming up soon) — 'degree of belief' doesn't mean 'anything goes'; two people reasoning correctly from the same evidence should converge, not diverge.",
      },
      whyItMatters:
        "Every later node treats probability as a belief you update, not a frequency you count — this is the interpretive shift everything else depends on.",
      prerequisites: [],
      estMinutes: 9,
      retention: "medium",
      quiz: [
        {
          id: "q1",
          question: "Why does the frequentist ('long-run frequency') definition of probability struggle to explain what 'there's a 70% chance of rain tomorrow' means?",
          options: [
            "It doesn't struggle — frequency explains it perfectly",
            "Tomorrow only happens once; there's no set of repeated trials to count frequencies over, so the statement can't be about a long-run frequency",
            "Because weather forecasters don't actually use probability",
            "Because 70% is too precise a number for weather",
          ],
          correctIndex: 1,
          explanation: "One-off events have no repetitions to count frequencies over — this is exactly the gap the Bayesian 'degree of belief' interpretation is built to fill.",
        },
        {
          id: "q2",
          question: "If Bayesian probability is a 'degree of belief,' why isn't it just an arbitrary opinion?",
          options: [
            "Because it's not really subjective at all, it's secretly a frequency",
            "Because it's still accountable to evidence via a precise, calculable updating rule — two people with the same evidence and correct reasoning should converge on similar values",
            "Because governments regulate what probabilities can be stated",
            "It actually is arbitrary; there's no way to check it",
          ],
          correctIndex: 1,
          explanation: "The 'degree of belief' framing keeps probability rigorous specifically because there's a precise rule (Bayes' theorem, coming up) for how beliefs must update given evidence.",
        },
      ],
    },
    {
      id: "bt-conditional",
      title: "Conditional Probability",
      depth: 1,
      explanation: {
        foundation:
          "You can already estimate a plain probability, like 'chance it rains' — call that P(rain).",
        reasoning:
          "Now suppose you're told it's currently cloudy. Does that change your estimate? Obviously — a cloudy sky makes rain more likely than a clear one. So \"chance of rain\" isn't really one fixed number; it depends on what you already know. \"Chance of rain, GIVEN that it's cloudy\" is a genuinely different question from \"chance of rain\" on its own, and deserves its own notation: P(rain | cloudy).\n\nHere's the subtlety worth sitting with: P(rain | cloudy) and P(cloudy | rain) sound like they should be related, and they are — but they're not the same number, and mixing them up is a real, common error. P(rain | cloudy) asks: of all the cloudy days, what fraction bring rain? P(cloudy | rain) asks a different question: of all the rainy days, what fraction were cloudy? The second is probably close to 100% — rain is almost always accompanied by clouds. The first is much lower — most cloudy days don't actually produce rain. Same two events, two very different numbers depending on which one you're conditioning on.\n\nThis distinction — which direction the \"given\" points — turns out to be the single most common source of probability reasoning errors in the real world, from medical test results to courtroom evidence. Getting comfortable with the notation now is what makes Bayes' theorem, a few nodes ahead, feel inevitable rather than like a trick.",
        formalStatement:
          "P(A | B) denotes the probability of event A, given that event B is known to be true. In general, P(A | B) ≠ P(B | A) — these are different quantities describing different conditional relationships between the same two events.",
        example:
          "P(cloudy | rain) ≈ 0.99 — nearly all rainy days are cloudy. P(rain | cloudy) ≈ 0.3 — only some cloudy days actually produce rain. Same two events (rain, cloudy), reversed conditioning, very different numbers.",
        misconception:
          "The most common mistake is assuming P(A|B) and P(B|A) must be roughly equal, or treating them as interchangeable. This confusion — called the 'transposed conditional' — is exactly why a positive medical test doesn't automatically mean you're likely sick (a few nodes ahead): P(positive test | sick) can be high while P(sick | positive test) is low.",
      },
      whyItMatters:
        "Bayes' theorem is just an equation relating two conditional probabilities to each other — without this notation and the direction-matters intuition, it can't even be stated correctly.",
      prerequisites: ["bt-prob-meaning"],
      estMinutes: 10,
      retention: "slow",
      quiz: [
        {
          id: "q1",
          question: "Why does 'chance of rain, given it's cloudy' deserve different notation from plain 'chance of rain'?",
          options: [
            "It doesn't — they're the same thing written differently",
            "Because knowing it's cloudy changes the probability estimate — conditioning on new information produces a genuinely different quantity than the unconditioned probability",
            "Because clouds cause rain deterministically",
            "Because meteorologists require different units for each",
          ],
          correctIndex: 1,
          explanation: "P(rain | cloudy) incorporates evidence (cloudiness) that P(rain) alone doesn't — that's precisely why conditioning matters and needs its own notation.",
        },
        {
          id: "q2",
          question: "P(cloudy | rain) is close to 99%, but P(rain | cloudy) is much lower, around 30%. Why aren't these two numbers close to each other?",
          options: [
            "One of the two numbers must be a calculation error",
            "They answer different questions — one asks 'of rainy days, how many were cloudy' and the other asks 'of cloudy days, how many brought rain' — the two populations being examined (rainy days vs. cloudy days) are different sizes",
            "Because rain and clouds are actually unrelated events",
            "Probability calculations always give the same answer regardless of direction",
          ],
          correctIndex: 1,
          explanation: "This is the core insight of conditional probability: which event you condition ON determines the reference population, and swapping the direction generally changes the answer.",
        },
      ],
    },
    {
      id: "bt-bayes-theorem",
      title: "Bayes' Theorem, Derived",
      depth: 2,
      explanation: {
        foundation:
          "You can write P(A|B) and P(B|A) as two distinct quantities (previous node) — now connect them.",
        reasoning:
          "Consider a group of people who are both cloudy-day-observers AND rain-experiencers at once — that is, look at P(rain AND cloudy), the probability both are true together. There are two equally valid ways to compute this same joint quantity: start from cloudy days and ask what fraction also had rain — that's P(cloudy) × P(rain | cloudy). Or start from rainy days and ask what fraction were also cloudy — that's P(rain) × P(cloudy | rain). Both expressions compute the exact same joint probability, just approached from opposite directions, so they must be equal to each other: P(cloudy) × P(rain|cloudy) = P(rain) × P(cloudy|rain).\n\nThat's the entire derivation — one equation, two ways of counting the same overlap. Now just solve it for the conditional probability you actually want. Say you know P(rain | cloudy) easily (weather statistics) but you actually want P(cloudy | rain) for some reason, or more usefully — you know how likely evidence is GIVEN a hypothesis, but you want to know how likely the hypothesis is GIVEN the evidence, which is almost always the harder, more useful direction to know. Rearranging the equality above to isolate that quantity gives you Bayes' theorem.\n\nThe reason this matters so much in practice: P(evidence | hypothesis) is very often something you can directly measure or calculate (a medical test's known false-positive rate, say), while P(hypothesis | evidence) — what you actually want to know, given the evidence in front of you — usually isn't directly measurable at all. Bayes' theorem is the bridge that turns the easy-to-know direction into the hard-to-know, useful direction.",
        formalStatement:
          "Bayes' theorem: P(H | E) = P(E | H) · P(H) / P(E), where P(H) is the prior probability of hypothesis H, P(E|H) is the likelihood of evidence E given H, and P(H|E) is the posterior — the updated probability of H after observing E.",
        example:
          "P(rain) = 0.2, P(cloudy) = 0.5, P(cloudy | rain) = 0.99. Then P(rain | cloudy) = P(cloudy|rain) × P(rain) / P(cloudy) = 0.99 × 0.2 / 0.5 = 0.396 — derived entirely from the easier-to-know direction.",
        misconception:
          "People sometimes think Bayes' theorem is a separate, additional assumption on top of ordinary probability rules. It isn't — it's a direct algebraic rearrangement of the simple fact that P(A and B) can be computed two equivalent ways; nothing new is being assumed, only rearranged.",
      },
      whyItMatters:
        "This equation is the engine of the entire topic — priors, likelihoods, and posteriors are just its three named ingredients.",
      prerequisites: ["bt-conditional"],
      estMinutes: 15,
      retention: "slow",
      quiz: [
        {
          id: "q1",
          question: "Bayes' theorem is derived from the fact that P(A and B) can be computed two different ways. What are those two ways?",
          options: [
            "P(A) + P(B), and P(A) × P(B)",
            "P(A) × P(B|A), and P(B) × P(A|B) — starting from A and conditioning on B, or starting from B and conditioning on A — both compute the same joint probability",
            "P(A|B) alone, computed twice for verification",
            "There's only one way to compute it; Bayes' theorem is a separate rule",
          ],
          correctIndex: 1,
          explanation: "Setting these two equivalent expressions for the same joint probability equal to each other, then solving for one conditional in terms of the other, is the entire derivation of Bayes' theorem.",
        },
        {
          id: "q2",
          question: "Why is Bayes' theorem practically useful, rather than just a mathematical curiosity?",
          options: [
            "It lets you avoid probability calculations altogether",
            "It converts an easy-to-know quantity (P(evidence | hypothesis)) into the hard-to-know one you actually want (P(hypothesis | evidence))",
            "It only works for coin flips and dice",
            "It replaces the need for any prior information",
          ],
          correctIndex: 1,
          explanation: "The practical value is entirely in the direction-flip: you often know how likely evidence is under a hypothesis, but want to know how likely the hypothesis is given the evidence — Bayes bridges exactly that gap.",
        },
      ],
    },
    {
      id: "bt-base-rates",
      title: "Base Rates & the Prosecutor's Fallacy",
      depth: 3,
      explanation: {
        foundation:
          "Bayes' theorem says P(H|E) depends on P(H) — the prior — not just on how well the evidence fits the hypothesis.",
        reasoning:
          "Take a disease that affects 1 in 10,000 people, and a test that's 99% accurate (meaning: 99% of sick people test positive, and 99% of healthy people correctly test negative). You test positive. Intuition says: 99% accurate test, positive result, so you're probably sick. Work it through with Bayes' theorem instead.\n\nImagine 1,000,000 people tested. Of these, about 100 are actually sick (1 in 10,000), and 99% of them — about 99 people — test positive. Of the remaining 999,900 healthy people, the test still gives a false positive to 1% of them — that's about 9,999 people. So out of everyone who tests positive (99 truly sick + 9,999 false positives ≈ 10,098 people), only 99 are actually sick. Your real probability of being sick, given a positive test, is about 99/10,098 ≈ 1%, not 99%.\n\nThe test's 99% accuracy told you about P(positive | sick), the likelihood — but the disease's 1-in-10,000 rarity is the prior, P(sick), and it's SO small that it overwhelms even a highly accurate test's likelihood. This exact reasoning error — treating P(evidence|hypothesis) as if it were P(hypothesis|evidence), while ignoring how rare the hypothesis was to begin with — has a name (the prosecutor's fallacy) because it shows up in courtrooms too: a rare coincidence being highly unlikely under innocence doesn't mean innocence is unlikely, if guilt was already far rarer still.",
        formalStatement:
          "The base rate — P(H) — must be included in any application of Bayes' theorem; ignoring it (the base rate fallacy) means implicitly assuming P(H) = 1, which produces badly wrong posteriors whenever the true base rate is small.",
        example:
          "1,000,000 people, disease rate 1/10,000, test 99% accurate: ~99 true positives, ~9,999 false positives. P(sick | positive) = 99/10,098 ≈ 1% — dramatically lower than the test's 99% accuracy figure might suggest.",
        misconception:
          "The natural but wrong intuition is 'a 99%-accurate test means a positive result is 99% reliable.' Test accuracy (the likelihood, P(positive|sick)) and the actual probability you're sick given a positive result (the posterior, P(sick|positive)) are different quantities entirely — conflating them is exactly the transposed-conditional error from two nodes back, now with real stakes.",
      },
      whyItMatters:
        "This is the single most common real-world Bayesian reasoning error — seeing it worked through numerically is what makes 'priors matter' concrete instead of abstract.",
      prerequisites: ["bt-bayes-theorem"],
      estMinutes: 13,
      retention: "medium",
      quiz: [
        {
          id: "q1",
          question: "In the 1-in-10,000 disease example, why does a 99%-accurate test still leave only about a 1% chance you're actually sick after a positive result?",
          options: [
            "The test must be broken",
            "Because the disease is so rare that the vastly larger healthy population still produces more false positives (via the test's 1% error rate) than the small sick population produces true positives",
            "Because 99% accuracy isn't a real, achievable number",
            "It can't — a positive test always means 99% sick, full stop",
          ],
          correctIndex: 1,
          explanation: "Run the numbers on 1,000,000 people: ~99 true positives vs. ~9,999 false positives — the false positives from the huge healthy majority dominate.",
        },
        {
          id: "q2",
          question: "What specifically makes this the 'prosecutor's fallacy' when applied in a courtroom?",
          options: [
            "It means prosecutors are always lying",
            "It's the same error: treating P(evidence | innocent) as if it directly told you P(innocent | evidence), while ignoring how rare guilt was in the first place (the base rate)",
            "It's a rule that only technically applies to criminal law, not statistics",
            "It means all circumstantial evidence should be discarded",
          ],
          correctIndex: 1,
          explanation: "The courtroom version is the same transposed-conditional, base-rate-ignoring error — a coincidence being rare under innocence doesn't make innocence rare, if guilt was already far rarer.",
        },
      ],
    },
    {
      id: "bt-priors",
      title: "Priors: Where Do They Come From",
      depth: 4,
      explanation: {
        foundation:
          "Bayes' theorem requires a prior, P(H), as an input — and the base-rate node just showed how much that number matters to the final answer.",
        reasoning:
          "So where does that starting number actually come from? Sometimes it's easy: if you're drawing from a well-shuffled deck, the prior probability of any specific card is exactly 1/52, derived from symmetry. But most real questions — will this specific startup succeed, is this new drug effective, will this policy work — have no such clean symmetry to lean on.\n\nTry to imagine having literally NO prior belief at all, a completely blank slate. Even attempting a \"neutral\" starting point — say, 50/50 for a yes/no question — is itself a specific choice, and often a bad one: the prior probability a random claim on the internet is true is nowhere near 50%, even before you've seen any specific evidence about it. There's no such thing as reasoning with zero assumptions; the only real choice is whether your assumptions are made explicit and grounded in something, or left invisible and arbitrary.\n\nIn practice, priors come from wherever legitimate information about the base rate lives: historical data (most startups fail, so start there before adjusting for specifics), domain expertise (a doctor's years of pattern-recognition), or — when genuinely nothing better is available — a deliberately wide, low-confidence prior that gets quickly overwhelmed by real evidence anyway. The discipline isn't eliminating priors; it's being honest about what yours is and why, since the base-rate node just showed how much that starting number can swing the final answer.",
        formalStatement:
          "A prior P(H) may be informative (grounded in historical data or domain expertise), or deliberately uninformative/wide when little is known — but no genuinely assumption-free prior exists; even a 'neutral' default is a specific, consequential modeling choice.",
        example:
          "A doctor examining a patient with a specific symptom cluster starts not from a blank slate but from the known prevalence of relevant conditions in similar patients — an informative prior built from years of pattern exposure, adjusted as this specific patient's evidence comes in.",
        misconception:
          "A common (and understandable) objection is that using a prior feels like 'assuming the answer before you've looked at the evidence,' which sounds circular. It isn't circular because the prior gets explicitly updated by the evidence via Bayes' theorem — a bad prior with enough good evidence still gets pulled toward the truth (a few nodes ahead); the prior is a starting point for updating, not a final answer smuggled in early.",
      },
      whyItMatters:
        "Everything downstream — sequential updating, calibration — assumes you can name your starting point honestly; this node is about actually doing that.",
      prerequisites: ["bt-bayes-theorem", "bt-base-rates"],
      estMinutes: 11,
      retention: "medium",
      quiz: [
        {
          id: "q1",
          question: "Is it possible to perform a Bayesian analysis with a genuinely assumption-free, 'neutral' prior?",
          options: [
            "Yes, and 50/50 is always the correct neutral choice",
            "No — even a deliberately 'uninformative' prior like 50/50 is still a specific modeling choice that shapes the result, and is often a poor one if the true base rate is far from 50%",
            "Yes, but only for coin flips",
            "Priors are optional in Bayesian reasoning and can be skipped",
          ],
          correctIndex: 1,
          explanation: "There's no assumption-free starting point — 'neutral' is itself a choice, and a mismatched one (e.g. 50/50 for something actually rare) visibly distorts the result.",
        },
        {
          id: "q2",
          question: "Why isn't using an informative prior 'circular reasoning' (assuming the answer before looking at evidence)?",
          options: [
            "It actually is circular, and should be avoided",
            "Because the prior is explicitly updated by new evidence via Bayes' theorem — it's a documented starting point for the update, not a fixed final answer",
            "Because priors are always correct by definition",
            "Because Bayes' theorem doesn't actually use the prior in its calculation",
          ],
          correctIndex: 1,
          explanation: "The whole mechanism of Bayes' theorem is combining the prior WITH new evidence — a starting point that gets moved by evidence isn't circular, it's exactly how updating is supposed to work.",
        },
      ],
    },
    {
      id: "bt-likelihood-posterior",
      title: "Likelihood vs. Posterior",
      depth: 4,
      explanation: {
        foundation:
          "Bayes' theorem has three named pieces: P(H) the prior, P(E|H) the likelihood, and P(H|E) the posterior.",
        reasoning:
          "It's tempting to treat \"the evidence fits this hypothesis well\" (a high likelihood) as basically the same thing as \"this hypothesis is probably true\" (a high posterior) — they sound like they should track each other closely, and often they do. But Bayes' theorem shows exactly when and why they can pull apart: P(H|E) = P(E|H) × P(H) / P(E). The posterior isn't just the likelihood — it's the likelihood SCALED by the prior.\n\nConcretely: imagine two hypotheses. Hypothesis A explains the evidence perfectly (P(E|A) = 0.99) but was wildly implausible beforehand (P(A) = 0.0001). Hypothesis B explains the evidence only okay (P(E|B) = 0.3) but was quite plausible beforehand (P(B) = 0.4). Even though A has the dramatically higher likelihood, running the numbers through Bayes' theorem, B ends up with the higher posterior — because A's tiny prior drags its posterior down further than its excellent likelihood can pull it back up.\n\nThis is exactly the error base rates guard against, restated in general terms: 'this evidence would be very likely if H were true' (high likelihood) is not the same claim as 'H is very likely, given this evidence' (high posterior) — and confusing the two is the same transposed-conditional mistake from the very start of this path, just now with vocabulary precise enough to catch it every time.",
        formalStatement:
          "The likelihood P(E|H) measures how well a hypothesis predicts observed evidence; the posterior P(H|E) measures how believable the hypothesis is once that evidence and the prior are combined. A high likelihood does not guarantee a high posterior — the prior can dominate.",
        example:
          "Hypothesis A: P(E|A)=0.99, P(A)=0.0001 → contributes 0.000099. Hypothesis B: P(E|B)=0.3, P(B)=0.4 → contributes 0.12. Despite A's much higher likelihood, B's posterior contribution is over 1,000× larger because of the prior.",
        misconception:
          "It's easy to assume 'the hypothesis that best explains the evidence must be the most probable one.' That's only true if the competing hypotheses had comparable priors to begin with — a hypothesis can be an excellent explanation of the evidence and still be improbable overall, if it was sufficiently implausible beforehand.",
      },
      whyItMatters:
        "This is the base-rate lesson generalized and named precisely — having the vocabulary to separate 'explains the evidence well' from 'is probably true' is what prevents the error in unfamiliar situations, not just the disease-test example.",
      prerequisites: ["bt-bayes-theorem", "bt-base-rates"],
      estMinutes: 12,
      retention: "medium",
      quiz: [
        {
          id: "q1",
          question: "A hypothesis has a very high likelihood for the observed evidence. Does that guarantee it has the highest posterior probability among competing hypotheses?",
          options: [
            "Yes, always — likelihood and posterior always agree",
            "Not necessarily — a hypothesis with a much lower prior can still end up with a lower posterior than a competitor with a more modest likelihood but a much higher prior",
            "Posterior and likelihood are literally the same number by definition",
            "No, likelihood is entirely irrelevant to the posterior",
          ],
          correctIndex: 1,
          explanation: "The posterior weighs the likelihood by the prior — a small enough prior can drag down even an excellent likelihood's contribution to the final posterior.",
        },
        {
          id: "q2",
          question: "Which quantity directly answers 'given what I've observed, how much should I believe this hypothesis'?",
          options: ["The likelihood, P(E|H)", "The posterior, P(H|E)", "The prior alone, P(H)", "None of these — that's not a well-defined Bayesian question"],
          correctIndex: 1,
          explanation: "The posterior is precisely that: the updated belief after combining prior and likelihood — the likelihood alone answers a different question (how well evidence fits a hypothesis).",
        },
      ],
    },
    {
      id: "bt-sequential-updating",
      title: "Updating on Evidence Sequentially",
      depth: 5,
      explanation: {
        foundation:
          "Bayes' theorem takes one prior and one piece of evidence and produces one posterior.",
        reasoning:
          "Real situations rarely hand you all the evidence at once — you get one clue, then another, then another, over time. Does that mean you need an entirely different tool for each new piece of evidence? Consider what a posterior actually represents: it's your updated belief, incorporating everything you knew at that point. The moment new evidence arrives, that posterior IS everything you currently know — it's no different in kind from the prior you started with before the first piece of evidence.\n\nSo the natural move is: run Bayes' theorem once, get a posterior. When the next piece of evidence shows up, use that posterior AS the new prior, and run Bayes' theorem again. There's no special \"multi-evidence\" version of the formula needed — you just chain the same single-update step, each time feeding yesterday's answer in as today's starting point.\n\nThis has a striking practical consequence: it doesn't matter whether your very first prior was excellent or badly wrong, as long as it wasn't literally 0% or 100% (which can never move, since Bayes' theorem always multiplies BY the prior — zero times anything stays zero). With enough good, unbiased evidence arriving sequentially, each update nudges the belief further toward whatever the evidence actually supports, and a poor starting guess gets progressively swamped. This is what makes Bayesian reasoning a genuinely practical tool over time, not just a one-shot calculation.",
        formalStatement:
          "Sequential Bayesian updating: after computing posterior P(H|E₁), treat it as the new prior when incorporating the next evidence E₂ to compute P(H|E₁,E₂), and so on — each posterior becomes the next step's prior, with no separate formula required for multiple pieces of evidence.",
        example:
          "Starting prior: 10% chance a coin is biased toward heads. After 3 heads in a row (evidence 1), posterior rises to ~35%. Using that 35% as the new prior, after 5 more heads (evidence 2), posterior rises further to ~90% — each update building on the last.",
        misconception:
          "A common misunderstanding is that sequential updating requires re-deriving Bayes' theorem differently for multiple pieces of evidence, or that the order evidence arrives in changes the final answer. Order doesn't matter for the final posterior (assuming independent evidence) — chaining single updates in any order converges to the same place, which is part of why the method is so robust in practice.",
      },
      whyItMatters:
        "This is what makes Bayesian reasoning practical over real time rather than a one-shot classroom calculation — and it's the mechanism behind every real-world case study that follows.",
      prerequisites: ["bt-priors", "bt-likelihood-posterior"],
      estMinutes: 12,
      retention: "medium",
      quiz: [
        {
          id: "q1",
          question: "When a second piece of evidence arrives after you've already computed one posterior, what do you use as the prior for updating on it?",
          options: [
            "You must go back to your very first, original prior",
            "The posterior from the first update becomes the prior for the second — it already represents everything you knew at that point",
            "You average the original prior with 50%",
            "Sequential updating isn't mathematically valid",
          ],
          correctIndex: 1,
          explanation: "A posterior is just 'everything currently known' — indistinguishable in kind from a prior, which is exactly why it can be chained forward as the next step's starting point.",
        },
        {
          id: "q2",
          question: "If your very first prior was significantly wrong, but you then receive plenty of strong, unbiased evidence over time, what tends to happen?",
          options: [
            "The wrong prior permanently distorts every future update",
            "Sequential updating progressively pulls the posterior toward what the evidence actually supports, swamping the poor starting guess — unless the prior was exactly 0% or 100%, which can never move",
            "Nothing changes; priors are fixed for life",
            "The process becomes mathematically undefined",
          ],
          correctIndex: 1,
          explanation: "Each update multiplies by new evidence; a non-extreme starting prior gets progressively overwhelmed by consistent, strong evidence across many updates.",
        },
      ],
    },
    {
      id: "bt-calibration",
      title: "Calibration: Do Your Probabilities Match Reality",
      depth: 5,
      explanation: {
        foundation:
          "You now know how to compute a posterior probability correctly (sequential updating) — but computing a number correctly and that number actually being trustworthy are two different claims.",
        reasoning:
          "How would you even check whether your stated probabilities mean anything? A single prediction can't be checked this way — if you say '80% chance of rain' and it doesn't rain, that's not necessarily wrong, since 80% still leaves room for the other 20%. You need many predictions to check the pattern, not any single one.\n\nSo look across, say, 100 different times you said '80% confident.' If your beliefs genuinely track reality, roughly 80 of those 100 things should actually turn out true — not exactly 80, but in that neighborhood. If instead only 50 of them come true, your '80%' doesn't mean what you think it means; you're systematically overconfident. If 95 come true, you're underconfident — leaving belief on the table you should have been more sure of.\n\nThis is calibration: not whether any single call was right, but whether your stated confidence, averaged across many calls, matches your actual hit rate. It turns \"I feel pretty sure\" from a vague, unfalsifiable feeling into a checkable, trainable skill — you can literally track your own 70%-confidence calls over time and see whether 70% of them come true. This is precisely the mechanism this learning path's own quizzes are built around: you predict a confidence, then get checked, specifically so this gap becomes visible to you.",
        formalStatement:
          "A forecaster is well-calibrated if, across many predictions made at a given confidence level X%, approximately X% of those predictions turn out true. Systematic deviation (predicted confidence consistently exceeding hit rate = overconfidence; consistently below = underconfidence) is measurable and correctable.",
        example:
          "Across 100 predictions where you said '90% confident,' a well-calibrated forecaster sees roughly 90 come true. If only 60 come true, that's a 30-point overconfidence gap — a concrete, measurable miscalibration, not just a feeling.",
        misconception:
          "People often equate 'confident' with 'correct' — assuming a confident person who's usually right must be well-calibrated. Someone can be right most of the time while still being poorly calibrated, if their confidence level doesn't match their actual hit rate at that level (e.g., claiming 95% confidence on calls that are only right 70% of the time, even if 70% is a respectable accuracy).",
      },
      whyItMatters:
        "This turns Bayesian reasoning from theory into a trainable, checkable skill — exactly the loop this app's own quizzes are built around.",
      prerequisites: ["bt-base-rates", "bt-likelihood-posterior"],
      estMinutes: 13,
      retention: "fast",
      quiz: [
        {
          id: "q1",
          question: "Why can't you check whether a single '80% confident' prediction was well-calibrated just by seeing if it came true or not?",
          options: [
            "You actually can — a wrong outcome always means bad calibration",
            "80% confidence explicitly leaves room for a 20% chance of being wrong — calibration is about whether the PATTERN across many such predictions matches the stated confidence, not any single outcome",
            "Single predictions are never useful for anything",
            "Because probability only applies to repeated events",
          ],
          correctIndex: 1,
          explanation: "One prediction being wrong doesn't violate an 80% claim — you need to look at the hit rate across MANY 80%-confidence predictions to assess calibration.",
        },
        {
          id: "q2",
          question: "If your '90% confident' predictions only turn out true about 55% of the time, what does that indicate?",
          options: [
            "You are well-calibrated",
            "You are underconfident",
            "You are significantly overconfident — your stated confidence doesn't match your actual hit rate",
            "This says nothing about calibration"
          ],
          correctIndex: 2,
          explanation: "A large gap between stated confidence (90%) and actual hit rate (55%) is the textbook definition of overconfidence — measurable, not just a feeling.",
        },
      ],
    },
    {
      id: "bt-optimizers-curse",
      title: "Avoiding Overconfidence: The Optimizer's Curse",
      depth: 6,
      explanation: {
        foundation:
          "You can now measure calibration (previous node) — but calibration is usually checked on your predictions in general. What happens specifically when you pick the SINGLE BEST option among many noisy estimates?",
        reasoning:
          "Suppose you're evaluating 20 candidate startup investments, each with an estimated return that's honestly uncertain — your estimate for each one is the true value plus some random error, sometimes overestimating, sometimes under. You pick the one with the highest ESTIMATED return. Here's the trap: you didn't just pick the option most likely to be genuinely best — you picked whichever option's estimate happened to have the most favorable random error attached to it, since a true middling option that got lucky with a high estimate looks identical, at selection time, to a true great option.\n\nAmong 20 noisy estimates, the maximum one is disproportionately likely to be a case where the noise pushed UP, not just where the true value was highest. So when you actually follow through on your top pick, its real performance tends to underperform its own estimate — not because you're unlucky afterward, but because the very act of selecting-the-max already selected for favorable noise, before anything happened.\n\nThe fix follows directly from priors and posteriors: don't just trust each estimate at face value — treat every estimate as evidence to combine with a reasonable prior (e.g., 'most startups return modestly, a few return hugely'), the same Bayesian updating from the rest of this path. That combination naturally pulls extreme, likely-inflated top estimates back toward a more realistic figure, precisely canceling out the bias that picking-the-max introduces.",
        formalStatement:
          "The optimizer's curse (winner's curse): selecting the option with the highest estimated value among several noisy estimates systematically overestimates that option's TRUE value, because selection favors options where random estimation error happened to be positive. Bayesian shrinkage — updating each estimate against a realistic prior — corrects for this bias.",
        example:
          "20 startups, true average return 1.2x, estimation noise ±0.5x. The estimate that happens to look highest (say, projected at 2.5x) likely combines a good true value with favorable noise — its actual realized return typically lands well below 2.5x, closer to what a Bayesian-adjusted estimate would have predicted.",
        misconception:
          "The natural assumption is 'the option that looks best on paper IS the best option, full stop — just go with the estimate.' The problem isn't dishonesty in any individual estimate; it's that the SELECTION process itself (picking the max across many noisy estimates) introduces a systematic upward bias that no single estimate would show on its own — this is a structural effect of maximizing over noise, not a flaw in any one number.",
      },
      whyItMatters:
        "This is calibration's real payoff in high-stakes decisions — and the final lesson of the path: even a perfectly rigorous process, applied naively to 'just pick the best estimate,' has a built-in bias that only explicit Bayesian correction catches.",
      prerequisites: ["bt-calibration"],
      estMinutes: 13,
      retention: "medium",
      quiz: [
        {
          id: "q1",
          question: "Why does the option with the single highest ESTIMATED value, among many noisy estimates, tend to underperform that estimate when realized?",
          options: [
            "It doesn't — the highest estimate is always the most reliable one",
            "Because selecting the maximum among noisy estimates disproportionately selects for cases where random error happened to push the estimate up, not just for genuinely high true values",
            "Because of bad luck occurring after the selection, unrelated to how the estimate was chosen",
            "Because noisy estimates are always biased low, never high",
          ],
          correctIndex: 1,
          explanation: "This is the optimizer's/winner's curse: the selection process itself (picking the max) systematically favors positive-noise cases, independent of anything that happens afterward.",
        },
        {
          id: "q2",
          question: "What's the Bayesian correction for the optimizer's curse, and why does it work?",
          options: [
            "Ignore all estimates and choose randomly instead",
            "Treat each estimate as evidence to combine with a realistic prior via Bayesian updating — this pulls extreme, likely-inflated estimates back toward a more realistic value, directly counteracting the upward selection bias",
            "Always pick the lowest estimate instead of the highest",
            "There is no correction; the curse is mathematically unavoidable",
          ],
          correctIndex: 1,
          explanation: "This is the same shrinkage-toward-the-prior mechanism from the rest of the path, applied specifically to counteract the bias introduced by maximizing over noisy estimates.",
        },
      ],
    },
  ],
};
