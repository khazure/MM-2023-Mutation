import {Mesh, Vector3, Quaternion} from 'three';
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

  //Original Starting pool of meshes, used for resetting.
  #startMeshes;

  //Boolean Signal to let MeshSlide know that its needs to reset on next cycle.
  #needReset;

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
    this.#startMeshes = startMeshes.map((x) => x.clone());
    this.#parent = parentScene;
    this.changeBuffer = [];
    this.#currIndex = 0;
    this.#tweening = false;
    this.#needReset = false;

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

  /**
   * Sets up the initial start, view, and exit positions.
   * 
   * @param {THREE.Camera} camera is the camera which is looking at the view position.
   * @param {Number} distFromCam is the distance from the camera to the view position.
   */
  #createPositions(camera, distFromCam) {

    this.#view = new Vector3();
    this.#view.copy(camera.position);
    this.#view.add(new Vector3(0, -0.25, -1 * distFromCam));

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

  /**
   * Adds a new mesh that can be slid in.
   * 
   * @param {THREE.Mesh} mesh is the new mesh to add.
   */
  push(mesh) {
    const temp = this.#rotateMeshRandomly(mesh);
    this.#meshes.push(temp);
    this.#parent.add(temp);
    this.#setPosVector(this.#meshes.length - 1, this.#start);
  }

  /**
   * Clones and rotates the given mesh randomaly along
   * the x, y, and z axes.
   * 
   * @param {THREE.Mesh} mesh is the mesh to clone from.
   * @returns the cloned and rotated mesh.
   */
  #rotateMeshRandomly(mesh) {
    let result = mesh.clone();
    const rotateQ = new Quaternion(Math.random() * 2 * Math.PI, 
                                   Math.random() * 2 * Math.PI, 
                                   Math.random() * 2 * Math.PI)
    result.setRotationFromQuaternion(rotateQ.normalize());
    result.position.copy(mesh.position);
    result.updateMatrix();
    return result;
  }

  /**
   * Sends in the next mesh and exits the current one.
   * Order of meshes is sequential unless selected to be random.
   * 
   * @param {Milliseconds} duration is the amount of time the animation will take.
   * @param {Boolean} isRandom if true will select a random mesh as next, otherwise false.
   * @param {TWEEN.Easing} ease is the easing function used for this animation.
   */
  next(duration = 5000, isRandom = false, ease) {
    //Note to self: NEVER, ever use fields or globals with time, especially inconsistent time methods.
    this.#nextIndex = (this.#currIndex + 1) % this.#meshes.length;
    if(isRandom) {
      this.#nextIndex = Math.floor(Math.random() * this.#meshes.length); 
      while(this.#nextIndex === this.#currIndex && this.#meshes.length > 2) { //This seems hacky... Too bad!
        this.#nextIndex = Math.floor(Math.random() * this.#meshes.length); //Reroll to avoid picking current.
      }
    }
    const next = this.#nextIndex;
    this.#next(next, this.#currIndex, duration, ease);
  }

  /**
   * Plays the enter animation on the mesh at the enter index, then
   * play the exit animation on the mesh at the exit index.
   * 
   * Acts similar to a clock signal, where we check if we need to perform
   * cleanup or reset upon each tween completion.
   * 
   * @param {Integer} enterIndex is the index of the mesh entering.
   * @param {Integer} exitIndex is the index of the mesh exiting.
   * @param {Milliseconds} duration is the amount of time the animation will take.
   * @param {TWEEN.Easing} ease is the easing function used for this animation.
   */
  #next(enterIndex, exitIndex, duration, ease = Easing.Elastic.InOut) {
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
      const enterTween = this.#createTween(enterIndex, this.#start, this.#view, duration, Easing.Elastic.InOut);
      const exitTween = this.#createTween(exitIndex, this.#view, this.#exit, duration, Easing.Elastic.InOut);
      exitTween.dynamic = true;
      exitTween.onComplete(() => { //Prepare for next tween.
        this.#setPosVector(this.#currIndex, this.#start); //Moves shapes out of exit back to start.
        this.#currIndex = enterIndex; //Update which shape is currently being viewed.
        this.#clearChangeBuffer();
        this.#tweening = false; //Async, needs boolean to indicate if tweening.
        if(this.#needReset) {  //Was the reset button pushed but delay until tween finished?
          //Stop any tween, if any.
          enterTween.stop();
          exitTween.stop();
          this.#reset();
          this.#needReset = false;
        }
      });

      enterTween.start();
      exitTween.start();
    }
  }

  /**
   * Tweens the selected mesh from start position to end position.
   * Tween is returned to allow more effects and must be started 
   * outside of the mesh.
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

  /**
   * Performs any change requests to material or geometry 
   * in the change buffer then clears it out.
   */
  #clearChangeBuffer() {
    const length = this.changeBuffer.length;
    for(let i = 0; i < length; i++) { 
      const current =  this.changeBuffer.shift();
      if(this.#currIndex == current.index) {
        this.changeBuffer.push(current) //Queue for next tween.
      } else if (current.newProp.isBufferGeometry) {
        this.#setGeo(current.index, current.newProp);
      } else {
        this.#setMat(current.index, current.newProp);
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
      this.#setGeo(index, newGeo);
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
  #setGeo(index, newGeo) {
    this.#meshes[index].geometry.dispose();
    this.#meshes[index].geometry = newGeo.clone;
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
      this.#setMat(index, newMat);
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
  #setMat(index, newMat) {
    this.#meshes[index].material.dispose();
    this.#meshes[index].material = newMat.clone;
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
    try {
      this.#meshes[index].position.set(x, y, z);
      this.#meshes[index].geometry.computeBoundingSphere();
      this.#meshes[index].geometry.computeBoundingBox();
      this.#meshes[index].updateMatrix();
    } catch (error) {
      //This should only occur when reseting while tweening

      //This is is very bad for continued development
      //But I don't have time to actually solve this problem... Too bad!
    }
  }

  /**
   * Sets the position of the mesh at the inputted index.
   * 
   * @param {Integer} index of the mesh changing position.
   * @param {THREE.Vector3} posVec is the new position vector to set.
   */
  #setPosVector(index, posVec) {
    try {
      this.#meshes[index].position.copy(posVec);
      this.#meshes[index].geometry.computeBoundingSphere();
      this.#meshes[index].geometry.computeBoundingBox();
      this.#meshes[index].updateMatrix();
    } catch (error) {
      //Ignore the error.
      //This should only occur when reseting while tweening

      //This is is very bad for continued development
      //But I don't have time to actually solve this problem... Too bad!
    }
  }

  /**
   * Resets the MeshSlide to their original state when initialized.
   * If tweening, we need to wait before resetting our shapes, so set
   * the reset signal.
   */
  reset() {
    if(!this.#tweening) {
      this.#reset();
    } else { //Reset after finishing tween.
      this.#needReset = true; 
    }
  }

  /**
   * Immediately resets the MeshSlide to their original state when initialized.
   */
  #reset() {
    const resetIndex = 1;
    const timeout = 1000;
    if(this.#currIndex !== resetIndex) { //Already in view.
      this.#next(resetIndex, this.#currIndex, timeout);
    } //else its already in view, don't play enter animation.
    setTimeout(() => {
      for(let i = this.#meshes.length - 1; i >= this.#startMeshes.length; i--) {
        this.#meshes[i].removeFromParent(); //Remove from scene.
        this.#meshes[i].material.dispose(); //GPU clear
        this.#meshes[i].geometry.dispose(); //GPU clear
        this.#meshes[i].clear(); //Clear any leftover children, if any.
        this.#meshes.pop();
      }
    }, timeout);
  }

  /**
   * Returns a copy of the mesh at the inputted index.
   * 
   * @param {Integer} index of the mesh to retrieve.
   * @returns clone of mesh at inputted index.
   */
  getMeshAt(index) {
    return this.#meshes[index].clone();
  }

  /**
   * Returns the amount of meshes stored in this MeshSlide object.
   * 
   * @returns the amount of meshes stored in this MeshSlide object.
   */
  getCount() {
    return this.#meshes.length;
  }

  /**
   * Returns a copy of the view position vector.
   * 
   * @returns a copy of the view position vector.
   */
  getViewPos() {
    return new Vector3().copy(this.#view);
  }
}
