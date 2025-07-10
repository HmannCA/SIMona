<?php
// load_analysis.php - Lädt eine komplette Analyse (P1-P4 Daten) aus der Datenbank
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
        'message' => 'Datenbankverbindung fehlgeschlagen'
    ]);
    exit();
}

// Einheit-ID aus GET-Parameter
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
    $analysisData = [];
    
    // 1. SimulationsEinheit Metadaten (P1) laden
    $sql1 = "SELECT * FROM SimulationsEinheiten WHERE Einheit_ID = ?";
    $stmt1 = $conn->prepare($sql1);
    $stmt1->bind_param("s", $einheitId);
    $stmt1->execute();
    $result1 = $stmt1->get_result();
    $p1Data = $result1->fetch_assoc();
    $stmt1->close();
    
    if (!$p1Data) {
        throw new Exception("SimulationsEinheit nicht gefunden: " . $einheitId);
    }
    
    // P1 Daten strukturieren
    $analysisData['p1'] = [
        'Gesetz' => $p1Data['Gesetz'],
        'Paragraph' => $p1Data['Paragraph'],
        'Absatz' => $p1Data['Absatz'],
        'Satz' => $p1Data['Satz'],
        'Kurzbeschreibung' => $p1Data['Kurzbeschreibung'],
        'Gesetzestext_Zitat_Analysierter_Teil' => $p1Data['Gesetzestext_Zitat'],
        'Art_Rechtsfolge_Positiv_Typ' => $p1Data['Art_Rechtsfolge_Positiv_Typ'],
        'Ermessensleitlinien_Text' => $p1Data['Ermessensleitlinien_Text'],
        'Gesetz_Vollstaendiger_Name' => $p1Data['Gesetz_Vollname'],
        'Paragraf_Uebergreifende_Kurzbeschreibung' => $p1Data['Paragraf_Gesamtbeschreibung'],
        'Gesetz_Aktueller_Stand_Datum' => $p1Data['Gesetz_Aktueller_Stand'],
        'Paragraph_Offizielle_Bezeichnung' => $p1Data['Paragraph_Offizielle_Bezeichnung']
    ];
    
    // Entscheidungsart nachschlagen
    if ($p1Data['FK_Entscheidungsart_ID']) {
        $sqlEnt = "SELECT Bezeichnung FROM Entscheidungsarten_Lookup WHERE Entscheidungsart_ID = ?";
        $stmtEnt = $conn->prepare($sqlEnt);
        $stmtEnt->bind_param("i", $p1Data['FK_Entscheidungsart_ID']);
        $stmtEnt->execute();
        $resultEnt = $stmtEnt->get_result();
        $entData = $resultEnt->fetch_assoc();
        if ($entData) {
            $analysisData['p1']['FK_Entscheidungsart_ID_Lookup_Bezeichnung'] = $entData['Bezeichnung'];
        }
        $stmtEnt->close();
    }
    
    // 2. Parameter (P2) laden
    $sql2 = "SELECT * FROM Parameter WHERE FK_Einheit_ID = ? ORDER BY Reihenfolge_Anzeige";
    $stmt2 = $conn->prepare($sql2);
    $stmt2->bind_param("s", $einheitId);
    $stmt2->execute();
    $result2 = $stmt2->get_result();
    
    $p2Data = [];
    while ($param = $result2->fetch_assoc()) {
        $paramData = [
            'Parameter_ID' => $param['Parameter_ID'],
            'Reihenfolge_Anzeige' => intval($param['Reihenfolge_Anzeige']),
            'Fragetext' => $param['Fragetext'],
            'Antworttyp' => $param['Antworttyp'],
            'Begleittext' => $param['Begleittext'],
            'Normbezug_Detail_Parameter' => $param['Normbezug_Detail_Parameter'],
            'Verweis_Normen_Info_Parameter' => $param['Verweis_Normen_Info_Parameter'],
            'FK_Verlinkte_SimulationsEinheit_ID_Platzhalter' => $param['FK_Verlinkte_SimulationsEinheit_ID'],
            'Ist_Grundvoraussetzung' => $param['IstGrundvoraussetzung'] == 1,
            'Text_Erfuellt_Pro' => $param['Text_Erfuellt_Pro'],
            'Text_NichtErfuellt_Contra' => $param['Text_NichtErfuellt_Contra']
        ];
        
        // JSON-Felder parsen
        if ($param['AnzeigeBedingungJSON']) {
            $paramData['Anzeige_Bedingung'] = json_decode($param['AnzeigeBedingungJSON'], true) ?: [];
        } else {
            $paramData['Anzeige_Bedingung'] = [];
        }
        
        if ($param['KonklusiveAntwortenInfoJSON']) {
            $paramData['Konklusive_Antworten_Info'] = json_decode($param['KonklusiveAntwortenInfoJSON'], true) ?: [];
        } else {
            $paramData['Konklusive_Antworten_Info'] = [];
        }
        
        // Antwortoptionen laden
        $sqlOpt = "SELECT * FROM Parameter_Antwortoptionen WHERE FK_Parameter_ID = ? ORDER BY Reihenfolge";
        $stmtOpt = $conn->prepare($sqlOpt);
        $stmtOpt->bind_param("s", $param['Parameter_ID']);
        $stmtOpt->execute();
        $resultOpt = $stmtOpt->get_result();
        
        $optionen = [];
        while ($opt = $resultOpt->fetch_assoc()) {
            $optionen[] = [
                'Option_Text' => $opt['Option_Text'],
                'Option_Wert_Intern' => $opt['Option_Wert_Intern'],
                'Reihenfolge_Option' => intval($opt['Reihenfolge'])
            ];
        }
        $paramData['Antwortoptionen_bei_Auswahl'] = $optionen;
        $stmtOpt->close();
        
        $p2Data[] = $paramData;
    }
    $stmt2->close();
    $analysisData['p2'] = $p2Data;
    
    // 3. Regeln (P3) laden
    $sql3 = "SELECT r.*, rb.FK_Parameter_ID, rb.Operator, rb.Erwarteter_Wert_Intern 
             FROM Regeln r
             LEFT JOIN RegelBedingungen rb ON r.Regel_ID = rb.FK_Regel_ID
             WHERE r.FK_Regelwerk_ID = ?
             ORDER BY r.Prioritaet, r.Regel_ID, rb.Bedingung_ID";
    
    $stmt3 = $conn->prepare($sql3);
    $stmt3->bind_param("s", $einheitId);
    $stmt3->execute();
    $result3 = $stmt3->get_result();
    
    $regelnTemp = [];
    while ($row = $result3->fetch_assoc()) {
        $regelId = $row['Regel_ID'];
        
        if (!isset($regelnTemp[$regelId])) {
            $regelnTemp[$regelId] = [
                'Regel_Name' => $row['Regel_Name'],
                'Prioritaet' => intval($row['Prioritaet']),
                'FK_ErgebnisProfil_ID_Referenz' => $row['FK_ErgebnisProfil_ID_Referenz'],
                'Bedingungen_fuer_Regel' => []
            ];
        }
        
        if ($row['FK_Parameter_ID']) {
            $regelnTemp[$regelId]['Bedingungen_fuer_Regel'][] = [
                'FK_Parameter_ID' => $row['FK_Parameter_ID'],
                'Operator' => $row['Operator'],
                'Erwarteter_Wert_Intern' => $row['Erwarteter_Wert_Intern']
            ];
        }
    }
    $stmt3->close();
    $analysisData['p3'] = array_values($regelnTemp);
    
    // 4. ErgebnisProfile (P4) laden
    $sql4 = "SELECT * FROM ErgebnisProfile WHERE FK_Einheit_ID = ?";
    $stmt4 = $conn->prepare($sql4);
    $stmt4->bind_param("s", $einheitId);
    $stmt4->execute();
    $result4 = $stmt4->get_result();
    
    $p4Data = [];
    while ($profil = $result4->fetch_assoc()) {
        $profilData = [
            'ErgebnisProfil_ID_Referenz' => $profil['ErgebnisProfil_ID_Referenz'],
            'Profil_Name' => $profil['Profil_Name'],
            'Entscheidungstext_Kurz_Vorlage' => $profil['Entscheidungstext_Kurz_Vorlage'],
            'Art_der_Entscheidung_Anzeige_Text' => $profil['Art_der_Entscheidung_Anzeige_Text'],
            'Einleitungstext_Begruendung_Vorlage' => $profil['Einleitungstext_Begruendung_Vorlage'],
            'Spezifischer_Ergaenzungstext_Begruendung_Vorlage' => $profil['Spezifischer_Ergaenzungstext_Begruendung_Vorlage'],
            'Abschlusstext_Begruendung_Vorlage' => $profil['Abschlusstext_Begruendung_Vorlage']
        ];
        
        // JSON-Feld parsen
        if ($profil['Begruendung_Dynamische_Parameter_Liste']) {
            $profilData['Begruendung_Dynamische_Parameter_Liste'] = json_decode($profil['Begruendung_Dynamische_Parameter_Liste'], true) ?: [];
        } else {
            $profilData['Begruendung_Dynamische_Parameter_Liste'] = [];
        }
        
        $p4Data[] = $profilData;
    }
    $stmt4->close();
    $analysisData['p4'] = $p4Data;
    
    // 5. Zusätzliche Metadaten
    $analysisData['meta'] = [
        'einheit_id' => $einheitId,
        'prompt_version' => $p1Data['Prompt_Version'] ?? 'v1',
        'simona_version' => $p1Data['Version_SimONA'],
        'created_date' => $p1Data['Letzte_Aenderung_SimONA_Datum'],
        'parameter_count' => count($p2Data),
        'rules_count' => count($analysisData['p3']),
        'profiles_count' => count($p4Data)
    ];
    
    // Erfolgreiche Antwort
    echo json_encode([
        'success' => true,
        'analysis' => $analysisData,
        'message' => 'Analyse erfolgreich geladen'
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Fehler beim Laden der Analyse: ' . $e->getMessage()
    ]);
}

$conn->close();
?>