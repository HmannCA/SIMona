-- ========================================
-- SimONA SQL-Export
-- Version: 2.5
-- Datum: 2025-07-10T02:30:04.680Z
-- SimulationsEinheit: SE_AufenthG_15_Abs5__v_Standard
-- ========================================

START TRANSACTION;

-- SQL für SimulationsEinheiten und Regelwerke (basierend auf P1 Daten)
INSERT INTO SimulationsEinheiten (
  Einheit_ID,
  Gesetz,
  Gesetz_Vollname,
  Gesetz_Aktueller_Stand,
  Paragraph,
  Paragraph_Offizielle_Bezeichnung,
  Paragraf_Gesamtbeschreibung,
  Absatz,
  Satz,
  Kurzbeschreibung,
  Art_Rechtsfolge_Positiv_Typ,
  Gesetzestext_Referenz_Link,
  Gesetzestext_Zitat,
  FK_Entscheidungsart_ID,
  Ermessensleitlinien_Text,
  Letzte_Aenderung_SimONA_Datum,
  Version_SimONA
) VALUES (
  'SE_AufenthG_15_Abs5__v_Standard',
  'AufenthG',
  'Gesetz über den Aufenthalt, die Erwerbstätigkeit und die Integration von Ausländern im Bundesgebiet',
  'Stand: Zuletzt geändert durch Art. 3 G v. 8.5.2024 I Nr. 152',
  '15',
  'Zurückweisung',
  'Regelt die Voraussetzungen und Umstände, unter denen ein Ausländer an der Grenze zwingend zurückgewiesen wird (Abs. 1), zurückgewiesen werden kann (Abs. 2, 3), sowie die anzuwendenden Schutzvorschriften (Abs. 4) und die Möglichkeit der Zurückweisungshaft zur Sicherung der Maßnahme (Abs. 5, 6).',
  '5',
  '1-3',
  'Regelt die Voraussetzungen für die Anordnung von Zurückweisungshaft als Soll-Vorschrift sowie die aufhebende Wirkung einer richterlichen Ablehnung der Haft auf die zwingende Zurückweisung nach Abs. 1.',
  'Anordnung von Zurückweisungshaft',
  'https://www.gesetze-im-internet.de/aufenthg_2004/__15.html',
  '(5) Ein Ausländer soll zur Sicherung der Zurückweisung auf richterliche Anordnung in Haft (Zurückweisungshaft) genommen werden, wenn eine Zurückweisungsentscheidung ergangen ist und diese nicht unmittelbar vollzogen werden kann. Im Übrigen ist § 62 Absatz 4 entsprechend anzuwenden. In den Fällen, in denen der Richter die Anordnung oder die Verlängerung der Haft ablehnt, findet Absatz 1 keine Anwendung.',
  (SELECT Entscheidungsart_ID FROM Entscheidungsarten_Lookup WHERE Bezeichnung = 'Ermessen (Soll-Vorschrift)'),
  'Keine spezifischen Leitlinien für die Ausnahme von der Regel bzw. für die Regelfallentscheidung im Normtext gefunden. Allgemeine Grundsätze der Ermessensausübung und Verhältnismäßigkeit sind zu beachten.',
  CURDATE(),
  '2.5'
);

INSERT INTO Regelwerke (Regelwerk_ID, FK_Einheit_ID, Beschreibung) VALUES (
  'SE_AufenthG_15_Abs5__v_Standard',
  'SE_AufenthG_15_Abs5__v_Standard',
  'Regelwerk für Regelt die Voraussetzungen für die Anordnung von Zurückweisungshaft als Soll-Vorschrift sowie die aufhebende Wirkung einer richterlichen Ablehnung der Haft auf die zwingende Zurückweisung nach Abs. 1.'
);


-- SQL für Parameter und Parameter_Antwortoptionen (basierend auf P2 Daten)
INSERT INTO Parameter (
  Parameter_ID,
  FK_Einheit_ID,
  Parameter_Name,
  Reihenfolge_Anzeige,
  IstGrundvoraussetzung,
  AnzeigeBedingungJSON,
  KonklusiveAntwortenInfoJSON,
  Fragetext,
  Antworttyp,
  Begleittext,
  Normbezug_Detail_Parameter,
  Verweis_Normen_Info_Parameter,
  FK_Verlinkte_SimulationsEinheit_ID,
  Verlinkung_Platzhalter_Text,
  Text_Erfuellt_Pro,
  Text_NichtErfuellt_Contra
) VALUES (
  'P_15_5_Zurueckweisungsentscheidung_Ergangen',
  'SE_AufenthG_15_Abs5__v_Standard',
  'Ergangen',
  1,
  TRUE,
  NULL,
  '[{"Antwort_Wert_Intern_Erwartet":"Nein","Konklusions_Typ":"NEGATIV_BLOCKIEREND","Hinweis_Text_Kurz_Fuer_Meldung":"Keine Haftanordnung möglich, da keine Zurückweisungsentscheidung vorliegt.","Hinweis_Text_Lang_Fuer_Begruendung":"Grundvoraussetzung für die Beantragung von Zurückweisungshaft ist eine bereits ergangene, vollziehbare Zurückweisungsentscheidung. Da diese fehlt, ist die Prüfung beendet."}]',
  'Ist eine vollziehbare Zurückweisungsentscheidung gegen den Ausländer ergangen?',
  'JaNein',
  'Die Zurückweisungshaft dient der Sicherung einer bereits getroffenen, aber noch nicht vollzogenen Entscheidung. Daher muss eine solche Entscheidung formell vorliegen.',
  '§ 15 Abs. 5 Satz 1',
  NULL,
  NULL,
  NULL,
  'Eine vollziehbare Zurückweisungsentscheidung ist ergangen.',
  'Es liegt keine vollziehbare Zurückweisungsentscheidung vor, eine Haftanordnung ist daher nicht möglich.'
);

