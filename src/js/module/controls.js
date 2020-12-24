import dat from 'dat.gui';

class Controls {
    constructor(parameterEncoding, time) {
        this.gui = new dat.GUI();
        this.parameterEncoding = parameterEncoding;

        this.elements = {
            equationX: document.getElementsByClassName('chaos-equation--x')[0],
            equationY: document.getElementsByClassName('chaos-equation--y')[0],
            time: document.getElementsByClassName('chaos-time')[0]

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
            parameters.updateDisplay();

            const equations = this.parameterEncoding.toEquations();
            this.elements.equationX.textContent = 'x\' = ' + equations.x;
            this.elements.equationY.textContent = 'y\' = ' + equations.y;
        });

        time.onTimeChanged(() => {
            this.elements.time.textContent = 't = ' + time.time;
        });
    }
}

export default Controls;
