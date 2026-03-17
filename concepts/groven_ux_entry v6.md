# Groven — UX Flow: Einstieg und erster Eindruck
*Arbeitsdokument · Stand März 2026 · wird laufend erweitert*

---

## Designprinzipien für den Einstieg

**Das erste Gefühl ist Neugier.**
Neugier entsteht nicht durch Erklärung, sondern durch das Gefühl dass da etwas ist, das man noch nicht ganz versteht. Der erste Screen erklärt Groven nicht — er zeigt Groven. Echte Gespräche, echte Spuren, echte Tiefe.

**Groven als Verb, nicht als Ort.**
Der Einstieg ist keine Plaza, keine Lobby, kein Marktplatz. Es ist eine Bewegung. Man groovt sich ein — schlendern, sich eingrooven, langsam tiefer werden. Der User ist nicht *in* einem Raum. Er bewegt sich durch Groven. Orientierung bedeutet daher nicht "wo bin ich?" sondern "wie tief bin ich drin — und wie komme ich wieder raus?"

**Tiefe statt Hierarchie.**
Ältere, tiefere Gespräche liegen weiter hinten im Raum. Neueres ist vorne. Der Einstieg zeigt einen archaeologischen Schnitt — man sieht dass da schon etwas ist, und will wissen was.

**Die Plattform ist die Landing Page.**
Öffentliche Diskurse sind ohne Login sichtbar. Es gibt keinen Unterschied zwischen "Website" und "Plattform". Wer ankommt, ist sofort drin — zunächst als Beobachter. Das ist kein Mangel, sondern der erste Schritt des Eingroovens.

---

## Zwei Einstiegsmodi

### Modus A — Stöbern
Ich komme ohne konkretes Ziel. Ich folge meiner Neugier. Ich bewege mich durch bestehende Gespräche, lese, beobachte Tiefe und Verlauf. Kein Account nötig, keine Erwartung.

### Modus B — Anliegen
Ich komme mit etwas. Ich habe eine Frage, ein Problem, eine Idee. Ich schreibe sie in ein Freitextfeld — niedrige Schwelle, kein Formular, keine Kategorisierung vorab. Die KI verknüpft mich mit bestehenden Gesprächen, oder schlägt einen neuen Table vor, oder legt die Frage offen ab ohne sofortigen Table. Auch kein Account nötig.

Das offene Ablegen ohne sofortigen Table ist wichtig: nicht jeder Gedanke soll sofort in eine Gesprächsstruktur gezwungen werden. Manche Dinge sollen erst mal nur da sein.

---

## Schwellentreppe

```
Stufe 1 — Beobachten
  Öffentliche Diskurse lesen
  Im Grove stöbern, Fragmente lesen
  Zeitliche Tiefe erkunden
  → Kein Account

Stufe 2 — Ankommen mit Anliegen
  Freitext einbringen
  KI verknüpft mit bestehenden Gesprächen
    oder schlägt neuen Table vor
    oder legt Frage offen ab
  → Kein Account

── Login-Schwelle ──

Stufe 3 — Teilnehmen
  Antworten, in Gespräch eintreten
  Anliegen aus Stufe 2 wird mitgenommen (Session-State)
  → Account notwendig

Stufe 4 — Mitgestalten
  Steward werden
  Zur Governance von Groven selbst beitragen
  → Account + Rolle
```

**Kritischer Designpunkt:** Das Anliegen aus Stufe 2 muss beim Login-Moment **mitgenommen werden**. Es darf nicht verloren gehen. Der User hat etwas investiert — Gedanken formuliert, Verknüpfungen gesehen. Wenn das nach der Registrierung weg ist, bricht das Vertrauen sofort. Technisch über Session-State lösbar, aber explizit zu designen.

---

## Das Grove

### Namensgebung

Grove (Hain) ist kein separater Raum innerhalb von Groven — es ist derselbe Begriff. Man betritt das Grove. Man ist in Groven weil man sich im Grove bewegt. Der Name trägt den Einstiegsraum bereits in sich.

Grove und Clearing sind nah verwandt — beide lichte Stellen im Wald. Grove hat mehr Dichte, mehr Umgebenheit. Man ist von Gesprächen umgeben, nicht auf einer leeren Fläche. Grove ist der richtigere Begriff.

