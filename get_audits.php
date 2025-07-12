<?php
// get_audits.php - VERSION MIT VARIANTEN-UNTERSTÜTZUNG

header('Content-Type: application/json; charset=utf-8');
require 'db_config.php';

// Parameter holen und für LIKE vorbereiten
$einheitId_basis = $_GET['einheit_id'] ?? null;
if (!$einheitId_basis) {
    http_response_code(400);
    echo json_encode(['error' => 'Parameter einheit_id fehlt.']);
    exit;
}
$suchmuster = trim($einheitId_basis) . "%"; // Fügt das Wildcard-Zeichen hinzu

$audits = [];
$conn->set_charset("utf8mb4");

// Die Abfrage nutzt LIKE, um alle Varianten zu finden (z.B. SE_AufenthG_27_Abs1%)
$sqlKopf = "SELECT AuditID, FK_Einheit_ID, Audit_Timestamp, Gesamtscore, Gesamtfazit, P5_Prompt_Text, P5_Response_JSON FROM QualitaetsAudits WHERE FK_Einheit_ID LIKE ? ORDER BY Audit_Timestamp DESC";
$stmtKopf = $conn->prepare($sqlKopf);

if ($stmtKopf === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Datenbankfehler bei Audit-Abfrage.']);
    exit;
}

$stmtKopf->bind_param("s", $suchmuster);
$stmtKopf->execute();
$resultKopf = $stmtKopf->get_result();

$sqlDetail = "SELECT Kategorie, Score, Begruendung FROM QualitaetsAudit_Detailbewertungen WHERE FK_AuditID = ?";
$stmtDetail = $conn->prepare($sqlDetail);

while ($rowKopf = $resultKopf->fetch_assoc()) {
    $currentAuditId = $rowKopf['AuditID'];
    $rowKopf['Detailbewertungen'] = [];
    
    $stmtDetail->bind_param("i", $currentAuditId);
    $stmtDetail->execute();
    $resultDetail = $stmtDetail->get_result();
    while ($rowDetail = $resultDetail->fetch_assoc()) {
        $rowKopf['Detailbewertungen'][] = $rowDetail;
    }
    
    $audits[] = $rowKopf;
}

$stmtKopf->close();
$stmtDetail->close();
$conn->close();

echo json_encode($audits);
?>