/**
 * Created by phate09 on 24/07/16.
 */
/*jslint latedef:nofunc*/
/**
 * Setup all GUI elements when the page is loaded.
 */
var src = "http://localhost:8080/stream?topic=/head_xtion/rgb/image_mono";

function init() {
    "use strict";

    initNavigator();
    initClock();
    loop();
}

function loop() {
    "use strict"
    checkQueue();
    renewTicket();
    setTimeout(loop, 1000);
}
var clock;
function initClock() {
    if ($(".countdown-clock").length) {//if clock exists
        clock = $('.countdown-clock').FlipClock({
            autoStart: true,
            countdown: true,
            clockFace: "MinuteCounter"
        });
        clock.setTime(0);
        clock.start();
        $("#clockContainer").innerHTML = "<h1 class=\"ui center aligned header\"> <div class=\"sub header\">Time to the next person</div> </h1>";
    }
}
var ros;
function initNavigator(flag) {
    var viewer;
    if ($("#nav").length) {//if nav exists
        if (flag) {
            if (ros == null) {
                // Connect to ROS.
                ros = new ROSLIB.Ros({
                    url: 'ws://localhost:9090'
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
            }
        } else {
            $("#nav").empty();
            ros = null;
        }
    }
}
function createXmlHttpRequestObject() {
    "use strict";
    var xmlHttp;
    try {
        xmlHttp = new XMLHttpRequest();
    } catch (e) {
        xmlHttp = false;
    }
    if (!xmlHttp) {
        alert("Error creating the XMLHttpRequest object.");
    } else {
        return xmlHttp;
    }
}
var currentTicketId = -1;
var checkQueueHttpRequest = createXmlHttpRequestObject();//this object will be used in order to make ajax calls to checkQueue
var requestTicketHttpRequest = createXmlHttpRequestObject();//this object will be used in order to make ajax calls to checkQueue
var renewTicketHttpRequest = createXmlHttpRequestObject();//this object will be used in order to make ajax calls to checkQueue
var startControlHttpRequest = createXmlHttpRequestObject();//this object will be used in order to make ajax calls to checkQueue


function checkQueue() {
    "use strict";
    //proceed only if the checkQueueHttpRequest object isn't busy
    if (checkQueueHttpRequest.readyState === 4 || checkQueueHttpRequest.readyState === 0) {
        checkQueueHttpRequest.open("GET", "resources/checkQueue.php", true);
        checkQueueHttpRequest.onreadystatechange = checkQueueResponse;
        checkQueueHttpRequest.send(null);
    } else {
        // if the connection is busy, try again after one second
        setTimeout(checkQueue, 1000);
    }
}
function checkQueueResponse() {
    "use strict";
    if (checkQueueHttpRequest.readyState === 4) {
        //status of 200 indicates the transaction completed succesfully
        if (checkQueueHttpRequest.status === 200) {
            var responseJSON, html, i, serving, queueSize;
            html = "";
            //extract the xml
            responseJSON = JSON.parse(checkQueueHttpRequest.responseText);

            //update serving, clock and queue size
            serving = "Serving id " + responseJSON.servingId;
            if (responseJSON.remainingSeconds > 0 && clock.time != responseJSON.remainingSeconds) {
                clock.setTime(responseJSON.remainingSeconds);
                clock.start();
            }
            queueSize = responseJSON.queueSize + " " + (responseJSON.queueSize == 1 ? "person" : "people") + " in queue";
            if ($("#queueSize").text() != queueSize) {
                $("#queueSize").text(queueSize);
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
        requestTicketHttpRequest.open("GET", "resources/requestTicket.php", true);
        requestTicketHttpRequest.onreadystatechange = requestTicketResponse;
        requestTicketHttpRequest.send(null);
    } else {
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
        } else {
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
            renewTicketHttpRequest.open("GET", "resources/renewTicket.php?id=" + currentTicketId, true);
            renewTicketHttpRequest.onreadystatechange = renewTicketResponse;
            renewTicketHttpRequest.send(null);
        } else {
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
        } else {
            //alert("There was a problem accessing the server(renew): " + renewTicketHttpRequest.statusText);
        }
    }
}
function startControlSession() {
    "use strict";
    if (ros == null)
        clock.stop = function () {
            initNavigator(false);
            clock.stop = null;

        };
    initNavigator(true);
}
