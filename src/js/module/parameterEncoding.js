import Chance from 'chance';
import {sv2bts, bts2sv} from 'base27';

/**
 * Try to load parameters from url, and get random ones if none are set
 * @returns {ParameterEncoding}
 * @constructor
 */
class ParameterEncoding {
    constructor(number = 18) {
        if (number % 3 !== 0) {
            throw new Error('Parameter count must be a multiple of three');
        }

        this.number = number;

        try {
            this.values = ParameterEncoding.getUrlParameters(this.number);
        } catch (e) {
            this.values = ParameterEncoding.getRandomParameters(this.number);
        }
    }

    /**
     * Get parameter values as a base27 string
     * @returns {string}
     */
    toString() {
        return ParameterEncoding.getStringFromParameters(this.values);
    }

    /**
     * Refresh parameters
     */
    randomize() {
        this.values = ParameterEncoding.getRandomParameters(this.number);
    }

    /**
     * Turns an array of equation parameters into a base27 string
     * @param {[]} parameters
     * @returns {string}
     */
    static getStringFromParameters(parameters) {
        if (parameters.length % 3 !== 0) {
            throw new Error('Parameter count must be a multiple of three');
        }

        const concatenation = parameters.join('').replaceAll('-1', 'i');
        return bts2sv(concatenation);
    }

    /**
     * Turns a string into n*3 equation parameters
     * @param {string} string
     * @returns {[]}
     */
    static getParametersFromString(string) {
        return Array.from(sv2bts(string.toUpperCase()), function (bts) {
            if (bts === '0') {
                return 0;
            }

            if (bts === '1') {
                return 1;
            }

            return -1;
        });
    }

    /**
     * Generate random equation parameters
     * @param {number} number Number of parameters to generate
     * @returns {[]}
     */
    static getRandomParameters(number) {
        const parameters = [];
        const chance = new Chance();

        for (let i = 0; i < number; i++) {
            parameters[i] = chance.integer({min: -1, max: 1});
        }

        return parameters;
    }

    /**
     * Tries to get equation parameters from url
     * @param {number} number Number of parameters to generate
     * @returns {[]}
     */
    static getUrlParameters(number) {
        const patternLength = number / 3;
        const string = window.location.hash.substr(1);
        if (RegExp('[A-Za-z0]{' + patternLength + '}').test(string)) {
            return ParameterEncoding.getParametersFromString(string);
        }

        throw new Error('No valid url parameters');
    }
}

export default ParameterEncoding;
