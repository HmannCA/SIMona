<?php
// save_audit.php
header('Content-Type: application/json; charset=utf-8');
require 'db_config.php';

// Daten aus dem POST-Request empfangen
$postData = json_decode(file_get_contents('php://input'), true);

if (!$postData) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Ungültige Daten empfangen.']);
    exit();
}

$einheitId = $postData['einheitId'] ?? null;
$promptText = $postData['promptText'] ?? null;
$auditResponse = $postData['auditResponse'] ?? null;

if (!$einheitId || !$auditResponse) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Einheit-ID oder Audit-Antwort fehlt.']);
    exit();
}

// Audit-Antwort als JSON dekodieren
$auditData = json_decode($auditResponse, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Die übergebene Audit-Antwort ist kein valides JSON.']);
    exit();
}

$gesamtscore = $auditData['Gesamtbewertung']['Score'] ?? null;
$gesamtfazit = $auditData['Gesamtbewertung']['Fazit'] ?? null;
$detailbewertungen = $auditData['Detailbewertungen'] ?? [];

$conn->begin_transaction();

try {
    // 1. Kopfdaten in QualitaetsAudits einfügen
    $stmt1 = $conn->prepare("INSERT INTO QualitaetsAudits (FK_Einheit_ID, Gesamtscore, Gesamtfazit, P5_Prompt_Text, P5_Response_JSON) VALUES (?, ?, ?, ?, ?)");
    $stmt1->bind_param("sdsss", $einheitId, $gesamtscore, $gesamtfazit, $promptText, $auditResponse);
    $stmt1->execute();
    
    // Die ID des gerade erstellten Audits holen
    $lastAuditId = $conn->insert_id;
    $stmt1->close();

    // 2. Detailbewertungen in QualitaetsAudit_Detailbewertungen einfügen
    $stmt2 = $conn->prepare("INSERT INTO QualitaetsAudit_Detailbewertungen (FK_AuditID, Kategorie, Score, Begruendung) VALUES (?, ?, ?, ?)");
    foreach ($detailbewertungen as $detail) {
        $kategorie = $detail['Kategorie'] ?? null;
        $score = $detail['Score'] ?? null;
        $begruendung = $detail['Begruendung'] ?? null;
        $stmt2->bind_param("isis", $lastAuditId, $kategorie, $score, $begruendung);
        $stmt2->execute();
    }
    $stmt2->close();
    
    $conn->commit();
    echo json_encode(['success' => true, 'message' => 'Audit-Ergebnis erfolgreich in der Datenbank gespeichert.']);

} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Datenbankfehler: ' . $e->getMessage()]);
}

$conn->close();
?>