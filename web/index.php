<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8"/>
    <script type="text/javascript" src="resources/javascript/easeljs.min.js"></script>
    <script type="text/javascript" src="resources/javascript/eventemitter2.min.js"></script>
    <script type="text/javascript" src="resources/javascript/roslib.js"></script>
    <script type="text/javascript" src="resources/javascript/ros2d.min.js"></script>
    <script type="text/javascript" src="resources/javascript/nav2d.min.js"></script>
    <script type="text/javascript" src="resources/javascript/mjpegcanvas.min.js"></script>
    <script type="text/javascript" src="resources/javascript/keyboardteleop.min.js"></script>
    <script type="text/javascript" src="resources/javascript/jquery-3.1.0.min.js"></script>
    <script type="text/javascript" src="resources/javascript/underscore-min.js"></script>
    <script type="text/javascript" src="resources/javascript/backbone-min.js"></script>
    <script type="text/javascript" src="resources/javascript/flipclock.min.js"></script>
    <script type="text/javascript" src="resources/javascript/main.js"></script>
    <link rel="stylesheet" href="resources/css/flipclock.css">
    <link rel="stylesheet" href="resources/css/main.css">
</head>
<body onload="init()" style="background-color: rgb(238,238,238)">
<!---->
<div id="__blaze-root">
    <div class="ui main container">
        <div class="header row center">
                    <span class="Perardua">
                        <img id="logo" src="images/logo.png"/>
                    </span>
            <span class="university column center">
                        <img id="uni-title" src="images/University.png"/>
                        <h2> Robot driven tour of the School of Computer Science</h2>
                        <span class="subheader"> One visitor at a time</span>
                    </span>
            <span class="robot">
                        <img id="robotLogo" src="images/Robot.png"/>
                    </span>

        </div>
        <!--        <div class="content-body">-->
        <!--            <div class="column center">-->
        <div class="row center">
            <?php //check if the stream is available
            $serverName = "86.31.216.84";
            $src = "http://" . $serverName . ":8080/stream?topic=/head_xtion/rgb/image_mono";
            $handle = fopen($src, "r");
            if ($handle == false) { //stream not available
                $src = "images/stream-not-available.png";
            }
            ?>
            <img id="stream" src="<?php echo $src ?>"/>
            <?php if ($handle == true) {  //true - checks if the stream is available?>
                <div id="nav" style="height: 562px;"></div>
            <?php } ?>
        </div>

        <div class="row center footer">
            <div class="column center">
                <?php if ($handle == $handle) { //true - checks if the stream is available?>
                    <div id="clockContainer">
                        <div class="subheader">Time to the next person</div>
                        <div class="countdown-clock flip-clock-wrapper" style="width: 310px"></div>
                        <button id="getTicket" class="ui primary button" onclick="requestTicket()">Get a ticket</button>
                        <div id="yourNumber"></div>
                        <div id="queueSize">0 people in queue</div>
                    </div>

                <?php } ?>
            </div>
            <div class="column center instructions">
                <div class="instruction_text">It's your turn</div>
                <img id="traffic_light" src="images/remote_time.png"/>
                <div class="instruction_text">Double click on the map to choose a location.</div>
                <div class="instruction_text">Drag and drop on the map to choose orientation.</div>
                <div class="instruction_text">Use arrow keys to move camera.</div>
                <div class="instruction_text">Use spacebar to reset camera to the original position</div>
            </div>
        </div>
        <!--            </div>-->
        <!--        </div>-->

    </div>
</div>
</body>
</html>
