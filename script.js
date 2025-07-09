// script.js - Kernlogik und Datenorchestrierung
// Stand: Korrektur - handleInputChange und initializeProgress wieder eingefügt.

// Globale Variablen für den Zustand der Anwendung
let currentAbsatzData = null;
let currentTabUserInputs = {}; // Wird pro Tab initialisiert
let simulationConcludedState = {}; // NEU: Speichert { concluded: boolean, message: string, type: string } pro tabId


// ====================================================================================
// === I. DATENABRUF-FUNKTIONEN (für Normauswahl und Tab-Inhalte)
// ====================================================================================

/**
 * Ruft die Liste der verfügbaren Gesetze vom Server ab und stößt das Befüllen des Auswahl-Dropdowns an.
 * @returns {Promise<Array>} Ein Promise, das zu einem Array von Gesetzesnamen auflöst.
 */
async function fetchGesetze() {
    console.log("SimONA Logik: fetchGesetze() aufgerufen");
    try {
        const response = await fetch('get_gesetze.php');
        if (!response.ok) {
            console.error("Fetch error - Response not OK for get_gesetze.php:", response.status, response.statusText);
            const errorText = await response.text().catch(() => "Serverantwort nicht lesbar.");
            console.error("Fetch error - Server response text for get_gesetze.php:", errorText);
            throw new Error(`HTTP Error ${response.status} for get_gesetze.php`);
        }
        const data = await response.json();
        if (typeof populateGesetzSelect === "function") {
            populateGesetzSelect(data); // UI-Funktion aus simona-ui.js
        } else {
            console.error("SimONA Logik: Funktion populateGesetzSelect nicht gefunden!");
        }
        return data;
    } catch (error) {
        console.error("Fehler in fetchGesetze:", error);
        if (typeof populateGesetzSelect === "function") {
            populateGesetzSelect([]); // UI soll leeren/Fehlerzustand anzeigen
        }
        return [];
    }
}


/**
 * Ruft die Statistik-Daten für eine gegebene Norm ab und stößt das Zeichnen des Diagramms an.
 * @param {string} gesetz - Das ausgewählte Gesetz.
 * @param {string} paragraph - Der ausgewählte Paragraph.
 */
async function fetchAndRenderNormStats(gesetz, paragraph) {
console.log(`DEBUG: Funktion fetchAndRenderNormStats WURDE AUFGERUFEN für ${gesetz} § ${paragraph}`);
    console.log(`SimONA Logik: Rufe Statistik-Daten ab für ${gesetz} § ${paragraph}`);
    try {
        const response = await fetch(`get_norm_stats.php?gesetz=${encodeURIComponent(gesetz)}&paragraph=${encodeURIComponent(paragraph)}`);
        if (!response.ok) {
            throw new Error(`HTTP-Fehler ${response.status} beim Abrufen der Norm-Statistiken.`);
        }
        const statsData = await response.json();
        
        if (statsData.error) {
            throw new Error(statsData.error);
        }

        if (typeof uiRenderStatsChart === 'function') {
            uiRenderStatsChart(statsData);
        } else {
            console.error("SimONA Logik: UI-Funktion uiRenderStatsChart nicht gefunden.");
        }

    } catch (error) {
        console.error("Fehler in fetchAndRenderNormStats:", error);
        // Optional: Zeige eine Fehlermeldung im Widget-Container an
        const chartWidgetContainer = document.getElementById('widget-norm-stats');
        if (chartWidgetContainer) {
            chartWidgetContainer.style.display = 'block';
            chartWidgetContainer.querySelector('.widget-content').innerHTML = `<p style="color:red;">Statistiken konnten nicht geladen werden.</p>`;
        }
    }
}

/**
 * Ruft die Liste der verfügbaren Paragraphen für ein gegebenes Gesetz vom Server ab.
 * @param {string} gesetz - Das ausgewählte Gesetz.
 * @returns {Promise<Array>} Ein Promise, das zu einem Array von Paragraph-Nummern auflöst.
 */
