# Groven — Structured Deliberation Platform

**Concept v6 prototype: Grove entry experience, multi-room model, 10 card types, multi-link graph, multiple readings, temperature voting.**

Groven tests a core hypothesis: does typing and linking contributions change how people deliberate? Every contribution is a **card** with a semantic type proposed by an AI, confirmed or overridden by the author. When the author disagrees with the AI's classification, the card is marked **contested**, making disagreement visible in the graph.

Cards are connected by typed **links** — builds_on, questions, contradicts, reframes, supports, evidences, amends, answers, spins_off, implements — forming a multi-link deliberation graph rather than a flat thread or simple tree.

## What's new in v6

- **The Grove** — full-screen dark forest landscape as the platform entry point. Spaces appear as cards growing from a shared ground plane. Navigate by scrolling (zoom/depth), trackpad swiping (lateral), or dragging. Stars twinkle above, decorative plants sway between cards, and ground fog drifts along the ground line.
- **Semantic zoom** — as you zoom toward a card, it progressively reveals more information: title → author → fragment → full description
- **Depth variation** — cards are staggered at different depths with perspective scaling (farther cards appear smaller and slightly faded)
- **Decorative atmosphere** — 5 plant types (grass tufts, ferns, sprouts, tall grass, moss clusters) at various scales and opacities, all rooted at the ground level
- **Concern input** — "What's on your mind?" search bar filters spaces in real-time; if no match, prompts to create a new conversation
- **Plaza removed from UI** — the Plaza room type is hidden from tabs; the Grove IS the entry experience
- **Fragment data** — spaces API returns the most recent card body, author, and date for preview in the Grove

### Retained from v5

- **Multi-room model** — Tables for focused deliberation (Plaza hidden, kept in DB)
- **10 card types** — question, claim, experience, evidence, proposal, amendment, summary, request, offer
- **10 link relations** — typed directional edges between cards
- **Multiple readings** — author + AI classifications; disagreement = contested
- **Temperature voting** — Support/Oppose with justification and arc gauge
- **Synthesis suggestions** — AI-powered reasoning + structural analysis

## Stack

- **Backend:** Node.js + TypeScript + Express
- **Frontend:** React 19 + Vite + D3.js v7
- **Database:** PostgreSQL 18
- **LLM:** Mistral AI (`@mistralai/mistralai` SDK)
  - `mistral-small-latest` — classification, titles, lineage, reclassification
  - `mistral-large-latest` — synthesis suggestions (reasoning + structural analysis)
- **Auth:** express-session + bcrypt + connect-pg-simple
- **Monorepo:** npm workspaces (server/ + client/)
- **Fonts:** Outfit (UI) + Cormorant Garamond (fragment text)

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL (running locally on port 5432)

### Install

```bash
git clone https://github.com/sofilab-art/groven.git
cd groven
git checkout concept-v5
npm install
```

### Environment

Create a `.env` file in the project root:

```
MISTRAL_API_KEY=your-mistral-api-key
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/groven
SESSION_SECRET=your-session-secret
```

### Database

Create the database and run migrations:

```bash
createdb groven
npm run migrate -w server
```

Optionally seed with 4 demo spaces and 5 demo users:

```bash
npm run seed -w server
```

Demo accounts: `elena`, `marcus`, `sofia`, `david`, `anna` (all password: `password`)

### Run

```bash
npm run dev
```

Opens Express on `:3000` and Vite on `:5173`. Visit http://localhost:5173.

## How it works

### The Grove (entry experience)

The Grove is a full-screen dark SVG landscape. Spaces appear as translucent cards anchored to a shared ground plane, spread horizontally with depth variation. Background layers include:

- **Starfield** — 80 twinkling stars above the ground line (parallax layer)
- **Decorative plants** — grass, ferns, sprouts, and moss growing from the ground
- **Ground fog** — multiple overlapping fog ellipses drifting along the ground

Navigation: scroll to zoom in/out, trackpad swipe or drag to pan, arrow keys/WASD for keyboard control. Position is saved to session storage and restored on back-navigation.

**Semantic zoom** progressively reveals card content as you approach:
- Far: title only (minimal)
- Medium: title + author
- Close: title + author + first sentence of fragment
- Very close: full fragment + space description

### Data model

- **Spaces** — deliberation topics (shown as cards in the Grove)
- **Rooms** — Tables (focused topics, user-created). Plaza exists in DB but hidden from UI.
- **Cards** — contributions with a semantic type, body, title, optional lineage description
- **Links** — typed directional edges between cards (10 relation types)
- **Readings** — author and AI classifications for each card (type, is_question, explanation)
- **Temperature votes** — Support/Oppose with justification on any card

### Contribution flow

1. Author writes a card (body text)
2. Analysis streams via SSE: classification → title + lineage (parallel)
3. AI proposes card type, detects questions, generates title and lineage description
4. Author reviews in a modal — can edit title/lineage, override the type, toggle question flag, choose link relation
5. If the author picks a different type, AI rethinks and explains why the override is reasonable
6. Both readings (author + AI) are saved; disagreement marks the card as **contested**
7. The graph updates — contested cards have visual indicators, question cards show a **?** overlay

