# Groven Prototype — Build Plan
**Platform:** Replit (Python/Flask + SQLite + Vanilla JS)
**LLM:** OpenAI API (gpt-4o-mini for type classification)
**Goal:** Verhaltensprototyp — does the typed graph change how people contribute?

---

## 0. Entscheidungen vorab

### Warum Flask, nicht FastAPI oder Node?
Flask ist auf Replit in 30 Sekunden lauffähig, hat SQLite out-of-the-box, und Claude Code / Replit-Claude kennt es in- und auswendig. Kein Build-Step, kein ORM notwendig, volle Kontrolle.

### Warum SQLite, nicht Postgres?
Für einen Verhaltensprototyp mit <200 Nodes ist SQLite ausreichend. Replit persistiert SQLite-Datenbanken. Migration auf Postgres später über Adapter ohne Schema-Änderung.

### Warum gpt-4o-mini, nicht gpt-4o?
Typ-Klassifikation ist ein simpler Klassifikations-Task mit kurzen Inputs. gpt-4o-mini ist schnell genug für Echtzeit-Feedback, kostet einen Bruchteil, und die Klassifikationsqualität ist für diesen Zweck äquivalent.

### Warum kein React/Vue?
Verhaltensprototyp braucht keine SPA-Komplexität. Vanilla JS mit HTMX-ähnlichen Fetch-Calls hält den Stack transparent und den Fokus auf dem Verhalten, nicht der Infrastruktur.

---

## 1. Lokales Setup (Claude Code)

### 1.1 Verzeichnis anlegen

```bash
mkdir groven-prototype && cd groven-prototype
git init
python3 -m venv venv && source venv/bin/activate
pip install flask openai python-dotenv
```

### 1.2 Umgebungsvariablen

`.env`-Datei im Projekt-Root (wird nie committed):

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

### 1.3 Claude Code starten

```bash
claude
```

Claude Code liest automatisch eine `CLAUDE.md` im Projekt-Root als Kontext-Datei (siehe Abschnitt 9).

### 1.4 Dateistruktur

```
groven-prototype/
├── main.py              # Flask app, alle Routes
├── db.py                # SQLite schema + helper functions
├── llm.py               # OpenAI API — type proposal logic
├── seed_data.py         # Vorgeladene Beispieldiskussionen
├── requirements.txt
├── static/
│   ├── style.css
│   ├── main.js          # Graph-Rendering + UI-Logik
│   └── graph.js         # D3.js Forest-Visualisierung
└── templates/
    ├── base.html
    ├── index.html       # Forest-Übersicht (alle Spaces)
    ├── space.html       # Ein Space mit Graph + Beitragsformular
    └── node.html        # Einzelne Node-Detailansicht
```

### 1.5 requirements.txt

```
flask==3.0.3
openai==1.30.0
python-dotenv==1.0.1
```

---

## 2. Datenmodell

### 2.1 SQLite Schema — `db.py`

