
# GROVEN

## A Multi-Room Platform for Collaborative Thinking and Collective Governance

**Concept Paper v5** | Open Source Initiative | March 2026

Initiated by Sofilab GmbH, Munich — in the context of the CORPUS Royalty Protocol

---

| Positioning statement |
|---|
| Groven is where public thinking stays alive long enough to become legitimate collective action. It is a place to ask, argue, source, draft, decide, review, and remember — without forcing every conversation into a vote. |

---

| Abstract |
|---|
| Groven is an open-source platform for collaborative thinking, mutual support, and collective governance. It is designed for communities that do not merely need a better forum, and do not merely need a better voting tool, but need a shared place where conversation, evidence, proposal-making, and decision can remain connected without collapsing into one another. |
| Unlike systems that model discussion as a single tree or a rigid linear workflow, Groven models collective reasoning as movement across a set of linked public rooms: a low-threshold **Plaza** for open exchange, temporary **Tables** for focused conversation, a **Proposal Lab** for drafting decision-ready options, an **Assembly** for formal decisions, and a **Library** for durable memory. |
| The platform treats governance as one possible outcome of public reasoning, not as the inevitable destination of every thread. A question may be answered. A concern may become a support request. A support request may become a policy issue. A policy issue may become a proposal. A proposal may become a decision. And some matters may remain unresolved without being lost. |
| AI is used as a cartographer, not as a governor. It helps map conversations, surface patterns, draft alternative readings, and suggest connections — but it does not define the authoritative structure of the discussion and does not determine when a community must decide. |
| Groven is designed to feel less like procedure and more like civic life. |

---

# 1. Context and Motivation

## 1.1 The problem with flat threads

Most online discussion platforms flatten fundamentally different acts into the same visual form. A personal experience, a question, a counterargument, a cited source, a draft proposal, and a joke all appear as equivalent comments in a vertical stack. This may be tolerable for casual exchange, but it fails when a community needs to remember why it arrived at a conclusion, what evidence mattered, what remained contested, and who is actually entitled to decide.

The result is familiar: discussions become unreadable at scale, the relationship between ideas disappears, and governance is detached from the reasoning that preceded it.

## 1.2 The problem with rigid governance workflows

The opposite mistake is to overcorrect. When a platform is built primarily around decision stages, it often turns every conversation into a proto-bureaucratic object. Threads are subtly pressured toward closure. Topics are framed too early as propositions. Informal exchange becomes instrumentalized.

But communities do not live only through propositions and votes. They also need places for asking, witnessing, clarifying, helping, testing, disagreeing, discovering, and — only sometimes — deciding.

A healthy civic system must be able to host all of these modes without confusing them.

## 1.3 What communities actually need

A durable collaborative platform should therefore do five things at once:

1. Allow low-threshold participation without immediate formalization
2. Make the relationships between ideas visible without forcing a single authoritative map too early
3. Provide explicit paths by which some matters can become governable questions
4. Preserve evidence, minority views, and implementation consequences
5. Distinguish between conversation, facilitation, proposal-making, and decision authority

## 1.4 The CORPUS context

Groven is initiated within the governance design of the CORPUS Royalty Protocol — an open licensing and royalty infrastructure for music in the age of AI, developed by Sofilab GmbH in Munich, co-funded by the European Union (Creative Europe). CORPUS requires a governance platform that can:

- Support deliberation among a small, curated contributor community (initially < 50 persons, selected by stratified sortition)
- Make the reasoning behind governance decisions permanently legible — not just the outcome, but the path
- Connect community discussion to formal voting without losing the context in which the vote arose
- Scale to larger communities without losing the quality of structured deliberation

CORPUS will use Groven as its governance layer. But Groven itself is domain-agnostic and open source. The CORPUS implementation is one application of a general tool.

## 1.5 The gap in the existing landscape

The field of deliberative technology is active and well-researched. Argument-mapping tools (Kialo, AGORA-net, LiteMap), consensus platforms (Pol.is), and decision tools (Loomio, Decidim) each address parts of the problem. Academic research in Computer-Supported Cooperative Work (CSCW) has produced robust theoretical foundations.

However, a systematic gap remains. A 2021 study explicitly found that existing systems, including Kialo, have insufficient functionality for the synthesis of arguments. Kialo has simplified its argument structure to the point of offering only two types (Pro/Con), with minimal flexibility. And critically: no existing production tool combines typed contributions, LLM-assisted structure recognition, multiple participation modes, and governance voting in a single coherent system with full human override.

