import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js'


export default class MeshShapes {
  #parent;
  #meshes;
  #total;
  #mixers;
  //#tween;

  //#tween;

  constructor(parentScene, theGeometry, theMaterial, count, layer) {
    this.#parent = parentScene;
    this.#meshes = [];
    this.#total = count;
    this.#mixers = [];
    //this.#tween = tweenObj;

    for (let i = 0; i < count; i++) {
      this.#meshes.push(new THREE.Mesh(theGeometry, theMaterial));
      parentScene.add(this.#meshes[i]);
      this.#meshes[i].layers.set(layer);

      //This doesn't seem particularly efficient... Too bad!
      this.#mixers.push(new THREE.AnimationMixer(this.#meshes[i]));
      //One animation mixer per mesh as recommended by Threejs.
    }

    this.randomizePos();
  }

  /**
   * Changes the geometry of selected shape. Currently the slowest method 
   * of changing shape manually.
   * 
   * TODO find faster method?
   * 
   * @param {Integer} index is the index of the shape we want to change
   * @param {*} newGeo is the new geometry we want to apply.
   */
  changeGeometryAt(index, newGeo) {
    const oldMaterial = this.#meshes[index].material; //Copy old material.
    const oldPos =  this.#meshes[index].position;
    console.log(oldPos);
    this.#meshes[index].geometry.dispose(); //Frees up GPU, prevents memory leak.
    this.#parent.remove(this.#meshes[index]); //Visually, this does nothing. I think it prevents leak.

    //Recreating the entire mesh doesn't seem efficient... Too bad!
    this.#meshes[index] = new THREE.Mesh(newGeo, oldMaterial);

    //I hope this doesn't cause a memory leak...
    this.#mixers[index] = new THREE.AnimationMixer(this.#meshes[index]);

    this.setPosAt(index, oldPos.x, oldPos.y, oldPos.z);
    this.#parent.add(this.#meshes[index]);
  }

  /**
   * Sets a new position for the selected shape.
   * 
   * @param {Integer} index is the index of the shape we want to change.
   * @param {Number} x is the new x coordinate.
   * @param {Number} y is the new y coordinate.
   * @param {Number} z is the new z coordinate.
   */
  setPosAt(index, x, y, z) {
    //Position is read only, must use position.set

    this.#meshes[index].position.set(x, y, z);

    //const newPos = new THREE.Vector3(x, y, z);
    //const moveAnimation = this.#doMoveAnimation(index, this.#meshes[index].position, newPos);
    //moveAnimation.play();
  }

  moveInstanceTo(x, y, z, index, duration) {
    const moveTween = new TWEEN.Tween({x: 0, y: 0, z: 0})
      .to({x: x, y: y, z: z}, duration)
      .easing(TWEEN.Easing.Elastic.InOut)
      .onUpdate((coords) => {
        this.setPosAt(index, coords.x, coords.y, coords.z);
      })
      .repeat(Infinity)
      .delay(500);
    moveTween.start();
    //return moveTween;
  }

  randomizePos() {

  }

  formSphere(radius, maxVert, minVert, layer) {
    //Tween to new pos
  }

  formSquare() {
    //Tween to new pos
  }

  #tweenToNew() {

  }

  getTotal() {
    return this.#total;
  }

  // #arrangeToRing(startIndex, endIndex, radius, centerX, centerY, centerZ) {

  //   let vertices = endIndex - startIndex;
  //   for(let i = 0; i <= vertices; i++) {
  //     let newPos = new THREE.Matrix4();
  //     let angle = 2 * Math.PI * i/vertices; //Divide circumfrence of circle
  //     newPos.setPosition(radius * Math.cos(angle) + centerX, centerY, radius * Math.sin(angle) + centerZ);
  //     //Negative radius just switches places.
  //     this.#mesh.setMatrixAt(i + startIndex, newPos);
  //   }
  //   this.#mesh.instanceMatrix.needsUpdate = true;
  //   this.#mesh.computeBoundingBox();
  // }

  /**
   * 'Animates the transition between one position to another'
   * 
   * @param {THREE.Vector3} initial is the vector containing inital position
   * @param {THREE.Vector3} final is the vector containing the final position.
   */
  // #doMoveAnimation(index, initial, final) {
  //   //KEYFRAME TRACK
  //   //new THREE.****KeyframeTrack('property to change', [Number of steps], values assigned at each step);
  //   //new THREE.VectorKeyframeTrack('.position', 3 steps, 9 position coordinates) 
  //   const positionKF = new THREE.VectorKeyframeTrack('.position', [0, 1], [0, 0,
  //                                                     0, 10, 10, 10]);
    
  //   //Create Animation Sequence with tracks
  //   const tempClip = new THREE.AnimationClip('Move', 2, [positionKF]);
  //   const moveAction = this.#mixers[index].clipAction(tempClip);
  //   //moveAction.fadeOut();
  //   moveAction.fadeOut(10);
  //   //moveAction.warp()
  //   moveAction.play();

  //   //UncacheClip at some point.
  // }

  // getAnimationMixerAt(index) {
  //   return this.#mixers[index];
  // }
}