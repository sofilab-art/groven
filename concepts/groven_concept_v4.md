
GROVEN
A Typed Idea Graph for Collaborative Thinking and Collective Governance



Concept Paper  |  Open Source Initiative  |  March 2026

Initiated by Sofilab GmbH, Munich — in the context of the CORPUS Royalty Protocol

| Abstract |
|---|
| Groven is an open source platform for structured collaborative communication. It combines a Git-inspired Seed→Branch→Forest model for idea development with an LLM-powered structuring assistant that classifies the semantic relationship between contributions — visibly, explainably, and with human override. |
| Unlike existing argument-mapping tools (Kialo, Pol.is) or decision platforms (Loomio, Decidim), Groven integrates discussion, idea typology, and governance voting in a single coherent system. The LLM does not steer or moderate — it makes structure visible so that humans can navigate, synthesise, and decide. |
| Groven is initiated as part of the CORPUS Royalty Protocol governance infrastructure but is designed as a general-purpose tool, independent of any specific domain. Its architecture makes it suitable for any community that needs to move from open discussion to informed collective decision. |


# 1. Context and Motivation

## 1.1 The Problem with Existing Communication Platforms
Existing platforms treat all contributions as equal. A comment that sharpens an idea looks identical to one that contradicts it — and both look like a comment that misses the point entirely. The platform does not distinguish. The reader must figure it out themselves.
This creates three compounding problems:
- Loss of structure at scale. At small group sizes, participants can track the evolution of an argument. Beyond a few dozen contributions, this becomes impossible without external scaffolding.
- Loss of memory over time. A forum thread from six months ago is unreadable as a document. The reasoning that led to a decision is irrecoverable. This is not a minor inconvenience — for governance processes, it is a fundamental failure of accountability.
- Engagement over connection. Existing social platforms optimise for interaction volume. This rewards loudness, not depth. The most important contributions — careful elaborations, minority positions, syntheses — are structurally disadvantaged against quick reactions.

## 1.2 The Gap in the Existing Landscape
The field of deliberative technology is active and well-researched. Argument-mapping tools (Kialo, AGORA-net, LiteMap), consensus platforms (Pol.is), and decision tools (Loomio, Decidim) each address parts of the problem. Academic research in Computer-Supported Cooperative Work (CSCW) has produced robust theoretical foundations.
However, a systematic gap remains. A 2021 study explicitly found that existing systems, including Kialo, have insufficient functionality for the synthesis of arguments. Kialo has simplified its argument structure to the point of offering only two types (Pro/Con), with minimal flexibility. And critically: no existing production tool combines idea typology, LLM-assisted structure recognition, and governance voting in a single coherent system with full human override.
Groven is built to close this gap.

## 1.3 The CORPUS Context
Groven is initiated within the governance design of the CORPUS Royalty Protocol — an open licensing and royalty infrastructure for music in the age of AI, developed by Sofilab GmbH in Munich, co-funded by the European Union (Creative Europe). CORPUS requires a governance platform that can:
- Support deliberation among a small, curated contributor community (initially < 50 persons, selected by stratified sortition)
- Make the reasoning behind governance decisions permanently legible — not just the outcome, but the path
- Connect community discussion to formal voting without losing the context in which the vote arose
- Scale to larger communities without losing the quality of structured deliberation
CORPUS will use Groven as its governance layer. But Groven itself is domain-agnostic and open source. The CORPUS implementation is one application of a general tool.

# 2. Core Concept

## 2.1 The Fundamental Insight
Connection between people arises when a shared idea is picked up by others, extended, and developed further — and something emerges that exceeds the individual contributions. This is not measurable with behavioural metrics (clicks, reactions, time-on-site). But it is structurally recognisable: it is a pattern in chains of argumentation, not in interaction data.
Groven is built on this insight. Its architecture does not optimise for engagement. It makes the growth of ideas visible — and creates the structural conditions for that growth to happen.

## 2.2 Seed → Branch → Forest
Inspired by Git's version control model, Groven organises all content around a single structural metaphor:

| 🌱 | Seed | A contribution that introduces an idea, question, or position. Seeds are the starting points of every thread. They can be planted by anyone with access to the space. A Seed has no parent — it is a root node in the graph A Seed is always text — optionally combined with images, drawings, video, or links |
|---|---|---|
| 🌿 | Branch | A contribution that explicitly builds on an existing Seed or Branch. A Branch has exactly one parent and inherits its lineage. It is not a reply — it is a continuation. Every Branch requires a brief description: what does this contribution build on, and where does it take the argument? This is a minimal but firm requirement — it prevents hollow reactions and keeps the graph navigable The LLM proposes a Branch type (see 2.3) — the author confirms or corrects A Branch can be re-planted as a new Seed, starting a fresh tree |
| 🌳 | Forest | The growing network of all Seeds and Branches in a Groven space. The Forest is the living memory of the community — searchable, filterable, and permanently archived. Visualised as an interactive tree or graph Filterable by type, author, date, topic, status Governance decisions are anchored in the Forest as immutable nodes |


## 2.3 Why Engagement Metrics Fail — and What to Use Instead
The dominant design pattern of online platforms — likes, view counts, algorithmic feeds, trending topics — is built around a single observable variable: engagement. Engagement is easy to measure, easy to optimise for, and reliably produces one outcome: more engagement. The problem is that high engagement and high quality of deliberation are not the same thing. They are often in direct conflict.
A provocation generates more engagement than a careful elaboration. A short emotional reaction outperforms a nuanced synthesis. A popular idea accumulates more visibility than a minority position that happens to be correct. The platforms are not broken — they are working exactly as designed. But the design goal is incompatible with the goal of a governance process, which is informed collective decision-making, not maximised interaction volume.
What a governance process actually needs to track is not engagement, but the semantic development of arguments — whether ideas are being built upon, sharpened, challenged, or synthesised. This is structurally invisible in a flat thread. It requires a different kind of observation.
This is where a large language model becomes relevant — not as a moderator or a recommender, but as a semantic observer. An LLM can read two contributions side by side and recognise whether the second one sharpens the first, contradicts it, or extends it in a new direction. This is a task of textual comprehension, not prediction. And crucially, it can explain its reasoning in plain language, making the observation transparent and contestable.
Groven uses this capability to build a typed graph of ideas — where every Branch carries a semantic classification that describes its relationship to its parent. The LLM proposes the type; the author confirms or corrects it. The result is a discussion that is not only navigable but legible: a decision-making body can see at a glance where an argument has been sharpened, where it has forked, and where a synthesis is waiting to be made.
## 2.4 Branch Typology
The key innovation of Groven is that Branches are not all the same. The LLM reads Seed and Branch together and proposes a semantic classification. This makes the structure of a discussion legible at a glance.

| Type | What it means | Example |
|---|---|---|
| Clarification | Takes a vague or ambiguous idea and makes it more precise. Does not add new content — sharpens what is already there. | 'You probably mean X, not Y — here is why the distinction matters.' |
| Extension | Carries the idea into territory the Seed did not anticipate. Adds something genuinely new while remaining faithful to the original direction. | 'This also applies to context Z, which the Seed did not consider.' |
| Reframing | Interprets the same idea from a fundamentally different angle. Does not contradict — but arrives at a different conclusion from the same starting point. | 'If we frame this differently, the same observation leads somewhere else.' |
| Contradiction (Fork) | Identifies a conflict and proposes a divergent direction. The Fork is the most structurally important type — it is where genuine disagreement becomes visible. | 'This premise seems wrong — here is an alternative direction.' |
| Synthesis | Connects two or more existing Branches that have developed separately. Attempts to reconcile or integrate divergent lines of thought. | 'Branch A and Branch C are not mutually exclusive — together they imply X.' |


| The 'Contested' Signal |
|---|
| When the LLM proposes a type and the author selects a different one, Groven generates a visible 'Contested' signal on that node. |
| This signal is not a warning — it is information. It marks the places where classification itself is uncertain, and where the community's emerging norms around what counts as a 'contradiction' versus a 'reframing' are still being formed. |
| These are exactly the nodes most worth examining in governance discussions. |


## 2.5 The LLM as Visible Structuring Assistant
The LLM's role in Groven is precisely bounded. It is not a moderator, a filter, or a guide. It is a structuring assistant — visible, explainable, and always subject to human override.

| What the LLM does  Reads every new Branch together with its parent and proposes a type Provides a brief explanation of its classification ('This Branch is proposed as Extension because...') Generates structured summaries of discussion threads on request Signals to moderators and governance bodies where ideas have grown collectively Identifies threads where Synthesis may be possible |  | What the LLM does not do  Steer conversations toward any particular outcome Hide, suppress, or deprioritise any contribution Make decisions about when a topic is ready for a vote Evaluate the quality or correctness of ideas Act without human review or override |
|---|---|---|


