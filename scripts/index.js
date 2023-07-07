import * as THREE from 'three';
//Importmap recognizes three/addons
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import WebGL from 'three/addons/capabilities/WebGL.js';
import InstanceShapes from './InstanceShapes.js';
import BasicShape from './BasicShape.js';
import BasicWireframe from './BasicWireframe.js';
import Experiment from './experiment.js';
import Experiment2 from './Experiment2.js';
import InstanceSphere from './InstanceSphere.js';
import hologramShape from './hologramShape.js';
import infiniteTubes from './infiniteTubes.js';
import { BloomEffect, ChromaticAberrationEffect, EffectComposer, EffectPass, RenderPass } from "postprocessing";

import {getBeatRatio, getChordRatio} from './Lyrics.js';

// Number of layers
const numLayers = 5;

//Select the canvas
const backCanvas = document.querySelector('#c'); //Select the canvas

const renderer = new THREE.WebGL1Renderer({ alpha: true, antialias: true,
                                          backCanvas }); // alpha true = transparent bg
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.01, 1000); //(fov, aspect, minDis, maxDis);
const camControls = new OrbitControls(camera, renderer.domElement);
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xFF0000, 40, 80);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

//composer.addPass(new EffectPass(camera, new PixelationEffect(5)));
const axes = new THREE.AxesHelper(5); //Helper Visual

// Data associated with materials that is passed to fragment shaders
const uniforms  = {
  uTime: { value: 0.0 },
};

// keeps track of current beat of textAlive app
// Is a value from [0, 1] representing the completion of the beat
const textAliveData = {
  beat: { currValue: 1.0, prevValue: 1.0 },
  chord: { currValue: 1.0, prevValue: 1.0},
  inChorus: { value: false }
};

/**********HELPER VISUALS (DELETE BEFORE FINAL RELEASE)**********/
//x, y, z axes, points in positive direction.
axes.setColors('red', 'blue', 'green'); //x = r, y = b, z = g.
scene.add(axes);

//Append our composer and renderer.
renderer.setSize(window.innerWidth, window.innerHeight);
composer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

/***********CAMERA AND ITS CONTROLS***********/
//By default, the camera will be looking down -Z with, positioned at (0, 0, 0)
//camera.position.set(numOfCubes[0] * 3, numOfCubes[1] * 3, numOfCubes[2] * 3); //x, y, z
camera.position.set(0, 0, 50); 
camControls.update(); //Must update everytime position changes.
camControls.listenToKeyEvents(window);

//Damping slows down camera speed
camControls.enableDamping = true;
camControls.dampingFactor = 0.025;

camControls.screenSpacePanning = false;

//Min and Max distance we can zoom on camera
camControls.minDistance = 0; //Neg does nothing?
camControls.maxDistance = 100;
camControls.maxPolarAngle = 2 * Math.PI; //360 degrees

camControls.enableZoom = true;
onWindowResize(); //Calc aspect for first time.

/***********LIGHTING***********/
{
  const color = 0xFFFFFF;
  const intensity = 0.0;
  const light = new THREE.DirectionalLight(color, intensity);
  //light.position.set(-1, 2, 4);
  light.position.set(-1, 5, 3);
  //By default the light will look at (0, 0, 0), change with light.target()
  //scene.add(light);


  //HELPER VISUAL 
  const lightHelper = new THREE.DirectionalLightHelper(light, 10, 0xC52AB1);
  scene.add(lightHelper);

  const ambient = new THREE.AmbientLight(color);
  ambient.position.set(-1, 5, 3);
  scene.add(ambient);

  for(let i = 0; i <= numLayers; i++) {
    light.layers.enable(i);
    ambient.layers.enable(i);
  }
}

/****************************** layers code *********************************** */

camera.layers.enable(0); // enabled by default, instanced cubes
camera.layers.enable(1); // hologram shape
camera.layers.enable(2); // experiment
camera.layers.enable(3); // InstanceSphere layer.
camera.layers.enable(4); // infinite tubes
camera.layers.enable(5); // plane experiment

// temp
//camera.layers.disable(0);
camera.layers.disable(1);
camera.layers.disable(2);
camera.layers.disable(3);
camera.layers.disable(4);
//camera.layers.disable(5);

/***********EVENTS***********/
window.addEventListener('resize', onWindowResize);

let cubeMesh =  new InstanceShapes(scene, new THREE.BoxGeometry(3, 3, 3), new THREE.MeshPhongMaterial(0xFFFFFF), 100, 0);
cubeMesh.randomizeSpherePos();
//cubeMesh.arrangeToCube(5, 5, 5, 2.5, 2.5, 2.5, 0, 0, 0);
//cubeMesh.setColorAt(1, 'skyblue'); //INDEX 0 DOES NOT WORK.
//cubeMesh.arrangeToSphere(0, 0, 0, 1, 1, 1, 1, 5);

