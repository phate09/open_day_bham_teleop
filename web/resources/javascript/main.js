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
    var port = "9090";
    var rosConnection = new ROSLIB.Ros({
        url: "ws://" + serverAddress + ":" + port
    });
    mapNavigator = new Navigator2d(rosConnection, "nav");
    ptuController = new PTUcontroller(rosConnection);
    ticketer = new Ticketer();
    ticketer.startControlExternalMethod = function () {
        startControlSession();
    };
    ticketer.endControlExternalMethod = function () {
        endControlSession();
    };
    loop();
}
//noinspection JSUnusedGlobalSymbols
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
    function PTUcontroller(rosConnection) {
        this.rosConnection = rosConnection;
        this.allowPublish = false;
        this.current_pan = 0;
        this.current_tilt = 0;
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
        var self = this;
        this.ptuStateListener.subscribe(function (message) {
            if (message.result.state.position.length > 0) {
                self.current_pan = message.result.state.position[0];
                self.current_tilt = message.result.state.position[1];
            }
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
        var _this = this;
        // handle the key
        var body = document.getElementsByTagName("body")[0];
        //limit the amount of times keydown event is called to 1 every 200 millisecs
        body.addEventListener("keydown", // (e)=> {this.keyDownHandler(e.keyCode);});
        _.throttle(function (e) {
            _this.keyDownHandler(e.keyCode);
        }, 200, {
            leading: false, trailing: false
        }), false);
    };
    PTUcontroller.prototype.keyDownHandler = function (keyCode) {
        if (!this.allowPublish)
            return;
        var pub = true;
        var tilt = this.current_tilt;
        var pan = this.current_pan;
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
    function Navigator2d(rosConnection, navId) {
        this.rosConnection = rosConnection;
        this.navId = navId;
        this.viewer = null;
        this.width = 318; //640
        this.height = 562; //1131
    }
    Navigator2d.prototype.initMap = function () {
        // Create the main viewer.
        this.viewer = new ROS2D.Viewer({
            divID: this.navId, width: this.width,
            height: this.height
        });
        NAV2D.OccupancyGridClientNav({
            ros: this.rosConnection,
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
        var _this = this;
        $.get("resources/php/checkQueue.php", function (responseText) {
            "use strict";
            var responseJSON, queueSize, queueMsg;
            //extract the xml
            responseJSON = JSON.parse(responseText);
            //update serving, clock and queue size
            // serving = "Serving id " + responseJSON.servingId;
            if (responseJSON.remainingSeconds > 0 && _this.flipClock.time != responseJSON.remainingSeconds) {
                _this.flipClock.setTime(responseJSON.remainingSeconds);
                _this.flipClock.start();
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
            if (_this.currentTicketId != -1) {
                if (parseInt(responseJSON.servingId) === _this.currentTicketId) {
                    _this.startControl();
                }
            }
        });
    };
    Ticketer.prototype.startControl = function () {
        var _this = this;
        if (this.controlSessionStarted)
            return;
        this.controlSessionStarted = true;
        if (this.startControlExternalMethod != null)
            this.startControlExternalMethod();
        this.flipClock.stop = function () { return _this.endControl(); };
    };
    Ticketer.prototype.endControl = function () {
        this.controlSessionStarted = false;
        this.flipClock.stop = null;
        if (this.endControlExternalMethod != null)
            this.endControlExternalMethod();
    };
    //noinspection JSUnusedGlobalSymbols
    Ticketer.prototype.requestTicket = function () {
        "use strict";
        var _this = this;
        //hide the ticket button
        $("#getTicket").hide();
        $.get("resources/php/requestTicket.php", function (responseText) {
            "use strict";
            var responseJSON;
            responseJSON = JSON.parse(responseText);
            _this.currentTicketId = parseInt(responseJSON.ticketId);
            $("#yourNumberMsg").text("You are the number " + _this.currentTicketId);
            _this.checkQueue();
        });
    };
    //keeps the current ticket active (in order to remove the user from the queue if it leaves the page)
    Ticketer.prototype.renewTicket = function () {
        "use strict";
        if (this.currentTicketId != -1) {
            $.get("resources/php/renewTicket.php?id=" + this.currentTicketId, function (responseText) {
                "use strict";
                var responseJSON;
                responseJSON = JSON.parse(responseText);
                if (!responseJSON) {
                    alert("error during renewTicket");
                }
            });
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
