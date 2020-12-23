const deltaMaximum = 1e-3;
const deltaMinimum = 1e-7;
const deltaPerStep = 1e-5;
const timeStart = -3.0;
const timeEnd = 3.0; // TODO replace with time window
const speedMultiplier = 1.0;

class Time {
    constructor() {
        this.rollingDelta = deltaPerStep;
        this.time = 0.0;
        this.delta = deltaPerStep * speedMultiplier;
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
     * Smooth out the stepping speed
     */
    smoothRollingDelta() {
        this.rollingDelta = this.rollingDelta * 0.99 + this.delta * 0.01;
    }

    /**
     * Update rolling delta if the candidate value is smaller
     * @param distance
     */
    updateRollingDelta(distance) {
        this.rollingDelta = Math.min(this.rollingDelta, Math.max(this.delta / (distance + 1e-5), deltaMinimum * speedMultiplier));
    }

    /**
     * Steps the timing forwards by delta
     */
    advance(delta = this.rollingDelta) {
        this.time += delta;
    }
}

export default Time;
