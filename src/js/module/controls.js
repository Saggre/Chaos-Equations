import dat from 'dat.gui';

class Controls {
    constructor(parameterEncoding) {
        this.gui = new dat.GUI();
        this.parameterEncoding = parameterEncoding;

        this.elements = {
            equationX: document.getElementsByClassName('chaos-equation--x')[0],
            equationY: document.getElementsByClassName('chaos-equation--y')[0]
        };

        const options = {
            parameters: parameterEncoding.toString(),
            randomize() {
                parameterEncoding.randomize();
            }
        };

        const parameters = this.gui.add(options, 'parameters').onFinishChange(function (value) {
            parameterEncoding.setParametersFromString(value);
        });

        this.gui.add(options, 'randomize');

        parameterEncoding.onValueChanged(() => {
            options.parameters = parameterEncoding.toString();
            // this.updateTexts();
            parameters.updateDisplay();
        });

        // this.updateTexts();
    }

    updateTexts() {
        const equations = this.parameterEncoding.toEquations();
        this.elements.equationX.textContent = 'x\' = ' + equations.x;
        this.elements.equationY.textContent = 'y\' = ' + equations.y;
    }
}

export default Controls;
