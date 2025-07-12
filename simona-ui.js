// simona-ui.js - UI-Rendering, DOM-Manipulation und Event-Handling
// FINALE KORRIGIERTE VERSION V2
// Stand 07.06.2025 08:44

// === Globale Variablen für das UI-Modul ===
let normStatsChartInstance = null; 

// ====================================================================================
// === I. DOMContentLoaded: INITIALISIERUNG NACH DEM LADEN DER SEITE
// ====================================================================================
document.addEventListener('DOMContentLoaded', () => {
    console.log("SimONA UI: DOMContentLoaded gestartet.");

    // --- Event-Listener für statische Tabs ---
    const initialTabLinksQuery = '.tab-navigation > .tab-link[data-tab="tab-overview"], .tab-navigation > .tab-link[data-tab="tab-result"]';
    const initialTabLinks = document.querySelectorAll(initialTabLinksQuery);

    initialTabLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            const clickedLink = event.currentTarget;
            const tabIdOfClickedLink = clickedLink.getAttribute('data-tab');

            document.querySelectorAll('.tab-navigation .tab-link').forEach(item => item.classList.remove('active'));
            document.querySelectorAll('.tab-content-area .tab-content').forEach(content => content.classList.remove('active'));

            clickedLink.classList.add('active');
            const contentDivToActivate = document.getElementById(tabIdOfClickedLink);

            if (contentDivToActivate) {
                contentDivToActivate.classList.add('active');
            }
        });
    });

    // --- Initialisierung der Normauswahl-Logik ---
    const selectGesetz = document.getElementById('select-gesetzbuch');
    const selectParagraph = document.getElementById('select-paragraph');
    const btnNormLaden = document.getElementById('btn-norm-laden');

    if (selectGesetz && selectParagraph && btnNormLaden) {
        if (typeof fetchGesetze === "function") fetchGesetze();

        selectGesetz.addEventListener('change', async (event) => {
            const gewaehltesGesetz = event.target.value;
            selectParagraph.innerHTML = '<option value="">Lade Paragraphen...</option>';
            selectParagraph.disabled = true;
            btnNormLaden.disabled = true;
            if (gewaehltesGesetz) {
                if (typeof fetchParagraphen === "function") {
                    const paragraphen = await fetchParagraphen(gewaehltesGesetz);
                    populateParagraphSelect(paragraphen);
                }
            } else {
                populateParagraphSelect([]);
            }
        });

        selectParagraph.addEventListener('change', () => {
            btnNormLaden.disabled = !(selectGesetz.value && selectParagraph.value);
        });

        btnNormLaden.addEventListener('click', async () => {
            const gesetz = selectGesetz.value;
            const paragraph = selectParagraph.value;
            if (gesetz && paragraph) {
                if (typeof fetchEinheitenForNorm === "function") {
                    const einheiten = await fetchEinheitenForNorm(gesetz, paragraph);
                    updateAbsatzTabs(gesetz, paragraph, einheiten);
                }
            }
        });
    }

    // --- Initialen "Übersicht"-Tab aktivieren ---
    const overviewTabLink = document.querySelector('.tab-link[data-tab="tab-overview"]');
    if (overviewTabLink) {
        overviewTabLink.click();
    }
    
    if (typeof simonaLogicReady === "function") simonaLogicReady();
    console.log("SimONA Dashboard UI (simona-ui.js) initialisiert.");
});


// ====================================================================================
// === II. FUNKTIONEN FÜR UI-MANIPULATION
// ====================================================================================

/**
  * Erkennt Varianten, rendert das Auswahl-Dropdown und steuert den Prozess.
 */
function updateAbsatzTabs(gesetz, paragraph, einheiten) {
    const tabNavigation = document.querySelector('.tab-navigation');
    const tabContentContainer = document.querySelector('.tab-content-area');

    // Komplette Bereinigung der alten dynamischen Tabs und Inhalte
    tabNavigation.querySelectorAll('.tab-link').forEach(b => {
        if (b.getAttribute('data-tab') !== 'tab-overview' && b.getAttribute('data-tab') !== 'tab-result' && b.getAttribute('data-tab') !== 'tab-qa') {
            b.remove();
        }
    });
    tabContentContainer.querySelectorAll('.tab-content').forEach(c => {
        if (c.id !== 'tab-overview' && c.id !== 'tab-result' && c.id !== 'tab-qa') {
            c.remove();
        }
    });

    // Info-Container zurücksetzen
    document.getElementById('paragraph-info-box-container').style.display = 'none';
    document.getElementById('variant-selection-container').style.display = 'none';
    document.getElementById('widget-norm-stats').style.display = 'none';

    if (!einheiten || einheiten.length === 0) {
        uiUpdateMainHeader(gesetz, paragraph, "(Keine Absätze definiert)");
        return;
    }
    
    // Allgemeine Infos zum Paragraphen anzeigen
    const paragraphBezeichnung = einheiten[0].Paragraph_Offizielle_Bezeichnung || "";
    const paragrafBeschreibung = einheiten[0].Paragraf_Gesamtbeschreibung || "";
    const gesamterParagraphText = einheiten.map(e => e.Gesetzestext_Zitat || '').filter(t => t).join('\n\n').trim();
    uiUpdateMainHeader(gesetz, paragraph, paragraphBezeichnung);
    uiDisplayParagraphInfoBox(paragraphBezeichnung, paragrafBeschreibung, gesamterParagraphText);
    if (typeof fetchAndRenderNormStats === "function") fetchAndRenderNormStats(gesetz, paragraph);
    
    // --- Logik zur Variantenerkennung ---
    const variantenMap = new Map();
    einheiten.forEach(einheit => {
        const match = einheit.Einheit_ID.match(/__v_([^_]+)/);
        const variante = match ? match[1] : 'Standard';
        if (!variantenMap.has(variante)) {
            variantenMap.set(variante, []);
        }
        variantenMap.get(variante).push(einheit);
    });

    console.log('Gefundene Varianten:', Array.from(variantenMap.keys())); // Debug-Ausgabe
    uiRenderVariantenAuswahl(variantenMap, einheiten, tabNavigation);
}