INSERT INTO Parameter (
  Parameter_ID,
  FK_Einheit_ID,
  Parameter_Name,
  Reihenfolge_Anzeige,
  IstGrundvoraussetzung,
  AnzeigeBedingungJSON,
  KonklusiveAntwortenInfoJSON,
  Fragetext,
  Antworttyp,
  Begleittext,
  Normbezug_Detail_Parameter,
  Verweis_Normen_Info_Parameter,
  FK_Verlinkte_SimulationsEinheit_ID,
  Verlinkung_Platzhalter_Text,
  Text_Erfuellt_Pro,
  Text_NichtErfuellt_Contra
) VALUES (
  'P_15_5_Vollzug_Nicht_Unmittelbar',
  'SE_AufenthG_15_Abs5__v_Standard',
  'Unmittelbar',
  2,
  TRUE,
  '[{"Referenz_Parameter_ID":"P_15_5_Zurueckweisungsentscheidung_Ergangen","Referenz_Antwort_Operator":"IST_GLEICH","Referenz_Antwort_Wert_Intern":"Ja"}]',
  '[{"Antwort_Wert_Intern_Erwartet":"Nein","Konklusions_Typ":"NEGATIV_BLOCKIEREND","Hinweis_Text_Kurz_Fuer_Meldung":"Keine Haftanordnung nötig, da die Zurückweisung sofort vollzogen werden kann.","Hinweis_Text_Lang_Fuer_Begruendung":"Die Zurückweisungshaft dient der Sicherung einer nicht unmittelbar vollziehbaren Maßnahme. Da die Zurückweisung sofort vollzogen werden kann, ist eine Haft nicht erforderlich und die Prüfung beendet."}]',
  'Kann die Zurückweisung aus tatsächlichen Gründen nicht unmittelbar vollzogen werden (z.B. wegen fehlender Transportmöglichkeit)?',
  'JaNein',
  'Die Haft ist nur zulässig, wenn die Zurückweisung nicht sofort durchgeführt werden kann. Dies kann z.B. der Fall sein, wenn die Grenzübergangsstelle geschlossen ist oder kein Transportmittel zur Verfügung steht.',
  '§ 15 Abs. 5 Satz 1',
  NULL,
  NULL,
  NULL,
  'Die Zurückweisung kann nicht unmittelbar vollzogen werden.',
  'Die Zurückweisung kann unmittelbar vollzogen werden, weshalb keine Zurückweisungshaft erforderlich ist.'
);

INSERT INTO Parameter (
  Parameter_ID,
  FK_Einheit_ID,
  Parameter_Name,
  Reihenfolge_Anzeige,
  IstGrundvoraussetzung,
  AnzeigeBedingungJSON,
  KonklusiveAntwortenInfoJSON,
  Fragetext,
  Antworttyp,
  Begleittext,
  Normbezug_Detail_Parameter,
  Verweis_Normen_Info_Parameter,
  FK_Verlinkte_SimulationsEinheit_ID,
  Verlinkung_Platzhalter_Text,
  Text_Erfuellt_Pro,
  Text_NichtErfuellt_Contra
) VALUES (
  'P_15_5_Haftgrund_Gemaess_62',
  'SE_AufenthG_15_Abs5__v_Standard',
  '62',
  3,
  TRUE,
  '[{"Referenz_Parameter_ID":"P_15_5_Vollzug_Nicht_Unmittelbar","Referenz_Antwort_Operator":"IST_GLEICH","Referenz_Antwort_Wert_Intern":"Ja"}]',
  '[{"Antwort_Wert_Intern_Erwartet":"Ja","Konklusions_Typ":"POSITIV_ABSCHLIESSEND","Hinweis_Text_Kurz_Fuer_Meldung":"Voraussetzungen für Haftantrag erfüllt. Die Anordnung von Haft ist der Regelfall.","Hinweis_Text_Lang_Fuer_Begruendung":"Da alle Voraussetzungen des § 15 Abs. 5 S. 1 vorliegen und ein Haftgrund nach § 62 Abs. 4 besteht, soll die Zurückweisungshaft richterlich beantragt werden. Ein Absehen ist nur in atypischen Ausnahmefällen möglich."},{"Antwort_Wert_Intern_Erwartet":"Nein","Konklusions_Typ":"NEGATIV_BLOCKIEREND","Hinweis_Text_Kurz_Fuer_Meldung":"Kein Haftantrag, da kein spezifischer Haftgrund (z.B. Fluchtgefahr) vorliegt.","Hinweis_Text_Lang_Fuer_Begruendung":"Für die Anordnung von Zurückweisungshaft ist ein spezifischer Haftgrund, wie die Fluchtgefahr, erforderlich. Da ein solcher Grund nicht vorliegt, kann keine Haft beantragt werden."}]',
  'Besteht ein Haftgrund zur Sicherung der Zurückweisung (insbesondere Fluchtgefahr) gemäß der entsprechenden Anwendung von § 62 Abs. 4 AufenthG?',
  'JaNein',
  'Die Haftanordnung erfordert einen spezifischen Grund, der die Sicherung der Zurückweisung notwendig macht. Der wichtigste Grund ist die Fluchtgefahr, die anhand konkreter Tatsachen zu begründen ist (z.B. Vernichtung von Dokumenten, Angabe falscher Daten).',
  '§ 15 Abs. 5 Satz 1 und 2',
  '§ 62 Abs. 4 AufenthG',
  NULL,
  NULL,
  'Es liegt ein spezifischer Haftgrund (z.B. Fluchtgefahr) vor, der die Beantragung der Haft rechtfertigt.',
  'Es liegt kein spezifischer Haftgrund vor, weshalb die Beantragung der Haft nicht gerechtfertigt ist.'
);


