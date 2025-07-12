<?php
// execute_sql.php - Führt die generierten SQL-Befehle aus
// Version: 2.6 - Mit verbessertem Command-Whitelisting-Sicherheitscheck

header('Content-Type: application/json; charset=utf-8');

// Fehlerbehandlung
ini_set('display_errors', 0); // Im Produktivbetrieb Fehler nicht anzeigen
error_reporting(E_ALL);

require 'db_config.php';

// Datenbankverbindung prüfen
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Datenbankverbindung fehlgeschlagen']);
    exit();
}

// POST-Daten empfangen
$postData = json_decode(file_get_contents('php://input'), true);

if (!$postData || !isset($postData['sql'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Keine SQL-Befehle empfangen']);
    exit();
}

$sqlCommands = $postData['sql'];
$einheitId = $postData['einheitId'] ?? 'Unbekannt';

// =================================================================
// === NEUER, VERBESSERTER SICHERHEITSCHECK (COMMAND WHITELISTING) ===
// =================================================================

// 1. Liste der explizit erlaubten SQL-Befehle am Anfang eines Statements
$allowedCommands = ['INSERT', 'UPDATE', 'SET', 'START', 'COMMIT', 'ROLLBACK'];

// 2. Zerlege den SQL-String in einzelne Befehle (an jedem Semikolon)
$commands = explode(';', $sqlCommands);
$allCommandsAreSafe = true;

foreach ($commands as $command) {
    $trimmedCommand = trim($command);
    if (empty($trimmedCommand)) {
        continue; // Leere Befehle (z.B. nach dem letzten Semikolon) ignorieren
    }
    
    // 3. Extrahiere das erste Wort des Befehls (Groß-/Kleinschreibung wird ignoriert)
    // strtok() ist robust gegen verschiedene Leerzeichen am Anfang
    $firstWord = strtoupper(strtok($trimmedCommand, " \t\r\n("));
    
    // 4. Prüfe, ob das erste Wort in der Whitelist ist
    if (!in_array($firstWord, $allowedCommands)) {
        $allCommandsAreSafe = false;
        // Logge den problematischen Befehl für die Fehlersuche
        error_log("SimONA Security: Unerlaubter Befehl '$firstWord' in SQL für Einheit '$einheitId' blockiert.");
        break; // Schleife abbrechen, ein Fehler reicht
    }
}

if (!$allCommandsAreSafe) {
    http_response_code(403); // Forbidden
    echo json_encode([
        'success' => false, 
        'message' => 'Unerlaubter SQL-Befehlstyp erkannt. Ausführung wurde aus Sicherheitsgründen verweigert.'
    ]);
    exit();
}

// =================================================================
// === ENDE DES NEUEN SICHERHEITSCHECKS ===
// =================================================================


try {
    // Multi-Query ausführen
    if ($conn->multi_query($sqlCommands)) {
        $affectedRows = 0;
        
        do {
            // Betroffene Zeilen zählen
            if ($conn->affected_rows > -1) { // Nur bei echten DML-Statements
                $affectedRows += $conn->affected_rows;
            }
            // Eventuelle Ergebnis-Sets verwerfen, die von `SET` kommen könnten
            if ($result = $conn->store_result()) {
                $result->free();
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
    // Bei Fehlern in der Transaktion wird von der DB automatisch ein Rollback durchgeführt
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Fehler beim Ausführen der SQL-Befehle: ' . $e->getMessage(),
        'error' => $e->getMessage()
    ]);
}

$conn->close();
?>