-- ========================================
-- SimONA SQL-Export
-- Version: 2.5
-- Datum: 2025-07-12T14:32:23.309Z
-- SimulationsEinheit: SE_JuSchG_8_Abs1__v_Gemini2.5Pro_V1.0__Pv1
-- ========================================

START TRANSACTION;

-- SQL für SimulationsEinheiten und Regelwerke (basierend auf P1 Daten)
-- Prompt-Version: v1
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
  Version_SimONA,
  Prompt_Version
) VALUES (
  'SE_JuSchG_8_Abs1__v_Gemini2.5Pro_V1.0__Pv1',
  'JuSchG',
  'Jugendschutzgesetz',
  'Zuletzt geändert durch Art. 12 G v. 6.5.2024 I Nr. 149',
  '8',
  'Jugendgefährdende Orte',
  'Regelt die Eingriffsbefugnisse und Maßnahmen der zuständigen Behörden, wenn sich Kinder oder Jugendliche an Orten aufhalten, die eine unmittelbare Gefahr für ihr körperliches, geistiges oder seelisches Wohl darstellen. Definiert die möglichen Maßnahmen von der Aufforderung zum Verlassen des Ortes bis zur Inobhutnahme durch das Jugendamt.',
  '1',
  '1-3',
  'Regelt die Pflicht und die Maßnahmen der zuständigen Behörde zur Abwendung einer unmittelbaren Gefahr für das Wohl von Kindern und Jugendlichen an jugendgefährdenden Orten.',
  'Maßnahmen zur Gefahrenabwehr',
  'https://www.gesetze-im-internet.de/juschg/__8.html',
  'Hält sich ein Kind oder eine jugendliche Person an einem Ort auf, an dem ihm oder ihr eine unmittelbare Gefahr für das körperliche, geistige oder seelische Wohl droht, so hat die zuständige Behörde oder Stelle die zur Abwendung der Gefahr erforderlichen Maßnahmen zu treffen. Wenn nötig, hat sie das Kind oder die jugendliche Person
1. zum Verlassen des Ortes anzuhalten,
2. der erziehungsberechtigten Person im Sinne des § 7 Abs. 1 Nr. 6 des Achten Buches Sozialgesetzbuch zuzuführen oder, wenn keine erziehungsberechtigte Person erreichbar ist, in die Obhut des Jugendamtes zu bringen.
In schwierigen Fällen hat die zuständige Behörde oder Stelle das Jugendamt über den jugendgefährdenden Ort zu unterrichten.',
  (SELECT Entscheidungsart_ID FROM Entscheidungsarten_Lookup WHERE Bezeichnung = 'Ermessen (intendiertes Ermessen)'),
  'Die Ermessensausübung orientiert sich an der Erforderlichkeit der Maßnahme zur Abwendung der unmittelbaren Gefahr. Mögliche Maßnahmen sind: 1. Anhalten zum Verlassen des Ortes, 2. Zuführung zur erziehungsberechtigten Person, 3. Inobhutnahme durch das Jugendamt, wenn keine erziehungsberechtigte Person erreichbar ist. In schwierigen Fällen besteht die Pflicht zur Unterrichtung des Jugendamtes.',
  CURDATE(),
  '2.5',
  'v1'
);

INSERT INTO Regelwerke (Regelwerk_ID, FK_Einheit_ID, Beschreibung) VALUES (
  'SE_JuSchG_8_Abs1__v_Gemini2.5Pro_V1.0__Pv1',
  'SE_JuSchG_8_Abs1__v_Gemini2.5Pro_V1.0__Pv1',
  'Regelwerk für Regelt die Pflicht und die Maßnahmen der zuständigen Behörde zur Abwendung einer unmittelbaren Gefahr für das Wohl von Kindern und Jugendlichen an jugendgefährdenden Orten. (Prompt v1)'
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
  'P_8_1_Personenkreis',
  'SE_JuSchG_8_Abs1__v_Gemini2.5Pro_V1.0__Pv1',
  'Personenkreis',
  1,
  TRUE,
  NULL,
  '[{"Antwort_Wert_Intern_Erwartet":"O_Erwachsen","Konklusions_Typ":"NEGATIV_BLOCKIEREND","Hinweis_Text_Kurz_Fuer_Meldung":"Norm nicht anwendbar, da die Person volljährig ist.","Hinweis_Text_Lang_Fuer_Begruendung":"Der § 8 des Jugendschutzgesetzes ist ausschließlich auf Kinder und Jugendliche anwendbar. Da die betroffene Person als volljährig eingestuft wurde, ist der sachliche Anwendungsbereich der Norm nicht eröffnet und die weitere Prüfung wird beendet."}]',
  'Handelt es sich bei der betroffenen Person um ein Kind oder eine jugendliche Person?',
  'AuswahlEinfach',
  'Gemäß § 1 JuSchG ist ein Kind, wer noch nicht 14 Jahre alt ist, und eine jugendliche Person, wer 14, aber noch nicht 18 Jahre alt ist. Die Maßnahmen nach § 8 JuSchG gelten nur für diesen Personenkreis.',
  '§ 8 S. 1 JuSchG: ''...ein Kind oder eine jugendliche Person...''',
  '§ 1 JuSchG (Begriffsbestimmungen)',
  NULL,
  NULL,
  'Die betroffene Person gehört zum geschützten Personenkreis des Jugendschutzgesetzes.',
  'Die betroffene Person ist volljährig, weshalb der Anwendungsbereich des § 8 JuSchG nicht eröffnet ist.'
);

INSERT INTO Parameter_Antwortoptionen (
  FK_Parameter_ID,
  Option_Text,
  Option_Wert_Intern,
  Reihenfolge
) VALUES (
  'P_8_1_Personenkreis',
  'Ja, es ist ein Kind (unter 14 Jahre).',
  'O_Kind',
  1
);
INSERT INTO Parameter_Antwortoptionen (
  FK_Parameter_ID,
  Option_Text,
  Option_Wert_Intern,
  Reihenfolge
) VALUES (
  'P_8_1_Personenkreis',
  'Ja, es ist eine jugendliche Person (14 bis unter 18 Jahre).',
  'O_Jugendlich',
  2
);
INSERT INTO Parameter_Antwortoptionen (
  FK_Parameter_ID,
  Option_Text,
  Option_Wert_Intern,
  Reihenfolge
) VALUES (
  'P_8_1_Personenkreis',
  'Nein, die Person ist volljährig (18 Jahre oder älter).',
  'O_Erwachsen',
  3
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
  'P_8_1_UnmittelbareGefahr',
  'SE_JuSchG_8_Abs1__v_Gemini2.5Pro_V1.0__Pv1',
  'Unmittelbare Gefahr',
  2,
  TRUE,
  NULL,
  '[{"Antwort_Wert_Intern_Erwartet":"Nein","Konklusions_Typ":"NEGATIV_BLOCKIEREND","Hinweis_Text_Kurz_Fuer_Meldung":"Keine Maßnahmen nach § 8 JuSchG, da keine unmittelbare Gefahr vorliegt.","Hinweis_Text_Lang_Fuer_Begruendung":"Die zentrale Voraussetzung für ein Eingreifen nach § 8 JuSchG ist das Drohen einer unmittelbaren Gefahr für das Kindeswohl. Da diese Voraussetzung nicht erfüllt ist, fehlt die Grundlage für jegliche Maßnahmen und die Prüfung ist beendet."}]',
  'Droht der Person an ihrem Aufenthaltsort eine unmittelbare Gefahr für ihr körperliches, geistiges oder seelisches Wohl?',
  'JaNein',
  'Eine unmittelbare Gefahr liegt vor, wenn der Eintritt eines Schadens für das Kindeswohl nach allgemeiner Lebenserfahrung als sehr wahrscheinlich erscheint, falls nicht eingegriffen wird.',
  '§ 8 S. 1 JuSchG: ''...unmittelbare Gefahr für das körperliche, geistige oder seelische Wohl droht...''',
  NULL,
  NULL,
  NULL,
  'Am Aufenthaltsort droht eine unmittelbare Gefahr für das Wohl der Person.',
  'Es liegt keine unmittelbare Gefahr für das Wohl der Person vor; die Voraussetzungen für Maßnahmen nach § 8 JuSchG sind nicht erfüllt.'
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
  'P_8_1_AuswahlMassnahme',
  'SE_JuSchG_8_Abs1__v_Gemini2.5Pro_V1.0__Pv1',
  'Auswahl Massnahme',
  3,
  FALSE,
  '[{"Referenz_Parameter_ID":"P_8_1_UnmittelbareGefahr","Referenz_Antwort_Operator":"IST_GLEICH","Referenz_Antwort_Wert_Intern":"Ja"}]',
  NULL,
  'Welche Maßnahme ist zur Abwendung der Gefahr erforderlich und verhältnismäßig?',
  'AuswahlEinfach',
  'Die Wahl der Maßnahme muss sich am Grundsatz der Verhältnismäßigkeit orientieren. Die Inobhutnahme durch das Jugendamt ist nur als letztes Mittel (ultima ratio) zulässig.',
  '§ 8 S. 2 Nr. 1 und 2 JuSchG',
  '§ 7 Abs. 1 Nr. 6 SGB VIII (erziehungsberechtigte Person)',
  NULL,
  NULL,
  'Eine erforderliche und verhältnismäßige Maßnahme wurde ausgewählt.',
  'Es wurde keine spezifische Maßnahme ausgewählt.'
);