-- SQL für ErgebnisProfile (basierend auf P4 Daten)
INSERT INTO ErgebnisProfile (
  ErgebnisProfil_ID_Referenz,
  FK_Einheit_ID,
  Profil_Name,
  Entscheidungstext_Kurz_Vorlage,
  Art_der_Entscheidung_Anzeige_Text,
  Einleitungstext_Begruendung_Vorlage,
  Begruendung_Dynamische_Parameter_Liste,
  Spezifischer_Ergaenzungstext_Begruendung_Vorlage,
  Abschlusstext_Begruendung_Vorlage
) VALUES (
  'EP_15_5_Negativ_Kein_Haftantrag',
  'SE_AufenthG_15_Abs5__v_Standard',
  'Kein Antrag auf Zurückweisungshaft',
  'Die Voraussetzungen für die Beantragung von Zurückweisungshaft nach § 15 Abs. 5 AufenthG sind nicht erfüllt. Es wird kein Haftantrag gestellt.',
  'Soll-Vorschrift: Voraussetzungen nicht erfüllt',
  'Die Prüfung der Voraussetzungen für die Beantragung von Zurückweisungshaft hat ergeben:',
  '[{"Parameter_ID":"P_15_5_Zurueckweisungsentscheidung_Ergangen"},{"Parameter_ID":"P_15_5_Vollzug_Nicht_Unmittelbar"},{"Parameter_ID":"P_15_5_Haftgrund_Gemaess_62"}]',
  NULL,
  'Da eine der zwingenden Voraussetzungen fehlt, ist ein Antrag auf Zurückweisungshaft nicht zulässig.'
);

INSERT INTO ErgebnisProfile (
  ErgebnisProfil_ID_Referenz,
  FK_Einheit_ID,
  Profil_Name,
  Entscheidungstext_Kurz_Vorlage,
  Art_der_Entscheidung_Anzeige_Text,
  Einleitungstext_Begruendung_Vorlage,
  Begruendung_Dynamische_Parameter_Liste,
  Spezifischer_Ergaenzungstext_Begruendung_Vorlage,
  Abschlusstext_Begruendung_Vorlage
) VALUES (
  'EP_15_5_Positiv_Haftantrag_Soll',
  'SE_AufenthG_15_Abs5__v_Standard',
  'Soll-Anordnung: Antrag auf Zurückweisungshaft',
  'Alle Voraussetzungen für die Beantragung von Zurückweisungshaft sind erfüllt. Die Beantragung der Haft ist der gesetzliche Regelfall (Soll-Vorschrift).',
  'Soll-Vorschrift: Regelfall erfüllt',
  'Die Prüfung der Voraussetzungen für die Beantragung von Zurückweisungshaft hat ergeben:',
  '[{"Parameter_ID":"P_15_5_Zurueckweisungsentscheidung_Ergangen"},{"Parameter_ID":"P_15_5_Vollzug_Nicht_Unmittelbar"},{"Parameter_ID":"P_15_5_Haftgrund_Gemaess_62"}]',
  'Keine spezifischen Leitlinien für die Ausnahme von der Regel bzw. für die Regelfallentscheidung im Normtext gefunden. Allgemeine Grundsätze der Ermessensausübung und Verhältnismäßigkeit sind zu beachten.',
  'Ein Absehen vom Haftantrag kommt nur in atypischen Ausnahmefällen in Betracht, die im Rahmen der pflichtgemäßen Ermessensausübung zu prüfen sind.'
);


-- SQL für Regeln und RegelBedingungen (basierend auf P3 Daten)
INSERT INTO Regeln (
  FK_Regelwerk_ID,
  Regel_Name,
  Prioritaet,
  FK_ErgebnisProfil_ID_Referenz
) VALUES (
  'SE_AufenthG_15_Abs5__v_Standard',
  'Kein Haftantrag mangels Zurückweisungsentscheidung',
  10,
  'EP_15_5_Negativ_Kein_Haftantrag'
);
SET @last_regel_id = LAST_INSERT_ID();

INSERT INTO RegelBedingungen (
  FK_Regel_ID,
  FK_Parameter_ID,
  Operator,
  Erwarteter_Wert_Intern
) VALUES (
  @last_regel_id,
  'P_15_5_Zurueckweisungsentscheidung_Ergangen',
  'IST_GLEICH',
  'Nein'
);

INSERT INTO Regeln (
  FK_Regelwerk_ID,
  Regel_Name,
  Prioritaet,
  FK_ErgebnisProfil_ID_Referenz
) VALUES (
  'SE_AufenthG_15_Abs5__v_Standard',
  'Kein Haftantrag, da Vollzug unmittelbar möglich ist',
  20,
  'EP_15_5_Negativ_Kein_Haftantrag'
);
SET @last_regel_id = LAST_INSERT_ID();

INSERT INTO RegelBedingungen (
  FK_Regel_ID,
  FK_Parameter_ID,
  Operator,
  Erwarteter_Wert_Intern
) VALUES (
  @last_regel_id,
  'P_15_5_Vollzug_Nicht_Unmittelbar',
  'IST_GLEICH',
  'Nein'
);

INSERT INTO Regeln (
  FK_Regelwerk_ID,
  Regel_Name,
  Prioritaet,
  FK_ErgebnisProfil_ID_Referenz
) VALUES (
  'SE_AufenthG_15_Abs5__v_Standard',
  'Kein Haftantrag mangels spezifischem Haftgrund',
  30,
  'EP_15_5_Negativ_Kein_Haftantrag'
);
SET @last_regel_id = LAST_INSERT_ID();

INSERT INTO RegelBedingungen (
  FK_Regel_ID,
  FK_Parameter_ID,
  Operator,
  Erwarteter_Wert_Intern
) VALUES (
  @last_regel_id,
  'P_15_5_Haftgrund_Gemaess_62',
  'IST_GLEICH',
  'Nein'
);

