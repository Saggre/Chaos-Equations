import * as THREE from 'three';
import {GPUComputationRenderer} from 'gpucomputationrender-three';

import Time from './time';
import ParameterEncoding from './parameterEncoding';
import Parameters from './parameters';
import pointsVert from '../../shaders/points.vert';
import pointsFrag from '../../shaders/points.frag';
import Controls from './controls';

class Rendering {
    constructor(steps = 512, trail = 512) {
        this.steps = steps;
        this.trail = trail;

        this.viewport = {
            width: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
            height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
        };

        this.screenWorldUnits = {
            x: 1.0,
            y: this.viewport.height / this.viewport.width
        };

        this.setupEnvironment();

        this.encodedParameters = new ParameterEncoding();
        this.controls = new Controls(this.encodedParameters);
        this.parameters = new Parameters(this);

        const vertices = new Float32Array(steps * trail * 3);
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

        this.timeManager = new Time();

        const shaderMaterial = new THREE.ShaderMaterial({
            uniforms: {},
            vertexShader: pointsVert,
            fragmentShader: pointsFrag
        });

        this.points = new THREE.Points(geometry, shaderMaterial);
        this.scene.add(this.points);
    }

    /**
     * Set up the rendering environment
     */
    setupEnvironment() {
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            depth: false
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.camera = new THREE.OrthographicCamera(-0.5 * this.screenWorldUnits.x, 0.5 * this.screenWorldUnits.x, 0.5 * this.screenWorldUnits.y, -0.5 * this.screenWorldUnits.y, 0, 1);

        const geometry = new THREE.PlaneBufferGeometry(2, 2);
        const material = new THREE.MeshBasicMaterial({color: 0x000000, side: THREE.DoubleSide});
        const plane = new THREE.Mesh(geometry, material);
        this.scene.add(plane);
    }

    /**
     * Returns a random color
     * @returns {Color}
     * @param seed
     * @param brightness
     */
    static getRandomColor(seed, brightness = 90) {
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
    static getColorTexture(size = 32) {
        const data = new Uint8Array(size * size * 3); // 32 x 32

        for (let i = 0; i < size * size; i++) {
            const stride = i * 3;
            const color = Rendering.getRandomColor(i);
            data[stride] = color.r * 255;
            data[stride + 1] = color.g * 255;
            data[stride + 2] = color.b * 255;
        }

        const texture = new THREE.DataTexture(data, size, size, THREE.RGBFormat);
        texture.needsUpdate = true;

        return texture;
    }
}

export default Rendering;
