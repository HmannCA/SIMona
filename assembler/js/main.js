// main.js - Hauptdatei für SimONA Assembler
// Version: 2.5
// Stand: Januar 2025

// ========================================
// Utility-Funktionen
// ========================================

function getInputValue(elementId) {
    const element = document.getElementById(elementId);
    return element ? element.value.trim() : "";
}

function escapeSqlString(value) {
    if (value === null || value === undefined) return 'NULL';
    if (typeof value === 'number' || typeof value === 'boolean') {
        return value.toString();
    }
    return "'" + value.toString().replace(/'/g, "''") + "'";
}

function displayGeneratedSql(sql, targetTextareaId, append = false) {
    const targetTextarea = document.getElementById(targetTextareaId);
    if (targetTextarea) {
        if (append) {
            targetTextarea.value += (targetTextarea.value ? "\n\n" : "") + sql;
        } else {
            targetTextarea.value = sql;
        }
        // Auto-scroll nach unten
        targetTextarea.scrollTop = targetTextarea.scrollHeight;
    }
}

function copyToClipboard(elementId, buttonElement) {
    const element = document.getElementById(elementId);
    if (element) {
        element.select();
        document.execCommand('copy');
        
        const originalText = buttonElement.textContent;
        const originalBg = buttonElement.style.backgroundColor;
        buttonElement.textContent = 'Kopiert!';
        buttonElement.style.backgroundColor = '#27ae60';
        
        setTimeout(() => {
            buttonElement.textContent = originalText;
            buttonElement.style.backgroundColor = originalBg;
        }, 2000);
    }
}

function clearSqlOutput() {
    const sqlOutput = document.getElementById('gesamtesSqlOutput');
    if (sqlOutput) {
        sqlOutput.value = '';
    }
}

// ========================================
// SimulationsEinheit ID Management
// ========================================

function generateSimulationsEinheitID() {
    const gesetz = getInputValue("gesetz");
    const paragraph = getInputValue("paragraph");
    const absatz = getInputValue("absatz");
    const satz = getInputValue("satz");
    const variante = getInputValue("analyseVariante");
    
    if (!gesetz || !paragraph) {
        alert("Bitte mindestens 'Gesetz/Verordnung' und 'Paragraph' eingeben.");
        return;
    }
    
    const varianteSafe = variante || "Standard";
    if (!variante) {
        document.getElementById('analyseVariante').value = varianteSafe;
    }

    let id = `SE_${gesetz}_${paragraph}`;
    if (absatz) id += `_Abs${absatz}`;
    if (satz) id += `_S${satz}`;
    id += `__v_${varianteSafe}`;

    SimONAState.methods.setSimulationsEinheitID(id);
    document.getElementById("simulationsEinheitIDDisplay").textContent = id;
    console.log("Neue SimulationsEinheit_ID generiert:", id);
}

// ========================================
// Prompt-Generierung
// ========================================

function showPrompt(promptName) {
    console.log("showPrompt aufgerufen für:", promptName);
    
    // Spezialbehandlung für P1 bei Folgeabsätzen
    if (promptName === 'SimONA_P1_EinheitMetadaten') {
        const p1Data = SimONAState.methods.getResponse('p1');
        if (p1Data) {
            // P1 bereits vorhanden - nur anzeigen
            const outputArea = document.getElementById(promptName + '_output_area');
            if (outputArea) {
                outputArea.style.display = 'block';
                // Response Textarea readonly machen
                const responseTextarea = document.getElementById(promptName + '_response');
                if (responseTextarea) {
                    responseTextarea.readOnly = true;
                    responseTextarea.style.backgroundColor = '#f0f0f0';
                }
            }
            return;
        }
    }
    
    // Normale Verarbeitung für alle anderen Fälle
    const promptText = assemblePromptText(promptName);
    if (promptText) {
        const promptTextarea = document.getElementById(promptName + '_prompt');
        const outputArea = document.getElementById(promptName + '_output_area');
        if (promptTextarea && outputArea) {
            promptTextarea.value = promptText;
            outputArea.style.display = 'block';
            console.log("Prompt für", promptName, "angezeigt.");
        } else {
            console.error("Fehler: Textarea oder Output-Bereich für", promptName, "nicht gefunden.");
        }
    }
}

function assemblePromptText(promptName) {
    const gesetzAbk = getInputValue("gesetz");
    const paragraphNum = getInputValue("paragraph"); 
    const absatzNum = getInputValue("absatz") || "1";
    const satzNum = getInputValue("satz");
    const quelleUrl = getInputValue("quelle") || "Keine URL angegeben";
    
    // KORREKTUR: Für P0.5 das richtige Feld verwenden
    let normtextAuszug;
    if (promptName === 'SimONA_P0_5_ParagraphAnalyse') {
        normtextAuszug = getInputValue("vollstaendigerParagraphentext");
    } else {
        normtextAuszug = getInputValue("normtext");
    }
    
    let normteilBezeichnung = `§ ${paragraphNum}`;
    if (absatzNum) normteilBezeichnung += ` Abs. ${absatzNum}`;
    if (satzNum) normteilBezeichnung += ` Satz ${satzNum}`;
    
    return preparePromptWithReplacements(
        promptName, gesetzAbk, normteilBezeichnung, 
        quelleUrl, normtextAuszug, paragraphNum, absatzNum
    );
}

function preparePromptWithReplacements(promptName, gesetzAbk, normteilBezeichnung, quelleUrl, normtextAuszug, paragraphNum, absatzNum) {
    const einheitId = SimONAState.currentSimulationsEinheitID;
    
    // Validierung
    if (!einheitId && !['SimONA_Priming_Systemanweisung', 'SimONA_P1_EinheitMetadaten', 'SimONA_P0_5_ParagraphAnalyse'].includes(promptName)) {
        alert("Bitte zuerst eine SimulationsEinheit_ID generieren (Schritt 0).");
        return null;
    }
    
    // KORREKTUR: P0.5 zur Ausnahmeliste hinzufügen
    if (!normtextAuszug && !['SimONA_Priming_Systemanweisung', 'SimONA_P0_5_ParagraphAnalyse'].includes(promptName)) {
        alert("Bitte den 'Exakter Wortlaut des zu analysierenden Normteils' eingeben.");
        return null;
    }
    
    // Spezielle Validierung für P0.5
    if (promptName === 'SimONA_P0_5_ParagraphAnalyse' && !normtextAuszug) {
        alert("Bitte den vollständigen Paragraphentext (inkl. Überschriften) eingeben.");
        return null;
    }

    let template = promptTemplates[promptName];
    if (!template) {
        alert("Prompt-Vorlage nicht gefunden: " + promptName);
        return null;
    }

    // Basis-Platzhalter ersetzen
    template = template
        .replace(/{{GESETZ_ABK}}/g, gesetzAbk)
        .replace(/{{NORMTEIL_BEZEICHNUNG}}/g, normteilBezeichnung)
        .replace(/{{QUELLE_URL}}/g, quelleUrl)
        .replace(/{{NORMTEXT_AUSZUG}}/g, normtextAuszug)
        .replace(/{{VOLLSTAENDIGER_PARAGRAPHENTEXT_INKL_UEBERSCHRIFTEN}}/g, normtextAuszug)
        .replace(/{{PARA_NUM}}/g, paragraphNum)
        .replace(/{{ABS_NUM}}/g, absatzNum)
        .replace(/{{SIM_EINHEIT_ID}}/g, einheitId);
    
    // Spezifische Ersetzungen basierend auf State-Daten
    try {
        const p1Data = SimONAState.methods.getResponse('p1');
        const p2Data = SimONAState.methods.getResponse('p2');
        const p2_5Data = SimONAState.methods.getResponse('p2_5');
        const p3Data = SimONAState.methods.getResponse('p3');
        
        if (promptName === 'SimONA_P2_ParameterExtraktion') {
            if (p1Data && p1Data.Gesetzestext_Zitat_Analysierter_Teil) {
                template = template.replace(/{{NORMTEXT_P1_ZITAT}}/g, 
                    JSON.stringify(p1Data.Gesetzestext_Zitat_Analysierter_Teil).slice(1,-1));
            } else {
                alert("Antwort von SimONA_P1_EinheitMetadaten wird für P2 benötigt.");
                return null;
            }
        } else if (promptName === 'SimONA_P2_7_ParameterKonklusionDetail') {
            if (!p1Data || !p2Data) {
                alert("Antworten von P1 und P2 werden für P2.7 benötigt.");
                return null;
            }
            template = template
                .replace(/{{P1_RESPONSE_JSON_STRING}}/g, JSON.stringify(p1Data, null, 2))
                .replace(/{{P2_RESPONSE_JSON_STRING}}/g, JSON.stringify(p2Data, null, 2));
        } else if (promptName === 'SimONA_P2_5_ErgebnisProfilVorschlaege') {
            if (!p1Data || !p2Data) {
                alert("Antworten von P1 und P2 werden für P2.5 benötigt.");
                return null;
            }
            template = template
                .replace(/{{P1_RESPONSE_JSON_STRING}}/g, JSON.stringify(p1Data, null, 2))
                .replace(/{{P2_RESPONSE_JSON_STRING}}/g, JSON.stringify(p2Data, null, 2));
        } else if (promptName === 'SimONA_P3_RegelGenerierung') {
            if (!p2Data) {
                alert("P2-Parameterdaten werden für P3 benötigt.");
                return null;
            }
            if (!p2_5Data || p2_5Data.length === 0) {
                alert("Validierte ErgebnisProfil-Vorschläge aus P2.5 werden für P3 benötigt. Bitte erst P2.5 ausführen und Vorschläge validieren.");
                return null;
            }
            template = template
                .replace(/{{P2_RESPONSE_JSON_STRING}}/g, JSON.stringify(p2Data, null, 2))
                .replace(/{{P2_5_RESPONSE_JSON_STRING_VALIDATED}}/g, JSON.stringify(p2_5Data, null, 2));
        } else if (promptName === 'SimONA_P4_ErgebnisProfilDetails') {
            if (!p1Data || !p2Data) {
                alert("Antworten von P1 und P2 werden für P4 benötigt.");
                return null;
            }
            
            let ergebnisProfileIds = [];
            if (p3Data && Array.isArray(p3Data)) {
                const uniqueIds = new Set();
                p3Data.forEach(regel => {
                    if (regel.FK_ErgebnisProfil_ID_Referenz) {
                        uniqueIds.add(regel.FK_ErgebnisProfil_ID_Referenz);
                    }
                });
                ergebnisProfileIds = Array.from(uniqueIds);
            } else if (p2_5Data && p2_5Data.length > 0) {
                ergebnisProfileIds = p2_5Data.map(v => v.Vorgeschlagene_ErgebnisProfil_ID_Referenz);
            } else {
                alert("Weder P3-Regeln noch validierte P2.5-Vorschläge vorhanden. Bitte zuerst P3 oder P2.5 ausführen.");
                return null;
            }
            
            template = template
                .replace(/{{P1_RESPONSE_JSON_STRING}}/g, JSON.stringify(p1Data, null, 2))
                .replace(/{{P2_RESPONSE_JSON_STRING}}/g, JSON.stringify(p2Data, null, 2))
                .replace(/{{P3_ERGEBNISPROFILE_IDS_USED_LIST_JSON}}/g, JSON.stringify(ergebnisProfileIds, null, 2));
        }
    } catch (e) {
        alert("Fehler beim Aufbereiten der Daten für den Prompt: " + e.message);
        return null;
    }
    
    return template;
}

// ========================================
// UI-Hilfsfunktionen
// ========================================

function clearAllTextareasAndSuggestions() {
    // State zurücksetzen
    SimONAState.methods.reset();
    
    // UI zurücksetzen
    const promptPrefixes = [
        'SimONA_P1_EinheitMetadaten',
        'SimONA_P2_ParameterExtraktion', 
        'SimONA_P2_7_ParameterKonklusionDetail',
        'SimONA_P2_5_ErgebnisProfilVorschlaege',
        'SimONA_P3_RegelGenerierung',
        'SimONA_P4_ErgebnisProfilDetails',
        'SimONA_P5_QualitaetsAudit'
    ];

    promptPrefixes.forEach(prefix => {
        const outputArea = document.getElementById(`${prefix}_output_area`);
        if (outputArea) outputArea.style.display = 'none';
        
        const promptTextarea = document.getElementById(`${prefix}_prompt`);
        if (promptTextarea) promptTextarea.value = '';
        
        const responseTextarea = document.getElementById(`${prefix}_response`);
        if (responseTextarea) responseTextarea.value = '';
    });

    // P2.5 Editor zurücksetzen
    const suggestionsEditorArea = document.getElementById('p2_5_suggestions_editor_area');
    if (suggestionsEditorArea) suggestionsEditorArea.innerHTML = '';
    
    const addNewSuggestionArea = document.getElementById('p2_5_add_new_suggestion_area');
    if (addNewSuggestionArea) addNewSuggestionArea.style.display = 'none';

    // SQL-Output leeren
    const sqlOutput = document.getElementById('gesamtesSqlOutput');
    if (sqlOutput) sqlOutput.value = '';

    // Navigation Footer ausblenden
    const navFooter = document.getElementById('navigation-footer');
    if (navFooter) navFooter.style.display = 'none';

    console.log("Alle UI-Bereiche wurden zurückgesetzt.");
}

// ========================================
// Debug-Funktionen
// ========================================

function debugP2Data() {
    const p2Data = SimONAState.methods.getResponse('p2');
    if (!p2Data) {
        console.log("Keine P2-Daten vorhanden");
        return;
    }
    
    console.log("=== P2 Response Data Debug ===");
    console.log("Anzahl Parameter:", p2Data.length);
    
    if (p2Data.length > 0) {
        console.log("Struktur des ersten Parameters:");
        console.log(JSON.stringify(p2Data[0], null, 2));
        console.log("\nAlle verfügbaren Felder im ersten Parameter:");
        console.log(Object.keys(p2Data[0]));
    }
}

// ========================================
// P2.7 Merge
// ========================================

function mergeP2_7Data() {
    try {
        const mergeCount = SimONAState.methods.mergeP2_7IntoP2();
        alert(`P2.7 Konklusionsdaten wurden erfolgreich integriert.\n${mergeCount} Parameter wurden mit Konklusionsinformationen erweitert.`);
    } catch (error) {
        alert(error.message);
    }
}

// ========================================
// P5 Audit-Funktionen
// ========================================

function assembleAndShowP5AuditPrompt() {
    console.log("Generiere P5 Qualitäts-Audit Prompt...");
    
    const p1Data = SimONAState.methods.getResponse('p1');
    const p2Data = SimONAState.methods.getResponse('p2');
    const p3Data = SimONAState.methods.getResponse('p3');
    const p4Data = SimONAState.methods.getResponse('p4');
    
    if (!p1Data || !p2Data || !p3Data || !p4Data) {
        alert("Für das Qualitäts-Audit müssen alle Daten (P1-P4) vorhanden sein.");
        return;
    }

    const validationResult = validateGesamtdatensatz();
    if (!validationResult.isValid) {
        alert("Bitte beheben Sie zuerst die Fehler aus der technischen Validierung.");
        displayValidationReport(validationResult);
        return;
    }

    const gesamtdatensatz = {
        SimulationsEinheit_Metadaten: p1Data,
        Parameter_Liste: p2Data,
        Regelwerk: p3Data,
        ErgebnisProfile: p4Data
    };
    
    const gesamtdatensatzJsonString = JSON.stringify(gesamtdatensatz, null, 2);

    let template = promptTemplates['SimONA_P5_QualitaetsAudit'];
    if (!template) {
        alert("Prompt-Vorlage für SimONA_P5_QualitaetsAudit nicht gefunden.");
        return;
    }

    const normtextAuszug = getInputValue("normtext");
    template = template
        .replace(/{{NORMTEXT_AUSZUG}}/g, normtextAuszug)
        .replace(/{{P1_P4_DATENSATZ_JSON}}/g, gesamtdatensatzJsonString);

    const promptTextarea = document.getElementById('SimONA_P5_QualitaetsAudit_prompt');
    const outputArea = document.getElementById('SimONA_P5_QualitaetsAudit_output_area');

    if (promptTextarea && outputArea) {
        promptTextarea.value = template;
        outputArea.style.display = 'block';
        console.log("Prompt für P5 Qualitäts-Audit erfolgreich generiert.");
    }
}

function saveP5AuditResult() {
    console.log("Speichere P5 Audit-Ergebnis...");

    const auditResponseText = getInputValue('SimONA_P5_QualitaetsAudit_response');
    if (!auditResponseText) {
        alert("Fehler: Das Antwortfeld für das Audit ist leer.");
        return;
    }

    let auditData;
    try {
        auditData = JSON.parse(auditResponseText);
    } catch (e) {
        alert("Fehler: Die Audit-Antwort ist kein valides JSON.");
        return;
    }

    const auditDate = new Date().toISOString();
    const einheitId = SimONAState.currentSimulationsEinheitID;
    
    let sql = `-- SQL für QualitaetsAudit (basierend auf P5 Audit)\n`;
    sql += `START TRANSACTION;\n\n`;
    sql += `INSERT INTO QualitaetsAudits (\n`;
    sql += `  FK_Einheit_ID, Audit_Timestamp, Gesamtscore, Gesamtfazit,\n`;
    sql += `  P5_Prompt_Text, P5_Response_JSON\n`;
    sql += `) VALUES (\n`;
    sql += `  ${escapeSqlString(einheitId)},\n`;
    sql += `  ${escapeSqlString(auditDate)},\n`;
    sql += `  ${auditData.Gesamtbewertung?.Score || 'NULL'},\n`;
    sql += `  ${escapeSqlString(auditData.Gesamtbewertung?.Fazit || '')},\n`;
    sql += `  ${escapeSqlString(document.getElementById('SimONA_P5_QualitaetsAudit_prompt').value)},\n`;
    sql += `  ${escapeSqlString(JSON.stringify(auditData))}\n`;
    sql += `);\n\n`;
    
    // Detailbewertungen
    const auditId = 'LAST_INSERT_ID()';
    if (auditData.Detailbewertungen && Array.isArray(auditData.Detailbewertungen)) {
        auditData.Detailbewertungen.forEach(detail => {
            sql += `INSERT INTO QualitaetsAudit_Detailbewertungen (\n`;
            sql += `  FK_AuditID, Kategorie, Score, Begruendung\n`;
            sql += `) VALUES (\n`;
            sql += `  ${auditId},\n`;
            sql += `  ${escapeSqlString(detail.Kategorie || '')},\n`;
            sql += `  ${detail.Score || 'NULL'},\n`;
            sql += `  ${escapeSqlString(detail.Begruendung || '')}\n`;
            sql += `);\n`;
        });
    }
    
    sql += `\nCOMMIT;\n`;

    displayGeneratedSql(sql, 'gesamtesSqlOutput', true);
    alert("P5 Audit-Ergebnis wurde als SQL generiert und dem Gesamtausgabefeld hinzugefügt.");
}

// ========================================
// Re-Audit Workflow (falls benötigt)
// ========================================

function checkForAndLoadReAuditData() {
    const einheitIdToLoad = localStorage.getItem('simona_reaudit_id');

    if (einheitIdToLoad) {
        localStorage.removeItem('simona_reaudit_id');
        console.log(`Re-Audit Modus gestartet. Lade Daten für: ${einheitIdToLoad}`);
        
        // UI deaktivieren während des Ladens
        document.querySelectorAll('input, textarea, button').forEach(el => el.disabled = true);

        // Hier würden die Daten aus der Datenbank geladen
        // Placeholder für echte Implementation
        setTimeout(() => {
            alert(`Daten für ${einheitIdToLoad} wurden geladen. (Simulation)`);
            
            // Banner anzeigen
            const banner = document.getElementById('status-banner');
            if (banner) {
                banner.innerHTML = `RE-AUDIT MODUS: Daten für <strong>${einheitIdToLoad}</strong> geladen.`;
                banner.style.display = 'block';
            }

            // Zu Schritt 6.5 scrollen
            const step65 = document.getElementById('step-6-5');
            if (step65) step65.scrollIntoView({ behavior: 'smooth', block: 'start' });

            // UI wieder aktivieren
            document.querySelectorAll('input, textarea, button').forEach(el => el.disabled = false);
        }, 1000);
    }
}

// ========================================
// Initialisierung
// ========================================

window.addEventListener('DOMContentLoaded', function() {
    // ID generieren falls Daten vorhanden
    if(getInputValue("gesetz") && getInputValue("paragraph")) {
        generateSimulationsEinheitID();
    }
    
    // Re-Audit prüfen
    checkForAndLoadReAuditData();
    
    console.log("SimONA Assembler v2.5 initialisiert");
});

// ========================================
// Globale Funktionen exportieren
// ========================================

// Diese müssen global verfügbar sein für onclick-Handler in HTML
window.generateSimulationsEinheitID = generateSimulationsEinheitID;
window.showPrompt = showPrompt;
window.copyToClipboard = copyToClipboard;
window.clearSqlOutput = clearSqlOutput;
window.debugP2Data = debugP2Data;
window.mergeP2_7Data = mergeP2_7Data;
window.assembleAndShowP5AuditPrompt = assembleAndShowP5AuditPrompt;
window.saveP5AuditResult = saveP5AuditResult;
window.generateAllSql = generateAllSql;