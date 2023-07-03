import * as THREE from 'three';
import vertexShader from './shaders/vertex.glsl?raw'; // vite needs the ?raw query to import as string
import fragmentShader from './shaders/brainFragment.glsl?raw';

export default class Experiment {
  #mesh;

  constructor(parentScene, theGeometry, uniforms, layer) {

    let color = new THREE.Color(0x3762ff);
    //let material = new THREE.MeshBasicMaterial({ color: color})

    let material = new THREE.ShaderMaterial({
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms  
    });

    this.#mesh = new THREE.Mesh(theGeometry, material);
    this.#mesh.layers.set(layer);
    parentScene.add(this.#mesh);
  }
}