/**
 * NEUE HILFSFUNKTION
 * Rendert das Dropdown zur Variantenauswahl.
 */
function uiRenderVariantenAuswahl(variantenMap, alleEinheiten, tabNavigation) {
    const container = document.getElementById('variant-selection-container');
    const varianten = Array.from(variantenMap.keys());
    
    container.innerHTML = '<h3>Analyse-Variante auswählen:</h3>';
    
    if (varianten.length <= 1) {
        console.log('Nur eine Variante gefunden, erstelle Tabs direkt.'); // Debug-Ausgabe
        container.style.display = 'none';
        createAbsatzTabsForVariant(alleEinheiten, tabNavigation);
        return;
    }

    const select = document.createElement('select');
    select.id = 'variant-selector-dropdown';
    select.classList.add('dropdown-element');
    select.innerHTML = '<option value="">-- Bitte Variante wählen --</option>';
    
    varianten.forEach(variante => {
        const option = document.createElement('option');
        option.value = variante;
        option.textContent = `${variante} (${variantenMap.get(variante).length} Absätze)`;
        select.appendChild(option);
    });
    
    select.addEventListener('change', (event) => {
        const gewaehlteVariante = event.target.value;
        console.log(`Variante ausgewählt: '${gewaehlteVariante}'`); // Debug-Ausgabe

        const gefilterteEinheiten = gewaehlteVariante ? variantenMap.get(gewaehlteVariante) : [];
        
        console.log('Gefilterte Einheiten für Tab-Erstellung:', gefilterteEinheiten); // Debug-Ausgabe
        createAbsatzTabsForVariant(gefilterteEinheiten, tabNavigation);
    });
    
    container.appendChild(select);
    container.style.display = 'block';
}


/**
 * Baut die UI für die ausgewählte Variante auf.
 */
function createAbsatzTabsForVariant(einheitenFuerVariante, tabNavigation) {
    const resultTabButton = tabNavigation.querySelector('.tab-link[data-tab="tab-result"]');
    const qaTabButton = document.querySelector('.tab-link[data-tab="tab-qa"]');
    const tabContentContainer = document.querySelector('.tab-content-area');

    // Alte dynamische Tabs und Inhalte sowie QA-Handler entfernen
    tabNavigation.querySelectorAll('.tab-link').forEach(b => {
        if (b.getAttribute('data-tab') !== 'tab-overview' && b.getAttribute('data-tab') !== 'tab-result' && b.getAttribute('data-tab') !== 'tab-qa') {
            b.remove();
        }
    });
    tabContentContainer.querySelectorAll('.tab-content').forEach(c => {
        if (c.id !== 'tab-overview' && c.id !== 'tab-result' && c.id !== 'tab-qa') {
            c.remove();
        }
    });

    if (qaTabButton) {
        qaTabButton.style.display = 'none';
        qaTabButton.onclick = null;
    }

    if (!einheitenFuerVariante || einheitenFuerVariante.length === 0) {
        console.log('Keine Einheiten zum Anzeigen, breche Tab-Erstellung ab.'); // Debug-Ausgabe
        return;
    }

    const representativeEinheitIDForQA = einheitenFuerVariante[0].Einheit_ID.split('__v_')[0];
    console.log(`Repräsentative ID für QA-Tab gesetzt: '${representativeEinheitIDForQA}'`); // Debug-Ausgabe

    if (qaTabButton) {
        qaTabButton.style.display = 'inline-block';
        qaTabButton.onclick = () => {
             document.querySelectorAll('.tab-navigation .tab-link').forEach(item => item.classList.remove('active'));
             document.querySelectorAll('.tab-content-area .tab-content').forEach(content => content.classList.remove('active'));
             qaTabButton.classList.add('active');
             const qaContentArea = document.getElementById('tab-qa');
             if (qaContentArea) qaContentArea.classList.add('active');
             if (typeof fetchAndDisplayAudits === "function") {
                fetchAndDisplayAudits(representativeEinheitIDForQA, 'tab-qa');
             }
        };
    }

    einheitenFuerVariante.sort((a, b) => (a.Absatz || "").localeCompare(b.Absatz || "", undefined, {numeric: true}) || (a.Satz || "").localeCompare(b.Satz || "", undefined, {numeric: true}));

    let firstAbsatzTabId = null;
    einheitenFuerVariante.forEach((einheit, index) => {
        const spezifischeEinheitId = einheit.Einheit_ID;
        const tabContentId = `tab-content-${spezifischeEinheitId.replace(/[^a-zA-Z0-9-_]/g, '')}`;
        
        if (index === 0) firstAbsatzTabId = tabContentId;

        const newTabButton = document.createElement('button');
        newTabButton.classList.add('tab-link');
        newTabButton.setAttribute('data-tab', tabContentId);
        newTabButton.setAttribute('data-einheit-id', spezifischeEinheitId);
        
        let tabLabel = `Abs. ${einheit.Absatz || '?'}`;
        if (einheit.Satz && String(einheit.Satz).trim() !== "") tabLabel += ` S. ${einheit.Satz}`;
        newTabButton.title = einheit.Kurzbeschreibung || tabLabel;
        newTabButton.textContent = tabLabel;

        newTabButton.addEventListener('click', () => {
            document.querySelectorAll('.tab-navigation .tab-link').forEach(item => item.classList.remove('active'));
            document.querySelectorAll('.tab-content-area .tab-content').forEach(content => content.classList.remove('active'));
            newTabButton.classList.add('active');
            const activeContentArea = ensureTabContentAreaExists(tabContentId);
            activeContentArea.classList.add('active');
            
            if (typeof loadAndDisplayAbsatzData === "function") {
                loadAndDisplayAbsatzData(spezifischeEinheitId, tabContentId);
            }
        });

        if (resultTabButton) tabNavigation.insertBefore(newTabButton, resultTabButton);
        else tabNavigation.appendChild(newTabButton);
        
        ensureTabContentAreaExists(tabContentId);
    });
    
    if (firstAbsatzTabId) {
        const firstNewTabButton = tabNavigation.querySelector(`.tab-link[data-tab="${firstAbsatzTabId}"]`);
        if (firstNewTabButton) {
            console.log('Aktiviere ersten Tab der neuen Variante.'); // Debug-Ausgabe
            firstNewTabButton.click();
        }
    }
}