INSERT INTO Regeln (
  FK_Regelwerk_ID,
  Regel_Name,
  Prioritaet,
  FK_ErgebnisProfil_ID_Referenz
) VALUES (
  'SE_AufenthG_15_Abs5__v_Standard',
  'Soll-Anordnung zum Haftantrag bei Erfüllung aller Kriterien',
  40,
  'EP_15_5_Positiv_Haftantrag_Soll'
);
SET @last_regel_id = LAST_INSERT_ID();

INSERT INTO RegelBedingungen (
  FK_Regel_ID,
  FK_Parameter_ID,
  Operator,
  Erwarteter_Wert_Intern
) VALUES (
  @last_regel_id,
  'P_15_5_Zurueckweisungsentscheidung_Ergangen',
  'IST_GLEICH',
  'Ja'
);
INSERT INTO RegelBedingungen (
  FK_Regel_ID,
  FK_Parameter_ID,
  Operator,
  Erwarteter_Wert_Intern
) VALUES (
  @last_regel_id,
  'P_15_5_Vollzug_Nicht_Unmittelbar',
  'IST_GLEICH',
  'Ja'
);
INSERT INTO RegelBedingungen (
  FK_Regel_ID,
  FK_Parameter_ID,
  Operator,
  Erwarteter_Wert_Intern
) VALUES (
  @last_regel_id,
  'P_15_5_Haftgrund_Gemaess_62',
  'IST_GLEICH',
  'Ja'
);


-- ========================================
-- Ende der SQL-Generierung
-- ========================================
COMMIT;

-- SQL für QualitaetsAudit (basierend auf P5 Audit)
START TRANSACTION;