```python
CREATE TABLE spaces (
    id          TEXT PRIMARY KEY,   -- slug, z.B. "corpus-royalties"
    title       TEXT NOT NULL,
    description TEXT,
    status      TEXT DEFAULT 'open', -- open | ready | decided
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE nodes (
    id          TEXT PRIMARY KEY,   -- UUID
    space_id    TEXT NOT NULL REFERENCES spaces(id),
    parent_id   TEXT REFERENCES nodes(id),  -- NULL = Seed
    node_type   TEXT NOT NULL DEFAULT 'seed', -- seed | branch | decision
    branch_type TEXT,               -- clarification | extension | reframing |
                                    -- contradiction | synthesis | NULL (bei Seeds)
    author      TEXT NOT NULL,
    title       TEXT,               -- optional kurze Überschrift
    body        TEXT NOT NULL,
    lineage_desc TEXT,              -- "what does this build on, and where does it go?"
    llm_proposed_type TEXT,         -- was der LLM vorgeschlagen hat
    llm_explanation   TEXT,         -- die 2-Satz-Erklärung des LLM
    contested   BOOLEAN DEFAULT 0,  -- 1 wenn LLM-Vorschlag != author-Wahl
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE votes (
    id          TEXT PRIMARY KEY,
    space_id    TEXT NOT NULL REFERENCES spaces(id),
    author      TEXT NOT NULL,
    choice      TEXT NOT NULL,      -- freitext oder vordefinierte Option
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 2.2 Wichtige Designentscheidungen im Schema

- `parent_id IS NULL` definiert einen Seed — kein separater `node_type`-Switch nötig
- `llm_proposed_type` und `branch_type` sind getrennte Felder — Abweichung ist direkt ablesbar
- `contested` ist ein berechnetes Boolean, wird beim Save gesetzt, nicht nachträglich abgeleitet
- `lineage_desc` ist Pflichtfeld bei Branches (validated in Flask), optional bei Seeds

---

## 3. LLM-Integration — `llm.py`

### 3.1 Prompt-Design

```python
SYSTEM_PROMPT = """You are a semantic classification assistant for Groven,
a structured deliberation platform.

Your task: classify how a new Branch relates to its parent node.

The five Branch types are:
- clarification: sharpens or makes precise what the parent said, without adding new content
- extension: carries the idea into new territory the parent did not anticipate
- reframing: same observation, fundamentally different interpretive angle; does not contradict
- contradiction: identifies a conflict, proposes a divergent direction
- synthesis: connects two or more existing lines of thought; reconciles divergent Branches

Respond ONLY with valid JSON. No preamble, no explanation outside the JSON.

{
  "proposed_type": "<one of the five types>",
  "confidence": <0.0–1.0>,
  "explanation": "<exactly two sentences: first sentence states what the Branch does; second sentence states why that matches the proposed type>"
}"""

USER_TEMPLATE = """Parent node:
---
{parent_body}
---

New Branch:
---
{branch_body}
---

Lineage description provided by author:
{lineage_desc}

Classify the Branch type."""
```

### 3.2 Funktion

```python
def propose_branch_type(parent_body, branch_body, lineage_desc):
    """
    Returns dict: {proposed_type, confidence, explanation}
    Falls back to None on API error — never blocks the user.
    """
```

### 3.3 Kritische Design-Entscheidung: Non-blocking

Der API-Call passiert **asynchron** nach dem ersten Laden des Branch-Formulars. Der User sieht das Formular sofort. Der LLM-Vorschlag erscheint sobald verfügbar (Fetch-Call im Frontend, Spinner). Ein Timeout von 8 Sekunden — danach kann der User trotzdem submitten, ohne Vorschlag.

---

## 4. Routes — `main.py`

```
GET  /                          → index.html (alle Spaces)
GET  /space/<space_id>          → space.html (Forest + Formular)
GET  /node/<node_id>            → node.html (Einzelansicht + Kinder)

POST /api/node                  → Node anlegen, gibt JSON zurück
GET  /api/llm-propose           → LLM-Vorschlag für Branch (async)
GET  /api/tree/<space_id>       → gesamter Graph als JSON für D3
POST /api/vote                  → Vote abgeben

GET  /admin/seed                → Seed-Daten laden (dev only, kein Auth nötig lokal)
```

---

## 5. Frontend — UI-Logik

### 5.1 Space-View (`space.html`)

Zweispaltig:
- **Links (60%):** Forest-Visualisierung als interaktiver Graph (D3.js, direkt aus `graph.js` geladen)
- **Rechts (40%):** Beitragsformular

### 5.2 Beitragsformular — Ablauf

```
1. User wählt: "Neuer Seed" oder "Branch auf existierende Node"
   → Bei Branch: Dropdown mit Nodes aus dem aktuellen Space
   
2. User füllt aus:
   - Titel (optional)
   - Body (Pflicht)
   - Lineage-Beschreibung (Pflicht bei Branch):
     "What does this build on, and where does it take the argument?"
   - Author-Name (simpel, kein Auth)

