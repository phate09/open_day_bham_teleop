/// <reference path="typings/index.d.ts" />
///<reference path="flipclock.d.ts"/>
///<reference path="ptuStateListener.d.ts"/>
declare var ROS2D: any;
declare var NAV2D: any;
// var src = "http://" + serverAddress + ":8080/stream?topic=/head_xtion/rgb/image_mono";
var ptuController: PTUcontroller;
var mapNavigator: Navigator2d;
var ticketer: Ticketer;
//noinspection JSUnusedGlobalSymbols
function init() {
    "use strict";
    $(".instruction_text").hide();
    var serverAddress = "86.31.216.84";
    var port="9090";
    var rosConnection = new ROSLIB.Ros({
        url: "ws://" + serverAddress + ":" + port
    });
    mapNavigator = new Navigator2d(rosConnection, "nav");
    ptuController = new PTUcontroller(rosConnection);
    ticketer = new Ticketer();
    ticketer.startControlExternalMethod = ()=> {
        startControlSession();
    };
    ticketer.endControlExternalMethod = ()=> {
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
class PTUcontroller {
    private ptuGoal: ROSLIB.Topic;
    private ptuStateListener: ROSLIB.Topic;
    private allowPublish = false;
    private current_pan = 0;
    private current_tilt = 0;

    constructor(private rosConnection:ROSLIB.Ros) {
        this.ptuGoal = new ROSLIB.Topic({
            ros: this.rosConnection, name: "/SetPTUState/goal", messageType: "scitos_ptu/PtuGotoActionGoal"
        });
        this.ptuStateListener = new ROSLIB.Topic({
            ros: this.rosConnection, name: "/SetPTUState/result", messageType: "scitos_ptu/PtuGotoActionResult"
        });
        this.assignHandler();
    }

    private startPublish(): void {
        this.ptuGoal.advertise();
        this.allowPublish = true;
    }

    private startListen(): void {
        var self=this;
        this.ptuStateListener.subscribe((message: any)=> {
            if(message.result.state.position.length>0) {
                self.current_pan = message.result.state.position[0];
                self.current_tilt = message.result.state.position[1];
            }
        });
    }

    private stopPublish(): void {
        this.ptuGoal.unadvertise();
        this.allowPublish = false;
    }

    private stopListen(): void {
        this.ptuStateListener.unsubscribe();
    }

    public startControl(): void {
        this.startListen();
        this.startPublish();
    }

    public stopControl(): void {
        this.stopListen();
        this.stopPublish();
    }

    private assignHandler() {
        // handle the key
        var body = document.getElementsByTagName("body")[0];
        //limit the amount of times keydown event is called to 1 every 200 millisecs
        body.addEventListener("keydown",// (e)=> {this.keyDownHandler(e.keyCode);});
        _.throttle((e)=> {
            this.keyDownHandler(e.keyCode);
        }, 200, {
            leading: false, trailing: false
        }), false);
    }

    private keyDownHandler(keyCode): void {
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
                    stamp: new Date().getTime(), id: "",
                }, goal: {
                    pan: pan, tilt: tilt, pan_vel: 10.0, tilt_vel: 10.0
                }
            });
            this.ptuGoal.publish(twist);
        }
    }
}
class Navigator2d {
    private viewer: any = null;
    private width = 318;//640
    private height = 562;//1131
    constructor(private rosConnection:ROSLIB.Ros, private navId: string) {
    }

    private initMap() {
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
    }

    public showMap() {
        if (this.viewer == null)
            this.initMap();
        $(".instruction_text").show();
        $("#traffic_light").attr("src", "images/remote_go.png");
    }

    public removeMap() {
        var nav = $("#" + this.navId);
        this.viewer = null;
        nav.empty();
        $(".instruction_text").hide();
        $("#traffic_light").attr("src", "images/remote_time.png");
    }
}
class Ticketer {
    private currentTicketId = -1;
    private flipClock: IFlipClock;
    public startControlExternalMethod = ()=> {
    };
    public endControlExternalMethod = ()=> {
    };
    private controlSessionStarted;

    constructor() {
        this.flipClock = Ticketer.initClock();
    }

    private static initClock(): IFlipClock {
        var clock: IFlipClock = null;
        var countdown = $("#flipClock");
        if (countdown.length) {//if clock exists
            clock = countdown.FlipClock({
                autoStart: true, countdown: true, clockFace: "MinuteCounter"
            });
            clock.setTime(0);
            clock.start();
        }
        return clock;
    }

    public checkQueue(): void {
        "use strict";
        $.get("resources/php/checkQueue.php", (responseText)=> {
            "use strict";
            var responseJSON, queueSize, queueMsg;
            //extract the xml
            responseJSON = JSON.parse(responseText);

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
        });
    }

    private startControl() {
        if (this.controlSessionStarted)return;
        this.controlSessionStarted = true;
        if (this.startControlExternalMethod != null)
            this.startControlExternalMethod();
        this.flipClock.stop = ()=>this.endControl();
    }

    private endControl() {
        this.controlSessionStarted = false;
        this.flipClock.stop = null;
        if (this.endControlExternalMethod != null)
            this.endControlExternalMethod();
    }

    //noinspection JSUnusedGlobalSymbols
    public requestTicket() {
        "use strict";
        //hide the ticket button
        $("#getTicket").hide();
        $.get("resources/php/requestTicket.php", (responseText)=> {
            "use strict";
            var responseJSON;
            responseJSON = JSON.parse(responseText);
            this.currentTicketId = parseInt(responseJSON.ticketId);
            $("#yourNumberMsg").text("You are the number " + this.currentTicketId);
            this.checkQueue();
        });
    }

    //keeps the current ticket active (in order to remove the user from the queue if it leaves the page)
    public renewTicket() {
        "use strict";
        if (this.currentTicketId != -1) {
            $.get("resources/php/renewTicket.php?id=" + this.currentTicketId, (responseText)=> {
                "use strict";
                var responseJSON;
                responseJSON = JSON.parse(responseText);
                if (!responseJSON) {
                    alert("error during renewTicket");
                }
            });
        }
    }
}


function startControlSession(): void {
    "use strict";
    mapNavigator.showMap();
    ptuController.startControl();
    $(".instruction_text").show();
}
function endControlSession(): void {
    "use strict";
    mapNavigator.removeMap();
    ptuController.stopControl();
    $(".instruction_text").hide();
}