Die ursprüngliche Assoziation Plaza scheidet aus: Plaza impliziert Aufenthalt, Gleichzeitigkeit, Versammlung. Das Grove ist kein Aufenthaltsort — es ist ein Schwellenraum, ein Orientierungsmoment, eine Bewegung.

### Was man sieht

Das Grove zeigt keine Themen, keine Titel, keine Kategorien. Es zeigt **Momente** — einzelne Fragmente aus laufenden oder archivierten Gesprächen. Den interessantesten Satz. Die schärfste Frage. Den unerwarteten Widerspruch.

Wie Steine die aus dem Boden schauen. Man sieht nicht den vollständigen Diskurs — man sieht Andeutungen. Wenn etwas die Neugier trifft, geht man rein.

Das ist ein bewusster Bruch mit dem Forum- und Thread-Paradigma: Man sieht nicht die Überschrift und entscheidet. Man sieht den lebendigsten Moment eines Gesprächs.

### Kurierung der Fragmente

Die KI wählt und markiert Fragmente als Default. Menschen können jederzeit überschreiben.

Das Kriterium der KI ist nicht Popularität, nicht Aktualität, nicht Engagement — sondern **Repräsentativität des aktuellen Diskursstands**. Das Fragment soll zeigen wo das Gespräch gerade steht. Ein Neugier-Optimierer, kein Engagement-Optimierer.

Dieses Prinzip ist konsistent mit dem Rest der Plattform: KI schlägt vor, Mensch entscheidet.

### Wechsel der Fragmente

Fragmente wechseln wenn sich **inhaltliche Notwendigkeit** ergibt — wenn das Gespräch woanders hingegangen ist. Kein Timer, kein Takt, keine Metrik.

Ein Grove das sich kaum verändert ist kein totes Grove — es ist ein stabiles Gespräch. Veränderung ist kein Zeichen von Lebendigkeit. Stabilität ist kein Zeichen von Stagnation.

### Konsistenz zwischen Modus A und Modus B

In beiden Modi zeigt das Grove Fragmente. In Modus B wählt die KI Fragmente aus Gesprächen die dem Anliegen inhaltlich nahestehen. Die Geste ist dieselbe — nur die Auswahl ist auf den User abgestimmt.

---

## Navigation im Grove

### Zwei Achsen

Die Navigation folgt zwei Wischgesten — gelernte Mechanismen, keine neue Interaktionslogik:

- **Hoch/runter — Tiefenachse.** Man taucht ein oder kommt zurück. Weiter unten liegt Älteres, Tieferes. Neueres ist oben.
- **Links/rechts — Breitenachse.** Man bewegt sich auf derselben Tiefenebene, schaut was nebeneinander liegt.

Auf Desktop: Scrollrad für Tiefe, horizontales Scrollen oder Pfeiltasten für Breite. Trackpad-Nutzer können beides mit Gesten.

Das räumliche Gefühl entsteht durch **Parallax** — Fragmente auf verschiedenen Ebenen bewegen sich unterschiedlich schnell. Das Gehirn konstruiert die Tiefe aus der Relativbewegung, ohne dass eine explizite Z-Achse nötig ist.

Für bewusstes Eintauchen: **Zoomen** als zusätzliche Geste — man nähert sich einem Fragment oder einem Cluster, Dinge werden lesbarer.

### Die Breitenachse wechselt je nach Kontext

- **Ohne Anliegen (Modus A):** Links/rechts folgt zeitlicher Nachbarschaft — parallele Gespräche die ungefähr gleichzeitig entstanden sind.
- **Mit Anliegen (Modus B):** Links/rechts folgt thematischer Nachbarschaft — Fragmente die inhaltlich verwandt sind.

Dieselbe Geste, verschiedene Ordnung dahinter. Der User muss das nicht wissen — er spürt nur dass die Bewegung anders zieht.

### Fragmente die wiederkehren

Fragmente die man links liegen gelassen hat, können später wieder auftauchen. Man versteht etwas erst wenn man den richtigen Kontext dafür hat. Ein Fragment das beim ersten Mal bedeutungslos schien, kann nach drei weiteren Gesprächen plötzlich relevant werden.

Das gibt der KI eine spezifische Aufgabe: nicht nur kuratieren was jetzt relevant ist, sondern erkennen wann etwas das vorhin ignoriert wurde jetzt Sinn ergibt.

### Übergang vom Grove in ein Gespräch