3. User klickt "Vorschau" (nicht Submit):
   → Fetch-Call an /api/llm-propose mit parent + body + lineage_desc
   → Spinner erscheint
   → LLM-Antwort erscheint: vorgeschlagener Typ + Erklärung (2 Sätze)
   → Radio-Gruppe: "Ich bestätige [Typ]" / "Ich wähle stattdessen: [4 andere Optionen]"
   → Submit-Button wird aktiv

4. POST /api/node:
   → Server berechnet contested-Flag
   → Node wird gespeichert
   → Space-View aktualisiert sich (Graph + Node-Liste)
```

### 5.3 Contested-Signal im Graph

Nodes mit `contested = true` erhalten im D3-Graph eine sichtbare Markierung: gestrichelter Rand, anderes Symbol. Im Node-Detail wird gezeigt: "LLM schlug [X] vor — Autor wählte [Y]."

### 5.4 Forest-Visualisierung (`graph.js`)

- D3.js v7 (CDN, kein Bundle)
- Hierarchical Force-Directed Graph: Kanten folgen dem `parent_id`-Baum
- Node-Farben nach `branch_type`: je Typ eine Farbe (identisch mit Pitch-Deck-Palette)
- Seeds: größerer Kreis, kein eingehender Pfeil
- Klick auf Node: öffnet Detailansicht in der rechten Spalte
- Hover: zeigt Tooltip mit Autor, Typ, ersten 80 Zeichen des Body

---

## 6. Beispieldiskussionen — `seed_data.py`

Drei Spaces, vorgeladen beim ersten Start. Alle Diskussionen im CORPUS-Kontext — das macht den Prototyp für echte CORPUS-Contributor sofort relevant.

---

### Space 1: `corpus-ai-training`
**Titel:** "Sollten AI-Trainings-Lizenzen zeitlich befristet sein?"
**Status:** open

| Node | Typ | Autor | Inhalt |
|------|-----|-------|--------|
| Seed | — | Amara | "Eine Lizenz, die das Training eines KI-Modells erlaubt, sollte automatisch nach 2 Jahren ablaufen. Die Modelle, die damit trainiert wurden, existieren weiter — aber neue Trainingsläufe benötigen eine neue Lizenz. Das schafft einen regelmäßigen Markt und verhindert, dass einmalige Lizenzen ewige Rechte begründen." |
| Branch 1 | Extension | Jonas | "Das Prinzip ließe sich auf Modell-Versionen ausweiten: Jedes neue Major-Release eines Modells (GPT-5, Gemini 3 etc.) würde eine neue Lizenzrunde erfordern — selbst wenn die Trainingsdaten identisch sind. Damit wird jede Modellgeneration zum Lizenz-Trigger." |
| Branch 2 | Clarification | Yuki | "Unklar bleibt: Was zählt als 'neuer Trainingslauf'? Fine-Tuning auf einem bestehenden Basismodell? Continual Learning auf Live-Daten? Der Begriff muss technisch definiert werden, sonst ist die Klausel nicht durchsetzbar." |
| Branch 3 | Contradiction | Fatima | "Zeitliche Befristung löst das Problem nicht — sie verschiebt es. Verlage und Plattformen werden 2-Jahres-Lizenzen pauschal für alle Zukunfts-Modelle ausstellen, um den Verwaltungsaufwand zu vermeiden. Das Ergebnis: Ewige Rechte durch zeitlich unbegrenzte Rahmenverträge." |
| Branch 4 auf Branch 3 | Reframing | Amara | "Fatimas Einwand trifft zu — aber er ist kein Argument gegen Befristung, sondern gegen Pauschallizenzen. Die eigentliche Schutzmaßnahme wäre: Lizenzen müssen modellspezifisch sein und dürfen keine Blanko-Klausel für zukünftige Systeme enthalten." |
| Branch 5 auf Branch 1+4 | Synthesis | Jonas | "Wenn wir Branch 1 (Modellgeneration als Trigger) und Branch 4 (keine Blanko-Zukunftsklauseln) zusammennehmen, ergibt sich ein konsistentes Prinzip: Lizenzen sind an konkrete Modell-Versionen gebunden, laufen mit der Modellgeneration ab, und können nicht vorab für unbekannte zukünftige Systeme erteilt werden." |

---

### Space 2: `corpus-revenue-split`
**Titel:** "Wie soll der Royalty-Pool zwischen Urhebern aufgeteilt werden?"
**Status:** open

| Node | Typ | Autor | Inhalt |
|------|-----|-------|--------|
| Seed | — | Kwame | "Der einfachste faire Ansatz: gleiche Teile pro Urheber, der zugestimmt hat. Kein Gewichtungssystem, keine Komplexität, keine Möglichkeit für große Player die Verteilung zu dominieren." |
| Branch 1 | Contradiction | Lena | "Gleiche Teile belohnen Quantität, nicht Relevanz. Wer 10.000 generische Loop-Samples hochlädt, bekommt dasselbe wie jemand, der 50 sorgfältig kuratierte, stilprägende Aufnahmen einbringt. Das pervertiert den Sinn des Pools." |
| Branch 2 auf Branch 1 | Extension | Kwame | "Lenás Einwand ist berechtigt. Eine mögliche Antwort: nicht Gleichheit pro Urheber, sondern Gleichheit pro Werk — aber mit einer Obergrenze pro Urheber (z.B. max. 200 Werke zählen zur Berechnung). Verhindert Spam, erkennt Tiefe an." |
| Branch 3 | Reframing | Priya | "Die Frage 'gleich vs. gewichtet' setzt voraus, dass wir Relevanz messen können. Können wir das nicht verlässlich, ist Gleichheit nicht der schwächste Kompromiss — sondern die einzig ehrliche Option." |
| Branch 4 auf Branch 1 | Clarification | Tomás | "Branch 1 spricht von 'Relevanz' — aber Relevanz für wen? Für das AI-Training (wie oft wurde das Sample verwendet)? Für den Markt (wie bekannt ist der Urheber)? Für die Community (peer-bewertete Qualität)? Drei verschiedene Metriken, drei verschiedene Verteilungen." |

---

### Space 3: `corpus-jury-composition`
**Titel:** "Wer darf in der Governance-Jury sitzen?"
**Status:** ready

| Node | Typ | Autor | Inhalt |
|------|-----|-------|--------|
| Seed | — | Nadia | "Die Jury sollte durch Sortition — zufällige Auswahl mit Schichtung — aus dem Contributor-Pool gezogen werden. Keine Wahlen, keine Selbstnominierung, keine Akkumulation von Entscheidungsmacht durch wiederholte Teilnahme." |
| Branch 1 | Extension | Felix | "Schichtung sollte mindestens nach drei Achsen erfolgen: Herkunftsregion (Global North / Global South / andere), Genre-Zugehörigkeit (elektronisch / akustisch / Folk-Tradition / andere), und Karrierestufe (emerging / established). Ohne diese drei Dimensionen reproduziert auch Sortition strukturelle Ungleichgewichte." |
| Branch 2 | Clarification | Amara | "Wie lange dauert eine Jury-Periode? Und kann dieselbe Person in der nächsten Runde erneut ausgelost werden? Das beeinflusst, ob sich Expertise aufbaut oder ob Kontinuität strukturell verhindert wird." |
| Branch 3 | Contradiction | Kwame | "Sortition funktioniert bei großen Pools. Bei CORPUS launch mit <50 Contributors ist der Pool zu klein für bedeutungsvolle Zufallsauswahl. In kleinen Communities führt Sortition zu unrepräsentativen Zufallsstichproben — klassische Urne-Logik gilt erst ab ca. 150-200 Teilnehmenden." |
| Branch 4 auf Branch 3 | Reframing | Nadia | "Kwames Einwand ist statistisch korrekt. Aber das Argument gegen Sortition bei kleinen Pools ist kein Argument für Wahlen — es ist ein Argument für eine Übergangsregelung. In Phase 1 (<100 Contributors): alle partizipieren, keine Selektion. Ab 100: Sortition greift." |
| Branch 5 auf Branch 1+4 | Synthesis | Felix | "Zusammenfassung des aktuellen Standes: Sortition mit Schichtung (Branch 1) gilt ab 100 Contributors (Branch 4). Schichtungsdimensionen: Region, Genre, Karrierestufe. Davor: volle Partizipation. Offen bleibt Branch 2: Amputationsdauer und Wiederwählbarkeit muss die Jury in ihrer ersten Sitzung festlegen." |

---

## 7. Implementierungsreihenfolge für Claude Code / Replit-Claude

Die Reihenfolge ist so gewählt, dass nach jeder Phase etwas **Zeigbares** existiert.

### Phase A — Grundgerüst (ca. 2–3 Stunden)
1. `db.py`: Schema + `init_db()` + CRUD-Funktionen für Nodes und Spaces
2. `main.py`: Flask-App, alle Routes als Stubs (geben vorerst `"ok"` zurück)
3. `seed_data.py`: Alle drei Spaces und ihre Nodes als Python-Dicts
4. `/admin/seed`-Route: lädt Seed-Daten in DB
5. `index.html`: Liste aller Spaces — schlichtes HTML, noch kein Styling

**Checkpoint:** `flask run` läuft auf localhost:5000, DB wird initialisiert, Seed-Daten sind ladbar, Spaces sind sichtbar.

---

### Phase B — Node-Graph (ca. 2–3 Stunden)
1. `space.html`: Zweispaltiges Layout, rechts Formular (noch ohne LLM), links Platzhalter
2. `/api/tree/<space_id>` Route: gibt Nodes als JSON zurück
3. `graph.js`: D3-Force-Graph, Nodes als Kreise, Kanten als Linien, Farben nach Branch-Typ
4. Seed-Nodes: größer, anderer Rand
5. Klick auf Node: zeigt Body in Detailbereich

**Checkpoint:** Forest-Visualisierung der vorgeladenen Diskussionen ist interaktiv sichtbar.

---

### Phase C — Beitragen ohne LLM (ca. 1–2 Stunden)
1. POST `/api/node`: speichert Node ohne LLM-Klassifikation
2. Formular: Seed vs. Branch, Parent-Auswahl, Body, Lineage-Desc, Author
3. Nach Submit: Graph aktualisiert sich ohne Seiten-Reload (Fetch + D3-Update)
4. Branch-Typ: vorerst manuell auswählen (Radio-Buttons)

**Checkpoint:** User kann dem bestehenden Graph eigene Nodes hinzufügen.

---

### Phase D — LLM-Integration (ca. 2 Stunden)
1. `llm.py`: `propose_branch_type()` mit OpenAI-Call und Fallback
2. GET `/api/llm-propose`: gibt Vorschlag + Erklärung als JSON zurück
3. Frontend: Spinner beim Laden, Vorschlag erscheint dynamisch
4. Radio-Gruppe: LLM-Vorschlag vorausgewählt, andere 4 Typen wählbar
5. `contested`-Flag: wird beim POST gesetzt wenn author_type ≠ llm_proposed_type
6. Contested-Nodes im Graph: gestrichelter Rand

**Checkpoint:** Voller Loop — Branch schreiben → LLM-Vorschlag → bestätigen oder überstimmen → Contested-Signal im Graph.

---

### Phase E — Polish (ca. 1–2 Stunden)
1. `style.css`: Groven-Palette (forest/mint/cream), Outfit-Font via Google Fonts
2. Node-Detailansicht: LLM-Erklärung sichtbar, Contested-Hinweis mit Original-Vorschlag
3. `node.html`: vollständige Einzelansicht mit Lineage-Pfad (Breadcrumb der Ancestors)
4. Status-Badge pro Space (Open / Ready / Decided)
5. Einfache Fehlerbehandlung: LLM-Timeout, leere Felder

**Checkpoint:** Prototyp ist zeigbar. Alle drei Beispiel-Diskussionen sind lesbar und erweiterbar.

---

## 8. Was der Prototyp bewusst weglässt

Folgendes ist dokumentiert als "nicht im Scope" — um scope creep zu verhindern:

| Feature | Warum weggelassen |
|---------|-------------------|
| Nutzer-Auth / Login | Kein Bedarf für Verhaltenstest; Author-Name als Freitextfeld reicht |
| Voting-Mechanismus (Ready/Decided) | Phase 3 im Konzept — Prototyp testet Diskussions-Verhalten, nicht Abstimmung |
| Forest-Filter (nach Typ, Author) | Sinnvoll ab >50 Nodes, kein Verhaltensunterschied bei kleinem Pool |
| Mobile-Optimierung | D3-Graphen auf Mobilgeräten sind schwierig — Desktop-first für Prototyp |
| Mehrsprachigkeit | Alle Beispieldiskussionen auf Deutsch, LLM-Prompts auf Englisch |
| Persistente User-Sessions | Nicht nötig für Verhaltenstest |

---

## 9. CLAUDE.md — Kontext-Datei für Claude Code

Diese Datei in den Projekt-Root legen. Claude Code liest sie automatisch beim Start als dauerhaften Kontext — ersetzt das manuelle Eintippen von Hintergrundinformationen in jeder Session.

```markdown
# Groven Prototype

