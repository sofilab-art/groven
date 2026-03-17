# Groven Prototype — Claude Code Plan
*Verhaltensprototyp · Stack: Flask + SQLite + Vanilla JS + OpenAI API*

---

## Ziel

Einen lauffähigen Verhaltensprototypen bauen der eine zentrale Frage beantwortet:
**Verhalten sich Menschen in einem typisierten Ideengraphen anders als in einem flachen Thread?**

Kein Produktionscode. Kein Auth-System. Keine perfekte Mobile-UX.
Aber: echte Interaktion, echte KI-Klassifikation, echte Daten.

---

## Setup

```bash
mkdir groven-prototype && cd groven-prototype
python3 -m venv venv && source venv/bin/activate
pip install flask openai python-dotenv
```

`.env`:
```
OPENAI_API_KEY=sk-...
FLASK_DEBUG=1
```

`.gitignore`:
```
.env
venv/
__pycache__/
*.db
```

---

## CLAUDE.md — in den Projekt-Root legen

```markdown
# Groven Prototype

Verhaltensprototyp für Groven — eine strukturierte Deliberationsplattform.

## Stack
- Python / Flask
- SQLite (groven.db)
- Vanilla JS + D3.js v7 (CDN)
- OpenAI API (gpt-4o-mini)
- API key in .env als OPENAI_API_KEY

## Kernkonzept
Jeder Beitrag ist entweder ein Seed (Wurzelnode, kein Parent) oder eine Branch
(hat genau einen Parent). Branches haben einen semantischen Typ:
clarification | extension | reframing | contradiction | synthesis.
Die KI schlägt den Typ vor, der Mensch bestätigt oder überstimmt.
Weicht die Wahl ab: Node wird als "contested" markiert.

Cards haben KI-generierte Kurztitel (4-6 Wörter) für die Graph-Ansicht.

## Datenmodell
spaces: id (slug), title, description, status (open|ready|decided)
nodes: id (UUID), space_id, parent_id (NULL=Seed), node_type (seed|branch|decision),
       branch_type (clarification|extension|reframing|contradiction|synthesis),
       author, title (KI-generiert, overridable), body, lineage_desc,
       llm_proposed_type, llm_explanation, contested (bool), created_at

## Dateistruktur
main.py, db.py, llm.py, seed_data.py
static/style.css, static/grove.js, static/table.js
templates/base.html, templates/grove.html, templates/table.html, templates/node.html

## Wichtig
- LLM-Calls sind immer non-blocking (async, nie UI blockieren)
- KI bewertet Gedanken nie — sie verortet sie nur
- KI-Outputs sind immer als Vorschlag markiert, immer overridable
```

---

## Dateistruktur

```
groven-prototype/
├── main.py
├── db.py
├── llm.py
├── seed_data.py
├── requirements.txt
├── .env
├── CLAUDE.md
├── static/
│   ├── style.css
│   ├── grove.js       ← Grove-Visualisierung (räumlich, Pflanzen, Parallax, Klick=Eintritt)
│   └── table.js       ← D3.js Graph + Card-Detail
└── templates/
    ├── base.html
    ├── grove.html     ← Einstieg: räumlicher Grove (Hauptansicht)
    ├── table.html     ← Table-Screen: Graph + Card
    └── node.html      ← Card-Detailansicht
```

---

## Datenmodell — `db.py`

```sql
CREATE TABLE spaces (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    description TEXT,
    status      TEXT DEFAULT 'open'
);

CREATE TABLE nodes (
    id                TEXT PRIMARY KEY,
    space_id          TEXT NOT NULL REFERENCES spaces(id),
    parent_id         TEXT REFERENCES nodes(id),
    node_type         TEXT DEFAULT 'seed',
    branch_type       TEXT,
    author            TEXT NOT NULL,
    title             TEXT,        -- KI-generiert, 4-6 Wörter, overridable
    body              TEXT NOT NULL,
    lineage_desc      TEXT,        -- "was baut das auf, wohin führt es?"
    llm_proposed_type TEXT,
    llm_explanation   TEXT,
    contested         INTEGER DEFAULT 0,
    created_at        DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## LLM-Integration — `llm.py`

Zwei Funktionen:

### 1. `propose_branch_type(parent_body, branch_body, lineage_desc)`

System-Prompt:
```
You are a semantic classification assistant for Groven, a structured deliberation platform.
Classify how a new Branch relates to its parent node.

