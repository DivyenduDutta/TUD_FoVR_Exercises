// FoVR Tutorial Week 6 - Audio
// Demonstrates stereo panning & haas-effect

// Source code for tone.js: https://github.com/Tonejs/Tone.js
// Documentation: https://tonejs.github.io/docs/14.7.58/

var methodOptions = {
  'ILD': 'pan',
  'ITD': 'haas'
};
var sampleSounds = {
  'A': "https://tonejs.github.io/audio/berklee/guitar_pick_1.mp3" ,
  'B': "https://tonejs.github.io/audio/drum-samples/Bongos/tom1.mp3",
  'C': "https://tonejs.github.io/audio/berklee/Train.mp3",
  'D': "https://tonejs.github.io/audio/berklee/ambient_rain.mp3"
}
var params = {
  'showAnalyzer': true,
  'showSpatialAudioScene': false,
  'process audio': true,        // Sometimes we need some type of user interaction for beeing allowed to start audio processing. Might depend on the browser.
  'volume': 0.9,
  'loop': false,
  'sound': sampleSounds['A'],
  'method': methodOptions.ILD,
  'stereoPosition': 0.5,        // [0..1] left <-> right
  'maxHaasDelay': 20,           // In milleseconds
  'depth': 0.1,                 // [0..1] near <-> far
}

var player;
var inputNode;
var stereoNode;
var mainVolumeNode;

function setup() {
  Tone.start();

  player = new Tone.Player({
    'url': params.sound,
    'loop': params.loop,
    'autostart':true
  });
  inputNode = new Tone.Mono();  // Forcing to have it mono (if it was a stereo signal before)
  player.connect(inputNode);

  stereoNode = new Tone.Volume();  // Just using a volumeNode here for having a pass-through of our stereo signal
  mainVolumeNode = new Tone.Volume(Tone.gainToDb(params.volume)).toDestination();
  prepareDepth();
}


// ===== START Task 6.2.1.a ===================================================

// You will need:
// db = Tone.gainToDb(gain);  // Converts [0..1]->[-infinity..0] (linear to logarythmic, here the decibels are negativ assuming that '0dB' is the loudest) 
// var volumeNode = Tone.Volume(); volumeNode.volume.rampTo(db, time);  // rampTo -> transition over time from the old to the new value
// inputNode.connect(volumeNode);  // Connect the inputNode to this volumeNode

var leftChannel = new Tone.Volume(); //for left ear channel
var rightChannel = new Tone.Volume(); //for right ear channel

function prepareStereoPan() {
  var mergeNode = new Tone.Merge();  // Merges single channels (i.e. mono to stereo)

  //send the converted mono signal to left and right channel for further channel specific
  //processing
  inputNode.connect(leftChannel);
  inputNode.connect(rightChannel);

  // Setting to left channel (first channel '0' to first channel '0')
  leftChannel.connect(mergeNode, 0, 0);
  
  // Setting to right channel (first channel '0' to second channel '1')
  rightChannel.connect(mergeNode, 0, 1);

  // Send the merged (stereo) signal
  mergeNode.connect(stereoNode);
  onStereoPositionPan(params.stereoPosition);
}

// Shift the volume more to the direction where it should come from
function onStereoPositionPan(stereoPosition) {
  //time duration (in secs) over which the volume of the left and right channels ramp up to the 
  //desired volumes (in decibels)
  var volume_rampup_time_dur = 0.25; 

  //here stereoPosition affects the gain
  //if we're on the left, stereoPosition is 0, hence gain is 1.0 ie, so we hear on the left
  //if we're on the right, stereoPosition is 1.0, hence gain is 1.0 ie, so we hear on the right
  var leftChannel_db = Tone.gainToDb(1.0 - stereoPosition);
  leftChannel.volume.rampTo(leftChannel_db, volume_rampup_time_dur);

  var rightChannel_db = Tone.gainToDb(stereoPosition);
  rightChannel.volume.rampTo(rightChannel_db, volume_rampup_time_dur);
}

