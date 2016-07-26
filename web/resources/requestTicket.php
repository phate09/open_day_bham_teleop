<?php
include_once("config.php");
// connect to the database
$mysqli = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE);
//$name = $_GET['name'];
$name = "test";
//insert the new record
$query = "INSERT into ticket (name) VALUES ('$name')";
$result = $mysqli->query($query);
//fetch the last inserted record
$query = "SELECT id FROM ticket ORDER BY id DESC LIMIT 1";
$result = $mysqli->query($query);
$id = -1;
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $id = $row['id'];
    }
}
$result->close();
$mysqli->close();
$response = array(
    'ticketId' => $id
);
$json_encode = json_encode($response);
echo $json_encode;
?>