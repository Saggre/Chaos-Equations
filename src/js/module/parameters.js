class Parameters {
    constructor(rendering) {
        this.rendering = rendering;
        this.historyPoints = new Array(this.rendering.steps).fill({x: 0.0, y: 0.0});
    }

    /**
     * Checks if a point is inside the viewport
     * @param point
     * @returns {boolean}
     */
    isPointInViewport(point) {
        const {camera} = this.rendering;
        return point.x > camera.left && point.x < camera.right && point.y > camera.bottom && point.y < camera.top;
    }

    /**
     * Set sequence vertex positions
     * Because the first point of the sequence is (t, t), the sequence is moving
     * diagonally in xy space from (timeStart, timeStart) to (timeEnd, timeEnd) as time advances
     */
    updateVertexPositions() {
        this.rendering.timeManager.smoothRollingDelta();

        const params = this.rendering.encodedParameters.values;
        const positions = this.rendering.points.geometry.attributes.position.array;
        let index = 0;
        for (let i = 0; i < this.rendering.trail; i++) {
            let isOffScreen = true;

            // Start sequence from (t, t)
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

                point = {
                    // eslint-disable-next-line max-len
                    x: xx * params[0] + yy * params[1] + tt * params[2] + xy * params[3] + xt * params[4] + yt * params[5] + point.x * params[6] + point.y * params[7] + t * params[8],
                    // eslint-disable-next-line max-len
                    y: xx * params[9] + yy * params[10] + tt * params[11] + xy * params[12] + xt * params[13] + yt * params[14] + point.x * params[15] + point.y * params[16] + t * params[17]
                };

                const lim = 1.0;

                point.y = Math.min(point.y, lim);
                point.y = Math.max(point.y, -lim);
                point.x = Math.min(point.x, lim);
                point.x = Math.max(point.x, -lim);

                if (this.isPointInViewport(point)) {
                    const dx = this.historyPoints[j].x - point.x;
                    const dy = this.historyPoints[j].y - point.y;

                    const distance = 500.0 * Math.sqrt(dx * dx + dy * dy);
                    this.rendering.timeManager.updateRollingDelta(distance);
                    isOffScreen = false;
                }

                this.historyPoints[j].x = point.x;
                this.historyPoints[j].y = point.y;

                positions[index++] = point.x;
                positions[index++] = point.y;
                positions[index++] = j; // Color dimension
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
