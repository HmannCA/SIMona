// event-listeners.js - Alle Event-Listener für SimONA mit State-System
// Version: 2.5

/**
 * Initialisiert alle Event-Listener für Response-Textareas
 */
function initializeResponseListeners() {
    
    // P0.5 - Paragraphen-Analyse Response
    const p0_5ResponseTextarea = document.getElementById('SimONA_P0_5_ParagraphAnalyse_response');
    if (p0_5ResponseTextarea) {
        p0_5ResponseTextarea.addEventListener('blur', function() {
            try {
                if (this.value.trim() === "") { 
                    SimONAState.methods.setResponse('p0_5', null);
                    document.getElementById('absatz-selection-area').innerHTML = '';
                    return; 
                }
                const data = JSON.parse(this.value);
                SimONAState.methods.setResponse('p0_5', data);
                console.log("P0.5 Response Data (Paragraphen-Analyse) gespeichert");
                
                // Trigger Absatz-Auswahl UI
                renderAbsatzSelection();
            } catch(e) {
                SimONAState.methods.setResponse('p0_5', null);
                document.getElementById('absatz-selection-area').innerHTML = 
                    '<p style="color:red;">Fehler: Die eingefügte P0.5-Antwort ist kein valides JSON-Objekt.</p>';
                if(this.value.trim() !== "") {
                    alert("P0.5 Antwort ist kein valides JSON-Objekt: " + e.message);
                }
            }
        });
    }
    
    // P1 - EinheitMetadaten Response
    const p1ResponseTextarea = document.getElementById('SimONA_P1_EinheitMetadaten_response');
    if (p1ResponseTextarea) {
        p1ResponseTextarea.addEventListener('blur', function() {
            try {
                if (this.value.trim() === "") { 
                    SimONAState.methods.setResponse('p1', null);
                    return; 
                }
                const data = JSON.parse(this.value);
                SimONAState.methods.setResponse('p1', data);
                console.log("P1 Response Data (EinheitMetadaten) gespeichert");
            } catch(e) {
                SimONAState.methods.setResponse('p1', null);
                if(this.value.trim() !== "") {
                    alert("P1 Antwort ist kein valides JSON: " + e.message);
                }
            }
        });
    }
    
    // P2 - ParameterExtraktion Response
    const p2ResponseTextarea = document.getElementById('SimONA_P2_ParameterExtraktion_response');
    if (p2ResponseTextarea) {
        p2ResponseTextarea.addEventListener('blur', function() {
            try {
                if (this.value.trim() === "") { 
                    SimONAState.methods.setResponse('p2', null);
                    return; 
                }
                const data = JSON.parse(this.value);
                if (!Array.isArray(data)) {
                    throw new Error("P2 Response muss ein Array sein");
                }
                SimONAState.methods.setResponse('p2', data);
                console.log("P2 Response Data (Parameter) gespeichert");
            } catch(e) {
                SimONAState.methods.setResponse('p2', null);
                if(this.value.trim() !== "") {
                    alert("P2 Antwort ist kein valides JSON-Array: " + e.message);
                }
            }
        });
    }
    
    // P2.5 - ErgebnisProfilVorschläge Response
    const p2_5ResponseTextarea = document.getElementById('SimONA_P2_5_ErgebnisProfilVorschlaege_response');
    if (p2_5ResponseTextarea) {
        p2_5ResponseTextarea.addEventListener('blur', function() {
            try {
                if (this.value.trim() === "") { 
                    console.log("P2.5 Response Textarea geleert");
                    return; 
                }
                const data = JSON.parse(this.value);
                if (!Array.isArray(data)) {
                    throw new Error("P2.5 Response muss ein Array sein");
                }
                console.log("P2.5 Response Textarea enthält valides JSON (für 'Anzeigen & Bearbeiten')");
                // Hinweis: P2.5 wird NICHT automatisch im State gespeichert,
                // sondern erst nach Validierung durch den Nutzer
            } catch(e) {
                if(this.value.trim() !== "") {
                    alert("P2.5 Antwort ist kein valides JSON-Array: " + e.message);
                }
            }
        });
    }
    
    // P2.7 - ParameterKonklusionDetail Response
    const p2_7ResponseTextarea = document.getElementById('SimONA_P2_7_ParameterKonklusionDetail_response');
    if (p2_7ResponseTextarea) {
        p2_7ResponseTextarea.addEventListener('blur', function() {
            try {
                if (this.value.trim() === "") { 
                    SimONAState.methods.setResponse('p2_7', null);
                    return; 
                }
                const data = JSON.parse(this.value);
                if (!Array.isArray(data)) {
                    throw new Error("P2.7 Response muss ein Array sein");
                }
                SimONAState.methods.setResponse('p2_7', data);
                console.log("P2.7 Response Data (Konklusionsdetails) gespeichert");
            } catch(e) {
                SimONAState.methods.setResponse('p2_7', null);
                if(this.value.trim() !== "") {
                    alert("P2.7 Antwort ist kein valides JSON-Array: " + e.message);
                }
            }
        });
    }
    
    // P3 - RegelGenerierung Response
    const p3ResponseTextarea = document.getElementById('SimONA_P3_RegelGenerierung_response');
    if (p3ResponseTextarea) {
        p3ResponseTextarea.addEventListener('blur', function() {
            try {
                if (this.value.trim() === "") { 
                    SimONAState.methods.setResponse('p3', null);
                    return; 
                }
                const data = JSON.parse(this.value);
                if (!Array.isArray(data)) {
                    throw new Error("P3 Response muss ein Array sein");
                }
                SimONAState.methods.setResponse('p3', data);
                console.log("P3 Response Data (Regeln) gespeichert");
            } catch(e) {
                SimONAState.methods.setResponse('p3', null);
                if(this.value.trim() !== "") {
                    alert("P3 Antwort ist kein valides JSON-Array: " + e.message);
                }
            }
        });
    }
    
    // P4 - ErgebnisProfilDetails Response
    const p4ResponseTextarea = document.getElementById('SimONA_P4_ErgebnisProfilDetails_response');
    if (p4ResponseTextarea) {
        p4ResponseTextarea.addEventListener('blur', function() {
            try {
                if (this.value.trim() === "") { 
                    SimONAState.methods.setResponse('p4', null);
                    return; 
                }
                const data = JSON.parse(this.value);
                if (!Array.isArray(data)) {
                    throw new Error("P4 Response muss ein Array sein");
                }
                SimONAState.methods.setResponse('p4', data);
                console.log("P4 Response Data (ErgebnisProfile) gespeichert");
            } catch(e) {
                SimONAState.methods.setResponse('p4', null);
                if(this.value.trim() !== "") {
                    alert("P4 Antwort ist kein valides JSON-Array: " + e.message);
                }
            }
        });
    }
    
    // P5 - QualitätsAudit Response
    const p5ResponseTextarea = document.getElementById('SimONA_P5_QualitaetsAudit_response');
    if (p5ResponseTextarea) {
        p5ResponseTextarea.addEventListener('blur', function() {
            try {
                if (this.value.trim() === "") { 
                    SimONAState.methods.setResponse('p5', null);
                    return; 
                }
                const data = JSON.parse(this.value);
                SimONAState.methods.setResponse('p5', data);
                console.log("P5 Response Data (QualitätsAudit) gespeichert");
            } catch(e) {
                SimONAState.methods.setResponse('p5', null);
                if(this.value.trim() !== "") {
                    alert("P5 Antwort ist kein valides JSON: " + e.message);
                }
            }
        });
    }
    
    console.log("Alle Response-Event-Listener initialisiert");
}

