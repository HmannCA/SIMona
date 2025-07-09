// SimONA Prompt Assembler - JavaScript
// Version: 2.4
// Stand: 07.01.2025

// Globale Variablen für zwischengespeicherte, geparste KI-Antworten
let currentSimulationsEinheitID = "";
let p1ResponseData = null; 
let p2ResponseData = null; 
let validierteErgebnisProfileVorschlaege = []; 
let p2_7ResponseData = null;
let p3ResponseData = null; 
let p4ResponseData = null; 
let p0_5ResponseData = null;
let analysierteAbsatzIndizes = new Set();

// Hilfsfunktionen
function getInputValue(elementId) {
    const element = document.getElementById(elementId);
    return element ? element.value.trim() : "";
}

function escapeSqlString(str) {
    if (str === null || str === undefined) return 'NULL';
    if (typeof str === 'number' || typeof str === 'boolean') return str.toString();
    return "'" + str.toString().replace(/'/g, "''") + "'";
}

function displayGeneratedSql(sql, targetTextareaId, append = false) {
    const targetTextarea = document.getElementById(targetTextareaId);
    if (targetTextarea) {
        if (append) {
            targetTextarea.value += (targetTextarea.value ? "\n\n" : "") + sql;
        } else {
            targetTextarea.value = sql;
        }
    }
}

function copyToClipboard(elementId, buttonElement) {
    const element = document.getElementById(elementId);
    if (element) {
        element.select();
        document.execCommand('copy');
        
        const originalText = buttonElement.textContent;
        buttonElement.textContent = 'Kopiert!';
        buttonElement.style.backgroundColor = '#27ae60';
        
        setTimeout(() => {
            buttonElement.textContent = originalText;
            buttonElement.style.backgroundColor = '';
        }, 2000);
    }
}

function clearSqlOutput() {
    const sqlOutput = document.getElementById('gesamtesSqlOutput');
    if (sqlOutput) {
        sqlOutput.value = '';
    }
}

// SimulationsEinheit ID generieren
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
    
    // Variante mit Standardwert
    const varianteSafe = variante || "Standard";
    if (!variante) {
        document.getElementById('analyseVariante').value = varianteSafe;
    }

    // ID zusammenbauen
    let id = `SE_${gesetz}_${paragraph}`;
    if (absatz) id += `_Abs${absatz}`;
    if (satz) id += `_S${satz}`;
    id += `__v_${varianteSafe}`;

    currentSimulationsEinheitID = id;
    document.getElementById("simulationsEinheitIDDisplay").textContent = currentSimulationsEinheitID;
    console.log("Neue SimulationsEinheit_ID generiert:", currentSimulationsEinheitID);
}

// Prompt-Text zusammenstellen
function assemblePromptText(promptName) {
    const gesetzAbk = getInputValue("gesetz");
    const paragraphNum = getInputValue("paragraph"); 
    const absatzNum = getInputValue("absatz") || "1";
    const satzNum = getInputValue("satz");
    const quelleUrl = getInputValue("quelle") || "Keine URL angegeben";
    const normtextAuszug = getInputValue("normtext");
    
    // Normteil-Bezeichnung erstellen
    let normteilBezeichnung = `§ ${paragraphNum}`;
    if (absatzNum) normteilBezeichnung += ` Abs. ${absatzNum}`;
    if (satzNum) normteilBezeichnung += ` Satz ${satzNum}`;
    
    return preparePromptWithReplacements(promptName, gesetzAbk, normteilBezeichnung, quelleUrl, normtextAuszug, paragraphNum, absatzNum);
}