This design reflects a fundamental principle: the classification of a contribution is itself a substantive statement. If a Contradiction is classified as a Clarification, it is structurally made invisible. That is power — and power without accountability must not be delegated to a model. The author decides. The LLM proposes.

# 3. Governance Module

## 3.1 The Voting Module as Integrated State Transition
The voting capability in Groven is not a separate tool. It is a state transition within the same system — a natural conclusion to a discussion that began as a Seed and grew through Branches.
A topic in Groven moves through three states:

| 1 | Open | Discussion is active. Seeds are planted, Branches grow, and each Branch is semantically classified. Anyone with access to the space can contribute. |
|---|---|---|
| 2 | Ready | A designated body (e.g., a sortition jury) declares the topic ready for decision. The LLM generates a structured summary: which positions exist, which syntheses were attempted, which Forks remain open. The discussion is closed for new Branches. The declaration of readiness is a human decision — not algorithmic The LLM summary is a tool for the decision body, not a recommendation |
| 3 | Decided | The vote is complete. The result — including the full vote breakdown and a required written justification — is permanently anchored as an immutable node in the Forest, directly linked to the Branches it resolved. The decision node is not editable It is permanently linkable and citable Minority positions are recorded alongside the majority decision |


## 3.2 Why Integration Matters
A separate voting tool breaks the chain of accountability. If discussion happens in Groven and voting happens elsewhere, the reasoning behind a decision becomes irrecoverable. Which Branch did the majority find persuasive? Which Fork did the vote effectively resolve? These questions are unanswerable without the connection.
With the voting module integrated, the decision node sits directly in the graph — visible in the lineage of every Branch it touched. In six months, any community member can trace exactly how a governance decision emerged from the initial Seeds.
This is not just good design. It is the structural basis for trust in a governance process.

## 3.3 The CORPUS Implementation: Sortition Jury
In the CORPUS context, Groven’s governance module supports a Sortition Jury — a decision body selected by stratified lottery from the contributor base, stratified by region, genre cluster, catalog size, and time of entry.

| 1 | Jury Formation | Jury members are selected by sortition and automatically receive moderator-level access to relevant Groven spaces. Their term is time-limited. |
|---|---|---|
| 2 | Observation | Jury members observe live discussions in the Groven. The LLM signals threads of particular deliberative richness — where ideas have demonstrably grown — to jury attention. |
| 3 | Readiness Declaration | When the jury determines a topic is ready, they declare it. This triggers the LLM summary and closes the discussion to new Branches. |
| 4 | Deliberation | The jury deliberates in a separate, protected Groven space — visible in structure but not open for outside contribution. The process is documented. |
| 5 | Vote and Justification | The jury votes. The decision, breakdown, and written justification are anchored in the public Forest. Minority positions are recorded. |
| 6 | Archive | The full thread — from original Seed through all Branches to the decision node — becomes part of the permanent governance record. |


# 4. Technical Architecture

## 4.1 Design Principles
- Open source from day one. All core components released under MIT or Apache 2.0 license.
- Self-hostable. Any organisation can run a Groven instance on their own infrastructure. No mandatory cloud dependency.
- API-first. Every Groven function is accessible via a documented REST/GraphQL API. External tools (including CORPUS) integrate through the API, not through direct database access.
- Modular. The voting module, the LLM assistant, and the media handling layer are each independently deployable. A minimal Groven installation is a structured text discussion tool. Features are added by activating modules.
- Archival integrity. Decision nodes are cryptographically signed at creation. The integrity of the governance record is verifiable independently of the platform operator.

## 4.2 Data Model
The core data model is deliberately simple. Complexity lives in the application layer, not the data layer.

| Entity | Type | Key Fields |
|---|---|---|
| Node | Seed, Branch, or Decision | id, space_id, author_id, parent_id (null=Seed), type, content_type, content_url, branch_type, branch_type_source (llm|author|contested), status (open|ready|decided), created_at |
| Lineage | Graph relationship | ancestor_id, descendant_id, depth — enables fast full-tree queries without recursion |
| LLM_Signal | Backend observation | node_id, signal_type (growth|synthesis_opportunity|contested), summary, confidence, created_at, reviewed_by |
| Vote | Decision record | decision_node_id, voter_id, position, justification, created_at — immutable after creation |
| Space | Governance container | id, name, access_level (open|restricted|constitutional), voting_module_enabled, org_id |
| Notification | Event trigger | recipient_id, type, reference_node_id, read_at |


