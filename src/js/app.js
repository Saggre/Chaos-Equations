import * as THREE from 'three';
import {GPUComputationRenderer} from 'gpucomputationrender-three';

import * as Stats from 'stats.js';

import pointsFrag from '../shaders/points.frag';
import pointsVert from '../shaders/points.vert';

import ParameterEncoding from './module/parameterEncoding';
import Time from './module/time';

const stats = new Stats();
const time = new Time();

const rendering = {};
const chaos = {
    encodedParameters: new ParameterEncoding()
};

/**
 * Returns a random color
 * @returns {Color}
 * @param seed
 * @param brightness
 */
function getRandomColor(seed, brightness = 90) {
    const values = [
        Math.min(255, brightness + ((seed * 11909) % 256)),
        Math.min(255, brightness + ((seed * 52973) % 256)),
        Math.min(255, brightness + ((seed * 44111) % 256))
    ];

    return new THREE.Color(values[0] / 255.0, values[1] / 255.0, values[2] / 255.0);
}

/**
 * Creates a texture where each pixel is a random color
 * @param {number} size Width and length of the texture
 * @returns {DataTexture}
 */
function getColorTexture(size = 32) {
    const data = new Uint8Array(size * size * 3); // 32 x 32

    for (let i = 0; i < size * size; i++) {
        const stride = i * 3;
        const color = getRandomColor(i);
        data[stride] = color.r * 255;
        data[stride + 1] = color.g * 255;
        data[stride + 2] = color.b * 255;
    }

    const texture = new THREE.DataTexture(data, size, size, THREE.RGBFormat);
    texture.needsUpdate = true;

    return texture;
}

/**
 * Set up the rendering environment
 */
function setupEnvironment() {
    rendering.scene = new THREE.Scene();
    rendering.renderer = new THREE.WebGLRenderer({
        antialias: true,
        depth: false
    });
    rendering.renderer.setSize(window.innerWidth, window.innerHeight);
    rendering.renderer.setPixelRatio(window.devicePixelRatio);
    rendering.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    rendering.clock = new THREE.Clock();

    const geometry = new THREE.PlaneBufferGeometry(2, 2);
    const material = new THREE.MeshBasicMaterial({color: 0xffff00, side: THREE.DoubleSide});
    const plane = new THREE.Mesh(geometry, material);
    rendering.scene.add(plane);

    document.body.appendChild(rendering.renderer.domElement);
}

function setupShader() {
    const uniforms = {
        iters: {value: 512},
        steps: {value: 512},
        cpuTime: {value: t},
        deltaTime: {value: 0.01},
        px: {value: null},
        py: {value: null},
        pixelRatio: {value: window.devicePixelRatio},
        colorTexture: {value: getColorTexture()}
    };

    const visualShaderMaterial = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: pointsVert,
        fragmentShader: pointsFrag
    });

    const computePoints = new THREE.Points(computeBufferGeometry, visualShaderMaterial);
    scene.add(computePoints);
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

setupEnvironment();
setupShader();
animate();
