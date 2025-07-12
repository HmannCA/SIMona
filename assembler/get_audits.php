<?php
// get_audits.php - Lädt alle Audits für eine SimulationsEinheit
// Version: 2.7 - Finale Korrektur, holt P5_Response_JSON mit

header('Content-Type: application/json; charset=utf-8');

// Verbesserter SQL-Join mit SimulationsEinheiten für Paragraph, Absatz, Satz und Prompt_Version
ini_set('display_errors', 0);
error_reporting(E_ALL);
require 'db_config.php';

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Datenbankverbindung fehlgeschlagen']);
    exit();
}

$einheitId_raw = $_GET['einheit_id'] ?? $_GET['einheitId'] ?? null;

if (!$einheitId_raw) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Keine SimulationsEinheit_ID angegeben.']);
    exit();
}

$suchmuster = trim($einheitId_raw) . "%";

try {
    // SQL-Abfrage mit JOIN auf SimulationsEinheiten für zusätzliche Informationen
    $sql = "SELECT 
                qa.AuditID,
                qa.FK_Einheit_ID,
                qa.Audit_Timestamp,
                qa.Gesamtscore,
                qa.Gesamtfazit,
                qa.P5_Response_JSON,
                se.Paragraph,
                se.Absatz,
                se.Satz,
                se.Prompt_Version
            FROM 
                QualitaetsAudits qa
            LEFT JOIN 
                SimulationsEinheiten se ON qa.FK_Einheit_ID = se.Einheit_ID
            WHERE 
                qa.FK_Einheit_ID LIKE ?
            ORDER BY 
                qa.Audit_Timestamp DESC";
    
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception("Fehler beim Vorbereiten der SQL-Abfrage: " . $conn->error);
    }
    
    $stmt->bind_param("s", $suchmuster);
    $stmt->execute();
    
    $result = $stmt->get_result();
    $audits = [];
    
    while ($row = $result->fetch_assoc()) {
        if ($row['Gesamtscore'] !== null) {
            $row['Gesamtscore'] = floatval($row['Gesamtscore']);
        }
        $audits[] = $row;
    }
    
    $stmt->close();
    
    echo json_encode([
        'success' => true,
        'audits' => $audits,
        'count' => count($audits)
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Fehler beim Abrufen der Audits: ' . $e->getMessage()
    ]);
}

$conn->close();
?>