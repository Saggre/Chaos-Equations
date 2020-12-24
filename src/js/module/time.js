const deltaMaximum = 1e-3;
const deltaMinimum = 1e-7;
const deltaPerStep = 1e-5;
const timeStart = -3.0;
const timeEnd = 3.0;
const speedMultiplier = 2.0;

class Time {
    constructor() {
        this.rollingDelta = deltaPerStep;
        this.delta = deltaPerStep * speedMultiplier;
        this.listeners = {
            timeEnded: [],
            timeChanged: [],
            restarted: []
        };
        this.restart();
    }

    /**
     * Restarts timing if needed
     */
    maybeRestart() {
        if (this.time > timeEnd) {
            this.restart();
            this.listeners.timeEnded.forEach((callback) => {
                callback(this);
            });
        }
    }

    restart() {
        this.time = timeStart;
        this.listeners.restarted.forEach((callback) => {
            callback(this);
        });
    }

    /**
     * Add a restart listener
     * @param callback
     */
    onRestarted(callback) {
        this.listeners.restarted.push(callback);
    }

    /**
     * Add a time ended listener
     * @param callback
     */
    onTimeEnded(callback) {
        this.listeners.timeEnded.push(callback);
    }

    /**
     * Add a time changed listener
     * @param callback
     */
    onTimeChanged(callback) {
        this.listeners.timeChanged.push(callback);
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
        this.listeners.timeChanged.forEach((callback) => {
            callback(this);
        });
    }
}

export default Time;