Behavioral prototype for Groven — a structured deliberation platform.

## Stack
- Python / Flask
- SQLite (file: groven.db)
- Vanilla JS + D3.js v7 (CDN)
- OpenAI API (gpt-4o-mini) for branch type classification
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
```

### Erster Claude Code Befehl

```
claude
```

Dann diesen Prompt einfügen — er enthält alles was Claude Code braucht um den gesamten Prototyp in einem Durchgang zu schreiben:

---

```
Read CLAUDE.md for context.

Implement the complete Groven behavioral prototype in one pass. 
Do not ask for confirmation between files. Write everything.

## Complete file list to create

### Backend
**db.py** — SQLite setup
- init_db(): creates spaces, nodes, votes tables (schema exactly as in CLAUDE.md)
- get_space(id), list_spaces()
- get_node(id), list_nodes(space_id), create_node(**kwargs)
- get_tree(space_id): returns nodes as list of dicts with all fields

**llm.py** — OpenAI integration
- propose_branch_type(parent_body, branch_body, lineage_desc) -> dict
- Uses gpt-4o-mini, structured JSON output
- System prompt: classify branch type from {clarification|extension|reframing|contradiction|synthesis}
- Returns {proposed_type, confidence, explanation} — exactly two sentences in explanation
- Returns None on any error or timeout (8s) — never raises, never blocks

