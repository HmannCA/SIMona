<?php
// get_simona_data.php

header('Content-Type: application/json; charset=utf-8');
error_reporting(E_ALL); // Für Entwicklungszwecke, im Produktivbetrieb ggf. anpassen
ini_set('display_errors', 1); // Für Entwicklungszwecke

require 'db_config.php';

// Verbindung prüfen
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => "Datenbankverbindung fehlgeschlagen: " . $conn->connect_error]);
    exit();
}
$conn->set_charset("utf8mb4");

// --- Einheit_ID aus GET-Parameter holen ---
if (!isset($_GET['einheit_id']) || empty(trim($_GET['einheit_id']))) {
    http_response_code(400);
    echo json_encode(['error' => "Parameter 'einheit_id' fehlt oder ist leer."]);
    exit();
}
$einheit_id = $conn->real_escape_string(trim($_GET['einheit_id'])); // Wichtig: SQL-Injection vorbeugen

// --- Datenstruktur für die JSON-Antwort vorbereiten ---
$responseData = [
    'simulationsEinheit' => null,
    'parameterListe' => [],
    'regelwerk' => [
        'Regelwerk_ID' => null,
        'Beschreibung' => null,
        'regeln' => []
    ],
    'ergebnisProfile' => []
];

// 1. Daten aus `SimulationsEinheiten` abrufen (inkl. Entscheidungsart Bezeichnung)
$sqlSimEinheit = "SELECT se.*, el.Bezeichnung AS Entscheidungsart_Bezeichnung 
                  FROM SimulationsEinheiten se 
                  LEFT JOIN Entscheidungsarten_Lookup el ON se.FK_Entscheidungsart_ID = el.Entscheidungsart_ID
                  WHERE se.Einheit_ID = '$einheit_id'";
$resultSimEinheit = $conn->query($sqlSimEinheit);

if ($resultSimEinheit && $resultSimEinheit->num_rows > 0) {
    $responseData['simulationsEinheit'] = $resultSimEinheit->fetch_assoc();
} else {
    http_response_code(404);
    echo json_encode(['error' => "SimulationsEinheit mit ID '$einheit_id' nicht gefunden."]);
    $conn->close();
    exit();
}

// 2. Daten aus `Parameter` und `Parameter_Antwortoptionen` abrufen
$sqlParameter = "SELECT * FROM Parameter WHERE FK_Einheit_ID = '$einheit_id' ORDER BY Reihenfolge_Anzeige ASC";
$resultParameter = $conn->query($sqlParameter);

if ($resultParameter) {
    while ($param = $resultParameter->fetch_assoc()) {
        if ($param['Antworttyp'] === 'AuswahlEinfach') {
            $param['Antwortoptionen_bei_Auswahl'] = [];
            $sqlOptionen = "SELECT Option_Text, Option_Wert_Intern, Reihenfolge 
                            FROM Parameter_Antwortoptionen 
                            WHERE FK_Parameter_ID = '" . $conn->real_escape_string($param['Parameter_ID']) . "' 
                            ORDER BY Reihenfolge ASC";
            $resultOptionen = $conn->query($sqlOptionen);
            if ($resultOptionen) {
                while ($opt = $resultOptionen->fetch_assoc()) {
                    // Konvertiere Reihenfolge zu Integer, falls es als String kommt
                    $opt['Reihenfolge_Option'] = isset($opt['Reihenfolge']) ? intval($opt['Reihenfolge']) : null; 
                    unset($opt['Reihenfolge']); // Umbenennen für Konsistenz mit JS-Erwartung
                    $param['Antwortoptionen_bei_Auswahl'][] = $opt;
                }
                $resultOptionen->free();
            }
        } else {
            $param['Antwortoptionen_bei_Auswahl'] = null; // Oder leeres Array [], je nach JS-Erwartung
        }
        // Konvertiere Reihenfolge_Anzeige zu Integer
        $param['Reihenfolge_Anzeige'] = isset($param['Reihenfolge_Anzeige']) ? intval($param['Reihenfolge_Anzeige']) : null;
        $responseData['parameterListe'][] = $param;
    }
    $resultParameter->free();
}


