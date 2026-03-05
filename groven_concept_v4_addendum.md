
# Addendum to Groven Concept Paper v4

## Prototype Implementation — Findings and Extensions

**March 2026** | Based on the behavioral prototype at groven.pythonanywhere.com

This addendum documents features, design decisions, and open questions that emerged during the construction and testing of the Groven behavioral prototype. It does not replace the concept paper — it extends it with empirical observations and implemented capabilities not yet described there.

---

### 1. LLM-Generated Synthesis Suggestions

**Not covered in concept paper.** Section 2.4 defines *Synthesis* as a branch type, and Section 4.3 mentions the LLM "identifies threads where Synthesis may be possible." The prototype now implements this concretely.

**How it works:**
- When a space has 3+ contributions, any participant can request synthesis suggestions.
- The LLM (a reasoning model, currently gpt-5.2) receives the full discussion tree — all nodes with their types, titles, bodies, and parent relationships — and proposes 1–3 synthesis opportunities.
- Each suggestion includes: a parent node (what it most directly responds to), referenced nodes (which threads it connects), a title, a body (2–4 sentences), and a reasoning explanation.
- Existing synthesis nodes are included in the tree but listed separately, so the LLM avoids re-suggesting connections already covered.
- The user selects a suggestion, which pre-fills the contribution form. The node then goes through the normal branch creation and review modal flow — the author can still edit the title, body, and override the type.

**Design decision:** Synthesis suggestions are ephemeral. They are generated on demand and not stored. Only when a user accepts a suggestion and submits it does a node enter the graph. This prevents the LLM from accumulating structural weight in the discussion without human action.

**Implication for concept paper Section 4.3 (LLM Integration):** The concept paper describes a single LLM trigger (branch creation). The prototype uses two distinct models for two distinct tasks:
- A fast model (gpt-5-mini) for classification, title generation, lineage description, and proposal summaries — tasks requiring comprehension but not deep reasoning.
- A reasoning model (gpt-5.2) for synthesis suggestion — a task requiring analysis of the full discussion structure and identification of non-obvious connections.

This two-model architecture may be worth formalising in the concept paper's technical section.

---

### 2. Proposal Summaries and Scoped Voting

**Partially covered.** Section 3.1 describes voting as a governance state transition (Open → Ready → Decided). The prototype implements a lighter-weight mechanism: **node-level voting on synthesis proposals**.

**How it works:**
- Every synthesis node is automatically a proposal. The LLM generates a one-sentence *proposal summary* — a distillation of the synthesis body into a concrete, votable statement.
- Participants can Support or Oppose the proposal with a one-sentence justification.
- Vote tallies and individual positions are visible on the node, both in the graph panel and on the node detail page.
- In the graph, synthesis nodes display a **vote arc gauge** — a ring that fills proportionally as votes arrive. Green arcs represent support, red arcs represent opposition, and the unfilled portion remains as a dashed purple halo. Eight votes fill the full circle. This communicates two signals simultaneously: the balance of opinion *and* whether enough people have voted to form a representative picture. The gauge updates live after inline votes without page reload.

**Why this matters for the concept paper:**
The concept paper's governance module (Section 3) envisions voting as a formal, space-level event: a jury declares readiness, the LLM summarises, the space closes, votes are cast. This is correct for constitutional decisions.

But the prototype reveals a second, lighter use of voting: **testing the temperature of a synthesis before escalating to formal governance**. A synthesis proposal with 8 Supports and 1 Oppose is a different signal than one with 3 Supports and 5 Opposes — and both are useful information *before* anyone declares the topic Ready.

This suggests a two-tier voting model:
1. **Proposal voting** (implemented) — informal, per-node, open to all, no quorum, no finality. A signal, not a decision.
2. **Governance voting** (concept paper Section 3) — formal, per-space, jury-controlled, with quorum, finality, and decision node anchoring.

The concept paper should consider whether to formalise this distinction.

---

### 3. The Contribution Flow in Practice

