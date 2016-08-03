/// <reference path="typings/index.d.ts" />
///<reference path="flipclock.d.ts"/>
///<reference path="ptuStateListener.d.ts"/>
// var src = "http://" + serverAddress + ":8080/stream?topic=/head_xtion/rgb/image_mono";
var ptuController;
var mapNavigator;
var ticketer;
//noinspection JSUnusedGlobalSymbols
function init() {
    "use strict";
    $(".instruction_text").hide();
    var serverAddress = "86.31.216.84";
    mapNavigator = new Navigator2d(serverAddress, "9090", "nav");
    ptuController = new PTUcontroller(serverAddress, "9090");
    ticketer = new Ticketer();
    ticketer.startControlExternalMethod = function () {
        startControlSession();
    };
    ticketer.endControlExternalMethod = function () {
        endControlSession();
    };
    loop();
}
function requestTicket() {
    ticketer.requestTicket();
}
function loop() {
    "use strict";
    ticketer.checkQueue();
    ticketer.renewTicket();
    setTimeout(loop, 1000);
}
var PTUcontroller = (function () {
    function PTUcontroller(url, port) {
        this.allowPublish = false;
        this.current_pan = 0;
        this.current_tilt = 0;
        this.rosConnection = new ROSLIB.Ros({
            url: "ws://" + url + ":" + port
        });
        this.ptuGoal = new ROSLIB.Topic({
            ros: this.rosConnection, name: "/SetPTUState/goal", messageType: "scitos_ptu/PtuGotoActionGoal"
        });
        this.ptuStateListener = new ROSLIB.Topic({
            ros: this.rosConnection, name: "/SetPTUState/result", messageType: "scitos_ptu/PtuGotoActionResult"
        });
        this.assignHandler();
    }
    PTUcontroller.prototype.startPublish = function () {
        this.ptuGoal.advertise();
        this.allowPublish = true;
    };
    PTUcontroller.prototype.startListen = function () {
        this.ptuStateListener.subscribe(function (message) {
            this.current_pan = message.result.state.position[0];
            this.current_tilt = message.result.state.position[1];
        });
    };
    PTUcontroller.prototype.stopPublish = function () {
        this.ptuGoal.unadvertise();
        this.allowPublish = false;
    };
    PTUcontroller.prototype.stopListen = function () {
        this.ptuStateListener.unsubscribe();
    };
    PTUcontroller.prototype.startControl = function () {
        this.startListen();
        this.startPublish();
    };
    PTUcontroller.prototype.stopControl = function () {
        this.stopListen();
        this.stopPublish();
    };
    PTUcontroller.prototype.assignHandler = function () {
        // handle the key
        var body = document.getElementsByTagName("body")[0];
        //limit the amount of times keydown event is called to 1 every 200 millisecs
        body.addEventListener("keydown", _.throttle(function (e) {
            this.keyDownHandler(e.keyCode);
        }, 200, {
            leading: false, trailing: false
        }), false);
    };
    PTUcontroller.prototype.keyDownHandler = function (keyCode) {
        if (!this.allowPublish)
            return;
        var pub = true;
        var tilt = 0;
        var pan = 0;
        // check which key was pressed
        switch (keyCode) {
            case 37:
                // turn left
                pan = this.current_pan + 5;
                break;
            case 38:
                // up
                tilt = this.current_tilt - 5;
                break;
            case 39:
                // turn right
                pan = this.current_pan - 5;
                break;
            case 40:
                // down
                tilt = this.current_tilt + 5;
                break;
            case 32:
                //spacebar
                pan = 0;
                tilt = 0;
                break;
            default:
                pub = false;
        }
        if (pub) {
            //prepare the message to be sent
            var twist = new ROSLIB.Message({
                header: {
                    seq: 1, stamp: new Date().getTime(), frame_id: ""
                }, goal_id: {
                    stamp: new Date().getTime(), id: ""
                }, goal: {
                    pan: pan, tilt: tilt, pan_vel: 10.0, tilt_vel: 10.0
                }
            });
            this.ptuGoal.publish(twist);
        }
    };
    return PTUcontroller;
}());
var Navigator2d = (function () {
    function Navigator2d(url, port, navId) {
        this.navId = navId;
        this.viewer = null;
        this.width = 318; //640
        this.height = 562; //1131
        this.ros = new ROSLIB.Ros({
            url: "ws://" + url + ":" + port
        });
    }
    Navigator2d.prototype.initMap = function () {
        // Create the main viewer.
        this.viewer = new ROS2D.Viewer({
            divID: this.navId, width: this.width,
            height: this.height
        });
        NAV2D.OccupancyGridClientNav({
            ros: this.ros,
            rootObject: this.viewer.scene,
            viewer: this.viewer,
            serverName: "/move_base",
            withOrientation: true
        });
    };
    Navigator2d.prototype.showMap = function () {
        if (this.viewer == null)
            this.initMap();
        $(".instruction_text").show();
        $("#traffic_light").attr("src", "images/remote_go.png");
    };
    Navigator2d.prototype.removeMap = function () {
        var nav = $("#" + this.navId);
        this.viewer = null;
        nav.empty();
        $(".instruction_text").hide();
        $("#traffic_light").attr("src", "images/remote_time.png");
    };
    return Navigator2d;
}());
var Ticketer = (function () {
    function Ticketer() {
        this.currentTicketId = -1;
        this.checkQueueHttpRequest = Ticketer.createXmlHttpRequestObject();
        this.requestTicketHttpRequest = Ticketer.createXmlHttpRequestObject();
        this.renewTicketHttpRequest = Ticketer.createXmlHttpRequestObject();
        this.startControlExternalMethod = function () {
        };
        this.endControlExternalMethod = function () {
        };
        this.flipClock = Ticketer.initClock();
    }
    Ticketer.initClock = function () {
        var clock = null;
        var countdown = $("#flipClock");
        if (countdown.length) {
            clock = countdown.FlipClock({
                autoStart: true, countdown: true, clockFace: "MinuteCounter"
            });
            clock.setTime(0);
            clock.start();
        }
        return clock;
    };
    Ticketer.prototype.checkQueue = function () {
        "use strict";
        //proceed only if the checkQueueHttpRequest object isn't busy
        if (this.checkQueueHttpRequest.readyState === 4 || this.checkQueueHttpRequest.readyState === 0) {
            this.checkQueueHttpRequest.open("GET", "resources/php/checkQueue.php", true);
            this.checkQueueHttpRequest.onreadystatechange = this.checkQueueResponse;
            this.checkQueueHttpRequest.send(null);
        }
        else {
            // if the connection is busy, try again after one second
            setTimeout(this.checkQueue, 1000);
        }
    };
    Ticketer.prototype.checkQueueResponse = function () {
        "use strict";
        if (this.checkQueueHttpRequest.readyState === 4) {
            //status of 200 indicates the transaction completed succesfully
            if (this.checkQueueHttpRequest.status === 200) {
                var responseJSON, queueSize, queueMsg;
                //extract the xml
                responseJSON = JSON.parse(this.checkQueueHttpRequest.responseText);
                //update serving, clock and queue size
                // serving = "Serving id " + responseJSON.servingId;
                if (responseJSON.remainingSeconds > 0 && this.flipClock.time != responseJSON.remainingSeconds) {
                    this.flipClock.setTime(responseJSON.remainingSeconds);
                    this.flipClock.start();
                }
                queueSize = responseJSON.queueSize - 1;
                if (queueSize < 0) {
                    queueSize = 0;
                }
                queueMsg = queueSize + " " + (queueSize == 1 ? "person" : "people") + " in queue";
                var queueSizeElement = $("#queueSizeMsg");
                if (queueSizeElement.text() != queueMsg) {
                    queueSizeElement.text(queueMsg);
                }
                if (this.currentTicketId != -1) {
                    if (parseInt(responseJSON.servingId) === this.currentTicketId) {
                        this.startControl();
                    }
                }
            }
        }
    };
    Ticketer.prototype.startControl = function () {
        if (this.startControlExternalMethod != null)
            this.startControlExternalMethod();
        this.flipClock.stop = this.endControl();
    };
    Ticketer.prototype.endControl = function () {
        var _this = this;
        return function () {
            _this.flipClock.stop = null;
            if (_this.endControlExternalMethod != null)
                _this.endControlExternalMethod();
        };
    };
    //noinspection JSUnusedGlobalSymbols
    Ticketer.prototype.requestTicket = function () {
        "use strict";
        //hide the ticket button
        $("#getTicket").hide();
        //proceed only if the checkQueueHttpRequest object isn't busy
        if (this.requestTicketHttpRequest.readyState === 4 || this.requestTicketHttpRequest.readyState === 0) {
            this.requestTicketHttpRequest.open("GET", "resources/php/requestTicket.php", true);
            this.requestTicketHttpRequest.onreadystatechange = this.requestTicketResponse;
            this.requestTicketHttpRequest.send(null);
        }
        else {
            // if the connection is busy, try again after one second
            setTimeout(this.requestTicket, 1000);
        }
    };
    Ticketer.prototype.requestTicketResponse = function () {
        "use strict";
        if (this.requestTicketHttpRequest.readyState === 4) {
            //status of 200 indicates the transaction completed succesfully
            if (this.requestTicketHttpRequest.status === 200) {
                var responseJSON;
                responseJSON = JSON.parse(this.requestTicketHttpRequest.responseText);
                this.currentTicketId = parseInt(responseJSON.ticketId);
                $("#yourNumberMsg").text("You are the number " + this.currentTicketId);
                this.checkQueue();
            }
            else {
                alert("There was a problem accessing the server(request): " + this.requestTicketHttpRequest.statusText);
            }
        }
    };
    //keeps the current ticket active (in order to remove the user from the queue if it leaves the page)
    Ticketer.prototype.renewTicket = function () {
        "use strict";
        if (this.currentTicketId != -1) {
            //proceed only if the checkQueueHttpRequest object isn't busy
            if (this.renewTicketHttpRequest.readyState === 4 || this.renewTicketHttpRequest.readyState === 0) {
                this.renewTicketHttpRequest.open("GET", "resources/php/renewTicket.php?id=" + this.currentTicketId, true);
                this.renewTicketHttpRequest.onreadystatechange = this.renewTicketResponse;
                this.renewTicketHttpRequest.send(null);
            }
            else {
                // if the connection is busy, try again after one second
                setTimeout(this.renewTicket, 1000);
            }
        }
    };
    Ticketer.prototype.renewTicketResponse = function () {
        "use strict";
        if (this.renewTicketHttpRequest.readyState === 4) {
            //status of 200 indicates the transaction completed succesfully
            if (this.renewTicketHttpRequest.status === 200) {
                var responseJSON;
                responseJSON = JSON.parse(this.renewTicketHttpRequest.responseText);
                if (!responseJSON) {
                    alert("error");
                }
            }
            else {
            }
        }
    };
    Ticketer.createXmlHttpRequestObject = function () {
        "use strict";
        var xmlHttp;
        try {
            xmlHttp = new XMLHttpRequest();
        }
        catch (e) {
            xmlHttp = null;
        }
        if (xmlHttp == null) {
            alert("Error creating the XMLHttpRequest object.");
        }
        else {
            return xmlHttp;
        }
    };
    return Ticketer;
}());
function startControlSession() {
    "use strict";
    mapNavigator.showMap();
    ptuController.startControl();
    $(".instruction_text").show();
}
function endControlSession() {
    "use strict";
    mapNavigator.removeMap();
    ptuController.stopControl();
    $(".instruction_text").hide();
}
