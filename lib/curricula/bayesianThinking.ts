import { Curriculum } from "../types";

export const bayesianThinking: Curriculum = {
  slug: "bayesian-thinking",
  topic: "Bayesian Thinking",
  tagline: "From 'what probability means' to catching your own overconfidence — in the order each idea requires the last.",
  generatedAt: "2026-01-01T00:00:00.000Z",
  source: "mock",
  nodes: [
    {
      id: "bt-prob-meaning",
      title: "What Probability Actually Means",
      depth: 0,
      summary:
        "Frequentists treat probability as a long-run frequency (roll a die a million times). Bayesians treat it as a degree of belief, updatable with evidence — which lets you assign a probability to one-off things like 'will it rain tomorrow' or 'is this claim true', not just repeatable events.",
      whyItMatters:
        "Every later node treats probability as a belief you update, not a frequency you count — this is the interpretive shift everything else depends on.",
      prerequisites: [],
      estMinutes: 8,
      retention: "medium",
      quiz: [
        {
          id: "q1",
          question: "A weather forecaster says 'there's a 70% chance of rain tomorrow.' What does this mean under the Bayesian interpretation?",
          options: [
            "It will rain for 70% of the day",
            "70% of the region will get rain",
            "A degree of belief: given the evidence, rain is the more likely outcome, at that confidence level",
            "The statement is meaningless since tomorrow only happens once",
          ],
          correctIndex: 2,
          explanation: "Bayesian probability applies to one-off, non-repeatable events by treating probability as a calibrated degree of belief given current evidence.",
        },
        {
          id: "q2",
          question: "What's the core difference between the frequentist and Bayesian views of probability?",
          options: [
            "Frequentists use bigger numbers",
            "Frequentism defines probability via long-run frequency; Bayesianism defines it as an updatable degree of belief",
            "There is no real difference, only notation",
            "Bayesianism only applies to gambling",
          ],
          correctIndex: 1,
          explanation: "Frequentism ties probability to repeatable trials; Bayesianism treats it as a belief state that evidence can update, even for unique events.",
        },
      ],
    },
    {
      id: "bt-conditional",
      title: "Conditional Probability",
      depth: 0,
      summary:
        "P(A|B) means 'the probability of A, given that B is true.' It's almost always different from P(A) alone — knowing B changes what you should believe about A. This notation is the basic unit every Bayesian calculation is built from.",
      whyItMatters:
        "Bayes' theorem is just an equation relating two conditional probabilities to each other — without this notation, it can't even be stated.",
      prerequisites: [],
      estMinutes: 9,
      retention: "slow",
      quiz: [
        {
          id: "q1",
          question: "P(rain | cloudy sky) is best read as:",
          options: [
            "The probability it is cloudy, given it is raining",
            "The probability of rain, given that the sky is cloudy",
            "The probability of rain and cloudy sky both, independently",
            "The probability of rain multiplied by cloudiness",
          ],
          correctIndex: 1,
          explanation: "The condition after the bar is the 'given' information — P(A|B) is A's probability under the assumption B is true.",
        },
        {
          id: "q2",
          question: "Is P(A|B) generally equal to P(B|A)?",
          options: [
            "Yes, always",
            "No — they can be very different (this confusion is a common source of reasoning errors)",
            "Only when A and B are the same event",
            "Only for continuous probabilities",
          ],
          correctIndex: 1,
          explanation: "P(A|B) and P(B|A) are usually different. Confusing them is called the 'transposed conditional' and causes real-world errors — see base rates next.",
        },
      ],
    },
    {
      id: "bt-bayes-theorem",
      title: "Bayes' Theorem, Derived",
      depth: 1,
      summary:
        "Starting from the definition of conditional probability, a few lines of algebra give Bayes' theorem: P(H|E) = P(E|H)·P(H) / P(E). It's a recipe for turning P(evidence | hypothesis) — which is often easy to know — into P(hypothesis | evidence), which is what you actually want.",
      whyItMatters:
        "This equation is the engine of the entire topic — priors, likelihoods, and posteriors are just its three named ingredients.",
      prerequisites: ["bt-conditional"],
      estMinutes: 14,
      retention: "slow",
      quiz: [
        {
          id: "q1",
          question: "In Bayes' theorem P(H|E) = P(E|H)·P(H) / P(E), what does P(H) represent?",
          options: [
            "The posterior — belief after seeing evidence",
            "The prior — belief before seeing evidence",
            "The likelihood of the evidence",
            "A normalizing constant with no meaning",
          ],
          correctIndex: 1,
          explanation: "P(H) is the prior: what you believed about the hypothesis before incorporating the new evidence E.",
        },
        {
          id: "q2",
          question: "Why is Bayes' theorem useful, practically?",
          options: [
            "It lets you avoid probability altogether",
            "It converts an easy-to-know quantity (evidence given hypothesis) into the hard-to-know one you actually want (hypothesis given evidence)",
            "It only works for coin flips",
            "It replaces the need for data",
          ],
          correctIndex: 1,
          explanation: "Often P(evidence|hypothesis) is known from a model or test's known accuracy, while P(hypothesis|evidence) — what you actually want to know — isn't directly measurable. Bayes bridges them.",
        },
      ],
    },
    {
      id: "bt-base-rates",
      title: "Base Rates & the Prosecutor's Fallacy",
      depth: 1,
      summary:
        "A medical test is 99% accurate. You test positive for a disease that only 1 in 10,000 people have. Your actual chance of having it is still under 1% — because the disease's rarity (the base rate) overwhelms the test's accuracy. Ignoring base rates like this is called the prosecutor's fallacy.",
      whyItMatters:
        "This is the single most common real-world Bayesian reasoning error — seeing it clearly is what makes 'priors matter' feel concrete instead of abstract.",
      prerequisites: ["bt-prob-meaning", "bt-conditional"],
      estMinutes: 12,
      retention: "medium",
      quiz: [
        {
          id: "q1",
          question: "Why can a 99%-accurate test still mean you probably don't have a rare disease, even after testing positive?",
          options: [
            "The test must be broken",
            "Because the disease is so rare, false positives from the healthy majority outnumber true positives from the few actually sick",
            "99% accuracy isn't a real number",
            "It can't — a positive result is always reliable",
          ],
          correctIndex: 1,
          explanation: "With a low base rate, the vastly larger pool of healthy people produces enough false positives to swamp the true positives, even at high test accuracy.",
        },
        {
          id: "q2",
          question: "The 'prosecutor's fallacy' specifically refers to:",
          options: [
            "Prosecutors always lying in court",
            "Confusing P(evidence | innocent) with P(innocent | evidence), ignoring the base rate of guilt",
            "A rule that only applies to criminal law",
            "Refusing to present evidence",
          ],
          correctIndex: 1,
          explanation: "It's naming the transposed-conditional error from node 2 in a courtroom context: a rare-coincidence probability gets mistaken for a guilt probability, without accounting for how many innocent people could also match.",
        },
      ],
    },
    {
      id: "bt-priors",
      title: "Priors: Where Do They Come From",
      depth: 2,
      summary:
        "A prior is your belief before new evidence. It can come from past data (informative), from a deliberately neutral default (uninformative), or from someone's honest judgment (subjective) — and in Bayesian practice, being upfront about which kind you're using matters more than pretending you have none.",
      whyItMatters:
        "Everything downstream — sequential updating, calibration — assumes you can name your starting point; this node is about doing that honestly.",
      prerequisites: ["bt-bayes-theorem"],
      estMinutes: 10,
      retention: "medium",
      quiz: [
        {
          id: "q1",
          question: "Is it possible to do a Bayesian analysis with literally no prior belief at all?",
          options: [
            "Yes, and this is the standard approach",
            "Not really — even a 'neutral' or 'uninformative' prior is still a specific choice that shapes the result",
            "Only for binary events",
            "Priors are optional and rarely matter",
          ],
          correctIndex: 1,
          explanation: "There's no truly assumption-free starting point; an 'uninformative' prior (like 50/50) is still a choice, and a poor one can visibly distort the posterior.",
        },
        {
          id: "q2",
          question: "A doctor's prior for a diagnosis based on 20 years of patient history is an example of:",
          options: ["An uninformative prior", "An informative prior", "A posterior", "A likelihood"],
          correctIndex: 1,
          explanation: "It's built from real accumulated data/experience — that's exactly what makes a prior 'informative' rather than a neutral default.",
        },
      ],
    },
    {
      id: "bt-likelihood-posterior",
      title: "Likelihood vs. Posterior",
      depth: 2,
      summary:
        "The likelihood, P(evidence | hypothesis), asks 'how well does this hypothesis predict what I saw?' The posterior, P(hypothesis | evidence), asks 'given what I saw, how much should I believe this hypothesis?' They sound similar and are routinely conflated — but only the posterior is the belief you actually want.",
      whyItMatters:
        "Confusing these two is the same error as the prosecutor's fallacy, at a more abstract level — naming it precisely is what prevents it in practice.",
      prerequisites: ["bt-bayes-theorem"],
      estMinutes: 11,
      retention: "medium",
      quiz: [
        {
          id: "q1",
          question: "A hypothesis has a high likelihood for the observed data. Does that mean the hypothesis is probably true?",
          options: [
            "Yes, always",
            "Not necessarily — a low-prior hypothesis can have a high likelihood and still have a low posterior",
            "Likelihood and posterior are the same thing, so yes by definition",
            "No, likelihood is irrelevant to belief",
          ],
          correctIndex: 1,
          explanation: "The posterior also weighs the prior — a hypothesis that explains the data well (high likelihood) but was very unlikely beforehand can still end up improbable overall.",
        },
        {
          id: "q2",
          question: "Which one is the answer to 'what should I believe now that I've seen this evidence'?",
          options: ["The likelihood", "The posterior", "The prior", "Neither — that's not a Bayesian question"],
          correctIndex: 1,
          explanation: "The posterior is exactly that: your updated belief after combining the prior with the evidence's likelihood.",
        },
      ],
    },
    {
      id: "bt-sequential-updating",
      title: "Updating on Evidence Sequentially",
      depth: 3,
      summary:
        "Today's posterior becomes tomorrow's prior. As new evidence arrives, you don't start over — you fold each new piece into your existing belief, one Bayes'-theorem step at a time, converging toward the truth as evidence accumulates.",
      whyItMatters:
        "This is what makes Bayesian reasoning practical over time rather than a one-shot calculation — and it's the mechanism behind every real-world case study that follows.",
      prerequisites: ["bt-priors", "bt-likelihood-posterior"],
      estMinutes: 12,
      retention: "medium",
      quiz: [
        {
          id: "q1",
          question: "After incorporating one piece of evidence, what do you use as the prior for the next piece of evidence?",
          options: [
            "You go back to your original prior",
            "Yesterday's posterior becomes today's prior",
            "You always reset to 50/50",
            "Sequential updating isn't valid in Bayesian statistics",
          ],
          correctIndex: 1,
          explanation: "This is the core mechanic of sequential Bayesian updating — beliefs accumulate evidence over time rather than resetting.",
        },
        {
          id: "q2",
          question: "If your prior was badly wrong but you keep gathering strong, unbiased evidence, what tends to happen over many updates?",
          options: [
            "The wrong prior wins forever",
            "The posterior increasingly converges toward what the evidence actually supports",
            "Nothing changes — priors are permanent",
            "The process breaks down mathematically",
          ],
          correctIndex: 1,
          explanation: "With enough good evidence, sequential updating tends to overwhelm even a poor starting prior — though a prior of exactly 0% or 100% can never update at all.",
        },
      ],
    },
    {
      id: "bt-calibration",
      title: "Calibration: Do Your Probabilities Match Reality",
      depth: 3,
      summary:
        "If you say '80% confident' about 100 different things, roughly 80 of them should turn out true — if fewer do, you're overconfident; if more do, you're underconfident. Calibration is the discipline of checking this, not just having beliefs but tracking whether your stated confidence matches your actual hit rate.",
      whyItMatters:
        "This turns Bayesian reasoning from theory into a trainable, checkable skill — exactly the loop this app's own quizzes are built around.",
      prerequisites: ["bt-base-rates", "bt-likelihood-posterior"],
      estMinutes: 13,
      retention: "fast",
      quiz: [
        {
          id: "q1",
          question: "Someone is 'well-calibrated' if:",
          options: [
            "They are always right",
            "Their stated confidence levels match their actual accuracy rate over many predictions",
            "They never state a probability below 90%",
            "They only make binary yes/no predictions",
          ],
          correctIndex: 1,
          explanation: "Calibration is about the match between confidence and outcome frequency — a well-calibrated forecaster's '70% chance' events happen about 70% of the time, no more, no less.",
        },
        {
          id: "q2",
          question: "If your '90% confident' predictions only turn out true 60% of the time, you are:",
          options: ["Well-calibrated", "Underconfident", "Overconfident", "Using probability incorrectly by definition"],
          correctIndex: 2,
          explanation: "Stating much higher confidence than your actual hit rate is the textbook definition of overconfidence.",
        },
      ],
    },
    {
      id: "bt-case-studies",
      title: "Bayesian Reasoning in the Wild",
      depth: 4,
      summary:
        "From Alan Turing's codebreakers using sequential Bayesian updating to crack Enigma faster, to modern spam filters and medical diagnosis systems — real high-stakes decisions have long relied on exactly this update-on-evidence loop, often before it had the name 'Bayesian' attached.",
      whyItMatters:
        "Seeing the abstract machinery actually decide real historical outcomes is what makes it stick as more than a math exercise.",
      prerequisites: ["bt-sequential-updating"],
      estMinutes: 11,
      retention: "fast",
      quiz: [
        {
          id: "q1",
          question: "How did Bletchley Park codebreakers use Bayesian-style reasoning against Enigma?",
          options: [
            "They didn't — it was pure brute force",
            "They sequentially updated the likelihood of candidate settings as each new piece of intercepted evidence arrived",
            "They guessed randomly and got lucky",
            "They used only frequentist statistics",
          ],
          correctIndex: 1,
          explanation: "Turing's team effectively performed sequential likelihood updates to narrow down Enigma's settings far faster than exhaustive search.",
        },
        {
          id: "q2",
          question: "A modern spam filter that gets better as it sees more labeled emails is applying which idea from this path?",
          options: [
            "Simultaneity", "Sequential Bayesian updating — each email is new evidence refining the model's posterior", "Length contraction", "The prosecutor's fallacy",
          ],
          correctIndex: 1,
          explanation: "Spam filters (e.g. naive Bayes classifiers) are a direct, everyday application of updating beliefs as new labeled evidence arrives.",
        },
      ],
    },
    {
      id: "bt-optimizers-curse",
      title: "Avoiding Overconfidence: The Optimizer's Curse",
      depth: 4,
      summary:
        "When you pick the best-looking option among many noisy estimates (the highest-projected startup return, the top-ranked candidate), you're selecting partly for luck in the noise, not just true quality — so the winner's real performance tends to disappoint relative to its estimate. Calibrated Bayesian reasoning corrects for this by shrinking extreme estimates toward the average.",
      whyItMatters:
        "This is calibration's payoff in real decisions — the final, practical lesson of the whole path: your best-looking option is systematically less good than it looks.",
      prerequisites: ["bt-calibration"],
      estMinutes: 12,
      retention: "medium",
      quiz: [
        {
          id: "q1",
          question: "Why does the 'best-looking' option among many noisy estimates tend to underperform its projection?",
          options: [
            "It doesn't — the best estimate is always the best choice",
            "Selecting the max of many noisy estimates partly selects for overestimation error, not just true quality",
            "Because of bad luck alone, unrelated to the selection process",
            "Because noisy estimates are always too low, never too high",
          ],
          correctIndex: 1,
          explanation: "This is the optimizer's curse / winner's curse: picking the highest of many noisy estimates disproportionately picks options that got lucky on the noise, inflating the apparent winner.",
        },
        {
          id: "q2",
          question: "What's the Bayesian correction for the optimizer's curse?",
          options: [
            "Ignore all estimates and guess randomly",
            "Shrink extreme estimates toward a reasonable prior/average before trusting them",
            "Always choose the lowest estimate instead",
            "There is no correction — the curse is unavoidable",
          ],
          correctIndex: 1,
          explanation: "Treating each estimate as evidence to combine with a sensible prior (rather than taking it at face value) pulls extreme, likely-inflated values back toward realism.",
        },
      ],
    },
  ],
};
