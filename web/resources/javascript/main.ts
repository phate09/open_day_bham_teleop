
/// <reference path="typings/index.d.ts" />
declare var ROS2D:any;
declare var NAV2D:any;
var serverAddress = "86.31.216.84";
// var src = "http://" + serverAddress + ":8080/stream?topic=/head_xtion/rgb/image_mono";

function init() {
    "use strict";
    $(".instruction_text").hide();
    initNavigator(false);
    initPTUControl();
    initClock();
    loop();
}

function loop() {
    "use strict";
    checkQueue();
    renewTicket();
    setTimeout(loop, 1000);
}
var ptuGoal, ptuStateListener, rosPTU;
function initPTUControl() {
    "use strict";
    rosPTU = new ROSLIB.Ros({
        url: "ws://" + serverAddress + ":9090"
    });
    // handle the key
    var body = document.getElementsByTagName("body")[0];
    ptuGoal = new ROSLIB.Topic({
        ros: rosPTU, name: "/SetPTUState/goal", messageType: "scitos_ptu/PtuGotoActionGoal"
    });
    ptuStateListener = new ROSLIB.Topic({
        ros: rosPTU, name: "/SetPTUState/result", messageType: "scitos_ptu/PtuGotoActionResult"
    });
    ptuStateListener.subscribe(function (message) {
        current_pan = message.result.state.position[0];
        current_tilt = message.result.state.position[1];
    });
    //limit the amount of times keydown event is called to 1 every 200 millisecs
    body.addEventListener("keydown", _.throttle(function (e) {
        handleKey(e.keyCode, true);
    }, 200, {
        leading: false, trailing: false
    }), false);
}
var tilt = 0;
var pan = 0;
var current_pan = 0, current_tilt = 0;
// sets up a key listener on the page used for keyboard teleoperation
var handleKey = function (keyCode, keyDown) {
    var pub = true;
    // check which key was pressed
    switch (keyCode) {
    case 37:
        // turn left
        pan = current_pan + 5;
        break;
    case 38:
        // up
        tilt = current_tilt - 5;
        break;
    case 39:
        // turn right
        pan = current_pan - 5;
        break;
    case 40:
        // down
        tilt = current_tilt + 5;
        break;
    case 32:
        //spacebar
        pan = 0;
        tilt = 0;
        break;
    default:
        pub = false;
    }

    // publish the command
    if (pub === true) {
        var twist = new ROSLIB.Message({
            header: {
                seq: 1, stamp: new Date().getTime(), frame_id: ""
            }, goal_id: {
                stamp: new Date().getTime(), id: "",
            }, goal: {
                pan: pan, tilt: tilt, pan_vel: 10.0, tilt_vel: 10.0
            }
        });
        if (ros) {

            ptuGoal.publish(twist);
        }
    }
};


var clock;
function initClock() {
    var countdown:any = $(".countdown-clock");
    if (countdown.length) {//if clock exists
        clock = countdown.FlipClock({
            autoStart: true, countdown: true, clockFace: "MinuteCounter"
        });
        clock.setTime(0);
        clock.start();
        $("#clockContainer").text("<h1 class=\"ui center aligned header\"> <div class=\"sub header\">Time to the next person</div> </h1>");
    }
}
var ros;
function initNavigator(flag: boolean) {
    var viewer;
    var nav = $("#nav");
    if (nav.length) {//if nav exists
        if (flag) {
            if (ros == null) {
                // Connect to ROS.
                ros = new ROSLIB.Ros({
                    url: "ws://" + serverAddress + ":9090"
                });

                // Create the main viewer.
                viewer = new ROS2D.Viewer({
                    divID: "nav", width: 318,//640,
                    height: 562//1131
                });
                // Setup the nav client.
                NAV2D.OccupancyGridClientNav({
                    ros: ros, rootObject: viewer.scene, viewer: viewer, serverName: "/move_base", withOrientation: true
                });
                $(".instruction_text").show();
                $("#traffic_light").attr("src", "images/remote_go.png");
            }
        }
        else {
            nav.empty();
            $(".instruction_text").hide();
            $("#traffic_light").attr("src", "images/remote_time.png");
            ros = null;
        }
    }
}
function createXmlHttpRequestObject() {
    "use strict";
    var xmlHttp;
    try {
        xmlHttp = new XMLHttpRequest();
    }
    catch (e) {
        xmlHttp = false;
    }
    if (!xmlHttp) {
        alert("Error creating the XMLHttpRequest object.");
    }
    else {
        return xmlHttp;
    }
}
var currentTicketId = -1;
var checkQueueHttpRequest = createXmlHttpRequestObject();//this object will be used in order to make ajax calls to checkQueue
var requestTicketHttpRequest = createXmlHttpRequestObject();//this object will be used in order to make ajax calls to checkQueue
var renewTicketHttpRequest = createXmlHttpRequestObject();//this object will be used in order to make ajax calls to checkQueue
// var startControlHttpRequest = createXmlHttpRequestObject();//this object will be used in order to make ajax calls to checkQueue

