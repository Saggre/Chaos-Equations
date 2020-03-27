"use strict";

// Debug variables
const debug = true;
const stats = new Stats();

let i;

// Time variables and constants
const deltaMaximum = 1e-3;
const deltaMinimum = 1e-7;
const deltaPerStep = 1e-5;
const tStart = -3.0;
const tEnd = 3.0;
let rollingDelta = deltaPerStep;

// Computational and simulation variables
let iters = 512;
let steps = 512;
let t = tStart;
let params = [];
let paused = false;

// THREE.js variables
let camera, scene, renderer;
let computePoints;
let uniforms;

// DOM variables
let windowW = window.innerWidth;
let windowH = window.innerHeight;

// Viewport in world units
const screenWorldUnits = new THREE.Vector2(5.0, 5.0 * windowH / windowW);

// Base27 conversion
const CHAR_TO_N = {
    _: 0,
    A: 1, N: 14,
    B: 2, O: 15,
    C: 3, P: 16,
    D: 4, Q: 17,
    E: 5, R: 18,
    F: 6, S: 19,
    G: 7, T: 20,
    H: 8, U: 21,
    I: 9, V: 22,
    J: 10, W: 23,
    K: 11, X: 24,
    L: 12, Y: 25,
    M: 13, Z: 26,
};


// Points used to debug
let debugVertexArray = new Float32Array(iters * 3);
let debugBufferGeometry = new THREE.BufferGeometry();
debugBufferGeometry.addAttribute('position', new THREE.BufferAttribute(debugVertexArray, 3));

// Actual points used in rendering
let computeVertexArray = new Float32Array(iters * steps * 3);
let computeBufferGeometry = new THREE.BufferGeometry();
computeBufferGeometry.addAttribute('position', new THREE.BufferAttribute(computeVertexArray, 3));

/**
 * Sets everything up
 */
function init() {

    if (debug) {
        stats.showPanel(0);
        document.body.appendChild(stats.dom);
    }

    initVertices();
    randParams(params);

    camera = new THREE.OrthographicCamera(screenWorldUnits.x / -2, screenWorldUnits.x / 2, screenWorldUnits.y / 2, screenWorldUnits.y / -2, 1, 1000);
    camera.position.z = 10;

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        precision: "mediump",
        depth: false
    });

    renderer.debug.checkShaderErrors = debug;

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(renderer.domElement);

    uniforms = {
        iters: {value: iters},
        steps: {value: steps},
        cpuTime: {value: t},
        deltaTime: {value: 0.01},
        px: {value: null},
        py: {value: null},
        pixelRatio: {value: window.devicePixelRatio},
        colorTexture: {value: createColorTexture()}
    };

    let visualShaderMaterial = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: document.getElementById('vertexShader').textContent,
        fragmentShader: document.getElementById('fragmentShader').textContent,
    });

    computePoints = new THREE.Points(computeBufferGeometry, visualShaderMaterial);
    scene.add(computePoints);

    if (debug) {
        let pointsMaterial = new THREE.PointsMaterial({color: 0xff0000, size: 2.0});
        let debugPoints = new THREE.Points(debugBufferGeometry, pointsMaterial);
        scene.add(debugPoints);
    }

    window.addEventListener('resize', onWindowResize, false);
}

/**
 * Set vertex positions on pixel coordinates
 */
function initVertices() {
    let rowCounter = 0;
    let colCounter = 0;
    for (i = 2; i < computeVertexArray.length; i += 3) {
        computeVertexArray[i - 2] = rowCounter;// / iters;
        computeVertexArray[i - 1] = colCounter;// / steps;

        rowCounter++;
        if (rowCounter >= iters) {
            rowCounter = 0;
            colCounter++;
        }
    }
}

/**
 * Generate random parameters for chaos
 */
function randParams(params) {
    for (i = 0; i < 18; i++) {
        let r = chance.integer({min: 0, max: 3});
        if (r === 0) {
            params[i] = 1.0;
        } else if (r === 1) {
            params[i] = -1.0;
        } else {
            params[i] = 0.0;
        }
    }

    if (debug) {
        console.log("Params set to: " + params);
    }

    createUI(params);
}

