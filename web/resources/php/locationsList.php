<?php
include_once("config.php");
// connect to the database
$mysqli = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE);
$query = "SELECT id,name FROM Locations ORDER BY id ASC ";
$result = $mysqli->query($query);
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $name = $row['name'];
        $id = $row['id'];
        echo "<button class='locations' onclick=\"goToLocation($id)\">$name</button>";
    }
}