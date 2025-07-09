<?php
// get_audits.php - Lädt alle Audits für eine SimulationsEinheit
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

// SimulationsEinheit_ID aus GET-Parameter
$einheitId = $_GET['einheitId'] ?? null;

if (!$einheitId) {
    http_response_code(400);
    echo json_encode([
        'success' => false, 
        'message' => 'Keine SimulationsEinheit_ID angegeben'
    ]);
    exit();
}

try {
    // SQL-Query für Audits
    $sql = "SELECT 
                AuditID,
                FK_Einheit_ID,
                Audit_Timestamp,
                Gesamtscore,
                Gesamtfazit
            FROM QualitaetsAudits
            WHERE FK_Einheit_ID = ?
            ORDER BY Audit_Timestamp DESC";
    
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception("Fehler beim Vorbereiten der SQL-Abfrage: " . $conn->error);
    }
    
    $stmt->bind_param("s", $einheitId);
    $stmt->execute();
    
    $result = $stmt->get_result();
    $audits = [];
    
    while ($row = $result->fetch_assoc()) {
        // Konvertiere Decimal zu Float für JSON
        if ($row['Gesamtscore'] !== null) {
            $row['Gesamtscore'] = floatval($row['Gesamtscore']);
        }
        $audits[] = $row;
    }
    
    $stmt->close();
    
    // Erfolgreiche Antwort
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