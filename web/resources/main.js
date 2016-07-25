/**
 * Created by phate09 on 24/07/16.
 */
/*jslint latedef:nofunc*/
/**
 * Setup all GUI elements when the page is loaded.
 */
var src = "http://86.31.216.84:8080/stream?topic=/head_xtion/rgb/image_mono";
function init() {
    "use strict";
    var ros, viewer, clock;
    if ($("#nav").length) {//if nav exists
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
    } else {
        $("#nav").empty();
    }
    if ($(".countdown-clock").length) {//if clock exists
        clock = $('.countdown-clock').FlipClock({
            autoStart: false,
            countdown: true,
            clockFace: "MinuteCounter"
        });
        clock.setTime(600);
        clock.start();
        $("#clockContainer").innerHTML = "<h1 class=\"ui center aligned header\"> <div class=\"sub header\">Time to the next person</div> </h1>";
    } else {
        $("#clockContainer").empty();
    }
    loop();
}
function loop() {
    "use strict"
    Window.setTimeout(loop, 1000);
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


function checkQueue() {
    "use strict";
    //proceed only if the checkQueueHttpRequest object isn't busy
    if (checkQueueHttpRequest.readyState === 4 || checkQueueHttpRequest.readyState === 0) {
        var ticketId = encodeURIComponent("nome"); //TODO: put the ticket id here
        checkQueueHttpRequest.open("GET", "ticketer.php?ticket=" + ticketId, true);
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
            var responseJSON, html, i;
            html = "";
            //extract the xml
            responseJSON = JSON.parse(checkQueueHttpRequest.responseText);
            for (i = 0; i < responseJSON.books.length; i = i + 1) {
                html += responseJSON.books[i].title + ", " + responseJSON.books[i].isbn + "<br/>";
            }
            // display the data received from the server
            document.getElementById("divMessage").innerHTML = html;
            // restart sequence every second
            setTimeout(checkQueue, 1000);
        }
    }
}

function requestTicket() {
    "use strict";
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
            currentTicketId = responseJSON.ticketId;
            alert(currentTicketId);
        } else {
            alert("There was a problem accessing the server: " + requestTicketHttpRequest.statusText);
        }
    }
}
function renewTicket() {
    "use strict";
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
function renewTicketResponse() {
    "use strict";
    if (renewTicketHttpRequest.readyState === 4) {
        //status of 200 indicates the transaction completed succesfully
        if (renewTicketHttpRequest.status === 200) {
            var responseJSON;
            responseJSON = JSON.parse(renewTicketHttpRequest.responseText);
            if (responseJSON) {
                setTimeout(renewTicket, 1000);//renew again after a second
            }
        } else {
            alert("There was a problem accessing the server: " + renewTicketHttpRequest.statusText);
        }
    }
}