INSERT INTO Parameter_Antwortoptionen (
  FK_Parameter_ID,
  Option_Text,
  Option_Wert_Intern,
  Reihenfolge
) VALUES (
  'P_8_1_AuswahlMassnahme',
  'Die Person zum Verlassen des Ortes anhalten.',
  'O_Ort_Verlassen',
  1
);
INSERT INTO Parameter_Antwortoptionen (
  FK_Parameter_ID,
  Option_Text,
  Option_Wert_Intern,
  Reihenfolge
) VALUES (
  'P_8_1_AuswahlMassnahme',
  'Die Person einer erziehungsberechtigten Person zuführen.',
  'O_Eltern_Zufuehren',
  2
);
INSERT INTO Parameter_Antwortoptionen (
  FK_Parameter_ID,
  Option_Text,
  Option_Wert_Intern,
  Reihenfolge
) VALUES (
  'P_8_1_AuswahlMassnahme',
  'Die Person in die Obhut des Jugendamtes bringen (nur zulässig, wenn kein Erziehungsberechtigter erreichbar ist).',
  'O_Jugendamt_Inobhutnahme',
  3
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
  'P_8_1_ErziehungsberechtigterErreichbar',
  'SE_JuSchG_8_Abs1__v_Gemini2.5Pro_V1.0__Pv1',
  'Erziehungsberechtigter Erreichbar',
  4,
  FALSE,
  '[{"Referenz_Parameter_ID":"P_8_1_AuswahlMassnahme","Referenz_Antwort_Operator":"IST_EINES_VON","Referenz_Antwort_Wert_Intern":["O_Eltern_Zufuehren","O_Jugendamt_Inobhutnahme"]}]',
  NULL,
  'Ist eine erziehungsberechtigte Person erreichbar, um die Person in Obhut zu nehmen?',
  'JaNein',
  'Die Erreichbarkeit ist eine Voraussetzung für die Maßnahme ''Zuführung zur erziehungsberechtigten Person''. Ist niemand erreichbar, kommt eine Inobhutnahme durch das Jugendamt in Betracht.',
  '§ 8 S. 2 Nr. 2 JuSchG: ''...oder, wenn keine erziehungsberechtigte Person erreichbar ist...''',
  NULL,
  NULL,
  NULL,
  'Eine erziehungsberechtigte Person ist erreichbar.',
  'Keine erziehungsberechtigte Person ist erreichbar, was die Inobhutnahme durch das Jugendamt ermöglicht.'
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
  'P_8_1_SchwierigerFall',
  'SE_JuSchG_8_Abs1__v_Gemini2.5Pro_V1.0__Pv1',
  'Schwieriger Fall',
  5,
  FALSE,
  '[{"Referenz_Parameter_ID":"P_8_1_UnmittelbareGefahr","Referenz_Antwort_Operator":"IST_GLEICH","Referenz_Antwort_Wert_Intern":"Ja"}]',
  NULL,
  'Handelt es sich um einen ''schwierigen Fall'', der eine Unterrichtung des Jugendamtes über den Ort erfordert?',
  'JaNein',
  'Ein schwieriger Fall kann z.B. bei wiederholtem Antreffen an gefährdenden Orten, massiver Verwahrlosung oder offensichtlichen Suchtproblemen vorliegen. Es handelt sich um eine unbestimmten Rechtsbegriff, der im Ermessen der Behörde liegt.',
  '§ 8 S. 3 JuSchG: ''In schwierigen Fällen...''',
  NULL,
  NULL,
  NULL,
  'Der Sachverhalt wird als schwieriger Fall eingestuft und das Jugendamt entsprechend unterrichtet.',
  'Der Sachverhalt wird nicht als schwieriger Fall eingestuft; eine gesonderte Unterrichtung des Jugendamts über den Ort erfolgt nicht.'
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
  'EP_8_1_Negativ_Personenkreis_Fehlt',
  'SE_JuSchG_8_Abs1__v_Gemini2.5Pro_V1.0__Pv1',
  'Ablehnung: Falscher Personenkreis',
  'Maßnahmen nach § 8 JuSchG können nicht ergriffen werden, da die Person volljährig ist und somit nicht zum geschützten Personenkreis des Gesetzes gehört.',
  'Negative Entscheidung (Voraussetzungen nicht erfüllt)',
  'Die Prüfung der Anwendbarkeit des § 8 JuSchG hat ergeben:',
  NULL,
  'Der Anwendungsbereich des Jugendschutzgesetzes ist nicht eröffnet.',
  'Die Prüfung ist damit abgeschlossen. Es sind keine weiteren Maßnahmen auf dieser Grundlage möglich.'
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
  'EP_8_1_Negativ_Gefahr_Fehlt',
  'SE_JuSchG_8_Abs1__v_Gemini2.5Pro_V1.0__Pv1',
  'Ablehnung: Keine unmittelbare Gefahr',
  'Maßnahmen nach § 8 JuSchG können nicht ergriffen werden, da keine unmittelbare Gefahr für das körperliche, geistige oder seelische Wohl der Person vorliegt.',
  'Negative Entscheidung (Voraussetzungen nicht erfüllt)',
  'Die Prüfung der Voraussetzungen des § 8 JuSchG hat ergeben:',
  NULL,
  'Ohne das Vorliegen einer unmittelbaren Gefahr fehlt die Eingriffsgrundlage.',
  'Die Prüfung ist damit abgeschlossen.'
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
  'EP_8_1_Positiv_Ermessen_Eroeffnet',
  'SE_JuSchG_8_Abs1__v_Gemini2.5Pro_V1.0__Pv1',
  'Positiv: Handlungsrahmen eröffnet',
  'Die grundsätzlichen Voraussetzungen für Maßnahmen nach § 8 JuSchG sind erfüllt. Die Auswahl der erforderlichen Maßnahme steht im Ermessen der zuständigen Stelle.',
  'Ermessensentscheidung: Handlungsrahmen eröffnet',
  'Die Prüfung der Tatbestandsvoraussetzungen hat ergeben:',
  NULL,
  'Die Ermessensausübung orientiert sich an der Erforderlichkeit der Maßnahme zur Abwendung der unmittelbaren Gefahr. Mögliche Maßnahmen sind: 1. Anhalten zum Verlassen des Ortes, 2. Zuführung zur erziehungsberechtigten Person, 3. Inobhutnahme durch das Jugendamt, wenn keine erziehungsberechtigte Person erreichbar ist. In schwierigen Fällen besteht die Pflicht zur Unterrichtung des Jugendamtes.',
  'Bitte wählen Sie die geeignete Maßnahme aus und dokumentieren Sie die Ermessenserwägungen.'
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
  'EP_8_1_Positiv_Massnahme_Ort_Verlassen',
  'SE_JuSchG_8_Abs1__v_Gemini2.5Pro_V1.0__Pv1',
  'Maßnahme: Anordnung zum Verlassen des Ortes',
  'Als erforderliche und verhältnismäßige Maßnahme wird die Person zum Verlassen des Ortes angehalten.',
  'Positive Ermessensentscheidung (Maßnahme)',
  'Basierend auf der erfolgten Prüfung wird folgende Entscheidung getroffen:',
  NULL,
  'Diese Maßnahme wurde als das mildeste, aber ausreichende Mittel zur Abwendung der festgestellten Gefahr bewertet.',
  'Die Umsetzung der Maßnahme ist zu veranlassen und zu dokumentieren.'
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
  'EP_8_1_Positiv_Massnahme_Eltern_Zufuehren',
  'SE_JuSchG_8_Abs1__v_Gemini2.5Pro_V1.0__Pv1',
  'Maßnahme: Zuführung zu Erziehungsberechtigten',
  'Als erforderliche und verhältnismäßige Maßnahme wird die Person einer erziehungsberechtigten Person zugeführt.',
  'Positive Ermessensentscheidung (Maßnahme)',
  'Basierend auf der erfolgten Prüfung wird folgende Entscheidung getroffen:',
  NULL,
  'Die Übergabe in die Obhut der erreichbaren Erziehungsberechtigten ist zur nachhaltigen Abwendung der Gefahr geboten.',
  'Die Umsetzung der Maßnahme ist zu veranlassen und zu dokumentieren.'
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
  'EP_8_1_Positiv_Massnahme_Inobhutnahme',
  'SE_JuSchG_8_Abs1__v_Gemini2.5Pro_V1.0__Pv1',
  'Maßnahme: Inobhutnahme durch das Jugendamt',
  'Als erforderliche und verhältnismäßige Maßnahme wird die Person in die Obhut des Jugendamtes gebracht, da keine erziehungsberechtigte Person erreichbar ist.',
  'Positive Ermessensentscheidung (Maßnahme)',
  'Basierend auf der erfolgten Prüfung wird folgende Entscheidung getroffen:',
  NULL,
  'Da die Gefahr anders nicht abgewendet werden kann und Erziehungsberechtigte nicht erreichbar sind, ist die Inobhutnahme durch das Jugendamt als letztes Mittel (ultima ratio) erforderlich.',
  'Die Übergabe an das Jugendamt ist unverzüglich zu veranlassen und zu dokumentieren.'
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
  'EP_8_1_Zusatz_Meldepflicht_SchwierigerFall',
  'SE_JuSchG_8_Abs1__v_Gemini2.5Pro_V1.0__Pv1',
  'Zusatzpflicht: Meldung bei schwierigem Fall',
  'Zusätzlich zur ergriffenen Maßnahme ist das Jugendamt über den jugendgefährdenden Ort zu unterrichten, da ein ''schwieriger Fall'' vorliegt.',
  'Zusätzliche gesetzliche Pflicht',
  'Die Prüfung hat eine zusätzliche Handlungspflicht ergeben:',
  NULL,
  'Die Einstufung als ''schwieriger Fall'' begründet die gesetzliche Pflicht aus § 8 Satz 3 JuSchG, das Jugendamt zur Prüfung weiterer Maßnahmen zu informieren.',
  'Die Unterrichtung des Jugendamtes ist sicherzustellen.'
);


