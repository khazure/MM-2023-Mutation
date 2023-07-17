import {Mesh, Vector3} from 'three';
import {Tween, Easing} from '@tweenjs/tween.js';

/**
 * A Threejs effect where meshes are slid in from a hidden position to
 * a visable position, then subsequently slid out on the next cycle.
 */
export default class MeshSlide {

  //Parent scene for this effect.
  #parent;

  //The meshes being rotated in and out.
  #meshes;

  //Where our current shape will be viewed at.
  #view;

  //Where other shapes will be stored at.
  #start;

  //Tween current shape to pos to exit out of view.
  //Once finish tween, relocate it back to start.
  #exit;

  //Distance between shapes, calculated from camera.
  #bufferDist;

  //Index of the current shape being viewed
  #currIndex;

  //True if this effect is tweening, else false.
  #tweening;

  //Index of the next shape to be viewed.
  #nextIndex;

  /**
   * Threejs effect:
   * Slides in meshes from an hidden positon and slides them out to an exit position.
   * 
   * @param {THREE.Scene} parentScene is the parent scene for this effect.
   * @param {THREE.PerspectiveCamera} camera is camera for the parent scene, used positioning.
   * @param {Number} distFromCam is the distance from camera to viewing position.
   * @param {THREE.Mesh[]} startMeshes is the starting pool of meshes to slide in.
   */
  constructor(parentScene, camera, distFromCam, startMeshes = [new Mesh(new THREE.BoxGeometry())]) {
    this.#meshes = [];
    this.#parent = parentScene;
    this.changeBuffer = [];
    this.#currIndex = 0;
    this.#tweening = false;

    this.#createPositions(camera, distFromCam);
    this.#createMeshes(startMeshes);
    this.#setPosVector(0, this.#view);
  }