/**
 * Prepares DOM UI elements
 * @param params
 */
function createUI(params) {
    document.getElementById("chaos-ui--x-equation").textContent = "x' = " + makeEquationStr(params.slice(0, 9));
    document.getElementById("chaos-ui--y-equation").textContent = "y' = " + makeEquationStr(params.slice(9, 18));
    document.getElementById("chaos-ui--code").textContent = "Code: " + paramsToString(params);
    document.getElementById("chaos-ui--time").textContent = "t = " + t.toFixed(6);
}

/**
 * Updates DOM UI elements
 */
function updateUI() {
    document.getElementById("chaos-ui--time").textContent = "t = " + t.toFixed(6);
}

/**
 * Encodes 18 parameters into a string
 * @param params
 * @returns {string}
 */
function paramsToString(params) {
    const base27 = "_ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let a = 0;
    let n = 0;
    let result = "";
    for (i = 0; i < 18; i++) {
        a = a * 3 + Math.floor(params[i]) + 1;
        n += 1;
        if (n === 3) {
            result += base27.charAt(a);
            a = 0;
            n = 0;
        }
    }
    return result;
}

/**
 * Decodes and sets params from a string
 * @param str
 * @param params
 */
function stringToParams(str, params) {
    const ustr = str.toUpperCase();
    for (i = 0; i < 18 / 3; i++) {
        let a = 0;
        const c = (i < ustr.length ? ustr.charAt(i) : '_');
        if (CHAR_TO_N[c] >= CHAR_TO_N.A && CHAR_TO_N[c] <= CHAR_TO_N.Z) {
            a = (CHAR_TO_N[c] - CHAR_TO_N.A) + 1;
        }
        params[i * 3 + 2] = Math.floor((a % 3) - 1.0);
        a /= 3;
        params[i * 3 + 1] = Math.floor((a % 3) - 1.0);
        a /= 3;
        params[i * 3] = Math.floor((a % 3) - 1.0);
    }
}

function floatEquals(a, b) {
    return Math.abs(b - a) < 0.001;
}

function makeEquationStr(params) {

    /**
     * @return {string}
     */
    function SIGN_OR_SKIP(param, mathVariable, isFirst = false) {
        let string = "";

        if (!floatEquals(param, 0.0)) {
            if (isFirst) {
                if (floatEquals(param, -1.0)) {
                    string += "-";
                }
            } else {
                if (floatEquals(param, -1.0)) {
                    string += " - ";
                } else {
                    string += " + ";
                }
            }
            string += mathVariable;
        }

        return string;
    }

    let equationStr = "";

    equationStr += SIGN_OR_SKIP(params[0], "x\u00b2", true);
    equationStr += SIGN_OR_SKIP(params[1], "y\u00b2");
    equationStr += SIGN_OR_SKIP(params[2], "t\u00b2");
    equationStr += SIGN_OR_SKIP(params[3], "xy");
    equationStr += SIGN_OR_SKIP(params[4], "xt");
    equationStr += SIGN_OR_SKIP(params[5], "yt");
    equationStr += SIGN_OR_SKIP(params[6], "x");
    equationStr += SIGN_OR_SKIP(params[7], "y");
    equationStr += SIGN_OR_SKIP(params[8], "t");

    return equationStr;
}

let ly = new Array(iters);
let lx = new Array(iters);

/**
 * Only do the first iterations on the CPU, and check delta
 */
