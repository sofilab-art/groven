
# Groven Prototype — Progress Summary

**March 2026** | Behavioral prototype at [groven.pythonanywhere.com](https://groven.pythonanywhere.com/)

---

## What Groven is

Groven is an open source platform for structured deliberation. It replaces flat discussion threads with a **typed idea graph**: every contribution is semantically classified by an LLM as clarification, extension, reframing, contradiction, or synthesis — visible, explainable, and always subject to human override. The goal is a communication tool where the reasoning behind a collective decision is permanently legible, not just the outcome.

Groven is initiated by Sofilab GmbH (Munich) in the context of the CORPUS Royalty Protocol, co-funded by Creative Europe. It is designed as a general-purpose tool, independent of any specific domain.

---

## What the prototype demonstrates

The behavioral prototype implements the core discussion model from the Groven concept paper (Sections 1–2) and extends it in several directions not anticipated by the paper.

### Implemented and working

| Capability | Status |
|---|---|
| **Seed → Branch → Forest model** | Complete. Seeds (root arguments) and Branches (typed responses) form a navigable tree. |
| **Five branch types** with LLM classification | Complete. The LLM (gpt-5-mini) proposes a type; the author confirms or overrides. Contested nodes are visually marked. |
| **Question flag** as cross-cutting modifier | Complete. The LLM detects whether a contribution is a question (requesting, not providing). Question nodes display a `?` marker. This was not in the concept paper — it emerged from prototype testing. |
| **Progressive streaming** (SSE) | Complete. Classification streams first; the review modal opens immediately. Title and lineage fill in as they arrive. No blank loading screens. |
| **LLM rethinking on override** | Complete. When the author picks a different type, the LLM explains why the author's reading is reasonable — creating a record of interpretive ambiguity. |
| **LLM-generated synthesis suggestions** | Complete. A reasoning model (gpt-5.2) analyses the full discussion tree and proposes 1–3 actionable synthesis nodes. Suggestions are ephemeral until a human accepts one. |
| **Proposal voting** (Support / Oppose) | Complete. Synthesis nodes are votable with one-sentence justifications. A vote arc gauge on the graph shows both vote balance and participation level at a glance. |
| **D3.js force-directed graph** | Complete. Color-coded by type, with visual markers for contested nodes, questions, and synthesis vote status. |
| **Four pre-loaded discussion spaces** | Complete. Three CORPUS governance topics + one artistic programming decision (Lachenmann), demonstrating domain-agnosticism. |

### Not yet implemented

| Capability | Concept paper section | Notes |
|---|---|---|
| **Governance module** (Open → Ready → Decided) | Section 3 | The formal voting cycle — jury declares readiness, LLM summarises, space closes, binding vote — is structurally absent. Proposal voting (implemented) is an informal precursor, not a replacement. |
| **Authentication and access control** | Section 4 | Not needed for behavioral testing. Required before any real governance use. |
| **Decision nodes** (immutable, signed) | Section 3.2 | Depends on the governance module. |
| **Multi-media content** (audio, video, images) | Section 4.4 | Text-only for now. |
| **Sortition jury integration** | Section 3.3 | Depends on authentication + governance module. |

---

## What we learned

**1. The LLM does the structuring; the author does the editing.** The concept paper assumed authors would write titles, select types, and describe lineage. The prototype inverts this: the author writes only the body text, and the LLM proposes everything else. The author's role is editorial review, not structural annotation. This reduces friction significantly — but whether it produces better or worse lineage descriptions than author-written ones is an open empirical question.

**2. Two models, two tasks.** A fast model (gpt-5-mini) handles classification, titles, and summaries. A reasoning model (gpt-5.2) handles synthesis suggestion — a task requiring structural analysis of the full discussion. This two-model architecture was not anticipated by the concept paper but emerged as a clear fit.

**3. Questions are structurally important.** The concept paper's five types are all assertions. But questions ("What do you mean by X?") are common in deliberation and serve a distinct function: they mark incomplete threads. The prototype adds a question flag as a modifier on any type — preserving the five-type system while adding expressive power.

**4. Two tiers of voting.** The concept paper envisions voting as a formal governance event. The prototype reveals a lighter use: testing the temperature of a synthesis proposal before formal escalation. This suggests a two-tier model — informal proposal voting (implemented) and formal governance voting (concept paper Section 3) — that the concept paper should consider formalising.

**5. Progressive streaming matters for UX.** Streaming LLM results via SSE — classification first, then title and lineage — means the author engages with the most important decision (type confirmation) while secondary fields are still loading. The streaming order matches cognitive priority.

---

## What's next

1. **User testing.** The prototype exists to answer behavioral questions (Section 8 of the concept paper). It needs to be tested with real participants — not just the development team simulating voices.

2. **Governance module.** The formal Open → Ready → Decided cycle is the largest unbuilt piece. It requires authentication, jury mechanics, LLM summary generation, and immutable decision nodes.

3. **Concept paper update.** The addendum documents prototype findings. A v5 of the concept paper should wait until the governance module is tested — premature formalisation of untested features carries risk.

---

**Demo:** [groven.pythonanywhere.com](https://groven.pythonanywhere.com/) — try the Lachenmann space for the full feature set.

**Code:** [github.com/sofilab-art/groven](https://github.com/sofilab-art/groven) — Python/Flask, SQLite, vanilla JS, D3.js. No build step.

**Concept paper:** groven_concept_v4.md + addendum (groven_concept_v4_addendum.md)
