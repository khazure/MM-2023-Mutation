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
import MikuSprite from './mikuSprite.js';
import PanelMap from './PanelMap.js';
import { BloomEffect, ChromaticAberrationEffect, EffectComposer, EffectPass, RenderPass } from "postprocessing";

import {getBeatRatio, getChordRatio} from './Lyrics.js';
import { Sprite } from 'three';
import FloatShapes from './FloatShapes.js';
import ElemScene from './ElemScene.js';

import * as TWEEN from '@tweenjs/tween.js';

// Number of layers
const numLayers = 5;

//Select the canvas
const backCanvas = document.querySelector('#c'); //Select the canvas

const renderer = new THREE.WebGL1Renderer({ alpha: true, antialias: true,
                                          backCanvas }); // alpha true = transparent bg

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

/****************** to enable transparent scenes***************** */

// Works only when rendered by renderer, not composer
renderer.autoClear = false;
renderer.clearDepth();

/**********HELPER VISUALS (DELETE BEFORE FINAL RELEASE)**********/
//x, y, z axes, points in positive direction.
//axes.setColors('red', 'blue', 'green'); //x = r, y = b, z = g.
//scene.add(axes);

//Append global renderer.
// renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

onWindowResize(); //Calc aspect for first time.

/***********EVENTS***********/
window.addEventListener('resize', onWindowResize);

/*************************** Element Scenes ***********************************/
const mikuScene = new ElemScene(document.querySelector("#miku-scene"), renderer);
const waveScene = new ElemScene(document.querySelector("#wave-scene"), renderer);
const fullScreenScene = new ElemScene(document.getElementById("graphic-grid"), renderer);

const test = new InstanceShapes(mikuScene.getScene(), new THREE.BoxGeometry(1.5, 1.5, 1.5),
                                 new THREE.MeshPhongMaterial(0xFFFFFF), 150, 0);
test.randomizeSpherePos(30);

const sprite = new MikuSprite(mikuScene.getScene(), uniforms, 0);
//const sprite = new MikuPlane(mikuScene.getScene(), uniforms, 0);

const hologram = new hologramShape(waveScene.getScene(), new THREE.SphereGeometry(15), uniforms, 0);

const fullScreen = new InstanceShapes(fullScreenScene.getScene(), new THREE.BoxGeometry(1.5, 1.5, 1.5),
                                 new THREE.MeshPhongMaterial(0xFFFFFF), 500, 0);
fullScreen.randomizeSpherePos(30);

function animate(time) {
  time *= 0.001;
  uniforms.uTime.value = time;

  mikuScene.resizeRendererToDisplaySize(renderer);

  renderer.setScissorTest(false);
  renderer.clear(true, true);
  renderer.setScissorTest(true);

  fullScreenScene.renderScene(renderer);
  mikuScene.renderScene(renderer);
  waveScene.renderScene(renderer);


  // update previous textAliveData
  textAliveData.beat.prevValue = textAliveData.beat.currValue;
  textAliveData.chord.prevValue = textAliveData.chord.currValue;

  // update stored textAliveData
  textAliveData.beat.currValue = getBeatRatio();
  textAliveData.chord.currValue = getChordRatio();

    // Animate when beat changes
    if (Math.abs(linearToTwoLinears(textAliveData.beat.currValue) - linearToTwoLinears(textAliveData.beat.prevValue)) > 0.5) {
      sprite.nextFrame();
    }

  requestAnimationFrame(animate);//Request to brower to animate something
  TWEEN.update(); //No need to specify time.
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
  renderer.setSize(window.innerWidth, window.innerHeight);
}

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