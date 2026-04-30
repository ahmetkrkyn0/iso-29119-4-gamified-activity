# Test Courthouse

### A Web-Based Educational Game for ISO/IEC/IEEE 29119-4

> SENG 436 — Learner-as-Designer Project
> Detailed project plan, diversification roadmap, and technology recommendations.

---

## 1. Executive Summary

**Test Courthouse** is a browser-based educational game that teaches the four hardest test design techniques in ISO/IEC/IEEE 29119-4 — Combinatorial, Branch Condition Combination (BCC), Modified Condition/Decision Coverage (MCDC), and Data Flow — by reframing them as criminal trials. A suspected software defect is the *defendant*; the test engineer is the *prosecutor*; test cases are *evidence*; coverage is the *standard of proof*; and a misconception in technique application leads directly to an *acquittal* (the bug escapes).

The pedagogical premise is the same one that motivated the concept analysis: misconceptions about these four techniques are *self-concealing* under passive study. A player who confuses BCC with MCDC, or who treats `c-use` and `p-use` as interchangeable, builds a test suite that *looks* defensible — until the verdict screen shows the seeded fault was never detected. The game makes the misconception visible through the consequence, not through the instructor.

**Target platform:** Web application (React + Vite + TypeScript), playable solo (campaign mode) or as a local hot-seat multiplayer game (2–4 students on one machine or a shared classroom display). No backend required for the MVP; deployment is a static bundle.

**Primary audience:** Senior undergraduate software engineering students taking a software testing course, plus their instructor (who can run a "Class Mode" session as a teaching aid).

---

## 2. Learning Objectives

After playing the game, participants will be able to:

1. **Differentiate** the four combinatorial sub-techniques (All Combinations, Pair-wise, Each Choice, Base Choice) by predicting test case counts and selecting the appropriate sub-technique for a given scenario (§5.2.5).
2. **Distinguish** Branch Condition Combination Testing from MCDC by deriving correct test counts (`2^N` vs `N+1`) and explaining when each is required (§5.3.5, §5.3.6).
3. **Apply** the MCDC independence criterion by constructing paired test cases in which one condition's value changes while all others remain fixed *and* the decision outcome flips (§5.3.6.2, Annex C.2.3.6).
4. **Build** a def-use model from source code, correctly classifying every read as a c-use or a p-use, and select the appropriate sub-form of data flow coverage (§5.3.7, §3.7, §3.37).
5. **Diagnose** a failing test suite by identifying which step of the standard process (TD1 → TD2 → TD3) was performed incorrectly.

Each objective is operationalised in the game by at least two distinct interactions, and each maps to a measurable in-game metric (technique selection accuracy, coverage achieved, fault detection rate, time-to-correct on retry).

---

## 3. The Courthouse Metaphor

The metaphor is not decorative — every game element corresponds to a 29119-4 concept.

| Courtroom element       | 29119-4 concept                                  |
| ----------------------- | ------------------------------------------------ |
| Case file               | System under test (SUT) + behavioural specification |
| Defendant               | Suspected defect (one or more seeded faults)     |
| Charges                 | Failure modes that must be proven                |
| Investigation           | Building the test model (TD1)                    |
| Evidence                | Test cases                                       |
| Standard of proof       | Coverage criterion (TD3)                         |
| Cross-examination       | Independence pairing (MCDC)                      |
| Chain of custody        | Def-use chain (data flow)                        |
| Forensic combinatorics  | P-V pair model (combinatorial)                   |
| Compound testimony      | Boolean condition combinations (BCC)             |
| Verdict                 | Pass/Fail of the test execution                  |
| Judge                   | Coverage validator (deterministic, transparent)  |
| Jury                    | Peer review (in multiplayer modes)               |
| Mistrial                | Misconception triggered → case must be retried   |
| Acquittal               | Fault not detected — the standard's process was misapplied |

This mapping gives every gameplay action a clear ISO referent. When a player makes a mistake, the game can name both the courtroom failure ("the defendant walked free") and the technical failure ("two of your independence pairs shared a non-fixed condition — see §5.3.6.2") on the same screen.

---

## 4. Core Game Loop

A single round of play lasts 8–12 minutes and follows five phases:

**Phase 1 — Briefing (1 min).** The player opens a case file: a short scenario describing the SUT (e.g. an aircraft autopilot disengage decision, a multi-parameter discount calculator, a sensor data pipeline). The file lists the charges (the failure modes the player must prove) and the *technique requirement* (e.g. "MCDC mandated by ISO 26262 ASIL D — anything weaker is inadmissible").

**Phase 2 — Investigation / TD1 (2–3 min).** The player constructs the test model. The interaction is technique-specific:

- *Combinatorial:* fill a P-V pair table by reading the spec.
- *BCC / MCDC:* identify the decision and its atomic conditions on a highlighted code snippet.
- *Data flow:* place `def`, `c-use`, and `p-use` markers on each program statement.

The judge validates the model immediately — investigation errors are caught here, before the player wastes effort building evidence on a wrong foundation.

