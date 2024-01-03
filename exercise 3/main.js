import * as THREE from 'three';
import { GUI } from 'dat.gui'

//Import MediaPipe from a CDN
import { FaceDetector, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

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
cameraR.parent = camera;
cameraL.parent = camera;

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
    'ScreenWidth': 0.35, // Screen physical width (metres). Measure your window!
    'TrackerScale': 0.00015 //because origin is at center of the screen, so we take double of our typical 0.001
};

const stereoButton = gui.add(params, 'Stereo', true);
gui.add(params, 'IPD', 0.0, 0.2);
gui.add(params, 'Convergence', 0.01, 10.0);
gui.add(params, 'ConvergenceMesh', false);
gui.add(params, 'Converge', true);
gui.add(params, 'CameraX', -1.0, 1.0).listen();
gui.add(params, 'CameraY', -1.0, 1.0).listen();
gui.add(params, 'CameraZ', 0.0, 5.0);
gui.add(params, 'TrackerScale', 0.0, 1.0);
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

// Add convergence helper plane
const convergenceMesh = new THREE.Group();
convergenceMesh.add(new THREE.Mesh(
  new THREE.PlaneGeometry(0.01, 0.01),
  new THREE.MeshPhongMaterial({ color: 0xff0000 }),
));
const convergenceLines = new THREE.Group();
convergenceLines.add(new THREE.Mesh(
  new THREE.PlaneGeometry(1, 0.0005),
  new THREE.MeshPhongMaterial({ color: 0xff0000 }),
));
convergenceLines.add(new THREE.Mesh(
  new THREE.PlaneGeometry(0.0005, 1),
  new THREE.MeshPhongMaterial({ color: 0xff0000 }),
));
convergenceMesh.add(convergenceLines);
const convergenceLines2 = convergenceLines.clone();
convergenceLines2.rotation.z = 0.785398; // 45 degrees in radian
convergenceMesh.add(convergenceLines2);
convergenceMesh.rotation.z = 0.785398; // 45 degrees in radian
convergenceMesh.visible = false;
scene.add(convergenceMesh);

// World "bounding box"
const worldBox = new THREE.Mesh(
new THREE.BoxGeometry(1, 1, 1),
new THREE.MeshPhongMaterial({ color: 0x909090, side: THREE.BackSide})
);
scene.add(worldBox); 


// face detection
let faceDetector;
let runningMode = "VIDEO";
var videoInput = document.getElementById("inputVideo");

