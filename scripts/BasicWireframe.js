import * as THREE from 'three';

export default class BasicWireframe {
  #line;

  constructor(parentScene, geometry, lineColor, lineWidth) {
    const wireframeGeo = new THREE.WireframeGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial( {
        color: lineColor,
        linewidth: lineWidth
    });
    this.#line = new THREE.LineSegments(wireframeGeo, lineMaterial);
    parentScene.add(this.#line);
  }
}