import * as THREE from 'three';
//Importmap recognizes three/addons
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import WebGL from 'three/addons/capabilities/WebGL.js';
import InstanceShapes from './InstanceShapes.js';
import BasicShape from './BasicShape.js';
import BasicWireframe from './BasicWireframe.js';
import Experiment from './experiment.js';
import Experiment2 from './Experiment2.js';
import hologramShape from './hologramShape.js';
import { BloomEffect, ChromaticAberrationEffect, EffectComposer, EffectPass, RenderPass } from "postprocessing";

import {getBeatRatio} from './Lyrics.js';

//Select the canvas
const backCanvas = document.querySelector('#c'); //Select the canvas

const renderer = new THREE.WebGL1Renderer({ alpha: true, antialias: true,
                                          backCanvas }); // alpha true = transparent bg
const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 200); //(fov, aspect, minDis, maxDis);
const camControls = new OrbitControls(camera, renderer.domElement);
const scene = new THREE.Scene();

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

//composer.addPass(new EffectPass(camera, new PixelationEffect(5)));
const axes = new THREE.AxesHelper(5); //Helper Visual

// Data associated with materials that is passed to fragment shaders
const uniforms  = {
  uTime: { value: 0.0}
};

// keeps track of current beat of textAlive app
// Is a value from [0, 1] representing the completion of the beat
const textAliveData = {
  currBeat: { value: 0.0}
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
camera.position.set(30, 0, 30); 
camControls.update(); //Must update everytime position changes.
camControls.listenToKeyEvents(window);

//Damping slows down camera speed
camControls.enableDamping = true;
camControls.dampingFactor = 0.025;

camControls.screenSpacePanning = false;

//Min and Max distance we can zoom on camera
camControls.minDistance = 0; //Neg does nothing?
camControls.maxDistance = 100;
camControls.maxPolarAngle = Math.PI / 2; //90 degrees

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

  let ambient = new THREE.AmbientLight(color);
  ambient.position.set(-1, 5, 3);
  scene.add(ambient);

  light.layers.enable(0);
  light.layers.enable(1);
  light.layers.enable(2);
}

/****************************** layers code *********************************** */

camera.layers.enable(0); // enabled by default
camera.layers.enable(1);
camera.layers.enable(2);


/***********EVENTS***********/
window.addEventListener('resize', onWindowResize);

let cubeMesh =  new InstanceShapes(scene, new THREE.BoxGeometry(1, 1, 1), new THREE.MeshPhongMaterial(0xFFFFFF), 1000, 0);
cubeMesh.randomizeSpherePos();
//cubeMesh.arrangeToCube(5, 5, 5, 2.5, 2.5, 2.5, 0, 0, 0);
//cubeMesh.setColorAt(1, 'skyblue'); //INDEX 0 DOES NOT WORK.
//cubeMesh.arrangeToSphere(0, 0, 0, 1, 1, 1, 1, 5);
//cubeMesh.layers.set(0);

//let wireSphere = new BasicWireframe(scene, new THREE.SphereGeometry(15, 15, 15), 0x9DB2FF, 100);
//let experiment = new Experiment(scene, new THREE.SphereGeometry(15, 15, 15));
//let experiment2 = new Experiment2(scene, new THREE.SphereGeometry(15, 15, 15), uniforms);
console.log(new THREE.BoxGeometry(1, 2, 3).parameters);
let hologramSphere = new hologramShape(scene, new THREE.SphereGeometry(15, 15, 15), uniforms, 1);

// use to toggle off and on layers
camera.layers.toggle(0);

let lastTime = 0;


/*************************** composer filters ***********************************/

//halfToneRender();

//dotRender();

//utlineRender();

bloomRender(camera);

rgbRender(camera);

function animate(time) {
  //lastTime = cubeMesh.rotateWave(5000, lastTime); //Higher value =  slower currently.
  time *= 0.001;
  uniforms.uTime.value = time;
  //console.log(uniforms.uTime.value);
  //hologramSphere.setRotate(time / 6);

  textAliveData.currBeat.value = getBeatRatio();
  hologramSphere.incrementRotate(textAliveData.currBeat.value / 20);

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