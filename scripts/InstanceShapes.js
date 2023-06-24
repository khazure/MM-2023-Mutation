import * as THREE from 'three';

//80 Line Limit: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaA
export default class InstanceShapes {
  #mesh;

  constructor(parentScene, theGeometry, theMaterial, count) {
    this.#mesh = new THREE.InstancedMesh(theGeometry, theMaterial, count);
    parentScene.add(this.#mesh);

    //Probably should move this to seperate setColorAt()
    //Needed since default InstancedMesh doesn't set color.
    for (let i = 0; i < this.#mesh.count; i++) {//Must set initial color to change later.
      this.#mesh.setColorAt( i, theMaterial.color);
    }
  }

  /*
   * Randomizes the cubes' position with a 80 to -20 range.
   * 
   * TODO? add parameters to set range of random x, y, z.
   */
  randomizeCubePos() {
    const currShape = new THREE.Object3D();
    for (let i = 0; i < this.#mesh.count; i++) {
        currShape.position.x = Math.random() * 100 - 20; //80 to -20
        currShape.position.y = Math.random() * 100 - 20;
        currShape.position.z = Math.random() * 100 - 20;
        
        currShape.updateMatrix(); //Update matrix's (x,y,z)
        this.#mesh.setMatrixAt(i, currShape.matrix); //Change transformation matrix to new pos.
    }
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
    this.#mesh.computeBoundingBox();
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