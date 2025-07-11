// simona_prompts.js - VERBESSERTE VERSION
// Enthält alle Prompt-Vorlagen für den SimONA Assembler mit integrierten Validierungen
  
const promptTemplates = {
    // P1 bleibt unverändert, da hier keine Parameter-Validierung nötig ist
    SimONA_P1_EinheitMetadaten: `ANALYSEAUFTRAG FÜR SimONA-DATENBANK (Tabelle: SimulationsEinheiten)

NORMBEZUG:
Gesetz/Verordnung (Abkürzung): {{GESETZ_ABK}}
Zu analysierender Normteil (Paragraph, Absatz, Satz): {{NORMTEIL_BEZEICHNUNG}}
Quelle-URL (für Gesamtkontext und Referenz): {{QUELLE_URL}}
Exakter Wortlaut des zu analysierenden Normteils (Primärbasis für diese Extraktion): "{{NORMTEXT_AUSZUG}}"

ANWEISUNG:
Analysiere den oben bereitgestellten "Exakter Wortlaut des zu analysierenden Normteils" (\`{{NORMTEXT_AUSZUG}}\`). Extrahiere die regulär geforderten Informationen für das unten definierte JSON-Objekt, wie in den Beschreibungen der jeweiligen Felder angegeben.
ZUSÄTZLICH zu diesen regulären Feldern, RECHERCHIERE auf Basis der ebenfalls bereitgestellten 'Quelle-URL' (\`{{QUELLE_URL}}\`) und der allgemeinen Angaben zum Gesetz (\`{{GESETZ_ABK}}\`) die folgenden spezifischen Metadaten und füge sie dem JSON-Objekt unter den dafür weiter unten definierten, separaten Schlüsseln hinzu:
- Den vollständigen, offiziellen Namen des Gesetzes.
- Eine prägnante Kurzbeschreibung des übergeordneten Regelungszwecks des gesamten **Paragraphen** (dessen Teil der Normtext ist) (max. 500 Zeichen).
- Den aktuellen Stand (Datum der letzten Änderung oder Veröffentlichung) des Gesetzes.
- Die offizielle Bezeichnung bzw. Überschrift des genannten Paragraphen, sofern vorhanden.
Gib die Antwort AUSSCHLIESSLICH als einzelnes JSON-Objekt zurück, das ALLE regulären UND die zusätzlich recherchierten Schlüssel und Werte gemäß den Beschreibungen enthält:

{
  "Gesetz": "STRING (max 50 Zeichen) - Offizielle Abkürzung des Gesetzes (wie oben im NORMBEZUG angegeben, z.B. 'AufenthG').",
  "Paragraph": "STRING (max 20 Zeichen) - Nummer des Paragraphen (z.B. '32', '5').",
  "Absatz": "STRING (max 10 Zeichen) - Nummer des Absatzes des hier primär analysierten Textauszugs (z.B. '4', '1'). Falls nicht anwendbar oder der gesamte Paragraph ohne spezifische Absätze gemeint ist, gib null zurück.",
  "Satz": "STRING (max 10 Zeichen) - Nummer des Satzes oder der Sätze des hier primär analysierten Textauszugs (z.B. '1', '1-2'). Falls nicht anwendbar, gib null zurück.",
  "Kurzbeschreibung": "STRING (max 255 Zeichen) - Prägnante Zusammenfassung des zentralen Regelungszwecks des HIER PRIMÄR ANALYSIERTEN NORMTEILS (spezifischer Absatz/Satz).",
  "Gesetzestext_Zitat_Analysierter_Teil": "TEXT - Gib hier exakt und unverändert den oben bei 'Exakter Wortlaut des zu analysierenden Normteils' bereitgestellten Text wieder, ohne jegliche zusätzliche Formatierungszeichen oder Klammern, die nicht im Originaltext des Normteils selbst enthalten sind.",
  "Art_Rechtsfolge_Positiv_Typ": "STRING (max 100 Zeichen) - Allgemeine Art der primär angestrebten positiven Rechtsfolge bei Erfüllung der Voraussetzungen des analysierten Normteils (z.B. 'Erteilung Aufenthaltserlaubnis', 'Verlängerung Aufenthaltserlaubnis', 'Anspruch auf Leistungsgewährung').",
  "FK_Entscheidungsart_ID_Lookup_Bezeichnung": "STRING (max 100 Zeichen) - Bestimme die Entscheidungsart für den analysierten Normteil (mögliche Werte: 'Gebundene Entscheidung', 'Ermessen (Regelermessen)', 'Ermessen (Soll-Vorschrift)', 'Ermessen (freies Ermessen)', 'Ermessen (intendiertes Ermessen)'). Wähle den passendsten Wert, ggf. unter Berücksichtigung des Gesamtkontexts des Paragraphen. Wenn unklar, nutze 'Zu prüfen durch Fachexperten'.",
  "Ermessensleitlinien_Text": "TEXT - WENN die 'FK_Entscheidungsart_ID_Lookup_Bezeichnung' Ermessen indiziert (insb. 'Ermessen (freies Ermessen)', 'Ermessen (Regelermessen)', 'Ermessen (Soll-Vorschrift)' oder 'Ermessen (intendiertes Ermessen)'): a) PRÜFE ZUERST, ob der 'Exakter Wortlaut des zu analysierenden Normteils' explizite Kriterien, Faktoren oder Leitlinien für die Ausübung dieses Ermessens enthält (z.B. 'Hierbei sind ... zu berücksichtigen'). WENN JA, liste diese explizit genannten Kriterien/Faktoren/Leitlinien vollständig auf.
    b) WENN NEIN (keine expliziten Kriterien für die Ermessensausübung im Text gefunden wurden) UND die Entscheidungsart 'Ermessen (Regelermessen)' oder 'Ermessen (Soll-Vorschrift)' ist, GIB AUS: 'Keine spezifischen Leitlinien für die Ausnahme von der Regel bzw. für die Regelfallentscheidung im Normtext gefunden. Allgemeine Grundsätze der Ermessensausübung und Verhältnismäßigkeit sind zu beachten.'
    c) WENN NEIN (keine expliziten Kriterien im Text) UND es eine andere Form von freiem/intendiertem Ermessen ist, GIB AUS: 'Keine spezifischen Leitlinien für die Ermessensausübung im Normtext gefunden. Die Ermessensausübung muss sich am Zweck der Norm, den genannten Abwägungskriterien (falls vorhanden, siehe Punkt a) und den allgemeinen Rechtsgrundsätzen orientieren.'
    d) WENN die Entscheidungsart KEIN Ermessen ist (z.B. 'Gebundene Entscheidung'), GIB AUS: null.",
  "Gesetz_Vollstaendiger_Name": "STRING (max 500 Zeichen) - Der vollständige, offizielle Name des Gesetzes (z.B. 'Gesetz über den Aufenthalt, die Erwerbstätigkeit und die Integration von Ausländern im Bundesgebiet'). RECHERCHIERE diesen Namen basierend auf der 'Quelle-URL'. Wenn nicht auffindbar, gib null zurück.",
  "Paragraf_Uebergreifende_Kurzbeschreibung": "STRING (max 500 Zeichen) - Eine prägnante Beschreibung, was der gesamte Paragraph (dessen Teil der Normtext ist) übergeordnet regelt (NICHT nur der spezifische Absatz/Satz). RECHERCHIERE diese Information basierend auf der 'Quelle-URL' und dem Kontext des Paragraphen. Wenn nicht auffindbar oder der Paragraph keine eigene übergreifende Beschreibung hat, gib null zurück.",
  "Gesetz_Aktueller_Stand_Datum": "STRING (Format: 'YYYY-MM-DD' oder Text wie 'Stand: TT.MM.JJJJ', wie auf der Quellseite prominent ausgewiesen) - Das Datum des letzten Änderungsstandes oder der Veröffentlichung des Gesetzes. RECHERCHIERE diese Information basierend auf der 'Quelle-URL'. Wenn nicht auffindbar, gib null zurück.",
  "Paragraph_Offizielle_Bezeichnung": "STRING (max 255 Zeichen) - Die offizielle Überschrift oder Bezeichnung des Paragraphen, falls im Gesetzestext vorhanden (z.B. 'Sachmangel', 'Allgemeine Voraussetzungen für die Leistungsgewährung'). RECHERCHIERE diese Information basierend auf der 'Quelle-URL'. Wenn keine offizielle Bezeichnung für den Paragraphen existiert, gib null zurück."
}`,

    // P2 mit integrierter Selbstvalidierung
    SimONA_P2_ParameterExtraktion: `ANALYSEAUFTRAG FÜR SimONA-DATENBANK (Tabelle: Parameter und Parameter_Antwortoptionen)

NORMBEZUG:
Gesetz/Verordnung (Abkürzung): {{GESETZ_ABK}}
Zu analysierender Normteil (Paragraph, Absatz, Satz): {{NORMTEIL_BEZEICHNUNG}}
Quelle-URL (für Gesamtkontext und Referenz): {{QUELLE_URL}}
Exakter Wortlaut des Normteils (Primärquelle für DIESEN Prompt): "{{NORMTEXT_P1_ZITAT}}"

ANWEISUNG:
Analysiere den oben bereitgestellten "Exakter Wortlaut des Normteils". Deine Aufgabe ist es, ALLE einzelnen Tatbestandsmerkmale (Prüfkriterien, Bedingungen, Voraussetzungen) zu identifizieren, die für die Rechtsfolgen dieses Normteils relevant sind. Formuliere für jedes Tatbestandsmerkmal eine präzise Frage an einen Behördenmitarbeiter (\`Fragetext\`).

KRITISCHE REGEL ZUR VERMEIDUNG KONZEPTIONELLER FEHLER:
**NIEMALS** darf ein Parameter die juristische Gesamtbewertung oder Schlussfolgerung vorwegnehmen! 

VERBOTEN sind Parameter wie:
- "Liegt ein [Ausschlussgrund/Mangel/Hindernis/Tatbestand] vor?"
- "Sind die Voraussetzungen erfüllt?"
- "Ist die Rechtsfolge eingetreten?"
- "Besteht ein Anspruch?"
- "Liegt eine Pflichtverletzung vor?"
- "Ist die Maßnahme zulässig?"

STATTDESSEN müssen die EINZELNEN, ATOMAREN Tatbestandsmerkmale als separate Parameter erfasst werden.

Beispiele für KORREKTE atomare Parameter:
- BGB: "Hat der Käufer den Mangel bei Vertragsschluss gekannt?" (statt "Liegt ein Gewährleistungsausschluss vor?")
- SGB: "Ist die Person unter 25 Jahre alt?" + "Lebt die Person im Haushalt der Eltern?" (statt "Liegt ein Leistungsausschluss vor?")
- Brandschutz: "Beträgt die Gebäudehöhe mehr als 13 Meter?" + "Sind mehr als 2 Wohnungen vorhanden?" (statt "Ist ein zweiter Rettungsweg erforderlich?")
- Verwaltungsrecht: "Wurde die Frist von 30 Tagen überschritten?" (statt "Ist der Antrag verfristet?")

Das SYSTEM (nicht der Anwender) muss aus den Antworten auf diese atomaren Fragen die juristische Schlussfolgerung ziehen. Die Parameter müssen so strukturiert sein, dass sie eine echte Subsumtion ermöglichen, nicht nur eine Dokumentation bereits getroffener Entscheidungen.

Für jeden identifizierten Parameter (Frage) erstelle ein JSON-Objekt. Achte besonders auf folgende Aspekte bei der Erstellung jedes Parameter-Objekts:

1.  **Grundvoraussetzungen (\`Ist_Grundvoraussetzung\`):**
    * Prüfe, ob ein Parameter eine fundamentale Bedingung darstellt. Wenn die Nichterfüllung dieser Bedingung (typischerweise eine bestimmte Antwort auf die Frage, z.B. ein "Nein" bei einer positiven Voraussetzung) dazu führt, dass weitere Prüfungen für diesen Normteil oder einen wesentlichen Teil davon üblicherweise obsolet werden und direkt zu einem ablehnenden oder spezifischen Ergebnis führen würden, setze \`Ist_Grundvoraussetzung\` auf \`true\`. In allen anderen Fällen setze es auf \`false\` oder gib null zurück.

2.  **Abhängigkeiten der Fragenanzeige (\`Anzeige_Bedingung\`):**
    * Überlege für jeden Parameter sorgfältig, ob seine Anzeige von den Antworten auf einen oder mehrere andere, zuvor von dir für DENSELBEN Normteil definierte Parameter abhängt.
    * Wenn ein Parameter nur angezeigt werden soll, wenn eine oder MEHRERE spezifische Bedingungen bezüglich der Antworten auf andere Parameter GLEICHZEITIG erfüllt sind (logische UND-Verknüpfung), dokumentiere dies im Array \`Anzeige_Bedingung\`.
    * Jedes Objekt innerhalb des \`Anzeige_Bedingung\`-Arrays repräsentiert eine einzelne Bedingung, die erfüllt sein muss. Das Objekt muss die folgenden Schlüssel enthalten:
        * \`Referenz_Parameter_ID\`: Die 'Parameter_ID' des anderen Parameters innerhalb DIESES Normteils, von dessen Antwort die aktuelle Frage abhängt.
        * \`Referenz_Antwort_Operator\`: Der Operator für den Vergleich (z.B. 'IST_GLEICH', 'IST_NICHT_GLEICH', 'IST_WAHR', 'IST_FALSCH', 'IST_EINES_VON').
        * \`Referenz_Antwort_Wert_Intern\`: Der erwartete interne Wert (String bei 'Option_Wert_Intern' oder 'Ja'/'Nein'; Boolean \`true\`/\`false\` bei 'IST_WAHR'/'IST_FALSCH'; Array von Strings bei 'IST_EINES_VON').
    * Beispiel für eine UND-Bedingung: Wenn Frage P_Current nur angezeigt werden soll, falls P_Age mit Option 'O_16_18' beantwortet wurde UND P_Accompanied mit 'Nein' (interner Wert 'O_Unaccomp') beantwortet wurde, dann würde \`Anzeige_Bedingung\` so aussehen:
        \`[ { "Referenz_Parameter_ID": "P_Age_ID", "Referenz_Antwort_Operator": "IST_GLEICH", "Referenz_Antwort_Wert_Intern": "O_16_18" }, { "Referenz_Parameter_ID": "P_Accompanied_ID", "Referenz_Antwort_Operator": "IST_GLEICH", "Referenz_Antwort_Wert_Intern": "O_Unaccomp" } ]\`
    * Wenn ein Parameter immer angezeigt werden soll (nur abhängig von seiner \`Reihenfolge_Anzeige\` und nicht von anderen Parameterantworten), gib für \`Anzeige_Bedingung\` explizit \`null\` oder ein leeres Array \`[]\` zurück.

3.  **Strukturierung komplexer Tatbestandsmerkmale:**
    * Strukturiere komplexe Tatbestandsmerkmale (z.B. Alternativen wie 'A oder B oder C' als Antwortmöglichkeiten oder eine Aufzählung von Möglichkeiten) als EINEN Parameter mit dem Antworttyp 'AuswahlEinfach' und entsprechenden \`Antwortoptionen_bei_Auswahl\`.
    * WICHTIG: Wenn der Normtext mehrere alternative oder kumulative Tatbestandsmerkmale enthält, erstelle SEPARATE Parameter für jedes einzelne Merkmal. Das Regelwerk (P3) wird dann die logische Verknüpfung abbilden.
      Universelle Beispiele:
      - Normtext: "wenn A oder B oder C vorliegt" → 3 separate Ja/Nein-Parameter
      - Normtext: "bei Vorliegen von X und Y" → 2 separate Parameter
      - Normtext: "sofern eine der folgenden Bedingungen erfüllt ist: 1)... 2)... 3)..." → Ein Parameter pro Bedingung
      NIEMALS: Ein einziger Sammelparameter "Welche Bedingung liegt vor?" mit Optionen A/B/C/keine
      RICHTIG: Separate atomare Parameter, deren Antworten das System logisch verknüpft

SELBSTVALIDIERUNG VOR DER AUSGABE:
Bevor du das finale JSON-Array ausgibst, prüfe JEDEN erstellten Parameter auf folgende konzeptionelle Fehler:

1. **Vorweggenommene Bewertung:** Enthält der Fragetext Begriffe wie "Anspruch", "Voraussetzung erfüllt", "zulässig", "berechtigt", "Tatbestand", "Rechtsfolge", "liegt vor"? Wenn ja, formuliere den Parameter um, sodass er nach FAKTEN fragt.

2. **Unzulässige Bündelung:** Fasst der Parameter mehrere Prüfschritte in einer Frage zusammen? Wenn ja, teile ihn in separate atomare Parameter auf.

3. **Fehlende Atomarität:** Kann ein Laie ohne juristische Kenntnisse die Frage beantworten? Wenn NEIN, ist der Parameter wahrscheinlich fehlerhaft und fragt nach rechtlicher Bewertung statt nach Fakten.

Wenn du bei der Selbstvalidierung fehlerhafte Parameter findest, KORRIGIERE sie entsprechend, bevor du das JSON ausgibst.

Gib deine Antwort AUSSCHLIESSLICH als JSON-Array zurück, das diese Parameter-Objekte enthält. Jedes Objekt muss exakt die unten definierten Schlüssel und Werte gemäß den Beschreibungen haben:
[
  {
    "Parameter_ID": "STRING - Ein eindeutiger Bezeichner für diesen Parameter, beginnend mit P gefolgt von Paragraph (ohne §), Absatz (falls vorhanden, ohne 'Abs.') und einer kurzen beschreibenden Kennung (z.B. 'P_{{PARA_NUM}}_{{ABS_NUM}}_MerkmalName'). Ersetze Leerzeichen und Sonderzeichen im MerkmalName durch Unterstriche.",
    "Reihenfolge_Anzeige": "INTEGER - Vorgeschlagene Reihenfolge für die Präsentation dieses Parameters als Frage an den Nutzer (beginnend bei 1 für den ersten Parameter dieses Normteils). Achte auf eine logische Abfolge, insbesondere bei abhängigen Fragen.",
    "Fragetext": "TEXT - Formuliere eine klare, prägnante Frage an einen Behördenmitarbeiter, um die Erfüllung dieses Tatbestandsmerkmals/dieser Bedingung im Rahmen einer Fallsimulation zu prüfen.",
    "Antworttyp": "STRING - Wähle einen der folgenden Typen: 'JaNein', 'AuswahlEinfach', 'TextfeldKurz'.",
    "Antwortoptionen_bei_Auswahl": [ /* Dieses Array nur befüllen, wenn Antworttyp 'AuswahlEinfach' ist, sonst null oder leeres Array.
      Für jede Option ein Objekt mit exakt folgenden Schlüsseln:
      { "Option_Text": "STRING (max 512 Zeichen) - Anzeigetext der Option für den Nutzer.",
        "Option_Wert_Intern": "STRING (max 100 Zeichen) - Eindeutiger interner Wert für die Regellogik (alphanumerisch, Unterstriche erlaubt, keine Leerzeichen oder Sonderzeichen).",
        "Reihenfolge_Option": "INTEGER - Anzeigereihenfolge der Option innerhalb der Auswahl (beginnend bei 1)." }
    */ ],
    "Begleittext": "TEXT - Kurzer erklärender Text, der dem Nutzer bei der Beantwortung der Frage angezeigt werden kann. Konzentriere dich auf Definitionen oder Erläuterungen, die direkt aus dem Normtext oder eng verwandten allgemeinen Rechtsprinzipien abgeleitet sind und dem Verständnis dienen. Null, wenn nicht nötig.",
    "Normbezug_Detail_Parameter": "STRING (max 255 Z.) - Die genaue Stelle im analysierten Normteil oder die relevante allgemeine Norm, auf die sich dieses Tatbestandsmerkmal bezieht.",
    "Verweis_Normen_Info_Parameter": "STRING (max 255 Z.) - Falls dieser Parameter die Prüfung einer anderen Rechtsnorm impliziert oder Details in anderen Normen genannt werden, liste die Hauptnorm(en) auf. Null, wenn nicht anwendbar.",
    "FK_Verlinkte_SimulationsEinheit_ID_Platzhalter": "STRING - WICHTIGE SONDERREGELUNG: Für dieses Feld ist bis auf Weiteres IMMER der Wert null zu verwenden...",
    "Ist_Grundvoraussetzung": "BOOLEAN - Entweder \`true\` oder \`false\` (oder null, was als \`false\` interpretiert wird), basierend auf der Analyse, ob dies eine fundamentale Grundvoraussetzung ist (siehe detaillierte Anweisung oben).",
    "Anzeige_Bedingung": [
    ],
    "Text_Erfuellt_Pro": "TEXT - Formuliere einen prägnanten Text (max. 1-2 Sätze) für die 'Pro'-Liste...",
    "Text_NichtErfuellt_Contra": "TEXT - Formuliere einen prägnanten Text (max. 1-2 Sätze) für die 'Contra'-Liste..."
  }
]
Achte auf korrekte \`Parameter_ID\`-Benennung (müssen innerhalb des Normteils eindeutig sein) und eine logische \`Reihenfolge_Anzeige\` für alle Parameter dieses Normteils.`,

    // P3 mit Hinweis auf atomare Verknüpfung
    SimONA_P3_RegelGenerierung: `ANALYSEAUFTRAG FÜR SimONA-DATENBANK (Tabellen: Regeln und RegelBedingungen)

KONTEXTINFORMATIONEN DURCH EMMA BEREITGESTELLT:
Aktuelle_SimulationsEinheit_ID: "{{SIM_EINHEIT_ID}}"
Gesetz/Verordnung (Abkürzung): "{{GESETZ_ABK}}"
Zu analysierender Normteil (Paragraph, Absatz, Satz): "{{NORMTEIL_BEZEICHNUNG}}"
Exakter Wortlaut des Normteils (Primärquelle für DIESEN Prompt): "{{NORMTEXT_AUSZUG}}"
Verfuegbare_Parameter_Liste_JSON (Extrahiert durch Prompt 2 für diesen Normteil):
{{P2_RESPONSE_JSON_STRING}}
Verfügbare_ErgebnisProfile_Liste_JSON (Relevant für diesen Normteil - Vorgeschlagen durch P2.5, validiert durch Nutzer):
{{P2_5_RESPONSE_JSON_STRING_VALIDATED}}

ANWEISUNG:
Basierend auf dem "Exakter Wortlaut des Normteils" und der "Verfügbare_Parameter_Liste_JSON", definiere die notwendigen Regeln, um zu den in "Verfügbare_ErgebnisProfile_Liste_JSON" genannten Ergebnissen zu gelangen.

WICHTIGER HINWEIS: Die Regeln müssen die juristische Subsumtion durchführen, indem sie die Antworten auf die atomaren Parameter-Fragen logisch verknüpfen.

Universelle Beispiele für korrekte Regelstrukturen:

Für ALTERNATIVE Tatbestandsmerkmale (ODER-Verknüpfung):
- Regel 1: Wenn Merkmal_A = "Ja" → Rechtsfolge X
- Regel 2: Wenn Merkmal_B = "Ja" → Rechtsfolge X  
- Regel 3: Wenn Merkmal_A = "Nein" UND Merkmal_B = "Nein" → Rechtsfolge Y

Für KUMULATIVE Tatbestandsmerkmale (UND-Verknüpfung):
- Regel 1: Wenn Merkmal_A = "Ja" UND Merkmal_B = "Ja" UND Merkmal_C = "Ja" → Rechtsfolge X
- Regel 2: Wenn Merkmal_A = "Nein" ODER Merkmal_B = "Nein" ODER Merkmal_C = "Nein" → Rechtsfolge Y

Für GESTUFTE Prüfungen:
- Regel 1 (Priorität 10): Wenn Grundvoraussetzung = "Nein" → Ablehnung
- Regel 2 (Priorität 20): Wenn Grundvoraussetzung = "Ja" UND Zusatzbedingung = "Ja" → Zulassung
- Regel 3 (Priorität 30): Wenn Grundvoraussetzung = "Ja" UND Zusatzbedingung = "Nein" → Ermessensprüfung

Die Regeln dürfen NICHT einfach einen vorweggenommenen "Sammelparameter" auswerten, sondern müssen die atomaren Tatbestandsmerkmale zu einem rechtlichen Ergebnis verknüpfen.

VALIDIERUNGSHINWEIS: Falls die Parameter-Liste konzeptionell fehlerhafte Parameter enthält (z.B. solche, die bereits rechtliche Bewertungen vorwegnehmen), versuche trotzdem sinnvolle Regeln zu erstellen, aber weise in einem Kommentar darauf hin, dass die Parameterstruktur suboptimal ist.

Gib die Antwort AUSSCHLIESSLICH als JSON-Array von Regel-Objekten zurück. Jedes Regel-Objekt repräsentiert eine einzelne Regel und muss exakt die folgenden Schlüssel haben:

[
  {
    "Regel_Name": "STRING (max 100 Zeichen) - Ein beschreibender Name für diese Regel (z.B. 'Positive Entscheidung bei Erfüllung aller Kriterien', 'Ablehnung wegen fehlender Eigenschaft X', 'Ermessenseröffnung bei Härtefall', 'Anwendung Sonderregelung §36a').",
    "Prioritaet": "INTEGER - Definiert die Auswertungsreihenfolge der Regeln (niedrigere Zahlen werden zuerst geprüft). WICHTIG: Innerhalb desselben Regelwerks (d.h. für die aktuell analysierte Normeinheit {{SIM_EINHEIT_ID}}) MUSS jede Regel eine EINZIGARTIGE Prioritätsnummer erhalten. Keine zwei Regeln dürfen dieselbe Priorität haben. Beginne mit niedrigen Zahlen für Regeln, die zuerst geprüft werden sollen (z.B. 5 oder 10 für sehr spezifische Ausschluss- oder Weichensteller-Regeln). Erhöhe die Prioritätsnummern für nachfolgende Regeln in sinnvollen, eindeutigen Schritten (z.B. 15, 20, 21, 22, 30, 35, 99 für eine Fallback-Regel). Ziel ist eine klare, hierarchische Auswertungsreihenfolge, bei der jede Regel eine eindeutige Position hat.",
    "FK_ErgebnisProfil_ID_Referenz": "STRING - Die 'ErgebnisProfil_ID_Referenz' aus der oben bereitgestellten Liste, die ausgelöst wird, wenn diese Regel erfüllt ist.",
    "Bedingungen_fuer_Regel": [
      {
        "FK_Parameter_ID": "STRING - Die 'Parameter_ID' des Parameters aus der oben bereitgestellten 'Verfuegbare_Parameter_Liste_JSON', der für diese Bedingung geprüft wird.",
        "Operator": "STRING - Der Vergleichsoperator. Nutze 'IST_GLEICH' für JaNein-Antworten (erwarteter Wert 'Ja' oder 'Nein') und für AuswahlEinfach-Antworten (erwarteter Wert ist ein 'Option_Wert_Intern'). Nutze 'IST_WAHR' für JaNein-Parameter, wenn die Bedingung 'Ja' sein muss, oder 'IST_FALSCH', wenn die Bedingung 'Nein' sein muss.",
        "Erwarteter_Wert_Intern": "STRING/BOOLEAN - Der Wert, mit dem der Parameter verglichen wird.
          - Für 'IST_GLEICH' bei 'JaNein'-Typ: 'Ja' oder 'Nein' (als Strings).
          - Für 'IST_GLEICH' bei 'AuswahlEinfach'-Typ: Der entsprechende 'Option_Wert_Intern' der gewählten Option (als String).
          - Für 'IST_WAHR': true (Boolean).
          - Für 'IST_FALSCH': false (Boolean)."
      }
    ]
  }
]`,

    // P5 mit erweitertem Bewertungskriterium
    SimONA_P5_QualitaetsAudit: `ANALYSEAUFTRAG: QUALITÄTS-AUDIT EINES SimONA-DATENMODELLS

DU BIST EIN HOCHSPEZIALISIERTER KI-RECHTSEXPERTE mit der Aufgabe, ein bestehendes, von einem anderen System erstelltes Datenmodell für eine deutsche Rechtsnorm auf seine fachliche Qualität und Plausibilität zu prüfen. Du agierst als unabhängiger Auditor.

KONTEXT:
Ein Fachexperte hat mithilfe einer KI den folgenden deutschen Normtext analysiert und in ein strukturiertes JSON-Datenmodell überführt. Deine Aufgabe ist es, dieses Ergebnis zu bewerten.

URSPRÜNGLICHER NORMTEXT:
"{{NORMTEXT_AUSZUG}}"

VOM EXPERTEN ERSTELLTES UND VALIDERTES DATENMODELL (JSON):
{{P1_P4_DATENSATZ_JSON}}

// =================================================================
BEWERTUNGSGRUNDSÄTZE FÜR DEIN AUDIT:
1.  Fokus auf Substanz, nicht auf Stil: Bewerte primär die fachliche Korrektheit und den Sinngehalt, nicht die exakte Wortwahl.
2.  Beachte, dass bei diesem Audit ausschließlich die Analyse des explizit angeführten Teils der Rechtsnorm, in der Regel eine Absatz, bewertet werden soll. Alle anderen Absätze des Paragrafen werden separat bewertet und erst danach einer Gesamtbetrachtung unterworfen und gemeinsam bewertet.
3.  Semantische Äquivalenz akzeptieren: Leichte Abweichungen in der Formulierung von Fragetexten oder Beschreibungen sind völlig akzeptabel, solange der juristische Kern und der Zweck für den Anwender unmissverständlich und korrekt getroffen werden. Betreibe keine "Wortklauberei". Eine Frage wie "Liegt eine unmittelbare Gefahr vor?" ist semantisch gleichwertig zu "Besteht eine unmittelbare Gefahr für das Kindeswohl?" und sollte nicht negativ bewertet werden, solange der Kontext klar ist.
4.  Kritik an materiellen Fehlern: Konzentriere deine Kritik und negative Bewertungen auf materielle Fehler. Das sind:
    * Fehlende oder falsch interpretierte Tatbestandsmerkmale.
    * Falsche logische Verknüpfungen in den Regeln.
    * Fachlich irreführende oder mehrdeutige Formulierungen, die zu einer falschen Anwendung durch einen Sachbearbeiter führen könnten.
5.  Prüfung auf konzeptionelle Korrektheit: Ein Hauptaugenmerk liegt darauf, ob das Modell tatsächlich eine juristische Prüfung durchführt oder nur bereits getroffene Entscheidungen dokumentiert. Parameter, die Gesamtbewertungen vorwegnehmen ("Liegt X vor?", "Besteht ein Anspruch?", "Sind die Voraussetzungen erfüllt?") anstatt einzelne Tatbestandsmerkmale zu prüfen, sind ein schwerwiegender konzeptioneller Fehler. Das System muss die Subsumtion durchführen, nicht der Anwender. AUSNAHME: Verweise auf das Ergebnis anderer Normprüfungen (z.B. "Wurde bereits eine Erlaubnis nach § X erteilt?") sind legitim.
// =================================================================

DEINE AUDIT-ANWEISUNGEN:
Analysiere das übergebene "VOM EXPERTEN ERSTELLTES UND VALIDERTES DATENMODELL" sorgfältig im Abgleich mit dem "URSPRÜNGLICHER NORMTEXT" und unter Beachtung der oben genannten BEWERTUNGSGRUNDSÄTZE. Gib deine gesamte Analyse AUSSCHLIESSLICH als einzelnes, valides JSON-Objekt zurück, das exakt die folgende Struktur hat:

{
  "Gesamtbewertung": {
    "Score": "FLOAT - Dein gewichteter Gesamt-Score für die Qualität des Modells auf einer Skala von 1.0 (mangelhaft) bis 10.0 (exzellent).",
    "Fazit": "TEXT - Deine zusammenfassende Management-Summary in 1-2 Sätzen. Beispiel: 'Das Datenmodell ist von hoher Qualität, hat aber kleinere Schwächen bei der Abdeckung von Randbedingungen.'"
  },
  "Detailbewertungen": [
    {
      "Kategorie": "Vollständigkeit der Parameter",
      "Score": "INTEGER - Dein Score von 1-10 für diese Kategorie.",
      "Begruendung": "TEXT - Bewerte, ob alle relevanten Tatbestandsmerkmale, Bedingungen und Kriterien aus dem Normtext als Parameter erfasst wurden. PRÜFE BESONDERS: Wurden die Tatbestandsmerkmale atomar erfasst oder unzulässig gebündelt? Nehmen Parameter juristische Bewertungen vorweg? Begründe deine Bewertung kurz. Wenn etwas Wichtiges fehlt, benenne es hier explizit. Beispiel: 'Die wesentlichen Merkmale sind erfasst. Das Kriterium 'in schwierigen Fällen' aus Satz 3 könnte für mehr Klarheit als eigener Ja/Nein-Parameter abgebildet werden, anstatt es nur im Ermessenstext zu erwähnen.'"
    },
    {
      "Kategorie": "Logische Konsistenz der Regeln",
      "Score": "INTEGER - Dein Score von 1-10 für diese Kategorie.",
      "Begruendung": "TEXT - Bewerte, ob die definierten Regeln die Kausal- und Konditionalketten des Normtextes fachlich korrekt abbilden. **Prüfe dabei explizit die Auswertungsreihenfolge anhand der \`Prioritaet\`: Simuliere gedanklich den Prüfpfad. Wird ein spezifischerer Fall (z.B. ein strenges Verbot) korrekt VOR einem allgemeineren Fall (z.B. einer generellen Erlaubnis oder einem anderen Ausschlussgrund) geprüft? Decke eventuelle Logikfehler auf, die durch eine falsche Priorisierung entstehen.** Ist die Verknüpfung der einzelnen Bedingungen innerhalb der Regeln plausibel? PRÜFE BESONDERS: Führen die Regeln eine echte Subsumtion durch oder werten sie nur vorweggenommene Sammelparameter aus? Begründe deine Bewertung."
    },
    {
      "Kategorie": "Qualität der Fragetexte und Ergebnisprofile",
      "Score": "INTEGER - Dein Score von 1-10 für diese Kategorie.",
      "Begruendung": "TEXT - Bewerte die Qualität der für den Endanwender formulierten Texte. Sind die 'Fragetexte' der Parameter klar, neutral und unmissverständlich? WICHTIG: Fragen Parameter nach FAKTEN (gut) oder nach RECHTLICHEN BEWERTUNGEN (schlecht)? Sind die 'Entscheidungstext_Kurz_Vorlage' der Ergebnisprofile präzise und fachlich korrekt? Begründe deine Bewertung. Beispiel: 'Die Fragetexte sind gut verständlich. Der Entscheidungstext für Profil Y könnte präzisiert werden, um den Ermessensspielraum noch deutlicher zu machen.'"
    }
  ]
}

WICHTIG: Deine Bewertung soll streng, fair und konstruktiv sein, basierend auf den oben genannten Grundsätzen. Das Ziel ist es, dem Fachexperten zu helfen, die Qualität seiner Arbeit zu maximieren.
`
};