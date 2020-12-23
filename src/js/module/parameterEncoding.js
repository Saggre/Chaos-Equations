import Chance from 'chance';
import {sv2bts, bts2sv} from 'base27';

const parameterCount = 18;

/**
 * Try to load parameters from url, and get random ones if none are set
 * @returns {ParameterEncoding}
 * @constructor
 */
class ParameterEncoding {
    constructor() {
        if (parameterCount % 3 !== 0) {
            throw new Error('Parameter count must be a multiple of three');
        }

        this.valueChangedListeners = [];

        try {
            this.setValues(ParameterEncoding.getUrlParameters());
        } catch (e) {
            this.setValues(ParameterEncoding.getRandomParameters());
        }
    }

    /**
     * Set parameters and call listeners
     * @param values
     */
    setValues(values) {
        this.values = values;
        window.location.hash = this.toString();
        this.valueChangedListeners.forEach((listener) => {
            listener(this);
        });
    }

    /**
     * Add a value change listener
     * @param callback
     */
    onValueChanged(callback) {
        this.valueChangedListeners.push(callback);
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
        this.setValues(ParameterEncoding.getRandomParameters());
    }

    /**
     * Tries to get equation parameters string
     */
    setParametersFromString(parameterString) {
        try {
            this.setValues(ParameterEncoding.getParametersFromString(
                ParameterEncoding.sanitizeParameterString(parameterString)
            ));
        } catch (e) {
            this.setValues(ParameterEncoding.getRandomParameters());
        }
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
     * @returns {[]}
     */
    static getRandomParameters() {
        const parameters = [];
        const chance = new Chance();

        for (let i = 0; i < parameterCount; i++) {
            parameters[i] = chance.integer({min: -1, max: 1});
        }

        return parameters;
    }

    /**
     * Tries to get equation parameters from url
     * @returns {[]}
     */
    static getUrlParameters() {
        try {
            const parameterString = ParameterEncoding.sanitizeParameterString(window.location.hash.substring(1));
            return ParameterEncoding.getParametersFromString(parameterString);
        } catch (err) {
            throw err;
        }
    }

    /**
     *
     * @param parameterString
     */
    static sanitizeParameterString(parameterString) {
        const patternLength = parameterCount / 3;
        if (new RegExp('^[A-Za-z0]+$').test(parameterString)) {
            if (parameterString.length >= patternLength) {
                return parameterString.substring(0, patternLength).toUpperCase();
            }
        }

        throw new Error('Parameter string not valid');
    }
}

export default ParameterEncoding;