async function fetchParagraphen(gesetz) {
    console.log(`SimONA Logik: fetchParagraphen() aufgerufen für Gesetz: ${gesetz}`);
    try {
        const url = `get_paragraphen.php?gesetz=${encodeURIComponent(gesetz)}`;
        console.log("SimONA Logik: Fetch aufgerufene URL für Paragraphen:", url);
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Fetch error - Response not OK for get_paragraphen.php (Gesetz: ${gesetz}):`, response.status, response.statusText);
            const errorText = await response.text().catch(() => "Serverantwort nicht lesbar.");
            console.error("Fetch error - Server response text for get_paragraphen.php:", errorText);
            throw new Error(`HTTP Error ${response.status} for get_paragraphen.php`);
        }
        const data = await response.json();
        return data; // Wird von populateParagraphSelect in simona-ui.js verarbeitet
    } catch (error) {
        console.error(`Fehler in fetchParagraphen (Gesetz: ${gesetz}):`, error);
        if (typeof populateParagraphSelect === "function") {
            populateParagraphSelect([]); // UI soll leeren/Fehlerzustand anzeigen
        }
        return [];
    }
}

/**
 * Ruft die spezifischen Simulationseinheiten (Absätze etc.) für eine ausgewählte Norm (Gesetz + Paragraph) vom Server ab.
 * @param {string} gesetz - Das ausgewählte Gesetz.
 * @param {string} paragraph - Der ausgewählte Paragraph.
 * @returns {Promise<Array>} Ein Promise, das zu einem Array von Einheit-Objekten auflöst.
 */
async function fetchEinheitenForNorm(gesetz, paragraph) {
    console.log(`SimONA Logik: fetchEinheitenForNorm() aufgerufen für Gesetz: ${gesetz}, Paragraph: ${paragraph}`);
    try {
        const url = `get_einheiten_fuer_norm.php?gesetz=${encodeURIComponent(gesetz)}&paragraph=${encodeURIComponent(paragraph)}`;
        console.log("SimONA Logik: Fetch aufgerufene URL für Einheiten:", url); // Dieser Log ist wichtig
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Fetch error - Response not OK for get_einheiten_fuer_norm.php (Gesetz: ${gesetz}, Paragraph: ${paragraph}):`, response.status, response.statusText);
            const errorText = await response.text().catch(() => "Serverantwort nicht lesbar.");
            console.error("Fetch error - Server response text for get_einheiten_fuer_norm.php:", errorText);
            throw new Error(`HTTP Error ${response.status} for get_einheiten_fuer_norm.php`);
        }
        const responseData = await response.json();
        console.log('SimONA Logik: Antwort von get_einheiten_fuer_norm.php:', responseData);
        
        if (responseData && typeof responseData.data !== 'undefined') {
            return responseData.data;
        } else if (Array.isArray(responseData)) {
             return responseData;
        } else {
            console.error("SimONA Logik: Unerwartete Antwortstruktur von get_einheiten_fuer_norm.php:", responseData);
            return []; 
        }
    } catch (error) {
        console.error(`Fehler in fetchEinheitenForNorm (Gesetz: ${gesetz}, Paragraph: ${paragraph}):`, error);
        return [];
    }
}

// ERSETZEN SIE DIESE FUNKTION IN script.js
// ERSETZEN SIE DIESE FUNKTION IN script.js
async function fetchAndDisplayAudits(einheitId, tabId) {
    console.log(`SimONA Logik: Lade Audit-Daten für Einheit ${einheitId}`);
    const qaTabContent = document.getElementById(tabId);
    if (!qaTabContent) return;
    qaTabContent.innerHTML = '<p>Lade Audit-Daten...</p>';

    try {
        // HIER IST DIE ÄNDERUNG: Ein Cache-Busting Parameter wird hinzugefügt
        const urlWithCacheBuster = `get_audits.php?einheit_id=${encodeURIComponent(einheitId)}&_=${new Date().getTime()}`;
        
        console.log("SimONA Logik: Rufe Audit-URL auf: ", urlWithCacheBuster); // Log zur Kontrolle
        
        const response = await fetch(urlWithCacheBuster);

        if (!response.ok) {
            throw new Error(`HTTP-Fehler ${response.status} beim Abrufen der Audit-Daten.`);
        }
        const auditData = await response.json();

        if (typeof uiRenderAuditData === 'function') {
            uiRenderAuditData(auditData, tabId, einheitId);
        } else {
            console.error("SimONA Logik: UI-Funktion uiRenderAuditData nicht gefunden.");
            qaTabContent.innerHTML = '<p style="color:red;">Fehler: Anzeigefunktion für Audits fehlt.</p>';
        }
    } catch (error) {
        console.error("Fehler in fetchAndDisplayAudits:", error);
        qaTabContent.innerHTML = `<p style="color:red;">Audit-Daten konnten nicht geladen werden: ${error.message}</p>`;
    }
}



// ====================================================================================
// === II. KERNLOGIK FÜR SIMULATION UND DATENHANDLING PRO TAB
// ====================================================================================


// In script.js - ERSETZEN Sie die bestehende (zu kurze) loadAndDisplayAbsatzData-Funktion