function preparePromptWithReplacements(promptName, gesetzAbk, normteilBezeichnung, quelleUrl, normtextAuszug, paragraphNum, absatzNum) {
    // Validierung
    if (!currentSimulationsEinheitID && !['SimONA_Priming_Systemanweisung', 'SimONA_P1_EinheitMetadaten', 'SimONA_P0_5_ParagraphAnalyse'].includes(promptName)) {
        alert("Bitte zuerst eine SimulationsEinheit_ID generieren (Schritt 0).");
        return null;
    }
    
    if (!normtextAuszug && !['SimONA_Priming_Systemanweisung'].includes(promptName)) {
        alert("Bitte den 'Exakter Wortlaut des zu analysierenden Normteils' eingeben.");
        return null;
    }

    let template = promptTemplates[promptName];
    if (!template) {
        alert("Prompt-Vorlage nicht gefunden: " + promptName);
        return null;
    }

    // Basis-Platzhalter ersetzen
    template = template.replace(/{{GESETZ_ABK}}/g, gesetzAbk)
                       .replace(/{{NORMTEIL_BEZEICHNUNG}}/g, normteilBezeichnung)
                       .replace(/{{QUELLE_URL}}/g, quelleUrl)
                       .replace(/{{NORMTEXT_AUSZUG}}/g, normtextAuszug)
                       .replace(/{{VOLLSTAENDIGER_PARAGRAPHENTEXT_INKL_UEBERSCHRIFTEN}}/g, normtextAuszug)
                       .replace(/{{PARA_NUM}}/g, paragraphNum) 
                       .replace(/{{ABS_NUM}}/g, absatzNum)     
                       .replace(/{{SIM_EINHEIT_ID}}/g, currentSimulationsEinheitID);
    
    // Spezifische Ersetzungen für verschiedene Prompts
    try { 
        if (promptName === 'SimONA_P2_ParameterExtraktion') {
            if (p1ResponseData && typeof p1ResponseData.Gesetzestext_Zitat_Analysierter_Teil === 'string') {
                template = template.replace(/{{NORMTEXT_P1_ZITAT}}/g, JSON.stringify(p1ResponseData.Gesetzestext_Zitat_Analysierter_Teil).slice(1,-1));
            } else {
                alert("Antwort von SimONA_P1_EinheitMetadaten wird für P2 benötigt.");
                return null;
            }
        } else if (promptName === 'SimONA_P2_7_ParameterKonklusionDetail') {
            if (!p1ResponseData || !p2ResponseData) {
                alert("Antworten von P1 und P2 werden für P2.7 benötigt.");
                return null;
            }
            template = template.replace(/{{P1_RESPONSE_JSON_STRING}}/g, JSON.stringify(p1ResponseData, null, 2))
                               .replace(/{{P2_RESPONSE_JSON_STRING}}/g, JSON.stringify(p2ResponseData, null, 2));
        } else if (promptName === 'SimONA_P2_5_ErgebnisProfilVorschlaege') {
            if (!p1ResponseData || !p2ResponseData) {
                alert("Antworten von P1 und P2 werden für P2.5 benötigt.");
                return null;
            }
            template = template.replace(/{{P1_RESPONSE_JSON_STRING}}/g, JSON.stringify(p1ResponseData, null, 2))
                               .replace(/{{P2_RESPONSE_JSON_STRING}}/g, JSON.stringify(p2ResponseData, null, 2));
        } else if (promptName === 'SimONA_P3_RegelGenerierung') {
            if (!p2ResponseData) {
                alert("P2-Parameterdaten werden für P3 benötigt.");
                return null;
            }
            if (!validierteErgebnisProfileVorschlaege || validierteErgebnisProfileVorschlaege.length === 0) {
                alert("Validierte ErgebnisProfil-Vorschläge aus P2.5 werden für P3 benötigt. Bitte erst P2.5 ausführen und Vorschläge validieren.");
                return null;
            }
            template = template.replace(/{{P2_RESPONSE_JSON_STRING}}/g, JSON.stringify(p2ResponseData, null, 2))
                               .replace(/{{P2_5_RESPONSE_JSON_STRING_VALIDATED}}/g, JSON.stringify(validierteErgebnisProfileVorschlaege, null, 2));
        } else if (promptName === 'SimONA_P4_ErgebnisProfilDetails') {
            if (!p1ResponseData || !p2ResponseData) {
                alert("Antworten von P1 und P2 werden für P4 benötigt.");
                return null;
            }
            
            // ErgebnisProfil IDs sammeln
            let ergebnisProfileIds = [];
            
            if (p3ResponseData && Array.isArray(p3ResponseData)) {
                // Aus P3 Regeln extrahieren
                const uniqueIds = new Set();
                p3ResponseData.forEach(regel => {
                    if (regel.FK_ErgebnisProfil_ID_Referenz) {
                        uniqueIds.add(regel.FK_ErgebnisProfil_ID_Referenz);
                    }
                });
                ergebnisProfileIds = Array.from(uniqueIds);
            } else if (validierteErgebnisProfileVorschlaege && validierteErgebnisProfileVorschlaege.length > 0) {
                // Aus P2.5 nehmen
                ergebnisProfileIds = validierteErgebnisProfileVorschlaege.map(v => v.Vorgeschlagene_ErgebnisProfil_ID_Referenz);
            } else {
                alert("Weder P3-Regeln noch validierte P2.5-Vorschläge vorhanden. Bitte zuerst P3 oder P2.5 ausführen.");
                return null;
            }
            
            template = template.replace(/{{P1_RESPONSE_JSON_STRING}}/g, JSON.stringify(p1ResponseData, null, 2))
                               .replace(/{{P2_RESPONSE_JSON_STRING}}/g, JSON.stringify(p2ResponseData, null, 2))
                               .replace(/{{P3_ERGEBNISPROFILE_IDS_USED_LIST_JSON}}/g, JSON.stringify(ergebnisProfileIds, null, 2));
        }
    } catch (e) {
        alert("Fehler beim Aufbereiten der Daten für den Prompt-Platzhalter: " + e.message);
        return null;
    }
    
    return template;
}

// UI-Funktionen
function showPrompt(promptName) {
    console.log("showPrompt aufgerufen für:", promptName);
    const promptText = assemblePromptText(promptName);
    if (promptText) {
        const promptTextarea = document.getElementById(promptName + '_prompt');
        const outputArea = document.getElementById(promptName + '_output_area');
        if (promptTextarea && outputArea) {
            promptTextarea.value = promptText;
            outputArea.style.display = 'block';
            console.log("Prompt für", promptName, "angezeigt.");
        } else {
            console.error("Fehler: Textarea oder Output-Bereich für", promptName, "nicht im DOM gefunden.");
        }
    }
}

// Event Listeners für Response-Felder
document.getElementById('SimONA_P1_EinheitMetadaten_response').addEventListener('blur', function() {
    try {
        if (this.value.trim() === "") { 
            p1ResponseData = null; 
            console.log("P1 Response Data gelöscht."); 
            return; 
        }
        p1ResponseData = JSON.parse(this.value);
        console.log("P1 Response Data (Objekt) gespeichert:", p1ResponseData);
    } catch(e) {
        p1ResponseData = null;
        if(this.value.trim() !== "") alert("P1 Antwort ist kein valides JSON.");
    }
});

document.getElementById('SimONA_P2_ParameterExtraktion_response').addEventListener('blur', function() {
    try {
        if (this.value.trim() === "") { 
            p2ResponseData = null; 
            console.log("P2 Response Data gelöscht."); 
            return; 
        }
        p2ResponseData = JSON.parse(this.value);
        console.log("P2 Response Data (Array) gespeichert:", p2ResponseData);
    } catch(e) {
        p2ResponseData = null;
        if(this.value.trim() !== "") alert("P2 Antwort ist kein valides JSON-Array.");
    }
});

document.getElementById('SimONA_P2_5_ErgebnisProfilVorschlaege_response').addEventListener('blur', function() {
    try {
        if (this.value.trim() === "") { 
            console.log("P2.5 Response Textarea geleert."); 
            return; 
        }
        JSON.parse(this.value); 
        console.log("P2.5 Response Textarea enthält valides JSON (wird für 'Anzeigen & Bearbeiten' genutzt).");
    } catch(e) {
        if(this.value.trim() !== "") alert("P2.5 Antwort ist kein valides JSON-Array.");
    }
});