**Phase 3 — Evidence Derivation / TD2 (3–4 min).** The player derives coverage items and selects/constructs test cases. For combinatorial, this is choosing a sub-technique and generating the implied set. For MCDC, this is constructing independence pairs by clicking pairs of rows in the truth table. For data flow, this is selecting paths through the def-use graph.

**Phase 4 — Trial / TD3 (1–2 min).** The player submits the test suite. The judge runs it against the SUT (a deterministic simulator with seeded faults) and renders a verdict. The verdict screen has three layers:

1. *Coverage achieved* — what fraction of required coverage items the suite hits.
2. *Faults detected* — which seeded faults the suite caught.
3. *Misconception probe* — if the suite achieves coverage but misses a fault, the game identifies the specific misconception that allowed the gap (e.g. "your Each Choice suite covers every value once but every fault in this case requires a *combination* — Pair-wise was the correct sub-technique").

**Phase 5 — Debrief (1 min).** The player sees a summary card linking back to the relevant clause of the standard, a one-sentence "what the textbook would say," and the option to retry, move on, or open Annex C's worked example for that technique.

---

## 5. Game Modes

### 5.1 Solo Campaign

The campaign is a four-act structure, one act per technique, three cases per act, plus a "Final Trial" that mixes all four. Cases escalate in difficulty: the first case in each act is a guided tutorial where the judge explains every step; the third is a free-form case with multiple valid solutions.

Progression unlocks technique-specific mastery badges (e.g. *Independence Detective*, *Coverage Cartographer*, *Predicate Witness*). A persistent transcript records every misconception the player has triggered, with one-click links back to the case where it occurred.

### 5.2 Local Multiplayer (hot-seat)

Two to four students share one screen — ideal for in-class use and for the Week 3 prototype testing session described in the project brief. Three modes:

**Mock Trial (2 players, 10 min/case).** One player is the *prosecution* and must build a coverage-complete test suite. The other is the *defense* and must find one coverage item the prosecution missed *or* one test case in the prosecution's suite that doesn't actually witness independence (for MCDC) or doesn't actually exercise a def-use pair (for data flow). Points awarded for the coverage achieved, deducted for each defense success.

**Jury Deliberation (3–4 players, 12 min/case).** Each player privately drafts a test suite. Suites are revealed simultaneously. The jury (the players themselves, voting) ranks them. The judge (the simulator) then reveals the actual coverage and faults detected — the jury's social ranking is compared to the technical ranking, and the gap surfaces shared misconceptions in real time.

**Hot Seat (2–4 players, 8 min/case).** Players take turns adding *one* test case to a shared suite. After each addition, the judge displays the marginal coverage gain. The player who adds the test case that finally crosses the coverage threshold wins the round. Players quickly learn to read the def-use graph or P-V pair table strategically rather than by formula.

### 5.3 Class Mode (stretch goal — Week 4 if time)

The instructor projects the game on the classroom display and runs a single case with the whole class. Students vote on the next move from their phones (a thin Kahoot-style web client). This requires either a small WebSocket server or a peer-to-peer transport (e.g. PeerJS); see §10.4.

---

## 6. Content Architecture: The Case File

Every level is a JSON document — no code changes are required to add or modify content. This is essential for two reasons: it lets non-developer teammates write content during Weeks 2–4, and it makes the game inspectable for the Week 5 documentation deliverable.

A case file looks roughly like this (illustrative shape, not final schema):

```jsonc
{
  "id": "mcdc-altitude-disengage-01",
  "act": "MCDC",
  "difficulty": 2,
  "iso_clauses": ["§5.3.6", "§3.36", "Annex C.2.3.6"],
  "scenario": {
    "title": "Altitude Hold Disengage",
    "narrative": "A flight control law disengages altitude hold when ...",
    "code": "if (verticalSpeed > LIMIT && (autopilotEngaged || pilotOverride)) disengage();",
    "conditions": [
      { "id": "A", "label": "verticalSpeed > LIMIT" },
      { "id": "B", "label": "autopilotEngaged" },
      { "id": "C", "label": "pilotOverride" }
    ],
    "decision_expression": "A && (B || C)"
  },
  "td1_expected": { /* what a correct test model looks like */ },
  "td2_expected": { /* coverage items */ },
  "seeded_faults": [
    { "id": "F1", "description": "Short-circuit evaluation skips C", "trigger": { /* ... */ } }
  ],
  "misconceptions": [
    {
      "id": "MCDC-INDEP-AS-ISOLATION",
      "trigger": { /* pattern that flags this misconception in the player's submission */ },
      "explanation_md": "You tested each condition in isolation, but ISO §5.3.6.2 requires *paired* test cases ..."
    }
  ]
}
```

The `misconceptions` block is the heart of the educational design. Each entry is a pattern matcher over the player's submission plus an explanation. This is how the game makes invisible errors visible. The Week 1 concept analysis already enumerates eight such misconceptions — they map almost directly onto this structure.

---

## 7. Diversification & Development Ideas

