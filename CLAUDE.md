# Groven — Structured Deliberation Platform

Concept v5 prototype: multi-room model, 10 card types, multi-link graph, multiple readings, temperature voting.

## Git

- Only commit and push when explicitly asked. Never proactively commit.
- Before every commit, re-visit README.md and update it to reflect any changes. Rewrite from scratch when substantial changes warrant it.

## Stack
- **Backend**: Node.js + TypeScript + Express
- **Frontend**: React 19 + Vite + D3.js v7
- **Database**: PostgreSQL 18 (local, port 5432)
- **LLM**: Mistral AI (@mistralai/mistralai SDK)
  - mistral-small-latest: classification, titles, lineage, reclassification
  - mistral-large-latest: synthesis suggestions
- **Auth**: express-session + bcrypt + connect-pg-simple
- **Monorepo**: npm workspaces (server/ + client/)

## Environment
- `.env`: MISTRAL_API_KEY, DATABASE_URL, SESSION_SECRET
- Database: `postgresql://postgres:<password>@localhost:5432/groven`

## Key commands
```bash
npm install              # Install all dependencies
npm run migrate -w server # Run database migrations
npm run seed -w server    # Seed 4 demo spaces with users/cards/votes
npm run dev               # Start both server (:3000) and client (:5173)
```

## Architecture

### Rooms
- **Plaza**: open discussion, low threshold (auto-created with each space)
- **Table**: focused deliberation on specific topics

### Card types (10)
question, claim, experience, evidence, proposal, amendment, summary, request, offer

### Link relations (10)
builds_on, questions, contradicts, reframes, supports, evidences, amends, answers, spins_off, implements

### Multiple readings
Each card has author + AI readings (proposed type, is_question, explanation). When they differ, the card is marked "contested". Author can trigger rethinking.

### Temperature voting
Support/Oppose with required justification. Arc gauge visualization on proposal/summary cards.

### SSE streaming
- POST /api/cards/preview — classification → title + lineage (parallel)
- POST /api/spaces/:id/suggest-synthesis — reasoning stream + suggestions

## Data model (PostgreSQL)
- users, spaces, rooms, cards, links, readings, temperature_votes
- 6 custom ENUM types: room_type, room_status, card_type, link_relation, reader_type, vote_position

## Project structure
```
groven/
├── package.json           # npm workspaces root
├── .env                   # API keys and DB connection
├── server/src/
│   ├── index.ts           # Express app entry
│   ├── db.ts              # pg Pool
│   ├── migrate.ts         # Schema creation
│   ├── seed.ts            # 4 demo spaces
│   ├── llm.ts             # Mistral AI integration
│   ├── types.ts           # TypeScript types/enums
│   ├── middleware/auth.ts  # requireAuth
│   └── routes/            # auth, spaces, rooms, cards, votes, synthesis, admin
└── client/src/
    ├── App.tsx             # React Router
    ├── api.ts              # Fetch wrappers + SSE helpers
    ├── context/AuthContext.tsx
    ├── pages/              # LoginPage, HomePage, SpacePage, CardPage
    ├── components/         # Graph, CardDetail, ContributeForm, ReviewModal,
    │                       # SynthesisModal, VotePanel, TypeBadge, etc.
    └── styles/globals.css  # Full design system (Outfit font, forest/mint/cream)
```

## Design system
- Font: Outfit (Google Fonts)
- Palette: forest (#2d4a3e), mint (#7bc4a5), cream (#faf8f0)
- Each card type has a distinct color
- D3 graph: ref-based (D3 owns SVG, React owns container)

## Development rules
- D3 graph is ref-based: useRef + useEffect, D3 owns the SVG
- SSE routes must disable compression and set appropriate headers
- Card creation is transactional: BEGIN → card → link → readings → COMMIT
- Never block UI waiting for LLM — all LLM calls are async/streaming
- /admin/seed loads seed data; dev-only, no auth needed
- Demo accounts: elena, marcus, sofia, david, anna (password: password)