//
//constructor(parentScene, theGeometry, theMaterial, radius, maxVert, minVert, layer)
// let testMaterial = new THREE.MeshPhongMaterial();
// testMaterial.color.set(0x33ccff);
// let sphere = new InstanceSphere(scene, new THREE.BoxGeometry(1, 1, 1), testMaterial, 15, 25, 5, 3); 


//let wireSphere = new BasicWireframe(scene, new THREE.SphereGeometry(15, 15, 15), 0x9DB2FF, 100);
let experiment2 = new Experiment2(scene, new THREE.PlaneGeometry(15, 15), 5);
console.log(new THREE.BoxGeometry(1, 2, 3).parameters);
let hologramSphere = new hologramShape(scene, new THREE.SphereGeometry(10), uniforms, 1);

let experiment = new Experiment(scene, new THREE.SphereGeometry(50, 50, 50), uniforms, 2);

let tubes = new infiniteTubes(scene, uniforms, 4)

// use to toggle off and on layers
//camera.layers.toggle(0);

let lastTime = 0;


/*************************** composer filters ***********************************/

//halfToneRender();

//dotRender();

//utlineRender();

//bloomRender(camera);

rgbRender(camera);

function animate(time) {
  //lastTime = cubeMesh.rotateWave(5000, lastTime); //Higher value =  slower currently.
  time *= 0.001;
  uniforms.uTime.value = time;

  // update previous
  textAliveData.beat.prevValue = textAliveData.beat.currValue;
  textAliveData.chord.prevValue = textAliveData.chord.currValue;

  textAliveData.beat.currValue = getBeatRatio();
  textAliveData.chord.currValue = getChordRatio();

  hologramSphere.incrementRotate(linearToTwoLinears(1 - textAliveData.beat.currValue) / 20);

  if (Math.abs(textAliveData.beat.currValue - textAliveData.beat.prevValue) > 0.5) {
    //camera.layers.toggle(0);
  }

  tubes.updateMaterialOffset();

  requestAnimationFrame(animate);//Request to brower to animate something
  camControls.update(); //Requires if(enableDamping || autoRotate)

  composer.render();
  //requestAnimationFrame passes time since the page loaded to our function.
}

if (WebGL.isWebGLAvailable()) {
  //Starts loop, continously calls requestAnimationFrame() on animate.
  requestAnimationFrame(animate);
} else {
  const warning = WebGL.getWebGLErrorMessage();
  document.getElementById('container').appendChild(warning);
}

/**
 * Resizes window when browser resizes.
 */
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix(); //
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function bloomRender() {

  // let bloomPass = new UnrealBloomPass(
  //   new THREE.Vector2(window.innerWidth, window.innerHeight), // resolution?
  //   0.5, //strength
  //   0.4, // radius
  //   0.1 //threshold
  // );
  let effect = new BloomEffect({
    intensity: 0.5,
    radius: 0.4,
  });
  let bloomPass = new EffectPass( camera, effect );
  composer.addPass(bloomPass);
}

function rgbRender() {
  let effect = new ChromaticAberrationEffect();
  const rgbPass = new EffectPass( camera, new ChromaticAberrationEffect() );
  
  composer.addPass( rgbPass );
}

// function dotRender() {
//   const dotPass = new ShaderPass( DotScreenShader );
//   dotPass.uniforms[ 'scale' ].value = 4;
//   composer.addPass( dotPass );
// }

// function halfToneRender() {
//   const params = {
//     shape: 1,
//     radius: 4,
//     rotateR: Math.PI / 12,
//     rotateB: Math.PI / 12 * 2,
//     rotateG: Math.PI / 12 * 3,
//     scatter: 0,
//     blending: 1,
//     blendingMode: 1,
//     greyscale: false,
//     disable: false
//   };
//   const halftonePass = new HalftonePass( window.innerWidth, window.innerHeight, params );
//   composer.addPass( halftonePass );
// }

// function outlineRender() {
//   let effectSobel = new ShaderPass( SobelOperatorShader );
//   effectSobel.uniforms[ 'resolution' ].value.x = window.innerWidth * window.devicePixelRatio;
//   effectSobel.uniforms[ 'resolution' ].value.y = window.innerHeight * window.devicePixelRatio;
//   composer.addPass( effectSobel );
//   }

//}());

/**
 * Splits the given value into two piecewise functions
 * Ex. instead of x = y, returns:
 * y = 2x if 0 < x <= 0.5
 * y = 2x + 1 if 0.5 < x <= 1
 * Where x = linearValue and the returned output is the y
 * @param {number} linearValue - value from scale of 0 to 1
 * @returns 
 */
function linearToTwoLinears(linearValue) {
  if (linearValue <= 0.5) {
    return 2 * linearValue;
  } else {
    return (2 * linearValue) - 1
  }
}

/**
 * 
 * @param {number} linearValue 
 * @returns 
 */
function linearToGaussian(linearValue) {
  let a = 0.4;
  let b = 0.5;
  let c = 2.4;
  let coefficient = 1 / (a * Math.sqrt(2 * Math.PI));
  let exp = -c * Math.pow((linearValue - b) / a, 2);
  let product = coefficient * Math.pow(Math.E, exp);
  return product;
}