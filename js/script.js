document.addEventListener('DOMContentLoaded', () => {
    // Variablen, die im Scope dieses DOMContentLoaded-Handlers "global" sind
    let currentAbsatzData = null;
    let currentTabUserInputs = {};

    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');

    // Event-Listener für Tab-Klicks
    tabLinks.forEach(link => {
        link.addEventListener('click', () => {
            const tabId = link.getAttribute('data-tab');
            // Korrekter Zugriff auf data-einheit-id (mit Bindestrich)
            const einheitIdData = link.getAttribute('data-einheit-id');

            // Alle Tabs deaktivieren
            tabLinks.forEach(item => item.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Ziel-Tab aktivieren
            link.classList.add('active');
            const activeTabContent = document.getElementById(tabId);

            if (activeTabContent) {
                activeTabContent.classList.add('active');
                // Prüfen, ob Daten geladen werden sollen
                if (einheitIdData && einheitIdData !== "UEBERSICHT_ID_PLATZHALTER" && einheitIdData !== "GESAMTERGEBNIS_ID_PLATZHALTER") {
                    loadAndDisplayAbsatzData(einheitIdData, tabId);
                } else if (tabId === "tab-overview") {
                    // Spezifische Logik für den "Übersicht & Einstieg"-Tab
                    // (kann statischen Inhalt oder spezielle UI-Elemente haben)
                    activeTabContent.querySelector('.tab-norm-info-container').innerHTML = '<h2>Willkommen bei SimONA!</h2><p>Wählen Sie einen Absatz aus der Navigation, um mit der Simulation zu beginnen.</p>';
                    activeTabContent.querySelector('.tab-parameter-container').innerHTML = ''; // Parameter-Bereich leeren
                    activeTabContent.querySelector('.tab-action-button-container').innerHTML = ''; // Aktions-Button-Bereich leeren
                    activeTabContent.querySelector('.tab-procontra-container ul').innerHTML = ''; // Pro/Contra leeren
                    const ergebnisContainer = activeTabContent.querySelector('.tab-ergebnis-container');
                    if(ergebnisContainer) {
                        ergebnisContainer.innerHTML = '<h2>Ergebnis (Absatz)</h2>';
                        ergebnisContainer.style.display = 'none';
                    }


                    // Statische Slider nur für "tab-overview", falls sie dort im HTML definiert sind
                    const kindAlterSlider = document.getElementById('param_kind_alter');
                    const kindAlterWertDisplay = document.getElementById('kind_alter_wert');
                    if (kindAlterSlider && kindAlterWertDisplay) {
                        kindAlterWertDisplay.textContent = kindAlterSlider.value;
                        kindAlterSlider.oninput = function() {
                            kindAlterWertDisplay.textContent = this.value;
                        }
                    }
                    const ageSlider = document.getElementById('param_age_slider'); // Beispiel-Slider
                    const ageSliderValueDisplay = document.getElementById('age_slider_value');
                    if (ageSlider && ageSliderValueDisplay) {
                        ageSliderValueDisplay.textContent = ageSlider.value;
                        ageSlider.oninput = function() {
                            ageSliderValueDisplay.textContent = this.value;
                        }
                    }
                } else if (tabId === "tab-result") {
                    // Logik für Gesamtergebnis-Tab (noch zu implementieren)
                    activeTabContent.querySelector('.tab-norm-info-container').innerHTML = '<h2>Gesamtergebnis der Simulation</h2><p>Die Zusammenfassung über alle Absätze wird hier angezeigt, sobald die Funktion implementiert ist.</p>';
                    activeTabContent.querySelector('.tab-parameter-container').innerHTML = '';
                    activeTabContent.querySelector('.tab-action-button-container').innerHTML = '';
                }
            }
        });
    });

    // Initial den ersten Tab aktivieren und ggf. dessen spezielle Logik ausführen
    if (tabLinks.length > 0) {
        tabLinks[0].click(); // Simuliert einen Klick auf den ersten Tab
    }

    async function loadAndDisplayAbsatzData(einheitIdToLoad, tabId) {
        const activeTabContent = document.getElementById(tabId);
        if (!activeTabContent) {
            console.error("Tab-Inhaltselement nicht gefunden:", tabId);
            return;
        }

        const normInfoContainer = activeTabContent.querySelector('.tab-norm-info-container');
        const parameterContainer = activeTabContent.querySelector('.tab-parameter-container');
        const actionButtonContainer = activeTabContent.querySelector('.tab-action-button-container');
        const proContraUl = activeTabContent.querySelector('.tab-procontra-container ul');
        const ergebnisContainer = activeTabContent.querySelector('.tab-ergebnis-container');

        // Bereiche zurücksetzen/leeren und Ladeanzeige
        if (normInfoContainer) normInfoContainer.innerHTML = '<h2>Norminformation</h2><p>Lade Daten...</p>';
        if (parameterContainer) parameterContainer.innerHTML = '<h2>Prüfungspunkte</h2>';
        if (actionButtonContainer) actionButtonContainer.innerHTML = '';
        if (proContraUl) proContraUl.innerHTML = '';
        if (ergebnisContainer) {
            ergebnisContainer.innerHTML = '<h2>Ergebnis (Absatz)</h2>';
            ergebnisContainer.style.display = 'none';
        }
        currentTabUserInputs = {};

        try {
            console.log(`Lade Daten für Einheit: ${einheitIdToLoad}`);
            const response = await fetch(`get_simona_data.php?einheit_id=${encodeURIComponent(einheitIdToLoad)}`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: `HTTP-Fehler: ${response.status}` }));
                throw new Error(errorData.error || `HTTP-Fehler: ${response.status} für ${einheitIdToLoad}`);
            }
            currentAbsatzData = await response.json(); // Daten in der im Scope "globalen" Variable speichern

            if (currentAbsatzData.error) { // Fehler vom PHP-Skript gemeldet
                 throw new Error(currentAbsatzData.error);
            }
            if (!currentAbsatzData.simulationsEinheit) {
                throw new Error("Geladene Daten sind unvollständig: simulationsEinheit fehlt.");
            }
            console.log("Daten für", einheitIdToLoad, "geladen:", currentAbsatzData);


            // 1. Norminformationen anzeigen
            if (normInfoContainer) {
                const se = currentAbsatzData.simulationsEinheit;
                normInfoContainer.innerHTML = `
                    <h2>§${se.Paragraph || '?'} Abs. ${se.Absatz || '?'} ${se.Satz || ''} ${se.Gesetz || '?'}</h2>
                    <p class="kurzbeschreibung"><strong>Kurzbeschreibung:</strong> ${se.Kurzbeschreibung || 'N/A'}</p>
                    <div class="norm-text-display">
                        <p><strong>Gesetzestext:</strong></p>
                        <pre>${se.Gesetzestext_Zitat_Analysierter_Teil || 'Kein Wert vorhanden'}</pre>
                    </div>
                    <p><strong>Grundsätzliche Entscheidungsart:</strong> ${se.Entscheidungsart_Bezeichnung || 'N/A'}</p>
                `;
            }

            // 2. Parameter anzeigen
            if (parameterContainer && currentAbsatzData.parameterListe) {
                parameterContainer.innerHTML = '<h2>Prüfungspunkte</h2>'; // Überschrift für den Bereich
                if(currentAbsatzData.parameterListe.length === 0) {
                    parameterContainer.innerHTML += '<p>Für diesen Absatz sind keine interaktiven Prüfungspunkte definiert.</p>';
                }
                currentAbsatzData.parameterListe.forEach(param => {
                    const group = document.createElement('div');
                    group.classList.add('parameter-group');
                    group.setAttribute('data-parameter-id', param.Parameter_ID);

                    const label = document.createElement('label');
                    label.classList.add('parameter-frage');
                    // Eindeutige ID für 'for' Attribut, falls Radio-Buttons nicht direkt im Label sind
                    const inputBaseId = `${param.Parameter_ID}_${tabId}`;
                    label.setAttribute('for', inputBaseId + (param.Antworttyp === 'AuswahlEinfach' ? '' : '_ja')); // Für Select die Basis-ID, für JaNein die erste Option
                    label.textContent = `${param.Reihenfolge_Anzeige || ''}. ${param.Fragetext}`;
                    group.appendChild(label);

                    if (param.Begleittext) {
                        const begleittextP = document.createElement('p');
                        begleittextP.classList.add('begleit-text');
                        begleittextP.innerHTML = param.Begleittext; // innerHTML falls der Text HTML enthält
                        group.appendChild(begleittextP);
                    }

                    const antwortDiv = document.createElement('div');
                    antwortDiv.classList.add('interaction-options');

                    if (param.Antworttyp === 'JaNein') {
                        const idJa = `${inputBaseId}_ja`;
                        const idNein = `${inputBaseId}_nein`;

                        antwortDiv.innerHTML = `
                            <div class="horizontal-radios">
                                <input type="radio" id="${idJa}" name="${inputBaseId}" value="Ja" required>
                                <label for="${idJa}">Ja</label>
                            </div>
                            <div class="horizontal-radios">
                                <input type="radio" id="${idNein}" name="${inputBaseId}" value="Nein">
                                <label for="${idNein}">Nein</label>
                            </div>`;
                    } else if (param.Antworttyp === 'AuswahlEinfach') {
                        const select = document.createElement('select');
                        select.id = inputBaseId;
                        select.name = inputBaseId;
                        select.classList.add('dropdown-element');
                        select.required = true;

                        const defaultOption = document.createElement('option');
                        defaultOption.value = "";
                        defaultOption.textContent = "Bitte wählen...";
                        defaultOption.disabled = true; // Mache "Bitte wählen" nicht auswählbar nach erster Auswahl
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
                    // Hier weitere Antworttypen implementieren (Slider, Toggle etc.)
                    group.appendChild(antwortDiv);
                    parameterContainer.appendChild(group);
                });
            }


            // 3. Aktionsbutton hinzufügen (programmatischer Event-Listener)
            if (actionButtonContainer) {
                actionButtonContainer.innerHTML = ''; // Alte Buttons entfernen
                if (currentAbsatzData.parameterListe && currentAbsatzData.parameterListe.length > 0) {
                    const pruefButton = document.createElement('button');
                    pruefButton.textContent = 'Diesen Absatz prüfen';
                    pruefButton.addEventListener('click', () => {
                        processSimulationCurrentTab(tabId);
                    });
                    actionButtonContainer.appendChild(pruefButton);
                } else {
                     actionButtonContainer.innerHTML = '<p><em>Keine Prüfung für diesen Absatz erforderlich/möglich.</em></p>';
                }
            }

        } catch (error) {
            console.error('Fehler beim Laden oder Anzeigen der Absatzdaten für', einheitIdToLoad, ':', error.message);
            if (normInfoContainer) normInfoContainer.innerHTML = `<p style="color:red;">Fehler: ${error.message}</p>`;
        }
    }

    function processSimulationCurrentTab(tabId) {
        if (!currentAbsatzData) {
            alert("Fehler: Es sind keine Absatzdaten geladen, um die Simulation zu verarbeiten.");
            console.error("processSimulationCurrentTab aufgerufen ohne currentAbsatzData.");
            return;
        }
        const activeTabContent = document.getElementById(tabId);
        if (!activeTabContent) {
            console.error("Aktiver Tab-Inhalt nicht gefunden für ID:", tabId);
            return;
        }

        currentTabUserInputs = {}; // Benutzereingaben für diesen Tab zurücksetzen/neu sammeln
        let allAnswered = true;

        if (currentAbsatzData.parameterListe && currentAbsatzData.parameterListe.length > 0) {
            currentAbsatzData.parameterListe.forEach(param => {
                let selectedValue = null;
                const inputBaseName = `${param.Parameter_ID}_${tabId}`;

                if (param.Antworttyp === 'JaNein') {
                    const radioSelected = activeTabContent.querySelector(`input[name="${inputBaseName}"]:checked`);
                    if (radioSelected) {
                        selectedValue = radioSelected.value;
                    }
                } else if (param.Antworttyp === 'AuswahlEinfach') {
                    const selectElement = activeTabContent.querySelector(`select[name="${inputBaseName}"]`); // oder ID, wenn sie so gesetzt wurde
                    if (selectElement && selectElement.value !== "") {
                        selectedValue = selectElement.value;
                    }
                }
                // Hier weitere Antworttypen behandeln

                if (selectedValue !== null) {
                    currentTabUserInputs[param.Parameter_ID] = selectedValue; // Original Parameter_ID als Schlüssel
                } else {
                    // Nur als 'nicht beantwortet' markieren, wenn der Parameter 'required' ist (optional, HTML5 'required' macht das schon)
                    // Für dieses Beispiel: Jede nicht getroffene Auswahl gilt als nicht beantwortet.
                    allAnswered = false;
                }
            });

            if (!allAnswered) {
                alert("Bitte beantworten Sie alle erforderlichen Fragen für diesen Absatz.");
                return;
            }
        } else {
            // Keine Parameter, also direkt zur Regelevaluierung (ggf. für Regeln ohne Bedingungen)
            console.log("Keine Parameter in diesem Absatz, fahre mit Regelevaluierung fort.");
        }


        const resultProfilData = evaluateRulesFromData(currentTabUserInputs, currentAbsatzData.regelwerk.regeln, currentAbsatzData.ergebnisProfile);
        displayErgebnisInTab(resultProfilData, currentTabUserInputs, activeTabContent);

        console.log("Simulation für Tab", tabId, "verarbeitet. Inputs:", currentTabUserInputs, "Ergebnis:", resultProfilData);
    }

    function evaluateRulesFromData(userInputs, regeln, ergebnisProfileListe) {
        if (!regeln || !Array.isArray(regeln)) {
            console.warn("Regelwerk ist nicht verfügbar oder leer.", regeln);
            // Wenn es keine Regeln gibt, aber Parameter beantwortet wurden, könnte man ein "neutrales" Ergebnis anzeigen
            // oder einfach null zurückgeben, wie bisher.
            if (Object.keys(userInputs).length > 0 && (!regeln || regeln.length === 0)) {
                 // Fall: Parameter beantwortet, aber keine Regeln -> ggf. spezielles Ergebnisprofil?
                 // Für jetzt: null zurückgeben, was "Kein Ergebnisprofil gefunden" auslöst.
            }
            return null;
        }

        const sortedRegeln = [...regeln].sort((a, b) => (a.Prioritaet === null || a.Prioritaet === undefined ? 999 : a.Prioritaet) - (b.Prioritaet === null || b.Prioritaet === undefined ? 999 : b.Prioritaet));

        for (const regel of sortedRegeln) {
            let conditionsMet = true;
            if (regel.Bedingungen_fuer_Regel && regel.Bedingungen_fuer_Regel.length > 0) {
                for (const bedingung of regel.Bedingungen_fuer_Regel) {
                    const userInput = userInputs[bedingung.FK_Parameter_ID];

                    // Wenn eine Bedingung einen Parameter prüft, der nicht beantwortet wurde, ist die Bedingung nicht erfüllt.
                    if (userInput === undefined || userInput === null || userInput === "") { // "" für nicht ausgewählte Selects
                        conditionsMet = false;
                        break;
                    }

                    let conditionHolds = false;
                    switch (bedingung.Operator) {
                        case "IST_GLEICH":
                            conditionHolds = (userInput === bedingung.Erwarteter_Wert_Intern);
                            break;
                        case "IST_WAHR":
                            conditionHolds = (userInput === "Ja" || userInput === true); // PHP konvertiert ggf. zu Boolean
                            break;
                        case "IST_FALSCH":
                            conditionHolds = (userInput === "Nein" || userInput === false); // PHP konvertiert ggf. zu Boolean
                            break;
                        case "IST_NICHT_GLEICH":
                            conditionHolds = (userInput !== bedingung.Erwarteter_Wert_Intern);
                            break;
                        // Weitere Operatoren hier implementieren
                        default:
                            console.warn(`Unbekannter Operator: ${bedingung.Operator}`);
                            conditionHolds = false;
                    }

                    if (!conditionHolds) {
                        conditionsMet = false;
                        break;
                    }
                }
            }
            // Wenn alle Bedingungen (falls vorhanden) erfüllt sind ODER es keine Bedingungen gab, ist die Regel erfüllt.
            if (conditionsMet) {
                if (!ergebnisProfileListe || !Array.isArray(ergebnisProfileListe)) {
                    console.error("ErgebnisProfileListe nicht korrekt geladen.");
                    return null; // Oder ein Fehlerobjekt
                }
                const profil = ergebnisProfileListe.find(p => p.ErgebnisProfil_ID_Referenz === regel.FK_ErgebnisProfil_ID_Referenz);
                if (!profil) {
                    console.error(`ErgebnisProfil mit ID_Referenz '${regel.FK_ErgebnisProfil_ID_Referenz}' nicht in Liste gefunden.`);
                    return null; // Oder ein Fehlerobjekt
                }
                return profil;
            }
        }
        console.warn("Keine passende Regel gefunden für die Eingaben:", userInputs);
        return null;
    }

    function displayErgebnisInTab(profil, userInputs, activeTabContentElement) {
        const proContraUl = activeTabContentElement.querySelector('.tab-procontra-container ul');
        const ergebnisDiv = activeTabContentElement.querySelector('.tab-ergebnis-container');

        if (!proContraUl || !ergebnisDiv) {
            console.error("Erforderliche Ergebnis-Container im Tab nicht gefunden.");
            return;
        }
        proContraUl.innerHTML = '';
        ergebnisDiv.innerHTML = '<h2>Ergebnis (Absatz)</h2>';

        if (!profil) {
            ergebnisDiv.innerHTML += "<p style='color:orange;'>Kein spezifisches Ergebnisprofil für die getroffene Auswahl gefunden. Bitte überprüfen Sie Ihre Eingaben oder die Regeldefinition.</p>";
            ergebnisDiv.style.display = 'block';
            ergebnisDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            return;
        }

        ergebnisDiv.innerHTML += `<h3>Entscheidung:</h3><p>${profil.Entscheidungstext_Kurz_Vorlage || 'Kein Text vorhanden.'}</p>`;
        ergebnisDiv.innerHTML += `<p><strong>Art der Entscheidung:</strong> ${profil.Art_der_Entscheidung_Anzeige_Text || 'N/A'}</p><hr>`;

        const begruendungContainer = document.createElement('div');
        begruendungContainer.innerHTML += `<p>${profil.Einleitungstext_Begruendung_Vorlage || ""}</p>`;

        if (currentAbsatzData && currentAbsatzData.parameterListe && profil.Begruendung_Dynamische_Parameter_Liste && profil.Begruendung_Dynamische_Parameter_Liste.length > 0) {
            profil.Begruendung_Dynamische_Parameter_Liste.forEach(paramId => {
                const parameter = currentAbsatzData.parameterListe.find(p => p.Parameter_ID === paramId);
                if (parameter) {
                    const li = document.createElement('li');
                    const userInput = userInputs[paramId];
                    let displayText = `${parameter.Fragetext}: `;
                    let liClass = "";

                    if (userInput === undefined || userInput === null || userInput === "") {
                        displayText += "Nicht beantwortet oder nicht relevant für diesen Pfad.";
                        // liClass neutral lassen
                    } else {
                        // Generische Pro/Contra Logik
                        let isProLogic = false;
                        if (parameter.Antworttyp === 'JaNein') {
                            isProLogic = (userInput === "Ja");
                        } else if (parameter.Antworttyp === 'AuswahlEinfach') {
                            // Versuche, eine "negative" Option zu identifizieren (sehr vereinfacht)
                            const istEherNegativ = parameter.Antwortoptionen_bei_Auswahl?.find(opt => opt.Option_Wert_Intern === userInput)?.Option_Text.toLowerCase().includes("kein");
                            if (userInput === "TITEL_OPT_8_KEINER" && paramId === "P_32_1_Eltern_Aufenthaltstitel") { // Korrigierter Parameter ID von P_32_1_Art_Aufenthaltstitel_Eltern zu P_32_1_Eltern_Aufenthaltstitel
                                isProLogic = false; // Spezifische Negativlogik für den Titel-Parameter
                            } else if (istEherNegativ) {
                                isProLogic = false;
                            } else {
                                isProLogic = true; // Standardmäßig positiv, wenn nicht klar negativ
                            }
                        } else {
                            isProLogic = true; // Für andere Typen erstmal als Pro annehmen
                        }

                        if (isProLogic) {
                            displayText = parameter.Text_Erfuellt_Pro || `${parameter.Fragetext}: Ja/zutreffend (Standardtext)`;
                            liClass = 'pro';
                        } else {
                            displayText = parameter.Text_NichtErfuellt_Contra || `${parameter.Fragetext}: Nein/nicht zutreffend (Standardtext)`;
                            liClass = 'contra';
                        }
                    }
                    li.textContent = displayText;
                    if (liClass) li.classList.add(liClass);
                    proContraUl.appendChild(li);
                }
            });
        }
        begruendungContainer.appendChild(proContraUl);

        if (profil.Spezifischer_Ergaenzungstext_Begruendung_Vorlage) {
            begruendungContainer.innerHTML += `<div class="text-block"><h4>Zusätzliche Hinweise/Leitlinien:</h4><p>${profil.Spezifischer_Ergaenzungstext_Begruendung_Vorlage}</p></div>`;
        }
        begruendungContainer.innerHTML += `<p>${profil.Abschlusstext_Begruendung_Vorlage || ""}</p>`;

        ergebnisDiv.appendChild(begruendungContainer);
        ergebnisDiv.style.display = 'block';
        ergebnisDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    console.log("SimONA Dashboard initialisiert und Logik bereit.");
}); // Ende des DOMContentLoaded