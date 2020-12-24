import Parameters from './parameters';
import Cassette from './cassette';
import CassetteLibrary from './cassetteLibrary';

class CassettePlayer {
    constructor() {
        this.deltaMinimum = 1e-7;
        this.deltaPerStep = 1e-5;
        this.speedMultiplier = 2.0;
        this.listeners = {
            cassetteChanged: [],
            timeEnded: [],
            timeChanged: []
        };

        this.rollingDelta = this.deltaPerStep;
        this.delta = this.deltaPerStep * this.speedMultiplier;

        CassetteLibrary.shuffle();

        if (window.location.hash.length > 3) {
            this.setCassette(new Cassette(
                Parameters.fromUrl()
            ));
        } else {
            this.setNextCassette();
        }

        this.restart();
    }

    /**
     * Restarts timing if needed
     */
    maybeRestart() {
        if (this.time > this.currentCassette.end) {
            this.setNextCassette();
            this.listeners.timeEnded.forEach((callback) => {
                callback(this); // Can be used to override cassette
            });
            this.restart();
        }
    }

    restart() {
        this.time = this.currentCassette.start;
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
        this.rollingDelta = Math.min(this.rollingDelta, Math.max(this.delta / (distance + 1e-5), this.deltaMinimum * this.speedMultiplier));
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

    /**
     * Add a change listener
     * @param callback
     */
    onCassetteChanged(callback) {
        this.listeners.cassetteChanged.push(callback);
    }

    setCassette(cassette) {
        this.currentCassette = cassette;
        this.restart();
        window.location.hash = cassette.parameters.toString();
        this.listeners.cassetteChanged.forEach((callback) => {
            callback(this);
        });
    }

    setRandomCassette() {
        this.setCassette(new Cassette(
            Parameters.randomized()
        ));
    }

    setNextCassette() {
        for (let i = 0; i < CassetteLibrary.bestCassettes.length; i++) {
            const cassette = CassetteLibrary.bestCassettes[i];
            if (!cassette.used) {
                cassette.used = true;
                this.setCassette(cassette);
                return;
            }
        }

        this.setRandomCassette();
    }
}

export default CassettePlayer;
