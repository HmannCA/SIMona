<?php
// save_audit.php - Speichert P5 Audit-Ergebnis in der Datenbank
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
        'message' => 'Datenbankverbindung fehlgeschlagen: ' . $conn->connect_error
    ]);
    exit();
}

// Daten aus dem POST-Request empfangen
$postData = json_decode(file_get_contents('php://input'), true);

if (!$postData) {
    http_response_code(400);
    echo json_encode([
        'success' => false, 
        'message' => 'Ungültige oder leere Daten empfangen.'
    ]);
    exit();
}

$einheitId = $postData['einheitId'] ?? null;
$promptText = $postData['promptText'] ?? null;
$auditResponse = $postData['auditResponse'] ?? null;

if (!$einheitId || !$auditResponse) {
    http_response_code(400);
    echo json_encode([
        'success' => false, 
        'message' => 'Einheit-ID oder Audit-Antwort fehlt.'
    ]);
    exit();
}

// Validiere Audit-Response als JSON
$auditData = json_decode($auditResponse, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode([
        'success' => false, 
        'message' => 'Die übergebene Audit-Antwort ist kein valides JSON.'
    ]);
    exit();
}

// Extrahiere Daten aus dem Audit-JSON
$gesamtscore = $auditData['Gesamtbewertung']['Score'] ?? null;
$gesamtfazit = $auditData['Gesamtbewertung']['Fazit'] ?? null;
$detailbewertungen = $auditData['Detailbewertungen'] ?? [];

// Transaktion starten
$conn->begin_transaction();

try {
    // 1. Hauptaudit in QualitaetsAudits einfügen
    $stmt1 = $conn->prepare("INSERT INTO QualitaetsAudits (
        FK_Einheit_ID, 
        Gesamtscore, 
        Gesamtfazit, 
        P5_Prompt_Text, 
        P5_Response_JSON
    ) VALUES (?, ?, ?, ?, ?)");
    
    if ($stmt1 === false) {
        throw new Exception("Fehler beim Vorbereiten der SQL-Anweisung für QualitaetsAudits: " . $conn->error);
    }
    
    $stmt1->bind_param("sdsss", 
        $einheitId, 
        $gesamtscore, 
        $gesamtfazit, 
        $promptText, 
        $auditResponse
    );
    
    if (!$stmt1->execute()) {
        throw new Exception("Fehler beim Einfügen in QualitaetsAudits: " . $stmt1->error);
    }
    
    $auditId = $conn->insert_id;
    $stmt1->close();

    // 2. Detailbewertungen in QualitaetsAudit_Detailbewertungen einfügen
    if (count($detailbewertungen) > 0) {
        $stmt2 = $conn->prepare("INSERT INTO QualitaetsAudit_Detailbewertungen (
            FK_AuditID, 
            Kategorie, 
            Score, 
            Begruendung
        ) VALUES (?, ?, ?, ?)");
        
        if ($stmt2 === false) {
            throw new Exception("Fehler beim Vorbereiten der SQL-Anweisung für Detailbewertungen: " . $conn->error);
        }
        
        foreach ($detailbewertungen as $detail) {
            $kategorie = $detail['Kategorie'] ?? 'Unbekannte Kategorie';
            $score = $detail['Score'] ?? null;
            $begruendung = $detail['Begruendung'] ?? null;
            
            $stmt2->bind_param("isis", 
                $auditId, 
                $kategorie, 
                $score, 
                $begruendung
            );
            
            if (!$stmt2->execute()) {
                throw new Exception("Fehler beim Einfügen der Detailbewertung: " . $stmt2->error);
            }
        }
        $stmt2->close();
    }
    
    // Transaktion bestätigen
    $conn->commit();
    
    // Erfolgreiche Antwort mit der neuen Audit-ID
    echo json_encode([
        'success' => true, 
        'message' => 'Audit-Ergebnis erfolgreich gespeichert.',
        'auditId' => $auditId,
        'timestamp' => date('Y-m-d H:i:s')
    ]);

} catch (Exception $e) {
    // Bei Fehler: Transaktion zurückrollen
    $conn->rollback();
    
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Fehler beim Speichern: ' . $e->getMessage()
    ]);
}

$conn->close();
?>