These are layered enhancements. The MVP needs only the core loop and Solo Campaign; the rest are scoped as Week 4–5 polish or "future work" for the Week 5 reflection.

### 7.1 Misconception Trap Cards

A small set of "trap" cases deliberately bait a known misconception. For example, a combinatorial case in which Each Choice and Base Choice happen to produce the same number of test cases — but only Base Choice's selection actually exercises the seeded fault. The player who reasons by counts gets caught; the player who reasons by *which* combinations are exercised wins. These cases are short, replayable, and ideal for the Week 3 prototype test session.

### 7.2 Annex C Tutorials

Each act opens with a guided walkthrough of the relevant Annex C worked example from the standard. The walkthrough is fully interactive: the player clicks through the example one step at a time, and the game annotates each step with the clause it applies. This doubles as tutorial *and* a sanity check that the game's interpretation of the standard matches the standard's own worked examples.

### 7.3 Real-World Case Studies

Two or three "Cold Case" levels based on famous historical defects, framed as retrospective trials:

- *Therac-25* (race condition + data flow): players reconstruct the def-use chain that, had it been tested, would have caught the dose calculation overflow.
- *Boeing 737 MAX MCAS* (independence under coupled conditions): players see how single-source AoA data violates the MCDC independence assumption at the system level.
- *Ariane 5 Flight 501* (combinatorial parameter coverage): players build the P-V pair table that would have surfaced the 64-bit-to-16-bit conversion fault.

These cases connect the abstract standard to consequences students will remember. They also give the Week 5 presentation a strong opening hook.

### 7.4 Concept Map Mode

A separate, low-stakes mode that lets the player drag-and-drop terms from §3 of the standard into a concept map and connect them with labelled arrows. The game scores the map for completeness (did the player include every key term?) and for correctness of the relationships (is *test case* correctly connected to *test design technique* as a derived artefact?). This mode satisfies the Week 1 concept-map deliverable retroactively as an in-game artefact.

### 7.5 Achievement & Progress System

Mastery is recognised through named badges that double as study aids: each badge's unlock condition is a precise behaviour ("constructed five MCDC independence pairs without a single shared-condition error"). The badge wall doubles as a self-assessment tool — a student looking at their wall sees exactly which sub-techniques they have *demonstrated* mastery of.

### 7.6 Replay With Annotation

After every case, the player can replay their own attempt in slow motion with the judge's commentary overlaid. Wrong moves are highlighted with the specific clause they violated. This is the single most powerful pedagogical feature in the game; it is also the easiest to implement, because the game already records every player action for the misconception detector.

### 7.7 Adaptive Difficulty

The campaign tracks which misconceptions a given player has triggered and biases later cases towards those misconceptions. A player who repeatedly misreads independence in MCDC will see proportionally more cases in which that misreading is the trap. This implements the "concrete feedback loop" the concept analysis identified as missing from passive study.

### 7.8 Instructor Analytics

A single page in the app shows, for a given class session, an aggregate heatmap: which misconceptions are triggered most often, which cases have the lowest first-attempt success rate, which clauses correlate with the most retries. This is built-in to the local-multiplayer modes and exportable as a CSV for the instructor's records. **This feature directly serves the project rubric criterion "misconceptions become visible"** — it makes them visible not just to the player but to the teacher.

### 7.9 Visual Test Model Builders

For each technique, a dedicated visual editor:

- *Combinatorial:* spreadsheet-like P-V pair table with auto-derived test counts as the player toggles sub-techniques.
- *BCC / MCDC:* truth table with click-to-pair interaction; the game highlights when a candidate pair fails the independence rule and explains why.
- *Data flow:* ReactFlow-based node graph of program statements; the player drags `def`/`c-use`/`p-use` markers from a palette onto statements; the game derives the def-use chains automatically.

These editors *are* the user interface — there is no abstract menu of "submit a test suite." The model the player builds visually *is* the submission.

### 7.10 Spectator / Presentation Mode

A clean, distraction-free view designed for the Week 5 final presentation: large fonts, minimal chrome, keyboard-only navigation, and a built-in "presenter notes" overlay visible only on the presenter's screen. Designing for the presentation as a first-class mode protects the demo from last-minute scramble.

---

## 8. Recommended Technology Stack

The constraints driving the stack: a static-deployable web app, fast iteration during Weeks 2–4, no backend in the MVP, rich interactive visuals (graphs, truth tables, drag-and-drop), and a codebase three students can confidently navigate by Week 5 to write the documentation.

### 8.1 Core

- **React 18 + TypeScript + Vite.** TypeScript is essential because the case-file schema is the heart of the project — a typed schema means content authors get autocomplete and editor errors instead of runtime crashes during the Week 3 demo. Vite gives sub-second HMR, which matters when three teammates are working in parallel on different cases.
- **React Router v6** for the route structure (campaign, multiplayer lobby, case player, debrief, instructor view).
- **Zustand** for game state. Redux is overkill here; React context alone leaks re-renders in a game with frequent state updates. Zustand is two hundred lines of API, integrates cleanly with TypeScript, and persists trivially to localStorage.

