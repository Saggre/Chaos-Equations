import * as THREE from 'three';

class Parameters {
    constructor(renderingPtr) {
        this.rendering = renderingPtr;
        this.historyPoints = new Array(this.rendering.steps).fill({x: 0.0, y: 0.0});
    }

    isPointInViewport(point) {
        // TODO test
        const sx = this.rendering.screenWorldUnits.x * 0.5;
        const sy = this.rendering.screenWorldUnits.y * 0.5;
        return point.x > -sx && point.x < sx && point.y > -sy && point.y < sy;
    }

    updateVertexPositions() {
        this.rendering.timeManager.smoothRollingDelta();

        const params = this.rendering.encodedParameters.values;
        const positions = this.rendering.points.geometry.attributes.position.array;
        let index = 0;
        for (let i = 0; i < this.rendering.trail; i++) {
            let isOffScreen = true;
            let point = {
                x: this.rendering.timeManager.time,
                y: this.rendering.timeManager.time
            };
            const t = this.rendering.timeManager.time;

            for (let j = 0; j < this.rendering.steps; j++) {
                const xx = point.x * point.x;
                const yy = point.y * point.y;
                const tt = t * t;
                const xy = point.x * point.y;
                const xt = point.x * t;
                const yt = point.y * t;

                const newPoint = {
                    // eslint-disable-next-line max-len
                    x: xx * params[0] + yy * params[1] + tt * params[2] + xy * params[3] + xt * params[4] + yt * params[5] + point.x * params[6] + point.y * params[7] + t * params[8],
                    // eslint-disable-next-line max-len
                    y: xx * params[9] + yy * params[10] + tt * params[11] + xy * params[12] + xt * params[13] + yt * params[14] + point.x * params[15] + point.y * params[16] + t * params[17]
                };

                const lim = 1.0;

                newPoint.y = Math.min(newPoint.y, lim);
                newPoint.y = Math.max(newPoint.y, -lim);
                newPoint.x = Math.min(newPoint.x, lim);
                newPoint.x = Math.max(newPoint.x, -lim);

                point = newPoint;

                if (this.isPointInViewport(newPoint)) {
                    const dx = this.historyPoints[j].x - newPoint.x;
                    const dy = this.historyPoints[j].y - newPoint.y;

                    const distance = 500.0 * Math.sqrt(dx * dx + dy * dy);
                    this.rendering.timeManager.updateRollingDelta(distance);
                    isOffScreen = false;
                }

                // this.historyPoints[j] = newPoint;

                positions[index++] = point.x;
                positions[index++] = point.y;
                positions[index++] = 0;
            }

            // Update the t variable
            if (isOffScreen) {
                this.rendering.timeManager.advance(0.01); // Lightspeed
            } else {
                this.rendering.timeManager.advance();
            }
        }

        this.rendering.points.geometry.attributes.position.needsUpdate = true;
        this.rendering.timeManager.maybeRestart();
    }
}

export default Parameters;
