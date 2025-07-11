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
// Erweiterte SimulationsEinheit ID Management mit Prompt-Versionen
// ========================================

/**
 * Generiert eine SimulationsEinheit_ID inklusive Prompt-Version
 */
function generateSimulationsEinheitID(promptVersion = null) {
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

    // Prompt-Version bestimmen - direkt vom Radio-Button lesen
    let currentPromptVersion = promptVersion;
    if (!currentPromptVersion) {
        // Hole den aktuell gewählten Radio-Button
        const selectedRadio = document.querySelector('input[name="promptVersion"]:checked');
        if (selectedRadio) {
            currentPromptVersion = selectedRadio.value;
        } else if (typeof PromptManager !== 'undefined') {
            currentPromptVersion = PromptManager.getCurrentVersion().version;
        } else {
            currentPromptVersion = 'v1';
        }
    }

    // ID zusammenbauen
    let id = `SE_${gesetz}_${paragraph}`;
    if (absatz) id += `_Abs${absatz}`;
    if (satz) id += `_S${satz}`;
    id += `__v_${varianteSafe}`;
    id += `__P${currentPromptVersion.replace('.', '_')}`; // v2.5 wird zu P2_5

    SimONAState.methods.setSimulationsEinheitID(id);
    document.getElementById("simulationsEinheitIDDisplay").textContent = id;
    
    // Prüfe auf existierende Versionen
    checkExistingVersions(gesetz, paragraph, absatz, satz, varianteSafe);
    
    console.log("Neue SimulationsEinheit_ID generiert:", id);
}

/**
 * Prüft und zeigt existierende Prompt-Versionen an
 */
function checkExistingVersions(gesetz, paragraph, absatz, satz, variante) {
    // Diese Funktion würde normalerweise eine DB-Abfrage machen
    // Für jetzt simulieren wir es mit localStorage oder zeigen nur Info
    
    const basePattern = `SE_${gesetz}_${paragraph}`;
    const fullPattern = basePattern + (absatz ? `_Abs${absatz}` : '') + (satz ? `_S${satz}` : '') + `__v_${variante}`;
    
    // Simuliere existierende Versionen (später echte DB-Abfrage)
    const mockExistingVersions = [
        // Diese würden aus der DB kommen
        // `${fullPattern}__Pv1`,
        // `${fullPattern}__Pv2_5`
    ];
    
    displayVersionManagement(fullPattern, mockExistingVersions);
}

/**
 * Zeigt das Versions-Management Interface
 */
function displayVersionManagement(baseId, existingVersions) {
    let versionContainer = document.getElementById('version-management-container');
    
    if (!versionContainer) {
        // Container erstellen wenn nicht vorhanden
        const step0 = document.getElementById('step-0');
        versionContainer = document.createElement('div');
        versionContainer.id = 'version-management-container';
        versionContainer.className = 'step-section';
        versionContainer.style.cssText = 'background-color: #f0f8ff; border-left: 4px solid #4169e1;';
        step0.parentNode.insertBefore(versionContainer, step0.nextSibling);
    }
    
    let html = '<h3 style="color: #4169e1; margin-top: 0;">🔄 Prompt-Versions-Management</h3>';
    
    if (existingVersions.length > 0) {
        html += '<p><strong>Existierende Versionen für diesen Paragraphen:</strong></p>';
        html += '<ul>';
        existingVersions.forEach(version => {
            const promptVersion = version.split('__P')[1]?.replace('_', '.');
            html += `<li>${version} <em>(Prompt ${promptVersion})</em> 
                     <button onclick="loadExistingVersion('${version}')" style="margin-left: 10px; font-size: 0.8em;">Laden</button>
                     </li>`;
        });
        html += '</ul>';
        
        html += `<div style="margin: 15px 0; padding: 10px; background-color: #fff3cd; border-radius: 4px;">
            <strong>⚠️ Hinweis:</strong> Sie können eine neue Prompt-Version erstellen oder eine bestehende überschreiben.
        </div>`;
    } else {
        html += '<p style="color: #666;">Noch keine Versionen für diesen Paragraphen vorhanden.</p>';
    }
    
    // Aktuelle Prompt-Version anzeigen
    const currentPromptVersion = typeof PromptManager !== 'undefined' ? 
        PromptManager.getCurrentVersion().version : 'v1';
    
    html += `<div style="margin-top: 15px; padding: 10px; background-color: #e8f5e9; border-radius: 4px;">
        <strong>Aktuelle Konfiguration:</strong><br>
        📝 Prompt-Version: <strong>${currentPromptVersion}</strong><br>
        🆔 Generierte ID: <strong>${SimONAState.currentSimulationsEinheitID}</strong>
    </div>`;
    
    // Action-Buttons
    html += `<div style="margin-top: 15px;">
        <button onclick="proceedWithCurrentVersion()" style="background-color: #28a745; margin-right: 10px;">
            ✅ Mit aktueller Konfiguration fortfahren
        </button>
        <button onclick="showVersionSelector()" style="background-color: #17a2b8;">
            🔄 Andere Version laden/erstellen
        </button>
    </div>`;
    
    versionContainer.innerHTML = html;
    versionContainer.style.display = 'block';
}

