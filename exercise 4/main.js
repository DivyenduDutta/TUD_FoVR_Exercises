import * as THREE from 'three';
import { GUI } from 'dat.gui'

// Event listener
window.addEventListener('resize', onWindowResize, false);

// Variables for storing the window dimensions in real world (in metres)
var windowWidth, windowHeight;

// Static parameters
var cameraZ = 0.5;
var convergence = 0.5;
var screenWidth = 0.35;

// Dynamic parameters
var params = {
  'IPD': 0.006,
  'K1': 0.0,
  'K2': 0.0,
  'Resolution': 1024,
  'Lines': false,
  'LinesSpreadScaler': 1.0,
  'ScreenWidthScaler': 1.0,
  'ImageZ': 0
};

// The renderer: something that draws 3D objects onto the canvas
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor(0x000000, 1);
// Append the renderer canvas into <body>
document.body.appendChild(renderer.domElement);

// Camera frustum aspect ratio 
const ratio = window.innerWidth / window.innerHeight; 

// Create the center camera
const camera = new THREE.PerspectiveCamera(
  60,     // fov — Camera frustum vertical field of view
  ratio,  // aspect — Camera frustum aspect ratio
  0.01,   // near — Camera frustum near plane
  10      // far — Camera frustum far plane
);
camera.position.set(0, 0, 0.5);


// ===== START Task 4.2.1 =====================================================

// Task 4.2.1.a
// Create a scene for the rendering plane.
const renderScene = new THREE.Scene();

// Task 4.2.1.b
// Create render target for the render plane
const renderTargetHeight = params.Resolution;
const renderTargetWidth = params.Resolution;
const renderTarget = new THREE.WebGLRenderTarget(renderTargetWidth,renderTargetHeight);

// Task 4.2.1.c
// Create a ShaderMaterial for the rendering plane.
const renderPlaneMaterial = new THREE.ShaderMaterial({
  uniforms: {
    tDiffuse: { value: renderTarget.texture },
    k1: { value: 0.0 },
    k2: { value: 0.0 },
  },
  vertexShader: vertexShader(),
  fragmentShader: fragmentShader(),
});

const renderPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(1, 1),
  renderPlaneMaterial
);
renderScene.add(renderPlane)

// ===== END Task 4.2.1 =======================================================


// The scene where we put 3D world objects, a light and an image plane.
const worldScene = new THREE.Scene();
// Add lights
const hemisphereLight = new THREE.HemisphereLight(0xB1E1FF, 0xB97A20, 0.5);
worldScene.add(hemisphereLight);
const light = new THREE.DirectionalLight(0xffffff, 1.0);
light.position.set(0.4, 0.8, 0.5);
worldScene.add(light);


const material = new THREE.MeshBasicMaterial( {
  map: new THREE.TextureLoader().load('chessboard.svg'),
  side: THREE.DoubleSide
} );
const imagePlaneGeometry = new THREE.PlaneGeometry(1,1);
const imagePlane = new THREE.Mesh(imagePlaneGeometry, material);

imagePlane.position.set(0,0,params.ImageZ);
worldScene.add(imagePlane);


// Add lines
const lines = new THREE.Group();
// ===== START Task 4.2.3.a =====================================================
// Add some lines to the scene. First create a mesh for the horizontal and vertical lines. Then create a total of 5 copies for both the horizontal and vertical lines and add them to the lines group.
const horizontalReferenceLines = new THREE.Group();
horizontalReferenceLines.name = "HorizontalReferenceLines";
lines.add(horizontalReferenceLines);
const horizontalLine = new THREE.Mesh(
  new THREE.PlaneGeometry(1, 0.001),
  new THREE.MeshPhongMaterial({ color: 0x99cfe0 }),
);
//horizontalReferenceLines.position.y += -0.05;
const verticalReferenceLines = new THREE.Group();
verticalReferenceLines.name = "VerticalReferenceLines";
lines.add(verticalReferenceLines);
const verticalLine = new THREE.Mesh(
  new THREE.PlaneGeometry(0.001, 1),
  new THREE.MeshPhongMaterial({ color: 0x99cfe0 }),
);
//horizontalReferenceLines.position.y = 0.03;
//verticalReferenceLines.position.x = (0.03 * ratio);
for(let i=-3; i<=3; i++){ //7 horizontal and vertical lines
  console.log("adding mesh lines...");
  const horizontalLines = horizontalLine.clone();
  //horizontalReferenceLines2.position.y += (i * 0.05);
  horizontalReferenceLines.add(horizontalLines);
  const verticalLines2 = verticalLine.clone();
  //verticalReferenceLines2.position.x += (i * 0.05 * ratio);
  verticalReferenceLines.add(verticalLines2);
}

lines.visible = false;
// ===== END Task 4.2.3.a =======================================================
worldScene.add(lines);
// On-screen menu for changing parameters. See https://github.com/dataarts/dat.gui 
const gui = new GUI({ width: 300 });
gui.add(params, 'K1', -1, 1, 0.01)
  .onChange(updateDistortionEffect)
  .listen();
gui.add(params, 'K2', -1, 1, 0.01)
  .onChange(updateDistortionEffect)
  .listen();
gui.add(params, 'Resolution', 32, 2048, 32)
  .onChange(changeResolution)
  .listen();
gui.add(params, 'Lines', false)
  .onChange(function toggleLinesVisibility() { lines.visible = params.Lines; }) 
  .listen();
gui.add(params, 'LinesSpreadScaler', 0.0, 2.0, 0.01)
  .onChange(updateLines)
  .listen();
gui.add(params, 'ScreenWidthScaler', 0.5, 1.0, 0.01)
  .onChange(updateRenderingPlane)
  .listen();
