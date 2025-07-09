<?php
// get_audits.php - VERSION MIT DETAILLIERTEM LOGGING

// --- Log-Funktion ---
function write_log($message) {
    $log_file = 'get_audits_log.txt';
    $timestamp = date("Y-m-d H:i:s");
    file_put_contents($log_file, $timestamp . " - " . $message . "\n", FILE_APPEND);
}

// Start des Logs für diesen Aufruf
write_log("=================================================");
write_log("Skript get_audits.php wurde aufgerufen.");

header('Content-Type: application/json; charset=utf-8');
require 'db_config.php';

$einheitId_raw = $_GET['einheit_id'] ?? null;

// Wir protokollieren exakt, was wir empfangen haben
write_log("Empfangener GET-Parameter 'einheit_id': " . ($einheitId_raw ? $einheitId_raw : "NULL"));

if (!$einheitId_raw) {
    write_log("Fehler: einheit_id fehlt. Skript wird beendet.");
    http_response_code(400);
    echo json_encode(['error' => 'Parameter einheit_id fehlt.']);
    exit;
}

// Trimmen, um eventuelle Leerzeichen zu entfernen
$einheitId = trim($einheitId_raw)."%";
write_log("Getrimmte 'einheit_id' für die Abfrage: " . $einheitId);


$audits = [];
$sqlKopf = "SELECT AuditID, FK_Einheit_ID, Audit_Timestamp, Gesamtscore, Gesamtfazit, P5_Prompt_Text, P5_Response_JSON FROM QualitaetsAudits WHERE FK_Einheit_ID LIKE ? ORDER BY Audit_Timestamp DESC";
$stmtKopf = $conn->prepare($sqlKopf);

write_log("SQL-Statement: " . $sqlKopf);


if ($stmtKopf === false) {
    write_log("KRITISCHER FEHLER: SQL-Vorbereitung für Kopf-Abfrage fehlgeschlagen: " . $conn->error);
    http_response_code(500);
    echo json_encode(['error' => 'Datenbankfehler bei Kopf-Abfrage.']);
    exit;
}

$stmtKopf->bind_param("s", $einheitId);
$stmtKopf->execute();
$resultKopf = $stmtKopf->get_result();

// Wir protokollieren das Ergebnis der Abfrage
write_log("Kopf-Query ausgeführt. Anzahl gefundener Zeilen: " . $resultKopf->num_rows);


$sqlDetail = "SELECT Kategorie, Score, Begruendung FROM QualitaetsAudit_Detailbewertungen WHERE FK_AuditID = ?";
$stmtDetail = $conn->prepare($sqlDetail);

while ($rowKopf = $resultKopf->fetch_assoc()) {
    $currentAuditId = $rowKopf['AuditID'];
    write_log("Verarbeite AuditID: " . $currentAuditId);
    $rowKopf['Detailbewertungen'] = [];
    
    $stmtDetail->bind_param("i", $currentAuditId);
    $stmtDetail->execute();
    $resultDetail = $stmtDetail->get_result();
    while ($rowDetail = $resultDetail->fetch_assoc()) {
        $rowKopf['Detailbewertungen'][] = $rowDetail;
    }
    
    $audits[] = $rowKopf;
}

$stmtKopf->close();
$stmtDetail->close();
$conn->close();

write_log("Skript-Ausführung beendet. Sende " . count($audits) . " Audit(s) als JSON.");
write_log("=================================================\n");

echo json_encode($audits);
?>