// ===== END Task 6.2.1.a =====================================================


// ===== START Task 6.2.1.b ===================================================

function updateStereoAudio(){
  var x_diff_left = (audioSource.position.x - leftear.position.x);
  var y_diff_left = (audioSource.position.y - leftear.position.y);
  var x_diff_right = (audioSource.position.x - rightear.position.x);
  var y_diff_right = (audioSource.position.y - rightear.position.y);
  //compute the euclidean distances from both ears to audio source
  var leftDist = Math.sqrt(x_diff_left * x_diff_left + y_diff_left * y_diff_left);
  var rightDist = Math.sqrt(x_diff_right * x_diff_right + y_diff_right * y_diff_right);

  //normalize distances for rampTo()
  var leftDistNormalized = leftDist / (leftDist + rightDist);
  var rightDistNormalized = rightDist / (leftDist + rightDist);

  var volume_rampup_time_dur = 0.02;
  //inverse because larger distance corresponds to lower volume level
  leftChannel.volume.rampTo((1 - leftDistNormalized), volume_rampup_time_dur);
  rightChannel.volume.rampTo((1 - rightDistNormalized), volume_rampup_time_dur);

}

// ===== END Task 6.2.1.b =====================================================


// ===== START Task 6.2.2 =====================================================

// You will need:
// var delayNode = new new Tone.Delay(0.0);  // DelayLength: [0..1] noDelay <-> maximumDelay, standart maximumDelay is 1 second
// delayNode.delayTime.rampTo(length, time);  // Same as Tone.Volume 

var leftDelayHaasNode;
var rightDelayHaasNode;

function prepareHaasEffect() {
  var mergeNode = new Tone.Merge();  // Merges single channels (i.e. mono to stereo)

  leftDelayHaasNode = new Tone.Delay(0.0);
  rightDelayHaasNode = new Tone.Delay(0.0);

  inputNode.connect(leftDelayHaasNode);
  inputNode.connect(rightDelayHaasNode);

  // Setting to left channel (first channel '0' to first channel '0')
  leftDelayHaasNode.connect(mergeNode, 0, 0); 

  // Setting to right channel (first channel '0' to second channel '1')
  rightDelayHaasNode.connect(mergeNode, 0, 1);

  // Send the merged (stereo) signal
  mergeNode.connect(stereoNode); 
  onStereoPositionHaas(params.stereoPosition);
}

function onStereoPositionHaas(stereoPosition) {
  console.log(stereoPosition);
  let scaled_position;
  let delay;
  let delay_ramp_up_time_dur = 0.01; 
  const maxHaasDelayInSeconds = params.maxHaasDelay/1000.0;

  //we're on the left, so no delay in left but delay on right
  if(stereoPosition < 0.5){
    scaled_position = -((2*stereoPosition)-1.0); //maps to 0 to 1 but inversely as in 0 <-> maxdelay
    //converting value between 0 and 1 to delay in seconds as per max haas delay
    delay = scaled_position*maxHaasDelayInSeconds;
    rightDelayHaasNode.delayTime.rampTo(delay, delay_ramp_up_time_dur); 
    leftDelayHaasNode.delayTime.rampTo(0.0, delay_ramp_up_time_dur); 
  }else if(stereoPosition > 0.5){
    //we're on the right, so no delay in right but delay on left
    scaled_position = (stereoPosition-0.5)*2; //maps to 0 to 1 as in 1 <-> maxdelay
    //converting value between 0 and 1 to delay in seconds as per max haas delay
    delay = scaled_position*maxHaasDelayInSeconds;
    rightDelayHaasNode.delayTime.rampTo(0.0, delay_ramp_up_time_dur);
    leftDelayHaasNode.delayTime.rampTo(delay, delay_ramp_up_time_dur);
  }
}

// ===== END Task 6.2.2 =======================================================


// ===== START Task 6.2.3 =====================================================