/**
 * Lädt eine existierende Version
 */
function loadExistingVersion(versionId) {
    // Hier würde normalerweise die komplette Analyse aus der DB geladen
    alert(`Funktion zum Laden von "${versionId}" wird implementiert.\n\nDies würde alle P1-P4 Daten aus der Datenbank laden.`);
    
    // Setze die ID
    SimONAState.methods.setSimulationsEinheitID(versionId);
    document.getElementById("simulationsEinheitIDDisplay").textContent = versionId;
    
    // TODO: Hier echte DB-Abfrage implementieren
    // loadAnalysisDataFromDatabase(versionId);
}

/**
 * Setzt mit der aktuellen Version fort
 */
function proceedWithCurrentVersion() {
    document.getElementById('version-management-container').style.display = 'none';
    console.log("Fortfahren mit:", SimONAState.currentSimulationsEinheitID);
}

/**
 * Zeigt erweiterte Versions-Auswahl
 */
function showVersionSelector() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background-color: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center;
        z-index: 1000;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background-color: white; padding: 20px; border-radius: 8px;
        max-width: 500px; width: 90%;
    `;
    
    content.innerHTML = `
        <h3>Versions-Auswahl</h3>
        <p>Wählen Sie, wie Sie fortfahren möchten:</p>
        
        <button onclick="createNewVersion(); this.parentElement.parentElement.remove();" 
                style="width: 100%; margin: 5px 0; padding: 10px; background-color: #28a745; color: white; border: none; border-radius: 4px;">
            🆕 Neue Prompt-Version erstellen
        </button>
        
        <button onclick="overwriteExisting(); this.parentElement.parentElement.remove();" 
                style="width: 100%; margin: 5px 0; padding: 10px; background-color: #ffc107; color: black; border: none; border-radius: 4px;">
            📝 Bestehende Version überschreiben
        </button>
        
        <button onclick="this.parentElement.parentElement.remove();" 
                style="width: 100%; margin: 5px 0; padding: 10px; background-color: #6c757d; color: white; border: none; border-radius: 4px;">
            ❌ Abbrechen
        </button>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
}

/**
 * Erstellt eine neue Version
 */
function createNewVersion() {
    // Neue ID mit aktueller Prompt-Version generieren
    generateSimulationsEinheitID();
    proceedWithCurrentVersion();
}

/**
 * Überschreibt bestehende Version
 */
