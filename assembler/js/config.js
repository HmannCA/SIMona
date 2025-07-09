// config.js - Zentrale Konfiguration und Mapping für SimONA Assembler
// Version: 2.5
// Stand: Januar 2025

const SimONAConfig = {
    // Versionsinformationen
    version: '2.5',
    lastUpdate: '2025-01-09',
    
    // Datenbank-Feldnamen-Mapping
    // Mappt KI-Ausgabefelder auf Datenbank-Spaltennamen
    fieldMapping: {
        // P1 - SimulationsEinheiten Mapping
        p1ToDb: {
            // Direkte Übernahmen (KI-Name = DB-Name)
            'Gesetz': 'Gesetz',
            'Paragraph': 'Paragraph',
            'Absatz': 'Absatz',
            'Satz': 'Satz',
            'Kurzbeschreibung': 'Kurzbeschreibung',
            'Gesetzestext_Zitat_Analysierter_Teil': 'Gesetzestext_Zitat',
            'Art_Rechtsfolge_Positiv_Typ': 'Art_Rechtsfolge_Positiv_Typ',
            'Ermessensleitlinien_Text': 'Ermessensleitlinien_Text',
            
            // Umbenennungen (KI-Name → DB-Name)
            'Gesetz_Vollstaendiger_Name': 'Gesetz_Vollname',
            'Gesetz_Aktueller_Stand_Datum': 'Gesetz_Aktueller_Stand',
            'Paragraf_Uebergreifende_Kurzbeschreibung': 'Paragraf_Gesamtbeschreibung',
            'Paragraph_Offizielle_Bezeichnung': 'Paragraph_Offizielle_Bezeichnung',
            
            // Spezielle Behandlung
            'FK_Entscheidungsart_ID_Lookup_Bezeichnung': '_special_entscheidungsart' // Benötigt Lookup
        },
        
        // P2 - Parameter Mapping
        p2ToDb: {
            'Parameter_ID': 'Parameter_ID',
            'Reihenfolge_Anzeige': 'Reihenfolge_Anzeige',
            'Fragetext': 'Fragetext',
            'Antworttyp': 'Antworttyp',
            'Begleittext': 'Begleittext',
            'Normbezug_Detail_Parameter': 'Normbezug_Detail_Parameter',
            'Verweis_Normen_Info_Parameter': 'Verweis_Normen_Info_Parameter',
            'FK_Verlinkte_SimulationsEinheit_ID_Platzhalter': 'FK_Verlinkte_SimulationsEinheit_ID',
            'Ist_Grundvoraussetzung': 'IstGrundvoraussetzung',
            'Anzeige_Bedingung': 'AnzeigeBedingungJSON',
            'Text_Erfuellt_Pro': 'Text_Erfuellt_Pro',
            'Text_NichtErfuellt_Contra': 'Text_NichtErfuellt_Contra',
            
            // Wird aus P2.7 hinzugefügt
            'Konklusive_Antworten_Info': 'KonklusiveAntwortenInfoJSON'
        },
        
        // P2 - Antwortoptionen Mapping
        p2OptionsToDb: {
            'Option_Text': 'Option_Text',
            'Option_Wert_Intern': 'Option_Wert_Intern',
            'Reihenfolge_Option': 'Reihenfolge'
        },
        
        // P3 - Regeln Mapping
        p3ToDb: {
            'Regel_Name': 'Regel_Name',
            'Prioritaet': 'Prioritaet',
            'FK_ErgebnisProfil_ID_Referenz': 'FK_ErgebnisProfil_ID_Referenz'
        },
        
        // P3 - RegelBedingungen Mapping
        p3ConditionsToDb: {
            'FK_Parameter_ID': 'FK_Parameter_ID',
            'Operator': 'Operator',
            'Erwarteter_Wert_Intern': 'Erwarteter_Wert_Intern'
        },
        
        // P4 - ErgebnisProfile Mapping
        p4ToDb: {
            'ErgebnisProfil_ID_Referenz': 'ErgebnisProfil_ID_Referenz',
            'Profil_Name': 'Profil_Name',
            'Entscheidungstext_Kurz_Vorlage': 'Entscheidungstext_Kurz_Vorlage',
            'Art_der_Entscheidung_Anzeige_Text': 'Art_der_Entscheidung_Anzeige_Text',
            'Einleitungstext_Begruendung_Vorlage': 'Einleitungstext_Begruendung_Vorlage',
            'Begruendung_Dynamische_Parameter_Liste': 'Begruendung_Dynamische_Parameter_Liste',
            'Spezifischer_Ergaenzungstext_Begruendung_Vorlage': 'Spezifischer_Ergaenzungstext_Begruendung_Vorlage',
            'Abschlusstext_Begruendung_Vorlage': 'Abschlusstext_Begruendung_Vorlage'
        }
    },
    
    // SQL-Generierungs-Konfiguration
    sql: {
        transactionWrapper: true,
        useLastInsertId: true,
        escapeSingleQuotes: true
    },
    
    // Validierungs-Konfiguration
    validation: {
        requireAllP1Fields: false, // Einige P1-Felder können null sein
        requireParameterName: true, // Neu hinzugefügtes Feld ist Pflicht
        allowEmptyErgebnisProfile: false,
        checkCrossReferences: true
    },
    
    // UI-Konfiguration
    ui: {
        showDebugInfo: true,
        animationDuration: 300,
        confirmDeletion: true,
        autoGenerateIds: true
    }
};

