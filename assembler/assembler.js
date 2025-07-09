    // Globale Variablen für zwischengespeicherte, geparste KI-Antworten
	// Stand 07.06.2025 08:44
    let currentSimulationsEinheitID = "";
    let p1ResponseData = null; 
    let p2ResponseData = null; 
    let validierteErgebnisProfileVorschlaege = []; 
    let p2_7ResponseData = null;
    let p3ResponseData = null; 
    let p4ResponseData = null; 
    let p0_5ResponseData = null;
    let analysierteAbsatzIndizes = new Set();

// NEU: Event-Listener für die P0.5-Antwort-Textarea
document.getElementById('SimONA_P0_5_ParagraphAnalyse_response').addEventListener('blur', function() {
    try {
        if (this.value.trim() === "") { 
            p0_5ResponseData = null; 
            document.getElementById('absatz-selection-area').innerHTML = ''; // Liste leeren
            return; 
        }
        p0_5ResponseData = JSON.parse(this.value);
        console.log("P0.5 Response Data (Paragraphen-Analyse) gespeichert:", p0_5ResponseData);
        // Nach dem erfolgreichen Parsen, rufe die Funktion auf, um die Auswahl-UI zu erstellen
        renderAbsatzSelection();
    } catch(e) {
        p0_5ResponseData = null;
        document.getElementById('absatz-selection-area').innerHTML = '<p style="color:red;">Fehler: Die eingefügte P0.5-Antwort ist kein valides JSON-Objekt.</p>';
        if(this.value.trim() !== "") alert("P0.5 Antwort ist kein valides JSON-Objekt.");
    }
});

// In assembler.js
function renderAbsatzSelection() {
    if (!p0_5ResponseData || !p0_5ResponseData.metadaten || !p0_5ResponseData.struktur) {
        alert("Die Daten der Paragraphen-Analyse sind unvollständig. 'metadaten' oder 'struktur' fehlt.");
        return;
    }

    // 1. Metadaten aus der P0.5-Analyse in die Basis-Input-Felder eintragen
    const meta = p0_5ResponseData.metadaten;
    document.getElementById('gesetz').value = meta.gesetz_abkuerzung || '';
    document.getElementById('paragraph').value = meta.paragraph_nummer || '';
    document.getElementById('absatz').value = '';
    document.getElementById('satz').value = '';
    const normtextTextarea = document.getElementById('normtext');
    if (!normtextTextarea.value) { // Nur befüllen, wenn Feld leer war, um User-Eingabe nicht zu überschreiben
        normtextTextarea.value = p0_5ResponseData.struktur.map(a => a.absatz_volltext).join('\n\n');
    }

    // === HIER IST DIE ERGÄNZUNG: Alten Button deaktivieren ===
    const originalIdButton = document.querySelector('#normtext + div > button:first-child');
    if (originalIdButton && originalIdButton.textContent.includes("SimulationsEinheit_ID generieren")) {
        originalIdButton.disabled = true;
        originalIdButton.style.opacity = '0.5';
        originalIdButton.style.cursor = 'not-allowed';
        originalIdButton.title = 'ID wird automatisch generiert, wenn Sie unten einen Absatz auswählen.';
    }
    // =======================================================

    // 2. Eine Liste von Buttons für jeden gefundenen Absatz erstellen
    const selectionArea = document.getElementById('absatz-selection-area');
    selectionArea.innerHTML = '<h4>Gefundene Absätze (bitte zur Detail-Analyse auswählen):</h4>';
    
    const absatzListe = document.createElement('div');
    p0_5ResponseData.struktur.forEach((absatz, index) => {
        const absatzButton = document.createElement('button');
        absatzButton.textContent = `Absatz ${absatz.absatz_nummer} analysieren`;
        absatzButton.style.marginRight = '10px';
        absatzButton.style.marginBottom = '10px';
        
        absatzButton.addEventListener('click', () => {
            selectAbsatzForAnalysis(index);
            absatzListe.querySelectorAll('button').forEach(btn => {
                btn.style.backgroundColor = '';
                btn.style.fontWeight = 'normal';
            });
            absatzButton.style.backgroundColor = '#27ae60';
            absatzButton.style.fontWeight = 'bold';
        });

        absatzListe.appendChild(absatzButton);
    });

    selectionArea.appendChild(absatzListe);
}


// NEU: Funktion, die aufgerufen wird, wenn ein Absatz-Button geklickt wird
function selectAbsatzForAnalysis(absatzIndex) {
    if (!p0_5ResponseData || !p0_5ResponseData.struktur[absatzIndex]) {
        console.error("Fehler: Der ausgewählte Absatz konnte in den P0.5-Daten nicht gefunden werden.");
        return;
    }

    // Füge den Index zum Set der analysierten Absätze hinzu
    analysierteAbsatzIndizes.add(absatzIndex);

    const gewaehlterAbsatz = p0_5ResponseData.struktur[absatzIndex];
    document.getElementById('absatz').value = gewaehlterAbsatz.absatz_nummer;
    document.getElementById('normtext').value = gewaehlterAbsatz.absatz_volltext;
    document.getElementById('satz').value = '';
    
    clearAllTextareasAndSuggestions();
    generateSimulationsEinheitID();

    // Rufe die neue Funktion auf, um den Navigations-Button zu aktualisieren
    updateNextStepButton();

    console.log(`Absatz ${gewaehlterAbsatz.absatz_nummer} zur Analyse ausgewählt und Felder befüllt.`);
    alert(`Absatz ${gewaehlterAbsatz.absatz_nummer} wurde ausgewählt. Sie können nun mit der Detail-Analyse (ab Schritt 1) für diesen Absatz fortfahren.`);
}



function updateNextStepButton() {
    const navFooter = document.getElementById('navigation-footer');
    const nextButton = document.getElementById('next-step-button');

    if (!navFooter || !nextButton || !p0_5ResponseData) {
        return; // Nichts tun, wenn Elemente nicht bereit sind
    }

    const alleAbsaetzeAnalysiert = (analysierteAbsatzIndizes.size >= p0_5ResponseData.struktur.length);

    if (alleAbsaetzeAnalysiert) {
        nextButton.textContent = "Weiteren Paragraphen analysieren";
    } else {
        nextButton.textContent = "Nächsten Absatz auswählen";
    }

    navFooter.style.display = 'block'; // Mache den Footer mit dem Button sichtbar
}

function scrollToNextStep() {
    const alleAbsaetzeAnalysiert = (analysierteAbsatzIndizes.size >= p0_5ResponseData.struktur.length);
    let targetElement;

    if (alleAbsaetzeAnalysiert) {
        // Scrolle ganz nach oben zu den Basisinformationen
        targetElement = document.querySelector('.container h1');
    } else {
        // Scrolle hoch zur Absatz-Auswahl
        targetElement = document.getElementById('absatz-selection-area');
    }

    if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

    // --- Helper Functions ---
    function getInputValue(id) {
        const element = document.getElementById(id);
        return element ? element.value.trim() : ""; // Sicherstellen, dass Element existiert
    }

    function getNormteilBezeichnung() {
        let normteil = "";
        const paragraphVal = getInputValue("paragraph");
        if (paragraphVal) normteil += `§ ${paragraphVal}`;
        
        const absatzVal = getInputValue("absatz");
        if (absatzVal) normteil += ` Abs. ${absatzVal}`;
        
        const satzVal = getInputValue("satz");
        if (satzVal) normteil += ` Satz ${satzVal}`;
        return normteil;
    }
    
// In assembler.js - ERSETZEN Sie die bestehende Funktion

function generateSimulationsEinheitID() {
    const gesetz = getInputValue("gesetz").toUpperCase().replace(/[^A-Z0-9]/gi, '');
    const paragraph = getInputValue("paragraph").replace(/[^a-z0-9]/gi, '');
    const absatz = getInputValue("absatz").replace(/[^a-z0-9]/gi, '');
    const satz = getInputValue("satz").replace(/[^a-z0-9]/gi, '');
    
    // NEU: Den Wert aus dem neuen Varianten-Feld holen und bereinigen
    let variante = getInputValue("analyseVariante").trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');

    if (!gesetz || !paragraph) {
        alert("Bitte geben Sie mindestens 'Gesetz' und 'Paragraph' an, um eine ID zu generieren.");
        return;
    }
    
    // Stelle sicher, dass eine Variante angegeben ist. Gib einen Standardwert, falls leer.
    if (!variante) {
        variante = "Standard"; // Ein Fallback-Wert, falls das Feld leer ist
        document.getElementById('analyseVariante').value = variante; // Setze den Wert auch im UI
    }

    // Baue die Basis-ID zusammen
    let id = `SE_${gesetz}_${paragraph}`;
    if (absatz) id += `_Abs${absatz}`;
    if (satz) id += `_S${satz}`;

    // NEU: Die bereinigte Variante an die ID anhängen, getrennt durch "__v_"
    id += `__v_${variante}`;

    // Speichere die neue ID und zeige sie an
    currentSimulationsEinheitID = id;
    document.getElementById("simulationsEinheitIDDisplay").textContent = currentSimulationsEinheitID;
    console.log("Neue, variantenspezifische SimulationsEinheit_ID generiert:", currentSimulationsEinheitID);
}

    function showPrompt(promptName) {
        console.log("showPrompt aufgerufen für:", promptName);
        const promptText = assemblePromptText(promptName); // assemblePromptText enthält jetzt die Debug-Logs
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
        } else {
            console.warn("Kein PromptText für", promptName, "erzeugt oder Fehler in assemblePromptText, Anzeige nicht aktualisiert.");
        }
    }

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
	    p2_7ResponseData.forEach(konklusionEntry => {
	        const targetParam = p2ResponseData.find(param => param.Parameter_ID === konklusionEntry.Parameter_ID);
	        if (targetParam) {
	            targetParam.Konklusive_Antworten_Info = konklusionEntry.Konklusive_Antworten_Info;
	            mergeCount++;
	        } else {
	            console.warn(`P2.7 Merge: Parameter_ID "${konklusionEntry.Parameter_ID}" aus P2.7 nicht in P2-Daten gefunden.`);
	        }
	    });

	    if (mergeCount > 0) {
	        alert(`${mergeCount} Parameter-Konklusionsinformationen wurden erfolgreich mit den P2-Daten verbunden.`);
	        console.log("P2 Daten nach Merge mit P2.7:", p2ResponseData);
	    } else if (p2_7ResponseData.length > 0) {
	        alert("Keine der P2.7 Konklusionsinformationen konnte zu den P2-Parametern zugeordnet werden. Prüfen Sie die Parameter_IDs.");
	    } else {
	        alert("Keine P2.7 Konklusionsdaten zum Verbinden vorhanden (P2.7-Antwort war möglicherweise ein leeres Array).");
	    }
	}

