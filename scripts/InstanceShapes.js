import * as THREE from 'three';

//80 Line Limit: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaA
export default class InstanceShapes {
  #mesh;
  #geometry;

  constructor(parentScene, theGeometry, theMaterial, count, layer) {
    this.#geometry = theGeometry;
    this.#mesh = new THREE.InstancedMesh(theGeometry, theMaterial, count);
    this.#mesh.layers.set(layer);
    parentScene.add(this.#mesh);

    //Probably should move this to seperate setColorAt()
    //Needed since default InstancedMesh doesn't set color.
    for (let i = 0; i < this.#mesh.count; i++) {//Must set initial color to change later.
      this.#mesh.setColorAt( i, theMaterial.color);
    }
  }

/** 
* Randomizes the cubes' position with a 80 to -20 range.
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
   * Randomizes instance mesh positions in bounds of sphere
   * @param {number} radius - radius of sphere boundary
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
   * Rotate each instanced shape by given value (radians)
   * @param {number} value - number in radians, amount to rotate the shapes by
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
   * Changes geometry of all shapes in mesh
   * @param {THREE.geometry} newGeo - geometry for meshed shapes to change to
   */
  setGeometry(newGeo) {
    this.#mesh.geometry.dispose();
    this.#mesh.geometry = newGeo;
  }

  /**
   * Arranges instances into a cube formation
   * 
   * @param {Number} xLength = amount of instances in x direction.
   * @param {Number} yLength = amount of instances in y direction.
   * @param {Number} zLength = amount of instances in z direction.
   * @param {Number} xGap = spacing between instances along x-axis.
   * @param {Number} yGap = spacing between instances along y-axis.
   * @param {Number} zGap = spacing between instances along z-axis.
   * @param {Number} xStart = spacing between instances along x-axis.
   * @param {Number} yStart = spacing between instances along y-axis.
   * @param {Number} zStart = spacing between instances along z-axis.
   */
  arrangeToCube(xLength, yLength, zLength, xGap, yGap, zGap, xStart, yStart, zStart) {
    const currShape = new THREE.Object3D();
    let count = 0;
    for(let i = xStart; i < xLength * xGap + xStart; i = i + xGap) {
        for(let j =  yStart; j < yLength * yGap + yStart; j = j + yGap) {
            for(let k = zStart; k < zLength * zGap + zStart; k = k + zGap) {
                currShape.position.x = i;
                currShape.position.y = j;
                currShape.position.z = k;

                currShape.updateMatrix(); //Update matrix's (x,y,z)
                this.#mesh.setMatrixAt(count, currShape.matrix); //Change transformation matrix to new pos.
                count++; 
            }
        }
    }
    this.#mesh.instanceMatrix.needsUpdate = true;
    this.#mesh.updateMatrixWorld();
    this.#mesh.computeBoundingBox();
  }
  /**
   * Arranges instances into a sphere formation according to diameter.
   *    | 10 11.. | 1 = level 1 (n^0)
   *    |  9 2 3  | 2 - 9 = level 2 (from 1^2 + 1 to 3^2)
   *    |  8 1 4  | 10 - 25 = level 3 (from 3^2 + 1 to 5^2)
   *    |  7 6 5  | 17 - 25
   *     Full squares: 1, 9, 25, 49...
   *     hollow: 1, 9 - 1, 25 - 9, 49 - 25
   *     1, 4, 8, 12, 16, 20
   * @param {number} diameter is the diameter of the sphere. 
   */
  arrangeToSphere(startX, startY, startZ, changeInX, changeInY, changeInZ, startRadius, endRadius) {
    this.arrangeToRing(1, 4, 12, startX, startY, startZ);
    this.arrangeToRing(13, 3, 10, startX, startY + 1.5, startZ);
    this.arrangeToRing(24, 2, 8, startX, startY + 3, startZ);
    this.arrangeToRing(33, 3, 10, startX, startY - 1.5, startZ);
    this.arrangeToRing(44, 2, 8, startX, startY - 3, startZ);
  }

  arrangeToRing(startIndex, radius, vertices, centerX, centerY, centerZ) {

    for(let i = startIndex; i <= startIndex + vertices; i++) {
      let newPos = new THREE.Matrix4();
      let angle = 2 * Math.PI * i/vertices; //Divide circumfrence of circle
      newPos.setPosition(radius * Math.cos(angle) + centerX, centerY, radius * Math.sin(angle) + centerZ);

      this.#mesh.setMatrixAt(i, newPos);
    }
    this.#mesh.instanceMatrix.needsUpdate = true;
    this.#mesh.computeBoundingBox();
  } 

  /**
   * NOTE:
   *  needsUpdate must be set true after finishing all movements
   *  computeBoundingBox(); as well.
   * 
   * @param {*} index 
   * @param {*} x 
   * @param {*} y 
   * @param {*} z 
   */
  setPosAt(index, x, y, z) {
    const posContainer =  new THREE.Object3D();
    posContainer.position.x = x;
    posContainer.position.y = y;
    posContainer.position.z = z;
    posContainer.updateMatrix();
    this.#mesh.setMatrixAt(index, posContainer.matrix);

  }

  /**
   * Rotates the Mesh in a manner similar to this example: 
   * https://threejs.org/examples/?q=instancing#webgl_instancing_dynamic 
   * 
   * TODO: Change rotation to match other example.
   * TODO: Speed values need to make sense, currently higher value means slower.
   * 
   * Steps to rotate instances cubes
   * 1. Create a Quaternion, this represents a rotation 'vector'
   * 2. Create a Matrix4, we will multiple the existing matrix by this.
   * 3. Do Matrix4.makeRotationFromQuaternion(theQuaternion);
   * 4. Store the instance's matrix in some temp matrix like currentM through instanceMesh.getMatrixAt(i, currentM)
   * 5. currentM.multiply(Matrix4.)
   * 
   * @param {Number} lastTime is the return time from when we last call this method.
   * @param {Number} rotateSpd is the speed at which cube rotates
   */
  rotateWave(rotateSpd, lastTime) {
    const moveQ = new THREE.Quaternion( 0.5, 0.5, 0.5, 0.0 ).normalize();
    const tempQ = new THREE.Quaternion();
    const multipler = new THREE.Matrix4();
    let currMatrix = new THREE.Matrix4();

    /* Performance.now() according to MDN.
     * Returns a DOMHighResTimeStamp representing the 
     * number of milliseconds elapsed since a reference instant.
     */
    const time = performance.now();
    const delta = (time - lastTime) / rotateSpd;
    tempQ.set( moveQ.x * delta, moveQ.y * delta, moveQ.z * delta, 1 ).normalize();
    multipler.makeRotationFromQuaternion(tempQ);
    for(let i = 0; i < this.#mesh.count; i++) {
      this.#mesh.getMatrixAt(i, currMatrix);
      currMatrix.multiply(multipler);
      this.#mesh.setMatrixAt(i, currMatrix);
    }

    this.#mesh.instanceMatrix.needsUpdate = true;
    this.#mesh.computeBoundingSphere();

    return time //To be used as lastTime.
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

  // translate(value) {
  //   let currMatrix = new THREE.Matrix4();

  //   for (let i = 0; i < this.#mesh.count; i++) {

  //     this.#mesh.getMatrixAt(i, currMatrix);

  //     // rotations
  //     value = Math.sin(THREE.MathUtils.degToRad(value * 360)) / 5;
  //     let transMatrix = new THREE.Matrix4();
  //     transMatrix.makeTranslation(0, 0, value);
  //     currMatrix.multiply(transMatrix);
      
  //     this.#mesh.setMatrixAt(i, currMatrix); //Change transformation matrix to new pos.
  //   }
  //   this.#mesh.instanceMatrix.needsUpdate = true;
  // }
}


    /******* Randomize Colors WIP ********/
    // for(let i = 0; i < 100; i++) {
    //   //TODO revert the colors back after a set time interval.

    //   //Change colors of new ones. Note that this doesn't account for duplicates.
    //   let currentId = Math.ceil(Math.random() * cubeMesh.count);
    //   //previousIds.push(currentId);
    //   cubeMesh.getColorAt(currentId, cubeColor); //Store at cubeColor
    //   cubeColor.setHex(Math.random() * 0xFFFFFF); //Change color to be random hex value between #000000 to #FFFFFF
    //   //cubeColor.setHex(Math.random() * 0x30D5C8); //change color to miku.
    //   cubeMesh.setColorAt(currentId, cubeColor); //Set color.
    // }

  //   rotateCubesXBy(currShape) {

  //     const time = Date.now() * 0.001 / (100 / 50);
  //     const amount = parseInt( window.location.search.slice( 1 ) ) || 10;
  //     let count = 0;
  //     const offset = ( amount - 1 ) / 2;
    
  //     for ( let x = 0; x < amount; x ++ ) {
    
  //       for ( let y = 0; y < amount; y ++ ) {
    
  //         for ( let z = 0; z < amount; z ++ ) {
    
  //           currShape.position.set( offset - x, offset - y, offset - z );
  //           currShape.rotation.y = ( Math.sin( x / 4 + time ) + Math.sin( y / 4 + time ) + Math.sin( z / 4 + time ) );
  //           currShape.rotation.z = currShape.rotation.y * 2;
    
  //           currShape.updateMatrix();
    
  //           this.cubeMesh.setMatrixAt( count++, currShape.matrix );
    
  //         }
    
  //       }
    
  //     }
  // }


  // export function setRotationSpeed(newSpeed) {
//   rotate_spd = newSpeed;
// }

// export function setRandomColor() {
//   let theInstance =  Math.ceil(Math.random() * cubeMesh.count);
//   let theColor =  Math.random() * 0xFFFFFF;

//   let cubeColor = new THREE.Color();
//   cubeMesh.getColorAt(0, cubeColor);time = Date.now() * 0.001 / (100 / rotate_spd);
//   cubeColor.setHex(theColor);
//   cubeMesh.setColorAt(0, cubeColor );
//   cubeMesh.instanceColor.needsUpdate = true;

// }