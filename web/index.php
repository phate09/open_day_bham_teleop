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
        <img id="stream" src="resources/stream-not-available.png" border="1px"/>
        <div id="nav"></div>
    </div>
    <div class="ui one column center aligned centered grid">
        <div class="column" id="clockContainer">
            <h1 class="ui center aligned header">
                <div class="sub header">Time to the next person</div>
            </h1>
            <div class="countdown-clock flip-clock-wrapper" style="width: 310px"></div>
        </div>
    </div>
    <div class="ui one column center aligned grid">

    </div>


</div>
</div>
</body>
</html>