// In assembler.js
function assemblePromptText(promptName) {
    console.log("assemblePromptText gestartet für:", promptName); 

    const gesetzAbk = getInputValue("gesetz");
    const paragraphVal = getInputValue("paragraph");
    const paragraphNum = paragraphVal.replace(/[^a-z0-9]/gi, ''); 
    const absatzVal = getInputValue("absatz");
    const absatzNum = absatzVal.replace(/[^a-z0-9]/gi, '');    
    const satzVal = getInputValue("satz");
    const normteilBezeichnung = getNormteilBezeichnung();
    const quelleUrl = getInputValue("quelleUrl");
    const normtextAuszug = getInputValue("normtext"); // Holt den Inhalt aus der Haupt-Textarea
    
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

    // Ersetzt alle Platzhalter
    template = template.replace(/{{GESETZ_ABK}}/g, gesetzAbk)
                       .replace(/{{NORMTEIL_BEZEICHNUNG}}/g, normteilBezeichnung)
                       .replace(/{{QUELLE_URL}}/g, quelleUrl)
                       .replace(/{{NORMTEXT_AUSZUG}}/g, normtextAuszug)
                       // === HIER IST DIE KORREKTUR ===
                       .replace(/{{VOLLSTAENDIGER_PARAGRAPHENTEXT_INKL_UEBERSCHRIFTEN}}/g, normtextAuszug)
                       // =============================
                       .replace(/{{PARA_NUM}}/g, paragraphNum) 
                       .replace(/{{ABS_NUM}}/g, absatzNum)     
                       .replace(/{{SIM_EINHEIT_ID}}/g, currentSimulationsEinheitID);
    
    // ... (der Rest der Funktion mit den spezifischen Ersetzungen für P2, P2.5 etc. bleibt unverändert) ...
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
            // ... (Ihre bestehende Logik für P3) ...
        } else if (promptName === 'SimONA_P4_ErgebnisProfilDetails') {
            // ... (Ihre bestehende Logik für P4) ...
        }
    } catch (e) {
        alert("Fehler beim Aufbereiten der Daten für den Prompt-Platzhalter: " + e.message);
        return null;
    }
    
    return template;
}
    
    // Event Listeners für 'blur'
    document.getElementById('SimONA_P1_EinheitMetadaten_response').addEventListener('blur', function() {
        try {
            if (this.value.trim() === "") { p1ResponseData = null; console.log("P1 Response Data gelöscht."); return; }
            p1ResponseData = JSON.parse(this.value);
            console.log("P1 Response Data (Objekt) gespeichert:", p1ResponseData);
        } catch(e) {
            p1ResponseData = null;
            if(this.value.trim() !== "") alert("P1 Antwort ist kein valides JSON.");
        }
    });
    document.getElementById('SimONA_P2_ParameterExtraktion_response').addEventListener('blur', function() {
        try {
            if (this.value.trim() === "") { p2ResponseData = null; console.log("P2 Response Data gelöscht."); return; }
            p2ResponseData = JSON.parse(this.value);
            console.log("P2 Response Data (Array) gespeichert:", p2ResponseData);
        } catch(e) {
            p2ResponseData = null;
            if(this.value.trim() !== "") alert("P2 Antwort ist kein valides JSON-Array.");
        }
    });
    document.getElementById('SimONA_P2_5_ErgebnisProfilVorschlaege_response').addEventListener('blur', function() {
        try {
            if (this.value.trim() === "") { console.log("P2.5 Response Textarea geleert."); return; }
            JSON.parse(this.value); 
            console.log("P2.5 Response Textarea enthält valides JSON (wird für 'Anzeigen & Bearbeiten' genutzt).");
        } catch(e) {
             if(this.value.trim() !== "") alert("P2.5 Antwort ist kein valides JSON-Array.");
        }
    });

	document.getElementById('SimONA_P2_7_ParameterKonklusionDetail_response').addEventListener('blur', function() {
	    try {
	        if (this.value.trim() === "") { p2_7ResponseData = null; console.log("P2.7 Response Data gelöscht."); return; }
	        p2_7ResponseData = JSON.parse(this.value);
	        console.log("P2.7 Response Data (Array) gespeichert:", p2_7ResponseData);
	        // Optional: Direkter Merge-Aufruf oder Hinweis an den User, den Merge-Button zu klicken
	        // mergeP2_7Data(); 
	    } catch(e) {
	        p2_7ResponseData = null;
	        if(this.value.trim() !== "") alert("P2.7 Antwort ist kein valides JSON-Array.");
	    }
	});

    document.getElementById('SimONA_P3_RegelGenerierung_response').addEventListener('blur', function() {
        try {
            if (this.value.trim() === "") { p3ResponseData = null; console.log("P3 Response Data gelöscht."); return; }
            p3ResponseData = JSON.parse(this.value);
            console.log("P3 Response Data (Array) gespeichert:", p3ResponseData);
        } catch(e) {
            p3ResponseData = null;
            if(this.value.trim() !== "") alert("P3 Antwort ist kein valides JSON-Array.");
        }
    });
     document.getElementById('SimONA_P4_ErgebnisProfilDetails_response').addEventListener('blur', function() {
        try {
            if (this.value.trim() === "") { p4ResponseData = null; console.log("P4 Response Data gelöscht."); return; }
            p4ResponseData = JSON.parse(this.value); 
            console.log("P4 Response Data (Array) gespeichert:", p4ResponseData);
        } catch(e) {
            p4ResponseData = null;
            if(this.value.trim() !== "") alert("P4 Antwort ist kein valides JSON-Array.");
        }
    });

    window.onload = () => {
        if(getInputValue("gesetz") && getInputValue("paragraph")) {
            generateSimulationsEinheitID();
        }
    };

    // --- P2.5 Editor Funktionen ---
