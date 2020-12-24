import Chance from 'chance';
import {sv2bts, bts2sv} from 'base27';

/**
 * Try to load parameters from url, and get random ones if none are set
 * @returns Parameters
 * @constructor
 */
class Parameters {
    static parameterCount = 18;

    constructor(values) {
        this.values = values;
    }

    /**
     * Equals test
     * @param parameters
     * @returns {boolean}
     */
    equals(parameters) {
        return this.toString() === parameters.toString();
    }

    /**
     * Get parameter values as a base27 string
     * @returns {string}
     */
    toString() {
        const concatenation = this.values.join('').replaceAll('-1', 'i');
        return bts2sv(concatenation);
    }

    /**
     * Transform params into two equation strings
     * @returns {{x: string, y: string}}
     */
    toEquations() {
        const equations = ['', ''];
        const mathSymbols = ['x\u00b2', 'y\u00b2', 't\u00b2', 'xy', 'xt', 'yt', 'x', 'y', 't'];

        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < this.values.length / 2; j++) {
                if (this.values[this.values.length / 2 * i + j] !== 0) {
                    if (this.values[j] < 0) {
                        equations[i] += ' - ';
                    } else {
                        equations[i] += ' + ';
                    }

                    equations[i] += mathSymbols[j];
                }
            }
        }

        return {
            x: equations[0],
            y: equations[1]
        };
    }

    /**
     * Generate random equation parameters
     * @returns Parameters
     */
    static randomized() {
        const parameters = [];
        const chance = new Chance();

        for (let i = 0; i < this.parameterCount; i++) {
            parameters[i] = chance.integer({min: -1, max: 1});
        }

        return new Parameters(parameters);
    }

    /**
     * Get equation parameters form base27 encoded string
     * @param parameterString
     * @returns Parameters
     */
    static fromString(parameterString) {
        try {
            const parameterStringSanitized = Parameters.sanitizeParameterString(parameterString);
            const parameters = Array.from(sv2bts(parameterStringSanitized), function (bts) {
                if (bts === '0') {
                    return 0;
                }

                if (bts === '1') {
                    return 1;
                }

                return -1;
            });

            return new Parameters(parameters);
        } catch (err) {
            return Parameters.randomized();
        }
    }

    /**
     * Tries to get equation parameters from url
     * @returns Parameters
     */
    static fromUrl() {
        return Parameters.fromString(window.location.hash.substring(1));
    }

    /**
     *
     * @param parameterString
     */
    static sanitizeParameterString(parameterString) {
        const patternLength = this.parameterCount / 3;
        if (new RegExp('^[A-Za-z0]+$').test(parameterString)) {
            if (parameterString.length >= patternLength) {
                return parameterString.substring(0, patternLength).toUpperCase();
            }
        }

        throw new Error('Parameter string not valid');
    }
}

export default Parameters;