function populateGesetzSelect(gesetze) {
    const select = document.getElementById('select-gesetzbuch');
    if (!select) return;
    select.innerHTML = '<option value="">-- Bitte Gesetzbuch wählen --</option>';
    if (gesetze && gesetze.length > 0) {
        gesetze.forEach(gesetz => {
            const option = document.createElement('option');
            option.value = gesetz;
            option.textContent = gesetz;
            select.appendChild(option);
        });
    }
}

function populateParagraphSelect(paragraphen) {
    const select = document.getElementById('select-paragraph');
    if (!select) return;
    select.innerHTML = '<option value="">-- Bitte Paragraph wählen --</option>';
    select.disabled = !(paragraphen && paragraphen.length > 0);
    if (paragraphen && paragraphen.length > 0) {
        paragraphen.forEach(paragraph => {
            const option = document.createElement('option');
            option.value = paragraph;
            option.textContent = `§ ${paragraph}`;
            select.appendChild(option);
        });
    }
}

function ensureTabContentAreaExists(tabContentId) {
    const tabContentAreaContainer = document.querySelector('.tab-content-area');
    let contentArea = document.getElementById(tabContentId);
    if (!contentArea) {
        contentArea = document.createElement('div');
        contentArea.id = tabContentId;
        contentArea.classList.add('tab-content');
        contentArea.innerHTML = `
            <div class="main-simulation-area">
                <div class="left-panel">
                    <div class="panel-section norm-info tab-norm-info-container"></div>
                    <div class="panel-section aktueller-parameter tab-parameter-container"></div>
                    <div class="panel-section conclusive-hinweis-container tab-conclusive-hinweis-container" style="display:none;"></div>
                    <div class="action-buttons tab-action-button-container"></div>
                </div>
                <div class="right-panel tab-right-panel-container">
                    <div class="panel-section progress-indicator tab-progress-container">
                        <h2>Fortschritt im Absatz</h2><p class="tab-progress-text"></p>
                        <div class="progress-bar-container" style="display:none;"><div class="progress-bar"></div></div>
                    </div>
                    <div class="panel-section pro-contra-list tab-procontra-container">
                        <h2>Pro / Contra (Absatz)</h2><ul></ul>
                    </div>
                    <div class="panel-section tab-ergebnis-container" style="display:none;">
                         <h2>Ergebnis (Absatz)</h2>
                    </div>
                </div>
            </div>`;
        if (tabContentAreaContainer) tabContentAreaContainer.appendChild(contentArea);
    }
    return contentArea;
}

function uiUpdateMainHeader(gesetz, paragraphNr, paragraphBezeichnung) {
    const dashboardTitle = document.querySelector('header h1');
    if (dashboardTitle) {
        let titleText = `SimONA - Simulation: ${gesetz} § ${paragraphNr}`;
        if (paragraphBezeichnung && paragraphBezeichnung.trim() !== "") titleText += ` - ${paragraphBezeichnung}`;
        dashboardTitle.textContent = titleText;
    }
}

function uiDisplayParagraphInfoBox(paragraphBezeichnung, paragrafBeschreibung, gesamterParagraphText) {
    const infoBoxContainer = document.getElementById('paragraph-info-box-container');
    if (infoBoxContainer) {
        infoBoxContainer.innerHTML = `
            <h3>${paragraphBezeichnung || 'Keine offizielle Bezeichnung'}</h3>
            <h4>Beschreibung des Paragraphen:</h4>
            <p>${paragrafBeschreibung || 'Keine Beschreibung verfügbar.'}</p>
            <h4>Vollständiger Text des Paragraphen:</h4>
            <pre>${gesamterParagraphText || 'Text nicht verfügbar.'}</pre>`;
        infoBoxContainer.style.display = 'block';
    }
}

function uiClearAndPrepareTab(tabId, normInfoLoadingText = 'Lade Daten...') {
    const activeTabContent = document.getElementById(tabId);
    if (!activeTabContent) return;
    const normInfoContainer = activeTabContent.querySelector('.tab-norm-info-container');
    if (normInfoContainer) normInfoContainer.innerHTML = `<h2>Norminformation</h2><p>${normInfoLoadingText}</p>`;
}

