import dat from 'dat.gui';
import Cassette from './cassette';
import Parameters from './parameters';

class Controls {
    constructor(cassettePlayer) {
        this.gui = new dat.GUI();

        this.elements = {
            equationX: document.getElementsByClassName('chaos-equation--x')[0],
            equationY: document.getElementsByClassName('chaos-equation--y')[0],
            time: document.getElementsByClassName('chaos-time')[0]
        };

        const options = {
            parameters: cassettePlayer.currentCassette.parameters.toString(),
            randomize() {
                cassettePlayer.setRandomCassette();
            }
        };

        const parameters = this.gui.add(options, 'parameters').onFinishChange(function (value) {
            cassettePlayer.setCassette(new Cassette(
                Parameters.fromString(value)
            ));
        });

        this.gui.add(options, 'randomize');

        cassettePlayer.onCassetteChanged(() => {
            options.parameters = cassettePlayer.currentCassette.parameters.toString();
            parameters.updateDisplay();

            const equations = cassettePlayer.currentCassette.parameters.toEquations();
            this.elements.equationX.textContent = 'x\' = ' + equations.x;
            this.elements.equationY.textContent = 'y\' = ' + equations.y;
        });

        cassettePlayer.onTimeChanged(() => {
            this.elements.time.textContent = 't = ' + cassettePlayer.time;
        });
    }
}

export default Controls;
