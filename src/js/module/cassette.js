class Cassette {
    static defaultTimeWindow = [-3.0, 3.0];

    /**
     * Cassettes contain all the data required to make an animation with this software
     * @param parameters
     * @param start Start time
     * @param end End time
     */
    constructor(parameters, start = Cassette.defaultTimeWindow[0], end = Cassette.defaultTimeWindow[1]) {
        if (end < start) {
            throw new Error('Ending must be after the beginning');
        }

        this.parameters = parameters;
        this.start = start;
        this.end = end;
        this.used = false;
    }
}

export default Cassette;