-- SQL für Regeln und RegelBedingungen (basierend auf P3 Daten)
INSERT INTO Regeln (
  FK_Regelwerk_ID,
  Regel_Name,
  Prioritaet,
  FK_ErgebnisProfil_ID_Referenz
) VALUES (
  'SE_JuSchG_8_Abs1__v_Gemini2.5Pro_V1.0__Pv1',
  'Ablehnung, da Person volljährig',
  10,
  'EP_8_1_Negativ_Personenkreis_Fehlt'
);
SET @last_regel_id = LAST_INSERT_ID();

INSERT INTO RegelBedingungen (
  FK_Regel_ID,
  FK_Parameter_ID,
  Operator,
  Erwarteter_Wert_Intern
) VALUES (
  @last_regel_id,
  'P_8_1_Personenkreis',
  'IST_GLEICH',
  'O_Erwachsen'
);

INSERT INTO Regeln (
  FK_Regelwerk_ID,
  Regel_Name,
  Prioritaet,
  FK_ErgebnisProfil_ID_Referenz
) VALUES (
  'SE_JuSchG_8_Abs1__v_Gemini2.5Pro_V1.0__Pv1',
  'Ablehnung, da keine unmittelbare Gefahr',
  20,
  'EP_8_1_Negativ_Gefahr_Fehlt'
);
SET @last_regel_id = LAST_INSERT_ID();

INSERT INTO RegelBedingungen (
  FK_Regel_ID,
  FK_Parameter_ID,
  Operator,
  Erwarteter_Wert_Intern
) VALUES (
  @last_regel_id,
  'P_8_1_UnmittelbareGefahr',
  'IST_GLEICH',
  'Nein'
);

INSERT INTO Regeln (
  FK_Regelwerk_ID,
  Regel_Name,
  Prioritaet,
  FK_ErgebnisProfil_ID_Referenz
) VALUES (
  'SE_JuSchG_8_Abs1__v_Gemini2.5Pro_V1.0__Pv1',
  'Ermessen eröffnet (Kind oder Jugendlicher in Gefahr)',
  100,
  'EP_8_1_Positiv_Ermessen_Eroeffnet'
);
SET @last_regel_id = LAST_INSERT_ID();

INSERT INTO RegelBedingungen (
  FK_Regel_ID,
  FK_Parameter_ID,
  Operator,
  Erwarteter_Wert_Intern
) VALUES (
  @last_regel_id,
  'P_8_1_Personenkreis',
  'IST_GLEICH',
  'O_Kind'
);
INSERT INTO RegelBedingungen (
  FK_Regel_ID,
  FK_Parameter_ID,
  Operator,
  Erwarteter_Wert_Intern
) VALUES (
  @last_regel_id,
  'P_8_1_UnmittelbareGefahr',
  'IST_GLEICH',
  'Ja'
);

INSERT INTO Regeln (
  FK_Regelwerk_ID,
  Regel_Name,
  Prioritaet,
  FK_ErgebnisProfil_ID_Referenz
) VALUES (
  'SE_JuSchG_8_Abs1__v_Gemini2.5Pro_V1.0__Pv1',
  'Ermessen eröffnet (Jugendlicher in Gefahr) - Variante',
  110,
  'EP_8_1_Positiv_Ermessen_Eroeffnet'
);
SET @last_regel_id = LAST_INSERT_ID();

INSERT INTO RegelBedingungen (
  FK_Regel_ID,
  FK_Parameter_ID,
  Operator,
  Erwarteter_Wert_Intern
) VALUES (
  @last_regel_id,
  'P_8_1_Personenkreis',
  'IST_GLEICH',
  'O_Jugendlich'
);
INSERT INTO RegelBedingungen (
  FK_Regel_ID,
  FK_Parameter_ID,
  Operator,
  Erwarteter_Wert_Intern
) VALUES (
  @last_regel_id,
  'P_8_1_UnmittelbareGefahr',
  'IST_GLEICH',
  'Ja'
);

INSERT INTO Regeln (
  FK_Regelwerk_ID,
  Regel_Name,
  Prioritaet,
  FK_ErgebnisProfil_ID_Referenz
) VALUES (
  'SE_JuSchG_8_Abs1__v_Gemini2.5Pro_V1.0__Pv1',
  'Maßnahme: Anhalten zum Verlassen des Ortes',
  200,
  'EP_8_1_Positiv_Massnahme_Ort_Verlassen'
);
SET @last_regel_id = LAST_INSERT_ID();

INSERT INTO RegelBedingungen (
  FK_Regel_ID,
  FK_Parameter_ID,
  Operator,
  Erwarteter_Wert_Intern
) VALUES (
  @last_regel_id,
  'P_8_1_UnmittelbareGefahr',
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
  'P_8_1_AuswahlMassnahme',
  'IST_GLEICH',
  'O_Ort_Verlassen'
);

