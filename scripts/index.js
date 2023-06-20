import * as THREE from 'three';
//Importmap recognizes three/addons
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import WebGL from 'three/addons/capabilities/WebGL.js';
import { BloomEffect, PixelationEffect, EffectComposer, EffectPass, RenderPass } from "postprocessing";
import Background from "./Background.js";

(function() {  
  //Select the canvas
  const backCanvas = document.querySelector('#c');

  // alpha true defaults to transparent bg
  const renderer = new THREE.WebGL1Renderer({ alpha: true, antialias: true, backCanvas });

  //(fov, aspect, minRender, maxRender);
  const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 200);

  //Controls for Camera, add-on for three.js
  const camControls = new OrbitControls(camera, renderer.domElement);
  const scene = new THREE.Scene();

  // composer for postprocessing
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  //composer.addPass(new EffectPass(camera, new PixelationEffect(5)));

  //Cube Constants used
  const numOfCubes = [10, 10, 10]; //x, y, z;
  const cubeSize = [1, 1, 1]; //x, y, z multipliers.

  //See background.js, creates and gives initial postion for cubes for now
  let backgroundObj =  new Background(scene);
  backgroundObj.createInstancedCubes(cubeSize[0], cubeSize[1], cubeSize[2], 0xFFFFFF);
  backgroundObj.randomizeCubePos();

  /**********HELPER VISUALS (DELETE BEFORE FINAL RELEASE)**********/
  //x, y, z axes, points in positive direction.
  const axes = new THREE.AxesHelper(5)
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

  //let previousIds = [];
  function animate(time) {
    //time *= 0.001; //convert to seconds.
    time = performance.now();

			//cubeMesh.rotation.y = time * 0.00005;

			const delta = ( time - lastTime ) / 5000;
			tmpQ.set( moveQ.x * delta, moveQ.y * delta, moveQ.z * delta, 1 ).normalize();
			tmpM.makeRotationFromQuaternion( tmpQ );
      
      const testShape = new THREE.Object3D();
			for ( let i = 0, il = cubeMesh.count; i < il; i ++ ) {
        //testShape.rotation.x += 0.5;
				cubeMesh.getMatrixAt( i, currentM);
				//currentM.multiply( testShape.matrix );
        currentM.multiply(tmpM);
				cubeMesh.setMatrixAt( i, currentM);

			}

      /******* Randomize Colors WIP ********/
      for(let i = 0; i < 100; i++) {
        //TODO revert the colors back after a set time interval.

        //Change colors of new ones. Note that this doesn't account for duplicates.
        let currentId = Math.ceil(Math.random() * cubeMesh.count);
        //previousIds.push(currentId);
        cubeMesh.getColorAt(currentId, cubeColor); //Store at cubeColor
        cubeColor.setHex(Math.random() * 0xFFFFFF); 
        //cubeColor.setHex(Math.random() * 0x30D5C8); //change color to miku.
        cubeMesh.setColorAt(currentId, cubeColor); //Set color again.
      }
      cubeMesh.instanceColor.needsUpdate = true;




      cubeMesh.instanceMatrix.needsUpdate = true;
			cubeMesh.computeBoundingSphere();

			lastTime = time;

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


}());