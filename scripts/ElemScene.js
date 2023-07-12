import * as THREE from 'three';
import { BloomEffect, ChromaticAberrationEffect, EffectComposer, EffectPass, RenderPass } from "postprocessing";

export default class ElemScene {
  #scene;
  #camera;
  #element;
  #composer;

  constructor(elem, renderer) {
    this.#scene = new THREE.Scene();
    this.#scene.fog = new THREE.Fog(0xFF0000, 10, 40);
    this.#element = elem;

    const aspectRatio = elem.offsetWidth / elem.offsetHeight;
    //fov, aspect, near, far
    this.#camera = new THREE.PerspectiveCamera(45, aspectRatio, 0.1, 1000);
    this.#camera.position.set(0, 1, 10);
    this.#camera.lookAt(0, 0, 0);

    //Setting up lighting
    {
      //color, intensity
      const light =  new THREE.DirectionalLight(0xFFFFFF, 1);
      light.position.set(-1, 2, 4);
      this.#scene.add(light);
    }

    // set up composer
    let renderTarget = new THREE.WebGLRenderTarget(elem.offsetWidth, elem.offsetHeight);
    const params = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBuffer: false };
    this.#composer = new EffectComposer(renderer, renderTarget, params);
    let renderPass = new RenderPass(this.#scene, this.#camera);
    this.#composer.addPass(renderPass);
    this.#bloomRender()
    this.#rgbRender();

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

  getScene() {
      return this.#scene;
  }

  #bloomRender() {

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
    let bloomPass = new EffectPass( this.#camera, effect );
    this.#composer.addPass(bloomPass);
  }

  /**
   * Adds chromatic abberation to the composer pass
   * @param {EffectComposer} composer 
   */
  #rgbRender() {
    const rgbPass = new EffectPass( this.#camera, new ChromaticAberrationEffect() );
    
    this.#composer.addPass( rgbPass );
  }
    
}