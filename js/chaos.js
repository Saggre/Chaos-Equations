// Debug
const debug = true;
const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

//Global constants
const numParams = 18;
const iters = 200; //800
const stepsPerFrame = 200; //500;
const deltaPerStep = 1e-5;
const deltaMinimum = 1e-7;
//Static
const tStart = -3.0;
const tEnd = 3.0;
const fullscreen = false;

const max = 100000;

//Global variables
let windowW = window.innerWidth;
let windowH = window.innerHeight;
let windowBits = 24;
let plotScale = 0.25;
let plotX = 0.0;
let plotY = 0.0;

const screenWorldUnits = new THREE.Vector2(10.0, 10.0 * windowH / windowW);

//Simulation variables
var t = tStart;
var history = new Float32Array(iters * 2 + 1).fill(0.0);

for (var i = 0; i < iters * 3; i++) {
    history[i] = 0;
}

var rollingDelta = deltaPerStep;
var params = [];
var speedMult = 1.0;
var paused = false;
var trailType = 0;
var dotType = 0;
var loadStarted = false;
var shuffleEqu = true;
var iterationLimit = false;

//Setup the vertex array
var vertexArray = new Float32Array(stepsPerFrame * iters * 3);
var bufferGeometry = new THREE.BufferGeometry();
bufferGeometry.addAttribute('position', new THREE.BufferAttribute(vertexArray, 3));

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
    for (var i = 0; i < numParams; i++) {
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
    return new THREE.Vector3(nx / scaleDivider, ny / scaleDivider, 0);
}

//Apply chaos
function applyChaos() {

    //Automatic restart
    if (t > tEnd) {
        //if (shuffle_equ) {
        //ResetPlot();
        RandParams();
        t = tStart;
        //}
        //GenerateNew(window, t, params); // TODO UI
    }

    //Smooth out the stepping speed.
    var delta = deltaPerStep * speedMult;
    rollingDelta = rollingDelta * 0.99 + delta * 0.01;

    var nextIndex = 0;

    for (var step = 0; step < stepsPerFrame; step++) {
        var isOffScreen = true;
        var x = t;
        var y = t;

        for (var iter = 0; iter < iters; iter++) {
            var xx = x * x;
            var yy = y * y;
            var tt = t * t;
            var xy = x * y;
            var xt = x * t;
            var yt = y * t;
            var nx = xx * params[0] + yy * params[1] + tt * params[2] + xy * params[3] + xt * params[4] + yt * params[5] + x * params[6] + y * params[7] + t * params[8];
            var ny = xx * params[9] + yy * params[10] + tt * params[11] + xy * params[12] + xt * params[13] + yt * params[14] + x * params[15] + y * params[16] + t * params[17];

            worldPos = toWorldCoods(nx, ny);

            // TODO error
            x = worldPos.x;
            y = worldPos.y;

            /*if (iterationLimit && iter < 100) {
                // TODO why
                screenPt.x = Number.MAX_VALUE;
                screenPt.y = Number.MAX_VALUE;
            }*/

            vertexArray[nextIndex] = worldPos.x;
            vertexArray[nextIndex + 1] = worldPos.y;
            //vertexArray[nextIndex + 2] = worldPos.z;
            nextIndex += 3;

            //Check if dynamic delta should be adjusted
            if (pointIsInViewport(worldPos.x, worldPos.y)) {
                const dx = history[iter * 2] - x; // TODO check delta
                const dy = history[iter * 2 + 1] - y;

                const dist = 500.0 * Math.sqrt(dx * dx + dy * dy);
                rollingDelta = Math.min(rollingDelta, Math.max(delta / (dist + 1e-5), deltaMinimum * speedMult));
                isOffScreen = false;
            }

            history[iter * 2] = x;
            history[iter * 2 + 1] = y;
        }

        //Update the t variable
        if (isOffScreen) {
            t += 0.01;
        } else {
            t += rollingDelta;
        }
    }

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
var bufferCamera, bufferScene, bufferTextureA, bufferTextureB;
var useBufferTextureA = true;
init();
animate();

var points;

var debugBoxMaterial;

var uniforms;

function init() {

    randParams();

    bufferCamera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 1, 1000);
    bufferCamera.position.z = 10;

    camera = new THREE.OrthographicCamera(screenWorldUnits.x / -2, screenWorldUnits.x / 2, screenWorldUnits.y / 2, screenWorldUnits.y / -2, 1, 1000);
    camera.position.z = 10;

    scene = new THREE.Scene();
    bufferScene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    bufferTextureA = new THREE.WebGLRenderTarget(512, 512, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.NearestFilter
    });
    bufferTextureB = new THREE.WebGLRenderTarget(512, 512, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.NearestFilter
    });
    // TODO texRenderer

    document.body.appendChild(renderer.domElement);

    debugBoxMaterial = new THREE.MeshBasicMaterial({map: bufferTextureA.texture});
    //debugBoxMaterial = new THREE.MeshBasicMaterial({color: 0xff0000});
    var debugBoxGeometry = new THREE.BoxGeometry(1, 1, 1);
    var debugBoxObject = new THREE.Mesh(debugBoxGeometry, debugBoxMaterial);
    scene.add(debugBoxObject);

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
        resolution: {value: new THREE.Vector2(512, 512)},
        texData: {type: "t", value: null},
        time: {value: t},
        paramsX: {value: matrixParamsX},
        paramsY: {value: matrixParamsY}
    };

    let computeShaderMaterial = new THREE.ShaderMaterial({
        uniforms: uniforms,
        fragmentShader: document.getElementById('fragmentComputeShader').textContent,
        vertexShader: document.getElementById('vertexComputeShader').textContent,
    });

    var bufferBoxGeometry = new THREE.BoxGeometry(1, 1, 1);
    var bufferBoxObject = new THREE.Mesh(bufferBoxGeometry, computeShaderMaterial);
    bufferScene.add(bufferBoxObject);

    var starsMaterial = new THREE.PointsMaterial({size: 1, color: 0xff8888});
    points = new THREE.Points(bufferGeometry, starsMaterial);
    scene.add(points);

    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('touchstart', onDocumentTouchStart, false);
    document.addEventListener('touchmove', onDocumentTouchMove, false);
    //
    window.addEventListener('resize', onWindowResize, false);
}

/**
 * Fills a texture of size iters*steps to send to the compute shader
 *
 * @param texture
 */
function fillTexture(texture) {
    var theArray = texture.image.data;
    for (var k = 0, kl = theArray.length; k < kl; k += 4) {
        // RGBA
        theArray[k] = 0;
        theArray[k + 1] = 0;
        theArray[k + 2] = 1;
        theArray[k + 3] = 1;
    }
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

//
function animate() {
    stats.begin();

    applyChaos();
    points.geometry.attributes.position.needsUpdate = true;
    points.geometry.computeBoundingSphere();

    uniforms.time.value = t;

    var bufferTextureFromRender = useBufferTextureA ? bufferTextureA : bufferTextureB;
    renderer.setRenderTarget(bufferTextureFromRender);
    renderer.render(bufferScene, bufferCamera);

    var bufferTextureToShader = useBufferTextureA ? bufferTextureB : bufferTextureA;
    uniforms.texData.value = bufferTextureToShader.texture;

    renderer.setRenderTarget(null);
    renderer.render(scene, camera);
    stats.end();

    requestAnimationFrame(animate);
}
