import * as Stats from 'stats.js';

import Rendering from './module/rendering';

const stats = new Stats();
const rendering = new Rendering();

/**
 * Render a frame
 */
function animate() {
    stats.begin();
    rendering.timeManager.step();
    rendering.parameters.updateVertexPositions();
    rendering.renderer.render(rendering.scene, rendering.camera);
    console.log(rendering.points.geometry.attributes.position.array[0]);
    stats.end();
    requestAnimationFrame(animate);
}


document.body.appendChild(rendering.renderer.domElement);
animate();
