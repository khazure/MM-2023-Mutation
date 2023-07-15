import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';

export default class MeshSlide {

  #parent;

  #meshes;

  //Where our current shape will be at.
  #view;

  //Where other shapes will be stored at.
  #start;

  //Tween current shape to pos to exit out of view.
  //Once finish tween, relocate it back to hidden.
  #exit;

  //Distance between shapes, calculated from camera.
  #bufferDist;

  #currIndex;

  #tweening;

  constructor(parentScene, camera, distFromCam, startMeshes = [new THREE.Mesh(new THREE.BoxGeometry())]) {
    this.#meshes = [];
    this.#parent = parentScene;

    this._createPositions(camera, distFromCam);

    for(let i = 0; i < startMeshes.length; i++) {
      this.#meshes.push(startMeshes[i].clone());
      this.#parent.add(this.#meshes[i]);
      this._setPosVector(i, this.#start);
    }
    this._setPosVector(0, this.#view);
    this.#currIndex = 0;

    this.#tweening = false;
  }

  _createPositions(camera, distFromCam) {

    this.#view = new THREE.Vector3();
    this.#view.copy(camera.position);
    this.#view.add(new THREE.Vector3(0, -0.25, -1 * distFromCam));
    //console.log(this.#view);

    //Calculate distance between shapes using triangle.
    const angle = Math.tan(camera.fov / 2);
    this.#bufferDist = angle * distFromCam * 2;  //* 2 to act as buffer.
    //Note that shapes larger than fov of camera will not account for this.

    this.#start = new THREE.Vector3();
    this.#start.copy(this.#view);
    this.#start.add(new THREE.Vector3(0, this.#bufferDist, 0));

    this.#exit = new THREE.Vector3();
    this.#exit.copy(this.#view);
    this.#exit.add(new THREE.Vector3(0, -1 * this.#bufferDist, 0));
  }

  push(mesh) {
    this.#meshes.push(mesh);
    this.#parent.add(this.#meshes[this.#meshes.length - 1]);
    this._setPosVector(this.#meshes.length - 1, this.#start);
  }

  next(duration = 5000, ease = TWEEN.Easing.Elastic.InOut) {
    let next = (this.#currIndex + 1) % this.#meshes.length;
    /*//To fix misc. next() call at start:
    if(this.#tweening === undefined) {
      this.#tweening = false;
      console.log("Skipping first .next()...");
    } else
    */
    if(this.#currIndex === next) { 
      console.error("MeshSlide requires at least 2 meshes to perform .next");
    } else if (!this.#tweening) {
      this.#tweening = true; //Dependent on compiler, hopefully just 1 clock after line above.
      const enterTween = this._createTween(next, this.#start, this.#view, duration, ease);
      const exitTween = this._createTween(this.#currIndex, this.#view, this.#exit, duration, ease);
      exitTween.onComplete(() => {
        this._setPosVector(this.#currIndex, this.#start);
        this.#currIndex = next;
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
  _createTween(index, start, end, duration = 5000, ease = TWEEN.Easing.Elastic.InOut) {
    const tween = new TWEEN.Tween({ x: start.x, y: start.y, z: start.z })
      .to({ x: end.x, y: end.y, z: end.z }, duration)
      .easing(ease)
      .onUpdate((coords) => {
        this._setPosAt(index, coords.x, coords.y, coords.z);
      })
    //.repeat(Infinity) //Temp to demo this.
    //.delay(500); //Might need this as parameter.
    return tween;
  }

  /**
   * Changes geometry at the 
   * 
   * @param {Integer} index of the mesh to change geometry.
   * @param {THREE.BufferGeometry} newGeo is the new geometery to replace the old one.
   */
  setGeometryAt(index, newGeo) {
    this.#meshes[index].geometry.dispose();
    this.#meshes[index].geometry = newGeo;
  }

  setMaterialAt(index, newMat) {
    this.#meshes[index].material.dispose();
    this.#meshes[index].material = newMat;
  }

  setStart(posVec3) {
    this.#start.copy(posVec3);
  }

  setView(posVec3) {
    this.#view.copy(posVec3);
  }

  setExit(posVec3) {
    this.#exit.copy(posVec3);
  }

  addStart(posVec3) {
    this.#start.add(posVec3);
  }

  addView(posVec3) {
    this.#view.add(posVec3);
  }

  addExit(posVec3) {
    this.#exit.add(posVec3);
  }

  _setPosAt(index, x, y, z) {
    this.#meshes[index].position.set(x, y, z);
    this.#meshes[index].updateMatrix();
  }

  _setPosVector(index, posVec) {
    this.#meshes[index].position.copy(posVec);
    this.#meshes[index].updateMatrix();
  }

  getMeshAt(index) {
    return this.#meshes[index];
  }

  getCount() {
    return this.#meshes.length;
  }

}
