<?php
include_once("config.php");
// connect to the database
$mysqli = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE);
//fetch the last inserted record
$query = "SELECT id,endTime FROM ticket WHERE expire>now() ORDER BY id ASC ";
$result = $mysqli->query($query);
$id = -1;
$numRows = 0;
$remainingSeconds = 0;
if ($result->num_rows > 0) {
    $numRows = $result->num_rows;
//    while ($row = $result->fetch_assoc()) {
    $row = $result->fetch_assoc();
    $id = $row['id'];
    $endTime = $row['endTime'];
    if($endTime!=null) {
        $strtotime = strtotime($endTime);
        $remainingSeconds = ($strtotime - time());
    }
//    }
}
$result->close();
$mysqli->close();
$response = array(
    'servingId' => $id,
    'remainingSeconds' => $remainingSeconds,
    'queueSize' => $numRows
);
$json_encode = json_encode($response);
echo $json_encode;
?>