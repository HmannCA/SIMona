// sql-generators-p3-p4.js - SQL-Generatoren für P3 und P4
// Version: 2.5

/**
 * SQL-Generator für P3 (Regeln und RegelBedingungen)
 */
function generateSqlForP3Data() {
    const p3Data = SimONAState.methods.getResponse('p3');
    const einheitId = SimONAState.currentSimulationsEinheitID;
    
    if (!p3Data || !Array.isArray(p3Data) || p3Data.length === 0) {
        alert("Keine Regel-Daten (P3) vorhanden.");
        return "";
    }
    if (!einheitId) {
        alert("SimulationsEinheit_ID fehlt.");
        return "";
    }

    const fkRegelwerkId = einheitId; // Regelwerk_ID = SimulationsEinheit_ID
    let sql = `-- SQL für Regeln und RegelBedingungen (basierend auf P3 Daten)\n`;
    sql += `START TRANSACTION;\n\n`;

    p3Data.forEach(regel => {
        if (!regel || typeof regel.Regel_Name !== 'string' || typeof regel.FK_ErgebnisProfil_ID_Referenz !== 'string') {
            console.warn("Ungültiges Regel-Objekt übersprungen:", regel);
            return;
        }

        // Mappe P3-Daten auf DB-Felder
        const mappedRegel = MappingUtils.mapToDb(
            regel,
            SimONAConfig.fieldMapping.p3ToDb
        );

        // Regel INSERT
        sql += `INSERT INTO Regeln (\n`;
        sql += `  FK_Regelwerk_ID,\n`;
        sql += `  Regel_Name,\n`;
        sql += `  Prioritaet,\n`;
        sql += `  FK_ErgebnisProfil_ID_Referenz\n`;
        sql += `) VALUES (\n`;
        sql += `  ${escapeSqlString(fkRegelwerkId)},\n`;
        sql += `  ${escapeSqlString(mappedRegel.Regel_Name)},\n`;
        sql += `  ${mappedRegel.Prioritaet !== undefined && mappedRegel.Prioritaet !== null ? mappedRegel.Prioritaet : 'NULL'},\n`;
        sql += `  ${escapeSqlString(mappedRegel.FK_ErgebnisProfil_ID_Referenz)}\n`;
        sql += `);\n`;
        
        // Verwende LAST_INSERT_ID() für die Bedingungen
        sql += `SET @last_regel_id = LAST_INSERT_ID();\n\n`;
        
        // RegelBedingungen einfügen
        if (regel.Bedingungen_fuer_Regel && Array.isArray(regel.Bedingungen_fuer_Regel)) {
            regel.Bedingungen_fuer_Regel.forEach(bedingung => {
                if (!bedingung || typeof bedingung.FK_Parameter_ID !== 'string' || typeof bedingung.Operator !== 'string') {
                    console.warn("Ungültige Bedingung übersprungen:", bedingung);
                    return;
                }
                
                const mappedBedingung = MappingUtils.mapToDb(
                    bedingung,
                    SimONAConfig.fieldMapping.p3ConditionsToDb
                );
                
                sql += `INSERT INTO RegelBedingungen (\n`;
                sql += `  FK_Regel_ID,\n`;
                sql += `  FK_Parameter_ID,\n`;
                sql += `  Operator,\n`;
                sql += `  Erwarteter_Wert_Intern\n`;
                sql += `) VALUES (\n`;
                sql += `  @last_regel_id,\n`;
                sql += `  ${escapeSqlString(mappedBedingung.FK_Parameter_ID)},\n`;
                sql += `  ${escapeSqlString(mappedBedingung.Operator)},\n`;
                
                // Erwarteter_Wert_Intern kann verschiedene Typen haben
                const erwarteterWert = mappedBedingung.Erwarteter_Wert_Intern;
                if (typeof erwarteterWert === 'boolean') {
                    sql += `  ${erwarteterWert ? 'TRUE' : 'FALSE'}\n`;
                } else if (erwarteterWert === null || erwarteterWert === undefined) {
                    sql += `  NULL\n`;
                } else {
                    sql += `  ${escapeSqlString(erwarteterWert)}\n`;
                }
                sql += `);\n`;
            });
            sql += `\n`;
        }
    });

    sql += `COMMIT;\n`;
    return sql;
}