  /**
   * Copies the inputed meshes and uses it as our starting pool
   * of meshes to slide in.
   * 
   * @param {THREE.Mesh[]} startMeshes 
   */
  #createMeshes(startMeshes) {
    for(let i = 0; i < startMeshes.length; i++) {
      this.#meshes.push(startMeshes[i].clone());
      this.#meshes[i].geometry.computeBoundingSphere();
      this.#parent.add(this.#meshes[i]);
      this.#setPosVector(i, this.#start);
    }
  }

  #createPositions(camera, distFromCam) {

    this.#view = new Vector3();
    this.#view.copy(camera.position);
    this.#view.add(new Vector3(0, -0.25, -1 * distFromCam));
    console.log(this.#view);

    //Calculate distance between shapes using triangle.
    const angle = Math.tan(camera.fov / 2);
    this.#bufferDist = angle * distFromCam * 2;  //* 2 to act as buffer.
    //Note that shapes larger than fov of camera will not account for this.

    this.#start = new Vector3();
    this.#start.copy(this.#view);
    this.#start.add(new Vector3(0, this.#bufferDist, 0));

    this.#exit = new Vector3();
    this.#exit.copy(this.#view);
    this.#exit.add(new Vector3(0, -1 * this.#bufferDist, 0));
  }

  push(mesh) {
    const temp = mesh.clone();
    this.#meshes.push(temp);
    //console.log(this.#meshes);
    this.#parent.add(temp);
    //console.log(this.#parent);
    this.#setPosVector(this.#meshes.length - 1, this.#start);
  }

  next(duration = 5000, random = false, ease = Easing.Elastic.InOut) {
    this.#nextIndex = (this.#currIndex + 1) % this.#meshes.length;
    if(random) {
      this.#nextIndex = Math.floor(Math.random() * this.#meshes.length); 
      while(this.#nextIndex === this.#currIndex && this.#meshes.length > 2) { //This seems hacky... Too bad!
        this.#nextIndex = Math.floor(Math.random() * this.#meshes.length); //Reroll to avoid picking current.
      }
    }
    /*//To fix misc. next() call at start:
    if(this.#tweening === undefined) {
      this.#tweening = false;
      console.log("Skipping first .next()...");
    } else
    */
    if(this.#meshes.length < 2) { 
      console.error("MeshSlide requires at least 2 meshes to perform .next");
    } else if (!this.#tweening) {
      this.#tweening = true; //Dependent on compiler, hopefully just 1 clock after line above.
      const enterTween = this.#createTween(this.#nextIndex, this.#start, this.#view, duration, ease);
      const exitTween = this.#createTween(this.#currIndex, this.#view, this.#exit, duration, ease);
      exitTween.onComplete(() => {
        this.#setPosVector(this.#currIndex, this.#start);
        this.#currIndex = this.#nextIndex;
        console.log(this.#currIndex);
        this.#clearChangeBuffer();
        this.#tweening = false; //Async, needs boolean to indicate if tweening.
      });

      enterTween.start();
      exitTween.start();
    }
  }

  /**
   * Tweens the selected mesh from start position to end position.
   * Tween is returned to allow more effects and must be started 
   * outside of the mesh
   * 
   * @param {Integer} index of the mesh to tween.
   * @param {THREE.Vector3} start is the position vector to start tween at.
   * @param {THREE.Vector3} end is the position vector to end tween at.
   * @param {Number} duration is the amount of milliseconds that the tween takes.
   * @param {TWEEN.Easing} ease is the easing function to apply.
   * @returns the created tween.
   */
  #createTween(index, start, end, duration = 5000, ease = Easing.Elastic.InOut) {
    const tween = new Tween({ x: start.x, y: start.y, z: start.z })
      .to({ x: end.x, y: end.y, z: end.z }, duration)
      .easing(ease)
      .onUpdate((coords) => {
        this.#setPosAt(index, coords.x, coords.y, coords.z);
    })
    return tween;
  }

  #clearChangeBuffer() {
    const length = this.changeBuffer.length;
    for(let i = 0; i < length; i++) { 
      //console.log("Change buffer empty 1");
      const current =  this.changeBuffer.shift();
      //this.#setGeoHelper(current.index, current.geo);
      if(this.#currIndex == current.index) {
        this.changeBuffer.push(current) //Queue for next tween.
      } else if (current.newProp.isBufferGeometry) {
        this.#setGeoHelper(current.index, current.newProp);
      } else {
        this.#setMatHelper(current.index, current.newProp);
      }
    }
  }

  /**
   * Changes the geometry of the mesh at inputted index,
   * if this mesh is currently visable, wait until it is hidden.
   * 
   * @param {Integer} index of the mesh to change geometry.
   * @param {THREE.BufferGeometry} newGeo is the new geometery to replace the old one.
   */
  setGeometryAt(index, newGeo) {
    //Hidden
    if(index !== this.#currIndex && (index !== this.#nextIndex || !this.#tweening)) {
      this.#setGeoHelper(index, newGeo);
    } else { //Is visable or tweening right now, change later in tween.onComplete.
      this.changeBuffer.push({index: index, newProp: newGeo});
    }
  }

  /**
   * Helper to setGeometryAt, immediately replaces geometry.
   * 
   * @param {Integer} index of the mesh to change geometry.
   * @param {THREE.BufferGeometry} newGeo is the new geometery to replace the old one.
   */
  #setGeoHelper(index, newGeo) {
    this.#meshes[index].geometry.dispose();
    this.#meshes[index].geometry = newGeo;
  }

  /**
   * Changes the material of the mesh at inputted index,
   * if this mesh is currently visable, wait until it is hidden.
   * 
   * @param {Integer} index of the mesh to change geometry.
   * @param {THREE.Material} newMat is the new material to replace the old one.
   */
  setMaterialAt(index, newMat) {
    if(index !== this.#currIndex && (index !== this.#nextIndex || !this.#tweening)) {
      this.#setMatHelper(index, newMat);
    } else { //Is visable or tweening right now, change later in tween.onComplete.
      this.changeBuffer.push({index: index, newProp: newMat});
    }
  }

  /**
   * Helper to setMaterialAt, immediately replaces material.
   * 
   * @param {Integer} index of the mesh to change geometry.
   * @param {THREE.Material} newMat is the new material to replace the old one.
   */
  #setMatHelper(index, newMat) {
    this.#meshes[index].material.dispose();
    this.#meshes[index].material = newMat;
  }

  /**
   * Sets the position of the mesh at the inputted index.
   * 
   * @param {Integer} index of the mesh changing position.
   * @param {Number} x is the new x coordinate to set.
   * @param {Number} y is the new y coordinate to set.
   * @param {Number} z is the new z coordinate to set.
   */
  #setPosAt(index, x, y, z) {
    this.#meshes[index].position.set(x, y, z);
    this.#meshes[index].geometry.computeBoundingSphere();
    this.#meshes[index].geometry.computeBoundingBox();
    this.#meshes[index].updateMatrix();
  }

  /**
   * Sets the position of the mesh at the inputted index.
   * 
   * @param {Integer} index of the mesh changing position.
   * @param {THREE.Vector3} posVec is the new position vector to set.
   */
  #setPosVector(index, posVec) {
    this.#meshes[index].position.copy(posVec);
    this.#meshes[index].geometry.computeBoundingSphere();
    this.#meshes[index].geometry.computeBoundingBox();
    this.#meshes[index].updateMatrix();
  }

  /**
   * Gets the mesh at inputted index.
   * 
   * 
   * @param {Integer} index of the mesh to retrieve.
   * @returns 
   */
  getMeshAt(index) {
    return this.#meshes[index];
  }

  getCount() {
    return this.#meshes.length;
  }

  getViewPos() {
    return this.#view;
  }
}