function overwriteExisting() {
    if (confirm("Sind Sie sicher, dass Sie die bestehende Version überschreiben möchten?\n\nAlle vorherigen Daten gehen verloren!")) {
        proceedWithCurrentVersion();
    }
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

// ========================================
// Erweiterte preparePromptWithReplacements Funktion
// ========================================

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

    // NEUE LOGIK: Prompt-Template aus der aktuell gewählten Version holen
    let template = promptTemplates[promptName];
    if (!template) {
        alert("Prompt-Vorlage nicht gefunden: " + promptName);
        return null;
    }

    // DEBUG: Info über verwendete Prompt-Version (nur in Console)
    if (typeof PromptManager !== 'undefined') {
        const versionInfo = PromptManager.getCurrentVersion();
        console.log(`🔧 Prompt "${promptName}" generiert mit Version: ${versionInfo.version} (${versionInfo.name})`);
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
// Neue Debug- und Info-Funktionen
// ========================================

/**
 * Zeigt Info über die aktuelle Prompt-Version
 */
function showPromptVersionInfo() {
    if (typeof PromptManager !== 'undefined') {
        const current = PromptManager.getCurrentVersion();
        const available = PromptManager.getAvailableVersions();
        
        let infoMsg = `Aktuelle Prompt-Version: ${current.name} (${current.version})\n`;
        infoMsg += `Beschreibung: ${current.description}\n\n`;
        infoMsg += `Verfügbare Versionen: ${available.join(', ')}\n\n`;
        infoMsg += `Geladene Prompt-Templates: ${Object.keys(promptTemplates).length}`;
        
        alert(infoMsg);
    } else {
        alert("PromptManager nicht verfügbar.");
    }
}

/**
 * Debug-Funktion für Prompt-System (mit UI-Feedback)
 */
function debugPromptSystem() {
    console.log("=== Prompt-System Debug ===");
    
    let debugInfo = "=== PROMPT-SYSTEM DEBUG ===\n\n";
    
    if (typeof PromptManager !== 'undefined') {
        PromptManager.debug(); // Console-Ausgabe
        
        const current = PromptManager.getCurrentVersion();
        const available = PromptManager.getAvailableVersions();
        
        debugInfo += `Aktuelle Version: ${current.version} (${current.name})\n`;
        debugInfo += `Verfügbare Versionen: ${available.join(', ')}\n`;
        debugInfo += `Geladene Templates: ${Object.keys(promptTemplates || {}).length}\n`;
        debugInfo += `Bereits generiert: ${PromptManager.hasGeneratedPrompts() ? 'Ja' : 'Nein'}\n\n`;
    } else {
        debugInfo += "PromptManager: NICHT VERFÜGBAR\n\n";
        console.log("PromptManager nicht verfügbar");
    }
    
    // State-Informationen
    if (typeof SimONAState !== 'undefined') {
        debugInfo += `SimONA State:\n`;
        debugInfo += `- Einheit ID: ${SimONAState.currentSimulationsEinheitID || 'Nicht gesetzt'}\n`;
        debugInfo += `- Prompt Version: ${SimONAState.ui?.selectedPromptVersion || 'Unbekannt'}\n`;
        debugInfo += `- P1 Data: ${SimONAState.methods.getResponse('p1') ? 'Vorhanden' : 'Fehlt'}\n`;
        debugInfo += `- P2 Data: ${SimONAState.methods.getResponse('p2') ? 'Vorhanden' : 'Fehlt'}\n`;
        debugInfo += `- P3 Data: ${SimONAState.methods.getResponse('p3') ? 'Vorhanden' : 'Fehlt'}\n`;
        debugInfo += `- P4 Data: ${SimONAState.methods.getResponse('p4') ? 'Vorhanden' : 'Fehlt'}\n\n`;
    }
    
    // Prompt-Templates
    debugInfo += `Template-Namen:\n${Object.keys(promptTemplates || {}).map(name => `- ${name}`).join('\n')}\n\n`;
    
    // Browser-Info
    debugInfo += `Browser: ${navigator.userAgent.split(') ')[0]})\n`;
    debugInfo += `Zeitpunkt: ${new Date().toLocaleString()}\n`;
    
    // Zeige Debug-Info sowohl in Console als auch als Alert
    console.log("Globale promptTemplates:", Object.keys(promptTemplates || {}));
    console.log("SimONA State UI:", SimONAState?.ui?.selectedPromptVersion);
    
    // UI-Feedback mit scrollbarem Alert
    alert(debugInfo);
    
    // Zusätzlich: Kurzes visuelles Feedback am Button
    const button = event.target;
    const originalText = button.innerHTML;
    const originalBg = button.style.backgroundColor;
    
    button.innerHTML = '✓ Debug-Info gezeigt';
    button.style.backgroundColor = '#27ae60';
    
    setTimeout(() => {
        button.innerHTML = originalText;
        button.style.backgroundColor = originalBg;
    }, 2000);
}

// Globale Funktionen exportieren  
window.showPromptVersionInfo = showPromptVersionInfo;
window.debugPromptSystem = debugPromptSystem;

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
    
    // Prüfe ob bereits SQL-Daten vorhanden sind
    const existingSql = document.getElementById('gesamtesSqlOutput').value;
    const hasExistingData = existingSql.includes('START TRANSACTION') && !existingSql.includes('COMMIT');
    
    let sql = '';
    
    if (!hasExistingData) {
        // Wenn keine bestehende Transaktion, starte eine neue
        sql += `-- SQL für QualitaetsAudit (eigenständige Transaktion)\n`;
        sql += `START TRANSACTION;\n\n`;
    } else {
        // Wenn bestehende Transaktion vorhanden, füge nur Audit-Teil hinzu
        sql += `-- SQL für QualitaetsAudit (Teil der bestehenden Transaktion)\n`;
    }
    
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
    
    // Variable für AuditID setzen (phpMyAdmin-kompatibel)
    sql += `SET @audit_id = LAST_INSERT_ID();\n\n`;
    
    // Alternative: Direkter SELECT für maximale Kompatibilität
    sql += `-- Alternative für phpMyAdmin:\n`;
    sql += `-- SET @audit_id = (SELECT MAX(AuditID) FROM QualitaetsAudits WHERE FK_Einheit_ID = ${escapeSqlString(einheitId)});\n\n`;
    
    // Detailbewertungen mit Variable
    if (auditData.Detailbewertungen && Array.isArray(auditData.Detailbewertungen)) {
        auditData.Detailbewertungen.forEach(detail => {
            sql += `INSERT INTO QualitaetsAudit_Detailbewertungen (\n`;
            sql += `  FK_AuditID, Kategorie, Score, Begruendung\n`;
            sql += `) VALUES (\n`;
            sql += `  @audit_id,  -- Variable statt LAST_INSERT_ID()\n`;
            sql += `  ${escapeSqlString(detail.Kategorie || '')},\n`;
            sql += `  ${detail.Score || 'NULL'},\n`;
            sql += `  ${escapeSqlString(detail.Begruendung || '')}\n`;
            sql += `);\n`;
        });
        sql += `\n`;
    }
    
    // COMMIT nur wenn es eine eigenständige Transaktion ist
    sql += `COMMIT;\n`;

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
// Erweiterte Versions-Management Funktionen
// ========================================

/**
 * Erweiterte generateSimulationsEinheitID mit Versions-Check
 */
function generateSimulationsEinheitIDWithVersionCheck() {
    const gesetz = getInputValue("gesetz");
    const paragraph = getInputValue("paragraph");
    const absatz = getInputValue("absatz");
    const satz = getInputValue("satz");
    
    if (!gesetz || !paragraph) {
        alert("Bitte mindestens 'Gesetz/Verordnung' und 'Paragraph' eingeben.");
        return;
    }
    
    // Erst normale ID generieren
    generateSimulationsEinheitID();
    
    // Dann Versions-Übersicht anzeigen
    showVersionOverview(gesetz, paragraph, absatz, satz);
}

/**
 * Zeigt Übersicht existierender Versionen
 */
function showVersionOverview(gesetz, paragraph, absatz, satz) {
    // Lade echte Versionen aus der Datenbank
    const params = new URLSearchParams({
        gesetz: gesetz,
        paragraph: paragraph
    });
    
    if (absatz) params.append('absatz', absatz);
    if (satz) params.append('satz', satz);
    
    // Zeige Lade-Indikator
    const overviewDiv = document.getElementById('version-overview');
    const listDiv = document.getElementById('existing-versions-list');
    listDiv.innerHTML = '<p style="text-align: center;"><em>Lade Versionen...</em></p>';
    overviewDiv.style.display = 'block';
    
    // API-Aufruf
    fetch('get_versions.php?' + params.toString())
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            throw new Error(data.message || 'Fehler beim Laden der Versionen');
        }
        
        const versions = data.versions || [];
        
        if (versions.length > 0) {
            let html = '<h4>Gefundene Analysen:</h4>';
            html += '<div style="display: grid; grid-template-columns: auto 2fr 1fr 1fr auto; gap: 10px; align-items: center; font-weight: bold; padding: 10px; background-color: #e9ecef; margin-bottom: 10px;">';
            html += '<div>Vers.</div><div>Norm Bezeichnung</div><div>Zuletzt geändert</div><div>Qualitäts-Score</div><div>Aktionen</div>';
            html += '</div>';
            
            versions.forEach(version => {
                // Extrahiere die Teile aus der ID für die Anzeige
                const idParts = version.id.match(/SE_([^_]+)_(\d+)(?:_Abs(\d+))?(?:_S(\d+))?/);
                const gesetz = idParts ? idParts[1] : '';
                const paragraph = idParts ? idParts[2] : '';
                const absatz = idParts ? idParts[3] : '';
                const satz = idParts ? idParts[4] : '';
                
                // Baue die Norm-Bezeichnung
                let normBezeichnung = `§ ${paragraph}`;
                if (absatz) normBezeichnung += ` Abs. ${absatz}`;
                if (satz) normBezeichnung += ` S. ${satz}`;
                normBezeichnung += ` ${gesetz}`;
                if (version.paragraphBezeichnung) {
                    normBezeichnung += ` - ${version.paragraphBezeichnung}`;
                }
                
                html += '<div style="display: grid; grid-template-columns: auto 2fr 1fr 1fr auto; gap: 10px; align-items: center; padding: 8px; border-bottom: 1px solid #dee2e6;">';
                
                // Prompt-Version
                html += `<div><span style="background-color: ${getVersionColor(version.promptVersion)}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.8em;">${version.promptVersion}</span></div>`;
                
                // Norm-Bezeichnung
                html += `<div style="font-weight: 500;">${normBezeichnung}</div>`;
                
                // Datum
                html += `<div style="font-size: 0.9em; text-align:right">${version.created}</div>`;
                
                // Qualitäts-Score
                html += `<div style="text-align: center;">`;
                if (version.qualityScore) {
                    html += `<span style="color: ${getScoreColor(version.qualityScore)}; font-weight: bold;">${version.qualityScore}/10</span>`;
                } else {
                    html += '<span style="color: #6c757d;">Kein Audit</span>';
                }
                html += `</div>`;
                
                // Aktionen
                html += `<div style="white-space: nowrap;">`;
                html += `<button onclick="loadVersion('${version.id}')" style="font-size: 0.8em; margin-right: 5px; background-color: #28a745;">📂 Laden</button>`;
                html += `<button onclick="showVersionDetails('${version.id}', ${JSON.stringify(version).replace(/"/g, '&quot;')})" style="font-size: 0.8em; background-color: #17a2b8;">ℹ️ Details</button>`;
                html += `</div>`;
                
                html += '</div>';
            });
            
            html += `<div style="margin-top: 15px; padding: 10px; background-color: #e3f2fd; border-radius: 4px;">
                <strong>💡 Tipp:</strong> Sie können mehrere Prompt-Versionen parallel erstellen und später im Frontend vergleichen.
            </div>`;
            
            listDiv.innerHTML = html;
        } else {
            listDiv.innerHTML = '<p style="color: #666; font-style: italic;">Noch keine Analysen für diesen Paragraphen vorhanden. Sie erstellen die erste Version!</p>';
        }
    })
    .catch(error => {
        console.error('Fehler beim Laden der Versionen:', error);
        listDiv.innerHTML = `<p style="color: #e74c3c;">Fehler beim Laden der Versionen: ${error.message}</p>`;
    });
}