INSERT INTO QualitaetsAudits (
  FK_Einheit_ID, Audit_Timestamp, Gesamtscore, Gesamtfazit,
  P5_Prompt_Text, P5_Response_JSON
) VALUES (
  'SE_AufenthG_15_Abs5__v_Standard',
  '2025-07-10T02:31:59.325Z',
  6.5,
  'Das Datenmodell bildet die Grundstruktur der Zurückweisungshaft korrekt ab, enthält jedoch einen gravierenden materiellen Fehler: Die wichtige Rechtsfolge aus Satz 3 fehlt vollständig, wonach bei richterlicher Ablehnung der Haft die zwingende Zurückweisung nach Abs. 1 nicht mehr gilt.',
  'ANALYSEAUFTRAG: QUALITÄTS-AUDIT EINES SimONA-DATENMODELLS

DU BIST EIN HOCHSPEZIALISIERTER KI-RECHTSEXPERTE mit der Aufgabe, ein bestehendes, von einem anderen System erstelltes Datenmodell für eine deutsche Rechtsnorm auf seine fachliche Qualität und Plausibilität zu prüfen. Du agierst als unabhängiger Auditor.

KONTEXT:
Ein Fachexperte hat mithilfe einer KI den folgenden deutschen Normtext analysiert und in ein strukturiertes JSON-Datenmodell überführt. Deine Aufgabe ist es, dieses Ergebnis zu bewerten.

URSPRÜNGLICHER NORMTEXT:
"(5) Ein Ausländer soll zur Sicherung der Zurückweisung auf richterliche Anordnung in Haft (Zurückweisungshaft) genommen werden, wenn eine Zurückweisungsentscheidung ergangen ist und diese nicht unmittelbar vollzogen werden kann. Im Übrigen ist § 62 Absatz 4 entsprechend anzuwenden. In den Fällen, in denen der Richter die Anordnung oder die Verlängerung der Haft ablehnt, findet Absatz 1 keine Anwendung."

VOM EXPERTEN ERSTELLTES UND VALIDERTES DATENMODELL (JSON):
{
  "SimulationsEinheit_Metadaten": {
    "Gesetz": "AufenthG",
    "Paragraph": "15",
    "Absatz": "5",
    "Satz": "1-3",
    "Kurzbeschreibung": "Regelt die Voraussetzungen für die Anordnung von Zurückweisungshaft als Soll-Vorschrift sowie die aufhebende Wirkung einer richterlichen Ablehnung der Haft auf die zwingende Zurückweisung nach Abs. 1.",
    "Gesetzestext_Zitat_Analysierter_Teil": "(5) Ein Ausländer soll zur Sicherung der Zurückweisung auf richterliche Anordnung in Haft (Zurückweisungshaft) genommen werden, wenn eine Zurückweisungsentscheidung ergangen ist und diese nicht unmittelbar vollzogen werden kann. Im Übrigen ist § 62 Absatz 4 entsprechend anzuwenden. In den Fällen, in denen der Richter die Anordnung oder die Verlängerung der Haft ablehnt, findet Absatz 1 keine Anwendung.",
    "Art_Rechtsfolge_Positiv_Typ": "Anordnung von Zurückweisungshaft",
    "FK_Entscheidungsart_ID_Lookup_Bezeichnung": "Ermessen (Soll-Vorschrift)",
    "Ermessensleitlinien_Text": "Keine spezifischen Leitlinien für die Ausnahme von der Regel bzw. für die Regelfallentscheidung im Normtext gefunden. Allgemeine Grundsätze der Ermessensausübung und Verhältnismäßigkeit sind zu beachten.",
    "Gesetz_Vollstaendiger_Name": "Gesetz über den Aufenthalt, die Erwerbstätigkeit und die Integration von Ausländern im Bundesgebiet",
    "Paragraf_Uebergreifende_Kurzbeschreibung": "Regelt die Voraussetzungen und Umstände, unter denen ein Ausländer an der Grenze zwingend zurückgewiesen wird (Abs. 1), zurückgewiesen werden kann (Abs. 2, 3), sowie die anzuwendenden Schutzvorschriften (Abs. 4) und die Möglichkeit der Zurückweisungshaft zur Sicherung der Maßnahme (Abs. 5, 6).",
    "Gesetz_Aktueller_Stand_Datum": "Stand: Zuletzt geändert durch Art. 3 G v. 8.5.2024 I Nr. 152",
    "Paragraph_Offizielle_Bezeichnung": "Zurückweisung"
  },
  "Parameter_Liste": [
    {
      "Parameter_ID": "P_15_5_Zurueckweisungsentscheidung_Ergangen",
      "Reihenfolge_Anzeige": 1,
      "Fragetext": "Ist eine vollziehbare Zurückweisungsentscheidung gegen den Ausländer ergangen?",
      "Antworttyp": "JaNein",
      "Antwortoptionen_bei_Auswahl": [],
      "Begleittext": "Die Zurückweisungshaft dient der Sicherung einer bereits getroffenen, aber noch nicht vollzogenen Entscheidung. Daher muss eine solche Entscheidung formell vorliegen.",
      "Normbezug_Detail_Parameter": "§ 15 Abs. 5 Satz 1",
      "Verweis_Normen_Info_Parameter": null,
      "FK_Verlinkte_SimulationsEinheit_ID_Platzhalter": null,
      "Ist_Grundvoraussetzung": true,
      "Anzeige_Bedingung": [],
      "Text_Erfuellt_Pro": "Eine vollziehbare Zurückweisungsentscheidung ist ergangen.",
      "Text_NichtErfuellt_Contra": "Es liegt keine vollziehbare Zurückweisungsentscheidung vor, eine Haftanordnung ist daher nicht möglich.",
      "Konklusive_Antworten_Info": [
        {
          "Antwort_Wert_Intern_Erwartet": "Nein",
          "Konklusions_Typ": "NEGATIV_BLOCKIEREND",
          "Hinweis_Text_Kurz_Fuer_Meldung": "Keine Haftanordnung möglich, da keine Zurückweisungsentscheidung vorliegt.",
          "Hinweis_Text_Lang_Fuer_Begruendung": "Grundvoraussetzung für die Beantragung von Zurückweisungshaft ist eine bereits ergangene, vollziehbare Zurückweisungsentscheidung. Da diese fehlt, ist die Prüfung beendet."
        }
      ],
      "Parameter_Name": "Ergangen"
    },
    {
      "Parameter_ID": "P_15_5_Vollzug_Nicht_Unmittelbar",
      "Reihenfolge_Anzeige": 2,
      "Fragetext": "Kann die Zurückweisung aus tatsächlichen Gründen nicht unmittelbar vollzogen werden (z.B. wegen fehlender Transportmöglichkeit)?",
      "Antworttyp": "JaNein",
      "Antwortoptionen_bei_Auswahl": [],
      "Begleittext": "Die Haft ist nur zulässig, wenn die Zurückweisung nicht sofort durchgeführt werden kann. Dies kann z.B. der Fall sein, wenn die Grenzübergangsstelle geschlossen ist oder kein Transportmittel zur Verfügung steht.",
      "Normbezug_Detail_Parameter": "§ 15 Abs. 5 Satz 1",
      "Verweis_Normen_Info_Parameter": null,
      "FK_Verlinkte_SimulationsEinheit_ID_Platzhalter": null,
      "Ist_Grundvoraussetzung": true,
      "Anzeige_Bedingung": [
        {
          "Referenz_Parameter_ID": "P_15_5_Zurueckweisungsentscheidung_Ergangen",
          "Referenz_Antwort_Operator": "IST_GLEICH",
          "Referenz_Antwort_Wert_Intern": "Ja"
        }
      ],
      "Text_Erfuellt_Pro": "Die Zurückweisung kann nicht unmittelbar vollzogen werden.",
      "Text_NichtErfuellt_Contra": "Die Zurückweisung kann unmittelbar vollzogen werden, weshalb keine Zurückweisungshaft erforderlich ist.",
      "Konklusive_Antworten_Info": [
        {
          "Antwort_Wert_Intern_Erwartet": "Nein",
          "Konklusions_Typ": "NEGATIV_BLOCKIEREND",
          "Hinweis_Text_Kurz_Fuer_Meldung": "Keine Haftanordnung nötig, da die Zurückweisung sofort vollzogen werden kann.",
          "Hinweis_Text_Lang_Fuer_Begruendung": "Die Zurückweisungshaft dient der Sicherung einer nicht unmittelbar vollziehbaren Maßnahme. Da die Zurückweisung sofort vollzogen werden kann, ist eine Haft nicht erforderlich und die Prüfung beendet."
        }
      ],
      "Parameter_Name": "Unmittelbar"
    },
    {
      "Parameter_ID": "P_15_5_Haftgrund_Gemaess_62",
      "Reihenfolge_Anzeige": 3,
      "Fragetext": "Besteht ein Haftgrund zur Sicherung der Zurückweisung (insbesondere Fluchtgefahr) gemäß der entsprechenden Anwendung von § 62 Abs. 4 AufenthG?",
      "Antworttyp": "JaNein",
      "Antwortoptionen_bei_Auswahl": [],
      "Begleittext": "Die Haftanordnung erfordert einen spezifischen Grund, der die Sicherung der Zurückweisung notwendig macht. Der wichtigste Grund ist die Fluchtgefahr, die anhand konkreter Tatsachen zu begründen ist (z.B. Vernichtung von Dokumenten, Angabe falscher Daten).",
      "Normbezug_Detail_Parameter": "§ 15 Abs. 5 Satz 1 und 2",
      "Verweis_Normen_Info_Parameter": "§ 62 Abs. 4 AufenthG",
      "FK_Verlinkte_SimulationsEinheit_ID_Platzhalter": null,
      "Ist_Grundvoraussetzung": true,
      "Anzeige_Bedingung": [
        {
          "Referenz_Parameter_ID": "P_15_5_Vollzug_Nicht_Unmittelbar",
          "Referenz_Antwort_Operator": "IST_GLEICH",
          "Referenz_Antwort_Wert_Intern": "Ja"
        }
      ],
      "Text_Erfuellt_Pro": "Es liegt ein spezifischer Haftgrund (z.B. Fluchtgefahr) vor, der die Beantragung der Haft rechtfertigt.",
      "Text_NichtErfuellt_Contra": "Es liegt kein spezifischer Haftgrund vor, weshalb die Beantragung der Haft nicht gerechtfertigt ist.",
      "Konklusive_Antworten_Info": [
        {
          "Antwort_Wert_Intern_Erwartet": "Ja",
          "Konklusions_Typ": "POSITIV_ABSCHLIESSEND",
          "Hinweis_Text_Kurz_Fuer_Meldung": "Voraussetzungen für Haftantrag erfüllt. Die Anordnung von Haft ist der Regelfall.",
          "Hinweis_Text_Lang_Fuer_Begruendung": "Da alle Voraussetzungen des § 15 Abs. 5 S. 1 vorliegen und ein Haftgrund nach § 62 Abs. 4 besteht, soll die Zurückweisungshaft richterlich beantragt werden. Ein Absehen ist nur in atypischen Ausnahmefällen möglich."
        },
        {
          "Antwort_Wert_Intern_Erwartet": "Nein",
          "Konklusions_Typ": "NEGATIV_BLOCKIEREND",
          "Hinweis_Text_Kurz_Fuer_Meldung": "Kein Haftantrag, da kein spezifischer Haftgrund (z.B. Fluchtgefahr) vorliegt.",
          "Hinweis_Text_Lang_Fuer_Begruendung": "Für die Anordnung von Zurückweisungshaft ist ein spezifischer Haftgrund, wie die Fluchtgefahr, erforderlich. Da ein solcher Grund nicht vorliegt, kann keine Haft beantragt werden."
        }
      ],
      "Parameter_Name": "62"
    }
  ],
  "Regelwerk": [
    {
      "Regel_Name": "Kein Haftantrag mangels Zurückweisungsentscheidung",
      "Prioritaet": 10,
      "FK_ErgebnisProfil_ID_Referenz": "EP_15_5_Negativ_Kein_Haftantrag",
      "Bedingungen_fuer_Regel": [
        {
          "FK_Parameter_ID": "P_15_5_Zurueckweisungsentscheidung_Ergangen",
          "Operator": "IST_GLEICH",
          "Erwarteter_Wert_Intern": "Nein"
        }
      ]
    },
    {
      "Regel_Name": "Kein Haftantrag, da Vollzug unmittelbar möglich ist",
      "Prioritaet": 20,
      "FK_ErgebnisProfil_ID_Referenz": "EP_15_5_Negativ_Kein_Haftantrag",
      "Bedingungen_fuer_Regel": [
        {
          "FK_Parameter_ID": "P_15_5_Vollzug_Nicht_Unmittelbar",
          "Operator": "IST_GLEICH",
          "Erwarteter_Wert_Intern": "Nein"
        }
      ]
    },
    {
      "Regel_Name": "Kein Haftantrag mangels spezifischem Haftgrund",
      "Prioritaet": 30,
      "FK_ErgebnisProfil_ID_Referenz": "EP_15_5_Negativ_Kein_Haftantrag",
      "Bedingungen_fuer_Regel": [
        {
          "FK_Parameter_ID": "P_15_5_Haftgrund_Gemaess_62",
          "Operator": "IST_GLEICH",
          "Erwarteter_Wert_Intern": "Nein"
        }
      ]
    },
    {
      "Regel_Name": "Soll-Anordnung zum Haftantrag bei Erfüllung aller Kriterien",
      "Prioritaet": 40,
      "FK_ErgebnisProfil_ID_Referenz": "EP_15_5_Positiv_Haftantrag_Soll",
      "Bedingungen_fuer_Regel": [
        {
          "FK_Parameter_ID": "P_15_5_Zurueckweisungsentscheidung_Ergangen",
          "Operator": "IST_GLEICH",
          "Erwarteter_Wert_Intern": "Ja"
        },
        {
          "FK_Parameter_ID": "P_15_5_Vollzug_Nicht_Unmittelbar",
          "Operator": "IST_GLEICH",
          "Erwarteter_Wert_Intern": "Ja"
        },
        {
          "FK_Parameter_ID": "P_15_5_Haftgrund_Gemaess_62",
          "Operator": "IST_GLEICH",
          "Erwarteter_Wert_Intern": "Ja"
        }
      ]
    }
  ],
  "ErgebnisProfile": [
    {
      "ErgebnisProfil_ID_Referenz": "EP_15_5_Negativ_Kein_Haftantrag",
      "Profil_Name": "Kein Antrag auf Zurückweisungshaft",
      "Entscheidungstext_Kurz_Vorlage": "Die Voraussetzungen für die Beantragung von Zurückweisungshaft nach § 15 Abs. 5 AufenthG sind nicht erfüllt. Es wird kein Haftantrag gestellt.",
      "Art_der_Entscheidung_Anzeige_Text": "Soll-Vorschrift: Voraussetzungen nicht erfüllt",
      "Einleitungstext_Begruendung_Vorlage": "Die Prüfung der Voraussetzungen für die Beantragung von Zurückweisungshaft hat ergeben:",
      "Begruendung_Dynamische_Parameter_Liste": [
        {
          "Parameter_ID": "P_15_5_Zurueckweisungsentscheidung_Ergangen"
        },
        {
          "Parameter_ID": "P_15_5_Vollzug_Nicht_Unmittelbar"
        },
        {
          "Parameter_ID": "P_15_5_Haftgrund_Gemaess_62"
        }
      ],
      "Spezifischer_Ergaenzungstext_Begruendung_Vorlage": null,
      "Abschlusstext_Begruendung_Vorlage": "Da eine der zwingenden Voraussetzungen fehlt, ist ein Antrag auf Zurückweisungshaft nicht zulässig."
    },
    {
      "ErgebnisProfil_ID_Referenz": "EP_15_5_Positiv_Haftantrag_Soll",
      "Profil_Name": "Soll-Anordnung: Antrag auf Zurückweisungshaft",
      "Entscheidungstext_Kurz_Vorlage": "Alle Voraussetzungen für die Beantragung von Zurückweisungshaft sind erfüllt. Die Beantragung der Haft ist der gesetzliche Regelfall (Soll-Vorschrift).",
      "Art_der_Entscheidung_Anzeige_Text": "Soll-Vorschrift: Regelfall erfüllt",
      "Einleitungstext_Begruendung_Vorlage": "Die Prüfung der Voraussetzungen für die Beantragung von Zurückweisungshaft hat ergeben:",
      "Begruendung_Dynamische_Parameter_Liste": [
        {
          "Parameter_ID": "P_15_5_Zurueckweisungsentscheidung_Ergangen"
        },
        {
          "Parameter_ID": "P_15_5_Vollzug_Nicht_Unmittelbar"
        },
        {
          "Parameter_ID": "P_15_5_Haftgrund_Gemaess_62"
        }
      ],
      "Spezifischer_Ergaenzungstext_Begruendung_Vorlage": "Keine spezifischen Leitlinien für die Ausnahme von der Regel bzw. für die Regelfallentscheidung im Normtext gefunden. Allgemeine Grundsätze der Ermessensausübung und Verhältnismäßigkeit sind zu beachten.",
      "Abschlusstext_Begruendung_Vorlage": "Ein Absehen vom Haftantrag kommt nur in atypischen Ausnahmefällen in Betracht, die im Rahmen der pflichtgemäßen Ermessensausübung zu prüfen sind."
    }
  ]
}

// =================================================================
BEWERTUNGSGRUNDSÄTZE FÜR DEIN AUDIT:
1.  Fokus auf Substanz, nicht auf Stil: Bewerte primär die fachliche Korrektheit und den Sinngehalt, nicht die exakte Wortwahl.
2.  Semantische Äquivalenz akzeptieren: Leichte Abweichungen in der Formulierung von Fragetexten oder Beschreibungen sind völlig akzeptabel, solange der juristische Kern und der Zweck für den Anwender unmissverständlich und korrekt getroffen werden. Betreibe keine "Wortklauberei". Eine Frage wie "Liegt eine unmittelbare Gefahr vor?" ist semantisch gleichwertig zu "Besteht eine unmittelbare Gefahr für das Kindeswohl?" und sollte nicht negativ bewertet werden, solange der Kontext klar ist.
3.  Kritik an materiellen Fehlern: Konzentriere deine Kritik und negative Bewertungen auf materielle Fehler. Das sind:
    * Fehlende oder falsch interpretierte Tatbestandsmerkmale.
    * Falsche logische Verknüpfungen in den Regeln.
    * Fachlich irreführende oder mehrdeutige Formulierungen, die zu einer falschen Anwendung durch einen Sachbearbeiter führen könnten.
// =================================================================

DEINE AUDIT-ANWEISUNGEN:
Analysiere das übergebene "VOM EXPERTEN ERSTELLTES UND VALIDERTES DATENMODELL" sorgfältig im Abgleich mit dem "URSPRÜNGLICHER NORMTEXT" und unter Beachtung der oben genannten BEWERTUNGSGRUNDSÄTZE. Gib deine gesamte Analyse AUSSCHLIESSLICH als einzelnes, valides JSON-Objekt zurück, das exakt die folgende Struktur hat:

{
  "Gesamtbewertung": {
    "Score": "FLOAT - Dein gewichteter Gesamt-Score für die Qualität des Modells auf einer Skala von 1.0 (mangelhaft) bis 10.0 (exzellent).",
    "Fazit": "TEXT - Deine zusammenfassende Management-Summary in 1-2 Sätzen. Beispiel: ''Das Datenmodell ist von hoher Qualität, hat aber kleinere Schwächen bei der Abdeckung von Randbedingungen.''"
  },
  "Detailbewertungen": [
    {
      "Kategorie": "Vollständigkeit der Parameter",
      "Score": "INTEGER - Dein Score von 1-10 für diese Kategorie.",
      "Begruendung": "TEXT - Bewerte, ob alle relevanten Tatbestandsmerkmale, Bedingungen und Kriterien aus dem Normtext als Parameter erfasst wurden. Begründe deine Bewertung kurz. Wenn etwas Wichtiges fehlt, benenne es hier explizit. Beispiel: ''Die wesentlichen Merkmale sind erfasst. Das Kriterium ''in schwierigen Fällen'' aus Satz 3 könnte für mehr Klarheit als eigener Ja/Nein-Parameter abgebildet werden, anstatt es nur im Ermessenstext zu erwähnen.''"
    },
    {
      "Kategorie": "Logische Konsistenz der Regeln",
      "Score": "INTEGER - Dein Score von 1-10 für diese Kategorie.",
      "Begruendung": "TEXT - Bewerte, ob die definierten Regeln die Kausal- und Konditionalketten des Normtextes fachlich korrekt abbilden. **Prüfe dabei explizit die Auswertungsreihenfolge anhand der `Prioritaet`: Simuliere gedanklich den Prüfpfad. Wird ein spezifischerer Fall (z.B. ein strenges Verbot) korrekt VOR einem allgemeineren Fall (z.B. einer generellen Erlaubnis oder einem anderen Ausschlussgrund) geprüft? Decke eventuelle Logikfehler auf, die durch eine falsche Priorisierung entstehen.** Ist die Verknüpfung der einzelnen Bedingungen innerhalb der Regeln plausibel? Begründe deine Bewertung."
    },
    {
      "Kategorie": "Qualität der Fragetexte und Ergebnisprofile",
      "Score": "INTEGER - Dein Score von 1-10 für diese Kategorie.",
      "Begruendung": "TEXT - Bewerte die Qualität der für den Endanwender formulierten Texte. Sind die ''Fragetexte'' der Parameter klar, neutral und unmissverständlich? Sind die ''Entscheidungstext_Kurz_Vorlage'' der Ergebnisprofile präzise und fachlich korrekt? Begründe deine Bewertung. Beispiel: ''Die Fragetexte sind gut verständlich. Der Entscheidungstext für Profil Y könnte präzisiert werden, um den Ermessensspielraum noch deutlicher zu machen.''"
    }
  ]
}

WICHTIG: Deine Bewertung soll streng, fair und konstruktiv sein, basierend auf den oben genannten Grundsätzen. Das Ziel ist es, dem Fachexperten zu helfen, die Qualität seiner Arbeit zu maximieren.
',
  '{"Gesamtbewertung":{"Score":6.5,"Fazit":"Das Datenmodell bildet die Grundstruktur der Zurückweisungshaft korrekt ab, enthält jedoch einen gravierenden materiellen Fehler: Die wichtige Rechtsfolge aus Satz 3 fehlt vollständig, wonach bei richterlicher Ablehnung der Haft die zwingende Zurückweisung nach Abs. 1 nicht mehr gilt."},"Detailbewertungen":[{"Kategorie":"Vollständigkeit der Parameter","Score":5,"Begruendung":"Die drei Hauptvoraussetzungen für die Haftanordnung sind korrekt erfasst (Zurückweisungsentscheidung, keine unmittelbare Vollzugsmöglichkeit, Haftgrund nach § 62 Abs. 4). Jedoch fehlt die äußerst wichtige Regelung aus Satz 3 vollständig: ''In den Fällen, in denen der Richter die Anordnung oder die Verlängerung der Haft ablehnt, findet Absatz 1 keine Anwendung.'' Diese Rechtsfolge hat erhebliche Auswirkungen, da sie die zwingende Zurückweisung nach Abs. 1 aufhebt. Das Fehlen dieser Regelung ist ein gravierender materieller Fehler, der die praktische Anwendung erheblich beeinträchtigt."},{"Kategorie":"Logische Konsistenz der Regeln","Score":9,"Begruendung":"Die vorhandenen Regeln sind logisch konsistent aufgebaut. Die Prioritätenreihenfolge (10-40) ist sinnvoll: Zuerst werden die einzelnen Ausschlussgründe geprüft, dann bei Erfüllung aller Voraussetzungen die positive Soll-Anordnung. Die Anzeige-Bedingungen verhindern unnötige Prüfungen. Die UND-Verknüpfung in Regel 4 ist korrekt, da alle drei Bedingungen kumulativ vorliegen müssen. Allerdings fehlt die Logik für die Behandlung der richterlichen Ablehnung und deren Auswirkung auf Abs. 1."},{"Kategorie":"Qualität der Fragetexte und Ergebnisprofile","Score":9,"Begruendung":"Die Fragetexte sind klar, präzise und für Sachbearbeiter gut verständlich formuliert. Die Begleittexte bieten hilfreiche Erläuterungen (z.B. Beispiele für Haftgründe). Die Ergebnisprofile machen deutlich, dass es sich um eine Soll-Vorschrift handelt und weisen korrekt auf die Ausnahmemöglichkeit in atypischen Fällen hin. Die Formulierungen sind fachlich korrekt und anwenderfreundlich."}]}'
);

