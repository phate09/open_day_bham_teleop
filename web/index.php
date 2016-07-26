<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8"/>

    <script type="text/javascript" src="http://cdn.robotwebtools.org/EaselJS/current/easeljs.min.js"></script>
    <script type="text/javascript"
            src="http://cdn.robotwebtools.org/EventEmitter2/current/eventemitter2.min.js"></script>
    <script type="text/javascript" src="http://cdn.robotwebtools.org/roslibjs/current/roslib.min.js"></script>
    <script type="text/javascript" src="http://cdn.robotwebtools.org/ros2djs/current/ros2d.min.js"></script>
    <script type="text/javascript" src="http://cdn.robotwebtools.org/nav2djs/current/nav2d.min.js"></script>
    <script type="text/javascript" src="http://cdn.robotwebtools.org/mjpegcanvasjs/current/mjpegcanvas.min.js"></script>
    <script type="text/javascript" src="resources/jquery-3.1.0.min.js"></script>
    <link rel="stylesheet" href="resources/flipclock.css">
    <link rel="stylesheet" href="resources/mostBig.css">
    <link rel="stylesheet" href="resources/mostSmall.css">
    <link rel="stylesheet" href="resources/main.css">
    <script src="resources/flipclock.min.js"></script>
    <script type="text/javascript" src="resources/main.js"></script>
</head>
<body onload="init()" style="background-color: rgb(238,238,238)">
<div id="__blaze-root">
    <div class="ui main container">
        <h1 class="ui center aligned header">
            Robot driven tour of the School of Computer Science
            <div class="sub header">One visitor at a time</div>
        </h1>
        <div class="ui one column center aligned grid">
            <?php //check if the stream is available
            $src = "http://86.31.216.84:8080/stream?topic=/head_xtion/rgb/image_mono";
            $handle = fopen($src, "r");
            if ($handle == false) { //stream not available
                $src = "resources/stream-not-available.png";
            }
            ?>
            <img id="stream" src="<?php echo $src ?>"/>
            <?php if ($handle == true) {  //true - checks if the stream is available?>
                <div id="nav"></div>
            <?php } ?>
        </div>
        <div class="ui one column center aligned centered grid">
            <?php if ($handle == $handle) { //true - checks if the stream is available?>
            <div class="column" id="clockContainer">
                <h1 class="ui center aligned header">
                    <div class="sub header">Time to the next person</div>
                </h1>
                <div class="countdown-clock flip-clock-wrapper" style="width: 310px"></div>
            </div>
            <?php } ?>
        </div>
        <div class="ui one column center aligned grid">
            <div id="yourNumber"></div>
            <button id="getTicket" class="ui primary button" onclick="requestTicket()">Get a ticket</button>
            <div id="queueSize">0 people in queue</div>
        </div>


    </div>
</div>
</body>
</html>