// Hilfsfunktionen für Mapping
const MappingUtils = {
    /**
     * Mappt ein KI-Objekt auf Datenbank-Feldnamen
     * @param {Object} aiObject - Das von der KI gelieferte Objekt
     * @param {Object} mappingConfig - Die Mapping-Konfiguration
     * @param {Object} additionalData - Zusätzliche Daten (z.B. für Lookups)
     * @returns {Object} - Gemapptes Objekt für die Datenbank
     */
    mapToDb: function(aiObject, mappingConfig, additionalData = {}) {
        const mappedObject = {};
        
        for (const [aiField, dbField] of Object.entries(mappingConfig)) {
            if (dbField.startsWith('_special_')) {
                // Spezielle Behandlung erforderlich
                const specialHandler = dbField.substring(9); // Remove '_special_'
                mappedObject[specialHandler] = this.handleSpecialField(
                    specialHandler, 
                    aiObject[aiField], 
                    additionalData
                );
            } else if (aiObject.hasOwnProperty(aiField)) {
                // Normales Mapping
                mappedObject[dbField] = aiObject[aiField];
            }
        }
        
        return mappedObject;
    },
    
    /**
     * Behandelt spezielle Felder die eine Transformation benötigen
     */
    handleSpecialField: function(fieldType, value, additionalData) {
        switch(fieldType) {
            case 'entscheidungsart':
                // Für FK_Entscheidungsart_ID: Benötigt eine Subquery
                return value ? `(SELECT Entscheidungsart_ID FROM Entscheidungsarten_Lookup WHERE Bezeichnung = ${escapeSqlString(value)})` : 'NULL';
            
            default:
                console.warn(`Unbekannter spezieller Feldtyp: ${fieldType}`);
                return null;
        }
    },
    
    /**
     * Erstellt Parameter_Name aus Parameter_ID falls nicht vorhanden
     */
    ensureParameterName: function(parameter) {
        if (!parameter.Parameter_Name && parameter.Parameter_ID) {
            // Generiere einen lesbaren Namen aus der ID
            // P_15_1_Auslaender → "Ausländer-Status"
            const parts = parameter.Parameter_ID.split('_');
            const descriptivePart = parts[parts.length - 1];
            parameter.Parameter_Name = descriptivePart
                .replace(/([A-Z])/g, ' $1')
                .trim()
                .replace(/ae/g, 'ä')
                .replace(/oe/g, 'ö')
                .replace(/ue/g, 'ü');
        }
        return parameter;
    }
};

// Exportiere für andere Module (wenn Module-System verwendet wird)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SimONAConfig, MappingUtils };
}