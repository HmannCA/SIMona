<?php
// get_einheiten_fuer_norm.php

header('Content-Type: application/json; charset=utf-8');
require 'db_config.php';

$einheiten = [];

if (isset($_GET['gesetz']) && isset($_GET['paragraph'])) {
    $gewaehltesGesetz = $conn->real_escape_string($_GET['gesetz']);
    $gewaehlterParagraph = $conn->real_escape_string($_GET['paragraph']);

    // === HIER IST DIE WICHTIGE ÄNDERUNG ===
    // Die SQL-Abfrage wird erweitert, um alle für die Übersicht benötigten Felder zu laden.
    $sql = "SELECT 
                Einheit_ID, 
                Absatz, 
                Satz, 
                Kurzbeschreibung, 
                Gesetzestext_Zitat, 
                Paragraph_Offizielle_Bezeichnung, 
                Paragraf_Gesamtbeschreibung 
            FROM SimulationsEinheiten 
            WHERE Gesetz = '$gewaehltesGesetz' AND Paragraph = '$gewaehlterParagraph' 
            ORDER BY CAST(Absatz AS UNSIGNED), Absatz, CAST(Satz AS UNSIGNED), Satz ASC";
    
    $result = $conn->query($sql);

    if ($result) {
        while($row = $result->fetch_assoc()) {
            $einheiten[] = $row;
        }
    } else {
        // Optional: Fehlerbehandlung, falls die SQL-Abfrage selbst fehlschlägt
        http_response_code(500);
        echo json_encode(['error' => 'Datenbankabfrage für Einheiten fehlgeschlagen: ' . $conn->error]);
        $conn->close();
        exit();
    }
}

$conn->close();

// WICHTIG: Die Rückgabe an das Frontend ist jetzt ein einfaches JSON-Array der Einheiten.
// Die Anpassung, die wir mal für das Debugging hatten ('data' => ..., 'debug_info' => ...), ist hier nicht mehr nötig.
echo json_encode($einheiten);

?>