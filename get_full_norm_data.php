<?php
// get_full_norm_data.php
header('Content-Type: application/json; charset=utf-8');
require 'db_config.php';

$einheitId = $_GET['einheit_id'] ?? null;
if (!$einheitId) {
    http_response_code(400);
    echo json_encode(['error' => 'Parameter einheit_id fehlt.']);
    exit;
}

$response = [];

// 1. Daten aus SimulationsEinheiten (entspricht P1-Daten)
$stmt1 = $conn->prepare("SELECT * FROM SimulationsEinheiten WHERE Einheit_ID = ?");
$stmt1->bind_param("s", $einheitId);
$stmt1->execute();
$result1 = $stmt1->get_result();
$response['SimulationsEinheit_Metadaten'] = $result1->fetch_assoc();
$stmt1->close();

// 2. Daten aus Parameter (entspricht P2-Daten)
$stmt2 = $conn->prepare("SELECT * FROM Parameter WHERE FK_Einheit_ID = ? ORDER BY Reihenfolge_Anzeige");
$stmt2->bind_param("s", $einheitId);
$stmt2->execute();
$result2 = $stmt2->get_result();
$parameterListe = [];
$stmtOpt = $conn->prepare("SELECT * FROM Parameter_Antwortoptionen WHERE FK_Parameter_ID = ? ORDER BY Reihenfolge");
while ($param = $result2->fetch_assoc()) {
    if ($param['Antworttyp'] === 'AuswahlEinfach') {
        $param['Antwortoptionen_bei_Auswahl'] = [];
        $stmtOpt->bind_param("s", $param['Parameter_ID']);
        $stmtOpt->execute();
        $resultOpt = $stmtOpt->get_result();
        while ($opt = $resultOpt->fetch_assoc()) {
            $param['Antwortoptionen_bei_Auswahl'][] = $opt;
        }
    }
    $parameterListe[] = $param;
}
$response['Parameter_Liste'] = $parameterListe;
$stmt2->close();
$stmtOpt->close();

// 3. Daten aus Regeln (entspricht P3-Daten)
$stmt3 = $conn->prepare("SELECT * FROM Regeln WHERE FK_Regelwerk_ID = ? ORDER BY Prioritaet"); // Regelwerk_ID = Einheit_ID
$stmt3->bind_param("s", $einheitId);
$stmt3->execute();
$result3 = $stmt3->get_result();
$regelwerk = [];
$stmtBed = $conn->prepare("SELECT * FROM RegelBedingungen WHERE FK_Regel_ID = ?");
while ($regel = $result3->fetch_assoc()) {
    $regel['Bedingungen_fuer_Regel'] = [];
    $stmtBed->bind_param("i", $regel['Regel_ID']);
    $stmtBed->execute();
    $resultBed = $stmtBed->get_result();
    while ($bedingung = $resultBed->fetch_assoc()) {
        $regel['Bedingungen_fuer_Regel'][] = $bedingung;
    }
    $regelwerk[] = $regel;
}
$response['Regelwerk'] = $regelwerk;
$stmt3->close();
$stmtBed->close();

// 4. Daten aus ErgebnisProfile (entspricht P4-Daten)
$stmt4 = $conn->prepare("SELECT * FROM ErgebnisProfile WHERE FK_Einheit_ID = ?");
$stmt4->bind_param("s", $einheitId);
$stmt4->execute();
$result4 = $stmt4->get_result();
$ergebnisProfile = [];
while ($profil = $result4->fetch_assoc()) {
    // Das JSON-Feld muss ggf. dekodiert werden, falls es als String gespeichert ist
    if (isset($profil['Begruendung_Dynamische_Parameter_Liste'])) {
        $profil['Begruendung_Dynamische_Parameter_Liste'] = json_decode($profil['Begruendung_Dynamische_Parameter_Liste']);
    }
    $ergebnisProfile[] = $profil;
}
$response['ErgebnisProfile'] = $ergebnisProfile;
$stmt4->close();


$conn->close();
echo json_encode($response);
?>