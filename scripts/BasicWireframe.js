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

  /**
   * Changes color of wireframe lines
   * @param {number} newColor - color in HEX to change to
   */
  setColor(newColor) {
    this.#line.material.color = newColor;
  }
}