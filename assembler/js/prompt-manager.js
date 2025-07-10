// prompt-manager.js - Verwaltung verschiedener Prompt-Versionen
// Version: 2.5

const PromptManager = {
    // Verfügbare Prompt-Versionen
    versions: {
        'v1': {
            name: 'Standard (v1.3)',
            description: 'Bewährte Prompt-Variante',
            templates: null // Wird von simona_prompts.js gesetzt
        },
        'v2.5': {
            name: 'Optimiert (v2.5)',
            description: 'Erweiterte Analyse mit Vollständigkeitsprüfung',
            templates: null // Wird von simona_prompts_v2.5.js gesetzt
        }
    },
    
    // Aktuell gewählte Version
    currentVersion: 'v1',
    
    /**
     * Initialisiert den Prompt-Manager
     */
    init: function() {
        // Standard-Prompts aus simona_prompts.js übernehmen
        if (typeof promptTemplates !== 'undefined') {
            this.versions['v1'].templates = { ...promptTemplates };
        }
        
        // Prüfen ob v2.5 Prompts verfügbar sind
        if (typeof promptTemplatesV2_5 !== 'undefined') {
            this.versions['v2.5'].templates = { ...promptTemplatesV2_5 };
        }
        
        // Event-Listener für Radio-Buttons
        this.initEventListeners();
        
        // Initial die Standard-Version setzen
        this.setVersion('v1');
        
        console.log('PromptManager initialisiert. Verfügbare Versionen:', Object.keys(this.versions));
    },
    
    /**
     * Event-Listener für die Prompt-Auswahl
     */
    initEventListeners: function() {
        document.addEventListener('DOMContentLoaded', () => {
            const radioButtons = document.querySelectorAll('input[name="promptVersion"]');
            radioButtons.forEach(radio => {
                radio.addEventListener('change', (event) => {
                    if (event.target.checked) {
                        this.setVersion(event.target.value);
                    }
                });
            });
        });
    },
    
    /**
     * Setzt die aktuelle Prompt-Version
     */
    setVersion: function(version) {
        if (!this.versions[version]) {
            console.error(`Unbekannte Prompt-Version: ${version}`);
            return false;
        }
        
        if (!this.versions[version].templates) {
            console.error(`Prompt-Templates für Version ${version} nicht verfügbar`);
            return false;
        }
        
        this.currentVersion = version;
        
        // Globale promptTemplates Variable überschreiben
        window.promptTemplates = { ...this.versions[version].templates };
        
        // State aktualisieren
        if (typeof SimONAState !== 'undefined') {
            SimONAState.ui.selectedPromptVersion = version;
        }
        
        // UI aktualisieren
        this.updateUI();
        
        console.log(`Prompt-Version gewechselt zu: ${version} (${this.versions[version].name})`);
        return true;
    },
    
    /**
     * Aktualisiert die UI nach Versionswechsel
     */
    updateUI: function() {
        // Radio-Button Status synchronisieren
        const radioButtons = document.querySelectorAll('input[name="promptVersion"]');
        radioButtons.forEach(radio => {
            radio.checked = (radio.value === this.currentVersion);
        });
        
        // Warnung anzeigen bei bereits generierten Prompts
        if (this.hasGeneratedPrompts()) {
            this.showVersionChangeWarning();
        }
    },
    
    /**
     * Prüft ob bereits Prompts generiert wurden
     */
    hasGeneratedPrompts: function() {
        const promptOutputs = [
            'SimONA_P1_EinheitMetadaten_output_area',
            'SimONA_P2_ParameterExtraktion_output_area',
            'SimONA_P2_5_ErgebnisProfilVorschlaege_output_area',
            'SimONA_P3_RegelGenerierung_output_area',
            'SimONA_P4_ErgebnisProfilDetails_output_area',
            'SimONA_P5_QualitaetsAudit_output_area'
        ];
        
        return promptOutputs.some(id => {
            const element = document.getElementById(id);
            return element && element.style.display !== 'none';
        });
    },
    
    /**
     * Zeigt Warnung bei Versionswechsel
     */
    showVersionChangeWarning: function() {
        const warningText = `⚠️ Sie haben die Prompt-Version gewechselt. Bereits generierte Prompts verwenden noch die alte Version. Generieren Sie die Prompts neu, um die neue Version zu verwenden.`;
        
        // Temporäre Warnung anzeigen
        const warning = document.createElement('div');
        warning.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 4px;
            max-width: 400px;
            z-index: 1000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        `;
        warning.innerHTML = `
            <strong>Prompt-Version geändert</strong><br>
            <small>${warningText}</small>
            <button onclick="this.parentElement.remove()" style="float: right; margin-left: 10px; background: none; border: none; font-size: 16px; cursor: pointer;">×</button>
        `;
        
        document.body.appendChild(warning);
        
        // Automatisch nach 8 Sekunden entfernen
        setTimeout(() => {
            if (warning.parentElement) {
                warning.remove();
            }
        }, 8000);
    },
    
    /**
     * Gibt die aktuell gewählte Version zurück
     */
    getCurrentVersion: function() {
        return {
            version: this.currentVersion,
            name: this.versions[this.currentVersion]?.name,
            description: this.versions[this.currentVersion]?.description
        };
    },
    
    /**
     * Gibt verfügbare Versionen zurück
     */
    getAvailableVersions: function() {
        return Object.keys(this.versions).filter(version => 
            this.versions[version].templates !== null
        );
    },
    
    /**
     * Debug-Funktion
     */
    debug: function() {
        console.log('=== PromptManager Debug ===');
        console.log('Aktuelle Version:', this.currentVersion);
        console.log('Verfügbare Versionen:', this.getAvailableVersions());
        console.log('Prompt-Templates geladen:', Object.keys(window.promptTemplates || {}));
        console.log('Bereits generierte Prompts:', this.hasGeneratedPrompts());
    }
};

// Globale Funktionen für Kompatibilität
window.PromptManager = PromptManager;

// Automatische Initialisierung
document.addEventListener('DOMContentLoaded', function() {
    // Kleine Verzögerung um sicherzustellen, dass alle Scripts geladen sind
    setTimeout(() => {
        PromptManager.init();
    }, 100);
});