Groven is built to close this gap.

---

# 2. Core Concept

## 2.1 The Groven model: Plaza → Tables → Proposal Lab → Assembly → Library

Groven is not structured around a single thread model. It is structured around public rooms.

| Room | Function |
|---|---|
| **Plaza** | The open front space. People post questions, observations, concerns, offers, and early ideas. The point of the Plaza is not immediate order. It is social permeability — the lowest threshold for entry into the community's shared thinking. |
| **Tables** | Temporary, focusable clusters that form around a matter. A table may gather a support question, a practical issue, a normative disagreement, or an emerging proposal. Tables are the primary site of collective thinking. |
| **Proposal Lab** | Where draft options are shaped for formal consideration. Not the same as open discussion. This is the space where language, scope, consequences, and implementation details are made decision-ready. |
| **Assembly** | The formal decision space. Only matters that have explicitly entered a decision path appear here. |
| **Library** | The long-term memory of the community. Discussion traces, source bundles, decisions, minority notes, implementation follow-ups, and review dates. |

The core idea is simple: people should be free to move, but the system should preserve where they have moved and why.

## 2.2 Cards, not just branches

The basic unit in Groven is a **card**. A card serves one of several public functions:

| Function | What it does |
|---|---|
| **Question** | Asks for information, clarification, or justification. Marks an incomplete thread. |
| **Claim** | Asserts a position or interpretation. |
| **Experience** | Shares firsthand testimony or situated knowledge. |
| **Evidence** | Provides verifiable supporting material — documents, data, links, research. |
| **Proposal** | Offers a concrete, actionable option for consideration. |
| **Amendment** | Modifies a specific proposal. |
| **Summary** | Synthesises or condenses a discussion thread. |
| **Request** | Asks for help, support, or a resource. |
| **Offer** | Provides help, expertise, or a resource. |
| **Decision note** | Records the outcome of a formal decision process. |

This matters because collective thinking is not made only of arguments. It is also made of testimony, uncertainty, sourcing, implementation notes, and acts of care.

A participant does not need to classify every card with precision before posting. Low friction is preserved. The AI proposes a classification; the author reviews. More formal structure can be added later by the author, peers, stewards, or AI suggestions.

### The question modifier

The prototype revealed an important subtlety: asking a question is a speech act orthogonal to function. "What do you mean by X?" is a *question* that *requests clarification*. "You probably mean X, not Y" is an *assertion* that *provides clarification*. Both serve the clarification function, but they do fundamentally different things in a conversation.

Groven therefore treats the question as a **modifier flag** on any card type, not as a type of its own. A question-claim ("Is this really true?"), a question-evidence ("Has anyone verified this source?"), and a question-proposal ("What if we tried X instead?") are all structurally different from their assertive counterparts. Question cards display a **?** marker and signal unresolved threads that need attention.

## 2.3 A link model, not a lineage model

Cards can link to multiple other cards. This is a crucial break from tree-based systems. Possible link relations include:

- **builds on** — extends the parent's direction
- **questions** — requests clarification or justification
- **contradicts** — identifies a conflict and proposes a divergent direction
- **reframes** — interprets the same idea from a different angle
- **supports** — adds evidence or testimony in favour
- **evidences** — provides verifiable backing
- **amends** — modifies a specific proposal
- **answers** — resolves a question
- **spins off** — starts a new thread from an existing point
- **implements** — describes how a decision will be carried out

No single relation is treated as metaphysically final. A card may simultaneously answer one question, challenge another claim, and provide evidence for a third position. This is closer to how collective reasoning actually works.

The visible map is therefore not a family tree but a **civic weave**.

## 2.4 Multiple readings instead of a single contested badge

When interpretation of a card's function differs, the system does not default to a conflict label. Instead, a card can show **multiple readings**:

> Author reading: reframing · AI reading: contradiction · Steward reading: open question

These readings remain inspectable, but the UI does not force them into a single public stigma signal. The point is transparency without performative escalation.

### Rethinking on override

When the author disagrees with the AI's proposed classification, the AI does not simply accept the correction. It generates a new explanation arguing why the author's reading is reasonable — and reconsiders related classifications (such as whether the card is a question). This creates a **record of interpretive ambiguity** that is more informative than either a silent override or a binary "contested" flag.