INSERT INTO Regeln (
  FK_Regelwerk_ID,
  Regel_Name,
  Prioritaet,
  FK_ErgebnisProfil_ID_Referenz
) VALUES (
  'SE_JuSchG_8_Abs1__v_Gemini2.5Pro_V1.0__Pv1',
  'Maßnahme: Zuführung zu Erziehungsberechtigtem',
  210,
  'EP_8_1_Positiv_Massnahme_Eltern_Zufuehren'
);
SET @last_regel_id = LAST_INSERT_ID();

INSERT INTO RegelBedingungen (
  FK_Regel_ID,
  FK_Parameter_ID,
  Operator,
  Erwarteter_Wert_Intern
) VALUES (
  @last_regel_id,
  'P_8_1_UnmittelbareGefahr',
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
  'P_8_1_AuswahlMassnahme',
  'IST_GLEICH',
  'O_Eltern_Zufuehren'
);
INSERT INTO RegelBedingungen (
  FK_Regel_ID,
  FK_Parameter_ID,
  Operator,
  Erwarteter_Wert_Intern
) VALUES (
  @last_regel_id,
  'P_8_1_ErziehungsberechtigterErreichbar',
  'IST_GLEICH',
  'Ja'
);

INSERT INTO Regeln (
  FK_Regelwerk_ID,
  Regel_Name,
  Prioritaet,
  FK_ErgebnisProfil_ID_Referenz
) VALUES (
  'SE_JuSchG_8_Abs1__v_Gemini2.5Pro_V1.0__Pv1',
  'Maßnahme: Inobhutnahme durch Jugendamt',
  220,
  'EP_8_1_Positiv_Massnahme_Inobhutnahme'
);
SET @last_regel_id = LAST_INSERT_ID();

INSERT INTO RegelBedingungen (
  FK_Regel_ID,
  FK_Parameter_ID,
  Operator,
  Erwarteter_Wert_Intern
) VALUES (
  @last_regel_id,
  'P_8_1_UnmittelbareGefahr',
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
  'P_8_1_AuswahlMassnahme',
  'IST_GLEICH',
  'O_Jugendamt_Inobhutnahme'
);
INSERT INTO RegelBedingungen (
  FK_Regel_ID,
  FK_Parameter_ID,
  Operator,
  Erwarteter_Wert_Intern
) VALUES (
  @last_regel_id,
  'P_8_1_ErziehungsberechtigterErreichbar',
  'IST_GLEICH',
  'Nein'
);

INSERT INTO Regeln (
  FK_Regelwerk_ID,
  Regel_Name,
  Prioritaet,
  FK_ErgebnisProfil_ID_Referenz
) VALUES (
  'SE_JuSchG_8_Abs1__v_Gemini2.5Pro_V1.0__Pv1',
  'Zusatzpflicht: Meldung an Jugendamt bei schwierigem Fall',
  300,
  'EP_8_1_Zusatz_Meldepflicht_SchwierigerFall'
);
SET @last_regel_id = LAST_INSERT_ID();

INSERT INTO RegelBedingungen (
  FK_Regel_ID,
  FK_Parameter_ID,
  Operator,
  Erwarteter_Wert_Intern
) VALUES (
  @last_regel_id,
  'P_8_1_UnmittelbareGefahr',
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
  'P_8_1_SchwierigerFall',
  'IST_GLEICH',
  'Ja'
);


-- ========================================
-- Ende der SQL-Generierung
-- ========================================
COMMIT;

-- SQL für QualitaetsAudit (eigenständige Transaktion)
START TRANSACTION;

