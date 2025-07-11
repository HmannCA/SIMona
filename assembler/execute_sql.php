<?php
// execute_sql.php - Führt die generierten SQL-Befehle aus
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

// Empfange POST-Daten
$postData = json_decode(file_get_contents('php://input'), true);

if (!$postData || !isset($postData['sql'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false, 
        'message' => 'Keine SQL-Befehle empfangen'
    ]);
    exit();
}

$sqlCommands = $postData['sql'];
$einheitId = $postData['einheitId'] ?? 'Unbekannt';

// Sicherheitsprüfung: Nur erlaubte SQL-Befehle
$allowedCommands = ['INSERT', 'UPDATE', 'SET', 'START TRANSACTION', 'COMMIT', 'ROLLBACK'];
$sqlUpper = strtoupper($sqlCommands);

$forbidden = false;
if (strpos($sqlUpper, 'DROP') !== false || 
    strpos($sqlUpper, 'DELETE') !== false || 
    strpos($sqlUpper, 'TRUNCATE') !== false ||
    strpos($sqlUpper, 'ALTER') !== false) {
    $forbidden = true;
}

if ($forbidden) {
    http_response_code(403);
    echo json_encode([
        'success' => false, 
        'message' => 'Nicht erlaubte SQL-Befehle erkannt'
    ]);
    exit();
}

// Log-Datei für Debugging
$logFile = 'sql_execution_log.txt';
$logEntry = date('Y-m-d H:i:s') . " - Einheit: $einheitId\n";
file_put_contents($logFile, $logEntry, FILE_APPEND);

try {
    // Multi-Query ausführen
    if ($conn->multi_query($sqlCommands)) {
        $affectedRows = 0;
        $results = [];
        
        do {
            // Speichere Ergebnis
            if ($result = $conn->store_result()) {
                $result->free();
            }
            
            // Zähle betroffene Zeilen
            if ($conn->affected_rows > 0) {
                $affectedRows += $conn->affected_rows;
            }
            
        } while ($conn->more_results() && $conn->next_result());
        
        // Prüfe auf Fehler im letzten Statement
        if ($conn->errno) {
            throw new Exception($conn->error);
        }
        
        // Erfolg
        echo json_encode([
            'success' => true,
            'message' => 'SQL-Befehle erfolgreich ausgeführt',
            'affectedRows' => $affectedRows,
            'einheitId' => $einheitId,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        
    } else {
        throw new Exception($conn->error);
    }
    
} catch (Exception $e) {
    // Rollback bei Fehler
    $conn->query("ROLLBACK");
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Fehler beim Ausführen der SQL-Befehle: ' . $e->getMessage(),
        'error' => $e->getMessage()
    ]);
}

$conn->close();
?>