This mechanism serves two purposes: it documents why classification was uncertain (useful for later review), and it tests whether the AI can genuinely argue for a position it didn't initially propose (a concrete measure of epistemic humility).

## 2.5 AI as cartographer, not classifier-in-chief

The AI layer in Groven is deliberately narrower and plural in its outputs.

**The AI may:**
- Suggest a card's function and link relations, with a brief explanation
- Detect whether a contribution is a question (requesting, not providing)
- Generate a title and lineage description from the body text alone — inverting the traditional authoring burden so the participant writes only their contribution and the AI proposes the structural metadata
- Identify clusters of cards that concern the same matter
- Draft more than one summary of a discussion, from different perspectives
- Detect that a support question may actually hide a governance issue
- Suggest synthesis opportunities — concrete proposals connecting divergent threads
- Generate a one-sentence **proposal summary** distilling a synthesis into a votable statement
- Suggest that a proposal is missing an implementation note, a source bundle, or a counterargument

**The AI may not:**
- Hide content or deprioritise contributions
- Assign final public meaning to a contribution
- Decide whether a matter enters governance
- Write the authoritative ballot alone
- Rank people or contributions by value

The AI does not say "this is what the discussion is." It says: "here are plausible readings; humans decide what counts."

### The inverted authoring burden

The prototype demonstrated a significant UX finding: the most effective contribution flow is one where the **author writes only the body text** and the AI proposes everything else — function, title, link relations, question flag, lineage description, and explanation. The author's role becomes editorial review rather than structural annotation.

This reduces friction dramatically. But it also shifts responsibility: the author must engage critically with the AI's proposals rather than constructing the structure themselves. Whether this produces better or worse metadata than author-written annotations is an open empirical question — and one of the central things the platform exists to test.

### Progressive streaming

AI analysis streams to the author via Server-Sent Events, ordered by cognitive priority: the function classification arrives first (what the author must engage with), and the review interface opens immediately. Title, lineage, and explanation fill in as they arrive. The author is never waiting on a blank screen. The streaming order matches the decision sequence — classification first, then secondary metadata.

### Two-model architecture

Different AI tasks require different capabilities. Groven uses:
- A **fast model** for classification, title generation, lineage descriptions, and proposal summaries — tasks requiring comprehension but not deep reasoning
- A **reasoning model** for synthesis suggestion — a task requiring structural analysis of the full discussion and identification of non-obvious connections between threads

This task-appropriate model selection is a concrete architectural finding from the prototype.

### Ephemeral suggestions

AI-generated synthesis suggestions are not stored in the discussion. They are generated on demand and exist only until the participant accepts or dismisses them. Only when a human accepts a suggestion and submits it does a card enter the graph. This prevents the AI from accumulating structural weight in the discussion without human action.

## 2.6 Human facilitation is a first-class function

Groven does not pretend that structure can replace moderation. Every space has visible **stewards**. Their role is not to control outcomes, but to maintain the conditions of exchange:

- Reminding participants of norms
- De-escalating interpersonal conflict
- Moving threads to more appropriate rooms
- Helping formulate governable questions
- Ensuring that minority concerns are not procedurally erased
- Adding steward readings to cards where interpretation matters
- Documenting moderation actions and appeal paths

Governance tools fail when they treat social care as an optional add-on. In Groven, facilitation is part of the architecture.

---

# 3. Participation Modes

## 3.1 Ask Desk

The Ask Desk is where support, practical questions, and requests for help begin. Possible outcomes include:

- Answered
- Resource bundle created
- Needs expert input
- Escalate to policy matter
- Spin off new table

A question does not need to become a vote in order to matter. But if repeated support questions reveal a structural issue, the system can elevate them into a governance track.

## 3.2 Commons Tables

Commons Tables are semi-structured discussion spaces around a concrete matter. They are suitable for:

- Interpretation and sensemaking
- Policy discussion
- Design exploration
- Conflict clarification
- Gathering testimonies and sources
- Working through trade-offs

A table may remain open-ended, become archived as a useful conversation, or move onward into proposal-making.

## 3.3 Matter Rooms

A matter enters a formal governance path only when at least one of the following conditions is met:

- It concerns a constitutional, legal, budgetary, or rights-relevant issue
- A threshold of participants requests formal treatment
- Stewards identify it as repeatedly unresolved and high-stakes
- A jury or delegated body calls it in for structured handling