INSERT INTO QualitaetsAudits (
  FK_Einheit_ID, Audit_Timestamp, Gesamtscore, Gesamtfazit,
  P5_Prompt_Text, P5_Response_JSON
) VALUES (
  'SE_JuSchG_8_Abs1__v_Gemini2.5Pro_V1.0__Pv1',
  '2025-07-12T14:33:30.310Z',
  8.7,
  'Das Datenmodell ist von sehr hoher Qualität und bildet die Norm § 8 JuSchG präzise und praxistauglich ab. Die wesentlichen Tatbestandsmerkmale, Ermessensspielräume und Verfahrensschritte sind korrekt erfasst.',
  'ANALYSEAUFTRAG: QUALITÄTS-AUDIT EINES SimONA-DATENMODELLS

DU BIST EIN HOCHSPEZIALISIERTER KI-RECHTSEXPERTE mit der Aufgabe, ein bestehendes, von einem anderen System erstelltes Datenmodell für eine deutsche Rechtsnorm auf seine fachliche Qualität und Plausibilität zu prüfen. Du agierst als unabhängiger Auditor.

KONTEXT:
Ein Fachexperte hat mithilfe einer KI den folgenden deutschen Normtext analysiert und in ein strukturiertes JSON-Datenmodell überführt. Deine Aufgabe ist es, dieses Ergebnis zu bewerten.

URSPRÜNGLICHER NORMTEXT:
"Hält sich ein Kind oder eine jugendliche Person an einem Ort auf, an dem ihm oder ihr eine unmittelbare Gefahr für das körperliche, geistige oder seelische Wohl droht, so hat die zuständige Behörde oder Stelle die zur Abwendung der Gefahr erforderlichen Maßnahmen zu treffen. Wenn nötig, hat sie das Kind oder die jugendliche Person
1. zum Verlassen des Ortes anzuhalten,
2. der erziehungsberechtigten Person im Sinne des § 7 Abs. 1 Nr. 6 des Achten Buches Sozialgesetzbuch zuzuführen oder, wenn keine erziehungsberechtigte Person erreichbar ist, in die Obhut des Jugendamtes zu bringen.
In schwierigen Fällen hat die zuständige Behörde oder Stelle das Jugendamt über den jugendgefährdenden Ort zu unterrichten."

VOM EXPERTEN ERSTELLTES UND VALIDERTES DATENMODELL (JSON):
{
  "SimulationsEinheit_Metadaten": {
    "Gesetz": "JuSchG",
    "Paragraph": "8",
    "Absatz": "1",
    "Satz": "1-3",
    "Kurzbeschreibung": "Regelt die Pflicht und die Maßnahmen der zuständigen Behörde zur Abwendung einer unmittelbaren Gefahr für das Wohl von Kindern und Jugendlichen an jugendgefährdenden Orten.",
    "Gesetzestext_Zitat_Analysierter_Teil": "Hält sich ein Kind oder eine jugendliche Person an einem Ort auf, an dem ihm oder ihr eine unmittelbare Gefahr für das körperliche, geistige oder seelische Wohl droht, so hat die zuständige Behörde oder Stelle die zur Abwendung der Gefahr erforderlichen Maßnahmen zu treffen. Wenn nötig, hat sie das Kind oder die jugendliche Person\n1. zum Verlassen des Ortes anzuhalten,\n2. der erziehungsberechtigten Person im Sinne des § 7 Abs. 1 Nr. 6 des Achten Buches Sozialgesetzbuch zuzuführen oder, wenn keine erziehungsberechtigte Person erreichbar ist, in die Obhut des Jugendamtes zu bringen.\nIn schwierigen Fällen hat die zuständige Behörde oder Stelle das Jugendamt über den jugendgefährdenden Ort zu unterrichten.",
    "Art_Rechtsfolge_Positiv_Typ": "Maßnahmen zur Gefahrenabwehr",
    "FK_Entscheidungsart_ID_Lookup_Bezeichnung": "Ermessen (intendiertes Ermessen)",
    "Ermessensleitlinien_Text": "Die Ermessensausübung orientiert sich an der Erforderlichkeit der Maßnahme zur Abwendung der unmittelbaren Gefahr. Mögliche Maßnahmen sind: 1. Anhalten zum Verlassen des Ortes, 2. Zuführung zur erziehungsberechtigten Person, 3. Inobhutnahme durch das Jugendamt, wenn keine erziehungsberechtigte Person erreichbar ist. In schwierigen Fällen besteht die Pflicht zur Unterrichtung des Jugendamtes.",
    "Gesetz_Vollstaendiger_Name": "Jugendschutzgesetz",
    "Paragraf_Uebergreifende_Kurzbeschreibung": "Regelt die Eingriffsbefugnisse und Maßnahmen der zuständigen Behörden, wenn sich Kinder oder Jugendliche an Orten aufhalten, die eine unmittelbare Gefahr für ihr körperliches, geistiges oder seelisches Wohl darstellen. Definiert die möglichen Maßnahmen von der Aufforderung zum Verlassen des Ortes bis zur Inobhutnahme durch das Jugendamt.",
    "Gesetz_Aktueller_Stand_Datum": "Zuletzt geändert durch Art. 12 G v. 6.5.2024 I Nr. 149",
    "Paragraph_Offizielle_Bezeichnung": "Jugendgefährdende Orte"
  },
  "Parameter_Liste": [
    {
      "Parameter_ID": "P_8_1_Personenkreis",
      "Reihenfolge_Anzeige": 1,
      "Fragetext": "Handelt es sich bei der betroffenen Person um ein Kind oder eine jugendliche Person?",
      "Antworttyp": "AuswahlEinfach",
      "Antwortoptionen_bei_Auswahl": [
        {
          "Option_Text": "Ja, es ist ein Kind (unter 14 Jahre).",
          "Option_Wert_Intern": "O_Kind",
          "Reihenfolge_Option": 1
        },
        {
          "Option_Text": "Ja, es ist eine jugendliche Person (14 bis unter 18 Jahre).",
          "Option_Wert_Intern": "O_Jugendlich",
          "Reihenfolge_Option": 2
        },
        {
          "Option_Text": "Nein, die Person ist volljährig (18 Jahre oder älter).",
          "Option_Wert_Intern": "O_Erwachsen",
          "Reihenfolge_Option": 3
        }
      ],
      "Begleittext": "Gemäß § 1 JuSchG ist ein Kind, wer noch nicht 14 Jahre alt ist, und eine jugendliche Person, wer 14, aber noch nicht 18 Jahre alt ist. Die Maßnahmen nach § 8 JuSchG gelten nur für diesen Personenkreis.",
      "Normbezug_Detail_Parameter": "§ 8 S. 1 JuSchG: ''...ein Kind oder eine jugendliche Person...''",
      "Verweis_Normen_Info_Parameter": "§ 1 JuSchG (Begriffsbestimmungen)",
      "FK_Verlinkte_SimulationsEinheit_ID_Platzhalter": null,
      "Ist_Grundvoraussetzung": true,
      "Anzeige_Bedingung": [],
      "Text_Erfuellt_Pro": "Die betroffene Person gehört zum geschützten Personenkreis des Jugendschutzgesetzes.",
      "Text_NichtErfuellt_Contra": "Die betroffene Person ist volljährig, weshalb der Anwendungsbereich des § 8 JuSchG nicht eröffnet ist.",
      "Konklusive_Antworten_Info": [
        {
          "Antwort_Wert_Intern_Erwartet": "O_Erwachsen",
          "Konklusions_Typ": "NEGATIV_BLOCKIEREND",
          "Hinweis_Text_Kurz_Fuer_Meldung": "Norm nicht anwendbar, da die Person volljährig ist.",
          "Hinweis_Text_Lang_Fuer_Begruendung": "Der § 8 des Jugendschutzgesetzes ist ausschließlich auf Kinder und Jugendliche anwendbar. Da die betroffene Person als volljährig eingestuft wurde, ist der sachliche Anwendungsbereich der Norm nicht eröffnet und die weitere Prüfung wird beendet."
        }
      ]
    },
    {
      "Parameter_ID": "P_8_1_UnmittelbareGefahr",
      "Reihenfolge_Anzeige": 2,
      "Fragetext": "Droht der Person an ihrem Aufenthaltsort eine unmittelbare Gefahr für ihr körperliches, geistiges oder seelisches Wohl?",
      "Antworttyp": "JaNein",
      "Antwortoptionen_bei_Auswahl": [],
      "Begleittext": "Eine unmittelbare Gefahr liegt vor, wenn der Eintritt eines Schadens für das Kindeswohl nach allgemeiner Lebenserfahrung als sehr wahrscheinlich erscheint, falls nicht eingegriffen wird.",
      "Normbezug_Detail_Parameter": "§ 8 S. 1 JuSchG: ''...unmittelbare Gefahr für das körperliche, geistige oder seelische Wohl droht...''",
      "Verweis_Normen_Info_Parameter": null,
      "FK_Verlinkte_SimulationsEinheit_ID_Platzhalter": null,
      "Ist_Grundvoraussetzung": true,
      "Anzeige_Bedingung": [],
      "Text_Erfuellt_Pro": "Am Aufenthaltsort droht eine unmittelbare Gefahr für das Wohl der Person.",
      "Text_NichtErfuellt_Contra": "Es liegt keine unmittelbare Gefahr für das Wohl der Person vor; die Voraussetzungen für Maßnahmen nach § 8 JuSchG sind nicht erfüllt.",
      "Konklusive_Antworten_Info": [
        {
          "Antwort_Wert_Intern_Erwartet": "Nein",
          "Konklusions_Typ": "NEGATIV_BLOCKIEREND",
          "Hinweis_Text_Kurz_Fuer_Meldung": "Keine Maßnahmen nach § 8 JuSchG, da keine unmittelbare Gefahr vorliegt.",
          "Hinweis_Text_Lang_Fuer_Begruendung": "Die zentrale Voraussetzung für ein Eingreifen nach § 8 JuSchG ist das Drohen einer unmittelbaren Gefahr für das Kindeswohl. Da diese Voraussetzung nicht erfüllt ist, fehlt die Grundlage für jegliche Maßnahmen und die Prüfung ist beendet."
        }
      ]
    },
    {
      "Parameter_ID": "P_8_1_AuswahlMassnahme",
      "Reihenfolge_Anzeige": 3,
      "Fragetext": "Welche Maßnahme ist zur Abwendung der Gefahr erforderlich und verhältnismäßig?",
      "Antworttyp": "AuswahlEinfach",
      "Antwortoptionen_bei_Auswahl": [
        {
          "Option_Text": "Die Person zum Verlassen des Ortes anhalten.",
          "Option_Wert_Intern": "O_Ort_Verlassen",
          "Reihenfolge_Option": 1
        },
        {
          "Option_Text": "Die Person einer erziehungsberechtigten Person zuführen.",
          "Option_Wert_Intern": "O_Eltern_Zufuehren",
          "Reihenfolge_Option": 2
        },
        {
          "Option_Text": "Die Person in die Obhut des Jugendamtes bringen (nur zulässig, wenn kein Erziehungsberechtigter erreichbar ist).",
          "Option_Wert_Intern": "O_Jugendamt_Inobhutnahme",
          "Reihenfolge_Option": 3
        }
      ],
      "Begleittext": "Die Wahl der Maßnahme muss sich am Grundsatz der Verhältnismäßigkeit orientieren. Die Inobhutnahme durch das Jugendamt ist nur als letztes Mittel (ultima ratio) zulässig.",
      "Normbezug_Detail_Parameter": "§ 8 S. 2 Nr. 1 und 2 JuSchG",
      "Verweis_Normen_Info_Parameter": "§ 7 Abs. 1 Nr. 6 SGB VIII (erziehungsberechtigte Person)",
      "FK_Verlinkte_SimulationsEinheit_ID_Platzhalter": null,
      "Ist_Grundvoraussetzung": false,
      "Anzeige_Bedingung": [
        {
          "Referenz_Parameter_ID": "P_8_1_UnmittelbareGefahr",
          "Referenz_Antwort_Operator": "IST_GLEICH",
          "Referenz_Antwort_Wert_Intern": "Ja"
        }
      ],
      "Text_Erfuellt_Pro": "Eine erforderliche und verhältnismäßige Maßnahme wurde ausgewählt.",
      "Text_NichtErfuellt_Contra": "Es wurde keine spezifische Maßnahme ausgewählt."
    },
    {
      "Parameter_ID": "P_8_1_ErziehungsberechtigterErreichbar",
      "Reihenfolge_Anzeige": 4,
      "Fragetext": "Ist eine erziehungsberechtigte Person erreichbar, um die Person in Obhut zu nehmen?",
      "Antworttyp": "JaNein",
      "Antwortoptionen_bei_Auswahl": [],
      "Begleittext": "Die Erreichbarkeit ist eine Voraussetzung für die Maßnahme ''Zuführung zur erziehungsberechtigten Person''. Ist niemand erreichbar, kommt eine Inobhutnahme durch das Jugendamt in Betracht.",
      "Normbezug_Detail_Parameter": "§ 8 S. 2 Nr. 2 JuSchG: ''...oder, wenn keine erziehungsberechtigte Person erreichbar ist...''",
      "Verweis_Normen_Info_Parameter": null,
      "FK_Verlinkte_SimulationsEinheit_ID_Platzhalter": null,
      "Ist_Grundvoraussetzung": false,
      "Anzeige_Bedingung": [
        {
          "Referenz_Parameter_ID": "P_8_1_AuswahlMassnahme",
          "Referenz_Antwort_Operator": "IST_EINES_VON",
          "Referenz_Antwort_Wert_Intern": [
            "O_Eltern_Zufuehren",
            "O_Jugendamt_Inobhutnahme"
          ]
        }
      ],
      "Text_Erfuellt_Pro": "Eine erziehungsberechtigte Person ist erreichbar.",
      "Text_NichtErfuellt_Contra": "Keine erziehungsberechtigte Person ist erreichbar, was die Inobhutnahme durch das Jugendamt ermöglicht."
    },
    {
      "Parameter_ID": "P_8_1_SchwierigerFall",
      "Reihenfolge_Anzeige": 5,
      "Fragetext": "Handelt es sich um einen ''schwierigen Fall'', der eine Unterrichtung des Jugendamtes über den Ort erfordert?",
      "Antworttyp": "JaNein",
      "Antwortoptionen_bei_Auswahl": [],
      "Begleittext": "Ein schwieriger Fall kann z.B. bei wiederholtem Antreffen an gefährdenden Orten, massiver Verwahrlosung oder offensichtlichen Suchtproblemen vorliegen. Es handelt sich um eine unbestimmten Rechtsbegriff, der im Ermessen der Behörde liegt.",
      "Normbezug_Detail_Parameter": "§ 8 S. 3 JuSchG: ''In schwierigen Fällen...''",
      "Verweis_Normen_Info_Parameter": null,
      "FK_Verlinkte_SimulationsEinheit_ID_Platzhalter": null,
      "Ist_Grundvoraussetzung": false,
      "Anzeige_Bedingung": [
        {
          "Referenz_Parameter_ID": "P_8_1_UnmittelbareGefahr",
          "Referenz_Antwort_Operator": "IST_GLEICH",
          "Referenz_Antwort_Wert_Intern": "Ja"
        }
      ],
      "Text_Erfuellt_Pro": "Der Sachverhalt wird als schwieriger Fall eingestuft und das Jugendamt entsprechend unterrichtet.",
      "Text_NichtErfuellt_Contra": "Der Sachverhalt wird nicht als schwieriger Fall eingestuft; eine gesonderte Unterrichtung des Jugendamts über den Ort erfolgt nicht."
    }
  ],
  "Regelwerk": [
    {
      "Regel_Name": "Ablehnung, da Person volljährig",
      "Prioritaet": 10,
      "FK_ErgebnisProfil_ID_Referenz": "EP_8_1_Negativ_Personenkreis_Fehlt",
      "Bedingungen_fuer_Regel": [
        {
          "FK_Parameter_ID": "P_8_1_Personenkreis",
          "Operator": "IST_GLEICH",
          "Erwarteter_Wert_Intern": "O_Erwachsen"
        }
      ]
    },
    {
      "Regel_Name": "Ablehnung, da keine unmittelbare Gefahr",
      "Prioritaet": 20,
      "FK_ErgebnisProfil_ID_Referenz": "EP_8_1_Negativ_Gefahr_Fehlt",
      "Bedingungen_fuer_Regel": [
        {
          "FK_Parameter_ID": "P_8_1_UnmittelbareGefahr",
          "Operator": "IST_GLEICH",
          "Erwarteter_Wert_Intern": "Nein"
        }
      ]
    },
    {
      "Regel_Name": "Ermessen eröffnet (Kind oder Jugendlicher in Gefahr)",
      "Prioritaet": 100,
      "FK_ErgebnisProfil_ID_Referenz": "EP_8_1_Positiv_Ermessen_Eroeffnet",
      "Bedingungen_fuer_Regel": [
        {
          "FK_Parameter_ID": "P_8_1_Personenkreis",
          "Operator": "IST_GLEICH",
          "Erwarteter_Wert_Intern": "O_Kind"
        },
        {
          "FK_Parameter_ID": "P_8_1_UnmittelbareGefahr",
          "Operator": "IST_GLEICH",
          "Erwarteter_Wert_Intern": "Ja"
        }
      ]
    },
    {
      "Regel_Name": "Ermessen eröffnet (Jugendlicher in Gefahr) - Variante",
      "Prioritaet": 110,
      "FK_ErgebnisProfil_ID_Referenz": "EP_8_1_Positiv_Ermessen_Eroeffnet",
      "Bedingungen_fuer_Regel": [
        {
          "FK_Parameter_ID": "P_8_1_Personenkreis",
          "Operator": "IST_GLEICH",
          "Erwarteter_Wert_Intern": "O_Jugendlich"
        },
        {
          "FK_Parameter_ID": "P_8_1_UnmittelbareGefahr",
          "Operator": "IST_GLEICH",
          "Erwarteter_Wert_Intern": "Ja"
        }
      ]
    },
    {
      "Regel_Name": "Maßnahme: Anhalten zum Verlassen des Ortes",
      "Prioritaet": 200,
      "FK_ErgebnisProfil_ID_Referenz": "EP_8_1_Positiv_Massnahme_Ort_Verlassen",
      "Bedingungen_fuer_Regel": [
        {
          "FK_Parameter_ID": "P_8_1_UnmittelbareGefahr",
          "Operator": "IST_GLEICH",
          "Erwarteter_Wert_Intern": "Ja"
        },
        {
          "FK_Parameter_ID": "P_8_1_AuswahlMassnahme",
          "Operator": "IST_GLEICH",
          "Erwarteter_Wert_Intern": "O_Ort_Verlassen"
        }
      ]
    },
    {
      "Regel_Name": "Maßnahme: Zuführung zu Erziehungsberechtigtem",
      "Prioritaet": 210,
      "FK_ErgebnisProfil_ID_Referenz": "EP_8_1_Positiv_Massnahme_Eltern_Zufuehren",
      "Bedingungen_fuer_Regel": [
        {
          "FK_Parameter_ID": "P_8_1_UnmittelbareGefahr",
          "Operator": "IST_GLEICH",
          "Erwarteter_Wert_Intern": "Ja"
        },
        {
          "FK_Parameter_ID": "P_8_1_AuswahlMassnahme",
          "Operator": "IST_GLEICH",
          "Erwarteter_Wert_Intern": "O_Eltern_Zufuehren"
        },
        {
          "FK_Parameter_ID": "P_8_1_ErziehungsberechtigterErreichbar",
          "Operator": "IST_GLEICH",
          "Erwarteter_Wert_Intern": "Ja"
        }
      ]
    },
    {
      "Regel_Name": "Maßnahme: Inobhutnahme durch Jugendamt",
      "Prioritaet": 220,
      "FK_ErgebnisProfil_ID_Referenz": "EP_8_1_Positiv_Massnahme_Inobhutnahme",
      "Bedingungen_fuer_Regel": [
        {
          "FK_Parameter_ID": "P_8_1_UnmittelbareGefahr",
          "Operator": "IST_GLEICH",
          "Erwarteter_Wert_Intern": "Ja"
        },
        {
          "FK_Parameter_ID": "P_8_1_AuswahlMassnahme",
          "Operator": "IST_GLEICH",
          "Erwarteter_Wert_Intern": "O_Jugendamt_Inobhutnahme"
        },
        {
          "FK_Parameter_ID": "P_8_1_ErziehungsberechtigterErreichbar",
          "Operator": "IST_GLEICH",
          "Erwarteter_Wert_Intern": "Nein"
        }
      ]
    },
    {
      "Regel_Name": "Zusatzpflicht: Meldung an Jugendamt bei schwierigem Fall",
      "Prioritaet": 300,
      "FK_ErgebnisProfil_ID_Referenz": "EP_8_1_Zusatz_Meldepflicht_SchwierigerFall",
      "Bedingungen_fuer_Regel": [
        {
          "FK_Parameter_ID": "P_8_1_UnmittelbareGefahrMeldung",
          "Operator": "IST_GLEICH",
          "Erwarteter_Wert_Intern": "Ja"
        },
        {
          "FK_Parameter_ID": "P_8_1_SchwierigerFall",
          "Operator": "IST_GLEICH",
          "Erwarteter_Wert_Intern": "Ja"
        }
      ]
    }
  ],
  "ErgebnisProfile": [
    {
      "ErgebnisProfil_ID_Referenz": "EP_8_1_Negativ_Personenkreis_Fehlt",
      "Profil_Name": "Ablehnung: Falscher Personenkreis",
      "Entscheidungstext_Kurz_Vorlage": "Maßnahmen nach § 8 JuSchG können nicht ergriffen werden, da die Person volljährig ist und somit nicht zum geschützten Personenkreis des Gesetzes gehört.",
      "Art_der_Entscheidung_Anzeige_Text": "Negative Entscheidung (Voraussetzungen nicht erfüllt)",
      "Einleitungstext_Begruendung_Vorlage": "Die Prüfung der Anwendbarkeit des § 8 JuSchG hat ergeben:",
      "Begruendung_Dynamische_Parameter_Liste": [],
      "Spezifischer_Ergaenzungstext_Begruendung_Vorlage": "Der Anwendungsbereich des Jugendschutzgesetzes ist nicht eröffnet.",
      "Abschlusstext_Begruendung_Vorlage": "Die Prüfung ist damit abgeschlossen. Es sind keine weiteren Maßnahmen auf dieser Grundlage möglich."
    },
    {
      "ErgebnisProfil_ID_Referenz": "EP_8_1_Negativ_Gefahr_Fehlt",
      "Profil_Name": "Ablehnung: Keine unmittelbare Gefahr",
      "Entscheidungstext_Kurz_Vorlage": "Maßnahmen nach § 8 JuSchG können nicht ergriffen werden, da keine unmittelbare Gefahr für das körperliche, geistige oder seelische Wohl der Person vorliegt.",
      "Art_der_Entscheidung_Anzeige_Text": "Negative Entscheidung (Voraussetzungen nicht erfüllt)",
      "Einleitungstext_Begruendung_Vorlage": "Die Prüfung der Voraussetzungen des § 8 JuSchG hat ergeben:",
      "Begruendung_Dynamische_Parameter_Liste": [],
      "Spezifischer_Ergaenzungstext_Begruendung_Vorlage": "Ohne das Vorliegen einer unmittelbaren Gefahr fehlt die Eingriffsgrundlage.",
      "Abschlusstext_Begruendung_Vorlage": "Die Prüfung ist damit abgeschlossen."
    },
    {
      "ErgebnisProfil_ID_Referenz": "EP_8_1_Positiv_Ermessen_Eroeffnet",
      "Profil_Name": "Positiv: Handlungsrahmen eröffnet",
      "Entscheidungstext_Kurz_Vorlage": "Die grundsätzlichen Voraussetzungen für Maßnahmen nach § 8 JuSchG sind erfüllt. Die Auswahl der erforderlichen Maßnahme steht im Ermessen der zuständigen Stelle.",
      "Art_der_Entscheidung_Anzeige_Text": "Ermessensentscheidung: Handlungsrahmen eröffnet",
      "Einleitungstext_Begruendung_Vorlage": "Die Prüfung der Tatbestandsvoraussetzungen hat ergeben:",
      "Begruendung_Dynamische_Parameter_Liste": [],
      "Spezifischer_Ergaenzungstext_Begruendung_Vorlage": "Die Ermessensausübung orientiert sich an der Erforderlichkeit der Maßnahme zur Abwendung der unmittelbaren Gefahr. Mögliche Maßnahmen sind: 1. Anhalten zum Verlassen des Ortes, 2. Zuführung zur erziehungsberechtigten Person, 3. Inobhutnahme durch das Jugendamt, wenn keine erziehungsberechtigte Person erreichbar ist. In schwierigen Fällen besteht die Pflicht zur Unterrichtung des Jugendamtes.",
      "Abschlusstext_Begruendung_Vorlage": "Bitte wählen Sie die geeignete Maßnahme aus und dokumentieren Sie die Ermessenserwägungen."
    },
    {
      "ErgebnisProfil_ID_Referenz": "EP_8_1_Positiv_Massnahme_Ort_Verlassen",
      "Profil_Name": "Maßnahme: Anordnung zum Verlassen des Ortes",
      "Entscheidungstext_Kurz_Vorlage": "Als erforderliche und verhältnismäßige Maßnahme wird die Person zum Verlassen des Ortes angehalten.",
      "Art_der_Entscheidung_Anzeige_Text": "Positive Ermessensentscheidung (Maßnahme)",
      "Einleitungstext_Begruendung_Vorlage": "Basierend auf der erfolgten Prüfung wird folgende Entscheidung getroffen:",
      "Begruendung_Dynamische_Parameter_Liste": [],
      "Spezifischer_Ergaenzungstext_Begruendung_Vorlage": "Diese Maßnahme wurde als das mildeste, aber ausreichende Mittel zur Abwendung der festgestellten Gefahr bewertet.",
      "Abschlusstext_Begruendung_Vorlage": "Die Umsetzung der Maßnahme ist zu veranlassen und zu dokumentieren."
    },
    {
      "ErgebnisProfil_ID_Referenz": "EP_8_1_Positiv_Massnahme_Eltern_Zufuehren",
      "Profil_Name": "Maßnahme: Zuführung zu Erziehungsberechtigten",
      "Entscheidungstext_Kurz_Vorlage": "Als erforderliche und verhältnismäßige Maßnahme wird die Person einer erziehungsberechtigten Person zugeführt.",
      "Art_der_Entscheidung_Anzeige_Text": "Positive Ermessensentscheidung (Maßnahme)",
      "Einleitungstext_Begruendung_Vorlage": "Basierend auf der erfolgten Prüfung wird folgende Entscheidung getroffen:",
      "Begruendung_Dynamische_Parameter_Liste": [],
      "Spezifischer_Ergaenzungstext_Begruendung_Vorlage": "Die Übergabe in die Obhut der erreichbaren Erziehungsberechtigten ist zur nachhaltigen Abwendung der Gefahr geboten.",
      "Abschlusstext_Begruendung_Vorlage": "Die Umsetzung der Maßnahme ist zu veranlassen und zu dokumentieren."
    },
    {
      "ErgebnisProfil_ID_Referenz": "EP_8_1_Positiv_Massnahme_Inobhutnahme",
      "Profil_Name": "Maßnahme: Inobhutnahme durch das Jugendamt",
      "Entscheidungstext_Kurz_Vorlage": "Als erforderliche und verhältnismäßige Maßnahme wird die Person in die Obhut des Jugendamtes gebracht, da keine erziehungsberechtigte Person erreichbar ist.",
      "Art_der_Entscheidung_Anzeige_Text": "Positive Ermessensentscheidung (Maßnahme)",
      "Einleitungstext_Begruendung_Vorlage": "Basierend auf der erfolgten Prüfung wird folgende Entscheidung getroffen:",
      "Begruendung_Dynamische_Parameter_Liste": [],
      "Spezifischer_Ergaenzungstext_Begruendung_Vorlage": "Da die Gefahr anders nicht abgewendet werden kann und Erziehungsberechtigte nicht erreichbar sind, ist die Inobhutnahme durch das Jugendamt als letztes Mittel (ultima ratio) erforderlich.",
      "Abschlusstext_Begruendung_Vorlage": "Die Übergabe an das Jugendamt ist unverzüglich zu veranlassen und zu dokumentieren."
    },
    {
      "ErgebnisProfil_ID_Referenz": "EP_8_1_Zusatz_Meldepflicht_SchwierigerFall",
      "Profil_Name": "Zusatzpflicht: Meldung bei schwierigem Fall",
      "Entscheidungstext_Kurz_Vorlage": "Zusätzlich zur ergriffenen Maßnahme ist das Jugendamt über den jugendgefährdenden Ort zu unterrichten, da ein ''schwieriger Fall'' vorliegt.",
      "Art_der_Entscheidung_Anzeige_Text": "Zusätzliche gesetzliche Pflicht",
      "Einleitungstext_Begruendung_Vorlage": "Die Prüfung hat eine zusätzliche Handlungspflicht ergeben:",
      "Begruendung_Dynamische_Parameter_Liste": [],
      "Spezifischer_Ergaenzungstext_Begruendung_Vorlage": "Die Einstufung als ''schwieriger Fall'' begründet die gesetzliche Pflicht aus § 8 Satz 3 JuSchG, das Jugendamt zur Prüfung weiterer Maßnahmen zu informieren.",
      "Abschlusstext_Begruendung_Vorlage": "Die Unterrichtung des Jugendamtes ist sicherzustellen."
    }
  ]
}

// =================================================================
BEWERTUNGSGRUNDSÄTZE FÜR DEIN AUDIT:
1.  Fokus auf Substanz, nicht auf Stil: Bewerte primär die fachliche Korrektheit und den Sinngehalt, nicht die exakte Wortwahl.
2.  Beachte, dass bei diesem Audit ausschließlich die Analyse des explizit angeführten Teils der Rechtsnorm, in der Regel eine Absatz, bewertet werden soll. Alle anderen Absätze des Paragrafen werden separat bewertet und erst danach einer Gesamtbetrachtung unterworfen und gemeinsam bewertet.
3.  Semantische Äquivalenz akzeptieren: Leichte Abweichungen in der Formulierung von Fragetexten oder Beschreibungen sind völlig akzeptabel, solange der juristische Kern und der Zweck für den Anwender unmissverständlich und korrekt getroffen werden. Betreibe keine "Wortklauberei". Eine Frage wie "Liegt eine unmittelbare Gefahr vor?" ist semantisch gleichwertig zu "Besteht eine unmittelbare Gefahr für das Kindeswohl?" und sollte nicht negativ bewertet werden, solange der Kontext klar ist.
4.  Kritik an materiellen Fehlern: Konzentriere deine Kritik und negative Bewertungen auf materielle Fehler. Das sind:
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
  '{"Gesamtbewertung":{"Score":8.7,"Fazit":"Das Datenmodell ist von sehr hoher Qualität und bildet die Norm § 8 JuSchG präzise und praxistauglich ab. Die wesentlichen Tatbestandsmerkmale, Ermessensspielräume und Verfahrensschritte sind korrekt erfasst."},"Detailbewertungen":[{"Kategorie":"Vollständigkeit der Parameter","Score":9,"Begruendung":"Alle wesentlichen Tatbestandsmerkmale sind vollständig erfasst: Personenkreis (Kind/Jugendlicher), unmittelbare Gefahr, die drei möglichen Maßnahmen nach Satz 2, die Erreichbarkeit der Erziehungsberechtigten als Voraussetzung für die Zuführung, und der ''schwierige Fall'' aus Satz 3. Die Strukturierung ist durchdacht und praxisgerecht. Minimal könnte man anmerken, dass die ''Erforderlichkeit'' der Maßnahmen als explizites Prüfkriterium fehlt, dies ist aber implizit in der Maßnahmenauswahl enthalten."},{"Kategorie":"Logische Konsistenz der Regeln","Score":9,"Begruendung":"Die Regelpriorisierung ist mustergültig: Ausschlussgründe (Volljährigkeit Prio 10, keine Gefahr Prio 20) werden korrekt vor der positiven Tatbestandsprüfung (Prio 100/110) geprüft. Die Maßnahmenregeln (200-220) sind logisch aufgebaut, insbesondere die korrekte Verknüpfung der Inobhutnahme mit der Nicht-Erreichbarkeit der Erziehungsberechtigten. Die Zusatzpflicht ''schwieriger Fall'' (Prio 300) ist richtigerweise als separate, additive Regel modelliert. Die Bedingungslogik innerhalb der Regeln ist durchweg korrekt."},{"Kategorie":"Qualität der Fragetexte und Ergebnisprofile","Score":8,"Begruendung":"Die Fragetexte sind klar, neutral und für Anwender gut verständlich formuliert. Besonders positiv sind die erläuternden Begleittexte mit Definitionen und Rechtsverweisen. Die Ergebnisprofile differenzieren sauber zwischen negativen Entscheidungen, Ermessenseröffnung und konkreten Maßnahmen. Der Entscheidungstext bei der Maßnahmenauswahl könnte noch expliziter auf die Verhältnismäßigkeitsprüfung eingehen. Die Formulierung ''intendiertes Ermessen'' in den Metadaten trifft den Charakter der Norm gut - die Behörde soll bei Gefahrenlage grundsätzlich handeln."}]}'
);