function uiRenderParameters(parameterListe, tabId, onInputChangeCallback) {
    const activeTabContent = document.getElementById(tabId);
    if (!activeTabContent) return;
    const parameterContainer = activeTabContent.querySelector('.tab-parameter-container');
    if (!parameterContainer) return;

    parameterContainer.innerHTML = '<h2>Prüfungspunkte</h2>';
    if (!parameterListe || parameterListe.length === 0) {
        parameterContainer.innerHTML += '<p>Für diesen Absatz sind keine interaktiven Prüfungspunkte definiert.</p>';
        return;
    }

    parameterListe.forEach(param => {
        const group = document.createElement('div');
        group.classList.add('parameter-group');
        group.setAttribute('data-parameter-id', param.Parameter_ID);
        const label = document.createElement('p');
        label.classList.add('parameter-frage');
        label.textContent = `${param.Reihenfolge_Anzeige || ''}. ${param.Fragetext}`;
        group.appendChild(label);

        if (param.Begleittext) {
            const begleittextP = document.createElement('p');
            begleittextP.classList.add('begleit-text');
            begleittextP.innerHTML = param.Begleittext;
            group.appendChild(begleittextP);
        }

        const antwortDiv = document.createElement('div');
        antwortDiv.classList.add('interaction-options');
        const cleanTabIdPart = tabId.replace(/[^a-zA-Z0-9-_]/g, '');
        const inputBaseName = `${param.Parameter_ID}_${cleanTabIdPart}`; 

        if (param.Antworttyp === 'JaNein') {
            const idJa = `${inputBaseName}_ja`;
            const idNein = `${inputBaseName}_nein`;
            const labelJa = document.createElement('label');
            const inputJa = document.createElement('input');
            inputJa.type = 'radio'; inputJa.id = idJa; inputJa.name = inputBaseName; inputJa.value = "Ja"; inputJa.required = true;
            if (typeof onInputChangeCallback === "function") inputJa.addEventListener('change', onInputChangeCallback);
            labelJa.appendChild(inputJa);
            labelJa.append(" Ja");
            antwortDiv.appendChild(labelJa);

            const labelNein = document.createElement('label');
            const inputNein = document.createElement('input');
            inputNein.type = 'radio'; inputNein.id = idNein; inputNein.name = inputBaseName; inputNein.value = "Nein"; inputNein.required = true;
            if (typeof onInputChangeCallback === "function") inputNein.addEventListener('change', onInputChangeCallback);
            labelNein.appendChild(inputNein);
            labelNein.append(" Nein");
            antwortDiv.appendChild(labelNein);

        } else if (param.Antworttyp === 'AuswahlEinfach') {
            const select = document.createElement('select');
            select.id = inputBaseName;
            select.name = inputBaseName;
            select.classList.add('dropdown-element');
            select.required = true;
            if (typeof onInputChangeCallback === "function") select.addEventListener('change', onInputChangeCallback);
            
            const defaultOption = document.createElement('option');
            defaultOption.value = "";
            defaultOption.textContent = "Bitte wählen...";
            defaultOption.disabled = true;
            defaultOption.selected = true;
            select.appendChild(defaultOption);

            if (param.Antwortoptionen_bei_Auswahl) {
                param.Antwortoptionen_bei_Auswahl.forEach(opt => {
                    const optionEl = document.createElement('option');
                    optionEl.value = opt.Option_Wert_Intern;
                    optionEl.textContent = opt.Option_Text;
                    select.appendChild(optionEl);
                });
            }
            antwortDiv.appendChild(select);
        }

        group.appendChild(antwortDiv);
        parameterContainer.appendChild(group);
    });
}

// ====================================================================================
// === III. WEITERE UI-HILFSFUNKTIONEN & NEUE QA-FUNKTIONEN
// ====================================================================================

function uiSetElementVisibility(parameterId, isVisible, tabId) {
    const activeTabContent = document.getElementById(tabId);
    if (!activeTabContent) return;
    const parameterGroupElement = activeTabContent.querySelector(`.parameter-group[data-parameter-id="${parameterId}"]`);
    if (parameterGroupElement) {
        parameterGroupElement.style.display = isVisible ? 'block' : 'none';
    }
}

function uiUpdateProgressBar(tabId, percentage, textToDisplay, hideBar = false) {
    const activeTabContent = document.getElementById(tabId);
    if (!activeTabContent) return;
    const progressBarContainer = activeTabContent.querySelector('.progress-bar-container');
    const progressBarElement = activeTabContent.querySelector('.progress-bar');
    const progressTextElement = activeTabContent.querySelector('.tab-progress-text');

    if (!progressBarContainer || !progressBarElement || !progressTextElement) return;

    if (hideBar) {
        progressBarContainer.style.display = 'none';
    } else {
        progressBarContainer.style.display = 'block';
        progressBarElement.style.width = `${percentage}%`;
        progressBarElement.textContent = `${Math.round(percentage)}%`;
    }
    progressTextElement.textContent = textToDisplay;
}

function uiShowErrorInNormInfo(errorMessage, tabId) {
    const activeTabContent = document.getElementById(tabId);
    if (!activeTabContent) return;
    const normInfoContainer = activeTabContent.querySelector('.tab-norm-info-container');
    if (normInfoContainer) {
        normInfoContainer.innerHTML = `<h2>Norminformation</h2><p style="color:red;">${errorMessage}</p>`;
    }
}

function uiRenderActionButton(parameterListe, tabId, onPruefButtonClickCallback) {
    const activeTabContent = document.getElementById(tabId);
    if (!activeTabContent) return;
    const actionButtonContainer = activeTabContent.querySelector('.tab-action-button-container');
    if (!actionButtonContainer) return;

    actionButtonContainer.innerHTML = '';
    if (parameterListe && parameterListe.length > 0) {
        const pruefButton = document.createElement('button');
        pruefButton.textContent = 'Diesen Absatz prüfen';
        const cleanTabIdPart = tabId.replace(/[^a-zA-Z0-9-_]/g, '');
        pruefButton.id = `btn-pruefen-${cleanTabIdPart}`;
        if(typeof onPruefButtonClickCallback === "function"){
            pruefButton.addEventListener('click', onPruefButtonClickCallback);
        }
        actionButtonContainer.appendChild(pruefButton);
    } else {
        actionButtonContainer.innerHTML = '<p><em>Keine Prüfung für diesen Absatz erforderlich/möglich.</em></p>';
    }
}

