<?php
//adds 5 seconds to expire for the given id
include_once("config.php");
// connect to the database
$mysqli = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE);
$id = $_GET['id'];
//print("id:".$id);
$date = (new DateTime())->add(DateInterval::createFromDateString('10 seconds'))->format('Y-m-d H:i:s');
//fetch the last inserted record
$query = "UPDATE ticket set expire='$date' WHERE id=$id and ( now()<endTime or endTime is NULL )";
$result = $mysqli->query($query);
$json_encode = json_encode($result);
echo $json_encode;
?>