// --- (Alle anderen JavaScript-Funktionen und globalen Variablen bleiben wie sie sind) ---
    // let validierteErgebnisProfileVorschlaege = []; // Bereits vorhanden

    // P2.5 Editor Funktionen - ERWEITERT

    function displayAndPrepareP2_5Suggestions() {
        const p2_5ResponseJsonString = getInputValue('SimONA_P2_5_ErgebnisProfilVorschlaege_response');
        const editorArea = document.getElementById('p2_5_suggestions_editor_area');
        const addNewArea = document.getElementById('p2_5_add_new_suggestion_area');
        
        editorArea.innerHTML = ''; 
        addNewArea.style.display = 'none'; // Eingabebereich für neue Vorschläge erstmal ausblenden
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
            ))) { // Prüfung angepasst, um leere Arrays zu erlauben
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
            redrawSuggestionList(); // Separate Funktion zum Neuzeichnen der Liste
        }
        document.getElementById('addNewSuggestionButton').style.display = 'inline-block'; // Button zum Hinzufügen anzeigen
    }

    function redrawSuggestionList() {
        const editorArea = document.getElementById('p2_5_suggestions_editor_area');
        // Vorhandenen Inhalt (bis auf die Infobox) entfernen oder nur die Liste neu aufbauen
        let infoBox = editorArea.querySelector('p[style*="font-style:italic"]');
        editorArea.innerHTML = ''; // Alten Inhalt leeren
        
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
        if(infoBox) editorArea.appendChild(infoBox); // Infobox wieder anfügen, falls sie existierte
         else if (validierteErgebnisProfileVorschlaege.length > 0 || suggestions.length > 0) { // 'suggestions' hier nicht definiert, Korrektur unten
             editorArea.innerHTML += '<p style="font-style:italic; font-size:0.9em;">Die oben gelisteten Vorschläge werden als Grundlage für Prompt 3 und 4 verwendet. Bearbeiten Sie bei Bedarf.</p>';
         }
    }


    function enableSuggestionEdit(listItemElement, index) {
        const suggestion = validierteErgebnisProfileVorschlaege[index];
        listItemElement.innerHTML = ''; 

        const idLabel = document.createElement('label');
        idLabel.textContent = "Vorgeschlagene ID (bearbeitbar):";
        const idInput = document.createElement('input');
        idInput.type = 'text';
        idInput.id = `edit_suggestion_id_${index}`; // Eindeutige ID für das Input-Feld
        idInput.value = suggestion.Vorgeschlagene_ErgebnisProfil_ID_Referenz;
        
        const descLabel = document.createElement('label');
        descLabel.textContent = "Vorgeschlagene Beschreibung (bearbeitbar):";
        const descTextarea = document.createElement('textarea');
        descTextarea.rows = 3; 
        descTextarea.id = `edit_suggestion_desc_${index}`; // Eindeutige ID
        descTextarea.value = suggestion.Vorgeschlagene_Kurzbeschreibung_Ergebnis;
        
        listItemElement.appendChild(idLabel);
        listItemElement.appendChild(idInput);
        listItemElement.appendChild(descLabel);
        listItemElement.appendChild(descTextarea);

        const saveButton = document.createElement('button');
        saveButton.textContent = 'Speichern';
        saveButton.onclick = function() { saveSuggestionEdit(listItemElement, index, idInput, descTextarea); };

        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Abbrechen';
        cancelButton.onclick = function() { renderSingleSuggestion(listItemElement, index); }; 

        listItemElement.appendChild(saveButton);
        listItemElement.appendChild(cancelButton);
    }

    function saveSuggestionEdit(listItemElement, index, idInput, descTextarea) {
        const newId = idInput.value.trim();
        const newDesc = descTextarea.value.trim();

        if (!newId || !newDesc) {
            alert("ID und Beschreibung dürfen nicht leer sein.");
            return;
        }
        // Prüfen, ob die ID (außer für das aktuell bearbeitete Element) bereits existiert
        if (validierteErgebnisProfileVorschlaege.some((s, i) => i !== index && s.Vorgeschlagene_ErgebnisProfil_ID_Referenz === newId)) {
            alert("Diese ErgebnisProfil-ID existiert bereits. Bitte wählen Sie eine eindeutige ID.");
            return;
        }

        validierteErgebnisProfileVorschlaege[index].Vorgeschlagene_ErgebnisProfil_ID_Referenz = newId;
        validierteErgebnisProfileVorschlaege[index].Vorgeschlagene_Kurzbeschreibung_Ergebnis = newDesc;
        
        console.log("Gespeicherte/Validierte ErgebnisProfile Vorschläge:", validierteErgebnisProfileVorschlaege);
        renderSingleSuggestion(listItemElement, index);
    }
    
    function renderSingleSuggestion(listItemElement, index) { 
        const suggestion = validierteErgebnisProfileVorschlaege[index];
        listItemElement.innerHTML = ''; 

        const idAnzeigeDiv = document.createElement('div');
        idAnzeigeDiv.innerHTML = `<strong>Vorgeschlagene ID:</strong> <span class="display-text id-text">${suggestion.Vorgeschlagene_ErgebnisProfil_ID_Referenz}</span>`;
        
        const beschreibungAnzeigeDiv = document.createElement('div');
        beschreibungAnzeigeDiv.innerHTML = `<strong>Vorgeschlagene Beschreibung:</strong> <span class="display-text desc-text">${suggestion.Vorgeschlagene_Kurzbeschreibung_Ergebnis}</span>`;

        const editButton = document.createElement('button');
        editButton.textContent = 'Bearbeiten';
        editButton.onclick = function() { enableSuggestionEdit(listItemElement, index); }; 
        
        const deleteButton = document.createElement('button'); // NEUER LÖSCHEN-BUTTON
        deleteButton.textContent = 'Löschen';
        deleteButton.style.backgroundColor = '#e74c3c'; // Rote Farbe für Löschen
        deleteButton.onclick = function() { deleteSuggestion(index); };

        listItemElement.appendChild(idAnzeigeDiv);
        listItemElement.appendChild(beschreibungAnzeigeDiv);
        listItemElement.appendChild(editButton);
        listItemElement.appendChild(deleteButton); // Löschen-Button hinzufügen
    }

    // NEUE Funktion zum Löschen eines Vorschlags
    function deleteSuggestion(index) {
        if (confirm(`Möchten Sie den ErgebnisProfil-Vorschlag "${validierteErgebnisProfileVorschlaege[index].Vorgeschlagene_ErgebnisProfil_ID_Referenz}" wirklich löschen?`)) {
            validierteErgebnisProfileVorschlaege.splice(index, 1); // Entfernt das Element am Index
            redrawSuggestionList(); // Zeichnet die gesamte Liste neu
            console.log("Vorschlag gelöscht. Aktuelle Vorschläge:", validierteErgebnisProfileVorschlaege);
        }
    }

    // NEUE Funktionen zum Hinzufügen eigener Vorschläge
    function addNewSuggestionInterface() {
        const paragraphNum = getInputValue("paragraph").replace(/[^a-z0-9]/gi, '');
        const absatzNum = getInputValue("absatz").replace(/[^a-z0-9]/gi, '');
        
        // Eindeutige ID vorschlagen
        const vorgeschlageneId = `EP_${paragraphNum || 'X'}_${absatzNum || 'Y'}_UserDefined_${Date.now().toString().slice(-5)}`;
        
        document.getElementById('new_suggestion_id').value = vorgeschlageneId;
        document.getElementById('new_suggestion_desc').value = '';
        document.getElementById('p2_5_add_new_suggestion_area').style.display = 'block';
        document.getElementById('new_suggestion_id').focus();
    }

    function saveNewSuggestion() {
        const newId = getInputValue('new_suggestion_id').trim();
        const newDesc = getInputValue('new_suggestion_desc').trim();

        if (!newId || !newDesc) {
            alert("ID und Beschreibung für den neuen Vorschlag dürfen nicht leer sein.");
            return;
        }
        // Prüfen, ob die ID bereits existiert
        if (validierteErgebnisProfileVorschlaege.some(s => s.Vorgeschlagene_ErgebnisProfil_ID_Referenz === newId)) {
            alert("Diese ErgebnisProfil-ID existiert bereits. Bitte wählen Sie eine eindeutige ID.");
            return;
        }

        validierteErgebnisProfileVorschlaege.push({
            Vorgeschlagene_ErgebnisProfil_ID_Referenz: newId,
            Vorgeschlagene_Kurzbeschreibung_Ergebnis: newDesc
        });
        
        console.log("Neuer Vorschlag hinzugefügt. Aktuelle Vorschläge:", validierteErgebnisProfileVorschlaege);
        redrawSuggestionList(); // Liste neu zeichnen
        cancelNewSuggestion(); // Eingabefelder für neuen Vorschlag leeren und ausblenden
    }

    function cancelNewSuggestion() {
        document.getElementById('new_suggestion_id').value = '';
        document.getElementById('new_suggestion_desc').value = '';
        document.getElementById('p2_5_add_new_suggestion_area').style.display = 'none';
    }
    
    // Korrektur in redrawSuggestionList (Bezug auf 'suggestions' war fehlerhaft)
    function redrawSuggestionList() {
        const editorArea = document.getElementById('p2_5_suggestions_editor_area');
        const existingInfoBox = editorArea.querySelector('p[style*="font-style:italic"]');
        editorArea.innerHTML = ''; // Alten Inhalt leeren
        
        if (validierteErgebnisProfileVorschlaege.length === 0) {
             editorArea.innerHTML = '<p>Keine Ergebnisprofil-Vorschläge vorhanden. Sie können manuell welche hinzufügen.</p>';
        } else {
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
        // Infobox wieder hinzufügen, wenn sie existierte oder wenn es jetzt Einträge gibt
        if (existingInfoBox) {
            editorArea.appendChild(existingInfoBox);
        } else if (validierteErgebnisProfileVorschlaege.length > 0) {
             const newInfoBox = document.createElement('p');
             newInfoBox.style.fontStyle = 'italic';
             newInfoBox.style.fontSize = '0.9em';
             newInfoBox.textContent = 'Die oben gelisteten Vorschläge werden als Grundlage für Prompt 3 und 4 verwendet. Bearbeiten Sie bei Bedarf.';
             editorArea.appendChild(newInfoBox);
        }
    }

    // --- SQL Generierungsfunktionen ---
    function copyToClipboard(textareaId, buttonElement) {
        const textarea = document.getElementById(textareaId);
        if (textarea && textarea.value) {
            navigator.clipboard.writeText(textarea.value)
                .then(() => {
                    const originalButtonText = buttonElement.textContent;
                    buttonElement.textContent = 'Kopiert!';
                    const originalBG = buttonElement.style.backgroundColor;
                    buttonElement.style.backgroundColor = '#82e0aa';
                    setTimeout(() => {
                        buttonElement.textContent = originalButtonText;
                        buttonElement.style.backgroundColor = originalBG;
                    }, 2000); 
                })
                .catch(err => {
                    console.error('Fehler beim Kopieren in die Zwischenablage: ', err);
                    alert('Fehler beim Kopieren. Bitte manuell kopieren.\nIhr Browser unterstützt diese Funktion möglicherweise nicht oder die Berechtigung wurde verweigert.');
                });
        } else {
            alert('Kein Text zum Kopieren vorhanden in Feld: ' + textareaId);
        }
    }

    function escapeSqlString(value) {
        if (value === null || value === undefined) {
            return 'NULL';
        }
        if (typeof value === 'number') {
            return value;
        }
        if (typeof value === 'boolean') {
            return value ? 'TRUE' : 'FALSE'; 
        }
        return "'" + String(value).replace(/'/g, "''") + "'";
    }

    function displayGeneratedSql(sqlCommands, targetTextareaId = 'gesamtesSqlOutput', append = false) {
        const outputTextarea = document.getElementById(targetTextareaId);
        if(outputTextarea){ // Sicherstellen, dass das Element existiert
            if (append && outputTextarea.value.trim() !== "") { 
                outputTextarea.value += '\n\n-- ========= NÄCHSTER DATENBLOCK =========\n\n' + sqlCommands.trim() + '\n';
            } else {
                outputTextarea.value = sqlCommands.trim() + '\n';
            }
            outputTextarea.scrollTop = outputTextarea.scrollHeight;
        } else {
            console.error("Ausgabe-Textarea nicht gefunden:", targetTextareaId);
        }
    }

    function clearSqlOutput() {
        const outputTextarea = document.getElementById('gesamtesSqlOutput');
        if(outputTextarea) outputTextarea.value = '';
    }

function assembleAndShowP5AuditPrompt() {
    console.log("Starte Vorbereitung für P5 Qualitäts-Audit-Prompt...");

    // Prüfe zuerst, ob die Basisdaten für ein Audit überhaupt vorhanden sind.
    if (!p1ResponseData || !p2ResponseData || !p3ResponseData || !p4ResponseData) {
        alert("Fehler: Für das Qualitäts-Audit müssen die Daten aus den Schritten P1 bis P4 vollständig vorliegen. Bitte führen Sie die vorherigen Schritte aus.");
        return;
    }

    // Führe die technische Validierung durch, bevor ein fachliches Audit Sinn macht.
    const validationResult = validateGesamtdatensatz();
    if (!validationResult.isValid) {
        alert("Bitte beheben Sie zuerst die Fehler aus der technischen Validierung (Schritt 7), bevor Sie ein fachliches Audit durchführen.");
        // Optional: Zeige den Bericht aus Schritt 7 erneut an.
        const reportArea = document.getElementById('validation-report-area');
        if(reportArea) {
             reportArea.className = 'error';
             let reportHTML = '<strong>Validierung fehlgeschlagen!</strong> Bitte korrigieren Sie die folgenden Fehler, bevor Sie das SQL generieren oder ein Audit durchführen:<ul style="margin-top: 10px;">';
             validationResult.errors.forEach(error => {
                 reportHTML += `<li>${error}</li>`;
             });
             reportHTML += '</ul>';
             reportArea.innerHTML = reportHTML;
             reportArea.style.display = 'block';
        }
        return;
    }

    // Stelle den kompletten Datensatz als ein großes JSON-Objekt zusammen.
    const gesamtdatensatz = {
        SimulationsEinheit_Metadaten: p1ResponseData,
        Parameter_Liste: p2ResponseData,
        Regelwerk: p3ResponseData,
        ErgebnisProfile: p4ResponseData
    };
    
    // Konvertiere das Objekt in einen formatierten String für den Prompt.
    const gesamtdatensatzJsonString = JSON.stringify(gesamtdatensatz, null, 2);

    // Hole das Prompt-Template
    let template = promptTemplates['SimONA_P5_QualitaetsAudit'];
    if (!template) {
        alert("Prompt-Vorlage für SimONA_P5_QualitaetsAudit nicht gefunden.");
        return;
    }

    // Ersetze die Platzhalter im Template.
    const normtextAuszug = getInputValue("normtext");
    template = template.replace(/{{NORMTEXT_AUSZUG}}/g, normtextAuszug)
                       .replace(/{{P1_P4_DATENSATZ_JSON}}/g, gesamtdatensatzJsonString);

    // Zeige den Prompt an
    const promptTextarea = document.getElementById('SimONA_P5_QualitaetsAudit_prompt');
    const outputArea = document.getElementById('SimONA_P5_QualitaetsAudit_output_area');

    if (promptTextarea && outputArea) {
        promptTextarea.value = template;
        outputArea.style.display = 'block';
        console.log("Prompt für P5 Qualitäts-Audit erfolgreich generiert und angezeigt.");
    } else {
        console.error("Fehler: Textarea oder Output-Bereich für SimONA_P5_QualitaetsAudit nicht im DOM gefunden.");
    }
}

function saveP5AuditResult() {
    console.log("Speichere P5 Audit-Ergebnis...");

    const auditResponseText = getInputValue('SimONA_P5_QualitaetsAudit_response');
    if (!auditResponseText) {
        alert("Fehler: Das Antwortfeld für das Audit ist leer. Es gibt nichts zu speichern.");
        return;
    }

    // Validieren, ob die Antwort valides JSON ist
    try {
        JSON.parse(auditResponseText);
    } catch (e) {
        alert("Fehler: Der Inhalt im Antwortfeld ist kein valides JSON. Bitte korrigieren Sie die Antwort der KI.");
        return;
    }
    
    const dataToSend = {
        einheitId: currentSimulationsEinheitID,
        promptText: getInputValue('SimONA_P5_QualitaetsAudit_prompt'),
        auditResponse: auditResponseText
    };

    if (!dataToSend.einheitId) {
        alert("Fehler: Es ist keine SimulationsEinheit_ID vorhanden. Das Ergebnis kann nicht zugeordnet werden.");
        return;
    }

    // Daten an das Backend senden
    fetch('save_audit.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(dataToSend)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Erfolg! " + data.message);
        } else {
            throw new Error(data.message || "Unbekannter Fehler beim Speichern.");
        }
    })
    .catch(error => {
        console.error('Fehler beim Speichern des Audits:', error);
        alert('Fehler beim Speichern des Audits: ' + error.message);
    });
}



