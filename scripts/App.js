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


class App {
  constructor(element) {
    this.container = document.querySelector(element);

    //Add uniforms 
    this.uniforms = {
      uTime: { value: 0.0 },
    };
    
    //Values that will be used in initialization and setup
    this.config = {
      squareSize: 1.5,
      squareCount: 500,
      sphereSize: 15

      //BELOW ARE FROM EXAMPLE, shows what stuff goes here. 

      //backgroundColor: new Color('#0d021f'),
      //cameraSpeed: 0,
      //cameraRadius: 4.5,
      //particlesSpeed: 0,
      //particlesCount: 3000,
      //bloomStrength: 1.45,
      //bloomThreshold: 0.34,
      //bloomRadius: 0.5
    }

    //Don't know these are needed below.
    //this.tick = 0;
    this._resizeScreen = () => this._onResize();
  }

  /**
   * Initializes the App, performs setup and starts animation loop
   */
  init() {

    //Setup
    this._createTextAliveTracker();
    this._createRenderer();
    this._createClock();
    this._onResize(); //Calc aspect for first time.
    this._addListeners();

    //Scene Creation
    this._createMikuScene();
    this._createWaveScene();
    this._createFullScreenScene();

    //Animate
    this._setAnimationLoop();
    console.log(this);
  }

  /**
   * Checks if use has webGL available.
   * This starts the animation if webGL is available
   * else send a warning and does not animate.
   */
  _setAnimationLoop() {
    if (WebGL.isWebGLAvailable()) {
      this.renderer.setAnimationLoop(() => {
        this._update();
        this._render();
      })
    } else {
      const warning = WebGL.getWebGLErrorMessage();
      document.getElementById('container').appendChild(warning);
    }
  }

  /**
   * I have no idea what this does, you should put a description here lol.
   */
  _createTextAliveTracker() {
    this.textAliveData = {
      beat: { currValue: 1.0, prevValue: 1.0 },
      chord: { currValue: 1.0, prevValue: 1.0},
      inChorus: { value: false }
    };
  }

  /**
   * Creates the renderer for the app and its THREE.js scenes.
   */
  _createRenderer() {
    this.renderer = new THREE.WebGL1Renderer({ alpha: true, antialias: true, element: this.container
      }); // alpha true = transparent bg

    /****************** to enable transparent scenes***************** */
    // Works only when rendered by renderer, not composer
    this.renderer.autoClear = false;
    this.renderer.clearDepth();

    //Append global renderer.
    document.body.appendChild(this.renderer.domElement);
  }

  /**
   * Creates the scene for the large box on the right.
   * Contains a miku sprite. 
   */
  _createMikuScene() {
    this.mikuScene = new ElemScene(document.querySelector("#miku-scene"), this.renderer);
    this.mikuSprite = new MikuSprite(this.mikuScene.getScene(), this.uniforms, 0);
  }

  /**
   * Creates the scene for the small box in upper-left corner.
   * Currently contains an hologram sphere.
   */
  _createWaveScene() {
    const geo = new THREE.SphereGeometry(this.config.sphereSize);

    this.waveScene = new ElemScene(document.querySelector("#wave-scene"), this.renderer);
    this.hologram = new hologramShape(this.waveScene.getScene(), geo, this.uniforms, 0);
  }

  /**
   * Creates the scene for the background behind the boxes.
   * Currently contains a lot of box instances.
   */
  _createFullScreenScene() {
    const size = this.config.squareSize;
    const geo = new THREE.BoxGeometry(size, size, size);
    const mat = new THREE.MeshPhongMaterial(0xFFFFFF);

    this.fullScrScene = new ElemScene(document.getElementById("graphic-grid"), this.renderer);
    this.fullScrShapes = new InstanceShapes(this.fullScrScene.getScene(), geo, mat, this.config.squareCount, 0);
    this.fullScrShapes.randomizeSpherePos(30);
  }

  /**
   * Creates the App's clock used for tracking time in animation loop.
   */
  _createClock() {
    this.clock = new THREE.Clock();
  }

  /**
   * Updates the App's values for textAlive and animation.
   * This runs every frame before rendering.
   */
  _update() {
    const time = this.clock.getElapsedTime();
    this.uniforms.uTime.value = time;

    // update previous textAliveData
    this.textAliveData.beat.prevValue = this.textAliveData.beat.currValue;
    this.textAliveData.chord.prevValue = this.textAliveData.chord.currValue;

    // update stored textAliveData
    this.textAliveData.beat.currValue = getBeatRatio();
    this.textAliveData.chord.currValue = getChordRatio();

    if (Math.abs(this._linearToTwoLinears(this.textAliveData.beat.currValue) - 
    this._linearToTwoLinears(this.textAliveData.beat.prevValue)) > 0.5) {
      this.mikuSprite.nextFrame();
    }
  }

  /**
   * Renders the App's new animation values.
   * This runs after updating our animation values in _update().
   */
  _render() {
    this.renderer.setScissorTest(false);
    this.renderer.clear(true, true);
    this.renderer.setScissorTest(true);  
    this.fullScrScene.renderScene(this.renderer);
    this.mikuScene.renderScene(this.renderer);
    this.waveScene.renderScene(this.renderer);
    //TWEEN.update(); //If tweening.
  }

  /**
   * HELPER: Splits the given value into two piecewise functions
   * Ex. instead of x = y, returns:
   * y = 2x if 0 < x <= 0.5
   * y = 2x + 1 if 0.5 < x <= 1
   * Where x = linearValue and the returned output is the y
   * @param {number} linearValue - value from scale of 0 to 1
   * @returns 
   */
  _linearToTwoLinears(linearValue) {
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
  _linearToGaussian(linearValue) {
    let a = 0.4;
    let b = 0.5;
    let c = 2.4;
    let coefficient = 1 / (a * Math.sqrt(2 * Math.PI));
    let exp = -c * Math.pow((linearValue - b) / a, 2);
    let product = coefficient * Math.pow(Math.E, exp);
    return product;
  }

  _addListeners() {
    window.addEventListener('resize', this._resizeScreen);
  }

  /**
   * Destroy the App from element and
   * frees allocated resources.
   */
  destroy() {
    this.renderer.dispose();
    this._removeListeners();
  }

  _removeListeners() {
    window.removeEventListener('resize', this._resizeScreen)
  }

  /**
   * Resizes the renderer to element's size.
   */
  _onResize() {
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }
}

const app = new App('#c');

app.init();