function checkQueue() {
    "use strict";
    //proceed only if the checkQueueHttpRequest object isn't busy
    if (checkQueueHttpRequest.readyState === 4 || checkQueueHttpRequest.readyState === 0) {
        checkQueueHttpRequest.open("GET", "resources/php/checkQueue.php", true);
        checkQueueHttpRequest.onreadystatechange = checkQueueResponse;
        checkQueueHttpRequest.send(null);
    }
    else {
        // if the connection is busy, try again after one second
        setTimeout(checkQueue, 1000);
    }
}
function checkQueueResponse() {
    "use strict";
    if (checkQueueHttpRequest.readyState === 4) {
        //status of 200 indicates the transaction completed succesfully
        if (checkQueueHttpRequest.status === 200) {
            var responseJSON, queueSize, queueMsg;
            //extract the xml
            responseJSON = JSON.parse(checkQueueHttpRequest.responseText);

            //update serving, clock and queue size
            // serving = "Serving id " + responseJSON.servingId;
            if (responseJSON.remainingSeconds > 0 && clock.time != responseJSON.remainingSeconds) {
                clock.setTime(responseJSON.remainingSeconds);
                clock.start();
            }
            queueSize = responseJSON.queueSize - 1;
            if (queueSize < 0) {
                queueSize = 0;
            }
            queueMsg = queueSize + " " + (queueSize == 1 ? "person" : "people") + " in queue";
            var queueSizeElement = $("#queueSize");
            if (queueSizeElement.text() != queueMsg) {
                queueSizeElement.text(queueMsg);
            }
            if (currentTicketId != -1) {
                if (parseInt(responseJSON.servingId) === currentTicketId) {
                    startControlSession();
                }
            }
        }
    }
}

function requestTicket() {
    "use strict";
    //hide the ticket button
    $("#getTicket").hide();
    //proceed only if the checkQueueHttpRequest object isn't busy
    if (requestTicketHttpRequest.readyState === 4 || requestTicketHttpRequest.readyState === 0) {
        var loc = window.location.pathname;
        requestTicketHttpRequest.open("GET", "resources/php/requestTicket.php", true);
        requestTicketHttpRequest.onreadystatechange = requestTicketResponse;
        requestTicketHttpRequest.send(null);
    }
    else {
        // if the connection is busy, try again after one second
        setTimeout(requestTicket, 1000);
    }
}
function requestTicketResponse() {
    "use strict";
    if (requestTicketHttpRequest.readyState === 4) {
        //status of 200 indicates the transaction completed succesfully
        if (requestTicketHttpRequest.status === 200) {
            var responseJSON;
            responseJSON = JSON.parse(requestTicketHttpRequest.responseText);
            currentTicketId = parseInt(responseJSON.ticketId);
            $("#yourNumber").text("You are the number " + currentTicketId);
            checkQueue();
        }
        else {
            alert("There was a problem accessing the server(request): " + requestTicketHttpRequest.statusText);
        }
    }
}
//keeps the current ticket active (in order to remove the user from the queue if it leaves the page)
function renewTicket() {
    "use strict";
    if (currentTicketId != -1) {
        //proceed only if the checkQueueHttpRequest object isn't busy
        if (renewTicketHttpRequest.readyState === 4 || renewTicketHttpRequest.readyState === 0) {
            renewTicketHttpRequest.open("GET", "resources/php/renewTicket.php?id=" + currentTicketId, true);
            renewTicketHttpRequest.onreadystatechange = renewTicketResponse;
            renewTicketHttpRequest.send(null);
        }
        else {
            // if the connection is busy, try again after one second
            setTimeout(renewTicket, 1000);
        }
    }
}
function renewTicketResponse() {
    "use strict";
    if (renewTicketHttpRequest.readyState === 4) {
        //status of 200 indicates the transaction completed succesfully
        if (renewTicketHttpRequest.status === 200) {
            var responseJSON;
            responseJSON = JSON.parse(renewTicketHttpRequest.responseText);
            if (!responseJSON) {
                alert("error");
                //setTimeout(renewTicket, 1000);//renew again after a second
            }
        }
        else {
            //alert("There was a problem accessing the server(renew): " + renewTicketHttpRequest.statusText);
        }
    }
}
function startControlSession() {
    "use strict";
    if (ros == null) {
        clock.stop = function () {
            initNavigator(false);
            clock.stop = null;

        };
    }
    initNavigator(true);
}
