<?php
// get_paragraphen.php
header('Content-Type: application/json; charset=utf-8');
require 'db_config.php';

$paragraphen = [];
if (isset($_GET['gesetz'])) {
    $gewaehltesGesetz = $conn->real_escape_string($_GET['gesetz']);
    // Annahme: Paragraphen sind als Zahlen oder einfache Strings gespeichert und können numerisch sortiert werden.
    // Ggf. anpassen, falls Paragraphen Buchstaben enthalten (z.B. '32a')
    $sql = "SELECT DISTINCT Paragraph FROM SimulationsEinheiten WHERE Gesetz = '$gewaehltesGesetz' ORDER BY CAST(Paragraph AS UNSIGNED), Paragraph ASC";
    // Für komplexere Paragraphennummern (z.B. mit Buchstaben) könnte eine natürlichere Sortierung nötig sein oder einfach alphabetisch: ORDER BY Paragraph ASC

    $result = $conn->query($sql);
    if ($result && $result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $paragraphen[] = $row['Paragraph'];
        }
    }
}
$conn->close();
echo json_encode($paragraphen);
?>