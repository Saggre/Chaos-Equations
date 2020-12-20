const deltaMaximum = 1e-3;
const deltaMinimum = 1e-7;
const deltaPerStep = 1e-5;
const timeStart = -3.0;
const timeEnd = 3.0; // TODO replace with time window

class Time {
    constructor() {
        this.rollingDelta = deltaPerStep;
        this.time = 0.0;
    }

    /**
     * Restarts timing if needed
     */
    maybeRestart() {
        if (this.time > timeEnd) {
            this.time = timeStart;
        }
    }

    /**
     * Steps the timing forwards
     */
    step() {
        this.time += deltaPerStep;
    }
}

export default Time;
