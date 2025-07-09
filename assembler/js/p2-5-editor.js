// p2-5-editor.js - Editor für P2.5 ErgebnisProfil-Vorschläge
// Version: 2.5

const P2_5Editor = {
    /**
     * Zeigt und bereitet P2.5 Vorschläge zur Bearbeitung vor
     */
    displayAndPrepare: function() {
        const p2_5ResponseText = getInputValue('SimONA_P2_5_ErgebnisProfilVorschlaege_response');
        const editorArea = document.getElementById('p2_5_suggestions_editor_area');
        const addNewArea = document.getElementById('p2_5_add_new_suggestion_area');
        
        editorArea.innerHTML = ''; 
        addNewArea.style.display = 'none';
        
        if (!p2_5ResponseText) {
            alert("Keine Daten aus SimONA_P2_5_ErgebnisProfilVorschlaege vorhanden. Bitte Prompt ausführen und Antwort einfügen.");
            return;
        }

        let suggestions;
        try {
            suggestions = JSON.parse(p2_5ResponseText);
            if (!Array.isArray(suggestions)) {
                throw new Error("P2.5 Antwort muss ein Array sein");
            }
            
            // Validiere Struktur
            suggestions.forEach((item, index) => {
                if (!item.Vorgeschlagene_ErgebnisProfil_ID_Referenz || 
                    !item.Vorgeschlagene_Kurzbeschreibung_Ergebnis) {
                    throw new Error(`Vorschlag ${index} hat nicht die erwartete Struktur`);
                }
            });
        } catch (e) {
            alert("Fehler beim Parsen der P2.5 JSON-Antwort: " + e.message);
            return;
        }

        // Speichere im State
        SimONAState.methods.setResponse('p2_5', [...suggestions]);
        
        if (suggestions.length === 0) {
            editorArea.innerHTML = '<p>Keine Ergebnisprofil-Vorschläge in der KI-Antwort gefunden. Sie können manuell welche hinzufügen.</p>';
        } else {
            this.redrawList();
        }
        
        document.getElementById('addNewSuggestionButton').style.display = 'inline-block';
    },
    
    /**
     * Zeichnet die Liste der Vorschläge neu
     */
    redrawList: function() {
        const editorArea = document.getElementById('p2_5_suggestions_editor_area');
        const suggestions = SimONAState.methods.getResponse('p2_5') || [];
        
        editorArea.innerHTML = '';
        
        if (suggestions.length === 0) {
            editorArea.innerHTML = '<p>Keine Ergebnisprofil-Vorschläge vorhanden. Sie können manuell welche hinzufügen.</p>';
            return;
        }
        
        const container = document.createElement('div');
        container.className = 'suggestions-list';
        
        suggestions.forEach((suggestion, index) => {
            const item = this.createSuggestionItem(suggestion, index);
            container.appendChild(item);
        });
        
        editorArea.appendChild(container);
        
        // Info-Text
        const infoText = document.createElement('p');
        infoText.style.cssText = 'font-style: italic; font-size: 0.9em; margin-top: 15px;';
        infoText.textContent = 'Die oben gelisteten Vorschläge werden als Grundlage für Prompt 3 und 4 verwendet.';
        editorArea.appendChild(infoText);
    },
    
    /**
     * Erstellt ein einzelnes Vorschlags-Element
     */
    createSuggestionItem: function(suggestion, index) {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.style.cssText = 'border: 1px solid #e0e0e0; padding: 10px; margin-bottom: 10px; border-radius: 4px; background-color: #ffffff;';
        
        item.innerHTML = `
            <div style="margin-bottom: 10px;">
                <strong>ID:</strong> 
                <input type="text" 
                       value="${escapeHtml(suggestion.Vorgeschlagene_ErgebnisProfil_ID_Referenz)}" 
                       onblur="P2_5Editor.updateField(${index}, 'id', this.value)"
                       style="width: 300px; margin-left: 10px;">
            </div>
            <div style="margin-bottom: 10px;">
                <strong>Beschreibung:</strong>
                <input type="text" 
                       value="${escapeHtml(suggestion.Vorgeschlagene_Kurzbeschreibung_Ergebnis)}" 
                       onblur="P2_5Editor.updateField(${index}, 'desc', this.value)"
                       style="width: 500px; margin-left: 10px;">
            </div>
            <div>
                <button onclick="P2_5Editor.deleteSuggestion(${index})" 
                        style="background-color: #e74c3c; color: white; border: none; padding: 5px 15px; cursor: pointer; border-radius: 4px;">
                    Löschen
                </button>
            </div>
        `;
        
        return item;
    },
    
    /**
     * Aktualisiert ein Feld eines Vorschlags
     */
    updateField: function(index, field, newValue) {
        const suggestions = SimONAState.methods.getResponse('p2_5');
        if (!suggestions || !suggestions[index]) return;
        
        const trimmedValue = newValue.trim();
        if (!trimmedValue) {
            alert(`${field === 'id' ? 'ID' : 'Beschreibung'} darf nicht leer sein.`);
            this.redrawList(); // Wert zurücksetzen
            return;
        }
        
        if (field === 'id') {
            // Prüfe auf doppelte IDs
            const isDuplicate = suggestions.some((s, i) => 
                i !== index && s.Vorgeschlagene_ErgebnisProfil_ID_Referenz === trimmedValue
            );
            if (isDuplicate) {
                alert(`Die ID "${trimmedValue}" existiert bereits.`);
                this.redrawList(); // Wert zurücksetzen
                return;
            }
            suggestions[index].Vorgeschlagene_ErgebnisProfil_ID_Referenz = trimmedValue;
        } else {
            suggestions[index].Vorgeschlagene_Kurzbeschreibung_Ergebnis = trimmedValue;
        }
        
        console.log(`Vorschlag ${index} ${field} aktualisiert:`, trimmedValue);
    },
    
    /**
     * Löscht einen Vorschlag
     */
    deleteSuggestion: function(index) {
        if (!confirm("Möchten Sie diesen Vorschlag wirklich löschen?")) {
            return;
        }
        
        const suggestions = SimONAState.methods.getResponse('p2_5');
        if (!suggestions) return;
        
        suggestions.splice(index, 1);
        this.redrawList();
        console.log(`Vorschlag ${index} gelöscht. Verbleibende Vorschläge:`, suggestions.length);
    },
    
    /**
     * Zeigt Interface zum Hinzufügen eines neuen Vorschlags
     */
    showAddInterface: function() {
        const addArea = document.getElementById('p2_5_add_new_suggestion_area');
        const paragraphNum = getInputValue("paragraph") || "[Para]";
        const absatzNum = getInputValue("absatz") || "[Abs]";
        
        // Generiere Vorschlag für neue ID
        const timestamp = Date.now().toString().slice(-5);
        document.getElementById('new_suggestion_id').value = 
            `EP_${paragraphNum}_${absatzNum}_Manuell_${timestamp}`;
        document.getElementById('new_suggestion_desc').value = '';
        
        addArea.style.display = 'block';
        document.getElementById('new_suggestion_id').focus();
    },
    
    /**
     * Speichert einen neuen Vorschlag
     */
    saveNewSuggestion: function() {
        const newId = getInputValue('new_suggestion_id');
        const newDesc = getInputValue('new_suggestion_desc');
        
        if (!newId || !newDesc) {
            alert("Bitte beide Felder ausfüllen.");
            return;
        }
        
        const suggestions = SimONAState.methods.getResponse('p2_5') || [];
        
        // Prüfe auf doppelte IDs
        if (suggestions.some(s => s.Vorgeschlagene_ErgebnisProfil_ID_Referenz === newId)) {
            alert(`Die ID "${newId}" existiert bereits.`);
            return;
        }
        
        suggestions.push({
            Vorgeschlagene_ErgebnisProfil_ID_Referenz: newId,
            Vorgeschlagene_Kurzbeschreibung_Ergebnis: newDesc
        });
        
        SimONAState.methods.setResponse('p2_5', suggestions);
        this.redrawList();
        this.cancelAdd();
        
        console.log("Neuer Vorschlag hinzugefügt:", newId);
    },
    
    /**
     * Bricht das Hinzufügen ab
     */
    cancelAdd: function() {
        document.getElementById('new_suggestion_id').value = '';
        document.getElementById('new_suggestion_desc').value = '';
        document.getElementById('p2_5_add_new_suggestion_area').style.display = 'none';
    }
};

// Globale Funktionen für HTML onclick-Handler
window.displayAndPrepareP2_5Suggestions = P2_5Editor.displayAndPrepare.bind(P2_5Editor);
window.addNewSuggestionInterface = P2_5Editor.showAddInterface.bind(P2_5Editor);
window.saveNewSuggestion = P2_5Editor.saveNewSuggestion.bind(P2_5Editor);
window.cancelNewSuggestion = P2_5Editor.cancelAdd.bind(P2_5Editor);