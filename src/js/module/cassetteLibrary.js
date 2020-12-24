import Cassette from './cassette';
import Parameters from './parameters';

class CassetteLibrary {
    static bestCassettes = [
        new Cassette(Parameters.fromString('LXYEBE'), -1.25, -0.95),
        new Cassette(Parameters.fromString('IDRQIV'), -0.37, 0.2, 4),
        new Cassette(Parameters.fromString('TQACNU'), -0.3, -0.17)
    ];

    static shuffle() {
        CassetteLibrary.shuffleArray(this.bestCassettes);
    }

    static shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            // eslint-disable-next-line no-param-reassign
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    /**
     * Find cassette from library by parameter string
     * @param parameters
     * @param callback Called on found
     */
    static findCassette(parameters, callback) {
        for (let i = 0; i < this.bestCassettes.length; i++) {
            if (this.bestCassettes[i].parameters.equals(parameters)) {
                callback(this.bestCassettes[i]);
                return true;
            }
        }

        return false;
    }
}

export default CassetteLibrary;