function generateSqlForP1Data() {
        if (!p1ResponseData) {
            alert("Keine Daten aus SimONA_P1_EinheitMetadaten vorhanden. Bitte Prompt ausführen und Antwort einfügen/parsen lassen.");
            return "";
        }
        if (!currentSimulationsEinheitID) {
            alert("Bitte zuerst eine SimulationsEinheit_ID generieren (Schritt 0). Diese ID wird als Primärschlüssel benötigt.");
            return "";
        }

        let sql = `-- SQL für SimulationsEinheiten und Regelwerke (basierend auf P1 Daten)\n`;
        sql += `START TRANSACTION;\n\n`; 

        let fkEntscheidungsartSqlValue = 'NULL'; 
        if (p1ResponseData.FK_Entscheidungsart_ID_Lookup_Bezeichnung) {
             fkEntscheidungsartSqlValue = `(SELECT Entscheidungsart_ID FROM Entscheidungsarten_Lookup WHERE Bezeichnung = ${escapeSqlString(p1ResponseData.FK_Entscheidungsart_ID_Lookup_Bezeichnung)})`;
        }

        // Spaltenliste angepasst für die neuen und geänderten Felder
        sql += `INSERT INTO SimulationsEinheiten \n`;
        sql += `  (Einheit_ID, Gesetz, Gesetz_Vollname, Gesetz_Aktueller_Stand, Paragraph, Paragraph_Offizielle_Bezeichnung, Paragraf_Gesamtbeschreibung, Absatz, Satz, Kurzbeschreibung, Gesetzestext_Referenz_Link, Gesetzestext_Zitat, FK_Entscheidungsart_ID, Ermessensleitlinien_Text, Letzte_Aenderung_SimONA_Datum, Version_SimONA)\n`; // Paragraf_Gesamtbeschreibung eingefügt, Gesetz_Uebergreifende_Beschreibung entfernt
        sql += `VALUES (\n`;
        sql += `  ${escapeSqlString(currentSimulationsEinheitID)},\n`;
        sql += `  ${escapeSqlString(p1ResponseData.Gesetz)},\n`; 
        sql += `  ${escapeSqlString(p1ResponseData.Gesetz_Vollstaendiger_Name)},\n`;
        sql += `  ${escapeSqlString(p1ResponseData.Gesetz_Aktueller_Stand_Datum)},\n`;
        sql += `  ${escapeSqlString(p1ResponseData.Paragraph)},\n`; 
        sql += `  ${escapeSqlString(p1ResponseData.Paragraph_Offizielle_Bezeichnung)},\n`;
        sql += `  ${escapeSqlString(p1ResponseData.Paragraf_Uebergreifende_Kurzbeschreibung)},\n`; // NEU für Paragrafenbeschreibung
        sql += `  ${escapeSqlString(p1ResponseData.Absatz)},\n`; 
        sql += `  ${escapeSqlString(p1ResponseData.Satz)},\n`; 
        sql += `  ${escapeSqlString(p1ResponseData.Kurzbeschreibung)},\n`; 
        sql += `  ${escapeSqlString(getInputValue('quelleUrl'))},\n`;
        sql += `  ${escapeSqlString(p1ResponseData.Gesetzestext_Zitat_Analysierter_Teil)},\n`; 
        sql += `  ${fkEntscheidungsartSqlValue},\n`;
        sql += `  ${escapeSqlString(p1ResponseData.Ermessensleitlinien_Text)},\n`; 
        sql += `  CURDATE(), \n`;
        sql += `  '1.0'\n`;
        sql += `);\n\n`;

        sql += `INSERT INTO Regelwerke (Regelwerk_ID, FK_Einheit_ID, Beschreibung) VALUES (\n`;
    	sql += `  ${escapeSqlString(currentSimulationsEinheitID)}, \n`;
    	sql += `  ${escapeSqlString(currentSimulationsEinheitID)},\n`;
    	sql += `  ${escapeSqlString('Regelwerk für ' + currentSimulationsEinheitID)}\n`;
    	sql += `);\n\n`;
    
    	sql += `COMMIT;\n`;
    	return sql;
    }

    function generateSqlForP1DataToOutput() {
        const sql = generateSqlForP1Data();
        if (sql && sql.trim() !== "" && !sql.includes("noch nicht implementiert")) {
            displayGeneratedSql(sql, 'gesamtesSqlOutput', false); 
            alert("SQL für P1-Daten (SimulationsEinheiten & Regelwerke) wurde generiert und im SQL-Ausgabefeld angezeigt.");
        }
    }

    // In SimONA_Prompt_Assembler_Version_2_4.html