**Partially covered.** Section 2.2 describes the Branch creation requirement (lineage description) and Section 2.5 describes the LLM's role. The prototype reveals the full UX flow, which has implications worth documenting:

1. Author writes only the body text (no title, no type selection, no lineage).
2. The analysis streams progressively via Server-Sent Events (SSE). Classification arrives first; the review modal opens immediately. Title and lineage generate in parallel (via `ThreadPoolExecutor`) and fill in as they arrive, with animated loading stripes indicating progress. This reduces perceived wait time significantly — the author can already review the type proposal while title and lineage are still generating.
3. The LLM reads parent + body and returns: proposed type, whether it's a question, generated title, lineage description, and a two-sentence explanation. When the contribution is a question, the title is phrased as a question ending with `?` (e.g. "How long is each phase?" rather than "Clarify phased approach duration") — this makes question nodes immediately recognisable in the graph.
4. The author reviews everything in a modal. They can edit the title and lineage description, confirm or override the type, and toggle the "This is a question" checkbox.
5. If the author picks a different type, the LLM is called again to *rethink* — it generates a new explanation acknowledging why the author's reading is reasonable, and reconsiders whether the contribution is a question. A **Regenerate ↻** link appears next to the title field, offering to regenerate both title and lineage description for the new type. This is opt-in: the author may have already edited the fields manually, and automatic overwriting would discard that work. Clicking regenerate calls `generate_title` and `generate_lineage` in parallel with the overridden type; switching back to the original type hides the link.
6. If overridden, the node is flagged as Contested. Question nodes display a `?` marker in the graph and on type badges.

**Key observation:** The author writes *less* than the concept paper assumes (no title, no lineage, no type, no speech-act classification), and the LLM proposes *more* (title, lineage, type, question flag, explanation). This inverts the expected burden: the LLM does the structuring work, the author does the editorial work. Whether this produces better or worse lineage descriptions than author-written ones is an open empirical question.

**Progressive streaming is significant.** The SSE architecture means the author never faces a blank loading screen for the full duration of all three LLM calls. The modal opens as soon as classification is ready (~1–2 seconds), and title/lineage fill in over the next few seconds. This matters because the classification is what the author needs to engage with first — title and lineage are secondary fields they may only glance at. The streaming order matches the cognitive priority.

**The rethinking step (4) is significant.** When the author overrides, the LLM doesn't simply accept the correction — it explains why the author's classification is reasonable. This creates a record of interpretive ambiguity that is more informative than a silent override. It is also a test of LLM epistemic humility: can it genuinely argue for a classification it didn't initially propose?

**The regeneration offer matters.** Title and lineage are generated based on the branch type — a `clarification` title reads differently from a `contradiction` title. When the author overrides the type, those texts may no longer fit. Rather than regenerating automatically (which would discard manual edits), the prototype offers a **Regenerate ↻** link that appears only after an override. This respects the author's editorial agency while acknowledging that the LLM's structural outputs are type-dependent. The choice to make it opt-in is deliberate: it forces the author to decide whether their edits or the LLM's re-interpretation better serve the discussion.

---

### 4. Questions as a Modifier Flag

**Not covered in concept paper.** The concept paper's five branch types (Section 2.3) are all assertions — they describe what a contribution *does* in relation to its parent. But asking a question is a fundamentally different speech act. "What do you mean by X?" is *requesting* clarification, not *providing* it. Questions signal unresolved threads that need attention, and they are structurally important for the health of a deliberation.

**Design decision: modifier, not sixth type.** Rather than adding "question" as a sixth branch type, the prototype implements it as a boolean flag (`is_question`) orthogonal to the type system. A question asking for clarification is still a `clarification` node (same blue color) but with a `?` marker. This preserves the five-type typology while adding expressive power.

**How it works:**
- The LLM classifies both the branch type AND whether the contribution is a question, in a single call. The prompt defines a question as one that "requests information, clarification, or justification from the parent — it does not itself provide an answer."
- The review modal displays a "This is a question" checkbox, pre-filled by the LLM. The author can toggle it, just as they can override the type.
- Question nodes display a white `?` overlaid on the node circle in the graph. Type badges append `?` (e.g. "clarification?").
- When the author overrides the type and the LLM rethinks, the reclassification also reconsiders whether the contribution is a question.

