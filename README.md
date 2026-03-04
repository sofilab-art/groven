# Groven Prototype

**Behavioral prototype for structured deliberation.**

**Demo:** https://groven.pythonanywhere.com/

Groven tests a core hypothesis: does typing contributions (clarification, extension, reframing, contradiction, synthesis) change how people contribute to a discussion?

Every contribution is either a **Seed** (a root argument) or a **Branch** (a response to an existing node). Branches carry a semantic type — proposed by an LLM, confirmed or overridden by the author. When the author disagrees with the LLM's classification, the node is marked as **contested**, making disagreement visible in the graph.

## What this prototype is for

This is a **Verhaltensprototyp** (behavioral prototype) — not a product. It exists to answer five questions:

1. Do people accept or override the LLM's type proposals? In which cases?
2. Does the requirement to describe lineage ("What does this build on?") change contribution quality?
3. Which branch types emerge most frequently? Which are rare?
4. Are contested nodes perceived as more interesting?
5. Does typed, tree-structured discussion go deeper than flat threads — or does it break off sooner?

The prototype ships with three pre-loaded discussion spaces in the context of CORPUS (a music rights governance project), but the deliberation structure is domain-agnostic.

## Stack

- **Backend:** Python / Flask, SQLite
- **Frontend:** Vanilla JS, D3.js v7 (CDN)
- **LLM:** OpenAI API (gpt-5-mini) for branch type classification, title and lineage generation
- No authentication, no SPA framework, no build step.

## Setup

```bash
git clone https://github.com/sofilab-art/groven.git
cd groven
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the project root:

```
OPENAI_API_KEY=sk-...
FLASK_DEBUG=1
```

Run:

```bash
flask --app main run
```

Open http://localhost:5000. Seed data loads automatically on first start.

## How it works

### Data model

- **Spaces** — deliberation topics (open / ready / decided)
- **Nodes** — contributions: Seeds (root) or Branches (with parent)
- **Branch types** — clarification | extension | reframing | contradiction | synthesis

### Contribution flow

1. Author writes a branch contribution (body text only)
2. LLM proposes a branch type, generates a title, lineage description, and two-sentence explanation
3. Author reviews everything in a modal — can edit title and lineage, and confirm or override the type
4. If the author picks a different type, the LLM rethinks and explains why the author's reading is reasonable
5. If overridden, the node is flagged as **contested**
6. The graph updates — contested nodes have a dashed border

### Visualization

D3.js force-directed graph. Node color = branch type. Node size distinguishes seeds from branches. Contested nodes have dashed amber borders. Hover for tooltip, click for detail.

## What this prototype does NOT include

| Excluded | Reason |
|----------|--------|
| User auth / login | Not needed for behavioral testing |
| Voting / decision mechanism | Tests discussion behavior, not voting |
| Mobile optimization | D3 graphs on mobile are impractical |
| Filtering by type or author | Useful at >50 nodes, not at prototype scale |
| Persistent sessions | Not needed for behavioral testing |

## Project structure

```
main.py              Flask app, all routes
db.py                SQLite schema + helpers
llm.py               OpenAI API integration
seed_data.py         Three pre-loaded discussion spaces
static/
  style.css          Forest/mint/cream palette, Outfit font
  graph.js           D3.js force-directed graph
  main.js            Form logic, LLM proposal flow
templates/
  base.html          Layout + nav
  index.html         Space overview
  space.html         Graph + contribution form
  node.html          Node detail with lineage breadcrumb
```

## License

See [LICENSE.md](LICENSE.md).