// You will need / can use:
// var reverbNode = new Tone.Reverb();
// reverbNode.decay = decayLength;  // 'length' of the reverb
// reverbNode.wet = strength;  // effect-strength, [0..1] 0% <-> 100%

var reverbNode;

function prepareDepth() {
  reverbNode = new Tone.Reverb();
  reverbNode.connect(mainVolumeNode);

  // Sending both to the output to remain some dry direct sound
  stereoNode.connect(reverbNode);
  stereoNode.connect(mainVolumeNode); 

  onDepth(params.depth);
}

// Many things are possible here
function onDepth(depth) {
  //can experiment with the below three parameters for a better effect
  let depth_ramp_up_time_dur = 0.3;
  let depth_decay_factor = 1.5;
  let depth_wet_factor = 2;
  reverbNode.decay = depth * depth_decay_factor;
  reverbNode.wet = depth * depth_wet_factor;
  mainVolumeNode.volume.rampTo(Tone.gainToDb(1.0-depth), depth_ramp_up_time_dur);
}

// ===== END Task 6.2.3 =======================================================


// ############################################################################
// You do not need to change anything below this line
// ############################################################################

// On-screen menu for changing parameters.
// See https://github.com/dataarts/dat.gui
const gui = new dat.GUI({ width: 300 });
gui.add(params, 'showAnalyzer', false);
gui.add(params, 'showSpatialAudioScene', false)
  .onChange(toggleSpatialAudioSceneVisibility);
gui.add(params, 'process audio').onChange(()=>{
  if(params['process audio']) {
    setupMethod();
  } else {
    if(inputNode)
      inputNode.disconnect();
    if(stereoNode)
      stereoNode.disconnect();
    if(reverbNode)
      reverbNode.disconnect();
  }
});
gui.add(params, 'volume', 0.0, 1.0).onChange(()=>{
  mainVolumeNode.volume.rampTo(Tone.gainToDb(params.volume));
});
gui.add(params, 'loop').onChange(()=>{
  player.loop = params.loop;
  if(params.loop) {
    player.start();
    console.log("sound started to play")
  }
});
gui.add(params, 'sound', sampleSounds).onChange(()=>{
  setupMethod();
});
gui.add(params, 'method', methodOptions).onChange(()=>{
  setupMethod();
});
gui.add(params, 'stereoPosition', 0.0, 1.0).onChange(()=>{
  switch(params.method) {
    case methodOptions.ILD:
      onStereoPositionPan(params.stereoPosition);
      break;
    case methodOptions.ITD:
      onStereoPositionHaas(params.stereoPosition);
      break;
  }
});
gui.add(params, 'maxHaasDelay', 0.0, 1000.0).onChange(()=>{
  if(params.method == methodOptions.ITD) {
    setupMethod();
    onStereoPositionHaas(params.stereoPosition);
  }
});
gui.add(params, 'depth', 0.0, 1.0).onChange(()=>{
  onDepth(params.depth);
});

function setupMethod() {
  if(inputNode)
    inputNode.disconnect();
  if(stereoNode)
    stereoNode.disconnect();
  if(reverbNode)
    reverbNode.disconnect();
  setup();

  switch(params.method) {
    case methodOptions.ILD:
      prepareStereoPan();
      break;
    case methodOptions.ITD:
      prepareHaasEffect();
      break;
  }
  prepareSpectrumAnalyzer();
}

var analyzerNode;

function prepareSpectrumAnalyzer() {
  analyzerNode = new Tone.FFT(2048);
  mainVolumeNode.connect(analyzerNode);
}

var canvas = document.getElementsByTagName("canvas")[0];
var ctx = canvas.getContext("2d");
ctx.strokeStyle = '#000000';
ctx.lineWidth = 1;

// Run if ToneJs has been loaded
Tone.loaded().then(() => {
  if(params['process audio']) {
    setupMethod();
  }

  prepareSpectrumAnalyzer();
  render();
});

// For the speaker and the player
const scene = new THREE.Scene();

