"""
Seed data for Groven prototype.
Three pre-loaded discussion spaces in the CORPUS context.
All content in German.
"""

import db

SPACES = [
    {
        "id": "corpus-ai-training",
        "title": "Sollten AI-Trainings-Lizenzen zeitlich befristet sein?",
        "description": "Diskussion über die zeitliche Begrenzung von Lizenzen, die das Training von KI-Modellen mit urheberrechtlich geschützten Werken erlauben.",
        "status": "open"
    },
    {
        "id": "corpus-revenue-split",
        "title": "Wie soll der Royalty-Pool zwischen Urhebern aufgeteilt werden?",
        "description": "Debatte über das Verteilungsmodell für Einnahmen aus KI-Trainingslizenzen: gleiche Teile, gewichtete Anteile, oder hybride Modelle.",
        "status": "open"
    },
    {
        "id": "corpus-jury-composition",
        "title": "Wer darf in der Governance-Jury sitzen?",
        "description": "Frage nach der Zusammensetzung und Auswahl der Governance-Jury, die über Plattform-Entscheidungen abstimmt.",
        "status": "ready"
    }
]

# Node IDs — stable for cross-references
# Space 1: corpus-ai-training
S1_SEED    = "s1-seed-amara"
S1_B1      = "s1-branch1-jonas"
S1_B2      = "s1-branch2-yuki"
S1_B3      = "s1-branch3-fatima"
S1_B4      = "s1-branch4-amara"
S1_B5      = "s1-branch5-jonas"

# Space 2: corpus-revenue-split
S2_SEED    = "s2-seed-kwame"
S2_B1      = "s2-branch1-lena"
S2_B2      = "s2-branch2-kwame"
S2_B3      = "s2-branch3-priya"
S2_B4      = "s2-branch4-tomas"

# Space 3: corpus-jury-composition
S3_SEED    = "s3-seed-nadia"
S3_B1      = "s3-branch1-felix"
S3_B2      = "s3-branch2-amara"
S3_B3      = "s3-branch3-kwame"
S3_B4      = "s3-branch4-nadia"
S3_B5      = "s3-branch5-felix"

