import * as THREE from 'three';
//Importmap recognizes three/addons
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import WebGL from 'three/addons/capabilities/WebGL.js';
//import { BloomEffect, PixelationEffect, EffectComposer, EffectPass, RenderPass } from "postprocessing";
import InstanceShapes from './InstanceShapes.js';
import BasicShape from './BasicShape.js';
import BasicWireframe from './BasicWireframe.js';
import Experiment from './experiment.js';
import Experiment2 from './Experiment2.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

//Select the canvas
const backCanvas = document.querySelector('#c'); //Select the canvas

const renderer = new THREE.WebGL1Renderer({ antialias: true,
                                          backCanvas }); // alpha true = transparent bg
const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 200); //(fov, aspect, minDis, maxDis);
const camControls = new OrbitControls(camera, renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color( "rgb(22, 22, 22)" );
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

//composer.addPass(new EffectPass(camera, new PixelationEffect(5)));
const axes = new THREE.AxesHelper(5); //Helper Visual

const uniforms  = {
  uTime: { value: 0.}
};

/***************************Bloom experiment***********************************/

// UnrealBloomPass breaks background transparency
let bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight), // resolution?
  0.5, //strength
  0.4, // radius
  0.1 //threshold
);

composer.addPass(bloomPass);


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
  const intensity = 1;
  const light = new THREE.DirectionalLight(color, intensity);
  //light.position.set(-1, 2, 4);
  light.position.set(-1, 5, 3);
  //By default the light will look at (0, 0, 0), change with light.target()
  //scene.add(light);


  //HELPER VISUAL 
  const lightHelper = new THREE.DirectionalLightHelper(light, 5, 0xC52AB1);
  //scene.add(lightHelper);

  let ambient = new THREE.AmbientLight(color);
  ambient.position.set(-1, 5, 3);
  scene.add(ambient);

}

/***********EVENTS***********/
window.addEventListener('resize', onWindowResize);

//let cubeMesh =  new InstanceShapes(scene, new THREE.BoxGeometry(1, 1, 1), new THREE.MeshPhongMaterial(0xFFFFFF), 1000);
//cubeMesh.arrangeToCube(5, 5, 5, 2.5, 2.5, 2.5, 0, 0, 0);
//cubeMesh.setColorAt(1, 'skyblue'); //INDEX 0 DOES NOT WORK.

let wireSphere = new BasicWireframe(scene, new THREE.SphereGeometry(15, 15, 15), 0x9DB2FF, 100);
//let experiment = new Experiment(scene, new THREE.SphereGeometry(15, 15, 15));
let experiment2 = new Experiment2(scene, new THREE.SphereGeometry(15, 15, 15), uniforms);

let lastTime = 0;

function animate(time) {
  //lastTime = cubeMesh.rotateWave(5000, lastTime); //Higher value =  slower currently.
  time *= 0.001;
  uniforms.uTime.value = time;

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
  let bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight), // resolution?
    0.5, //strength
    0.4, // radius
    0.1 //threshold
  );
  
  composer.addPass(bloomPass);
}

function bloomExperiment() {
  
// const BLOOM_SCENE = 1;
// const bloomLayer = new THREE.Layers();
// bloomLayer.set( BLOOM_SCENE );

// const darkMaterial = new THREE.MeshBasicMaterial( {color : 'black'} );
// const materials = {};

// let bloomPass = new UnrealBloomPass(
//   new THREE.Vector2(window.innerWidth, window.innerHeight), // resolution?
//   0.5, //strength
//   0.4, // radius
//   0.1 //threshold
// );

// const bloomComposer = new EffectComposer( renderer );
// 			bloomComposer.renderToScreen = false;
// 			bloomComposer.addPass( renderScene );
// 			bloomComposer.addPass( bloomPass );

// const mixPass = new ShaderPass(
//   new THREE.ShaderMaterial( {
//     uniforms: {
//       baseTexture: { value: null },
//       bloomTexture: { value: bloomComposer.renderTarget2.texture }
//     },
//     vertexShader: document.getElementById( 'vertexshader' ).textContent,
//     fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
//     defines: {}
//   } ), 'baseTexture'
// );
// mixPass.needsSwap = true;

// const outputPass = new OutputPass( THREE.ReinhardToneMapping );
// const finalComposer = new EffectComposer( renderer );
// finalComposer.addPass( renderScene );
// finalComposer.addPass( mixPass );
// finalComposer.addPass( outputPass );
}


//}());