import Parameters from './parameterEncoding';
import Cassette from './cassette';

class CassettePlayer {
    constructor() {
        this.listeners = {
            cassetteChanged: []
        };
        this.parameterEncoding = new Parameters();
        this.currentCassette = new Cassette(this.parameterEncoding.);
    }

    /**
     * Add a change listener
     * @param callback
     */
    onCassetteChanged(callback) {
        this.listeners.cassetteChanged.push(callback);
    }

    changeCassette(cassette) {
        this.currentCassette = cassette;
        window.location.hash = cassette.code;
        this.listeners.cassetteChanged.forEach((callback) => {
            callback(this);
        });
    }

    setRandomCassette() {
this.changeCassette(new Cassette());
    }

    setNextCassette() {
        for (let i = 0; i < ParameterLibrary.bestParameters.length; i++) {
            const parameters = ParameterLibrary.bestParameters[i];
            if (!('used' in parameters) || parameters.used === false) {
                ParameterLibrary.bestParameters[i].used = true;
                return Parameters.getParametersFromString(parameters.code);
            }
        }

        return Parameters.getRandomParameters();
    }
}

export default CassettePlayer;
