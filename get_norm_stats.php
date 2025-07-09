<?php
// get_norm_stats.php

header('Content-Type: application/json; charset=utf-8');
require 'db_config.php';

// --- Parameter aus GET-Request holen und validieren ---
if (!isset($_GET['gesetz']) || !isset($_GET['paragraph'])) {
    http_response_code(400);
    echo json_encode(['error' => "Parameter 'gesetz' und 'paragraph' sind erforderlich."]);
    exit();
}

$gesetz = $conn->real_escape_string($_GET['gesetz']);
$paragraph = $conn->real_escape_string($_GET['paragraph']);

// --- Datenstruktur für die JSON-Antwort ---
$statsData = [
    'anzahl_einheiten' => 0,
    'anzahl_parameter' => 0,
    'anzahl_regeln' => 0,
    'anzahl_ergebnisprofile' => 0,
];

try {
    // 1. Anzahl der Simulationseinheiten (Absätze etc.) für diesen Paragraphen
    $sqlEinheiten = "SELECT COUNT(*) AS count FROM SimulationsEinheiten WHERE Gesetz = '$gesetz' AND Paragraph = '$paragraph'";
    $result = $conn->query($sqlEinheiten);
    if ($result) {
        $statsData['anzahl_einheiten'] = (int) $result->fetch_assoc()['count'];
    }

    // 2. Anzahl der zugehörigen Parameter
    $sqlParameter = "SELECT COUNT(*) AS count FROM Parameter WHERE FK_Einheit_ID IN (SELECT Einheit_ID FROM SimulationsEinheiten WHERE Gesetz = '$gesetz' AND Paragraph = '$paragraph')";
    $result = $conn->query($sqlParameter);
    if ($result) {
        $statsData['anzahl_parameter'] = (int) $result->fetch_assoc()['count'];
    }

    // 3. Anzahl der zugehörigen Ergebnisprofile
    $sqlErgebnisProfile = "SELECT COUNT(*) AS count FROM ErgebnisProfile WHERE FK_Einheit_ID IN (SELECT Einheit_ID FROM SimulationsEinheiten WHERE Gesetz = '$gesetz' AND Paragraph = '$paragraph')";
    $result = $conn->query($sqlErgebnisProfile);
    if ($result) {
        $statsData['anzahl_ergebnisprofile'] = (int) $result->fetch_assoc()['count'];
    }
    
    // 4. Anzahl der zugehörigen Regeln
    // Regelwerk_ID wird aus den Einheit_IDs abgeleitet (Annahme: sie sind oft identisch oder über FK_Einheit_ID verknüpft)
    $sqlRegeln = "SELECT COUNT(*) AS count FROM Regeln WHERE FK_Regelwerk_ID IN (SELECT Regelwerk_ID FROM Regelwerke WHERE FK_Einheit_ID IN (SELECT Einheit_ID FROM SimulationsEinheiten WHERE Gesetz = '$gesetz' AND Paragraph = '$paragraph'))";
    $result = $conn->query($sqlRegeln);
    if ($result) {
        $statsData['anzahl_regeln'] = (int) $result->fetch_assoc()['count'];
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => "Ein Fehler bei der Datenbankabfrage ist aufgetreten: " . $e->getMessage()]);
    $conn->close();
    exit();
}

// --- JSON-Ausgabe ---
echo json_encode($statsData, JSON_PRETTY_PRINT);

// --- Verbindung schließen ---
$conn->close();

?>