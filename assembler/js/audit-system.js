// audit-system.js - Vollständiges P5 Audit-System
// Version: 2.5
// Ermöglicht mehrere Audits pro SimulationsEinheit

const AuditSystem = {
    /**
     * Speichert ein neues P5 Audit in der Datenbank
     */
    saveAudit: function() {
        console.log("Speichere P5 Audit-Ergebnis...");

        const auditResponseText = getInputValue('SimONA_P5_QualitaetsAudit_response');
        const promptText = document.getElementById('SimONA_P5_QualitaetsAudit_prompt').value;
        const einheitId = SimONAState.currentSimulationsEinheitID;

        if (!auditResponseText) {
            alert("Fehler: Das Antwortfeld für das Audit ist leer.");
            return;
        }

        if (!einheitId) {
            alert("Fehler: Keine SimulationsEinheit_ID vorhanden.");
            return;
        }

        // Validiere JSON
        let auditData;
        try {
            auditData = JSON.parse(auditResponseText);
        } catch (e) {
            alert("Fehler: Die Audit-Antwort ist kein valides JSON.");
            return;
        }

        // UI-Feedback
        const button = event.target;
        const originalText = button.textContent;
        const originalBg = button.style.backgroundColor;
        button.disabled = true;
        button.textContent = 'Speichere...';
        button.style.backgroundColor = '#f39c12';

        // AJAX-Request
        fetch('save_audit.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                einheitId: einheitId,
                promptText: promptText,
                auditResponse: auditResponseText
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Erfolgsmeldung
                button.textContent = '✓ Gespeichert!';
                button.style.backgroundColor = '#27ae60';
                
                // Zeige Audit-Info (mit der zurückgegebenen auditId)
                this.displayAuditSaved(data.auditId, auditData);
                
                // Nach 3 Sekunden zurücksetzen
                setTimeout(() => {
                    button.textContent = originalText;
                    button.style.backgroundColor = originalBg;
                    button.disabled = false;
                }, 3000);
                
                // Lade Audit-Historie neu
                this.loadAuditHistory(einheitId);
                
            } else {
                throw new Error(data.message || 'Unbekannter Fehler');
            }
        })
        .catch(error => {
            console.error('Fehler:', error);
            alert("Fehler beim Speichern: " + error.message);
            button.textContent = originalText;
            button.style.backgroundColor = originalBg;
            button.disabled = false;
        });
    },

    /**
     * Zeigt Info über gespeichertes Audit an
     */
    displayAuditSaved: function(auditId, auditData) {
        const outputArea = document.getElementById('SimONA_P5_QualitaetsAudit_output_area');
        if (!outputArea) return;

        // Entferne alte Saved-Indikatoren
        const oldIndicators = outputArea.querySelectorAll('.audit-saved-indicator');
        oldIndicators.forEach(el => el.remove());

        // Neuer Indikator
        const savedIndicator = document.createElement('div');
        savedIndicator.className = 'audit-saved-indicator';
        savedIndicator.style.cssText = `
            background-color: #e8f5e9;
            border: 1px solid #4caf50;
            border-radius: 4px;
            padding: 10px;
            margin-top: 15px;
            color: #2e7d32;
        `;
        
        const score = auditData.Gesamtbewertung?.Score || 'N/A';
        const fazit = auditData.Gesamtbewertung?.Fazit || 'Kein Fazit';
        
        savedIndicator.innerHTML = `
            <strong>✓ Audit erfolgreich gespeichert!</strong><br>
            <small>
                Audit-ID: #${auditId || 'NEU'}<br>
                Zeitpunkt: ${new Date().toLocaleString()}<br>
                Score: ${score}/10<br>
                Fazit: ${fazit}
            </small>
        `;
        
        outputArea.appendChild(savedIndicator);
    },

    /**
     * Lädt die Audit-Historie für eine SimulationsEinheit
     */
    loadAuditHistory: function(einheitId) {
        if (!einheitId) return;

        fetch('get_audits.php?einheitId=' + encodeURIComponent(einheitId))
        .then(response => response.json())
        .then(data => {
            if (data.success && data.audits) {
                this.displayAuditHistory(data.audits);
            }
        })
        .catch(error => {
            console.error('Fehler beim Laden der Audit-Historie:', error);
        });
    },

    /**
     * Zeigt die Audit-Historie an
     */
    displayAuditHistory: function(audits) {
        // Finde oder erstelle Container für Historie
        let historyContainer = document.getElementById('audit-history-container');
        if (!historyContainer) {
            const step65 = document.getElementById('step-6-5');
            if (!step65) return;
            
            historyContainer = document.createElement('div');
            historyContainer.id = 'audit-history-container';
            historyContainer.className = 'step-section';
            historyContainer.style.cssText = 'margin-top: 20px; background-color: #f5f5f5;';
            historyContainer.innerHTML = '<h3>Audit-Historie</h3>';
            step65.parentNode.insertBefore(historyContainer, step65.nextSibling);
        }

        // Leere Container
        const existingContent = historyContainer.querySelector('.audit-history-content');
        if (existingContent) existingContent.remove();

        const content = document.createElement('div');
        content.className = 'audit-history-content';

        if (audits.length === 0) {
            content.innerHTML = '<p style="color: #666;">Noch keine Audits vorhanden.</p>';
        } else {
            const table = document.createElement('table');
            table.style.cssText = `
                width: 100%;
                border-collapse: collapse;
                margin-top: 10px;
            `;
            
            table.innerHTML = `
                <thead>
                    <tr style="background-color: #e0e0e0;">
                        <th style="padding: 8px; text-align: left;">ID</th>
                        <th style="padding: 8px; text-align: left;">Datum</th>
                        <th style="padding: 8px; text-align: center;">Score</th>
                        <th style="padding: 8px; text-align: left;">Fazit</th>
                        <th style="padding: 8px; text-align: center;">Aktionen</th>
                    </tr>
                </thead>
                <tbody>
                    ${audits.map(audit => `
                        <tr style="border-bottom: 1px solid #ddd;">
                            <td style="padding: 8px;">#${audit.AuditID}</td>
                            <td style="padding: 8px;">${new Date(audit.Audit_Timestamp).toLocaleString()}</td>
                            <td style="padding: 8px; text-align: center;">
                                <span style="
                                    background-color: ${this.getScoreColor(audit.Gesamtscore)};
                                    color: white;
                                    padding: 2px 8px;
                                    border-radius: 12px;
                                    font-weight: bold;
                                ">
                                    ${audit.Gesamtscore || 'N/A'}
                                </span>
                            </td>
                            <td style="padding: 8px; font-size: 0.9em;">
                                ${audit.Gesamtfazit ? audit.Gesamtfazit.substring(0, 50) + '...' : '-'}
                            </td>
                            <td style="padding: 8px; text-align: center;">
                                <button onclick="AuditSystem.viewAuditDetails(${audit.AuditID})" 
                                        style="padding: 4px 10px; font-size: 0.85em;">
                                    Details
                                </button>
                                <button onclick="AuditSystem.loadAuditIntoForm(${audit.AuditID})" 
                                        style="padding: 4px 10px; font-size: 0.85em; margin-left: 5px;">
                                    Laden
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            `;
            
            content.appendChild(table);
        }

        historyContainer.appendChild(content);
    },

    /**
     * Gibt Farbe basierend auf Score zurück
     */
    getScoreColor: function(score) {
        if (!score) return '#95a5a6';
        if (score >= 8) return '#27ae60';
        if (score >= 6) return '#f39c12';
        if (score >= 4) return '#e67e22';
        return '#e74c3c';
    },

    /**
     * Zeigt Details eines Audits in einem Modal/Alert
     */
    viewAuditDetails: function(auditId) {
        fetch('get_audit_details.php?auditId=' + auditId)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.audit) {
                this.showAuditModal(data.audit);
            } else {
                alert('Fehler beim Laden der Audit-Details');
            }
        })
        .catch(error => {
            console.error('Fehler:', error);
            alert('Fehler beim Laden der Audit-Details');
        });
    },

    /**
     * Lädt ein vorhandenes Audit in das Formular
     */
    loadAuditIntoForm: function(auditId) {
        if (!confirm('Möchten Sie dieses Audit in das Formular laden? Die aktuellen Daten werden überschrieben.')) {
            return;
        }

        fetch('get_audit_details.php?auditId=' + auditId)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.audit) {
                // Prompt-Text laden
                const promptTextarea = document.getElementById('SimONA_P5_QualitaetsAudit_prompt');
                if (promptTextarea && data.audit.P5_Prompt_Text) {
                    promptTextarea.value = data.audit.P5_Prompt_Text;
                }

                // Response-JSON laden
                const responseTextarea = document.getElementById('SimONA_P5_QualitaetsAudit_response');
                if (responseTextarea && data.audit.P5_Response_JSON) {
                    responseTextarea.value = JSON.stringify(data.audit.P5_Response_JSON, null, 2);
                }

                // Output-Area anzeigen
                const outputArea = document.getElementById('SimONA_P5_QualitaetsAudit_output_area');
                if (outputArea) {
                    outputArea.style.display = 'block';
                }

                alert(`Audit #${auditId} wurde erfolgreich geladen.`);
            }
        })
        .catch(error => {
            console.error('Fehler:', error);
            alert('Fehler beim Laden des Audits');
        });
    },

    /**
     * Zeigt Audit-Details in einem Modal
     */
    showAuditModal: function(audit) {
        // Erstelle Modal-Container
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;

        const content = document.createElement('div');
        content.style.cssText = `
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
        `;

        const responseData = typeof audit.P5_Response_JSON === 'string' 
            ? JSON.parse(audit.P5_Response_JSON) 
            : audit.P5_Response_JSON;

        content.innerHTML = `
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="position: absolute; right: 10px; top: 10px; 
                           background: #e74c3c; color: white; border: none; 
                           padding: 5px 10px; cursor: pointer; border-radius: 4px;">
                ✕
            </button>
            <h2>Audit #${audit.AuditID}</h2>
            <p><strong>Datum:</strong> ${new Date(audit.Audit_Timestamp).toLocaleString()}</p>
            <p><strong>SimulationsEinheit:</strong> ${audit.FK_Einheit_ID}</p>
            
            <h3>Gesamtbewertung</h3>
            <p><strong>Score:</strong> ${audit.Gesamtscore}/10</p>
            <p><strong>Fazit:</strong> ${audit.Gesamtfazit}</p>
            
            <h3>Detailbewertungen</h3>
            ${audit.details ? audit.details.map(detail => `
                <div style="margin-bottom: 10px; padding: 10px; background-color: #f5f5f5; border-radius: 4px;">
                    <strong>${detail.Kategorie}:</strong> ${detail.Score}/10<br>
                    <small>${detail.Begruendung}</small>
                </div>
            `).join('') : '<p>Keine Detailbewertungen vorhanden</p>'}
        `;

        modal.appendChild(content);
        document.body.appendChild(modal);

        // Schließen bei Klick außerhalb
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
    },

    /**
     * Initialisiert das Audit-System beim Laden der Seite
     */
    init: function() {
        // Lade Audit-Historie wenn SimulationsEinheit vorhanden
        const einheitId = SimONAState.currentSimulationsEinheitID;
        if (einheitId) {
            this.loadAuditHistory(einheitId);
        }

        // Listener für State-Änderungen
        document.addEventListener('simonaStateChange', (event) => {
            if (event.detail.type === 'simulationsEinheitID') {
                this.loadAuditHistory(event.detail.data);
            }
        });
    }
};

// Globale Funktionen für HTML onclick
window.saveP5AuditResult = AuditSystem.saveAudit.bind(AuditSystem);

// Initialisierung
document.addEventListener('DOMContentLoaded', function() {
    AuditSystem.init();
});