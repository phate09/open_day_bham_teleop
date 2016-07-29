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
    <!--    <link rel="stylesheet" href="resources/mostBig.css">-->
    <!--    <link rel="stylesheet" href="resources/mostSmall.css">-->
    <link rel="stylesheet" href="resources/main.css">
    <script src="resources/flipclock.min.js"></script>
    <script type="text/javascript" src="resources/main.js"></script>
</head>
<body onload="init()" style="background-color: rgb(238,238,238)">
<div id="__blaze-root">
    <div class="ui main container">
        <div class="header">
            <h1>
                <div class="media">
                <span class="Perardua">
                    <img id="logo" src="images/logo.png"/>
                </span>
                <span class="university">
                    <img id="uni-title" src="images/University.png"/>
                </span>
                <span class="robot">
                    <img id="robotLogo" src="images/Robot.png"/>
                </span>
                </div>
            </h1>
            <h2> Robot driven tour of the School of Computer Science</h2>
            <p> One visitor at a time</p>
        </div>


        <div class="column center">
            <?php //check if the stream is available
            $src = "http://localhost:8080/stream?topic=/head_xtion/rgb/image_mono";
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
        <div class="column center">
            <?php if ($handle == $handle) { //true - checks if the stream is available?>
                <div id="clockContainer">
                    <h1>
                        <div class="subheader">Time to the next person</div>
                    </h1>
                    <div class="countdown-clock flip-clock-wrapper" style="width: 310px"></div>
                </div>
            <?php } ?>
        </div>
        <div class="column center">

            <button id="getTicket" class="ui primary button" onclick="requestTicket()">Get a ticket</button>
            <div id="yourNumber"></div>

            <div id="queueSize">0 people in queue</div>
        </div>


    </div>
</div>
</body>
</html>
