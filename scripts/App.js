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
import {getBeatRatio, getChordRatio, getParenRatio, getPosition} from './Lyrics.js';
import FloatShapes from './FloatShapes.js';
import ElemScene from './ElemScene.js';
import * as TWEEN from '@tweenjs/tween.js';
import MeshSlide from './MeshSlide.js';


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

    // Setup
    this._createTextAliveTracker();
    this._createRenderer();
    this._createClock();
    this._onResize(); // Calc aspect for first time.
    this._addListeners();

    // set up shapes
    this._createHeartShape(100);

    // Scene Creation
    this._createMikuScene();
    this._createScene1();
    this._createScene2();
    this._createFullScreenScene();

    // Animate
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
      });
    } else {
      const warning = WebGL.getWebGLErrorMessage();
      document.getElementById('container').appendChild(warning);
    }
  }

  /**
   * keeps track of timing data from the textAlive app
   * beat: value from [0, 1] representing the completion of the beat
   * chord: value from [0, 1] representing completion of chord
   * inChorus: boolean, true if in chorus, false if not
   */
  _createTextAliveTracker() {
    this.textAliveData = {
      beat: { currValue: 1.0, prevValue: 1.0 },
      chord: { currValue: 1.0, prevValue: 1.0},
      position: { value: 0 },
      inChorus: { value: false },
      SECOND_CHORUS_START: { value: 110764.6}
    };
  }

  /**
   * Creates and stores a heart shape 
   * @param {number} factor - amount to shrink the heart shapes by
   */
  _createHeartShape(factor) {
    const x = 0, y = 0;
    this.heartShape = new THREE.Shape();
    this.heartShape.moveTo( x + 5 / factor, y + 5 / factor);
    this.heartShape.bezierCurveTo( x + 5 / factor, y + 5 / factor, x + 4 / factor, y / factor, x / factor, y / factor );
    this.heartShape.bezierCurveTo( x - 6 / factor, y / factor, x - 6 / factor, y + 7 / factor,x - 6 / factor, y + 7  / factor);
    this.heartShape.bezierCurveTo( x - 6 / factor, y + 11 / factor, x - 3 / factor, y + 15.4 / factor, x + 5 / factor, y + 19  / factor);
    this.heartShape.bezierCurveTo( x + 12 / factor, y + 15.4 / factor, x + 16 / factor, y + 11 / factor, x + 16 / factor, y + 7  / factor);
    this.heartShape.bezierCurveTo( x + 16 / factor, y + 7 / factor, x + 16 / factor, y / factor, x + 10 / factor, y  / factor);
    this.heartShape.bezierCurveTo( x + 7 / factor, y / factor, x + 5 / factor, y + 5 / factor, x + 5 / factor, y + 5  / factor);
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
    const firstMiku = {
      sheetPath: "../images/miku_sprites.png",
      alphaPath: "../images/alpha_sheet.png",
      framesX: 5,
      framesY: 2
    }

    const secondMiku = {
      sheetPath: "../images/miku_speak.png",
      alphaPath: "../images/alpha_speak.png",
      framesX: 5,
      framesY: 2
    }

    this.mikuSprite = new MikuSprite(this.mikuScene.getScene(), firstMiku, this.uniforms, 0);
    this.mikuSprite2 = new MikuSprite(this.mikuScene.getScene(), secondMiku, this.uniforms, 0);

    const material = new THREE.MeshStandardMaterial({
      side: THREE.DoubleSide,
    });

    this.mikuParticles = new InstanceShapes(this.mikuScene.getScene(), new THREE.ShapeGeometry(this.heartShape), material, 2000, 0);
    this.mikuParticles.randomizeSpherePos(20);

    // this.mikuBg = new Experiment(this.mikuScene.getScene(), new THREE.BoxGeometry(20, 20, 20), this.uniforms, 0);
    // this.mikuTube = new infiniteTubes(this.mikuScene.getScene(), this.uniforms, 0);
    this.mikuBg = new hologramShape(this.mikuScene.getScene(), new THREE.SphereGeometry(20), this.uniforms, 0);
  }

  /**
   * Creates the scene for the small box in upper-left corner.
   * Currently contains an hologram sphere.
   */
  _createScene1() {
    const geo = new THREE.SphereGeometry(this.config.sphereSize);

    let meshes = [
      new THREE.Mesh(new THREE.OctahedronGeometry(), new THREE.MeshPhongMaterial({color: 0x33ccff})),
      new THREE.Mesh(new THREE.SphereGeometry(1), new THREE.MeshPhongMaterial({color: 0xff5050})),
      new THREE.Mesh(new THREE.IcosahedronGeometry(1), new THREE.MeshPhongMaterial({color: 0x00cc99})),
      new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshPhongMaterial({color: 0xffcc00}))
    ];


    this.scene1 = new ElemScene(document.querySelector("#scene-1"), this.renderer);
    this.MeshSlide1 = new MeshSlide(this.scene1.getScene(), this.scene1.getCam(), 6, meshes);
    //this.MeshSlide1.push(testSphere);
    //this.MeshSlide1.push(testIco);
    //this.MeshSlide1.setGeometryAt(0, new THREE.OctahedronGeometry());
    //this.MeshSlide1.setMaterialAt(0, new THREE.MeshPhongMaterial({color: 0xffffff}));
    this.hologram = new hologramShape(this.scene1.getScene(), geo, this.uniforms, 0);
  }

  _createScene2() {
    const geo = new THREE.SphereGeometry(this.config.sphereSize);
    let meshes = [ //Temporary shapes, feel free to change.
      new THREE.Mesh(new THREE.OctahedronGeometry(), new THREE.MeshPhongMaterial({color: 0x33ccff})),
      new THREE.Mesh(new THREE.SphereGeometry(1), new THREE.MeshPhongMaterial({color: 0xff5050})),
      new THREE.Mesh(new THREE.IcosahedronGeometry(1), new THREE.MeshPhongMaterial({color: 0x00cc99})),
      new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshPhongMaterial({color: 0xffcc00}))
    ]; //The option to change mid animation still there with .push or .change
    
    this.scene2 = new ElemScene(document.querySelector("#scene-2"), this.renderer);
    this.Slides = [];
    for(let count = 0; count < 3; count++) {
      this.Slides.push(new MeshSlide(this.scene2.getScene(), this.scene2.getCam(), 6, meshes));
    }
    this.Slides[0].setView(new THREE.Vector3(0, 3, -4));
    this.Slides[1].setView(new THREE.Vector3(0, 0, -4));
    this.Slides[2].setView(new THREE.Vector3(0, -3, -4)); //Race condition again with .setView

    this.Slides[0].setExit(new THREE.Vector3(4, 3, -4));
    this.Slides[0].setView(new THREE.Vector3(0, 3, -4));
    this.Slides[0].setStart(new THREE.Vector3(-4, 3, -4));

    this.Slides[1].setStart(new THREE.Vector3(4, 0, -4));
    this.Slides[1].setView(new THREE.Vector3(0, 0, -4));
    this.Slides[1].setExit(new THREE.Vector3(-4, 0, -4));

    this.Slides[2].setExit(new THREE.Vector3(4, -3, -4));
    this.Slides[2].setStart(new THREE.Vector3(-4, -3, -4));
    this.hologram = new hologramShape(this.scene2.getScene(), geo, this.uniforms, 0);
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
    this.fullScrShapes.randomizeSpherePos(45);
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
    this.textAliveData.position.value = getPosition();

    if (Math.abs(this._linearToTwoLinears(this.textAliveData.beat.currValue) - 
    this._linearToTwoLinears(this.textAliveData.beat.prevValue)) > 0.5) {
      this.MeshSlide1.next(2000);
      this.Slides[Math.floor(Math.random() * this.Slides.length)].next(2000);
    }

    if (Math.abs(this._linearToPiecewise(this.textAliveData.beat.currValue, 4) - 
    this._linearToPiecewise(this.textAliveData.beat.prevValue, 4)) > 0.5) {
      this.mikuSprite.nextFrame();
      this.mikuSprite2.nextFrame();
    }

    if(getParenRatio()) {
      this.mikuSprite2.setRotation(0);
      this.mikuSprite.setRotation(90);
    } else {
      this.mikuSprite.setRotation(0);
      this.mikuSprite2.setRotation(90);
    }

    this.mikuParticles.setRotation(THREE.MathUtils.degToRad(10));
    //this.mikuParticles.translate(this.textAliveData.beat.currValue);
    this.mikuParticles.incrementEntireRotation(0.002);

    // this.mikuTube.updateMaterialOffset((1 - this.textAliveData.beat.currValue) / 10);

    //this.fullScrShapes.incrementEntireRotation((1 - this.textAliveData.chord.currValue) / 90);
    if (this.textAliveData.position.value >= this.textAliveData.SECOND_CHORUS_START.value) {
      this.fullScrShapes.setGeometry;
    }

    this.fullScrShapes.incrementEntireRotation(0.002);

    TWEEN.update(); //If tweening.
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
    this.scene1.renderScene(this.renderer);
    this.scene2.renderScene(this.renderer);

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

  _linearToPiecewise(linearValue, numSplits) {
    const multiple = linearValue - linearValue % (1 / numSplits);
    return numSplits * (linearValue - multiple);
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