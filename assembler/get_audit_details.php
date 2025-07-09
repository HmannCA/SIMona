<?php
// get_audit_details.php - Lädt Details eines spezifischen Audits
// Version: 2.5

header('Content-Type: application/json; charset=utf-8');

// Fehlerbehandlung
ini_set('display_errors', 0);
error_reporting(E_ALL);

require 'db_config.php';

// Überprüfe Datenbankverbindung
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Datenbankverbindung fehlgeschlagen'
    ]);
    exit();
}

// Audit-ID aus GET-Parameter
$auditId = $_GET['auditId'] ?? null;

if (!$auditId || !is_numeric($auditId)) {
    http_response_code(400);
    echo json_encode([
        'success' => false, 
        'message' => 'Ungültige oder fehlende Audit-ID'
    ]);
    exit();
}

try {
    // Hauptaudit-Daten abrufen
    $sql = "SELECT 
                a.AuditID,
                a.FK_Einheit_ID,
                a.Audit_Timestamp,
                a.Gesamtscore,
                a.Gesamtfazit,
                a.P5_Prompt_Text,
                a.P5_Response_JSON
            FROM QualitaetsAudits a
            WHERE a.AuditID = ?";
    
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception("Fehler beim Vorbereiten der SQL-Abfrage: " . $conn->error);
    }
    
    $stmt->bind_param("i", $auditId);
    $stmt->execute();
    
    $result = $stmt->get_result();
    $audit = $result->fetch_assoc();
    
    if (!$audit) {
        $stmt->close();
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Audit nicht gefunden'
        ]);
        exit();
    }
    
    $stmt->close();
    
    // Konvertiere Decimal zu Float
    if ($audit['Gesamtscore'] !== null) {
        $audit['Gesamtscore'] = floatval($audit['Gesamtscore']);
    }
    
    // Parse JSON wenn nötig
    if ($audit['P5_Response_JSON'] && is_string($audit['P5_Response_JSON'])) {
        $audit['P5_Response_JSON'] = json_decode($audit['P5_Response_JSON'], true);
    }
    
    // Detailbewertungen abrufen
    $sqlDetails = "SELECT 
                    DetailID,
                    Kategorie,
                    Score,
                    Begruendung
                  FROM QualitaetsAudit_Detailbewertungen
                  WHERE FK_AuditID = ?
                  ORDER BY DetailID";
    
    $stmtDetails = $conn->prepare($sqlDetails);
    if (!$stmtDetails) {
        throw new Exception("Fehler beim Abrufen der Detailbewertungen: " . $conn->error);
    }
    
    $stmtDetails->bind_param("i", $auditId);
    $stmtDetails->execute();
    
    $resultDetails = $stmtDetails->get_result();
    $details = [];
    
    while ($row = $resultDetails->fetch_assoc()) {
        $details[] = $row;
    }
    
    $stmtDetails->close();
    
    // Füge Details zum Audit-Array hinzu
    $audit['details'] = $details;
    
    // Erfolgreiche Antwort
    echo json_encode([
        'success' => true,
        'audit' => $audit
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Fehler beim Abrufen der Audit-Details: ' . $e->getMessage()
    ]);
}

$conn->close();
?>