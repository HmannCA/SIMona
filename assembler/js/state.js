// state.js - Globales State Management für SimONA Assembler
// Version: 2.5
// Stand: Januar 2025

const SimONAState = {
    // Aktuelle SimulationsEinheit ID
    currentSimulationsEinheitID: "",
    
    // Geparste KI-Antworten
    responses: {
        p0_5: null, // Paragraphen-Analyse
        p1: null,   // EinheitMetadaten
        p2: null,   // ParameterExtraktion
        p2_5: [],   // ErgebnisProfilVorschläge (validiert)
        p2_7: null, // ParameterKonklusionDetail
        p3: null,   // RegelGenerierung
        p4: null,   // ErgebnisProfilDetails
        p5: null    // QualitätsAudit
    },
    
    // UI-Zustand
    ui: {
        analysierteAbsatzIndizes: new Set(),
        currentStep: 0,
        isLoading: false,
        lastError: null,
        selectedPromptVersion: 'v1' // Aktuelle Prompt-Version
    },
    
    // Methoden zur State-Verwaltung
    methods: {
        /**
         * Setzt die aktuelle SimulationsEinheit ID
         */
        setSimulationsEinheitID: function(id) {
            SimONAState.currentSimulationsEinheitID = id;
            console.log("SimulationsEinheit_ID gesetzt:", id);
        },
        
        /**
         * Speichert eine KI-Antwort
         */
        setResponse: function(promptType, data) {
            if (!SimONAState.responses.hasOwnProperty(promptType)) {
                console.error(`Unbekannter Prompt-Typ: ${promptType}`);
                return false;
            }
            
            SimONAState.responses[promptType] = data;
            console.log(`${promptType.toUpperCase()} Response gespeichert:`, data);
            
            // Trigger Event für andere Module
            this.triggerStateChange(promptType, data);
            return true;
        },
        
        /**
         * Holt eine gespeicherte KI-Antwort
         */
        getResponse: function(promptType) {
            return SimONAState.responses[promptType];
        },
        
        /**
         * Merged P2.7 Daten in P2
         */
        mergeP2_7IntoP2: function() {
            const p2Data = this.getResponse('p2');
            const p2_7Data = this.getResponse('p2_7');
            
            if (!p2Data || !Array.isArray(p2Data)) {
                throw new Error("P2-Daten nicht vorhanden oder kein Array");
            }
            if (!p2_7Data || !Array.isArray(p2_7Data)) {
                throw new Error("P2.7-Daten nicht vorhanden oder kein Array");
            }
            
            let mergeCount = 0;
            p2_7Data.forEach(konklusionData => {
                const paramIndex = p2Data.findIndex(param => 
                    param.Parameter_ID === konklusionData.Parameter_ID
                );
                if (paramIndex !== -1) {
                    p2Data[paramIndex].Konklusive_Antworten_Info = 
                        konklusionData.Konklusive_Antworten_Info;
                    mergeCount++;
                }
            });
            
            console.log(`P2.7 Merge abgeschlossen: ${mergeCount} Parameter aktualisiert`);
            return mergeCount;
        },
        
        /**
         * Fügt einen analysierten Absatz-Index hinzu
         */
        addAnalysierterAbsatz: function(index) {
            SimONAState.ui.analysierteAbsatzIndizes.add(index);
        },
        
        /**
         * Prüft ob alle Absätze analysiert wurden
         */
        alleAbsaetzeAnalysiert: function() {
            const p0_5Data = this.getResponse('p0_5');
            if (!p0_5Data || !p0_5Data.struktur) return false;
            
            return SimONAState.ui.analysierteAbsatzIndizes.size >= 
                   p0_5Data.struktur.length;
        },
        
        /**
         * Setzt den gesamten State zurück
         */
        reset: function() {
            SimONAState.currentSimulationsEinheitID = "";
            
            // Alle Responses zurücksetzen
            Object.keys(SimONAState.responses).forEach(key => {
                SimONAState.responses[key] = key === 'p2_5' ? [] : null;
            });
            
            // UI-State zurücksetzen
            SimONAState.ui.analysierteAbsatzIndizes.clear();
            SimONAState.ui.currentStep = 0;
            SimONAState.ui.isLoading = false;
            SimONAState.ui.lastError = null;
            
            console.log("SimONA State vollständig zurückgesetzt");
        },
        
        /**
         * Validiert ob alle notwendigen Daten für einen Schritt vorhanden sind
         */
        validateDataForStep: function(step) {
            const validations = {
                'p2': () => !!this.getResponse('p1'),
                'p2_5': () => !!this.getResponse('p1') && !!this.getResponse('p2'),
                'p2_7': () => !!this.getResponse('p1') && !!this.getResponse('p2'),
                'p3': () => !!this.getResponse('p2') && 
                          (this.getResponse('p2_5').length > 0 || !!this.getResponse('p3')),
                'p4': () => !!this.getResponse('p1') && !!this.getResponse('p2') && 
                          (!!this.getResponse('p3') || this.getResponse('p2_5').length > 0),
                'p5': () => !!this.getResponse('p1') && !!this.getResponse('p2') && 
                          !!this.getResponse('p3') && !!this.getResponse('p4')
            };
            
            return validations[step] ? validations[step]() : true;
        },
        
        /**
         * Trigger für State-Änderungen (für Event-System)
         */
        triggerStateChange: function(type, data) {
            const event = new CustomEvent('simonaStateChange', {
                detail: { type, data }
            });
            document.dispatchEvent(event);
        },
        
        /**
         * Exportiert den aktuellen State als JSON
         */
        exportState: function() {
            return {
                version: SimONAConfig.version,
                exportDate: new Date().toISOString(),
                simulationsEinheitID: SimONAState.currentSimulationsEinheitID,
                responses: SimONAState.responses,
                analysierteAbsaetze: Array.from(SimONAState.ui.analysierteAbsatzIndizes)
            };
        },
        
        /**
         * Importiert einen gespeicherten State
         */
        importState: function(stateJson) {
            try {
                const imported = typeof stateJson === 'string' ? 
                                JSON.parse(stateJson) : stateJson;
                
                this.reset();
                
                SimONAState.currentSimulationsEinheitID = imported.simulationsEinheitID || "";
                SimONAState.responses = imported.responses || {};
                
                if (imported.analysierteAbsaetze) {
                    imported.analysierteAbsaetze.forEach(index => 
                        SimONAState.ui.analysierteAbsatzIndizes.add(index)
                    );
                }
                
                console.log("State erfolgreich importiert");
                return true;
            } catch (error) {
                console.error("Fehler beim State-Import:", error);
                return false;
            }
        }
    }
};

// Globale Referenz für Kompatibilität mit bestehendem Code
const currentSimulationsEinheitID = SimONAState.currentSimulationsEinheitID;
const p0_5ResponseData = SimONAState.responses.p0_5;
const p1ResponseData = SimONAState.responses.p1;
const p2ResponseData = SimONAState.responses.p2;
const validierteErgebnisProfileVorschlaege = SimONAState.responses.p2_5;
const p2_7ResponseData = SimONAState.responses.p2_7;
const p3ResponseData = SimONAState.responses.p3;
const p4ResponseData = SimONAState.responses.p4;
const analysierteAbsatzIndizes = SimONAState.ui.analysierteAbsatzIndizes;