interface IFlipClockConfig {
    autoStart?: boolean;
    countdown?: boolean;
    callbacks?: {
        destroy?: Function,
        create?: Function,
        init?: Function,
        interval?: Function,
        start?: Function,
        stop?: Function,
        reset?: Function
    };
    classes?: {};
    clockFace?: string;
    defaultClockFace?: string;
    defaultLanguage?: string;
}

interface IFlipClock {
    start: Function;
    stop: Function;
    setTime: (time: number) => IFlipClock;
    setCountdown: (countdown: boolean) => IFlipClock;
    getTime(): number;
    time:number;
}

interface IFlipClockStatic {
    new (digits: number, config?: IFlipClockConfig);
}

interface JQuery {
    FlipClock?: (config: IFlipClockConfig) => IFlipClock;
    // FlipClock?: (digits: number, config?: IFlipClockConfig) => IFlipClock;
}