/**
 * Listener für State-Änderungen (für andere Module)
 */
function initializeStateChangeListener() {
    document.addEventListener('simonaStateChange', function(event) {
        const { type, data } = event.detail;
        console.log(`State-Änderung: ${type}`, data);
        
        // Hier können andere Module auf State-Änderungen reagieren
        switch(type) {
            case 'p1':
                // P1-Daten wurden gesetzt
                enableDependentButtons(['p2', 'p2_5', 'p2_7']);
                break;
            case 'p2':
                // P2-Daten wurden gesetzt
                enableDependentButtons(['p2_5', 'p2_7', 'p3']);
                break;
            case 'p2_5':
                // P2.5 validierte Daten wurden gesetzt
                enableDependentButtons(['p3']);
                break;
            case 'p3':
                // P3-Daten wurden gesetzt
                enableDependentButtons(['p4']);
                break;
            case 'p4':
                // P4-Daten wurden gesetzt
                enableDependentButtons(['p5', 'sql']);
                break;
        }
    });
}

/**
 * Hilfsfunktion: Aktiviert Buttons basierend auf verfügbaren Daten
 */
function enableDependentButtons(stepIds) {
    stepIds.forEach(stepId => {
        if (SimONAState.methods.validateDataForStep(stepId)) {
            // Button aktivieren (Beispiel-Implementation)
            const button = document.querySelector(`button[data-step="${stepId}"]`);
            if (button) {
                button.disabled = false;
                button.style.opacity = '1';
            }
        }
    });
}

/**
 * Hauptinitialisierung beim Laden der Seite
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeResponseListeners();
    initializeStateChangeListener();
    
    // Weitere Event-Listener können hier hinzugefügt werden
    console.log("SimONA Event-System initialisiert");
});