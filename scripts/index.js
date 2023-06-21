import * as THREE from 'three';
//Importmap recognizes three/addons
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import WebGL from 'three/addons/capabilities/WebGL.js';
import { BloomEffect, PixelationEffect, EffectComposer, EffectPass, RenderPass } from "postprocessing";
import Background from "./Background.js";

//(function() {  
////80 Line Limit: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaA
  //Select the canvas
let rotate_spd = 50;

const backCanvas = document.querySelector('#c'); //Select the canvas

const renderer = new THREE.WebGL1Renderer({ alpha: true, antialias: true,
                                          backCanvas }); // alpha true = transparent bg
const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 200); //(fov, aspect, minDis, maxDis);
const camControls = new OrbitControls(camera, renderer.domElement);
const scene = new THREE.Scene();
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
//composer.addPass(new EffectPass(camera, new PixelationEffect(5)));
let backgroundObj =  new Background(scene); //creates and gives initial postion for cubes
const axes = new THREE.AxesHelper(5); //Helper Visual

//@param cubeSize(x, y, z), cubeColor
backgroundObj.createInstancedCubes(1, 1, 1, 0xFFFFFF);

//@param numOfCubes(x, y, z), gapBetweenCubes(x, y, z), startPos(x, y, z)
//gap of 1 means no gap.
//backgroundObj.setCubeForm(1, 0, 0, 10, 10, 10, 0, 0, 0);

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
camera.position.set(30, 100, 100); 
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
  scene.add(light);


  //HELPER VISUAL 
  const lightHelper = new THREE.DirectionalLightHelper(light, 5, 0xC52AB1);
  scene.add(lightHelper);
}

/***********EVENTS***********/
window.addEventListener('resize', onWindowResize);
// console.log(dummyCube.matrix.decompose);
let cubeMesh = backgroundObj.cubeMesh;
//const testShape = new THREE.Object3D();


/************BELOW ARE CONSTS USED IN INSTANCE CUBE ROTATION, STILL WIP ***********************/
/*Steps to rotate instances cubes
  1. Create a Quaternion, this represents a rotation 'vector'
  2. Create a Matrix4, we will multiple the existing matrix by this.
  3. Do Matrix4.makeRotationFromQuaternion(theQuaternion);
  4. Store the instance's matrix in some temp matrix like currentM through instanceMesh.getMatrixAt(i, currentM)
  5. currentM.multiply(Matrix4.)
*/
let lastTime = 0;
const moveQ = new THREE.Quaternion( 0.5, 0.5, 0.5, 0.0 ).normalize();
const tmpQ = new THREE.Quaternion();
const tmpM = new THREE.Matrix4();
const currentM = new THREE.Matrix4();

/** COLOR SETTING INSTANCES ****/
//NOTE: You need to perform setColorAt() for all instances 
//or else instance color is null and unreadable, see Background.js.
let cubeColor = new THREE.Color();
cubeMesh.getColorAt(1, cubeColor);
cubeColor.setColorName('red');
cubeMesh.setColorAt(1, cubeColor );
cubeMesh.instanceColor.needsUpdate = true;
const amount = parseInt( window.location.search.slice( 1 ) ) || 10;

//let previousIds = [];
function animate(time) {
  //time *= 0.001; //convert to seconds.
  //time = performance.now();
  time = Date.now() * 0.001 / (100 / rotate_spd);
    //cubeMesh.rotation.y = time * 0.00005;

    /* ORIGINAL ROTATION, needed if rotating randomly.
    const delta = ( time - lastTime ) / 5000;
    tmpQ.set( moveQ.x * delta, moveQ.y * delta, moveQ.z * delta, 1 ).normalize();
    tmpM.makeRotationFromQuaternion( tmpQ );
    */

    
  
    const currShape = new THREE.Object3D();
    // for (let i = 0; i < cubeMesh.count; i++) {
    // 	cubeMesh.getMatrixAt( i, currentM);
    // 	//currentM.multiply( testShape.matrix );
    //   //currentM.multiply(tmpM);
    // 	cubeMesh.setMatrixAt( i, currentM);

    // }

    /******* Randomize Colors WIP ********/
    // for(let i = 0; i < 100; i++) {
    //   //TODO revert the colors back after a set time interval.

    //   //Change colors of new ones. Note that this doesn't account for duplicates.
    //   let currentId = Math.ceil(Math.random() * cubeMesh.count);
    //   //previousIds.push(currentId);
    //   cubeMesh.getColorAt(currentId, cubeColor); //Store at cubeColor
    //   cubeColor.setHex(Math.random() * 0xFFFFFF); //Change color to be random hex value between #000000 to #FFFFFF
    //   //cubeColor.setHex(Math.random() * 0x30D5C8); //change color to miku.
    //   cubeMesh.setColorAt(currentId, cubeColor); //Set color.
    // }
    cubeMesh.instanceColor.needsUpdate = true;

    cubeMesh.rotation.x = Math.sin( time / 4 );
    cubeMesh.rotation.y = Math.sin( time / 2 );

    let count = 0;
    const offset = ( amount - 1 ) / 2;

    for ( let x = 0; x < amount; x ++ ) {

      for ( let y = 0; y < amount; y ++ ) {

        for ( let z = 0; z < amount; z ++ ) {

          currShape.position.set( offset - x, offset - y, offset - z );
          currShape.rotation.y = ( Math.sin( x / 4 + time ) + Math.sin( y / 4 + time ) + Math.sin( z / 4 + time ) );
          currShape.rotation.z = currShape.rotation.y * 2;

          currShape.updateMatrix();

          cubeMesh.setMatrixAt( count++, currShape.matrix );

        }

      }

    }



    cubeMesh.instanceMatrix.needsUpdate = true;
    cubeMesh.computeBoundingSphere();

  //lastTime = time; //ORIGINAL ROTATION, needed if rotating randomly.

  //PC-kun did not like this lol
  //backgroundObj.rotateCubesXBy(0.5);

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

export function setRotationSpeed(newSpeed) {
  rotate_spd = newSpeed;
}

export function setRandomColor() {
  let theInstance =  Math.ceil(Math.random() * cubeMesh.count);
  let theColor =  Math.random() * 0xFFFFFF;

  let cubeColor = new THREE.Color();
  cubeMesh.getColorAt(0, cubeColor);
  cubeColor.setHex(theColor);
  cubeMesh.setColorAt(0, cubeColor );
  cubeMesh.instanceColor.needsUpdate = true;
}

//}());