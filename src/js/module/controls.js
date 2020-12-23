import dat from 'dat.gui';

class Controls {
    constructor(parameterEncoding) {
        this.gui = new dat.GUI();

        const options = {
            parameters: parameterEncoding.toString()
        };

        const parameters = this.gui.add(options, 'parameters').onFinishChange(function (value) {
            parameterEncoding.setParametersFromString(value);
        });

        parameterEncoding.onValueChanged(() => {
            options.parameters = parameterEncoding.toString();
            parameters.updateDisplay();
        });
    }
}

export default Controls;
