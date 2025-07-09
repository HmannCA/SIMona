// sql-generators.js - Korrigierte SQL-Generatoren mit Mapping
// Version: 2.5

/**
 * SQL-Generator für P1 (SimulationsEinheiten und Regelwerke)
 */
function generateSqlForP1Data() {
    const p1Data = SimONAState.methods.getResponse('p1');
    const einheitId = SimONAState.currentSimulationsEinheitID;
    
    if (!p1Data) {
        alert("Keine P1-Metadaten vorhanden. Bitte Prompt P1 ausführen.");
        return "";
    }
    if (!einheitId) {
        alert("SimulationsEinheit_ID fehlt.");
        return "";
    }

    let sql = `-- SQL für SimulationsEinheiten und Regelwerke (basierend auf P1 Daten)\n`;
    sql += `START TRANSACTION;\n\n`;
    
    // Mappe P1-Daten auf DB-Felder
    const mappedData = MappingUtils.mapToDb(
        p1Data, 
        SimONAConfig.fieldMapping.p1ToDb
    );
    
    // SimulationsEinheiten INSERT
    sql += `INSERT INTO SimulationsEinheiten (\n`;
    sql += `  Einheit_ID,\n`;
    sql += `  Gesetz,\n`;
    sql += `  Gesetz_Vollname,\n`;
    sql += `  Gesetz_Aktueller_Stand,\n`;
    sql += `  Paragraph,\n`;
    sql += `  Paragraph_Offizielle_Bezeichnung,\n`;
    sql += `  Paragraf_Gesamtbeschreibung,\n`;
    sql += `  Absatz,\n`;
    sql += `  Satz,\n`;
    sql += `  Kurzbeschreibung,\n`;
    sql += `  Art_Rechtsfolge_Positiv_Typ,\n`;
    sql += `  Gesetzestext_Referenz_Link,\n`;
    sql += `  Gesetzestext_Zitat,\n`;
    sql += `  FK_Entscheidungsart_ID,\n`;
    sql += `  Ermessensleitlinien_Text,\n`;
    sql += `  Letzte_Aenderung_SimONA_Datum,\n`;
    sql += `  Version_SimONA\n`;
    sql += `) VALUES (\n`;
    
    // Werte einfügen
    sql += `  ${escapeSqlString(einheitId)},\n`;
    sql += `  ${escapeSqlString(mappedData.Gesetz || '')},\n`;
    sql += `  ${mappedData.Gesetz_Vollname ? escapeSqlString(mappedData.Gesetz_Vollname) : 'NULL'},\n`;
    sql += `  ${mappedData.Gesetz_Aktueller_Stand ? escapeSqlString(mappedData.Gesetz_Aktueller_Stand) : 'NULL'},\n`;
    sql += `  ${escapeSqlString(mappedData.Paragraph || '')},\n`;
    sql += `  ${mappedData.Paragraph_Offizielle_Bezeichnung ? escapeSqlString(mappedData.Paragraph_Offizielle_Bezeichnung) : 'NULL'},\n`;
    sql += `  ${mappedData.Paragraf_Gesamtbeschreibung ? escapeSqlString(mappedData.Paragraf_Gesamtbeschreibung) : 'NULL'},\n`;
    sql += `  ${mappedData.Absatz ? escapeSqlString(mappedData.Absatz) : 'NULL'},\n`;
    sql += `  ${mappedData.Satz ? escapeSqlString(mappedData.Satz) : 'NULL'},\n`;
    sql += `  ${escapeSqlString(mappedData.Kurzbeschreibung || '')},\n`;
    sql += `  ${mappedData.Art_Rechtsfolge_Positiv_Typ ? escapeSqlString(mappedData.Art_Rechtsfolge_Positiv_Typ) : 'NULL'},\n`;
    sql += `  ${escapeSqlString(getInputValue('quelle') || '')},\n`;
    sql += `  ${mappedData.Gesetzestext_Zitat ? escapeSqlString(mappedData.Gesetzestext_Zitat) : 'NULL'},\n`;
    
    // Spezialbehandlung für FK_Entscheidungsart_ID
    if (mappedData.entscheidungsart) {
        sql += `  ${mappedData.entscheidungsart},\n`;
    } else {
        sql += `  NULL,\n`;
    }
    
    sql += `  ${mappedData.Ermessensleitlinien_Text ? escapeSqlString(mappedData.Ermessensleitlinien_Text) : 'NULL'},\n`;
    sql += `  CURDATE(),\n`;
    sql += `  ${escapeSqlString(SimONAConfig.version)}\n`;
    sql += `);\n\n`;
    
    // Regelwerke INSERT
    sql += `INSERT INTO Regelwerke (Regelwerk_ID, FK_Einheit_ID, Beschreibung) VALUES (\n`;
    sql += `  ${escapeSqlString(einheitId)},\n`;
    sql += `  ${escapeSqlString(einheitId)},\n`;
    sql += `  ${escapeSqlString(`Regelwerk für ${mappedData.Kurzbeschreibung || einheitId}`)}\n`;
    sql += `);\n\n`;
    
    sql += `COMMIT;\n`;
    return sql;
}

