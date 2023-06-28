import * as THREE from 'three';
import vertexShader from './shaders/vertex.glsl?raw'; // vite needs the ?raw query to import as string
import fragmentShader from './shaders/fragment.glsl?raw';

export default class Experiment2 {
  #mesh;

  constructor(parentScene, theGeometry, uniforms) {

    let color = new THREE.Color(0x3762ff);
    //let material = new THREE.MeshBasicMaterial({ color: color})

    // let material = new THREE.MeshPhongMaterial({
    //     color: color,
    //     transparent: true,
    //     opacity: 0.3,
    //     blending: THREE.AdditiveBlending,
    //     emissive: color,
    //     emissiveIntensity: 0.5
    // });

    let material = new THREE.ShaderMaterial( {
      // uniforms: {
      //   uTime: { value: 1.0 },
      //   //resolution: { value: new THREE.Vector2() }
      // },
      blending: THREE.AdditiveBlending,
      opacity: 0.3,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms
    });

    this.#mesh = new THREE.Mesh(theGeometry, material);
    parentScene.add(this.#mesh);
  }
}