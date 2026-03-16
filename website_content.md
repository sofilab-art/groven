
# Groven — Website Content

This document contains all text for the Groven project website. Copy, section, and visual direction are included. Technical implementation details are intentionally omitted.

---

## Hero

**Groven**

Where public thinking becomes collective action.

An open-source platform for communities that need to move from open discussion to informed decision — without losing the reasoning that got them there.

[View prototype](https://groven.pythonanywhere.com/) · [GitHub](https://github.com/sofilab-art/groven) · [Read the concept paper](#concept-paper)

---

## The Problem

### Online discussion is broken in two directions.

**Too flat.** Most platforms treat every contribution the same. A personal experience, a counterargument, a cited source, and a joke all appear as identical comments in a vertical stack. At scale, the reasoning disappears. Governance is detached from the thinking that preceded it.

**Too rigid.** When platforms overcorrect toward structure, every conversation becomes a proto-bureaucratic object. Topics are framed too early as propositions. Informal exchange is instrumentalised. Communities need places for asking, witnessing, helping, and disagreeing — not just deciding.

Groven is built for the space between.

---

## The Questions We're Tackling

Groven exists to answer a set of questions that no existing platform has adequately addressed:

**Can a platform host different modes of civic life?**
What if the same system supported casual exchange, focused deliberation, formal proposal-making, and binding decisions — without confusing them?

**Can governance grow from conversation?**
What if voting wasn't a separate tool, but the natural conclusion of a discussion that had been structured well enough to decide? What if the reasoning path from first question to final decision was permanently legible?

**Do communities need to decide everything?**
What if some matters could remain open, unresolved but not lost? What if non-decision was a legitimate outcome, not a failure?

**Can AI assist without governing?**
What if AI helped map a conversation — suggested connections, summarised threads, detected questions — but never decided what a contribution means? What if every AI proposal was visible, explainable, and overridable?

**Can structure make discussion better without killing it?**
What if contributions carried visible semantic relationships — not imposed by a moderator, but proposed by AI and confirmed by the author? Does knowing *how* your idea relates to someone else's change *what* you write?

---

## How Groven Works

### Rooms, not threads.

Groven doesn't force everything into a single discussion format. It organises collective thinking into rooms with different purposes:

**The Plaza** is the open front door. Post a question, share an observation, raise a concern. Low threshold, no formality required.

**Tables** form when a matter needs focus. A policy question, a design problem, a normative disagreement. Tables are where collective thinking happens.

**The Proposal Lab** is where options become decision-ready. Language is sharpened. Consequences are mapped. Objections are named. This is not discussion — it is drafting.

**The Assembly** is where formal decisions happen. Only matters that have explicitly entered a decision path arrive here, with a declared decision body, a declared method, and a declared scope.

**The Library** is the community's permanent memory. Decisions, their reasoning, minority positions, implementation commitments, and review dates — all preserved and searchable.

People move freely between rooms. The system preserves where ideas have travelled and why.

### AI as cartographer.

Groven uses AI not to govern, but to map.

When you write a contribution, the AI proposes how it relates to the conversation — what function it serves, what it connects to, whether it opens a question or closes one. You review. You can override. Your reading and the AI's reading both remain visible.

The AI can also suggest syntheses — concrete proposals that connect threads you might not have noticed were related. But suggestions remain ephemeral until a human accepts them. The AI cannot add structure to the discussion on its own.

This matters because classification is not neutral. Calling something a "contradiction" when the author sees it as a "reframing" is a substantive act. In Groven, that interpretive tension is preserved as information, not resolved by algorithm.

### Two tiers of voting.

Not every expression of agreement is a governance act. Groven distinguishes between:

**Temperature voting** — informal, open, per-contribution. Anyone can signal support or opposition to an idea, with a one-sentence justification. This tells the community where energy and resistance live, without the weight of a binding decision.

**Governance voting** — formal, scoped, final. A declared decision body, a declared method, a quorum. The outcome is permanently recorded alongside the reasoning that produced it, the minority positions, and a review date.

Most platforms offer only one of these. Groven offers both, because communities need signal before they need decision.

### Human facilitation, not just algorithms.

Every Groven space has visible stewards — people whose role is to maintain the conditions of exchange. They don't control outcomes. They de-escalate, help formulate governable questions, ensure minority concerns aren't erased, and document their own interventions.

Governance tools fail when they treat social care as an afterthought. In Groven, facilitation is part of the architecture.

---

## What Groven Is Not

**Not a better comment thread.** It's not optimised for engagement, reactions, or virality. There are no likes, no algorithmic feeds, no trending topics.

**Not only a decision platform.** Most matters in a community don't need a vote. Groven supports the full range from open exchange to formal governance — and doesn't pressure everything toward closure.

**Not an AI moderator.** The AI proposes structure. It doesn't hide content, rank contributions, or decide when a community must act.

**Not a product yet.** Groven is an open-source research prototype. A working demo exists. The concept paper is public. The questions are real. The answers require building and testing with real communities.

---

## The CORPUS Context

Groven is initiated within the governance design of the **CORPUS Royalty Protocol** — an open licensing and royalty infrastructure for music in the age of AI, developed by Sofilab GmbH in Munich, co-funded by the European Union (Creative Europe).

CORPUS needs a governance platform where a small, curated contributor community can deliberate, reason through trade-offs, and make binding decisions with permanently legible reasoning. Groven is that platform.

But Groven is not CORPUS-specific. Its architecture is domain-agnostic — designed for any community that needs to move from discussion to decision: cooperatives, cultural organisations, municipalities, research groups, DAOs, and beyond.

---

## What Exists Today

A behavioral prototype is live and testable. It demonstrates:

- **Structured contribution** — write your thinking, and the AI proposes how it fits into the conversation. You review and confirm.
- **Visible reasoning** — every contribution shows its type, its relationships, and any interpretive disagreement between author and AI.
- **Synthesis suggestions** — the AI analyses the discussion and proposes concrete proposals that connect divergent threads. You decide whether they enter the conversation.
- **Temperature voting** — signal support or opposition to any proposal, with justification. See at a glance where the community stands.
- **A navigable graph** — the discussion as a living, visual structure, not a scrollable wall of text.

The prototype ships with four pre-loaded discussion spaces: three in the context of CORPUS music governance, and one about programming Helmut Lachenmann for an ensemble season — demonstrating that the structure works regardless of domain.

**[Try the prototype →](https://groven.pythonanywhere.com/)**

---

## Open Source

Groven is open source from day one. MIT license. Self-hostable. No mandatory cloud dependency.

A governance platform for communities requires the trust that comes from transparency. The source code being readable, auditable, and forkable is part of what makes the governance process trustworthy.

Groven will be governed using Groven itself — roadmap decisions, RFCs, and breaking changes all processed through the platform's own rooms.

**[View on GitHub →](https://github.com/sofilab-art/groven)**

---

## Documents

- **[Concept Paper v5](groven_concept_v5.md)** — the full design document: rooms, cards, AI philosophy, governance model, voting tiers, open questions
- **[Prototype Summary](groven_prototype_summary.md)** — what was built, what was learned, what's next
- **[Concept Paper v4 + Addendum](groven_concept_v4.md)** — the original Seed→Branch→Forest model and prototype findings

---

## Who We Are

**Sofilab GmbH, Munich**

Groven is initiated by Sofilab in the context of the CORPUS Royalty Protocol, co-funded by the European Union (Creative Europe). The project is designed as a general-purpose open-source tool, independent of any single domain or organisation.

Contact: *[add contact]*

---

## Footer

Groven — Open Source Initiative · Initiated by Sofilab GmbH, Munich · 2026

*This project is itself a Seed. Fork it.*
