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
    this.tick = 0;
    this._resizeScreen = () => this._onResize();
  }

  init() {
    this._createTextAliveTracker();
    this._createRenderer();
    //this.createPostProcess();
    this._onResize(); //Calc aspect for first time.
    this._addListeners();
    this._createMikuScene();
    this._createWaveScene();
    this._createFullScreenScene();

    this.renderer.setAnimationLoop(() => {
      this._update();
      this._render();
    })

    console.log(this);
  }

  destroy() {
    this.renderer.dispose();
    this._removeListeners();
  }

  _update() {
    time *= 0.001;
    uniforms.uTime.value = time;
  
    mikuScene.resizeRendererToDisplaySize(renderer);
  
    renderer.setScissorTest(false);
    renderer.clear(true, true);
    renderer.setScissorTest(true);  
  
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
    TWEEN.update(); //No need to specify time.
  }

  _render() {
    if (WebGL.isWebGLAvailable()) {
      //Starts loop, continously calls requestAnimationFrame() on animate.
      fullScreenScene.renderScene(renderer);
      mikuScene.renderScene(renderer);
      waveScene.renderScene(renderer);
    } else {
      const warning = WebGL.getWebGLErrorMessage();
      document.getElementById('container').appendChild(warning);
    }
  }

  _createTextAliveTracker() {
    this.textAliveData = {
      beat: { currValue: 1.0, prevValue: 1.0 },
      chord: { currValue: 1.0, prevValue: 1.0},
      inChorus: { value: false }
    };
  }

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

  _addListeners() {
    window.addEventListener('resize', this._resizeScreen);
  }

  _createMikuScene() {
    this.mikuScene = new ElemScene(document.querySelector("#miku-scene"), this.renderer);

    this.test = new InstanceShapes(this.mikuScene.getScene(),
                                    new THREE.BoxGeometry(this.config.squareSize,
                                                          this.config.squareSize,
                                                          this.config.squareSize),
                                    new THREE.MeshPhongMaterial(0xFFFFFF), 150, 0);

    this.test.randomizeSpherePos(30);

    this.mikuSprite = new MikuSprite(this.mikuScene.getScene(), uniforms, 0);
  }
  _createWaveScene() {
    this.waveScene = new ElemScene(document.querySelector("#wave-scene"), this.renderer);
    this.hologram = new hologramShape(this.waveScene.getScene(), 
                                      new THREE.SphereGeometry(this.config.sphereSize),
                                      uniforms, 0);
  }
  _createFullScreenScene() {
    this.fullScreenScene = new ElemScene(document.getElementById("graphic-grid"), this.renderer);
    this.fullScreenShapes = new InstanceShapes(this.fullScreenScene.getScene(),
                                               new THREE.BoxGeometry(this.config.squareSize,
                                                                     this.config.squareSize,
                                                                     this.config.squareSize),
                                               new THREE.MeshPhongMaterial(0xFFFFFF), 500, 0);
    this.fullScreenShapes.randomizeSpherePos(30);
  }

  _removeListeners() {
    window.removeEventListener('resize', this._resizeScreen)
  }

  _onResize() {
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.composer.setSize(this.container.clientWidth, this.container.clientHeight);

    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
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
}

const app = new App('#c');

app.init();