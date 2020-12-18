import Chance from 'chance';
import {sv2bts, bts2sv} from 'base27';

(function () {
    const chance = new Chance();

    /**
     * Try to load parameters from url, and get random ones if none are set
     * @returns {Parameters}
     * @constructor
     */
    function Parameters(number = 18) {
        if (number.length % 3 !== 0) {
            throw new Error('Parameter count must be a multiple of three');
        }

        this.number = number;

        try {
            this.values = Parameters.getUrlParameters(this.number);
        } catch (e) {
            this.values = Parameters.getRandomParameters(this.number);
        }

        return this;
    }

    /**
     * Get parameter values as a base27 string
     * @returns {string}
     */
    Parameters.prototype.toString = function () {
        return Parameters.getStringFromParameters(this.values);
    };

    /**
     * Refresh parameters
     */
    Parameters.prototype.randomize = function () {
        this.values = Parameters.getRandomParameters();
    };

    /**
     * Turns an array of equation parameters into a base27 string
     * @param {[]} parameters
     * @returns {string}
     */
    Parameters.getStringFromParameters = function (parameters) {
        if (parameters.length % 3 !== 0) {
            throw new Error('Parameter count must be a multiple of three');
        }

        const concatenation = parameters.join('').replaceAll('-1', 'i');
        return bts2sv(concatenation);
    };

    /**
     * Turns a string into n*3 equation parameters
     * @param {string} string
     * @returns {[]}
     */
    Parameters.getParametersFromString = function (string) {
        return Array.from(sv2bts(string.toUpperCase()), function (bts) {
            if (bts === '0') {
                return 0;
            }

            if (bts === '1') {
                return 1;
            }

            return -1;
        });
    };

    /**
     * Generate random equation parameters
     * @param {number} number Number of parameters to generate
     * @returns {[]}
     */
    Parameters.getRandomParameters = function (number) {
        const parameters = [];

        for (let i = 0; i < number; i++) {
            parameters[i] = chance.integer({min: -1, max: 1});
        }

        return parameters;
    };

    /**
     * Tries to get equation parameters from url
     * @param {number} number Number of parameters to generate
     * @returns {[]}
     */
    Parameters.getUrlParameters = function (number) {
        const patternLength = number / 3;
        const string = window.location.hash.substr(1);
        if (RegExp('[A-Za-z0]{' + patternLength + '}').test(string)) {
            return this.getParametersFromString(string);
        }

        throw new Error('No valid url parameters');
    };

    // CommonJS module
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = Parameters;
            module.exports = Parameters;
        }
        exports.Parameters = Parameters;
    }
}());