This is a core principle: **not every topic that can be decided should automatically become a decision item.**

## 3.4 Proposal Lab

Once a matter is formally opened, it enters the Proposal Lab. Here, the question is framed explicitly:

- What exactly is being decided?
- What is outside scope?
- Who decides, by which rule, by when?
- What happens if no option wins?
- Who implements the result?
- When will it be reviewed?

Each proposal in the lab must include:

- A sponsor
- A short plain-language statement
- The strongest known objection
- A source bundle or rationale bundle
- An implementation sketch
- Expected consequences and trade-offs

The AI may help edit, compare, summarise, or generate one-sentence **proposal summaries** (distilling a proposal into a concrete, votable statement). But humans must publish the ballot options.

## 3.5 Assembly and Resolution

Only after the framing phase does a matter move to Assembly. The Assembly is where the vote, consent round, ranking, or jury decision actually occurs.

Once resolved, the outcome is recorded in the Library together with:

- The final wording
- The method used
- Turnout and quorum result
- Majority and minority notes
- Implementation responsibility
- Review date
- Reopening conditions

A decision is not just an endpoint. It is a promise with memory.

---

# 4. Voting and Temperature

## 4.1 Two tiers of voting

The prototype revealed a distinction the original concept did not anticipate: communities need two fundamentally different kinds of voting.

### Tier 1 — Temperature voting (informal)

Any card that contains a proposal, synthesis, or actionable suggestion can receive **temperature votes**: Support or Oppose, each with a one-sentence justification. Temperature voting is:

- Per-card, not per-space
- Open to all participants
- No quorum, no finality
- A signal, not a decision

Temperature votes answer the question: *Is this worth pursuing further?* A synthesis with 8 Supports and 1 Oppose is a different signal than one with 3 Supports and 5 Opposes — and both are useful information *before* anyone declares the topic ready for formal governance.

In the graph, cards with temperature votes display a **vote arc gauge** — a ring that fills proportionally as votes arrive. Green arcs represent support, red arcs represent opposition, and the unfilled portion indicates how many more voices are needed for a representative picture. This communicates two signals simultaneously: the balance of opinion *and* whether enough people have weighed in.

### Tier 2 — Governance voting (formal)

Formal governance voting occurs only in the Assembly, only on matters that have passed through the Proposal Lab, and only with an explicitly declared decision body and decision rule. It is:

- Per-matter, not per-card
- Restricted to the declared decision body
- Subject to quorum and method rules
- Final (until reopened under stated conditions)

The result — including the full vote breakdown and a required written justification — is permanently anchored as an immutable decision note in the Library, directly linked to the cards it resolved.

## 4.2 Decision bodies are explicit

Groven supports more than one legitimate decision body. The system does not smuggle authority into workflow:

- All participants in a space
- A jury selected by sortition
- A delegated circle for operational matters
- A hybrid model (jury prepares, community ratifies)

The decision body is stated at the beginning of the formal process, not inferred at the end.

## 4.3 Decision classes determine decision rules

Different matters use different rules:

| Class | Method |
|---|---|
| Advisory | Approval voting or simple majority |
| Operational | Delegated-circle decision, modest quorum |
| Policy | Absolute majority with quorum |
| Constitutional | Supermajority + higher quorum, or jury + ratification |

The platform does not pretend one rule fits all. It requires each matter to declare its rule in advance.

## 4.4 Proposal formation is plural by default

The default assumption is not binary support/oppose. If there is one concrete motion, support/oppose may be appropriate. If there are multiple plausible options, the default should be approval voting or ranked choice, depending on the matter.

Where possible, proposals should be drafted in parallel rather than collapsing prematurely into a single synthesised option. Synthesis is one tool among others; it is not the only path to decision quality.

## 4.5 Non-decision is also a legitimate outcome

A formal matter may end in:

- An adopted proposal
- A rejected proposal
- A request for more evidence
- A time-bounded experiment
- A delegated revision
- No decision — the issue remains open

This matters because communities often damage themselves by forcing false closure.

## 4.6 Review and reopening

Every formal resolution carries a review date or explicit reopening trigger:

- Implementation failure
- Major new evidence
- Changed external conditions
- A threshold of objections after enactment
- Constitutional conflict

A governance system without reopening logic turns decisions into dead objects. A governance system with unlimited reopening turns them into noise. Groven seeks the middle.

---

# 5. Evidence and Source Visibility

## 5.1 Sources and grounds

