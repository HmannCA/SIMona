// validation.js - Korrigierte Validierung mit richtigen Feldnamen
// Version: 2.5

/**
 * Validiert den gesamten Datensatz vor SQL-Generierung
 * @returns {Object} Validierungsergebnis mit isValid, errors und warnings
 */
function validateGesamtdatensatz() {
    const errors = [];
    const warnings = [];
    const info = [];
    
    // Hole alle Response-Daten aus dem State
    const p1Data = SimONAState.methods.getResponse('p1');
    const p2Data = SimONAState.methods.getResponse('p2');
    const p2_5Data = SimONAState.methods.getResponse('p2_5');
    const p3Data = SimONAState.methods.getResponse('p3');
    const p4Data = SimONAState.methods.getResponse('p4');
    
    console.log("=== Starte Validierung ===");
    
    // P1 Validierung
    if (!p1Data) {
        errors.push("P1-Daten (SimulationsEinheit Metadaten) fehlen vollständig.");
    } else {
        // Pflichtfelder prüfen
        if (!p1Data.Gesetz) errors.push("P1: Gesetz fehlt.");
        if (!p1Data.Paragraph) errors.push("P1: Paragraph fehlt.");
        if (!p1Data.Kurzbeschreibung) errors.push("P1: Kurzbeschreibung fehlt.");
        if (!p1Data.Gesetzestext_Zitat_Analysierter_Teil) errors.push("P1: Gesetzestext_Zitat fehlt.");
        
        // Optionale Felder, die fehlen könnten
        if (!p1Data.FK_Entscheidungsart_ID_Lookup_Bezeichnung) {
            warnings.push("P1: FK_Entscheidungsart_ID_Lookup_Bezeichnung fehlt - Entscheidungsart unbekannt.");
        }
        if (!p1Data.Art_Rechtsfolge_Positiv_Typ) {
            warnings.push("P1: Art_Rechtsfolge_Positiv_Typ fehlt.");
        }
        
        // Info über recherchierte Felder
        if (p1Data.Gesetz_Vollstaendiger_Name) {
            info.push(`P1: Vollständiger Gesetzesname erfolgreich recherchiert.`);
        }
    }
    
    // P2 Validierung
    if (!p2Data || !Array.isArray(p2Data)) {
        errors.push("P2-Daten (Parameter) fehlen oder sind kein Array.");
    } else if (p2Data.length === 0) {
        warnings.push("P2: Keine Parameter definiert. Ist das beabsichtigt?");
    } else {
        const parameterIds = new Set();
        let grundvoraussetzungCount = 0;
        
        p2Data.forEach((param, index) => {
            const paramIdentifier = param.Parameter_ID || `Index ${index}`;
            
            // Pflichtfelder
            if (!param.Parameter_ID) {
                errors.push(`P2: Parameter[${index}] hat keine Parameter_ID.`);
            } else if (parameterIds.has(param.Parameter_ID)) {
                errors.push(`P2: Doppelte Parameter_ID gefunden: ${param.Parameter_ID}`);
            } else {
                parameterIds.add(param.Parameter_ID);
            }
            
            if (!param.Fragetext) {
                errors.push(`P2: Parameter ${paramIdentifier} hat keinen Fragetext.`);
            }
            
            if (!param.Antworttyp) {
                errors.push(`P2: Parameter ${paramIdentifier} hat keinen Antworttyp.`);
            } else if (!['JaNein', 'AuswahlEinfach', 'TextfeldKurz'].includes(param.Antworttyp)) {
                warnings.push(`P2: Parameter ${paramIdentifier} hat unbekannten Antworttyp: ${param.Antworttyp}`);
            }
            
            // Spezielle Prüfungen
            if (param.Ist_Grundvoraussetzung === true) {
                grundvoraussetzungCount++;
            }
            
            // Antwortoptionen bei AuswahlEinfach
            if (param.Antworttyp === 'AuswahlEinfach') {
                if (!param.Antwortoptionen_bei_Auswahl || !Array.isArray(param.Antwortoptionen_bei_Auswahl)) {
                    errors.push(`P2: Parameter ${paramIdentifier} (AuswahlEinfach) hat keine Antwortoptionen.`);
                } else if (param.Antwortoptionen_bei_Auswahl.length < 2) {
                    warnings.push(`P2: Parameter ${paramIdentifier} (AuswahlEinfach) hat nur ${param.Antwortoptionen_bei_Auswahl.length} Option(en).`);
                }
            }
            
            // Anzeige-Bedingungen prüfen
            if (param.Anzeige_Bedingung && Array.isArray(param.Anzeige_Bedingung) && param.Anzeige_Bedingung.length > 0) {
                param.Anzeige_Bedingung.forEach((bedingung, bIndex) => {
                    if (!bedingung.Referenz_Parameter_ID || !parameterIds.has(bedingung.Referenz_Parameter_ID)) {
                        warnings.push(`P2: Parameter ${paramIdentifier}, Bedingung[${bIndex}] referenziert unbekannte Parameter_ID: ${bedingung.Referenz_Parameter_ID}`);
                    }
                });
            }
        });
        
        if (grundvoraussetzungCount === 0) {
            info.push("P2: Keine Parameter als Grundvoraussetzung markiert.");
        } else {
            info.push(`P2: ${grundvoraussetzungCount} Parameter als Grundvoraussetzung markiert.`);
        }
    }
    
    // P3 Validierung
    if (!p3Data || !Array.isArray(p3Data)) {
        errors.push("P3-Daten (Regeln) fehlen oder sind kein Array.");
    } else if (p3Data.length === 0) {
        warnings.push("P3: Keine Regeln definiert.");
    } else {
        const prioritaeten = new Set();
        const verwendeteErgebnisProfileIds = new Set();
        
        p3Data.forEach((regel, index) => {
            const regelIdentifier = regel.Regel_Name || `Index ${index}`;
            
            if (!regel.Regel_Name) {
                errors.push(`P3: Regel[${index}] hat keinen Regel_Name.`);
            }
            
            if (!regel.FK_ErgebnisProfil_ID_Referenz) {
                errors.push(`P3: Regel ${regelIdentifier} hat keine FK_ErgebnisProfil_ID_Referenz.`);
            } else {
                verwendeteErgebnisProfileIds.add(regel.FK_ErgebnisProfil_ID_Referenz);
            }
            
            // Prioritäten-Check
            if (regel.Prioritaet === undefined || regel.Prioritaet === null) {
                warnings.push(`P3: Regel ${regelIdentifier} hat keine Priorität.`);
            } else {
                if (prioritaeten.has(regel.Prioritaet)) {
                    errors.push(`P3: Doppelte Priorität ${regel.Prioritaet} bei Regel '${regelIdentifier}'.`);
                } else {
                    prioritaeten.add(regel.Prioritaet);
                }
            }
            
            // Bedingungen prüfen
            if (!regel.Bedingungen_fuer_Regel || !Array.isArray(regel.Bedingungen_fuer_Regel)) {
                info.push(`P3: Regel ${regelIdentifier} hat keine Bedingungen (könnte eine Fallback-Regel sein).`);
            } else if (regel.Bedingungen_fuer_Regel.length === 0) {
                info.push(`P3: Regel ${regelIdentifier} hat ein leeres Bedingungen-Array.`);
            }
        });
        
        // Prioritäten-Lücken prüfen
        if (prioritaeten.size > 0) {
            const sortedPrios = Array.from(prioritaeten).sort((a, b) => a - b);
            info.push(`P3: Prioritäten verwendet: ${sortedPrios.join(', ')}`);
        }
    }
    
    // P4 Validierung
    if (!p4Data || !Array.isArray(p4Data)) {
        errors.push("P4-Daten (ErgebnisProfile) fehlen oder sind kein Array.");
    } else if (p4Data.length === 0) {
        warnings.push("P4: Keine ErgebnisProfile definiert.");
    } else {
        const definierteErgebnisProfileIds = new Set();
        
        p4Data.forEach((profil, index) => {
            const profilIdentifier = profil.ErgebnisProfil_ID_Referenz || `Index ${index}`;
            
            if (!profil.ErgebnisProfil_ID_Referenz) {
                errors.push(`P4: ErgebnisProfil[${index}] hat keine ErgebnisProfil_ID_Referenz.`);
            } else {
                if (definierteErgebnisProfileIds.has(profil.ErgebnisProfil_ID_Referenz)) {
                    errors.push(`P4: Doppelte ErgebnisProfil_ID_Referenz: ${profil.ErgebnisProfil_ID_Referenz}`);
                } else {
                    definierteErgebnisProfileIds.add(profil.ErgebnisProfil_ID_Referenz);
                }
            }
            
            if (!profil.Profil_Name) {
                errors.push(`P4: ErgebnisProfil ${profilIdentifier} hat keinen Profil_Name.`);
            }
            
            if (!profil.Entscheidungstext_Kurz_Vorlage) {
                warnings.push(`P4: ErgebnisProfil ${profilIdentifier} hat keinen Entscheidungstext_Kurz_Vorlage.`);
            }
        });
        
        // Cross-Referenz Prüfung P3 <-> P4
        if (p3Data && Array.isArray(p3Data)) {
            const verwendeteIds = new Set();
            p3Data.forEach(regel => {
                if (regel.FK_ErgebnisProfil_ID_Referenz) {
                    verwendeteIds.add(regel.FK_ErgebnisProfil_ID_Referenz);
                    if (!definierteErgebnisProfileIds.has(regel.FK_ErgebnisProfil_ID_Referenz)) {
                        errors.push(`Cross-Referenz: Regel '${regel.Regel_Name}' verweist auf nicht definiertes ErgebnisProfil '${regel.FK_ErgebnisProfil_ID_Referenz}'.`);
                    }
                }
            });
            
            // Ungenutzte Profile finden
            definierteErgebnisProfileIds.forEach(profilId => {
                if (!verwendeteIds.has(profilId)) {
                    warnings.push(`P4: ErgebnisProfil '${profilId}' wird von keiner Regel verwendet.`);
                }
            });
        }
    }
    
    // P2.5 Info
    if (p2_5Data && Array.isArray(p2_5Data) && p2_5Data.length > 0) {
        info.push(`P2.5: ${p2_5Data.length} ErgebnisProfil-Vorschläge validiert.`);
    }
    
    // Gesamtergebnis
    const isValid = errors.length === 0;
    
    console.log("=== Validierung abgeschlossen ===");
    console.log(`Fehler: ${errors.length}, Warnungen: ${warnings.length}, Info: ${info.length}`);
    
    return {
        isValid,
        errors,
        warnings,
        info,
        summary: {
            totalErrors: errors.length,
            totalWarnings: warnings.length,
            totalInfo: info.length,
            hasP1: !!p1Data,
            hasP2: !!p2Data && p2Data.length > 0,
            hasP3: !!p3Data && p3Data.length > 0,
            hasP4: !!p4Data && p4Data.length > 0,
            hasP2_5: !!p2_5Data && p2_5Data.length > 0
        }
    };
}