function uiRenderNormInfo(simulationsEinheit, tabId) {
    const activeTabContent = document.getElementById(tabId);
    if (!activeTabContent) return;
    const normInfoContainer = activeTabContent.querySelector('.tab-norm-info-container');
    if (!normInfoContainer) return;

    if (!simulationsEinheit) {
        normInfoContainer.innerHTML = '<h2>Fehler</h2><p style="color:red;">Daten für die Norminformation konnten nicht verarbeitet werden.</p>';
        return;
    }
    const htmlToRender = `
        <h2>§${simulationsEinheit.Paragraph || '?'} Abs. ${simulationsEinheit.Absatz || '?'} ${simulationsEinheit.Satz || ''} ${simulationsEinheit.Gesetz || '?'}</h2>
        <p class="kurzbeschreibung"><strong>Kurzbeschreibung (Absatz):</strong> ${simulationsEinheit.Kurzbeschreibung || 'N/A'}</p>
        <div class="norm-text-display">
            <p><strong>Gesetzestext (Absatz):</strong></p>
            <pre>${simulationsEinheit.Gesetzestext_Zitat || 'Angabe fehlt'}</pre>
        </div>
    `;
    normInfoContainer.innerHTML = htmlToRender;
}

function uiDisplayErgebnis(profil, userInputs, allParameters, tabId) {
    const activeTabContent = document.getElementById(tabId);
    if (!activeTabContent) return;
    const proContraUl = activeTabContent.querySelector('.tab-procontra-container ul');
    const ergebnisDiv = activeTabContent.querySelector('.tab-ergebnis-container');
    if (!proContraUl || !ergebnisDiv) return;
    proContraUl.innerHTML = '';
    ergebnisDiv.innerHTML = '<h2>Ergebnis (Absatz)</h2>';

    if (!profil) {
        ergebnisDiv.innerHTML += "<p style='color:orange;'>Kein spezifisches Ergebnisprofil für die getroffene Auswahl gefunden.</p>";
        ergebnisDiv.style.display = 'block';
        ergebnisDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        return;
    }

    ergebnisDiv.innerHTML += `<h3>Entscheidung:</h3><p class="entscheidung-text">${profil.Entscheidungstext_Kurz_Vorlage || ''}</p>`;
    ergebnisDiv.innerHTML += `<p><strong>Art der Entscheidung:</strong> ${profil.Art_der_Entscheidung_Anzeige_Text || 'N/A'}</p><hr>`;
    const begruendungContainer = document.createElement('div');
    begruendungContainer.classList.add('begruendung-detail');
    if (profil.Einleitungstext_Begruendung_Vorlage) {
        begruendungContainer.innerHTML += `<p>${profil.Einleitungstext_Begruendung_Vorlage}</p>`;
    }
    const begruendungUl = document.createElement('ul');
    if (allParameters && profil.Begruendung_Dynamische_Parameter_Liste && Array.isArray(profil.Begruendung_Dynamische_Parameter_Liste)) {
        profil.Begruendung_Dynamische_Parameter_Liste.forEach(paramId => {
            const parameter = allParameters.find(p => p.Parameter_ID === paramId);
            if (parameter) {
                const li = document.createElement('li');
                const userInput = userInputs[paramId];
                let displayText = "", liClass = "";
                if (userInput === undefined || userInput === null || userInput === "") {
                    displayText = `${parameter.Fragetext || paramId}: Nicht beantwortet.`;
                    liClass = 'neutral'; 
                } else {
                    let isProLogic = (userInput === "Ja" || userInput === true);
                    if (parameter.Text_Erfuellt_Pro && !parameter.Text_NichtErfuellt_Contra) isProLogic = true;
                    else if (!parameter.Text_Erfuellt_Pro && parameter.Text_NichtErfuellt_Contra) isProLogic = false;
                    if (isProLogic) {
                        displayText = parameter.Text_Erfuellt_Pro || `${parameter.Fragetext}: Zutreffend`;
                        liClass = 'pro';
                    } else {
                        displayText = parameter.Text_NichtErfuellt_Contra || `${parameter.Fragetext}: Nicht zutreffend`;
                        liClass = 'contra';
                    }
                }
                li.textContent = displayText;
                if (liClass) li.classList.add(liClass);
                begruendungUl.appendChild(li);
            }
        });
    }
    proContraUl.appendChild(begruendungUl);
    if (profil.Spezifischer_Ergaenzungstext_Begruendung_Vorlage) {
        begruendungContainer.innerHTML += `<div class="text-block"><h4>Zusätzliche Hinweise/Leitlinien:</h4><p>${profil.Spezifischer_Ergaenzungstext_Begruendung_Vorlage}</p></div>`;
    }
    if (profil.Abschlusstext_Begruendung_Vorlage) {
        begruendungContainer.innerHTML += `<p>${profil.Abschlusstext_Begruendung_Vorlage}</p>`;
    }
    ergebnisDiv.appendChild(begruendungContainer);
    ergebnisDiv.style.display = 'block';
    ergebnisDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    uiUpdateButtonText(tabId, "Prüfung zurücksetzen");
}

function uiShowConclusiveHinweis(tabId, kurzText, langText, konklusionsTyp) {
    const activeTabContent = document.getElementById(tabId);
    if (!activeTabContent) return;
    const hinweisContainer = activeTabContent.querySelector('.tab-conclusive-hinweis-container');
    if (hinweisContainer) {
        hinweisContainer.innerHTML = `<p><strong>${kurzText || 'Hinweis zur Prüfung:'}</strong></p><p style="margin-top: 8px; font-weight: normal; font-size: 0.9em;">${langText || ''}</p>`;
        hinweisContainer.className = 'panel-section conclusive-hinweis-container tab-conclusive-hinweis-container';
        if (konklusionsTyp === 'NEGATIV_BLOCKIEREND') hinweisContainer.classList.add('negativ-blockierend');
        else if (konklusionsTyp === 'POSITIV_ABSCHLIESSEND') hinweisContainer.classList.add('positiv-abschliessend');
        hinweisContainer.style.display = 'block';
        hinweisContainer.scrollIntoView({ behavior: 'smooth', block: 'center' }); 
    }
}

