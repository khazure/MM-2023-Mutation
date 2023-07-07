import * as THREE from 'three';
import vertexShader from './shaders/vertex.glsl?raw'; // vite needs the ?raw query to import as string
import fragmentShader from './shaders/fragment.glsl?raw';

export default class Experiment2 {
  #mesh;

  constructor(parentScene, theGeometry, layer) {
    const loader = new THREE.TextureLoader();

    const texture = loader.load("../images/profile_2.png");
    const alphaMap = loader.load("../images/alphaMap.png");

    let color = new THREE.Color(0x3762ff);
    let material = new THREE.MeshBasicMaterial({ 
      color: color,
      transparent: true,
      map: texture,
      alphaMap: alphaMap
    });

    // let material = new THREE.MeshPhongMaterial({
    //     color: color,
    //     transparent: true,
    //     opacity: 0.3,
    //     blending: THREE.AdditiveBlending,
    //     emissive: color,
    //     emissiveIntensity: 0.5
    // });

    this.#mesh = new THREE.Mesh(theGeometry, material);
    parentScene.add(this.#mesh);
    this.#mesh.layers.enable(layer);
  }
}