(function () {
    function Parameters() {
        return this;
    }

    // CommonJS module
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = Parameters;
            module.exports = Parameters;
        }
        exports.ParameterEncoding = Parameters;
    }
}());
