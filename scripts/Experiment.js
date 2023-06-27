import * as THREE from 'three';

export default class Experiment {
  #mesh;

  constructor(parentScene, theGeometry) {
    // let material = new THREE.MeshStandardMaterial({
    //     roughness: 0.5,
    //     metalness: 0.9,
    //     color: 0x000088,
    //     //wireframe: true,
    //     transparent: true,
    //     opacity: 0.5
    // });

    let color = new THREE.Color(0x3762ff);
    //let material = new THREE.MeshBasicMaterial({ color: color})

    let material = new THREE.MeshPhongMaterial({
        color: color,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
        emissive: color,
        emissiveIntensity: 0.5
    });

    this.#mesh = new THREE.Mesh(theGeometry, material);
    parentScene.add(this.#mesh);
  }
}