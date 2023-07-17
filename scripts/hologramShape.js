import * as THREE from 'three';

export default class hologramShape {
  #line;

  constructor(parentScene, geometry) {

    // make wireframe
    const wireframeGeo = new THREE.WireframeGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial( {
        color: 0x9DB2FF,
    });
    this.#line = new THREE.LineSegments(wireframeGeo, lineMaterial);
    parentScene.add(this.#line);
  }

  setRotate(amount) {
    this.#line.rotation.y = amount;
  }

  incrementRotate(amount) {
    this.#line.rotation.y += amount;
  }
}