## 4.3 LLM Integration
The LLM integration is asynchronous and non-blocking. It runs after a Branch is saved — it does not delay the user experience and cannot prevent a contribution from being published.
- Trigger: every new Branch creation (async queue)
- Input: full text of parent Node + new Branch + space context
- Output: structured JSON — proposed type, confidence score, brief explanation (max 2 sentences)
- Model: configurable per deployment. Default: Claude API (claude-sonnet-4-6). Self-hosted deployments may use local models.
- Transparency: the LLM explanation is always shown to the author alongside the proposed type. It is never hidden.
- Override: the author can change the proposed type at any time. The original LLM proposal is stored alongside the author's decision for research and audit purposes.

## 4.4 Content Types
Groven supports multiple content types for Seeds and Branches, enabling use cases from text-only governance discussions to rich multimedia idea spaces:
- Text (Markdown) — the default and always supported
- Images and drawings — for visual ideas, sketches, diagrams
- Video — for demonstrations, performances, presentations
- Audio — for voice notes, musical ideas (enabling the Soundbook integration)
- Links with preview — for referencing external sources
The LLM assistant operates on text content and metadata. For non-text Branches, the author's written description (required) is the primary input for type classification.

## 4.5 Technology Stack (Recommendation)
The following is a recommended starting stack for the open source implementation. It prioritises developer accessibility, self-hostability, and long-term maintainability over novelty.
- Backend: Node.js (TypeScript) with PostgreSQL. The lineage table uses PostgreSQL's recursive CTE capability for efficient tree queries without a dedicated graph database.
- Frontend: React (TypeScript) with a modular component architecture. The graph visualisation uses D3.js.
- API: REST for standard CRUD operations, WebSocket for real-time Branch notifications.
- LLM: Anthropic API as default, with an adapter interface allowing substitution of any compatible model.
- Auth: OAuth2 / OIDC for SSO integration (CORPUS and other platforms). Local auth for standalone deployments.
- Hosting: Docker Compose configuration for self-hosted deployments. Managed hosting option under evaluation.

# 5. Differentiation from Existing Tools


| Feature | Kialo / Pol.is | Loomio / Decidim | Groven |
|---|---|---|---|
| Structured idea lineage (Git model) | No — flat thread or simple tree | No — flat thread | Yes — full ancestor/descendant graph |
| Branch typology (semantic classification) | Partial — Pro/Con only | No | Yes — 5 types + Contested signal |
| LLM structuring assistant | No | No (some AI features, not structural) | Yes — visible, explainable, overridable |
| Integrated voting | No | Yes (separate from discussion) | Yes — state transition within graph |
| Decision anchored in discussion graph | No | No | Yes — immutable node in lineage |
| Self-hostable open source | No (proprietary) | Yes (Loomio), Partial (Decidim) | Yes — core commitment |
| Minority position recording | No | Partial | Yes — required for all decisions |
| Audio/video content support | No | No | Yes — modular |
| Synthesis operator | No | No | Yes — dedicated Branch type |


The most significant differentiation is not any individual feature — it is the combination. Groven is the only tool where the reasoning path from initial idea to governance decision is fully preserved in a single navigable structure, with semantic typing, LLM assistance, and human override throughout.

# 6. Open Source Strategy

## 6.1 Why Open Source
Groven addresses a problem that affects any community that needs to move from open discussion to informed collective decision. That community is not limited to music rights or AI licensing. It includes cooperatives, city governments, research institutions, DAOs, academic departments, and activist organisations.
Building Groven as a proprietary tool would limit both its reach and its credibility. A governance platform for communities requires the trust that comes from transparency. The source code being readable, auditable, and forkable is not incidental — it is part of what makes the governance process trustworthy.
Additionally, an active open source community will accelerate development, identify edge cases, and build integrations that the founding team could not anticipate.

## 6.2 License
Proposed: MIT License for the core Groven platform. This maximises reuse, including commercial use, which encourages adoption. Any organisation can build a hosted service on Groven without licensing obligations to the project — but the source remains open.
Optional: a Commons Clause addition for the managed hosting service, if Sofilab operates one, to prevent direct commercial competitors from simply re-selling the hosted service without contributing back. This is a common pattern (MongoDB, Elasticsearch) and does not affect self-hosted or community deployments.

## 6.3 Governance of the Project Itself
Groven cannot credibly serve as a governance tool if its own governance is opaque. The project will be governed using Groven itself from the first public release.
- Roadmap decisions made through public Groven discussions, open to all contributors
- Core maintainer team initially from Sofilab, expanded by contribution history
- RFC (Request for Comments) process for significant architectural changes — using the Seed→Branch→Forest model natively
- Voting on breaking changes using Groven's own voting module
This creates a live demonstration of the tool's capabilities — and holds the team accountable to the same standards they advocate for others.

