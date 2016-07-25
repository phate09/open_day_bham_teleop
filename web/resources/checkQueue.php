<?php
include_once("config.php");
// connect to the database
$mysqli = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE);
//fetch the last inserted record
$query = "SELECT id FROM ticket WHERE expire>now() ORDER BY id ASC ";
$result = $mysqli->query($query);
$id = -1;
$numRows = -1;
if ($result->num_rows > 0) {
    $numRows = $result->num_rows;
//    while ($row = $result->fetch_assoc()) {
    $row = $result->fetch_assoc();
    $id = $row['id'];
//    }
}
$result->close();
$mysqli->close();
$response = array(
    'servingId' => $id,
    'queueSize' => $numRows
);
$json_encode = json_encode($response);
echo $json_encode;
?>