### 8.2 UI & Styling

- **Tailwind CSS** for all layout and styling. The existing HTML prototypes already use a CSS-variable system that maps directly to a Tailwind theme; migration is mostly find-and-replace.
- **Radix UI primitives** (or **shadcn/ui** components built on Radix) for accessible dialogs, tooltips, dropdowns, and tab panels. Hand-rolling these eats time and produces inaccessible results.
- **Framer Motion** for transitions. A test design game lives or dies on "feel" — the difference between a verdict screen that feels like a verdict and one that feels like a JSON dump is animation, and Framer Motion is the pragmatic choice.
- **Lucide React** for icons (gavel, scale, magnifying glass, document) — already aligned with the existing prototype aesthetic.

### 8.3 Domain-Specific Libraries

- **React Flow** for the data-flow graph editor and the def-use chain visualiser. This is the single highest-leverage library in the stack: it gives drag-to-pan, zoom, node-and-edge editing, and minimaps for free, and it composes cleanly with React state.
- **TanStack Table** (formerly React Table) for the P-V pair table and the MCDC truth table. Headless, fully typed, and supports the cell-level interaction patterns these tables need.
- **Mermaid.js** (lazy-loaded) for rendering control flow diagrams in the Annex C tutorials. Authors write a Mermaid code block in the case file's `narrative_md` and the game renders it.
- **Zod** for runtime validation of case files. This is critical: when a non-developer teammate writes a JSON case file, Zod catches schema errors at load time with a readable message instead of a runtime crash mid-trial.

### 8.4 Persistence & Data

