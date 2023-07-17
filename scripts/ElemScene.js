import * as THREE from 'three';
import { BloomEffect, ChromaticAberrationEffect, DepthOfFieldEffect, EffectComposer, EffectPass, RenderPass } from "postprocessing";

export default class ElemScene {
  #scene;
  #camera;
  #element;
  #composer;
  #cameraZoom;

  /**
   * Construct a threejs scene
   * @param {*} elem - DOM element to add the scene to
   * @param {*} renderer - renderer used for the scene
   * @param {*} cameraZoom - initial z position of the camera
   */
  constructor(elem, renderer, cameraZoom) {
    this.#scene = new THREE.Scene();
    this.#scene.fog = new THREE.Fog(0x839EFF, 10, 40);
    this.#element = elem;

    const aspectRatio = elem.offsetWidth / elem.offsetHeight;
    //fov, aspect, near, far
    this.#camera = new THREE.PerspectiveCamera(45, aspectRatio, 0.1, 1000);
    this.#camera.position.set(0, 1, cameraZoom);
    this.#cameraZoom = cameraZoom;
    this.#camera.lookAt(0, 0, 0);

    //Setting up lighting
    {
      // color, intensity
      const light =  new THREE.PointLight(0xFFFFFF, 1);
      light.position.set(-1, 2, 4);
      this.#scene.add(light);

      const ambient = new THREE.AmbientLight(0x839EFF, 1);
      ambient.position.set(1, 1, 4);
      this.#scene.add(ambient);
    }

    // set up composer
    let renderTarget = new THREE.WebGLRenderTarget(elem.offsetWidth, elem.offsetHeight);
    const params = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBuffer: false };
    this.#composer = new EffectComposer(renderer, renderTarget, params);
    let renderPass = new RenderPass(this.#scene, this.#camera);
    this.#composer.addPass(renderPass);
    this.#bloomRender()
    this.#rgbRender();
    this.#depthRender();
  }

  resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
      composer.setSize(width, height);
    }
    return needResize;
  }

  renderScene(renderer, composer) {
    const {left, right, top, bottom, width, height} = this.#element.getBoundingClientRect();
    const isVisible = bottom >= 0 && top <= renderer.domElement.clientHeight &&
                    right  >= 0 && left <= renderer.domElement.clientWidth;
    // const isVisable =  bot < 0 ||
    //     top > renderer.domElement.clientHeight ||
    //     right < 0 ||
    //     left > renderer.domElement.clientWidth;
    //console.log(isVisable);

    // will always be visible
    this.#camera.aspect = width/height;
    this.#camera.updateProjectionMatrix();
    
    //setScissor and setViewport set bottom differently
    const posBot = renderer.domElement.clientHeight - bottom;

    renderer.setScissor(left, posBot, width, height);
    renderer.setViewport(left, posBot, width, height);

    //renderer.render(this.#scene, this.#camera);
    this.#composer.render(); 

    // if(isVisible) {
    //     this.#camera.aspect = width/height;
    //     this.#camera.updateProjectionMatrix();
        
    //     //setScissor and setViewport set bottom differently
    //     const posBot = renderer.domElement.clientHeight - bottom;

    //     renderer.setScissor(left, posBot, width, height);
    //     renderer.setViewport(left, posBot, width, height);

    //     renderer.render(this.#scene, this.#camera);
    // }
  }

  updateCamPos(mouseX, mouseY, focusPos) {
    //this.#camera.position.x = Math.sin( 1 * Math.PI * ( mouseX - .5 ) ) * 1;
    //this.#camera.position.y = Math.sin( 1 * Math.PI * ( mouseY - .5 ) ) * 1 + 1;
    //this.#camera.position.z = Math.cos( 1 * Math.PI * ( mouseX - .5 ) ) * 1 + this.#cameraZoom;
    this.#camera.position.x += ( (mouseX * 5) - this.#camera.position.x ) * .05;
    this.#camera.position.y += ( - ( mouseY * 5) - this.#camera.position.y ) * .05;
    //this.#camera.position.z += ( mouseX - this.#camera.position.z ) * .05;
    this.#camera.lookAt(focusPos.x, focusPos.y, focusPos.z);
  }

  getScene() {
    return this.#scene;
  }

  getCam() {
    return this.#camera;
  }

  #bloomRender() {
    let effect = new BloomEffect({
      intensity: 0.5,
      radius: 0.4,
    });
    let bloomPass = new EffectPass( this.#camera, effect );
    this.#composer.addPass(bloomPass);
  }

  /**
   * Adds chromatic abberation to the composer pass
   * @param {EffectComposer} composer 
   */
  #rgbRender() {
    const effect = new ChromaticAberrationEffect();
    effect.offset = new THREE.Vector2(0.004);
    effect.radialModulation = true;
    const rgbPass = new EffectPass( this.#camera, effect );
    
    this.#composer.addPass( rgbPass );
  }

  #depthRender() {
    const effect = new DepthOfFieldEffect(this.#camera, {
      worldFocusRange: 35,
      bokehScale: 5,
      focusRange: 1
    });
    const depthPass = new EffectPass(this.#camera, effect);
    this.#composer.addPass( depthPass );
  }
    
}