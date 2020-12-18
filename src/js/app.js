import * as THREE from 'three';
import {GPUComputationRenderer} from 'gpucomputationrender-three';

import * as Stats from 'stats.js';

import pointsFrag from '../shaders/points.frag';
import pointsVert from '../shaders/points.vert';

import Parameters from './module/parameters';

const stats = new Stats();

const rendering = {};
const chaos = {
    parameters: new Parameters()
};

/**
 * Set up the rendering environment
 */
function setupRendering() {
    rendering.scene = new THREE.Scene();
    rendering.renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    rendering.renderer.setSize(window.innerWidth, window.innerHeight);
    rendering.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    rendering.clock = new THREE.Clock();

    const geometry = new THREE.PlaneBufferGeometry(2, 2);
    const material = new THREE.MeshBasicMaterial({color: 0xffff00, side: THREE.DoubleSide});
    const plane = new THREE.Mesh(geometry, material);
    rendering.scene.add(plane);

    document.body.appendChild(rendering.renderer.domElement);
}

/**
 * Render a frame
 */
function animate() {
    stats.begin();
    rendering.renderer.render(rendering.scene, rendering.camera);
    stats.end();
    requestAnimationFrame(animate);
}

setupRendering();
animate();
