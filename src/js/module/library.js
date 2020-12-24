class ParameterLibrary {
    static bestParameters = [
        {
            code: 'LXYEBE',
            start: -1.25,
            end: -0.8
        }
    ];

    static shuffle() {
        ParameterLibrary.shuffleArray(this.bestParameters);
    }

    static shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            // eslint-disable-next-line no-param-reassign
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}

export default ParameterLibrary;
