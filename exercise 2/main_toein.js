import * as THREE from 'three';
import { GUI } from 'dat.gui'

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xaaaaaa, 1);
// Append the renderer canvas into <body>
document.body.appendChild(renderer.domElement);

const ratio = window.innerWidth / window.innerHeight;
const camera = new THREE.PerspectiveCamera(
  30,
  ratio,
  0.01,
  10
);

const cameraL = camera.clone();
const cameraR = camera.clone();

const gl = renderer.getContext('webgl');

var windowWidth, windowHeight;

window.addEventListener('resize', onWindowResize, true);

// On-screen menu for changing parameters
const gui = new GUI();

// GUI params
var params = {
    'IPD': 0.004,
    'Convergence': 0.7, // Distance in front of camera
    'ConvergenceMesh': false, // Mesh helper to see convergence plane
    'Converge': true, // If false, convergence is effectively set at infinity
    'CameraX': 0.0,
    'CameraY': 0.0,
    'CameraZ': 0.5,
    'Stereo': true,
    'ToeIn': true,
    'OffAxis': false,
    'ScreenWidth': 0.52, // Screen physical width (metres). Measure your window!
};

const stereoButton = gui.add(params, 'Stereo', true);
gui.add(params, 'IPD', 0.0, 0.2);
gui.add(params, 'Convergence', 0.01, 10.0);
gui.add(params, 'ConvergenceMesh', false);
gui.add(params, 'Converge', true);
gui.add(params, 'CameraX', -1.0, 1.0);
gui.add(params, 'CameraY', -1.0, 1.0);
gui.add(params, 'CameraZ', 0.0, 5.0);
gui.add(params, 'ToeIn', true)
.onChange(function toggleB() { params.OffAxis = !params.ToeIn; })
.listen();
gui.add(params, 'OffAxis', false)
.onChange(function toggleA() { params.ToeIn = !params.OffAxis; })
.listen();
gui.add(params, 'ScreenWidth', 0.05, 0.80);

const LIGHT_INTENSITY = 1;
const LIGHT_COLOR_WHITE = 0xFFFDD0;
const light = new THREE.DirectionalLight(LIGHT_COLOR_WHITE, LIGHT_INTENSITY);
light.position.set(1, 2, 0.8);
scene.add(light);

// World "bounding box"
const worldBox = new THREE.Mesh(
new THREE.BoxGeometry(1, 1, 1),
new THREE.MeshPhongMaterial({ color: 0x909090, side: THREE.BackSide})
);
scene.add(worldBox); 
onWindowResize()
create3DWorld(0); //TODO: create another 3D world - something which displays anaglyphic images better

// Called only when the window is resized
function onWindowResize() {
    console.log("resizing window...");
    // Calculate real-world window size (in metres)
    const screenAspect = window.screen.width / window.screen.height;
    const screenHeight = params.ScreenWidth / screenAspect;
    // Window size in real-world scale (metres)
    windowWidth = (window.innerWidth / window.screen.width) * params.ScreenWidth;
    windowHeight = (window.innerHeight / window.screen.height) * screenHeight;
    // Rescale our world to match the window
    worldBox.scale.set(windowWidth*2, windowHeight*2, windowWidth * 2);
    worldBox.position.set(0, 0, -windowWidth);
    // Adjust the camera aspect ratio to match the window aspect ratio
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    // Resize the renderer buffers
    renderer.setSize(window.innerWidth, window.innerHeight);
    //create3DWorld(0);
}

// Fill our box with cubes in some kind of arrangement
// 4 different options are available
function create3DWorld(opt) {
    console.log(opt);
    const cubeMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFDD0});
    var block = function (width, height, depth, x, y, z) {
        console.log("adding cube");
        var cube = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), cubeMaterial);
        cube.parent = worldBox;
        cube.position.set(x, y, depth / 2 - z);
        scene.add(cube);
    }
    const i = 11;
    const n = windowWidth / i;
    const j = windowHeight / n;
    const z = windowWidth * 2;
    const w = n;
    var x,y;
    for (x = n / 2 - windowWidth / 2; x < windowWidth / 2; x += n) {
        for (y = n / 2 - windowHeight / 2; y < windowHeight / 2; y += n) {
            switch (opt) {
                case 0:
                default:
                    block(w * Math.random(), w * Math.random(), 2 * w * Math.random(), x, y, z - 1.2 * z * Math.random());
                    break;
                case 1:
                    block(w, w, w, x, y, z - 1.4 * z * Math.random() * Math.cos(Math.PI * x / windowWidth) * Math.cos(Math.PI * y / windowHeight));
                    break;
                case 2:
                    block(w / 2, w / 2, 1.2 * z * Math.random(), x, y, z);
                    break;
                case 3:
                    block(w / 2, w / 2, 1.3 * z * Math.random() * Math.cos(Math.PI * x / windowWidth) * Math.cos(Math.PI * y / windowHeight), x, y, z);
                    break;
            }
        }
    }
}

function render() {
    // Render the scene and the camera
    if(params.Stereo){
        camera.fov = (180/Math.PI) * (2 * Math.atan((windowHeight * 0.5)/params.CameraZ));
        console.log(camera.fov);
        cameraL.copy(camera);
        cameraR.copy(camera);
        const halfIPD = params.IPD * 0.5;
        cameraL.position.set(-halfIPD, 0, 0);
        cameraR.position.set(halfIPD, 0, 0);

        const convergencePoint = new THREE.Vector3(0, 0, params.CameraZ - params.Convergence);
        if (params.Converge && params.ToeIn) {
            console.log("converging...");
            console.log(convergencePoint);
            cameraL.lookAt(convergencePoint);
            cameraR.lookAt(convergencePoint);
        }

        gl.colorMask(true, false, false, true);
        renderer.render(scene, cameraL);
        gl.colorMask(false, true, true, true);
        renderer.render(scene, cameraR);
    }
    
    else{
        gl.colorMask(true, true, true, true);
        renderer.render(scene, camera);
    }
    
    
    camera.position.set(params.CameraX, params.CameraY, params.CameraZ);
    camera.updateMatrixWorld();
    camera.updateProjectionMatrix(); 
    cameraL.updateMatrixWorld();
    cameraR.updateMatrixWorld();

    requestAnimationFrame(render);
}

render();