// The camera
var width = window.innerWidth;
var height = window.innerHeight; 
var k = width/height; 
var s = 5; 
const camera = new THREE.OrthographicCamera(-s*k,s*k, s,-s,1,1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xaaaaaa, 1);
document.body.appendChild(renderer.domElement);

// Add a light
var light = new THREE.PointLight(0xFFFFFF);
light.position.set(0,5,5);
scene.add(light);

// The mesh: the geometry and material combined, and something we can directly add into the scene
head = new THREE.Mesh(
new THREE.SphereGeometry(1, 32, 32), 
new THREE.MeshPhongMaterial( {color: 0xcccccc, side: THREE.DoubleSide, wireframe: false}));
console.log("here");
leftear = new THREE.Mesh(
new THREE.SphereGeometry(0.2, 32, 32), 
new THREE.MeshPhongMaterial( {color: 0xffff00, side: THREE.DoubleSide, wireframe: false}));

rightear = new THREE.Mesh(
new THREE.SphereGeometry(0.2, 32, 32), 
new THREE.MeshPhongMaterial( {color: 0xffff00, side: THREE.DoubleSide, wireframe: false}));

nose = new THREE.Mesh(
new THREE.ConeGeometry( 0.2, 0.2, 32 ), 
new THREE.MeshPhongMaterial( {color: 0xffff00, side: THREE.DoubleSide, wireframe: false}));

var sourceR = 0.5;
audioSource = new THREE.Mesh(
new THREE.SphereGeometry(1, 32, 32), 
new THREE.MeshPhongMaterial( {color: 0x00ff00, side: THREE.DoubleSide, wireframe: false}));
audioSource.position.y += 2.5;

update_ears();

function update_ears(){
  nose.position.x = head.position.x;
  nose.position.y = head.position.y + 1;

  leftear.position.y = head.position.y;
  leftear.position.x = head.position.x - 1;

  rightear.position.y = head.position.y;
  rightear.position.x = head.position.x + 1;
}

function toggleSpatialAudioSceneVisibility() {
  head.visible = params.showSpatialAudioScene;
  leftear.visible = params.showSpatialAudioScene;
  rightear.visible = params.showSpatialAudioScene;
  nose.visible = params.showSpatialAudioScene;
  audioSource.visible = params.showSpatialAudioScene;
}

// Add the sphere into the scene
scene.add(head);
scene.add(leftear);
scene.add(rightear);
scene.add(nose);
scene.add(audioSource);

toggleSpatialAudioSceneVisibility();

camera.position.z = 5;

function render() {

  ctx.clearRect(0,0,canvas.clientWidth, canvas.clientHeight);
    
  if (params.showAnalyzer) {

    var spectrum = analyzerNode.getValue();
  
    ctx.beginPath();
    spectrum.forEach((val, i) => {
      ctx.lineTo(i, 300 + Tone.dbToGain(val) * -10000);
    });
    ctx.stroke();

  }
    
  // Render the scene and the camera
  renderer.render(scene, camera);

  // Visualize audio
  var sum = 0.5;
  var spectrum = analyzerNode.getValue();
  spectrum.forEach((val, i) => {
    sum += Tone.dbToGain(val);
  });
  //console.log(sum);
  sourceR = sum;
  
  audioSource.scale.x = sourceR;
  audioSource.scale.y = sourceR;
  
  // Make it call the render() function about every 1/60 second
  requestAnimationFrame(render);
}

// Movement speed - please calibrate these values if needed
var xSpeed = 0.1;
var ySpeed = 0.1;

document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
  var keyCode = event.which;
  if (keyCode == 87) { 
    head.position.y += ySpeed; // W
  } else if (keyCode == 83) {
    head.position.y -= ySpeed; // S
  } else if (keyCode == 65) {
    head.position.x -= xSpeed; // A
  } else if (keyCode == 68) {
    head.position.x += xSpeed; // D
  } else if (keyCode == 32) {
    head.position.set(0, 0, 0);
  }
  update_ears();
  updateStereoAudio();
};