/**
 * SQL-Generator für P4 (ErgebnisProfile)
 */
function generateSqlForP4Data() {
    const p4Data = SimONAState.methods.getResponse('p4');
    const einheitId = SimONAState.currentSimulationsEinheitID;
    
    if (!p4Data || !Array.isArray(p4Data) || p4Data.length === 0) {
        alert("Keine ErgebnisProfil-Daten (P4) vorhanden.");
        return "";
    }
    if (!einheitId) {
        alert("SimulationsEinheit_ID fehlt.");
        return "";
    }

    let sql = `-- SQL für ErgebnisProfile (basierend auf P4 Daten)\n`;
    sql += `START TRANSACTION;\n\n`;

    p4Data.forEach(profil => {
        if (!profil || typeof profil.ErgebnisProfil_ID_Referenz !== 'string' || typeof profil.Profil_Name !== 'string') {
            console.warn("Ungültiges ErgebnisProfil-Objekt übersprungen:", profil);
            return;
        }

        // Mappe P4-Daten auf DB-Felder
        const mappedProfil = MappingUtils.mapToDb(
            profil,
            SimONAConfig.fieldMapping.p4ToDb
        );

        // Spezialbehandlung für Begruendung_Dynamische_Parameter_Liste
        let dynamischeParameterSQL = 'NULL';
        if (mappedProfil.Begruendung_Dynamische_Parameter_Liste && 
            Array.isArray(profil.Begruendung_Dynamische_Parameter_Liste) && 
            profil.Begruendung_Dynamische_Parameter_Liste.length > 0) {
            dynamischeParameterSQL = escapeSqlString(
                JSON.stringify(profil.Begruendung_Dynamische_Parameter_Liste)
            );
        }

        // ErgebnisProfil INSERT
        sql += `INSERT INTO ErgebnisProfile (\n`;
        sql += `  ErgebnisProfil_ID_Referenz,\n`;
        sql += `  FK_Einheit_ID,\n`;
        sql += `  Profil_Name,\n`;
        sql += `  Entscheidungstext_Kurz_Vorlage,\n`;
        sql += `  Art_der_Entscheidung_Anzeige_Text,\n`;
        sql += `  Einleitungstext_Begruendung_Vorlage,\n`;
        sql += `  Begruendung_Dynamische_Parameter_Liste,\n`;
        sql += `  Spezifischer_Ergaenzungstext_Begruendung_Vorlage,\n`;
        sql += `  Abschlusstext_Begruendung_Vorlage\n`;
        sql += `) VALUES (\n`;
        sql += `  ${escapeSqlString(mappedProfil.ErgebnisProfil_ID_Referenz)},\n`;
        sql += `  ${escapeSqlString(einheitId)},\n`;
        sql += `  ${escapeSqlString(mappedProfil.Profil_Name)},\n`;
        sql += `  ${mappedProfil.Entscheidungstext_Kurz_Vorlage ? escapeSqlString(mappedProfil.Entscheidungstext_Kurz_Vorlage) : 'NULL'},\n`;
        sql += `  ${mappedProfil.Art_der_Entscheidung_Anzeige_Text ? escapeSqlString(mappedProfil.Art_der_Entscheidung_Anzeige_Text) : 'NULL'},\n`;
        sql += `  ${mappedProfil.Einleitungstext_Begruendung_Vorlage ? escapeSqlString(mappedProfil.Einleitungstext_Begruendung_Vorlage) : 'NULL'},\n`;
        sql += `  ${dynamischeParameterSQL},\n`;
        sql += `  ${mappedProfil.Spezifischer_Ergaenzungstext_Begruendung_Vorlage ? escapeSqlString(mappedProfil.Spezifischer_Ergaenzungstext_Begruendung_Vorlage) : 'NULL'},\n`;
        sql += `  ${mappedProfil.Abschlusstext_Begruendung_Vorlage ? escapeSqlString(mappedProfil.Abschlusstext_Begruendung_Vorlage) : 'NULL'}\n`;
        sql += `);\n\n`;
    });

    sql += `COMMIT;\n`;
    return sql;
}