Beim Näherkommen zeigt eine Pflanze mehr von ihrem Fragment — wachsende Vorschau, wachsende Neugier. Das ist Stöbern.

Eintritt ins Gespräch ist ein expliziter Klick / Tap. Kein Hinübergleiten. Die Vorschau ist Vorschau, nicht Eintritt. Der Unterschied ist immer klar.

```
Bewegung + Nähe  →  wachsende Vorschau (Stöbern)
Klick / Tap      →  neuer Screen (Eintritt)
```

Back-Button führt zurück in den Grove, ungefähr an die Stelle wo man war.

---

## Bewegungsdaten

Das Grove erinnert sich an die Bewegungen des Users — was er gesehen hat, was er ignoriert hat, was ihn aufgehalten hat, was er mehrfach besucht hat ohne einzutreten. Diese Daten haben zwei voneinander getrennte Verwendungszwecke mit unterschiedlichen Bedingungen.

### Ebene 1 — Persönliche Spur (Default, kein Opt-In nötig)

Bewegungsdaten gehören dem User. Sie sind für ihn sichtbar als persönliche Spur — nicht als Statistik, sondern als Karte der eigenen Bewegung durch Groven. Sie sind nicht für die Plattform verwertbar.

Für nicht-eingeloggte User: nur Session-Gedächtnis.
Für eingeloggte User: dauerhaftes Bewegungsprofil, das dem User gehört und mit ihm portierbar ist.

**Verbindung zur Federation:** Der User kann seine Bewegungsgeschichte von Instanz zu Instanz mitnehmen. Das Grove einer neuen Instanz kennt ihn — nicht weil die Plattform ihn trackt, sondern weil er seine Geschichte mitgebracht hat.

### Ebene 2 — Plattform-Optimierung (Opt-In, explizit)

User können Bewegungsdaten für die Optimierung der Plattform freigeben — explizit, jederzeit widerrufbar, mit klarer Erklärung was damit passiert und was nicht.

Users die opt-in sind, sind wahrscheinlich die engagiertesten und die Plattform am besten Verstehenden. Das Signal ist hochwertiger als bei einer Plattform die alle trackt.

Das Opt-In ist auch ein politisches Statement: Groven trackt nicht, es fragt.

---

## Instanzen und Kontext

Groven wird installiert und betrieben von Interessensgemeinschaften die bereits einen sozialen und inhaltlichen Zusammenhang haben — CORPUS, Kindergärten, Vereine, Bezirksausschüsse, die Governance von Groven selbst. Es gibt nicht "die" Groven-Plattform, sondern Groven-Instanzen.

**Randnotiz Federation:** Nutzerkonten könnten über Instanzen hinweg portierbar sein — ein föderiertes System nach dem Vorbild von ActivityPub (Mastodon, Lemmy). Avatar, Preferences, Beteiligungsgeschichte und Bewegungsdaten wären von Server zu Server mitnehmbar. Instanzen kennen sich gegenseitig. Das ist kein kurzfristiges Ziel, aber eine konzeptuell konsistente Richtung und sollte in der Architektur nicht verbaut werden.

---

## Die erste eigene Card

Die erste Card ist kein einheitlicher Moment. Sie hat drei mögliche Vorgeschichten — und die Plattform sollte das wissen und den Einstieg entsprechend gestalten.

**1. Das Anliegen aus dem Grove wird zur Card.**
Man hat es formuliert, die KI hat Verknüpfungen gezeigt, man hat sich eingeloggt. Das Anliegen war schon da — es bekommt jetzt nur eine Identität. Niedrigste Schwelle: Text ist bereits vorhanden, man bestätigt nur. Der Übergang von Anliegen zu Card ist fließend, nicht abrupt.

**2. Eine Antwort auf ein Fragment.**
Man ist durch Semantic Zoom in ein Gespräch gerutscht, etwas hat einen berührt, man will reagieren. Die Card entsteht als direkte Reaktion auf etwas Bestehendes — sie hat bereits einen natürlichen Link.

**3. Ein neuer Gedanke aus dem Stöbern.**
Das Grove hat etwas ausgelöst ohne dass ein konkretes Fragment den Anstoß gegeben hat. Man will etwas Neues anfangen. Höchste Schwelle der drei — aber auch die freieste Geste.

### Das Formulieren einer Card

