// Debug
const debug = false;
const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

var i;

//Global constants
const numParams = 18;
const iters = 512;
const steps = 512;
const deltaMaximum = 1e-3;
const deltaMinimum = 1e-7;
const deltaPerStep = 1e-5;
var rollingDelta = deltaPerStep;

//Static
const tStart = -3.0;
const tEnd = 3.0;

const max = 100000;

//Global variables
let windowW = window.innerWidth;
let windowH = window.innerHeight;
let pixelRatio = window.devicePixelRatio;
let plotScale = 0.25;
let plotX = 0.0;
let plotY = 0.0;

// Viewport in world units
const screenWorldUnits = new THREE.Vector2(5.0, 5.0 * windowH / windowW);

//Simulation variables
var t = tStart;

var params = [];
var speedMult = 1.0;
var paused = false;
var trailType = 0;
var dotType = 0;
var loadStarted = false;
var shuffleEqu = true;
var iterationLimit = false;

var cpuVertexArray = new Float32Array(iters * 3);
var cpuBufferGeometry = new THREE.BufferGeometry();
cpuBufferGeometry.addAttribute('position', new THREE.BufferAttribute(cpuVertexArray, 3));

var computeVertexArray = new Float32Array(iters * steps * 3);
var computeBufferGeometry = new THREE.BufferGeometry();
computeBufferGeometry.addAttribute('position', new THREE.BufferAttribute(computeVertexArray, 3));

// Set vertex positions on pixel coordinates
var rowCounter = 0;
var colCounter = 0;
for (i = 2; i < computeVertexArray.length; i += 3) {
    computeVertexArray[i - 2] = rowCounter;// / iters;
    computeVertexArray[i - 1] = colCounter;// / steps;

    rowCounter++;
    if (rowCounter >= iters) {
        rowCounter = 0;
        colCounter++;
    }
}

// TODO random colors

function getRandColor(seed) {
    var r = Math.min(255, 90 + (seed * 11909) % 256);
    var g = Math.min(255, 90 + (seed * 52973) % 256);
    var b = Math.min(255, 90 + (seed * 44111) % 256);
    return new THREE.Color(r / 255.0, g / 255.0, b / 255.0);
}

// Generate random parameters for the chaos
function randParams() {
    for (i = 0; i < numParams; i++) {
        var r = chance.integer({min: 0, max: 3}); // TODO 3 inclusive?
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
}

function resetPlot() {
    plotScale = 0.25;
    plotX = 0.0;
    plotY = 0.0;
}

var lx, ly = 0;

function clamp(num, min, max) {
    return num <= min ? min : num >= max ? max : num;
}

/**
 * Only do the first iteration on the CPU, and check delta
 */
function getNextDeltaTime() {
    var t2 = t;

    var nextIndex = 0;

    var isOffScreen = true;
    var x = t2;
    var y = t2;

    var delta = deltaPerStep * speedMult;
    rollingDelta = rollingDelta * 0.99 + delta * 0.01;

    for (i = 0; i < iters; i++) {

        var xx = x * x;
        var yy = y * y;
        var tt = t2 * t2;
        var xy = x * y;
        var xt = x * t2;
        var yt = y * t2;
        var nx = xx * params[0] + yy * params[1] + tt * params[2] + xy * params[3] + xt * params[4] + yt * params[5] + x * params[6] + y * params[7] + t2 * params[8];
        var ny = xx * params[9] + yy * params[10] + tt * params[11] + xy * params[12] + xt * params[13] + yt * params[14] + x * params[15] + y * params[16] + t2 * params[17];

        nx = clamp(nx, -10000, 10000);
        ny = clamp(ny, -10000, 10000);

        y = ny;
        x = nx;

        cpuVertexArray[nextIndex] = nx + 0.1;
        cpuVertexArray[nextIndex + 1] = ny;
        cpuVertexArray[nextIndex + 2] = 0.0;
        nextIndex += 3;

        if (pointIsInViewport(nx, ny)) {
            const dx = lx - nx;
            const dy = ly - ny;

            const dist = 500.0 * Math.sqrt(dx * dx + dy * dy);
            rollingDelta = Math.min(rollingDelta, Math.max(delta / (dist + 1e-5), deltaMinimum * speedMult));
            isOffScreen = false;
        }

        lx = nx;
        ly = ny;
    }

    if (isOffScreen) {
        return deltaMaximum;
    }

    return rollingDelta;

}

function applyComputeChaos() {

    if (t > tEnd) {
        randParams();
        t = tStart;
    }

    var paramsX = new THREE.Matrix3();
    var paramsY = new THREE.Matrix3();

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

    var deltaTime = getNextDeltaTime();
    console.log(deltaTime);

    uniforms.deltaTime.value = deltaTime;
    uniforms.startTime.value = t;

    t += deltaTime * steps;

}


// If point is in ortho viewport
function pointIsInViewport(x, y) {
    var sx = screenWorldUnits.x * 0.5;
    var sy = screenWorldUnits.y * 0.5;
    return x > -sx && x < sx && y > -sy && y < sy;
}

var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var camera, scene, renderer;
init();
animate();

var computePoints;

var uniforms;

function createColorTexture() {
    var data = new Uint8Array(steps * iters * 3);

    for (var i = 0; i < (steps * iters); i++) {
        var color = getRandColor(i);

        var stride = i * 3;

        data[stride] = color.r * 255;
        data[stride + 1] = color.g * 255;
        data[stride + 2] = color.b * 255;
    }

    var texture = new THREE.DataTexture(data, iters, steps, THREE.RGBFormat);
    texture.needsUpdate = true;

    return texture;
}

function init() {

    randParams();

    camera = new THREE.OrthographicCamera(screenWorldUnits.x / -2, screenWorldUnits.x / 2, screenWorldUnits.y / 2, screenWorldUnits.y / -2, 1, 1000);
    camera.position.z = 10;

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        precision: "lowp",
        depth: false
    });
    renderer.debug.checkShaderErrors = debug;

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(renderer.domElement);

    uniforms = {
        iters: {value: iters},
        steps: {value: steps},
        startTime: {value: t},
        deltaTime: {value: 0.01},
        px: {value: null},
        py: {value: null},
        pixelRatio: {value: pixelRatio},
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
        var pointsMaterial = new THREE.PointsMaterial({color: 0xff0000, size: 2.0});
        var debugPoints = new THREE.Points(cpuBufferGeometry, pointsMaterial);
        scene.add(debugPoints);
    }

    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('touchstart', onDocumentTouchStart, false);
    document.addEventListener('touchmove', onDocumentTouchMove, false);

    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

//
function onDocumentMouseMove(event) {
    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;
}

function onDocumentTouchStart(event) {
    if (event.touches.length > 1) {
        event.preventDefault();
        mouseX = event.touches[0].pageX - windowHalfX;
        mouseY = event.touches[0].pageY - windowHalfY;
    }
}

function onDocumentTouchMove(event) {
    if (event.touches.length == 1) {
        event.preventDefault();
        mouseX = event.touches[0].pageX - windowHalfX;
        mouseY = event.touches[0].pageY - windowHalfY;
    }
}

function dot(a, b) {
    return a.map(function (x, i) {
        return a[i] * b[i];
    }).reduce(function (m, n) {
        return m + n;
    });
}

function animate() {
    stats.begin();

    applyComputeChaos();

    if (debug) {
        cpuBufferGeometry.attributes.position.needsUpdate = true;
        cpuBufferGeometry.computeBoundingSphere();
    }

    //renderer.setRenderTarget(null);
    renderer.render(scene, camera);

    stats.end();

    requestAnimationFrame(animate);
}