**seed_data.py** — three pre-loaded discussion spaces
Space 1 id="corpus-ai-training": "Sollten AI-Trainings-Lizenzen zeitlich befristet sein?"
  - 6 nodes: 1 Seed + 5 Branches (including one Synthesis connecting two branches)
  - Authors: Amara, Jonas, Yuki, Fatima, Tomás
  - Cover all 5 branch types across the discussion
Space 2 id="corpus-revenue-split": "Wie soll der Royalty-Pool aufgeteilt werden?"
  - 5 nodes: 1 Seed + 4 Branches
  - Authors: Kwame, Lena, Priya, Tomás
Space 3 id="corpus-jury-composition": "Wer darf in der Governance-Jury sitzen?" status=ready
  - 6 nodes: 1 Seed + 5 Branches
  - Authors: Nadia, Felix, Amara, Kwame
Write realistic, substantive discussion content in German. Each node body minimum 3 sentences.
Set llm_proposed_type and llm_explanation on all seed nodes (simulate what the LLM would have said).
Set contested=1 on at least 2 nodes per space.

**main.py** — Flask app
- load .env with python-dotenv
- call init_db() on startup
- call seed_data.load() only if spaces table is empty
Routes:
  GET  /                        → index.html (all spaces)
  GET  /space/<space_id>        → space.html
  GET  /node/<node_id>          → node.html
  POST /api/node                → create node, returns JSON {id, branch_type, contested}
  GET  /api/llm-propose         → query params: parent_id, body, lineage_desc → returns JSON
  GET  /api/tree/<space_id>     → all nodes as JSON for D3