/**
 * Haupt-SQL-Generierungsfunktion die alle Teile zusammenführt
 */
function generateAllSql() {
    console.log("=== Starte SQL-Generierung ===");
    
    // Validierung zuerst
    const validationResult = validateGesamtdatensatz();
    displayValidationReport(validationResult);
    
    if (!validationResult.isValid) {
        alert("SQL-Generierung abgebrochen wegen Validierungsfehlern. Details siehe Validierungsbericht.");
        return;
    }

    // SQL-Teile generieren
    let allSqlCommands = "";
    const sqlP1 = generateSqlForP1Data();
    const sqlP2 = generateSqlForP2Data();
    const sqlP4 = generateSqlForP4Data(); // P4 vor P3 wegen Fremdschlüsseln
    const sqlP3 = generateSqlForP3Data();

    if (!sqlP1 && !sqlP2 && !sqlP4 && !sqlP3) {
        alert("Keine Daten für die SQL-Generierung vorhanden.");
        return;
    }
    
    // Gesamt-Transaktion
    allSqlCommands += `-- ========================================\n`;
    allSqlCommands += `-- SimONA SQL-Export\n`;
    allSqlCommands += `-- Version: ${SimONAConfig.version}\n`;
    allSqlCommands += `-- Datum: ${new Date().toISOString()}\n`;
    allSqlCommands += `-- SimulationsEinheit: ${SimONAState.currentSimulationsEinheitID}\n`;
    allSqlCommands += `-- ========================================\n\n`;
    allSqlCommands += `START TRANSACTION;\n\n`;

    // SQL-Teile ohne ihre eigenen Transaktionen hinzufügen
    if (sqlP1) allSqlCommands += sqlP1.replace(/START TRANSACTION;\n\n|COMMIT;\n/g, '') + '\n';
    if (sqlP2) allSqlCommands += sqlP2.replace(/START TRANSACTION;\n\n|COMMIT;\n/g, '') + '\n';
    if (sqlP4) allSqlCommands += sqlP4.replace(/START TRANSACTION;\n\n|COMMIT;\n/g, '') + '\n';
    if (sqlP3) allSqlCommands += sqlP3.replace(/START TRANSACTION;\n\n|COMMIT;\n/g, '') + '\n';
    
    allSqlCommands += `-- ========================================\n`;
    allSqlCommands += `-- Ende der SQL-Generierung\n`;
    allSqlCommands += `-- ========================================\n`;
    allSqlCommands += `COMMIT;\n`;

    // SQL in Textarea anzeigen
    displayGeneratedSql(allSqlCommands.trim(), 'gesamtesSqlOutput', false);
    
    // Erfolgsmeldung mit Zusammenfassung
    const summary = validationResult.summary;
    let successMsg = "SQL-Befehle erfolgreich generiert!\n\n";
    successMsg += "Enthaltene Daten:\n";
    if (summary.hasP1) successMsg += "✓ SimulationsEinheit & Regelwerk\n";
    if (summary.hasP2) successMsg += `✓ ${SimONAState.methods.getResponse('p2').length} Parameter\n`;
    if (summary.hasP3) successMsg += `✓ ${SimONAState.methods.getResponse('p3').length} Regeln\n`;
    if (summary.hasP4) successMsg += `✓ ${SimONAState.methods.getResponse('p4').length} ErgebnisProfile\n`;
    
    alert(successMsg);
    
    console.log("=== SQL-Generierung abgeschlossen ===");
}