- **localStorage** (via Zustand's persistence middleware) for solo campaign progress, achievement state, and the misconception transcript. No accounts required.
- **JSON case files** stored under `src/content/cases/` and imported via Vite's glob import. New levels = new files; no build configuration changes.
- **IndexedDB** (via `idb-keyval`) only if instructor-mode session recordings exceed localStorage's quota, which they will not for a class of thirty.

### 8.5 Quality & Tooling

- **ESLint + Prettier + TypeScript strict mode** from day one. Catching a misspelt `mcdc` vs `MCDC` at compile time is cheaper than catching it the morning of the Week 5 presentation.
- **Vitest + React Testing Library** for the misconception detector logic and the coverage validator. There is a satisfying recursion here: a game about test design is itself defined by tests. Mention this in the Week 5 reflection.
- **Storybook** (optional, only if time) for the visual test-model builders, so the team can iterate on each editor in isolation before integrating.

### 8.6 Deployment

- **Vercel** (or **Netlify**, or **GitHub Pages**) — all three serve a Vite static build with one-click setup. Vercel is the smoothest if the team later wants the Class Mode WebSocket server (§10.4), because Vercel Edge Functions and Vercel Postgres compose with the same project.

### 8.7 Stack at a glance

| Layer            | Choice                                |
| ---------------- | ------------------------------------- |
| Language         | TypeScript (strict)                   |
| Framework        | React 18                              |
| Build tool       | Vite                                  |
| State            | Zustand + persist middleware          |
| Routing          | React Router v6                       |
| Styling          | Tailwind CSS + Radix / shadcn/ui      |
| Animation        | Framer Motion                         |
| Graph editor     | React Flow                            |
| Tables           | TanStack Table                        |
| Diagrams         | Mermaid.js (lazy-loaded)              |
| Schema validation| Zod                                   |
| Icons            | Lucide React                          |
| Tests            | Vitest + React Testing Library        |
| Lint/format      | ESLint + Prettier                     |
| Persistence      | localStorage (Zustand persist)        |
| Deployment       | Vercel (static)                       |

---

## 9. Project Structure (proposed)

```
test-courthouse/
├── src/
│   ├── app/                    # routes, layouts, providers
│   ├── features/
│   │   ├── campaign/           # solo mode shell
│   │   ├── multiplayer/        # hot-seat shells (mock-trial, jury, hot-seat)
│   │   ├── case-player/        # the five-phase round shell
│   │   ├── editors/
│   │   │   ├── PVPairTable.tsx
│   │   │   ├── TruthTable.tsx
│   │   │   └── DefUseGraph.tsx
│   │   ├── verdict/            # verdict screen + misconception probe
│   │   └── instructor/         # analytics view
│   ├── engine/
│   │   ├── coverage/           # coverage validators (one per technique)
│   │   ├── faults/             # fault simulation
│   │   ├── misconceptions/     # detector functions, one per misconception id
│   │   └── caseLoader.ts       # zod-validated case file loader
│   ├── content/
│   │   └── cases/              # JSON case files, organised by act
│   ├── ui/                     # shared components
│   ├── stores/                 # zustand stores
│   └── lib/                    # utilities
├── tests/                      # vitest suites for engine modules
├── public/
└── package.json
```

The `engine/` directory is deliberately framework-free TypeScript. This is what gets unit-tested, and it is what the Week 5 documentation describes as "the game's interpretation of ISO/IEC/IEEE 29119-4." Keeping it separable from React makes the documentation honest.

---

## 10. Roadmap Aligned to the Five-Week Brief

The brief defines five weekly milestones. The plan below maps the game's construction to those milestones and identifies the *minimum viable* scope for each week.

### Week 1 — Concept Analysis (already delivered)

The existing concept analysis identifies the four techniques and eight misconceptions. No additional work needed; the misconception list seeds the `misconceptions/` engine directory.

### Week 2 — Game Design Proposal + Sketch

**Deliverable:** Three-page proposal + a navigable Figma (or hand-drawn) sketch of the case-player screen for at least two of the four techniques.

**Engineering work:** Initialise the Vite project, set up Tailwind, deploy a hello-world to Vercel. Define the case-file Zod schema. Migrate the two existing prototype HTML files into React components inside `features/case-player/` as scaffolding — they are already aligned with the eventual design language.

### Week 3 — Playable 10-Minute Prototype

**Deliverable:** Solo-mode playable prototype covering at least one act end-to-end (recommended: MCDC, because it is the most demanding and de-risks the rest).

**Engineering work:** Implement the truth-table editor, the independence-pair validator, the seeded-fault simulator for MCDC, and the verdict screen with one or two misconception detectors. Three case files. The other three acts can be stub levels that read "coming next week."

**Critical:** Run the prototype with another group during the testing session and record every confusion. The Week 3 feedback drives Week 4.

### Week 4 — Improvement & Visuals

**Deliverable:** Refined prototype with the remaining three acts at MVP fidelity, plus the local multiplayer Mock Trial mode for one act.

**Engineering work:** Build the P-V pair editor, the data-flow graph editor, and the BCC truth table. Implement the misconception transcript, achievement system, and replay-with-annotation. Polish animation. Add Solo Campaign progression.

### Week 5 — Final Presentation

**Deliverable:** Final game + visuals + documentation + 1-page reflection.

**Engineering work:** Build the Spectator/Presentation mode (§7.10). Freeze the codebase 48 hours before the demo. Write the documentation directly from the engine module README files (this is why §9 keeps the engine framework-free). Record a backup screen capture of a full case in case live demo fails.

### 10.4 Stretch (post-MVP / future work in the reflection)

Class Mode (§5.3) requires either a WebSocket server (Node + ws + Vercel hobby tier is enough for a class of thirty) or a P2P transport (PeerJS). Implementable in roughly two days but **explicitly out of scope for the five-week timeline** unless the team finishes Week 4 ahead of schedule.

---

## 11. Risks & Mitigations

**Risk: scope creep into game-as-game rather than game-as-pedagogy.** The rubric weights educational effectiveness (20 pts) and concept accuracy (20 pts) above prototype quality (35 pts) only by a small margin, but a beautiful game that teaches the *wrong* thing scores zero on the first two. Mitigation: every new feature must reference a specific clause of 29119-4 and a specific misconception it surfaces. Features that fail this test wait for §10.4.

**Risk: the misconception detectors over-fit to the team's interpretation of the standard.** The team are themselves still learning the standard; their detectors might encode the team's own misconceptions. Mitigation: every misconception detector cites the specific clause that justifies it, in code. The Week 5 reflection explicitly asks "what we got wrong about the standard" — these citations make the answer auditable.

**Risk: visual editors (especially data-flow) take longer than estimated.** React Flow is friendly but the def-use semantics on top are the team's own code. Mitigation: ship the data flow act last, and design it so a *table-based* fallback editor can replace the graph editor if Week 4 runs short. The verdict logic doesn't care which editor produced the test model.

**Risk: local multiplayer reveals an edge case in the misconception detector that solo play didn't.** Two players will find inputs the team didn't anticipate. Mitigation: make every detector return "unknown" rather than "no misconception" when its preconditions aren't met, and surface "unknown" as a debug warning in non-production builds. Better an honest "we didn't anticipate this case" than a confidently wrong verdict.

**Risk: the Week 3 feedback session reveals fundamental confusion about the courthouse metaphor itself.** Mitigation: budget half a day in Week 4 for either rewriting the metaphor's surface (different labels, same engine) or ditching it entirely (the engine is framework-free for this exact reason). The metaphor serves the standard, not the other way around.

---

## 12. What the Week 5 Reflection Should Argue

The reflection is one page and the rubric explicitly asks three questions: what was understood better through design, the most difficult ISO concept encountered, and how design differs from memorisation.

The defensible answer to all three is: **building the misconception detectors forced the team to specify the standard's intent more precisely than reading it ever did.** A misconception detector is a falsifiable claim about how a learner can be wrong. To write it, the team had to commit to "this is what §5.3.6.2 means and this is what it does not mean." That commitment is invisible during memorisation and unavoidable during design.

The most difficult concept is almost certainly MCDC's independence definition — the concept analysis already documents three distinct misreadings. The reflection should quote one or two of the team's own early implementation mistakes (preserved in git history) as evidence.

---

## 13. Open Questions Worth Deciding Early

These don't need to be answered now, but they will become harder to defer past Week 2.

1. **Will the seeded faults be visible in the source code shown to the player, or hidden behind an oracle the simulator consults?** Hidden faults teach black-box thinking; visible faults teach white-box thinking. The standard covers both — pick one default per act.
2. **Should multiplayer turn order be enforced by the app or by social convention?** Enforcing creates a real game; not enforcing leaves the focus on the technique. Recommend enforcing only in Mock Trial.
3. **How is "correct" defined when the standard offers multiple valid sub-techniques (e.g. Pair-wise vs. All Combinations both achieve 2-way coverage)?** Recommend: the case file declares the *required* coverage criterion, and any sub-technique that meets it is valid. Different sub-techniques produce different test counts; the verdict screen shows the player's count alongside the per-sub-technique optima.
4. **Does the game expose ISO clause numbers directly to the player, or only in the debrief?** Recommend: only in the debrief and the Annex C tutorials. Clause numbers in mid-play are noise; in the debrief they are the bridge back to the standard.

---

## 14. Visual Design Direction

Test Courthouse will adopt a **"Retro Sketchbook" aesthetic** — a deliberate hybrid that pairs hand-drawn, monochrome line-art characters and panels with chunky pixel-art interactive chrome (buttons, badges, score readouts). Reference points: the sketchy notebook style of indie narrative templates such as IfThenCreate's *Clampy*, combined with the saturated pixel-button vocabulary common to retro game UI kits.

The reasoning is pedagogical, not just aesthetic. The sketchy line-art style telegraphs *prototype, work-in-progress, you-can-question-this* — the right register for a game whose subject is reasoning about correctness. The pixel-art chrome telegraphs *play, low-stakes, retry-friendly* — the right register for a game whose verdicts feel weighty. Together the two registers communicate: "this is serious learning content, but mistakes here are cheap and reversible."

### 14.1 Visual vocabulary

**Characters** are simple line drawings — closer to a courtroom sketch artist than a polished comic. The cast is small and named:

- **The Judge.** A bench, a gavel, an optional powdered wig. Always centred, always neutral.
- **The Prosecutor.** The player's avatar in solo mode. Defined by posture (leaning forward, finger raised), not by detail.
- **The Defense.** The AI's voice in solo mode; the second player in Mock Trial.
- **The Defendant — *the bug*.** A small, slightly anxious creature (a doodled insect with too many eyes works). Each technique act gets its own bug archetype: a *combinatorial* bug with too many limbs; a *data-flow* bug that leaves a trail; an *MCDC* bug with a frozen face.
- **The Witness.** Code snippets personified by a hand-drawn frame around them, captioned *"Exhibit A."*
- **The Jury.** Only appears in 3–4 player modes; drawn as a small huddle of indistinct figures.

Characters are static SVGs. Two or three pose variants per character (idle / speaking / reacting) is enough; we are not animating mouth shapes.

**Panels and backgrounds** use a graph-paper texture — pale grid on cream — recalling a working notebook. Major panel borders are drawn with **rough.js** so every line wobbles slightly. The same library renders concept-map arrows, def-use chain edges, and verdict frames; the wobble is intentional and consistent.

**Interactive chrome** — buttons, score chips, coverage meters, technique-selection tabs — uses chunky pixel-art styling: 2-pixel borders, hard drop shadows, saturated fills from a fixed four-colour palette. This palette mirrors the reference button set and gives every interactive element a single unambiguous role.

### 14.2 Colour palette

| Role               | Hex         | Used for                                            |
| ------------------ | ----------- | --------------------------------------------------- |
| Cream paper        | `#F5F0E1`   | Page background                                     |
| Notebook ink       | `#1A1A1A`   | Sketch lines, body text                             |
| Pixel green        | `#34A853`   | Confirm buttons, "fault detected", verdict-pass     |
| Pixel magenta      | `#C13584`   | Misconception flags, retry, defense actions        |
| Pixel orange       | `#F26B1F`   | Info chips, scenario tags, instructor view          |
| Pixel blue         | `#2C6FBB`   | Navigation, primary CTAs, technique tabs            |
| Faint grid line    | `#E5DFCE`   | Graph-paper background grid                         |

Outside this palette, only neutral greys are permitted. No gradients. No transparencies on the chrome — transparency is reserved for the sketchy line work.

### 14.3 Typography

- **Body text:** *Patrick Hand* or *Caveat* (Google Fonts), 16–18 px. Hand-drawn feel but readable at length.
- **ISO clause citations and code snippets:** *JetBrains Mono* or *IBM Plex Mono*. Citations and code must read as authoritative; the sketchy register stops here.
- **Buttons, badges, score readouts, level titles:** *Press Start 2P* or *Silkscreen* (Google Fonts), 10–14 px. Pixel-perfect, used sparingly — these are the moments the game "speaks game."
- **Section headers in the debrief:** mixed — pixel font for the section title (e.g. `VERDICT`), hand-drawn font for the explanatory paragraph.

The two type families never share a sentence. A pixel-font label sits *next to* a hand-drawn body, never inside it.

### 14.4 Animation philosophy

Stepped, not smooth. Page-turn transitions between phases (a quick hand-drawn arc, no easing). Character pose changes are frame swaps, not tweens. Coverage meters fill in 8–10 discrete steps with a soft tick sound, not a continuous bar. The aesthetic forbids 60-fps polish; the aesthetic *requires* the ten-frame stutter that says *handmade*.

Enforce this with a shared Framer Motion preset: `transition: { type: "tween", duration: 0.08, ease: "steps(4)" }`. Any animation that bypasses the preset needs a written justification.

### 14.5 Sound (optional, Week 4 polish)

Eight-bit register only: a gavel thump on verdict (`.wav`, ~80 ms), a typewriter tick on dialog reveal, a soft chime on coverage milestone. No music in the MVP. All sounds toggleable from the settings menu, off by default in classroom contexts.

### 14.6 Asset sourcing

The art budget is zero. Every character and prop is hand-drawn in any vector tool — **Excalidraw** is the recommended choice because its native style already matches the target aesthetic; assets exported from Excalidraw drop in with no additional treatment. Phone-scanned paper sketches also work if cleaned up in any image editor.

For pixel chrome, two options: (a) hand-roll a tiny CSS component library for buttons / chips / borders (~100 lines of CSS, full control), or (b) layer **NES.css** over Tailwind for the chrome elements only. Option (a) is recommended — NES.css drags in styling for components the game does not need and makes overrides fragile.

### 14.7 Library additions to §8

- **rough.js** — hand-drawn SVG primitives. Used for panel borders, concept-map edges, def-use chain arrows.
- **@fontsource/patrick-hand**, **@fontsource/press-start-2p**, **@fontsource/jetbrains-mono** — self-hosted Google Fonts (avoids runtime fetch and works offline in the classroom).
- **Excalidraw** (authoring tool only, not a runtime dependency).

### 14.8 Asset checklist (MVP)

Five characters × 2 poses = 10 SVGs. Three bug archetypes (one per relevant act, plus a generic) = 3 SVGs. Panel borders are drawn at runtime by rough.js, no static assets. Four pixel-button variants (primary / secondary / danger / disabled) = 4 component definitions. Total static art: ~13 SVGs, reproducible in a single afternoon.

### 14.9 Anti-patterns to avoid

- *Mixing the two registers inside one element.* A pixel button with a sketchy outline reads as a bug, not a feature.
- *Smooth gradients anywhere.* Both registers reject them.
- *Using the pixel font for paragraphs.* Press Start 2P at body length is unreadable; Silkscreen is barely better. Pixel fonts are for labels.
- *Decorative wobble.* rough.js's wobble is *consistent*: same `roughness`, same `seed` per element type. Random wobble looks accidentally broken.

---

## 15. Two-Person Work Plan

The brief assumes a three-person team; this plan adapts to two. The split front-loads parallel work and reserves Week 5 for joint polish and presentation. Each person's work is sized so that if the other falls a day behind, the project still ships.

### 15.1 Roles

**Person A — Engine & Systems.**
Owns the framework-free `engine/` directory: case-file Zod schema, coverage validators (one per technique), fault simulator, misconception detectors, game-state stores. Owns testing infrastructure (Vitest), build / deploy pipeline, and the instructor analytics view. Writes the technical half of the Week 5 documentation.

**Person B — UX, Visuals & Content.**
Owns the visual design system (pixel + sketchbook), all reusable UI components (`PixelButton`, `RoughPanel`, `Dialog`, `CharacterSprite`, `CoverageMeter`), all screen layouts, animation, and the JSON case files. Owns asset production (SVG characters, panels) and the Annex C tutorial walkthroughs. Writes the design / pedagogy half of the Week 5 documentation.

**Shared.**
Both people co-own the MCDC act end-to-end (it is the riskiest and most representative — co-ownership de-risks it). Both review every PR. Both run the Week 3 prototype testing session. Both present in Week 5.

### 15.2 Week 2 — Setup & Design Foundations

**Person A.** Initialise Vite + TS + Tailwind + Zustand. Configure ESLint / Prettier / TS strict mode. Set up Vercel deploy — target: a hello-world live by Friday. Define the case-file Zod schema with one example MCDC case. Stub the engine module structure. Write three Vitest tests against the schema.

**Person B.** Build a design-system page at `/_design` showing every `PixelButton` variant, every `RoughPanel` size, the four-colour palette, both type families, and one `CharacterSprite`. Produce SVGs for the Judge, Prosecutor, Defense, and one bug. Migrate the two existing prototype HTML files into the new component vocabulary. Sketch the case-player screen for MCDC in Excalidraw.

**Joint deliverable (Week 2 hand-in):** the 3-page game proposal + navigable Excalidraw sketch + live hello-world URL with the `/_design` page accessible. Proposal is co-written: A drafts the technical sections, B drafts the design and pedagogy sections, both review.

### 15.3 Week 3 — Playable MCDC Prototype

The Week 3 deliverable is a single technique act (MCDC) playable end-to-end. Both people work this act in parallel against the agreed schema.

**Person A.** Truth-table editor's behavioural layer (validation, independence-pair detection, coverage calculation), seeded-fault simulator for MCDC, verdict screen logic. Two misconception detectors: *independence-as-isolation* and *duplicate-pair-rejection*. Wire state through Zustand. Author three MCDC case files (tutorial / standard / trap).

**Person B.** Truth-table editor's UI (the click-to-pair interaction, candidate-pair highlight animation, rejection feedback), case briefing screen, dialog system, verdict screen presentation (judge sprite, gavel animation, coverage meter), debrief screen with Annex C link. Two more bug archetypes.

**Integration checkpoint — Day 4 of Week 3.** Both people sit at one machine and walk through a case start to finish. Anything that breaks is fixed jointly.

**Week 3 hand-in:** playable 10-minute MCDC prototype, deployed to Vercel. Run it with another group as the brief requires; record every confusion in a shared doc — this drives Week 4.

### 15.4 Week 4 — Three Acts + Multiplayer

Acts are split by interaction type, not by interest. Combinatorial is the most table-heavy (suits engine work). Data flow is the most visual (suits UI work). BCC is shared because it reuses most of the MCDC infrastructure.

**Person A.** Combinatorial act end-to-end: P-V pair editor logic (TanStack Table), All-Combinations / Pair-wise / Each-Choice / Base-Choice coverage validators, three case files, three misconception detectors. Mock Trial multiplayer for the MCDC act (turn enforcement, prosecution / defense scoring). Misconception transcript + instructor analytics page.

**Person B.** Data Flow act end-to-end: ReactFlow def-use graph editor, three case files, two misconception detectors (collaborate with A on detector logic; UI catches what logic verifies). BCC act jointly with A — A owns the validator, B owns the UI (which mostly reuses MCDC's truth table). Achievement system UI, replay-with-annotation, one Annex C tutorial walkthrough (MCDC).

**Integration checkpoints:** Day 3 (BCC handoff between A and B), Day 5 (full four-act campaign playthrough together).

**Week 4 hand-in:** all four acts playable, MCDC available in Mock Trial mode, instructor view accessible.

### 15.5 Week 5 — Polish, Documentation, Presentation

Code freeze 48 hours before the demo. No new features in the freeze window — only bug fixes.

**Person A.** Engine documentation (one short README per engine module), CSV export from the instructor view for the demo, fix any bugs surfaced in the Week 4 playthrough. Leads the Q&A in the presentation.

**Person B.** Spectator / Presentation mode (clean UI, keyboard-only nav, presenter-notes overlay). Demo script. Backup screen capture of a full case in case the live demo fails. Leads the live demo in the presentation.

**Joint.** Co-write the one-page reflection (the argument is in §12 of this plan). Rehearse the 22-minute presentation twice end-to-end. Submit.

### 15.6 Synchronisation rituals

- **Daily 10-minute standup.** What shipped, what's shipping next, what's blocking. Async over chat if schedules don't align.
- **End-of-week integration session.** Both people on one machine for two hours. Catches the integration bugs that PR review misses.
- **Shared `decisions.md` log.** Every non-obvious choice (e.g. "we treat short-circuit evaluation as TODO, not as a correctness bug") gets one line. This file is the source for the Week 5 reflection's "what we got wrong" section.

### 15.7 Failure modes covered

If **Person B falls behind on visual polish:** the engine still works with placeholder UI. The game is playable; the verdict screen is uglier. The rubric's largest weight (Prototype Quality, 35) values *playable* over *pretty*.

If **Person A falls behind on engine work:** Person B authors additional case files (no engine work required) and sharpens the Annex C tutorials. Concept Accuracy (20) and Educational Effectiveness (20) score on what is *playable correctly*, not on how many cases exist.

If **both fall behind:** Mock Trial multiplayer is the first to drop. Solo MCDC + one other act + the verdict / debrief loop is a defensible Week 5 submission.

### 15.8 Effort estimate

Roughly 12–15 hours/person/week across five weeks, peaking at 20 hours in Week 4. The estimate assumes one person who is comfortable with React + TypeScript and one person who is comfortable with CSS / SVG / Figma; if the team's skill profile differs, swap the role labels (A and B) but keep the work split.

---

## 16. Summary

Test Courthouse takes the four 29119-4 techniques the team has already analysed in depth and turns each into a concrete, observable interaction. The courthouse metaphor gives every interaction a memorable name and every misconception a memorable consequence. The web app is a static React + Vite + TypeScript bundle, deployable for free, playable solo or in a classroom, and authored as JSON case files that non-developer teammates can extend.

The plan is sized so that the Week 3 prototype covers one technique end-to-end with real misconception detection, Week 4 fills in the rest at MVP fidelity, and Week 5 ships a polished demo plus a defensible reflection. Every diversification idea in §7 is layered on top of an MVP that already satisfies the rubric — the team can stop at any point and still submit a coherent, rubric-aligned project.
