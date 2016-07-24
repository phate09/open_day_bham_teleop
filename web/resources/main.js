/**
 * Created by phate09 on 24/07/16.
 */
/**
 * Setup all GUI elements when the page is loaded.
 */
var src = "http://86.31.216.84:8080/stream?topic=/head_xtion/rgb/image_mono";
function init() {
    "use strict";
    var connectionOK, ros, viewer, clock;
    $.get(src)
        .fail(function () {// Image doesn't exist - do something else.
            connectionOK = false;
            src = "resources/stream-not-available.png";
            $("#stream").attr("src", src);
        })
        .done(function () {// Image exists - load modules
            connectionOK = true;
            $("#stream").attr("src", src);
        });
    connectionOK = true;
    if (connectionOK) {
        // alert(src);
        // Connect to ROS.
        ros = new ROSLIB.Ros({
            url: 'ws://86.31.216.84:9090'
        });

        // Create the main viewer.
        viewer = new ROS2D.Viewer({
            divID: 'nav',
            width: 271,//640,
            height: 480//1131
        });
        // Setup the nav client.
        NAV2D.OccupancyGridClientNav({
            ros: ros,
            rootObject: viewer.scene,
            viewer: viewer,
            serverName: '/move_base',
            withOrientation: true
        });
        clock = $('.countdown-clock').FlipClock({
            autoStart: false,
            countdown: true,
            clockFace: "MinuteCounter"
        });
        clock.setTime(600);
        clock.start();
        $("#clockContainer").innerHTML = "<h1 class=\"ui center aligned header\"> <div class=\"sub header\">Time to the next person</div> </h1>";
    } else {
        $("#stream").attr("src", "resources/stream-not-available.png");
        $("#nav").empty();
        $("#clockContainer").empty();
    }

}