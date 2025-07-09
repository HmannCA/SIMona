<?php
// get_gesetze.php
header('Content-Type: application/json; charset=utf-8');
require 'db_config.php'; // Annahme: DB-Konfiguration ist ausgelagert

$gesetze = [];
$sql = "SELECT DISTINCT Gesetz FROM SimulationsEinheiten ORDER BY Gesetz ASC";
$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $gesetze[] = $row['Gesetz'];
    }
}
$conn->close();
echo json_encode($gesetze);
?>