### Synthesis suggestions

Click **Suggest Synthesis** to have the AI (`mistral-large-latest`) analyse the full discussion and propose 1–3 synthesis cards. The AI's reasoning streams in real-time, followed by concrete suggestions with titles, bodies, and lineage. Accepted suggestions become new cards in the room.

### Temperature voting

Any card can receive Support or Oppose votes with a required one-sentence justification. Proposal and summary cards display a **vote arc gauge** — a ring that fills proportionally with green (support) and red (oppose) arcs.

### Visualization

D3.js force-directed graph. Each card type has a distinct color. Links are drawn with relation-based colors and curved paths when multiple links exist between the same pair. Question cards show a **?** marker. Contested cards (AI ≠ author reading) have a dotted border indicator. Click a card for full detail, voting, and response; drag to rearrange; scroll to zoom.

## Project structure

```
groven/
├── package.json                # npm workspaces root
├── .env                        # API keys and DB connection
├── server/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts            # Express app, middleware, session, static serving
│       ├── db.ts               # pg Pool connection
│       ├── migrate.ts          # CREATE TYPE + CREATE TABLE
│       ├── seed.ts             # 4 demo spaces with users, cards, links, votes
│       ├── llm.ts              # Mistral AI: classify, title, lineage, reclassify, synthesis
│       ├── types.ts            # TypeScript types and enums
│       ├── middleware/auth.ts  # requireAuth session middleware
│       └── routes/
│           ├── auth.ts         # register, login, logout, me
│           ├── spaces.ts       # CRUD + fragment data for Grove
│           ├── rooms.ts        # list, create Table
│           ├── cards.ts        # CRUD, SSE preview, reclassify, graph endpoint
│           ├── votes.ts        # temperature voting (upsert)
│           ├── synthesis.ts    # SSE streaming synthesis suggestions
│           └── admin.ts        # seed route
└── client/
    ├── package.json
    ├── vite.config.ts          # proxy /api → Express :3000
    └── src/
        ├── App.tsx             # React Router (Grove outside Layout)
        ├── api.ts              # fetch wrappers + SSE helpers
        ├── context/AuthContext.tsx
        ├── pages/
        │   ├── LoginPage.tsx   # login/register tabs
        │   ├── GrovePage.tsx   # Grove entry experience (full-screen dark SVG)
        │   ├── SpacePage.tsx   # rooms, graph, detail panel, contribute
        │   └── CardPage.tsx    # full card detail with links and votes
        ├── components/
        │   ├── Layout.tsx      # nav bar with auth state
        │   ├── Graph.tsx       # D3 force-directed graph (ref-based)
        │   ├── grove/          # Grove atmosphere components
        │   │   ├── GroveCard.tsx    # Card representation with semantic zoom
        │   │   ├── DecoPlants.tsx   # 5 plant types with depth variation
        │   │   └── Starfield.tsx    # Twinkling stars (sky only)
        │   ├── CardDetail.tsx  # inline detail panel
        │   ├── ContributeForm.tsx
        │   ├── ReviewModal.tsx # SSE streaming review
        │   ├── SynthesisModal.tsx
        │   ├── VotePanel.tsx   # support/oppose + arc gauge
        │   ├── TypeBadge.tsx
        │   ├── ReadingsList.tsx
        │   ├── RoomTabs.tsx    # Table tabs (Plaza filtered out)
        │   ├── NewSpaceModal.tsx
        │   └── NewTableModal.tsx
        ├── hooks/
        │   └── useGroveNavigation.ts  # Scroll/drag/key/touch navigation engine
        └── styles/globals.css  # design system (Outfit + Cormorant Garamond, forest/mint/cream + grove dark)
```

## Design system

- **Fonts:** Outfit (UI), Cormorant Garamond (fragment text in Grove)
- **Palette:** forest (#2d4a3e), mint (#7bc4a5), cream (#faf8f0)
- **Grove palette:** dark (#080f07), forest (#1B4332), mint (#74C69D), cream (#F8F5F0)
- Each card type has a distinct color
- Responsive layout with breakpoints at 900px and 600px

## Seeded spaces

1. **Royalty Distribution in the Age of AI** — fair compensation when AI is involved in music creation
2. **Creative Attribution Standards** — crediting human and AI contributions
3. **Open Licensing Infrastructure** — technical infrastructure for AI-era music licensing
4. **Programming Lachenmann for Ensemble** — programming Helmut Lachenmann for an ensemble season

## What this prototype does NOT include

| Excluded | Reason |
|----------|--------|
| Formal governance voting (Assembly/Ballot/Decision) | Deferred to later version |
| Proposal Lab and Library rooms | Deferred |
| Steward roles and actions | Deferred |
| Source bundles | Deferred |
| Non-text content (images, video, audio) | Deferred |
| OAuth/SSO | Simple session auth sufficient for testing |

## License

See [LICENSE.md](LICENSE.md).
