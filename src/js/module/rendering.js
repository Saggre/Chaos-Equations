import * as THREE from 'three';
import {GPUComputationRenderer} from 'gpucomputationrender-three';

import CassettePlayer from './cassettePlayer';
import Parameters from './parameters';
import Chaos from './chaos';
import pointsVert from '../../shaders/points.vert';
import pointsFrag from '../../shaders/points.frag';
import Controls from './controls';

class Rendering {
    /**
     * Constructor
     * @param steps The number of steps to take for the sequence
     * @param trail Trail iterations to draw. Changing trail length also changes animation speed
     */
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

        this.cassettePlayer = new CassettePlayer();
        this.controls = new Controls(this.cassettePlayer);
        this.chaos = new Chaos(this, this.cassettePlayer);

        const vertices = new Float32Array(steps * trail * 3);
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

        const shaderMaterial = new THREE.ShaderMaterial({
            uniforms: {
                colorTexture: {
                    value: Rendering.getColorTexture()
                },
                pixelRatio: {
                    value: window.devicePixelRatio
                }
            },
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
        this.camera = new THREE.OrthographicCamera(
            -0.5 * this.screenWorldUnits.x,
            0.5 * this.screenWorldUnits.x,
            0.5 * this.screenWorldUnits.y,
            -0.5 * this.screenWorldUnits.y,
            0, this.steps + 1.0
        );

        const geometry = new THREE.PlaneBufferGeometry(2, 2);
        const material = new THREE.MeshBasicMaterial({color: 0x000000, side: THREE.DoubleSide});
        const plane = new THREE.Mesh(geometry, material);
        this.scene.add(plane);

        // const axesHelper = new THREE.AxesHelper(0.1);
        // this.scene.add(axesHelper);
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
    static getColorTexture(size = 512) {
        const data = new Uint8Array(size * 3); // 32 x 32

        for (let i = 0; i < size; i++) {
            const stride = i * 3;
            const color = Rendering.getRandomColor(i);
            data[stride] = color.r * 255;
            data[stride + 1] = color.g * 255;
            data[stride + 2] = color.b * 255;
        }

        const texture = new THREE.DataTexture(data, size, 1, THREE.RGBFormat);
        texture.needsUpdate = true;

        return texture;
    }
}

export default Rendering;
