// Variables for storing the window dimensions in real world (in metres)
var windowWidth, windowHeight;

// Event listener
window.addEventListener('resize', onWindowResize, false);

// Import three.js from a CDN (content delivery network).
import * as THREE from 'https://cdn.skypack.dev/three@v0.133.1';

//Import MediaPipe from a CDN
//import { FaceDetector, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";


// The three.js scene: the 3D world where you put objects
const scene = new THREE.Scene();

// The default camera
// Comment/delete this for task 2.2.5 onwards
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.01,
  10
);
camera.position.z = 5;

// The renderer: something that draws 3D objects onto the canvas
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xaaaaaa, 1);
// Append the renderer canvas into <body>
document.body.appendChild(renderer.domElement);

// Add lights
const hemisphereLight = new THREE.HemisphereLight(0xB1E1FF, 0xB97A20, 0.5);
scene.add(hemisphereLight);
const light = new THREE.DirectionalLight(0xffffff, 0.7);
light.position.set(0.4, 0.8, 0.5);
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

// ===== START Task 2.2.1 =====================================================
// ...
// ===== END Task 2.2.1 =======================================================

// ===== START Task 2.2.2.a ===================================================
// ...
// ===== END Task 2.2.2.a =====================================================

// ===== START Task 2.2.3.a ===================================================
// ...
// ===== END Task 2.2.3.a =====================================================

// ===== START Task 2.2.5.a ===================================================
// ...
// ===== END Task 2.2.5.a =====================================================

// ===== START Task 3.2.0 ===================================================
// let faceDetector;
// let runningMode = "VIDEO";

// Initialize the face detection API
// const initializefaceDetector = async () => {
//   const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm");
//   faceDetector = await FaceDetector.createFromOptions(vision, {
//     baseOptions: {
//       modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite`,
//       delegate: "GPU",
//       maxNumFaces: 1
//     },
//     runningMode: runningMode
//   });
//   enableCam();
// };

// Enable the computer camera and continously update
// async function enableCam() {
//   // getUsermedia parameters
//   const constraints = {
//     video: true
//   };
//   // Activate the webcam stream.
//   navigator.mediaDevices
//     .getUserMedia(constraints)
//     .then(function(stream) {
//       videoInput.srcObject = stream;
//       videoInput.addEventListener("loadeddata", predictWebcam);
//     })
//     .catch((err) => {
//       console.error(err);
//     });
// }

// Detects faces and creates constraints to them
//
// let lastVideoTime = -1;
// async function predictWebcam() {
//   // if image mode is initialized, create a new classifier with video runningMode
//   if (runningMode === "IMAGE") {
//     runningMode = "VIDEO";
//     await faceDetector.setOptions({ runningMode: "VIDEO" });
//   }
//   let startTimeMs = performance.now();
//   // Detect faces using detectForVideo
//   if (videoInput.currentTime !== lastVideoTime) {
//     lastVideoTime = videoInput.currentTime;
//     const detections = faceDetector.detectForVideo(videoInput, startTimeMs)
//       .detections;
//     if(detections.length > 0)  updateFacePosition(detections);
//   }
//   // Call this function again to keep predicting when the browser is ready
//   window.requestAnimationFrame(predictWebcam);
// }
//===== END Task 3.2.0 =====================================================
onWindowResize();

create3DWorld();

render();

// ===== START Task 2.2.2.b ===================================================

// Called only when the window is resized 
function onWindowResize() {
  // ...
}

// ===== END Task 2.2.2.b =====================================================

// ===== START Task 2.2.2.d / Appendix 2.A1 ===================================

// Replace this with your own scene or use Appendix 2.A1
function create3DWorld() {
  scene.add(new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.5, 1),
    new THREE.MeshBasicMaterial({ color: 0x00ff00 })
  ));
} 

// ===== END Task 2.2.2.d / Appendix 2.A1 =====================================

// ===== START Task 2.2.7 =====================================================

function makeFrustum(M, left, right, bottom, top, znear, zfar) {
  // ...
}

// ===== END Task 2.2.7 =======================================================

// ===== START Task 2.2.8 / Appendix 2.A2 =====================================

// Code from https://github.com/Oblong/generalized-perspective-projection/blob/master/gen-perspective.pdf 
// However, because we know our projection screen is centred at 0,0,0 and aligned with the x-axis, we can simplify our calculations 
function cameraSetProjectionMatrix(camera, offset, halfW, halfH) {
  // ...
}

// ===== END Task 2.2.8 / Appendix 2.A2 =======================================

function render() {

  // ===== START Task 2.2.2.c =================================================
  // ...
  // ===== END Task 2.2.2.c ===================================================

  // ===== START Task 2.2.4 ===================================================
  // ...
  // ===== END Task 2.2.4 =====================================================

  // ===== START Task 2.2.5.b =================================================
  // ...
  // ===== END Task 2.2.5.b ===================================================

  // ===== START Task 2.2.6 ===================================================
  // ...
  // ===== END Task 2.2.6 =====================================================

  // ===== START Task 2.2.9 ===================================================
  // ...
  // ===== END Task 2.2.9 =====================================================

  if (typeof params !== 'undefined' && params.Stereo) {

    // ===== START Task 2.2.3.b ===============================================
    // ...
    // ===== END Task 2.2.3.b =================================================

  } else {
      if (typeof gl !== 'undefined')
        gl.colorMask(true, true, true, false);
      if (typeof camera !== 'undefined')
        renderer.render(scene, camera);
  }

  // Hide / show convergence helper plane
  if (typeof params !== 'undefined' &&
      typeof convergencePoint !== 'undefined' &&
      params.ConvergenceMesh
  ) {
    convergenceMesh.visible = true;
    convergenceMesh.position.set(convergencePoint.x, convergencePoint.y, convergencePoint.z);
  } else {
    convergenceMesh.visible = false;
  }

  // Make it call the render() function about every 1/60 second
  requestAnimationFrame(render);
}
