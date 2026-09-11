import { Curriculum } from "../types";

export const specialRelativity: Curriculum = {
  slug: "special-relativity",
  topic: "Special Relativity",
  tagline: "From 'motion is relative' to E = mc², each idea derived from the last, not asserted.",
  generatedAt: "2026-01-01T00:00:00.000Z",
  source: "mock",
  nodes: [
    {
      id: "sr-frames",
      title: "Reference Frames & Relative Motion",
      depth: 0,
      explanation: {
        foundation:
          "You already know that speed is a comparison, not an absolute — a parked car has speed zero to you, but the person walking past it would say the same about themselves.",
        reasoning:
          "Sit on a train moving at 80 km/h and roll a ball forward at 5 km/h across the aisle. To you, the ball moves at 5 km/h. But to someone standing on the platform watching the train go by, the ball is moving at 80 + 5 = 85 km/h — it's on a train that's itself moving, and velocities in the same direction just add.\n\nNeither of you is wrong. There's no experiment either of you can run, sealed inside your own frame, that tells you which one is \"really\" moving — throw a ball straight up on a smoothly moving train and it comes straight back down, exactly as it would sitting still. This is the seed of relativity: the laws of physics don't pick out a preferred frame. Two observers moving at constant velocity relative to each other are equally entitled to call themselves \"at rest.\"\n\nSo when we ask \"how fast is X moving,\" the honest answer is always \"relative to what?\" — and once you name the second frame, adding velocities the way we just did (85 = 80 + 5) is the classical, intuitive answer. Hold onto that number — it's about to break.",
        formalStatement:
          "In an inertial frame (one moving at constant velocity, undergoing no acceleration), the laws of physics take the same form as in any other inertial frame — this is the principle of Galilean relativity, and it predicts velocities add linearly: v_total = v_frame + v_object.",
        example:
          "A passenger throws a ball forward at 5 km/h on a train moving at 80 km/h. Platform observer's measured ball speed: 80 + 5 = 85 km/h. A passenger throws the same ball backward at 5 km/h instead: platform observer measures 80 − 5 = 75 km/h.",
        misconception:
          "People often think there must be some frame that's \"really\" stationary — usually the ground. But the ground itself is spinning with Earth's rotation, orbiting the Sun, and moving with the galaxy. There's no experiment inside a sealed, smoothly-moving frame that can detect its own motion; \"at rest\" is only ever meaningful relative to something else.",
      },
      whyItMatters:
        "Every later idea in relativity is a statement about what changes — and what doesn't — between frames like this.",
      prerequisites: [],
      estMinutes: 9,
      retention: "medium",
      quiz: [
        {
          id: "q1",
          question: "A train moves at 80 km/h. A passenger walks toward the front at 5 km/h. Why does a platform observer measure 85 km/h rather than just 80 or just 5?",
          options: [
            "Because the platform observer's clock runs differently",
            "Because the passenger's motion is added on top of the train's motion — both displacements happen in the same time interval, from the platform's frame",
            "Because 85 km/h is a rounding artifact",
            "The platform observer would actually measure exactly 80 km/h",
          ],
          correctIndex: 1,
          explanation: "From the platform's frame, the passenger covers the train's distance plus their own walking distance in the same time — the two velocities combine additively because both distances are measured in the one observer's frame.",
        },
        {
          id: "q2",
          question: "Why can't a passenger sealed inside a smoothly moving train (no windows, no acceleration) determine their speed using only experiments inside the train?",
          options: [
            "Because instruments don't work well on trains",
            "Because the laws of physics behave identically in any inertial frame — there's nothing internal to a frame that reveals its velocity relative to another frame",
            "Because trains move too slowly for effects to show up",
            "They actually can, using a simple pendulum",
          ],
          correctIndex: 1,
          explanation: "This is the core of Galilean relativity: constant-velocity motion produces no detectable internal effect, because physics doesn't single out a preferred frame.",
        },
      ],
    },
    {
      id: "sr-lightspeed",
      title: "The Speed of Light Is Constant",
      depth: 1,
      explanation: {
        foundation:
          "You just established that velocities add: if you're moving toward something at speed v and it approaches you at speed w, you measure it closing in at v + w.",
        reasoning:
          "Apply that same addition rule to light. Earth orbits the Sun at about 30 km/s. If light is a wave traveling through some medium (physicists in the 1880s called it \"the ether\"), then Earth's motion through that medium should shift the measured speed of light depending on direction — like swimming with or against a current. Michelson and Morley built an extraordinarily precise instrument in 1887 specifically to detect this shift, splitting a light beam, sending the halves in perpendicular directions, and measuring the tiny difference in return time.\n\nThey found nothing. No shift, in any direction, at any time of year — down to a sensitivity that should have easily caught Earth's 30 km/s motion through a stationary ether. The velocity-addition rule from the last node, which works perfectly for trains and balls, simply fails for light. Whatever frame you measure light's speed from — standing still, or moving toward the source, or away from it — you get the same number: c ≈ 299,792 km/s.\n\nThis isn't a small correction to classical mechanics. It means the one rule we just built our intuition on — velocities add — cannot be universally true. Something about space or time itself has to give, and figuring out what is exactly what the rest of this path is for.",
        formalStatement:
          "The speed of light in vacuum, c ≈ 2.998 × 10⁸ m/s, is measured to be the same value by every inertial observer, regardless of the relative motion between the observer and the light source.",
        example:
          "A spaceship moves toward Earth at 90% of light speed and fires a laser at Earth. Classical addition would predict Earth measures the light at 1.9c. It doesn't — Earth measures exactly c, same as if the ship were stationary.",
        misconception:
          "A common guess is that light's speed is only constant \"in a vacuum with no observer motion,\" and that a fast-moving observer would still measure some difference if they tried hard enough. Every precision experiment since Michelson-Morley — including modern versions using lasers and atomic clocks — confirms the invariance holds at any measured velocity, including 90%+ of c.",
      },
      whyItMatters:
        "This one stubborn experimental fact is the seed that breaks classical velocity-addition and forces everything that follows.",
      prerequisites: ["sr-frames"],
      estMinutes: 9,
      retention: "medium",
      quiz: [
        {
          id: "q1",
          question: "The Michelson-Morley experiment was designed to detect Earth's motion through a hypothetical \"ether\" by measuring:",
          options: [
            "The color shift of starlight",
            "Tiny differences in light's round-trip travel time in different directions, expected if Earth moves through a light-carrying medium",
            "The temperature of empty space",
            "The gravitational pull of the Sun on light",
          ],
          correctIndex: 1,
          explanation: "By splitting a beam and comparing return times along perpendicular paths, any \"ether wind\" from Earth's motion should have produced a detectable shift — and didn't.",
        },
        {
          id: "q2",
          question: "You're in a ship moving toward Earth at 0.9c and fire a laser at Earth. Using what you learned in the previous node about adding velocities, what would you naively predict Earth measures the light at — and what do they actually measure?",
          options: [
            "Predict 1.9c; actually measure 1.9c",
            "Predict 1.9c; actually measure c",
            "Predict c; actually measure c",
            "Predict 0.1c; actually measure c",
          ],
          correctIndex: 1,
          explanation: "Classical addition (0.9c + c) predicts 1.9c, but every measurement gives exactly c — this is precisely the rule-breaking result that forces relativity.",
        },
      ],
    },
    {
      id: "sr-simultaneity",
      title: "Simultaneity Is Relative",
      depth: 2,
      explanation: {
        foundation:
          "Light's speed is the same for every observer (previous node), and determining whether two distant events happen \"at the same time\" requires timing when light from each event reaches you.",
        reasoning:
          "Picture a train car with a light bulb at its exact center, and mirrors — or just observers — at the front and back walls. The bulb flashes. A passenger standing at the center of the car sees the light hit both walls at the same instant, since the light travels equal distances at equal speed in both directions. So the passenger says: front and back flashes were simultaneous.\n\nNow watch this from the platform. The train is moving forward. By the time the light (still traveling at c, from every observer's measurement — that's the rule we just established) reaches the back wall, the back wall has moved slightly toward where the light started. But the front wall has moved slightly away. So from the platform's view, the light reaches the back wall slightly before it reaches the front wall.\n\nBoth observers did everything right. Nobody's clock is broken and nobody made an error — the passenger's \"simultaneous\" and the platform observer's \"back-first\" are both correct descriptions, just in different frames. The only way this makes sense is if \"at the same time\" isn't a fact about the universe that everyone agrees on — it's a fact that depends on your frame of motion.",
        formalStatement:
          "Two events that are simultaneous in one inertial frame are, in general, NOT simultaneous in a different inertial frame moving relative to the first — simultaneity is frame-dependent, not absolute.",
        example:
          "A train's center light flashes. The passenger (moving WITH the train) sees both walls lit simultaneously. The platform observer (stationary) sees the back wall lit first, because the train's forward motion carries the front wall away from the light and the back wall toward it during the light's travel time.",
        misconception:
          "It's tempting to think this is just an optical illusion caused by light-travel delays that could be \"corrected for\" to reveal the real, single truth. It isn't a delay artifact — both observers already account for light's travel time in their own frame, and they still disagree. The disagreement is real and physical, not a measurement error.",
      },
      whyItMatters:
        "Once 'now' stops being universal, time itself has to bend per-observer — which is exactly what time dilation formalizes next.",
      prerequisites: ["sr-frames", "sr-lightspeed"],
      estMinutes: 11,
      retention: "medium",
      quiz: [
        {
          id: "q1",
          question: "In the light-flash train thought experiment, why does the platform observer see the back wall lit before the front wall, while the passenger sees both lit at once?",
          options: [
            "The platform observer's clock is slower",
            "The train's forward motion moves the back wall toward the light's origin point and the front wall away from it, during the time light is traveling — and light's speed is the same for both observers, so it can't compensate",
            "Light actually travels faster toward the back of a moving train",
            "The passenger made a measurement error",
          ],
          correctIndex: 1,
          explanation: "Because c is fixed for both observers, the platform-frame geometry of the moving walls (not any speed change in light) is what breaks the tie between front and back.",
        },
        {
          id: "q2",
          question: "Is there a way to determine which observer's version of 'simultaneous' is the objectively correct one?",
          options: [
            "Yes, the passenger's version is always correct",
            "Yes, the platform (stationary) observer's version is always correct",
            "No — both are equally valid descriptions in their own frame; simultaneity itself is frame-dependent, not absolute",
            "Yes, whichever observer has the more accurate clock",
          ],
          correctIndex: 2,
          explanation: "There's no privileged frame to appeal to (from the first node) — so there's no fact of the matter about simultaneity independent of a chosen frame.",
        },
      ],
    },
    {
      id: "sr-time-dilation",
      title: "Time Dilation",
      depth: 2,
      explanation: {
        foundation:
          "Light's speed is fixed for every observer, and you can build a clock out of that fact alone: send a light pulse to bounce between two mirrors, and count bounces.",
        reasoning:
          "Put such a \"light clock\" — two mirrors facing each other, a pulse bouncing straight up and down between them — on a spaceship. To someone riding with the ship, the light just goes straight up, hits the top mirror, straight back down: a simple, short round trip.\n\nNow watch the same clock from a platform as the ship flies past. From this outside view, the light doesn't just go up and down — it has to travel diagonally, because by the time it reaches the top mirror, that mirror has moved forward with the ship. The diagonal path is geometrically longer than the straight up-down path. But light's speed is the same for both observers (we established that two nodes ago) — same speed, longer path, means more time elapses for one tick of the clock, according to the platform observer.\n\nSo the moving clock, watched from outside, ticks slower than an identical clock at rest with the observer. This isn't the clock malfunctioning — it's built into the geometry of a constant light-speed forcing a longer path for a moving observer's light bounce. Since ANY physical process (a heartbeat, radioactive decay, your own aging) can in principle be used as a clock, this isn't just about literal clocks — it's about time itself, as measured from outside, running slow for anything in motion relative to you.",
        formalStatement:
          "A clock moving at speed v relative to an observer ticks slower, as measured by that observer, by a factor γ = 1/√(1 − v²/c²): Δt_observed = γ · Δt_proper. γ ≥ 1 always, and grows sharply as v approaches c.",
        example:
          "A spaceship's light clock ticks once per nanosecond in its own frame. At v = 0.8c, γ ≈ 1.67, so an outside observer measures the same clock ticking once every 1.67 nanoseconds — the moving clock runs about 40% slow from the outside view.",
        misconception:
          "A frequent mistake is thinking the moving clock is 'really' slow in some absolute sense, or that its internal mechanism is physically damaged by motion. The clock works perfectly and ticks normally FROM ITS OWN FRAME — an astronaut riding with it sees nothing unusual. It's only slow relative to an observer who is themselves not moving with it. Symmetrically, that astronaut would say the OBSERVER'S clock looks slow.",
      },
      whyItMatters:
        "Time dilation is the first quantitative payoff of 'light speed is constant' — everything after this builds its math on γ (the Lorentz factor).",
      prerequisites: ["sr-lightspeed"],
      estMinutes: 13,
      retention: "slow",
      quiz: [
        {
          id: "q1",
          question: "In the light-clock derivation, why does an outside observer measure MORE time per tick for a moving clock, rather than less?",
          options: [
            "Because moving clocks are built differently",
            "Because from the outside, the light's path is diagonal (longer) rather than straight up-down, and since light's speed is fixed, a longer path takes more time",
            "Because the outside observer's own clock is broken",
            "It's an illusion caused by the light taking time to reach the observer's eyes",
          ],
          correctIndex: 1,
          explanation: "The geometry is the whole derivation: longer diagonal path + fixed light speed = more elapsed time per tick, as measured by the outside observer.",
        },
        {
          id: "q2",
          question: "An astronaut on a fast-moving ship looks at their own onboard clock. What do they observe?",
          options: [
            "It ticks slow, matching what an outside observer calculates",
            "It ticks completely normally — time dilation only shows up when comparing to a DIFFERENT frame, not within your own",
            "It stops entirely",
            "It ticks fast to compensate",
          ],
          correctIndex: 1,
          explanation: "Time dilation is a relationship between frames, not a property one frame observes in itself — inside your own frame, everything proceeds normally.",
        },
      ],
    },
    {
      id: "sr-length-contraction",
      title: "Length Contraction",
      depth: 3,
      explanation: {
        foundation:
          "A moving clock ticks slow by factor γ, as measured by an outside observer (previous node) — and speed is just distance divided by time.",
        reasoning:
          "Suppose a spaceship flies from Earth to a star at speed v. The crew on board measures how long the trip takes using their own onboard clock — call that their \"proper time.\" An observer on Earth, watching the ship's clock run slow by factor γ, would naively expect the crew's measured trip time to be LONGER than the crew reports, since a slow clock should tick through fewer intervals... but actually it's the reverse: Earth calculates the crew's clock ticks off FEWER seconds during the trip, exactly because it's running slow relative to Earth's own clock.\n\nHere's the key move: the crew still knows their own speed (v, same as Earth agrees on) and their own elapsed time (shorter, because their clock ran slow relative to Earth's). Distance is speed times time — so if the crew measures less time for the same relative speed, they must be measuring a SHORTER distance to the star than Earth does. The crew isn't wrong about their own clock; they're measuring a genuinely contracted distance.\n\nThis isn't unique to the trip distance — it applies to any length measured along the direction of relative motion. A meter stick flying past you, measured by you, comes out shorter than a meter. The crew flying with that same stick still measures it as exactly one meter, because in their own frame, nothing about their stick or their clock seems unusual at all — just like time dilation, length contraction is a between-frames effect, not a within-frame one.",
        formalStatement:
          "An object of proper length L₀ (measured in its own rest frame), moving at speed v relative to an observer, is measured by that observer to have length L = L₀/γ = L₀√(1 − v²/c²), contracted along the direction of motion only.",
        example:
          "A spaceship measures a 100-light-year trip at v = 0.99c. Its own crew, whose clock is dilated by γ ≈ 7, experiences the trip as only about 100/7 ≈ 14.3 years — consistent with them measuring the Earth-to-star distance as contracted to about 14.3 light-years, not the full 100.",
        misconception:
          "People sometimes think length contraction means the object physically crushes or its atoms compress. Nothing is being squeezed — the object's own rest-frame measurements are completely unchanged; only an observer in relative motion measures a shorter length, exactly mirroring how only an outside observer measures a slower clock.",
      },
      whyItMatters:
        "Time dilation and length contraction turn out to be two views of the same underlying fact — seeing both side by side sets up the single, unified transformation that comes next.",
      prerequisites: ["sr-time-dilation"],
      estMinutes: 11,
      retention: "medium",
      quiz: [
        {
          id: "q1",
          question: "A crew flies to a star at relativistic speed and finds their trip takes less onboard time than Earth calculates using distance ÷ speed. What does the crew conclude about the distance?",
          options: [
            "That Earth's measurement of the distance is simply wrong due to a mistake",
            "That they, in their own frame, measure a shorter distance to the star than Earth does — length contraction, not a clock malfunction",
            "That their speed must have been faster than they thought",
            "That the star moved closer during the trip",
          ],
          correctIndex: 1,
          explanation: "Same relative speed, less elapsed proper time, means the crew's own frame necessarily measures a shorter distance — that's length contraction, derived directly from time dilation.",
        },
        {
          id: "q2",
          question: "Does length contraction affect a spaceship's height (perpendicular to its motion) the same way it affects its length (along its motion)?",
          options: [
            "Yes, equally in all directions",
            "No — contraction only applies along the direction of relative motion; perpendicular dimensions are unaffected",
            "No — only height contracts, never length",
            "Contraction affects volume but not any single dimension",
          ],
          correctIndex: 1,
          explanation: "Only the dimension parallel to the relative velocity contracts — this asymmetry is essential and shows up again when deriving the full Lorentz transformation.",
        },
      ],
    },
    {
      id: "sr-lorentz",
      title: "The Lorentz Transformation",
      depth: 3,
      explanation: {
        foundation:
          "You now have three separate pieces — relative simultaneity, time dilation, and length contraction — all traced back to the same fact: light speed is invariant.",
        reasoning:
          "Three separate patched-together rules is a sign you haven't found the real underlying structure yet. So ask: is there a single equation that converts any event's position and time from one observer's frame to another's, from which simultaneity-breaking, time dilation, and length contraction ALL fall out as special cases, rather than needing three separate derivations?\n\nStart from the classical (Galilean) transformation, x' = x − vt, which just says \"shift your position coordinate by how far the frame has moved.\" It treats time as untouched: t' = t. We already know that's wrong — time itself has to change between frames, not just position. Demanding that light's speed comes out as exactly c in BOTH frames (the one fixed fact we're not willing to give up) forces a specific correction factor into both the position and time equations — and that correction factor turns out to be exactly the γ = 1/√(1 − v²/c²) you've already met twice.\n\nThe result is one pair of equations, x' = γ(x − vt) and t' = γ(t − vx/c²), that replaces the naive x' = x − vt, t' = t. Set v small compared to c and γ collapses to 1, recovering ordinary Newtonian physics — which is exactly why relativity was invisible for centuries at everyday speeds. Push v toward c and the corrections become dramatic. Every effect from the last three nodes is just this one transformation evaluated in a particular situation.",
        formalStatement:
          "The Lorentz transformation relates coordinates (x, t) in one inertial frame to coordinates (x', t') in a frame moving at velocity v along the x-axis: x' = γ(x − vt), t' = γ(t − vx/c²), where γ = 1/√(1 − v²/c²). It replaces the Galilean transformation and is exact at any velocity below c.",
        example:
          "At v = 0.6c, γ = 1.25. An event at x = 100 light-seconds, t = 0 in one frame transforms to x' = 1.25 × (100 − 0) = 125 light-seconds and t' = 1.25 × (0 − 0.6×100/1) = −75 seconds in the moving frame — illustrating how both position AND time shift together, not independently.",
        misconception:
          "A common error is thinking the Lorentz transformation is an alternative or approximation to Galilean relativity, usable interchangeably. It's the reverse: Galilean relativity is the low-speed APPROXIMATION of the Lorentz transformation (as v/c → 0, γ → 1). The Lorentz transformation is the actually-correct one at every speed; Newton's version just happens to be indistinguishable from it when v is tiny compared to c.",
      },
      whyItMatters:
        "This is the mathematical spine of special relativity — once you have it, spacetime geometry and velocity addition become derivations, not new assumptions.",
      prerequisites: ["sr-simultaneity", "sr-time-dilation"],
      estMinutes: 16,
      retention: "slow",
      quiz: [
        {
          id: "q1",
          question: "Why does the Lorentz transformation need to modify the TIME coordinate (t' = γ(t − vx/c²)), when the classical Galilean transformation left time alone (t' = t)?",
          options: [
            "It doesn't really need to — this is just a mathematical convenience",
            "Because relativity of simultaneity (an earlier node) shows time itself must differ between frames, not just position — a transformation that leaves time untouched can't reproduce that effect",
            "Because clocks are mechanically imperfect",
            "Because position and time must always have identical formulas by symmetry",
          ],
          correctIndex: 1,
          explanation: "The whole point of building up through simultaneity and time dilation first was to show time isn't invariant — so the transformation connecting frames has to touch time explicitly.",
        },
        {
          id: "q2",
          question: "As v approaches 0 (everyday, non-relativistic speeds), what happens to the Lorentz transformation?",
          options: [
            "It becomes undefined",
            "It approaches infinity",
            "γ approaches 1, and the equations collapse to the familiar Galilean transformation — explaining why relativity went unnoticed for centuries",
            "It stays exactly the same at all speeds",
          ],
          correctIndex: 2,
          explanation: "This is why the transformation is trustworthy: it doesn't contradict everyday Newtonian physics, it contains it as the v ≪ c limit.",
        },
      ],
    },
    {
      id: "sr-spacetime",
      title: "Spacetime & the Invariant Interval",
      depth: 4,
      explanation: {
        foundation:
          "The Lorentz transformation mixes position and time together — a shift in x' depends on t, and a shift in t' depends on x.",
        reasoning:
          "When a transformation mixes two quantities together like that, it's usually a sign they were never truly separate things to begin with — think of how rotating your view of a room mixes \"left-right\" and \"forward-back\" coordinates, even though the room itself hasn't changed. Rotation doesn't preserve x or y individually, but it DOES preserve the straight-line distance between two points: x² + y² stays the same no matter how you're facing.\n\nApply that same instinct here. Individually, the time gap and the space gap between two events change between frames — we've spent five nodes establishing exactly that. But try combining them as (c·Δt)² − (Δx)² instead of just adding them, and compute it in one frame, then transform to another frame and compute it again. Because of exactly how γ was built to keep light's speed invariant, this particular combination comes out identical in every inertial frame. It's the real, frame-independent \"distance\" between two events — space and time were never separate quantities, just like \"forward\" and \"sideways\" in a room aren't separate once you allow rotation.\n\nThis quantity is called the spacetime interval, and the four-dimensional structure it lives in — three space dimensions plus one time dimension, bound together by this invariant — is Minkowski spacetime. Time dilation and length contraction stop looking like two unrelated tricks and become the same fact seen from different angles: the interval is conserved, and its two pieces (spatial and temporal) trade off against each other between frames, the way x and y trade off under rotation.",
        formalStatement:
          "The spacetime interval between two events, Δs² = (cΔt)² − (Δx)² − (Δy)² − (Δz)², is invariant — identical for every inertial observer, even though Δt and Δx individually differ between frames. This invariance is the deep structural fact special relativity is built on.",
        example:
          "Two events separated by Δx = 5 light-seconds and Δt = 13 seconds in one frame give Δs² = 13² − 5² = 144. A different observer, using the Lorentz transformation, measures different Δx' and Δt' values for the same two events — but (Δt')² − (Δx')² still equals exactly 144.",
        misconception:
          "It's tempting to think \"invariant\" means \"the same as ordinary distance,\" but the interval uses a MINUS sign between the time part and space part, not a plus — this is fundamentally different from Pythagorean distance, and it's precisely that minus sign that allows time and space to trade off against each other the way we saw in time dilation and length contraction.",
      },
      whyItMatters:
        "Thinking in spacetime, not separate space-and-time, is what lets relativistic mass-energy and the twin paradox resolve cleanly instead of paradoxically.",
      prerequisites: ["sr-lorentz"],
      estMinutes: 15,
      retention: "slow",
      quiz: [
        {
          id: "q1",
          question: "Why is the analogy to rotation (mixing 'left-right' and 'forward-back' while preserving straight-line distance) useful for understanding spacetime?",
          options: [
            "It isn't useful, it's just a coincidence",
            "Because it shows how two quantities can individually change under a transformation while a specific COMBINATION of them stays invariant — exactly the relationship between Δx, Δt, and the spacetime interval",
            "Because relativity literally involves physical rotation of objects",
            "Because rotation and the Lorentz transformation use the exact same formula",
          ],
          correctIndex: 1,
          explanation: "The analogy's value is structural: both cases have individually-changing components whose particular combination is conserved — that's the pattern the spacetime interval follows.",
        },
        {
          id: "q2",
          question: "Two different inertial observers measure the time and space separation between the same two events and get different Δt and Δx values. What do they agree on?",
          options: [
            "Nothing — all measurements differ between them",
            "The spacetime interval, (cΔt)² − (Δx)², computed from their own respective measurements",
            "Only Δt",
            "Only Δx",
          ],
          correctIndex: 1,
          explanation: "This is the entire point of the interval: individually-differing measurements combine into one quantity every observer agrees on.",
        },
      ],
    },
    {
      id: "sr-velocity-addition",
      title: "Relativistic Velocity Addition",
      depth: 4,
      explanation: {
        foundation:
          "The very first node in this path used classical velocity addition (85 = 80 + 5) — and you now have the full Lorentz transformation, which we know replaces the classical one.",
        reasoning:
          "Close the loop: derive what velocity addition actually looks like under the Lorentz transformation, rather than the naive Galilean version. Take a spaceship moving at speed v relative to Earth, and have it fire a probe forward at speed u relative to the ship itself. Classically you'd just add: probe's speed relative to Earth = v + u. But \"speed relative to Earth\" really means \"Earth-frame Δx divided by Earth-frame Δt\" — and both of those now have to be computed using the Lorentz transformation from the ship's frame to Earth's frame, not the naive Galilean one.\n\nWorking through that substitution (the algebra is mechanical once you trust the Lorentz transformation itself), the simple v + u gets replaced by (v + u)/(1 + vu/c²). Notice what the denominator does: when v and u are both small compared to c, vu/c² is tiny, the denominator is essentially 1, and you recover the familiar v + u — consistent with everyday experience. But as v and u both approach c, the denominator grows to cancel out exactly enough of the numerator's growth to keep the result under c, no matter how close v and u individually get to c.\n\nThis isn't a rule bolted on to prevent faster-than-light travel — it falls directly out of the same Lorentz transformation that gave you time dilation and length contraction. The speed limit was never a separate law; it's baked into the geometry from the start.",
        formalStatement:
          "For a probe moving at speed u relative to a ship, itself moving at speed v relative to Earth (same direction), the probe's speed relative to Earth is w = (v + u)/(1 + vu/c²) — always less than c whenever v and u are each less than c.",
        example:
          "Ship moves at v = 0.5c relative to Earth, fires a probe at u = 0.5c relative to itself. Classical addition predicts w = 1.0c. Relativistic addition gives w = (0.5c + 0.5c)/(1 + 0.25) = 1.0c/1.25 = 0.8c.",
        misconception:
          "A common guess is that relativistic velocity addition is only an approximate correction, and that with a strong enough push you could still nudge the combined speed past c. The formula's structure mathematically forecloses this for any inputs strictly below c — it's not a soft limit that yields under pressure, it's an exact algebraic consequence of the Lorentz transformation.",
      },
      whyItMatters:
        "This closes the loop on the very first classical assumption from node one (velocities just add) — showing exactly how, and why, it was only ever a low-speed approximation.",
      prerequisites: ["sr-lorentz"],
      estMinutes: 12,
      retention: "medium",
      quiz: [
        {
          id: "q1",
          question: "A ship moving at 0.5c fires a probe forward at 0.5c relative to itself. Why isn't the Earth-frame result 1.0c, given that classical addition says 0.5 + 0.5 = 1.0?",
          options: [
            "Because the probe actually slows down after launch",
            "Because computing 'speed relative to Earth' now requires the Lorentz transformation, not the Galilean one — the correct formula includes a denominator (1 + vu/c²) that classical addition ignores",
            "Because Earth is also moving",
            "It actually is 1.0c — the relativistic formula is wrong",
          ],
          correctIndex: 1,
          explanation: "The relativistic velocity addition formula is directly derived from the Lorentz transformation, which properly accounts for how both frames measure distance and time differently.",
        },
        {
          id: "q2",
          question: "Why can't relativistic velocity addition ever produce a result at or above c, given inputs each below c?",
          options: [
            "It's an arbitrary rule imposed on top of the formula",
            "The formula's denominator (1 + vu/c²) grows exactly enough to keep the result under c — this is a structural consequence of the Lorentz transformation, not a separate patch",
            "It actually can, in rare cases",
            "Because light itself has no speed limit",
          ],
          correctIndex: 1,
          explanation: "The speed limit isn't bolted on — it's baked into the same transformation that produced time dilation and length contraction.",
        },
      ],
    },
    {
      id: "sr-emc2",
      title: "Mass-Energy Equivalence (E = mc²)",
      depth: 5,
      explanation: {
        foundation:
          "In spacetime, the interval (cΔt)² − (Δx)² is invariant (an earlier node) — and in ordinary mechanics, momentum (mass × velocity) and kinetic energy are separately conserved quantities.",
        reasoning:
          "Just as position and time turned out not to be separate quantities but components of one spacetime interval, ordinary momentum and energy turn out to combine into a single relativistic invariant, following the exact same pattern: p² (momentum squared) and E² (energy squared) combine as E² − (pc)² = invariant, mirroring the (cΔt)² − (Δx)² structure exactly.\n\nNow ask the simplest possible question of that relationship: what is the energy of an object that isn't moving at all, so its momentum p = 0? The equation collapses to E² = (mc²)², or E = mc². This says something genuinely strange by pre-relativistic standards: an object has energy simply by virtue of having mass and existing, even sitting perfectly still — mass itself is a form of stored energy, not a separate thing from energy.\n\nBecause c² is an enormous number (about 9 × 10¹⁶ in SI units), a tiny amount of mass corresponds to a huge amount of energy. This is exactly why nuclear fission releases so much energy from what looks like a small change: split a heavy nucleus and the resulting pieces weigh very slightly less, combined, than the original nucleus did. That small \"missing\" mass hasn't vanished — it's been converted directly into released energy, at the exchange rate set by c².",
        formalStatement:
          "The relativistic energy-momentum relation E² = (pc)² + (mc²)² reduces, for an object at rest (p = 0), to E = mc² — mass and energy are equivalent, related by the fixed constant c², regardless of whether the object is moving.",
        example:
          "In nuclear fission, a uranium-235 nucleus splits into fragments whose combined mass is about 0.1% less than the original nucleus. That missing 0.1% of mass, converted via E = mc², is roughly 200 MeV per fission event — the source of a nuclear reactor's power output.",
        misconception:
          "People sometimes think E = mc² only applies to nuclear reactions or exotic physics, as though ordinary matter is exempt. It's a universal relationship — a hot cup of coffee is very slightly more massive than the same cup cold, because thermal energy contributes to mass too; the effect is just far too small to detect at everyday energy scales.",
      },
      whyItMatters:
        "This is the famous payoff of the whole chain — but only makes sense once you have spacetime's pattern (an invariant combining two quantities that individually differ between frames) to apply it to momentum and energy the same way.",
      prerequisites: ["sr-spacetime"],
      estMinutes: 13,
      retention: "medium",
      quiz: [
        {
          id: "q1",
          question: "How does E = mc² follow from the relativistic energy-momentum relation E² = (pc)² + (mc²)², rather than being a separate assumption?",
          options: [
            "It doesn't follow from anything — it's a standalone postulate",
            "It's the special case of that relation when momentum p = 0 (an object at rest) — the (pc)² term vanishes, leaving E² = (mc²)²",
            "It only applies to photons, which have p = 0",
            "It's derived by setting mass to zero",
          ],
          correctIndex: 1,
          explanation: "Setting p = 0 in the general relation directly collapses it to E = mc² — mass-energy equivalence is the at-rest special case of a more general momentum-energy relationship.",
        },
        {
          id: "q2",
          question: "Why does nuclear fission release so much energy from such a small amount of material?",
          options: [
            "It doesn't — this is a common misconception",
            "The products weigh very slightly less than the original nucleus; that small mass difference converts to a large energy release because c² is such a large multiplier",
            "It converts heat directly into light with no mass involved",
            "It relies entirely on ordinary chemical bond energy, unrelated to mass",
          ],
          correctIndex: 1,
          explanation: "A small mass deficit times an enormous c² produces a large energy release — exactly the exchange rate E = mc² describes.",
        },
      ],
    },
    {
      id: "sr-twin-paradox",
      title: "The Twin Paradox, Resolved",
      depth: 5,
      explanation: {
        foundation:
          "You have both time dilation (moving clocks run slow, as measured by a stationary observer) and the fact that spacetime intervals accumulate differently along different paths between two events.",
        reasoning:
          "One twin stays on Earth. The other flies to a distant star at relativistic speed and returns. Each twin, watching the other's clock during the outbound trip, says the OTHER one's clock is running slow — that's just ordinary time dilation, symmetric between any two inertial frames in relative motion. If the situation were truly symmetric all the way through, you'd expect a contradiction: each twin thinks the other aged less, and when they reunite, who's actually younger?\n\nThe resolution is that the situation was never symmetric. The Earth twin stays in ONE inertial frame the entire time. The traveling twin does not — they accelerate to leave, and critically, they must decelerate and accelerate again to turn around and come home. That turnaround is a real, physically detectable event (you'd feel it as force, the way you feel a car braking) that breaks the twins' equivalence. Only one twin ever changes frames.\n\nUsing the spacetime-interval idea from two nodes back: elapsed proper time along a path through spacetime depends on the path taken, not just the start and end points, the same way a straight line between two points on a map is shorter than a bent detour. The Earth twin's path through spacetime is the \"straight\" one (single inertial frame throughout). The traveling twin's path bends at the turnaround — and it's a mathematical fact of the spacetime interval that the bent path accumulates LESS proper time, not more. So the traveling twin returns younger, and there's no contradiction, because their situation was never actually symmetric to begin with.",
        formalStatement:
          "Of two twins separating and reuniting, the twin who undergoes acceleration (changes inertial frames — e.g. to turn around) experiences less elapsed proper time than the twin who remains in a single inertial frame throughout, consistent with the spacetime interval being path-dependent.",
        example:
          "A twin travels to a star 4 light-years away at v = 0.8c (γ ≈ 1.67) and returns. Earth-frame elapsed time: about 10 years round trip. Traveling twin's proper time: about 10/1.67 ≈ 6 years. The traveling twin returns roughly 4 years younger than their Earth-bound sibling.",
        misconception:
          "The most common objection is: 'by symmetry, shouldn't the traveling twin equally claim the Earth twin aged less, from their own point of view?' The symmetry breaks specifically because only the traveling twin accelerates — that acceleration is not relative or a matter of perspective, it's physically detectable (you'd feel it), and it's exactly what identifies which twin actually changed inertial frames.",
      },
      whyItMatters:
        "It's the classic stress-test of everything above — if time dilation and the spacetime interval don't resolve this cleanly, something upstream was misunderstood.",
      prerequisites: ["sr-spacetime", "sr-velocity-addition"],
      estMinutes: 14,
      retention: "medium",
      quiz: [
        {
          id: "q1",
          question: "Why isn't the twin paradox a real contradiction, even though each twin sees the other's clock running slow during the trip?",
          options: [
            "It actually is a contradiction with no resolution",
            "Only the traveling twin accelerates to turn around — that breaks the symmetry between the twins, since it's a physically real, detectable event that identifies which twin changed inertial frames",
            "The Earth twin secretly moves faster than they realize",
            "Time dilation isn't real — it's an illusion that cancels out",

          ],
          correctIndex: 1,
          explanation: "The apparent paradox only exists if you assume perfect symmetry between the twins — the turnaround acceleration removes that symmetry, and it's not just a matter of viewpoint since it's physically felt.",
        },
        {
          id: "q2",
          question: "Using the spacetime-interval idea (elapsed proper time depends on the path taken through spacetime), why does the traveling twin accumulate LESS proper time than the Earth twin?",
          options: [
            "Because their path through spacetime 'bends' at the turnaround, and bent paths accumulate less proper time than the straight (single-frame) path — the reverse of ordinary geometry, where a straight line is the shortest path",
            "Because their spaceship's engines interfere with their biological clock",
            "Because they travel through more physical distance, which directly slows all clocks",
            "There's no real difference — this is only apparent, not physical",
          ],
          correctIndex: 0,
          explanation: "This is the deep resolution: unlike ordinary space where straight lines are shortest, in spacetime the single-frame (straight) path accumulates the MOST proper time — bending the path (accelerating) always reduces it.",
        },
      ],
    },
  ],
};
