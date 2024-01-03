import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { GUI } from 'dat.gui'

// The three.js scene: the 3D world where you put objects
const scene = new THREE.Scene();

// The camera
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  1,
  10000
);

const CUBE_ROTATION_SPEED = 0.01;

// The renderer: something that draws 3D objects onto the canvas
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xaaaaaa, 1);
// Append the renderer canvas into <body>
document.body.appendChild(renderer.domElement);

//GUI elements
var params = {
    'CamX': 0.0,
    'CamY': 0.0,
    'CamZ': 0.5
};
var gui = new GUI();
gui.add(params, 'CamX', -1, 1);
gui.add(params, 'CamY', -1, 1);
gui.add(params, 'CamZ', 0, 10);


// A cube we are going to animate

const CUBE_COLOR_WHITE = 0xffffff;
const CUBE_COLOR_GREEN = 0x00ff00;

const pbr_material = new THREE.MeshPhysicalMaterial( {
    color: 0xff00ff,
    metalness: 0.5,
    roughness: 0.5,
    clearcoat: 0.0,
    clearcoatRoughness: 0.0,
    reflectivity: 0.7,
    envMap: null
});

const cube = {
  // The geometry: the shape & size of the object
  geometry: new THREE.BoxGeometry(1, 1, 1),
  // The material: the appearance (color, texture) of the object
  //material: new THREE.MeshBasicMaterial({ color: 0xffffff })
  //material: new THREE.MeshPhongMaterial({ color: CUBE_COLOR_GREEN })
  material : pbr_material
};

// The mesh: the geometry and material combined, and something we can directly add into the scene (I had to put this line outside of the object literal, so that I could use the geometry and material properties)
cube.mesh = new THREE.Mesh(cube.geometry, cube.material);

// Add the cube into the scene
//scene.add(cube.mesh);

// Make the camera further from the cube so we can see it better
camera.position.z = 10;

//orbit controls
//const controls = new OrbitControls(camera, renderer.domElement);

//Pointer lock controls
const plcontrols = new PointerLockControls(camera, renderer.domElement);
const onKeyDown = function (KeyboardEvent) {
    switch (KeyboardEvent.code) {
    case 'KeyW':
        plcontrols.moveForward(0.25);
        break; 
    case 'KeyS':
        plcontrols.moveForward(-0.25);
        break;
    case 'KeyD':
        plcontrols.moveRight(0.25);
        break;
    case 'KeyA':
        plcontrols.moveRight(-0.25);
        break;
    }
};

document.addEventListener('keydown', onKeyDown, false);

//light component
const LIGHT_INTENSITY = 1;
const LIGHT_COLOR_WHITE = 0xffffff;
const LIGHT_COLOR_GREEN = 0x00ff00;

var light = new THREE.AmbientLight(LIGHT_COLOR_WHITE, LIGHT_INTENSITY);

const HS_GROUND_LIGHT_COLOR_SKY = 0xB1E1FF;
const HS_GROUND_LIGHT_COLOR_GROUND = 0xB97A20;
const HS_GROUND_LIGHT_INTENSITY = 1;

//var light = new THREE.HemisphereLight(HS_GROUND_LIGHT_COLOR_SKY, HS_GROUND_LIGHT_COLOR_GROUND, HS_GROUND_LIGHT_INTENSITY);

//const light = new THREE.DirectionalLight(0xffffff);
//light.position.set(1, 2, 0.8);

//const light = new THREE.SpotLight( 0xffffff );
//light.position.set( 1, 2, 0.8 );

scene.add(light);

function render_low_poly_tree(x,y,z){
    const tree = {
        geometry: new THREE.ConeGeometry(1,2,32),
        material: new THREE.MeshPhongMaterial({color: 0x00ff00 })
    };
    tree.mesh = new THREE.Mesh(tree.geometry, tree.material);
    tree.mesh.position.set(x,y,z);
    tree.mesh.scale.set(0.5,0.5,0.5);
    scene.add(tree.mesh);
}

function render_a_forest(num_trees){
    for (let i = 0; i < num_trees; i++) {
        render_low_poly_tree(get_random_value(), 0, get_random_value());
    }
}

function get_random_value(min=-5, max=5){
    return Math.random() * (max - min) + min;
}

function render() {
  // Render the scene and the camera
  renderer.render(scene, camera);

  // Rotate the cube every frame
  cube.mesh.rotation.x += CUBE_ROTATION_SPEED;
  cube.mesh.rotation.y -= CUBE_ROTATION_SPEED;

  //orbit controls to control camera with mouse
  //controls.update();

  // Make it call the render() function about every 1/60 second
  requestAnimationFrame(render);
}

render();
render_a_forest(40);