function uiClearConclusiveHinweis(tabId) {
    const activeTabContent = document.getElementById(tabId);
    if (!activeTabContent) return;
    const hinweisContainer = activeTabContent.querySelector('.tab-conclusive-hinweis-container');
    if (hinweisContainer) {
        hinweisContainer.textContent = '';
        hinweisContainer.style.display = 'none';
        hinweisContainer.className = 'panel-section conclusive-hinweis-container tab-conclusive-hinweis-container';
    }
}

function uiDisplayConclusiveResult(tabId, langText, konklusionsTyp) {
    const activeTabContent = document.getElementById(tabId);
    if (!activeTabContent) return;
    const ergebnisDiv = activeTabContent.querySelector('.tab-ergebnis-container');
    if(ergebnisDiv) {
         ergebnisDiv.innerHTML = `<h2>Ergebnis (Absatz)</h2><h3>Entscheidung:</h3><p>${langText}</p>`;
         ergebnisDiv.style.display = 'block';
    }
    if (typeof uiUpdateButtonText === "function") uiUpdateButtonText(tabId, "Prüfung zurücksetzen");
    if (typeof uiUpdateProgressBar === "function") uiUpdateProgressBar(tabId, 100, "Prüfung durch Grundvoraussetzung abgeschlossen.", false);
}

function uiClearErgebnisbereich(tabId) {
    const activeTabContent = document.getElementById(tabId);
    if (!activeTabContent) return;
    const proContraUl = activeTabContent.querySelector('.tab-procontra-container ul');
    const ergebnisDiv = activeTabContent.querySelector('.tab-ergebnis-container');
    if (proContraUl) proContraUl.innerHTML = '';
    if (ergebnisDiv) {
        ergebnisDiv.innerHTML = '<h2>Ergebnis (Absatz)</h2>';
        ergebnisDiv.style.display = 'none';
    }
}

function uiUpdateButtonText(tabId, newText) {
    const activeTabContent = document.getElementById(tabId);
    if (!activeTabContent) return;
    const cleanTabIdPart = tabId.replace(/[^a-zA-Z0-9-_]/g, '');
    const pruefButton = activeTabContent.querySelector(`#btn-pruefen-${cleanTabIdPart}`);
    if (pruefButton) pruefButton.textContent = newText;
}

function uiShowThinkingIndicator(tabId, message = "SimONA wertet aus...") {
    const activeTabContent = document.getElementById(tabId);
    if (!activeTabContent) return;
    const ergebnisDiv = activeTabContent.querySelector('.tab-ergebnis-container');
    if (ergebnisDiv) {
        ergebnisDiv.innerHTML = `<h2>Ergebnis (Absatz)</h2><div class="simona-thinking-indicator"><div class="thinking-orb"></div><p>${message}</p></div>`;
        ergebnisDiv.style.display = 'block';
    }
}

function uiRenderStatsChart(statsData) {
    const chartWidgetContainer = document.getElementById('widget-norm-stats');
    const ctx = document.getElementById('normStatsChart')?.getContext('2d');
    if (!chartWidgetContainer || !ctx) return;
    if (normStatsChartInstance) normStatsChartInstance.destroy();
    chartWidgetContainer.style.display = 'block';
    normStatsChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Absätze', 'Prüffragen', 'Ergebnisprofile', 'Regeln'],
            datasets: [{
                label: 'Anzahl der Elemente',
                data: [statsData.anzahl_einheiten, statsData.anzahl_parameter, statsData.anzahl_ergebnisprofile, statsData.anzahl_regeln],
                backgroundColor: ['rgba(0, 123, 255, 0.6)', 'rgba(255, 193, 7, 0.6)', 'rgba(40, 167, 69, 0.6)', 'rgba(108, 117, 125, 0.6)'],
                borderColor: ['rgba(0, 123, 255, 1)', 'rgba(255, 193, 7, 1)', 'rgba(40, 167, 69, 1)', 'rgba(108, 117, 125, 1)'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
        }
    });
}

function getScoreColor(score) {
    if (score === null || score === undefined) return '#6c757d'; // Grau für keinen Score
    if (score >= 8.5) return '#28a745'; // Grün
    if (score >= 6.0) return '#ffc107'; // Gelb
    return '#dc3545'; // Rot
}

// Kleine Hilfsfunktion, um das Ein-/Ausblenden zu vereinfachen
function toggleElementDisplay(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
        el.style.display = el.style.display === 'none' ? 'block' : 'none';
    }
}