Groven separates claims from evidence. Participants can attach **source bundles** visibly to claims and proposals. These may include:

- Primary documents and legal texts
- Research and data
- External links
- Firsthand testimony
- Organisational memory

Not every valid contribution needs a formal source. Experience and situated knowledge remain legitimate. But where a claim relies on verifiable evidence, that evidence should be inspectable directly from the discussion.

The interface therefore includes a visible **Sources / Grounds** drawer on relevant cards and proposals. This makes source use socially legible without reducing every conversation to fact-check theatre.

---

# 6. Moderation, Safety, and Privacy

## 6.1 Community norms and intervention paths

Every space includes:

- A public code of conduct
- Steward roles
- Flagging pathways
- Documented moderation actions
- An appeal mechanism for serious interventions

AI may privately flag likely norm violations to stewards, but it does not auto-hide content.

## 6.2 Privacy by design

The platform is designed for sensitive collective processes and therefore follows strict privacy principles:

- Self-hosting by default
- Space-level control over which model provider is used
- Local-model option where required
- Redaction and minimisation before external model calls
- Retention schedules for AI-generated metadata
- Clear separation between public contributions, steward notes, and private deliberation spaces
- Export and deletion rights for participants, subject to governance-record exceptions defined in advance

## 6.3 Governance over data use

Communities must be able to decide:

- Whether AI assistance is enabled in a given room
- Whether external API providers are allowed
- Which data may be stored for audit
- Which spaces require no-model handling at all

Privacy is not merely a compliance layer. It is part of procedural legitimacy.

---

# 7. Technical Architecture

## 7.1 Design principles

- **Open source from day one.** All core components released under MIT or Apache 2.0 license.
- **Self-hostable.** Any organisation can run a Groven instance on their own infrastructure.
- **API-first.** Every function is accessible via a documented API. External tools integrate through the API, not through direct database access.
- **Modular AI.** The AI layer is independently configurable. A minimal Groven installation is a structured text discussion tool. AI features are activated per room.
- **Archival integrity.** Decision notes are cryptographically signed at creation. The integrity of the governance record is verifiable independently of the platform operator.

## 7.2 Core data model

The data model is graph-based, not tree-based. Core entities include:

| Entity | Key fields |
|---|---|
| **Card** | id, room_id, author_id, card_type, is_question, body, title, lineage_desc, created_at |
| **Link** | source_card_id, target_card_id, relation_type |
| **Reading** | card_id, reader (author \| ai \| steward), proposed_type, explanation, created_at |
| **Room** | id, space_id, room_type (plaza \| table \| proposal_lab \| assembly \| library), status |
| **Space** | id, title, description, access_level, ai_enabled |
| **Proposal** | card_id, proposal_summary, sponsor_id, decision_class, decision_rule |
| **TemperatureVote** | card_id, voter_id, position (support \| oppose), justification |
| **Ballot** | proposal_id, decision_body_type, method, quorum, status |
| **Decision** | ballot_id, result, majority_note, minority_note, implementation_owner, review_date, reopening_conditions |
| **SourceBundle** | id, card_id, sources (links, documents, testimony references) |
| **StewardAction** | steward_id, action_type, target_card_id, reason, created_at |
| **AIReading** | card_id, model_used, proposed_type, is_question, explanation, rethink_explanation, created_at |
| **ReviewEvent** | decision_id, trigger, outcome, created_at |

This allows one card to participate in several conversations without duplication and allows several interpretations to coexist.

## 7.3 AI architecture

AI processing is asynchronous and non-blocking. It runs after a card is saved — it does not delay the user experience and cannot prevent a contribution from being published.

**Contribution flow:**
1. Author writes body text only
2. Analysis streams via SSE, ordered by cognitive priority: classification first, then title, lineage, and explanation
3. Review interface opens as soon as classification arrives (~1–2 seconds). Title and lineage fill in progressively with visual loading indicators
4. Author reviews — can edit title and lineage, confirm or override function, toggle question flag
5. On override, the AI rethinks and explains why the author's reading is reasonable
6. Card is published with all readings preserved

**Model selection:**
- Fast model for classification, titles, lineage descriptions, proposal summaries, question detection
- Reasoning model for synthesis suggestions and discussion-level analysis

**Safeguards:**
- Every AI output is labelled as assistive and remains reversible
- Synthesis suggestions are ephemeral — generated on demand, not stored until a human accepts
- AI readings are always shown alongside author and steward readings, never as the sole interpretation