/**
 * Lädt eine existierende Version
 */
function loadVersion(versionId) {
    if (!confirm(`Möchten Sie die Version "${versionId}" laden?\n\nDie aktuellen Daten gehen verloren.`)) {
        return;
    }
    
    // UI-Feedback
    const button = event.target;
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = 'Lade...';
    
    // Lade Daten aus der Datenbank
    fetch('load_analysis.php?einheitId=' + encodeURIComponent(versionId))
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            throw new Error(data.message || 'Fehler beim Laden der Analyse');
        }
        
        const analysis = data.analysis;
        
        // 1. State zurücksetzen
        SimONAState.methods.reset();
        
        // 2. SimulationsEinheit_ID setzen
        SimONAState.methods.setSimulationsEinheitID(versionId);
        document.getElementById("simulationsEinheitIDDisplay").textContent = versionId;
        
        // 3. Prompt-Version aus ID extrahieren und setzen
        const promptVersion = analysis.meta.prompt_version || extractPromptVersionFromId(versionId);
        if (typeof PromptManager !== 'undefined') {
            // Radio-Button setzen
            const radio = document.querySelector(`input[name="promptVersion"][value="${promptVersion}"]`);
            if (radio) radio.checked = true;
            PromptManager.setVersion(promptVersion);
        }
        
        // 4. Basis-Felder ausfüllen
        document.getElementById('gesetz').value = analysis.p1.Gesetz || '';
        document.getElementById('paragraph').value = analysis.p1.Paragraph || '';
        document.getElementById('absatz').value = analysis.p1.Absatz || '';
        document.getElementById('satz').value = analysis.p1.Satz || '';
        document.getElementById('normtext').value = analysis.p1.Gesetzestext_Zitat_Analysierter_Teil || '';
        
        // 5. P1-P4 Daten in State speichern
        SimONAState.methods.setResponse('p1', analysis.p1);
        SimONAState.methods.setResponse('p2', analysis.p2);
        SimONAState.methods.setResponse('p3', analysis.p3);
        SimONAState.methods.setResponse('p4', analysis.p4);
        
        // 6. Response-Textareas füllen
        document.getElementById('SimONA_P1_EinheitMetadaten_response').value = JSON.stringify(analysis.p1, null, 2);
        document.getElementById('SimONA_P2_ParameterExtraktion_response').value = JSON.stringify(analysis.p2, null, 2);
        document.getElementById('SimONA_P3_RegelGenerierung_response').value = JSON.stringify(analysis.p3, null, 2);
        document.getElementById('SimONA_P4_ErgebnisProfilDetails_response').value = JSON.stringify(analysis.p4, null, 2);
        
        // 7. Output-Areas anzeigen
        document.getElementById('SimONA_P1_EinheitMetadaten_output_area').style.display = 'block';
        document.getElementById('SimONA_P2_ParameterExtraktion_output_area').style.display = 'block';
        document.getElementById('SimONA_P3_RegelGenerierung_output_area').style.display = 'block';
        document.getElementById('SimONA_P4_ErgebnisProfilDetails_output_area').style.display = 'block';
        
        // Button zurücksetzen
        button.textContent = originalText;
        button.disabled = false;
        
        // Erfolgsmeldung
        alert(`Version "${versionId}" wurde erfolgreich geladen!\n\nPrompt-Version: ${promptVersion}\nParameter: ${analysis.meta.parameter_count}\nRegeln: ${analysis.meta.rules_count}\nProfile: ${analysis.meta.profiles_count}`);
        
        // Versions-Container ausblenden
        document.getElementById('version-overview').style.display = 'none';
        
        // Zu Schritt 1 scrollen
        document.getElementById('step-1').scrollIntoView({ behavior: 'smooth', block: 'start' });
        
    })
    .catch(error => {
        console.error('Fehler beim Laden:', error);
        alert('Fehler beim Laden der Version: ' + error.message);
        button.textContent = originalText;
        button.disabled = false;
    });
}

