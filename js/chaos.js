// Debug
const debug = false;
const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

var i;

//Global constants
const numParams = 18;
const iters = 512; //800
const steps = 1024; //500;
const deltaPerStep = 1e-5;
const deltaMinimum = 1e-7;
//Static
const tStart = -3.0;
const tEnd = 3.0;

const max = 100000;

//Global variables
let windowW = window.innerWidth;
let windowH = window.innerHeight;
let plotScale = 0.25;
let plotX = 0.0;
let plotY = 0.0;

// Viewport in world units
const screenWorldUnits = new THREE.Vector2(10.0, 10.0 * windowH / windowW);

//Simulation variables
var t = tStart;
var time = tStart;

var rollingDelta = deltaPerStep;
var params = [];
var speedMult = 1.0;
var paused = false;
var trailType = 0;
var dotType = 0;
var loadStarted = false;
var shuffleEqu = true;
var iterationLimit = false;

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

// Random color
function getRandColor(seed) {
    i += 1;
    var r = Math.min(255, 50 + (i * 11909) % 256);
    var g = Math.min(255, 50 + (i * 52973) % 256);
    var b = Math.min(255, 50 + (i * 44111) % 256);
    return THREE.Color(r / 255.0, g / 255.0, b / 255.0); // TODO alpha
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

function toWorldCoods(x, y) {
    var scaleDivider = 4.0;
    var nx = Math.sign(x) * Math.min(max, Math.abs(x));
    var ny = Math.sign(y) * Math.min(max, Math.abs(y));
    return new THREE.Vector2(nx / scaleDivider, ny / scaleDivider);
}

var lastPos = new THREE.Vector2(0, 0);

/**
 * Only do the first iteration on the CPU, and check delta
 */
function getNextDeltaTime() {
    var delta = deltaPerStep * speedMult;
    rollingDelta = rollingDelta * 0.99 + delta * 0.01;

    var isOffScreen = true;
    var x = t;
    var y = t;

    var xx = x * x;
    var yy = y * y;
    var tt = t * t;
    var xy = x * y;
    var xt = x * t;
    var yt = y * t;
    var nx = xx * params[0] + yy * params[1] + tt * params[2] + xy * params[3] + xt * params[4] + yt * params[5] + x * params[6] + y * params[7] + t * params[8];
    var ny = xx * params[9] + yy * params[10] + tt * params[11] + xy * params[12] + xt * params[13] + yt * params[14] + x * params[15] + y * params[16] + t * params[17];

    var worldPos = toWorldCoods(nx, ny);

    if (pointIsInViewport(worldPos.x, worldPos.y)) {
        const dx = lastPos.x - worldPos.x; // TODO check delta
        const dy = lastPos.y - worldPos.y;

        const dist = 500.0 * Math.sqrt(dx * dx + dy * dy);
        rollingDelta = Math.min(rollingDelta, Math.max(delta / (dist + 1e-5), deltaMinimum * speedMult));
        isOffScreen = false;
    }

    lastPos = worldPos;

    if (isOffScreen) {
        return 0.01;
    }

    return rollingDelta;
}

function applyComputeChaos() {

    if (time > tEnd) {
        randParams();
        time = tStart;
    }

    var matrixParamsX = new THREE.Matrix3();
    var matrixParamsY = new THREE.Matrix3();

    matrixParamsX.set(
        params[0], params[1], params[2],
        params[3], params[4], params[5],
        params[6], params[7], params[8]
    );

    matrixParamsY.set(
        params[9], params[10], params[11],
        params[12], params[13], params[14],
        params[15], params[16], params[17]
    );

    uniforms.startTime.value = time;
    uniforms.paramsX.value = matrixParamsX;
    uniforms.paramsY.value = matrixParamsY;

    var deltaTime = getNextDeltaTime();
    time += deltaTime * iters;
    uniforms.deltaTime.value = deltaTime;
}


// If point is in ortho viewport
function pointIsInViewport(x, y) {
    var sx = screenWorldUnits.x / 2.0;
    var sy = screenWorldUnits.y / 2.0;
    return x > -sx && x < sx && y > -sy && y < sy;
}

var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var camera, scene, renderer;
var bufferCamera, bufferScene, bufferTextureA, bufferTextureB, bts;
init();
animate();

var computePoints;

var uniforms;

function init() {

    randParams();

    camera = new THREE.OrthographicCamera(screenWorldUnits.x / -2, screenWorldUnits.x / 2, screenWorldUnits.y / 2, screenWorldUnits.y / -2, 1, 1000);
    camera.position.z = 10;

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(renderer.domElement);

    var matrixParamsX = new THREE.Matrix3();
    var matrixParamsY = new THREE.Matrix3();

    matrixParamsX.set(
        params[0], params[1], params[2],
        params[3], params[4], params[5],
        params[6], params[7], params[8]
    );

    matrixParamsY.set(
        params[9], params[10], params[11],
        params[12], params[13], params[14],
        params[15], params[16], params[17]
    );

    uniforms = {
        iters: {value: iters},
        steps: {value: steps},
        startTime: {value: time},
        deltaTime: {value: 0.01},
        paramsX: {value: matrixParamsX},
        paramsY: {value: matrixParamsY}
    };

    let visualShaderMaterial = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: document.getElementById('vertexShader').textContent,
        fragmentShader: document.getElementById('fragmentShader').textContent,
    });

    computePoints = new THREE.Points(computeBufferGeometry, visualShaderMaterial);
    scene.add(computePoints);

    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('touchstart', onDocumentTouchStart, false);
    document.addEventListener('touchmove', onDocumentTouchMove, false);
    //
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

    //renderer.setRenderTarget(null);
    renderer.render(scene, camera);
    stats.end();

    requestAnimationFrame(animate);
}