async function loadAndDisplayAbsatzData(einheitIdToLoad, tabId) {
    const activeTabContent = document.getElementById(tabId);
    if (!activeTabContent) {
        console.error("SimONA Logik: Tab-Inhaltselement nicht gefunden:", tabId);
        return;
    }

    if (typeof uiClearAndPrepareTab === "function") {
        uiClearAndPrepareTab(tabId, `Lade Daten für ${einheitIdToLoad}...`);
    }
    // Stellt sicher, dass für jeden Tab ein eigener Speicher für die Eingaben existiert
    currentTabUserInputs[tabId] = {}; 

    try {
        console.log(`SimONA Logik: Lade Daten für Einheit: ${einheitIdToLoad}`);
        const response = await fetch(`get_simona_data.php?einheit_id=${encodeURIComponent(einheitIdToLoad)}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP-Fehler ${response.status}: ${errorText}`);
        }
        
        currentAbsatzData = await response.json(); 

        if (currentAbsatzData.error) {
            throw new Error(currentAbsatzData.error);
        }
        if (!currentAbsatzData.simulationsEinheit) {
            throw new Error("Geladene Daten sind unvollständig: simulationsEinheit fehlt.");
        }
        console.log("SimONA Logik: Daten für", einheitIdToLoad, "geladen:", currentAbsatzData);

        // === WICHTIGER, ZUVOR FEHLENDER TEIL: DATENAUFBEREITUNG ===
        // Dieser Block wandelt die JSON-Strings aus der DB in nutzbare JS-Objekte um.
        if (currentAbsatzData.parameterListe) {
            currentAbsatzData.parameterListe.forEach(param => {
                // AnzeigeBedingung verarbeiten
                if (param.AnzeigeBedingungJSON) {
                    try { param.Anzeige_Bedingung_Parsed = JSON.parse(param.AnzeigeBedingungJSON); } 
                    catch (e) { 
                        console.error(`Fehler beim Parsen von AnzeigeBedingungJSON für Parameter ${param.Parameter_ID}:`, e);
                        param.Anzeige_Bedingung_Parsed = null; 
                    }
                } else {
                    param.Anzeige_Bedingung_Parsed = null; 
                }

                // KonklusiveAntwortenInfo verarbeiten
                if (param.KonklusiveAntwortenInfoJSON) {
                    try { param.Konklusive_Antworten_Info = JSON.parse(param.KonklusiveAntwortenInfoJSON); } 
                    catch (e) { 
                        console.error(`Fehler beim Parsen von KonklusiveAntwortenInfoJSON für Parameter ${param.Parameter_ID}:`, e);
                        param.Konklusive_Antworten_Info = null; 
                    }
                } else {
                    param.Konklusive_Antworten_Info = null;
                }

                // IstGrundvoraussetzung zu einem echten Boolean machen
                param.Ist_Grundvoraussetzung_Bool = !!parseInt(param.IstGrundvoraussetzung);
            });
            console.log("DEBUG: Parameter-Daten nach Aufbereitung:", JSON.parse(JSON.stringify(currentAbsatzData.parameterListe)));
        }
        // === ENDE DES WICHTIGEN TEILS ===

        // --- Korrekte Reihenfolge der UI-Aufrufe ---
        if (typeof uiRenderNormInfo === "function") {
            uiRenderNormInfo(currentAbsatzData.simulationsEinheit, tabId);
        }
        
        if (typeof uiRenderParameters === "function") {
            uiRenderParameters(currentAbsatzData.parameterListe, tabId, () => handleInputChange(tabId)); 
        }
        
        if (typeof uiRenderActionButton === "function") {
             uiRenderActionButton(currentAbsatzData.parameterListe, tabId, () => processSimulationCurrentTab(tabId, true));
        }
        
        initializeProgress(tabId);
        updateParametersVisibility(tabId);

    } catch (error) {
        console.error('SimONA Logik: Fehler beim Laden oder Anzeigen der Absatzdaten für', einheitIdToLoad, ':', error.message);
        if (typeof uiShowErrorInNormInfo === "function") {
            uiShowErrorInNormInfo(`Fehler: ${error.message}`, tabId);
        }
    }
}


