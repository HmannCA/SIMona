// p0-5-handler.js - Handler für P0.5 Paragraphen-Analyse
// Version: 2.5

const P0_5Handler = {
    /**
     * Rendert die Absatz-Auswahl basierend auf P0.5 Daten
     */
    renderAbsatzSelection: function() {
        const p0_5Data = SimONAState.methods.getResponse('p0_5');
        
        if (!p0_5Data || !p0_5Data.metadaten || !p0_5Data.struktur) {
            alert("Die Daten der Paragraphen-Analyse sind unvollständig. 'metadaten' oder 'struktur' fehlt.");
            return;
        }

        // 1. Metadaten in die Basis-Input-Felder eintragen
        const meta = p0_5Data.metadaten;
        document.getElementById('gesetz').value = meta.gesetz_abkuerzung || '';
        document.getElementById('paragraph').value = meta.paragraph_nummer || '';
        document.getElementById('absatz').value = '';
        document.getElementById('satz').value = '';
        
        // Normtext nur befüllen wenn leer
        const normtextTextarea = document.getElementById('normtext');
        if (!normtextTextarea.value) {
            normtextTextarea.value = p0_5Data.struktur
                .map(a => a.absatz_volltext)
                .join('\n\n');
        }

        // Original ID-Button deaktivieren
        this.disableOriginalIdButton();

        // 2. Absatz-Auswahl erstellen
        const selectionArea = document.getElementById('absatz-selection-area');
        selectionArea.innerHTML = '<h4>Gefundene Absätze (bitte zur Detail-Analyse auswählen):</h4>';
        
        const absatzContainer = document.createElement('div');
        absatzContainer.style.cssText = 'margin-top: 15px;';
        
        p0_5Data.struktur.forEach((absatz, index) => {
            const button = this.createAbsatzButton(absatz, index);
            absatzContainer.appendChild(button);
        });

        selectionArea.appendChild(absatzContainer);
        
        // Prüfe ob schon Absätze analysiert wurden
        this.updateNavigationButton();
    },
    
    /**
     * Erstellt einen Button für einen Absatz
     */
    createAbsatzButton: function(absatz, index) {
        const button = document.createElement('button');
        const isAnalysiert = SimONAState.ui.analysierteAbsatzIndizes.has(index);
        
        button.textContent = `Absatz ${absatz.absatz_nummer} ${isAnalysiert ? '✓' : ''} analysieren`;
        button.style.cssText = `
            margin-right: 10px;
            margin-bottom: 10px;
            padding: 10px 20px;
            background-color: ${isAnalysiert ? '#27ae60' : '#3498db'};
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: ${isAnalysiert ? 'bold' : 'normal'};
        `;
        
        button.addEventListener('click', () => {
            this.selectAbsatzForAnalysis(index);
            // Alle Buttons updaten
            this.updateButtonStyles(index);
        });
        
        button.addEventListener('mouseover', () => {
            if (!isAnalysiert) {
                button.style.backgroundColor = '#2980b9';
            }
        });
        
        button.addEventListener('mouseout', () => {
            button.style.backgroundColor = isAnalysiert ? '#27ae60' : '#3498db';
        });
        
        return button;
    },
    
    /**
     * Wählt einen Absatz zur Analyse aus
     */
    selectAbsatzForAnalysis: function(absatzIndex) {
        const p0_5Data = SimONAState.methods.getResponse('p0_5');
        
        if (!p0_5Data || !p0_5Data.struktur[absatzIndex]) {
            console.error("Fehler: Der ausgewählte Absatz konnte nicht gefunden werden.");
            return;
        }

        // Füge Index zu analysierten Absätzen hinzu
        SimONAState.methods.addAnalysierterAbsatz(absatzIndex);

        const gewaehlterAbsatz = p0_5Data.struktur[absatzIndex];
        document.getElementById('absatz').value = gewaehlterAbsatz.absatz_nummer;
        document.getElementById('normtext').value = gewaehlterAbsatz.absatz_volltext;
        document.getElementById('satz').value = '';
        
        // Alte Analyse-Daten löschen
        this.clearAnalysisData();
        
        // Neue ID generieren
        generateSimulationsEinheitID();

        // Navigation aktualisieren
        this.updateNavigationButton();

        console.log(`Absatz ${gewaehlterAbsatz.absatz_nummer} zur Analyse ausgewählt`);
        alert(`Absatz ${gewaehlterAbsatz.absatz_nummer} wurde ausgewählt. Sie können nun mit der Detail-Analyse (ab Schritt 1) fortfahren.`);
    },
    
    /**
     * Deaktiviert den originalen ID-Generierungs-Button
     */
    disableOriginalIdButton: function() {
        const originalButton = document.querySelector('button[onclick*="generateSimulationsEinheitID"]');
        if (originalButton) {
            originalButton.disabled = true;
            originalButton.style.opacity = '0.5';
            originalButton.style.cursor = 'not-allowed';
            originalButton.title = 'ID wird automatisch generiert, wenn Sie einen Absatz auswählen.';
        }
    },
    
    /**
     * Aktualisiert die Button-Styles nach Auswahl
     */
    updateButtonStyles: function(selectedIndex) {
        const buttons = document.querySelectorAll('#absatz-selection-area button');
        buttons.forEach((btn, index) => {
            if (index === selectedIndex) {
                btn.style.backgroundColor = '#27ae60';
                btn.style.fontWeight = 'bold';
            } else if (!SimONAState.ui.analysierteAbsatzIndizes.has(index)) {
                btn.style.backgroundColor = '#3498db';
                btn.style.fontWeight = 'normal';
            }
        });
    },
    
    /**
     * Löscht alte Analyse-Daten bei neuer Absatz-Auswahl
     */
    clearAnalysisData: function() {
        // Setze nur die Analyse-Daten zurück, nicht die P0.5 Daten
        ['p1', 'p2', 'p2_7', 'p3', 'p4', 'p5'].forEach(type => {
            SimONAState.methods.setResponse(type, null);
        });
        SimONAState.methods.setResponse('p2_5', []);
        
        // UI zurücksetzen - OHNE den kompletten State zu löschen
        this.clearAnalysisUI();
    },

    /**
     * Neue Funktion: Löscht nur die UI-Elemente der Analyse, nicht den State
     */
    clearAnalysisUI: function() {
        // Prompt-Bereiche zurücksetzen
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

        // Validierungsbericht zurücksetzen
        const validationReport = document.getElementById('validation-report-area');
        if (validationReport) {
            validationReport.style.display = 'none';
            validationReport.innerHTML = '';
        }

        console.log("Analyse-UI zurückgesetzt (State beibehalten).");
    },
    
    /**
     * Aktualisiert den Navigations-Button
     */
    updateNavigationButton: function() {
        const navFooter = document.getElementById('navigation-footer');
        const nextButton = document.getElementById('next-step-button');
        const p0_5Data = SimONAState.methods.getResponse('p0_5');

        if (!navFooter || !nextButton || !p0_5Data) {
            return;
        }

        const alleAbsaetzeAnalysiert = SimONAState.methods.alleAbsaetzeAnalysiert();

        if (alleAbsaetzeAnalysiert) {
            nextButton.textContent = "Weiteren Paragraphen analysieren";
            nextButton.onclick = () => this.scrollToTop();
        } else {
            nextButton.textContent = "Nächsten Absatz auswählen";
            nextButton.onclick = () => this.scrollToAbsatzSelection();
        }

        navFooter.style.display = 'block';
    },
    
    /**
     * Scrollt nach oben
     */
    scrollToTop: function() {
        const targetElement = document.querySelector('.container h1');
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    },
    
    /**
     * Scrollt zur Absatz-Auswahl
     */
    scrollToAbsatzSelection: function() {
        const targetElement = document.getElementById('absatz-selection-area');
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
};

// Globale Funktionen für bestehenden Code
window.renderAbsatzSelection = P0_5Handler.renderAbsatzSelection.bind(P0_5Handler);
window.selectAbsatzForAnalysis = P0_5Handler.selectAbsatzForAnalysis.bind(P0_5Handler);
window.updateNextStepButton = P0_5Handler.updateNavigationButton.bind(P0_5Handler);
window.scrollToNextStep = function() {
    if (SimONAState.methods.alleAbsaetzeAnalysiert()) {
        P0_5Handler.scrollToTop();
    } else {
        P0_5Handler.scrollToAbsatzSelection();
    }
};