/**
 * SQL-Generator für P2 (Parameter und ParameterOptionen)
 */
function generateSqlForP2Data() {
    const p2Data = SimONAState.methods.getResponse('p2');
    const einheitId = SimONAState.currentSimulationsEinheitID;
    
    if (!p2Data || !Array.isArray(p2Data) || p2Data.length === 0) {
        alert("Keine Parameter-Daten vorhanden.");
        return "";
    }
    if (!einheitId) {
        alert("SimulationsEinheit_ID fehlt.");
        return "";
    }

    let sql = `-- SQL für Parameter und Parameter_Antwortoptionen (basierend auf P2 Daten)\n`;
    sql += `START TRANSACTION;\n\n`;
    
    p2Data.forEach(param => {
        if (!param || typeof param.Parameter_ID !== 'string') {
            console.warn("Ungültiges Parameter-Objekt übersprungen:", param);
            return;
        }
        
        // Parameter_Name sicherstellen
        MappingUtils.ensureParameterName(param);
        
        // Mappe P2-Daten auf DB-Felder
        const mappedParam = MappingUtils.mapToDb(
            param, 
            SimONAConfig.fieldMapping.p2ToDb
        );
        
        // Parameter INSERT
        sql += `INSERT INTO Parameter (\n`;
        sql += `  Parameter_ID,\n`;
        sql += `  FK_Einheit_ID,\n`;
        sql += `  Parameter_Name,\n`;
        sql += `  Reihenfolge_Anzeige,\n`;
        sql += `  IstGrundvoraussetzung,\n`;
        sql += `  AnzeigeBedingungJSON,\n`;
        sql += `  KonklusiveAntwortenInfoJSON,\n`;
        sql += `  Fragetext,\n`;
        sql += `  Antworttyp,\n`;
        sql += `  Begleittext,\n`;
        sql += `  Normbezug_Detail_Parameter,\n`;
        sql += `  Verweis_Normen_Info_Parameter,\n`;
        sql += `  FK_Verlinkte_SimulationsEinheit_ID,\n`;
        sql += `  Verlinkung_Platzhalter_Text,\n`;
        sql += `  Text_Erfuellt_Pro,\n`;
        sql += `  Text_NichtErfuellt_Contra\n`;
        sql += `) VALUES (\n`;
        
        // Werte einfügen
        sql += `  ${escapeSqlString(mappedParam.Parameter_ID)},\n`;
        sql += `  ${escapeSqlString(einheitId)},\n`;
        sql += `  ${escapeSqlString(param.Parameter_Name || mappedParam.Parameter_ID)},\n`;
        sql += `  ${mappedParam.Reihenfolge_Anzeige || 'NULL'},\n`;
        sql += `  ${mappedParam.IstGrundvoraussetzung === true ? 'TRUE' : 'FALSE'},\n`;
        
        // AnzeigeBedingungJSON
        if (mappedParam.AnzeigeBedingungJSON && Array.isArray(param.Anzeige_Bedingung) && param.Anzeige_Bedingung.length > 0) {
            sql += `  ${escapeSqlString(JSON.stringify(param.Anzeige_Bedingung))},\n`;
        } else {
            sql += `  NULL,\n`;
        }
        
        // KonklusiveAntwortenInfoJSON (aus P2.7 falls vorhanden)
        if (mappedParam.KonklusiveAntwortenInfoJSON && Array.isArray(param.Konklusive_Antworten_Info) && param.Konklusive_Antworten_Info.length > 0) {
            sql += `  ${escapeSqlString(JSON.stringify(param.Konklusive_Antworten_Info))},\n`;
        } else {
            sql += `  NULL,\n`;
        }
        
        sql += `  ${escapeSqlString(mappedParam.Fragetext)},\n`;
        sql += `  ${escapeSqlString(mappedParam.Antworttyp)},\n`;
        sql += `  ${mappedParam.Begleittext ? escapeSqlString(mappedParam.Begleittext) : 'NULL'},\n`;
        sql += `  ${mappedParam.Normbezug_Detail_Parameter ? escapeSqlString(mappedParam.Normbezug_Detail_Parameter) : 'NULL'},\n`;
        sql += `  ${mappedParam.Verweis_Normen_Info_Parameter ? escapeSqlString(mappedParam.Verweis_Normen_Info_Parameter) : 'NULL'},\n`;
        sql += `  ${mappedParam.FK_Verlinkte_SimulationsEinheit_ID || 'NULL'},\n`;
        sql += `  NULL,\n`; // Verlinkung_Platzhalter_Text - aktuell nicht genutzt
        sql += `  ${mappedParam.Text_Erfuellt_Pro ? escapeSqlString(mappedParam.Text_Erfuellt_Pro) : 'NULL'},\n`;
        sql += `  ${mappedParam.Text_NichtErfuellt_Contra ? escapeSqlString(mappedParam.Text_NichtErfuellt_Contra) : 'NULL'}\n`;
        sql += `);\n\n`;
        
        // Parameter_Antwortoptionen einfügen (falls vorhanden)
        if (param.Antworttyp === 'AuswahlEinfach' && param.Antwortoptionen_bei_Auswahl && Array.isArray(param.Antwortoptionen_bei_Auswahl)) {
            param.Antwortoptionen_bei_Auswahl.forEach(option => {
                if (!option || typeof option.Option_Text !== 'string' || typeof option.Option_Wert_Intern !== 'string') {
                    console.warn("Ungültige Antwortoption übersprungen:", option);
                    return;
                }
                
                const mappedOption = MappingUtils.mapToDb(
                    option,
                    SimONAConfig.fieldMapping.p2OptionsToDb
                );
                
                sql += `INSERT INTO Parameter_Antwortoptionen (\n`;
                sql += `  FK_Parameter_ID,\n`;
                sql += `  Option_Text,\n`;
                sql += `  Option_Wert_Intern,\n`;
                sql += `  Reihenfolge\n`;
                sql += `) VALUES (\n`;
                sql += `  ${escapeSqlString(mappedParam.Parameter_ID)},\n`;
                sql += `  ${escapeSqlString(mappedOption.Option_Text)},\n`;
                sql += `  ${escapeSqlString(mappedOption.Option_Wert_Intern)},\n`;
                sql += `  ${mappedOption.Reihenfolge || 'NULL'}\n`;
                sql += `);\n`;
            });
            sql += `\n`;
        }
    });
    
    sql += `COMMIT;\n`;
    return sql;
}