### Templates
**templates/base.html**
- Google Fonts: Outfit (300,400,500,600)
- Link style.css
- Nav: "Groven" logo left, space links right
- Content block

**templates/index.html**
- Page title: "Groven — Prototype"
- Grid of space cards: title, description, node count, status badge (open/ready/decided)
- Each card links to /space/<id>

**templates/space.html**
- Two-column layout: left 60% graph, right 40% contribution form
- Left: <div id="forest-graph"> + load graph.js
- Right: contribution form
  - Toggle: "New Seed" / "New Branch"
  - On Branch: parent selector (dropdown of all nodes in space, show title or first 60 chars)
  - Fields: author (text), title (optional), body (textarea, required), 
    lineage_desc (textarea, required for branches, label: "What does this build on, and where does it take the argument?")
  - "Get LLM suggestion" button: triggers async fetch to /api/llm-propose, shows spinner
  - LLM result box: shows proposed type + explanation, radio group for all 5 types (proposed type pre-selected)
  - Submit button
- Below form: node list (chronological, shows author, type badge, first 100 chars)

**templates/node.html**
- Breadcrumb: lineage path from root to this node (ancestor chain)
- Node header: type badge, author, date
- Body (full text)
- lineage_desc in italic if present
- LLM box: proposed type + explanation. If contested: "LLM proposed [X] — author chose [Y]"
- Children: list of direct branches with type badges and links

