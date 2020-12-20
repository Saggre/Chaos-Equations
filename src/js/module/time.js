(function () {
    const deltaMaximum = 1e-3;
    const deltaMinimum = 1e-7;
    const deltaPerStep = 1e-5;
    const timeStart = -3.0;
    const timeEnd = 3.0; // TODO replace with time window

    function Time() {
        this.rollingDelta = deltaPerStep;
        this.time = 0.0;

        return this;
    }

    /**
     * Restarts timing if needed
     */
    function maybeRestart() {
        if (this.time > timeEnd) {
            this.time = timeStart;
        }
    }

    /**
     * Steps the timing forwards
     */
    function step() {
        this.time += deltaPerStep;
    }

    // CommonJS module
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = Time;
            module.exports = Time;
        }
        exports.ParameterEncoding = Time;
    }
}());