## 7.4 Content types

Groven supports multiple content types for cards:

- Text (Markdown) — the default and always supported
- Images and drawings — for visual ideas, sketches, diagrams
- Video — for demonstrations, performances, presentations
- Audio — for voice notes, musical ideas
- Links with preview — for referencing external sources

The AI operates on text content and metadata. For non-text cards, the author's written description (required) is the primary input for classification.

## 7.5 Technology stack (recommendation)

The following is a recommended starting stack for the open source implementation:

- **Backend:** Node.js (TypeScript) with PostgreSQL. Graph queries use PostgreSQL's recursive CTE capability.
- **Frontend:** React (TypeScript) with a modular component architecture. Graph visualisation uses D3.js.
- **API:** REST for standard CRUD operations. SSE for real-time streaming of AI analysis and card notifications.
- **LLM:** Configurable per deployment with an adapter interface. Fast model + reasoning model as default architecture.
- **Auth:** OAuth2 / OIDC for SSO integration. Local auth for standalone deployments.
- **Hosting:** Docker Compose for self-hosted deployments. Managed hosting option under evaluation.

A behavioral prototype (Python/Flask, SQLite, vanilla JS) exists and is deployed at groven.pythonanywhere.com. It validates the core contribution flow, AI classification, synthesis suggestions, and temperature voting. The production stack is a separate implementation informed by prototype learnings.

---

# 8. Differentiation from Existing Tools

| Feature | Kialo / Pol.is | Loomio / Decidim | Groven |
|---|---|---|---|
| Multiple participation rooms | No — single thread or tree | Partial — threads + decisions | Yes — Plaza, Tables, Proposal Lab, Assembly, Library |
| Card types beyond argument | No — Pro/Con only | No | Yes — 10 types including Experience, Evidence, Request, Offer |
| Multi-link graph (not tree) | No — strict tree | No — flat thread | Yes — cards link to multiple cards via typed relations |
| AI-assisted classification | No | No | Yes — visible, explainable, overridable, with rethinking |
| Multiple readings per card | No | No | Yes — author, AI, steward readings coexist |
| Progressive streaming UX | No | No | Yes — classification first, secondary metadata follows |
| Temperature voting (informal) | No | No | Yes — per-card Support/Oppose with justification |
| Formal governance voting | No | Yes (separate from discussion) | Yes — integrated, with explicit decision bodies and rules |
| Decision anchored in discussion | No | No | Yes — immutable decision note in the Library |
| Source bundles on claims | No | No | Yes — visible Sources/Grounds drawer |
| Human facilitation as architecture | No | Partial | Yes — steward roles, moderation actions, appeal paths |
| Self-hostable open source | No (proprietary) | Yes (Loomio), Partial (Decidim) | Yes — core commitment |
| Minority position recording | No | Partial | Yes — required for all formal decisions |
| AI synthesis suggestions | No | No | Yes — ephemeral, human-gated |

The most significant differentiation is not any individual feature — it is the combination. Groven is the only tool where the reasoning path from initial question to governance decision is fully preserved in a single navigable structure, across multiple participation modes, with AI assistance and human override throughout.

---

# 9. The CORPUS Implementation: Sortition Jury

In the CORPUS context, Groven's governance module supports a Sortition Jury — a decision body selected by stratified lottery from the contributor base, stratified by region, genre cluster, catalog size, and time of entry.

| Step | Process |
|---|---|
| 1. Jury Formation | Jury members are selected by sortition and automatically receive steward-level access to relevant spaces. Their term is time-limited. |
| 2. Observation | Jury members observe live discussions. The AI signals threads of particular deliberative richness — where ideas have demonstrably grown — to jury attention. |
| 3. Readiness Declaration | When the jury determines a matter is ready, they declare it. This triggers the AI summary and closes the table to new cards. |
| 4. Proposal Lab | Proposals are drafted and refined. The AI generates proposal summaries and completeness checks. Temperature voting provides informal signal. |
| 5. Assembly | The jury deliberates in a separate, protected space — visible in structure but not open for outside contribution. The process is documented. |
| 6. Vote and Justification | The jury votes. The decision, breakdown, and written justification are anchored in the Library. Minority positions are recorded. |
| 7. Archive | The full thread — from original question through all cards to the decision note — becomes part of the permanent governance record. |

---

