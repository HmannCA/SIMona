// simona_prompts_optimized.js
// Version: 2.6 - Optimiert für vollständige Rechtsanalyse
// Die JSON-Strukturen bleiben identisch, nur die Anweisungen werden verbessert

const promptTemplatesV2_5 = {
    SimONA_Priming_Systemanweisung: `Du bist eine hochspezialisierte KI zur präzisen Analyse deutscher Rechtsnormen für das SimONA-System. Deine Aufgabe ist es, für alle spezifischen Analyse-Prompts (wie SimONA_P1_EinheitMetadaten, SimONA_P2_ParameterExtraktion, etc.), die dir nach dieser Systemanweisung folgen, die angeforderten Informationen ausschließlich aus dem dir primär übergebenen Gesetzestext-Auszug zu extrahieren und als reinen JSON-String zurückzugeben.

WICHTIGSTE ANWEISUNG FÜR ALLE DEINE ANTWORTEN AUF NACHFOLGENDE ANALYSE-PROMPTS:
Deine GESAMTE Antwort auf Analyse-Prompts muss IMMER und AUSSCHLIESSLICH ein einzelnes, valides JSON-Objekt oder JSON-Array sein, genau wie im jeweiligen Analyse-Prompt spezifiziert.
Es dürfen ABSOLUT KEINERLEI andere Texte, Zeichen, Einleitungsfloskeln (wie z.B. "Hier ist das angeforderte JSON:", "Gerne, hier ist die Analyse:", "json" oder ähnliches), Kommentare, Erklärungen, Zusammenfassungen, Entschuldigungen oder sonstige Höflichkeitsfloskeln VOR oder NACH dem JSON-String enthalten sein. Die Antwort MUSS direkt mit einer öffnenden geschweiften Klammer \`{\` (für JSON-Objekte) oder einer öffnenden eckigen Klammer \`[\` (für JSON-Arrays) beginnen und entsprechend mit einer schließenden Klammer \`}\` oder \`]\` enden.

KRITISCHE ANALYSEREGELN FÜR RECHTSNORMEN:
1. VOLLSTÄNDIGKEIT: Erfasse ALLE Tatbestandsmerkmale, auch implizite oder durch Verweis einbezogene.
2. RECHTSFOLGEN: Identifiziere ALLE möglichen Rechtsfolgen (positive, negative, Ermessensentscheidungen).
3. SUBJEKTE: Bestimme präzise das betroffene Rechtssubjekt und mögliche Beteiligte.
4. SYSTEMATIK: Erkenne Regel-Ausnahme-Verhältnisse und alternative/kumulative Voraussetzungen.
5. EXHAUSTIVITÄT: Stelle sicher, dass deine Analyse ALLE rechtlich relevanten Aspekte abdeckt.

Weitere Detailanweisungen für Analyse-Prompts:
- Die Detailanalyse für die Felder in den JSON-Strukturen hat auf Basis des explizit übergebenen Textauszugs zu erfolgen.
- Konzentriere dich strikt auf den Normtext und die exakten Anweisungen des jeweiligen Analyse-Prompts.
- Absolute Fehlerfreiheit bei der Datenextraktion und strikte Einhaltung des spezifizierten JSON-Schemas sind von höchster Bedeutung.
- Verarbeite nur den explizit genannten und übergebenen Normteil für die Detailanalyse der Felder.

WICHTIG: Nenne diesen Chat: {{NORMTEIL_BEZEICHNUNG}} {{GESETZ_ABK}} SimONA-Analyse.
Antworte auf DIESEN SimONA_Priming_Systemanweisung-Prompt und NUR auf diesen einen Initial-Prompt ausschließlich mit der einzelnen Zeile: Ich bin bereit!`,

    SimONA_P1_EinheitMetadaten: `ANALYSEAUFTRAG FÜR SimONA-DATENBANK (Tabelle: SimulationsEinheiten)

NORMBEZUG:
Gesetz/Verordnung (Abkürzung): {{GESETZ_ABK}}
Zu analysierender Normteil (Paragraph, Absatz, Satz): {{NORMTEIL_BEZEICHNUNG}}
Quelle-URL (für Gesamtkontext und Referenz): {{QUELLE_URL}}
Exakter Wortlaut des zu analysierenden Normteils (Primärbasis für diese Extraktion): "{{NORMTEXT_AUSZUG}}"

ANWEISUNG:
Analysiere den oben bereitgestellten "Exakter Wortlaut des zu analysierenden Normteils" mit folgenden Schwerpunkten:
1. IDENTIFIZIERE das betroffene Rechtssubjekt (WER ist Adressat der Norm?)
2. BESTIMME die Art der Rechtsfolge und ob es sich um eine gebundene Entscheidung oder Ermessen handelt
3. ERFASSE sowohl positive als auch negative Rechtsfolgen
4. PRÜFE auf Regel-Ausnahme-Verhältnisse

Gib die Antwort AUSSCHLIESSLICH als einzelnes JSON-Objekt zurück:

{
  "Gesetz": "STRING (max 50 Zeichen) - Offizielle Abkürzung des Gesetzes (wie oben im NORMBEZUG angegeben, z.B. 'AufenthG').",
  "Paragraph": "STRING (max 20 Zeichen) - Nummer des Paragraphen (z.B. '32', '5').",
  "Absatz": "STRING (max 10 Zeichen) - Nummer des Absatzes (z.B. '4', '1'). Falls nicht anwendbar oder der gesamte Paragraph ohne spezifische Absätze gemeint ist, gib null zurück.",
  "Satz": "STRING (max 10 Zeichen) - Nummer des Satzes oder der Sätze (z.B. '1', '1-2'). Falls nicht anwendbar, gib null zurück.",
  "Kurzbeschreibung": "STRING (max 255 Zeichen) - Prägnante Zusammenfassung: WER (Rechtssubjekt) + WAS (Tatbestand) + RECHTSFOLGE. Beispiel: 'Ausländer dürfen in Nachtclubs nicht zugelassen werden, wenn sie minderjährig sind.'",
  "Gesetzestext_Zitat_Analysierter_Teil": "TEXT - Gib hier exakt und unverändert den oben bei 'Exakter Wortlaut des zu analysierenden Normteils' bereitgestellten Text wieder.",
  "Art_Rechtsfolge_Positiv_Typ": "STRING (max 100 Zeichen) - PRÄZISE Beschreibung der Rechtsfolge bei Tatbestandserfüllung. Nutze die EXAKTE juristische Terminologie aus dem Normtext (z.B. 'Verbot des Aufenthalts', 'Erteilung einer Aufenthaltserlaubnis', 'Ausweisung'). Wenn es mehrere Rechtsfolgen gibt, nenne die primäre.",
  "FK_Entscheidungsart_ID_Lookup_Bezeichnung": "STRING (max 100 Zeichen) - PRÜFE GENAU: Enthält der Normtext Wörter wie 'kann', 'darf', 'soll', 'ist...zu', 'hat...zu'? Bei 'kann' → 'Ermessen (freies Ermessen)'. Bei 'soll' → 'Ermessen (Soll-Vorschrift)'. Bei 'darf nicht' oder 'ist zu' → 'Gebundene Entscheidung'. Bei 'in der Regel' → 'Ermessen (Regelermessen)'. Bei spezieller Zweckbindung → 'Ermessen (intendiertes Ermessen)'.",
  "Ermessensleitlinien_Text": "TEXT - WENN Ermessen identifiziert: Suche im Normtext nach EXPLIZITEN Kriterien für die Ermessensausübung (Signalwörter: 'hierbei sind zu berücksichtigen', 'insbesondere', 'unter Berücksichtigung'). LISTE diese wörtlich auf. Wenn keine expliziten Kriterien im Text → gib die in der Prompt-Anweisung definierten Standardtexte aus. Bei gebundener Entscheidung → null.",
  "Gesetz_Vollstaendiger_Name": "STRING (max 500 Zeichen) - Der vollständige, offizielle Name des Gesetzes. RECHERCHIERE basierend auf der 'Quelle-URL'.",
  "Paragraf_Uebergreifende_Kurzbeschreibung": "STRING (max 500 Zeichen) - ANALYSIERE: Was regelt der GESAMTE Paragraph übergeordnet? Welches Rechtsgebiet/welche Materie? RECHERCHIERE basierend auf der 'Quelle-URL'.",
  "Gesetz_Aktueller_Stand_Datum": "STRING (Format: 'YYYY-MM-DD' oder wie auf Quelle angegeben) - RECHERCHIERE basierend auf der 'Quelle-URL'.",
  "Paragraph_Offizielle_Bezeichnung": "STRING (max 255 Zeichen) - Die offizielle Überschrift des Paragraphen aus dem Gesetz. RECHERCHIERE basierend auf der 'Quelle-URL'. Wenn keine existiert → null."
}`,

    SimONA_P2_ParameterExtraktion: `ANALYSEAUFTRAG FÜR SimONA-DATENBANK (Tabelle: Parameter und Parameter_Antwortoptionen)

NORMBEZUG:
Gesetz/Verordnung (Abkürzung): {{GESETZ_ABK}}
Zu analysierender Normteil (Paragraph, Absatz, Satz): {{NORMTEIL_BEZEICHNUNG}}
Quelle-URL (für Gesamtkontext und Referenz): {{QUELLE_URL}}
Exakter Wortlaut des Normteils (Primärquelle für DIESEN Prompt): "{{NORMTEXT_P1_ZITAT}}"

ANWEISUNG:
KRITISCH: Führe eine EXHAUSTIVE Analyse durch! Zerlege den Normtext Wort für Wort und identifiziere:
1. ALLE Tatbestandsmerkmale (auch implizite wie "Ausländer" = "Person ohne deutsche Staatsangehörigkeit")
2. ALLE Bedingungen, Voraussetzungen, Ausnahmen
3. Das VERHÄLTNIS der Merkmale zueinander (kumulativ mit UND / alternativ mit ODER)
4. Die LOGISCHE PRÜFREIHENFOLGE (erst Anwendungsbereich, dann materielle Voraussetzungen)

WICHTIG - VOLLSTÄNDIGKEITSPRÜFUNG:
- Hast du JEDES Substantiv geprüft, ob es ein Tatbestandsmerkmal darstellt?
- Hast du JEDE Bedingung ("wenn", "soweit", "es sei denn") erfasst?
- Hast du Verweise auf andere Normen berücksichtigt?
- Würde die Prüfung ALLER deiner Parameter ALLE möglichen Fallkonstellationen abdecken?

Für jeden identifizierten Parameter:
1. **Grundvoraussetzungen**: Ist es eine "Eingangsvoraussetzung", deren Nichterfüllung weitere Prüfungen obsolet macht?
2. **Abhängigkeiten**: Macht diese Frage nur Sinn, wenn andere Fragen bestimmt beantwortet wurden?
3. **Konklusive Wirkung**: Beachte, dass manche Antworten direkt zu einem Ergebnis führen.

Gib deine Antwort AUSSCHLIESSLICH als JSON-Array zurück:
[
  {
    "Parameter_ID": "STRING - Eindeutiger Bezeichner: P_{{PARA_NUM}}_{{ABS_NUM}}_[SprechenderName]. Der SprechendeName soll das Tatbestandsmerkmal klar bezeichnen.",
    "Reihenfolge_Anzeige": "INTEGER - BEGRÜNDETE Reihenfolge: 1-10 für Grundvoraussetzungen, 11-50 für materielle Voraussetzungen, 51-99 für Zusatzbedingungen.",
    "Fragetext": "TEXT - Formuliere eine PRÄZISE Frage für Verwaltungsmitarbeiter. Verwende Fachterminologie, aber stelle sicher, dass die Frage eindeutig zu beantworten ist. Bei Verweisen: Gib die verwiesene Norm in Klammern an.",
    "Antworttyp": "STRING - 'JaNein' für binäre Entscheidungen, 'AuswahlEinfach' für mehrere Optionen, 'TextfeldKurz' nur wenn freie Eingabe rechtlich relevant.",
    "Antwortoptionen_bei_Auswahl": [ 
      /* NUR bei 'AuswahlEinfach': Erfasse ALLE rechtlich relevanten Optionen */
      { 
        "Option_Text": "STRING - Präziser Anzeigetext der das rechtliche Merkmal klar beschreibt",
        "Option_Wert_Intern": "STRING - Kurzer Code z.B. 'NACHTCLUB', 'GASTSTAETTE_NORMAL'",
        "Reihenfolge_Option": "INTEGER - Sortierung der Optionen" 
      }
    ],
    "Begleittext": "TEXT - Rechtliche Definition oder Erläuterung des Tatbestandsmerkmals. Zitiere relevante Legaldefinitionen. Bei Ermessensspielräumen: Erkläre den Rahmen.",
    "Normbezug_Detail_Parameter": "STRING (max 255) - EXAKTE Stelle im Normtext, wo dieses Merkmal genannt wird (z.B. '§ 32 Abs. 4 Satz 1: die als Nachtbar oder Nachtclub geführt werden')",
    "Verweis_Normen_Info_Parameter": "STRING (max 255) - Falls das Merkmal auf andere Normen verweist oder dort definiert ist, liste diese auf (z.B. 'Definition Ausländer: § 2 Abs. 1 AufenthG')",
    "FK_Verlinkte_SimulationsEinheit_ID_Platzhalter": "STRING - Immer null (für zukünftige Vernetzung vorgesehen)",
    "Ist_Grundvoraussetzung": "BOOLEAN - true wenn: Tatbestandsmerkmal den Anwendungsbereich bestimmt ODER fundamentale Eingangsvoraussetzung ist. false bei materiellen Zusatzvoraussetzungen.",
    "Anzeige_Bedingung": [
      /* Array von Bedingungen - ALLE müssen erfüllt sein (UND-Verknüpfung) */
      {
        "Referenz_Parameter_ID": "STRING - ID des Parameters von dessen Antwort diese Frage abhängt",
        "Referenz_Antwort_Operator": "STRING - 'IST_GLEICH', 'IST_NICHT_GLEICH', 'IST_WAHR', 'IST_FALSCH'",
        "Referenz_Antwort_Wert_Intern": "STRING/BOOLEAN - Der erwartete Wert"
      }
    ],
    "Text_Erfuellt_Pro": "TEXT - Sachliche Feststellung für die spätere Begründung wenn diese Voraussetzung ERFÜLLT ist. Formuliere im Nominalstil: 'Eigenschaft als Ausländer liegt vor.' NICHT: 'Der Antragsteller ist Ausländer.'",
    "Text_NichtErfuellt_Contra": "TEXT - Sachliche Feststellung wenn NICHT erfüllt. Wichtig bei Grundvoraussetzungen: Erkläre die Rechtsfolge. Beispiel: 'Deutsche Staatsangehörigkeit vorhanden. Die Regelungen des AufenthG finden keine Anwendung.'"
  }
]

ABSCHLIESSENDE VOLLSTÄNDIGKEITSKONTROLLE:
Prüfe nochmals: Würde ein Verwaltungsmitarbeiter mit deinen Parametern JEDEN denkbaren Fall korrekt einordnen können?`,

    SimONA_P2_5_ErgebnisProfilVorschlaege: `ANALYSEAUFTRAG FÜR SimONA-DATENBANK (Vorschlag für ErgebnisProfil-Referenzen)

KONTEXTINFORMATIONEN:
Aktuelle_SimulationsEinheit_ID: "{{SIM_EINHEIT_ID}}"
Gesetz/Verordnung (Abkürzung): "{{GESETZ_ABK}}"
Zu analysierender Normteil: "{{NORMTEIL_BEZEICHNUNG}}"
Exakter Wortlaut des Normteils: "{{NORMTEXT_AUSZUG}}"
Informationen_zur_SimulationsEinheit_JSON (aus P1):
{{P1_RESPONSE_JSON_STRING}}
Verfuegbare_Parameter_Liste_JSON (aus P2):
{{P2_RESPONSE_JSON_STRING}}

ANWEISUNG:
KRITISCH: Identifiziere ALLE möglichen rechtlichen Endergebnisse für diesen Normteil!

SYSTEMATISCHE ANALYSE:
1. POSITIVE RECHTSFOLGEN: Welche Rechtsfolgen treten bei Tatbestandserfüllung ein?
2. NEGATIVE RECHTSFOLGEN: Was passiert bei Nichterfüllung? (Ablehnung, Verweisung, etc.)
3. TEIL-ERFÜLLUNG: Gibt es Zwischenergebnisse oder Teilentscheidungen?
4. ERMESSENSENTSCHEIDUNGEN: Welche unterschiedlichen Ermessensausübungen sind möglich?
5. SONDERFÄLLE: Verfahrenseinstellung, Unzulässigkeit, Verweis auf andere Normen?

VOLLSTÄNDIGKEITSPRÜFUNG:
- Hast du für JEDE Grundvoraussetzung ein Negativ-Ergebnis vorgesehen?
- Bei Ermessen: Hast du sowohl positive als auch negative Ermessensausübung berücksichtigt?
- Gibt es Konstellationen, die zu keinem deiner Ergebnisse führen würden?

Gib die Antwort AUSSCHLIESSLICH als JSON-Array zurück:
[
  {
    "Vorgeschlagene_ErgebnisProfil_ID_Referenz": "STRING - Strukturiert: 'EP_{{PARA_NUM}}_{{ABS_NUM}}_[Kategorie]_[Spezifikation]'. Kategorien: 'Positiv', 'Negativ', 'Ermessen', 'Teilergebnis', 'Verfahren'. Beispiel: 'EP_32_4_Negativ_NichtAuslaender'",
    "Vorgeschlagene_Kurzbeschreibung_Ergebnis": "STRING (max 255) - PRÄZISE Beschreibung des rechtlichen Ergebnisses. Beginne mit der Kategorie. Beispiel: 'Negative Entscheidung: Anwendungsbereich nicht eröffnet - Person ist deutscher Staatsangehöriger, daher findet § 32 Abs. 4 AufenthG keine Anwendung.'"
  }
]

MINDEST-ERGEBNISSE die fast immer vorkommen:
- Positive Hauptrechtsfolge (Tatbestand vollständig erfüllt)
- Negative Entscheidungen für jede Grundvoraussetzung
- Bei Ermessen: Positive und negative Ermessensausübung
- Ggf. Verfahrensbeendigung ohne Sachentscheidung`,

    SimONA_P2_7_ParameterKonklusionDetail: `ANALYSEAUFTRAG FÜR SimONA-SYSTEM (Detailanalyse konklusiver Parameter-Antworten)

KONTEXTINFORMATIONEN:
Exakter Wortlaut des analysierten Normteils: "{{NORMTEXT_AUSZUG}}"
Metadaten zur aktuellen Normeinheit (P1 Output):
{{P1_RESPONSE_JSON_STRING}}
Liste der für diesen Normteil identifizierten Parameter (P2 Output):
{{P2_RESPONSE_JSON_STRING}}

ANWEISUNG:
Analysiere JEDEN Parameter aus P2 systematisch auf konklusive (= verfahrensbeendende) Antwortmöglichkeiten.

PRÜFSCHEMA für jeden Parameter:
1. Bei Grundvoraussetzungen (Ist_Grundvoraussetzung = true):
   - "Nein" führt meist zu NEGATIV_BLOCKIEREND
   - Prüfe aber auch ob "Ja" zu anderen Normen verweist

2. Bei materiellen Voraussetzungen:
   - Kann eine bestimmte Antwort das Verfahren vorzeitig beenden?
   - Führt eine Antwort direkt zu einem Teilergebnis?

3. Bei Ermessensfragen:
   - Beide Richtungen können konklusiv sein

TYPES OF CONCLUSIONS:
- NEGATIV_BLOCKIEREND: Weitere Prüfung sinnlos, Rechtsfolge kann nicht eintreten
- POSITIV_ABSCHLIESSEND: Rechtsfolge tritt definitiv ein, keine weiteren Fragen nötig
- VERWEIS_ANDERE_NORM: Prüfung muss mit anderer Norm fortgesetzt werden
- TEILERGEBNIS: Zwischenergebnis erreicht, aber weitere Aspekte zu prüfen

Gib die Antwort AUSSCHLIESSLICH als JSON-Array zurück (NUR Parameter mit konklusiven Antworten):
[
  {
    "Parameter_ID": "STRING - Exakte Parameter_ID aus P2",
    "Konklusive_Antworten_Info": [
      {
        "Antwort_Wert_Intern_Erwartet": "STRING/BOOLEAN - 'Ja'/'Nein' bei JaNein-Typ, 'Option_Wert_Intern' bei Auswahl, true/false als Boolean",
        "Konklusions_Typ": "STRING - EINER VON: 'NEGATIV_BLOCKIEREND', 'POSITIV_ABSCHLIESSEND', 'VERWEIS_ANDERE_NORM', 'TEILERGEBNIS'",
        "Hinweis_Text_Kurz_Fuer_Meldung": "STRING (max 100 Zeichen) - Prägnante Meldung für UI. Beispiel: '❌ Prüfung beendet: Nicht zuständig' oder '✓ Anspruch grundsätzlich gegeben'",
        "Hinweis_Text_Lang_Fuer_Begruendung": "TEXT - Rechtliche Begründung warum diese Antwort konklusiv ist. Zitiere die relevante Rechtsgrundlage. Erkläre die Rechtsfolge. Beispiel: 'Da die Person deutscher Staatsangehöriger ist, findet das Aufenthaltsgesetz gemäß § 1 Abs. 2 AufenthG keine Anwendung. Die Prüfung der weiteren Voraussetzungen des § 32 Abs. 4 AufenthG erübrigt sich.'"
      }
    ]
  }
]

WICHTIG: Erfasse nur Parameter die TATSÄCHLICH konklusive Antworten haben. Leeres Array zurückgeben falls keine gefunden.`,

    SimONA_P3_RegelGenerierung: `ANALYSEAUFTRAG FÜR SimONA-DATENBANK (Tabellen: Regeln und RegelBedingungen)

KONTEXTINFORMATIONEN:
Aktuelle_SimulationsEinheit_ID: "{{SIM_EINHEIT_ID}}"
Gesetz/Verordnung (Abkürzung): "{{GESETZ_ABK}}"
Zu analysierender Normteil: "{{NORMTEIL_BEZEICHNUNG}}"
Exakter Wortlaut des Normteils: "{{NORMTEXT_AUSZUG}}"
Verfuegbare_Parameter_Liste_JSON (aus P2):
{{P2_RESPONSE_JSON_STRING}}
Verfügbare_ErgebnisProfile_Liste_JSON (aus P2.5, validiert):
{{P2_5_RESPONSE_JSON_STRING_VALIDATED}}

KRITISCHE ANWEISUNG - VOLLSTÄNDIGKEIT:
Du MUSST für JEDE mathematisch mögliche Kombination von Parameter-Antworten eine Regel erstellen!
Bei n Ja/Nein-Parametern sind das 2^n Kombinationen.
Bei Auswahl-Parametern multipliziert sich die Anzahl entsprechend.

SYSTEMATISCHES VORGEHEN:
1. LISTE alle Parameter und ihre möglichen Antworten
2. ERSTELLE eine Kombinationsmatrix ALLER Möglichkeiten
3. ORDNE jeder Kombination das korrekte ErgebnisProfil zu
4. PRIORISIERE die Regeln logisch (spezifische vor allgemeinen)

PRIORISIERUNG (WICHTIG für korrekte Auswertung):
- 10-19: Konklusive Negativ-Regeln (Grundvoraussetzungen nicht erfüllt)
- 20-29: Spezielle Ausnahmeregeln
- 30-49: Standardfälle mit vollständiger Tatbestandserfüllung
- 50-69: Ermessensentscheidungen
- 70-89: Teilerfüllungen oder Sonderfälle
- 90-99: Auffangregeln (Catch-All)

Gib die Antwort AUSSCHLIESSLICH als JSON-Array zurück:
[
  {
    "Regel_Name": "STRING (max 100) - Sprechender Name der die Konstellation beschreibt. Schema: '[Ergebnistyp]: [Bedingungsbeschreibung]'. Beispiel: 'Negativ: Kein Ausländer - Anwendungsbereich nicht eröffnet'",
    "Prioritaet": "INTEGER - EINDEUTIGE Zahl gemäß obiger Systematik. KEINE DOPPELTEN PRIORITÄTEN!",
    "FK_ErgebnisProfil_ID_Referenz": "STRING - MUSS eine ID aus der validierten ErgebnisProfil-Liste sein",
    "Bedingungen_fuer_Regel": [
      {
        "FK_Parameter_ID": "STRING - Exakte Parameter_ID aus P2",
        "Operator": "STRING - Verwende NUR: 'IST_GLEICH' für String-Vergleiche, 'IST_WAHR'/'IST_FALSCH' für boolesche Prüfungen",
        "Erwarteter_Wert_Intern": "STRING/BOOLEAN - Bei JaNein: 'Ja' oder 'Nein' als STRING. Bei Auswahl: Der Option_Wert_Intern. Bei IST_WAHR/IST_FALSCH: true/false als BOOLEAN"
      }
    ]
  }
]

VOLLSTÄNDIGKEITSKONTROLLE (KRITISCH!):
- Hast du WIRKLICH alle Kombinationen abgedeckt?
- Führt JEDE mögliche Antwort-Kombination zu genau EINER Regel?
- Keine Überschneidungen? Keine Lücken?
- Teste gedanklich einige Kombinationen!

BEISPIEL-KALKULATION:
3 Ja/Nein-Parameter = 2³ = 8 Regeln minimum
2 Ja/Nein + 1 Auswahl(3 Optionen) = 2² × 3 = 12 Regeln minimum`,

    SimONA_P4_ErgebnisProfilDetails: `ANALYSEAUFTRAG FÜR SimONA-DATENBANK (Tabelle: ErgebnisProfile)

KONTEXTINFORMATIONEN:
Aktuelle_SimulationsEinheit_ID: "{{SIM_EINHEIT_ID}}"
Gesetz/Verordnung (Abkürzung): "{{GESETZ_ABK}}"
Zu analysierender Normteil: "{{NORMTEIL_BEZEICHNUNG}}"
Exakter Wortlaut des Normteils: "{{NORMTEXT_AUSZUG}}"
Informationen_zur_SimulationsEinheit_JSON (P1):
{{P1_RESPONSE_JSON_STRING}}
Verfuegbare_Parameter_Liste_JSON (P2):
{{P2_RESPONSE_JSON_STRING}}
Zu_Definierende_ErgebnisProfile_IDs (aus P3):
{{P3_ERGEBNISPROFILE_IDS_USED_LIST_JSON}}

ANWEISUNG:
Erstelle für JEDES ErgebnisProfil eine vollständige, rechtlich fundierte Dokumentation.

QUALITÄTSKRITERIEN für Verwaltungsentscheidungen:
1. ENTSCHEIDUNG: Klar, eindeutig, rechtssicher formuliert
2. BEGRÜNDUNG: Vollständige rechtliche Würdigung mit Subsumtion
3. RECHTSGRUNDLAGEN: Exakte Paragraphen-Zitate
4. TRANSPARENZ: Nachvollziehbare Darstellung der Prüfschritte
5. RECHTSMITTEL: Hinweise auf weitere Verfahrensmöglichkeiten

STRUKTUR-VORGABEN:
- Entscheidungstext: Aktiv-Formulierung, Präsens
- Begründung: Strukturiert nach Tatbestandsmerkmalen
- Dynamische Parameter: Zeige nur erfüllte/nicht erfüllte Voraussetzungen
- Abschluss: Zusammenfassung und Ausblick

Gib die Antwort AUSSCHLIESSLICH als JSON-Array zurück:
[
  {
    "ErgebnisProfil_ID_Referenz": "STRING - Die exakte ID aus der Eingabeliste",
    "Profil_Name": "STRING (max 100) - Prägnanter Name für interne Verwendung. Schema: '[Entscheidungstyp] - [Rechtsfolge]'",
    "Entscheidungstext_Kurz_Vorlage": "TEXT - Die KERNAUSSAGE der Entscheidung in 1-2 Sätzen. Verwaltungssprachlich korrekt. Beispiel: 'Der Aufenthalt in der Gaststätte [Gaststaettenname] ist zu untersagen. Die Voraussetzungen des § 32 Abs. 4 JuSchG liegen vor.'",
    "Art_der_Entscheidung_Anzeige_Text": "STRING (max 100) - Kategorisierung für interne Zwecke: 'Untersagung', 'Gestattung', 'Ablehnung', 'Teilverfügung', 'Ermessensentscheidung - positiv', 'Verfahrenseinstellung', etc.",
    "Einleitungstext_Begruendung_Vorlage": "TEXT - Standardeinleitung. Beispiel: 'Die Prüfung der Voraussetzungen des § 32 Abs. 4 JuSchG hat folgendes ergeben:'",
    "Begruendung_Dynamische_Parameter_Liste": [
      "ARRAY von Parameter_IDs - Liste ALLER Parameter deren Text_Erfuellt_Pro oder Text_NichtErfuellt_Contra in die Begründung einfließen soll. Ordne sie in LOGISCHER PRÜFREIHENFOLGE!"
    ],
    "Spezifischer_Ergaenzungstext_Begruendung_Vorlage": "TEXT - Rechtliche Würdigung und Subsumtion. Bei NEGATIVENTSCHEIDUNGEN: Erkläre warum die Rechtsfolge nicht eintritt. Bei ERMESSEN: Dokumentiere die Ermessensausübung mit Verweis auf § 40 VwVfG. Zitiere EXAKTE Rechtsgrundlagen. Beispiel: 'Die Tatbestandsvoraussetzungen des § 32 Abs. 4 JuSchG sind erfüllt. Die Gaststätte wird als Nachtclub geführt (§ 32 Abs. 4 Alternative 1 JuSchG). Gemäß dem eindeutigen Wortlaut der Norm (darf nicht gestattet werden) besteht kein Ermessensspielraum.'",
    "Abschlusstext_Begruendung_Vorlage": "TEXT - Zusammenfassung und weitere Hinweise. MUSS ENTHALTEN: 1) Zusammenfassung der Entscheidung, 2) Hinweis auf Rechtsfolgen, 3) Bei Ablehnungen: Hinweis auf Antragsrecht bei Änderung der Umstände. Beispiel: 'Im Ergebnis ist der Aufenthalt in der genannten Gaststätte zu untersagen. Diese Entscheidung gilt bis zur Vollendung des 18. Lebensjahres. Bei Zuwiderhandlung können Maßnahmen nach § 33 JuSchG ergriffen werden.'"
  }
]

QUALITÄTSKONTROLLE:
- Ist die Entscheidung rechtssicher formuliert?
- Enthält die Begründung alle relevanten Tatbestandsmerkmale?
- Sind alle Rechtsgrundlagen korrekt zitiert?
- Würde diese Begründung einer gerichtlichen Überprüfung standhalten?`,

    SimONA_P5_QualitaetsAudit: `ANALYSEAUFTRAG: QUALITÄTS-AUDIT EINES SimONA-DATENMODELLS

DU BIST EIN UNABHÄNGIGER JURISTISCHER PRÜFER mit der Aufgabe, ein erstelltes Datenmodell für eine deutsche Rechtsnorm auf Vollständigkeit, Korrektheit und Praxistauglichkeit zu prüfen.

KONTEXT:
Ein System hat den folgenden Normtext analysiert und in ein strukturiertes Datenmodell überführt.

URSPRÜNGLICHER NORMTEXT:
"{{NORMTEXT_AUSZUG}}"

ERSTELLTES DATENMODELL (JSON):
{{P1_P4_DATENSATZ_JSON}}

PRÜFAUFTRAG:
Führe ein systematisches Audit durch mit Fokus auf:
1. VOLLSTÄNDIGKEIT: Wurden alle Tatbestandsmerkmale erfasst?
2. KORREKTHEIT: Stimmen die rechtlichen Interpretationen?
3. LOGIK: Sind die Regeln widerspruchsfrei und decken alle Fälle ab?
4. PRAXISTAUGLICHKEIT: Kann ein Verwaltungsmitarbeiter damit arbeiten?

Beachte, dass bei diesem Audit ausschließlich die Analyse des explizit angeführten Teils der Rechtsnorm, in der Regel eine Absatz, bewertet werden soll. 
Alle anderen Absätze des Paragrafen werden separat bewertet und erst danach einer Gesamtbetrachtung unterworfen und gemeinsam bewertet.


KRITISCHE PRÜFPUNKTE:
- Fehlen Tatbestandsmerkmale oder wurden welche falsch interpretiert?
- Sind die Fragen eindeutig und rechtssicher formulierbar?
- Führt jede Parameterkombination zu genau einem Ergebnis?
- Sind die Begründungen rechtlich fundiert?
- Wurden Ermessensspielräume korrekt erkannt?

Gib dein Audit AUSSCHLIESSLICH als JSON-Objekt zurück:

{
  "Gesamtbewertung": {
    "Score": "FLOAT zwischen 1.0 und 10.0 - Gewichtung: Vollständigkeit 40%, Korrektheit 40%, Praxistauglichkeit 20%",
    "Fazit": "TEXT - Management Summary in 1-2 Sätzen. Ist das Modell einsatzbereit oder gibt es kritische Mängel?"
  },
  "Detailbewertungen": [
    {
      "Kategorie": "Vollständigkeit der Parameter",
      "Score": "INTEGER 1-10",
      "Begruendung": "TEXT - Wurden alle Tatbestandsmerkmale als Parameter erfasst? Falls etwas fehlt: WAS genau? Beispiel: 'Das Tatbestandsmerkmal vergleichbare Vergnügungsbetriebe wurde nicht als eigener Parameter erfasst, obwohl es eine eigenständige Prüfung erfordert.'"
    },
    {
      "Kategorie": "Logische Konsistenz der Regeln",
      "Score": "INTEGER 1-10",
      "Begruendung": "TEXT - Prüfe: 1) Decken die Regeln ALLE Parameterkombinationen ab? 2) Ist die Prioritätsreihenfolge korrekt (werden spezielle vor allgemeinen Regeln geprüft)? 3) Führt jede Kombination zu genau einem Ergebnis? Falls Fehler: Nenne KONKRETE Beispiele!"
    },
    {
      "Kategorie": "Qualität der Fragetexte und Ergebnisprofile",
      "Score": "INTEGER 1-10",
      "Begruendung": "TEXT - Sind die Fragen für Verwaltungsmitarbeiter eindeutig? Sind die Entscheidungstexte rechtssicher formuliert? Enthalten die Begründungen alle notwendigen Elemente? Sind Rechtsgrundlagen korrekt zitiert?"
    }
  ],
  "Kritische_Befunde": [
    "TEXT-ARRAY - Liste konkreter FEHLER die korrigiert werden MÜSSEN. Nur eintragen wenn Score < 7. Beispiel: 'Regel mit Priorität 15 und 17 überschneiden sich - beide werden bei Ausländer=Ja aktiviert.'"
  ],
  "Verbesserungsvorschlaege": [
    "TEXT-ARRAY - Konkrete Optimierungen die das Modell verbessern würden. Beispiel: 'Parameter P_32_4_Gaststaettentyp sollte die Option Diskothek zusätzlich aufnehmen, da rechtlich relevant.'"
  ]
}

BEWERTUNGSMASSSTAB:
10 = Perfekt, sofort einsetzbar
8-9 = Sehr gut, minimale Anpassungen
6-7 = Gut, einige Verbesserungen nötig
4-5 = Ausreichend, größere Überarbeitungen erforderlich
1-3 = Mangelhaft, grundlegende Fehler

SEI STRENG ABER FAIR! Ein Modell mit fehlenden Tatbestandsmerkmalen oder lückenhaften Regeln kann nicht über 6 bewertet werden.`
};