Man schreibt einfach. Kein Formular, kein Titel, keine Kategorisierung, keine Entscheidung über Zuordnung vorab. Reiner Gedankenfluss.

Die KI macht danach drei Dinge — unsichtbar, im Hintergrund:

**Klassifizieren** — was ist das für eine Card? Frage, Behauptung, Erfahrung, Vorschlag?

**Verorten** — wo gehört das hin? Welchem bestehenden Gespräch schließt es an, an welcher Stelle, mit welchem Link-Typ?

**Vorschlagen** — sie zeigt dem User das Ergebnis als Vorschlag: "Das klingt wie eine Frage. Es könnte an dieses Gespräch anschließen — oder ein neues eröffnen." User bestätigt, korrigiert, oder ignoriert.

### Die KI bewertet nicht — sie verortet

Die KI darf nie das Gefühl erzeugen dass sie den Gedanken des Users bewertet. Sie spricht ausschließlich über Beziehungen, nie über Wert.

Verboten:
- "Das ist ein interessanter Gedanke."
- "Gute Frage."
- "Das scheint wichtig zu sein."
- Implizites Loben durch Begeisterung im Ton.

Erlaubt:
- "Hier könnte das anschließen."
- "Das klingt verwandt mit."
- "Das könnte eine Frage sein — oder eine Behauptung."

Das ist eine strenge Anforderung an das Prompt-Design. LLMs sind trainiert höflich und bestätigend zu sein. Für Groven muss das in diesem Kontext explizit unterbunden werden.

**Die demokratische Dimension:** Wenn die KI Gedanken lobt, entsteht implizit eine Hierarchie. Manche Gedanken werden besser behandelt als andere — möglicherweise nach Sprachqualität, Ausdrucksstärke, kultureller Vertrautheit. Das widerspricht dem Grundprinzip der Plattform. Die KI als neutraler Kartograf bedeutet: keine Meinung über Gedanken, nur Orientierung im Raum.

---

## Offene Gedanken und das Wachstum der Landschaft

### Ein Gedanke der liegengelassen wird

Wenn der User den KI-Vorschlag zur Verortung einer Card ignoriert, verschwindet der Gedanke nicht. Er bleibt offen — unverknüpft, unklassifiziert, aber vorhanden. Er liegt im Grove wie ein Samen.

Nicht verloren. Nicht vergessen. Noch nicht gewachsen.

### Visuelles Wachstum als Zustandsdarstellung

Die visuelle Größe eines Gesprächs ist kein Qualitätssignal — es ist ein Aktivitäts- und Tiefensignal. Die Metapher ist konsequent pflanzlich:

```
Samen          →  Einzelner offener Gedanke, noch unverknüpft
Pflänzchen     →  Zwei oder mehr zusammengeführte Gedanken,
                  oder erste Antwort auf eine Card
Strauch        →  Aktiver Table mit mehreren Teilnehmern
Baum           →  Langer, tiefer, verzweigter Diskurs
Alter Baum     →  Abgeschlossener oder archivierter Diskurs
                  mit reicher Geschichte
```

### Zusammenführung durch die KI

Wenn ein neuer User einen Gedanken einbringt der einem liegenden Samen verwandt ist, erkennt die KI die Verbindung und schlägt die Zusammenführung vor. Aus zwei Samen wird ein Pflänzchen. Das Wachstum ist sichtbar — auch visuell.

### Die Grove-Landschaft als Gedächtnis der Gemeinschaft

Weiter hinten im Grove stehen die alten Bäume — lange, tiefe, abgeschlossene Diskurse. Vorne die neuen Pflänzchen und Samen — aktuelle, offene, noch wachsende Gedanken. Der archaeologische Schnitt ist eine Landschaft. Man sieht die Geschichte der Gemeinschaft als Topografie.

Das ist kein Interface. Das ist ein Ort.

---

## Offen / Nächste Schritte

- Visuelles Mockup des Groves — Landschaft, Pflanzenmechanik, Tiefenachse, Semantic Zoom
- Wie sieht das Grove auf Mobile konkret aus — Parallax, Wischgesten, Pflanzendarstellung
- Welche Diskurse sind öffentlich, welche privat — wer entscheidet das pro Instanz?
- Wie fühlt sich der Login-Moment tonal an — nicht was man eingibt, sondern wie die Plattform spricht?
- Anliegen aus Stufe 2 beim Login-Moment mitführen (Session-State — explizit zu designen)