//Initialize the face detection API
const initializefaceDetector = async () => {
  const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm");
  faceDetector = await FaceDetector.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite`,
      delegate: "GPU",
      maxNumFaces: 1
    },
    runningMode: runningMode
  });
  enableCam();
};

//Enable the computer camera and continously update
async function enableCam() {
  // getUsermedia parameters
  const constraints = {
    video: true
  };
  // Activate the webcam stream.
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(function(stream) {
      videoInput.srcObject = stream;
      videoInput.addEventListener("loadeddata", predictWebcam);
    })
    .catch((err) => {
      console.error(err);
    });
}

//Detects faces and creates constraints to them
let lastVideoTime = -1;
async function predictWebcam() {
  // if image mode is initialized, create a new classifier with video runningMode
  if (runningMode === "IMAGE") {
    runningMode = "VIDEO";
    await faceDetector.setOptions({ runningMode: "VIDEO" });
  }
  let startTimeMs = performance.now();
  // Detect faces using detectForVideo
  if (videoInput.currentTime !== lastVideoTime) {
    lastVideoTime = videoInput.currentTime;
    const detections = faceDetector.detectForVideo(videoInput, startTimeMs)
      .detections;
    if(detections.length > 0)  updateFacePosition(detections);
  }
  // Call this function again to keep predicting when the browser is ready
  window.requestAnimationFrame(predictWebcam);
}

var trackedHeadPos = {'x':0, 'y':0};
const cameraOffset = new THREE.Vector3(0, 0, 0);

function updateFacePosition(detections){
    trackedHeadPos.x = detections[0].boundingBox.originX;
    trackedHeadPos.y = detections[0].boundingBox.originY;
    //console.log(trackedHeadPos);
    params.CameraX = (trackedHeadPos.x-cameraOffset.x) * params.TrackerScale;
    params.CameraY = (trackedHeadPos.y-cameraOffset.y) * params.TrackerScale;
    console.log(params);
    
    //camera.position.set(params.CameraX, params.CameraY, 0);
    //camera.updateMatrixWorld();
    //camera.updateProjectionMatrix(); 

}

var obj = { Calibrate:function(){
  cameraOffset.x = trackedHeadPos.x;
  cameraOffset.y = trackedHeadPos.y;
}};
gui.add(obj,'Calibrate');


initializefaceDetector();
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

function makeFrustum(M, left, right, bottom, top, znear, zfar) {
    M.set(((2*znear)/(right-left)), 0, ((right+left)/(right-left)), 0,
         0, ((2*znear)/(top-bottom)), ((top+bottom)/(top-bottom)), 0,
         0, 0, (-(zfar+znear)/(zfar-znear)), (-(2*zfar*znear)/(zfar-znear)), 
         0, 0, -1, 0);
}

function cameraSetProjectionMatrix(camera, offset, halfW, halfH) {
    var near = camera.near;
    const far = camera.far;
    var eyePos = new THREE.Vector3(0, 0, 0);
    camera.getWorldPosition(eyePos);  //returns the position of the camera in world space and camera pos = eye pos
    // left and bottom are negative, top and right are positive
    //TODO: needs changes here for head tracking to work. Need to subtract the eye positions 
    var left = -halfW - eyePos.x, right = halfW - eyePos.x, top = halfH - eyePos.y, bottom = -halfH - eyePos.y; 
    // Shift the screen by an offset to control convergence
    left += offset;
    right += offset;
    // makeFrustum expects the top, bottom, left and right to be of the near plane of our
    //frustum, not our projection screen. So scale the values by ‘nearOverDis‘
    const nearOverDist = near / eyePos.z;
    left *= nearOverDist;
    right *= nearOverDist;
    top *= nearOverDist;
    bottom *= nearOverDist;
    // These are all equivalent
    makeFrustum(camera.projectionMatrix, left, right, bottom, top, near, far);
    camera.updateProjectionMatrix(); 
}

function render() { 
    // Render the scene and the camera
    if(params.Stereo){
        // here camera.fov is the angular fov
        camera.fov = (180/Math.PI) * (2 * Math.atan((windowHeight * 0.5)/params.CameraZ));
        //console.log(camera.fov);
        cameraL.copy(camera);
        cameraR.copy(camera);
        const halfIPD = params.IPD * 0.5;
        cameraL.position.set(-halfIPD, 0, 0);
        cameraR.position.set(halfIPD, 0, 0);

        const convergencePoint = new THREE.Vector3(0, 0, params.CameraZ - params.Convergence);
        //off axis projection
        if (params.Converge && params.OffAxis) {
            console.log("converging via off axis projection...");
            var offset = ((params.Convergence - params.CameraZ) / params.Convergence) 
                            * (0.5  * params.IPD);
            const halfWindowWidth = windowWidth / 2;
            const halfWindowHeight = windowHeight / 2;
            cameraSetProjectionMatrix(cameraL, -offset, halfWindowWidth, halfWindowHeight);
            cameraSetProjectionMatrix(cameraR, +offset, halfWindowWidth, halfWindowHeight);
        }
        if (params.Converge && params.ToeIn) {
            console.log("converging via toe in...");
            //console.log(convergencePoint);
            cameraL.lookAt(convergencePoint);
            cameraR.lookAt(convergencePoint);
        }

         // Hide / show convergence helper plane
        if (typeof params !== 'undefined' &&
            typeof convergencePoint !== 'undefined' &&
            params.ConvergenceMesh
        ) {
            console.log("Showing convergence mesh helper...");
            convergenceMesh.visible = true;
            convergenceMesh.position.set(convergencePoint.x, convergencePoint.y, convergencePoint.z);
        } else {
            //console.log("Hiding convergence mesh helper...");
            convergenceMesh.visible = false;
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
    camera.updateProjectionMatrix(); 
    
    cameraL.updateMatrixWorld();
    cameraR.updateMatrixWorld();

    requestAnimationFrame(render);
}

render();