/**
 * Zeigt das Validierungsergebnis im UI an
 */
function displayValidationReport(validationResult) {
    const reportArea = document.getElementById('validation-report-area');
    if (!reportArea) return;
    
    let reportHTML = '';
    
    if (validationResult.isValid) {
        reportArea.className = 'success';
        reportHTML = '<strong>✅ Validierung erfolgreich!</strong> Alle Daten sind strukturell korrekt.';
        
        if (validationResult.warnings.length > 0) {
            reportHTML += '<br><br><strong>⚠️ Hinweise:</strong><ul>';
            validationResult.warnings.forEach(warning => {
                reportHTML += `<li>${escapeHtml(warning)}</li>`;
            });
            reportHTML += '</ul>';
        }
        
        if (validationResult.info.length > 0 && SimONAConfig.ui.showDebugInfo) {
            reportHTML += '<br><strong>ℹ️ Information:</strong><ul>';
            validationResult.info.forEach(infoItem => {
                reportHTML += `<li>${escapeHtml(infoItem)}</li>`;
            });
            reportHTML += '</ul>';
        }
    } else {
        reportArea.className = 'error';
        reportHTML = '<strong>❌ Validierung fehlgeschlagen!</strong> Bitte korrigieren Sie die folgenden Fehler:<ul>';
        validationResult.errors.forEach(error => {
            reportHTML += `<li style="color: #c62828;">${escapeHtml(error)}</li>`;
        });
        reportHTML += '</ul>';
    }
    
    reportArea.innerHTML = reportHTML;
    reportArea.style.display = 'block';
    
    // Scroll zum Report
    reportArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Hilfsfunktion zum HTML-Escaping
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}