// In script.js - ERSETZEN Sie die bestehende Funktion processSimulationCurrentTab
function processSimulationCurrentTab(tabId, isExplicitCall = true) {
    if (!currentAbsatzData || !currentAbsatzData.parameterListe) {
        console.error("SimONA Logik: processSimulation - currentAbsatzData oder parameterListe nicht verfügbar für TabId:", tabId);
        if (typeof uiUpdateProgressBar === "function") uiUpdateProgressBar(tabId, 0, 'Fehler: Daten für Prüfung nicht geladen.', true);
        return;
    }

    const activeTabContent = document.getElementById(tabId);
    if (!activeTabContent) {
        console.error("SimONA Logik: processSimulation - Tab-Inhalt nicht gefunden:", tabId);
        return;
    }

    // Sicherstellen, dass currentTabUserInputs für den aktuellen Tab existiert
    if (!currentTabUserInputs[tabId]) {
        currentTabUserInputs[tabId] = {}; 
        console.warn(`SimONA Logik: currentTabUserInputs für Tab ${tabId} war nicht initialisiert, wurde jetzt als {} gesetzt.`);
    }
    const tabUserInputs = currentTabUserInputs[tabId];
    
    let allRequiredVisibleAnswered = true;
    let firstUnansweredVisibleRequiredElement = null;
    let hasVisibleRequiredParameters = false;

    console.log(`SimONA Logik: Starte Prüfung für Tab ${tabId} mit Inputs:`, JSON.stringify(tabUserInputs));

    currentAbsatzData.parameterListe.forEach(param => {
        const parameterGroupElement = activeTabContent.querySelector(`.parameter-group[data-parameter-id="${param.Parameter_ID}"]`);
        const isVisible = parameterGroupElement && parameterGroupElement.style.display !== 'none';
        
        if (parameterGroupElement) { // Reset der Markierung, falls vorhanden
            parameterGroupElement.classList.remove('parameter-unanswered');
        }

        if (isVisible) { // Nur sichtbare Parameter berücksichtigen
            // Prüfen, ob das Feld als 'required' im HTML (implizit durch unsere Renderlogik) gilt
            // JaNein (Radio) und AuswahlEinfach (Select) sind aktuell 'required'
            let isRequired = false;
            if (param.Antworttyp === 'JaNein' || param.Antworttyp === 'AuswahlEinfach') {
                isRequired = true; // Annahme: Alle Radio/Selects sind erstmal required
            }
            // Hier könnten Sie später eine explizite 'isRequired' Eigenschaft vom Parameterobjekt prüfen,
            // falls nicht alle sichtbaren Fragen zwingend beantwortet werden müssen.

            if (isRequired) {
                hasVisibleRequiredParameters = true;
                const userInput = tabUserInputs[param.Parameter_ID];
                if (userInput === undefined || userInput === null || userInput === "") {
                    allRequiredVisibleAnswered = false;
                    if (!firstUnansweredVisibleRequiredElement && parameterGroupElement) {
                        firstUnansweredVisibleRequiredElement = parameterGroupElement;
                    }
                    if (parameterGroupElement) {
                        parameterGroupElement.classList.add('parameter-unanswered');
                    }
                }
            }
        }
    });

    if (!allRequiredVisibleAnswered && hasVisibleRequiredParameters) {
        if (isExplicitCall) { // Nur bei manuellem Klick auf "Diesen Absatz prüfen" die Meldung anzeigen
            alert("Bitte beantworten Sie alle aktuell angezeigten erforderlichen Fragen für diesen Absatz. Die erste offene Frage wurde markiert.");
            if (firstUnansweredVisibleRequiredElement) {
                firstUnansweredVisibleRequiredElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } else {
            // Bei automatischem Trigger (on-the-fly aus handleInputChange) keine Alert-Meldung,
            // aber das Ergebnis wird auch nicht angezeigt (da return).
            console.log(`SimONA Logik: Automatische Ergebnis-Anzeige für Tab ${tabId} übersprungen, da nicht alle sichtbaren erforderlichen Felder beantwortet sind.`);
        }
        return; // Wichtig: Verhindert die weitere Ausführung, wenn nicht alles Nötige beantwortet ist
    }

    // Wenn wir hier ankommen, sind entweder keine sichtbaren erforderlichen Parameter vorhanden
    // oder alle sichtbaren erforderlichen Parameter wurden beantwortet.

    if (typeof uiShowThinkingIndicator === "function") {
        uiShowThinkingIndicator(tabId, "Ergebnis wird ermittelt...");
    }

    const minThinkingTime = 500; // Reduziert für schnellere Tests, ggf. anpassen
    const maxThinkingTime = 1500;
    const thinkingTime = Math.floor(Math.random() * (maxThinkingTime - minThinkingTime + 1)) + minThinkingTime;
    console.log(`SimONA Logik: Denkpause für ${thinkingTime}ms angesetzt (Tab: ${tabId}).`);

    setTimeout(() => {
        const regeln = currentAbsatzData.regelwerk ? currentAbsatzData.regelwerk.regeln : [];
        const resultProfilData = evaluateRulesFromData(tabUserInputs, regeln, currentAbsatzData.ergebnisProfile);
        
        if (typeof uiDisplayErgebnis === "function") {
            uiDisplayErgebnis(resultProfilData, tabUserInputs, currentAbsatzData.parameterListe, tabId);
        }
        console.log("SimONA Logik: Simulation für Tab", tabId, "verarbeitet (nach Denkpause). Inputs:", JSON.stringify(tabUserInputs), "Ergebnis:", resultProfilData);
    }, thinkingTime);
}

function evaluateRulesFromData(userInputs, regeln, ergebnisProfileListe) {
    if (!regeln || !Array.isArray(regeln) || regeln.length === 0) {
        console.warn("SimONA Logik: Regelwerk ist nicht verfügbar oder leer.", regeln);
        return null;
    }

    const sortedRegeln = [...regeln].sort((a, b) => (a.Prioritaet === null || a.Prioritaet === undefined ? 999 : a.Prioritaet) - (b.Prioritaet === null || b.Prioritaet === undefined ? 999 : b.Prioritaet));

    for (const regel of sortedRegeln) {
        let conditionsMet = true;
        if (regel.Bedingungen_fuer_Regel && regel.Bedingungen_fuer_Regel.length > 0) {
            for (const bedingung of regel.Bedingungen_fuer_Regel) {
                const userInput = userInputs[bedingung.FK_Parameter_ID];
                if (userInput === undefined || userInput === null || userInput === "") {
                    conditionsMet = false; break;
                }
                let conditionHolds = false;
                switch (bedingung.Operator) {
                    case "IST_GLEICH": conditionHolds = (String(userInput) === String(bedingung.Erwarteter_Wert_Intern)); break;
                    case "IST_WAHR": conditionHolds = (userInput === "Ja" || userInput === true || String(userInput).toLowerCase() === "true"); break;
                    case "IST_FALSCH": conditionHolds = (userInput === "Nein" || userInput === false || String(userInput).toLowerCase() === "false"); break;
                    case "IST_NICHT_GLEICH": conditionHolds = (String(userInput) !== String(bedingung.Erwarteter_Wert_Intern)); break;
                    default: console.warn(`SimONA Logik: Unbekannter Operator: ${bedingung.Operator}`); conditionHolds = false;
                }
                if (!conditionHolds) { conditionsMet = false; break; }
            }
        }
        if (conditionsMet) {
            if (!ergebnisProfileListe || !Array.isArray(ergebnisProfileListe)) {
                console.error("SimONA Logik: ErgebnisProfileListe nicht korrekt geladen."); return null;
            }
            const profil = ergebnisProfileListe.find(p => p.ErgebnisProfil_ID_Referenz === regel.FK_ErgebnisProfil_ID_Referenz);
            if (!profil) {
                console.error(`SimONA Logik: ErgebnisProfil mit ID_Referenz '${regel.FK_ErgebnisProfil_ID_Referenz}' nicht in Liste gefunden.`); return null;
            }
            return profil;
        }
    }
    console.warn("SimONA Logik: Keine passende Regel gefunden für die Eingaben:", userInputs);
    return null;
}




function updateParametersVisibility(tabId) {
    if (!currentAbsatzData || !currentAbsatzData.parameterListe) {
        console.warn("updateParametersVisibility: currentAbsatzData oder parameterListe nicht verfügbar für TabId:", tabId);
        return;
    }
    
    if (!currentTabUserInputs[tabId]) {
        currentTabUserInputs[tabId] = {}; 
    }
    const tabUserInputs = currentTabUserInputs[tabId];
    
    // Zustand vom globalen Objekt holen
    const isConcluded = simulationConcludedState[tabId]?.concluded || false;

    console.log(`SimONA Logik: updateParametersVisibility für Tab ${tabId}. Konkludiert: ${isConcluded}`);

    currentAbsatzData.parameterListe.forEach(param => {
        let shouldBeVisible = false;
        if (isConcluded) {
            // Wenn durch Grundvoraussetzung abgeschlossen, zeige nur noch die bereits beantworteten Fragen
            // oder optional gar keine weiteren mehr, außer vielleicht die Grundvoraussetzung selbst.
            // Fürs Erste: Zeige nur die Grundvoraussetzung, die zur Konklusion geführt hat und davor beantwortete.
            // Oder einfacher: Wenn abgeschlossen, werden keine *neuen* Fragen mehr sichtbar.
            // Die bereits sichtbaren bleiben, aber die Interaktion ist ggf. gestoppt.
            // Für diesen Durchgang: Wenn abgeschlossen, zeige nur, was bereits sichtbar war und nötig war.
            // Die sicherste Variante: Wenn `isConcluded` true ist, blende alle Fragen aus, die nicht
            // `Ist_Grundvoraussetzung_Bool` sind oder deren Anzeige nicht von bereits feststehenden Werten abhängt.
            // Am einfachsten: Wenn isConcluded, werden keine Fragen mehr aktiv eingeblendet, die nicht schon sichtbar waren.
            // Die checkDisplayCondition Logik unten macht das schon fast.
            // Wir müssen nur verhindern, dass nach einem 'concluded' noch was Neues aufpoppt.
             const parameterGroupElement = document.getElementById(tabId)?.querySelector(`.parameter-group[data-parameter-id="${param.Parameter_ID}"]`);
             if (parameterGroupElement && parameterGroupElement.style.display !== 'none') { // Wenn es schon sichtbar war
                 shouldBeVisible = true; // Lass es sichtbar
             } else {
                 shouldBeVisible = false; // Blende neue aus, wenn konkludiert
             }
             // Spezielle Logik, falls die auslösende Grundvoraussetzung sichtbar bleiben soll:
             // if (param.Parameter_ID === auslösendeGrundvoraussetzungID) shouldBeVisible = true;

        } else { // Normaler Modus: Nicht konkludiert
            shouldBeVisible = checkDisplayCondition(param, tabUserInputs);
        }
        
        if (typeof uiSetElementVisibility === "function") {
            uiSetElementVisibility(param.Parameter_ID, shouldBeVisible, tabId);
        } else {
            console.error("SimONA Logik: uiSetElementVisibility Funktion nicht in simona-ui.js gefunden!");
        }
    });
}



// ====================================================================================
// === III. FORTSCHRITTSLOGIK UND INPUT HANDLING (WIEDER EINGEFÜGT UND KORRIGIERT)
// ====================================================================================

/**
 * Initialisiert die Fortschrittsanzeige für einen Tab.
 * @param {string} tabId - Die ID des Tabs.
 */
function initializeProgress(tabId) {
    console.log(`SimONA Logik: initializeProgress für Tab: ${tabId}`);
    if (!currentAbsatzData || !currentAbsatzData.parameterListe) {
        if (typeof uiUpdateProgressBar === "function") uiUpdateProgressBar(tabId, 0, 'Fehler: Prüfungspunkte nicht geladen.', true);
        return;
    }
    const totalParameters = currentAbsatzData.parameterListe.length;
    if (typeof uiUpdateProgressBar === "function") {
        if (totalParameters === 0) {
            uiUpdateProgressBar(tabId, 0, 'Keine interaktiven Prüfungspunkte für diesen Absatz definiert.', true);
        } else {
            uiUpdateProgressBar(tabId, 0, `0 von ${totalParameters} Prüfungspunkt(en) beantwortet.`);
        }
    } else {
        console.error("SimONA Logik: uiUpdateProgressBar Funktion nicht gefunden für initializeProgress");
    }
}

/**
 * Behandelt Änderungen an Input-Feldern, aktualisiert Fortschritt und löst ggf. Simulation aus.
 * @param {string} tabId - Die ID des Tabs, in dem die Änderung stattfand.
 */

// In script.js
function handleInputChange(tabId) {
    console.log(`SimONA Logik: handleInputChange aufgerufen für Tab: ${tabId}`);
    const activeTabContent = document.getElementById(tabId);

    if (!currentAbsatzData || !currentAbsatzData.parameterListe || !activeTabContent) {
        console.warn("SimONA Logik: handleInputChange - Notwendige Daten oder Tab-Inhalt nicht vorhanden für Tab", tabId);
        if (typeof uiUpdateProgressBar === "function") uiUpdateProgressBar(tabId, 0, 'Fehler: Parameterdaten für Fortschritt fehlen.', true);
        return;
    }
    
    if (!currentTabUserInputs[tabId]) {
        currentTabUserInputs[tabId] = {}; 
    }
    const tabUserInputs = currentTabUserInputs[tabId];
    let answeredParamId = null; 

    // 1. Aktuelle Eingaben für diesen Tab sammeln und geänderten Parameter identifizieren
    currentAbsatzData.parameterListe.forEach(param => {
        const parameterGroupElement = activeTabContent.querySelector(`.parameter-group[data-parameter-id="${param.Parameter_ID}"]`);
        let previousValue = tabUserInputs[param.Parameter_ID];
        let selectedValue = null;
        const cleanTabIdPart = tabId.replace(/[^a-zA-Z0-9-_]/g, '');
        const inputBaseName = `${param.Parameter_ID}_${cleanTabIdPart}`;
        
        if (param.Antworttyp === 'JaNein') {
            const radioSelected = activeTabContent.querySelector(`input[name="${inputBaseName}"]:checked`);
            if (radioSelected) selectedValue = radioSelected.value;
        } else if (param.Antworttyp === 'AuswahlEinfach') {
            const selectElement = activeTabContent.querySelector(`select[name="${inputBaseName}"]`);
            if (selectElement && selectElement.value !== "") selectedValue = selectElement.value;
        }
        
        if (selectedValue !== null) {
            if (previousValue !== selectedValue) answeredParamId = param.Parameter_ID;
            tabUserInputs[param.Parameter_ID] = selectedValue;
            if (parameterGroupElement) parameterGroupElement.classList.remove('parameter-unanswered');
        } else {
            if (previousValue !== undefined) answeredParamId = param.Parameter_ID;
            delete tabUserInputs[param.Parameter_ID]; 
        }
    });
    console.log(`SimONA Logik: User Inputs für Tab ${tabId} nach InputChange:`, JSON.stringify(tabUserInputs));

    // 2. Früheres Ergebnis und Konklusions-Hinweis löschen, Button-Text zurücksetzen
    if (typeof uiClearErgebnisbereich === "function") uiClearErgebnisbereich(tabId);
    if (typeof uiClearConclusiveHinweis === "function") uiClearConclusiveHinweis(tabId);
    if (typeof uiUpdateButtonText === "function") uiUpdateButtonText(tabId, "Diesen Absatz prüfen");
    
    simulationConcludedState[tabId] = { concluded: false, message: '', type: '' };

    // 3. Konklusive Antwort prüfen, wenn ein Parameter geändert wurde
    if (answeredParamId) {
        const changedParam = currentAbsatzData.parameterListe.find(p => p.Parameter_ID === answeredParamId);
        if (changedParam && changedParam.Ist_Grundvoraussetzung_Bool && changedParam.Konklusive_Antworten_Info && Array.isArray(changedParam.Konklusive_Antworten_Info)) {
            const currentAnswer = tabUserInputs[answeredParamId];
            if (currentAnswer !== undefined) {
                for (const konklusion of changedParam.Konklusive_Antworten_Info) {
                    if (String(currentAnswer) === String(konklusion.Antwort_Wert_Intern_Erwartet)) {
                        simulationConcludedState[tabId] = {
                            concluded: true,
                            message: konklusion.Hinweis_Text_Kurz_Fuer_Meldung,
                            type: konklusion.Konklusions_Typ,
                            longMessage: konklusion.Hinweis_Text_Lang_Fuer_Begruendung
                        };
                        
                        // ### HIER IST DIE ÄNDERUNG ###
                        // Übergibt jetzt Kurz- UND Langtext an die UI-Funktion
                        if (typeof uiShowConclusiveHinweis === "function") {
                            uiShowConclusiveHinweis(
                                tabId, 
                                konklusion.Hinweis_Text_Kurz_Fuer_Meldung, 
                                konklusion.Hinweis_Text_Lang_Fuer_Begruendung, // <-- NEUER PARAMETER
                                konklusion.Konklusions_Typ
                            );
                        }
                        
                        console.log(`Konklusive Antwort für ${answeredParamId} gegeben: Typ ${konklusion.Konklusions_Typ}`);
                        break; 
                    }
                }
            }
        }
    

    // 4. Sichtbarkeit aller Parameter aktualisieren
    updateParametersVisibility(tabId);

    // 5. Fortschrittsbalken aktualisieren
    const parameterListe = currentAbsatzData.parameterListe;
    const activeTabContentElement = document.getElementById(tabId);
    let visibleParametersCount = 0;
    let answeredVisibleParametersCount = 0;

    if (activeTabContentElement && parameterListe) {
        parameterListe.forEach(param => {
            const groupElement = activeTabContentElement.querySelector(`.parameter-group[data-parameter-id="${param.Parameter_ID}"]`);
            if (groupElement && groupElement.style.display !== 'none') {
                visibleParametersCount++;
                if (tabUserInputs[param.Parameter_ID] !== undefined && tabUserInputs[param.Parameter_ID] !== null && tabUserInputs[param.Parameter_ID] !== "") {
                    answeredVisibleParametersCount++;
                }
            }
        });
    }
    
    const progressPercentage = visibleParametersCount > 0 ? (answeredVisibleParametersCount / visibleParametersCount) * 100 : 0;
    let progressText = 'Keine interaktiven Prüfungspunkte für diesen Absatz definiert oder sichtbar.';
    if (visibleParametersCount > 0) {
        progressText = `${answeredVisibleParametersCount} von ${visibleParametersCount} sichtbaren Prüfungspunkt(en) beantwortet.`;
    }
    if (typeof uiUpdateProgressBar === "function") {
        uiUpdateProgressBar(tabId, progressPercentage, progressText, visibleParametersCount === 0 || simulationConcludedState[tabId]?.concluded);
    }

    // 6. Simulation automatisch auslösen
    if (!simulationConcludedState[tabId]?.concluded && visibleParametersCount > 0 && answeredVisibleParametersCount === visibleParametersCount) {
        processSimulationCurrentTab(tabId, false); 
    } else if (simulationConcludedState[tabId]?.concluded) {
        if (typeof uiDisplayConclusiveResult === "function") {
             uiDisplayConclusiveResult(tabId, simulationConcludedState[tabId].longMessage, simulationConcludedState[tabId].type);
        }
    }
}

    // 4. Sichtbarkeit aller Parameter aktualisieren (berücksichtigt simulationConcludedState)
    updateParametersVisibility(tabId);

    // 5. Fortschrittsbalken aktualisieren 
    // (Diese Logik muss ggf. die Anzahl der *jetzt sichtbaren* erforderlichen Fragen berücksichtigen)
    const parameterListe = currentAbsatzData.parameterListe;
    const activeTabContentElement = document.getElementById(tabId); // Sicherstellen, dass wir das Element haben
    let visibleParametersCount = 0;
    let answeredVisibleParametersCount = 0;

    if (activeTabContentElement && parameterListe) {
        parameterListe.forEach(param => {
            const groupElement = activeTabContentElement.querySelector(`.parameter-group[data-parameter-id="${param.Parameter_ID}"]`);
            if (groupElement && groupElement.style.display !== 'none') {
                visibleParametersCount++;
                if (tabUserInputs[param.Parameter_ID] !== undefined && tabUserInputs[param.Parameter_ID] !== null && tabUserInputs[param.Parameter_ID] !== "") {
                    answeredVisibleParametersCount++;
                }
            }
        });
    }
    
    const progressPercentage = visibleParametersCount > 0 ? (answeredVisibleParametersCount / visibleParametersCount) * 100 : 0;
    let progressText = 'Keine interaktiven Prüfungspunkte für diesen Absatz definiert oder sichtbar.';
    if (visibleParametersCount > 0) {
        progressText = `${answeredVisibleParametersCount} von ${visibleParametersCount} sichtbaren Prüfungspunkt(en) beantwortet.`;
    }
    if (typeof uiUpdateProgressBar === "function") {
        uiUpdateProgressBar(tabId, progressPercentage, progressText, visibleParametersCount === 0 || simulationConcludedState[tabId]?.concluded);
    }

    // 6. Simulation automatisch auslösen, wenn nicht durch Grundvoraussetzung bereits abgeschlossen
    //    und alle sichtbaren, erforderlichen Fragen beantwortet sind.
    if (!simulationConcludedState[tabId]?.concluded && visibleParametersCount > 0 && answeredVisibleParametersCount === visibleParametersCount) {
        console.log(`SimONA Logik: Alle ${visibleParametersCount} sichtbaren Fragen in Tab ${tabId} beantwortet, versuche automatische Simulation.`);
        processSimulationCurrentTab(tabId, false); 
    } else if (simulationConcludedState[tabId]?.concluded) {
        console.log(`SimONA Logik: Simulation für Tab ${tabId} durch Grundvoraussetzung abgeschlossen/blockiert.`);
        // Hier könnte man direkt ein Ergebnis anzeigen basierend auf simulationConcludedState[tabId].longMessage
        // Fürs Erste unterdrücken wir den automatischen Aufruf von processSimulationCurrentTab.
        // Der User kann bei Bedarf immer noch "Diesen Absatz prüfen" klicken, was dann ggf. ein spezifisches Ergebnis anzeigt.
        // Oder wir rufen hier eine spezielle Ergebnisanzeige-Funktion auf.
        // Für jetzt: Wenn konklusiv, keine automatische "normale" Simulation.
        if (typeof uiDisplayConclusiveResult === "function") { // NEUE UI-Funktion
             uiDisplayConclusiveResult(tabId, simulationConcludedState[tabId].longMessage, simulationConcludedState[tabId].type);
        }
    }
}


// ====================================================================================
// === IV. Hilfsfunktionen
// ====================================================================================


function checkDisplayCondition(parameter, tabUserInputs) {
    if (!parameter.Anzeige_Bedingung_Parsed || parameter.Anzeige_Bedingung_Parsed.length === 0) {
        return true; // Keine Bedingungen, also standardmäßig anzeigen
    }

    for (const bedingung of parameter.Anzeige_Bedingung_Parsed) {
        const referenzWertInput = tabUserInputs[bedingung.Referenz_Parameter_ID];

        // Wenn die Referenzfrage noch nicht beantwortet wurde, ist die Bedingung nicht erfüllt
        if (referenzWertInput === undefined || referenzWertInput === null || referenzWertInput === "") {
            // console.log(`Bedingung für ${parameter.Parameter_ID} nicht erfüllt: Referenz ${bedingung.Referenz_Parameter_ID} nicht beantwortet.`);
            return false; 
        }

        let conditionMet = false;
        const bedingungWertIntern = bedingung.Referenz_Antwort_Wert_Intern;

        switch (bedingung.Referenz_Antwort_Operator) {
            case "IST_GLEICH":
                conditionMet = (String(referenzWertInput) === String(bedingungWertIntern));
                break;
            case "IST_NICHT_GLEICH":
                conditionMet = (String(referenzWertInput) !== String(bedingungWertIntern));
                break;
            case "IST_WAHR":
                conditionMet = (referenzWertInput === "Ja" || referenzWertInput === true || String(referenzWertInput).toLowerCase() === "true");
                break;
            case "IST_FALSCH":
                conditionMet = (referenzWertInput === "Nein" || referenzWertInput === false || String(referenzWertInput).toLowerCase() === "false");
                break;
            case "IST_EINES_VON":
                if (Array.isArray(bedingungWertIntern)) {
                    conditionMet = bedingungWertIntern.map(String).includes(String(referenzWertInput));
                } else {
                    console.warn(`Operator IST_EINES_VON erwartet Array als Referenz_Antwort_Wert_Intern für Parameter ${bedingung.Referenz_Parameter_ID}`);
                }
                break;
            default:
                console.warn(`Unbekannter Operator in Anzeige_Bedingung: ${bedingung.Referenz_Antwort_Operator} für Parameter ${parameter.Parameter_ID}`);
                return false; // Im Zweifel nicht anzeigen
        }

        if (!conditionMet) {
            // console.log(`Bedingung für ${parameter.Parameter_ID} nicht erfüllt: ${bedingung.Referenz_Parameter_ID} ${bedingung.Referenz_Antwort_Operator} ${bedingungWertIntern} (Input: ${referenzWertInput})`);
            return false; // Eine Bedingung der UND-Kette nicht erfüllt
        }
    }
    // console.log(`Alle Bedingungen für ${parameter.Parameter_ID} erfüllt.`);
    return true; // Alle Bedingungen im Array (UND-verknüpft) sind erfüllt
}






/**
 * Wird von simona-ui.js aufgerufen, wenn dessen DOMContentLoaded abgeschlossen ist.
 */
function simonaLogicReady() {
    console.log("SimONA Kernlogik (script.js) ist bereit und wurde von UI initialisiert.");
}