NODES = [
    # =========================================================================
    # SPACE 1: corpus-ai-training
    # =========================================================================
    {
        "id": S1_SEED,
        "space_id": "corpus-ai-training",
        "parent_id": None,
        "node_type": "seed",
        "branch_type": None,
        "author": "Amara",
        "title": "Zeitliche Befristung von AI-Trainingslizenzen",
        "body": "Eine Lizenz, die das Training eines KI-Modells erlaubt, sollte automatisch nach 2 Jahren ablaufen. Die Modelle, die damit trainiert wurden, existieren weiter — aber neue Trainingsläufe benötigen eine neue Lizenz. Das schafft einen regelmäßigen Markt und verhindert, dass einmalige Lizenzen ewige Rechte begründen. Urheber behalten so die Möglichkeit, ihre Konditionen an veränderte Marktbedingungen anzupassen, statt einmal pauschal zuzustimmen.",
        "lineage_desc": None,
        "llm_proposed_type": None,
        "llm_explanation": None,
        "contested": 0
    },
    {
        "id": S1_B1,
        "space_id": "corpus-ai-training",
        "parent_id": S1_SEED,
        "node_type": "branch",
        "branch_type": "extension",
        "author": "Jonas",
        "title": "Modellgeneration als Lizenz-Trigger",
        "body": "Das Prinzip ließe sich auf Modell-Versionen ausweiten: Jedes neue Major-Release eines Modells (GPT-5, Gemini 3 etc.) würde eine neue Lizenzrunde erfordern — selbst wenn die Trainingsdaten identisch sind. Damit wird jede Modellgeneration zum Lizenz-Trigger. Das verhindert, dass ein einmaliger Datendeal alle zukünftigen Iterationen eines Systems abdeckt, und gibt Urhebern bei jedem Technologiesprung erneut Verhandlungsmacht.",
        "lineage_desc": "Baut auf Amaras Befristungsidee auf und erweitert sie von zeitlicher auf versionsbezogene Befristung. Ziel: noch engere Kopplung an den technologischen Fortschritt.",
        "llm_proposed_type": "extension",
        "llm_explanation": "This branch carries the time-based licensing idea into version-based territory that the parent did not anticipate. This matches the extension type because it adds a new dimension (model versioning) to the original concept.",
        "contested": 0
    },
    {
        "id": S1_B2,
        "space_id": "corpus-ai-training",
        "parent_id": S1_SEED,
        "node_type": "branch",
        "branch_type": "clarification",
        "author": "Yuki",
        "title": "Definition von 'neuer Trainingslauf'",
        "body": "Unklar bleibt: Was zählt als 'neuer Trainingslauf'? Fine-Tuning auf einem bestehenden Basismodell? Continual Learning auf Live-Daten? Destillation in ein kleineres Modell? Der Begriff muss technisch definiert werden, sonst ist die Klausel nicht durchsetzbar. Ohne klare technische Abgrenzung entstehen Grauzonen, die von großen Unternehmen systematisch ausgenutzt werden können.",
        "lineage_desc": "Schärft den zentralen Begriff aus Amaras Seed. Ohne diese Klärung ist die gesamte Befristungsidee juristisch angreifbar.",
        "llm_proposed_type": "extension",
        "llm_explanation": "This branch raises new technical questions about the definition of 'training run' not addressed in the parent. This extends the original idea into implementation territory.",
        "contested": 1
    },
    {
        "id": S1_B3,
        "space_id": "corpus-ai-training",
        "parent_id": S1_SEED,
        "node_type": "branch",
        "branch_type": "contradiction",
        "author": "Fatima",
        "title": "Befristung verschiebt das Problem nur",
        "body": "Zeitliche Befristung löst das Problem nicht — sie verschiebt es. Verlage und Plattformen werden 2-Jahres-Lizenzen pauschal für alle Zukunfts-Modelle ausstellen, um den Verwaltungsaufwand zu vermeiden. Das Ergebnis: Ewige Rechte durch zeitlich unbegrenzte Rahmenverträge. Die Marktmacht liegt weiterhin bei den Plattformen, die solche Rahmenverträge diktieren können, nicht bei einzelnen Urhebern.",
        "lineage_desc": "Widerspricht Amaras Grundannahme, dass Befristung das Machtgefälle korrigiert. Argumentiert, dass die Struktur des Lizenzmarkts die Befristung aushebelt.",
        "llm_proposed_type": "contradiction",
        "llm_explanation": "This branch directly challenges the effectiveness of the parent's time-based licensing proposal. It identifies a fundamental conflict with the parent's assumption that time limits create ongoing negotiation power.",
        "contested": 0
    },
    {
        "id": S1_B4,
        "space_id": "corpus-ai-training",
        "parent_id": S1_B3,
        "node_type": "branch",
        "branch_type": "reframing",
        "author": "Amara",
        "title": "Nicht Befristung ist das Problem — Pauschallizenzen sind es",
        "body": "Fatimas Einwand trifft zu — aber er ist kein Argument gegen Befristung, sondern gegen Pauschallizenzen. Die eigentliche Schutzmaßnahme wäre: Lizenzen müssen modellspezifisch sein und dürfen keine Blanko-Klausel für zukünftige Systeme enthalten. Das Problem ist nicht die Zeitachse, sondern der Geltungsbereich. Eine Lizenz für GPT-5 darf nicht automatisch GPT-6 einschließen — unabhängig davon, ob sie zeitlich befristet ist oder nicht.",
        "lineage_desc": "Nimmt Fatimas Widerspruch ernst, interpretiert ihn aber um: nicht die Befristung ist falsch, sondern der Scope der Lizenzen muss begrenzt werden.",
        "llm_proposed_type": "contradiction",
        "llm_explanation": "This branch opposes the parent's conclusion by arguing the problem is scope, not time limits. It proposes a divergent direction from the parent's criticism.",
        "contested": 1
    },
    {
        "id": S1_B5,
        "space_id": "corpus-ai-training",
        "parent_id": S1_B1,
        "node_type": "branch",
        "branch_type": "synthesis",
        "author": "Jonas",
        "title": "Konsistentes Prinzip: Modell-gebundene, nicht-übertragbare Lizenzen",
        "body": "Wenn wir Branch 1 (Modellgeneration als Trigger) und Branch 4 (keine Blanko-Zukunftsklauseln) zusammennehmen, ergibt sich ein konsistentes Prinzip: Lizenzen sind an konkrete Modell-Versionen gebunden, laufen mit der Modellgeneration ab, und können nicht vorab für unbekannte zukünftige Systeme erteilt werden. Dieses Prinzip ist technisch überprüfbar, juristisch formulierbar und gibt Urhebern bei jedem Versionssprung erneut Verhandlungsmacht.",
        "lineage_desc": "Verbindet die Modellversions-Idee (Branch 1) mit der Anti-Pauschal-Klausel (Branch 4) zu einem einheitlichen Lizenzprinzip.",
        "llm_proposed_type": "synthesis",
        "llm_explanation": "This branch explicitly connects two earlier lines of argument into a unified licensing principle. This matches the synthesis type as it reconciles the version-trigger and anti-blanket-clause ideas.",
        "contested": 0
    },

    # =========================================================================
    # SPACE 2: corpus-revenue-split
    # =========================================================================
    {
        "id": S2_SEED,
        "space_id": "corpus-revenue-split",
        "parent_id": None,
        "node_type": "seed",
        "branch_type": None,
        "author": "Kwame",
        "title": "Gleiche Teile pro Urheber",
        "body": "Der einfachste faire Ansatz: gleiche Teile pro Urheber, der zugestimmt hat. Kein Gewichtungssystem, keine Komplexität, keine Möglichkeit für große Player die Verteilung zu dominieren. Gleichheit als Prinzip verhindert die Reproduktion bestehender Machtstrukturen im Verteilungsmodell. Was als 'unfair einfach' kritisiert werden kann, ist in Wahrheit der einzige Ansatz, der keine versteckten Bewertungshierarchien einführt.",
        "lineage_desc": None,
        "llm_proposed_type": None,
        "llm_explanation": None,
        "contested": 0
    },
    {
        "id": S2_B1,
        "space_id": "corpus-revenue-split",
        "parent_id": S2_SEED,
        "node_type": "branch",
        "branch_type": "contradiction",
        "author": "Lena",
        "title": "Gleiche Teile belohnen Quantität, nicht Relevanz",
        "body": "Gleiche Teile belohnen Quantität, nicht Relevanz. Wer 10.000 generische Loop-Samples hochlädt, bekommt dasselbe wie jemand, der 50 sorgfältig kuratierte, stilprägende Aufnahmen einbringt. Das pervertiert den Sinn des Pools. Ein Verteilungsmodell muss zumindest ansatzweise die qualitative Dimension der Beiträge reflektieren — sonst entsteht ein Anreiz zur Massenproduktion statt zur Qualitätsarbeit.",
        "lineage_desc": "Widerspricht Kwames Gleichheitsansatz direkt: Gleichheit pro Urheber ignoriert den qualitativen Unterschied zwischen Beiträgen und setzt falsche Anreize.",
        "llm_proposed_type": "contradiction",
        "llm_explanation": "This branch directly opposes the parent's equal-share model by identifying a fundamental flaw in its incentive structure. It proposes that quality must factor into distribution, contradicting the parent's simplicity principle.",
        "contested": 0
    },
    {
        "id": S2_B2,
        "space_id": "corpus-revenue-split",
        "parent_id": S2_B1,
        "node_type": "branch",
        "branch_type": "extension",
        "author": "Kwame",
        "title": "Gleichheit pro Werk mit Obergrenze pro Urheber",
        "body": "Lenas Einwand ist berechtigt. Eine mögliche Antwort: nicht Gleichheit pro Urheber, sondern Gleichheit pro Werk — aber mit einer Obergrenze pro Urheber (z.B. max. 200 Werke zählen zur Berechnung). Verhindert Spam, erkennt Tiefe an. Dieses Modell bewahrt die Einfachheit des ursprünglichen Vorschlags, adressiert aber das Spam-Problem durch eine natürliche Begrenzung, die große Kataloge nicht übermäßig privilegiert.",
        "lineage_desc": "Nimmt Lenas Kritik auf und erweitert den Gleichheitsansatz: statt pro Kopf wird pro Werk verteilt, mit einer Obergrenze gegen Spam.",
        "llm_proposed_type": "reframing",
        "llm_explanation": "This branch presents the same equality concern from a different angle — per-work instead of per-creator. It reinterprets the distribution unit rather than extending into new territory.",
        "contested": 1
    },
    {
        "id": S2_B3,
        "space_id": "corpus-revenue-split",
        "parent_id": S2_SEED,
        "node_type": "branch",
        "branch_type": "reframing",
        "author": "Priya",
        "title": "Gleichheit als ehrlichste Option bei unmessbarer Relevanz",
        "body": "Die Frage 'gleich vs. gewichtet' setzt voraus, dass wir Relevanz messen können. Können wir das nicht verlässlich, ist Gleichheit nicht der schwächste Kompromiss — sondern die einzig ehrliche Option. Jede Gewichtung impliziert eine Bewertungsinstanz, und jede Bewertungsinstanz reproduziert Machtstrukturen. Solange kein transparentes, community-validiertes Relevanzmaß existiert, ist die Ablehnung von Gewichtung keine Naivität, sondern epistemische Bescheidenheit.",
        "lineage_desc": "Nimmt Kwames Position und interpretiert sie neu: nicht als 'einfachste Lösung', sondern als epistemologisch notwendige Konsequenz der Unmessbarkeit von Relevanz.",
        "llm_proposed_type": "extension",
        "llm_explanation": "This branch adds a philosophical justification for equal shares that goes beyond the parent's practical argument. It extends the reasoning into epistemological territory.",
        "contested": 1
    },
    {
        "id": S2_B4,
        "space_id": "corpus-revenue-split",
        "parent_id": S2_B1,
        "node_type": "branch",
        "branch_type": "clarification",
        "author": "Tomás",
        "title": "Drei verschiedene Relevanz-Metriken, drei Verteilungen",
        "body": "Branch 1 spricht von 'Relevanz' — aber Relevanz für wen? Für das AI-Training (wie oft wurde das Sample tatsächlich im Training verwendet)? Für den Markt (wie bekannt ist der Urheber, wie hoch die Streaming-Zahlen)? Für die Community (peer-bewertete Qualität durch andere Contributors)? Drei verschiedene Metriken, drei verschiedene Verteilungen. Bevor wir über Gewichtung sprechen, müssen wir klären, welche Art von Relevanz wir meinen.",
        "lineage_desc": "Klärt den unscharfen Relevanzbegriff in Lenas Widerspruch. Ohne diese Unterscheidung ist die Forderung nach 'Relevanz-basierter Verteilung' nicht operationalisierbar.",
        "llm_proposed_type": "clarification",
        "llm_explanation": "This branch sharpens the meaning of 'relevance' used in the parent by distinguishing three concrete metrics. It makes precise what the parent left ambiguous without adding new argumentation.",
        "contested": 0
    },

    # =========================================================================
    # SPACE 3: corpus-jury-composition
    # =========================================================================
    {
        "id": S3_SEED,
        "space_id": "corpus-jury-composition",
        "parent_id": None,
        "node_type": "seed",
        "branch_type": None,
        "author": "Nadia",
        "title": "Sortition statt Wahl für die Governance-Jury",
        "body": "Die Jury sollte durch Sortition — zufällige Auswahl mit Schichtung — aus dem Contributor-Pool gezogen werden. Keine Wahlen, keine Selbstnominierung, keine Akkumulation von Entscheidungsmacht durch wiederholte Teilnahme. Demokratische Legitimität entsteht hier nicht durch Wahl, sondern durch Repräsentativität. Dieses Modell ist erprobt in Citizens' Assemblies weltweit und vermeidet die Professionalisierung von Governance-Rollen.",
        "lineage_desc": None,
        "llm_proposed_type": None,
        "llm_explanation": None,
        "contested": 0
    },
    {
        "id": S3_B1,
        "space_id": "corpus-jury-composition",
        "parent_id": S3_SEED,
        "node_type": "branch",
        "branch_type": "extension",
        "author": "Felix",
        "title": "Drei Schichtungs-Dimensionen für die Sortition",
        "body": "Schichtung sollte mindestens nach drei Achsen erfolgen: Herkunftsregion (Global North / Global South / andere), Genre-Zugehörigkeit (elektronisch / akustisch / Folk-Tradition / andere), und Karrierestufe (emerging / established). Ohne diese drei Dimensionen reproduziert auch Sortition strukturelle Ungleichgewichte. Die konkrete Gewichtung innerhalb jeder Dimension muss proportional zur Contributor-Basis sein, nicht paritätisch — sonst werden kleine Gruppen überrepräsentiert.",
        "lineage_desc": "Erweitert Nadias Sortitions-Vorschlag um konkrete Schichtungsdimensionen. Ohne diese Spezifikation bleibt Sortition ein abstraktes Prinzip.",
        "llm_proposed_type": "extension",
        "llm_explanation": "This branch specifies the concrete stratification dimensions for the parent's sortition proposal. It carries the abstract idea into implementable territory the parent did not address.",
        "contested": 0
    },
    {
        "id": S3_B2,
        "space_id": "corpus-jury-composition",
        "parent_id": S3_SEED,
        "node_type": "branch",
        "branch_type": "clarification",
        "author": "Amara",
        "title": "Offene Fragen: Dauer und Wiederwählbarkeit",
        "body": "Wie lange dauert eine Jury-Periode? Und kann dieselbe Person in der nächsten Runde erneut ausgelost werden? Das beeinflusst, ob sich Expertise aufbaut oder ob Kontinuität strukturell verhindert wird. Eine zu kurze Periode (z.B. 3 Monate) verhindert Einarbeitung; eine zu lange (z.B. 2 Jahre) widerspricht dem Rotationsprinzip. Die Wiederwählbarkeit ist der kritischste Parameter: Erlaubt man sie, entsteht de facto eine informelle Elite.",
        "lineage_desc": "Identifiziert zwei zentrale Parameter, die in Nadias Vorschlag unspezifiziert sind: Jury-Dauer und Wiederwählbarkeit. Ohne Klärung bleibt das Modell unvollständig.",
        "llm_proposed_type": "extension",
        "llm_explanation": "This branch raises new operational questions about jury duration and re-selection that go beyond the parent's proposal. It extends the discussion into implementation details.",
        "contested": 1
    },
    {
        "id": S3_B3,
        "space_id": "corpus-jury-composition",
        "parent_id": S3_SEED,
        "node_type": "branch",
        "branch_type": "contradiction",
        "author": "Kwame",
        "title": "Sortition funktioniert nicht bei kleinen Pools",
        "body": "Sortition funktioniert bei großen Pools. Bei CORPUS-Launch mit weniger als 50 Contributors ist der Pool zu klein für bedeutungsvolle Zufallsauswahl. In kleinen Communities führt Sortition zu unrepräsentativen Zufallsstichproben — klassische Urne-Logik gilt erst ab ca. 150-200 Teilnehmenden. Darunter ist die Varianz so groß, dass einzelne Ziehungen extreme Zusammensetzungen produzieren können. Das Vertrauen in die Legitimität des Gremiums würde bei den ersten 'unglücklichen' Ziehungen sofort erodieren.",
        "lineage_desc": "Widerspricht Nadias Sortitions-Vorschlag mit einem statistischen Argument: Bei der erwarteten Anfangsgröße von CORPUS funktioniert Zufallsauswahl nicht verlässlich.",
        "llm_proposed_type": "reframing",
        "llm_explanation": "This branch recontextualizes the sortition proposal by shifting the frame from democratic principle to statistical feasibility. It offers a fundamentally different lens on the same mechanism.",
        "contested": 1
    },
    {
        "id": S3_B4,
        "space_id": "corpus-jury-composition",
        "parent_id": S3_B3,
        "node_type": "branch",
        "branch_type": "reframing",
        "author": "Nadia",
        "title": "Nicht gegen Sortition — für eine Übergangsregelung",
        "body": "Kwames Einwand ist statistisch korrekt. Aber das Argument gegen Sortition bei kleinen Pools ist kein Argument für Wahlen — es ist ein Argument für eine Übergangsregelung. In Phase 1 (unter 100 Contributors): alle partizipieren, keine Selektion. Ab 100: Sortition greift. So wird die statistische Schwäche kleiner Stichproben vermieden, ohne auf das demokratischere Modell langfristig zu verzichten. Der Wechsel von Phase 1 zu Phase 2 sollte automatisch ausgelöst werden, nicht durch Abstimmung.",
        "lineage_desc": "Nimmt Kwames statistisches Argument ernst, deutet es aber um: statt Sortition generell abzulehnen, wird ein Phasenmodell vorgeschlagen.",
        "llm_proposed_type": "reframing",
        "llm_explanation": "This branch takes the parent's statistical objection and reinterprets it as a timing issue rather than a fundamental flaw. It offers a different interpretive angle on the same observation.",
        "contested": 0
    },
    {
        "id": S3_B5,
        "space_id": "corpus-jury-composition",
        "parent_id": S3_B1,
        "node_type": "branch",
        "branch_type": "synthesis",
        "author": "Felix",
        "title": "Zusammenfassung: Phasenmodell mit Schichtung",
        "body": "Zusammenfassung des aktuellen Standes: Sortition mit Schichtung (Branch 1) gilt ab 100 Contributors (Branch 4). Schichtungsdimensionen: Region, Genre, Karrierestufe. Davor: volle Partizipation aller Contributors. Offen bleibt Branch 2: Jury-Dauer und Wiederwählbarkeit muss die Jury in ihrer ersten Sitzung selbst festlegen — das ist kein Bug, sondern ein Feature: die erste Jury definiert ihre eigene Nachfolgelogik. Dieses Prinzip der konstitutionellen Selbstbestimmung ist zentral für die Legitimität des Gremiums.",
        "lineage_desc": "Verbindet die Schichtungsdimensionen (Branch 1), das Phasenmodell (Branch 4) und die offene Frage der Jury-Dauer (Branch 2) zu einer kohärenten Zusammenfassung.",
        "llm_proposed_type": "extension",
        "llm_explanation": "This branch adds the novel idea that the first jury should define its own succession rules. It extends beyond mere synthesis into new governance territory.",
        "contested": 1
    },
]


def load():
    """Load all seed data into the database."""
    for space in SPACES:
        db.create_space(**space)

    for node in NODES:
        db.create_node(**node)
