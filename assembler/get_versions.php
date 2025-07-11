<?php
// get_versions.php - Lädt alle Versionen eines Paragraphen aus der Datenbank
// Version: 2.5 - Produktive Version

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

// Parameter aus GET-Request
$gesetz = $_GET['gesetz'] ?? null;
$paragraph = $_GET['paragraph'] ?? null;
$absatz = $_GET['absatz'] ?? null;
$satz = $_GET['satz'] ?? null;

if (!$gesetz || !$paragraph) {
    http_response_code(400);
    echo json_encode([
        'success' => false, 
        'message' => 'Gesetz und Paragraph sind erforderlich'
    ]);
    exit();
}

try {
    // SQL-Query für alle Versionen eines Paragraphen
    $sql = "SELECT 
                se.Einheit_ID,
                se.Prompt_Version,
                se.Kurzbeschreibung,
                se.Paragraph_Offizielle_Bezeichnung,
                se.Letzte_Aenderung_SimONA_Datum as created_date,
                se.Version_SimONA,
                COUNT(DISTINCT p.Parameter_ID) as parameter_count,
                COUNT(DISTINCT r.Regel_ID) as rules_count,
                COUNT(DISTINCT ep.ErgebnisProfil_ID_Referenz) as profiles_count,
                qa.Gesamtscore as quality_score,
                qa.Gesamtfazit as quality_fazit,
                qa.Audit_Timestamp as audit_date
            FROM SimulationsEinheiten se
            LEFT JOIN Parameter p ON se.Einheit_ID = p.FK_Einheit_ID
            LEFT JOIN Regelwerke rw ON se.Einheit_ID = rw.FK_Einheit_ID
            LEFT JOIN Regeln r ON rw.Regelwerk_ID = r.FK_Regelwerk_ID
            LEFT JOIN ErgebnisProfile ep ON se.Einheit_ID = ep.FK_Einheit_ID
            LEFT JOIN (
                SELECT FK_Einheit_ID, Gesamtscore, Gesamtfazit, Audit_Timestamp,
                       ROW_NUMBER() OVER (PARTITION BY FK_Einheit_ID ORDER BY Audit_Timestamp DESC) as rn
                FROM QualitaetsAudits
            ) qa ON se.Einheit_ID = qa.FK_Einheit_ID AND qa.rn = 1
            WHERE UPPER(se.Gesetz) = UPPER(?)
            AND se.Paragraph = ?";
    
    // Parameter für prepared statement
    $params = [$gesetz, $paragraph];
    $types = "ss";
    
    // Optionale Parameter hinzufügen
    if ($absatz) {
        $sql .= " AND se.Absatz = ?";
        $params[] = $absatz;
        $types .= "s";
    }

    if ($satz) {
        $sql .= " AND se.Satz = ?";
        $params[] = $satz;
        $types .= "s";
    }
    
    // Verwende COALESCE um NULL-Werte als 'v1' zu behandeln
    $sql = str_replace(
        "se.Prompt_Version,", 
        "COALESCE(se.Prompt_Version, 'v1') as Prompt_Version,", 
        $sql
    );
    $sql .= " GROUP BY se.Einheit_ID, COALESCE(se.Prompt_Version, 'v1'), se.Kurzbeschreibung, se.Paragraph_Offizielle_Bezeichnung,
                    se.Letzte_Aenderung_SimONA_Datum, se.Version_SimONA,
                    qa.Gesamtscore, qa.Gesamtfazit, qa.Audit_Timestamp 
                ORDER BY se.Paragraph, CAST(se.Absatz AS UNSIGNED), CAST(se.Satz AS UNSIGNED), se.Prompt_Version DESC";
    
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception("Fehler beim Vorbereiten der SQL-Abfrage: " . $conn->error);
    }
    
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    
    $result = $stmt->get_result();
    $versions = [];
    
    while ($row = $result->fetch_assoc()) {
        // Konvertiere Decimals zu Float
        if ($row['quality_score'] !== null) {
            $row['quality_score'] = floatval($row['quality_score']);
        }
        
        // Formatiere Datum
        if ($row['created_date']) {
            $created = date('d.m.Y', strtotime($row['created_date']));
        } else {
            $created = 'Unbekannt';
        }
        
        // Bereinige NULL-Werte
        $row['parameter_count'] = intval($row['parameter_count']);
        $row['rules_count'] = intval($row['rules_count']);
        $row['profiles_count'] = intval($row['profiles_count']);
        
        $versions[] = [
            'id' => $row['Einheit_ID'],
            'promptVersion' => $row['Prompt_Version'] ?? 'v1',
            'created' => $created,
            'parameterCount' => $row['parameter_count'],
            'rulesCount' => $row['rules_count'],
            'profilesCount' => $row['profiles_count'],
            'qualityScore' => $row['quality_score'],
            'qualityFazit' => $row['quality_fazit'],
            'auditDate' => $row['audit_date'] ? date('d.m.Y H:i', strtotime($row['audit_date'])) : null,
            'simonaVersion' => $row['Version_SimONA'],
            'description' => $row['Kurzbeschreibung'],
            'paragraphBezeichnung' => $row['Paragraph_Offizielle_Bezeichnung'] ?? null
        ];
    }
    
    $stmt->close();
    
    // Erfolgreiche Antwort
    echo json_encode([
        'success' => true,
        'versions' => $versions,
        'count' => count($versions),
        'query_info' => [
            'gesetz' => $gesetz,
            'paragraph' => $paragraph,
            'absatz' => $absatz,
            'satz' => $satz
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Fehler beim Abrufen der Versionen: ' . $e->getMessage()
    ]);
}

$conn->close();
?>