# 10. Open Source Strategy

## 10.1 Why open source

Groven addresses a problem that affects any community that needs to move from open discussion to informed collective decision. Building Groven as a proprietary tool would limit both its reach and its credibility. A governance platform for communities requires the trust that comes from transparency. The source code being readable, auditable, and forkable is not incidental — it is part of what makes the governance process trustworthy.

## 10.2 License

Proposed: MIT License for the core Groven platform. This maximises reuse, including commercial use, which encourages adoption. Optional: a Commons Clause addition for the managed hosting service, to prevent direct commercial competitors from re-selling the hosted service without contributing back.

## 10.3 Governance of the project itself

Groven cannot credibly serve as a governance tool if its own governance is opaque. The project will be governed using Groven itself from the first public release:

- Roadmap decisions made through public Groven discussions
- Core maintainer team initially from Sofilab, expanded by contribution history
- RFC process for significant architectural changes — using Groven's own rooms natively
- Voting on breaking changes using Groven's own governance module

---

# 11. Pilot and Research Design

## 11.1 A/B governance testing

In a pilot, comparable matters can be routed through different decision bodies: some decided by the full participant body, some decided by a sortition jury, and some prepared by a jury and ratified by all. This makes it possible to study not only decision outcomes, but also perceived legitimacy.

## 11.2 What the pilot should measure

- Participation diversity across rooms
- Discussion depth (card chains, link density)
- Number of matters that find non-voting closure
- Minority satisfaction after decision
- Acceptance of outcomes after two weeks and after two months
- Frequency of reopened decisions
- Steward intervention load
- Effect of AI summaries on proposal convergence
- Whether support threads (Ask Desk) generate governance questions over time
- Author override rate on AI classifications — and whether overrides cluster on specific card types
- Quality of AI-generated vs. author-written titles and lineage descriptions
- Whether temperature voting predicts formal governance outcomes

The point of the pilot is not only to test a product. It is to learn what kind of public structure helps a community think together.

---

# 12. Open Questions

The following questions are not resolved in this paper. They are the empirical questions that the development process — and especially the CORPUS pilot — must answer.

### On human behaviour
- Do people behave differently in a multi-room civic environment than in a flat thread? This is the foundational empirical question.
- Will authors engage critically with AI-proposed classifications — or rubber-stamp them?
- Does the inverted authoring burden (AI proposes structure, author reviews) produce better or worse metadata than traditional author-written annotations?
- How much structure do participants accept before the space feels procedural rather than generative?

### On rooms and movement
- When do matters naturally move from Plaza to Table to Proposal Lab? Can this be facilitated without forcing it?
- Which matters should remain in open tables and never enter formal governance?
- How often do support questions (Ask Desk) become governance matters in practice?

### On AI
- How reliable is classification across languages, domains, and communication styles?
- When do multiple readings enrich a discussion and when do they confuse it?
- Does the rethinking mechanism (AI argues for the author's reading) genuinely improve the record, or does it produce formulaic responses?
- Does progressive streaming change author behaviour — do they engage more carefully with classification when it arrives first?

### On governance
- Who has the authority to declare a matter ready? How is that authority granted and revoked?
- Does temperature voting help communities converge — or does it create premature consensus pressure?
- What prevents the AI summary from becoming de facto authoritative, shaping the vote outcome beyond its intended role?
- How does Groven handle governance disputes about the governance process itself?

### On the open source community
- Will an active contributor community emerge around a tool this specific?
- How do we prevent the RFC process from being captured by technically sophisticated contributors at the expense of non-technical community members?

These are not implementation bugs. They are the political questions the platform exists to make visible.

---

# 13. Name and Identity

The name Groven is chosen deliberately. A grove is a small forest — bounded, navigable, gemeinschaftlich. It is not a jungle and not a single tree. It implies organic growth, multiple roots, shared canopy. It is not technical jargon. It is accessible in all major languages.

| Positioning statement |
|---|
| Groven is where structured thinking becomes collective action. |
| It is a communication platform for communities that need to move from open discussion to informed decision — without losing the reasoning that got them there. |
| Groven makes the growth of ideas visible. It respects minority positions. It creates governance records that can be read and trusted in five years. |
| It is open source, self-hostable, and governed by the same tool it provides. |

---

*Groven — Open Source Initiative · Initiated by Sofilab GmbH, Munich · March 2026*

*This document is itself a Seed. Fork it.*