// ERSETZEN Sie die bestehende Funktion generateSqlForP2Data durch diese Version:
function generateSqlForP2Data() { 
    if (!p2ResponseData || !Array.isArray(p2ResponseData) || p2ResponseData.length === 0) {
        alert("Keine Parameter-Daten (aus P2-Antwort) für SQL-Generierung vorhanden.");
        return "";
    }
    if (!currentSimulationsEinheitID) {
        alert("SimulationsEinheit_ID fehlt. FK_Einheit_ID für Parameter kann nicht gesetzt werden.");
        return "";
    }
    let sql = `-- SQL für Parameter und Parameter_Antwortoptionen (basierend auf P2 Daten)\n`;
    p2ResponseData.forEach(param => {
        if (!param || typeof param.Parameter_ID !== 'string' || typeof param.Fragetext !== 'string') {
            console.warn("Ungültiges oder unvollständiges Parameter-Objekt übersprungen:", param);
            return; 
        }
        // Spaltenliste im INSERT jetzt mit KonklusiveAntwortenInfoJSON (insgesamt 14 Spalten)
        sql += `INSERT INTO Parameter (Parameter_ID, FK_Einheit_ID, Reihenfolge_Anzeige, Fragetext, Antworttyp, Begleittext, Normbezug_Detail_Parameter, Verweis_Normen_Info_Parameter, FK_Verlinkte_SimulationsEinheit_ID, IstGrundvoraussetzung, AnzeigeBedingungJSON, KonklusiveAntwortenInfoJSON, Text_Erfuellt_Pro, Text_NichtErfuellt_Contra) VALUES (\n`;
        
        sql += `  ${escapeSqlString(param.Parameter_ID)},\n`;                                 // 1. Parameter_ID
        sql += `  ${escapeSqlString(currentSimulationsEinheitID)},\n`;                         // 2. FK_Einheit_ID
        sql += `  ${param.Reihenfolge_Anzeige !== undefined && param.Reihenfolge_Anzeige !== null ? parseInt(param.Reihenfolge_Anzeige, 10) : 'NULL'},\n`; // 3. Reihenfolge_Anzeige
        sql += `  ${escapeSqlString(param.Fragetext)},\n`;                                     // 4. Fragetext
        sql += `  ${escapeSqlString(param.Antworttyp)},\n`;                                    // 5. Antworttyp
        sql += `  ${escapeSqlString(param.Begleittext)},\n`;                                   // 6. Begleittext
        sql += `  ${escapeSqlString(param.Normbezug_Detail_Parameter)},\n`;                    // 7. Normbezug_Detail_Parameter
        sql += `  ${escapeSqlString(param.Verweis_Normen_Info_Parameter)},\n`;                 // 8. Verweis_Normen_Info_Parameter
        sql += `  ${escapeSqlString(param.FK_Verlinkte_SimulationsEinheit_ID_Platzhalter)},\n`; // 9. FK_Verlinkte_SimulationsEinheit_ID (Wert aus JSON-Schlüssel FK_Verlinkte_SimulationsEinheit_ID_Platzhalter)
        sql += `  ${param.Ist_Grundvoraussetzung === true ? 'TRUE' : (param.Ist_Grundvoraussetzung === false ? 'FALSE' : 'NULL')},\n`; // 10. IstGrundvoraussetzung
        sql += `  ${(param.Anzeige_Bedingung && Array.isArray(param.Anzeige_Bedingung) && param.Anzeige_Bedingung.length > 0) ? escapeSqlString(JSON.stringify(param.Anzeige_Bädigung)) : 'NULL'},\n`; // 11. AnzeigeBedingungJSON
        // NEUES Feld für Konklusive_Antworten_Info:
        sql += `  ${(param.Konklusive_Antworten_Info && Array.isArray(param.Konklusive_Antworten_Info) && param.Konklusive_Antworten_Info.length > 0) ? escapeSqlString(JSON.stringify(param.Konklusive_Antworten_Info)) : 'NULL'},\n`; // 12. KonklusiveAntwortenInfoJSON
        sql += `  ${escapeSqlString(param.Text_Erfuellt_Pro)},\n`;                             // 13. Text_Erfuellt_Pro
        sql += `  ${escapeSqlString(param.Text_NichtErfuellt_Contra)}\n`;                      // 14. Text_NichtErfuellt_Contra
        sql += `);\n`;

        if (param.Antworttyp === 'AuswahlEinfach' && param.Antwortoptionen_bei_Auswahl && Array.isArray(param.Antwortoptionen_bei_Auswahl)) {
            param.Antwortoptionen_bei_Auswahl.forEach(option => {
                if (!option || typeof option.Option_Text !== 'string' || typeof option.Option_Wert_Intern !== 'string') {
                    console.warn("Ungültiges oder unvollständiges Antwortoptions-Objekt übersprungen:", option, "für Parameter_ID:", param.Parameter_ID);
                    return; 
                }
                sql += `INSERT INTO Parameter_Antwortoptionen (FK_Parameter_ID, Option_Text, Option_Wert_Intern, Reihenfolge) VALUES (\n`;
                sql += `  ${escapeSqlString(param.Parameter_ID)},\n`;
                sql += `  ${escapeSqlString(option.Option_Text)},\n`;
                sql += `  ${escapeSqlString(option.Option_Wert_Intern)},\n`;
                sql += `  ${option.Reihenfolge_Option !== undefined && option.Reihenfolge_Option !== null ? parseInt(option.Reihenfolge_Option, 10) : 'NULL'}\n`;
                sql += `);\n`;
            });
        }
        sql += `\n`;
    });
    return sql;
}


    function generateSqlForP2DataToOutput() { 
        const sql = generateSqlForP2Data(); 
        if (sql && sql.trim() !== "" && !sql.includes("noch nicht implementiert")) { 
            displayGeneratedSql(sql, 'gesamtesSqlOutput', true); 
            alert("SQL für P2-Daten (Parameter & Optionen) wurde zum SQL-Ausgabefeld hinzugefügt.");
        } else if (!sql.includes("noch nicht implementiert")) {
             // Alert kommt schon aus generateSqlForP2Data, wenn Daten fehlen
        }
    }
 


    function generateSqlForP3Data() {
        // p3ResponseData wird durch den blur-Listener auf 'SimONA_P3_RegelGenerierung_response' befüllt
        if (!p3ResponseData || !Array.isArray(p3ResponseData) || p3ResponseData.length === 0) {
            alert("Keine Regel-Daten (aus P3-Antwort) für SQL-Generierung vorhanden. Bitte Prompt P3 ausführen und Antwort einfügen/parsen lassen.");
            return "";
        }
        if (!currentSimulationsEinheitID) {
            alert("SimulationsEinheit_ID fehlt. FK_Regelwerk_ID für Regeln kann nicht gesetzt werden.");
            return "";
        }
        // Annahme: Regelwerk_ID ist identisch mit currentSimulationsEinheitID, wie in P1 SQL-Generierung festgelegt.
        const fkRegelwerkId = currentSimulationsEinheitID;

        let sql = `-- SQL für Regeln und RegelBedingungen (basierend auf P3 Daten)\n`;
        sql += `START TRANSACTION;\n\n`;

        p3ResponseData.forEach(regel => {
            if (!regel || typeof regel.Regel_Name !== 'string' || typeof regel.FK_ErgebnisProfil_ID_Referenz !== 'string') {
                console.warn("Ungültiges oder unvollständiges Regel-Objekt übersprungen:", regel);
                return; // Nächstes Element
            }

            // INSERT für Regeln
            // Regel_ID ist Auto-Increment in der DB
            sql += `INSERT INTO Regeln (FK_Regelwerk_ID, Regel_Name, Prioritaet, FK_ErgebnisProfil_ID_Referenz) VALUES (\n`;
            sql += `  ${escapeSqlString(fkRegelwerkId)},\n`;
            sql += `  ${escapeSqlString(regel.Regel_Name)},\n`;
            sql += `  ${regel.Prioritaet !== undefined && regel.Prioritaet !== null ? parseInt(regel.Prioritaet, 10) : 'NULL'},\n`;
            sql += `  ${escapeSqlString(regel.FK_ErgebnisProfil_ID_Referenz)}\n`;
            sql += `);\n\n`;

            if (regel.Bedingungen_fuer_Regel && Array.isArray(regel.Bedingungen_fuer_Regel) && regel.Bedingungen_fuer_Regel.length > 0) {
                regel.Bedingungen_fuer_Regel.forEach(bedingung => {
                    if (!bedingung || typeof bedingung.FK_Parameter_ID !== 'string' || typeof bedingung.Operator !== 'string') {
                        console.warn("Ungültiges oder unvollständiges Bedingungs-Objekt übersprungen:", bedingung, "für Regel:", regel.Regel_Name);
                        return; // Nächste Bedingung
                    }
                    // Bedingung_ID ist Auto-Increment in der DB
                    // FK_Regel_ID wird über eine Subquery ermittelt, die den Regel_Namen und die FK_Regelwerk_ID verwendet
                    sql += `INSERT INTO RegelBedingungen (FK_Regel_ID, FK_Parameter_ID, Operator, Erwarteter_Wert_Intern) VALUES (\n`;
                    sql += `  (SELECT Regel_ID FROM Regeln WHERE Regel_Name = ${escapeSqlString(regel.Regel_Name)} AND FK_Regelwerk_ID = ${escapeSqlString(fkRegelwerkId)} LIMIT 1),\n`; // LIMIT 1 für den Fall, dass Namen doch nicht unique sind, obwohl sie es sein sollten
                    sql += `  ${escapeSqlString(bedingung.FK_Parameter_ID)},\n`;
                    sql += `  ${escapeSqlString(bedingung.Operator)},\n`;
                    // Erwarteter_Wert_Intern kann String oder Boolean sein
                    let erwarteterWert = bedingung.Erwarteter_Wert_Intern;
                    if (typeof erwarteterWert === 'boolean') {
                        sql += `  ${erwarteterWert ? 'TRUE' : 'FALSE'}\n`; // MySQL akzeptiert TRUE/FALSE
                    } else {
                        sql += `  ${escapeSqlString(erwarteterWert)}\n`;
                    }
                    sql += `);\n`;
                });
                sql += `\n`; // Leerzeile nach den Bedingungen einer Regel
            } else if (regel.Bedingungen_fuer_Regel === null || (Array.isArray(regel.Bedingungen_fuer_Regel) && regel.Bedingungen_fuer_Regel.length === 0) ){
                 // Explizit leeres Bedingungen_fuer_Regel Array ist okay (z.B. für generische Negativ-Regel)
                 sql += `-- Regel '${regel.Regel_Name}' hat keine expliziten Bedingungen.\n\n`;
            } else {
                console.warn("Feld 'Bedingungen_fuer_Regel' fehlt oder hat falsches Format für Regel:", regel.Regel_Name, regel.Bedingungen_fuer_Regel);
            }
        });

        sql += `COMMIT;\n`;
        return sql;
    }

    function generateSqlForP3DataToOutput() { 
        const sql = generateSqlForP3Data(); 
        if (sql && sql.trim() !== "" && !sql.includes("noch nicht implementiert")) { 
            displayGeneratedSql(sql, 'gesamtesSqlOutput', true); // Anfügen
            alert("SQL für P3-Daten (Regeln & RegelBedingungen) wurde zum SQL-Ausgabefeld hinzugefügt.");
        } else if (!sql.includes("noch nicht implementiert")) {
            // Alert kommt ggf. schon aus generateSqlForP3Data
        }
    }



    function generateSqlForP4Data() {
        // p4ResponseData wird durch den blur-Listener auf 'SimONA_P4_ErgebnisProfilDetails_response' befüllt
        if (!p4ResponseData || !Array.isArray(p4ResponseData) || p4ResponseData.length === 0) {
            alert("Keine ErgebnisProfil-Daten (aus P4-Antwort) für SQL-Generierung vorhanden. Bitte Prompt P4 ausführen und Antwort einfügen/parsen lassen.");
            return "";
        }
        if (!currentSimulationsEinheitID) {
            alert("SimulationsEinheit_ID fehlt. FK_Einheit_ID für ErgebnisProfile kann nicht gesetzt werden.");
            return "";
        }

        let sql = `-- SQL für ErgebnisProfile (basierend auf P4 Daten)\n`;
        sql += `START TRANSACTION;\n\n`;

        p4ResponseData.forEach(profil => {
            if (!profil || typeof profil.ErgebnisProfil_ID_Referenz !== 'string' || typeof profil.Profil_Name !== 'string') {
                console.warn("Ungültiges oder unvollständiges ErgebnisProfil-Objekt übersprungen:", profil);
                return; // Nächstes Element
            }

            // Begruendung_Dynamische_Parameter_Liste ist ein Array von Strings (Parameter_IDs)
            // Für die DB speichern wir es als JSON-String oder kommaseparierten String. Hier als JSON-String.
            const dynamischeParameterListeSQL = (profil.Begruendung_Dynamische_Parameter_Liste && Array.isArray(profil.Begruendung_Dynamische_Parameter_Liste))
                ? escapeSqlString(JSON.stringify(profil.Begruendung_Dynamische_Parameter_Liste))
                : 'NULL';

            sql += `INSERT INTO ErgebnisProfile (ErgebnisProfil_ID_Referenz, FK_Einheit_ID, Profil_Name, Entscheidungstext_Kurz_Vorlage, Art_der_Entscheidung_Anzeige_Text, Einleitungstext_Begruendung_Vorlage, Begruendung_Dynamische_Parameter_Liste, Spezifischer_Ergaenzungstext_Begruendung_Vorlage, Abschlusstext_Begruendung_Vorlage) VALUES (\n`;
            sql += `  ${escapeSqlString(profil.ErgebnisProfil_ID_Referenz)}, -- Annahme: Dies ist der PK oder ein UNIQUE Key\n`;
            sql += `  ${escapeSqlString(currentSimulationsEinheitID)},\n`;
            sql += `  ${escapeSqlString(profil.Profil_Name)},\n`;
            sql += `  ${escapeSqlString(profil.Entscheidungstext_Kurz_Vorlage)},\n`;
            sql += `  ${escapeSqlString(profil.Art_der_Entscheidung_Anzeige_Text)},\n`;
            sql += `  ${escapeSqlString(profil.Einleitungstext_Begruendung_Vorlage)},\n`;
            sql += `  ${dynamischeParameterListeSQL},\n`;
            sql += `  ${escapeSqlString(profil.Spezifischer_Ergaenzungstext_Begruendung_Vorlage)},\n`;
            sql += `  ${escapeSqlString(profil.Abschlusstext_Begruendung_Vorlage)}\n`;
            sql += `);\n\n`;
        });

        sql += `COMMIT;\n`;
        return sql;
    }

    function generateSqlForP4DataToOutput() { 
        const sql = generateSqlForP4Data(); 
        if (sql && sql.trim() !== "" && !sql.includes("noch nicht implementiert")) { 
            displayGeneratedSql(sql, 'gesamtesSqlOutput', true); // Anfügen
            alert("SQL für P4-Daten (ErgebnisProfile) wurde zum SQL-Ausgabefeld hinzugefügt.");
        } else if (!sql.includes("noch nicht implementiert")) {
            // Alert kommt ggf. schon aus generateSqlForP4Data
        }
    }
    
    function validateGesamtdatensatz() {
    console.log("Starte Validierung des Gesamtdatensatzes...");
    const errors = [];
    const warnings = [];

    // --- 1. Vollständigkeitsprüfung der Daten ---
    if (!p1ResponseData) errors.push("P1-Metadaten fehlen. Bitte Schritt 2 ausführen und Antwort einfügen.");
    if (!p2ResponseData || p2ResponseData.length === 0) errors.push("P2-Parameterdaten fehlen. Bitte Schritt 3 ausführen und Antwort einfügen.");
    if (!p3ResponseData || p3ResponseData.length === 0) errors.push("P3-Regeldaten fehlen. Bitte Schritt 5 ausführen und Antwort einfügen.");
    if (!p4ResponseData || p4ResponseData.length === 0) errors.push("P4-Ergebnisprofildaten fehlen. Bitte Schritt 6 ausführen und Antwort einfügen.");

    // Wenn Basisdaten fehlen, sind weitere Prüfungen sinnlos.
    if (errors.length > 0) {
        return { isValid: false, errors: errors, warnings: warnings };
    }

    // --- Hilfs-Sets für schnelle ID-Prüfungen erstellen ---
    const parameterIDs = new Set(p2ResponseData.map(p => p.Parameter_ID));
    const ergebnisProfilIDs = new Set(p4ResponseData.map(ep => ep.ErgebnisProfil_ID_Referenz));

    // --- 2. Referentielle Integritätsprüfung ---
    p3ResponseData.forEach(regel => {
        // Prüft, ob die Regel auf ein gültiges Ergebnisprofil verweist
        if (!ergebnisProfilIDs.has(regel.FK_ErgebnisProfil_ID_Referenz)) {
            errors.push(`Regel "${regel.Regel_Name}" verweist auf ein nicht-existentes Ergebnisprofil: "${regel.FK_ErgebnisProfil_ID_Referenz}".`);
        }

        // Prüft, ob die Bedingungen einer Regel auf gültige Parameter verweisen
        if (regel.Bedingungen_fuer_Regel && Array.isArray(regel.Bedingungen_fuer_Regel)) {
            regel.Bedingungen_fuer_Regel.forEach(bedingung => {
                if (!parameterIDs.has(bedingung.FK_Parameter_ID)) {
                    errors.push(`Regel "${regel.Regel_Name}" enthält eine Bedingung, die auf einen nicht-existenten Parameter verweist: "${bedingung.FK_Parameter_ID}".`);
                }
            });
        }
    });

    p2ResponseData.forEach(param => {
        // Prüft, ob Anzeige-Bedingungen auf gültige Parameter verweisen
        if (param.Anzeige_Bedingung && Array.isArray(param.Anzeige_Bedingung)) {
            param.Anzeige_Bedingung.forEach(bedingung => {
                if (bedingung.Referenz_Parameter_ID === param.Parameter_ID) {
                     errors.push(`Parameter "${param.Parameter_ID}" hat eine zirkuläre Anzeige-Bedingung (verweist auf sich selbst).`);
                }
                if (!parameterIDs.has(bedingung.Referenz_Parameter_ID)) {
                    errors.push(`Parameter "${param.Parameter_ID}" hat eine Anzeige-Bedingung, die auf einen nicht-existenten Parameter verweist: "${bedingung.Referenz_Parameter_ID}".`);
                }
            });
        }
    });


    // --- 3. Logik- und Eindeutigkeitsprüfung ---
    const prioritaeten = new Map();
    p3ResponseData.forEach(regel => {
        if (prioritaeten.has(regel.Prioritaet)) {
            const andereRegel = prioritaeten.get(regel.Prioritaet);
            errors.push(`Prioritätskonflikt: Die Priorität "${regel.Prioritaet}" wird sowohl von Regel "${regel.Regel_Name}" als auch von Regel "${andereRegel}" verwendet. Prioritäten müssen einzigartig sein.`);
        } else {
            prioritaeten.set(regel.Prioritaet, regel.Regel_Name);
        }
    });

    // --- 4. Warnungen (z.B. "verwaiste" Ergebnisprofile) ---
    ergebnisProfilIDs.forEach(profilId => {
        const wirdVerwendet = p3ResponseData.some(regel => regel.FK_ErgebnisProfil_ID_Referenz === profilId);
        if (!wirdVerwendet) {
            warnings.push(`Das Ergebnisprofil "${profilId}" wird von keiner Regel verwendet. Es ist "verwaist" und wird in der Simulation nie erreicht.`);
        }
    });


    console.log(`Validierung abgeschlossen. ${errors.length} Fehler, ${warnings.length} Warnungen gefunden.`);
    return {
        isValid: errors.length === 0,
        errors: errors,
        warnings: warnings
    };
}