### Static files
**static/style.css**
Color palette:
  --dark: #111C17; --forest: #1B4332; --mid: #2D6A4F; --leaf: #40916C;
  --mint: #74C69D; --cream: #F8F5F0; --sand: #D4A373; --text-mid: #374151;
Branch type colors:
  clarification: #3B82F6; extension: #40916C; reframing: #D4A373;
  contradiction: #EF4444; synthesis: #8B5CF6
- Responsive two-column layout for space.html
- Type badges: colored pill labels
- Contested nodes: dashed border, amber background tint
- LLM proposal box: distinct card with mint left border
- Status badges: open=green, ready=amber, decided=forest

**static/graph.js**
- D3.js v7 from CDN (https://cdn.jsdelivr.net/npm/d3@7)
- Fetch /api/tree/<space_id> on load
- Force-directed graph: linkDistance=120, charge=-300
- Node circles: Seeds r=18, Branches r=12
- Node fill: color by branch_type (use same palette as CSS)
- Contested nodes: dashed stroke (#D4A373), stroke-width=2.5
- Edges: stroke=#2D6A4F, opacity=0.4, arrow markers
- Hover tooltip: author, type, first 80 chars of body
- Click on node: fetch /node/<id> content and display in a side panel (or navigate)
- Labels: show author name below each node circle

**static/main.js**
- Form toggle: Seed vs Branch (show/hide parent selector and lineage_desc field)
- LLM propose button: fetch /api/llm-propose, show spinner, render result
- On LLM result: populate radio group, pre-select proposed type
- Form submit: POST /api/node, on success reload graph + add node to list
- No page reload required for any interaction

## Constraints
- No authentication — author is a free text field
- No external CSS framework — vanilla CSS only
- D3.js loaded from CDN, no other JS dependencies
- SQLite only, no migrations needed
- All discussion content in German
- LLM prompts and API calls in English
- flask run on port 5000

When done, print: "Groven prototype complete. Run: source venv/bin/activate && flask run"
```

---

## 10. Offene Fragen nach dem Prototyp

Diese Fragen kann der Prototyp beantworten — sie sollten nach den ersten echten Nutzungssessions ausgewertet werden:

1. Wählen Menschen die LLM-Typ-Vorschläge oder überstimmen sie sie? In welchen Fällen?
2. Verändert die Pflicht zur `lineage_desc` die Qualität der Beiträge?
3. Welche Branch-Typen entstehen am häufigsten? Welche kaum?
4. Werden Contested-Nodes tatsächlich als interessanter wahrgenommen?
5. Bricht die Diskussion früher ab als in einem flachen Thread — oder geht sie tiefer?

---

*Dokument: Groven Prototype Build Plan · v1.0 · März 2026*