**Why this matters for the concept paper:**
The concept paper implicitly treats all contributions as assertions. But in practice, questions are common and serve a distinct structural function: they mark points where the discussion is *incomplete*. A thread ending in a question is qualitatively different from one ending in an assertion — it invites response rather than closure.

The modifier approach has a further advantage: it does not increase the cognitive load of the type system. Five types are already substantial for authors to internalise. A sixth type would flatten the distinction between "what does this contribution do?" (type) and "is this a request or a statement?" (speech act). By keeping them on separate axes, the prototype preserves the clarity of both.

**Implication:** The concept paper should consider formalising this distinction between assertion and question as a cross-cutting property of all branch types, not specific to any one type.

---

### 5. The Lachenmann Space as Test Case

The prototype ships with four pre-loaded discussion spaces. The fourth — *Should our ensemble perform Helmut Lachenmann?* — was constructed as a controlled test of the full branch typology and synthesis flow.

**Structure:** 1 seed + 10 branches + 1 synthesis from 10 musicians (Clara, Marcus, Reiko, Tomás, Yuna, Dmitri, Aisha, Felix, Priya, Leo, Sofia). The tree covers all five branch types across three levels of depth. A pre-loaded synthesis node — *Phase-in Lachenmann via chamber pilot* — demonstrates the vote arc gauge with 7 example votes (5 support, 2 oppose), showing how the visual indicator communicates both vote balance and participation level at a glance.

**Why this matters:** The first three spaces are in the CORPUS context (music rights governance). The Lachenmann space demonstrates that the deliberation structure is genuinely domain-agnostic — it works equally well for an artistic programming decision as for a licensing governance question. This validates the concept paper's claim in Section 1.3 that Groven is "domain-agnostic and open source."

---

### 6. Observations for Key Open Questions (Section 8)

The prototype does not answer the concept paper's open questions — it is not a user study. But it produces observations relevant to several of them:

**"Will authors engage thoughtfully with the LLM type proposal — or will they accept the default without reading the explanation?"**
The prototype's modal design forces engagement: the author must click "Confirm" or explicitly select a different type. The LLM explanation is visible in the modal, not hidden behind a disclosure. Whether this is sufficient to prevent rubber-stamping requires user testing.

**"How reliable is semantic type classification across languages, domains, and communication styles?"**
In the Lachenmann test space, gpt-5-mini correctly classified 10 out of 10 branches on first proposal. This is promising but not conclusive — all contributions were written in English by a single author simulating different voices. Cross-language and cross-author testing remains essential.

**"Is the confidence score meaningful enough to be shown?"**
The prototype does not display confidence scores. The LLM explanation serves as a qualitative proxy. This is a deliberate design choice: a percentage ("78% Extension") invites gaming and false precision; a two-sentence explanation invites reading.

---

### 7. Deviations from the Concept Paper's Technical Recommendations

| Concept Paper | Prototype | Reason |
|---|---|---|
| Node.js + TypeScript backend | Python / Flask | Faster prototyping for behavioral validation; production stack TBD |
| PostgreSQL | SQLite | Sufficient for prototype scale; no concurrent write pressure |
| React frontend | Vanilla JS | No build step, no framework overhead for a behavioral prototype |
| Claude API (claude-sonnet-4-6) | OpenAI gpt-5-mini + gpt-5.2 | Two-model architecture emerged as better fit (see Section 1 above) |
| OAuth2 / OIDC auth | No authentication | Not needed for behavioral testing |
| REST + WebSocket | REST + SSE streaming | Branch preview streams classification, title, and lineage progressively via Server-Sent Events |
| Cryptographic signing of decision nodes | Not implemented | Governance voting not yet at production stage |

These deviations are intentional and appropriate for a behavioral prototype. The concept paper's recommendations remain valid for the production implementation.