function generateAllSql() {
    const reportArea = document.getElementById('validation-report-area');
    reportArea.style.display = 'none'; // Verstecke alten Bericht
    reportArea.innerHTML = '';

    // FÜHRE DIE VALIDIERUNG ALS ERSTEN SCHRITT AUS
    const validationResult = validateGesamtdatensatz();

    if (!validationResult.isValid) {
        // Zeige Fehlerbericht an und breche ab
        reportArea.className = 'error';
        let reportHTML = '<strong>Validierung fehlgeschlagen!</strong> Bitte korrigieren Sie die folgenden Fehler, bevor Sie das SQL generieren:<ul style="margin-top: 10px;">';
        validationResult.errors.forEach(error => {
            reportHTML += `<li>${error}</li>`;
        });
        reportHTML += '</ul>';
        reportArea.innerHTML = reportHTML;
        reportArea.style.display = 'block';
        alert("Validierung fehlgeschlagen! Details finden Sie im Bericht unterhalb des 'SQL generieren'-Buttons.");
        return; // SQL-Generierung abbrechen
    } else {
        // Zeige Erfolgs- und Warnhinweis an
        reportArea.className = 'success';
        let reportHTML = '<strong>Validierung erfolgreich.</strong> Alle Daten sind strukturell und logisch konsistent.';
        if(validationResult.warnings.length > 0){
             reportHTML += '<br><strong>Folgende Warnungen wurden gefunden (beeinträchtigen nicht die SQL-Generierung):</strong><ul>';
             validationResult.warnings.forEach(warning => {
                reportHTML += `<li>${warning}</li>`;
             });
             reportHTML += '</ul>';
        }
        reportArea.innerHTML = reportHTML;
        reportArea.style.display = 'block';
    }

    // Wenn die Validierung erfolgreich war, wird der Rest der Funktion ausgeführt
    console.log("generateAllSql aufgerufen nach erfolgreicher Validierung");
    let allSqlCommands = "";
    const sqlP1 = generateSqlForP1Data();
    const sqlP2 = generateSqlForP2Data();
    const sqlP4 = generateSqlForP4Data(); // P4 vor P3 wegen Fremdschlüsseln in Regeln
    const sqlP3 = generateSqlForP3Data();

    if (sqlP1.trim() === "" && sqlP2.trim() === "" && sqlP4.trim() === "" && sqlP3.trim() === "") {
        alert("Keine Daten für die SQL-Generierung vorhanden. Bitte führen Sie die Prompts P1-P4 aus und fügen Sie die Antworten ein.");
        return;
    }
    
    // START TRANSACTION wird jetzt nur noch einmal hier hinzugefügt
    allSqlCommands += `START TRANSACTION;\n\n`;

    if (sqlP1) allSqlCommands += sqlP1.replace(/START TRANSACTION;\n\n|COMMIT;\n/g, '');
    if (sqlP2) allSqlCommands += sqlP2.replace(/START TRANSACTION;\n\n|COMMIT;\n/g, '');
    if (sqlP4) allSqlCommands += sqlP4.replace(/START TRANSACTION;\n\n|COMMIT;\n/g, '');
    if (sqlP3) allSqlCommands += sqlP3.replace(/START TRANSACTION;\n\n|COMMIT;\n/g, '');
    
    // COMMIT wird nur noch einmal am Ende hinzugefügt
    allSqlCommands += `\nCOMMIT;\n`;

    displayGeneratedSql(allSqlCommands.trim(), 'gesamtesSqlOutput', false);
    alert("Alle verfügbaren SQL-Befehle wurden nach erfolgreicher Prüfung generiert.");
}

    // Event Listeners für 'blur'
    // ... (bleiben wie in Ihrem Code)

    window.onload = () => {
        if(getInputValue("gesetz") && getInputValue("paragraph")) {
            generateSimulationsEinheitID();
        }
    };