gui.add(params, 'ImageZ',0,1,0.01)  //Update the position of our image on the world. 
onWindowResize();

render();



// Rescale the rendering plane to match the window
function updateRenderingPlane() {
  // ===== START Task 4.2.2 ===================================================
  renderPlane.scale.set(windowWidth * params.ScreenWidthScaler, windowHeight, windowWidth);
  // ===== END Task 4.2.2 =====================================================
}

// Reposition the lines to match the window
function updateLines() {
  const spreadPercentFromCenter1 = 0.16 * params.LinesSpreadScaler;
  const spreadPercentFromCenter2 = 0.32 * params.LinesSpreadScaler;
  
  // ===== START Task 4.2.3.b ===================================================
  //Place the lines in a uniform manner on the plane, so that they match the window when it is rescaled. Think about how to spread both the vertical and horizontal lines using the above variables.  
  lines.children
    .filter(child => child instanceof THREE.Group)
    .forEach(group => {
        if (group.name === 'HorizontalReferenceLines') {
        //console.log('Found horizontalReferenceLines:', group);
        group.children.forEach((c,i) => {
          //console.log(i);
          let factor = i-parseInt(7/2);
          console.log(factor);
          if(factor != 0)
            c.position.set(0, getSign(factor) * windowHeight * spreadPercentFromCenter2/Math.pow(2,Math.abs(factor)), 0);
      });
      } else if (group.name === 'VerticalReferenceLines') {
        //console.log('Found verticalReferenceLines:', group);
        group.children.forEach((c,i) => {
          //console.log(i);
          let factor = i-parseInt(7/2);
          if(factor != 0)
            c.position.set(getSign(factor) * windowWidth * spreadPercentFromCenter2/Math.pow(2,Math.abs(factor)), 0, 0);
      });
      }
  });
  // ===== END Task 4.2.3.b =====================================================
}

function getSign(value){
  if(value == 0) return 1;
  else return Math.sign(value);
}

// Called only when the window is resized 
function onWindowResize() { 
 
  // Calculate real-world window size (in metres) 
  const screenAspect = window.screen.width / window.screen.height; 
  const screenHeight = screenWidth / screenAspect; 

  // Window size in real-world scale (metres) 
  windowWidth = (window.innerWidth / window.screen.width) * screenWidth; 
  windowHeight = (window.innerHeight / window.screen.height) * screenHeight; 
  console.log(windowWidth);
  console.log(window.innerWidth);
 
  // Rescale the image to match the window 
  imagePlane.scale.set(windowWidth, windowHeight, windowWidth * 2); 
  imagePlane.position.set(0, 0, -windowWidth);   

  // Rescale the rendering plane to match the window
  updateRenderingPlane();

  // Reposition the lines to match the window
  updateLines();
  
  // Adjust the camera aspect ratio to match the window aspect ratio 
  camera.aspect = window.innerWidth / window.innerHeight; 
  camera.updateProjectionMatrix();
 
  // Resize the renderer buffers 
  renderer.setSize(window.innerWidth, window.innerHeight);

  updateDistortionEffect();
}

// Frame rendering, called about every 1/60 second
function render() {
  camera.updateProjectionMatrix();
  
  // Calculate new FOV given camera distance to window
  camera.fov = (180 / Math.PI) * (2 * Math.atan((windowHeight * 0.5) / cameraZ));

  // ===== START Task 4.2.3.c ===================================================
  //Render the world 3d world that contains our geometries onto the render target.
  renderer.setRenderTarget(renderTarget);
  renderer.render(worldScene, camera);
  
  //Then render the distortion effect onto the main render target.
  //..
  renderer.setRenderTarget(null);
  renderer.render(renderScene, camera);

  imagePlane.position.set(0,0,0);
  //..
  // ===== END Task 4.2.3.c  =====================================================

  // Make it call the render() function about every 1/60 second
  requestAnimationFrame(render);
}

// The distortion correction vertex shader
function vertexShader() {
  return `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;
}

// The distortion correction fragment shader
function fragmentShader() {
  return `
    uniform sampler2D tDiffuse;
    uniform float k1;  // The main distortion, positive = barrel, negative = pincushion 
    uniform float k2;  // Tweaks the edges of distortion, can be 0.0
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv.xy; //this is already normalized ie 0 to 1

      // ===== START Task 4.2.4 ===============================================
      
      //convert to -1 to 1 space for lens distortion to work from the center
      uv = (uv * 2.0) - 1.0;  
      float r_squared = uv.x * uv.x + uv.y * uv.y;
      uv = uv * (1.0 + (k1 * r_squared) + (k2 * r_squared * r_squared));
      uv = (uv * 0.5 + 0.5); //convert back to original uv space ie, 0 to 1
      
      // ===== END Task 4.2.4 =================================================

      // Draw only within the uv range
      if (uv.x >= 0. && uv.x <= 1. && uv.y >= 0. && uv.y <= 1.) {
        gl_FragColor = texture2D(tDiffuse, uv);
      }
    }
  `;
}

// Update k1 and k2 value in the fragment shader
function updateDistortionEffect() {
  // ===== START Task 4.2.4.d ===================================================
  renderPlaneMaterial.uniforms.k1.value = params.K1; 
  renderPlaneMaterial.uniforms.k2.value = params.K2; 
  // ===== END Task 4.2.4.d =====================================================
};

// Update the texture resolution for the rendering plane
function changeResolution() {
  // ===== START Task 4.2.5 ===================================================
  renderTarget.setSize(params.Resolution,params.Resolution);
  // ===== END Task 4.2.5 =====================================================
}