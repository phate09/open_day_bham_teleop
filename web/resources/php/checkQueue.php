<?php
include_once("config.php");
// connect to the database
$mysqli = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE);
//fetch the last inserted record
$query = "SELECT id,endTime FROM ticket WHERE expire>now() and (endTime>now() or endTime is NULL )ORDER BY id ASC ";
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
    }else{ //start the control session
        $date = (new DateTime())->add(DateInterval::createFromDateString('10 minutes'))->format('Y-m-d H:i:s');
        $query = "UPDATE ticket set endTime='$date' WHERE id=$id and endTime is NULL ";
        $result = $mysqli->query($query);
        $remainingSeconds=(($date->getTimestamp())-time());
//        $json_encode = json_encode($result);
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