// ERSETZEN SIE DIESE FUNKTION IN simona-ui.js
// ERSETZEN SIE DIESE FUNKTION IN simona-ui.js
function uiRenderAuditData(audits, tabId, einheitId) {
    const container = document.getElementById(tabId);
    if (!container) return;

    let html = '<h2>Qualitätssicherung</h2>';

    // Button für Re-Audit, der jetzt den localStorage nutzt
    if (einheitId) {
        // HINWEIS: Passen Sie den Pfad zur 'assembler.html' ggf. an Ihre Ordnerstruktur an.
        const assemblerUrl = `../assembler/assembler.html`;
        const reAuditFunction = `localStorage.setItem('simona_reaudit_id', '${einheitId}'); window.open('${assemblerUrl}', '_blank');`;
        html += `<button onclick="${reAuditFunction}" style="margin-bottom: 20px; background-color: #e67e22; cursor: pointer;">Neues Audit für diese Norm anstoßen</button>`;
    }

    if (!audits || audits.length === 0) {
        html += '<p>Für diese Normeinheit wurden noch keine Qualitäts-Audits durchgeführt.</p>';
        container.innerHTML = html;
        return;
    }

    // Dropdown zur Auswahl, wenn mehr als ein Audit vorhanden ist
    if (audits.length > 1) {
        html += `<label for="audit-select-${tabId}" style="font-weight:bold; margin-bottom:5px; display:block;">Audit-Version auswählen:</label>
                 <select id="audit-select-${tabId}" class="dropdown-element" style="margin-bottom:20px;">`;
        audits.forEach((audit, index) => {
            const timestamp = new Date(audit.Audit_Timestamp).toLocaleString('de-DE');
            const scoreText = audit.Gesamtscore ? parseFloat(audit.Gesamtscore).toFixed(1) : 'N/A';
            html += `<option value="${index}">Audit vom ${timestamp} (Score: ${scoreText})</option>`;
        });
        html += `</select>`;
    }

    html += `<div id="audit-display-area-${tabId}"></div>`;
    container.innerHTML = html;

    const displayArea = document.getElementById(`audit-display-area-${tabId}`);

    const renderSelectedAudit = (audit) => {
        if (!audit) return;
        let auditHtml = '';
        const scoreColor = getScoreColor(audit.Gesamtscore);
        const timestamp = new Date(audit.Audit_Timestamp).toLocaleString('de-DE');
        const scoreText = audit.Gesamtscore ? parseFloat(audit.Gesamtscore).toFixed(1) : 'N/A';

        auditHtml += `<div class="panel-section">
                        <h3>Gesamtbewertung (Audit vom ${timestamp})</h3>
                        <p style="font-size: 1.5em; font-weight: bold; color: ${scoreColor};">
                            Score: ${scoreText} / 10.0
                        </p>
                        <p><strong>Fazit:</strong> ${audit.Gesamtfazit || 'Kein Fazit verfügbar.'}</p>
                     </div>`;

        if (audit.Detailbewertungen && Array.isArray(audit.Detailbewertungen)) {
            audit.Detailbewertungen.forEach(detail => {
                const detailScoreColor = getScoreColor(detail.Score);
                auditHtml += `<div class="panel-section" style="margin-top:15px;">
                                <h4>${detail.Kategorie} <span style="color: ${detailScoreColor}; font-weight:bold;">(${detail.Score}/10)</span></h4>
                                <p>${detail.Begruendung || ''}</p>
                             </div>`;
            });
        }
        
        const promptId = `audit-prompt-${audit.AuditID}`;
        const responseId = `audit-response-${audit.AuditID}`;
        auditHtml += `<div class="panel-section" style="margin-top:15px; background-color: #f8f9fa;">
                        <button onclick="toggleElementDisplay('${promptId}')">Technischen Prompt ein-/ausblenden</button>
                        <pre id="${promptId}" style="display:none; white-space: pre-wrap; margin-top:10px; border: 1px solid #dee2e6; padding: 10px; background-color: #fff;">${audit.P5_Prompt_Text || ''}</pre>
                        <button onclick="toggleElementDisplay('${responseId}')" style="margin-top:10px;">Technische Antwort ein-/ausblenden</button>
                        <pre id="${responseId}" style="display:none; white-space: pre-wrap; margin-top:10px; border: 1px solid #dee2e6; padding: 10px; background-color: #fff;">${audit.P5_Response_JSON || ''}</pre>
                     </div>`;

        displayArea.innerHTML = auditHtml;
    };

    const select = document.getElementById(`audit-select-${tabId}`);
    if (select) {
        select.addEventListener('change', (event) => {
            renderSelectedAudit(audits[event.target.value]);
        });
    }
    
    renderSelectedAudit(audits[0]);
}

// In simona-ui.js am Ende der Datei einfügen (ersetzt den vorherigen Block)

/**
 * Rendert die komplette Audit-Ansicht.
 * @param {Array|null} audits - Das Array der Audit-Objekte.
 * @param {string} targetElementId - Die ID des Ziel-Containers.
 * @param {string} einheitIdBasis - Die Basis-ID der Norm.
 * @param {boolean} isLoading - Zeigt an, ob der Ladezustand gerendert werden soll.
 * @param {string|null} errorMessage - Eine optionale Fehlermeldung.
 */
function uiRenderAuditData(audits, targetElementId, einheitIdBasis, isLoading, errorMessage = null) {
    const container = document.getElementById(targetElementId);
    if (!container) return;

    container.innerHTML = '<h2>Qualitätssicherung & Audit-Vergleich</h2>';

    if (isLoading) {
        container.innerHTML += '<div class="simona-thinking-indicator"><div class="thinking-orb"></div><p>Lade Qualitäts-Audits...</p></div>';
        return;
    }
    
    if (errorMessage) {
        container.innerHTML += `<p style="color:red;">Fehler: ${errorMessage}</p>`;
        return;
    }

    if (!audits || !Array.isArray(audits) || audits.length === 0) {
        container.innerHTML += '<p>Für diese Norm(teile) wurden noch keine Qualitäts-Audits erstellt.</p>';
        return;
    }

    const selectLabel = document.createElement('label');
    selectLabel.setAttribute('for', 'audit-version-selector');
    selectLabel.textContent = 'Verfügbare Audit-Version auswählen:';
    container.appendChild(selectLabel);

    const select = document.createElement('select');
    select.id = 'audit-version-selector';
    select.classList.add('dropdown-element');
    container.appendChild(select);

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '-- Bitte Audit wählen --';
    select.appendChild(defaultOption);

    audits.forEach(audit => {
        const option = document.createElement('option');
        option.value = audit.AuditID;
        option.textContent = createAuditDisplayName(audit);
        select.appendChild(option);
    });

    const auditContentArea = document.createElement('div');
    auditContentArea.id = 'audit-detail-content';
    auditContentArea.style.marginTop = '20px';
    container.appendChild(auditContentArea);

    // KORRIGIERTER EVENT-LISTENER
    select.addEventListener('change', (event) => {
        console.group("Audit-Auswahl geändert");
        const selectedAuditId = event.target.value;
        console.log("Ausgewählte Audit-ID:", selectedAuditId);

        if (!selectedAuditId) {
            displayAuditDetails(null, auditContentArea); // Leert die Anzeige
            console.log("Keine Auswahl, Anzeige geleert.");
            console.groupEnd();
            return;
        }

        // Suche das passende Audit-Objekt im 'audits'-Array
        const selectedAudit = audits.find(a => String(a.AuditID) === String(selectedAuditId));

        console.log("Gefundenes Audit-Objekt:", selectedAudit); // WICHTIGES DEBUGGING
        displayAuditDetails(selectedAudit, auditContentArea);
        console.groupEnd();
    });
}


