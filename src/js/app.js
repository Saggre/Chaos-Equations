import * as Stats from 'stats.js';

import Rendering from './module/rendering';

const stats = new Stats();
const rendering = new Rendering();

stats.showPanel(0);

/**
 * Render a frame
 */
function animate() {
    stats.begin();
    rendering.parameters.updateVertexPositions();
    rendering.renderer.render(rendering.scene, rendering.camera);
    stats.end();
    requestAnimationFrame(animate);
}

document.body.appendChild(stats.dom);
stats.dom.style.cssText = 'position:absolute;bottom:0px;right:0px;';
document.body.appendChild(rendering.renderer.domElement);
animate();
