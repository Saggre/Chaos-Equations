class Parameters {
    constructor(renderingPtr) {
        this.rendering = renderingPtr;
    }

    updateVertexPositions() {
        const params = this.rendering.encodedParameters.values;
        const positions = this.rendering.points.geometry.attributes.position.array;
        let index = 0;
        for (let i = 0; i < this.rendering.steps; i++) {
            const isOffScreen = true;
            let x = this.rendering.timeManager.time;
            let y = this.rendering.timeManager.time;
            let t = this.rendering.timeManager.time;

            for (let j = 0; j < this.rendering.trail; j++) {
                const xx = x * x;
                const yy = y * y;
                const tt = t * t;
                const xy = x * y;
                const xt = x * t;
                const yt = y * t;
                // eslint-disable-next-line max-len
                const nx = xx * params[0] + yy * params[1] + tt * params[2] + xy * params[3] + xt * params[4] + yt * params[5] + x * params[6] + y * params[7] + t * params[8];
                // eslint-disable-next-line max-len
                const ny = xx * params[9] + yy * params[10] + tt * params[11] + xy * params[12] + xt * params[13] + yt * params[14] + x * params[15] + y * params[16] + t * params[17];
                x = nx;
                y = ny;

                if (!isFinite(x) || isNaN(x)) {
                    x = 0;
                }

                if (!isFinite(y) || isNaN(y)) {
                    y = 0;
                }

                x = Math.max(x, -1);
                x = Math.min(x, 1);
                y = Math.max(y, -1);
                y = Math.min(y, 1);

                positions[index++] = x;
                positions[index++] = y;
                positions[index++] = 0;
            }

            // Update the t variable
            if (isOffScreen) {
                t += 0.01;
            } else {
                // t += rolling_delta;
            }
        }
        this.rendering.points.geometry.attributes.position.needsUpdate = true;
    }
}

export default Parameters;