Types:
- clarification: sharpens or makes precise, no new content
- extension: carries idea into new territory
- reframing: same observation, fundamentally different angle, does not contradict
- contradiction: identifies conflict, proposes divergent direction
- synthesis: connects two or more existing lines of thought

Rules:
- Never evaluate quality or importance of ideas
- Never praise or encourage
- Only describe relationships between thoughts
- Respond ONLY with valid JSON, no preamble

{"proposed_type": "...", "confidence": 0.0-1.0,
 "explanation": "Two sentences only. First: what the branch does. Second: why that matches the type."}
```

Returns: `{proposed_type, confidence, explanation}` oder `None` bei Fehler/Timeout (8s).

### 2. `generate_title(body)`

```
Generate a 4-6 word title for this contribution.
The title should capture the core claim or question.
No punctuation at the end. No quotes.
Respond with the title only, nothing else.
```

Returns: `str` oder `None`.

**Beide Funktionen:** Non-blocking. Nie UI blockieren. Bei Fehler: graceful fallback, nie Exception nach oben.

---

## Routes — `main.py`

```
GET  /                          → grove.html (Grove — Haupteinstieg)
GET  /table/<space_id>          → table.html (Graph-Ansicht)
GET  /node/<node_id>            → node.html (Card-Detail)

POST /api/node                  → Node anlegen → JSON {id, title, branch_type, contested}
GET  /api/llm-propose           → ?parent_id=&body=&lineage_desc= → JSON
GET  /api/tree/<space_id>       → alle Nodes als JSON für D3
GET  /api/spaces                → alle Spaces als JSON für Grove

GET  /admin/seed                → Seed-Daten laden (nur dev)
```

---

## Grove-Screen — `grove.html` + `grove.js`

**Das ist der Kern des Verhaltensprototypen.** Nicht die Space-Liste, nicht die Tabellen-Ansicht. Die zentrale Frage ist: Verhält man sich anders wenn man durch einen Raum schlendert statt durch eine Liste scrollt?

### Was es zeigt

Dunkle Waldlandschaft. Pflanzen verschiedener Größe repräsentieren Spaces/Diskurse.
Größe der Pflanze = Aktivität des Diskurses (Anzahl Nodes).

### Navigation

- **Mobile:** Swipe up/down = Tiefenachse (eintauchen), left/right = lateral
- **Desktop:** Scrollrad = Tiefe, Klick+Drag = lateral
- **Tastatur:** Pfeiltasten / WASD

Keine Grenzen links/rechts — open world.

### Pflanzen-Stages nach Node-Anzahl

```
seed:     1-2 Nodes   (50×70px SVG)
seedling: 3-5 Nodes   (90×130px SVG)
shrub:    6-12 Nodes  (160×200px SVG)
tree:     13+ Nodes   (220×310px SVG)
```

### Wachsende Vorschau beim Näherkommen

Beim Näherkommen (Pflanze wird größer im Viewport) erscheint progressiv mehr:
1. Autor + erster Satz des Fragments
2. Vollständiges Fragment (1-2 Sätze)
3. Kontext (2-3 Sätze, KI-generiert)

Das ist **Stöbern** — kein Eintritt.

### Klick = Eintritt

Klick/Tap auf Pflanze oder Fragment → navigiert zu `/table/<space_id>`.
Klarer Schnitt. Neuer Screen. Kein Hinübergleiten.

### Atmosphäre

- Sternenhimmel (80 Punkte, Twinkle-Animation)
- 3 Nebelstreifen (horizontale Ellipsen, leichte Drift)
- Parallax: 4 Ebenen, hintere bewegen sich langsamer
- Tiefenmodell: nahe Ebenen sinken beim Eintauchen nach unten,
  ferne Ebenen wachsen und kommen auf den User zu
- Palette: `--dark:#080f07`, `--forest:#1B4332`, `--mint:#74C69D`, `--cream:#F8F5F0`
- Fonts: Cormorant Garamond (Fragmente), Outfit (UI)