document.getElementById('SimONA_P2_7_ParameterKonklusionDetail_response').addEventListener('blur', function() {
    try {
        if (this.value.trim() === "") { 
            p2_7ResponseData = null; 
            console.log("P2.7 Response Data gelöscht."); 
            return; 
        }
        p2_7ResponseData = JSON.parse(this.value);
        console.log("P2.7 Response Data (Array) gespeichert:", p2_7ResponseData);
    } catch(e) {
        p2_7ResponseData = null;
        if(this.value.trim() !== "") alert("P2.7 Antwort ist kein valides JSON-Array.");
    }
});

document.getElementById('SimONA_P3_RegelGenerierung_response').addEventListener('blur', function() {
    try {
        if (this.value.trim() === "") { 
            p3ResponseData = null; 
            console.log("P3 Response Data gelöscht."); 
            return; 
        }
        p3ResponseData = JSON.parse(this.value);
        console.log("P3 Response Data (Array) gespeichert:", p3ResponseData);
    } catch(e) {
        p3ResponseData = null;
        if(this.value.trim() !== "") alert("P3 Antwort ist kein valides JSON-Array.");
    }
});

document.getElementById('SimONA_P4_ErgebnisProfilDetails_response').addEventListener('blur', function() {
    try {
        if (this.value.trim() === "") { 
            p4ResponseData = null; 
            console.log("P4 Response Data gelöscht."); 
            return; 
        }
        p4ResponseData = JSON.parse(this.value); 
        console.log("P4 Response Data (Array) gespeichert:", p4ResponseData);
    } catch(e) {
        p4ResponseData = null;
        if(this.value.trim() !== "") alert("P4 Antwort ist kein valides JSON-Array.");
    }
});

// P2.5 Editor Funktionen
function displayAndPrepareP2_5Suggestions() {
    const p2_5ResponseJsonString = getInputValue('SimONA_P2_5_ErgebnisProfilVorschlaege_response');
    const editorArea = document.getElementById('p2_5_suggestions_editor_area');
    const addNewArea = document.getElementById('p2_5_add_new_suggestion_area');
    
    editorArea.innerHTML = ''; 
    addNewArea.style.display = 'none';
    validierteErgebnisProfileVorschlaege = []; 

    if (!p2_5ResponseJsonString) {
        alert("Keine Daten aus SimONA_P2_5_ErgebnisProfilVorschlaege vorhanden. Bitte Prompt ausführen und Antwort einfügen.");
        return;
    }

    let suggestions;
    try {
        suggestions = JSON.parse(p2_5ResponseJsonString);
        if (!Array.isArray(suggestions) || (suggestions.length > 0 && !suggestions.every(item => 
            item && typeof item.Vorgeschlagene_ErgebnisProfil_ID_Referenz === 'string' &&
            typeof item.Vorgeschlagene_Kurzbeschreibung_Ergebnis === 'string'
        ))) {
            throw new Error("P2.5 Antwort hat nicht das erwartete Format.");
        }
    } catch (e) {
        alert("Fehler beim Parsen der P2.5 JSON-Antwort: " + e.message);
        return;
    }

    validierteErgebnisProfileVorschlaege = JSON.parse(JSON.stringify(suggestions)); 

    if (validierteErgebnisProfileVorschlaege.length === 0) {
        editorArea.innerHTML = '<p>Keine Ergebnisprofil-Vorschläge gefunden in der KI-Antwort. Sie können manuell welche hinzufügen.</p>';
    } else {
        redrawSuggestionList();
    }
    document.getElementById('addNewSuggestionButton').style.display = 'inline-block';
}

function redrawSuggestionList() {
    const editorArea = document.getElementById('p2_5_suggestions_editor_area');
    let infoBox = editorArea.querySelector('p[style*="font-style:italic"]');
    editorArea.innerHTML = '';
    
    if (validierteErgebnisProfileVorschlaege.length === 0 && !infoBox) {
        editorArea.innerHTML = '<p>Keine Ergebnisprofil-Vorschläge vorhanden. Sie können manuell welche hinzufügen.</p>';
    } else if (validierteErgebnisProfileVorschlaege.length > 0) {
        const ul = document.createElement('ul');
        ul.style.listStyleType = 'none';
        ul.style.paddingLeft = '0';

        validierteErgebnisProfileVorschlaege.forEach((suggestion, index) => {
            const li = document.createElement('li');
            li.classList.add('suggestion-item');
            li.setAttribute('data-index', index); 
            renderSingleSuggestion(li, index); 
            ul.appendChild(li);
        });
        editorArea.appendChild(ul);
    }
    
    if(infoBox) {
        editorArea.appendChild(infoBox);
    } else if (validierteErgebnisProfileVorschlaege.length > 0) {
        editorArea.innerHTML += '<p style="font-style:italic; font-size:0.9em;">Die oben gelisteten Vorschläge werden als Grundlage für Prompt 3 und 4 verwendet.</p>';
    }
}

