<?php
// save_audit.php - VERSION MIT ERWEITERTEM DEBUGGING

// Schritt 1: Fehleranzeige für die Diagnose aktivieren
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Schritt 2: Sicherstellen, dass die Antwort als Text/JSON gesendet wird, auch bei Fehlern
header('Content-Type: application/json; charset=utf-8');

require 'db_config.php';

// Überprüfen, ob die Datenbankverbindung überhaupt erfolgreich war
if ($conn->connect_error) {
    http_response_code(500);
    // Wir bauen hier manuell ein JSON, da json_encode bei Fehlern fehlschlagen könnte
    echo '{"success": false, "message": "Datenbankverbindung fehlgeschlagen: ' . addslashes($conn->connect_error) . '"}';
    exit();
}


// Daten aus dem POST-Request empfangen
$postData = json_decode(file_get_contents('php://input'), true);

if (!$postData) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Ungültige oder leere Daten empfangen.']);
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

// Schritt 3: Wir fangen jetzt alle Arten von Fehlern ab (nicht nur Exceptions)
try {
    // 1. Kopfdaten in QualitaetsAudits einfügen
    $stmt1 = $conn->prepare("INSERT INTO QualitaetsAudits (FK_Einheit_ID, Gesamtscore, Gesamtfazit, P5_Prompt_Text, P5_Response_JSON) VALUES (?, ?, ?, ?, ?)");
    if ($stmt1 === false) {
        throw new Exception("Fehler beim Vorbereiten der SQL-Anweisung für QualitaetsAudits: " . $conn->error);
    }
    $stmt1->bind_param("sdsss", $einheitId, $gesamtscore, $gesamtfazit, $promptText, $auditResponse);
    $stmt1->execute();
    
    $lastAuditId = $conn->insert_id;
    $stmt1->close();

    // 2. Detailbewertungen in QualitaetsAudit_Detailbewertungen einfügen
    $stmt2 = $conn->prepare("INSERT INTO QualitaetsAudit_Detailbewertungen (FK_AuditID, Kategorie, Score, Begruendung) VALUES (?, ?, ?, ?)");
    if ($stmt2 === false) {
        throw new Exception("Fehler beim Vorbereiten der SQL-Anweisung für QualitaetsAudit_Detailbewertungen: " . $conn->error);
    }
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

} catch (Throwable $e) { // Fängt jetzt alle Fehler, nicht nur Exceptions
    $conn->rollback();
    http_response_code(500);
    // Gibt uns eine detailliertere Fehlermeldung
    echo json_encode(['success' => false, 'message' => 'Datenbank-Transaktion fehlgeschlagen: ' . $e->getMessage()]);
}

$conn->close();
?>