---

## Table-Screen — `table.html` + `table.js`

### Layout

Zweispaltig auf Desktop:
- Links (55%): D3.js Graph
- Rechts (45%): Card-Detail (beim Start: leer / Placeholder "Wähle eine Node")

Mobile: Graph oben, Card unten (togglebar).

### D3.js Graph

- Gerichteter hierarchischer Graph: Seed oben, Branches fächern nach unten
- Node-Größe: alle gleich (Kreise r=22)
- Node-Farbe nach branch_type:
  ```
  seed:          #F8F5F0 (cream)
  clarification: #3B82F6
  extension:     #40916C
  reframing:     #D4A373
  contradiction: #EF4444
  synthesis:     #8B5CF6
  ```
- Contested nodes: gestrichelter Rand (#D4A373), stroke-width 2.5
- Node-Label: `node.title` (KI-generierter Kurztitel, 4-6 Wörter)
- Kanten: gerichtet mit Pfeilspitzen, Farbe nach Branch-Typ des Ziel-Nodes, opacity 0.5
- Synthesis-Nodes: haben zwei eingehende Kanten — beide darstellen
- Klick auf Node → lädt Card-Detail in rechte Spalte (kein neuer Screen)
- Hover: Tooltip mit Autor + Typ

### Card-Detail (rechte Spalte)

Beim Klick auf einen Node:
```
[Typ-Badge]  [Autor]  [Datum]
[Titel]
[Body — vollständiger Text]
[lineage_desc in kursiv, falls vorhanden]
─────────────────────────────
KI-Box:
  Vorgeschlagener Typ: [Typ]
  "[Erklärung — 2 Sätze]"
  [Falls contested: "KI schlug X vor — Autor wählte Y"]
─────────────────────────────
[Button: "Darauf antworten" → öffnet Beitragsformular]
```

### Beitragsformular (unter Card-Detail, erscheint bei Klick)

```
Author: [Freitext]
Body:   [Textarea — Pflicht]
Lineage: [Textarea — "Was baut das auf? Wohin führt es?"]

[Button: "KI-Vorschlag holen"]
  → Spinner
  → KI-Box erscheint: Typ + Erklärung
  → Radio-Gruppe: [vorgeschlagener Typ vorausgewählt] + 4 andere

[Submit]
```

Nach Submit: Graph aktualisiert sich, neue Node erscheint.

---

## Seed-Daten — `seed_data.py`

Drei Spaces mit vollständigen Diskussionen. Alle Texte auf Deutsch.
LLM-Felder (`llm_proposed_type`, `llm_explanation`, `title`) vorab befüllt —
simuliert was die KI generiert hätte.

### Space 1: `corpus-ai-training`
**"Sollten AI-Trainings-Lizenzen zeitlich befristet sein?"** · status: open

| # | Typ | Autor | Titel (KI) | Body |
|---|-----|-------|-----------|------|
| 1 | seed | Amara | Befristung von KI-Lizenzen | "Eine Lizenz, die das Training eines KI-Modells erlaubt, sollte automatisch nach 2 Jahren ablaufen. Die Modelle existieren weiter — aber neue Trainingsläufe benötigen eine neue Lizenz. Das schafft einen regelmäßigen Markt." |
| 2 | branch/extension | Jonas | Modellversion als Lizenz-Trigger | "Das Prinzip ließe sich auf Modell-Versionen ausweiten: Jedes neue Major-Release würde eine neue Lizenzrunde erfordern — selbst wenn die Trainingsdaten identisch sind." |
| 3 | branch/clarification | Yuki | Was gilt als neuer Trainingslauf? | "Unklar bleibt: Was zählt als 'neuer Trainingslauf'? Fine-Tuning? Continual Learning? Der Begriff muss technisch definiert werden, sonst ist die Klausel nicht durchsetzbar." |
| 4 | branch/contradiction | Fatima | Befristung löst das Problem nicht | "Zeitliche Befristung verschiebt das Problem. Verlage werden 2-Jahres-Lizenzen pauschal für alle Zukunfts-Modelle ausstellen. Das Ergebnis: ewige Rechte durch zeitlich unbegrenzte Rahmenverträge." |
| 5 | branch/reframing (auf 4) | Amara | Argument gegen Pauschallizenzen | "Fatimas Einwand trifft zu — aber er ist kein Argument gegen Befristung, sondern gegen Pauschallizenzen. Der eigentliche Schutz: Lizenzen müssen modellspezifisch sein." |
| 6 | branch/synthesis (auf 2+5) | Jonas | Modellbindung und kein Blanko | "Lizenzen sind an konkrete Modell-Versionen gebunden, laufen mit der Modellgeneration ab, und können nicht vorab für unbekannte zukünftige Systeme erteilt werden." |

**Contested:** Node 5 — KI schlug contradiction vor, Amara wählte reframing.

---

### Space 2: `corpus-revenue-split`
**"Wie soll der Royalty-Pool zwischen Urhebern aufgeteilt werden?"** · status: open

| # | Typ | Autor | Titel (KI) | Body |
|---|-----|-------|-----------|------|
| 1 | seed | Kwame | Gleiche Teile pro Urheber | "Der einfachste faire Ansatz: gleiche Teile pro Urheber. Kein Gewichtungssystem, keine Möglichkeit für große Player die Verteilung zu dominieren." |
| 2 | branch/contradiction | Lena | Quantität schlägt Qualität | "Gleiche Teile belohnen Quantität. Wer 10.000 generische Loop-Samples hochlädt, bekommt dasselbe wie jemand mit 50 sorgfältig kuratierten Aufnahmen." |
| 3 | branch/extension (auf 2) | Kwame | Obergrenze pro Urheber | "Eine mögliche Antwort: Gleichheit pro Werk, aber mit einer Obergrenze pro Urheber (max. 200 Werke). Verhindert Spam, erkennt Tiefe an." |
| 4 | branch/reframing | Priya | Gleichheit als einzig ehrliche Option | "Die Frage 'gleich vs. gewichtet' setzt voraus, dass wir Relevanz messen können. Können wir das nicht verlässlich, ist Gleichheit nicht der schwächste Kompromiss — sondern die einzig ehrliche Option." |
| 5 | branch/clarification (auf 2) | Tomás | Relevanz für wen? | "Branch 2 spricht von 'Relevanz' — aber für wen? Für das Training? Für den Markt? Für die Community? Drei verschiedene Metriken, drei verschiedene Verteilungen." |

**Contested:** Node 4 — KI schlug contradiction vor, Priya wählte reframing.

---

### Space 3: `corpus-jury-composition`
**"Wer darf in der Governance-Jury sitzen?"** · status: ready

| # | Typ | Autor | Titel (KI) | Body |
|---|-----|-------|-----------|------|
| 1 | seed | Nadia | Sortition als Grundprinzip | "Die Jury sollte durch Sortition — zufällige Auswahl mit Schichtung — aus dem Contributor-Pool gezogen werden. Keine Wahlen, keine Akkumulation von Entscheidungsmacht." |
| 2 | branch/extension | Felix | Drei Schichtungsdimensionen | "Schichtung sollte nach drei Achsen erfolgen: Herkunftsregion (Global North / South), Genre-Zugehörigkeit, und Karrierestufe. Ohne diese drei reproduziert auch Sortition strukturelle Ungleichgewichte." |
| 3 | branch/clarification | Amara | Periodenlänge und Wiederwahl | "Wie lange dauert eine Jury-Periode? Kann dieselbe Person erneut ausgelost werden? Das beeinflusst ob sich Expertise aufbaut oder Kontinuität verhindert wird." |
| 4 | branch/contradiction | Kwame | Pool zu klein für Sortition | "Sortition funktioniert bei großen Pools. Bei CORPUS launch mit <50 Contributors ist der Pool zu klein. In kleinen Communities führt Sortition zu unrepräsentativen Zufallsstichproben." |
| 5 | branch/reframing (auf 4) | Nadia | Übergangsregelung statt Ablehnung | "Kwames Einwand ist statistisch korrekt. Aber das ist kein Argument für Wahlen — es ist ein Argument für eine Übergangsregelung. Phase 1 (<100): alle partizipieren. Ab 100: Sortition." |
| 6 | branch/synthesis (auf 2+5) | Felix | Sortition ab 100, Schichtung immer | "Sortition mit Schichtung gilt ab 100 Contributors. Schichtung: Region, Genre, Karrierestufe. Davor: volle Partizipation. Offen: Periodenlänge und Wiederwählbarkeit." |

**Contested:** keine.

---

## Was der Prototyp bewusst weglässt

| Feature | Warum |
|---------|-------|
| Login / Auth | Author als Freitextfeld reicht für Verhaltenstest |
| Governance-Abstimmung | Phase 3 im Konzept — Prototyp testet Diskussion, nicht Abstimmung |
| Grove-Visualisierung als Hauptansicht | Zu aufwändig für Verhaltensprototyp — stattdessen: einfache Space-Liste als Einstieg |
| Mobile-Optimierung | Desktop-first für Prototyp |
| Federation | Nicht relevant für Verhaltenstest |

**Zur Grove-Visualisierung:** Die räumliche Grove-Ansicht ist zu komplex für einen Verhaltensprototypen. Stattdessen: einfache Space-Liste als Einstieg (`/`), die zum jeweiligen Table-Screen führt. Die Grove-Visualisierung ist separat als Hero-Mockup für die Website geplant (siehe `GROVE_HERO_BRIEF.md`).

---

## Prompt für Claude Code

```
Read CLAUDE.md for context. Build the complete Groven behavioral prototype in one pass.
Do not ask for confirmation between files.

## Files to create

### db.py
SQLite schema (spaces, nodes tables) + init_db() + CRUD:
- get_space(id), list_spaces()
- get_node(id), list_nodes(space_id), create_node(**kwargs), get_tree(space_id)
- get_tree returns list of dicts with all fields including parent_id

### llm.py
- propose_branch_type(parent_body, branch_body, lineage_desc)
  → uses gpt-4o-mini, returns {proposed_type, confidence, explanation} or None
  → system prompt: classify relationship only, NEVER praise or evaluate ideas
  → timeout 8s, returns None on any error
- generate_title(body)
  → uses gpt-4o-mini, returns 4-6 word string or None
  → system prompt: generate short title, no punctuation, no quotes

### seed_data.py
Three spaces with full discussions as defined in the build plan.
Pre-fill llm_proposed_type, llm_explanation, title on all nodes.
Mark contested=1 on nodes where branch_type != llm_proposed_type.

### main.py
Flask app. Load .env. Call init_db() + seed on startup if db empty.
Routes:
  GET  /                    → list of spaces (index.html)
  GET  /table/<space_id>    → table.html
  GET  /node/<node_id>      → node.html
  POST /api/node            → create node, returns JSON
  GET  /api/llm-propose     → query: parent_id, body, lineage_desc → JSON
  GET  /api/tree/<space_id> → nodes as JSON for D3

### templates/base.html
Google Fonts: Outfit (300,400,500) + Cormorant Garamond (300,400,italic)
CSS vars: --dark:#080f07 --forest:#1B4332 --mid:#2D6A4F --leaf:#40916C
          --mint:#74C69D --cream:#F8F5F0 --sand:#D4A373
Nav: "Groven" left, space links right

### templates/grove.html
Full-screen Grove. Load static/grove.js.
Dark background (#080f07). No nav clutter — just "Groven" wordmark top-left.
Small "Anliegen" input bar bottom-center (placeholder: "What's on your mind?").
Depth indicator dots on the right edge (10 dots, current depth lit).
Hint text: "Scroll to dive · Drag to explore" — fades after first interaction.

grove.js must:
1. Fetch /api/spaces on load to get all spaces with node counts
2. Render each space as a plant (SVG, size by node count)
3. Place plants across a wide world (no left/right boundary)
   Layer 0 (far):  spaces with 1-2 nodes  → seed SVG
   Layer 1 (mid):  spaces with 3-5 nodes  → seedling SVG
   Layer 2 (near): spaces with 6-12 nodes → shrub SVG
   Layer 3 (very near): spaces with 13+   → tree SVG
4. Navigation: scroll/swipe vertical = depth, drag/swipe horizontal = lateral
5. Depth model (CRITICAL — this was wrong in earlier versions):
   - Near layers (3) sink DOWN as depth increases (you pass them)
   - Far layers (0) grow and approach as depth increases
   - Near layer cards visible at depth 0.02-0.28
   - Far layer cards visible at depth 0.28-0.95
6. Growing preview on approach:
   - Small: author + first sentence of fragment
   - Medium: full fragment (1-2 sentences, KI-generated)
   - Large: fragment + context (2-3 sentences)
   This is browsing — NOT entry.
7. Click/tap on plant or fragment: navigate to /table/<space_id>
   Hard navigation. New screen. No animation transition needed.
8. Atmospherics: stars (80, twinkle), fog bands (3, drift), parallax (4 layers)
9. "Anliegen" input: on submit, fetch /api/spaces with query param,
   re-arrange plants to show most relevant spaces centered

/api/spaces must return: id, title, description, status, node_count,
  fragment (first sentence of most recent node body),
  author (most recent node author)

### templates/table.html
Two-column layout (desktop): left 55% graph, right 45% card detail.
Left: <div id="graph-container"> → loaded by table.js
Right: #card-detail (empty on load, "Select a node to read")
Below card-detail: #contribution-form (hidden, shown on "Reply" click)
Contribution form fields: author (text), body (textarea, required),
  lineage_desc (textarea, required, label: "What does this build on? Where does it go?"),
  "Get AI suggestion" button, AI result box with radio group, submit button.
Load D3.js v7 from CDN. Load static/table.js.

### templates/node.html
Full card view: type badge, author, date, body, lineage_desc (italic),
AI box (proposed type + explanation, contested flag if applicable),
list of direct child branches with type badges and links.

### static/style.css
- Use CSS vars from base.html
- Type badge colors: clarification:#3B82F6 extension:#40916C reframing:#D4A373
  contradiction:#EF4444 synthesis:#8B5CF6 seed:cream
- Contested: dashed border, amber tint
- AI suggestion box: mint left border, dark background
- Two-column table layout, responsive (stack on mobile)
- Status badges: open=leaf, ready=sand, decided=forest

### static/table.js
D3.js v7 force-directed graph:
- Fetch /api/tree/<space_id> on load
- Nodes: circles r=22, fill by branch_type, label = node.title (truncate at 20 chars)
- Contested nodes: strokeDasharray="4,3" stroke=#D4A373 strokeWidth=2.5
- Links: arrows (marker-end), colored by target node's branch_type, opacity 0.5
- Synthesis nodes may have 2 incoming edges — render both
- Click on node: fetch /node/<id> content and inject into #card-detail (innerHTML)
  without page reload; also show #contribution-form-toggle button
- Force params: linkDistance=120, charge=-400, collision=35
- On "Reply" button click in card-detail: show contribution form with parent_id set
- AI suggest button: fetch /api/llm-propose, show spinner, render result box,
  pre-select proposed type in radio group
- Form submit: POST /api/node, on success re-fetch tree and update graph

When done, print:
"Groven prototype complete.
Run: source venv/bin/activate && flask run
Open: http://localhost:5000"
```

---

## Nach dem Build — Verhaltensfragen

Diese Fragen soll der Prototyp beantworten:

**Grove-Verhalten:**
1. Bewegen sich Menschen durch den Grove — oder klicken sie sofort auf das erstbeste?
2. Entdecken sie Diskurse die sie über eine Liste nicht gefunden hätten?
3. Beeinflusst die räumliche Nähe zweier Pflanzen welche Gespräche als verwandt wahrgenommen werden?

**Diskurs-Verhalten:**
4. Wählen Menschen die KI-Typ-Vorschläge oder überstimmen sie sie? In welchen Fällen?
5. Verändert die Pflicht zur `lineage_desc` die Qualität der Beiträge?
6. Welche Branch-Typen entstehen am häufigsten? Welche kaum?
7. Werden Contested-Nodes tatsächlich als interessanter wahrgenommen?
8. Bricht die Diskussion früher ab als in einem flachen Thread — oder geht sie tiefer?