INSERT INTO QualitaetsAudit_Detailbewertungen (
  FK_AuditID, Kategorie, Score, Begruendung
) VALUES (
  14,
  'Vollständigkeit der Parameter',
  5,
  'Die drei Hauptvoraussetzungen für die Haftanordnung sind korrekt erfasst (Zurückweisungsentscheidung, keine unmittelbare Vollzugsmöglichkeit, Haftgrund nach § 62 Abs. 4). Jedoch fehlt die äußerst wichtige Regelung aus Satz 3 vollständig: ''In den Fällen, in denen der Richter die Anordnung oder die Verlängerung der Haft ablehnt, findet Absatz 1 keine Anwendung.'' Diese Rechtsfolge hat erhebliche Auswirkungen, da sie die zwingende Zurückweisung nach Abs. 1 aufhebt. Das Fehlen dieser Regelung ist ein gravierender materieller Fehler, der die praktische Anwendung erheblich beeinträchtigt.'
);
INSERT INTO QualitaetsAudit_Detailbewertungen (
  FK_AuditID, Kategorie, Score, Begruendung
) VALUES (
  14,
  'Logische Konsistenz der Regeln',
  9,
  'Die vorhandenen Regeln sind logisch konsistent aufgebaut. Die Prioritätenreihenfolge (10-40) ist sinnvoll: Zuerst werden die einzelnen Ausschlussgründe geprüft, dann bei Erfüllung aller Voraussetzungen die positive Soll-Anordnung. Die Anzeige-Bedingungen verhindern unnötige Prüfungen. Die UND-Verknüpfung in Regel 4 ist korrekt, da alle drei Bedingungen kumulativ vorliegen müssen. Allerdings fehlt die Logik für die Behandlung der richterlichen Ablehnung und deren Auswirkung auf Abs. 1.'
);
INSERT INTO QualitaetsAudit_Detailbewertungen (
  FK_AuditID, Kategorie, Score, Begruendung
) VALUES (
  14,
  'Qualität der Fragetexte und Ergebnisprofile',
  9,
  'Die Fragetexte sind klar, präzise und für Sachbearbeiter gut verständlich formuliert. Die Begleittexte bieten hilfreiche Erläuterungen (z.B. Beispiele für Haftgründe). Die Ergebnisprofile machen deutlich, dass es sich um eine Soll-Vorschrift handelt und weisen korrekt auf die Ausnahmemöglichkeit in atypischen Fällen hin. Die Formulierungen sind fachlich korrekt und anwenderfreundlich.'
);

COMMIT;
