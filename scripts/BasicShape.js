import * as THREE from 'three';

export default class BasicShape {
  #mesh;

  constructor(parentScene, theGeometry, theMaterial) {
    this.#mesh = new THREE.Mesh(theGeometry, theMaterial);
    parentScene.add(this.#mesh);
  }
}