// In SimONA_Prompt_Assembler_Version_2_4.html


// In assembler.js - ERSETZEN Sie die bestehende Funktion
function clearAllTextareasAndSuggestions() {
    // 1. Alle globalen State-Variablen für die Analyse-Antworten zurücksetzen
    p1ResponseData = null; 
    p2ResponseData = null; 
    p3ResponseData = null; 
    p4ResponseData = null; 
    p2_7ResponseData = null;
    validierteErgebnisProfileVorschlaege = [];
    console.log("Interner State (p1-p4, p2.7 Daten etc.) wurde zurückgesetzt.");

    // 2. Alle Prompt-Anzeige- und Antwort-Bereiche zurücksetzen
    const promptPrefixes = [
        'SimONA_P1_EinheitMetadaten',
        'SimONA_P2_ParameterExtraktion',
        'SimONA_P2_7_ParameterKonklusionDetail',
        'SimONA_P2_5_ErgebnisProfilVorschlaege',
        'SimONA_P3_RegelGenerierung',
        'SimONA_P4_ErgebnisProfilDetails'
    ];

    promptPrefixes.forEach(prefix => {
        // Verstecke den gesamten Output-Bereich
        const outputArea = document.getElementById(`${prefix}_output_area`);
        if (outputArea) {
            outputArea.style.display = 'none';
        }
        // Leere die Prompt-Anzeige-Textarea
        const promptTextarea = document.getElementById(`${prefix}_prompt`);
        if (promptTextarea) {
            promptTextarea.value = '';
        }
        // Leere die Antwort-Textarea
        const responseTextarea = document.getElementById(`${prefix}_response`);
        if (responseTextarea) {
            responseTextarea.value = '';
        }
    });

    // 3. Den P2.5 Editor-Bereich spezifisch zurücksetzen
    const suggestionsEditorArea = document.getElementById('p2_5_suggestions_editor_area');
    if (suggestionsEditorArea) {
        suggestionsEditorArea.innerHTML = '';
    }
    const addNewSuggestionArea = document.getElementById('p2_5_add_new_suggestion_area');
    if (addNewSuggestionArea) {
        addNewSuggestionArea.style.display = 'none';
    }

    // 4. Die SQL-Gesamtausgabe leeren
    const sqlOutput = document.getElementById('gesamtesSqlOutput');
    if (sqlOutput) {
        sqlOutput.value = '';
    }

    // 5. Den Navigations-Footer ausblenden
    const navFooter = document.getElementById('navigation-footer');
    if (navFooter) {
        navFooter.style.display = 'none';
    }

    console.log("Alle Analyse-UI-Bereiche wurden zurückgesetzt.");
}


