import * as THREE from 'three';

export default class InstanceShapes {
  #mesh;
  #geometry;

  constructor(parentScene, theGeometry, theMaterial, count, layer) {
    this.#geometry = theGeometry;
    this.#mesh = new THREE.InstancedMesh(theGeometry, theMaterial, count);
    this.#mesh.layers.set(layer);
    parentScene.add(this.#mesh);

    //Needed since default InstancedMesh doesn't set color.
    for (let i = 0; i < this.#mesh.count; i++) {//Must set initial color to change later.
      this.#mesh.setColorAt( i, theMaterial.color);
    }
  }

/** 
* Randomizes the cubes' position with a range.
* @param {number} width - width/height/depth of cube boundary
*
*/
randomizeCubePos(width) {
  const currShape = new THREE.Object3D();
  for (let i = 0; i < this.#mesh.count; i++) {
      currShape.position.x = Math.random() * width - (width / 2);
      currShape.position.y = Math.random() * width - (width / 2);
      currShape.position.z = Math.random() * width - (width / 2);

      // rotations
      currShape.rotation.x = Math.random() * 360;
      currShape.rotation.y = Math.random() * 360;
      currShape.rotation.z = Math.random() * 360;
      
      const scaleB = Math.random();
      currShape.scale.x = scaleB;
      currShape.scale.y = scaleB;
      currShape.scale.z = scaleB;

      currShape.updateMatrix(); //Update matrix's (x,y,z)
      this.#mesh.setMatrixAt(i, currShape.matrix); //Change transformation matrix to new pos.
  }
}

  /**
   * Randomizes instance mesh positions in bounds of sphere.
   * @param {number} radius - radius of sphere boundary.
   *
   */
  randomizeSpherePos(radius) {
    const currShape = new THREE.Object3D();
    for (let i = 0; i < this.#mesh.count; i++) {
        let point = this.#generateSpherePoint(radius);
        currShape.position.x = point.x;
        currShape.position.y = point.y;
        currShape.position.z = point.z;

        // rotations
        currShape.rotation.x = Math.random() * 360;
        currShape.rotation.y = Math.random() * 360;
        currShape.rotation.z = Math.random() * 360;

        const scaleB = Math.random();
        currShape.scale.x = scaleB;
        currShape.scale.y = scaleB;
        currShape.scale.z = scaleB;
        
        currShape.updateMatrix(); //Update matrix's (x,y,z)
        this.#mesh.setMatrixAt(i, currShape.matrix); //Change transformation matrix to new pos.
    }
  }

  #generateSpherePoint(radius) {
    let x =  (Math.random() * 2 - 1) * 2 * radius;
    let y = (Math.random() * 2 - 1) *  2 * radius;
    let z = (Math.random() * 2 - 1) * 2 * radius;
    let point = new THREE.Vector3( x, y, z);

    if (Math.pow(x, 2) + Math.pow(y , 2) + Math.pow(z, 2) <= Math.pow(radius, 2)) {
      return point;
    } else {
      return this.#generateSpherePoint(radius);
    }
  }

  /**
   * Rotate each instanced shape by given value (radians).
   * @param {number} value - number in radians, amount to rotate the shapes by.
   */
  setRotation(value) {
    let currMatrix = new THREE.Matrix4();

    for (let i = 0; i < this.#mesh.count; i++) {

      this.#mesh.getMatrixAt(i, currMatrix)

      // rotations
      let rotationMatrix = new THREE.Matrix4();
      rotationMatrix.makeRotationY(value);
      currMatrix.multiply(rotationMatrix)
      
      rotationMatrix.makeRotationX(value);
      currMatrix.multiply(rotationMatrix)

      rotationMatrix.makeRotationZ(value);
      currMatrix.multiply(rotationMatrix)

      this.#mesh.setMatrixAt(i, currMatrix); //Change transformation matrix to new pos.
    }
    this.#mesh.instanceMatrix.needsUpdate = true;
  }

  /**
   * Changes geometry of all shapes in mesh.
   * @param {THREE.geometry} newGeo - geometry for meshed shapes to change to.
   */
  setGeometry(newGeo) {
    this.#mesh.geometry.dispose();
    this.#mesh.geometry = newGeo;
  }

  /**
   * Sets color of instance inputted.
   * 
   * TODO: Fix instanceId: 0 not working.
   * 
   * @param {Int} instanceId is the instance number of cube.
   * @param {String || Hex || THREE.Color} color is new color to set to.
   */
  setColorAt(instanceId, color) {
    let curColor = new THREE.Color();
    this.#mesh.getColorAt(instanceId, curColor);
    if(!color.isColor) {//Either hex, string, or Colors work.
      curColor.set(new THREE.Color(color)); //is THREE.color
    } else { //is hex or string.
      curColor.set(color);
    }
    this.#mesh.setColorAt(instanceId, curColor);
    this.#mesh.instanceColor.needsUpdate = true;
  }

  /**
   * increments rotation of entire instanced mesh
   * @param {number} value - value to increment rotation by
   */
  incrementEntireRotation(value) {
    this.#mesh.rotation.x += value;
  }
}
