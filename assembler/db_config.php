<?php
// --- Datenbankverbindungsparameter ---
// BITTE ERSETZEN SIE DIESE DURCH IHRE TATSÄCHLICHEN DATEN
$db_host = "rdbms.strato.de"; 			// Oder Ihr spezifischer Host z.B. von Strato
$db_user = "dbu3688470";      			// Ihr Datenbank-Benutzername
$db_pass = "TggZ73-677Gt-nHq#G-]%J??";          // Ihr Datenbank-Passwort
$db_name = "dbs14283741"; 			// Der Name Ihrer Datenbank

// --- Datenbankverbindung herstellen (MySQLi) ---
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
?>