// =============================================================
// === NEUE LOGIK FÜR RE-AUDIT WORKFLOW  ===
// =============================================================
// ERSETZEN SIE DIESE FUNKTION IN assembler.js

function checkForAndLoadReAuditData() {
    const einheitIdToLoad = localStorage.getItem('simona_reaudit_id');

    if (einheitIdToLoad) {
        localStorage.removeItem('simona_reaudit_id');
    } else {
        console.log("Normaler Start des Assemblers.");
        return; 
    }

    console.log(`Re-Audit Modus gestartet. Lade Daten für: ${einheitIdToLoad}`);
    alert(`Re-Audit Modus: Lade bestehende Daten für ${einheitIdToLoad} aus der Datenbank...`);
    document.querySelectorAll('input, textarea, button').forEach(el => el.disabled = true);

    fetch(`../get_full_norm_data.php?einheit_id=${encodeURIComponent(einheitIdToLoad)}`)
        .then(response => {
            if (!response.ok) throw new Error(`Netzwerkfehler: ${response.statusText}`);
            return response.json();
        })
        .then(data => {
            if (data.error) throw new Error(data.error);
            console.log("Komplettes Datenmodell für Re-Audit geladen:", data);

            // Globale Variablen und UI-Felder befüllen
            p1ResponseData = data.SimulationsEinheit_Metadaten;
            p2ResponseData = data.Parameter_Liste;
            p3ResponseData = data.Regelwerk;
            p4ResponseData = data.ErgebnisProfile;
            
            if (p1ResponseData) {
                document.getElementById('gesetz').value = p1ResponseData.Gesetz || '';
                document.getElementById('paragraph').value = p1ResponseData.Paragraph || '';
                document.getElementById('absatz').value = p1ResponseData.Absatz || '';
                document.getElementById('satz').value = p1ResponseData.Satz || '';
                document.getElementById('quelleUrl').value = p1ResponseData.Gesetzestext_Referenz_Link || '';
                document.getElementById('normtext').value = p1ResponseData.Gesetzestext_Zitat || '';
                const idParts = einheitIdToLoad.split('__v_');
                if (idParts.length > 1) {
                    document.getElementById('analyseVariante').value = idParts[1];
                }
            }
            
            generateSimulationsEinheitID();

            if (p4ResponseData && p4ResponseData.length > 0) {
                 validierteErgebnisProfileVorschlaege = p4ResponseData.map(p => ({
                    Vorgeschlagene_ErgebnisProfil_ID_Referenz: p.ErgebnisProfil_ID_Referenz,
                    Vorgeschlagene_Kurzbeschreibung_Ergebnis: p.Profil_Name 
                 }));
                 document.getElementById('SimONA_P2_5_ErgebnisProfilVorschlaege_response').value = JSON.stringify(validierteErgebnisProfileVorschlaege);
            }

            // === NEU: UI für Re-Audit Modus anpassen ===
            // 1. Status-Banner anzeigen
            const banner = document.getElementById('status-banner');
            banner.innerHTML = `RE-AUDIT MODUS: Daten für <strong>${einheitIdToLoad}</strong> geladen. Bitte springen Sie direkt zu Schritt 6.5.`;
            banner.style.display = 'block';

            // 2. Irrelevante Sektionen ausblenden
            const sectionsToHide = [
                'step-0-5', 'step-1', 'step-2', 'step-3', 'step-3-5', 'step-4', 'step-5', 'step-6'
            ];
            sectionsToHide.forEach(id => {
                const section = document.getElementById(id);
                if (section) {
                    section.style.display = 'none';
                }
            });

            // 3. Nach unten zum relevanten Schritt scrollen
            document.getElementById('step-6-5').scrollIntoView({ behavior: 'smooth', block: 'start' });

            alert(`Daten für ${einheitIdToLoad} erfolgreich geladen. Sie können nun ein neues Audit durchführen.`);
        })
        .catch(error => {
            console.error('Fehler beim Laden der Re-Audit Daten:', error);
            alert('Ein schwerwiegender Fehler ist aufgetreten:\n' + error.message);
        })
        .finally(() => {
            document.querySelectorAll('input, textarea, button').forEach(el => el.disabled = false);
        });
}

// Bestehenden Event Listener beibehalten, er ruft die aktualisierte Funktion auf.
window.addEventListener('DOMContentLoaded', checkForAndLoadReAuditData);

// Die neue Funktion beim Laden der Seite aufrufen
window.addEventListener('DOMContentLoaded', checkForAndLoadReAuditData);