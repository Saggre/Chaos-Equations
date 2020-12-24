import Cassette from './cassette';
import Parameters from './parameters';

class CassetteLibrary {
    static bestCassettes = [
        new Cassette(Parameters.fromString('LXYEBE'), -1.25, -0.8),
        new Cassette(Parameters.fromString('IDRQIV'), -0.37, 0.2)
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
}

export default CassetteLibrary;
