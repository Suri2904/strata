import { Curriculum } from "../types";

export const specialRelativity: Curriculum = {
  slug: "special-relativity",
  topic: "Special Relativity",
  tagline: "From 'motion is relative' to E = mc², in the order each idea actually requires the last.",
  generatedAt: "2026-01-01T00:00:00.000Z",
  source: "mock",
  nodes: [
    {
      id: "sr-frames",
      title: "Reference Frames & Relative Motion",
      depth: 0,
      summary:
        "Every measurement of motion is made from somewhere. A ball 'at rest' on a moving train is moving to someone on the platform — both are correct. Classical (Galilean) relativity says the laws of physics look the same in any frame moving at constant velocity.",
      whyItMatters:
        "Every later idea in relativity is a statement about what changes — and what doesn't — between frames like this.",
      prerequisites: [],
      estMinutes: 8,
      retention: "medium",
      quiz: [
        {
          id: "q1",
          question: "A person walks forward at 5 km/h inside a train moving at 80 km/h. What is their speed relative to the ground (classically)?",
          options: ["5 km/h", "75 km/h", "80 km/h", "85 km/h"],
          correctIndex: 3,
          explanation: "Classically, velocities simply add: 80 + 5 = 85 km/h relative to the ground.",
        },
        {
          id: "q2",
          question: "What does it mean for a reference frame to be 'inertial'?",
          options: [
            "It is exactly at rest relative to the Earth",
            "It moves at constant velocity — no acceleration, no rotation",
            "It is the frame of the fastest-moving observer",
            "It only applies to frames near the speed of light",
          ],
          correctIndex: 1,
          explanation: "An inertial frame is one moving at constant velocity (including zero) — no forces acting to accelerate it.",
        },
      ],
    },
    {
      id: "sr-lightspeed",
      title: "The Speed of Light Is Constant",
      depth: 0,
      summary:
        "The Michelson-Morley experiment (1887) tried to detect Earth's motion through a hypothetical 'ether' by measuring tiny differences in light's speed in different directions. It found none. Light moves at c ≈ 299,792 km/s for every observer, regardless of how fast they or the source are moving.",
      whyItMatters:
        "This one stubborn experimental fact is the seed that breaks classical velocity-addition and forces everything that follows.",
      prerequisites: [],
      estMinutes: 7,
      retention: "medium",
      quiz: [
        {
          id: "q1",
          question: "You shine a flashlight while moving toward a wall at 90% the speed of light. How fast does the light hit the wall, relative to you?",
          options: ["1.9c (90% faster than light)", "Still c", "0.1c", "Depends on the wall's color"],
          correctIndex: 1,
          explanation: "Unlike classical velocity addition, light's speed is c for every observer — your own motion doesn't add to it.",
        },
        {
          id: "q2",
          question: "What was the key surprise of the Michelson-Morley experiment?",
          options: [
            "Light travels faster in a vacuum",
            "Earth isn't actually moving",
            "No variation in light's speed was found, despite Earth's motion through space",
            "Light is a particle, not a wave",
          ],
          correctIndex: 2,
          explanation: "They expected to detect Earth's motion through the 'ether' via light-speed variation and found none — light's speed was the same in every direction.",
        },
      ],
    },
    {
      id: "sr-simultaneity",
      title: "Simultaneity Is Relative",
      depth: 1,
      summary:
        "If light's speed is the same for everyone, two events that look simultaneous to one observer can look sequential to another moving observer — because 'at the same time' secretly depends on how light travel-time is being measured across space.",
      whyItMatters:
        "Once 'now' stops being universal, time itself has to bend per-observer — which is exactly what time dilation formalizes next.",
      prerequisites: ["sr-frames", "sr-lightspeed"],
      estMinutes: 10,
      retention: "medium",
      quiz: [
        {
          id: "q1",
          question: "Two lightning bolts strike simultaneously according to an observer standing on a platform. A passenger on a fast-moving train sees them how?",
          options: [
            "Also exactly simultaneous",
            "Possibly not simultaneous — order can differ from the platform observer's",
            "Neither bolt happens at all",
            "The train passenger sees them happen faster",
          ],
          correctIndex: 1,
          explanation: "Simultaneity depends on the observer's frame — the moving passenger can genuinely disagree on the order, with no 'error' involved.",
        },
        {
          id: "q2",
          question: "Why can't 'simultaneous' be an absolute, frame-independent fact?",
          options: [
            "Because clocks are never perfectly accurate",
            "Because light needs time to travel, and observers in relative motion measure that travel-time differently",
            "Because gravity distorts all clocks equally",
            "It actually is absolute — this is a common myth",
          ],
          correctIndex: 1,
          explanation: "Determining 'at the same time' across distant locations requires timing light's arrival — and that timing shifts with relative motion.",
        },
      ],
    },
    {
      id: "sr-time-dilation",
      title: "Time Dilation",
      depth: 1,
      summary:
        "Using a 'light clock' thought experiment (light bouncing between two mirrors), a clock moving relative to you ticks slower than an identical clock at rest with you. The faster the relative speed, the bigger the effect — formalized as Δt' = γΔt.",
      whyItMatters:
        "Time dilation is the first quantitative payoff of 'light speed is constant' — everything after this builds its math on γ (the Lorentz factor).",
      prerequisites: ["sr-lightspeed"],
      estMinutes: 12,
      retention: "slow",
      quiz: [
        {
          id: "q1",
          question: "A spaceship travels at a large fraction of light speed past Earth. Compared to an Earth clock, the ship's clock (as seen from Earth) runs:",
          options: ["Faster", "Slower", "Exactly the same", "It stops entirely"],
          correctIndex: 1,
          explanation: "From Earth's frame, the moving clock ticks slower — this is time dilation, confirmed experimentally with fast-moving particles and atomic clocks on jets.",
        },
        {
          id: "q2",
          question: "The Lorentz factor γ is close to 1 at everyday speeds and grows toward infinity as speed approaches c. What does a large γ mean physically?",
          options: [
            "Time and length effects become extreme near light speed",
            "The object becomes invisible",
            "Mass decreases without bound",
            "Nothing changes — γ is just a bookkeeping constant",
          ],
          correctIndex: 0,
          explanation: "γ scales how dramatically time dilates and lengths contract — near c, these effects become extreme rather than negligible.",
        },
      ],
    },
    {
      id: "sr-length-contraction",
      title: "Length Contraction",
      depth: 2,
      summary:
        "An object moving relative to you appears shortened along its direction of motion, by the same factor γ that stretches time. A meter stick flying past at relativistic speed measures shorter than a meter — to you, not to someone moving with it.",
      whyItMatters:
        "Time dilation and length contraction are two faces of the same coin — seeing both side by side sets up the unified transformation that comes next.",
      prerequisites: ["sr-time-dilation"],
      estMinutes: 9,
      retention: "medium",
      quiz: [
        {
          id: "q1",
          question: "A 100m-long spaceship flies past you at relativistic speed. You measure its length as:",
          options: ["Exactly 100m", "Less than 100m", "More than 100m", "Undefined — length has no meaning in motion"],
          correctIndex: 1,
          explanation: "You measure it contracted along its direction of travel; the crew on board still measures it as 100m in their own rest frame.",
        },
        {
          id: "q2",
          question: "Does length contraction happen in every direction, or only one?",
          options: [
            "Every direction equally",
            "Only along the direction of relative motion",
            "Only perpendicular to the motion",
            "Only for objects made of solid matter",
          ],
          correctIndex: 1,
          explanation: "Contraction only affects the dimension parallel to the relative velocity — perpendicular dimensions are unchanged.",
        },
      ],
    },
    {
      id: "sr-lorentz",
      title: "The Lorentz Transformation",
      depth: 2,
      summary:
        "The single set of equations that converts an event's position and time from one inertial frame to another, replacing the classical Galilean transformation. Time dilation, length contraction, and relativity of simultaneity all fall out of it as special cases.",
      whyItMatters:
        "This is the mathematical spine of special relativity — once you have it, spacetime geometry and velocity addition become derivations, not new assumptions.",
      prerequisites: ["sr-simultaneity", "sr-time-dilation"],
      estMinutes: 15,
      retention: "slow",
      quiz: [
        {
          id: "q1",
          question: "What does the Lorentz transformation replace?",
          options: [
            "Newton's laws of motion",
            "The Galilean transformation (simple x' = x - vt) for converting between frames",
            "The conservation of energy",
            "Maxwell's equations",
          ],
          correctIndex: 1,
          explanation: "Galilean transformations work at low speed but break down near c; the Lorentz transformation is the correct version at all speeds.",
        },
        {
          id: "q2",
          question: "As relative velocity v approaches 0 (everyday speeds), the Lorentz transformation approaches:",
          options: [
            "Infinity",
            "The Galilean transformation — relativity 'turns off' at low speed",
            "Zero",
            "It stays exactly the same at all speeds",
          ],
          correctIndex: 1,
          explanation: "This is why relativity was missed for centuries — at everyday speeds γ ≈ 1 and the equations collapse to familiar Newtonian ones.",
        },
      ],
    },
    {
      id: "sr-spacetime",
      title: "Spacetime & the Invariant Interval",
      depth: 3,
      summary:
        "Space and time mix under the Lorentz transformation, but one quantity — the spacetime interval between two events — stays the same for every observer. This is the deep insight of Minkowski spacetime: reality's true invariant isn't distance or duration alone, but a combination of both.",
      whyItMatters:
        "Thinking in spacetime, not separate space-and-time, is what lets relativistic mass-energy and the twin paradox resolve cleanly instead of paradoxically.",
      prerequisites: ["sr-lorentz"],
      estMinutes: 14,
      retention: "slow",
      quiz: [
        {
          id: "q1",
          question: "Two different observers, moving relative to each other, measure the time and distance between two events. What do they agree on?",
          options: [
            "Nothing — all measurements differ",
            "The spacetime interval between the two events",
            "The exact time only",
            "The exact distance only",
          ],
          correctIndex: 1,
          explanation: "Time and distance separately are frame-dependent, but the spacetime interval combining them is invariant — the same for all inertial observers.",
        },
        {
          id: "q2",
          question: "Minkowski's key reframing of relativity was to treat:",
          options: [
            "Time as completely separate from space, just faster",
            "Space and time as a single four-dimensional geometric structure",
            "Gravity as the only real force",
            "Light as having mass",
          ],
          correctIndex: 1,
          explanation: "Minkowski spacetime unifies 3 space dimensions and 1 time dimension into one geometric object where the interval is the invariant 'distance'.",
        },
      ],
    },
    {
      id: "sr-velocity-addition",
      title: "Relativistic Velocity Addition",
      depth: 3,
      summary:
        "Velocities don't simply add anymore. Throwing a ball at 0.5c from a ship moving at 0.5c doesn't get you to c — the relativistic formula caps the combined speed just under c, consistent with nothing exceeding light speed.",
      whyItMatters:
        "This closes the loop on the very first classical assumption from node one (velocities just add) — showing exactly how and why it was only ever an approximation.",
      prerequisites: ["sr-lorentz"],
      estMinutes: 10,
      retention: "medium",
      quiz: [
        {
          id: "q1",
          question: "A ship moving at 0.5c fires a probe forward at 0.5c relative to the ship. The probe's speed relative to a stationary observer is:",
          options: ["1.0c (exactly light speed)", "Slightly less than 0.8c", "1.5c", "Exactly 0.5c"],
          correctIndex: 1,
          explanation: "Relativistic addition gives (0.5+0.5)/(1+0.5×0.5) c ≈ 0.8c — always less than c, never reaching or exceeding it.",
        },
        {
          id: "q2",
          question: "Why can't relativistic velocity addition ever produce a result faster than light, no matter the inputs (as long as both are under c)?",
          options: [
            "It's an arbitrary rule imposed on the formula",
            "The formula's structure mathematically caps the result below c",
            "It can, in rare cases",
            "Because light has no speed limit itself",
          ],
          correctIndex: 1,
          explanation: "The relativistic velocity-addition formula is built directly from the Lorentz transformation, which enforces c as an unreachable ceiling by construction.",
        },
      ],
    },
    {
      id: "sr-emc2",
      title: "Mass-Energy Equivalence (E = mc²)",
      depth: 4,
      summary:
        "Applying the spacetime framework to momentum and energy reveals that mass and energy are the same underlying quantity, convertible into one another. A resting object with mass m carries an intrinsic energy mc² — explaining, among other things, why nuclear reactions release enormous energy from tiny mass changes.",
      whyItMatters:
        "This is the famous payoff of the whole chain — but only makes sense once spacetime (not separate space and time) is the framework you're reasoning in.",
      prerequisites: ["sr-spacetime"],
      estMinutes: 12,
      retention: "medium",
      quiz: [
        {
          id: "q1",
          question: "E = mc² says that:",
          options: [
            "Mass and energy are unrelated but both conserved",
            "Mass is a form of energy, and a small amount of mass corresponds to a huge amount of energy",
            "Energy travels faster than light",
            "Only moving objects have energy",
          ],
          correctIndex: 1,
          explanation: "Because c² is enormous, even tiny amounts of mass converted to energy (as in nuclear fission) release vast energy.",
        },
        {
          id: "q2",
          question: "Why does nuclear fission release so much energy from such a small amount of material?",
          options: [
            "It doesn't — this is a common misconception",
            "A small mass deficit between reactants and products converts to energy via E = mc²",
            "It converts sound into light",
            "It relies on classical chemical bond energy only",
          ],
          correctIndex: 1,
          explanation: "The products of fission weigh slightly less than the original nucleus — that 'missing' mass becomes energy, scaled by c².",
        },
      ],
    },
    {
      id: "sr-twin-paradox",
      title: "The Twin Paradox, Resolved",
      depth: 4,
      summary:
        "One twin stays on Earth; the other flies to a distant star at relativistic speed and returns. The traveling twin ages less — not a paradox once you notice the situation isn't symmetric: only the traveling twin accelerates (turns around), breaking the tie that would otherwise make 'who's really moving' ambiguous.",
      whyItMatters:
        "It's the classic stress-test of everything above — if time dilation, spacetime intervals, and velocity addition don't resolve this cleanly, something upstream was misunderstood.",
      prerequisites: ["sr-spacetime", "sr-velocity-addition"],
      estMinutes: 13,
      retention: "medium",
      quiz: [
        {
          id: "q1",
          question: "Why isn't the twin paradox a real contradiction, even though 'each twin sees the other moving'?",
          options: [
            "It actually is a contradiction — physics has no answer",
            "Only the traveling twin undergoes acceleration (turning around), breaking the symmetry between the two frames",
            "The Earth twin secretly moves faster",
            "Time dilation doesn't really happen — it's an illusion",
          ],
          correctIndex: 1,
          explanation: "The situation looks symmetric only if you ignore the turnaround — that acceleration is real, frame-independent, and identifies which twin actually changed inertial frames.",
        },
        {
          id: "q2",
          question: "When the twins reunite, who has aged less?",
          options: [
            "The Earth-bound twin",
            "The traveling twin",
            "They've aged identically",
            "It depends on which twin you ask",
          ],
          correctIndex: 1,
          explanation: "The traveling twin, having spent time in a different inertial frame and undergone the asymmetric acceleration, has objectively aged less — confirmed experimentally with atomic clocks on aircraft.",
        },
      ],
    },
  ],
};