/**
 * Zeigt Details einer Version
 */
function showVersionDetails(versionId, versionData) {
    // Verwende die übergebenen Daten statt Mock
    const details = versionData || {
        id: versionId,
        promptVersion: 'Unbekannt',
        created: 'Unbekannt',
        parameterCount: 0,
        rulesCount: 0,
        profilesCount: 0
    };
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background-color: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center;
        z-index: 1000;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background-color: white; padding: 20px; border-radius: 8px;
        max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;
    `;
    
    content.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h3 style="margin: 0;">📋 Versions-Details</h3>
            <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                    style="background: #e74c3c; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 4px;">
                ✕
            </button>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin-bottom: 15px;">
            <strong>ID:</strong> ${details.id}<br>
            <strong>Prompt-Version:</strong> <span style="background-color: ${getVersionColor(details.promptVersion)}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.9em;">${details.promptVersion}</span><br>
            <strong>Erstellt:</strong> ${details.created}<br>
            <strong>Parameter:</strong> ${details.parameterCount}<br>
            <strong>Regeln:</strong> ${details.rulesCount}<br>
            <strong>Ergebnisprofile:</strong> ${details.profilesCount}
        </div>
        
        ${details.qualityScore ? `
            <div style="background-color: #e8f5e9; padding: 15px; border-radius: 4px; margin-bottom: 15px;">
                <strong>🏆 Qualitäts-Audit:</strong><br>
                <strong>Score:</strong> ${details.qualityScore}/10<br>
                <strong>Fazit:</strong> ${details.qualityFazit}
            </div>
        ` : '<div style="background-color: #fff3cd; padding: 15px; border-radius: 4px; margin-bottom: 15px;"><em>Noch kein Qualitäts-Audit durchgeführt</em></div>'}
        
        <div style="text-align: center;">
            <button onclick="loadVersion('${details.id}'); this.parentElement.parentElement.parentElement.remove();" 
                    style="background-color: #28a745; color: white; padding: 10px 20px; border: none; border-radius: 4px; margin-right: 10px;">
                📂 Version laden
            </button>
            <button onclick="this.parentElement.parentElement.parentElement.remove();" 
                    style="background-color: #6c757d; color: white; padding: 10px 20px; border: none; border-radius: 4px;">
                Schließen
            </button>
        </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
}

/**
 * Aktualisiert die Versions-Übersicht
 */
function refreshVersionOverview() {
    const gesetz = getInputValue("gesetz");
    const paragraph = getInputValue("paragraph");
    const absatz = getInputValue("absatz");
    const satz = getInputValue("satz");
    
    if (!gesetz || !paragraph) {
        alert("Bitte erst Gesetz und Paragraph eingeben.");
        return;
    }
    
    showVersionOverview(gesetz, paragraph, absatz, satz);
}

/**
 * Startet Versions-Vergleich
 */
function compareVersions() {
    const modal = document.getElementById('version-comparison-modal');
    const content = document.getElementById('version-comparison-content');
    
    // Mock-Vergleich (später echte Implementation)
    const gesetz = getInputValue("gesetz");
    const paragraph = getInputValue("paragraph");
    const mockVersions = generateMockVersions(gesetz, paragraph);
    
    if (mockVersions.length < 2) {
        alert("Mindestens 2 Versionen erforderlich für Vergleich.");
        return;
    }
    
    let html = '<h4>Vergleich verfügbarer Versionen:</h4>';
    html += '<table style="width: 100%; border-collapse: collapse; margin-top: 10px;">';
    html += '<tr style="background-color: #f8f9fa;"><th style="padding: 8px; border: 1px solid #dee2e6;">Aspekt</th>';
    
    mockVersions.forEach(version => {
        html += `<th style="padding: 8px; border: 1px solid #dee2e6;">${version.promptVersion}</th>`;
    });
    html += '</tr>';
    
    const aspects = ['Parameter-Anzahl', 'Regel-Anzahl', 'Qualitäts-Score', 'Erstellungs-Datum'];
    aspects.forEach(aspect => {
        html += `<tr><td style="padding: 8px; border: 1px solid #dee2e6; font-weight: bold;">${aspect}</td>`;
        mockVersions.forEach(version => {
            let value = '';
            switch(aspect) {
                case 'Parameter-Anzahl': value = version.parameterCount; break;
                case 'Regel-Anzahl': value = version.rulesCount; break;
                case 'Qualitäts-Score': value = version.qualityScore ? `${version.qualityScore}/10` : 'N/A'; break;
                case 'Erstellungs-Datum': value = version.created; break;
            }
            html += `<td style="padding: 8px; border: 1px solid #dee2e6;">${value}</td>`;
        });
        html += '</tr>';
    });
    html += '</table>';
    
    html += `<div style="margin-top: 20px; padding: 15px; background-color: #e3f2fd; border-radius: 4px;">
        <strong>💡 Empfehlung:</strong> Nutzen Sie die Version mit dem höchsten Qualitäts-Score für die Produktion.
    </div>`;
    
    content.innerHTML = html;
    modal.style.display = 'flex';
}

/**
 * Schließt Versions-Vergleich
 */
function closeVersionComparison() {
    document.getElementById('version-comparison-modal').style.display = 'none';
}

// ========================================
// Hilfsfunktionen und Mock-Daten
// ========================================

/**
 * Generiert Mock-Versionen für Demonstration
 */
function generateMockVersions(gesetz, paragraph, absatz, satz) {
    const baseId = `SE_${gesetz}_${paragraph}` + (absatz ? `_Abs${absatz}` : '') + (satz ? `_S${satz}` : '') + '__v_Standard';
    
    // Mock-Daten (später aus echter DB)
    return [
        {
            id: `${baseId}__Pv1`,
            promptVersion: 'v1.3',
            created: '2025-01-08 14:30',
            parameterCount: 2,
            rulesCount: 3,
            profilesCount: 3,
            qualityScore: 8.5,
            qualityFazit: 'Gute Qualität, aber einige Optimierungen möglich'
        },
        {
            id: `${baseId}__Pv2_5`,
            promptVersion: 'v2.5',
            created: '2025-01-09 16:45',
            parameterCount: 3,
            rulesCount: 4,
            profilesCount: 4,
            qualityScore: 9.2,
            qualityFazit: 'Exzellente Qualität mit vollständiger Abdeckung'
        }
    ];
}

/**
 * Holt Mock-Details für eine Version
 */
function getMockVersionDetails(versionId) {
    const promptVersion = extractPromptVersionFromId(versionId);
    return {
        id: versionId,
        promptVersion: promptVersion,
        created: '2025-01-09 16:45',
        parameterCount: promptVersion === 'v2.5' ? 3 : 2,
        rulesCount: promptVersion === 'v2.5' ? 4 : 3,
        profilesCount: promptVersion === 'v2.5' ? 4 : 3,
        qualityScore: promptVersion === 'v2.5' ? 9.2 : 8.5,
        qualityFazit: promptVersion === 'v2.5' ? 
            'Exzellente Qualität mit vollständiger Abdeckung' : 
            'Gute Qualität, aber einige Optimierungen möglich'
    };
}

/**
 * Lädt Mock-Analysedaten
 */
function loadMockAnalysisData(versionId) {
    // Hier würden normalerweise alle P1-P4 Daten aus der DB geladen
    console.log(`Mock: Lade Analysedaten für ${versionId}`);
    // TODO: Echte Implementation mit API-Calls
}

/**
 * Hilfsfunktionen für Farben
 */
function getVersionColor(version) {
    switch(version) {
        case 'v1': case 'v1.3': return '#6c757d';
        case 'v2.5': return '#007bff';
        case 'v3.0': return '#28a745';
        default: return '#6f42c1';
    }
}

function getScoreColor(score) {
    if (score >= 9) return '#28a745';
    if (score >= 7) return '#ffc107';
    if (score >= 5) return '#fd7e14';
    return '#dc3545';
}

// Globale Funktionen exportieren
window.generateSimulationsEinheitIDWithVersionCheck = generateSimulationsEinheitIDWithVersionCheck;
window.loadVersion = loadVersion;
window.showVersionDetails = showVersionDetails;
window.refreshVersionOverview = refreshVersionOverview;
window.compareVersions = compareVersions;
window.closeVersionComparison = closeVersionComparison;

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