function getNextDeltaTime() {
    let isOffScreen = true;
    let x = t;
    let y = t;

    let delta = deltaPerStep;
    rollingDelta = rollingDelta * 0.99 + delta * 0.01;

    for (i = 0; i < iters; i++) {

        let xx = x * x;
        let yy = y * y;
        let tt = t * t;
        let xy = x * y;
        let xt = x * t;
        let yt = y * t;
        let nx = xx * params[0] + yy * params[1] + tt * params[2] + xy * params[3] + xt * params[4] + yt * params[5] + x * params[6] + y * params[7] + t * params[8];
        let ny = xx * params[9] + yy * params[10] + tt * params[11] + xy * params[12] + xt * params[13] + yt * params[14] + x * params[15] + y * params[16] + t * params[17];

        nx = clamp(nx, -10000, 10000);
        ny = clamp(ny, -10000, 10000);

        y = ny;
        x = nx;

        if (debug) {
            debugVertexArray[i * 3] = nx + 0.1;
            debugVertexArray[i * 3 + 1] = ny;
        }

        if (pointIsInViewport(nx, ny)) {
            const dx = lx[i] - nx;
            const dy = ly[i] - ny;

            const dist = 500.0 * Math.sqrt(dx * dx + dy * dy);
            rollingDelta = Math.min(rollingDelta, Math.max(delta / (dist + 1e-5), deltaMinimum));
            isOffScreen = false;
        }

        lx[i] = nx;
        ly[i] = ny;
    }

    if (isOffScreen) {
        return deltaMaximum;
    }

    if (isNaN(rollingDelta)) {
        rollingDelta = deltaPerStep;
    }

    return rollingDelta;
}

/**
 * Updates shader uniforms
 */
function updateShader() {

    if (t > tEnd) {
        randParams(params);
        t = tStart;
    }

    let paramsX = new THREE.Matrix3();
    let paramsY = new THREE.Matrix3();

    paramsX.set(
        params[0], params[1], params[2],
        params[3], params[4], params[5],
        params[6], params[7], params[8]
    );

    paramsY.set(
        params[9], params[10], params[11],
        params[12], params[13], params[14],
        params[15], params[16], params[17]
    );

    uniforms.px.value = paramsX;
    uniforms.py.value = paramsY;

    let deltaTime = getNextDeltaTime();

    uniforms.deltaTime.value = deltaTime;
    uniforms.cpuTime.value = t;
    t += deltaTime * steps;

}

/**
 * Checks if a a point is in viewport
 * @param x
 * @param y
 * @returns {boolean}
 */
function pointIsInViewport(x, y) {
    let sx = screenWorldUnits.x * 0.5;
    let sy = screenWorldUnits.y * 0.5;
    return x > -sx && x < sx && y > -sy && y < sy;
}

/**
 * Creates a texture for vertex colors
 * @returns {DataTexture}
 */
function createColorTexture() {
    let data = new Uint8Array(steps * iters * 3);

    for (let i = 0; i < (steps * iters); i++) {
        let color = getNextColor(i);

        let stride = i * 3;

        data[stride] = color.r * 255;
        data[stride + 1] = color.g * 255;
        data[stride + 2] = color.b * 255;
    }

    let texture = new THREE.DataTexture(data, iters, steps, THREE.RGBFormat);
    texture.needsUpdate = true;

    return texture;
}

/**
 * Returns bright colors
 * @returns {Color}
 * @param pos
 */
function getNextColor(pos) {
    let r = Math.min(255, 90 + (pos * 11909) % 256);
    let g = Math.min(255, 90 + (pos * 52973) % 256);
    let b = Math.min(255, 90 + (pos * 44111) % 256);
    return new THREE.Color(r / 255.0, g / 255.0, b / 255.0);
}

/**
 * Animates
 */
function animate() {
    stats.begin();

    updateUI();
    updateShader();

    if (debug) {
        debugBufferGeometry.attributes.position.needsUpdate = true;
        debugBufferGeometry.computeBoundingSphere();
    }

    renderer.render(scene, camera);

    stats.end();

    requestAnimationFrame(animate);
}

/**
 * On window resize
 */
function onWindowResize() {
    windowW = window.innerWidth;
    windowH = window.innerHeight;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * Dot product helper
 * @param a
 * @param b
 * @returns {Number}
 */
function dot(a, b) {
    return a.map(function (x, i) {
        return a[i] * b[i];
    }).reduce(function (m, n) {
        return m + n;
    });
}

/**
 * Clamp helper
 * @param num
 * @param min
 * @param max
 * @returns {Number}
 */
function clamp(num, min, max) {
    return num <= min ? min : num >= max ? max : num;
}


init();
animate();