// 3. Daten für `Regelwerke`, `Regeln` und `RegelBedingungen` abrufen
// Annahme: Regelwerk_ID ist gleich Einheit_ID oder es gibt eine 1:1 Beziehung über FK_Einheit_ID
$sqlRegelwerk = "SELECT Regelwerk_ID, Beschreibung FROM Regelwerke WHERE FK_Einheit_ID = '$einheit_id'"; 
// Wenn Regelwerk_ID = Einheit_ID ist, dann: $sqlRegelwerk = "SELECT Regelwerk_ID, Beschreibung FROM Regelwerke WHERE Regelwerk_ID = '$einheit_id'";

$resultRegelwerk = $conn->query($sqlRegelwerk);
if ($resultRegelwerk && $resultRegelwerk->num_rows > 0) {
    $regelwerkData = $resultRegelwerk->fetch_assoc();
    $responseData['regelwerk']['Regelwerk_ID'] = $regelwerkData['Regelwerk_ID'];
    $responseData['regelwerk']['Beschreibung'] = $regelwerkData['Beschreibung'];
    $fk_regelwerk_id = $conn->real_escape_string($regelwerkData['Regelwerk_ID']);

    $sqlRegeln = "SELECT Regel_ID, Regel_Name, Prioritaet, FK_ErgebnisProfil_ID_Referenz 
                  FROM Regeln 
                  WHERE FK_Regelwerk_ID = '$fk_regelwerk_id' 
                  ORDER BY Prioritaet ASC";
    $resultRegeln = $conn->query($sqlRegeln);

    if ($resultRegeln) {
        while ($regel = $resultRegeln->fetch_assoc()) {
            $regel['Bedingungen_fuer_Regel'] = [];
            $sqlBedingungen = "SELECT FK_Parameter_ID, Operator, Erwarteter_Wert_Intern 
                               FROM RegelBedingungen 
                               WHERE FK_Regel_ID = " . intval($regel['Regel_ID']); // Regel_ID ist INT
            $resultBedingungen = $conn->query($sqlBedingungen);
            if ($resultBedingungen) {
                while ($bedingung = $resultBedingungen->fetch_assoc()) {
                    // Konvertiere Erwarteter_Wert_Intern ggf. zu Boolean, wenn Operator IST_WAHR/FALSCH
                    if ($bedingung['Operator'] === 'IST_WAHR') {
                        $bedingung['Erwarteter_Wert_Intern'] = true;
                    } else if ($bedingung['Operator'] === 'IST_FALSCH') {
                        $bedingung['Erwarteter_Wert_Intern'] = false;
                    }
                    $regel['Bedingungen_fuer_Regel'][] = $bedingung;
                }
                $resultBedingungen->free();
            }
             // Konvertiere Prioritaet zu Integer
            $regel['Prioritaet'] = isset($regel['Prioritaet']) ? intval($regel['Prioritaet']) : null;
            $responseData['regelwerk']['regeln'][] = $regel;
        }
        $resultRegeln->free();
    }
    $resultRegelwerk->free();
}


// 4. Daten für `ErgebnisProfile` abrufen
// Wir laden alle ErgebnisProfile, die zu dieser Einheit_ID gehören.
// Alternativ: Nur die, die in den Regeln auch verwendet werden (FK_ErgebnisProfil_ID_Referenz aus $responseData['regelwerk']['regeln'])
$sqlErgebnisProfile = "SELECT * FROM ErgebnisProfile WHERE FK_Einheit_ID = '$einheit_id'";
$resultErgebnisProfile = $conn->query($sqlErgebnisProfile);

if ($resultErgebnisProfile) {
    while ($profil = $resultErgebnisProfile->fetch_assoc()) {
        // Begruendung_Dynamische_Parameter_Liste ist als JSON-String in der DB gespeichert
        if (isset($profil['Begruendung_Dynamische_Parameter_Liste'])) {
            $decodedList = json_decode($profil['Begruendung_Dynamische_Parameter_Liste'], true);
            // Nur wenn das Dekodieren erfolgreich war und es ein Array ist, sonst null oder Originalwert lassen
            $profil['Begruendung_Dynamische_Parameter_Liste'] = (json_last_error() === JSON_ERROR_NONE && is_array($decodedList)) ? $decodedList : null;
        } else {
            $profil['Begruendung_Dynamische_Parameter_Liste'] = null;
        }
        $responseData['ergebnisProfile'][] = $profil;
    }
    $resultErgebnisProfile->free();
}


// --- JSON-Ausgabe ---
echo json_encode($responseData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

// --- Verbindung schließen ---
$conn->close();

?>