## 6.4 Relationship to CORPUS
The relationship between Groven and CORPUS is deliberately structured as client and tool, not product and feature:
- CORPUS is Groven's first and reference implementation — the use case that drove design decisions
- CORPUS contributors are Groven's initial user community for empirical validation
- CORPUS funds initial Groven development through Sofilab
- Groven has no dependency on CORPUS — it is independently deployable and usable
- CORPUS integrates with Groven through the public API, like any other client
This separation protects Groven's credibility as a neutral tool and protects CORPUS from being blocked by Groven's development priorities.

# 7. Development Roadmap


| Phase | Timeline | Focus | Key Output |
|---|---|---|---|
| Phase 0 | Month 1–2 | Repository setup, architecture documentation, core data model, authentication, basic Seed creation and display. | Public GitHub repository. Working local installation. First Seeds planted internally. |
| Phase 1 | Month 3–4 | Branch creation, lineage graph, basic type selection (manual, no LLM yet), Forest visualisation (tree view). | First complete Seed→Branch→Forest cycle. Internal validation with CORPUS team. |
| Phase 2 | Month 5–6 | LLM integration — type proposal, explanation display, author override, Contested signal. Async queue architecture. | First LLM-typed discussions. Human override data collection begins. |
| Phase 3 | Month 7–8 | Voting module — Ready state declaration, LLM summary generation, voting interface, Decision node creation and anchoring. | First complete governance cycle: Seed → Branches → Ready → Vote → Decision node in Forest. |
| Phase 4 | Month 9–10 | CORPUS production integration. Sortition jury onboarding. Moderation tools. Performance under real governance load. | First real CORPUS governance decision made entirely in Groven. |
| Phase 5 | Month 11–12 | Public open source release. Documentation, contribution guide, self-hosting guide. RFC process activated. | Groven v1.0 public release. External contributors begin. |
| Phase 6+ | Year 2+ | Audio/video content support (Soundbook integration path), advanced graph analysis, federation between Groven instances, mobile interface. | Community-driven roadmap. Sofilab no longer sole decision-maker. |


# 8. Key Open Questions

The following questions are not resolved in this concept paper. They are the empirical questions that the development process — and especially the CORPUS pilot — must answer.

### On human behaviour
- Do people behave differently in a typed graph than in a flat thread? This is the foundational empirical question. Everything else depends on an affirmative answer.
- Will authors engage thoughtfully with the LLM type proposal — or will they accept the default without reading the explanation?
- What happens when a community is split on whether a contribution is a Reframing or a Contradiction? Does the Contested signal help or does it create conflict?

### On the LLM
- How reliable is semantic type classification across languages, domains, and communication styles? The system must work for a West African field recordist and a Berlin music producer equally.
- Is the confidence score meaningful enough to be shown? Or does it create false precision?
- How does classification accuracy change when the Branch description is very short (as it will often be in practice)?

### On governance
- Who has the authority to declare a topic Ready? How is that authority granted and revoked? This is a governance design question that Groven enables but does not answer.
- What prevents the LLM summary from becoming de facto authoritative — i.e., from shaping the vote outcome beyond its intended role as a neutral summary?
- How does Groven handle governance disputes about the governance process itself? (The infinite regress problem.)

### On the open source community
- Will an active contributor community emerge around a tool this specific? Or will Groven remain primarily a Sofilab project with occasional external PRs?
- How do we prevent the RFC process from becoming captured by a small group of technically sophisticated contributors at the expense of non-technical community members?

# 9. Name, Identity, and Positioning

The name Groven is chosen deliberately. A grove is a small forest — bounded, navigable, gemeinschaftlich. It is not a jungle and not a single tree. It implies organic growth, multiple roots, shared canopy. It is not technical jargon. It is accessible in all major languages. And it carries the Seed→Branch→Forest metaphor without overstating it.

| Positioning Statement |
|---|
| Groven is where structured thinking becomes collective action. |
| It is a communication platform for communities that need to move from open discussion to informed decision — without losing the reasoning that got them there. |
| Groven makes the growth of ideas visible. It respects minority positions. It creates governance records that can be read and trusted in five years. |
| It is open source, self-hostable, and governed by the same tool it provides. |



Groven — Open Source Initiative  ·  Initiated by Sofilab GmbH, Munich  ·  March 2026
This document is itself a Seed. Fork it.
