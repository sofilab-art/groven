# Groven Prototype

Behavioral prototype for Groven — a structured deliberation platform.

## Stack
- Python / Flask
- SQLite (file: groven.db)
- Vanilla JS + D3.js v7 (CDN)
- OpenAI API (gpt-5-mini) for branch type classification
- API key in .env as OPENAI_API_KEY

## Core concept
Every contribution is either a Seed (root node, no parent) or a Branch (has exactly
one parent). Branches have a semantic type: clarification | extension | reframing |
contradiction | synthesis. The LLM proposes a type; the author confirms or overrides.
If they differ, the node is marked as "contested".

## Data model
spaces: id (slug), title, description, status (open|ready|decided)
nodes: id (UUID), space_id, parent_id (NULL=Seed), node_type, branch_type,
       author, title, body, lineage_desc, llm_proposed_type, llm_explanation,
       contested (bool), created_at

## File structure
main.py, db.py, llm.py, seed_data.py
static/style.css, static/main.js, static/graph.js
templates/base.html, templates/index.html, templates/space.html, templates/node.html

## Development rules
- Implement one file at a time
- Run flask and verify each phase works before continuing
- Never block the UI waiting for OpenAI — the LLM call is always async
- The /admin/seed route loads seed data; it's dev-only, no auth needed locally