/**
 * Erzeugt einen lesbaren Namen für eine Audit-Auswahloption. (Unverändert)
 */
function createAuditDisplayName(audit) {
    if (!audit) return 'Unbekanntes Audit';

    let displayParts = [];

    // 1. Nutze die sauberen Felder aus der Datenbank
    const normTeil = `${audit.Absatz ? 'Abs. ' + audit.Absatz : ''} ${audit.Satz ? 'S. ' + audit.Satz : ''}`.trim();
    if (normTeil) {
        displayParts.push(normTeil);
    }
    
    // Extrahiere Variante aus der ID (dies bleibt поки)
    const varianteMatch = audit.FK_Einheit_ID.match(/__v_([^_]+)/);
    const variante = varianteMatch ? varianteMatch[1] : 'Standard';
    displayParts.push(variante);
    
    // Nutze die saubere Prompt-Version aus der DB
    if (audit.Prompt_Version) {
        displayParts.push(`Prompt-Version: ${audit.Prompt_Version}`);
    }

    // 2. Formatiere den Score
    const scoreText = (audit.Gesamtscore !== null && audit.Gesamtscore !== undefined)
        ? `(Score: ${parseFloat(audit.Gesamtscore).toFixed(1)}/10)`
        : '(Kein Score)';
    displayParts.push(scoreText);

    // 3. Formatiere das Datum
    const timestamp = new Date(audit.Audit_Timestamp).toLocaleString('de-DE', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    displayParts.push(`- [${timestamp} Uhr]`);

    // 4. Baue den finalen String zusammen
    return displayParts.join('   ');
}


/**
 * Zeigt die Details eines ausgewählten Audits an. (Unverändert)
 */
function getScoreColor(score) {
    if (score === null || score === undefined) {
        return { backgroundColor: '#6c757d', color: 'white' }; // Grau für keinen Score
    }

    const s = parseFloat(score);
    // Farbverlauf von Rot (0) über Gelb (5) zu Grün (10)
    const red = Math.min(255, 255 - (s * 25.5));
    const green = Math.min(255, s * 25.5);

    const backgroundColor = `rgb(${red}, ${green}, 70)`;

    // Textfarbe basierend auf der Helligkeit der Hintergrundfarbe bestimmen
    // Formel zur Helligkeitsberechnung
    const brightness = (red * 299 + green * 587 + 70 * 114) / 1000;
    const textColor = brightness > 125 ? 'black' : 'white';

    return { backgroundColor, color: textColor };
}


/**
 * VERBESSERTE VERSION
 * Zeigt die Details eines ausgewählten Audits an, inklusive des neuen farbigen Score-Badges.
 */
function displayAuditDetails(audit, container) {
    if (!audit) {
        container.innerHTML = '';
        return;
    }

    let responseJson = {};
    try {
        if (audit.P5_Response_JSON) responseJson = JSON.parse(audit.P5_Response_JSON);
    } catch (e) {
        console.error("Fehler beim Parsen des Audit-JSON:", e);
        container.innerHTML = "<p style='color:red;'>Fehler: Das gespeicherte Audit-Format ist ungültig.</p>";
        return;
    }
    
    const gesamtbewertung = responseJson.Gesamtbewertung || {};
    const detailbewertungen = responseJson.Detailbewertungen || [];
    
    // --- HIER FINDET DIE ÄNDERUNG STATT ---
    
    // 1. Hole die Farben für den Score
    const scoreValue = gesamtbewertung.Score;
    const { backgroundColor, color } = getScoreColor(scoreValue);
    
    // 2. Erstelle den Score-Text und das Badge
    const scoreText = scoreValue ? `${parseFloat(scoreValue).toFixed(1)} / 10.0` : 'N/A';
    const scoreBadgeHTML = `<div class="score-badge" style="background-color: ${backgroundColor}; color: ${color};">${scoreText}</div>`;

    // 3. Baue das finale HTML zusammen
    let html = `
        <div class="panel-section" style="border-left: 4px solid #007bff;">
            <h3>Gesamtbewertung (Audit-ID: ${audit.AuditID})</h3>
            <h4>Zugeordnete Einheit: <span style="font-weight:normal;">${audit.FK_Einheit_ID}</span></h4>
            ${scoreBadgeHTML}
            <p style="margin-top: 15px;"><strong>Fazit:</strong> ${gesamtbewertung.Fazit || 'Kein Fazit vorhanden.'}</p>
        </div>
    `;

    // Der Rest der Funktion bleibt gleich
    detailbewertungen.forEach(detail => {
        const detailScoreColor = getScoreColor(detail.Score);
        html += `
            <div class="panel-section" style="margin-top: 15px;">
                <h4>${detail.Kategorie || 'Unbenannte Kategorie'} <span style="font-weight:bold; color: ${detailScoreColor.backgroundColor};">(${detail.Score}/10)</span></h4>
                <p>${detail.Begruendung || ''}</p>
            </div>
        `;
    });

    container.innerHTML = html;
}