SET @audit_id = LAST_INSERT_ID();

-- Alternative für phpMyAdmin:
-- SET @audit_id = (SELECT MAX(AuditID) FROM QualitaetsAudits WHERE FK_Einheit_ID = 'SE_JuSchG_8_Abs1__v_Gemini2.5Pro_V1.0__Pv1');

INSERT INTO QualitaetsAudit_Detailbewertungen (
  FK_AuditID, Kategorie, Score, Begruendung
) VALUES (
  @audit_id,  -- Variable statt LAST_INSERT_ID()
  'Vollständigkeit der Parameter',
  9,
  'Alle wesentlichen Tatbestandsmerkmale sind vollständig erfasst: Personenkreis (Kind/Jugendlicher), unmittelbare Gefahr, die drei möglichen Maßnahmen nach Satz 2, die Erreichbarkeit der Erziehungsberechtigten als Voraussetzung für die Zuführung, und der ''schwierige Fall'' aus Satz 3. Die Strukturierung ist durchdacht und praxisgerecht. Minimal könnte man anmerken, dass die ''Erforderlichkeit'' der Maßnahmen als explizites Prüfkriterium fehlt, dies ist aber implizit in der Maßnahmenauswahl enthalten.'
);
INSERT INTO QualitaetsAudit_Detailbewertungen (
  FK_AuditID, Kategorie, Score, Begruendung
) VALUES (
  @audit_id,  -- Variable statt LAST_INSERT_ID()
  'Logische Konsistenz der Regeln',
  9,
  'Die Regelpriorisierung ist mustergültig: Ausschlussgründe (Volljährigkeit Prio 10, keine Gefahr Prio 20) werden korrekt vor der positiven Tatbestandsprüfung (Prio 100/110) geprüft. Die Maßnahmenregeln (200-220) sind logisch aufgebaut, insbesondere die korrekte Verknüpfung der Inobhutnahme mit der Nicht-Erreichbarkeit der Erziehungsberechtigten. Die Zusatzpflicht ''schwieriger Fall'' (Prio 300) ist richtigerweise als separate, additive Regel modelliert. Die Bedingungslogik innerhalb der Regeln ist durchweg korrekt.'
);
INSERT INTO QualitaetsAudit_Detailbewertungen (
  FK_AuditID, Kategorie, Score, Begruendung
) VALUES (
  @audit_id,  -- Variable statt LAST_INSERT_ID()
  'Qualität der Fragetexte und Ergebnisprofile',
  8,
  'Die Fragetexte sind klar, neutral und für Anwender gut verständlich formuliert. Besonders positiv sind die erläuternden Begleittexte mit Definitionen und Rechtsverweisen. Die Ergebnisprofile differenzieren sauber zwischen negativen Entscheidungen, Ermessenseröffnung und konkreten Maßnahmen. Der Entscheidungstext bei der Maßnahmenauswahl könnte noch expliziter auf die Verhältnismäßigkeitsprüfung eingehen. Die Formulierung ''intendiertes Ermessen'' in den Metadaten trifft den Charakter der Norm gut - die Behörde soll bei Gefahrenlage grundsätzlich handeln.'
);

COMMIT;