function renderSingleSuggestion(container, index) {
    const suggestion = validierteErgebnisProfileVorschlaege[index];
    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
            <span><strong>ID:</strong> <input type="text" value="${suggestion.Vorgeschlagene_ErgebnisProfil_ID_Referenz}" 
                onblur="updateSuggestionId(${index}, this.value)" style="width: 250px; margin-right: 10px;">
            <strong>Beschreibung:</strong> <input type="text" value="${suggestion.Vorgeschlagene_Kurzbeschreibung_Ergebnis}" 
                onblur="updateSuggestionDesc(${index}, this.value)" style="width: 400px;"></span>
            <button style="background-color: #e74c3c; color: white; border: none; padding: 5px 10px; cursor: pointer;" 
                onclick="deleteSuggestion(${index})">Löschen</button>
        </div>
    `;
}

function updateSuggestionId(index, newValue) {
    if (validierteErgebnisProfileVorschlaege[index]) {
        validierteErgebnisProfileVorschlaege[index].Vorgeschlagene_ErgebnisProfil_ID_Referenz = newValue;
        console.log(`Vorschlag ${index} ID aktualisiert:`, newValue);
    }
}

function updateSuggestionDesc(index, newValue) {
    if (validierteErgebnisProfileVorschlaege[index]) {
        validierteErgebnisProfileVorschlaege[index].Vorgeschlagene_Kurzbeschreibung_Ergebnis = newValue;
        console.log(`Vorschlag ${index} Beschreibung aktualisiert:`, newValue);
    }
}

function deleteSuggestion(index) {
    if (confirm("Möchten Sie diesen Vorschlag wirklich löschen?")) {
        validierteErgebnisProfileVorschlaege.splice(index, 1);
        redrawSuggestionList();
        console.log(`Vorschlag ${index} gelöscht. Verbleibende Vorschläge:`, validierteErgebnisProfileVorschlaege);
    }
}

function addNewSuggestionInterface() {
    const addNewArea = document.getElementById('p2_5_add_new_suggestion_area');
    addNewArea.style.display = 'block';
    
    const paragraphNum = getInputValue("paragraph") || "[Para]";
    const absatzNum = getInputValue("absatz") || "[Abs]";
    document.getElementById('new_suggestion_id').value = `EP_${paragraphNum}_${absatzNum}_`;
    document.getElementById('new_suggestion_desc').value = '';
}

function saveNewSuggestion() {
    const newId = getInputValue('new_suggestion_id');
    const newDesc = getInputValue('new_suggestion_desc');
    
    if (!newId || !newDesc) {
        alert("Bitte beide Felder ausfüllen.");
        return;
    }
    
    validierteErgebnisProfileVorschlaege.push({
        Vorgeschlagene_ErgebnisProfil_ID_Referenz: newId,
        Vorgeschlagene_Kurzbeschreibung_Ergebnis: newDesc
    });
    
    redrawSuggestionList();
    cancelNewSuggestion();
    console.log("Neuer Vorschlag hinzugefügt:", newId);
}

function cancelNewSuggestion() {
    const addNewArea = document.getElementById('p2_5_add_new_suggestion_area');
    addNewArea.style.display = 'none';
    document.getElementById('new_suggestion_id').value = '';
    document.getElementById('new_suggestion_desc').value = '';
}

// P2.7 Merge-Funktion
function mergeP2_7Data() {
    if (!p2ResponseData || !Array.isArray(p2ResponseData)) {
        alert("P2-Parameterdaten nicht vorhanden oder kein Array. Bitte zuerst P2 ausführen.");
        return;
    }
    if (!p2_7ResponseData || !Array.isArray(p2_7ResponseData)) {
        alert("P2.7-Konklusionsdaten nicht vorhanden oder kein Array. Bitte P2.7 ausführen und Antwort einfügen.");
        return;
    }
    
    let mergeCount = 0;
    p2_7ResponseData.forEach(konklusionData => {
        const paramIndex = p2ResponseData.findIndex(param => param.Parameter_ID === konklusionData.Parameter_ID);
        if (paramIndex !== -1) {
            p2ResponseData[paramIndex].Konklusive_Antworten_Info = konklusionData.Konklusive_Antworten_Info;
            mergeCount++;
        }
    });
    
    console.log(`P2.7 Daten erfolgreich in P2 integriert. ${mergeCount} Parameter aktualisiert.`);
    alert(`P2.7 Konklusionsdaten wurden erfolgreich in die P2-Parameter integriert.\n${mergeCount} Parameter wurden mit Konklusionsinformationen erweitert.`);
}

// SQL-Generierungsfunktionen
function generateSqlForP1Data() {
    if (!p1ResponseData) {
        alert("Keine P1-Metadaten für SQL-Generierung vorhanden. Bitte Prompt P1 ausführen und Antwort einfügen/parsen lassen.");
        return "";
    }
    if (!currentSimulationsEinheitID) {
        alert("SimulationsEinheit_ID fehlt für SQL-Generierung.");
        return "";
    }

    let sql = `-- SQL für SimulationsEinheiten und Regelwerke (basierend auf P1 Daten)\n`;
    sql += `START TRANSACTION;\n\n`;
    
    // SimulationsEinheiten
    sql += `INSERT INTO SimulationsEinheiten (Einheit_ID, Normteil_Bezeichnung, Gesetzestext_Zitat_Analysierter_Teil, FK_Entscheidungsart_ID_Lookup) VALUES (\n`;
    sql += `  ${escapeSqlString(currentSimulationsEinheitID)},\n`;
    sql += `  ${escapeSqlString(p1ResponseData.Normteil_Bezeichnung || 'Unbekannt')},\n`;
    sql += `  ${escapeSqlString(p1ResponseData.Gesetzestext_Zitat_Analysierter_Teil || '')},\n`;
    sql += `  ${p1ResponseData.FK_Entscheidungsart_ID_Lookup || 'NULL'}\n`;
    sql += `);\n\n`;
    
    // Regelwerke
    sql += `INSERT INTO Regelwerke (Regelwerk_ID, FK_Einheit_ID, Regelwerk_Name, Regelwerk_Beschreibung) VALUES (\n`;
    sql += `  ${escapeSqlString(currentSimulationsEinheitID)},\n`;
    sql += `  ${escapeSqlString(currentSimulationsEinheitID)},\n`;
    sql += `  ${escapeSqlString(p1ResponseData.Regelwerk_Name || 'Standard-Regelwerk')},\n`;
    sql += `  ${escapeSqlString(p1ResponseData.Regelwerk_Beschreibung || '')}\n`;
    sql += `);\n\n`;
    
    sql += `COMMIT;\n`;
    return sql;
}

function generateSqlForP2Data() {
    if (!p2ResponseData || !Array.isArray(p2ResponseData) || p2ResponseData.length === 0) {
        alert("Keine Parameter-Daten (aus P2-Antwort) für SQL-Generierung vorhanden.");
        return "";
    }
    if (!currentSimulationsEinheitID) {
        alert("SimulationsEinheit_ID fehlt.");
        return "";
    }

    let sql = `-- SQL für Parameter und ParameterOptionen (basierend auf P2 Daten)\n`;
    sql += `START TRANSACTION;\n\n`;
    
    p2ResponseData.forEach(param => {
        // Flexibles Mapping für verschiedene mögliche Feldnamen
        const parameterName = param.Parameter_Name || param.Name || param.Parametername || 'Unbenannt';
        const fragetext = param.Fragetext || param.Frage || param.Question || '';
        const parameterTyp = param.Parameter_Typ || param.Typ || param.Type || 'JaNein';
        const istPflicht = param.Ist_Pflichtparameter !== undefined ? param.Ist_Pflichtparameter : true;
        const istGrundvoraussetzung = param.Ist_Grundvoraussetzung !== undefined ? param.Ist_Grundvoraussetzung : false;
        
        // Parameter einfügen
        sql += `INSERT INTO Parameter (Parameter_ID, FK_Einheit_ID, Parameter_Name, Fragetext, Hilfetext, `;
        sql += `Parameter_Typ, Ist_Pflichtparameter, Ist_Grundvoraussetzung, Reihenfolge_Anzeige) VALUES (\n`;
        sql += `  ${escapeSqlString(param.Parameter_ID)},\n`;
        sql += `  ${escapeSqlString(currentSimulationsEinheitID)},\n`;
        sql += `  ${escapeSqlString(parameterName)},\n`;
        sql += `  ${escapeSqlString(fragetext)},\n`;
        sql += `  ${param.Hilfetext ? escapeSqlString(param.Hilfetext) : 'NULL'},\n`;
        sql += `  ${escapeSqlString(parameterTyp)},\n`;
        sql += `  ${istPflicht ? 'TRUE' : 'FALSE'},\n`;
        sql += `  ${istGrundvoraussetzung ? 'TRUE' : 'FALSE'},\n`;
        sql += `  ${param.Reihenfolge_Anzeige || 'NULL'}\n`;
        sql += `);\n\n`;
        
        // Optionen einfügen (falls vorhanden)
        if (param.Optionen && Array.isArray(param.Optionen)) {
            param.Optionen.forEach(option => {
                sql += `INSERT INTO ParameterOptionen (FK_Parameter_ID, Option_Wert_Intern, Option_Anzeigetext, Reihenfolge_Option) VALUES (\n`;
                sql += `  ${escapeSqlString(param.Parameter_ID)},\n`;
                sql += `  ${escapeSqlString(option.Option_Wert_Intern)},\n`;
                sql += `  ${escapeSqlString(option.Option_Anzeigetext)},\n`;
                sql += `  ${option.Reihenfolge_Option !== undefined ? parseInt(option.Reihenfolge_Option, 10) : 'NULL'}\n`;
                sql += `);\n`;
            });
        }
        sql += `\n`;
    });
    
    sql += `COMMIT;\n`;
    return sql;
}

function generateSqlForP3Data() {
    if (!p3ResponseData || !Array.isArray(p3ResponseData) || p3ResponseData.length === 0) {
        alert("Keine Regel-Daten (aus P3-Antwort) für SQL-Generierung vorhanden.");
        return "";
    }
    if (!currentSimulationsEinheitID) {
        alert("SimulationsEinheit_ID fehlt.");
        return "";
    }

    const fkRegelwerkId = currentSimulationsEinheitID;
    let sql = `-- SQL für Regeln und RegelBedingungen (basierend auf P3 Daten)\n`;
    sql += `START TRANSACTION;\n\n`;

    p3ResponseData.forEach(regel => {
        if (!regel || typeof regel.Regel_Name !== 'string' || typeof regel.FK_ErgebnisProfil_ID_Referenz !== 'string') {
            console.warn("Ungültiges Regel-Objekt übersprungen:", regel);
            return;
        }

        // Regel einfügen
        sql += `INSERT INTO Regeln (FK_Regelwerk_ID, Regel_Name, Prioritaet, FK_ErgebnisProfil_ID_Referenz) VALUES (\n`;
        sql += `  ${escapeSqlString(fkRegelwerkId)},\n`;
        sql += `  ${escapeSqlString(regel.Regel_Name)},\n`;
        sql += `  ${regel.Prioritaet !== undefined && regel.Prioritaet !== null ? regel.Prioritaet : 'NULL'},\n`;
        sql += `  ${escapeSqlString(regel.FK_ErgebnisProfil_ID_Referenz)}\n`;
        sql += `);\n`;
        sql += `SET @last_regel_id = LAST_INSERT_ID();\n\n`;
        
        // Bedingungen einfügen
        if (regel.Bedingungen_fuer_Regel && Array.isArray(regel.Bedingungen_fuer_Regel)) {
            regel.Bedingungen_fuer_Regel.forEach(bedingung => {
                sql += `INSERT INTO RegelBedingungen (FK_Regel_ID, FK_Parameter_ID, Vergleichsoperator, Erwarteter_Wert_Intern) VALUES (\n`;
                sql += `  @last_regel_id,\n`;
                sql += `  ${escapeSqlString(bedingung.FK_Parameter_ID)},\n`;
                sql += `  ${escapeSqlString(bedingung.Vergleichsoperator)},\n`;
                
                const erwarteterWert = bedingung.Erwarteter_Wert_Intern;
                if (typeof erwarteterWert === 'boolean') {
                    sql += `  ${erwarteterWert ? 'TRUE' : 'FALSE'}\n`;
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

function generateSqlForP4Data() {
    if (!p4ResponseData || !Array.isArray(p4ResponseData) || p4ResponseData.length === 0) {
        alert("Keine ErgebnisProfil-Daten (aus P4-Antwort) für SQL-Generierung vorhanden.");
        return "";
    }
    if (!currentSimulationsEinheitID) {
        alert("SimulationsEinheit_ID fehlt.");
        return "";
    }

    let sql = `-- SQL für ErgebnisProfile (basierend auf P4 Daten)\n`;
    sql += `START TRANSACTION;\n\n`;

    p4ResponseData.forEach(profil => {
        if (!profil || typeof profil.ErgebnisProfil_ID_Referenz !== 'string' || typeof profil.Profil_Name !== 'string') {
            console.warn("Ungültiges ErgebnisProfil-Objekt übersprungen:", profil);
            return;
        }

        const dynamischeParameterListeSQL = (profil.Begruendung_Dynamische_Parameter_Liste && Array.isArray(profil.Begruendung_Dynamische_Parameter_Liste))
            ? escapeSqlString(JSON.stringify(profil.Begruendung_Dynamische_Parameter_Liste))
            : 'NULL';

        sql += `INSERT INTO ErgebnisProfile (`;
        sql += `ErgebnisProfil_ID_Referenz, FK_Einheit_ID, Profil_Name, Entscheidungstext_Kurz_Vorlage, `;
        sql += `Art_der_Entscheidung_Anzeige_Text, Einleitungstext_Begruendung_Vorlage, `;
        sql += `Begruendung_Statischer_Text_Vorlage, Begruendung_Dynamische_Parameter_Liste, `;
        sql += `Abschlusstext_Begruendung_Vorlage, Hinweistext_Naechste_Schritte_Vorlage`;
        sql += `) VALUES (\n`;
        sql += `  ${escapeSqlString(profil.ErgebnisProfil_ID_Referenz)},\n`;
        sql += `  ${escapeSqlString(currentSimulationsEinheitID)},\n`;
        sql += `  ${escapeSqlString(profil.Profil_Name)},\n`;
        sql += `  ${escapeSqlString(profil.Entscheidungstext_Kurz_Vorlage || '')},\n`;
        sql += `  ${escapeSqlString(profil.Art_der_Entscheidung_Anzeige_Text || '')},\n`;
        sql += `  ${escapeSqlString(profil.Einleitungstext_Begruendung_Vorlage || '')},\n`;
        sql += `  ${profil.Begruendung_Statischer_Text_Vorlage ? escapeSqlString(profil.Begruendung_Statischer_Text_Vorlage) : 'NULL'},\n`;
        sql += `  ${dynamischeParameterListeSQL},\n`;
        sql += `  ${profil.Abschlusstext_Begruendung_Vorlage ? escapeSqlString(profil.Abschlusstext_Begruendung_Vorlage) : 'NULL'},\n`;
        sql += `  ${profil.Hinweistext_Naechste_Schritte_Vorlage ? escapeSqlString(profil.Hinweistext_Naechste_Schritte_Vorlage) : 'NULL'}\n`;
        sql += `);\n\n`;
    });

    sql += `COMMIT;\n`;
    return sql;
}

// Validierungsfunktion
function validateGesamtdatensatz() {
    const errors = [];
    const warnings = [];
    
    // P1 Validierung
    if (!p1ResponseData) {
        errors.push("P1-Daten (SimulationsEinheit Metadaten) fehlen.");
    } else {
        if (!p1ResponseData.Normteil_Bezeichnung) warnings.push("P1: Normteil_Bezeichnung fehlt.");
        if (!p1ResponseData.FK_Entscheidungsart_ID_Lookup) warnings.push("P1: FK_Entscheidungsart_ID_Lookup fehlt.");
    }
    
    // P2 Validierung
    if (!p2ResponseData || !Array.isArray(p2ResponseData)) {
        errors.push("P2-Daten (Parameter) fehlen oder sind kein Array.");
    } else if (p2ResponseData.length === 0) {
        warnings.push("P2: Keine Parameter definiert.");
    } else {
        const parameterIds = new Set();
        p2ResponseData.forEach((param, index) => {
            if (!param.Parameter_ID) {
                errors.push(`P2: Parameter[${index}] hat keine Parameter_ID.`);
            } else if (parameterIds.has(param.Parameter_ID)) {
                errors.push(`P2: Doppelte Parameter_ID: ${param.Parameter_ID}`);
            } else {
                parameterIds.add(param.Parameter_ID);
            }
            
            // Flexiblere Validierung für verschiedene mögliche Feldnamen
            const hasName = param.Parameter_Name || param.Name || param.Parametername;
            const hasType = param.Parameter_Typ || param.Typ || param.Type;
            const hasQuestion = param.Fragetext || param.Frage || param.Question;
            
            if (!hasName) errors.push(`P2: Parameter[${index}] (${param.Parameter_ID || 'ohne ID'}) hat keinen Parameter_Name.`);
            if (!hasQuestion) warnings.push(`P2: Parameter[${index}] (${param.Parameter_ID || 'ohne ID'}) hat keinen Fragetext.`);
            if (!hasType) errors.push(`P2: Parameter[${index}] (${param.Parameter_ID || 'ohne ID'}) hat keinen Parameter_Typ.`);
        });
    }
    
    // P3 Validierung
    if (!p3ResponseData || !Array.isArray(p3ResponseData)) {
        errors.push("P3-Daten (Regeln) fehlen oder sind kein Array.");
    } else if (p3ResponseData.length === 0) {
        warnings.push("P3: Keine Regeln definiert.");
    } else {
        const prioritaeten = new Set();
        const verwendeteErgebnisProfileIds = new Set();
        
        p3ResponseData.forEach((regel, index) => {
            if (!regel.Regel_Name) errors.push(`P3: Regel[${index}] hat keinen Regel_Name.`);
            if (!regel.FK_ErgebnisProfil_ID_Referenz) {
                errors.push(`P3: Regel[${index}] (${regel.Regel_Name || 'ohne Name'}) hat keine FK_ErgebnisProfil_ID_Referenz.`);
            } else {
                verwendeteErgebnisProfileIds.add(regel.FK_ErgebnisProfil_ID_Referenz);
            }
            
            if (regel.Prioritaet !== undefined && regel.Prioritaet !== null) {
                if (prioritaeten.has(regel.Prioritaet)) {
                    errors.push(`P3: Doppelte Priorität ${regel.Prioritaet} in Regel '${regel.Regel_Name}'.`);
                } else {
                    prioritaeten.add(regel.Prioritaet);
                }
            }
        });
    }
    
    // P4 Validierung
    if (!p4ResponseData || !Array.isArray(p4ResponseData)) {
        errors.push("P4-Daten (ErgebnisProfile) fehlen oder sind kein Array.");
    } else if (p4ResponseData.length === 0) {
        warnings.push("P4: Keine ErgebnisProfile definiert.");
    } else {
        const definierteErgebnisProfileIds = new Set();
        
        p4ResponseData.forEach((profil, index) => {
            if (!profil.ErgebnisProfil_ID_Referenz) {
                errors.push(`P4: ErgebnisProfil[${index}] hat keine ErgebnisProfil_ID_Referenz.`);
            } else {
                definierteErgebnisProfileIds.add(profil.ErgebnisProfil_ID_Referenz);
            }
            
            if (!profil.Profil_Name) errors.push(`P4: ErgebnisProfil[${index}] (${profil.ErgebnisProfil_ID_Referenz || 'ohne ID'}) hat keinen Profil_Name.`);
        });
        
        // Cross-Referenz Prüfung
        if (p3ResponseData && Array.isArray(p3ResponseData)) {
            p3ResponseData.forEach(regel => {
                if (regel.FK_ErgebnisProfil_ID_Referenz && !definierteErgebnisProfileIds.has(regel.FK_ErgebnisProfil_ID_Referenz)) {
                    errors.push(`Cross-Referenz Fehler: Regel '${regel.Regel_Name}' verweist auf nicht definiertes ErgebnisProfil '${regel.FK_ErgebnisProfil_ID_Referenz}'.`);
                }
            });
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors,
        warnings: warnings
    };
}

// Haupt-SQL-Generierungsfunktion
function generateAllSql() {
    // Validierung
    const validationResult = validateGesamtdatensatz();
    const reportArea = document.getElementById('validation-report-area');
    
    if (!validationResult.isValid) {
        reportArea.className = 'error';
        let reportHTML = '<strong>Validierung fehlgeschlagen!</strong> Bitte korrigieren Sie die folgenden Fehler:<ul style="margin-top: 10px;">';
        validationResult.errors.forEach(error => {
            reportHTML += `<li>${error}</li>`;
        });
        reportHTML += '</ul>';
        reportArea.innerHTML = reportHTML;
        reportArea.style.display = 'block';
        alert("SQL-Generierung abgebrochen wegen Validierungsfehlern. Details siehe Bericht.");
        return;
    } else {
        // Erfolg mit Warnungen
        reportArea.className = 'success';
        let reportHTML = '<strong>Validierung erfolgreich.</strong> Alle Daten sind strukturell und logisch konsistent.';
        if(validationResult.warnings.length > 0){
            reportHTML += '<br><strong>Folgende Warnungen wurden gefunden:</strong><ul>';
            validationResult.warnings.forEach(warning => {
                reportHTML += `<li>${warning}</li>`;
            });
            reportHTML += '</ul>';
        }
        reportArea.innerHTML = reportHTML;
        reportArea.style.display = 'block';
    }

    // SQL generieren
    console.log("generateAllSql aufgerufen nach erfolgreicher Validierung");
    let allSqlCommands = "";
    const sqlP1 = generateSqlForP1Data();
    const sqlP2 = generateSqlForP2Data();
    const sqlP4 = generateSqlForP4Data();
    const sqlP3 = generateSqlForP3Data();

    if (sqlP1.trim() === "" && sqlP2.trim() === "" && sqlP4.trim() === "" && sqlP3.trim() === "") {
        alert("Keine Daten für die SQL-Generierung vorhanden.");
        return;
    }
    
    allSqlCommands += `START TRANSACTION;\n\n`;

    if (sqlP1) allSqlCommands += sqlP1.replace(/START TRANSACTION;\n\n|COMMIT;\n/g, '');
    if (sqlP2) allSqlCommands += sqlP2.replace(/START TRANSACTION;\n\n|COMMIT;\n/g, '');
    if (sqlP4) allSqlCommands += sqlP4.replace(/START TRANSACTION;\n\n|COMMIT;\n/g, '');
    if (sqlP3) allSqlCommands += sqlP3.replace(/START TRANSACTION;\n\n|COMMIT;\n/g, '');
    
    allSqlCommands += `\nCOMMIT;\n`;

    displayGeneratedSql(allSqlCommands.trim(), 'gesamtesSqlOutput', false);
    alert("Alle verfügbaren SQL-Befehle wurden nach erfolgreicher Prüfung generiert.");
}

// Debug-Funktion
function debugP2Data() {
    if (!p2ResponseData) {
        console.log("Keine P2-Daten vorhanden");
        return;
    }
    
    console.log("=== P2 Response Data Debug ===");
    console.log("Anzahl Parameter:", p2ResponseData.length);
    
    if (p2ResponseData.length > 0) {
        console.log("Struktur des ersten Parameters:");
        console.log(JSON.stringify(p2ResponseData[0], null, 2));
        
        console.log("\nAlle verfügbaren Felder im ersten Parameter:");
        console.log(Object.keys(p2ResponseData[0]));
    }
}

// Utility-Funktionen
function clearAllTextareasAndSuggestions() {
    // State zurücksetzen
    p1ResponseData = null; 
    p2ResponseData = null; 
    p3ResponseData = null; 
    p4ResponseData = null; 
    p2_7ResponseData = null;
    validierteErgebnisProfileVorschlaege = [];
    console.log("Interner State zurückgesetzt.");

    // UI zurücksetzen
    const promptPrefixes = [
        'SimONA_P1_EinheitMetadaten',
        'SimONA_P2_ParameterExtraktion',
        'SimONA_P2_7_ParameterKonklusionDetail',
        'SimONA_P2_5_ErgebnisProfilVorschlaege',
        'SimONA_P3_RegelGenerierung',
        'SimONA_P4_ErgebnisProfilDetails'
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

    console.log("Alle UI-Bereiche zurückgesetzt.");
}

// P5 Audit-Funktionen
function assembleAndShowP5AuditPrompt() {
    console.log("Generiere P5 Qualitäts-Audit Prompt...");
    
    if (!p1ResponseData || !p2ResponseData || !p3ResponseData || !p4ResponseData) {
        alert("Für das Qualitäts-Audit müssen alle Daten (P1-P4) vorhanden sein.");
        return;
    }

    const validationResult = validateGesamtdatensatz();
    if (!validationResult.isValid) {
        alert("Bitte beheben Sie zuerst die Fehler aus der technischen Validierung.");
        const reportArea = document.getElementById('validation-report-area');
        if(reportArea) {
            reportArea.className = 'error';
            let reportHTML = '<strong>Validierung fehlgeschlagen!</strong> Bitte korrigieren Sie die folgenden Fehler:<ul style="margin-top: 10px;">';
            validationResult.errors.forEach(error => {
                reportHTML += `<li>${error}</li>`;
            });
            reportHTML += '</ul>';
            reportArea.innerHTML = reportHTML;
            reportArea.style.display = 'block';
        }
        return;
    }

    const gesamtdatensatz = {
        SimulationsEinheit_Metadaten: p1ResponseData,
        Parameter_Liste: p2ResponseData,
        Regelwerk: p3ResponseData,
        ErgebnisProfile: p4ResponseData
    };
    
    const gesamtdatensatzJsonString = JSON.stringify(gesamtdatensatz, null, 2);

    let template = promptTemplates['SimONA_P5_QualitaetsAudit'];
    if (!template) {
        alert("Prompt-Vorlage für SimONA_P5_QualitaetsAudit nicht gefunden.");
        return;
    }

    const normtextAuszug = getInputValue("normtext");
    template = template.replace(/{{NORMTEXT_AUSZUG}}/g, normtextAuszug)
                       .replace(/{{P1_P4_DATENSATZ_JSON}}/g, gesamtdatensatzJsonString);

    const promptTextarea = document.getElementById('SimONA_P5_QualitaetsAudit_prompt');
    const outputArea = document.getElementById('SimONA_P5_QualitaetsAudit_output_area');

    if (promptTextarea && outputArea) {
        promptTextarea.value = template;
        outputArea.style.display = 'block';
        console.log("Prompt für P5 Qualitäts-Audit erfolgreich generiert.");
    } else {
        console.error("Fehler: Textarea oder Output-Bereich für SimONA_P5_QualitaetsAudit nicht gefunden.");
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
    
    let sql = `-- SQL für QualitaetsAudit (basierend auf P5 Audit)\n`;
    sql += `START TRANSACTION;\n\n`;
    sql += `INSERT INTO QualitaetsAudit (\n`;
    sql += `  FK_Einheit_ID, Audit_Datum, Audit_Typ, Audit_JSON, Gesamt_Bewertung,\n`;
    sql += `  Anzahl_Kritische_Fehler, Anzahl_Warnungen, Anzahl_Empfehlungen\n`;
    sql += `) VALUES (\n`;
    sql += `  ${escapeSqlString(currentSimulationsEinheitID)},\n`;
    sql += `  ${escapeSqlString(auditDate)},\n`;
    sql += `  'P5_Fachliches_Qualitaetsaudit',\n`;
    sql += `  ${escapeSqlString(JSON.stringify(auditData))},\n`;
    sql += `  ${escapeSqlString(auditData.Gesamt_Bewertung || 'Unbekannt')},\n`;
    sql += `  ${auditData.Anzahl_Kritische_Fehler || 0},\n`;
    sql += `  ${auditData.Anzahl_Warnungen || 0},\n`;
    sql += `  ${auditData.Anzahl_Empfehlungen || 0}\n`;
    sql += `);\n\n`;
    sql += `COMMIT;\n`;

    displayGeneratedSql(sql, 'gesamtesSqlOutput', true);
    alert("P5 Audit-Ergebnis wurde als SQL generiert und dem Gesamtausgabefeld hinzugefügt.");
}

// Re-Audit Workflow
function checkForAndLoadReAuditData() {
    const einheitIdToLoad = localStorage.getItem('simona_reaudit_id');

    if (einheitIdToLoad) {
        localStorage.removeItem('simona_reaudit_id');
    } else {
        console.log("Normaler Start des Assemblers.");
        return; 
    }

    console.log(`Re-Audit Modus gestartet. Lade Daten für: ${einheitIdToLoad}`);
    
    // UI deaktivieren während des Ladens
    document.querySelectorAll('input, textarea, button').forEach(el => el.disabled = true);

    // Simulation des Datenladens (ersetzen Sie dies mit echtem API-Call)
    setTimeout(() => {
        // Hier würden die Daten aus der Datenbank geladen
        alert(`Daten für ${einheitIdToLoad} wurden geladen. (Simulation)`);
        
        // Banner anzeigen
        const banner = document.getElementById('status-banner');
        if (banner) {
            banner.innerHTML = `RE-AUDIT MODUS: Daten für <strong>${einheitIdToLoad}</strong> geladen.`;
            banner.style.display = 'block';
        }

        // Irrelevante Sektionen ausblenden
        const sectionsToHide = ['step-0-5', 'step-1', 'step-2', 'step-3', 'step-3-5', 'step-4', 'step-5', 'step-6'];
        sectionsToHide.forEach(id => {
            const section = document.getElementById(id);
            if (section) section.style.display = 'none';
        });

        // Zu Schritt 6.5 scrollen
        const step65 = document.getElementById('step-6-5');
        if (step65) step65.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // UI wieder aktivieren
        document.querySelectorAll('input, textarea, button').forEach(el => el.disabled = false);
    }, 1000);
}

// Initialisierung
window.onload = () => {
    if(getInputValue("gesetz") && getInputValue("paragraph")) {
        generateSimulationsEinheitID();
    }
    checkForAndLoadReAuditData();
};